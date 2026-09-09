export interface Employee {
  id: string;
  name: string;
  department: "hr" | "engineering" | "finance";
  position: string;
  email: string;
  leaveBalance: number;
  nationalId: string; // ⚠️ NHẠY CẢM: Hiện trên UI nhưng KHÔNG đưa vào AppContext
  salary: number;     // ⚠️ NHẠY CẢM: Hiện trên UI nhưng KHÔNG đưa vào AppContext
  joinDate: string;
  status?: "active" | "on_leave";
}

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: "emp-001", name: "Nguyễn Văn A", department: "hr", position: "HR Specialist", email: "a.nguyen@nexlab.vn", leaveBalance: 12, nationalId: "079201001234", salary: 18000000, joinDate: "2023-03-15" },
  { id: "emp-002", name: "Trần Thị B", department: "hr", position: "Recruiter", email: "b.tran@nexlab.vn", leaveBalance: 8, nationalId: "079201005678", salary: 15000000, joinDate: "2023-06-01" },
  { id: "emp-003", name: "Lê Văn C", department: "finance", position: "Payroll Analyst", email: "c.le@nexlab.vn", leaveBalance: 15, nationalId: "079201009012", salary: 22000000, joinDate: "2022-01-10" },
  { id: "emp-004", name: "Phạm Thị D", department: "hr", position: "HR Business Partner", email: "d.pham@nexlab.vn", leaveBalance: 5, nationalId: "079201003456", salary: 25000000, joinDate: "2021-11-20" },
  { id: "emp-005", name: "Hoàng Văn E", department: "engineering", position: "Training Coordinator", email: "e.hoang@nexlab.vn", leaveBalance: 10, nationalId: "079201007890", salary: 16000000, joinDate: "2024-02-01" },
  { id: "emp-006", name: "Vũ Thị F", department: "engineering", position: "Frontend Developer", email: "f.vu@nexlab.vn", leaveBalance: 14, nationalId: "079201002345", salary: 28000000, joinDate: "2022-07-15" },
  { id: "emp-007", name: "Đỗ Văn G", department: "engineering", position: "Backend Developer", email: "g.do@nexlab.vn", leaveBalance: 7, nationalId: "079201006789", salary: 30000000, joinDate: "2021-05-01" },
  { id: "emp-008", name: "Bùi Thị H", department: "finance", position: "Accountant", email: "h.bui@nexlab.vn", leaveBalance: 11, nationalId: "079201000123", salary: 19000000, joinDate: "2023-09-01" },
  { id: "emp-009", name: "Ngô Văn I", department: "finance", position: "Financial Analyst", email: "i.ngo@nexlab.vn", leaveBalance: 9, nationalId: "079201004567", salary: 24000000, joinDate: "2022-04-10" },
  { id: "emp-010", name: "Lý Thị K", department: "engineering", position: "QA Engineer", email: "k.ly@nexlab.vn", leaveBalance: 13, nationalId: "079201008901", salary: 20000000, joinDate: "2023-01-15" },
];

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type?: "annual" | "sick" | "unpaid";
  startDate: string;
  endDate: string;
  days?: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: "lr-001", employeeId: "emp-001", employeeName: "Nguyễn Văn A", startDate: "2026-08-25", endDate: "2026-08-26", reason: "Việc gia đình", status: "pending", createdAt: "2026-08-18" },
  { id: "lr-002", employeeId: "emp-003", employeeName: "Lê Văn C", startDate: "2026-08-20", endDate: "2026-08-20", reason: "Khám sức khỏe", status: "pending", createdAt: "2026-08-17" },
  { id: "lr-003", employeeId: "emp-006", employeeName: "Vũ Thị F", startDate: "2026-09-01", endDate: "2026-09-03", reason: "Du lịch hè", status: "pending", createdAt: "2026-08-15" },
  { id: "lr-004", employeeId: "emp-007", employeeName: "Đỗ Văn G", startDate: "2026-08-22", endDate: "2026-08-22", reason: "Việc cá nhân", status: "pending", createdAt: "2026-08-19" },
  { id: "lr-005", employeeId: "emp-010", employeeName: "Lý Thị K", startDate: "2026-08-28", endDate: "2026-08-29", reason: "Đám cưới bạn", status: "pending", createdAt: "2026-08-16" },
  { id: "lr-006", employeeId: "emp-002", employeeName: "Trần Thị B", startDate: "2026-07-10", endDate: "2026-07-11", reason: "Nghỉ phép năm", status: "approved", createdAt: "2026-07-01" },
  { id: "lr-007", employeeId: "emp-004", employeeName: "Phạm Thị D", startDate: "2026-07-15", endDate: "2026-07-15", reason: "Khám bệnh", status: "approved", createdAt: "2026-07-10" },
  { id: "lr-008", employeeId: "emp-005", employeeName: "Hoàng Văn E", startDate: "2026-06-01", endDate: "2026-06-05", reason: "Về quê", status: "approved", createdAt: "2026-05-20" },
];

export const DEPARTMENTS = [
  { id: "hr", label: "Nhân sự" },
  { id: "engineering", label: "Kỹ thuật" },
  { id: "finance", label: "Tài chính" },
] as const;

export type DepartmentKey = "hr" | "engineering" | "finance";

export function getDepartmentLabel(dept: string): string {
  const found = DEPARTMENTS.find((d) => d.id === dept);
  return found ? found.label : dept;
}
