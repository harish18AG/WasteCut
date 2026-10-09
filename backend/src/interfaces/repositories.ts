import { User, Donation, Request, Pickup, Feedback, Report, AvailabilityStatus, RequestStatus, PickupStatus } from '@prisma/client';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: any): Promise<User>;
  update(id: string, data: any): Promise<User>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<boolean>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}

export interface IDonationRepository {
  findById(id: string): Promise<Donation | null>;
  create(data: any): Promise<Donation>;
  update(id: string, data: any): Promise<Donation>;
  findAll(filters: {
    category?: string;
    status?: AvailabilityStatus;
    latitude?: number;
    longitude?: number;
    distance?: number;
    search?: string;
  }): Promise<any[]>;
  delete(id: string): Promise<boolean>;
}

export interface IRequestRepository {
  findById(id: string): Promise<Request | null>;
  create(data: any): Promise<Request>;
  updateStatus(id: string, status: RequestStatus): Promise<Request>;
  findAll(filters: {
    recipientId?: string;
    donationId?: string;
    status?: RequestStatus;
  }): Promise<any[]>;
}

export interface IPickupRepository {
  findById(id: string): Promise<Pickup | null>;
  create(data: any): Promise<Pickup>;
  updateStatus(id: string, status: PickupStatus, deliveryConfirm?: string): Promise<Pickup>;
  findAll(filters: {
    ngoId?: string;
    status?: PickupStatus;
  }): Promise<any[]>;
}

export interface IFeedbackRepository {
  create(data: any): Promise<Feedback>;
  findAll(): Promise<any[]>;
}

export interface IReportRepository {
  create(data: any): Promise<Report>;
  findAll(): Promise<Report[]>;
  findById(id: string): Promise<Report | null>;
}
