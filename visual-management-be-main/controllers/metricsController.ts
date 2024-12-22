import {
  metrics_trackingFrequency,
  PrismaClient as PrismaClientMain
} from '../prisma/generated/client_main'
import { Request, Response } from 'express'
const prisma = new PrismaClientMain()

// TODO: need to consider code
export async function getMetricsByTeam(req: Request, res: Response) {
  try {
    const teamId = parseInt(req.query.teamId as string)

    const metrics = await prisma.team_metrics.findMany({
      where: { teamId: teamId },
      select: {
        metricId: true,
        metricRowId: true,
        metricCategoryId: true,
        creator: true,
        defaultView: true,
        metrics: {
          select: {
            metricName: true,
            trackingFrequency: true,
            targetType: true,
            metric_single_target: {
              select: {
                targetValue: true,
                above: true
              }
            }
          }
        }
      }
    })

    const parsed = metrics.map((metric: any) => {
      const t = {
        ...metric,
        ...metric.metrics,
        metric_single_target:
          metric.metrics.metric_single_target[0].targetValue,
        metric_single_target_above:
          metric.metrics.metric_single_target[0].above,
        deleted: false
      }

      delete t.metrics

      return t
    })
    return res.status(200).json(parsed)
  } catch (err) {
    console.log('error:', err)
    return res.status(500).send(err)
  }
}

export async function getMetricSummaryForProject(req: Request, res: Response) {
  try {
    const teamId = parseInt(req.query.teamId as string)
    const metrics = await prisma.team_metrics.findMany({
      where: { teamId: teamId },
      select: {
        metricId: true,
        metrics: {
          select: {
            metricName: true,
            project_metrics: {
              select: {
                projectId: true
              }
            }
          }
        }
      }
    })

    const parsed = metrics.map((metric: any) => {
      const t = {
        ...metric,
        ...metric.metrics,
        project_metric_list: metric.metrics.project_metrics.map(
          (pm: { projectId: number }) => pm.projectId
        )
      }
      delete t.metrics
      delete t.project_metrics

      return t
    })
    return res.status(200).json(parsed)
  } catch (err) {
    console.log('error:', err)
    return res.status(500).send(err)
  }
}

export async function createSimpleMetric(req: Request, res: Response) {
  try {
    const {
      name,
      freq,
      value,
      above,
      teamId,
      metricCat,
      defaultView
    }: {
      name: string
      freq: metrics_trackingFrequency
      value: number
      above: number
      teamId: number
      metricCat: number
      defaultView: number
    } = req.body

    const newMetric = await prisma.metrics.create({
      data: {
        metricName: name,
        trackingFrequency: freq,
        targetType: 'Simple'
      }
    })

    const metric_single = await prisma.metric_single_target.create({
      data: {
        metricId: newMetric.id,
        targetValue: value,
        above: above
      }
    })

    const team_metric = await prisma.team_metrics.create({
      data: {
        metricId: newMetric.id,
        teamId: teamId,
        metricCategoryId: metricCat,
        metricRowId: 1,
        creator: 1,
        defaultView: defaultView
      }
    })

    const { ...teamMetricClean } = team_metric
    const { id, created_at, updated_at, ...newMetricClean } = newMetric

    const output = {
      ...teamMetricClean,
      ...newMetricClean,
      metric_single_target: metric_single.targetValue,
      metric_single_target_above: metric_single.above,
      deleted: false
    }
    return res.status(201).json(output)
  } catch (err) {
    console.log('error:', err)
    return res.status(500).send(err)
  }
}

export async function importMetric(req: Request, res: Response) {
  try {
    const {
      metricId,
      teamId,
      rowId,
      metricCat,
      defaultView
    }: {
      metricId: number
      teamId: number
      rowId: number
      metricCat: number
      defaultView: number
    } = req.body

    const team_metric = await prisma.team_metrics.create({
      data: {
        metricId: metricId,
        teamId: teamId,
        metricCategoryId: metricCat,
        metricRowId: rowId,
        creator: 0,
        defaultView: defaultView
      }
    })
    return res.status(201).send(team_metric)
  } catch (err) {
    console.log('error:', err)
    return res.status(500).send(err)
  }
}

export async function getMetricCategoriesByTeam(req: Request, res: Response) {
  try {
    const teamId = parseInt(req.query.teamId as string)

    const metricCat = await prisma.metric_category.findMany({
      where: {
        teamId: teamId
      },
      select: {
        id: true,
        categoryName: true,
        columnId: true
      }
    })
    return res.status(201).send(metricCat)
  } catch (err) {
    console.log('error:', err)
    return res.status(500).send(err)
  }
}

export async function updateMetricColumn(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    const {
      columnId,
      categoryName
    }: { columnId: number; categoryName: string } = req.body

    const temp = await prisma.metric_category.findFirst({
      where: {
        id: id
      }
    })

    if (!temp) {
      return res.status(400).send('Column does not exist')
    }

    if (temp.categoryName !== categoryName || temp.columnId !== columnId) {
      await prisma.metric_category.update({
        where: {
          id: id
        },
        data: {
          columnId: columnId,
          categoryName: categoryName
        }
      })

      // noop
      return res.status(200).send('Column updated successfully')
    }

    return res.status(200)
  } catch (err) {
    console.log('error:', err)
    return res.status(500).send(err)
  }
}

export async function updateMetric(req: Request, res: Response) {
  try {
    const metricId = parseInt(req.params.metricId)
    const {
      teamId,
      rowId,
      metricCat,
      metricName
    }: {
      teamId: number
      rowId: number
      metricCat: number
      metricName: string
    } = req.body

    const tempMetric = await prisma.team_metrics.findFirst({
      where: {
        metricId: metricId,
        teamId: teamId
      }
    })

    if (!tempMetric) {
      return res.status(400).send('Team metric does not exist')
    }

    let creator = 0

    if (tempMetric && tempMetric.creator == 1) {
      creator = 1
    }

    await prisma.team_metrics.updateMany({
      where: {
        metricId: metricId,
        teamId: teamId
      },
      data: {
        metricRowId: rowId,
        metricCategoryId: metricCat
        // defaultView: input.defaultView
      }
    })

    if (creator) {
      await prisma.metrics.updateMany({
        where: {
          id: metricId,
          metricName: {
            not: metricName
          }
        },
        data: {
          metricName: metricName
        }
      })
    } else {
      return res
        .status(403)
        .send('Metric name not updated as team is not creator.')
    }
    return res.status(200).send('Metric updated successfully')
  } catch (err) {
    console.log('error:', err)
    return res.status(500).send(err)
  }
}

export async function deleteTeamMetric(req: Request, res: Response) {
  try {
    const metricId = parseInt(req.params.metricId)
    const teamId = parseInt(req.query.teamId as string)

    const tempMetric = await prisma.team_metrics.findFirst({
      where: {
        metricId: metricId,
        teamId: teamId
      }
    })

    if (!tempMetric) {
      return res.status(400).send('Team metric does not exist')
    }

    let creator = 0

    if (tempMetric && tempMetric.creator) {
      creator = 1
    }

    if (creator) {
      await prisma.team_metrics.deleteMany({
        where: {
          metricId: metricId
        }
      })
      return res.status(200).send('Metric (and metric references) deleted')
    } else {
      await prisma.team_metrics.deleteMany({
        where: {
          metricId: metricId,
          teamId: teamId
        }
      })
      return res.status(200).send('Metric reference deleted')
    }
  } catch (err) {
    console.log('error:', err)
    return res.status(500).send(err)
  }
}
