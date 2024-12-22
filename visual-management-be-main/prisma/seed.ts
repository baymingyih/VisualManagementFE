import { metrics_targetType, metrics_trackingFrequency, metric_category, PrismaClient as PrismaClientMain  } from './generated/client_main'
import { PrismaClient as PrismaClientMetricData } from './generated/client_metricdata'

import { setTimeout } from "timers/promises";

const prisma_main = new PrismaClientMain()
const prisma_metricdata = new PrismaClientMetricData()

const MAX_VAL = 200

async function main() {
    const transactions = []
    transactions.push(prisma_main.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`)
    const tablenames = await prisma_main.$queryRaw<
    Array<{ TABLE_NAME: string }>>`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'caliba-mvp';`
    for (const { TABLE_NAME } of tablenames) {
        if (TABLE_NAME !== '_prisma_migrations') {
            try {
                transactions.push(prisma_main.$executeRawUnsafe(`TRUNCATE ${TABLE_NAME};`))
            } catch (error) {
                console.log({ error })
            }
        }
    }

    transactions.push(prisma_main.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`)

    try {
        await prisma_main.$transaction(transactions)
        await prisma_metricdata.metricData.deleteMany({})
        console.log("Tables truncated") //_prisma_migrations ignored
        await setTimeout(5000);
    } catch (error) {
        console.log({ error })
    }

    console.log("Seeding database..")

    const orgData = await prisma_main.organisations.create({
        data: {
            name: "Test Organisation"
        }
    })

    const lastActive = new Date()
    lastActive.setDate(lastActive.getDate() - Math.floor(Math.random() * 2))

    const usr1 = await prisma_main.users.create({
        data: {
            firstName: "John",
            lastName: "Doe",
            email: "johndoe@testorg.com",
            organisationId: orgData.id,
            active: 1,
            lastActive: lastActive,
            orgAdmin: 0
        }
    })

    lastActive.setDate(lastActive.getDate() - Math.floor(Math.random() * 2))

    const usr2 = await prisma_main.users.create({
        data: {
            firstName: "Mary",
            lastName: "Jane",
            email: "maryjane@testorg.com",
            organisationId: orgData.id,
            active: 1,
            lastActive: lastActive,
            orgAdmin: 0
        }
    })

    lastActive.setDate(lastActive.getDate() - Math.floor(Math.random() * 2))

    const usr3 = await prisma_main.users.create({
        data: {
            firstName: "Thomas",
            lastName: "Grant",
            email: "thomasgrant@testorg.com",
            organisationId: orgData.id,
            active: 1,
            lastActive: lastActive,
            orgAdmin: 0
        }
    })

    const usr4 = await prisma_main.users.create({
        data: {
            firstName: "Kelly",
            lastName: "Margle",
            email: "kellymargle@testorg.com",
            organisationId: orgData.id,
            active: 1,
            lastActive: lastActive,
            orgAdmin: 1
        }
    })

    lastActive.setDate(lastActive.getDate() - Math.floor(Math.random() * 2))

    const usr5 = await prisma_main.users.create({
        data: {
            firstName: "Jonathan",
            lastName: "Augustine",
            email: "jonathanaugustine@testorg.com",
            organisationId: orgData.id,
            active: 1,
            lastActive: lastActive,
            orgAdmin: 0
        }
    })

    const admin = await prisma_main.users.create({
        data: {
            firstName: "Admin",
            lastName: "User",
            email: "admin@testorg.com",
            organisationId: orgData.id,
            active: 0,
            lastActive: lastActive,
            orgAdmin: 1
        }
    })

    const TEAMS = 3;

    for (let i = 0; i < TEAMS; i++) {
        const testTeam = await prisma_main.teams.create({
            data: {
                name: `Test Team ${i+1}`,
                organisationId: orgData.id,
                tier: i+1
            }
        })
        if (i==0) {
            await prisma_main.team_members.create({
                data: {
                    userId: usr1.id,
                    teamId: testTeam.id,
                    role: 2
                }
            })
            await prisma_main.team_members.create({
                data: {
                    userId: usr2.id,
                    teamId: testTeam.id,
                    role: 2
                }
            })
            await prisma_main.team_members.create({
                data: {
                    userId: usr3.id,
                    teamId: testTeam.id,
                    role: 2
                }
            })
            await prisma_main.team_members.create({
                data: {
                    userId: usr4.id,
                    teamId: testTeam.id,
                    role: 1
                }
            })
        }
        if (i==1) {
            await prisma_main.team_members.create({
                data: {
                    userId: usr5.id,
                    teamId: testTeam.id,
                    role: 1
                }
            })
        }
        await prisma_main.team_members.create({
            data: {
                userId: admin.id,
                teamId: testTeam.id,
                role: 1
            }
        })
    }

    for (let i = 0; i < TEAMS; i++) {
        await prisma_main.teams.update({
            where: {
                id: i+1
            }, 
            data: {
                reportsTo: i === TEAMS-1 ? null : i+2
            }
        })
    }

    const metricCategories:string[] = ['Safety', 'Quality', 'Supply', 'Financials', 'People']

    const categories:metric_category[] = []

    for (let i = 0; i < TEAMS; i++) {
        for (let j = 0; j < metricCategories.length; j++) {
            const tempCategory = await prisma_main.metric_category.create({
                data: {
                    categoryName: metricCategories[j] ?? '',
                    columnId: j+1,
                    teamId: i+1
                }
            })
            categories.push(tempCategory)
        }
    }

    const METRICS = 30;
    const COMMENTSTRING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

    const freq:metrics_trackingFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Yearly']
    const type:metrics_targetType[] = ['Simple', 'Multiple', 'Range']

    for (let i = 0; i < METRICS; i++) {
        const tempType:metrics_targetType = 'Simple'
        const tarVal = Math.floor(Math.random() * MAX_VAL)
        const tempMetric = await prisma_main.metrics.create({
            data: {
                metricName: `Metric ${i+1}`,
                trackingFrequency: freq[Math.floor(Math.random() * freq.length)] ?? 'Daily',
                targetType: tempType
            }
        })
        switch(tempType) {
            case 'Simple': {
                await prisma_main.metric_single_target.create({
                    data: {
                        metricId: tempMetric.id,
                        targetValue: tarVal,
                        above: Math.round(Math.random())
                    }
                })
                break;
            }
            // case 'Multiple': {
            //     //TODO
            //     break;
            // }
            // case 'Range': {
            //     //TODO
            //     break;
            // }
        }

        const curDate = new Date('10/15/2023')
        // const dataCount = Math.floor(Math.random() * 50);
        let newVal = tarVal
        const dataCount = 67
        for (let j = 0; j < dataCount; j++) {
            curDate.setDate(curDate.getDate() + 1);
            newVal = Math.random() < 0.5 ? newVal + Math.floor(Math.random() * 5) : newVal - Math.floor(Math.random() * 5)
            await prisma_metricdata.metricData.create({
                data: {
                    metricId: tempMetric.id,
                    value: newVal,
                    comment: COMMENTSTRING.substring(0, Math.floor(Math.random() * COMMENTSTRING.length)),
                    dateTime: curDate,
                    updatedBy_userId: admin.id,
                    comment_updatedBy_userId: admin.id
                }
            })
        }

        const randTeam = Math.floor(Math.random() * TEAMS)+1
        const randCategory = (Math.floor(Math.random() * 5)+1) + (5 * (randTeam-1))
        const results = await prisma_main.team_metrics.findMany({
            where: {
                teamId: randTeam,
                metricCategoryId: randCategory
            }
        })
        await prisma_main.team_metrics.create({
            data: {
                metricId: tempMetric.id,
                teamId: randTeam,
                metricCategoryId: randCategory,
                metricRowId: results.length + 1,
                creator: 1,
                defaultView: Math.round(Math.random() * 1)
            }
        })
    }

    const ACTIONS = 30;
    for (let i = 0; i < ACTIONS; i++) {
        const randStatus = Math.ceil(Math.random() * 3) //1-3
        const deadline = new Date()
        deadline.setDate(deadline.getDate() -5 + Math.floor(Math.random() * 30))
        const completedDate = new Date()
        completedDate.setDate(completedDate.getDate() - Math.floor(Math.random() * 10))
        const escalate =  Math.ceil(Math.random() * 5) //1-5

        const tempAction = await prisma_main.actions.create({
            data: {
                title: `Action ${i+1}`,
                description: COMMENTSTRING.substring(0, Math.floor(Math.random() * COMMENTSTRING.length)),
                priority: Math.ceil(Math.random() * 3),
                teamId: 1,
                status: randStatus,
                deadlineDateTime: deadline,
                completedDateTime: randStatus == 2 ? completedDate : null,
                escalatedFrom: null,
                escalatedTo: escalate >= 4 ? 2 : null
            }
        })

        const allocatedDate = new Date()
        allocatedDate.setDate(allocatedDate.getDate() - Math.floor(Math.random() * 10) - 10)

        if (randStatus != 3) {
            await prisma_main.action_users.create({
                data: {
                    actionId: tempAction.id,
                    userId: Math.floor(Math.random() * 4) + 1,
                    dateAllocated: allocatedDate
                }
            })
        }

        if (escalate >=4) {
            const randEscalatedStatus = Math.ceil(Math.random() * 3)
            const tempEscalatedAction = await prisma_main.actions.create({
                data: {
                    title: tempAction.title,
                    description: tempAction.description,
                    priority: tempAction.priority,
                    teamId: 2,
                    status: randEscalatedStatus,
                    deadlineDateTime: tempAction.deadlineDateTime,
                    completedDateTime: randEscalatedStatus == 2 ? completedDate : null,
                    escalatedFrom: 1,
                    escalatedTo: null
                }
            })
            await prisma_main.action_users.create({
                data: {
                    actionId: tempEscalatedAction.id,
                    userId: 5,
                    dateAllocated: allocatedDate
                }
            })
        }
    }

    const actionIds = await prisma_main.actions.findMany({
        where: {
            teamId: 1
        },
        select: {
            id: true
        }
    })

    const PROJECTS = 10;
    for (let i = 0; i < PROJECTS; i++) {
        const randStatus = Math.ceil(Math.random() * 3)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 5 + Math.floor(Math.random() * 3))
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 3 + Math.floor(Math.random() * 30))
        const completedDate = new Date()
        completedDate.setDate(completedDate.getDate() + 3 + Math.floor(Math.random() * 10))
        const tempProject = await prisma_main.projects.create({
            data: {
                title: `Project ${i+1}`,
                teamId: 1,
                problem: COMMENTSTRING.substring(0, Math.floor(Math.random() * COMMENTSTRING.length)),
                goal: COMMENTSTRING.substring(0, Math.floor(Math.random() * COMMENTSTRING.length)),
                analysis: COMMENTSTRING.substring(0, Math.floor(Math.random() * COMMENTSTRING.length)),
                results: COMMENTSTRING.substring(0, Math.floor(Math.random() * COMMENTSTRING.length)),
                status: randStatus,
                startDateTime: startDate,
                dueDateTime: dueDate,
                completedDateTime: randStatus == 3 ? completedDate : null,
                ownerId: Math.ceil(Math.random() * 2),
                starred: Math.floor(Math.random() * 2)
            }
        })

        await prisma_main.project_metrics.create({
            data: {
                projectId: tempProject.id,
                metricId: Math.ceil(Math.random() * 30)
            }
        })

        await prisma_main.project_members.create({
            data: {
                projectId: tempProject.id,
                memberId: 2 + Math.ceil(Math.random() * 2)
            }
        })

        var len = actionIds.length
        var start = 0;

        while (true) {
            const pointer = Math.ceil(Math.random() * 8);
            if(start + pointer >= len) {
                break
            }
            await prisma_main.project_actions.create({
                data: {
                    projectId: tempProject.id,
                    actionId: actionIds[start+pointer].id
                }
            })
            start += pointer
        }
    }
    
}

main()
    .then(async () => {
        await prisma_main.$disconnect()
        await prisma_metricdata.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma_main.$disconnect()
        await prisma_metricdata.$disconnect()
        process.exit(1)
    })