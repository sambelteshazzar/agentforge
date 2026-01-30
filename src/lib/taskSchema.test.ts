import { describe, it, expect } from 'vitest';
import {
  createEmptyTaskSchema,
  generateTaskId,
  generateSubtaskId,
  calculateTaskProgress,
  getNextStatus,
  exampleTaskSchema,
  type UnifiedTaskSchema,
  type Subtask,
} from './taskSchema';

describe('Task Schema', () => {
  describe('createEmptyTaskSchema', () => {
    it('should create a task schema with correct IDs', () => {
      const schema = createEmptyTaskSchema('task_123', 'proj_abc');
      
      expect(schema.meta.task_id).toBe('task_123');
      expect(schema.meta.project_id).toBe('proj_abc');
    });

    it('should initialize with PLANNING status', () => {
      const schema = createEmptyTaskSchema('task_123', 'proj_abc');
      expect(schema.meta.status).toBe('PLANNING');
    });

    it('should set default repair budget to 5', () => {
      const schema = createEmptyTaskSchema('task_123', 'proj_abc');
      expect(schema.meta.max_repair_budget).toBe(5);
    });

    it('should initialize with Microservices architecture', () => {
      const schema = createEmptyTaskSchema('task_123', 'proj_abc');
      expect(schema.memory_context.architectural_style).toBe('Microservices');
    });

    it('should have default banned patterns', () => {
      const schema = createEmptyTaskSchema('task_123', 'proj_abc');
      expect(schema.security_constraints.banned_patterns).toContain('eval()');
      expect(schema.security_constraints.banned_patterns).toContain('hardcoded_secrets');
    });

    it('should set verification criteria defaults', () => {
      const schema = createEmptyTaskSchema('task_123', 'proj_abc');
      expect(schema.verification_criteria.coverage_threshold).toBe(85);
      expect(schema.verification_criteria.linting_strictness).toBe('high');
      expect(schema.verification_criteria.required_checks).toContain('lint');
      expect(schema.verification_criteria.required_checks).toContain('test');
      expect(schema.verification_criteria.required_checks).toContain('security-scan');
    });

    it('should have timestamps', () => {
      const schema = createEmptyTaskSchema('task_123', 'proj_abc');
      expect(schema.meta.created_at).toBeDefined();
      expect(schema.meta.updated_at).toBeDefined();
    });
  });

  describe('generateTaskId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateTaskId();
      const id2 = generateTaskId();
      expect(id1).not.toBe(id2);
    });

    it('should have correct prefix', () => {
      const id = generateTaskId();
      expect(id).toMatch(/^task_/);
    });
  });

  describe('generateSubtaskId', () => {
    it('should include agent prefix', () => {
      const id = generateSubtaskId('task_123', 'Python Agent');
      expect(id).toMatch(/^sub_py_/);
    });

    it('should handle different agent names', () => {
      const jsId = generateSubtaskId('task_123', 'JavaScript Agent');
      const secId = generateSubtaskId('task_123', 'SecOps Agent');
      
      expect(jsId).toMatch(/^sub_ja_/);
      expect(secId).toMatch(/^sub_se_/);
    });
  });

  describe('calculateTaskProgress', () => {
    it('should return 0 for empty subtasks', () => {
      const schema: UnifiedTaskSchema = {
        ...createEmptyTaskSchema('t', 'p'),
        subtasks: [],
      };
      expect(calculateTaskProgress(schema)).toBe(0);
    });

    it('should return 100 for all completed subtasks', () => {
      const schema: UnifiedTaskSchema = {
        ...createEmptyTaskSchema('t', 'p'),
        subtasks: [
          { id: '1', agent_role: 'Python Agent', intent: '', status: 'COMPLETED', input_files: [], expected_outputs: [], iteration_count: 1, logs: [] },
          { id: '2', agent_role: 'Python Agent', intent: '', status: 'COMPLETED', input_files: [], expected_outputs: [], iteration_count: 1, logs: [] },
        ],
      };
      expect(calculateTaskProgress(schema)).toBe(100);
    });

    it('should calculate partial progress for in-progress tasks', () => {
      const schema: UnifiedTaskSchema = {
        ...createEmptyTaskSchema('t', 'p'),
        subtasks: [
          { id: '1', agent_role: 'Python Agent', intent: '', status: 'COMPLETED', input_files: [], expected_outputs: [], iteration_count: 1, logs: [] },
          { id: '2', agent_role: 'Python Agent', intent: '', status: 'IN_PROGRESS', input_files: [], expected_outputs: [], iteration_count: 1, logs: [] },
        ],
      };
      // (1 completed + 0.5 in-progress) / 2 = 0.75 = 75%
      expect(calculateTaskProgress(schema)).toBe(75);
    });

    it('should count pending as 0', () => {
      const schema: UnifiedTaskSchema = {
        ...createEmptyTaskSchema('t', 'p'),
        subtasks: [
          { id: '1', agent_role: 'Python Agent', intent: '', status: 'COMPLETED', input_files: [], expected_outputs: [], iteration_count: 1, logs: [] },
          { id: '2', agent_role: 'Python Agent', intent: '', status: 'PENDING', input_files: [], expected_outputs: [], iteration_count: 1, logs: [] },
        ],
      };
      expect(calculateTaskProgress(schema)).toBe(50);
    });
  });

  describe('getNextStatus', () => {
    it('should transition PLANNING to CONTRACT_NEGOTIATION on success', () => {
      expect(getNextStatus('PLANNING', true)).toBe('CONTRACT_NEGOTIATION');
    });

    it('should keep PLANNING on failure', () => {
      expect(getNextStatus('PLANNING', false)).toBe('PLANNING');
    });

    it('should transition IMPLEMENTING to VERIFYING on success', () => {
      expect(getNextStatus('IMPLEMENTING', true)).toBe('VERIFYING');
    });

    it('should transition IMPLEMENTING to REPAIRING on failure', () => {
      expect(getNextStatus('IMPLEMENTING', false)).toBe('REPAIRING');
    });

    it('should transition VERIFYING to COMPLETED on success', () => {
      expect(getNextStatus('VERIFYING', true)).toBe('COMPLETED');
    });

    it('should transition VERIFYING to REPAIRING on failure', () => {
      expect(getNextStatus('VERIFYING', false)).toBe('REPAIRING');
    });

    it('should transition REPAIRING to VERIFYING on success', () => {
      expect(getNextStatus('REPAIRING', true)).toBe('VERIFYING');
    });

    it('should transition REPAIRING to FAILED on failure', () => {
      expect(getNextStatus('REPAIRING', false)).toBe('FAILED');
    });

    it('should keep COMPLETED on both success and failure', () => {
      expect(getNextStatus('COMPLETED', true)).toBe('COMPLETED');
      expect(getNextStatus('COMPLETED', false)).toBe('COMPLETED');
    });
  });

  describe('exampleTaskSchema', () => {
    it('should have valid structure', () => {
      expect(exampleTaskSchema.meta.task_id).toBeDefined();
      expect(exampleTaskSchema.meta.project_id).toBeDefined();
      expect(exampleTaskSchema.memory_context).toBeDefined();
      expect(exampleTaskSchema.shared_contract).toBeDefined();
      expect(exampleTaskSchema.security_constraints).toBeDefined();
      expect(exampleTaskSchema.subtasks).toBeDefined();
      expect(exampleTaskSchema.verification_criteria).toBeDefined();
    });

    it('should have multiple subtasks', () => {
      expect(exampleTaskSchema.subtasks.length).toBeGreaterThan(0);
    });

    it('should have locked contract status', () => {
      expect(exampleTaskSchema.shared_contract.status).toBe('LOCKED');
    });

    it('should have data models defined', () => {
      expect(exampleTaskSchema.shared_contract.data_models.length).toBeGreaterThan(0);
    });

    it('should have endpoints defined', () => {
      expect(exampleTaskSchema.shared_contract.endpoints?.length).toBeGreaterThan(0);
    });
  });
});
