import { PrismaClient as PrismaClientMain } from "../prisma/generated/client_main";
import { PrismaClient as PrismaClientMetrics } from "../prisma/generated/client_metricdata";
import { Request, Response } from "express"
const prisma = new PrismaClientMain();
const prismaMetrics = new PrismaClientMetrics()

const avatarColors = ["#E9D985", "#B2BD7E", "#749C75", "#6A5D7B", "#5D4A66"]

const fullUserSchema = {
    userId: true,
    users: {
        select: {
            firstName: true,
            lastName: true,
            email: true,
            lastActive: true,
            external: true
        }
    },
    role: true
}

const formatFullUser = (member: any) => {
    const t = {
        key: 
            member.userId,
        userId:
            member.userId,
        ...member.users,
        role:
            member.role,
        avatar_color: 
            avatarColors[member.users.firstName[0].charCodeAt(0)%5],
    }
    return t
}

const formatFullTeam = (team: any) => {
    const t = {
        key: team.id,
        id: team.id,
        name: team.name,
        tier: team.tier,
        reportTo: team.reportTo ? {
            id: team.reportTo.id,
            name: team.reportTo.name,
            tier: team.reportTo.tier
        } : null,
        created_at: team.created_at,
        updated_at: team.updated_at,
        team_members: 
            team.team_members.map((team_member: any) => {
                const m = {
                    role: team_member.role,
                    id: team_member.users.id,
                    firstName: team_member.users.firstName,
                    lastName: team_member.users.lastName,
                    email: team_member.users.email,
                    avatar_color: avatarColors[team_member.users.firstName[0].charCodeAt(0)%5],
                    key: team_member.users.id
                }
                return m
            })
    }
    return t
}

export async function getTeamsByOrg(req: Request, res:Response) {
    try {
        const orgId = parseInt(req.query.orgId as string);

        const teams = await prisma.teams.findMany({
            where: {
                organisationId: orgId
            },
            select: {
                id: true,
                name: true,
                tier: true
            }
        })
        const output = teams.map((team) => {
            const t = {
                ...team,
                key: 
                    team.id,
            }
            return t
          });
        return res.status(200).json(output)
    } catch (err) {
        console.log("error:", err);
        return res.status(500).send(err)
    }
}

export async function getTeamsFullByOrg(req: Request, res:Response) {
    try {
        const orgId = parseInt(req.query.orgId as string);

        const teams = await prisma.teams.findMany({
            where: {
                organisationId: orgId,
            },
            include: {
                reportTo: true,
                team_members:{
                    include: {
                        users: true
                    },
                    where: {
                        users: {
                            active: 1
                        }
                    }
                }
            }
        })
        const output = teams.map((team) => {
            return formatFullTeam(team)
        });
        return res.status(200).json(output)
    } catch (err) {
        console.log("error:", err);
        return res.status(500).send(err)
    }
}

export async function getMembers(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId);

        const members = await prisma.team_members.findMany({
            where: {
                teamId: teamId
            },
            select: {
                userId: true,
                users: {
                    select: {
                        active: true,
                        firstName: true,
                        lastName: true,
                        external: true
                    }
                }
            }
        })
        const output = members.map((member) => {
            const t = {
                ...member,
                avatar_color: 
                    avatarColors[member.users.firstName[0].charCodeAt(0)%5],
            }
            return t
          });
        return res.status(200).json(output)
    } catch (error) {
        console.log("error:", error);
        return res.status(500).send(error)
    }
}

export async function getMembersFull(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId);

        const members = await prisma.team_members.findMany({
            where: {
                teamId: teamId,
                users: {
                    active: 1
                }
            },
            select: fullUserSchema
        })
        const output = members.map((member) => {
            return formatFullUser(member)
          });
        return res.status(200).json(output)
    } catch (error) {
        console.log("error:", error);
        return res.status(500).send(error)
    }
}

