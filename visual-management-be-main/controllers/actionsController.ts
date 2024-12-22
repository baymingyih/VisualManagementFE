import { PrismaClient as PrismaClientMain } from "../prisma/generated/client_main";
import { Request, Response } from "express"
const prisma = new PrismaClientMain();

const avatarColors = ["#E9D985", "#B2BD7E", "#749C75", "#6A5D7B", "#5D4A66"]

export const actionReturnSchema: any = {
    id: true,
    title: true,
    description: true,
    deadlineDateTime: true,
    status: true,
    priority: true,
    escalatedto_team: {
        select: {
            id: true,
            name: true
        }
    },
    escalatedfrom_team: {
        select: {
            id: true,
            name: true
        }
    },
    action_users: {
        orderBy: {
            dateAllocated: 'desc',
          },
        take: 1,
        select: {
            userId: true,
            users: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    },
    project_actions: {
        select:{
            projectId: true,
            projects: {
                select: {
                    title: true
                }
            }
        }
    }
}

export const formatActionUser = (action: any) => {
    const t = {
        ...action,
        userId:
            action.action_users[0] && action.action_users[0].users ? action.action_users[0].userId : -1,
        PIC_firstName:
            action.action_users[0] && action.action_users[0].users ? action.action_users[0].users.firstName : "",
        PIC_lastName:
            action.action_users[0] && action.action_users[0].users ? action.action_users[0].users.lastName : "",
        avatar_color: 
            action.action_users[0] && action.action_users[0].users ? avatarColors[action.action_users[0].users.firstName[0].charCodeAt(0)%5] : "",
        key: action.id,
        project_action_list: action.project_actions.map((pa : {projectId: number, projects: {title: string}}) => ({"projectId": pa.projectId, "projectTitle": pa.projects.title}))
    }

    delete t.action_users
    delete t.users
    delete t.project_actions

    return t
}

export async function getActionsByTeam(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.query.teamId as string);
        const actions = await prisma.actions.findMany({
          where: { teamId: teamId },
          select: actionReturnSchema,
          orderBy: {
            deadlineDateTime: 'asc'
          }
        });
        const output = actions.map((action) => {
          return formatActionUser(action);
        });
        res.status(200).json(output);
      } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
      }
}

export async function getActionSummaryForProjects(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.query.teamId as string);
        const actions = await prisma.actions.findMany({
          where: { teamId: teamId },
          select: {
            id: true,
            title: true,
            description: true,
            project_actions: {
                select:{
                    projectId: true
                }
            }
          },
        });
        const output = actions.map((action: any) => {
            const t = {
                ...action,
                project_action_list: action.project_actions.map((pa : {projectId: number})=> pa.projectId)
            }

            delete t.project_actions

            return t
        })
        res.status(200).json(output);
      } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
      }
}

