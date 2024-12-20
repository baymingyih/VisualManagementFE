import axios from "axios";

// Orgs

export const getOrgById = async (orgId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/org/${String(orgId)}`);
};

export const updateOrg = async (obj: { orgId: number; name: string }) => {
    return await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/org/${String(obj.orgId)}`, {
        name: obj.name,
    });
};

// Users

export const getUsersByOrg = async (orgId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/users?orgId=${String(orgId)}`);
};

export const getUserTeams = async (userId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${String(userId)}/teams`);
};

export const createUser = async (obj: {
    firstName: string;
    lastName: string;
    email: string;
    organisationId: number;
    orgAdmin: number;
    external: number;
}) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, obj);
};

export const inactivateMultipleUsers = async (obj: { userIds: string }) => {
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/inactivate?userIds=${String(obj.userIds)}`
    );
};

export const updateUser = async (obj: {
    userId: number;
    firstName?: string;
    lastName?: string;
    orgAdmin?: number;
}) => {
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/${String(obj.userId)}`,
        obj
    );
};

export const addMultipleUserTeams = async (obj: {
    userId: number;
    teamUserObjs: Array<{ teamId: number; role: number }>;
}) => {
    return await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/${String(obj.userId)}/teams`,
        obj
    );
};

export const deleteMultipleUserTeams = async (obj: { userId: number; teamIds: number[] }) => {
    return await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/${String(obj.userId)}/teams`,
        { data: { teamIds: obj.teamIds } }
    );
};

export const eraseMultipleUsers = async (obj: { userIds: number[] }) => {
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/users/`, {
        data: { userIds: obj.userIds },
    });
};

// Teams

export const getTeamsFullByOrg = async (orgId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/teams/Full?orgId=${String(orgId)}`);
};

export const createTeam = async (obj: {
    name: string;
    orgId: number;
    tier: number;
    reportsTo?: number;
}) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/teams/`, obj);
};

export const deleteMultipleTeams = async (obj: { teamIds: number[] }) => {
    return await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/teams/`, {
        data: { teamIds: obj.teamIds },
    });
};

export const updateTeamName = async (obj: { teamId: number; name: string }) => {
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/teams/${String(obj.teamId)}/name`,
        obj
    );
};

export const updateTeamTier = async (obj: {
    teamId: number;
    tier: number;
    reportsTo: number | null;
    oldReportsTo?: number;
}) => {
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/teams/${String(obj.teamId)}/tier`,
        obj
    );
};

export const addMultipleUsers = async (obj: {
    teamId: number;
    teamUserObjs: Array<{ userId: number; role: number }>;
}) => {
    return await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/teams/${String(obj.teamId)}/members`,
        obj
    );
};
