import React, { useEffect, useState } from "react";
import { Button, Card, Spin } from "antd";

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
    getFilterDate,
    getFilterOption,
    getRefreshChartData,
    getRefreshMetricID,
    selectMetric,
    setRefreshChartData,
    toggleEditMetricFormIsOpen,
    toggleFocusViewer,
} from "../../../../redux/features/ui/uiSlice";
import ActionTitle from "./ActionTitle";
import { FilterEnum } from "@/types/filterEnum";
import MetricChart from "../MetricChart/MetricChart";
import MetricChartV2 from "../MetricChart/MetricChartV2";
import { IMetricChartData } from "@/types/metricChartData";
import { useQuery } from "@tanstack/react-query";
import { getMetricDataByMonth, getMetricDataByRange } from "@/pages/api/MetricDataAPI";
import moment from "moment";
import { metricDataLoaded } from "../../../../redux/features/metricData/metricDataSlice";

function ActionCardV2({ metricId }: IActionCardProps) {
    const dispatch = useDispatch();

    const metric: IMetric | undefined = useSelector((state: any) =>
        selectMetricById(state, metricId)
    );

    const [data, setData] = useState<IMetricChartData[]>([]);

    const selectedFilterOption: FilterEnum = useSelector(getFilterOption);
    const selectedFilterDate: string = useSelector(getFilterDate);

    const boardInViewMode: boolean = useSelector(getBoardInViewMode);

    const openFocusModal = () => {
        if (!boardInViewMode) {
            dispatch(selectMetric(metric || null));
            dispatch(toggleFocusViewer());
        }
    };

    const openEditMetricDrawer = () => {
        dispatch(selectMetric(metric || null));
        dispatch(toggleEditMetricFormIsOpen());
    };

    const deleteMetric = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        dispatch(deleteMetricById(metricId));
    };

    const refreshMetricID: number = useSelector(getRefreshMetricID);
    const shouldRefresh: boolean = useSelector(getRefreshChartData);

    useEffect(() => {
        if (shouldRefresh && refreshMetricID === metricId) {
            switch (selectedFilterOption) {
                case FilterEnum.MONTH:
                    getMonthData();
                    break;
                case FilterEnum.WEEK:
                    getWeekData();
                    break;
                case FilterEnum.YEAR:
                    getRangeData();
                    break;
            }

            dispatch(setRefreshChartData({ refresh: false, metricID: -1 }));
        }
    }, [shouldRefresh, refreshMetricID]);

    const isMonthFilter = selectedFilterOption === FilterEnum.MONTH;
    const isWeekFilter = selectedFilterOption === FilterEnum.WEEK;
    const isYearFilter = selectedFilterOption === FilterEnum.YEAR;

    const { refetch: getMonthData, isLoading: isMonthLoading } = useQuery({
        queryKey: [
            "metricsdata.getByMonth",
            { metricId: (metric && +metric?.metricId) || 0, date: selectedFilterDate },
        ],
        queryFn: () => getMetricDataByMonth((metric && +metric?.metricId) || 0, selectedFilterDate),
        onSuccess: ({ data }: { data: IMetricChartData[] }) => {
            dispatch(
                metricDataLoaded({
                    metricId: +metric!.metricId,
                    chartData: data,
                })
            );
            setData(data);
        },
        enabled: isMonthFilter,
    });

    const { refetch: getWeekData, isLoading: isWeekLoading } = useQuery({
        queryKey: [
            "metricsdata.getByWeek",
            {
                metricId: (metric && +metric?.metricId) || 0,
                dateStart: moment(selectedFilterDate).startOf("week").format("YYYY-MM-DD"),
                dateEnd: moment(selectedFilterDate).endOf("week").format("YYYY-MM-DD"),
            },
        ],
        queryFn: () =>
            getMetricDataByRange(
                (metric && +metric?.metricId) || 0,
                moment(selectedFilterDate).startOf("week").format("YYYY-MM-DD"),
                moment(selectedFilterDate).endOf("week").format("YYYY-MM-DD")
            ),
        onSuccess: ({ data }: { data: IMetricChartData[] }) => {
            dispatch(
                metricDataLoaded({
                    metricId: +metric!.metricId,
                    chartData: data,
                })
            );
            setData(data);
        },
        enabled: isWeekFilter,
    });

    const { refetch: getRangeData, isLoading: isDateRangeLoading } = useQuery({
        queryKey: [
            "metricsdata.getByDateRange",
            {
                metricId: (metric && +metric?.metricId) || 0,
                dateStart: moment(selectedFilterDate).startOf("year").format("YYYY-MM-DD"),
                dateEnd: moment(selectedFilterDate).endOf("year").format("YYYY-MM-DD"),
            },
        ],
        queryFn: () =>
            getMetricDataByRange(
                (metric && +metric?.metricId) || 0,
                moment(selectedFilterDate).startOf("year").format("YYYY-MM-DD"),
                moment(selectedFilterDate).endOf("year").format("YYYY-MM-DD")
            ),
        onSuccess: ({ data }: { data: IMetricChartData[] }) => {
            dispatch(
                metricDataLoaded({
                    metricId: +metric!.metricId,
                    chartData: data,
                })
            );
            setData(data);
        },
        enabled: isYearFilter,
    });

    const isLoading = isMonthFilter
        ? isMonthLoading
        : isWeekFilter
        ? isWeekLoading
        : isDateRangeLoading;

    return (
        <Draggable
            key={metricId}
            draggableId={metricId.toString()}
            index={metric?.metricRowId || 0}
            // index={listIndex}
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
                        {/* title={`${metricId}, ${listIndex}`}> */}
                        {/* title={`${metricId}, ${metric?.metricRowId || 0}`}> */}
                        {!boardInViewMode && (
                            <Spin spinning={isLoading}>
                                <div
                                    onClick={openFocusModal}
                                    style={{
                                        padding: 30,
                                        minHeight: 260,
                                    }}>
                                    {
                                        <MetricChartV2
                                            metricId={metricId}
                                            overview
                                            data={data}
                                            filterOption={selectedFilterOption}
                                        />
                                    }
                                </div>
                            </Spin>
                        )}
                    </Card>
                </div>
            )}
        </Draggable>
    );
}

interface IActionCardProps {
    metricId: number;
    // listIndex: number;
}

export default React.memo(ActionCardV2);
