import { z } from "zod";

export const getOrgByIdSchema = z.object({
    params: z.object({
        orgId: z.coerce.number({
            required_error: "orgId is required"
        }),
    }),
})

export const updateOrgSchema = z.object({
    params: z.object({
        orgId: z.coerce.number({
            required_error: "orgId is required"
        }),
    }),
    body: z.object({
        name: z.string({
            required_error: "name is required"
        }),
    })
})