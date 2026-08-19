import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Employee } from "@/lib/seed";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const emp = db.getEmployeeById(id);
  if (!emp) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ source: `GET /api/employees/${id}`, data: emp });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<Employee>;
    const updated = db.updateEmployee(id, body);
    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ source: `PATCH /api/employees/${id}`, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ok = db.deleteEmployee(id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ source: `DELETE /api/employees/${id}`, success: true });
}
