import { unCancelSubscription } from "@/pages/api/BillingAPIs"
import { InfoCircleOutlined } from "@ant-design/icons"
import { useMutation } from "@tanstack/react-query"
import { Button, Modal, message } from "antd"
import moment from "moment"
import { Dispatch, SetStateAction } from "react"

const UncancelSubModal = ({uncancelSubModal, setUncancelSubModal, subscription, setSubscription} : {uncancelSubModal: boolean, setUncancelSubModal: Dispatch<SetStateAction<boolean>>, subscription: any, setSubscription: Dispatch<any>}) => {

    const { isLoading: isReactivateSubscription, mutate: reactivateSubscription } = useMutation({
        mutationKey: ["billing_reactivateSubscription"],
        mutationFn: (subscriptionId: string)=> unCancelSubscription(subscriptionId),
        onSuccess: ({data}) => {
            message.success('Subscription reactivated successfully');
            setSubscription(data)
            setUncancelSubModal(false);
        }
    })

    const handleOk = () => {
        reactivateSubscription(subscription.id)
    }

    return (
        <>
            <Modal 
                title={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <InfoCircleOutlined style={{color: '#1890ff', fontSize: '1.2rem', marginRight:'8px'}}/>
                        You are about to reactivate your subscription
                    </div>
                } 
                open={uncancelSubModal}
                onCancel={()=>{setUncancelSubModal(false)}}
                footer={[
                    <Button key="cancel" onClick={()=>{setUncancelSubModal(false)}}>
                      Cancel
                    </Button>,
                    <Button key="confirm" type="primary" loading={isReactivateSubscription} onClick={handleOk}>
                      Activate
                    </Button>,
                  ]}
            >
                Your subscription has been scheduled for cancellation on <b>{moment(new Date(0).setUTCSeconds(subscription.current_term_end)).local().format("DD MMM YYYY")}</b>.<br/><br/>
                Are you sure you want to reactivate your subscription?
            </Modal>
        </>
    )
}

export default UncancelSubModal;
