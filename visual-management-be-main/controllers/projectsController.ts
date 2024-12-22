import { PrismaClient as PrismaClientMain } from "../prisma/generated/client_main";
import { Request, Response } from "express"

import { actionReturnSchema, formatActionUser } from "./actionsController";

const prisma = new PrismaClientMain();

const avatarColors = ["#E9D985", "#B2BD7E", "#749C75", "#6A5D7B", "#5D4A66"]

const projectGeneralReturnSchema: any = {
    id: true,
    title: true,
    status: true,
    dueDateTime: true,
    ownerId_project: {
        select: {
            firstName: true,
            lastName: true
        }
    },
    starred: true
}

const projectReturnSchema: any = {
    id: true,
    title: true,
    problem: true,
    goal: true,
    analysis: true,
    results: true,
    status: true,
    startDateTime: true,
    dueDateTime: true,
    starred: true,
    ownerId: true,
    ownerId_project: {
        select: {
            firstName: true,
            lastName: true
        }
    },
}

const formatProjects = (project: any) => {
    const t = {
        ...project,
        owner_firstName:
            project.ownerId_project ? project.ownerId_project.firstName : "",
        owner_lastName:
            project.ownerId_project ? project.ownerId_project.lastName : "",
        avatar_color: 
            project.ownerId_project ? avatarColors[project.ownerId_project.firstName[0].charCodeAt(0)%5] : "",
        key:
            project.id
    }

    delete t.ownerId_project

    return t
}

