import { PrismaClient as PrismaClientMetricData } from '../prisma/generated/client_metricdata'
import { Request, Response } from 'express'
const prisma = new PrismaClientMetricData()

export async function getByMonth(req: Request, res: Response) {
  try {
    const { metricId, dateString } = req.query as {
      metricId: string
      dateString: string
    }

    const date = new Date(dateString)
    const month = date.getMonth()
    const year = date.getFullYear()

    const metricData = await prisma.metricData.findMany({
      where: {
        metricId: parseInt(metricId),
        dateTime: {
          gte: new Date(year, month, 1),
          lte: new Date(year, month + 1, 1)
        }
      },
      select: {
        metricId: true,
        value: true,
        comment: true,
        dateTime: true
      },
      orderBy: {
        dateTime: 'asc'
      }
    })
    return res.status(200).json(metricData)
  } catch (err) {
    console.log('error:', err)
    res.status(500).send(err)
  }
}

export async function getByRange(req: Request, res: Response) {
  try {
    const { metricId, dateStart, dateEnd } = req.query as {
      metricId: string
      dateStart: string
      dateEnd: string
    }

    const startDate = new Date(dateStart)
    const endDate = new Date(dateEnd)

    const metricData = await prisma.metricData.findMany({
      where: {
        metricId: parseInt(metricId),
        dateTime: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        metricId: true,
        value: true,
        comment: true,
        dateTime: true
      }
    })
    return res.status(200).json(metricData)
  } catch (err) {
    console.log('error:', err)
    res.status(500).send(err)
  }
}

export async function createMetricData(req: Request, res: Response) {
  try {
    const {
      metricId,
      value,
      comment,
      dateString,
      updatedBy,
      comment_updatedBy
    }: {
      metricId: number
      value: number
      comment: string | undefined
      dateString: string
      updatedBy: number
      comment_updatedBy: number | undefined
    } = req.body

    const dateStart = new Date(dateString)
    const dateEnd = new Date(dateStart)
    // dateEnd.setDate(dateEnd.getDate() + 1)

    const metricData = await prisma.metricData.findMany({
      where: {
        metricId: metricId,
        dateTime: {
          gte: dateStart,
          lte: dateEnd
        }
      },
      select: {
        metricId: true,
        value: true,
        comment: true,
        dateTime: true
      }
    })

    if (metricData.length > 0) {
      return res.status(400).send('Data for the specified date already exists')
    }

    const newData = await prisma.metricData.create({
      data: {
        metricId: metricId,
        value: value,
        comment: comment,
        dateTime: dateStart,
        updatedBy_userId: updatedBy,
        comment_updatedBy_userId: comment_updatedBy
      }
    })
    return res.status(201).json(newData)
  } catch (err) {
    console.log('error:', err)
    res.status(500).send(err)
  }
}

export async function updateMetricData(req: Request, res: Response) {
  try {
    const {
      metricId,
      value,
      comment,
      dateString,
      updatedBy,
      comment_updatedBy
    }: {
      metricId: number
      value: number
      comment: string | undefined
      dateString: string
      updatedBy: number
      comment_updatedBy: number | undefined
    } = req.body

    await prisma.metricData.update({
      where: {
        metricId: metricId
      },
      data: {
        value: value,
        comment: comment,
        dateTime: new Date(dateString),
        updatedBy_userId: updatedBy,
        comment_updatedBy_userId: comment_updatedBy
      }
    })

    const metricData = await prisma.metricData.findUnique({
      where: {
        metricId: metricId
      }
    })

    return res.status(200).json(metricData)
  } catch (err) {
    console.log('error:', err)
    res.status(500).send(err)
  }
}
