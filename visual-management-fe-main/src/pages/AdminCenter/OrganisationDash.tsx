import { Button, Card, Descriptions, Drawer, Form, Input, Skeleton, message } from 'antd';
import styles from './mainStyles.module.css';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getOrgById, updateOrg } from '../api/AdminAPI';
import { IOrg } from '@/types/org';
import moment from 'moment';

const OrganisationDash = () => {

  const [orgDetails, setOrgDetails] = useState({} as IOrg)
  const [orgNameDrawerOpen, setOrgNameDrawerOpen] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const [form] = Form.useForm();

  const { refetch: fetchOrg, isLoading: fetchOrgLoading } = useQuery({
    queryKey: ["org_getOrgById"],
    queryFn: () => getOrgById(1),
    onSuccess: ({ data }) => {
      setOrgDetails(data)
    },
    onError: () => {
      console.log('Unable to fetch org data')
    },
    enabled: false
  })

  useEffect(() => {
    fetchOrg()
    return
  }, [fetchOrg])

  useEffect(() => {
    form.setFieldsValue({
        orgName: orgDetails.name
    })
   }, [form, orgDetails])

  const { isLoading: updateOrgLoading, mutate: editOrg, } = useMutation({
    mutationKey: ["org_updateOrg"],
    mutationFn: (obj: { orgId: number, name: string })=> updateOrg(obj),
    onSuccess: ({data}) => {
      message.success("Organisation Name changed successfully");
      setOrgDetails(data);
      setOrgNameDrawerOpen(false);
      setHasChanged(false)
    }
  })

  const onOrgNameDrawerFinish = (values: any) => {
    editOrg({
      orgId: orgDetails.id, 
      name: values.orgName
    })
  }

  return (
    <>
      <div className={styles.title}>Organisation</div>
      <Card>
      <div className={styles.subtitle}>Profile</div>
      <Descriptions column={1} labelStyle={{fontWeight: 500, width: '200px'}} bordered>
        <Descriptions.Item label="Organisation Name">
          <Skeleton paragraph={false} active loading={fetchOrgLoading}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <div>{orgDetails.name}</div>
              <a onClick={()=>{setOrgNameDrawerOpen(true)}}>Change Organisation Name</a>
            </div>
          </Skeleton>
        </Descriptions.Item>
        <Descriptions.Item label="Date Created">
          <Skeleton paragraph={false} active loading={fetchOrgLoading}>
            {moment(orgDetails.created_at).format("DD MMM YYYY")}
          </Skeleton>
        </Descriptions.Item>
      </Descriptions>
      </Card>

      <Drawer placement="right" onClose={()=>{setOrgNameDrawerOpen(false); setHasChanged(false)}} open={orgNameDrawerOpen} width={600} maskClosable={false}>
        <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
          Change Organisation Name
        </div>
        <div style={{margin: '30px 0', fontStyle: 'italic'}}>
            You are changing the organisation name of <b>{orgDetails.name}</b>
        </div>
        <Form 
          onFinish={onOrgNameDrawerFinish}
          layout= 'vertical'
          form={form}
        >
          <Form.Item
              name="orgName"
              label="Organisation Name"
              rules={[{ required: true, message: '' }]}
          >
              <Input onChange={(e)=>{setHasChanged(e.target.value !== orgDetails.name)}}/>
          </Form.Item>  
          <div style={{ textAlign: 'center' }}>
            <Button
              type='primary'
              htmlType='submit'
              style={{width: '25%', marginTop: '20px'}}
              disabled={!hasChanged}
              loading={updateOrgLoading}
            >
              Save changes
            </Button>
          </div>
        </Form>
      </Drawer>
    </>
  )
}

export default OrganisationDash;