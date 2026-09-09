import { getNotionClient } from "./client";

export interface SopDocument {
  id: string;
  title: string;
  url: string;
  lastEdited: string;
}

export async function searchSopDocuments(query: string): Promise<SopDocument[]> {
  try {
    const client = getNotionClient();
    const response = await client.search({
      query,
      filter: {
        value: "page",
        property: "object",
      },
      page_size: 3,
    });

    return response.results.map((page: any) => {
      const titleProp =
        page.properties?.title ||
        page.properties?.Name ||
        page.properties?.Title;
      const title =
        titleProp?.title?.[0]?.plain_text || "Quy chế công ty";

      return {
        id: page.id,
        title,
        url: page.url,
        lastEdited: page.last_edited_time,
      };
    });
  } catch (err: any) {
    console.error("[Notion SOP Service] Lỗi tìm kiếm:", err.message);
    return [];
  }
}
