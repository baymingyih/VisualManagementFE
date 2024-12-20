import { ITeam } from "@/types/team";
import axios from "axios";

export const getActions = async (team: ITeam | null) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/actions?teamId=${team !== null ? team.id : 1}`
    );
};

export const getActionSummary = async (team: ITeam | null) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/actions/summary?teamId=${team !== null ? team.id : 1}`
    );
};

export const createNewAction = async (obj: any) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/actions/`, obj);
};

export const updateAction = async (obj: any) => {
    let { actionId, ...body } = obj;
    return await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/actions/${obj.actionId}`, body);
};

export const updatePIC = async (obj: { actionId: number; userId: number }) => {
    return await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/actions/${obj.actionId}/updatePIC`,
        { userId: obj.userId }
    );
};

export const escalateAction = async (obj: { actionId: number; teamId: number }) => {
    return await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/actions/${obj.actionId}/escalate`,
        { teamId: obj.teamId }
    );
};

export const deleteAction = async (obj: { actionId: number }) => {
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/actions/${obj.actionId}`);
};

export const getMembers = async (team: ITeam) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/teams/${
            JSON.stringify(team) !== "{}" ? team.id : 1
        }/members`
    );
};

export const deleteMultipleActions = async (obj: { actionIds: number[] }) => {
    let { actionIds } = obj;
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/actions/`, {
        data: { actionIds: actionIds },
    });
};

export const completeMultipleActions = async (obj: { actionIds: number[] }) => {
    let { actionIds } = obj;
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/actions/complete`, {
        actionIds: actionIds,
    });
};
