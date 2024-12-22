import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { IMetricChartData } from "../../../src/types/metricChartData";
import moment from "moment";

const initialState: IMetricDataSlice = {
    metricDataGroup: [],
};

const metricDataSlice = createSlice({
    name: "metricData",
    initialState,
    reducers: {
        addMetricDataEntry(state: IMetricDataSlice, action: { payload: IMetricChartData }) {
            const metricChartData = action.payload;

            const metricDataGroup = _.find(state.metricDataGroup, {
                metricId: metricChartData.metricId,
            });

            if (!metricDataGroup) {
                return;
            }

            metricDataGroup.chartData.push(metricChartData);
        },
        updateMetricData(state: IMetricDataSlice, action: { payload: IMetricChartData }) {
            const metricDataIdx = _.findIndex(state.metricDataGroup, {
                metricId: action.payload.metricId,
            });

            if (metricDataIdx === -1) {
                return;
            }

            const metricDataEntryIdx = _.findIndex(state.metricDataGroup[metricDataIdx].chartData, {
                dateTime: action.payload.dateTime,
            });

            if (metricDataEntryIdx === -1) {
                return;
            }

            state.metricDataGroup[metricDataIdx].chartData[metricDataEntryIdx] = action.payload;
        },
        // deleteMetricById(state: IMetricSlice, action: { payload: number }) {
        //   const index = _.findIndex(state.metrics, {
        //     metricId: action.payload
        //   })

        //   if (index !== -1) {
        //     state.metrics.splice(index, 1)
        //   }
        // },
        metricDataLoaded(
            state: IMetricDataSlice,
            action: { payload: { metricId: number; chartData: IMetricChartData[] } }
        ) {
            const index = _.findIndex(state.metricDataGroup, {
                metricId: action.payload.metricId,
            });

            if (index !== -1) {
                state.metricDataGroup[index] = action.payload;
            } else {
                state.metricDataGroup.push(action.payload);
            }
        },
    },
});

export const selectMetricDataById = (
    state: {
        metricDataGroup: { metricDataGroup: IMetricDataGroup[] };
    },
    metricId: number
) => {
    return _.find(state.metricDataGroup.metricDataGroup, { metricId })?.chartData;
};

export const getLastMetricEntryByIdAndDate = (
    state: {
        metricDataGroup: { metricDataGroup: IMetricDataGroup[] };
    },
    metricId: number,
    date: string
) => {
    const metricDataGroup = _.find(state.metricDataGroup.metricDataGroup, {
        metricId,
    });

    if (!metricDataGroup) {
        return;
    }

    const dateStr = moment(date).format("DD/MM");

    const metricData = _.find(metricDataGroup.chartData, (metricData) => {
        return metricData.dateTime === dateStr;
    });

    if (!metricData) {
        return;
    }

    return metricData;
};

export const getMetricDataByDate = (
    state: {
        ui: { selectedFilterDate: string };
        metricDataGroup: { metricDataGroup: IMetricDataGroup[] };
    },
    metricId: number,
    filterDate?: string
) => {
    const metricDataGroup = _.find(state.metricDataGroup.metricDataGroup, {
        metricId,
    });

    if (!metricDataGroup) {
        return;
    }

    const currDate = filterDate || moment(state.ui.selectedFilterDate);

    const metricData = _.find(metricDataGroup.chartData, (metricData) => {
        const metricDate = moment(metricData.dateTime);
        return metricDate.isSame(currDate, "day");
    });

    if (!metricData) {
        return;
    }

    return metricData;
};

export const { addMetricDataEntry, metricDataLoaded, updateMetricData } = metricDataSlice.actions;
export default metricDataSlice.reducer;

interface IMetricDataSlice {
    metricDataGroup: IMetricDataGroup[];
}

interface IMetricDataGroup {
    metricId: number;
    chartData: IMetricChartData[];
}
