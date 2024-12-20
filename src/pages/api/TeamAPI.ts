import { ITeam } from "@/types/team";
import axios from "axios";

export const getTeamsByOrgId = async (orgId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/teams?orgId=${orgId}`);
};

export const getMembersFull = async (team: ITeam) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/teams/${
            JSON.stringify(team) !== "{}" ? team.id : 1
        }/membersFull`
    );
};

export const addMember = async (obj: { teamId: number; emailAddr: string; role: number }) => {
    let { teamId, emailAddr, role } = obj;
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/teams/${teamId}/member`, {
        emailAddr: emailAddr,
        role: role,
    });
};

export const addMemberById = async (obj: { teamId: number; userId: number; role: number }) => {
    let { teamId, userId, role } = obj;
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/teams/${teamId}/memberById`, {
        userId: userId,
        role: role,
    });
};

export const deleteMembers = async (obj: { teamId: number; userIds: number[] }) => {
    let { teamId, userIds } = obj;
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/teams/${teamId}/members`, {
        data: { userIds: userIds },
    });
};

export const updateMemberRole = async (obj: { teamId: number; userId: number; role: number }) => {
    let { teamId, userId, role } = obj;
    return await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/teams/${teamId}/memberRole`, {
        userId: userId,
        role: role,
    });
};
