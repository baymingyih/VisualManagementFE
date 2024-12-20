import { removePaymentMtd } from "@/pages/api/BillingAPIs"
import { ArrowLeftOutlined, CreditCardFilled } from "@ant-design/icons"
import { useMutation } from "@tanstack/react-query"
import { Button, Card, Drawer, Tag, message } from "antd"
import { Dispatch, SetStateAction } from "react"

const removePaymentMethod = ({removePaymentMtdDrawer, setRemovePaymentMtdDrawer, paymentMtdToRemove} : {removePaymentMtdDrawer: boolean, setRemovePaymentMtdDrawer: Dispatch<SetStateAction<boolean>>, paymentMtdToRemove: any}) => {
    
    const { isLoading: deletePaymentMethodLoading, mutate: deletePaymentMethod, } = useMutation({
        mutationKey: ["user_inactivateUsers"],
        mutationFn: (paymentSourceId: string)=> removePaymentMtd(paymentSourceId),
        onSuccess: ({data}:{data:string}) => {
            message.success(`Payment method removed successfully`);
            setRemovePaymentMtdDrawer(false);
        }
    })

    const onRemovePaymentMtdDrawerFinish = () => {
        deletePaymentMethod(paymentMtdToRemove.id)
    }
    
    return (
        <>
             <Drawer open={removePaymentMtdDrawer} onClose={()=> {setRemovePaymentMtdDrawer(false)}} width={600} mask={false} closeIcon={<ArrowLeftOutlined />} maskClosable={false}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Remove Payment Method
                </div>
                <div style={{marginTop: '30px'}}>
                    Are you sure you want to remove the following?
                </div>
                <Card style={{marginTop: '20px', width: '100%'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', height: '100%', alignItems: 'center'}}>
                            <CreditCardFilled style={{fontSize: '35px', marginRight: '10px'}}/>
                            <div>
                                <div style={{fontWeight: 600, fontSize: '0.9rem'}}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        {paymentMtdToRemove?.card?.masked_number}
                                        <Tag style={{marginLeft: '5px'}}>{paymentMtdToRemove?.card?.brand.charAt(0).toUpperCase().concat(paymentMtdToRemove?.card?.brand.substr(1))}</Tag>
                                    </div>
                                </div>
                                <div style={{fontSize: '0.8rem', color: 'grey'}}>
                                    Expiry Date: {paymentMtdToRemove?.card?.expiry_month}/{paymentMtdToRemove?.card?.expiry_year}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type='primary'
                        htmlType='submit'
                        danger
                        onClick={onRemovePaymentMtdDrawerFinish}
                        style={{width: '20%', marginTop: '20px'}}
                        loading={deletePaymentMethodLoading}
                    >
                        Remove
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default removePaymentMethod