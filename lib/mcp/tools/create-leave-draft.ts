import { z } from "zod";
import { db } from "../../db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCreateLeaveDraftTool(server: McpServer) {
  server.registerTool(
    "create_leave_draft",
    {
      title: "Tạo bản nháp đơn nghỉ phép",
      description: "Tạo bản nháp đơn xin nghỉ phép mới cho nhân viên (trạng thái chờ duyệt: pending)",
      inputSchema: {
        employeeId: z.string().describe("Mã nhân viên (ví dụ: emp-001)"),
        type: z
          .enum(["annual", "sick", "unpaid"])
          .describe("Loại ngày phép: annual (phép năm), sick (nghỉ ốm), unpaid (nghỉ không lương)"),
        startDate: z.string().describe("Ngày bắt đầu nghỉ (định dạng YYYY-MM-DD)"),
        endDate: z.string().describe("Ngày kết thúc nghỉ (định dạng YYYY-MM-DD)"),
        days: z.number().int().positive().describe("Số ngày nghỉ tính theo ngày làm việc"),
        reason: z.string().describe("Lý do xin nghỉ phép"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ employeeId, type, startDate, endDate, days, reason }) => {
      const emp = db.getEmployeeById(employeeId);
      if (!emp) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Không tìm thấy nhân viên với mã ${employeeId}`,
            },
          ],
        };
      }

      // Tạo đơn mới trên in-memory DB
      const newRequest = db.createLeaveRequest({
        employeeId: emp.id,
        employeeName: emp.name,
        type,
        startDate,
        endDate,
        days,
        reason,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                message: "Đã tạo bản nháp đơn nghỉ phép thành công!",
                request: newRequest,
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
