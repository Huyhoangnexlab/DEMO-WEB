import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllMcpTools } from "./tools";
import { registerAllMcpResources } from "./resources";
import { registerAllMcpPrompts } from "./prompts";

/**
 * `mcp-handler`'s createMcpHandler constructs its OWN McpServer instance and hands it to
 * this callback to be mutated in place — it does not use a server returned from the
 * callback. Registering tools/resources/prompts here (rather than on a separately
 * `new McpServer(...)`'d instance) is what makes them show up in `tools/list` on the
 * instance actually wired to the transport.
 */
export function registerHrMcpServer(server: McpServer): void {
  // 1. Đăng ký toàn bộ 10+ Tools quản lý nhân sự & ngày phép
  registerAllMcpTools(server);

  // 2. Đăng ký các Resources tĩnh (Quy chế nghỉ phép, danh mục phòng ban)
  registerAllMcpResources(server);

  // 3. Đăng ký các Workflows mẫu (Onboarding, duyệt ngày phép tự động)
  registerAllMcpPrompts(server);
}
