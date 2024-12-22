import express from 'express'
import * as metricsController from '../controllers/metricsController'

import { validateInput } from '../middleware/zodValidator'
import * as metricsSchema from '../middleware/schemas/metricSchemas'

const router = express.Router()

router.get(
  '/',
  validateInput(metricsSchema.getMetricsByTeamSchema),
  metricsController.getMetricsByTeam
)
router.get(
  '/summary',
  validateInput(metricsSchema.getMetricsByTeamSchema),
  metricsController.getMetricSummaryForProject
)
router.post(
  '/simple',
  validateInput(metricsSchema.createSimpleMetricSchema),
  metricsController.createSimpleMetric
)
router.post(
  '/import',
  validateInput(metricsSchema.importMetricSchema),
  metricsController.importMetric
)
router.get(
  '/categories',
  validateInput(metricsSchema.getMetricCategoriesByTeamSchema),
  metricsController.getMetricCategoriesByTeam
)
router.patch(
  '/:metricId',
  validateInput(metricsSchema.updateMetricSchema),
  metricsController.updateMetric
)
router.delete(
  '/:metricId',
  validateInput(metricsSchema.deleteTeamMetricSchema),
  metricsController.deleteTeamMetric
)
router.patch(
  '/categories/:id',
  validateInput(metricsSchema.updateColumnSchema),
  metricsController.updateMetricColumn
)

export default router
