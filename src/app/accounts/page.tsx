import { AccountsClient } from "@/components/accounts/AccountsClient";
import { PlatformCredentialCard } from "@/components/settings/PlatformCredentialCard";
import { AppNav } from "@/components/shell/AppNav";

export default function AccountsPage() {
  return (
    <>
      <AppNav title="平台账号" eyebrow="账号授权与发布能力" status="已保存" />
      <main className="ml-[216px] min-h-screen overflow-auto pt-16">
        <div className="mx-auto max-w-6xl px-4 py-5 min-[1440px]:py-6">
          <AccountsClient />
          <div className="mt-8">
            <PlatformCredentialCard />
          </div>
        </div>
      </main>
    </>
  );
}
