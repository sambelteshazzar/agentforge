import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileJson, Lock, Unlock, Shield, Brain, Code2, CheckCircle2, 
  AlertTriangle, Clock, ChevronDown, ChevronRight, Plus, Trash2,
  Play, Pause, RefreshCw, Eye, Edit2, Save, X, AlertCircle,
  Database, FileCode, Settings, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  UnifiedTaskSchema, 
  TaskStatus, 
  ContractStatus,
  Subtask,
  SubtaskStatus,
  DataModel,
  calculateTaskProgress,
  exampleTaskSchema 
} from "@/lib/taskSchema";

interface TaskSchemaEditorProps {
  schema?: UnifiedTaskSchema;
  onSave?: (schema: UnifiedTaskSchema) => void;
  readOnly?: boolean;
}

const statusColors: Record<TaskStatus, string> = {
  PLANNING: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  CONTRACT_NEGOTIATION: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  IMPLEMENTING: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  VERIFYING: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  REPAIRING: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  COMPLETED: "bg-success/10 text-success border-success/30",
  FAILED: "bg-destructive/10 text-destructive border-destructive/30",
};

const subtaskStatusColors: Record<SubtaskStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-primary/10 text-primary",
  COMPLETED: "bg-success/10 text-success",
  FAILED: "bg-destructive/10 text-destructive",
  BLOCKED: "bg-amber-500/10 text-amber-500",
};

const contractStatusIcons: Record<ContractStatus, React.ReactNode> = {
  DRAFT: <Edit2 className="w-4 h-4" />,
  NEGOTIATING: <RefreshCw className="w-4 h-4 animate-spin" />,
  LOCKED: <Lock className="w-4 h-4" />,
  VIOLATED: <AlertTriangle className="w-4 h-4" />,
};

