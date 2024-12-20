import { configureStore } from "@reduxjs/toolkit";

import metricsSlice from "./features/metrics/metricsSlice";
import uiSlice from "./features/ui/uiSlice";
import columnsSlice from "./features/columns/columnsSlice";
import metricDataSlice from "./features/metricData/metricDataSlice";

export default configureStore({
    reducer: {
        metrics: metricsSlice,
        ui: uiSlice,
        columns: columnsSlice,
        metricDataGroup: metricDataSlice,
    },
});
