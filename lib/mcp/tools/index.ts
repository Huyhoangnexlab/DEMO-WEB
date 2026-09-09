import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetLeaveBalanceTool } from "./get-leave-balance";
import { registerGetEmployeesTool } from "./get-employees";
import { registerCreateLeaveDraftTool } from "./create-leave-draft";
import { registerEmployeeManagementTools } from "./employee-management";
import { registerLeaveManagementTools } from "./leave-management";
import { registerSystemTools } from "./system-tools";

export function registerAllMcpTools(server: McpServer) {
  // Nhóm 1: Các tool nghỉ phép cơ bản
  registerGetLeaveBalanceTool(server);
  registerCreateLeaveDraftTool(server);

  // Nhóm 2: Các tool quản lý đơn nghỉ phép nâng cao (Duyệt, từ chối, xem danh sách)
  registerLeaveManagementTools(server);

  // Nhóm 3: Các tool quản lý danh bạ nhân sự (Thêm, sửa, xoá, xem chi tiết)
  registerGetEmployeesTool(server);
  registerEmployeeManagementTools(server);

  // Nhóm 4: Báo cáo số liệu & tiện ích hệ thống
  registerSystemTools(server);
}
