import { getPaymentMethods, updatePaymentMethod } from "@/pages/api/BillingAPIs";
import { CreditCardFilled, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Drawer, Form, List, Modal, Radio, Tag, message } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import RemovePaymentMethod from "./RemovePaymentMethod";

const ChangePaymentMethod = ({paymentMtdDrawer, setPaymentMtdDrawer, customerId, currentPaymentMtd, setCurrentPaymentMtd}: {paymentMtdDrawer: boolean, setPaymentMtdDrawer: Dispatch<SetStateAction<boolean>>, customerId: string, currentPaymentMtd: any, setCurrentPaymentMtd: Dispatch<any>}) => {
    const [paymentMethods, setPaymentMethods] = useState([] as any[]);
    const [hasChangedMtd, setHasChangedMtd] = useState(false)

    const [removePaymentMtdDrawer, setRemovePaymentMtdDrawer] = useState(false);
    const [paymentMtdToRemove, setPaymentMtdToRemove] = useState<any>({})

    const [form] = Form.useForm()
    
    const { refetch: fetchPaymentMethods, isLoading: isFetchPaymentMethods } = useQuery({
        queryKey: ["billing_getPaymentMethods", customerId],
        queryFn: () => getPaymentMethods(customerId),
        onSuccess: ({data}: {data: any}) => {
            data.forEach(function(item: any, i: any){
                if(item.id === currentPaymentMtd.paymentSourceId) {
                    data.splice(i, 1);
                    data.unshift(item);
                }
            });
            // console.log(data)
            setPaymentMethods(data);
        },
        onError: () => {
            console.log('Unable to fetch payment methods.')
        },
        enabled: false
    })

    const { isLoading: updatePaymentMtdLoading, mutate: editPaymentMethod, } = useMutation({
        mutationKey: ["billing_updatePaymentMtd"],
        mutationFn: (obj: {customerId: string, paymentSourceId: string})=> updatePaymentMethod(obj),
        onSuccess: ({data}) => {
            message.success('Payment method updated successfully');
            // console.log(data)
            setCurrentPaymentMtd(
                {
                    paymentSourceId: data.id,
                    maskedCardInfo: data.card.brand.charAt(0).toUpperCase().concat(data.card.brand.substr(1)) + ' ' + data.card.masked_number,
                }
            )
            setPaymentMtdDrawer(false);    
            setHasChangedMtd(false);
        }
    })

    useEffect(() => {
        fetchPaymentMethods();
    }, [customerId, fetchPaymentMethods, paymentMtdDrawer, removePaymentMtdDrawer])

    useEffect(() => {
        form.setFieldsValue({
            method: currentPaymentMtd.paymentSourceId
        })
    }, [form, paymentMtdDrawer]);

    const onPaymentMtdDrawerFinish = (values: any) => {
        editPaymentMethod({
            customerId: customerId,
            paymentSourceId: values.method
        })
    }
    
    return (
        <>
            <Drawer
                onClose={() => setPaymentMtdDrawer(false)}
                open={paymentMtdDrawer}
                width={600}
            >
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Change Payment Method
                </div>
                <div style={{display:'flex', justifyContent: 'space-between', alignItems:'center', color: 'rgba(0, 0, 0, 0.85)', 'fontWeight': 500, marginBottom: '20px'}}>
                    Payment Methods
                    <Button icon={<PlusOutlined />}>Add Card</Button>
                </div>
                <div>
                <iframe
                    width="100%"
                    height="650"
                    src="payment_url"
                    loading="lazy"
                ></iframe>
                </div>
                <Form 
                    onFinish={onPaymentMtdDrawerFinish}
                    layout= 'vertical'
                    form={form}
                    requiredMark={false}
                >
                    <Form.Item
                        name="method"
                        rules={[{ required: true, message: '' }]}
                    >
                        <Radio.Group onChange={(e)=>setHasChangedMtd(e.target.value !== currentPaymentMtd.paymentSourceId)}>
                            <List
                                grid={{ gutter: 10, column: 1 }}
                                dataSource={paymentMethods}
                                loading={isFetchPaymentMethods}
                                renderItem={item => (
                                <List.Item>
                                    <Radio value={item.id} style={{display: 'flex', alignItems: 'center'}}>
                                        <Card style={{marginLeft: '10px', width: '518px'}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', height: '100%', alignItems: 'center'}}>
                                                    <CreditCardFilled style={{fontSize: '35px', marginRight: '10px'}}/>
                                                    <div>
                                                        <div style={{fontWeight: 600, fontSize: '0.9rem'}}>
                                                            <div style={{display: 'flex', alignItems: 'center'}}>
                                                                {item.card.masked_number}
                                                                <Tag style={{marginLeft: '5px'}}>{item.card.brand.charAt(0).toUpperCase().concat(item.card.brand.substr(1))}</Tag>
                                                            </div>
                                                        </div>
                                                        <div style={{fontSize: '0.8rem', color: 'grey'}}>
                                                            Expiry Date: {item.card.expiry_month}/{item.card.expiry_year}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {item.id === currentPaymentMtd.paymentSourceId ? 
                                                        <Tag color="#87d068">Current</Tag> : 
                                                        <Button size="small" type="link" style={{marginRight: '5px'}} onClick={()=>{setPaymentMtdToRemove(item); setRemovePaymentMtdDrawer(true);}}>Remove</Button>
                                                    }
                                                </div>
                                            </div>
                                        </Card>
                                    </Radio>
                                </List.Item>
                                )}
                            />
                        </Radio.Group> 
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%'}}
                            disabled={!hasChangedMtd}
                            loading={updatePaymentMtdLoading}
                        >
                            Save changes
                        </Button>
                    </div>
                </Form>
            </Drawer>
            <RemovePaymentMethod 
                removePaymentMtdDrawer={removePaymentMtdDrawer}
                setRemovePaymentMtdDrawer={setRemovePaymentMtdDrawer} 
                paymentMtdToRemove={paymentMtdToRemove}
            />
        </>
    );
}

export default ChangePaymentMethod;