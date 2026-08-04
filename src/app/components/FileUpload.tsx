import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "./Button";

export function FileUpload({
  hint,
  onChange,
}: {
  hint?: string;
  onChange?: (file: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onChange?.(file);
  }
  return (
    <label
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50"
      )}
    >
      <input
        type="file"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange?.(f);
        }}
      />
      <Upload className={cn("w-8 h-8 transition-colors", dragOver ? "text-primary" : "text-muted-foreground")} />
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Drop a file here, or click to browse</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
    </label>
  );
}

export function FileUploadProgress({
  filename,
  progress,
  done,
  error,
  onCancel,
}: {
  filename?: string;
  progress: number;
  done?: boolean;
  error?: boolean;
  onCancel?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-foreground font-medium truncate">{filename ?? "Uploading..."}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {done ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          ) : error ? (
            <AlertCircle className="w-4 h-4 text-destructive" />
          ) : (
            <span className="text-xs text-muted-foreground tabular-nums">{Math.round(progress)}%</span>
          )}
          {!done && !error && onCancel && (
            <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-200",
            error ? "bg-destructive" : done ? "bg-emerald-500 dark:bg-emerald-400" : "bg-primary"
          )}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      {error && <p className="text-xs text-destructive">Upload failed. Please try again.</p>}
      {done && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Upload complete
        </p>
      )}
    </div>
  );
}
