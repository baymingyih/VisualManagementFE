import { createSlice } from "@reduxjs/toolkit";
import { IColumn } from "../../../src/types/column";
import _ from "lodash";

const initialState: IColumnSlice = {
  columns: [],
  columnsSnapshot: null,
};

const columnsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    columnsLoaded(state: IColumnSlice, action: { payload: IColumn[] }) {
      state.columns = action.payload;
    },
    takeColumnSnapshot(state: IColumnSlice) {
      state.columnsSnapshot = _.cloneDeep(state.columns);
    },
    restoreColumnSnapshot(state: IColumnSlice) {
      if (state.columnsSnapshot) {
        state.columns = _.cloneDeep(state.columnsSnapshot);
        state.columnsSnapshot = null;
      }
    },
    commitColumnSnapshot(state: IColumnSlice) {
      if (state.columnsSnapshot) {
        state.columnsSnapshot = null;
      }
    },
    updateMetricColumn(
      state: IColumnSlice,
      action: {
        payload: {
          id: number;
          columnId: number;
          categoryName: string;
          edited?: boolean;
        };
      }
    ) {
      const { id, columnId, categoryName, edited } = action.payload;

      const column = _.find(state.columns, { id: id });
      if (!column) {
        return;
      }

      column.columnId = columnId;
      column.categoryName = categoryName;

      if (edited) {
        column.edited = edited;
      } else {
        column.edited = true;
      }
    },
  },
});

export const selectAllColumns = (state: { columns: { columns: IColumn[] } }) =>
  state.columns.columns;

export const selectColumnById = (
  state: { columns: { columns: IColumn[] } },
  id: number
) => {
  return _.find(state.columns.columns, { id });
};

export const {
  columnsLoaded,
  takeColumnSnapshot,
  restoreColumnSnapshot,
  updateMetricColumn,
  commitColumnSnapshot,
} = columnsSlice.actions;

export default columnsSlice.reducer;

interface IColumnSlice {
  columns: IColumn[];
  columnsSnapshot: IColumn[] | null;
}
