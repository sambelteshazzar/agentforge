import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Copy, Check, FileText, FileCode, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExportActionsProps {
  messages: Message[];
  agentName: string;
}

export const ExportActions = ({ messages, agentName }: ExportActionsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const extractAllCodeBlocks = () => {
    const codeBlocks: { language: string; content: string; index: number }[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    messages.forEach((message, msgIndex) => {
      if (message.role === "assistant") {
        let match;
        while ((match = codeBlockRegex.exec(message.content)) !== null) {
          codeBlocks.push({
            language: match[1] || "txt",
            content: match[2].trim(),
            index: codeBlocks.length + 1,
          });
        }
      }
    });

    return codeBlocks;
  };

  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      typescriptreact: "tsx",
      javascriptreact: "jsx",
      python: "py",
      html: "html",
      css: "css",
      json: "json",
      markdown: "md",
      sql: "sql",
      bash: "sh",
      shell: "sh",
      yaml: "yaml",
      yml: "yml",
      plaintext: "txt",
      txt: "txt",
    };
    return extensions[language.toLowerCase()] || language.toLowerCase() || "txt";
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllCode = () => {
    const codeBlocks = extractAllCodeBlocks();
    if (codeBlocks.length === 0) {
      toast({
        title: "No code found",
        description: "There are no code blocks in this conversation to export.",
      });
      return;
    }

    codeBlocks.forEach((block) => {
      const extension = getFileExtension(block.language);
      const filename = `code-${block.index}.${extension}`;
      downloadFile(block.content, filename);
    });

    toast({
      title: "Code exported",
      description: `Downloaded ${codeBlocks.length} code file${codeBlocks.length > 1 ? "s" : ""}.`,
    });
  };

  const downloadSingleCodeBlock = (content: string, language: string, index: number) => {
    const extension = getFileExtension(language);
    const filename = `code-${index}.${extension}`;
    downloadFile(content, filename);
    
    toast({
      title: "Code downloaded",
      description: `Saved as ${filename}`,
    });
  };

  const formatConversationAsText = (): string => {
    const header = `Conversation with ${agentName}\nExported: ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n`;
    
    const content = messages
      .map((msg) => {
        const role = msg.role === "user" ? "You" : agentName;
        return `[${role}]\n${msg.content}\n`;
      })
      .join("\n" + "-".repeat(40) + "\n\n");

    return header + content;
  };

  const formatConversationAsMarkdown = (): string => {
    const header = `# Conversation with ${agentName}\n\n*Exported: ${new Date().toLocaleString()}*\n\n---\n\n`;
    
    const content = messages
      .map((msg) => {
        const role = msg.role === "user" ? "**You**" : `**${agentName}**`;
        return `### ${role}\n\n${msg.content}\n`;
      })
      .join("\n---\n\n");

    return header + content;
  };

  const copyTranscript = async () => {
    if (messages.length === 0) {
      toast({
        title: "No messages",
        description: "There are no messages to copy.",
      });
      return;
    }

    const transcript = formatConversationAsText();
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Transcript copied",
      description: "Conversation has been copied to clipboard.",
    });
  };

  const downloadTranscript = (format: "txt" | "md") => {
    if (messages.length === 0) {
      toast({
        title: "No messages",
        description: "There are no messages to export.",
      });
      return;
    }

    const content = format === "md" ? formatConversationAsMarkdown() : formatConversationAsText();
    const filename = `conversation-${agentName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${format}`;
    downloadFile(content, filename);
    
    toast({
      title: "Transcript downloaded",
      description: `Saved as ${filename}`,
    });
  };

  const codeBlocks = extractAllCodeBlocks();
  const hasMessages = messages.length > 0;
  const hasCode = codeBlocks.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasMessages}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyTranscript}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          Copy Transcript
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadTranscript("txt")}>
          <FileText className="w-4 h-4 mr-2" />
          Download as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadTranscript("md")}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Download as Markdown
        </DropdownMenuItem>
        
        {hasCode && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={downloadAllCode}>
              <FileCode className="w-4 h-4 mr-2" />
              Download All Code ({codeBlocks.length} file{codeBlocks.length > 1 ? "s" : ""})
            </DropdownMenuItem>
            {codeBlocks.slice(0, 5).map((block, idx) => (
              <DropdownMenuItem
                key={idx}
                onClick={() => downloadSingleCodeBlock(block.content, block.language, block.index)}
                className="pl-8 text-xs"
              >
                code-{block.index}.{getFileExtension(block.language)}
              </DropdownMenuItem>
            ))}
            {codeBlocks.length > 5 && (
              <DropdownMenuItem disabled className="pl-8 text-xs text-muted-foreground">
                +{codeBlocks.length - 5} more files
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
