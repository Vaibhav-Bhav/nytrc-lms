import { FileText, Check, Loader2, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { UploadStage } from "../../data/types";
import { Button, cn } from "./Button";

const VIDEO_PIPELINE_STAGES = [
  { id: "uploading", label: "Uploading file" },
  { id: "processing", label: "Processing video" },
  { id: "generating", label: "Generating streaming assets" },
  { id: "ready", label: "Ready for publishing" },
  { id: "published", label: "Published" },
];

const PDF_PIPELINE_STAGES = [
  { id: "uploading", label: "Uploading file" },
  { id: "processing", label: "Processing document" },
  { id: "published", label: "Complete" },
];

export function UploadPipeline({
  stage,
  progress,
  filename,
  fileType = "video",
  onRetry,
  onPublish,
}: {
  stage: UploadStage;
  progress: number;
  filename?: string;
  fileType?: "video" | "pdf";
  onRetry?: () => void;
  onPublish?: () => void;
}) {
  const stages = fileType === "pdf" ? PDF_PIPELINE_STAGES : VIDEO_PIPELINE_STAGES;
  const currentIdx = stage === "failed" ? stages.findIndex((s) => s.id === "uploading") : stages.findIndex((s) => s.id === stage);

  return (
    <div className="space-y-4">
      {filename && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-muted/40 rounded-lg border border-border">
          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{filename}</span>
        </div>
      )}
      <div className="space-y-3">
        {stages.map((s, i) => {
          const isCompleted = stage !== "failed" && (currentIdx > i || stage === "published");
          const isCurrent = currentIdx === i;
          const isFailed = stage === "failed" && i === 0;

          return (
            <div key={s.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all",
                  isCompleted
                    ? "bg-success text-white"
                    : isFailed
                    ? "bg-error text-white"
                    : isCurrent && !isFailed
                    ? "border-2 border-primary bg-primary-light"
                    : "border-2 border-border bg-card text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : isCurrent && !isFailed ? (
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                ) : isFailed ? (
                  <X className="w-3 h-3" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-foreground" : isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                  {isCurrent && !isFailed && s.id !== "uploading" && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">Processing...</span>
                  )}
                </p>
                {isCurrent && s.id === "uploading" && !isFailed && (
                  <div className="mt-2 space-y-1.5">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">{Math.round(progress)}% uploaded</p>
                  </div>
                )}
                {isFailed && (
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-xs text-error-foreground">Upload failed — please try again.</p>
                    {onRetry && (
                      <button onClick={onRetry} className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {stage === "ready" && onPublish && (
        <Button onClick={onPublish} className="w-full mt-2">
          <CheckCircle2 className="w-4 h-4" />
          Publish lesson now
        </Button>
      )}
      {stage === "published" && (
        <div className="flex items-center gap-2 text-sm text-success-foreground font-semibold px-1">
          <CheckCircle2 className="w-4 h-4" />
          Lesson published successfully
        </div>
      )}
    </div>
  );
}
