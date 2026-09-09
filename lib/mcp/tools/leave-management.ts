import { z } from "zod";
import { db } from "../../db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLeaveManagementTools(server: McpServer) {
  // 1. Danh sách đơn nghỉ phép
  server.registerTool(
    "get_leave_requests",
    {
      title: "Danh sách đơn nghỉ phép",
      description: "Lấy danh sách các đơn xin nghỉ phép trong hệ thống, có thể lọc theo trạng thái hoặc theo mã nhân viên",
      inputSchema: {
        status: z
          .enum(["all", "pending", "approved", "rejected"])
          .optional()
          .describe("Lọc theo trạng thái: pending (chờ duyệt), approved (đã duyệt), rejected (từ chối), all (tất cả)"),
        employeeId: z.string().optional().describe("Lọc theo mã nhân viên cụ thể (ví dụ: emp-001)"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ status, employeeId }) => {
      let requests = db.getLeaveRequests(status);
      if (employeeId) {
        requests = requests.filter((r) => r.employeeId === employeeId);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total: requests.length,
                requests: requests.map((r) => ({
                  id: r.id,
                  employeeId: r.employeeId,
                  employeeName: r.employeeName,
                  startDate: r.startDate,
                  endDate: r.endDate,
                  reason: r.reason,
                  status: r.status,
                  createdAt: r.createdAt,
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

  // 2. Duyệt đơn xin nghỉ phép
  server.registerTool(
    "approve_leave_request",
    {
      title: "Duyệt đơn nghỉ phép",
      description: "Phê duyệt một đơn xin nghỉ phép đang ở trạng thái chờ (pending). Tự động cập nhật số ngày phép của nhân viên.",
      inputSchema: {
        requestId: z.string().describe("Mã đơn xin nghỉ phép cần duyệt (ví dụ: lr-001)"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    async ({ requestId }) => {
      const existing = db.getLeaveRequestById(requestId);
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Không tìm thấy đơn xin nghỉ với mã ${requestId}` }],
        };
      }

      if (existing.status === "approved") {
        return {
          content: [{ type: "text", text: `Đơn ${requestId} đã được phê duyệt trước đó rồi.` }],
        };
      }

      // Cập nhật trạng thái đơn
      const updated = db.updateLeaveRequestStatus(requestId, "approved");

      // Cập nhật trừ ngày phép của nhân viên
      const emp = db.getEmployeeById(existing.employeeId);
      if (emp) {
        // Tính số ngày nghỉ giả định
        const start = new Date(existing.startDate);
        const end = new Date(existing.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
        const newBalance = Math.max(0, emp.leaveBalance - days);
        db.updateEmployee(emp.id, { leaveBalance: newBalance });
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                message: `Phê duyệt đơn nghỉ phép ${requestId} thành công!`,
                request: updated,
                employeeId: existing.employeeId,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 3. Từ chối đơn xin nghỉ phép
  server.registerTool(
    "reject_leave_request",
    {
      title: "Từ chối đơn nghỉ phép",
      description: "Từ chối một đơn xin nghỉ phép kèm lý do",
      inputSchema: {
        requestId: z.string().describe("Mã đơn xin nghỉ phép cần từ chối (ví dụ: lr-001)"),
        reason: z.string().describe("Lý do từ chối đơn nghỉ phép"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    async ({ requestId, reason }) => {
      const existing = db.getLeaveRequestById(requestId);
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Không tìm thấy đơn xin nghỉ với mã ${requestId}` }],
        };
      }

      const updated = db.updateLeaveRequestStatus(requestId, "rejected");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                message: `Đã từ chối đơn xin nghỉ phép ${requestId}.`,
                request: updated,
                rejectReason: reason,
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
