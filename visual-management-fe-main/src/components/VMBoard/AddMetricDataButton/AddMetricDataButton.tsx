import { DbChartData, IMetricChartData } from "@/types/metricChartData";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    getLastMetricEntryByIdAndDate,
    getMetricDataByDate,
    updateMetricData,
} from "../../../../redux/features/metricData/metricDataSlice";
import { IMetric } from "@/types/metric";
import { Button, Collapse, Form, InputNumber, Popover, message } from "antd";
import {
    getBoardInViewMode,
    getFilterDate,
    setRefreshChartData,
} from "../../../../redux/features/ui/uiSlice";
import { useMutation } from "@tanstack/react-query";
import {
    createMetricData,
    updateMetricData as putUpdateMetricData,
} from "@/pages/api/MetricDataAPI";
import moment from "moment";
import { useDispatch } from "react-redux";
import styles from "./AddMetricDataButton.module.css";
import TextArea from "antd/lib/input/TextArea";
import { PlusOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

export default function AddMetricDataButton({ metric, filterDate }: IAddMetricDataButtonProps) {
    const [metricDataForm] = Form.useForm();
    const dispatch = useDispatch();
    const selectedFilterDate: string = filterDate || useSelector(getFilterDate);

    const [isOpen, setIsOpen] = useState(false);
    const lastEntry: IMetricChartData | undefined = useSelector((state: any) =>
        getMetricDataByDate(state, +metric.metricId, selectedFilterDate)
    );

    const boardInViewMode: boolean = useSelector(getBoardInViewMode);

    const getMetricValue = useCallback(() => {
        if (lastEntry) {
            return lastEntry.value;
        }
    }, [lastEntry]);

    const getMetricComment = useCallback(() => {
        if (lastEntry) {
            return lastEntry.comment;
        }
    }, [lastEntry]);

    useEffect(() => {
        metricDataForm.setFieldsValue({
            metricValue: getMetricValue(),
            comment: getMetricComment(),
        });
    }, [lastEntry]);

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
    };

    const stopPropEvent = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
    };

    const getMetricStatus = () => {
        if (lastEntry && lastEntry.value !== undefined) {
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

    const { mutate: createMetric } = useMutation({
        mutationKey: ["metricsData.createMetricData"],
        mutationFn: (data: DbChartData) => createMetricData(data),
        onSuccess: ({ data }: { data: IMetricChartData }) => {
            message.destroy("saving");
            message.success("Added an entry!");

            const metricChartData: IMetricChartData = {
                metricId: data.metricId,
                value: data.value,
                dateTime: moment(data.dateTime).format("DD/MM"),
                comment: data.comment,
            };

            dispatch(updateMetricData(metricChartData));
            dispatch(setRefreshChartData({ refresh: true, metricID: data.metricId }));
            setIsOpen(false);

            metricDataForm.resetFields();
        },
        onError: () => {
            message.destroy("saving");
            message.error("Failed to update. Please try again later!");
        },
    });

    const { mutate: updateMetric } = useMutation({
        mutationKey: ["metricsData.updateMetricData"],
        mutationFn: (data: DbChartData) => putUpdateMetricData(data),
        onSuccess: ({ data }: { data: IMetricChartData }) => {
            message.destroy("saving");
            message.success("Updated!");

            const metricChartData: IMetricChartData = {
                metricId: data.metricId,
                value: data.value,
                dateTime: moment(data.dateTime).format("DD/MM"),
                comment: data.comment,
            };

            dispatch(updateMetricData(metricChartData));
            dispatch(setRefreshChartData({ refresh: true, metricID: data.metricId }));
            setIsOpen(false);

            metricDataForm.resetFields();
        },
        onError: () => {
            message.destroy("saving");
            message.error("Failed to update. Please try again later!");
        },
    });

    const addOrUpdateMetricData = (values: any) => {
        console.log(selectedFilterDate);
        if (getMetricValue() === undefined) {
            const data: DbChartData = {
                metricId: +metric.metricId,
                value: values.metricValue,
                dateString: selectedFilterDate,
                updatedBy: 1,
                comment_updatedBy: 1,
                comment: values.comment || "",
            };

            message.loading({ content: "Registering...", key: "saving" });
            createMetric(data);
        } else {
            const data: DbChartData = {
                metricId: +metric.metricId,
                value: values.metricValue,
                dateString: selectedFilterDate,
                updatedBy: 1,
                comment_updatedBy: 1,
                comment: values.comment || "",
            };

            message.loading({ content: "Updating...", key: "saving" });
            updateMetric(data);
        }
    };

    return !boardInViewMode ? (
        (getMetricStatus() && (
            <div onClick={stopPropEvent}>
                <Popover
                    placement="bottom"
                    className={styles.hoverable_confirm}
                    trigger="click"
                    onOpenChange={handleOpenChange}
                    open={isOpen}
                    content={
                        <Form
                            layout="inline"
                            form={metricDataForm}
                            onFinish={addOrUpdateMetricData}
                            initialValues={{
                                metricValue: getMetricValue(),
                                comment: getMetricComment(),
                            }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexFlow: "column nowrap",
                                    justifyContent: "flex-start",
                                    alignItems: "flex-start",
                                    width: "100%",
                                }}>
                                <div style={{ display: "flex", flexFlow: "row nowrap" }}>
                                    <Form.Item name="metricValue">
                                        <InputNumber placeholder="0" style={{ width: "100%" }} />
                                    </Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{ marginLeft: 5 }}>
                                        Save
                                    </Button>
                                </div>

                                <Collapse ghost style={{ width: "100%" }}>
                                    <Panel header="Comment" key="1">
                                        <Form.Item name="comment">
                                            <TextArea
                                                rows={4}
                                                placeholder="Write comment here..."
                                            />
                                        </Form.Item>
                                    </Panel>
                                </Collapse>
                            </div>
                        </Form>
                    }>
                    <span
                        style={{
                            color: getMetricStatus() === styles.statusGreen ? "#40DA3F" : "#FF8080",
                            fontSize: "2em",
                            userSelect: "none",
                        }}>
                        {getMetricValue()}
                    </span>
                </Popover>
            </div>
        )) || (
            <div onClick={stopPropEvent}>
                <Popover
                    placement="bottom"
                    className={styles.hoverable_confirm}
                    trigger="click"
                    onOpenChange={handleOpenChange}
                    open={isOpen}
                    content={
                        <Form
                            layout="inline"
                            form={metricDataForm}
                            onFinish={addOrUpdateMetricData}
                            initialValues={{ metricValue: 0 }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexFlow: "column nowrap",
                                    justifyContent: "flex-start",
                                    alignItems: "flex-start",
                                    width: "100%",
                                }}>
                                <div style={{ display: "flex", flexFlow: "row nowrap" }}>
                                    <Form.Item name="metricValue">
                                        <InputNumber placeholder="0" style={{ width: "100%" }} />
                                    </Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{ marginLeft: 5 }}>
                                        Save
                                    </Button>
                                </div>

                                <Collapse ghost style={{ width: "100%" }}>
                                    <Panel header="Comment" key="1">
                                        <Form.Item name="comment">
                                            <TextArea
                                                rows={4}
                                                placeholder="Write comment here..."
                                            />
                                        </Form.Item>
                                    </Panel>
                                </Collapse>
                            </div>
                        </Form>
                    }>
                    <Button
                        icon={<PlusOutlined />}
                        style={{
                            fontSize: "2em",
                            borderColor: "#1990ff",
                            color: "#1990ff",
                        }}
                    />
                </Popover>
            </div>
        )
    ) : (
        <></>
    );
}

interface IAddMetricDataButtonProps {
    metric: IMetric;
    filterDate?: string;
}
