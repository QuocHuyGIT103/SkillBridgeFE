import axiosClient from "../../api/axiosClient";
import type {
  DashboardStats,
  UpcomingSession,
  RecentActivity,
} from "../../types/tutor.types";
import type { LearningClass } from "../../types/LearningClass";
import type { TutorReviewsResponse } from "../class.service";

// Response interfaces matching backend structure
interface ClassesResponse {
  success: boolean;
  data: LearningClass[]; // Backend returns 'data', not 'classes'
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface WeekScheduleSession {
  _id: string;
  class_id: string;
  session_number: number;
  scheduled_at: string;
  duration_minutes: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED";
  student_id: {
    _id: string;
    full_name: string;
    avatar_url?: string;
  };
  tutor_id: string;
  subject?: string;
  meeting_link?: string;
}

interface WeekScheduleResponse {
  sessions: WeekScheduleSession[];
  summary: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    missed: number;
  };
}

interface PaymentScheduleItem {
  _id: string;
  contract_id: string;
  learning_class_id: string;
  installments: Array<{
    installment_number: number;
    session_number: number;
    amount: number;
    due_date: string;
    status: "UNPAID" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
    paid_at?: string;
  }>;
}

interface PaymentSchedulesResponse {
  paymentSchedules: PaymentScheduleItem[];
}

interface NotificationCountResponse {
  unreadCount: number;
}

interface ConversationsResponse {
  conversations: Array<{
    _id: string;
    unreadCount?: number;
  }>;
}

interface DashboardOverviewData {
  stats: DashboardStats;
  upcomingSessions: UpcomingSession[];
  recentActivities: RecentActivity[];
}

