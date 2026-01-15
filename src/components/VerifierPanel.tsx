import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { 
  VerifierHeader, 
  VerifierProgress, 
  VerifierVerdict, 
  VerifierTabs, 
  VerifierLogs,
  type VerificationPhase 
} from "@/components/verifier";
import {
  type VerificationReport,
  type FailureCategory,
  createEmptyVerificationReport,
  determineTargetAgent,
  shouldRetry,
  VERIFICATION_TIMEOUTS,
} from "@/lib/verification";
import {
  mockDependencies,
  mockLintViolations,
  mockSecurityFindings,
  mockTestResults,
  mockContractViolations,
  createMockTestSuite,
} from "@/lib/verification/fixtures";
import { UnifiedTaskSchema } from "@/lib/taskSchema";

interface VerifierPanelProps {
  taskSchema: UnifiedTaskSchema;
  onVerificationComplete?: (report: VerificationReport) => void;
  onRepairRequest?: (targetAgent: string, suggestion: string) => void;
}

export const VerifierPanel = ({ 
  taskSchema, 
  onVerificationComplete, 
  onRepairRequest 
}: VerifierPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<VerificationPhase>('idle');
  const [report, setReport] = useState<VerificationReport>(
    createEmptyVerificationReport(taskSchema.meta.task_id)
  );

  const simulatePhase = (ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms));

  const runVerification = async () => {
    setIsRunning(true);
    const newReport = createEmptyVerificationReport(taskSchema.meta.task_id);
    newReport.status = 'RUNNING';
    newReport.sandboxId = `sandbox_${Date.now().toString(36)}`;
    setReport(newReport);

    // Phase 1: Dependency Vetting
    setCurrentPhase('dependencies');
    await simulatePhase(VERIFICATION_TIMEOUTS.DEPENDENCY_VETTING_MS);
    const bannedCount = mockDependencies.filter(d => d.status === 'BANNED').length;
    const unpinnedCount = mockDependencies.filter(d => d.status === 'UNPINNED').length;
    newReport.dependencyVetting = {
      status: 'COMPLETED',
      passed: bannedCount === 0,
      data: {
        dependencies: mockDependencies,
        bannedFound: bannedCount,
        unpinnedFound: unpinnedCount,
      },
    };
    setReport({ ...newReport });

    // Phase 2: Static Analysis
    setCurrentPhase('linting');
    await simulatePhase(VERIFICATION_TIMEOUTS.STATIC_ANALYSIS_MS);
    const criticalSecurityCount = mockSecurityFindings.filter(
      s => s.severity === 'high' || s.severity === 'critical'
    ).length;
    newReport.staticAnalysis = {
      status: 'COMPLETED',
      passed: criticalSecurityCount === 0,
      data: {
        lintingResults: mockLintViolations,
        securityScans: mockSecurityFindings,
        totalIssues: mockLintViolations.length + mockSecurityFindings.length,
        criticalIssues: criticalSecurityCount,
      },
    };
    setReport({ ...newReport });

    // Phase 3: Test Execution
    setCurrentPhase('tests');
    await simulatePhase(VERIFICATION_TIMEOUTS.TEST_EXECUTION_MS);
    const testSuite = createMockTestSuite(mockTestResults);
    newReport.testExecution = {
      status: 'COMPLETED',
      passed: testSuite.failed === 0,
      data: {
        suites: [testSuite],
        overallCoverage: testSuite.coveragePercentage,
      },
    };
    setReport({ ...newReport });

    // Phase 4: Contract Validation
    setCurrentPhase('contract');
    await simulatePhase(VERIFICATION_TIMEOUTS.CONTRACT_VALIDATION_MS);
    newReport.contractValidation = {
      status: 'COMPLETED',
      passed: mockContractViolations.length === 0,
      data: {
        result: {
          validator: 'Schemathesis',
          specUrl: taskSchema.shared_contract.spec_url,
          totalEndpoints: 3,
          validated: 3,
          violations: mockContractViolations,
          passed: mockContractViolations.length === 0,
        },
      },
    };
    setReport({ ...newReport });

    // Finalize
    setCurrentPhase('finalizing');
    await simulatePhase(VERIFICATION_TIMEOUTS.FINALIZATION_MS);
    
    const allPassed = 
      newReport.dependencyVetting.passed &&
      newReport.staticAnalysis.passed &&
      newReport.testExecution.passed &&
      newReport.contractValidation.passed;

    let failureCategory: FailureCategory = 'NONE';
    let feedbackMessage = '';
    let repairSuggestion = '';

    if (!allPassed) {
      if (!newReport.staticAnalysis.passed && newReport.staticAnalysis.data.criticalIssues > 0) {
        failureCategory = 'SECURITY';
        feedbackMessage = `Security scan found ${newReport.staticAnalysis.data.criticalIssues} critical issues including banned pattern usage.`;
        repairSuggestion = 'Remove eval() and replace with safe alternatives. Update dependencies with known CVEs.';
      } else if (!newReport.contractValidation.passed) {
        failureCategory = 'CONTRACT';
        feedbackMessage = `Contract validation failed: ${mockContractViolations.length} violations found.`;
        repairSuggestion = 'Fix schema mismatch: expires_in should be number, not string.';
      } else if (!newReport.testExecution.passed) {
        failureCategory = 'LOGIC';
        feedbackMessage = `Test execution failed: ${newReport.testExecution.data.suites[0].failed} tests failed.`;
        repairSuggestion = 'Fix test_login_wrong_password: handler returns 500 instead of 401 for invalid credentials.';
      } else {
        failureCategory = 'SYNTAX';
        feedbackMessage = `Static analysis found ${newReport.staticAnalysis.data.totalIssues} issues.`;
        repairSuggestion = 'Run auto-fix for linting issues.';
      }
    }

    const targetAgent = determineTargetAgent(failureCategory, 'HIGH');
    const retryRecommended = shouldRetry(
      taskSchema.meta.iteration,
      taskSchema.meta.max_repair_budget,
      failureCategory
    );

    newReport.output = {
      verdict: allPassed ? 'PASS' : 'FAIL',
      failureCategory,
      logs: {
        stdout: 'Verification complete. See detailed report.',
        stderr: allPassed ? '' : 'Failures detected. Review required.',
        exitCode: allPassed ? 0 : 1,
        executionTimeMs: 5000,
      },
      feedbackToAgent: feedbackMessage,
      repairSuggestion,
      retryRecommended,
      targetAgent: allPassed ? undefined : targetAgent,
      iterationCount: taskSchema.meta.iteration,
      budgetRemaining: taskSchema.meta.max_repair_budget - taskSchema.meta.iteration,
    };

    newReport.status = 'COMPLETED';
    newReport.completedAt = new Date().toISOString();
    setReport(newReport);
    setCurrentPhase('complete');
    setIsRunning(false);

    onVerificationComplete?.(newReport);
  };

  const handleReset = () => {
    setReport(createEmptyVerificationReport(taskSchema.meta.task_id));
    setCurrentPhase('idle');
  };

  return (
    <div className="space-y-6">
      <VerifierHeader 
        isRunning={isRunning}
        onRunVerification={runVerification}
        onReset={handleReset}
      />

      <AnimatePresence>
        <VerifierProgress currentPhase={currentPhase} />
      </AnimatePresence>

      <VerifierVerdict 
        report={report}
        maxBudget={taskSchema.meta.max_repair_budget}
        onRepairRequest={onRepairRequest}
      />

      <VerifierTabs report={report} />

      <VerifierLogs report={report} />
    </div>
  );
};
