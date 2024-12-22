import express from "express";
import * as billingsController from "../controllers/billingsController";

import { validateInput } from "../middleware/zodValidator";
import * as billingsSchema from "../middleware/schemas/billingSchemas";

const router = express.Router();

router.get("/subscriptions/:userId", validateInput(billingsSchema.getSubscriptionSchema), billingsController.getSubscriptions);
router.patch("/billingAcc/:customerId", validateInput(billingsSchema.updateBillingAccountSchema), billingsController.updateBillingAccount);
router.patch("/billingFreq/:subscriptionId", validateInput(billingsSchema.updateBillingFreqSchema), billingsController.updateBillingFreq);
router.get("/subscription/scheduled/:subscriptionId", validateInput(billingsSchema.getScheduledSubscriptionSchema), billingsController.getScheduledSubscription);
router.delete("/subscription/scheduled/:subscriptionId", validateInput(billingsSchema.cancelScheduledChangesSchmea), billingsController.cancelScheduledChanges);
router.get("/itemPrices/:planId", validateInput(billingsSchema.getItemPricesSchema), billingsController.getItemPrices);
router.get("/itemPrices", billingsController.getAllItemPrices);
router.get("/paymentMethods/:customerId", validateInput(billingsSchema.getPaymentMethodsSchema), billingsController.getPaymentMethods);
router.patch("/customer/paymentMethod/:customerId", validateInput(billingsSchema.updatePaymentMethodSchema), billingsController.updatePaymentMethod);
router.delete("/paymentMethod/:paymentSourceId", validateInput(billingsSchema.removePaymentMethodSchema), billingsController.removePaymentMethod);

router.get("/customer/paymentMethodsHosted/:customerId", validateInput(billingsSchema.managePaymentSourcesHostedSchema), billingsController.managePaymentSourcesHosted);
router.patch("/subscription/cancel/:subscriptionId", validateInput(billingsSchema.cancelSubscriptionSchema), billingsController.cancelSubscription);
router.patch("/subscription/uncancel/:subscriptionId", validateInput(billingsSchema.cancelSubscriptionSchema), billingsController.unCancelSubscription);
router.patch("/subscription/editSubscriptionHosted/:subscriptionId", validateInput(billingsSchema.editSubscriptionHostedSchema), billingsController.editSubscriptionHosted);

router.get("/customer/refundCredits/:customerId", validateInput(billingsSchema.refundCreditNotes), billingsController.refundCreditNotes);

export default router