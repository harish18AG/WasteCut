import prisma from '../config/database';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { UserRepository } from '../repositories/user.repository';
import { ReportRepository } from '../repositories/report.repository';

const feedbackRepository = new FeedbackRepository();
const userRepository = new UserRepository();
const reportRepository = new ReportRepository();

export class AdminService {
  async getAnalytics() {
    // 1. Core counters
    const activeDonors = await prisma.donorProfile.count();
    const activeNgos = await prisma.ngoProfile.count();
    const activeRecipients = await prisma.recipientProfile.count();
    
    const totalDonations = await prisma.donation.count();
    const completedPickups = await prisma.pickup.count({
      where: { status: 'COMPLETED' },
    });

    // 2. Compute Food Saved & Carbon Saved
    // Let's parse donation quantity (e.g. "10 kg", "15 servings") and track monthly aggregation
    const deliveredDonations = await prisma.donation.findMany({
      where: { status: 'DELIVERED' },
      select: { quantity: true, updatedAt: true },
    });

    let totalKgSaved = 0;
    const monthlyFoodSaved: { [key: string]: number } = {};

    for (const d of deliveredDonations) {
      let kg = 5; // default fallback if unparseable
      const match = d.quantity.match(/^(\d+(\.\d+)?)\s*(kg|kilograms?|servings?)?/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[3] ? match[3].toLowerCase() : 'kg';
        if (unit.startsWith('serving')) {
          kg = val * 0.4; // 1 serving is approx 0.4kg
        } else {
          kg = val;
        }
      }
      totalKgSaved += kg;

      const monthLabel = new Date(d.updatedAt).toLocaleString('default', { month: 'short' });
      monthlyFoodSaved[monthLabel] = (monthlyFoodSaved[monthLabel] || 0) + kg;
    }

    // 2.5 kg CO2 saved per kg of food waste avoided (source: FAO/EPA)
    const carbonFootprintSaved = parseFloat((totalKgSaved * 2.5).toFixed(2));
    const foodSavedKg = parseFloat(totalKgSaved.toFixed(1));

    // 3. User Growth
    const userGrowth = await prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const userGrowthMonthly: { [key: string]: number } = {};
    userGrowth.forEach((u) => {
      const date = new Date(u.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      userGrowthMonthly[month] = (userGrowthMonthly[month] || 0) + 1;
    });

    const userGrowthChart = Object.keys(userGrowthMonthly).map((key) => ({
      name: key,
      users: userGrowthMonthly[key],
    }));

    // 4. Daily / Monthly Donations
    const donationsData = await prisma.donation.findMany({
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyDonations: { [key: string]: number } = {};
    const monthlyDonations: { [key: string]: number } = {};
    
    donationsData.forEach((d) => {
      const dateObj = new Date(d.createdAt);
      const day = dateObj.toLocaleDateString();
      const month = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });

      dailyDonations[day] = (dailyDonations[day] || 0) + 1;
      monthlyDonations[month] = (monthlyDonations[month] || 0) + 1;
    });

    const dailyDonationsChart = Object.keys(dailyDonations).slice(-7).map((key) => ({
      name: key,
      donations: dailyDonations[key],
    }));

    const monthlyDonationsChart = Object.keys(monthlyDonations).map((key) => ({
      name: key,
      donations: monthlyDonations[key],
    }));

    // 5. Waste Reduction Rate
    const wasteReductionRate = totalDonations > 0 
      ? parseFloat(((completedPickups / totalDonations) * 100).toFixed(1))
      : 0;

    return {
      stats: {
        activeDonors,
        activeNgos,
        activeRecipients,
        totalDonations,
        completedPickups,
        foodSavedKg,
        carbonFootprintSaved,
        wasteReductionRate,
      },
      charts: {
        userGrowth: userGrowthChart,
        dailyDonations: dailyDonationsChart,
        monthlyDonations: monthlyDonationsChart,
        foodSavedTrend: (() => {
          const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentMonthIndex = new Date().getMonth();
          const last5Months = [];
          for (let i = 4; i >= 0; i--) {
            const idx = (currentMonthIndex - i + 12) % 12;
            last5Months.push(allMonths[idx]);
          }
          return last5Months.map((m) => ({
            name: m,
            saved: parseFloat((monthlyFoodSaved[m] || 0).toFixed(1)),
          }));
        })(),
      },
    };
  }

  // User Management
  async listUsers() {
    return userRepository.findAll();
  }

  async deleteUser(id: string) {
    return userRepository.delete(id);
  }

  // Feedback Management
  async submitFeedback(senderId: string, rating: number, comments: string) {
    return feedbackRepository.create({ senderId, rating, comments });
  }

  async listFeedback() {
    return feedbackRepository.findAll();
  }

  // Reports
  async listReports() {
    return reportRepository.findAll();
  }

  async getReport(id: string) {
    return reportRepository.findById(id);
  }

  async generateReport(adminId: string, title: string, description: string, reportType: string) {
    const analytics = await this.getAnalytics();
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      reportType,
      summary: {
        totalDonations: analytics.stats.totalDonations,
        completedPickups: analytics.stats.completedPickups,
        foodSavedKg: analytics.stats.foodSavedKg,
        carbonFootprintSaved: analytics.stats.carbonFootprintSaved,
        wasteReductionRate: analytics.stats.wasteReductionRate,
      },
      details: analytics,
    };

    return reportRepository.create({
      title,
      description,
      generatedById: adminId,
      reportType,
      dataJson: JSON.stringify(reportData),
    });
  }
}
