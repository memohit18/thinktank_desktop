import { notFound } from 'next/navigation';
import CodeSolveLoader from '@/components/code/CodeSolveLoader';

type CodeSolvePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CodeSolvePage({ params }: CodeSolvePageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  return <CodeSolveLoader questionId={Number(id)} />;
}
