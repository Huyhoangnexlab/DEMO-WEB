export const APP_CONTEXT_VERSION = "1.0" as const;

export interface EntityRef {
  type: string;
  id: string;
  label?: string;
}

export interface ContextField {
  value: string | number | boolean | null;
  label: string;
  source: string; // VD: "GET /api/employees#leaveBalance"
}

export interface ContextEntity {
  type: string;
  id: string;
  label: string;
  fields: Record<string, ContextField>;
}

export interface AppContextV1 {
  version: typeof APP_CONTEXT_VERSION;
  classification: "internal" | "public" | "confidential";
  view: {
    route: string;
    title: string;
    focusedEntity?: EntityRef;
  };
  entities: ContextEntity[];
  aggregates?: Record<string, number | string>;
}

export type UserActionType =
  | "view.opened"
  | "entity.viewed"
  | "entity.created"
  | "field.edited"
  | "form.submitted"
  | "action.performed"
  | "search.performed";

export interface UserActionV1 {
  version: typeof APP_CONTEXT_VERSION;
  type: UserActionType;
  at?: string;
  entity?: EntityRef;
  detail?: Record<string, string | number>;
}

export interface NexlabAppSdk {
  readonly appId?: string;
  getSharingState?(): Promise<"private" | "shared">;
  provideContext(ctx: AppContextV1): Promise<void> | void;
  reportUserAction(evt: UserActionV1): Promise<void> | void;
  registerTool?(tool: Record<string, unknown>, handler: (...args: any[]) => any): Promise<void> | void;
}

declare global {
  interface Window {
    nexlabApp?: NexlabAppSdk;
    __NEXLAB_CONTEXT__?: AppContextV1;
    __NEXLAB_BEHAVIOR__?: UserActionV1[];
  }
}
