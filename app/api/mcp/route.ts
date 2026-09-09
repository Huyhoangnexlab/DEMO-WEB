import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    name: "nexlab-hr-demo-mcp",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description: "Nexlab HR Demo — Enterprise MCP Server Endpoint (Full Catalog)",
    transports: {
      sse: {
        endpoint: "/api/mcp/sse",
        description: "Server-Sent Events transport for real-time bidirectional messaging",
      },
      http: {
        endpoint: "/api/mcp/http",
        description: "Streamable HTTP transport (MCP 2025/2026 standard)",
      },
    },
    capabilities: {
      toolsCount: 9,
      resourcesCount: 2,
      promptsCount: 2,
    },
    exportedTools: [
      {
        name: "get_leave_balance",
        category: "leave",
        description: "Tra cứu số ngày phép còn lại của nhân viên",
        parameters: ["employeeId"],
      },
      {
        name: "get_leave_requests",
        category: "leave",
        description: "Lấy danh sách các đơn nghỉ phép (lọc theo status, employeeId)",
        parameters: ["status?", "employeeId?"],
      },
      {
        name: "create_leave_draft",
        category: "leave",
        description: "Tạo bản nháp đơn xin nghỉ phép mới (status: pending)",
        parameters: ["employeeId", "type", "startDate", "endDate", "days", "reason"],
      },
      {
        name: "approve_leave_request",
        category: "leave",
        description: "Phê duyệt đơn xin nghỉ phép và tự động trừ ngày phép",
        parameters: ["requestId"],
      },
      {
        name: "reject_leave_request",
        category: "leave",
        description: "Từ chối đơn xin nghỉ phép kèm lý do",
        parameters: ["requestId", "reason"],
      },
      {
        name: "get_employees",
        category: "employee",
        description: "Danh sách nhân viên (hỗ trợ lọc phòng ban và tìm kiếm theo tên/email)",
        parameters: ["department?", "query?"],
      },
      {
        name: "get_employee_detail",
        category: "employee",
        description: "Xem chi tiết hồ sơ nhân viên (Bảo vệ thông tin PII nhạy cảm)",
        parameters: ["employeeId"],
      },
      {
        name: "create_employee",
        category: "employee",
        description: "Thêm nhân viên mới vào danh bạ công ty",
        parameters: ["name", "department", "position", "email", "leaveBalance?"],
      },
      {
        name: "update_employee",
        category: "employee",
        description: "Cập nhật thông tin phòng ban, chức vụ hoặc email",
        parameters: ["employeeId", "position?", "department?", "email?"],
      },
      {
        name: "delete_employee",
        category: "employee",
        description: "Xoá nhân viên khỏi hệ thống (Yêu cầu xác nhận)",
        parameters: ["employeeId", "confirm"],
      },
      {
        name: "get_hr_summary",
        category: "system",
        description: "Báo cáo tổng quan số liệu nhân sự, cơ cấu phòng ban và đơn chờ duyệt",
        parameters: [],
      },
      {
        name: "reset_hr_database",
        category: "system",
        description: "Khôi phục dữ liệu mẫu ban đầu để phục vụ Demo",
        parameters: ["confirm"],
      },
    ],
    exportedResources: [
      {
        uri: "hr://policies/leave",
        name: "leave-policy",
        description: "Toàn văn Quy chế Nghỉ phép, Nghỉ ốm, Thai sản và Thời gian báo trước của Nexlab",
      },
      {
        uri: "hr://departments/list",
        name: "departments-directory",
        description: "Danh mục cơ cấu tổ chức và các phòng ban trực thuộc",
      },
    ],
    exportedPrompts: [
      {
        name: "workflow-onboard-employee",
        description: "Quy trình mẫu tiếp nhận nhân sự mới: Tạo hồ sơ, cấp phép, thông báo",
      },
      {
        name: "workflow-review-pending-leaves",
        description: "Quy trình mẫu thẩm định và duyệt tự động các đơn xin nghỉ phép chờ xử lý",
      },
    ],
  });
}
