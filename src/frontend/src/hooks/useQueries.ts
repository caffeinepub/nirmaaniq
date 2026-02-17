import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  UserProfile, 
  Project, 
  DailyLogEntry, 
  PlannedTarget, 
  DashboardMetrics,
  Interruption,
  ProjectType,
  StandardizedRole
} from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      location: string;
      projectType: ProjectType;
      startDate: bigint;
      plannedCompletionDate: bigint;
      plannedWorkingHoursPerDay: number;
      workingDaysPerWeek: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(
        data.name,
        data.location,
        data.projectType,
        data.startDate,
        data.plannedCompletionDate,
        data.plannedWorkingHoursPerDay,
        data.workingDaysPerWeek
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAssignUserToProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { projectId: bigint; user: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.assignUserToProject(data.projectId, data.user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: { user: Principal; role: StandardizedRole }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.assignRole(data.user, data.role);
    },
  });
}

export function useSubmitDailyLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: bigint;
      activityName: string;
      plannedQuantity: number;
      actualQuantity: number;
      unit: string;
      laborers: bigint;
      supervisors: bigint;
      startTime: string;
      endTime: string;
      totalWorkingHours: number;
      interruptions: Interruption[];
      photoIds: string[];
      remarks: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitDailyLog(
        data.projectId,
        data.activityName,
        data.plannedQuantity,
        data.actualQuantity,
        data.unit,
        data.laborers,
        data.supervisors,
        data.startTime,
        data.endTime,
        data.totalWorkingHours,
        data.interruptions,
        data.photoIds,
        data.remarks
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

export function useGetDailyLogsByProject(projectId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyLogEntry[]>({
    queryKey: ['dailyLogs', projectId?.toString()],
    queryFn: async () => {
      if (!actor || !projectId) return [];
      return actor.getDailyLogsByProject(projectId);
    },
    enabled: !!actor && !isFetching && !!projectId,
  });
}

export function useSetPlannedTargets() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { projectId: bigint; targets: PlannedTarget[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setPlannedTargets(data.projectId, data.targets);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plannedTargets', variables.projectId.toString()] });
    },
  });
}

export function useGetPlannedTargets(projectId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PlannedTarget[]>({
    queryKey: ['plannedTargets', projectId?.toString()],
    queryFn: async () => {
      if (!actor || !projectId) return [];
      return actor.getPlannedTargets(projectId);
    },
    enabled: !!actor && !isFetching && !!projectId,
  });
}

export function useGetDashboardMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}
