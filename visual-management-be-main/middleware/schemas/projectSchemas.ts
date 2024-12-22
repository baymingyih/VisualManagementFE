import { z } from "zod";

export const getProjectsSchema = z.object({
    query: z.object({
        teamId: z.string({
            required_error: "teamId is required"
        })
    }),
})

export const getProjectByIdSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        }),
    }),
})

export const createProjectSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: "title is required"
        }),
        problem: z.string({
            required_error: "problem is requried"
        }),
        goal: z.string({
            required_error: "goal is requried"
        }),
        teamId: z.number({
            required_error: "teamId is required"
        }),
        startDate: z.string({
            required_error: "startDate is required"
        }),
        dueDate: z.string({
            required_error: "dueDate is required"
        }),
        ownerId: z.number({
            required_error: "ownerId is required"
        })
    })
})

export const updateProjectSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        }),
    }),
    body: z.object({
        title: z.string().optional(),
        problem: z.string().optional(), 
        goal: z.string().optional(),
        analysis: z.string().optional(),
        results: z.string().optional(),
        status: z.number().optional(),
        startDate: z.string().optional(),
        dueDate: z.string().optional(),
        completedDate: z.string().optional(),
        ownerId: z.number().optional(),
        starred: z.number().optional()
   })
})

export const deleteProjectSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    })
})

export const getProjectMembersSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    })
})

export const addProjectMemberSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    }),
    body: z.object({
        userId: z.number({
            required_error: "userId is required"
        })
    })
})

export const deleteProjectMemberSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    }),
    body: z.object({
        userId: z.number({
            required_error: "userId is required"
        })
    })
})

export const getProjectActionsSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    })
})

export const addProjectActionSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    }),
    body: z.object({
        actionId: z.number({
            required_error: "actionId is required"
        })
    })
})

export const deleteProjectActionSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    }),
    body: z.object({
        actionId: z.number({
            required_error: "actionId is required"
        })
    })
})

export const getProjectMetricsSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    })
})

export const addProjectMetricSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    }),
    body: z.object({
        metricId: z.number({
            required_error: "metricId is required"
        })
    })
})

export const deleteProjectMetricSchema = z.object({
    params: z.object({
        projectId: z.coerce.number({
            required_error: "projectId is required"
        })
    }),
    body: z.object({
        metricId: z.number({
            required_error: "metricId is required"
        })
    })
})