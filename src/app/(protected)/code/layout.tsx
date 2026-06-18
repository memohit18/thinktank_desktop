import CodeModuleGate from '@/components/code/CodeModuleGate';

export default function CodeLayout({ children }: { children: React.ReactNode }) {
  return <CodeModuleGate>{children}</CodeModuleGate>;
}