export async function addMember(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId);
        const { emailAddr, role } : { emailAddr: string, role: number } = req.body;

        const user_record = await prisma.users.findMany({
            where: {
                email: emailAddr
            }
        })

        if (user_record.length === 0) {
            res.status(400).send("User does not exist")
        } else {
            const team_user_record = await prisma.team_members.findMany({
                where: {
                    teamId: teamId,
                    userId: user_record[0].id
                }
            })

            if (team_user_record.length > 0) {
                res.status(400).send("User already exist in team")
            } else {
                await prisma.team_members.create({
                    data: {
                        teamId: teamId,
                        userId: user_record[0].id,
                        role: role
                    }
                });
                const userT = await prisma.team_members.findMany({
                    where: {
                        teamId: teamId,
                        userId: user_record[0].id
                    },
                    select: fullUserSchema
                })
                const output = formatFullUser(userT[0])
                res.status(201).json(output)
            }
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function addMemberById(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId);
        const { userId, role } : { userId: number, role: number } = req.body;

        const team_user_record = await prisma.team_members.findMany({
            where: {
                teamId: teamId,
                userId: userId
            }
        })

        if (team_user_record.length > 0) {
            res.status(400).send("User already exist in team")
        } else {
            await prisma.team_members.create({
                data: {
                    teamId: teamId,
                    userId: userId,
                    role: role
                }
            });
            const userT = await prisma.team_members.findMany({
                where: {
                    teamId: teamId,
                    userId: userId
                },
                select: fullUserSchema
            })
            const output = formatFullUser(userT[0])
            res.status(201).json(output)
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function addMultipleUsers(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId);
        const {teamUserObjs} : {teamUserObjs:Array<{userId: number, role: number}>} = req.body;

        const team_record = await prisma.teams.findMany({
            where: {
                id: teamId
            }
        })
        if (team_record.length === 0) {
            res.status(400).send("Team does not exist")
            return
        }

        const user_records = await prisma.users.findMany({
            where: {
                id: {
                    in: teamUserObjs.map((teamUserObj) => {
                        return teamUserObj.userId
                    })
                },
            }
        })
        if (user_records.length !== teamUserObjs.length) {
            res.status(400).send("One or more users does not exist")
            return
        }

        const team_user_records = await prisma.team_members.findMany({
            where: {
                userId: {
                    in: teamUserObjs.map((teamUserObj) => {
                        return teamUserObj.userId
                    })
                },
                teamId: teamId
            },
        })
        if (team_user_records.length > 0) {
            res.status(400).send("One or more users already exist in team")
            return
        }

        await prisma.team_members.createMany({
            data: [
                ...teamUserObjs.map((teamUserObj) => {
                    return {
                        teamId: teamId,
                        userId: teamUserObj.userId,
                        role: teamUserObj.role
                    }
                })
            ]
        });
        const usersT = await prisma.team_members.findMany({
            where: {
                userId: {
                    in: teamUserObjs.map((teamUserObj) => {
                        return teamUserObj.userId
                    })
                },
                teamId: teamId
            },
            select: {
                role: true,
                users:{
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    },
                }
            }
        })
        const output = usersT.map((userT) => {
            const t = {
                role: userT.role,
                id: userT.users.id,
                firstName: userT.users.firstName,
                lastName: userT.users.lastName,
                avatar_color: avatarColors[userT.users.firstName[0].charCodeAt(0)%5],
                email: userT.users.email,
                key: userT.users.id
            }
            return t
        })
        res.status(201).json(output)
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function deleteMultipleMembers(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId);
        const { userIds } : { userIds: number[] } = req.body;
        const actionIds = await prisma.actions.findMany({
            where: {
                teamId: teamId,
            }
        }).then((actions) => {
            return actions.map((action) => {
                return action.id
            })
        })
        const userActionIds = await prisma.action_users.findMany({
            where: {
                userId: {
                    in: userIds
                },
                actionId: {
                    in: actionIds
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

        await prisma.projects.updateMany({
            where: {
                ownerId: {
                    in: userIds
                },
                teamId: teamId
            },
            data: {
                ownerId: null
            }
        });
        const projectIds = await prisma.projects.findMany({
            where: {
                teamId: teamId
            },
            select: {
                id: true
            }
        }).then((projects) => {
            return projects.map((project) => {
                return project.id
            })
        })
        await prisma.project_members.deleteMany({
            where: {
                memberId: {
                    in: userIds
                },
                projectId: {
                    in: projectIds
                }
            }
        });
        await prisma.team_members.deleteMany({
            where: {
                userId: {
                    in: userIds
                },
                teamId: teamId
            }
        });
        res.status(200).json(userIds);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function updateMemberRole(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId)
        const { userId, role } : { userId: number, role: number } = req.body

        await prisma.team_members.updateMany({
            where: {
                teamId: teamId,
                userId: userId
            },
            data: {
                role: role
            }
        })
        res.status(200).json({userId: userId, teamId: teamId, role: role})
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function createTeam(req: Request, res: Response) {
    try {
        const { name, orgId, tier, reportsTo } : { name: string, orgId: number, tier: number, reportsTo?: number } = req.body

        const team = await prisma.teams.create({
            data: {
                name: name,
                organisationId: orgId,
                tier: tier,
                reportsTo: reportsTo
            }
        })

        const teamFull = await prisma.teams.findUnique({
            where: {
                id: team.id,
            },
            include: {
                reportTo: true,
                team_members:{
                    include: {
                        users: true
                    },
                    where: {
                        users: {
                            active: 1
                        }
                    }
                }
            }
        })

        const output = formatFullTeam(teamFull)
        res.status(200).json(output)
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function updateTeamName(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId)
        const { name } : { name: string } = req.body

        await prisma.teams.update({
            where: {
                id: teamId
            },
            data: {
                name: name
            }
        })
        res.status(200).json({id: teamId, name: name})
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function updateTeamTier(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.params.teamId)
        const { tier, reportsTo, oldReportsTo } : { tier: number, reportsTo: number|null, oldReportsTo?: number } = req.body

        await prisma.teams.update({
            where: {
                id: teamId
            },
            data: {
                tier: tier,
                reportsTo: reportsTo
            }
        })
        if (oldReportsTo && reportsTo) {
            await prisma.actions.updateMany({
                where: {
                    teamId: oldReportsTo,
                },
                data: {
                    teamId: reportsTo
                }
            })
            await prisma.actions.updateMany({
                where: {
                    teamId: teamId,
                },
                data: {
                    escalatedTo: reportsTo
                }
            })
        } else if (reportsTo === null && oldReportsTo) {
            await prisma.actions.deleteMany({
                where: {
                    teamId: oldReportsTo
                }
            })
            await prisma.actions.updateMany({
                where: {
                    teamId: teamId,
                },
                data: {
                    escalatedTo: null,
                    status: 1
                }
            })
        }
        if (reportsTo) {
            const team = await prisma.teams.findUnique({
                where: {
                    id: reportsTo,
                },
                select: {
                    id: true,
                    name: true,
                    tier: true
                }
            })
            res.status(200).json({id: teamId, tier: tier, reportsTo: team})
        } else {
            res.status(200).json({id: teamId, tier: tier, reportsTo: undefined})
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function deleteMultipleTeams(req: Request, res: Response) {
    try {
        const { teamIds } : { teamIds: number[] } = req.body;
        const actionIds = await prisma.actions.findMany({
            where: {
                teamId: {
                    in: teamIds
                }
            }
        }).then((actions) => {
            return actions.map((action) => {
                return action.id
            })
        })
        await prisma.action_users.deleteMany({
            where: {
                actionId: {
                    in: actionIds
                }
            }
        })
        await prisma.project_actions.deleteMany({
            where: {
                actionId: {
                    in: actionIds
                }
            }
        })
        await prisma.actions.updateMany({
            where: {
                escalatedFrom: {
                    in: teamIds
                }
            },
            data: {
                escalatedFrom: null
            }
        })
        await prisma.actions.updateMany({
            where: {
                escalatedTo: {
                    in: teamIds
                }
            },
            data: {
                escalatedTo: null
            }
        })
        await prisma.actions.deleteMany({
            where: {
                teamId: {
                    in: teamIds
                }
            }
        })
        
        const projectIds = await prisma.projects.findMany({
            where: {
                teamId: {
                    in: teamIds
                }
            }
        }).then((projects) => {
            return projects.map((project) => {
                return project.id
            })
        })
        await prisma.project_members.deleteMany({
            where: {
                projectId: {
                    in: projectIds
                }
            }
        })
        await prisma.project_metrics.deleteMany({
            where: {
                projectId: {
                    in: projectIds
                }
            }
        })
        await prisma.project_actions.deleteMany({
            where: {
                projectId: {
                    in: projectIds
                }
            }
        })
        await prisma.projects.deleteMany({
            where: {
                id: {
                    in: projectIds
                }
            }
        })

        await prisma.team_members.deleteMany({
            where: {
                teamId: {
                    in: teamIds
                }
            }
        });

        const metricIds = await prisma.team_metrics.findMany({
            where: {
                teamId: {
                    in: teamIds
                }
            }
        }).then((metrics) => {
            return metrics.map((metric) => {
                return metric.metricId
            })
        })
        await prisma.metric_category.deleteMany({
            where: {
                teamId: {
                    in: teamIds
                }
            }
        });
        await prisma.metric_multiple_target.deleteMany({
            where: {
                metricId: {
                    in: metricIds
                }
            }
        });
        await prisma.metric_range_target.deleteMany({
            where: {
                metricId: {
                    in: metricIds
                }
            }
        });
        await prisma.metric_single_target.deleteMany({
            where: {
                metricId: {
                    in: metricIds
                }
            }
        });
        await prisma.project_metrics.deleteMany({
            where: {
                metricId: {
                    in: metricIds
                }
            }
        });
        await prisma.team_metrics.deleteMany({
            where: {
                metricId: {
                    in: metricIds
                }
            }
        });
        await prisma.metrics.deleteMany({
            where: {
                id: {
                    in: metricIds
                }
            }
        });
        
        await prismaMetrics.metricData.deleteMany({
            where: {
                metricId: {
                    in: metricIds
                }
            }
        });

        await prisma.teams.updateMany({
            where: {
                reportsTo: {
                    in: teamIds
                }
            },
            data: {
                reportsTo: null
            }
        });

        await prisma.teams.deleteMany({
            where: {
                id: {
                    in: teamIds
                }
            }
        });

        res.status(200).json(teamIds);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}