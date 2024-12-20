import { Button, Card, Divider, Input, Table } from 'antd';
import styles from '../mainStyles.module.css';
import { useEffect, useState } from 'react';
import { tableColumns } from '../../../utilities/userTable_utils';
import { SearchOutlined, UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getUsersByOrg } from '@/pages/api/AdminAPI';
import { IUser } from '@/types/user';
import UserWindow from './userDrawers/UserWindow';
import AddUserDrawer from './userDrawers/AddUserDrawer';
import DeleteUserDrawer from './userDrawers/DeleteUserDrawer';
import EraseUserDrawer from './userDrawers/EraseUserDrawer';

const UserDash = ({ active }: { active: boolean }) => {

  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([])

  const [selectedUsrsRowKeys, setSelectedUsrsRowKeys] = useState<React.Key[]>([]);
  const [selectedUsrsRows, setSelectedUsrsRows] = useState<IUser[]>([]);

  const [searchBarValue, setSearchBarValue] = useState('');

  const [rowDetails, setRowDetails] = useState<IUser>({} as IUser);

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);

  const [eraseUserOpen, setEraseUserOpen] = useState(false);

  const { refetch: fetchUsers, isLoading } = useQuery({
    queryKey: ["users_getUsersByOrg"],
    queryFn: () => getUsersByOrg(1),
    onSuccess: ({ data }) => {
      setUsers(data.filter((user: IUser) => user.active === (active ? 1 : 0)))
    },
    onError: () => {
      console.log('Unable to fetch users data')
    },
    enabled: false
  })

  useEffect(() => {
    fetchUsers()
    return
  }, [fetchUsers])

  useEffect(() => {
    const filteredData = users.filter((record) =>
      (record.firstName + ' ' + record.lastName).toLowerCase().includes(searchBarValue.toLowerCase())
    )
    setFilteredUsers(filteredData)
  }, [users, searchBarValue])

  useEffect(() => {
    if (selectedUsrsRows.length == 0) {
      setSelectedUsrsRowKeys([])
    }
  }, [selectedUsrsRows])

  const onSelectUsrsChange = (newSelectedRowKeys: React.Key[], selectedRows: IUser[]) => {
    setSelectedUsrsRows(selectedRows);
    setSelectedUsrsRowKeys(newSelectedRowKeys);
  };

  const usrsRowSelection = {
    selectedUsrsRowKeys,
    onChange: onSelectUsrsChange,
  };

  return (
    <>
      {active && <div className={styles.title}>Active Users</div>}
      {!active && <div className={styles.title}>Inactive Users</div>}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {active &&
            <div>
              <Button type='text' onClick={() => { setAddUserOpen(true) }} icon={<UserAddOutlined style={{ color: '#1890ff' }} />}>Add User</Button>
              {selectedUsrsRowKeys.length > 0 && <Button type='text' onClick={() => { setDeleteUserOpen(true) }} icon={<UserDeleteOutlined style={{ color: '#1890ff' }} />}>Deactivate {selectedUsrsRowKeys.length > 1 ? 'Users' : 'User'}</Button>}
            </div>
          }
          {
            !active &&
            <div>
              {selectedUsrsRowKeys.length == 0 && <Button></Button>}
              {selectedUsrsRowKeys.length > 0 && <Button type='text' onClick={() => { setEraseUserOpen(true) }} icon={<UserDeleteOutlined style={{ color: '#1890ff' }} />}>Delete {selectedUsrsRowKeys.length > 1 ? 'Users' : 'User'}</Button>}
            </div>
          }
          {selectedUsrsRowKeys.length > 0 &&
            <div>
              {selectedUsrsRowKeys.length} selected
            </div>
          }
        </div>
        <Divider />
        <Input
          placeholder='Search user list'
          style={{ width: '30%', marginBottom: '10px' }}
          allowClear={true}
          value={searchBarValue}
          onChange={(e) => {
            setSearchBarValue(e.target.value)
          }}
          suffix={<SearchOutlined />}
        />

        <Table
          rowSelection={usrsRowSelection}
          columns={tableColumns()}
          dataSource={filteredUsers}
          pagination={{
            position: ['bottomCenter'],
            showSizeChanger: true,
          }}
          loading={isLoading}
          className={styles.tableHover}
          onRow={(record) => {
            return {
              onClick: () => {
                setRowDetails(record)
              }
            }
          }}
        />
      </Card>
      <UserWindow users={users} setUsers={setUsers} rowDetails={rowDetails} setRowDetails={setRowDetails} setUsrsToDelete={setSelectedUsrsRows}/>
      <AddUserDrawer users={users} setUsers={setUsers} addUserOpen={addUserOpen} setAddUserOpen={setAddUserOpen} />
      <DeleteUserDrawer users={users} setUsers={setUsers} deleteUserOpen={deleteUserOpen} setDeleteUserOpen={setDeleteUserOpen} usrsToDelete={selectedUsrsRows} setUsrsToDelete={setSelectedUsrsRows} primary={true} setRowDetails={undefined} />

      <EraseUserDrawer users={users} setUsers={setUsers} eraseUserOpen={eraseUserOpen} setEraseUserOpen={setEraseUserOpen} usrsToDelete={selectedUsrsRows}  setUsrsToDelete={setSelectedUsrsRows}/>
    </>
  )
}

export default UserDash;