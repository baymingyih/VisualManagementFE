import express from "express";
import * as projectsController from "../controllers/projectsController";

import { validateInput } from "../middleware/zodValidator";
import * as projectsSchema from "../middleware/schemas/projectSchemas";

const router = express.Router();

router.get("/", validateInput(projectsSchema.getProjectsSchema), projectsController.getProjectsByTeam);
router.post("/", validateInput(projectsSchema.createProjectSchema), projectsController.createProject);
router.get("/ids", projectsController.getProjectIds);
router.get("/:projectId", validateInput(projectsSchema.getProjectByIdSchema), projectsController.getProjectById);
router.patch("/:projectId", validateInput(projectsSchema.updateProjectSchema), projectsController.updateProject);
router.delete("/:projectId", validateInput(projectsSchema.deleteProjectSchema), projectsController.deleteProject);

router.get("/:projectId/members", validateInput(projectsSchema.getProjectMembersSchema), projectsController.getProjectMembers);
router.post("/:projectId/members", validateInput(projectsSchema.addProjectMemberSchema), projectsController.addProjectMember);
router.delete("/:projectId/members", validateInput(projectsSchema.deleteProjectMemberSchema), projectsController.deleteProjectMember);

router.get("/:projectId/actions", validateInput(projectsSchema.getProjectActionsSchema), projectsController.getProjectActions);
router.post("/:projectId/actions", validateInput(projectsSchema.addProjectActionSchema), projectsController.addProjectAction);
router.delete("/:projectId/actions", validateInput(projectsSchema.deleteProjectActionSchema), projectsController.deleteProjectAction);

router.get("/:projectId/metrics", validateInput(projectsSchema.getProjectMetricsSchema), projectsController.getProjectMetrics);
router.post("/:projectId/metrics", validateInput(projectsSchema.addProjectMetricSchema), projectsController.addProjectMetric);
router.delete("/:projectId/metrics", validateInput(projectsSchema.deleteProjectMetricSchema), projectsController.deleteProjectMetric);

export default router