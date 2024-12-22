import { createSlice, current } from "@reduxjs/toolkit";
import { IMetric } from "../../../src/types/metric";
import _ from "lodash";

const initialState: IMetricSlice = {
  metrics: [],
  metricsSnapshot: null,
  selectedMetricId: -1,
};

const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    addMetric(state: IMetricSlice, action: { payload: IMetric }) {
      const columnId = action.payload.metricCategoryId;

      _.filter(state.metrics, { metricCategoryId: columnId }).forEach(
        (metric: IMetric) => {
          metric.metricRowId += 1;
        }
      );

      state.metrics.push(action.payload);
    },
    updateMetric(state: IMetricSlice, action: { payload: IMetric }) {
      const index = _.findIndex(state.metrics, {
        metricId: action.payload.metricId,
      });

      if (index !== -1) {
        state.metrics[index] = action.payload;
      }
    },
    deleteMetricById(state: IMetricSlice, action: { payload: number }) {
      const index = _.findIndex(state.metrics, {
        metricId: action.payload,
      });

      if (index !== -1) {
        state.metrics[index].deleted = true;
      }
    },
    metricLoaded(state: IMetricSlice, action: { payload: IMetric[] }) {
      state.metrics = action.payload;
    },
    takeMetricSnapshot(state: IMetricSlice) {
      state.metricsSnapshot = _.cloneDeep(state.metrics);
    },
    restoreMetricSnapshot(state: IMetricSlice) {
      if (state.metricsSnapshot) {
        state.metrics = _.cloneDeep(state.metricsSnapshot);
        state.metricsSnapshot = null;
      }
    },
    commitMetricSnapshot(state: IMetricSlice) {
      if (state.metricsSnapshot) {
        state.metricsSnapshot = null;
      }
    },
    updateMetricPosition(
      state: IMetricSlice,
      action: {
        payload: { metricId: string; old_categoryId: number; old_index: number, new_categoryId: number; new_index: number};
      }
    ) {
      const { metricId, old_categoryId, old_index, new_categoryId, new_index } = action.payload;
      let metric: IMetric | undefined;

      if (metricId.startsWith("temp")) {
        metric = _.find(state.metrics, { metricId });
      } else {
        metric = _.find(state.metrics, { metricId: +metricId });
      }
      // console.log(action.payload)

      if (!metric) {
        return;
      }

      // STEP 1: Relocate ALL Metrics in affected Column
      // console.log(current(metric))
      const old_columnMetrics: IMetric[] = _.filter(
        state.metrics,
        (item: IMetric) =>
          item.metricCategoryId === old_categoryId && item.metricId !== metricId
      );
      const old_sortedColumnMetrics: IMetric[] = _.sortBy(
        old_columnMetrics,
        "metricRowId"
      );

      _.forEach(old_sortedColumnMetrics, (item) => {
        if (
          item.metricRowId > old_index
        ) {
          // Moving upwards
          item.metricRowId -= 1;
          item.mutated = true;
        }
      });

      const new_columnMetrics: IMetric[] = _.filter(
        state.metrics,
        (item: IMetric) =>
          item.metricCategoryId === new_categoryId && item.metricId !== metricId
      );
      const new_sortedColumnMetrics: IMetric[] = _.sortBy(
        new_columnMetrics,
        "metricRowId"
      );

      _.forEach(new_sortedColumnMetrics, (item) => {
        if (
          item.metricRowId >= new_index
        ) {
          // Moving downwards
          item.metricRowId += 1;
          item.mutated = true;
        }
      });

      // STEP 2: Reassign Row and Category
      metric.metricRowId = new_index;
      metric.metricCategoryId = new_categoryId;
      metric.mutated = true;
    },
  },
});

export const selectAllMetrics = (state: { metrics: { metrics: IMetric[] } }) =>
  state.metrics.metrics;

export const selectMetricById = (
  state: { metrics: { metrics: IMetric[] } },
  metricId: number
) => {
  return _.find(state.metrics.metrics, { metricId });
};

export const selectMetricsByCategoryId = (
  state: { metrics: { metrics: IMetric[] } },
  metricCategoryId: number | null
) => {
  if (metricCategoryId) {
    return _.filter(state.metrics.metrics, { metricCategoryId }).sort(
      (x: IMetric, y: IMetric) => x.metricRowId - y.metricRowId
    );
  }

  return [];
};

export const selectFirstMetricByCategoryId = (
  state: { metrics: { metrics: IMetric[] } },
  metricCategoryId: number
) => {
  return _.find(state.metrics.metrics, { metricCategoryId });
};

// Experimental Function
export const selectAllMetricsSorted = (state: {
  metrics: { metrics: IMetric[] };
}) => {
  const metricByCategory = _.sortBy(state.metrics.metrics, [
    "metricCategoryId",
    "metricRowId",
  ]);

  return metricByCategory;
};

export const {
  addMetric,
  updateMetric,
  metricLoaded,
  takeMetricSnapshot,
  restoreMetricSnapshot,
  commitMetricSnapshot,
  deleteMetricById,
  updateMetricPosition,
} = metricsSlice.actions;

export default metricsSlice.reducer;

interface IMetricSlice {
  metrics: IMetric[];
  metricsSnapshot: IMetric[] | null;
  selectedMetricId: number;
}
