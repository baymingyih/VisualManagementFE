import { Button, Card, Descriptions, Skeleton } from 'antd';
import styles from '../mainStyles.module.css';
import { CheckCircleFilled, CloseCircleFilled, CloseCircleOutlined, EditOutlined, ExclamationCircleFilled, UpCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { getScheduledSubscription, getSubscriptionInfo } from '../../api/BillingAPIs';
import { useEffect, useState } from 'react';
import ChangeBillingAcc from './ChangeBillingAddrDrawer';
import ChangeBillingFreq from './ChangeBillingFreqDrawer';
// import ChangePaymentMethod from './paymentMtdDrawers/ChangePaymentMethodsDrawer';
import ManagePaymentMethods from './paymentMtdDrawers/ManagePaymentMethods';
import CancelSubModal from './CancelSubModal';
import UncancelSubModal from './UncancelSubModal';
import ChangeAssignableTeams from './managePlanDrawers/changeAssignTeamsDrawer';
import { numUsers } from '@/utilities/commons';
import ChangePlan from './managePlanDrawers/changePlanDrawer';
import RefundCredits from './RefundCredits';

const userId = 6

const BillingDash = (countries: any) => {
  const [fetchedData, setFetchedData] = useState(true)
  const [subscription, setSubscription] = useState<any>({})
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<any>({})

  const [billingAccDrawer, setBillingAccDrawer] = useState(false)
  const [accDetails, setAccDetails] = useState<any>({})

  const [billingFreqDrawer, setBillingFreqDrawer] = useState(false)
  const [freqDetail, setFreqDetail] = useState<any>({})
  const [newFreq, setNewFreq] = useState<any>({})

  const [paymentMtdDrawer, setPaymentMtdDrawer] = useState(false)

  const [cancelSubModal, setCancelSubModal] = useState(false)
  const [uncancelSubModal, setUncancelSubModal] = useState(false)

  const [assignableTeamsDrawer, setAssignableTeamsDrawer] = useState(false)
  const [changePlanDrawer, setChangePlanDrawer] = useState(false)

  const [refundCreditsModal, setRefundCreditsModal] = useState(false)

  const { refetch: fetchSubscription, isLoading: isFetchSubscription } = useQuery({
    queryKey: ["billing_getSubscription", userId],
    queryFn: () => getSubscriptionInfo(userId),
    onSuccess: ({ data }) => {
      // console.log(data)
      setSubscription(data.subscription)
      setFetchedData(false)
      setAccDetails({
        customerId: data.customer.id,
        first_name: data.customer.billing_address.first_name,
        last_name: data.customer.billing_address.last_name,
        line1: data.customer.billing_address.line1,
        line2: data.customer.billing_address.line2 ? data.customer.billing_address.line2 : "",
        line3: data.customer.billing_address.line3 ? data.customer.billing_address.line3 : "",
        zip: data.customer.billing_address.zip,
        country: data.customer.billing_address.country,
        state: data.customer.billing_address.state ? data.customer.billing_address.state : "",
        city: data.customer.billing_address.city ? data.customer.billing_address.city : "",
        email: data.customer.billing_address.email,
        phone: data.customer.billing_address.phone ? data.customer.billing_address.phone.charAt(0)==="+" ? data.customer.billing_address.phone.split(' ').slice(1).join('') : data.customer.billing_address.phone : "",
        credits: data.customer.refundable_credits
      })
      setFreqDetail({
        subscriptionId: data.subscription.id,
        subscriptionItem: data.subscription.subscription_items[0]
      })
      setCurrentPaymentMethod({
        paymentSourceId: data.card.payment_source_id,
        maskedCardInfo: data.card.card_type.charAt(0).toUpperCase().concat(data.card.card_type.substr(1)) + ' ' + data.card.masked_number
      })
    },
    onError: () => {
      console.log('Unable to fetch subscription data')
    },
    enabled: false
  });

  const { refetch: fetchScheduledSubscription, isLoading: isFetchSchSubscription } = useQuery({
    queryKey: ["billing_getScheduledSubscription", subscription?.id],
    queryFn: () => getScheduledSubscription(subscription?.id),
    onSuccess: ({ data }) => {
      // console.log(data)
      if (data.billing_period_unit !== subscription.billing_period_unit) {
        setNewFreq(
          {
            billing_unit: data.billing_period_unit,
            payment_amt: data.subscription_items[0].amount/100,
          }
        )
      }
    },
    onError: () => {
      console.log('Unable to fetch scheduled subscription data')
    },
    enabled: false
  });
  
  useEffect(() => {
    if (userId) {
      fetchSubscription()
      return
    }
  }, [fetchSubscription, userId])

  useEffect(() => {
    if (subscription.has_scheduled_changes) {
      fetchScheduledSubscription()
      return
    }
  }, [fetchScheduledSubscription, subscription])

  return (
    <>
      <div className={styles.title}>Billing</div>
      <Card>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div className={styles.subtitle}>Plan Details</div>
        </div>
        <Descriptions column={1} labelStyle={{fontWeight: 500, width: '20%'}} bordered>
          <Descriptions.Item label="Plan" span={1} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>{Object.keys(subscription).length !== 0 && subscription.subscription_items[0].item_price_id.split("-")[0].charAt(0).toUpperCase().concat(subscription.subscription_items[0].item_price_id.split("-")[0].substr(1))}</div>
                {(subscription?.status === 'active' || subscription?.status === 'in_trial') && 
                  <a onClick={()=>{setChangePlanDrawer(true)}}>Change Plan</a>
                }
              </div>
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Assignable Teams" span={1} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <span>{Object.keys(subscription).length !== 0 && subscription.subscription_items[0].quantity} Team(s)</span>
                  <span style={{marginLeft: '10px', color: "grey", fontSize:'0.8rem'}}>{Object.keys(subscription).length !== 0 && numUsers[subscription.subscription_items[0].item_price_id.split("-")[0] as keyof typeof numUsers]} Users per Team</span>
                </div>
                {(subscription?.status === 'active' || subscription?.status === 'in_trial') && (subscription.subscription_items[0].item_price_id.split("-")[0] !== 'free') &&
                  <a onClick={()=>setAssignableTeamsDrawer(true)}>Change Assignable Teams</a>
                }
              </div>
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={1} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                {subscription?.status === 'active' && 
                  <div>
                    <CheckCircleFilled style={{color: 'green'}}/> Active
                  </div>
                }
                {subscription?.status === 'in_trial' && 
                  <div>
                    <ExclamationCircleFilled style={{color: 'orange'}}/> In Trial (Ends {moment(new Date(0).setUTCSeconds(subscription?.trial_end)).local().format('DD MMM YYYY')})
                  </div>
                }
                {subscription?.status === 'cancelled' && 
                  <div>
                    <CloseCircleFilled style={{color: 'red'}}/> Cancelled
                  </div>
                }
                {subscription?.status === 'non_renewing' && 
                  <div>
                    <ExclamationCircleFilled style={{color: 'red'}}/> Expiring on {moment(new Date(0).setUTCSeconds(subscription?.cancelled_at)).local().format('DD MMM YYYY')}
                  </div>
                }

                {(subscription?.status === 'active' || subscription?.status === 'in_trial') &&
                  <a onClick={()=>setCancelSubModal(true)}>Deactivate Plan</a>
                }
                {(subscription?.status === 'cancelled' || subscription?.status === 'non_renewing') && 
                  <a onClick={()=>setUncancelSubModal(true)}>Reactivate Plan</a>
                }
              </div>
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Start Date" span={1} contentStyle={{width: '30%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div>{moment(new Date(0).setUTCSeconds(subscription?.started_at)).local().format("DD MMM YYYY")}</div>
            </Skeleton>
          </Descriptions.Item>
        </Descriptions>        
      </Card>
      <Card style={{marginTop: '30px'}}>
        <div className={styles.subtitle}>Payment Details</div>
        <Descriptions column={1} labelStyle={{fontWeight: 500}} bordered>
          <Descriptions.Item label="Next Payment Date" span={2} contentStyle={{width: '30%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              {(subscription?.status === 'active' || subscription?.status === 'in_trial') && 
                <div>
                  {moment(new Date(0).setUTCSeconds(subscription?.next_billing_at)).local().format("DD MMM YYYY")}
                </div>
              }
              {(subscription?.status === 'cancelled' || subscription?.status === 'non_renewing') && 
                <div>
                  -
                </div>
              }
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Amount" span={2} contentStyle={{width: '30%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              {(subscription?.status === 'active' || subscription?.status === 'in_trial') && 
                <>
                  <div>
                    ${Object.keys(subscription).length !== 0 && (subscription.subscription_items[0].amount/100).toFixed(2)} {subscription?.currency_code}
                  </div>
                  {Object.keys(newFreq).length !== 0 &&
                    <div style={{color: 'grey', fontSize:'0.8rem'}}>
                      (Will be changed to <b>${newFreq?.payment_amt.toFixed(2)} {subscription?.currency_code}</b> on {moment(new Date(0).setUTCSeconds(subscription?.next_billing_at)).local().format("DD MMM YYYY")})
                    </div>
                  }
                  {accDetails.credits !== 0 && 
                    <div style={{color: 'grey', fontSize:'0.8rem'}}>
                      Available credits (${(accDetails.credits/100).toFixed(2)} {subscription?.currency_code}) will be used to offset payment. Remaining amount will be charged to payment method.
                    </div>
                    
                  }
                </>
              }
              {(subscription?.status === 'cancelled' || subscription?.status === 'non_renewing') && 
                <div>
                  -
                </div>
              }
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Billing Frequency" span={2} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                {subscription?.billing_period_unit === 'month' && 
                  <>
                    <div>Monthly</div>
                    {Object.keys(newFreq).length !== 0 && 
                      <div style={{color: 'grey', fontSize:'0.8rem'}}> (Will be changed to <b>Yearly</b> on {moment(new Date(0).setUTCSeconds(subscription?.next_billing_at)).local().format("DD MMM YYYY")})</div>
                    }
                  </>
                }
                {subscription?.billing_period_unit === 'year' && 
                  <>
                    <div>Yearly</div>
                    {Object.keys(newFreq).length !== 0 && 
                      <div style={{color: 'grey'}}> (Will be changed to <b>Monthly</b> on {moment(new Date(0).setUTCSeconds(subscription?.next_billing_at)).local().format("DD MMM YYYY")})</div>
                    }
                  </>
                }
                </div>
                {(subscription?.status === 'active' || subscription?.status === 'in_trial') && (subscription.subscription_items[0].item_price_id.split("-")[0] !== 'free') &&
                  <a onClick={()=>setBillingFreqDrawer(true)}>Change Billing Frequency</a>
                }
              </div>
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method" span={2} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>{currentPaymentMethod.maskedCardInfo}</div>
                {(subscription?.status === 'active' || subscription?.status === 'in_trial') && 
                  <a onClick={()=>setPaymentMtdDrawer(true)}>Change Payment Method</a>
                }
              </div>
            </Skeleton>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card style={{marginTop: '30px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div className={styles.subtitle}>Billing Account</div>
            {(subscription?.status === 'active' || subscription?.status === 'in_trial') && 
              <Button onClick={ ()=> setBillingAccDrawer(true) } icon={<EditOutlined style={{color: '#1890ff'}}/>}>Edit Billing Account</Button>
            }
          </div>
        <Descriptions column={2} labelStyle={{fontWeight: 500, width: '20%'}} bordered>
          <Descriptions.Item label="Name" span={2} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div>{accDetails?.first_name} {accDetails?.last_name}</div>
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={2} contentStyle={{width: '80%'}}>
            <Skeleton active loading={fetchedData}>
              {accDetails?.line1}<br/>
              {accDetails?.line2 && <>{accDetails?.line2}<br/></>}
              {accDetails?.line3 && <>{accDetails?.line3}<br/></>}
              {accDetails?.city && <>{accDetails?.city}, </>}
              {accDetails?.state && <>{accDetails?.state}, </>}
              {accDetails?.country} {accDetails?.zip}
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Email Address" span={2} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div>{accDetails?.email}</div>
            </Skeleton>
          </Descriptions.Item>
          <Descriptions.Item label="Contact Number" span={2} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div>+{countries.countries.countries.find((item: { [x: string]: any; }) => item["country_code"] === accDetails.country)?.phone_code} {accDetails?.phone}</div>
            </Skeleton>
          </Descriptions.Item>
        </Descriptions>

        <Descriptions column={1} labelStyle={{fontWeight: 500, width: '20%'}} bordered style={{marginTop: '30px'}}>
          <Descriptions.Item label="Refundable Credits" span={1} contentStyle={{width: '80%'}}>
            <Skeleton paragraph={false} active loading={fetchedData}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                ${(accDetails?.credits/100).toFixed(2)} {subscription?.currency_code}
                {
                  accDetails?.credits !== 0 && 
                  <a onClick={()=>{setRefundCreditsModal(true)}}>Refund Credits</a>
                }
              </div>
            </Skeleton>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <ChangeBillingFreq 
        billingFreqDrawer={billingFreqDrawer} 
        setBillingFreqDrawer={setBillingFreqDrawer} 
        freqDetail={freqDetail}
        newFreq={newFreq}
        setNewFreq={setNewFreq}
      />
      <ChangeBillingAcc 
        billingAccDrawer={billingAccDrawer} 
        setBillingAccDrawer={setBillingAccDrawer} 
        accDetails={accDetails} 
        setAccDetails={setAccDetails}
        countries={countries}
      />
      {/* <ChangePaymentMethod
        paymentMtdDrawer={paymentMtdDrawer}
        setPaymentMtdDrawer={setPaymentMtdDrawer}
        customerId={accDetails.customerId}
        currentPaymentMtd={currentPaymentMethod}
        setCurrentPaymentMtd={setCurrentPaymentMethod}
      /> */}
      <ManagePaymentMethods
        paymentMtdDrawer={paymentMtdDrawer}
        setPaymentMtdDrawer={setPaymentMtdDrawer}
        customerId={accDetails.customerId}
      />
      <CancelSubModal
        cancelSubModal={cancelSubModal}
        setCancelSubModal={setCancelSubModal}
        subscription={subscription}
        setSubscription={setSubscription}
      />
      <UncancelSubModal
        uncancelSubModal={uncancelSubModal}
        setUncancelSubModal={setUncancelSubModal}
        subscription={subscription}
        setSubscription={setSubscription}
      />
      <ChangeAssignableTeams
        assignableTeamsDrawer={assignableTeamsDrawer}
        setAssignableTeamsDrawer={setAssignableTeamsDrawer}
        freqDetail={freqDetail}
      />
      <ChangePlan
        changePlanDrawer={changePlanDrawer}
        setChangePlanDrawer={setChangePlanDrawer}
        freqDetail={freqDetail}
      />
      <RefundCredits
        refundCreditsModal={refundCreditsModal}
        setRefundCreditsModal={setRefundCreditsModal}
        customerId={accDetails.customerId}
        setAccDetails={setAccDetails}
        accDetails={accDetails}
      />
    </>
  )
}

export default BillingDash;