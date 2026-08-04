import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught render error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 max-w-md w-full flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                {this.props.fallbackTitle || "Something went wrong"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                An unexpected error occurred while rendering this component. The details have been safely caught.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="w-full p-3 bg-muted/40 rounded-lg border border-border text-left">
                <p className="text-[11px] font-mono text-muted-foreground break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 w-full pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="flex-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
              </Button>
              {this.props.onReset && (
                <Button
                  size="sm"
                  onClick={this.props.onReset}
                  className="flex-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Go back
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
