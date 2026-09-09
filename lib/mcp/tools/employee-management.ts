import { z } from "zod";
import { db } from "../../db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerEmployeeManagementTools(server: McpServer) {
  // 1. Xem chi tiết hồ sơ nhân viên
  server.registerTool(
    "get_employee_detail",
    {
      title: "Chi tiết hồ sơ nhân viên",
      description: "Xem thông tin chi tiết hồ sơ nhân viên theo mã định danh (id). Bảo vệ thông tin nhạy cảm PII.",
      inputSchema: {
        employeeId: z.string().describe("Mã nhân viên (ví dụ: emp-001, emp-002)"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ employeeId }) => {
      const emp = db.getEmployeeById(employeeId);
      if (!emp) {
        return {
          isError: true,
          content: [{ type: "text", text: `Không tìm thấy nhân viên với mã ${employeeId}` }],
        };
      }

      // Tuân thủ PII Security: không tự ý leak CCCD hay lương trừ khi cần
      const safeEmployee = {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        position: emp.position,
        email: emp.email,
        leaveBalance: emp.leaveBalance,
        joinDate: emp.joinDate,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(safeEmployee, null, 2) }],
      };
    }
  );

  // 2. Thêm nhân viên mới
  server.registerTool(
    "create_employee",
    {
      title: "Thêm nhân viên mới",
      description: "Thêm một nhân viên mới vào danh bạ công ty Nexlab",
      inputSchema: {
        name: z.string().min(2).describe("Họ và tên đầy đủ của nhân viên"),
        department: z.enum(["hr", "engineering", "finance"]).describe("Phòng ban: hr (Nhân sự), engineering (Kỹ thuật), finance (Tài chính)"),
        position: z.string().min(2).describe("Chức danh công việc (ví dụ: Frontend Developer, HR Specialist)"),
        email: z.string().email().describe("Địa chỉ email công ty"),
        leaveBalance: z.number().int().min(0).max(30).optional().describe("Hạn mức ngày phép ban đầu (mặc định 12 ngày)"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ name, department, position, email, leaveBalance = 12 }) => {
      const newEmp = db.createEmployee({
        name,
        department,
        position,
        email,
        leaveBalance,
        nationalId: "000000000000", // Mặc định placeholder
        salary: 0,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                message: "Tạo nhân viên mới thành công!",
                employee: {
                  id: newEmp.id,
                  name: newEmp.name,
                  department: newEmp.department,
                  position: newEmp.position,
                  email: newEmp.email,
                  joinDate: newEmp.joinDate,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 3. Cập nhật thông tin nhân viên
  server.registerTool(
    "update_employee",
    {
      title: "Cập nhật nhân viên",
      description: "Cập nhật thông tin phòng ban, vị trí công việc hoặc email của nhân viên",
      inputSchema: {
        employeeId: z.string().describe("Mã nhân viên cần cập nhật (ví dụ: emp-001)"),
        position: z.string().optional().describe("Chức danh công việc mới"),
        department: z.enum(["hr", "engineering", "finance"]).optional().describe("Phòng ban mới"),
        email: z.string().email().optional().describe("Email mới"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    async ({ employeeId, position, department, email }) => {
      const updates: Record<string, unknown> = {};
      if (position) updates.position = position;
      if (department) updates.department = department;
      if (email) updates.email = email;

      const updated = db.updateEmployee(employeeId, updates);
      if (!updated) {
        return {
          isError: true,
          content: [{ type: "text", text: `Không tìm thấy nhân viên với mã ${employeeId}` }],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ message: "Cập nhật nhân viên thành công!", employee: updated }, null, 2),
          },
        ],
      };
    }
  );

  // 4. Xóa nhân viên
  server.registerTool(
    "delete_employee",
    {
      title: "Xoá nhân viên",
      description: "Xoá nhân viên khỏi danh bạ (Thao tác nhạy cảm, yêu cầu xác nhận)",
      inputSchema: {
        employeeId: z.string().describe("Mã nhân viên cần xoá (ví dụ: emp-001)"),
        confirm: z.boolean().describe("Xác nhận muốn xoá nhân viên (true)"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
    },
    async ({ employeeId, confirm }) => {
      if (!confirm) {
        return {
          isError: true,
          content: [{ type: "text", text: "Vui lòng xác nhận `confirm: true` để thực hiện xoá nhân viên." }],
        };
      }

      const success = db.deleteEmployee(employeeId);
      if (!success) {
        return {
          isError: true,
          content: [{ type: "text", text: `Không tìm thấy nhân viên với mã ${employeeId}` }],
        };
      }

      return {
        content: [{ type: "text", text: `Đã xoá nhân viên ${employeeId} khỏi hệ thống thành công.` }],
      };
    }
  );
}
