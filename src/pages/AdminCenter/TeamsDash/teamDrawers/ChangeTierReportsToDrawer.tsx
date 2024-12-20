import { updateTeamTier } from "@/pages/api/AdminAPI";
import { getTeamsByOrgId } from "@/pages/api/TeamAPI";
import { ITeam, ITeamFull } from "@/types/team"
import { ArrowLeftOutlined, RightOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Button, Drawer, Form, InputNumber, Select, Tag, message } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react"

const ChangeTierReportsToDrawer = ({ teams, setTeams, rowDetails, setRowDetails, tierReportDrawer, setTierReportDrawer}: {teams: ITeamFull[], setTeams: Dispatch<SetStateAction<ITeamFull[]>>, rowDetails: ITeamFull, setRowDetails: Dispatch<SetStateAction<ITeamFull>>, tierReportDrawer: boolean, setTierReportDrawer: Dispatch<SetStateAction<boolean>>}) => {
    
    const [hasChangedTier, setHasChangedTier] = useState(false);
    const [hasChangedReportsTo, setHasChangedReportsTo] = useState(false);
    const [reportTo, setReportTo] = useState()
    
    const [teamsAvail, setTeamsAvail] = useState<ITeam[]>([])

    const [form] = Form.useForm();
    const [reportTeamOptions, setReportTeamOptions] = useState<{label: JSX.Element, value: number}[]>([])

    const { refetch: fetchTeams } = useQuery({
        queryKey: ["users_getTeamsByOrg"],
        queryFn: () => getTeamsByOrgId(1),
        onSuccess: ({ data }) => {
          setTeamsAvail(data)
        },
        onError: () => {
          console.log('Unable to fetch teams data')
        },
        enabled: false
    })

    useEffect(() => {
        fetchTeams()
    }, [fetchTeams])

    useEffect(() => {
        form.setFieldsValue({
            tier: rowDetails.tier,
            reportsTo: rowDetails.reportTo ? Number(rowDetails.reportTo.id) : undefined
        })
        const options: {label: JSX.Element, value: number}[] = []
        teamsAvail.forEach((team) => {
            if (team.tier > rowDetails.tier && team.id !== rowDetails.id) {
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
       }, [form, rowDetails, teamsAvail, tierReportDrawer])

    const onValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.tier) {
            form.setFieldValue('reportsTo', undefined)
            setReportTo(undefined)
            const options: {label: JSX.Element, value: number}[] = []
            teamsAvail.forEach((team) => {
                if (team.tier > changedValues.tier && team.id !== rowDetails.id) {
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
            setReportTo(allValues.reportsTo)
            
        }
        setHasChangedTier(changedValues.tier !== rowDetails.tier)
        setHasChangedReportsTo(changedValues.reportsTo !== rowDetails.reportTo?.id)
            
    }

    const { isLoading: updateTierReportToLoading, mutate: editTierReportTo } = useMutation({
        mutationKey: ["team_editTierReportTo"],
        mutationFn: (obj: {teamId: number, tier: number, reportsTo: number|null, oldReportsTo?: number})=> updateTeamTier(obj),
        onSuccess: ({data}) => {
            setTierReportDrawer(false);
            setHasChangedTier(false);
            setHasChangedReportsTo(false);
            setRowDetails({...rowDetails, tier: data.tier, reportTo: data.reportsTo});
            setTeams(teams.map((team) => {
                if(team.id === rowDetails.id) {
                    return {...team, tier: data.tier, reportTo: data.reportsTo}
                }
                return team
            }))
            message.success('Tier and Report To changed successfully');
        }
    })

    const onTierReportDrawerFinish = (values: any) => {
        editTierReportTo({
            teamId: rowDetails.id,
            tier: values.tier,
            reportsTo: values.reportsTo ? values.reportsTo : null,
            oldReportsTo: hasChangedReportsTo && rowDetails.reportTo ? rowDetails.reportTo.id : undefined
        })
        console.log({
            teamId: rowDetails.id,
            tier: values.tier,
            reportsTo: values.reportsTo ? values.reportsTo : null,
            oldReportsTo: hasChangedReportsTo && rowDetails.reportTo ? rowDetails.reportTo.id : undefined
        })
    }
    
    return (
        <>
            <Drawer open={tierReportDrawer} onClose={()=> {setTierReportDrawer(false); setHasChangedTier(false); setHasChangedReportsTo(false)}} mask={false} width={750} closeIcon={<ArrowLeftOutlined />}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Change Tier & Reports To
                </div>
                <Alert
                    message="Tier and Reports To change may cause items to be transferred to another team which can lead to confusion for users."
                    type="warning"
                    showIcon
                />
                <div style={{margin: '30px 0', fontStyle: 'italic'}}>
                    You are changing the tier and reports to of <b>{rowDetails.name}</b>
                </div>
                <Form 
                    onFinish={onTierReportDrawerFinish}
                    layout="vertical"
                    form={form}
                    onValuesChange={onValuesChange}
                >
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
                            <Select options={reportTeamOptions} allowClear/>
                        </Form.Item>
                    </div>
                    {hasChangedReportsTo && reportTo !== undefined && rowDetails.reportTo &&
                        <div style={{color: '#ff4d4f'}}>
                            <RightOutlined /> Escalated actions will be transferred from <b>{rowDetails.reportTo.name}</b> to <b>{teamsAvail.find(team => team.id === form.getFieldValue('reportsTo'))?.name}</b>
                        </div>
                    }
                    {hasChangedReportsTo && reportTo === undefined &&
                        <div style={{color: '#ff4d4f'}}>
                            <RightOutlined /> Escalated actions will be deleted from <b>{rowDetails.reportTo?.name}</b>
                        </div>
                    }
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%', marginTop: '20px'}}
                            disabled={!hasChangedTier && !hasChangedReportsTo}
                            loading={updateTierReportToLoading}
                        >
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default ChangeTierReportsToDrawer