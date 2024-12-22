import { PrismaClient as PrismaClientMain } from "../prisma/generated/client_main";
import { Request, Response } from "express"
const prisma = new PrismaClientMain();

const avatarColors = ["#E9D985", "#B2BD7E", "#749C75", "#6A5D7B", "#5D4A66"]

export async function getUsersByOrg(req: Request, res: Response) {
    try {
        const orgId = parseInt(req.query.orgId as string);

        const users = await prisma.users.findMany({
            where: {
                organisationId: orgId
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                active: true,
                updated_at: true,
                lastActive: true,
                orgAdmin: true,
                external: true
            },
            orderBy: {
                firstName: 'asc'
            }
        })
        const output = users.map((user) => {
            const t = {
                key: user.id,
                ...user,
                avatar_color: 
                    avatarColors[user.firstName[0].charCodeAt(0)%5],
            }
            return t
          });
        res.status(200).json(output);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function getUserTeams(req: Request, res:Response) {
    try {
        const userId = parseInt(req.params.userId);

        const teams = await prisma.team_members.findMany({
            where: {
                userId: userId
            },
            select: {
                role: true,
                teamId: true,
                teams: {
                    select: {
                        name: true,
                        tier: true
                    }
                }
            }
        })
        const output = teams.map((team) => {
            const t = {
                key: team.teamId,
                teamId: team.teamId,
                teamName: team.teams.name,
                tier: team.teams.tier,
                role: team.role
            }
            return t
          });
        return res.status(200).json(output)
    } catch (err) {
        console.log("error:", err);
        return res.status(500).send(err)
    }
}

export async function createUser(req: Request, res:Response) {
    try {
        const { firstName, lastName, email, organisationId, orgAdmin, external } : { firstName: string, lastName: string, email: string, organisationId: number, orgAdmin: number, external: number } = req.body;

        const user = await prisma.users.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                organisationId: organisationId,
                orgAdmin: orgAdmin,
                active: 1,
                lastActive: new Date(),
                external: external
            }
        })
        let {created_at: _, ...rest} = user;
        const output = {
            key: user.id,
            ...rest,
            avatar_color: 
                avatarColors[user.firstName[0].charCodeAt(0)%5],
        }
        return res.status(200).json(output)
    } catch (err) {
        console.log("error:", err);
        return res.status(500).send(err)
    }
}

export async function inactivateMultipleUsers(req: Request, res:Response) {
    try {
        const userIds = (req.query.userIds as string).split(",").map(Number);

        await prisma.users.updateMany({
            where: {
                id: {
                    in: userIds
                },
            }, 
            data: {
                active: 0
            }
        });
        return res.status(200).json(userIds)
    } catch (err) {
        console.log("error:", err);
        return res.status(500).send(err)
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.userId);
        const { firstName, lastName, orgAdmin } : { firstName: string, lastName: string, orgAdmin: number } = req.body;

        const user = await prisma.users.update({
            where: {
                id: userId
            },
            data: {
                firstName: firstName,
                lastName: lastName,
                orgAdmin: orgAdmin
            }
        })
        let {created_at: _, ...rest} = user;
        const output = {
            key: user.id,
            ...rest,
            avatar_color: 
                avatarColors[user.firstName[0].charCodeAt(0)%5],
        }
        return res.status(200).json(output)
    } catch (err) {
        console.log("error:", err);
        return res.status(500).send(err)
    }
}

export async function addMultipleTeams(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.userId);
        const {teamUserObjs} : {teamUserObjs:Array<{teamId: number, role: number}>} = req.body;

        const user_record = await prisma.users.findMany({
            where: {
                id: userId
            }
        })
        if (user_record.length === 0) {
            res.status(400).send("User does not exist")
            return
        }

        const team_records = await prisma.teams.findMany({
            where: {
                id: {
                    in: teamUserObjs.map((teamUserObj) => {
                        return teamUserObj.teamId
                    })
                },
            }
        })
        if (team_records.length !== teamUserObjs.length) {
            res.status(400).send("One or more teams does not exist")
            return
        }

        const team_user_records = await prisma.team_members.findMany({
            where: {
                teamId: {
                    in: teamUserObjs.map((teamUserObj) => {
                        return teamUserObj.teamId
                    })
                },
                userId: userId
            },
        })
        if (team_user_records.length > 0) {
            res.status(400).send("User already exist in one or more teams")
            return
        }

        await prisma.team_members.createMany({
            data: [
                ...teamUserObjs.map((teamUserObj) => {
                    return {
                        teamId: teamUserObj.teamId,
                        userId: userId,
                        role: teamUserObj.role
                    }
                })
            ]
        });
        const teamsT = await prisma.team_members.findMany({
            where: {
                teamId: {
                    in: teamUserObjs.map((teamUserObj) => {
                        return teamUserObj.teamId
                    })
                },
                userId: userId
            },
            select: {
                role: true,
                teams:{
                    select: {
                        id: true,
                        name: true,
                        tier: true
                    },
                }
            }
        })
        const output = teamsT.map((teamT) => {
            const t = {
                key: teamT.teams.id,
                teamId: teamT.teams.id,
                teamName: teamT.teams.name,
                tier: teamT.teams.tier,
                role: teamT.role
            }
            return t
        })
        res.status(201).json(output)
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function deleteMultipleTeams(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    const { teamIds } : { teamIds: number[] } = req.body;
        
        await prisma.team_members.deleteMany({
            where: {
                teamId: {
                    in: teamIds
                },
                userId: userId
            }
        });
        res.status(200).json(teamIds);
}

export async function eraseMultipleUsers(req: Request, res: Response) {
    const { userIds } : { userIds: number[] } = req.body;
    try {
        const user_records = await prisma.users.findMany({
            where: {
                id: {
                    in: userIds
                }
            }
        })
        if (user_records.length !== userIds.length) {
            res.status(400).send("One or more users does not exist")
            return
        }
        const userActionIds = await prisma.action_users.findMany({
            where: {
                userId: {
                    in: userIds
                }
            }
        }).then((userActions) => {
            return userActions.map((userAction) => {
                return userAction.actionId
            })
        })
        await prisma.action_users.createMany({
            data: [
                ...userActionIds.map((userActionId) => {
                    return {
                        actionId: userActionId,
                        userId: null,
                        dateAllocated: new Date()
                    }
                })
            ]
        });
        await prisma.action_users.deleteMany({
            where: {
                userId: {
                    in: userIds
                }
            }
        });
        await prisma.projects.updateMany({
            where: {
                ownerId: {
                    in: userIds
                }
            },
            data: {
                ownerId: null
            }
        });
        await prisma.project_members.deleteMany({
            where: {
                memberId: {
                    in: userIds
                }
            }
        });
        await prisma.team_members.deleteMany({
            where: {
                userId: {
                    in: userIds
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                id: {
                    in: userIds
                }
            }
        });
        res.status(200).json(userIds);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}