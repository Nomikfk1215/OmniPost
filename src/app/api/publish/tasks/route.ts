import { NextResponse } from "next/server";
import { listPublishTasks } from "@/lib/db/publish-tasks";

export const dynamic = "force-dynamic";

export async function GET() {
  const tasks = await listPublishTasks();
  return NextResponse.json({ tasks });
}
