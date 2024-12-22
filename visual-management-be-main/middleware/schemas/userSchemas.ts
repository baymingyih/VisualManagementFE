import { z } from "zod";

export const getUsersByOrgSchema = z.object({
    query: z.object({
        orgId: z.string({
            required_error: "orgId is required"
        })
    })
})

export const getUserTeamsSchema = z.object({
    params: z.object({
        userId: z.string({
            required_error: "userId is required"
        })
    })
})

export const createUserSchema = z.object({
    body: z.object({
        firstName: z.string({
            required_error: "firstName is required"
        }),
        lastName: z.string({
            required_error: "lastName is required"
        }),
        email: z.string().optional(),
        organisationId: z.number({
            required_error: "organisationId is required"
        }),
        orgAdmin: z.number({
            required_error: "orgAdmin is required"
        }),
        external: z.number({
            required_error: "external is required"
        })
    })
})

export const inactivateMultipleUsersSchema = z.object({
    query: z.object({
        userIds: z.string({
            required_error: "userIds is required"
        })
    })
})

export const updateUserSchema = z.object({
    params: z.object({
        userId: z.string({
            required_error: "userId is required"
        })
    }),
    body: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        orgAdmin: z.number().optional()
    })
})

export const addMultipleTeamSchema = z.object({
    params: z.object({
        userId: z.string({
            required_error: "userId is required"
        })
    }),
    body: z.object({
        teamUserObjs: z.object({
            teamId: z.number({
                required_error: "teamId is required"
            }),
            role: z.number({
                required_error: "role is required"
            })
        }).array().nonempty({
            message: "at least 1 teamUser is required"
        })
    })
})

export const deleteMultipleTeamsSchema = z.object({
    params: z.object({
        userId: z.string({
            required_error: "userId is required"
        })
    }),
    body: z.object({
        teamIds: z.number().array().nonempty({
            message: "at least 1 teamId is required"
        })
    })
})

export const eraseMultipleUsersSchema = z.object({
    body: z.object({
        userIds: z.number({
            required_error: "userId is required"
        }).array().nonempty({
            message: "at least 1 userId is required"
        })
    })
})