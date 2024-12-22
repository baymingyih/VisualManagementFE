import { z } from "zod";
import { getScheduledSubscription } from "../../controllers/billingsController";

export const getSubscriptionSchema = z.object({
    params: z.object({
        userId: z.string({
            required_error: "userId is required"
        })
    }),
})

export const updateBillingAccountSchema = z.object({
    params: z.object({
        customerId: z.string({
            required_error: "customerId is required"
        }),
    }),
    body: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        address3: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional()
    })
})

export const updateBillingFreqSchema = z.object({
    params: z.object({
        subscriptionId: z.string({
            required_error: "subscriptionId is required"
        }),
    }),
    body: z.object({
        newPlanId: z.string({
            required_error: "newPlanId is required"
        }),
        quantity: z.number({
            required_error: "quantity is required"
        })
    })
})

export const getScheduledSubscriptionSchema = z.object({
    params: z.object({
        subscriptionId: z.string({
            required_error: "subscriptionId is required"
        }),
    })
})

export const cancelScheduledChangesSchmea = z.object({
    params: z.object({
        subscriptionId: z.string({
            required_error: "subscriptionId is required"
        }),
    })
})

export const getItemPricesSchema = z.object({
    params: z.object({
        planId: z.string({
            required_error: "planId is required"
        }),
    })
})

export const getPaymentMethodsSchema = z.object({
    params: z.object({
        customerId: z.string({
            required_error: "customerId is required"
        }),
    })
})

export const updatePaymentMethodSchema = z.object({
    params: z.object({
        customerId: z.string({
            required_error: "customerId is required"
        }),
    }),
    body: z.object({
        paymentSourceId: z.string({
            required_error: "paymentSourceId is required"
        })
    })
})

export const removePaymentMethodSchema = z.object({
    params: z.object({
        paymentSourceId: z.string({
            required_error: "paymentSourceId is required"
        }),
    })
})

export const managePaymentSourcesHostedSchema = z.object({
    params: z.object({
        customerId: z.string({
            required_error: "customerId is required"
        }),
    })
})

export const cancelSubscriptionSchema = z.object({
    params: z.object({
        subscriptionId: z.string({
            required_error: "subscriptionId is required"
        }),
    })
})

export const editSubscriptionHostedSchema = z.object({
    params: z.object({
        subscriptionId: z.string({
            required_error: "subscriptionId is required"
        }),
    }),
    body: z.object({
        planId: z.string({
            required_error: "planId is required"
        }),
        quantity: z.number({
            required_error: "quantity is required"
        })
    })
})

export const refundCreditNotes = z.object({
    params: z.object({
        customerId: z.string({
            required_error: "customerId is required"
        }),
    })
})