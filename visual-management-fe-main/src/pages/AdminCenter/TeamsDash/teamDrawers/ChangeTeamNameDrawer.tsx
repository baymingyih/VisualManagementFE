import { updateTeamName } from "@/pages/api/AdminAPI";
import { ITeamFull } from "@/types/team";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Drawer, Form, Input, message } from "antd"
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const ChangeTeamNameDrawer = ({ teams, setTeams, rowDetails, setRowDetails, teamNameDrawer, setTeamNameDrawer }: { teams: ITeamFull[], setTeams: Dispatch<SetStateAction<ITeamFull[]>>, rowDetails: ITeamFull, setRowDetails: Dispatch<SetStateAction<ITeamFull>>, teamNameDrawer: boolean, setTeamNameDrawer: Dispatch<SetStateAction<boolean>> }) => {

    const [form] = Form.useForm()

    const [hasChanged, setHasChanged] = useState(false);

    const { isLoading: updateTeamNameLoading, mutate: editTeamName } = useMutation({
        mutationKey: ["team_editTeamName"],
        mutationFn: (obj: { teamId: number, name: string }) => updateTeamName(obj),
        onSuccess: ({ data }) => {
            setTeamNameDrawer(false);
            setHasChanged(false);
            setRowDetails({ ...rowDetails, name: data!.name });
            setTeams(teams.map((team) => {
                if (team.id === rowDetails.id) {
                    return { ...team, name: data!.name }
                }
                return team
            }))
            message.success('Team Name changed successfully');
        }
    })

    const onTeamNameDrawerFinish = (values: any) => {
        editTeamName({
            teamId: rowDetails!.id,
            name: values!.teamName
        })
    }

    useEffect(() => {
        form.setFieldsValue({
            teamName: rowDetails!.name
        })
    }, [form, rowDetails])

    return (
        <>
            <Drawer open={teamNameDrawer} onClose={() => setTeamNameDrawer(false)} mask={false} width={600} closeIcon={<ArrowLeftOutlined />}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>
                    Change Team Name
                </div>
                <div style={{ margin: '30px 0', fontStyle: 'italic' }}>
                    You are changing the team name of <b>{rowDetails!.name}</b>
                </div>
                <Form
                    onFinish={onTeamNameDrawerFinish}
                    layout='vertical'
                    form={form}
                >
                    <Form.Item
                        name="teamName"
                        label="Team Name"
                        rules={[{ required: true, message: '' }]}
                    >
                        <Input onChange={(e) => { setHasChanged(e.target.value !== rowDetails!.name) }} />
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{ width: '25%', marginTop: '20px' }}
                            disabled={!hasChanged}
                            loading={updateTeamNameLoading}
                        >
                            Save changes
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default ChangeTeamNameDrawer