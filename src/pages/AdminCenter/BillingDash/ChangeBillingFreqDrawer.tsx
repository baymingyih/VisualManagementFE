import { cancelScheduledChanges, getItemPrices, updateBillingFreq } from "@/pages/api/BillingAPIs";
import { DollarCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Button, Col, Descriptions, Drawer, Form, Radio, Row, Space, Tag, message } from "antd"
import { Dispatch, SetStateAction, use, useEffect, useState } from "react";

const changeBillingFreq = ({billingFreqDrawer, setBillingFreqDrawer, freqDetail, newFreq, setNewFreq}: {billingFreqDrawer: boolean, setBillingFreqDrawer: Dispatch<SetStateAction<boolean>>, freqDetail: any, newFreq: any, setNewFreq: Dispatch<SetStateAction<any>>}) => {
    const [form] = Form.useForm()

    const [freq, setFreq] = useState('')
    const [hasChangedFreq, setHasChangedFreq] = useState(false)
    const [itemPriceMonthly, setItemPriceMonthly] = useState<any>({})
    const [itemPriceYearly, setItemPriceYearly] = useState<any>({})

    const { isLoading: updateBillingFreqLoading, mutate: editBillingFreq, } = useMutation({
        mutationKey: ["billing_updateBillingFreq"],
        mutationFn: (obj: {subscriptionId: string, newPlanId: string, quantity: number})=> updateBillingFreq(obj),
        onSuccess: ({data}) => {
            message.success('Billing frequency updated successfully');
            setNewFreq(
                {
                  billing_unit: data.billing_period_unit,
                  payment_amt: data.subscription_items[0].amount/100,
                }
            )
            setBillingFreqDrawer(false);    
            setHasChangedFreq(false);
        }
    })

    const { isLoading: removeSchLoading, mutate: removeScheduledChanges, } = useMutation({
        mutationKey: ["billing_updateBillingFreq"],
        mutationFn: (subscriptionId: string)=> cancelScheduledChanges(subscriptionId),
        onSuccess: ({data}) => {
            message.success('Scheduled changes cancelled successfully');
            setNewFreq({});
        }
    })

    const { refetch: fetchItemPrices, isLoading: isFetchItemPrices } = useQuery({
        queryKey: ["billing_getItemPrices", freqDetail],
        queryFn: () => getItemPrices(freqDetail?.subscriptionItem?.item_price_id.split('-').slice(0, -1).join('-')),
        onSuccess: ({data}: {data: any}) => {
            data.forEach((item: any) => {
                if (item.unit === 'monthly') {
                    setItemPriceMonthly({
                        itemPrice: item.itemPrice,
                        currency: item.currency
                    })
                };
                if (item.unit === 'yearly') {
                    setItemPriceYearly({
                        itemPrice: item.itemPrice,
                        currency: item.currency
                    })
                };
            });
        },
        onError: () => {
            console.log('Unable to fetch item price data')
        },
        enabled: false
    })

    useEffect(() => {
        setFreq(freqDetail?.subscriptionItem?.item_price_id.split('-').slice(-1)[0]);
        form.setFieldsValue({
            freq: freq
        })
        if (freqDetail?.subscriptionItem?.item_price_id.split('-').slice(0, -1).join('-')) {
            fetchItemPrices();
            // console.log(itemPriceMonthly, itemPriceYearly)
        }
    }, [form, freqDetail, billingFreqDrawer, fetchItemPrices]);

    const onBillingFreqDrawerFinish = (values: any) => {
        editBillingFreq({
            subscriptionId: freqDetail.subscriptionId,
            newPlanId: freqDetail?.subscriptionItem?.item_price_id.split('-').slice(0, -1).join('-').concat(`-${values.freq}`),
            quantity: freqDetail.subscriptionItem.quantity
        })
    }

    return (
        <>
            <Drawer open={billingFreqDrawer} onClose={()=> setBillingFreqDrawer(false)} width={600}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Change Billing Frequency
                </div>
                <div style={{marginBottom: '20px', color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', 'fontWeight': 500}}>
                    Plan Details
                </div>
                <Descriptions column={2} labelStyle={{fontWeight: 500, width: '20%'}} bordered>
                    <Descriptions.Item label="Plan" span={1} contentStyle={{width: '40%'}}>
                        <div>{freqDetail.subscriptionItem?.item_price_id.split("-")[0].charAt(0).toUpperCase().concat(freqDetail.subscriptionItem.item_price_id.split("-")[0].substr(1))}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Teams" span={1} contentStyle={{width: '30%'}}>
                        <div>{freqDetail.subscriptionItem?.quantity}</div>
                    </Descriptions.Item>
                </Descriptions>
                <div style={{marginTop: '25px', marginBottom: '20px', color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', 'fontWeight': 500}}>
                    Billing Frequency
                </div>
                {Object.keys(newFreq).length !== 0 && 
                    <Alert
                        description={
                            <>
                                <Row>
                                    <Col span={1}><InfoCircleOutlined style={{fontSize: '1rem', color: '#1990ff'}}/></Col>
                                    <Col span={23}>
                                        <div>The billing frequency has been scheduled to change to <b>{newFreq?.billing_unit?.concat('ly').charAt(0).toUpperCase().concat(newFreq?.billing_unit?.slice(1).concat('ly'))}</b> in the next billing cycle. You may cancel the change before the next billing cycle.</div>
                                        <div>
                                            <Button danger size="small" style={{marginTop: '8px'}} onClick={()=>{console.log(freqDetail); removeScheduledChanges(freqDetail.subscriptionId)}} loading={removeSchLoading}>Cancel Change</Button>
                                        </div>
                                    </Col>
                                </Row>
                                
                            </>
                        }
                        type="info"
                        style={{marginBottom: '20px'}}
                    />
                }
                <Form 
                    onFinish={onBillingFreqDrawerFinish}
                    layout= 'vertical'
                    form={form}
                    requiredMark={false}
                >
                    <Form.Item
                        name="freq"
                        // label={<div style={{marginTop: '25px', marginBottom: '12px', color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', 'fontWeight': 500}}>Billing Frequency</div>}
                        rules={[{ required: true, message: '' }]}
                    >
                        <Radio.Group onChange={(e)=>setHasChangedFreq(e.target.value !== freq)} disabled={Object.keys(newFreq).length !== 0}>
                            <Space direction="vertical" size="large">
                                <Radio value={'monthly'}>
                                    <div>
                                        <div style={{fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems:'center', marginBottom: '10px'}}>Monthly <Tag style={{marginLeft: '10px'}} icon={<DollarCircleOutlined />} color={Object.keys(newFreq).length !== 0 ? "" : "#1990ff"}>{itemPriceMonthly.itemPrice/100} {itemPriceMonthly.currency} per Team</Tag></div>
                                        <div style={{color: 'rgba(0, 0, 0, 0.45)'}}>Account will be billed every month.</div>
                                        <div style={{marginTop: '5px', fontSize:'1rem'}}>You will pay <span style={{fontSize: '1.1rem', fontWeight: 500, color: `${Object.keys(newFreq).length !== 0 ? "" : "#1990ff"}`}}>${itemPriceMonthly.itemPrice * freqDetail.subscriptionItem?.quantity / 100} {itemPriceMonthly.currency}</span> in the next billing cycle.</div>
                                    </div>
                                </Radio>
                                <Radio value={'yearly'}>
                                    <div>
                                        <div style={{fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems:'center', marginBottom: '10px'}}>Yearly <Tag style={{marginLeft: '10px'}} icon={<DollarCircleOutlined />} color={Object.keys(newFreq).length !== 0 ? "" : "#1990ff"}>{itemPriceYearly.itemPrice/100} {itemPriceYearly.currency} per Team</Tag></div>
                                        <div style={{color: 'rgba(0, 0, 0, 0.45)'}}>Account will be billed every year.</div>
                                        <div style={{marginTop: '5px', fontSize:'1rem'}}>You will pay <span style={{fontSize: '1.1rem', fontWeight: 500, color: `${Object.keys(newFreq).length !== 0 ? "" : "#1990ff"}`}}>${itemPriceYearly.itemPrice * freqDetail.subscriptionItem?.quantity / 100} {itemPriceYearly.currency}</span> in the next billing cycle.</div>
                                    </div>
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%', marginTop: '20px'}}
                            disabled={!hasChangedFreq}
                            loading={updateBillingFreqLoading}
                        >
                            Save changes
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default changeBillingFreq;