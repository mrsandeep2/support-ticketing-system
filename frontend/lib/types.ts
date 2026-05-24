export type Role = "USER" | "AGENT" | "ADMIN";
export type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface UserSummary { id: number; name: string; email: string; role: Role; }
export interface AuthUser extends UserSummary {}
export interface Comment { id: number; body: string; author: UserSummary; createdAt: string; }
export interface Attachment { id: number; filename: string; contentType?: string; size?: number; createdAt: string; uploader: UserSummary; }
export interface Rating { stars: number; feedback?: string; createdAt: string; }
export interface Ticket {
  id: number; subject: string; description: string;
  status: Status; priority: Priority;
  owner: UserSummary; assignee?: UserSummary | null;
  createdAt: string; updatedAt: string; resolvedAt?: string | null;
  comments: Comment[]; attachments: Attachment[]; rating?: Rating | null;
}
export interface TicketListItem {
  id: number; subject: string;
  status: Status; priority: Priority;
  owner: UserSummary; assignee?: UserSummary | null;
  createdAt: string; updatedAt: string;
}
