import { AppNav } from "@/components/shell/AppNav";
import { WorkflowProvider } from "@/components/workspace/WorkflowProvider";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function WorkspacePage() {
  return (
    <>
      <AppNav />
      <WorkflowProvider>
        <WorkspaceShell />
      </WorkflowProvider>
    </>
  );
}
