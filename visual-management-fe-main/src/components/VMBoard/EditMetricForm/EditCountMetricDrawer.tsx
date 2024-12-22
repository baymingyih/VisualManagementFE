import { Button, Col, Drawer, Form, Input, InputNumber, Row, Select, message } from "antd";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
    getEditMetricFormIsOpen,
    getSelectedMetric,
    getSelectedTeam,
    getTeams,
    selectMetric,
    toggleEditMetricFormIsOpen,
} from "../../../../redux/features/ui/uiSlice";
import { IColumn } from "@/types/column";
import { selectAllColumns } from "../../../../redux/features/columns/columnsSlice";
import { ITeam } from "@/types/team";
import FormLabel from "@/components/shared/FormLabel/FormLabel";
import { useEffect, useState } from "react";
import { IMetric, TrackingFrequency } from "@/types/metric";
import { selectMetricById, updateMetric } from "../../../../redux/features/metrics/metricsSlice";

const metricId = 13;

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
    {
        label: "Percentage",
        value: 1,
    },
    {
        label: "Cumulative",
        value: 2,
    },
    {
        label: "Boolean",
        value: 3,
    },
];

function EditCountMetricDrawer() {
    const dispatch = useDispatch();

    const [displayValue, setDisplayValue] = useState<number>(0);
    const [targetType, setTargetType] = useState<string>(UNITS[0]?.label || "");

    const selectedMetric: IMetric | null = useSelector((state: any) => getSelectedMetric(state));

    const metric: IMetric | undefined = useSelector((state: any) =>
        selectMetricById(state, (selectedMetric && +selectedMetric.metricId) || 0)
    );

    useEffect(() => {
        if (metric) {
            metricUpdateForm.setFieldsValue({
                metricName: metric?.metricName,
                metricType: metric?.targetType,
                targetType: metric?.targetType,
                targetValue: metric?.metric_single_target,
                trigger: metric?.metric_single_target_above,
                column: metric?.metricCategoryId,
                team: selectedTeam?.id,
            });
        }
    }, [metric]);

    const isOpen: boolean = useSelector((state: any) => getEditMetricFormIsOpen(state));
    const columns: IColumn[] = useSelector((state: any) => selectAllColumns(state));
    const selectedTeam: ITeam | null = useSelector(getSelectedTeam);

    const teams: ITeam[] = useSelector(getTeams);

    const onError = () => {
        message.destroy("saving");
        message.error("Something went wrong");
    };

    const [metricUpdateForm] = Form.useForm();

    const submitForm = () => {
        metricUpdateForm.submit();
    };

    const closeDrawer = () => {
        dispatch(toggleEditMetricFormIsOpen());
        dispatch(selectMetric(null));
    };

    const onTargetValueChange = (value: number | string | null) => {
        if (value === null) {
            setDisplayValue(0);
            return;
        }

        setDisplayValue(+value);
    };

    const saveMetricUpdateState = (values: any) => {
        if (metric === undefined) {
            return;
        }

        const updatedMetric: IMetric = {
            ...metric,
            metricName: values.metricName, // Name
            targetType: values.metricType, // Simple
            metric_single_target: values.targetValue, // Value
            metric_single_target_above: values.trigger, // Above
            metricCategoryId: values.column, // Pillar
            mutated: true,
        };

        dispatch(updateMetric(updatedMetric));
        closeDrawer();
    };

    return (
        <Drawer
            title="Edit Metric"
            placement="right"
            size="large"
            onClose={closeDrawer}
            open={isOpen}
            footer={<ActionableDrawer onSuccess={submitForm} onCancel={closeDrawer} />}>
            <Form layout="vertical" form={metricUpdateForm} onFinish={saveMetricUpdateState}>
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
                                // onChange={onTargetTypeChange}
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

function ActionableDrawer({ onSuccess, onCancel }: ActionableDrawerProps) {
    return (
        <>
            <Row align="middle">
                <Col span={18}></Col>
                <Col span={3}>
                    <Button onClick={onCancel}>Cancel</Button>
                </Col>
                <Col span={3}>
                    <Button onClick={onSuccess} type="primary">
                        Save
                    </Button>
                </Col>
            </Row>
        </>
    );
}

interface ActionableDrawerProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default EditCountMetricDrawer;
