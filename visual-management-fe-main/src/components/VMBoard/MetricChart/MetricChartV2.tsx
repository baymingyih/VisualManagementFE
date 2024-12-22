import { IMetricChartData, IMetricDataGroup } from "@/types/metricChartData";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceArea,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    metricDataLoaded,
    selectMetricDataById,
} from "../../../../redux/features/metricData/metricDataSlice";
import moment from "moment";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { IMetric } from "@/types/metric";
import { selectMetricById } from "../../../../redux/features/metrics/metricsSlice";
import {
    getFilterDate,
    getFilterOption,
    getRefreshChartData,
    getRefreshMetricID,
} from "../../../../redux/features/ui/uiSlice";
import { FilterEnum } from "@/types/filterEnum";
import _ from "lodash";
import { getMetricDataByMonth, getMetricDataByRange } from "@/pages/api/MetricDataAPI";
import { Spin } from "antd";

function MetricChartV2(props: IMetricChartProps) {
    const metric: IMetric | undefined = useSelector((state: any) =>
        selectMetricById(state, props.metricId)
    );

    const selectedFilterDate: string = useSelector(getFilterDate);
    const selectedFilterOption: FilterEnum = useSelector(getFilterOption);

    const processedData = useMemo(() => {
        let pData = props.data || [];

        const startDate = moment(selectedFilterDate);
        let isByYear = false;
        let numDays = 0;

        let displayFilterOption = props.filterOption ?? selectedFilterOption;

        switch (displayFilterOption) {
            case FilterEnum.WEEK:
                startDate.startOf("week");
                numDays = 7;
                break;
            case FilterEnum.MONTH:
                startDate.startOf("month");
                numDays = startDate.daysInMonth();
                break;
            case FilterEnum.YEAR:
                isByYear = true;
                break;
        }

        const res: IMetricChartData[] = [];

        if (isByYear) {
            const result: Record<string, IMetricChartData> = {};
            let current = startDate.clone().startOf("year");
            let end = startDate.clone().endOf("year");

            while (current.isSameOrBefore(end)) {
                result[current.format("MMM")] = {
                    metricId: 0,
                    value: 0,
                    dateTime: current.format("MMM"),
                };
                current.add(1, "month");
            }

            // Accumulate values for each month
            pData.forEach((item) => {
                const monthKey = moment(item.dateTime).format("MMM");

                if (result[monthKey]) {
                    result[monthKey].value! += item.value || 0;
                }
            });

            for (const key in result) {
                const item = result[key];
                res.push({
                    metricId: (metric?.metricId as number) || 0,
                    dateTime: item.dateTime,
                    value: item.value,
                });
            }
        } else {
            for (let i = 0; i < numDays; i++) {
                const item = _.find(pData, (item) => {
                    return moment(item.dateTime).isSame(startDate, "day");
                });

                const metricDataEntry = {
                    metricId: (metric?.metricId as number) || 0,
                    dateTime: startDate.format("DD/MM"),
                };

                if (item) {
                    res.push({
                        ...metricDataEntry,
                        value: item.value,
                        comment: item.comment,
                    });
                } else {
                    res.push(metricDataEntry);
                }

                startDate.add(1, "days");
            }
        }

        return res;
    }, [props.data, props.filterOption]);

    const getLargestValue = () => {
        if (props.data) {
            const max = _.maxBy(props.data, (item: IMetricChartData) => item.value);

            const maxValue = max?.value === undefined ? Number.MIN_SAFE_INTEGER : max.value;
            const targetValue = metric?.metric_single_target || 0;

            return Math.max(maxValue, targetValue) + 10;
        }

        return 0;
    };

    const getSmallestValue = () => {
        if (props.data) {
            const min = _.minBy(props.data, (item: IMetricChartData) => item.value);

            const minValue = min?.value === undefined ? Number.MAX_SAFE_INTEGER : min.value;
            const targetValue = metric?.metric_single_target || 0;

            return Math.min(minValue, targetValue) - 10;
        }

        return 0;
    };

    const getRedBoundary = useCallback(() => {
        if (metric?.metric_single_target_above) {
            return (
                <ReferenceArea
                    y2={metric?.metric_single_target}
                    ifOverflow="hidden"
                    fill="#FFEBEE"
                />
            );
        }

        return (
            <ReferenceArea y1={metric?.metric_single_target} ifOverflow="hidden" fill="#FFEBEE" />
        );
    }, [metric?.metric_single_target, metric?.metric_single_target_above]);

    const getGreenBoundary = useCallback(() => {
        const targetValue = metric?.metric_single_target || 0;

        if (metric?.metric_single_target_above) {
            return <ReferenceArea y1={targetValue} ifOverflow="hidden" fill="#ECF7ED" />;
        }

        return <ReferenceArea y2={targetValue} ifOverflow="hidden" fill="#ECF7ED" />;
    }, [metric?.metric_single_target, metric?.metric_single_target_above]);

    return (
        <ResponsiveContainer
            height={props.height ? props.height : props.overview ? 200 : 500}
            width="100%">
            <LineChart
                data={processedData}
                height={props.height ? props.height : props.overview ? 200 : 500}
                margin={{ left: -30 }}>
                <CartesianGrid horizontal vertical={false} />
                <XAxis dataKey="dateTime" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[getSmallestValue(), getLargestValue()]} />

                <Tooltip
                    content={<CustomTooltip isOverview={props.overview} />}
                    wrapperStyle={{ zIndex: 1000 }}
                />
                {getGreenBoundary()}
                {getRedBoundary()}
                <ReferenceLine
                    y={metric?.metric_single_target}
                    stroke="red"
                    strokeDasharray="3 3"
                />
                <Line
                    type="linear"
                    dataKey="value"
                    stroke="#343434"
                    connectNulls
                    dot={{ stroke: "black", fill: "black", strokeWidth: 0.1 }}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

function CustomTooltip({ active, payload, label, isOverview }: any) {
    if (active && payload && payload.length) {
        const { payload: data } = payload[0];
        return (
            <div
                style={{
                    backgroundColor: "white",
                    border: "1px solid #d9d9d9",
                    padding: 5,
                    opacity: 0.8,
                }}>
                <p>
                    <b>{label}</b>
                </p>
                <p>
                    <b>Value:{"\u00A0"}</b> {`${data.value}`}
                </p>
                <p style={{ margin: 0 }}>
                    <b>Comment:{"\u00A0"}</b>
                    {!!data.comment ? `${data.comment}` : "N/A"}
                </p>
            </div>
        );
    }

    return null;
}

export default MetricChartV2;

interface IMetricChartProps {
    metricId: number;
    overview?: boolean | false;
    filterOption?: FilterEnum;
    height?: number;
    isolated?: boolean;
    data: IMetricChartData[];
}
