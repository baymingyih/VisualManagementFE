import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";
import { ITeam } from "../../../src/types/team";
import _ from "lodash";
import { IMetric } from "@/types/metric";

enum FilterEnum {
    WEEK = 0,
    MONTH = 1,
    YEAR = 2,
}

const initialState: UIState = {
    selectedColumnId: -1,
    formDrawerIsOpen: false,
    createMetricFormIsOpen: false,
    boardInViewMode: false,
    focusViewerOpen: false,
    selectedMetric: null,
    selectedFilterDate: moment().format("YYYY-MM-DD"),
    filterOptions: FilterEnum.MONTH,
    createActionFormIsOpen: false,
    teams: [],
    selectedTeam: {} as ITeam,
    createProjectFormIsOpen: false,
    editMetricFormIsOpen: false,
    refreshChartData: false,
    refreshMetricID: -1,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleFormDrawer(state: UIState) {
            if (state.createMetricFormIsOpen) {
                state.createMetricFormIsOpen = false;
            }

            state.formDrawerIsOpen = !state.formDrawerIsOpen;
        },
        toggleCreateMetricFormIsOpen(state: UIState) {
            state.createMetricFormIsOpen = !state.createMetricFormIsOpen;
        },
        toggleCreateActionFormIsOpen(state: UIState) {
            state.createActionFormIsOpen = !state.createActionFormIsOpen;
        },
        toggleCreateProjectFormisOpen(state: UIState) {
            state.createProjectFormIsOpen = !state.createProjectFormIsOpen;
        },
        toggleEditMetricFormIsOpen(state: UIState) {
            state.editMetricFormIsOpen = !state.editMetricFormIsOpen;
        },
        toggleBoardInViewMode(state: UIState) {
            state.boardInViewMode = !state.boardInViewMode;
        },
        toggleFocusViewer(state: UIState) {
            state.focusViewerOpen = !state.focusViewerOpen;
        },
        selectColumn(state: UIState, action: { payload: number }) {
            state.selectedColumnId = action.payload;
        },
        selectMetric(state: UIState, action: { payload: IMetric | null }) {
            state.selectedMetric = action.payload;
        },
        setSelectedFilterDate(state: UIState, action: { payload: string }) {
            state.selectedFilterDate = action.payload;
        },
        setFilterOption(state: UIState, action: { payload: FilterEnum }) {
            state.filterOptions = action.payload;
        },
        setTeam(state: UIState, action: { payload: ITeam[] }) {
            state.teams = action.payload;
        },
        setSelectedTeam(state: UIState, action: { payload: ITeam | number }) {
            const payload = action.payload;

            if (typeof payload === "object") {
                state.selectedTeam = payload;
            } else {
                const team: ITeam | undefined = _.find(state.teams, { id: payload });

                if (team) {
                    state.selectedTeam = team;
                }
            }
        },
        setRefreshChartData(
            state: UIState,
            action: { payload: { refresh: boolean; metricID?: number } }
        ) {
            state.refreshChartData = action.payload.refresh;

            if (action.payload && action.payload.metricID) {
                state.refreshMetricID = action.payload.metricID;
            } else {
                state.refreshMetricID = -1;
            }
        },
    },
});

export const getFormDrawerIsOpen = (state: { ui: UIState }) => state.ui.formDrawerIsOpen;

export const getCreateMetricFormIsOpen = (state: { ui: UIState }) =>
    state.ui.createMetricFormIsOpen;

export const getFocusModalIsOpen = (state: { ui: UIState }) => state.ui.focusViewerOpen;

export const getBoardInViewMode = (state: { ui: UIState }) => state.ui.boardInViewMode;

export const getSelectedColumnId = (state: { ui: UIState }) => state.ui.selectedColumnId;

export const getSelectedMetric = (state: { ui: UIState }) => state.ui.selectedMetric;

export const getFilterDate = (state: { ui: UIState }) => state.ui.selectedFilterDate;

export const getFilterOption = (state: { ui: UIState }) => state.ui.filterOptions;

export const getCreateActionFormIsOpen = (state: { ui: UIState }) =>
    state.ui.createActionFormIsOpen;

export const getTeams = (state: { ui: UIState }) => state.ui.teams;

export const getSelectedTeam = (state: { ui: UIState }) => state.ui.selectedTeam;

export const getCreateProjectFormIsOpen = (state: { ui: UIState }) =>
    state.ui.createProjectFormIsOpen;

export const getEditMetricFormIsOpen = (state: { ui: UIState }) => state.ui.editMetricFormIsOpen;

export const getRefreshChartData = (state: { ui: UIState }) => state.ui.refreshChartData;

export const getRefreshMetricID = (state: { ui: UIState }) => state.ui.refreshMetricID;

export const {
    selectColumn,
    toggleFormDrawer,
    toggleCreateMetricFormIsOpen,
    toggleBoardInViewMode,
    toggleFocusViewer,
    selectMetric,
    setSelectedFilterDate,
    setFilterOption,
    toggleCreateActionFormIsOpen,
    setTeam,
    setSelectedTeam,
    toggleCreateProjectFormisOpen,
    toggleEditMetricFormIsOpen,
    setRefreshChartData,
} = uiSlice.actions;

export default uiSlice.reducer;

interface UIState {
    selectedColumnId: number;
    formDrawerIsOpen: boolean;
    createMetricFormIsOpen: boolean;
    boardInViewMode: boolean;
    focusViewerOpen: boolean;
    selectedMetric: IMetric | null;
    selectedFilterDate: string;
    filterOptions: FilterEnum;
    createActionFormIsOpen: boolean;
    teams: ITeam[];
    selectedTeam: ITeam;
    createProjectFormIsOpen: boolean;
    editMetricFormIsOpen: boolean;
    refreshChartData: boolean;
    refreshMetricID: number;
}

interface SelectedMetric {
    metricId: number;
    metricCategoryId: number;
}
