import { SeoDashboardClient } from './SeoDashboardClient';

export default async function ProjectSeoPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <SeoDashboardClient projectId={projectId} />;
}
