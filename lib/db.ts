import { INITIAL_EMPLOYEES, INITIAL_LEAVE_REQUESTS, type Employee, type LeaveRequest } from "./seed";

// Biến lưu trữ in-memory của process serverless
let employees: Employee[] = JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));
let leaveRequests: LeaveRequest[] = JSON.parse(JSON.stringify(INITIAL_LEAVE_REQUESTS));

export const db = {
  // Employee CRUD
  getEmployees: (dept?: string, query?: string): Employee[] => {
    return employees.filter((emp) => {
      const matchDept = !dept || dept === "all" || emp.department === dept;
      const q = query ? query.toLowerCase().trim() : "";
      const matchQ =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q);
      return matchDept && matchQ;
    });
  },

  getEmployeeById: (id: string): Employee | undefined => {
    return employees.find((e) => e.id === id);
  },

  createEmployee: (data: Omit<Employee, "id" | "joinDate">): Employee => {
    // Generate next id like emp-011
    const nextNum = employees.length > 0
      ? Math.max(...employees.map((e) => parseInt(e.id.replace("emp-", ""), 10) || 0)) + 1
      : 1;
    const newEmp: Employee = {
      ...data,
      id: `emp-${String(nextNum).padStart(3, "0")}`,
      joinDate: new Date().toISOString().split("T")[0],
    };
    employees.unshift(newEmp);
    return newEmp;
  },

  updateEmployee: (id: string, updates: Partial<Employee>): Employee | null => {
    const idx = employees.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    employees[idx] = { ...employees[idx], ...updates };
    return employees[idx];
  },

  deleteEmployee: (id: string): boolean => {
    const idx = employees.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    employees.splice(idx, 1);
    return true;
  },

  // LeaveRequest CRUD
  getLeaveRequests: (status?: string): LeaveRequest[] => {
    return leaveRequests.filter((lr) => !status || status === "all" || lr.status === status);
  },

  getLeaveRequestById: (id: string): LeaveRequest | undefined => {
    return leaveRequests.find((r) => r.id === id);
  },

  createLeaveRequest: (data: Omit<LeaveRequest, "id" | "createdAt" | "status">): LeaveRequest => {
    const nextNum = leaveRequests.length > 0
      ? Math.max(...leaveRequests.map((r) => parseInt(r.id.replace("lr-", ""), 10) || 0)) + 1
      : 1;
    const newReq: LeaveRequest = {
      ...data,
      id: `lr-${String(nextNum).padStart(3, "0")}`,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    leaveRequests.unshift(newReq);
    return newReq;
  },

  updateLeaveRequestStatus: (id: string, status: "approved" | "rejected"): LeaveRequest | null => {
    const req = leaveRequests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    return req;
  },

  // Reset database
  reset: () => {
    employees = JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));
    leaveRequests = JSON.parse(JSON.stringify(INITIAL_LEAVE_REQUESTS));
    return { ok: true, employeeCount: employees.length, leaveCount: leaveRequests.length };
  },
};
