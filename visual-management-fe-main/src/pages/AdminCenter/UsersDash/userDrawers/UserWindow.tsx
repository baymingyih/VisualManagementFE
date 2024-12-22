import { Avatar, Button, Drawer, Menu, MenuProps, Tag, Typography } from 'antd';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { EditOutlined, UserDeleteOutlined } from '@ant-design/icons';
import UserDetails from './UserDetails';
import UserTeams from './userTeams/UserTeams';
import { IUser } from '@/types/user';
import { IUserTeam } from '@/types/team';
import { useQuery } from '@tanstack/react-query';
import { getUserTeams } from '@/pages/api/AdminAPI';
import ChangePermsDrawer from './ChangePermsDrawer';
import ManageTeamsDrawer from './userTeams/ManageTeamsDrawer';
import DeleteUserDrawer from './DeleteUserDrawer';
import AddUserTeamDrawer from './userTeams/AddUserTeamDrawer';
import DeleteUserTeamDrawer from './userTeams/DeleteUserTeamDrawer';
import ChangeUsernameDrawer from './ChangeUsernameDrawer';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

const itemsActive: MenuProps['items'] = [
    getItem('Details', 'details'),
    getItem('Teams', 'teams')
];

const itemsInactive: MenuProps['items'] = [
    getItem('Details', 'details'),
];

const { Text } = Typography;

const UserWindow = ({users, setUsers, rowDetails, setRowDetails, setUsrsToDelete}: {users: IUser[], setUsers: Dispatch<SetStateAction<IUser[]>>, rowDetails: IUser, setRowDetails: Dispatch<SetStateAction<IUser>>, setUsrsToDelete: Dispatch<SetStateAction<IUser[]>>}) => {

    const [selectedKey, setSelectedKey] = useState('details');
    
    const [permsDrawer, setPermsDrawer] = useState(false);
    const [teamDrawer, setTeamDrawer] = useState(false);   
    const [editUserOpen, setEditUserOpen] = useState(false); 
    const [deleteUserOpen, setDeleteUserOpen] = useState(false);
    const [addUserTeamOpen, setAddUserTeamOpen] = useState(false);
    const [deleteUserTeamOpen, setDeleteUserTeamOpen] = useState(false);

    const [selectedUserTeamKeys, setSelectedUserTeamKeys] = useState<React.Key[]>([]);
    const [selectedUserTeamRows, setSelectedUserTeamRows] = useState<IUserTeam[]>([]);

    const [teams, setTeams] = useState<IUserTeam[]>([])

    const { refetch: fetchUserTeams } = useQuery({
        queryKey: ["users_getUserTeams", rowDetails.id],
        queryFn: () => getUserTeams(rowDetails.id),
        onSuccess: ({ data }) => {
        setTeams(data)
        },
        onError: () => {
        console.log('Unable to fetch user team data')
        },
        enabled: false
    })

    useEffect(() => {
        if(JSON.stringify(rowDetails) !== '{}') {
            fetchUserTeams()
        }
    }, [fetchUserTeams, rowDetails])

    return (
        <>
            <Drawer placement="right" onClose={()=>setRowDetails({} as IUser)} open={JSON.stringify(rowDetails) !== '{}'} width={750} maskClosable={false}>
                <div style={{display: 'flex', alignItems: 'center', marginLeft: '15px' }}>
                    <Avatar style={{ backgroundColor: rowDetails.avatar_color, verticalAlign: 'middle' }} size={80}>
                        <div style={{fontSize: '2.2rem'}}>{(rowDetails.firstName+' '+rowDetails.lastName).split(" ").map(word => word[0]).join("").slice(0,2)}</div>
                    </Avatar>
                    <div style={{marginLeft: '20px'}}>
                        <div style={{fontWeight: 600, fontSize: '2.2rem'}}>
                            <Text style={{width: '430px'}} ellipsis={true}>{rowDetails.firstName+" "+rowDetails.lastName}</Text>
                        </div>
                        {rowDetails.external===1 && <Tag color="grey">External User</Tag>}
                    </div>
                </div>
                <div style={{margin: '20px 0'}}>
                    { Boolean(rowDetails.active) &&
                        <>
                            <Button type='text' icon={<EditOutlined style={{color: '#1890ff'}}/>} onClick={()=> setEditUserOpen(true)}>
                                Change Name
                            </Button>
                            <Button type='text' icon={<UserDeleteOutlined style={{color: '#1890ff'}}/>} onClick={()=> setDeleteUserOpen(true)}>
                                Deactivate User
                            </Button>
                        </>
                    }
                </div>
                <Menu
                    onClick={(item) => setSelectedKey(item.key as string)}
                    defaultSelectedKeys={['details']}
                    mode="horizontal"
                    items={Boolean(rowDetails.active) ? itemsActive : itemsInactive}
                />
                <div style={{margin: '20px'}}>
                    {selectedKey === 'details' && <UserDetails rowDetails={rowDetails} setPermsDrawer={setPermsDrawer}/>}
                    {selectedKey === 'teams' && <UserTeams userId={rowDetails.id} setTeamDrawer={setTeamDrawer} teams={teams}/>}
                </div>
            </Drawer>
            <ChangePermsDrawer users={users} setUsers={setUsers} permsDrawer={permsDrawer} setPermsDrawer={setPermsDrawer} rowDetails={rowDetails} setRowDetails={setRowDetails}/>
            <ManageTeamsDrawer teamDrawer={teamDrawer} setTeamDrawer={setTeamDrawer} rowDetails={rowDetails} teams={teams} setTeams={setTeams} setAddUserTeamOpen={setAddUserTeamOpen} setDeleteUserTeamOpen={setDeleteUserTeamOpen} selectedUserTeamKeys={selectedUserTeamKeys} setSelectedUserTeamKeys={setSelectedUserTeamKeys} setSelectedUserTeamRows={setSelectedUserTeamRows}/>
            <ChangeUsernameDrawer users={users} setUsers={setUsers} rowDetails={rowDetails} setRowDetails={setRowDetails} usernameDrawer={editUserOpen} setUsernameDrawer={setEditUserOpen}/>
            <DeleteUserDrawer users={users} setUsers={setUsers} deleteUserOpen={deleteUserOpen} setDeleteUserOpen={setDeleteUserOpen} usrsToDelete={[rowDetails]} primary={false} setRowDetails={setRowDetails} setUsrsToDelete={setUsrsToDelete}/>
            <AddUserTeamDrawer rowDetails={rowDetails} addUserTeamOpen={addUserTeamOpen} setAddUserTeamOpen={setAddUserTeamOpen} userTeams={teams} setUserTeams={setTeams}/>
            <DeleteUserTeamDrawer userId={rowDetails.id} deleteUserTeamOpen={deleteUserTeamOpen} setDeleteUserTeamOpen={setDeleteUserTeamOpen} usrTeamsToDelete={selectedUserTeamRows} setSelectedUserTeamKeys={setSelectedUserTeamKeys} userTeams={teams} setUserTeams={setTeams}/>
        </>
    )
}

export default UserWindow;