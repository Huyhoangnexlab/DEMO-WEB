import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DEPARTMENTS } from "../../seed";

export function registerAllMcpResources(server: McpServer) {
  // 1. Resource: Quy chế nghỉ phép công ty Nexlab
  server.registerResource(
    "leave-policy",
    "hr://policies/leave",
    {
      title: "Quy chế nghỉ phép",
      description: "Toàn văn quy chế nghỉ phép, nghỉ ốm, thai sản và thời gian báo trước của Nexlab",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: `# QUY CHẾ NGHỈ PHÉP CÔNG TY CỔ PHẦN CÔNG NGHỆ NEXLAB
Phiên bản: 2026.1 - Hiệu lực: Toàn thể cán bộ nhân viên

## 1. Hạn Mức Ngày Phép Năm (Annual Leave)
- Mỗi nhân viên chính thức có tiêu chuẩn 12 ngày phép hưởng nguyên lương trong một năm làm việc.
- Nhân viên làm việc từ đủ 5 năm trở lên được cộng thêm 01 ngày phép cho mỗi 5 năm thâm niên.
- Ngày phép năm chưa sử dụng hết được phép chuyển sang năm kế tiếp (tối đa không quá ngày 31/03).

## 2. Quy Định Báo Trước (Notice Period)
- Nghỉ từ 01 đến 02 ngày: Báo trước tối thiểu 24 giờ.
- Nghỉ từ 03 đến 05 ngày: Báo trước tối thiểu 03 ngày làm việc.
- Nghỉ trên 05 ngày: Báo trước tối thiểu 02 tuần và phải được Trưởng phòng phê duyệt kế hoạch bàn giao.

## 3. Nghỉ Ốm Đau & Việc Riêng Có Hưởng Lương
- Nghỉ ốm (Sick Leave): Được hưởng theo chế độ BHXH hiện hành. Nghỉ từ 02 ngày liên tiếp trở lên bắt buộc phải có giấy xác nhận khám bệnh của cơ sở y tế.
- Kết hôn của bản thân: Nghỉ 03 ngày hưởng nguyên lương.
- Con kết hôn: Nghỉ 01 ngày hưởng nguyên lương.
- Tang chế (tứ thân phụ mẫu, vợ/chồng, con): Nghỉ 03 ngày hưởng nguyên lương.

## 4. Quy Trình Phê Duyệt
1. Nhân viên gửi đơn xin nghỉ phép qua hệ thống Nexlab HR Portal.
2. Quản lý trực tiếp thẩm định công việc và số dư ngày phép còn lại.
3. Đơn được duyệt hoặc từ chối kèm lý do trong vòng 24 giờ làm việc.`,
        },
      ],
    })
  );

  // 2. Resource: Cơ cấu tổ chức và danh mục phòng ban
  server.registerResource(
    "departments-directory",
    "hr://departments/list",
    {
      title: "Danh mục phòng ban",
      description: "Danh mục cơ cấu tổ chức và các phòng ban trực thuộc",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(
            {
              company: "Nexlab Intelligent Hub Corp",
              departments: DEPARTMENTS.map((d) => ({
                id: d.id,
                name: d.label,
                description: `Phòng ban ${d.label} trực thuộc hệ thống quản trị Nexlab`,
              })),
            },
            null,
            2
          ),
        },
      ],
    })
  );
}
