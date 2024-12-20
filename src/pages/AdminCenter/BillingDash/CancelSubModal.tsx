import { cancelSubscription } from "@/pages/api/BillingAPIs"
import { WarningOutlined } from "@ant-design/icons"
import { useMutation } from "@tanstack/react-query"
import { Button, Modal, message } from "antd"
import moment from "moment"
import { Dispatch, SetStateAction } from "react"

const CancelSubModal = ({cancelSubModal, setCancelSubModal, subscription, setSubscription} : {cancelSubModal: boolean, setCancelSubModal: Dispatch<SetStateAction<boolean>>, subscription: any, setSubscription: Dispatch<any>}) => {

    const { isLoading: isDeactivateSubscription, mutate: deactivateSubscription } = useMutation({
        mutationKey: ["billing_deactivateSubscription"],
        mutationFn: (subscriptionId: string)=> cancelSubscription(subscriptionId),
        onSuccess: ({data}) => {
            message.success('Subscription scheduled for cancellation successfully');
            setSubscription(data)
            setCancelSubModal(false);
        }
    })

    const handleOk = () => {
        deactivateSubscription(subscription.id)
    }

    return (
        <>
            <Modal 
                title={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <WarningOutlined style={{color: '#F4494B', fontSize: '1.2rem', marginRight:'8px'}}/>
                        You are about to cancel your subscription
                    </div>
                } 
                open={cancelSubModal}
                onCancel={()=>{setCancelSubModal(false)}}
                footer={[
                    <Button key="cancel" onClick={()=>{setCancelSubModal(false)}}>
                      Cancel
                    </Button>,
                    <Button danger key="confirm" type="primary" loading={isDeactivateSubscription} onClick={handleOk}>
                      Deactivate
                    </Button>,
                  ]}
            >
                Are you sure you want to cancel your subscription?<br/><br/>
                Upon cancellation, your subscription will be deactivated on the next billing cycle. 
                You will still have access to your account until the end of the current billing cycle on <b>{moment(new Date(0).setUTCSeconds(subscription?.current_term_end)).local().format("DD MMM YYYY")}</b>.
            </Modal>
        </>
    )
}

export default CancelSubModal;
