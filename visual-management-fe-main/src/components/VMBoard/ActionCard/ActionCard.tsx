import React from "react";
import { Button, Card } from "antd";

import _ from "lodash";
import { CloseCircleOutlined, CloseSquareOutlined } from "@ant-design/icons";

import { IMetric } from "../../../types/metric";
import { useDispatch, useSelector } from "react-redux";
import {
    selectMetricById,
    deleteMetricById,
} from "../../../../redux/features/metrics/metricsSlice";
import { Draggable } from "react-beautiful-dnd";
import {
    getBoardInViewMode,
    getFilterOption,
    selectMetric,
    toggleEditMetricFormIsOpen,
    toggleFocusViewer,
} from "../../../../redux/features/ui/uiSlice";
import ActionTitle from "./ActionTitle";
import { FilterEnum } from "@/types/filterEnum";
import MetricChart from "../MetricChart/MetricChart";
import MetricChartV2 from "../MetricChart/MetricChartV2";

function ActionCard({ metricId }: IActionCardProps) {
    const dispatch = useDispatch();

    const metric: IMetric | undefined = useSelector((state: any) =>
        selectMetricById(state, metricId)
    );

    const selectedFilterOption: FilterEnum = useSelector(getFilterOption);

    const boardInViewMode: boolean = useSelector(getBoardInViewMode);

    const openFocusModal = () => {
        dispatch(selectMetric(metric || null));
        dispatch(toggleFocusViewer());
    };

    const openEditMetricDrawer = () => {
        dispatch(selectMetric(metric || null));
        dispatch(toggleEditMetricFormIsOpen());
    };

    const deleteMetric = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        dispatch(deleteMetricById(metricId));
    };

    return (
        <Draggable
            key={metricId}
            draggableId={`${metricId}`}
            index={metric?.metricRowId || 0}
            isDragDisabled={!boardInViewMode}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}>
                    <Card
                        hoverable
                        bodyStyle={{
                            padding: 0,
                            margin: 0,
                        }}
                        extra={
                            boardInViewMode &&
                            metric?.creator && (
                                <Button
                                    type="link"
                                    icon={
                                        <CloseSquareOutlined
                                            style={{ color: "red", fontSize: "1.5rem" }}
                                        />
                                    }
                                    onClick={deleteMetric}></Button>
                            )
                        }
                        onClick={boardInViewMode ? openEditMetricDrawer : () => {}}
                        title={metric && <ActionTitle onClick={openFocusModal} metric={metric} />}>
                        {!boardInViewMode && (
                            <div
                                onClick={openFocusModal}
                                style={{
                                    padding: 30,
                                    minHeight: 260,
                                }}>
                                {
                                    <MetricChart
                                        metricId={metricId}
                                        overview
                                        filterOption={selectedFilterOption}
                                    />
                                }
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </Draggable>
    );
}

interface IActionCardProps {
    metricId: number;
}

export default React.memo(ActionCard);
