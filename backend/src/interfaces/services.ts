import { PickupStatus } from '@prisma/client';

export interface IAuthService {
  register(data: any): Promise<any>;
  login(credentials: any): Promise<any>;
  getProfile(userId: string): Promise<any>;
}

export interface IDonationService {
  createDonation(donorId: string, data: any): Promise<any>;
  getDonation(id: string): Promise<any>;
  listDonations(filters: any): Promise<any[]>;
  updateDonation(id: string, donorId: string, data: any): Promise<any>;
  deleteDonation(id: string, donorId: string): Promise<boolean>;
}

export interface IRequestService {
  createRequest(recipientId: string, data: any): Promise<any>;
  listRequests(filters: any): Promise<any[]>;
  updateRequestStatus(id: string, donorUserId: string, status: 'APPROVED' | 'REJECTED'): Promise<any>;
}

export interface IPickupService {
  schedulePickup(ngoId: string, data: any): Promise<any>;
  listPickups(filters: any): Promise<any[]>;
  getPickup(id: string): Promise<any>;
  updatePickupStatus(id: string, ngoUserId: string, status: PickupStatus, deliveryConfirm?: string): Promise<any>;
}

export interface IAdminService {
  getAnalytics(): Promise<any>;
  listUsers(): Promise<any[]>;
  deleteUser(id: string): Promise<boolean>;
  submitFeedback(senderId: string, rating: number, comments: string): Promise<any>;
  listFeedback(): Promise<any[]>;
  listReports(): Promise<any[]>;
  getReport(id: string): Promise<any>;
  generateReport(adminId: string, title: string, description: string, reportType: string): Promise<any>;
}