export async function getProjectsByTeam(req: Request, res: Response) {
    try {
        const teamId = parseInt(req.query.teamId as string);
        const projects = await prisma.projects.findMany({
            where: { teamId: teamId },
            select: projectGeneralReturnSchema,
            orderBy: {
                dueDateTime: 'asc'
            }
        });
        const output = projects.map((project) => {
            return formatProjects(project);
          });
        res.status(200).json(output);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function getProjectById(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId)
        const project = await prisma.projects.findUnique({
            where: { id: projectId },
            select: projectReturnSchema
        });

        if (project == null) {
            res.status(400).send("Project ID not found")
        } else {
            const output = formatProjects(project);
            res.status(200).json(output);
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function getProjectIds(req: Request, res: Response) {
    try {
        const projects = await prisma.projects.findMany({
            select: {
                id: true
            }
        });
        res.status(200).json(projects);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function createProject(req: Request, res: Response) {
    try {
        const { title, problem, goal, teamId, startDate, dueDate, ownerId } : { title: string, problem: string, goal: string, teamId: number, startDate: string, dueDate: string, ownerId: number} = req.body
        const createdProject = await prisma.projects.create({
            data: {
                title: title,
                problem: problem,
                goal: goal,
                teamId: teamId,
                status: 1,
                startDateTime: new Date(startDate),
                dueDateTime: new Date(dueDate),
                ownerId: ownerId,
                starred: 0
            }
        })
        const newProject = await prisma.projects.findUnique({
            where: { id: createdProject.id },
            select: projectGeneralReturnSchema
        });
        const output = formatProjects(newProject)

        res.status(201).json(output)
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function updateProject(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId)
        const { title, problem, goal, analysis, results, status, startDate, dueDate, completedDate, ownerId, starred } : { title: string, problem: string, goal: string, analysis: string | undefined, results: string | undefined, status: number, startDate: string, dueDate: string, completedDate: string | undefined, ownerId: number, starred: number } = req.body

        if (status == 3 && completedDate == null) {
            res.status(400).send("No completedDate provided")
        }
        await prisma.projects.update({
            where: {
                id: projectId
            },
            data: {
                title: title,
                problem: problem,
                goal: goal,
                analysis: analysis,
                results: results,
                status: status,
                startDateTime: startDate != undefined ? new Date(startDate) : startDate,
                dueDateTime: dueDate != undefined ? new Date(dueDate) : dueDate,
                completedDateTime: (completedDate != undefined && status == 3) ? new Date(completedDate) : null,
                ownerId: ownerId,
                starred: starred
            }
        })
        const project = await prisma.projects.findUnique({
            where: {
                id: projectId
            },
            select: projectReturnSchema
        })
        const output = formatProjects(project)
        res.status(200).json(output)
    } catch (error) {
        console.log('error:', error)
        res.status(500).send('Internal server error');
    }
}

export async function deleteProject(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId)

        const project = await prisma.projects.findUnique({
            where: {
                id: projectId
            }
        })
        if (project == null) {
            res.status(400).send("Project ID not found")
        } else {
            await prisma.project_actions.deleteMany({
                where: {
                    projectId: projectId
                }
            })
            await prisma.project_members.deleteMany({
                where: {
                    projectId: projectId
                }
            })
            await prisma.project_metrics.deleteMany({
                where: {
                    projectId: projectId
                }
            })
            await prisma.projects.delete({
                where: {
                    id: projectId
                }
            })
            res.status(200).send(String(projectId))
        }
    } catch (error) {
        console.log('error:', error)
        res.status(500).send('Internal server error');
    }
}

export async function getProjectMembers(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const members = await prisma.project_members.findMany({
            where: { projectId: projectId },
            select: {
                members: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                } 
            }
        });
        const output = members.map((member) => {
            const t = {
                ...member.members
            }
            return t
          });
        res.status(200).json(output);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function addProjectMember(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const { userId } : { userId: number } = req.body;
        await prisma.project_members.create({
            data: {
                projectId: projectId,
                memberId: userId
            }
        });
        res.status(200).send("Project member added successfully");
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function deleteProjectMember(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const { userId } : { userId: number } = req.body;
        
        const member_record = await prisma.project_members.findMany({
            where: {
                projectId: projectId,
                memberId: userId
            }
        })

        if (member_record.length === 0) {
            res.status(400).send("Member does not exist in project")
        } else {
            await prisma.project_members.deleteMany({
                where: {
                    projectId: projectId,
                    memberId: userId
                }
            });
            res.status(200).send("Project member deleted successfully");
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function getProjectActions(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const actions = await prisma.project_actions.findMany({
            where: { projectId: projectId },
            select: {
                actions: {
                    select: actionReturnSchema
                } 
            }
        });
        const output = actions.map((action: any) => {
            const t = {
                ...action.actions,
                userId:
                    action.actions.action_users[0] !== undefined ? action.actions.action_users[0].userId : -1,
                PIC_firstName:
                    action.actions.action_users[0] !== undefined ? action.actions.action_users[0].users.firstName : "",
                PIC_lastName:
                    action.actions.action_users[0] !== undefined ? action.actions.action_users[0].users.lastName : "",
                avatar_color: 
                    action.actions.action_users[0] !== undefined ? avatarColors[action.actions.action_users[0].users.firstName[0].charCodeAt(0)%5] : "",
                key: action.actions.id
            }
        
            delete t.action_users
            return t
          });
        res.status(200).json(output);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function addProjectAction(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const { actionId } : { actionId: number } = req.body;

        const action_record = await prisma.project_actions.findMany({
            where: {
                projectId: projectId,
                actionId: actionId
            }
        })

        if (action_record.length > 0) {
            res.status(400).send("Action already exist in project")
        } else {
            await prisma.project_actions.create({
                data: {
                    projectId: projectId,
                    actionId: actionId
                }
            });
            const actionT = await prisma.actions.findUnique({
                where: {
                    id: actionId
                },
                select: actionReturnSchema
            })
            const output = formatActionUser(actionT)
            res.status(201).json(output)
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function deleteProjectAction(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const { actionId } : { actionId: number } = req.body;
        
        const action_record = await prisma.project_actions.findMany({
            where: {
                projectId: projectId,
                actionId: actionId
            }
        })

        if (action_record.length === 0) {
            res.status(400).send("Action does not exist in project")
        } else {
            await prisma.project_actions.deleteMany({
                where: {
                    projectId: projectId,
                    actionId: actionId
                }
            });
            res.status(200).send(String(actionId));
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function getProjectMetrics(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const metrics = await prisma.project_metrics.findMany({
            where: { projectId: projectId },
            select: {
                metricId: true,
                metrics: {
                    select: {
                        metricName: true
                    }
                }
            }
        });
        const output = metrics.map((metric: any) => {
            const t = {
                ...metric,
                metricName: metric.metrics.metricName,
                key: metric.metricId
            }
            delete t.metrics
            return t
          });
        res.status(200).json(output);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function addProjectMetric(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const { metricId } : { metricId: number } = req.body;

        const metric_record = await prisma.project_metrics.findMany({
            where: {
                projectId: projectId,
                metricId: metricId
            }
        })

        if (metric_record.length > 0) {
            res.status(400).send("Metric already exist in project")
        } else {
            await prisma.project_metrics.create({
                data: {
                    projectId: projectId,
                    metricId: metricId
                }
            });
            const metricT = await prisma.metrics.findUnique({
                where: {
                    id: metricId
                },
                select: {
                    id: true,
                    metricName: true
                }
            })
            res.status(201).json(metricT)
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function deleteProjectMetric(req: Request, res: Response) {
    try {
        const projectId = parseInt(req.params.projectId);
        const { metricId } : { metricId: number } = req.body;
        
        const metric_record = await prisma.project_metrics.findMany({
            where: {
                projectId: projectId,
                metricId: metricId
            }
        })

        if (metric_record.length === 0) {
            res.status(400).send("Metric does not exist in project")
        } else {
            await prisma.project_metrics.deleteMany({
                where: {
                    projectId: projectId,
                    metricId: metricId
                }
            });
            const metricT = await prisma.metrics.findUnique({
                where: {
                    id: metricId
                },
                select: {
                    id: true,
                    metricName: true
                }
            })
            res.status(200).send(metricT);
        }
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}