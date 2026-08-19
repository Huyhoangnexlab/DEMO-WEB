import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dept = searchParams.get("dept") || searchParams.get("department") || undefined;
  const q = searchParams.get("q") || searchParams.get("query") || undefined;

  const data = db.getEmployees(dept, q);
  return NextResponse.json({
    source: "GET /api/employees",
    count: data.length,
    data,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, department, position, email, leaveBalance, nationalId, salary } = body;

    if (!name || !department || !position || !email) {
      return NextResponse.json(
        { error: "Thiếu các trường bắt buộc (name, department, position, email)" },
        { status: 400 }
      );
    }

    const newEmp = db.createEmployee({
      name,
      department: department || "hr",
      position,
      email,
      leaveBalance: Number(leaveBalance) || 12,
      nationalId: nationalId || "079201000000",
      salary: Number(salary) || 15000000,
    });

    return NextResponse.json(
      {
        source: "POST /api/employees",
        success: true,
        data: newEmp,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
