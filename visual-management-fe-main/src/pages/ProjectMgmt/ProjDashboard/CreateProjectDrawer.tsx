import { ICreateProject, IFullProject, IGeneralProject } from "@/types/project";
import { ITeam, ITeamMembers } from "@/types/team";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    Row,
    Select,
    SelectProps,
    message,
} from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getSelectedTeam, getTeams } from "../../../../redux/features/ui/uiSlice";
import { getMembers } from "@/pages/api/ActTrackAPI";
import { customDateFormat, getAvatarLabel } from "@/utilities/formatters";
import TextArea from "antd/lib/input/TextArea";
import moment from "moment";
import { createProject } from "@/pages/api/ProjMgmtAPI";
import { getStaticPaths } from "../[projId]";
import { current } from "@reduxjs/toolkit";

function CreateProjectDrawer({
    drawerOpen,
    setDrawerOpen,
    projectsData,
    setProjectsData,
}: {
    drawerOpen: boolean;
    setDrawerOpen: Dispatch<SetStateAction<boolean>>;
    projectsData: IGeneralProject[];
    setProjectsData: Dispatch<SetStateAction<IGeneralProject[]>>;
}) {
    const selectedTeam: ITeam | null = useSelector(getSelectedTeam);
    const teams: ITeam[] = useSelector(getTeams);

    const [form1] = Form.useForm();

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

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const { mutate: createProj } = useMutation({
        mutationFn: (project: ICreateProject) => createProject(project),
        onSuccess: ({ data }: { data: IGeneralProject }) => {
            const newProjects: IGeneralProject[] = [data].concat(projectsData);
            setProjectsData(newProjects);

            message.success("Project created successfully");
        },
    });

    const onFinishCreate = (values: any) => {
        createProj({
            title: values.title,
            problem: values.problem,
            goal: values.goal,
            teamId: selectedTeam?.id,
            startDate: values.startDate,
            dueDate: values.dueDate,
            ownerId: Number(values.owner),
        });
        form1.resetFields();
        setDrawerOpen(false);
    };

    const disabledDate = (current: moment.Moment) => {
        return current && current < form1.getFieldValue("startDate");
    };

    return (
        <>
            <Drawer
                size="large"
                title="Create Project"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}>
                <Form
                    layout="vertical"
                    form={form1}
                    onFinish={onFinishCreate}
                    initialValues={{
                        teamId: selectedTeam?.name,
                        problem: null,
                        goal: null,
                        startDate: moment(),
                        dueDate: null,
                    }}>
                    <Form.Item label="Team" name="teamId">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        label="Project Title"
                        name="title"
                        rules={[{ required: true, message: "" }]}>
                        <Input placeholder="Lorem Ipsum" />
                    </Form.Item>
                    <Form.Item label="Problem" name="problem" rules={[{ required: true }]}>
                        <TextArea rows={3} placeholder="Input a description of the problem." />
                    </Form.Item>
                    <Form.Item label="Goal" name="goal" rules={[{ required: true }]}>
                        <TextArea rows={3} placeholder="Input the desired outcome." />
                    </Form.Item>
                    <Row>
                        <Col span={11}>
                            <Form.Item
                                label="Start Date"
                                name="startDate"
                                rules={[{ required: true, message: "" }]}>
                                <DatePicker
                                    format={customDateFormat}
                                    style={{ width: "100%" }}
                                    onChange={(date) => {
                                        form1.setFieldsValue({ dueDate: null });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={2}></Col>
                        <Col span={11}>
                            <Form.Item
                                label="Due Date"
                                name="dueDate"
                                rules={[{ required: true, message: "" }]}>
                                <DatePicker
                                    format={customDateFormat}
                                    style={{ width: "100%" }}
                                    disabledDate={disabledDate}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Owner" name="owner" rules={[{ required: true, message: "" }]}>
                        <Select options={teamMembers} placeholder="Please select" />
                    </Form.Item>
                    <div style={{ textAlign: "center" }}>
                        <Button type="primary" htmlType="submit" style={{ width: "20%" }}>
                            Create
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    );
}

export default CreateProjectDrawer;
