import { z } from 'zod'

export const getByMonthSchema = z.object({
  query: z.object({
    metricId: z.string({
      required_error: 'metricId is required'
    }),
    dateString: z.string({
      required_error: 'dateString is required'
    })
  })
})

export const getByRangeSchema = z.object({
  query: z.object({
    metricId: z.string({
      required_error: 'metricId is required'
    }),
    dateStart: z.string({
      required_error: 'dateStart is required'
    }),
    dateEnd: z.string({
      required_error: 'dateEnd is required'
    })
  })
})

export const createMetricDataSchema = z.object({
  body: z.object({
    metricId: z.number({
      required_error: 'metricId is required'
    }),
    value: z.number({
      required_error: 'value is required'
    }),
    comment: z.string().optional(),
    dateString: z.string({
      required_error: 'dateString is required'
    }),
    updatedBy: z.number({
      required_error: 'updatedBy is required'
    }),
    comment_updatedBy: z.number().optional()
  })
})
export const updateMetricDataSchema = z.object({
  body: z.object({
    metricId: z.number({
      required_error: 'metricId is required'
    }),
    value: z.number({
      required_error: 'value is required'
    }),
    comment: z.string().optional(),
    dateString: z.string({
      required_error: 'dateString is required'
    }),
    updatedBy: z.number({
      required_error: 'updatedBy is required'
    }),
    comment_updatedBy: z.number().optional()
  })
})
