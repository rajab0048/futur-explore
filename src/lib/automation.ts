/**
 * Email automation system for lifecycle events
 * Handles timing and conditions for sending automated emails
 */

import { emailService } from './email';

export interface User {
  id: string;
  email: string;
  parentName: string;
  childProfiles: ChildProfile[];
  createdAt: Date;
  lastActivity?: Date;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  learningLevel: string;
  lessonsCompleted: number;
  achievements: string[];
  weeklyMinutes: number;
  currentMission: string;
  lastLessonDate?: Date;
}

export interface AutomationState {
  welcomeSent: boolean;
  profileReminderSent: boolean;
  firstMissionReminderSent: boolean;
  lastWeeklySummarySent?: Date;
}

// In-memory storage for demo - replace with your database
const userStore = new Map<string, { user: User; automation: AutomationState }>();

export const automationService = {
  // Register new user and trigger welcome email
  registerUser: async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const user: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    const automationState: AutomationState = {
      welcomeSent: false,
      profileReminderSent: false,
      firstMissionReminderSent: false
    };

    userStore.set(user.id, { user, automation: automationState });

    // Send welcome email immediately
    const childNames = userData.childProfiles.map(child => child.name);
    await emailService.sendWelcome(userData.email, userData.parentName, childNames);
    
    automationState.welcomeSent = true;

    return user;
  },

  // Update child profiles and check if profile completion reminder is needed
  updateChildProfiles: async (userId: string, childProfiles: ChildProfile[]) => {
    const stored = userStore.get(userId);
    if (!stored) return;

    stored.user.childProfiles = childProfiles;
    stored.user.lastActivity = new Date();

    // If profiles are still empty after 24 hours, send reminder
    if (childProfiles.length === 0 && !stored.automation.profileReminderSent) {
      const hoursSinceCreation = (Date.now() - stored.user.createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation >= 24) {
        await emailService.sendCompleteProfileReminder(
          stored.user.email,
          stored.user.parentName
        );
        stored.automation.profileReminderSent = true;
      }
    }
  },

  // Track lesson activity and send first mission reminder if needed
  trackLessonActivity: async (userId: string, childId: string, hasStartedLesson: boolean) => {
    const stored = userStore.get(userId);
    if (!stored) return;

    stored.user.lastActivity = new Date();

    // Update child's last lesson date
    const child = stored.user.childProfiles.find(c => c.id === childId);
    if (child) {
      child.lastLessonDate = new Date();
    }

    // If no lessons started after 48 hours, send reminder
    if (!hasStartedLesson && !stored.automation.firstMissionReminderSent) {
      const hoursSinceCreation = (Date.now() - stored.user.createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation >= 48) {
        const childNames = stored.user.childProfiles.map(child => child.name);
        await emailService.sendFirstMissionReminder(
          stored.user.email,
          stored.user.parentName,
          childNames
        );
        stored.automation.firstMissionReminderSent = true;
      }
    }
  },

  // Update lesson completion data
  updateLessonProgress: async (userId: string, childId: string, progress: {
    lessonsCompleted: number;
    achievements: string[];
    weeklyMinutes: number;
    currentMission: string;
  }) => {
    const stored = userStore.get(userId);
    if (!stored) return;

    stored.user.lastActivity = new Date();

    const child = stored.user.childProfiles.find(c => c.id === childId);
    if (child) {
      child.lessonsCompleted = progress.lessonsCompleted;
      child.achievements = progress.achievements;
      child.weeklyMinutes = progress.weeklyMinutes;
      child.currentMission = progress.currentMission;
    }
  },

  // Send weekly summary emails (should be called by a cron job or scheduler)
  sendWeeklySummaries: async () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const [userId, { user, automation }] of userStore.entries()) {
      // Check if it's time to send weekly summary
      const lastSent = automation.lastWeeklySummarySent;
      const shouldSend = !lastSent || (now.getTime() - lastSent.getTime()) >= 7 * 24 * 60 * 60 * 1000;

      if (shouldSend && user.childProfiles.length > 0) {
        // Send weekly summary for each child
        for (const child of user.childProfiles) {
          await emailService.sendWeeklySummary(
            user.email,
            user.parentName,
            child.name,
            child.lessonsCompleted,
            child.achievements,
            child.weeklyMinutes,
            child.currentMission
          );
        }

        automation.lastWeeklySummarySent = now;
      }
    }
  },

  // Get user data for testing/debugging
  getUser: (userId: string) => {
    return userStore.get(userId);
  },

  // Get all users for admin purposes
  getAllUsers: () => {
    return Array.from(userStore.entries()).map(([id, data]) => ({ id, ...data }));
  },

  // Helper function to check profile completion reminder
  checkProfileCompletionReminder: async (userId: string) => {
    const stored = userStore.get(userId);
    if (!stored || stored.automation.profileReminderSent) return;

    const hoursSinceCreation = (Date.now() - stored.user.createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation >= 24 && stored.user.childProfiles.length === 0) {
      await emailService.sendCompleteProfileReminder(
        stored.user.email,
        stored.user.parentName
      );
      stored.automation.profileReminderSent = true;
    }
  },

  // Helper function to check first mission reminder
  checkFirstMissionReminder: async (userId: string) => {
    const stored = userStore.get(userId);
    if (!stored || stored.automation.firstMissionReminderSent) return;

    const hoursSinceCreation = (Date.now() - stored.user.createdAt.getTime()) / (1000 * 60 * 60);
    const hasLessonActivity = stored.user.childProfiles.some(child => child.lastLessonDate);
    
    if (hoursSinceCreation >= 48 && !hasLessonActivity) {
      const childNames = stored.user.childProfiles.map(child => child.name);
      await emailService.sendFirstMissionReminder(
        stored.user.email,
        stored.user.parentName,
        childNames
      );
      stored.automation.firstMissionReminderSent = true;
    }
  }
};

// Helper functions for integration with existing components
export const triggerWelcomeEmail = async (email: string, parentName: string, childNames: string[]) => {
  return await emailService.sendWelcome(email, parentName, childNames);
};

export const checkProfileCompletionReminder = async (userId: string) => {
  const stored = userStore.get(userId);
  if (!stored || stored.automation.profileReminderSent) return;

  const hoursSinceCreation = (Date.now() - stored.user.createdAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceCreation >= 24 && stored.user.childProfiles.length === 0) {
    await emailService.sendCompleteProfileReminder(
      stored.user.email,
      stored.user.parentName
    );
    stored.automation.profileReminderSent = true;
  }
};

export const checkFirstMissionReminder = async (userId: string) => {
  const stored = userStore.get(userId);
  if (!stored || stored.automation.firstMissionReminderSent) return;

  const hoursSinceCreation = (Date.now() - stored.user.createdAt.getTime()) / (1000 * 60 * 60);
  const hasLessonActivity = stored.user.childProfiles.some(child => child.lastLessonDate);
  
  if (hoursSinceCreation >= 48 && !hasLessonActivity) {
    const childNames = stored.user.childProfiles.map(child => child.name);
    await emailService.sendFirstMissionReminder(
      stored.user.email,
      stored.user.parentName,
      childNames
    );
    stored.automation.firstMissionReminderSent = true;
  }
};

export const triggerWeeklySummary = async (userId: string, childId: string) => {
  const stored = userStore.get(userId);
  if (!stored) return;

  const child = stored.user.childProfiles.find(c => c.id === childId);
  if (!child) return;

  await emailService.sendWeeklySummary(
    stored.user.email,
    stored.user.parentName,
    child.name,
    child.lessonsCompleted,
    child.achievements,
    child.weeklyMinutes,
    child.currentMission
  );
};
