import { z } from "zod";
import { db } from "../../db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetEmployeesTool(server: McpServer) {
  server.registerTool(
    "get_employees",
    {
      title: "Danh sách nhân viên",
      description: "Lấy danh sách nhân viên của công ty, có thể lọc theo phòng ban hoặc tìm kiếm theo tên/email",
      inputSchema: {
        department: z
          .string()
          .optional()
          .describe("Lọc theo phòng ban (Kỹ thuật, Nhân sự, Kinh doanh...)"),
        query: z
          .string()
          .optional()
          .describe("Từ khóa tìm kiếm theo tên, chức vụ hoặc email"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ department, query }) => {
      const employees = db.getEmployees(department, query);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                count: employees.length,
                employees: employees.map((e) => ({
                  id: e.id,
                  name: e.name,
                  department: e.department,
                  position: e.position,
                  email: e.email,
                  status: e.status,
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
}
