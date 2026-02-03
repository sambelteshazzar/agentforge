import { Code2 } from "lucide-react";
import { getLanguageInfo } from "@/lib/preview";

interface BackendCodePanelProps {
  language: string;
}

/**
 * Display panel for backend/non-web languages with run instructions.
 */
export const BackendCodePanel = ({ language }: BackendCodePanelProps) => {
  const langInfo = getLanguageInfo(language);

  return (
    <div className="bg-gradient-to-br from-secondary to-secondary/50 rounded-xl p-6 border border-border">
      <div className="text-center space-y-4">
        <div className="text-4xl">{langInfo.icon}</div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">
            {langInfo.name} Code Generated
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            This is {langInfo.name} code that runs on your local machine, not in
            the browser.
          </p>
        </div>
        <div className="bg-background/80 rounded-lg p-4 text-left">
          <p className="text-xs text-muted-foreground mb-2">To run this code:</p>
          <ol className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                1
              </span>
              <span>Copy the code using the copy button above</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                2
              </span>
              <span>
                Save it to a file with the <code className="bg-muted px-1 rounded">.{langInfo.extension}</code> extension
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                3
              </span>
              <span>
                Run:{" "}
                <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                  {langInfo.runCommand}
                </code>
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

/**
 * Fallback panel for non-previewable code.
 */
export const NonPreviewablePanel = () => (
  <div className="bg-secondary rounded-xl p-6 border border-border">
    <div className="text-center text-muted-foreground">
      <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Live preview available for React/JSX code only</p>
      <p className="text-xs mt-1">
        Copy the code and run it in your local environment
      </p>
    </div>
  </div>
);
