import { ICreateProject, IFullProject } from "@/types/project";
import { ITeam } from "@/types/team";
import axios from "axios";

export const getProjects = async (team: ITeam | null) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/projects?teamId=${team !== null ? team.id : 1}`
    );
};

export const getProjectById = async (projectId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}`);
};

export const updateProject = async (obj: any) => {
    let { projectId, ...body } = obj;
    return await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${obj.projectId}`, body);
};

export const getProjectMembers = async (projectId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/members`);
};

export const addProjectMember = async (obj: { projectId: number; userId: number }) => {
    let { projectId, userId } = obj;
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/members`, {
        userId,
    });
};

export const deleteProjectMember = async (obj: { projectId: number; userId: number }) => {
    let { projectId, userId } = obj;
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/members`, {
        data: { userId: userId },
    });
};

export const getProjectActions = async (projectId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/actions`);
};

export const getActionSummary = async (team: ITeam) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/actions/summary?teamId=${
            JSON.stringify(team) !== "{}" ? team.id : 1
        }`
    );
};

export const addProjectAction = async (obj: { projectId: number; actionId: number }) => {
    let { projectId, actionId } = obj;
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/actions`, {
        actionId,
    });
};

export const deleteProjectAction = async (obj: { projectId: number; actionId: number }) => {
    let { projectId, actionId } = obj;
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/actions`, {
        data: { actionId: actionId },
    });
};

export const getProjectMetrics = async (projectId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/metrics`);
};

export const addProjectMetric = async (obj: { projectId: number; metricId: number }) => {
    let { projectId, metricId } = obj;
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/metrics`, {
        metricId,
    });
};

export const deleteProjectMetric = async (obj: { projectId: number; metricId: number }) => {
    let { projectId, metricId } = obj;
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}/metrics`, {
        data: { metricId: metricId },
    });
};

export const getMetricSummary = async (team: ITeam) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/metrics/summary?teamId=${
            JSON.stringify(team) !== "{}" ? team.id : 1
        }`
    );
};

export const createProject = async (project: ICreateProject) => {
    return await axios.post<IFullProject>(`${process.env.NEXT_PUBLIC_BASE_URL}/projects`, project);
};

export const deleteProject = async (projectId: number) => {
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}`);
};
