import { createTeam } from "@/pages/api/AdminAPI";
import { ITeamFull } from "@/types/team";
import { useMutation } from "@tanstack/react-query";
import { Button, Drawer, Form, Input, InputNumber, Select, Tag, message } from "antd"
import { Dispatch, SetStateAction, useState } from "react"

const AddTeamDrawer = ({teams, setTeams, addTeamOpen, setAddTeamOpen}: {teams:ITeamFull[], setTeams: Dispatch<SetStateAction<ITeamFull[]>>, addTeamOpen: boolean, setAddTeamOpen: Dispatch<SetStateAction<boolean>>}) => {

    const [form] = Form.useForm();
    const [reportSelect, setReportSelect] = useState(true)

    const [reportTeamOptions, setReportTeamOptions] = useState<{label: JSX.Element, value: number}[]>([])

    const { isLoading: createTeamLoading, mutate: newTeam } = useMutation({
        mutationKey: ["team_createTeam"],
        mutationFn: (obj: {name: string, orgId: number, tier: number, reportsTo?: number})=> createTeam(obj),
        onSuccess: ({data}:{data:ITeamFull}) => {
            message.success('Team added successfully');
            setAddTeamOpen(false);
            form.resetFields();
            setReportSelect(true)
            setTeams([...teams, data])
        }
    })

    const onValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.tier) {
            setReportSelect(false)
            form.setFieldValue('reportsTo', undefined)
            const options: {label: JSX.Element, value: number}[] = []
            teams.forEach((team) => {
                if (team.tier > changedValues.tier) {
                    options.push({
                        label: 
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                {team.name} <Tag>Tier {team.tier}</Tag>
                            </div>,
                        value: team.id
                    })
                }
            })
            setReportTeamOptions(options)
        } else {
            setReportSelect
        }
    }

    const onAddTeamDrawerFinish = (values: any) => {
        newTeam({
            name: values.name,
            orgId: 1,
            tier: values.tier,
            reportsTo: values.reportsTo
        })
    }

    return (
        <>
            <Drawer open={addTeamOpen} onClose={()=> {setAddTeamOpen(false); form.resetFields(); setReportSelect(true)}} width={600} maskClosable={false}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Add Team
                </div>
                <Form 
                    onFinish={onAddTeamDrawerFinish}
                    layout="vertical"
                    form={form}
                    onValuesChange={onValuesChange}
                >
                    <Form.Item
                        name="name"
                        label="Team Name"
                        rules={[{ required: true, message: '' }]}
                    >
                        <Input/>
                    </Form.Item>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Form.Item
                            name="tier"
                            label="Tier"
                            rules={[{ required: true, message: '' }]}
                            style={{width: '20%'}}
                            tooltip="The tier of the team determines the hierarchy of the team in the organisation structure. Higher tier teams will be able to view items from lower tier teams."
                        >
                            <InputNumber min={1} max={20} style={{width: '100%'}}/>
                        </Form.Item>
                        <Form.Item
                            name="reportsTo"
                            label="Reports To"
                            // rules={[{ required: true, message: '' }]}
                            style={{width: '74%'}}
                            tooltip="The team that this team reports to. The team selected must be a higher tier team."
                        >
                            <Select disabled={reportSelect} options={reportTeamOptions} allowClear/>
                        </Form.Item>
                    </div>
                    <Form.Item
                        label="Max Members"
                        // rules={[{ required: true, message: '' }]}
                        style={{width: '47%'}}
                    >
                        <span>{10}</span>
                        <span style={{fontSize: '13px', marginLeft: '5px', opacity: '60%'}}>Upgrade plan to increase</span>
                    </Form.Item>
                    
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%', marginTop: '20px'}}
                            loading={createTeamLoading}
                        >
                            Add Team
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default AddTeamDrawer