import { inactivateMultipleUsers } from "@/pages/api/AdminAPI";
import { IUser } from "@/types/user";
import { ArrowLeftOutlined, CloseOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Alert, Avatar, Button, Drawer, Typography, message } from "antd";
import { Dispatch, SetStateAction } from "react";

const { Text } = Typography

const DeleteUserDrawer = ({users, setUsers, deleteUserOpen, setDeleteUserOpen, usrsToDelete, setUsrsToDelete, primary, setRowDetails}: {users: IUser[], setUsers: Dispatch<SetStateAction<IUser[]>>, deleteUserOpen: boolean, setDeleteUserOpen: Dispatch<SetStateAction<boolean>>, usrsToDelete: IUser[], setUsrsToDelete: Dispatch<SetStateAction<IUser[]>>, primary: boolean, setRowDetails: Dispatch<SetStateAction<IUser>>|undefined}) => {
    
    const userTerm = usrsToDelete.length > 1 ? 'Users' : 'User'

    const { isLoading: inactivateUsersLoading, mutate: inactivateUsers, } = useMutation({
        mutationKey: ["user_inactivateUsers"],
        mutationFn: (obj: {userIds: string})=> inactivateMultipleUsers(obj),
        onSuccess: ({data}:{data:Number[]}) => {
            message.success(`${userTerm} deactivated successfully`);
            setDeleteUserOpen(false);
            if(setRowDetails) {
                setRowDetails({} as IUser)
            }
            setUsrsToDelete([]);
            setUsers(users.filter((usr) => !data.includes(usr.id)))
        }
    })

    const onDeleteUserDrawerFinish = () => {
        const userIds: string[] = []
        usrsToDelete.forEach((usr) => {
            if (JSON.stringify(usr) !== '{}') {
                userIds.push(usr.id.toString())
            }
        })
        inactivateUsers({
            userIds: userIds.join(',')
        })
    }

    const formatUsrsToDelete = () => {
        const deleteUsrs : JSX.Element[] = []
        usrsToDelete.forEach((usr) => {
            if (JSON.stringify(usr) !== '{}') {
                deleteUsrs.push(
                    <div style={{display: 'flex', alignItems: 'center', margin: '10px 0'}} key={usr.id}>
                        <Avatar style={{backgroundColor: usr.avatar_color}}>{usr.firstName[0] + usr.lastName[0]}</Avatar>
                        <div style={{marginLeft: '10px', fontWeight: 500, fontSize: '15px'}}>
                            <Text style={{width: '470px'}} ellipsis={true}>{usr.firstName+" "+usr.lastName}</Text>
                        </div>
                    </div>)
            }
        })
        return deleteUsrs
    }

    return (
        <>
            <Drawer open={deleteUserOpen} onClose={()=> {setDeleteUserOpen(false)}} width={600} mask={primary? true: false} closeIcon={primary? <CloseOutlined /> : <ArrowLeftOutlined />} maskClosable={false}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Deactivate {userTerm}
                </div>
                <Alert
                    message="User deactivation is permanant and cannot be undone."
                    type="warning"
                    showIcon
                />
                <div style={{marginTop: '30px'}}>
                    Are you sure you want to deactivate the following {userTerm.toLowerCase()}?
                </div>
                <div style={{margin: '20px'}}>
                    {formatUsrsToDelete()}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type='primary'
                        htmlType='submit'
                        danger
                        onClick={onDeleteUserDrawerFinish}
                        style={{width: '25%', marginTop: '20px'}}
                        loading={inactivateUsersLoading}
                    >
                        Deactivate {userTerm}
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default DeleteUserDrawer