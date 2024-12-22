export interface IBillingAccount {
    customer_id: string
    billing_address: {
        first_name: string
        last_name: string
        email: string
        company: string
        phone: string | null
        line1: string
        line2: string | null
        line3: string | null
        city: string | null
        state: string | null
        country: string
        zip: string
        validation_status: string
        object: string
    }
}