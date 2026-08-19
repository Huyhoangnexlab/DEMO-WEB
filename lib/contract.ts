/**
 * Nexlab App Context Contract v1.0
 *
 * Hợp đồng giữa web app nghiệp vụ và Nexlab Intelligent Hub.
 */

export * from "./nexlab-sdk/types";

export interface AppToolV1 {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  risk: "read" | "draft" | "submit";
  requiresApproval: boolean;
  execute: (args: Record<string, unknown>) => Promise<{
    content: Array<{ type: "text"; text: string }>;
  }>;
}

export interface BridgeCapabilities {
  globalContext: boolean;
  jsonLd: boolean;
  nexlabAppSdk: boolean;
  webmcp: boolean;
  detail: Record<string, string>;
}
