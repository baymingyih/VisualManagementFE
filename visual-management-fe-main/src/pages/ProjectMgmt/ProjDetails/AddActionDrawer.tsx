import {
    Drawer,
    Radio,
    Select,
    Form,
    message,
    Input,
    DatePicker,
    Button,
    Divider,
    Tag,
    Space,
    Card,
} from "antd";
const { TextArea } = Input;
import type { SelectProps } from "antd";
import { Dispatch, SetStateAction, useEffect } from "react";
import styles from "./AddActionDrawer.module.css";

import { useState } from "react";
import { ITeam, ITeamMembers } from "@/types/team";
import { IAction } from "@/types/action";
import { getSelectedTeam } from "../../../../redux/features/ui/uiSlice";
import { useSelector } from "react-redux";

import { useQuery, useMutation } from "@tanstack/react-query";
import { getMembers, createNewAction } from "@/pages/api/ActTrackAPI";
import { getActionSummary, addProjectAction } from "@/pages/api/ProjMgmtAPI";
import { useRouter } from "next/router";

import { getPriorityLabel } from "@/utilities/utilities";
import { getAvatarLabel, customDateFormat } from "@/utilities/formatters";
import { set } from "lodash";

function AddActionDrawer({
    drawerOpen,
    setDrawerOpen,
    projActions,
    setProjActions,
}: {
    drawerOpen: boolean;
    setDrawerOpen: Dispatch<SetStateAction<boolean>>;
    projActions: IAction[];
    setProjActions: Dispatch<SetStateAction<IAction[]>>;
}) {
    const selectedTeam: ITeam | null = useSelector(getSelectedTeam);

    const router = useRouter();
    const { projId } = router.query;

    const [choice, setChoice] = useState("2");

    const [actionSelect, setActionSelect] = useState(-1);

    const [actionSummary, setActionSummary] = useState<
        Array<{
            id: number;
            title: string;
            description: string;
            project_action_list: Array<number>;
        }>
    >([]);

    const [form1] = Form.useForm();
    const [form2] = Form.useForm();

    const [teamMembers, setTeamMembers] = useState<SelectProps["options"]>([]);

    const { refetch: fetchMembers } = useQuery({
        queryKey: ["teams_getMembers", selectedTeam],
        queryFn: () => getMembers(selectedTeam),
        onSuccess: ({ data }: { data: Array<ITeamMembers> }) => {
            const members: SelectProps["options"] = [];
            data.forEach((obj) => {
                if (obj.users.active) {
                    members.push({
                        value: String(obj.userId),
                        label: (
                            <div style={{ display: "flex", alignItems: "center" }}>
                                {getAvatarLabel(
                                    obj.users.firstName + " " + obj.users.lastName,
                                    obj.avatar_color,
                                    20,
                                    5,
                                    null,
                                    5
                                )}
                                {obj.users.firstName + " " + obj.users.lastName}
                            </div>
                        ),
                    });
                }
            });
            setTeamMembers(members);
        },
        onError: () => {
            console.log("Unable to fetch team members data");
        },
        enabled: false,
    });

    const { refetch: fetchActionSummary } = useQuery({
        queryKey: ["actions_getActionSummary", selectedTeam],
        queryFn: () => getActionSummary(selectedTeam),
        onSuccess: ({
            data,
        }: {
            data: Array<{
                id: number;
                title: string;
                description: string;
                project_action_list: Array<number>;
            }>;
        }) => {
            setActionSummary(data);
        },
        onError: () => {
            console.log("Unable to fetch action summary data");
        },
        enabled: false,
    });

    useEffect(() => {
        fetchActionSummary();
    }, [projActions, fetchActionSummary]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    useEffect(() => {
        if(!drawerOpen) {
           form1.resetFields();
           form2.resetFields();
           setActionSelect(-1);
        }
      });

    const { mutate: addAction } = useMutation({
        mutationFn: (obj: {
            title: string;
            description?: string;
            priority: number;
            teamId: number;
            deadline: string;
            picId: number;
        }) => createNewAction(obj),
        onSuccess: ({ data }: { data: IAction }) => {
            addProjAction({
                projectId: Number(projId),
                actionId: data.id,
            });
        },
    });

    const { mutate: addProjAction } = useMutation({
        mutationFn: (obj: { projectId: number; actionId: number }) => addProjectAction(obj),
        onSuccess: ({ data }: { data: IAction }) => {
            const newProjActions: IAction[] = [data].concat(projActions);
            setProjActions(newProjActions);
            message.success("Action added successfully");
        },
    });

    const actionOptions: SelectProps["options"] = [];
    actionSummary.forEach((obj) => {
        if (!obj.project_action_list.includes(Number(projId))) {
            actionOptions.push({
                value: obj.id+'_'+obj.title,
                label: (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Tag>
                            T{selectedTeam != null ? selectedTeam.id : null}-A{obj.id}
                        </Tag>{" "}
                        {obj.title}
                    </div>
                ),
            });
        }
    });

    const onFinishCreate = (values: any) => {
        addAction({
            title: values["Action Title"],
            description: values.Description,
            priority: values.Priority,
            teamId: selectedTeam.id,
            deadline: values["Due Date"],
            picId: Number(values.Assignee),
        });
        setDrawerOpen(false);
    };

    const onFinishAddExisting = (values: any) => {
        addProjAction({
            projectId: Number(projId),
            actionId: actionSelect,
        });
        setDrawerOpen(false);
    };

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

    const renderBody = () => {
        if (choice === "1") {
            return (
                <>
                    <Form layout="vertical" form={form2} onFinish={onFinishAddExisting}>
                        <Form.Item
                            name="Action"
                            label={"Action"}
                            rules={[{ required: true, message: "" }]}>
                            <Select
                                style={{ width: "100%" }}
                                placeholder="Please select"
                                options={actionOptions}
                                onChange={(e) => setActionSelect(Number(e.split("_")[0]))}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => (String(option?.value).split("_")[1] ?? '').toLowerCase().includes(input.toLowerCase())}
                                filterSort={(optionA, optionB) =>
                                (String(optionA?.value).split("_")[1] ?? '').toLowerCase().localeCompare((String(optionB?.value).split("_")[1] ?? '').toLowerCase())
                                }
                            />
                        </Form.Item>
                        <div className={styles.previewTitle}>Action Preview</div>
                        <div style={{ marginTop: "10px" }}>{renderPreview()}</div>
                        <div style={{ textAlign: "center" }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: "20%", marginTop: "20px" }}>
                                Add
                            </Button>
                        </div>
                    </Form>
                </>
            );
        } else if (choice === "2") {
            return (
                <>
                    <Form
                        layout="vertical"
                        form={form1}
                        onFinish={onFinishCreate}
                        initialValues={{ Priority: 2 }}>
                        <Form.Item
                            name="Action Title"
                            label={"Action Title"}
                            rules={[{ required: true, message: "" }]}>
                            <Input placeholder="Please enter action title" />
                        </Form.Item>
                        <Form.Item name="description" label={"Description"}>
                            <TextArea rows={4} placeholder="Please enter description" />
                        </Form.Item>
                        <Form.Item
                            name="Assignee"
                            label={"Assignee"}
                            rules={[{ required: true, message: "" }]}>
                            <Select
                                placeholder="Please select"
                                style={{ width: "100%" }}
                                options={teamMembers}></Select>
                        </Form.Item>
                        <Form.Item
                            name="Due Date"
                            label={"Due Date"}
                            rules={[{ required: true, message: "" }]}>
                            <DatePicker format={customDateFormat} style={{ width: "50%" }} />
                        </Form.Item>
                        <Form.Item
                            name="Priority"
                            label={"Priority"}
                            rules={[{ required: true, message: "" }]}>
                            <Select
                                placeholder="Please select"
                                style={{ width: "50%" }}
                                options={priorityDropdownValues}></Select>
                        </Form.Item>
                        <div style={{ textAlign: "center" }}>
                            <Button type="primary" htmlType="submit" style={{ width: "20%" }}>
                                Create
                            </Button>
                        </div>
                    </Form>
                </>
            );
        }
    };

    const renderPreview = () => {
        if (actionSelect === -1) {
            return <div className={styles.subText}>Select an action to see preview</div>;
        } else {
            const actionObj = actionSummary.find((x) => x.id === actionSelect);
            return (
                <>
                    <Card>
                        <Space direction="vertical">
                            <div className={styles.subTitle}>Title</div>
                            <div className={styles.text}>{actionObj?.title}</div>
                            <div className={styles.subTitle}>Description</div>
                            <div className={styles.text}>{actionObj?.description}</div>
                        </Space>
                    </Card>
                </>
            );
        }
    };

    return (
        <>
            <Drawer
                size="large"
                title="Add Project Action"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
            >
                <div style={{ textAlign: "center" }}>
                    <Radio.Group
                        defaultValue="2"
                        onChange={(e) => setChoice(e.target.value)}
                        style={{ width: "100%" }}
                        buttonStyle="solid">
                        <Radio.Button value="2" style={{ width: "50%" }}>
                            Create New Action
                        </Radio.Button>
                        <Radio.Button value="1" style={{ width: "50%" }}>
                            Add Existing Action
                        </Radio.Button>
                    </Radio.Group>
                </div>
                <div>
                    <Divider />
                </div>
                <div>{renderBody()}</div>
            </Drawer>
        </>
    );
}

export default AddActionDrawer;
