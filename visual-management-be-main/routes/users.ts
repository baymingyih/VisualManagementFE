import express from "express";
import * as usersController from '../controllers/usersController'

import { validateInput } from "../middleware/zodValidator";
import * as usersSchema from "../middleware/schemas/userSchemas";

const router = express.Router();

router.get("/", validateInput(usersSchema.getUsersByOrgSchema), usersController.getUsersByOrg);
router.get("/:userId/teams", validateInput(usersSchema.getUserTeamsSchema), usersController.getUserTeams);
router.post("/", validateInput(usersSchema.createUserSchema), usersController.createUser);
router.patch("/inactivate", validateInput(usersSchema.inactivateMultipleUsersSchema), usersController.inactivateMultipleUsers);
router.patch("/:userId", validateInput(usersSchema.updateUserSchema), usersController.updateUser);
router.delete("/", validateInput(usersSchema.eraseMultipleUsersSchema), usersController.eraseMultipleUsers);

router.post("/:userId/teams", validateInput(usersSchema.addMultipleTeamSchema), usersController.addMultipleTeams);
router.delete("/:userId/teams", validateInput(usersSchema.deleteMultipleTeamsSchema), usersController.deleteMultipleTeams);

export default router