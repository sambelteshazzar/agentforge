import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, ExternalLink, Copy, Check, FileCode, 
  FolderOpen, Terminal, Package, Zap, Code2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EditorExportProps {
  code: string;
  language: string;
  filename?: string;
}

interface EditorConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  command: string;
  protocol?: string;
  instructions: string[];
}

const SUPPORTED_EDITORS: EditorConfig[] = [
  {
    id: "vscode",
    name: "VS Code",
    icon: "💙",
    description: "Visual Studio Code",
    command: "code",
    protocol: "vscode://",
    instructions: [
      "Open VS Code",
      "Use Ctrl/Cmd + N to create new file",
      "Paste the code",
      "Save with Ctrl/Cmd + S"
    ]
  },
  {
    id: "windsurf",
    name: "Windsurf",
    icon: "🏄",
    description: "AI-powered code editor",
    command: "windsurf",
    instructions: [
      "Open Windsurf editor",
      "Create a new file in your project",
      "Paste the code",
      "Let AI assist with any improvements"
    ]
  },
  {
    id: "cursor",
    name: "Cursor",
    icon: "⚡",
    description: "AI-first code editor",
    command: "cursor",
    protocol: "cursor://",
    instructions: [
      "Open Cursor editor",
      "Create a new file (Ctrl/Cmd + N)",
      "Paste the code",
      "Use AI to refine or extend"
    ]
  },
  {
    id: "zed",
    name: "Zed",
    icon: "🚀",
    description: "High-performance editor",
    command: "zed",
    instructions: [
      "Open Zed editor",
      "Create new file in project",
      "Paste code content",
      "Save and format"
    ]
  },
  {
    id: "sublime",
    name: "Sublime Text",
    icon: "🟠",
    description: "Fast and lightweight",
    command: "subl",
    instructions: [
      "Open Sublime Text",
      "File → New File",
      "Paste the code",
      "Ctrl/Cmd + S to save"
    ]
  },
  {
    id: "vim",
    name: "Vim/Neovim",
    icon: "🌲",
    description: "Terminal-based editor",
    command: "nvim",
    instructions: [
      "Open terminal",
      "Run: nvim filename.ext",
      "Press 'i' for insert mode",
      "Paste, then :wq to save"
    ]
  },
  {
    id: "webstorm",
    name: "WebStorm",
    icon: "🌊",
    description: "JetBrains IDE for JS",
    command: "webstorm",
    instructions: [
      "Open WebStorm",
      "Create new file in project",
      "Paste the code",
      "IDE will auto-format"
    ]
  },
  {
    id: "atom",
    name: "Pulsar (Atom)",
    icon: "💚",
    description: "Community-driven editor",
    command: "pulsar",
    instructions: [
      "Open Pulsar editor",
      "Ctrl/Cmd + N for new file",
      "Paste code",
      "Save to your project"
    ]
  }
];

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  jsx: "jsx",
  tsx: "tsx",
  python: "py",
  rust: "rs",
  go: "go",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "cs",
  ruby: "rb",
  swift: "swift",
  kotlin: "kt",
  php: "php",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  yaml: "yaml",
  markdown: "md",
  sql: "sql",
  bash: "sh",
  shell: "sh",
};

