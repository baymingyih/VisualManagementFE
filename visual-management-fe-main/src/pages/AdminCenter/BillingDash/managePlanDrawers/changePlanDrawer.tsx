import { editSubscriptionHosted, getAllItemPrices } from "@/pages/api/BillingAPIs";
import { CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Descriptions, Divider, Drawer, Form, Modal, Radio, Tag } from "antd"
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { numUsers } from "@/utilities/commons";
import { useRouter } from "next/router";

const ChangePlan = ({changePlanDrawer, setChangePlanDrawer, freqDetail}: {changePlanDrawer: boolean, setChangePlanDrawer: Dispatch<SetStateAction<boolean>>, freqDetail: any}) => {
    const [form] = Form.useForm()

    const [plan, setPlan] = useState("")
    const [hasChangedPlan, setHasChangedPlan] = useState(false)

    const router = useRouter();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [cfmModal, setCfmModal] = useState(false);

    const [itemPrices, setItemPrices] = useState<any>({});

    const { refetch: fetchAllItemPrices, isLoading: isFetchAllItemPrices } = useQuery({
        queryKey: ["billing_getAllItemPrices"],
        queryFn: () => getAllItemPrices(),
        onSuccess: ({data}: {data: any}) => {
            setItemPrices(data);
        },
        onError: () => {
            console.log('Unable to fetch item prices')
        },
        enabled: false
    })

    const { isLoading: isUpdatePlan, mutate: updatePlan } = useMutation({
        mutationKey: ["billing_updatePlan"],
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
        // console.log(freqDetail)
        setPlan(freqDetail?.subscriptionItem?.item_price_id.split("-")[0]);
        form.setFieldValue('plan', freqDetail?.subscriptionItem?.item_price_id.split("-")[0])
        setHasChangedPlan(false)
        fetchAllItemPrices();
    }, [form, freqDetail, changePlanDrawer]);

    const onAssignableTeamsDrawerFinish = (values: any) => {
        setCfmModal(true);
    }

    const handleOk = () => {
        setConfirmLoading(true);
        updatePlan({
            subscriptionId: freqDetail.subscriptionId,
            planId: form.getFieldValue('plan') === 'free' ? 'free-USD-Monthly' : form.getFieldValue('plan') + "-" + freqDetail.subscriptionItem.item_price_id.split("-").slice(1,).join("-").toLowerCase(),
            quantity: form.getFieldValue('plan') === 'free' ? 1 : freqDetail.subscriptionItem.quantity
        });
    }

    return (
        <>
            <Drawer open={changePlanDrawer} onClose={()=> setChangePlanDrawer(false)} width={700}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Change Plan
                </div>
                <div style={{marginBottom: '20px', color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', 'fontWeight': 500}}>
                    Plan Details
                </div>
                <Descriptions column={2} labelStyle={{fontWeight: 500, width: '20%'}} bordered>
                    <Descriptions.Item label="Plan" span={1} contentStyle={{width: '40%'}}>
                        <div>{freqDetail.subscriptionItem?.item_price_id.split("-")[0].charAt(0).toUpperCase().concat(freqDetail.subscriptionItem?.item_price_id.split("-")[0].substr(1))}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Teams" span={1} contentStyle={{width: '30%'}}>
                        <div>{freqDetail.subscriptionItem?.quantity}</div>
                    </Descriptions.Item>
                </Descriptions>
                <div style={{marginTop: '25px', marginBottom: '20px', color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', 'fontWeight': 500}}>
                    Plans
                </div>
                <Form 
                    onFinish={onAssignableTeamsDrawerFinish}
                    layout= 'vertical'
                    form={form}
                    requiredMark={false}
                >
                    <Form.Item
                        name="plan"
                        // label={<div style={{marginTop: '25px', marginBottom: '12px', color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', 'fontWeight': 500}}>Plans</div>}
                        rules={[{ required: true, message: '' }]}
                    >
                        <Radio.Group onChange={(e)=>setHasChangedPlan(e.target.value !== plan)}>
                            <div style={{ width: '650px', display:'flex', justifyContent: 'space-between'}}>
                                <Radio.Button value={'free'} style={{height: '100%', width: '313px'}}>
                                    {plan === 'free' && 
                                        <div style={{backgroundColor: "#1990ff", color: 'white', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', margin:'0 -16px'}}>CURRENT</div>
                                    }
                                    {plan !== 'free' && 
                                        <div style={{color: 'white'}}>CURRENT</div>
                                    }
                                    <div style={{margin: '10px', color: '#26282B', textAlign: 'center'}}>
                                        <div style={{marginBottom: '15px'}}>
                                            <div style={{fontSize: '1.3rem', fontWeight: 700}}>Free Plan</div>
                                            <div style={{fontSize: '0.8rem', color: 'grey'}}>Free forever until you are ready</div>
                                        </div>
                                        <Divider style={{margin: '15px 0'}}/>
                                        <div>
                                            <div><CheckCircleOutlined /> {numUsers['free']} users per team</div>
                                            <div><CheckCircleOutlined /> Limited to 1 team</div>
                                        </div>
                                        <Divider style={{margin: '15px 0'}}/>
                                        <div style={{marginBottom: '80px'}}>
                                            <div style={{fontSize: '0.9rem', fontWeight: 700, marginBottom: '5px'}}>Forever</div>
                                            <div style={{fontSize: '1.3rem', fontWeight: 700, color:"#1990ff"}}>$0 USD</div>
                                        </div>
                                    </div>
                                </Radio.Button>
                                <Radio.Button value={'basic'} style={{height: '100%', width: '313px'}}>
                                    {plan === 'basic' && 
                                        <div style={{backgroundColor: "#1990ff", color: 'white', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', margin:'0 -16px'}}>CURRENT</div>
                                    }
                                    {plan !== 'basic' && 
                                        <div style={{color: 'white'}}>CURRENT</div>
                                    }
                                    <div style={{margin: '10px', color: '#26282B', textAlign: 'center'}}>
                                        <div style={{marginBottom: '15px'}}>
                                            <div style={{fontSize: '1.3rem', fontWeight: 700}}>Basic Plan</div>
                                            <div style={{fontSize: '0.8rem', color: 'grey'}}>Everything you need to start taking charge</div>
                                        </div>
                                        <Divider style={{margin: '15px 0'}}/>
                                        <div>
                                            <div><CheckCircleOutlined /> {numUsers['basic']} users per team</div>
                                            <div><CheckCircleOutlined /> Unlimited teams</div>
                                        </div>
                                        <Divider style={{margin: '15px 0'}}/>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 10px', marginBottom: '30px'}}>
                                            <div>
                                                <div style={{fontSize: '0.9rem', fontWeight: 700, marginBottom: '5px'}}>Monthly</div>
                                                <div style={{fontSize: '1.3rem', fontWeight: 700, color:"#1990ff", marginBottom: '-10px'}}>${itemPrices['basic-usd-monthly']?.price/100} {itemPrices['basic-usd-monthly']?.currency_code}</div>
                                                <div>per team</div>
                                                <Tag color='white'></Tag>
                                            </div>
                                            <Divider type='vertical' style={{height: '50px'}}/>
                                            <div>
                                                <div style={{fontSize: '0.9rem', fontWeight: 700, marginBottom: '5px'}}>Yearly</div>
                                                <div style={{fontSize: '1.3rem', fontWeight: 700, color:"#1990ff", marginBottom: '-10px'}}>${itemPrices['basic-usd-yearly']?.price/100} {itemPrices['basic-usd-yearly']?.currency_code}</div>
                                                <div>per team</div>
                                                <Tag color='blue'>Save 5%</Tag>
                                            </div>
                                        </div>
                                    </div>
                                </Radio.Button>
                            </div>
                        </Radio.Group>
                    </Form.Item>
                    <div style={{marginTop:'5px', color: "grey", fontSize:'0.8rem'}}>
                        * If downgrading to a lower tiered plan, you will be compensated for the remaining days of the current billing cycle in the form of refundable credits.
                    </div>
                    <div style={{marginTop:'5px', color: "grey", fontSize:'0.8rem'}}>
                        * If upgrading to a higher tiered plan, you will be charged prorated fees for the remaining days of the current billing cycle.
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%', marginTop: '30px'}}
                            disabled={!hasChangedPlan}
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

export default ChangePlan;