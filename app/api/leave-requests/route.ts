import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const data = db.getLeaveRequests(status);
  return NextResponse.json({
    source: "GET /api/leave-requests",
    count: data.length,
    data,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId, employeeName, startDate, endDate, reason } = body;

    if (!employeeId || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: "Thiếu các trường bắt buộc (employeeId, startDate, endDate, reason)" },
        { status: 400 }
      );
    }

    let finalEmployeeName = employeeName;
    if (!finalEmployeeName) {
      const emp = db.getEmployeeById(employeeId);
      finalEmployeeName = emp?.name || employeeId;
    }

    const newReq = db.createLeaveRequest({
      employeeId,
      employeeName: finalEmployeeName,
      startDate,
      endDate,
      reason,
    });

    return NextResponse.json(
      {
        source: "POST /api/leave-requests",
        success: true,
        data: newReq,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
