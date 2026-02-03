import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Copy, Check, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

/**
 * Enhanced Error Boundary with detailed error information and recovery options.
 * Use this component to wrap parts of your UI that might throw errors.
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group("🚨 Error Boundary Caught Error");
      console.error("Error:", error);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
  };

  handleCopyError = async () => {
    const { error, errorInfo } = this.state;
    const errorReport = `
Error: ${error?.name || "Unknown"}
Message: ${error?.message || "No message"}
Stack: ${error?.stack || "No stack trace"}
Component Stack: ${errorInfo?.componentStack || "No component stack"}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    await navigator.clipboard.writeText(errorReport);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, copied, showDetails } = this.state;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full border-destructive/50 bg-destructive/5">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-destructive">
                    Something went wrong
                  </CardTitle>
                  <CardDescription>
                    An error occurred while rendering this component
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Message */}
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-mono text-sm text-destructive">
                  {error?.message || "Unknown error"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={this.handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleCopyError}
                  className="gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy Error"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  Reload Page
                </Button>
              </div>

              {/* Technical Details */}
              <Collapsible
                open={showDetails}
                onOpenChange={(open) => this.setState({ showDetails: open })}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                  >
                    <Bug className="w-4 h-4" />
                    {showDetails ? "Hide" : "Show"} Technical Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  {/* Stack Trace */}
                  {error?.stack && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Stack Trace:
                      </p>
                      <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto max-h-[200px] overflow-y-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {errorInfo?.componentStack && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Component Stack:
                      </p>
                      <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto max-h-[200px] overflow-y-auto">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
