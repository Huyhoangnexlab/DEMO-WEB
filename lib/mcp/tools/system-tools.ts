import { z } from "zod";
import { db } from "../../db";
import { DEPARTMENTS } from "../../seed";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSystemTools(server: McpServer) {
  // 1. Lấy báo cáo tổng quan số liệu HR
  server.registerTool(
    "get_hr_summary",
    {
      title: "Báo cáo tổng quan HR",
      description: "Lấy báo cáo tổng quan về nhân sự: tổng số nhân viên, phân bố theo phòng ban, số lượng đơn nghỉ phép đang chờ duyệt (pending)",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async () => {
      const allEmployees = db.getEmployees();
      const allLeaves = db.getLeaveRequests();

      const pendingLeaves = allLeaves.filter((l) => l.status === "pending");
      const approvedLeaves = allLeaves.filter((l) => l.status === "approved");

      const deptCounts: Record<string, number> = {};
      for (const d of DEPARTMENTS) {
        deptCounts[d.label] = allEmployees.filter((e) => e.department === d.id).length;
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                overview: {
                  totalEmployees: allEmployees.length,
                  totalLeaveRequests: allLeaves.length,
                  pendingLeaveRequestsCount: pendingLeaves.length,
                  approvedLeaveRequestsCount: approvedLeaves.length,
                },
                departmentBreakdown: deptCounts,
                pendingRequestsSample: pendingLeaves.slice(0, 3).map((p) => ({
                  id: p.id,
                  employeeName: p.employeeName,
                  reason: p.reason,
                  createdAt: p.createdAt,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 2. Reset database về dữ liệu ban đầu
  server.registerTool(
    "reset_hr_database",
    {
      title: "Reset dữ liệu HR",
      description: "Khôi phục toàn bộ cơ sở dữ liệu HR Demo về trạng thái mẫu ban đầu (Phục vụ Demo)",
      inputSchema: {
        confirm: z.boolean().describe("Xác nhận muốn reset toàn bộ dữ liệu (true)"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
    },
    async ({ confirm }) => {
      if (!confirm) {
        return {
          isError: true,
          content: [{ type: "text", text: "Vui lòng xác nhận `confirm: true` để reset database." }],
        };
      }

      const result = db.reset();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                message: "Đã khôi phục cơ sở dữ liệu mẫu thành công!",
                employeeCount: result.employeeCount,
                leaveRequestCount: result.leaveCount,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