const TutorDashboardService = {
  /**
   * Get aggregated dashboard statistics
   * Combines data from multiple endpoints
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Fetch critical data in parallel
      const [classesRes, reviewsRes, paymentSchedulesRes] =
        await Promise.allSettled([
          axiosClient.get<ClassesResponse>("/classes/tutor"),
          axiosClient.get<TutorReviewsResponse>("/classes/tutors/me/reviews", {
            params: { limit: 1 }, // Only need summary
          }),
          axiosClient.get<PaymentSchedulesResponse>(
            "/contracts/tutor/payment-schedules"
          ),
        ]);

      // Extract classes data (backend returns 'data' array directly)
      const classes: LearningClass[] =
        classesRes.status === "fulfilled" && classesRes.value.data
          ? classesRes.value.data.data || []
          : [];

      // Calculate total students (unique student_ids from all classes)
      const uniqueStudentIds = new Set(
        classes
          .filter((c) => c.studentId && c.studentId.id) // Filter out null/undefined
          .map((c) => c.studentId.id)
      );
      const totalStudents = uniqueStudentIds.size;

      // Calculate active lessons
      const activeLessons = classes.filter((c) => c.status === "ACTIVE").length;

      // Calculate completed lessons (sum of completed_sessions)
      const completedLessons = classes.reduce(
        (sum, c) => sum + (c.completedSessions || 0),
        0
      );

      // Extract reviews data
      let avgRating = 0;
      if (reviewsRes.status === "fulfilled" && reviewsRes.value.data?.summary) {
        avgRating = reviewsRes.value.data.summary.averageRating || 0;
      }

      // Calculate total earnings and pending payments from payment schedules
      // Apply 80/20 split: Tutor gets 80%, Platform gets 20%
      const TUTOR_SHARE = 0.8;
      let totalEarnings = 0;
      let pendingPayments = 0;

      if (
        paymentSchedulesRes.status === "fulfilled" &&
        paymentSchedulesRes.value.data?.paymentSchedules
      ) {
        paymentSchedulesRes.value.data.paymentSchedules.forEach((schedule) => {
          schedule.installments.forEach((installment) => {
            const grossAmount = installment.amount;
            const tutorAmount = grossAmount * TUTOR_SHARE;

            if (installment.status === "PAID") {
              totalEarnings += tutorAmount;
            } else if (
              installment.status === "UNPAID" ||
              installment.status === "OVERDUE"
            ) {
              pendingPayments += tutorAmount;
            }
          });
        });
      }

      // Upcoming sessions and new messages will be fetched separately
      // Return 0 here as placeholders
      return {
        total_students: totalStudents,
        active_lessons: activeLessons,
        completed_lessons: completedLessons,
        total_earnings: totalEarnings,
        pending_payments: pendingPayments,
        avg_rating: Number(avgRating.toFixed(1)),
        upcoming_sessions: 0, // Will be updated by getUpcomingSessions
        new_messages: 0, // Will be updated by getUnreadMessagesCount
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return empty stats on error
      return {
        total_students: 0,
        active_lessons: 0,
        completed_lessons: 0,
        total_earnings: 0,
        pending_payments: 0,
        avg_rating: 0,
        upcoming_sessions: 0,
        new_messages: 0,
      };
    }
  },

  /**
   * Get upcoming sessions for the week
   */
  getUpcomingSessions: async (
    limit: number = 5
  ): Promise<UpcomingSession[]> => {
    try {
      const response = await axiosClient.get<WeekScheduleResponse>(
        "/classes/schedule/week"
      );

      if (!response.data?.sessions) {
        return [];
      }

      // Filter only scheduled sessions in the future
      const now = new Date();
      const upcomingSessions = response.data.sessions
        .filter((session) => {
          const scheduledDate = new Date(session.scheduled_at);
          return session.status === "SCHEDULED" && scheduledDate > now;
        })
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime()
        )
        .slice(0, limit);

      // Transform to UpcomingSession format
      return upcomingSessions.map((session) => ({
        id: session._id,
        student_name: session.student_id?.full_name || "Unknown Student",
        student_avatar: session.student_id?.avatar_url,
        subject: session.subject || "General",
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: "confirmed", // Mapped from SCHEDULED
        meeting_link: session.meeting_link,
      }));
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      return [];
    }
  },

  /**
   * Get recent activities from multiple sources
   */
  getRecentActivities: async (limit: number = 5): Promise<RecentActivity[]> => {
    try {
      // Fetch data from multiple sources in parallel
      const [weekScheduleRes, classesRes] = await Promise.allSettled([
        axiosClient.get<WeekScheduleResponse>("/classes/schedule/week"),
        axiosClient.get<ClassesResponse>("/classes/tutor"),
      ]);

      const activities: RecentActivity[] = [];

      // Process completed sessions from schedule
      if (
        weekScheduleRes.status === "fulfilled" &&
        weekScheduleRes.value.data?.sessions
      ) {
        const completedSessions = weekScheduleRes.value.data.sessions
          .filter((session) => session.status === "COMPLETED")
          .sort(
            (a, b) =>
              new Date(b.scheduled_at).getTime() -
              new Date(a.scheduled_at).getTime()
          )
          .slice(0, 3);

        completedSessions.forEach((session) => {
          activities.push({
            id: session._id,
            type: "lesson_completed",
            title: "Bài học hoàn thành",
            description: `Bài học ${session.subject || "General"} với ${
              session.student_id?.full_name || "Unknown"
            }`,
            timestamp: session.scheduled_at,
            student_name: session.student_id?.full_name,
          });
        });
      }

      // Process new students (recent classes)
      if (classesRes.status === "fulfilled" && classesRes.value.data?.data) {
        const recentClasses = classesRes.value.data.data
          .filter((c: LearningClass) => c.status === "ACTIVE")
          .sort(
            (a: LearningClass, b: LearningClass) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        recentClasses.forEach((classItem: LearningClass) => {
          const daysOld = Math.floor(
            (Date.now() - new Date(classItem.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (daysOld <= 7) {
            // Only show classes from last 7 days
            activities.push({
              id: `new-student-${classItem._id}`,
              type: "new_student",
              title: "Học sinh mới",
              description: `${
                classItem.studentId.full_name || "Học sinh"
              } đã tham gia lớp ${classItem.subject.name || "học"}`,
              timestamp: classItem.createdAt,
              student_name: classItem.studentId.full_name,
            });
          }
        });
      }

      // Sort all activities by timestamp (most recent first)
      activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return activities.slice(0, limit);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return [];
    }
  },

  /**
   * Get unread messages count
   */
  getUnreadMessagesCount: async (): Promise<number> => {
    try {
      // Try to get from notifications first
      const notifResponse = await axiosClient.get<NotificationCountResponse>(
        "/notifications/unread-count"
      );

      if (notifResponse.data?.unreadCount !== undefined) {
        return notifResponse.data.unreadCount;
      }

      // Fallback: count from conversations
      const convResponse = await axiosClient.get<ConversationsResponse>(
        "/messages/conversations"
      );

      if (convResponse.data?.conversations) {
        const totalUnread = convResponse.data.conversations.reduce(
          (sum, conv) => sum + (conv.unreadCount || 0),
          0
        );
        return totalUnread;
      }

      return 0;
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      return 0;
    }
  },

  /**
   * Get all dashboard data in one call (aggregated)
   * This is the main method to call from the component
   */
  getDashboardOverview: async (): Promise<DashboardOverviewData> => {
    try {
      // Fetch main stats first (most important data)
      const stats = await TutorDashboardService.getDashboardStats();

      // Fetch additional data in parallel
      const [upcomingSessions, messagesCount] = await Promise.allSettled([
        TutorDashboardService.getUpcomingSessions(5),
        TutorDashboardService.getUnreadMessagesCount(),
      ]);

      // Update stats with fetched data
      stats.upcoming_sessions =
        upcomingSessions.status === "fulfilled"
          ? upcomingSessions.value.length
          : 0;
      stats.new_messages =
        messagesCount.status === "fulfilled" ? messagesCount.value : 0;

      return {
        stats,
        upcomingSessions:
          upcomingSessions.status === "fulfilled" ? upcomingSessions.value : [],
        recentActivities: [], // Will be loaded separately in background
      };
    } catch (error: any) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },

  /**
   * Separate method to load recent activities (call only when needed)
   * This can be called after main data loads to avoid blocking
   */
  getRecentActivitiesOnly: async (): Promise<RecentActivity[]> => {
    return await TutorDashboardService.getRecentActivities(5);
  },
};

export default TutorDashboardService;
