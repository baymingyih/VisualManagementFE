import { ITeam, ITeamMembers } from "@/types/team";
import { Button, Col, DatePicker, Drawer, Form, Input, Row, Select, SelectProps, Space, message } from "antd";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getCreateProjectFormIsOpen, getSelectedTeam, getTeams, toggleCreateProjectFormisOpen } from "../../../../redux/features/ui/uiSlice";
import FormLabel from "@/components/shared/FormLabel/FormLabel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMembers } from "@/pages/api/ActTrackAPI";
import { getAvatarLabel } from "@/utilities/formatters";
import { useState } from "react";
import { addProjectAction, createProject } from "@/pages/api/ProjMgmtAPI";
import { ICreateProject, IFullProject } from "@/types/project";
import moment from "moment";

const { TextArea } = Input;

function CreateProjectForm() {
    const dispatch = useDispatch()
    const [projectCreationForm] = Form.useForm()


    const [assigneeValues, setAssigneeValues] = useState<SelectProps['options']>([])

    const teams: ITeam[] = useSelector(getTeams)
    const selectedTeam: ITeam | null = useSelector(getSelectedTeam)
    const isOpen: boolean = useSelector((state: any) =>
        getCreateProjectFormIsOpen(state)
    )

    const closeDrawer = () => {
        dispatch(toggleCreateProjectFormisOpen())
    }

    const onProjectFormSubmit = (values: any) => {
        const project: ICreateProject = {
            title: values.projectTitle,
            problem: values.problem,
            goal: values.goal,
            teamId: selectedTeam?.id,
            startDate: moment(values.startDate).format("YYYY-MM-DD"),
            dueDate: moment(values.dueDate).format("YYYY-MM-DD"),
            ownerId: values.owner
        }

        createNewProject(project)
    }

    const submitProjectForm = () => {
        projectCreationForm.submit()
    }

    const { mutate: createNewProject } = useMutation({
        mutationKey: ["ProjMgmt_addProjectAction"],
        mutationFn: (project: ICreateProject) => createProject(project),
        onSuccess: ({ data }: { data: IFullProject }) => {
            message.success('Project created successfully')
            console.log(data);

            projectCreationForm.setFieldsValue({
                projectTitle: '',
                problem: '',
                goal: '',
                startDate: null,
                endDate: null,
                owner: '',
                members: [],
            })
            closeDrawer()
        },
        onError: (error: any) => {
            message.error('Something went wrong')
            console.log(error);
        }
    })

    const { refetch: fetchMembers } = useQuery({
        queryKey: ["teams_getMembers", selectedTeam],
        queryFn: () => getMembers(selectedTeam),
        onSuccess: ({ data }: { data: Array<ITeamMembers> }) => {
            const assignees: SelectProps['options'] = []
            data.forEach((obj) => {
                if (obj.users.active) {
                    assignees.push({
                        value: String(obj.userId),
                        label:
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {getAvatarLabel(obj.users.firstName + ' ' + obj.users.lastName, obj.avatar_color, 20, 5, null, 5)}{obj.users.firstName + ' ' + obj.users.lastName}
                            </div>
                    })
                }
            })
            setAssigneeValues(assignees)
        },
    })

    return <Drawer
        title='Create Project'
        placement='right'
        size='large'
        onClose={closeDrawer}
        open={isOpen}
        footer={
            <ActionableDrawer
                onSuccess={submitProjectForm}
                onCancel={closeDrawer}
            />
        }
    >
        <Form
            layout='vertical'
            form={projectCreationForm}
            onFinish={onProjectFormSubmit}
            initialValues={{
                projectTitle: '',
                problem: '',
                goal: '',
                startDate: null,
                endDate: null,
                owner: '',
                members: [],
            }}
        >
            <Row>
                <Col span={24}>
                    <Form.Item label={<FormLabel title='Team' />} name='teamId'>
                        <Select
                            options={teams.map((team: ITeam) => {
                                return {
                                    label: team.name,
                                    value: team.id
                                }
                            })}
                            disabled
                            defaultValue={selectedTeam?.id}
                        />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label={<FormLabel title='Title' />}
                        name='projectTitle'
                        rules={[
                            {
                                required: true
                            }
                        ]}
                    >
                        <Input placeholder='Lorem Ipsum' />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label={<FormLabel title='Problem' />}
                        name='problem'
                    >
                        <TextArea placeholder='Input a description of the problem.' />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label={<FormLabel title='Goal' />}
                        name='goal'
                    >
                        <TextArea placeholder='Input the desired outcome.' />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label={<FormLabel title='Start Date' />}
                        name='startDate'
                    >
                        <DatePicker />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label={<FormLabel title='End Date' />}
                        name='endDate'
                    >
                        <DatePicker />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label={<FormLabel title='Owner' />}
                        name='owner'
                    >
                        <Select options={assigneeValues} />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label={<FormLabel title='Members' />}
                        name='members'
                    >
                        <Select mode="tags" options={assigneeValues} />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    </Drawer>
}

function ActionableDrawer({
    actionItem,
    onSuccess,
    onCancel
}: ActionableDrawerProps) {
    return (
        <>
            <Row align='middle'>
                <Col span={18}>{actionItem}</Col>
                <Col span={3}>
                    <Button onClick={onCancel}>Cancel</Button>
                </Col>
                <Col span={3}>
                    <Button onClick={onSuccess} type='primary'>
                        Create
                    </Button>
                </Col>
            </Row>
        </>
    )
}

interface ActionableDrawerProps {
    actionItem?: React.ReactNode
    onSuccess: () => void
    onCancel: () => void
}

export default CreateProjectForm;