export const TaskSchemaEditor = ({ 
  schema = exampleTaskSchema, 
  onSave,
  readOnly = false 
}: TaskSchemaEditorProps) => {
  const [taskSchema, setTaskSchema] = useState<UnifiedTaskSchema>(schema);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  
  const progress = calculateTaskProgress(taskSchema);

  const toggleSubtask = (id: string) => {
    setExpandedSubtasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusIcon = (status: SubtaskStatus) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="w-4 h-4" />;
      case "IN_PROGRESS": return <Play className="w-4 h-4" />;
      case "FAILED": return <AlertCircle className="w-4 h-4" />;
      case "BLOCKED": return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            Task Schema
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {taskSchema.meta.task_id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("border", statusColors[taskSchema.meta.status])}>
            {taskSchema.meta.status.replace("_", " ")}
          </Badge>
          {!readOnly && (
            <Button 
              variant={isEditing ? "default" : "outline"} 
              size="sm"
              onClick={() => {
                if (isEditing && onSave) {
                  onSave(taskSchema);
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Iteration {taskSchema.meta.iteration} / {taskSchema.meta.max_repair_budget}</span>
          {taskSchema.meta.estimated_cost && (
            <span>Est. Cost: ${taskSchema.meta.estimated_cost.toFixed(2)}</span>
          )}
        </div>
      </div>

      <Tabs defaultValue="contract" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="memory" className="text-xs">
            <Brain className="w-3 h-3 mr-1" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="contract" className="text-xs">
            <FileJson className="w-3 h-3 mr-1" />
            Contract
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Security
          </TabsTrigger>
          <TabsTrigger value="subtasks" className="text-xs">
            <Code2 className="w-3 h-3 mr-1" />
            Subtasks
          </TabsTrigger>
          <TabsTrigger value="verification" className="text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verify
          </TabsTrigger>
        </TabsList>

        {/* Memory Context Tab */}
        <TabsContent value="memory" className="space-y-4">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-memory" />
              <h3 className="font-semibold">Memory Context (RAG Layer)</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Architecture Style</label>
                {isEditing ? (
                  <Select 
                    value={taskSchema.memory_context.architectural_style}
                    onValueChange={(value: any) => setTaskSchema(prev => ({
                      ...prev,
                      memory_context: { ...prev.memory_context, architectural_style: value }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Microservices">Microservices</SelectItem>
                      <SelectItem value="Monolithic">Monolithic</SelectItem>
                      <SelectItem value="Serverless">Serverless</SelectItem>
                      <SelectItem value="Event-Driven">Event-Driven</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="mt-1">
                    {taskSchema.memory_context.architectural_style}
                  </Badge>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Coding Standards</label>
                <div className="mt-2 space-y-2">
                  {taskSchema.memory_context.coding_standards.map((standard, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2 text-sm">
                      <Zap className="w-3 h-3 text-primary shrink-0" />
                      {isEditing ? (
                        <Input 
                          value={standard}
                          onChange={(e) => {
                            const newStandards = [...taskSchema.memory_context.coding_standards];
                            newStandards[idx] = e.target.value;
                            setTaskSchema(prev => ({
                              ...prev,
                              memory_context: { ...prev.memory_context, coding_standards: newStandards }
                            }));
                          }}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <span>{standard}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Previous Decisions</label>
                <div className="mt-2 space-y-2">
                  {taskSchema.memory_context.previous_decisions.map((decision, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2 text-sm">
                      <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                      <span>{decision}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Contract Tab */}
        <TabsContent value="contract" className="space-y-4">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-contractNegotiator" />
                <h3 className="font-semibold">Shared Contract</h3>
              </div>
              <Badge 
                className={cn(
                  "border flex items-center gap-1",
                  taskSchema.shared_contract.status === "LOCKED" 
                    ? "bg-success/10 text-success border-success/30"
                    : taskSchema.shared_contract.status === "VIOLATED"
                    ? "bg-destructive/10 text-destructive border-destructive/30"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                )}
              >
                {contractStatusIcons[taskSchema.shared_contract.status]}
                {taskSchema.shared_contract.status}
              </Badge>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Format</label>
                  <Badge variant="outline" className="mt-1 block w-fit">
                    {taskSchema.shared_contract.format}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Version</label>
                  <Badge variant="secondary" className="mt-1 block w-fit">
                    v{taskSchema.shared_contract.version}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Spec URL</label>
                <code className="block mt-1 text-xs bg-secondary/50 p-2 rounded-lg font-mono">
                  {taskSchema.shared_contract.spec_url}
                </code>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Data Models</label>
                <div className="grid gap-2">
                  {taskSchema.shared_contract.data_models.map((model, idx) => (
                    <div key={idx} className="bg-secondary/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{model.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {model.fields.map((field, fidx) => (
                          <Badge key={fidx} variant="outline" className="text-xs font-mono">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {taskSchema.shared_contract.endpoints && taskSchema.shared_contract.endpoints.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">API Endpoints</label>
                  <div className="grid gap-2">
                    {taskSchema.shared_contract.endpoints.map((endpoint, idx) => (
                      <div key={idx} className="bg-secondary/30 rounded-lg p-3 flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-mono text-xs",
                            endpoint.method === "GET" && "border-blue-500/50 text-blue-500",
                            endpoint.method === "POST" && "border-green-500/50 text-green-500",
                            endpoint.method === "PUT" && "border-amber-500/50 text-amber-500",
                            endpoint.method === "DELETE" && "border-red-500/50 text-red-500",
                          )}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                        <span className="text-xs text-muted-foreground ml-auto">{endpoint.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-secops" />
              <h3 className="font-semibold">Security Constraints</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    taskSchema.security_constraints.scanning_required ? "bg-success" : "bg-muted-foreground"
                  )} />
                  <span className="text-sm">Security Scanning</span>
                </div>
                <Badge variant="outline">
                  Threshold: {taskSchema.security_constraints.vulnerability_threshold}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Allowed Dependencies</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {taskSchema.security_constraints.allowed_dependencies.map((dep, idx) => (
                    <Badge key={idx} variant="secondary" className="font-mono text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Banned Patterns</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {taskSchema.security_constraints.banned_patterns.map((pattern, idx) => (
                    <Badge key={idx} variant="destructive" className="font-mono text-xs">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>

              {taskSchema.security_constraints.compliance_requirements && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Compliance Requirements</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {taskSchema.security_constraints.compliance_requirements.map((req, idx) => (
                      <Badge key={idx} className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Subtasks Tab */}
        <TabsContent value="subtasks" className="space-y-4">
          <div className="space-y-3">
            {taskSchema.subtasks.map((subtask, idx) => (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleSubtask(subtask.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSubtasks.has(subtask.id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        subtaskStatusColors[subtask.status]
                      )}>
                        {getStatusIcon(subtask.status)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{subtask.agent_role}</div>
                        <div className="text-xs text-muted-foreground">{subtask.id}</div>
                      </div>
                    </div>
                    <Badge className={subtaskStatusColors[subtask.status]}>
                      {subtask.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSubtasks.has(subtask.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Intent</label>
                          <p className="text-sm mt-1">{subtask.intent}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Input Files</label>
                            <div className="mt-1 space-y-1">
                              {subtask.input_files.map((file, fidx) => (
                                <code key={fidx} className="block text-xs bg-secondary/50 p-1 rounded">
                                  {file}
                                </code>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Expected Outputs</label>
                            <div className="mt-1 space-y-1">
                              {subtask.expected_outputs.map((file, fidx) => (
                                <code key={fidx} className="block text-xs bg-secondary/50 p-1 rounded">
                                  {file}
                                </code>
                              ))}
                            </div>
                          </div>
                        </div>

                        {subtask.logs.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Logs</label>
                            <ScrollArea className="h-24 mt-1">
                              <div className="space-y-1 text-xs font-mono">
                                {subtask.logs.map((log, lidx) => (
                                  <div 
                                    key={lidx} 
                                    className={cn(
                                      "p-1 rounded",
                                      log.level === "ERROR" && "bg-destructive/10 text-destructive",
                                      log.level === "WARN" && "bg-amber-500/10 text-amber-500",
                                      log.level === "INFO" && "text-muted-foreground",
                                    )}
                                  >
                                    [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-verifier" />
              <h3 className="font-semibold">Verification Criteria</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contract Tests</label>
                <p className="text-sm mt-1">{taskSchema.verification_criteria.contract_tests}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Coverage Threshold</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={taskSchema.verification_criteria.coverage_threshold} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{taskSchema.verification_criteria.coverage_threshold}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Linting Strictness</label>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {taskSchema.verification_criteria.linting_strictness}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Required Checks</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {taskSchema.verification_criteria.required_checks.map((check, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {check}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {taskSchema.verification_results && taskSchema.verification_results.length > 0 && (
            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-medium mb-3">Verification Results</h4>
              <div className="space-y-2">
                {taskSchema.verification_results.map((result, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border",
                      result.passed 
                        ? "bg-success/10 border-success/30" 
                        : "bg-destructive/10 border-destructive/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium">{result.message}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {result.severity}
                      </Badge>
                    </div>
                    {result.suggested_fix && (
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        Fix: {result.suggested_fix}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskSchemaEditor;