export async function createAction(req: Request, res: Response) {
    try {
        const { title, description, priority, teamId, deadline, picId } : { title: string, description: string | undefined, priority: number, teamId: number, deadline: number, picId: number | undefined} = req.body
        const action = await prisma.actions.create({
            data: {
                title: title,
                description: description,
                priority: priority,
                teamId: teamId,
                status: 3,
                deadlineDateTime: new Date(deadline)
            }
        })
        if (picId !== undefined) {
            await prisma.action_users.create({
                data: {
                    actionId: action.id,
                    userId: picId,
                    dateAllocated: new Date()
                }
            })
        }
        const actionT = await prisma.actions.findUnique({
            where: {
                id: action.id
            },
            select: actionReturnSchema
        })
        const output = formatActionUser(actionT)
        res.status(201).json(output)
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function updateAction(req: Request, res: Response) {
    try {
        const actionId = parseInt(req.params.actionId)
        const { title, description, priority, status, deadline, completedDate } : { title: string, description:string | undefined, priority: number | undefined, status: number | undefined, deadline: string | undefined, completedDate: string | undefined } = req.body

        if (status == 2 && completedDate == null) {
            res.status(400).send("No completedDate provided")
        }
        await prisma.actions.update({
            where: {
                id: actionId
            },
            data: {
                title: title,
                description: description,
                priority: priority,
                deadlineDateTime: deadline != undefined ? new Date(deadline) : deadline,
                status: status,
                completedDateTime: (completedDate != undefined && status == 2) ? new Date(completedDate) : null
            }
        })
        const action = await prisma.actions.findUnique({
            where: {
                id: actionId
            },
            select: actionReturnSchema
        })
        const output = formatActionUser(action)
        res.status(200).json(output)
    } catch (error) {
        console.log('error:', error)
        res.status(500).send('Internal server error');
    }
}

export async function updatePIC(req: Request, res: Response) {
    try {
        const actionId = parseInt(req.params.actionId)
        const userId: number = req.body.userId

        await prisma.action_users.create({
            data: {
                actionId: actionId,
                userId: userId,
                dateAllocated: new Date()
            }
        })
        const action = await prisma.actions.findUnique({
            where: {
                id: actionId
            },
            select: actionReturnSchema
        })
        const output = formatActionUser(action)
        res.status(201).json(output) 
    } catch (error) {
        console.log('error:', error)
        res.status(500).send('Internal server error');
    }
}

export async function escalateAction(req: Request, res: Response) {
    try {
        const actionId = parseInt(req.params.actionId)
        const teamId: number = req.body.teamId

        const action = await prisma.actions.findUnique({
            where: {
                id: actionId
            }
        })
        if (action == null) {
            res.status(400).send("Action ID not found")
        } else {
            await prisma.actions.create({
                data: {
                    title: action.title,
                    description: action.description,
                    priority: action.priority,
                    teamId: teamId,
                    status: 3,
                    deadlineDateTime: action.deadlineDateTime,
                    escalatedFrom: action.teamId
                }
            })
        }
        await prisma.actions.update({
            where: {
                id: actionId
            },
            data: {
                escalatedTo: teamId
            }
        })

        const actionUpdated = await prisma.actions.findUnique({
            where: {
                id: actionId
            },
            select: actionReturnSchema
        })
        const output = formatActionUser(actionUpdated)
        res.status(201).json(output)
    } catch (error) {
        console.log('error:', error)
        res.status(500).send('Internal server error');
    }
}

export async function deleteAction(req: Request, res: Response) {
    try {
        const actionId = parseInt(req.params.actionId)

        const action = await prisma.actions.findUnique({
            where: {
                id: actionId
            }
        })
        if (action == null) {
            res.status(400).send("Action ID not found")
        } else {
            await prisma.action_users.deleteMany({
                where: {
                    actionId: actionId
                }
            })
            await prisma.project_actions.deleteMany({
                where: {
                    actionId: actionId
                }
            })
            await prisma.actions.delete({
                where: {
                    id: actionId
                }
            })
            res.status(200).send(String(actionId))
        }
    } catch (error) {
        console.log('error:', error)
        res.status(500).send('Internal server error');
    }
}

export async function deleteMultipleActions(req: Request, res: Response) {
    try {
        const { actionIds } : { actionIds: number[] } = req.body;

        const action_records = await prisma.actions.findMany({
            where: {
                id: {
                    in: actionIds
                }
            }
        })
        if (action_records.length !== actionIds.length) {
            res.status(400).send("One or more actions does not exist")
            return
        } else {
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
            await prisma.actions.deleteMany({
                where: {
                    id: {
                        in: actionIds
                    }
                }
            })
            res.status(200).send(actionIds)
        }
    } catch (error) {
        console.log('error:', error)
        res.status(500).send('Internal server error');
    }
}

export async function completeMultipleActions(req: Request, res: Response) {
    try {
        const { actionIds } : { actionIds: number[] } = req.body;

        const action_records = await prisma.actions.findMany({
            where: {
                id: {
                    in: actionIds
                }
            }
        })
        if (action_records.length !== actionIds.length) {
            res.status(400).send("One or more actions does not exist")
            return
        } else {
            await prisma.actions.updateMany({
                where: {
                    id: {
                        in: actionIds
                    }
                },
                data: {
                    status: 2,
                    completedDateTime: new Date()
                }
            })
            res.status(200).send(actionIds)
        }
    } catch (error) {
        console.log('error:', error)
        res.status(500).send('Internal server error');
    }
}