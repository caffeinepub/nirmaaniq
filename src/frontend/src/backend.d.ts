import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface WeeklyLog {
    id: bigint;
    status: string;
    content: string;
}
export interface Comment {
    id: bigint;
    status: string;
    content: string;
}
export interface Interruption {
    startTime: TimeOfDay;
    duration: number;
    endTime: TimeOfDay;
    reason: string;
}
export interface DailyLogEntry {
    id: bigint;
    startTime: TimeOfDay;
    activityName: string;
    supervisors: bigint;
    totalPauseDuration: number;
    plannedQuantity: number;
    endTime: TimeOfDay;
    date: Timestamp;
    laborers: bigint;
    unit: string;
    submittedAt: Timestamp;
    submittedBy: Principal;
    interruptions: Array<Interruption>;
    photoIds: Array<string>;
    projectId: bigint;
    totalWorkingHours: number;
    netWorkingHours: number;
    actualQuantity: number;
    remarks: string;
}
export interface WeeklySummary {
    delayRisks: Array<string>;
    plannedQuantity: number;
    achievedProductivity: number;
    plannedProductivity: number;
    projectId: bigint;
    achievedQuantity: number;
    delayInstances: Array<DelayInstance>;
}
export interface DelayInstance {
    duration: bigint;
    timestamp: Timestamp;
    reason: string;
}
export type TimeOfDay = string;
export interface PlannedTarget {
    activityName: string;
    endDate: Timestamp;
    plannedDailyQuantity: number;
    unit: string;
    startDate: Timestamp;
}
export interface DashboardMetrics {
    totalProjects: bigint;
    overallProgress: number;
    totalInterruptionsThisWeek: bigint;
    logStatus: {
        pending: bigint;
        completed: boolean;
    };
    totalWorkingDays: bigint;
}
export interface Project {
    id: bigint;
    status: string;
    plannedWorkingHoursPerDay: number;
    projectType: ProjectType;
    owner: Principal;
    name: string;
    createdAt: Timestamp;
    workingDaysPerWeek: bigint;
    plannedCompletionDate: Timestamp;
    weeklyLogs: Array<WeeklyLog>;
    comments: Array<Comment>;
    assignedUsers: Array<Principal>;
    location: string;
    startDate: Timestamp;
}
export interface UserProfile {
    assignedProject?: bigint;
    designation: string;
    role: StandardizedRole;
    fullName: string;
    companyName: string;
    phone: string;
}
export enum ProjectType {
    commercial = "commercial",
    infrastructure = "infrastructure",
    residential = "residential",
    industrial = "industrial"
}
export enum StandardizedRole {
    admin = "admin",
    site_engineer = "site_engineer",
    project_manager = "project_manager"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRole(user: Principal, role: StandardizedRole): Promise<void>;
    assignUserToProject(projectId: bigint, user: Principal): Promise<void>;
    calculateDelay(arg0: bigint): Promise<Array<[bigint, bigint]>>;
    createProject(name: string, location: string, projectType: ProjectType, startDate: Timestamp, plannedCompletionDate: Timestamp, plannedWorkingHoursPerDay: number, workingDaysPerWeek: bigint): Promise<bigint>;
    getAchievements(): Promise<Array<string>>;
    getAllProjects(): Promise<Array<Project>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChallenges(arg0: string): Promise<Array<string>>;
    getDailyLogsByProject(projectId: bigint): Promise<Array<DailyLogEntry>>;
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getEfficiency(arg0: string): Promise<Array<string>>;
    getInterval(): Promise<string>;
    getPlannedTargets(projectId: bigint): Promise<Array<PlannedTarget>>;
    getProject(id: bigint): Promise<Project>;
    getTasks(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<StandardizedRole>;
    getWeeklySummary(projectId: bigint): Promise<WeeklySummary>;
    getWorkforceData(): Promise<Array<string>>;
    initializeAccessControl(adminToken: string, userProvidedToken: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isUserRole(user: Principal, role: StandardizedRole): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPlannedTargets(projectId: bigint, targets: Array<PlannedTarget>): Promise<void>;
    submitDailyLog(projectId: bigint, activityName: string, plannedQuantity: number, actualQuantity: number, unit: string, laborers: bigint, supervisors: bigint, startTime: TimeOfDay, endTime: TimeOfDay, totalWorkingHours: number, interruptions: Array<Interruption>, photoIds: Array<string>, remarks: string): Promise<bigint>;
}
