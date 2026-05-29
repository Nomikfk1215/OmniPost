import { AccountsClient } from "@/components/accounts/AccountsClient";
import { AppNav } from "@/components/shell/AppNav";

export default function AccountsPage() {
  return (
    <>
      <AppNav title="平台账号" eyebrow="账号授权与发布能力" status="已保存" />
      <main className="ml-[216px] min-h-screen overflow-auto pt-16">
        <AccountsClient />
      </main>
    </>
  );
}
