import express from "express";
import * as organisationsController from "../controllers/organisationsController";

import { validateInput } from "../middleware/zodValidator";
import * as organisationsSchema from "../middleware/schemas/organisationSchemas";

const router = express.Router();

router.get("/:orgId", validateInput(organisationsSchema.getOrgByIdSchema), organisationsController.getOrganisationById);
router.patch("/:orgId", validateInput(organisationsSchema.updateOrgSchema), organisationsController.updateOrganisation);

export default router