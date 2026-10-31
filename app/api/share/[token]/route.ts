import { handle } from "@/lib/db/attempts";
export async function GET(request: Request, context: { params: Promise<{ token: string }> }) { return handle("shared", request, (await context.params).token); }
