import {
    Drawer,
    Input,
    Form,
    Col,
    Row,
    Button,
    Divider,
    Radio,
    InputNumber,
    Select,
    Checkbox,
    message,
} from "antd";
import FormLabel from "../../shared/FormLabel/FormLabel";
import _, { create } from "lodash";

import { useDispatch, useSelector } from "react-redux";
import { addMetric } from "../../../../redux/features/metrics/metricsSlice";
import {
    getCreateMetricFormIsOpen,
    getSelectedColumnId,
    getSelectedTeam,
    getTeams,
    toggleCreateMetricFormIsOpen,
    toggleFormDrawer,
} from "../../../../redux/features/ui/uiSlice";
import { selectAllColumns } from "../../../../redux/features/columns/columnsSlice";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useState } from "react";
import React from "react";
import { IColumn } from "../../../types/column";
import { DBSaveMetric, DbMetric, IMetric, TrackingFrequency } from "../../../types/metric";
import { ITeam } from "../../../types/team";
import { useMutation } from "@tanstack/react-query";
import { createSimpleMetric } from "../../../pages/api/MetricAPI";
import ActionableDrawer from "@/components/shared/ActionableDrawer/ActionableDrawer";
import moment from "moment";

const FREQUENCY_OPTIONS = [
    { label: "Day", value: "Daily" },
    { label: "Week", value: "Weekly" },
    { label: "Month", value: "Monthly" },
    { label: "Year", value: "Yearly" },
];

const TARGET_TYPES = [
    { label: "Simple", value: 0 },
    { label: "Multiple", value: 1 },
    { label: "Range", value: 2 },
];

const TRIGGER_TYPES = [
    { label: "Value is greater than", value: 1 },
    { label: "Value is below", value: 0 },
];

const UNITS = [
    {
        label: "Count",
        value: 0,
    },
    // {
    //     label: "Percentage",
    //     value: 1,
    // },
    // {
    //     label: "Cumulative",
    //     value: 2,
    // },
    // {
    //     label: "Boolean",
    //     value: 3,
    // },
];

function CreateCountMetricDrawer() {
    const dispatch = useDispatch();
    const [checkboxTicked, setCheckboxTicked] = useState(false);
    const [displayValue, setDisplayValue] = useState<number>(0);
    const [targetType, setTargetType] = useState<string>(UNITS[0]?.label || "");

    const isOpen: boolean = useSelector((state: any) => getCreateMetricFormIsOpen(state));

    const columns: IColumn[] = useSelector((state: any) => selectAllColumns(state));

    const teams: ITeam[] = useSelector(getTeams);
    const selectedTeam: ITeam | null = useSelector(getSelectedTeam);

    const [metricCreationForm] = Form.useForm();

    const onError = () => {
        message.destroy("saving");
        message.error("Something went wrong");
    };

    const { mutate: createSimple } = useMutation({
        mutationKey: ["metrics.createSimple"],
        mutationFn: (metric: any) => createSimpleMetric(metric),
        onSuccess: ({ data }: { data: IMetric }) => {
            if (data) {
                message.destroy("saving");
                message.success("Metric created!");

                resetFields();

                dispatch(addMetric(data));

                if (!checkboxTicked) {
                    dispatch(toggleCreateMetricFormIsOpen());
                }
            }
        },
        onError,
    });

    const onMetricFormSubmit = (values: any) => {
        const newMetric: DBSaveMetric = {
            metricCat: values.column,
            name: values.metricName,
            freq: "Daily" as TrackingFrequency,
            value: values.targetValue,
            above: values.trigger,
            defaultView: 0,
            teamId: selectedTeam.id,
        };

        createSimple(newMetric);
    };

    const resetFields = () => {
        metricCreationForm.resetFields();
        setDisplayValue(0);
        setTargetType(UNITS[0]?.label || "");
    };

    const closeDrawer = () => {
        resetFields();
        dispatch(toggleCreateMetricFormIsOpen());
    };

    const onCheckboxTicked = () => {
        setCheckboxTicked(!checkboxTicked);
    };

    const submitForm = () => {
        metricCreationForm.submit();
    };

    const onTargetValueChange = (value: number | string | null) => {
        if (value === null) {
            setDisplayValue(0);
            return;
        }

        setDisplayValue(+value);
    };

    const onTargetTypeChange = (value: number, option: any) => {
        setTargetType(UNITS[value]?.label || "");
    };

    return (
        <Drawer
            title="Create Metric"
            placement="right"
            size="large"
            onClose={closeDrawer}
            open={isOpen}
            footer={
                <ActionableDrawer
                    actionItem={
                        <Checkbox onChange={onCheckboxTicked} checked={checkboxTicked}>
                            Create another metric
                        </Checkbox>
                    }
                    onSuccess={submitForm}
                    onCancel={closeDrawer}
                />
            }>
            <Form
                layout="vertical"
                form={metricCreationForm}
                onFinish={onMetricFormSubmit}
                initialValues={{
                    metricName: "",
                    metricType: TARGET_TYPES[0]?.value,
                    targetType: UNITS[0]?.value,
                    targetValue: 0,
                    trigger: TRIGGER_TYPES[0]?.value,
                    column: columns[0]?.id,
                }}>
                {/* <Row>
                    <Col span={12}>
                        <Form.Item label={<FormLabel title="Team" />} name="team">
                            <Select
                                options={teams.map((team: ITeam) => {
                                    return {
                                        label: team.name,
                                        value: team.id,
                                    };
                                })}
                                disabled
                                defaultValue={selectedTeam?.id}
                            />
                        </Form.Item>
                    </Col>
                </Row> */}
                <Row>
                    <Col span={24}>
                        <Form.Item
                            label={<FormLabel title="Title" />}
                            name="metricName"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <Input placeholder="Lorem Ipsum" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={12}>
                        <Form.Item
                            label={<FormLabel title="Metric Type" />}
                            name="metricType"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <Select options={TARGET_TYPES} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* <Row>
          <Col span={12}>
            <Form.Item
              label={<FormLabel title='Frequency' />}
              name='frequency'
              style={{ width: '100%' }}
            >
              <Radio.Group
                options={FREQUENCY_OPTIONS}
                defaultValue={'Daily'}
                optionType='button'
                buttonStyle='solid'
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row> */}

                <Row>
                    <Col span={12}>
                        <Form.Item
                            label={<FormLabel title="Goal" />}
                            name="targetValue"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <InputNumber
                                placeholder="3"
                                defaultValue={0}
                                style={{ width: "100%" }}
                                onChange={onTargetValueChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={5} offset={1}>
                        <Form.Item
                            label={<FormLabel title="Type" />}
                            name="targetType"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <Select
                                options={UNITS}
                                defaultValue={UNITS[0]?.value}
                                onChange={onTargetTypeChange}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={12}>
                        <Form.Item
                            label={<FormLabel title="Success Condition" />}
                            name="trigger"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <Select options={TRIGGER_TYPES} />
                        </Form.Item>
                    </Col>

                    <Col span={5} offset={1}>
                        <Form.Item label=" ">
                            <InputNumber
                                disabled
                                style={{ width: "100%" }}
                                value={`${displayValue} ${targetType}`}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={12}>
                        <Form.Item
                            label={<FormLabel title="Pillar" />}
                            name="column"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <Select
                                options={columns.map((c: IColumn) => {
                                    return { label: c.categoryName, value: c.id };
                                })}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
}

export default CreateCountMetricDrawer;
