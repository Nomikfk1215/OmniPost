import { WorkflowProvider } from "@/components/workspace/WorkflowProvider";
import { WorkspaceChrome } from "@/components/workspace/WorkspaceChrome";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function WorkspacePage({
  searchParams
}: {
  searchParams?: { contentId?: string };
}) {
  return (
    <WorkflowProvider initialContentId={searchParams?.contentId}>
      <WorkspaceChrome />
      <WorkspaceShell />
    </WorkflowProvider>
  );
}
