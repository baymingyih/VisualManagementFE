import { z } from "zod";

export const getTeamsByOrgSchema = z.object({
    query: z.object({
        orgId: z.string({
            required_error: "orgId is required"
        })
    })
})

export const getMembersSchema = z.object({
    params: z.object({
        teamId: z.coerce.number({
            required_error: "teamId is required"
        })
    })
})

export const addMemberSchema = z.object({
    params: z.object({
        teamId: z.coerce.number({
            required_error: "teamId is required"
        })
    }),
    body: z.object({
        emailAddr: z.string({
            required_error: "emailAddr is required"
        }),
        role: z.number({
            required_error: "role is required"
        })
    })
})

export const addMemberByIdSchema = z.object({
    params: z.object({
        teamId: z.coerce.number({
            required_error: "teamId is required"
        })
    }),
    body: z.object({
        userId: z.number({
            required_error: "userId is required"
        }),
        role: z.number({
            required_error: "role is required"
        })
    })
})

export const addMultipleUsersSchema = z.object({
    params: z.object({
        teamId: z.coerce.number({
            required_error: "teamId is required"
        })
    }),
    body: z.object({
        teamUserObjs: z.object({
            userId: z.number({
                required_error: "userId is required"
            }),
            role: z.number({
                required_error: "role is required"
            })
        }).array().nonempty({
            message: "at least 1 teamUser is required"
        })
    })
})


export const deleteMemberSchema = z.object({
    params: z.object({
        teamId: z.coerce.number({
            required_error: "teamId is required"
        })
    }),
    body: z.object({
        userIds: z.number().array().nonempty({
            message: "at least 1 userId is required"
        })
    })
})

export const updateMemberRoleSchema = z.object({
    params: z.object({
        teamId: z.coerce.number({
            required_error: "teamId is required"
        })
    }),
    body: z.object({
        userId: z.number({
            required_error: "userId is required"
        }),
        role: z.number({
            required_error: "role is required"
        })
    })
})

export const createTeamSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: "name is required"
        }),
        orgId: z.number({
            required_error: "orgId is required"
        }),
        tier: z.number({
            required_error: "tier is required"
        }),
        reportsTo: z.number().optional()
    })
})

export const updateTeamNameSchema = z.object({
    params: z.object({
        teamId: z.coerce.number({
            required_error: "teamId is required"
        })
    }),
    body: z.object({
        name: z.string({
            required_error: "name is required"
        }),
    })
})

export const updateTeamTierSchema = z.object({
    params: z.object({
        teamId: z.coerce.number({
            required_error: "teamId is required"
        })
    }),
    body: z.object({
        tier: z.number({
            required_error: "tier is required"
        }),
        reportsTo: z.number().or(z.null()),
        oldReportsTo: z.number().optional()
    })
})

export const deleteMultipleTeamsSchema = z.object({
    body: z.object({
        teamIds: z.number().array().nonempty({
            message: "at least 1 teamId is required"
        })
    })
})