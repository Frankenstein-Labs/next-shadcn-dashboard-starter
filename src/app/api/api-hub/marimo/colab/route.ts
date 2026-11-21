import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const repository = 'Frankenstein-Labs/next-shadcn-dashboard-starter';
const notebookPath = 'notebooks/aetheris_colab_marimo.ipynb';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const branch = 'main';
  return NextResponse.json({
    runtime: 'Google Colab',
    engine: 'marimo',
    repository,
    branch,
    notebookPath,
    githubUrl: `https://github.com/${repository}/blob/${branch}/${notebookPath}`,
    colabUrl: `https://colab.research.google.com/github/${repository}/blob/${branch}/${notebookPath}`,
    execution: 'user_runtime',
    note: 'Les calculs lourds s’exécutent dans le runtime Colab de l’utilisateur.'
  });
}
