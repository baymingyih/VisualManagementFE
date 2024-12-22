import axios from "axios";

export const getSubscriptionInfo = async (userId: number) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/subscriptions/${String(userId)}`
    );
};

export const updateBillingAccount = async (obj: any) => {
    let { customerId, ...body } = obj;
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/billingAcc/${obj.customerId}`,
        body
    );
};

export const updateBillingFreq = async (obj: any) => {
    let { subscriptionId, ...body } = obj;
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/billingFreq/${obj.subscriptionId}`,
        body
    );
};

export const getScheduledSubscription = async (subscriptionId: string) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/subscription/scheduled/${subscriptionId}`
    );
};

export const cancelScheduledChanges = async (subscriptionId: string) => {
    return await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/subscription/scheduled/${subscriptionId}`
    );
};

export const getItemPrices = async (planId: string) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/billing/itemPrices/${planId}`);
};

export const getPaymentMethods = async (customerId: string) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/paymentMethods/${customerId}`
    );
};

export const updatePaymentMethod = async (obj: any) => {
    let { customerId, ...body } = obj;
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/customer/paymentMethod/${obj.customerId}`,
        body
    );
};

export const removePaymentMtd = async (paymentSourceId: string) => {
    return await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/paymentMethod/${paymentSourceId}`
    );
};

export const managePaymentSourcesHosted = async (customerId: string) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/customer/paymentMethodsHosted/${customerId}`
    );
};

export const cancelSubscription = async (subscriptionId: string) => {
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/subscription/cancel/${subscriptionId}`
    );
};

export const unCancelSubscription = async (subscriptionId: string) => {
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/subscription/uncancel/${subscriptionId}`
    );
};

export const editSubscriptionHosted = async (obj: any) => {
    let { subscriptionId, ...body } = obj;
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/subscription/editSubscriptionHosted/${obj.subscriptionId}`,
        body
    );
};

export const getAllItemPrices = async () => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/billing/itemPrices`);
};

export const refundCreditNotes = async (customerId: string) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/billing/customer/refundCredits/${customerId}`
    );
};
