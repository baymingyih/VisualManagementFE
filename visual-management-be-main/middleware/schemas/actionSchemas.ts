import { z } from "zod";

export const getActionsSchema = z.object({
    query: z.object({
        teamId: z.string({
            required_error: "teamId is required"
        })
    }),
})

export const createActionSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: "title is required"
        }),
        description: z.string().optional(),
        priority: z.number({
            required_error: "priority is requried"
        }).lte(3).gte(1),
        teamId: z.number({
            required_error: "teamId is required"
        }),
        deadline: z.string({
            required_error: "deadline is required"
        }),
        picId: z.number().optional()
    })
})

export const updateActionSchema = z.object({
    params: z.object({
        actionId: z.coerce.number({
            required_error: "actionId is required"
        }),
    }),
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.number().lte(3).gte(1).optional(),
        deadline: z.string().optional(),
        status: z.number().lte(4).gte(1).optional(),
        completedDate: z.string().optional()
    })
})

export const updatePICSchema = z.object({
    params: z.object({
        actionId: z.coerce.number({
            required_error: "actionId is required"
        })
    }),
    body: z.object({
        userId: z.number({
            required_error: "userId is required"
        })
    })
})

export const escalateActionSchema = z.object({
    params: z.object({
        actionId: z.coerce.number({
            required_error: "actionId is required"
        })
    }),
    body: z.object({
        teamId: z.number({
            required_error: "teamId is required"
        })
    })
})

export const deleteActionSchema = z.object({
    params: z.object({
        actionId: z.coerce.number({
            required_error: "actionId is required"
        })
    })
})

export const multipleActionsSchema = z.object({
    body: z.object({
        actionIds: z.number({
            required_error: "actionId is required"
        }).array().nonempty({
            message: "at least 1 actionId is required"
        })
    })
})