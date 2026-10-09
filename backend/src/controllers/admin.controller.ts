import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const adminService = new AdminService();

export class AdminController {
  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await adminService.getAnalytics();
      return res.status(200).json(analytics);
    } catch (error) {
      return next(error);
    }
  }

  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await adminService.listUsers();
      // Remove password hash from response
      const sanitized = users.map((u) => {
        const copy = { ...u };
        delete (copy as any).passwordHash;
        return copy;
      });
      return res.status(200).json(sanitized);
    } catch (error) {
      return next(error);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return next(error);
    }
  }

  async submitFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const senderId = req.user?.id;
      if (!senderId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { rating, comments } = req.body;
      const feedback = await adminService.submitFeedback(senderId, rating, comments);
      return res.status(201).json(feedback);
    } catch (error) {
      return next(error);
    }
  }

  async listFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const feedback = await adminService.listFeedback();
      return res.status(200).json(feedback);
    } catch (error) {
      return next(error);
    }
  }

  async listReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reports = await adminService.listReports();
      return res.status(200).json(reports);
    } catch (error) {
      return next(error);
    }
  }

  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { title, description, reportType } = req.body;
      const report = await adminService.generateReport(adminId, title, description, reportType);
      return res.status(201).json(report);
    } catch (error) {
      return next(error);
    }
  }

  async getReportById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const report = await adminService.getReport(id);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      return res.status(200).json(report);
    } catch (error) {
      return next(error);
    }
  }
}
