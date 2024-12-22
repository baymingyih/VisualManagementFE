import express from 'express'
import * as metricDataController from '../controllers/metricDataController'

import { validateInput } from '../middleware/zodValidator'
import * as metricDataSchema from '../middleware/schemas/metricDataSchemas'

const router = express.Router()

router.get(
  '/getByMonth',
  validateInput(metricDataSchema.getByMonthSchema),
  metricDataController.getByMonth
)
router.get(
  '/getByRange',
  validateInput(metricDataSchema.getByRangeSchema),
  metricDataController.getByRange
)
router.post(
  '/',
  validateInput(metricDataSchema.createMetricDataSchema),
  metricDataController.createMetricData
)
router.put(
  '/',
  validateInput(metricDataSchema.updateMetricDataSchema),
  metricDataController.updateMetricData
)

export default router
