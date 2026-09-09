export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { createMcpHandler } from "mcp-handler";
import { registerHrMcpServer } from "../../../../lib/mcp/server";

const handler = createMcpHandler(
  (server) => {
    registerHrMcpServer(server);
  },
  {
    serverInfo: { name: "nexlab-hr-demo", version: "1.0.0" },
    verboseLogs: true,
    onEvent: (event) => {
      if (event.type === "ERROR") {
        console.error("[mcp-handler]", event.error, event.context);
      }
    },
  }
);

export const GET = handler;
export const POST = handler;
export const DELETE = handler;

