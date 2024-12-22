import { managePaymentSourcesHosted, refundCreditNotes } from "@/pages/api/BillingAPIs"
import { InfoCircleOutlined } from "@ant-design/icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button, Modal, message } from "antd"
import { Dispatch, SetStateAction, useState } from "react"

const RefundCredits = ({refundCreditsModal, setRefundCreditsModal, customerId, accDetails, setAccDetails} : {refundCreditsModal: boolean, setRefundCreditsModal: Dispatch<SetStateAction<boolean>>, customerId: string, accDetails: any, setAccDetails: Dispatch<any>}) => {

    const { mutate: refundCredits, isLoading: isRefundCredits } = useMutation({
        mutationKey: ["billing_refundCredits"],
        mutationFn: () => refundCreditNotes(customerId),
        onSuccess: ({data}: {data: any}) => {
            setRefundCreditsModal(false);
            message.success('Credits refunded successfully')
            setAccDetails({...accDetails, credits: 0})
        },
        onError: () => {
            setRefundCreditsModal(false);
            message.error('Unable to refund credits. Please try again later.')
            console.log('Unable to refund credits.')
        }
    })

    const handleOk = () => {
        refundCredits();
    }

    return (
        <>
            <Modal 
                title={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <InfoCircleOutlined style={{color: '#1890ff', fontSize: '1.2rem', marginRight:'8px'}}/>
                        Refund credits
                    </div>
                } 
                open={refundCreditsModal}
                onCancel={()=>{setRefundCreditsModal(false)}}
                footer={[
                    <Button key="cancel" onClick={()=>{setRefundCreditsModal(false)}}>
                      Cancel
                    </Button>,
                    <Button key="proceed" type="primary" loading={isRefundCredits} onClick={handleOk}>
                      Proceed
                    </Button>,
                  ]}
            >
                All available credits will be refunded back to the payment method used for the transactions.
            </Modal>
        </>
    )
}

export default RefundCredits;
