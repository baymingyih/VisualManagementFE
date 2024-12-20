import { managePaymentSourcesHosted } from "@/pages/api/BillingAPIs"
import { InfoCircleOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Modal } from "antd"
import { Dispatch, SetStateAction, useState } from "react"

import { useRouter } from 'next/router';

const ManagePaymentMethods = ({paymentMtdDrawer, setPaymentMtdDrawer, customerId} : {paymentMtdDrawer: boolean, setPaymentMtdDrawer: Dispatch<SetStateAction<boolean>>, customerId: string}) => {

    const router = useRouter();
    const [confirmLoading, setConfirmLoading] = useState(false);

    const { refetch: managePaymentMethods, isLoading: isManagePaymentMethods } = useQuery({
        queryKey: ["billing_managementPaymentMethods", customerId],
        queryFn: () => managePaymentSourcesHosted(customerId),
        onSuccess: ({data}: {data: any}) => {
            setConfirmLoading(false);
            router.push(data.url)
        },
        onError: () => {
            setConfirmLoading(false);
            console.log('Unable to fetch payment methods portal.')
        },
        enabled: false
    })

    const handleOk = () => {
        setConfirmLoading(true);
        managePaymentMethods();
    }

    return (
        <>
            <Modal 
                title={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <InfoCircleOutlined style={{color: '#1890ff', fontSize: '1.2rem', marginRight:'8px'}}/>
                        You are about to be redirected to another page
                    </div>
                } 
                open={paymentMtdDrawer}
                onCancel={()=>{setPaymentMtdDrawer(false)}}
                footer={[
                    <Button key="cancel" onClick={()=>{setPaymentMtdDrawer(false); ; setConfirmLoading(false)}}>
                      Cancel
                    </Button>,
                    <Button key="proceed" type="primary" loading={confirmLoading} onClick={handleOk}>
                      Proceed
                    </Button>,
                  ]}
            >
                You will be redirected to a secured portal to manage your payment methods.
                
            </Modal>
        </>
    )
}

export default ManagePaymentMethods;
