export type GrievanceCategory = "MISCONDUCT" | "FRAUD" | "TECHNICAL" | "HARASSMENT" | "OTHER";
export type GrievanceStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";

export interface Grievance {
  id: string;
  voterId: string;
  voterName: string;
  constituencyId: string;
  constituencyName: string;
  category: GrievanceCategory;
  description: string;
  status: GrievanceStatus;
  adminResponse?: string;
  createdAt: string;
}

export interface NewGrievanceInput {
  category: GrievanceCategory;
  description: string;
}
