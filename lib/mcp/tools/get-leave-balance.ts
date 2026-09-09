import { z } from "zod";
import { db } from "../../db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetLeaveBalanceTool(server: McpServer) {
  server.registerTool(
    "get_leave_balance",
    {
      title: "Tra cứu số ngày phép còn lại",
      description: "Tra cứu số ngày phép còn lại của nhân viên theo mã định danh (ví dụ: emp-001)",
      inputSchema: {
        employeeId: z.string().describe("Mã định danh nhân viên (ví dụ: emp-001, emp-002)"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ employeeId }) => {
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

      // Giả lập quota chuẩn 12 ngày, trừ đi các ngày đã nghỉ được approved
      const requests = db
        .getLeaveRequests()
        .filter((r) => r.employeeId === employeeId && r.status === "approved");
      const usedDays = requests.reduce((sum, r) => sum + (r.days || 1), 0);
      const remainingDays = Math.max(0, 12 - usedDays);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                employeeId: emp.id,
                name: emp.name,
                department: emp.department,
                position: emp.position,
                totalQuota: 12,
                usedDays,
                remainingDays,
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
