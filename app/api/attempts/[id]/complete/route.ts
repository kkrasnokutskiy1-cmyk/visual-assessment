import { handle } from "@/lib/db/attempts";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { return handle("complete", request, (await context.params).id); }
