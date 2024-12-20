import { useSelector } from "react-redux";
import { IMetric } from "../../../types/metric";
import { getBoardInViewMode } from "../../../../redux/features/ui/uiSlice";
import styles from "./ActionCard.module.css";
import EditableLabel from "./EditableLabel";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
    addMetricDataEntry,
    getLastMetricEntryByIdAndDate,
    getMetricDataByDate,
    updateMetricData,
} from "../../../../redux/features/metricData/metricDataSlice";
import { DbChartData, IMetricChartData } from "../../../types/metricChartData";
import React, { useCallback, useState } from "react";
import { Button, Collapse, Form, Input, InputNumber, Popover, Space, Typography, message } from "antd";
import { getFilterDate, setRefreshChartData } from "../../../../redux/features/ui/uiSlice";
import { useDispatch } from "react-redux";
import moment from "moment";
import { useMutation } from "@tanstack/react-query";
import { createSimpleMetric } from "@/pages/api/MetricAPI";
import { createMetricData, updateMetricData as putUpdateMetricData } from "@/pages/api/MetricDataAPI";
import CollapsePanel from "antd/lib/collapse/CollapsePanel";
import AddMetricDataButton from "../AddMetricDataButton/AddMetricDataButton";

const { TextArea } = Input;
const { Text } = Typography;
const { Panel } = Collapse;

function ActionTitle({ metric, onClick }: IActionTitleProps) {
    const boardInViewMode: boolean = useSelector(getBoardInViewMode);
    const lastEntry: IMetricChartData | undefined = useSelector((state: any) => getMetricDataByDate(state, +metric.metricId));

    const getMetricStatus = () => {
        if (lastEntry && lastEntry.value) {
            const threshold = metric.metric_single_target || 0;
            const above = metric.metric_single_target_above;

            if (above) {
                if (lastEntry.value >= threshold) {
                    return styles.statusGreen;
                }

                return styles.statusRed;
            } else {
                if (lastEntry.value < threshold) {
                    return styles.statusGreen;
                }

                return styles.statusRed;
            }
        }
    };


    return (
        <>
            {!boardInViewMode && <div className={getMetricStatus()}></div>}

            <div
                style={{
                    display: "flex",
                    flexFlow: "row nowrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 50,
                }}
                onClick={onClick}>
                <Text>{metric.metricName}</Text>
                <AddMetricDataButton metric={metric} />
            </div>
        </>
    );
}

interface IActionTitleProps {
    metric: IMetric;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

export default React.memo(ActionTitle);
