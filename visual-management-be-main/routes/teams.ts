import express from "express";
import * as teamsController from '../controllers/teamsController'

import { validateInput } from "../middleware/zodValidator";
import * as teamsSchema from "../middleware/schemas/teamSchemas";

const router = express.Router();

router.get("/", validateInput(teamsSchema.getTeamsByOrgSchema), teamsController.getTeamsByOrg);
router.get("/full", validateInput(teamsSchema.getTeamsByOrgSchema), teamsController.getTeamsFullByOrg);
router.post("/", validateInput(teamsSchema.createTeamSchema), teamsController.createTeam);
router.delete("/", validateInput(teamsSchema.deleteMultipleTeamsSchema), teamsController.deleteMultipleTeams);
router.patch("/:teamId/name", validateInput(teamsSchema.updateTeamNameSchema), teamsController.updateTeamName);
router.patch("/:teamId/tier", validateInput(teamsSchema.updateTeamTierSchema), teamsController.updateTeamTier);
router.get("/:teamId/members", validateInput(teamsSchema.getMembersSchema), teamsController.getMembers);
router.get("/:teamId/membersFull", validateInput(teamsSchema.getMembersSchema), teamsController.getMembersFull);

router.post("/:teamId/member", validateInput(teamsSchema.addMemberSchema), teamsController.addMember);
router.post("/:teamId/memberById", validateInput(teamsSchema.addMemberByIdSchema), teamsController.addMemberById);
router.post("/:teamId/members", validateInput(teamsSchema.addMultipleUsersSchema), teamsController.addMultipleUsers);
router.delete("/:teamId/members", validateInput(teamsSchema.deleteMemberSchema), teamsController.deleteMultipleMembers);
router.patch("/:teamId/memberRole", validateInput(teamsSchema.updateMemberRoleSchema), teamsController.updateMemberRole);

export default router