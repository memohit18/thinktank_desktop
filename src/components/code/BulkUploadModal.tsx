'use client';

import { useEffect, useState } from 'react';
import {
  formatBulkUploadResult,
  getBulkUploadExampleJson,
  parseBulkUploadJson,
  validateBulkUploadPayload,
} from '@/lib/code/bulkUpload';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useBulkUploadQuestionsMutation } from '@/lib/services/problemsApi';
import { useToast } from '@/components/ui/Toast';

type BulkUploadModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function BulkUploadModal({ open, onClose }: BulkUploadModalProps) {
  const { showToast } = useToast();
  const [bulkUpload, { isLoading }] = useBulkUploadQuestionsMutation();
  const [jsonText, setJsonText] = useState(getBulkUploadExampleJson());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleLoadExample() {
    setJsonText(getBulkUploadExampleJson());
    setValidationErrors([]);
    setUploadResult(null);
  }

  function handleFormatJson() {
    const { data, parseError } = parseBulkUploadJson(jsonText);
    if (parseError || !data) {
      setValidationErrors([parseError ?? 'Unable to format JSON.']);
      return;
    }

    setJsonText(JSON.stringify(data, null, 2));
    setValidationErrors([]);
  }

  async function handleUpload() {
    setValidationErrors([]);
    setUploadResult(null);

    const { data, parseError } = parseBulkUploadJson(jsonText);
    if (parseError || !data) {
      setValidationErrors([parseError ?? 'Invalid JSON.']);
      return;
    }

    const validation = validateBulkUploadPayload(data);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const result = await bulkUpload(validation.payload).unwrap();
      const summary = formatBulkUploadResult(result);
      setUploadResult(summary);
      showToast('Bulk upload completed successfully.');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Bulk upload failed. Please try again.');
      setValidationErrors([message]);
      showToast(message, 'error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close bulk upload"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Bulk Upload Questions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste JSON with <code className="rounded bg-muted px-1 py-0.5 text-xs">questions</code>{' '}
              and optional <code className="rounded bg-muted px-1 py-0.5 text-xs">testcases</code>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLoadExample}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Load example
            </button>
            <button
              type="button"
              onClick={handleFormatJson}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Format JSON
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value);
              setValidationErrors([]);
              setUploadResult(null);
            }}
            spellCheck={false}
            className="h-[min(52vh,520px)] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground outline-none focus:border-accent"
          />

          {validationErrors.length > 0 ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-500">Validation errors</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-500">
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {uploadResult ? (
            <div className="mt-4 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
              <p className="font-semibold text-accent">Upload successful</p>
              <p className="mt-2 text-muted-foreground">{uploadResult}</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isLoading}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-black"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
