import {
    Button,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Drawer,
    Form,
    Input,
    Row,
    Select,
    SelectProps,
    Space,
    Tag,
    Typography,
    message,
} from "antd";
import React, { useState, useEffect } from "react";
import FormLabel from "../../shared/FormLabel/FormLabel";
import TextArea from "antd/lib/input/TextArea";
import { useDispatch } from "react-redux";
import {
    getCreateActionFormIsOpen,
    getSelectedMetric,
    getSelectedTeam,
    getTeams,
    toggleCreateActionFormIsOpen,
} from "../../../../redux/features/ui/uiSlice";
import { useSelector } from "react-redux";
import { getPriorityLabel } from "../../../utilities/utilities";
import { ITeam, ITeamMemberFull, ITeamMembers } from "../../../types/team";
import { createNewAction, getMembers } from "../../../pages/api/ActTrackAPI";
import { useMutation, useQuery } from "@tanstack/react-query";
import { customDateFormat, getAvatarLabel } from "@/utilities/formatters";
import eventBus from "@/utilities/EventBus";
import ActionableDrawer from "@/components/shared/ActionableDrawer/ActionableDrawer";
import { getMetricsByTeam } from "@/pages/api/MetricAPI";
import { IMetric } from "@/types/metric";
import { metricLoaded, selectAllMetrics } from "../../../../redux/features/metrics/metricsSlice";
import _ from "lodash";
import { IUser } from "@/types/user";
import { createUser } from "@/pages/api/AdminAPI";
import { addMemberById } from "@/pages/api/TeamAPI";

const priorityDropdownValues = [
    {
        value: 3,
        label: (
            <div style={{ display: "flex", alignItems: "center" }}>
                {getPriorityLabel(3, 8)} High
            </div>
        ),
    },
    {
        value: 2,
        label: (
            <div style={{ display: "flex", alignItems: "center" }}>
                {getPriorityLabel(2, 8)} Medium
            </div>
        ),
    },
    {
        value: 1,
        label: (
            <div style={{ display: "flex", alignItems: "center" }}>
                {getPriorityLabel(1, 8)} Low
            </div>
        ),
    },
];

