import { handle } from "@/lib/db/attempts";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { return handle("share", request, (await context.params).id); }
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) { return handle("unshare", request, (await context.params).id); }
