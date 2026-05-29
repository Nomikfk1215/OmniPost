import { WorkflowProvider } from "@/components/workspace/WorkflowProvider";
import { WorkspaceChrome } from "@/components/workspace/WorkspaceChrome";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function WorkspacePage() {
  return (
    <WorkflowProvider>
      <WorkspaceChrome />
      <WorkspaceShell />
    </WorkflowProvider>
  );
}
