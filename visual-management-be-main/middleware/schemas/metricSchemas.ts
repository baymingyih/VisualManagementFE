import { z } from 'zod'
import { metrics_trackingFrequency } from '../../prisma/generated/client_main'

export const getMetricsByTeamSchema = z.object({
  query: z.object({
    teamId: z.string({
      required_error: 'teamId is required'
    })
  })
})

export const createSimpleMetricSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required'
    }),
    freq: z.nativeEnum(metrics_trackingFrequency),
    value: z.number({
      required_error: 'value is required'
    }),
    above: z
      .number({
        required_error: 'above is required'
      })
      .gte(0)
      .lte(1)
      .int(),
    teamId: z.number({
      required_error: 'teamId is required'
    }),
    metricCat: z.number({
      required_error: 'metricCat is required'
    }),
    defaultView: z
      .number({
        required_error: 'defaultView is required'
      })
      .gte(0)
      .lte(1)
      .int()
  })
})

export const importMetricSchema = z.object({
  body: z.object({
    metricId: z.number({
      required_error: 'metricId is required'
    }),
    teamId: z.number({
      required_error: 'teamId is required'
    }),
    rowId: z.number({
      required_error: 'rowId is required'
    }),
    metricCat: z.number({
      required_error: 'metricCat is required'
    }),
    defaultView: z
      .number({
        required_error: 'defaultView is required'
      })
      .gte(0)
      .lte(1)
      .int()
  })
})

export const getMetricCategoriesByTeamSchema = z.object({
  query: z.object({
    teamId: z.string({
      required_error: 'teamId is required'
    })
  })
})

export const updateMetricSchema = z.object({
  params: z.object({
    metricId: z.coerce.number({
      required_error: 'metricId is required'
    })
  }),
  body: z.object({
    teamId: z.number({
      required_error: 'teamId is required'
    }),
    rowId: z.number({
      required_error: 'rowId is required'
    }),
    metricCat: z.number({
      required_error: 'metricCat is required'
    }),
    metricName: z.string({
      required_error: 'metricName is required'
    })
  })
})

export const deleteTeamMetricSchema = z.object({
  params: z.object({
    metricId: z.coerce.number({
      required_error: 'metricId is required'
    })
  }),
  query: z.object({
    teamId: z.string({
      required_error: 'teamId is required'
    })
  })
})

export const updateColumnSchema = z.object({
  params: z.object({
    id: z.coerce.number({
      required_error: 'ID is required'
    })
  }),
  body: z.object({
    columnId: z.number({
      required_error: 'columnId is required'
    }),
    categoryName: z.string({
      required_error: 'categoryName is required'
    })
  })
})
