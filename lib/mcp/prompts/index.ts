import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerAllMcpPrompts(server: McpServer) {
  // 1. Workflow: Tiếp nhận và tạo hồ sơ nhân viên mới
  server.registerPrompt(
    "workflow-onboard-employee",
    {
      title: "Onboard nhân viên mới",
      description: "Quy trình chuẩn tiếp nhận nhân sự mới vào công ty Nexlab",
      argsSchema: {
        name: z.string().describe("Họ tên nhân viên"),
        department: z.string().describe("Phòng ban (hr, engineering, finance)"),
        position: z.string().describe("Chức vụ đảm nhiệm"),
        email: z.string().describe("Email làm việc"),
      },
    },
    ({ name, department, position, email }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Thực hiện quy trình tiếp nhận nhân sự mới:
1. Tạo hồ sơ nhân viên mới với thông tin:
   - Họ tên: ${name}
   - Phòng ban: ${department}
   - Chức vụ: ${position}
   - Email: ${email}
2. Cấp hạn mức ngày phép ban đầu là 12 ngày.
3. Xác nhận và tóm tắt thông tin nhân viên đã được thêm vào hệ thống.`,
          },
        },
      ],
    })
  );

  // 2. Workflow: Thẩm định và duyệt đơn nghỉ phép chờ xử lý
  server.registerPrompt(
    "workflow-review-pending-leaves",
    {
      title: "Duyệt đơn nghỉ phép chờ xử lý",
      description: "Quy trình duyệt hàng loạt các đơn xin nghỉ phép đang ở trạng thái chờ",
      argsSchema: {},
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Thực hiện thẩm định các đơn nghỉ phép:
1. Gọi tool 'get_leave_requests' với status='pending' để lấy danh sách các đơn đang chờ duyệt.
2. Với mỗi đơn, kiểm tra số ngày phép còn lại của nhân viên đó bằng tool 'get_leave_balance'.
3. Nếu nhân viên còn đủ ngày phép, tiến hành gọi 'approve_leave_request'.
4. Nếu nhân viên đã hết ngày phép, báo cáo lại để người dùng xem xét từ chối.`,
          },
        },
      ],
    })
  );
}