export const EditorExport = ({ code, language, filename }: EditorExportProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const extension = LANGUAGE_EXTENSIONS[language.toLowerCase()] || "txt";
  const defaultFilename = filename || `code.${extension}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Code copied!",
      description: "Ready to paste in your editor",
    });
  };

  const downloadFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "File downloaded!",
      description: `Saved as ${defaultFilename}`,
    });
  };

  const generateProjectStructure = () => {
    const structure = {
      name: "exported-project",
      files: [
        {
          path: `src/${defaultFilename}`,
          content: code
        },
        {
          path: "package.json",
          content: JSON.stringify({
            name: "exported-project",
            version: "1.0.0",
            type: "module",
            scripts: {
              dev: "vite",
              build: "vite build"
            }
          }, null, 2)
        },
        {
          path: "README.md",
          content: `# Exported Project\n\nThis project was exported from the Agent Workspace.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Files\n\n- \`src/${defaultFilename}\` - Main code file\n`
        }
      ]
    };
    return structure;
  };

  const downloadAsProject = () => {
    const project = generateProjectStructure();
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Project exported!",
      description: "Import this JSON in your preferred tool",
    });
  };

  const getTerminalCommand = (editor: EditorConfig) => {
    return `echo '${code.replace(/'/g, "'\\''")}' > ${defaultFilename} && ${editor.command} ${defaultFilename}`;
  };

  const copyTerminalCommand = async (editor: EditorConfig) => {
    const command = getTerminalCommand(editor);
    await navigator.clipboard.writeText(command);
    toast({
      title: "Command copied!",
      description: `Run in terminal to open in ${editor.name}`,
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Export to Editor
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={copyToClipboard}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy to Clipboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadFile}>
            <Download className="w-4 h-4 mr-2" />
            Download File
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadAsProject}>
            <Package className="w-4 h-4 mr-2" />
            Export as Project
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Code2 className="w-4 h-4 mr-2" />
              Open in Editor...
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export to Code Editor</DialogTitle>
          <DialogDescription>
            Choose your preferred editor to continue working on this code
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="editors" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editors">Editors</TabsTrigger>
            <TabsTrigger value="terminal">Terminal</TabsTrigger>
            <TabsTrigger value="cloud">Cloud IDEs</TabsTrigger>
          </TabsList>

          <TabsContent value="editors" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {SUPPORTED_EDITORS.map((editor) => (
                <button
                  key={editor.id}
                  onClick={() => setSelectedEditor(selectedEditor === editor.id ? null : editor.id)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all hover:border-primary/50",
                    selectedEditor === editor.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{editor.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm">{editor.name}</h4>
                      <p className="text-xs text-muted-foreground">{editor.description}</p>
                    </div>
                  </div>
                  {selectedEditor === editor.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground">Steps:</h5>
                      <ol className="text-xs space-y-1 text-muted-foreground">
                        {editor.instructions.map((step, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary font-medium">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={copyToClipboard} className="flex-1">
                          <Copy className="w-3 h-3 mr-1.5" />
                          Copy Code
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyTerminalCommand(editor)}>
                          <Terminal className="w-3 h-3 mr-1.5" />
                          Terminal
                        </Button>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="terminal" className="mt-4">
            <div className="space-y-4">
              <div className="rounded-lg bg-[#1a1b26] p-4">
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <Terminal className="w-4 h-4" />
                  <span>Quick Terminal Commands</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-[#24283b]">
                    <code className="text-xs text-[#7aa2f7]">
                      pbpaste {">"} {defaultFilename}
                    </code>
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    First copy the code, then paste this command in terminal to create the file.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Create Project Structure
                </h4>
                <div className="space-y-2 text-xs font-mono text-muted-foreground bg-muted/50 p-3 rounded">
                  <div>📁 my-project/</div>
                  <div className="pl-4">├── 📄 {defaultFilename}</div>
                  <div className="pl-4">├── 📄 package.json</div>
                  <div className="pl-4">└── 📄 README.md</div>
                </div>
                <Button size="sm" className="mt-3 w-full" onClick={downloadAsProject}>
                  <Package className="w-3 h-3 mr-1.5" />
                  Download Project Structure
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "StackBlitz", icon: "⚡", url: "https://stackblitz.com", desc: "Instant dev environments" },
                { name: "CodeSandbox", icon: "📦", url: "https://codesandbox.io", desc: "Collaborative sandboxes" },
                { name: "Replit", icon: "🔄", url: "https://replit.com", desc: "Browser-based IDE" },
                { name: "GitHub Codespaces", icon: "🐙", url: "https://github.com/codespaces", desc: "Cloud dev environments" },
                { name: "Gitpod", icon: "🟠", url: "https://gitpod.io", desc: "Ready-to-code workspaces" },
                { name: "CodePen", icon: "✏️", url: "https://codepen.io", desc: "Frontend playground" },
              ].map((cloud) => (
                <a
                  key={cloud.name}
                  href={cloud.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cloud.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-1">
                        {cloud.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-muted-foreground">{cloud.desc}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <Zap className="w-4 h-4 inline mr-1.5 text-primary" />
              <strong>Pro tip:</strong> Copy the code first, then paste it into any of these cloud IDEs to start developing instantly.
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <FileCode className="w-4 h-4 inline mr-1" />
            {defaultFilename} • {code.split('\n').length} lines
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
              Copy Code
            </Button>
            <Button onClick={downloadFile}>
              <Download className="w-4 h-4 mr-1.5" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
