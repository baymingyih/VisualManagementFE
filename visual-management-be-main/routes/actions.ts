import express from "express";
import * as actionsController from "../controllers/actionsController";

import { validateInput } from "../middleware/zodValidator";
import * as actionsSchema from "../middleware/schemas/actionSchemas";

const router = express.Router();

router.get("/", validateInput(actionsSchema.getActionsSchema), actionsController.getActionsByTeam);
router.get("/summary", validateInput(actionsSchema.getActionsSchema), actionsController.getActionSummaryForProjects);
router.post("/", validateInput(actionsSchema.createActionSchema), actionsController.createAction);
router.patch("/:actionId", validateInput(actionsSchema.updateActionSchema), actionsController.updateAction);
router.post("/:actionId/updatePIC", validateInput(actionsSchema.updatePICSchema), actionsController.updatePIC);
router.post("/:actionId/escalate", validateInput(actionsSchema.escalateActionSchema), actionsController.escalateAction);
router.delete("/:actionId", validateInput(actionsSchema.deleteActionSchema), actionsController.deleteAction);

router.delete("/", validateInput(actionsSchema.multipleActionsSchema), actionsController.deleteMultipleActions);
router.post("/complete", validateInput(actionsSchema.multipleActionsSchema), actionsController.completeMultipleActions);

export default router