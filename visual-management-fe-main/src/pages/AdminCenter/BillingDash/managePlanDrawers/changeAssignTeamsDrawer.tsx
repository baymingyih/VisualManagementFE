import { editSubscriptionHosted } from "@/pages/api/BillingAPIs";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Descriptions, Drawer, Form, InputNumber, Modal, Radio, Row, Space, Tag, message } from "antd"
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { numUsers } from "@/utilities/commons";
import { useRouter } from "next/router";

const ChangeAssignableTeams = ({assignableTeamsDrawer, setAssignableTeamsDrawer, freqDetail}: {assignableTeamsDrawer: boolean, setAssignableTeamsDrawer: Dispatch<SetStateAction<boolean>>, freqDetail: any}) => {
    const [form] = Form.useForm()

    const [teams, setTeams] = useState(-1)
    const [hasChangedTeams, setHasChangedTeams] = useState(false)

    const router = useRouter();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [cfmModal, setCfmModal] = useState(false);

    const { isLoading: isUpdateAssignTeams, mutate: updateAssignTeams } = useMutation({
        mutationKey: ["billing_updateAssignTeams"],
        mutationFn: (obj:{subscriptionId: string, planId: string, quantity: number}) => editSubscriptionHosted(obj),
        onSuccess: ({data}: {data: any}) => {
            setConfirmLoading(false);
            router.push(data.url)
        },
        onError: () => {
            setConfirmLoading(false);
            console.log('Unable to fetch subscription portal.')
        }
    })

    useEffect(() => {
        setTeams(freqDetail?.subscriptionItem?.quantity);
        form.setFieldValue('teams', freqDetail?.subscriptionItem?.quantity)
        setHasChangedTeams(false)
    }, [form, freqDetail, assignableTeamsDrawer]);

    const onAssignableTeamsDrawerFinish = (values: any) => {
        setCfmModal(true);
    }

    const handleOk = () => {
        setConfirmLoading(true);
        updateAssignTeams({
            subscriptionId: freqDetail.subscriptionId,
            planId: freqDetail.subscriptionItem.item_price_id,
            quantity: teams
        });
    }

    return (
        <>
            <Drawer open={assignableTeamsDrawer} onClose={()=> setAssignableTeamsDrawer(false)} width={600}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Change Assignable Teams
                </div>
                <div style={{marginBottom: '20px', color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', 'fontWeight': 500}}>
                    Plan Details
                </div>
                <Descriptions column={1} labelStyle={{fontWeight: 500, width: '20%'}} bordered>
                    <Descriptions.Item label="Plan" span={1} contentStyle={{width: '40%'}}>
                        <div>{freqDetail.subscriptionItem?.item_price_id.split("-")[0].charAt(0).toUpperCase().concat(freqDetail.subscriptionItem?.item_price_id.split("-")[0].substr(1))}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Teams" span={1} contentStyle={{width: '30%'}}>
                        <span>{freqDetail.subscriptionItem?.quantity} Team(s)</span>
                        <span style={{marginLeft: '10px', color: "grey", fontSize:'0.8rem'}}>{numUsers[freqDetail?.subscriptionItem?.item_price_id.split('-')[0] as keyof typeof numUsers]} Users per Team</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Cost per Team" span={1} contentStyle={{width: '40%'}}>
                        <div>${(freqDetail.subscriptionItem?.unit_price/100).toFixed(2)} {freqDetail.subscriptionItem?.item_price_id.split("-")[1].toUpperCase()}</div>
                    </Descriptions.Item>
                </Descriptions>

                <Form 
                    onFinish={onAssignableTeamsDrawerFinish}
                    layout= 'vertical'
                    form={form}
                    requiredMark={false}
                    // style={{ textAlign: 'center' }}
                >
                    {/* <div style={{fontSize: '1rem', fontWeight: 700, marginTop: '25px', marginBottom: '12px'}}>Assignable Teams</div> */}
                    <Form.Item
                        name="teams"
                        label={<div style={{marginTop: '25px', marginBottom: '12px', color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', 'fontWeight': 500}}>Assignable Teams</div>}
                        rules={[{ required: true, message: '' }]}
                        // style={{textAlign: 'center'}}
                    >
                        <InputNumber 
                            min={1} 
                            onChange={(e)=>{setHasChangedTeams(e !== freqDetail?.subscriptionItem?.quantity); setTeams(e as number)}}
                            size='large'
                            value = {teams}
                        />
                    </Form.Item>
                    <div style={{marginTop: '5px', fontSize:'1rem'}}>You will pay <span style={{fontSize: '1.1rem', fontWeight: 500, color: "#1990ff"}}>${(freqDetail.subscriptionItem?.unit_price * teams / 100)} {freqDetail.subscriptionItem?.item_price_id.split("-")[1].toUpperCase()}</span> in the next billing cycle.</div>
                    { teams < freqDetail.subscriptionItem?.quantity &&
                        <div style={{marginTop:'5px', color: "grey", fontSize:'0.8rem'}}>
                            * You will be compensated for the decreased team usage for the remaining days of the current billing cycle in the form of refundable credits.
                        </div>
                    }
                    { teams > freqDetail.subscriptionItem?.quantity &&
                        <div style={{marginTop:'5px', color: "grey", fontSize:'0.8rem'}}>
                            * You will be charged prorated fees for the increased team usage for the remaining days of the current billing cycle.
                        </div>
                    }
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%', marginTop: '30px'}}
                            disabled={!hasChangedTeams}
                        >
                            Save changes
                        </Button>
                    </div>
                </Form>
            </Drawer>

            <Modal 
                title={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <InfoCircleOutlined style={{color: '#1890ff', fontSize: '1.2rem', marginRight:'8px'}}/>
                        You are about to be redirected to another page
                    </div>
                } 
                open={cfmModal}
                onCancel={()=>{setCfmModal(false)}}
                footer={[
                    <Button key="cancel" onClick={()=>{setCfmModal(false); setConfirmLoading(false)}}>
                      Cancel
                    </Button>,
                    <Button key="proceed" type="primary" loading={confirmLoading} onClick={handleOk}>
                      Proceed
                    </Button>,
                  ]}
            >
                You will be redirected to a secured portal to confirm your changes.
            </Modal>
        </>
    )
}

export default ChangeAssignableTeams;