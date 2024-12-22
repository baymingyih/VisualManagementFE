import { Button, Form, Input, InputRef, Modal, Select, Space, Table, message } from 'antd';
import styles from './TeamDashboard.module.css'
import { useEffect, useRef, useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { tableColumns } from '../../utilities/membersTable_utils';

import { ITeam, ITeamMemberFull } from '@/types/team';
import { useSelector } from 'react-redux';
import { getSelectedTeam } from '../../../redux/features/ui/uiSlice';
import { generateUserString } from '../../utilities/utilities';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addMember, deleteMembers, getMembersFull, updateMemberRole } from '../api/TeamAPI';

import Title from 'antd/lib/typography/Title';
import { duration } from 'moment';

const accessOptions = [
  {
    value: 1,
    label: "Admin"
  },
  {
    value: 2,
    label: "Member"
  }
]

const TeamDashboard = () => {

  const selectedTeam: ITeam | null = useSelector(getSelectedTeam)

  const [members, setMembers] = useState<ITeamMemberFull[]>([])

  const searchInput = useRef<InputRef>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ITeamMemberFull[]>([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [deleteUser, setDeleteUser] = useState<ITeamMemberFull>({} as ITeamMemberFull)

  const [form1] = Form.useForm()

  const { refetch: fetchMembersFull, isLoading } = useQuery({
    queryKey: ["team_getMembersFull", selectedTeam],
    queryFn: () => getMembersFull(selectedTeam),
    onSuccess: ({ data }) => {
      setMembers(data)
    },
    onError: () => {
      console.log('Unable to fetch members data')
    },
    enabled: false
  })

  useEffect(() => {
    if (selectedTeam) {
      fetchMembersFull()
      return
    }
  }, [fetchMembersFull, selectedTeam])

  const { mutate: addTeamMember } = useMutation({
    mutationFn: (obj: { teamId: number, emailAddr: string, role: number }) => addMember(obj),
    onSuccess: ({ data }) => {
      setMembers([...members, data])
      message.success('User added successfully');
    },
    onError: () => {
      message.error('User does not exist in organisation or is already a member of the team.', 4);
    }
  })

  const { mutate: removeTeamMember } = useMutation({
    mutationFn: (obj: { teamId: number, userIds: number[] }) => deleteMembers(obj),
    onSuccess: ({ data }) => {
      const newData = members.filter(obj => !data.includes(obj.userId))
      setMembers(newData)
      message.success("User(s) removed successfully")
      setSelectedRowKeys([])
      setSelectedRows([])
      return
    }
  })

  const { mutate: updateRole } = useMutation({
    mutationFn: (obj: { teamId: number, userId: number, role: number }) => updateMemberRole(obj),
    onSuccess: ({ data }) => {
      const newData = [...members]
      const memberObjIdx = newData.findIndex((member) => member.userId == data.userId)
      newData[memberObjIdx].role = data.role
      setMembers(newData)
      message.success('User role updated successfully');
    }
  })

  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: ITeamMemberFull[]) => {
    setSelectedRows(selectedRows);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onFinishAdd = (values: any) => {
    addTeamMember({
      teamId: selectedTeam.id,
      emailAddr: values.email,
      role: values.role
    })
    form1.resetFields()
    setAddModalOpen(false)
    return
  }

  const onFinishDelete = () => {
    removeTeamMember({
      teamId: selectedTeam.id,
      userIds: selectedRows.map(row => row.userId)
    })
    setDeleteModalOpen(false)
    setDeleteUser({} as ITeamMemberFull)
    return
  }

  return (
    <>
      <Space
        direction="vertical"
        style={{
          width: "100%",
          marginBottom: "20px",
          padding: "20 0px"
      }}>
        <div className={styles.subtitle}>
          Board Access
        </div>
        <Space
          direction="horizontal"
          style={{
              width: "100%", 
              justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', margin: '6px 0' }}>
            <Title level={2} style={{ margin: 0 }}>Team Management</Title>
            <Button type="primary" onClick={()=>{setAddModalOpen(true)}}>
              Add Member
            </Button>
          </div>
          {selectedRowKeys.length > 0 &&
            <div style={{display: 'flex', alignItems: 'center', padding: '5px 0'}}>
              <div style={{fontSize: '0.9rem'}}>{selectedRowKeys.length} selected user(s)</div>
              <div className={styles.actionButtonGroup}>
                <Button type='text' onClick={()=>{setDeleteModalOpen(true)}}><DeleteOutlined />Delete</Button>
              </div>
            </div>
          }
        </Space>
      </Space>
      <Table
        rowSelection={rowSelection}
        columns={tableColumns(searchInput, selectedTeam.id, updateRole)}
        dataSource={members}
        pagination={{
          position: ['bottomCenter'],
          // pageSize: getNumRows(screenSize)
        }}
        loading={!selectedTeam || isLoading}
      />

      <Modal
        title="Add User"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form1.resetFields() }}
        footer={null}
      >
        <Form
          layout='inline'
          form={form1}
          onFinish={onFinishAdd}
          initialValues={{
            role: 2
          }}
        >
          <Form.Item
            name='email'
            rules={[{ required: true, type: 'email', message: 'Email address is not valid' }]}
            style={{ width: '280px' }}
          >
            <Input
              placeholder='Email Address'
            />
          </Form.Item>
          <Form.Item
            name='role'
            style={{ width: '100px' }}
          >
            <Select
              options={accessOptions}
            ></Select>
          </Form.Item>
          <Button
            type='primary'
            htmlType='submit'
          >
            Add
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Remove User"
        open={deleteModalOpen}
        onCancel={() => { setDeleteModalOpen(false); setDeleteUser({} as ITeamMemberFull) }}
        okText='Remove'
        okButtonProps={{ danger: true }}
        onOk={() => { onFinishDelete() }}
      >
        <div>
          Are you sure you wish to remove
          <b> {JSON.stringify(deleteUser) !== '{}' && generateUserString([deleteUser])} </b>
          <b> {selectedRows.length !== 0 && JSON.stringify(deleteUser) === '{}' && generateUserString(selectedRows)} </b>
          from <b>{selectedTeam.name}</b>?
        </div>
      </Modal>
    </>
  );
};

export default TeamDashboard;
