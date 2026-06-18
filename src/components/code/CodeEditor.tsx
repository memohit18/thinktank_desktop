'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-sm text-neutral-400">
      Loading editor...
    </div>
  ),
});

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  alwaysDark?: boolean;
};

export default function CodeEditor({
  value,
  onChange,
  alwaysDark = false,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editorTheme =
    alwaysDark || resolvedTheme === 'dark' ? 'vs-dark' : 'light';

  if (!mounted) {
    return (
      <div
        className={`flex h-full min-h-[280px] items-center justify-center text-sm ${
          alwaysDark
            ? 'bg-[#1e1e1e] text-neutral-400'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        Loading editor...
      </div>
    );
  }

  return (
    <MonacoEditor
      height="100%"
      language="python"
      theme={editorTheme}
      value={value}
      onChange={(nextValue) => onChange(nextValue ?? '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: 'line',
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
