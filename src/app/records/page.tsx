import { AppNav } from "@/components/shell/AppNav";
import { RecordsClient } from "@/components/publish/RecordsClient";

export default function RecordsPage() {
  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-[1200px] px-4 py-4">
        <RecordsClient />
      </main>
    </>
  );
}
