import React, { useEffect, useRef, useState } from "react";
import Column from "../Column/Column";
import { IMetric } from "../../../types/metric";
import { useDispatch, useSelector } from "react-redux";
import {
    metricLoaded,
    updateMetricPosition,
} from "../../../../redux/features/metrics/metricsSlice";
import FormDrawer from "../FormDrawer/FormDrawer";

import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { columnsLoaded, selectAllColumns } from "../../../../redux/features/columns/columnsSlice";
import { IColumn } from "../../../types/column";
import { getSelectedTeam } from "../../../../redux/features/ui/uiSlice";
import { ITeam } from "../../../types/team";
import { useQuery } from "@tanstack/react-query";
import { getMetricCategoriesByTeam, getMetricsByTeam } from "@/pages/api/MetricAPI";

function Board() {
    const dispatch = useDispatch();

    const columns: IColumn[] = useSelector(selectAllColumns);
    const selectedTeam: ITeam = useSelector(getSelectedTeam);
    const { id: selectedTeamID } = selectedTeam || 0;



    const { refetch: fetchMetric } = useQuery({
        queryKey: ["metrics_getMetrics"],
        queryFn: () => getMetricsByTeam(selectedTeamID),
        onSuccess: ({ data }: { data: IMetric[] }) => {
            dispatch(metricLoaded(data));
        },
        enabled: false,
    });

    const { refetch: fetchMetricCat } = useQuery({
        queryKey: ["metrics_getMetricCategory"],
        queryFn: () => getMetricCategoriesByTeam(selectedTeamID),
        onSuccess: ({ data }: { data: IColumn[] }) => {
            dispatch(columnsLoaded(data));
            fetchMetric();
        },
        enabled: false,
    });

    useEffect(() => {
        if (selectedTeamID) {
            fetchMetricCat();
            return;
        }
    }, [selectedTeamID, fetchMetricCat]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }
        // console.log(result);

        const payload = {
            metricId: result.draggableId,
            new_categoryId: +result.destination.droppableId,
            new_index: result.destination.index,
            old_categoryId: +result.source.droppableId,
            old_index: result.source.index,
        };

        dispatch(updateMetricPosition(payload));
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div
                style={{
                    display: "flex",
                    backgroundColor: "#DEDEDE",
                    alignItems: "stretch",
                    minHeight: "100%",
                    height: '100%',
                }}>
                {columns.map((column: IColumn, index: number) => {
                    return <Column key={column.id} id={column.id} columnId={column.columnId} category={column.categoryName} isLastColumn={index !== columns.length - 1} />;
                })}
            </div>
            <FormDrawer />
        </DragDropContext>
    );
}

export default Board;
