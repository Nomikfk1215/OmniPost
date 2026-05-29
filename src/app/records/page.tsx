import { AppNav } from "@/components/shell/AppNav";
import { RecordsClient } from "@/components/publish/RecordsClient";

export default function RecordsPage() {
  return (
    <>
      <AppNav title="发布记录" eyebrow="模拟发布任务" status="记录已同步" />
      <main className="ml-[216px] min-h-screen px-4 pb-6 pt-20">
        <RecordsClient />
      </main>
    </>
  );
}
