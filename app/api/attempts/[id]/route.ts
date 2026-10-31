import { handle } from "@/lib/db/attempts";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { return handle("get", request, (await context.params).id); }