function CreateActionDrawer() {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [externalUserForm] = Form.useForm();

    const selectedTeam: ITeam | null = useSelector(getSelectedTeam);
    const teams: ITeam[] = useSelector(getTeams);

    const selectedMetric: any = useSelector(getSelectedMetric);
    const metrics = useSelector(selectAllMetrics);

    const [assigneeValues, setAssigneeValues] = useState<SelectProps["options"]>([]);
    const [checkboxTicked, setCheckboxTicked] = useState(false);

    const { refetch: fetchMembers } = useQuery({
        queryKey: ["teams_getMembers", selectedTeam],
        queryFn: () => getMembers(selectedTeam),
        onSuccess: ({ data }: { data: Array<ITeamMembers> }) => {
            const assignees: SelectProps["options"] = [];
            data.forEach((obj) => {
                if (obj.users.active) {
                    assignees.push({
                        value: String(obj.userId),
                        label: (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}>
                                <div
                                    style={{ display: "flex", alignItems: "center", width: "80%" }}>
                                    {getAvatarLabel(
                                        obj.users.firstName + " " + obj.users.lastName,
                                        obj.avatar_color,
                                        20,
                                        5,
                                        null,
                                        5
                                    )}
                                    <Typography.Text style={{ width: "90%" }} ellipsis={true}>
                                        {obj.users.firstName + " " + obj.users.lastName}
                                    </Typography.Text>
                                </div>
                                {obj.users.external === 1 && <Tag>Ext</Tag>}
                            </div>
                        ),
                    });
                }
            });
            setAssigneeValues(assignees);
        },
        enabled: false,
    });

    useQuery({
        queryKey: ["metrics_getMetrics"],
        queryFn: () => getMetricsByTeam(selectedTeam.id || 0),
        onSuccess: ({ data }: { data: IMetric[] }) => {
            dispatch(metricLoaded(data));
        },
        enabled: false,
    });

    const { mutate: createAction } = useMutation({
        // mutationKey: ['actions.createAction'],
        mutationFn: (obj: {
            title: string;
            description?: string;
            priority: number;
            teamId: number;
            deadline: string;
            picId: number | undefined;
        }) => createNewAction(obj),
        onSuccess: ({ data }) => {
            message.success("Action created successfully");
            eventBus.dispatch("actionCreated", {});
        },
    });

    const { isLoading: addExtUserLoading, mutate: addExtUser } = useMutation({
        mutationKey: ["user_addExtUser"],
        mutationFn: (obj: {
            firstName: string;
            lastName: string;
            email: string;
            organisationId: number;
            orgAdmin: number;
            external: number;
        }) => createUser(obj),
        onSuccess: ({ data }: { data: IUser }) => {
            addTeamMember({
                teamId: selectedTeam?.id,
                userId: data.id,
                role: 2,
            });
        },
    });

    const { isLoading: addTeamMemberLoading, mutate: addTeamMember } = useMutation({
        mutationKey: ["team_addTeamMember"],
        mutationFn: (obj: { teamId: number; userId: number; role: number }) => addMemberById(obj),
        onSuccess: ({ data }: { data: ITeamMemberFull }) => {
            setAssigneeValues([
                ...assigneeValues!,
                {
                    value: String(data.userId),
                    label: (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}>
                            <div style={{ display: "flex", alignItems: "center", width: "80%" }}>
                                {getAvatarLabel(
                                    data.firstName + " " + data.lastName,
                                    data.avatar_color,
                                    20,
                                    5,
                                    null,
                                    5
                                )}
                                <Typography.Text style={{ width: "90%" }} ellipsis={true}>
                                    {data.firstName + " " + data.lastName}
                                </Typography.Text>
                            </div>
                            <Tag>Ext</Tag>
                        </div>
                    ),
                },
            ]);
            externalUserForm.resetFields();
        },
    });

    useEffect(() => {
        if (selectedTeam && selectedTeam.id) {
            fetchMembers();
        }
    }, [selectedTeam, fetchMembers]);

    const isActionFormOpen: boolean = useSelector(getCreateActionFormIsOpen);

    const onFinish = (values: any) => {
        createAction({
            title: values.Title,
            description: values.Description,
            priority: values.Priority,
            teamId: selectedTeam.id,
            deadline: values["Due Date"],
            picId: values.Assignee ? Number(values.Assignee) : undefined,
        });

        form.resetFields();
        if (!checkboxTicked) {
            dispatch(toggleCreateActionFormIsOpen());
        }
    };

    const closeForm = () => {
        form.resetFields();
        dispatch(toggleCreateActionFormIsOpen());
    };

    const submitForm = () => {
        form.submit();
    };

    const onCheckboxTicked = () => {
        setCheckboxTicked(!checkboxTicked);
    };

    const addExternalUser = () => {
        const extUsr = externalUserForm.getFieldValue("externalName");
        const spaceIdx = extUsr.indexOf(" ");
        addExtUser({
            firstName: spaceIdx !== -1 ? extUsr.substring(0, extUsr.indexOf(" ")) : extUsr,
            lastName: spaceIdx !== -1 ? extUsr.substring(extUsr.indexOf(" ") + 1) : "",
            email: "",
            organisationId: 1,
            orgAdmin: 0,
            external: 1,
        });
    };

    return (
        <Drawer
            title="Create Action"
            size="large"
            onClose={closeForm}
            open={isActionFormOpen}
            footer={
                <ActionableDrawer
                    actionItem={
                        <Checkbox onChange={onCheckboxTicked} checked={checkboxTicked}>
                            Create another action
                        </Checkbox>
                    }
                    onSuccess={submitForm}
                    onCancel={closeForm}
                />
            }
            zIndex={1049}>
            <Form layout="vertical" form={form} onFinish={onFinish} initialValues={{ Priority: 2 }}>
                <Row gutter={[16, 16]}>
                    {/* <Col span={12}>
                        <Form.Item label="Team" rules={[{ required: true }]} name="team">
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
                    </Col> */}

                    <Col span={24}>
                        <Form.Item name="Title" label="Title" rules={[{ required: true }]}>
                            <Input placeholder="Please enter action title" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="Description" label="Description">
                            <TextArea rows={10} placeholder="Please enter description (Optional)" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="Assignee" label="Assignee">
                            <Select
                                placeholder="Please select"
                                style={{ width: "50%" }}
                                options={assigneeValues}
                                listHeight={160}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ marginTop: "5px", marginBottom: "0" }} />
                                        <Space
                                            direction="vertical"
                                            style={{ padding: "10px 14px", width: "100%" }}>
                                            <div>Add External User</div>
                                            <Form
                                                style={{ display: "flex" }}
                                                form={externalUserForm}
                                                onFinish={addExternalUser}>
                                                <Form.Item
                                                    name="externalName"
                                                    style={{
                                                        marginBottom: 0,
                                                        marginRight: "8px",
                                                        width: "100%",
                                                    }}>
                                                    <Input
                                                        placeholder="John Doe"
                                                        style={{ width: "100%" }}
                                                    />
                                                </Form.Item>
                                                <Form.Item style={{ margin: "0px" }}>
                                                    <Button htmlType="submit">Add</Button>
                                                </Form.Item>
                                            </Form>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="Due Date" label="Due Date" rules={[{ required: true }]}>
                            <DatePicker format={customDateFormat} style={{ width: "50%" }} />
                        </Form.Item>
                    </Col>

                    {/* <Col span={24}>
                        <Form.Item
                            name="MetricLink"
                            label="MetricLink"
                            rules={[{ required: true }]}>
                            <Select
                                placeholder="Please select"
                                style={{ width: "50%" }}
                                options={metrics.map((metric) => {
                                    return {
                                        label: metric.metricName,
                                        value: metric.metricId,
                                    };
                                })}></Select>
                        </Form.Item>
                    </Col> */}

                    <Col span={24}>
                        <Form.Item name="Priority" label="Priority" rules={[{ required: true }]}>
                            <Select
                                placeholder="Please select"
                                style={{ width: "50%" }}
                                options={priorityDropdownValues}></Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
}

export default CreateActionDrawer;
