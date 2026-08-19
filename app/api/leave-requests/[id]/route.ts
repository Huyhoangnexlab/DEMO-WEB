import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const body = await req.json().catch(() => ({}));
    const { status } = body;

    if (status !== "approved" && status !== "rejected" && status !== "pending") {
      return NextResponse.json(
        { error: "status phải là 'approved' hoặc 'rejected'" },
        { status: 400 }
      );
    }

    const updated = db.updateLeaveRequestStatus(id, status as "approved" | "rejected");
    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      source: `PATCH /api/leave-requests/${id}`,
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
