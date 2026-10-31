import { handle } from "@/lib/db/attempts";
export async function PUT(request: Request, context: { params: Promise<{ id: string; questionId: string }> }) { const { id, questionId } = await context.params; return handle("answer", request, id, questionId); }
