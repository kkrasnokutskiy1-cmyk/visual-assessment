import { handle } from "@/lib/db/attempts";
export const GET = (request: Request) => handle("list", request);
export const POST = (request: Request) => handle("create", request);
