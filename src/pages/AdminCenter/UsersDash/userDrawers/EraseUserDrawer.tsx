import { eraseMultipleUsers } from "@/pages/api/AdminAPI";
import { IUser } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { Alert, Avatar, Button, Drawer, message } from "antd";
import { Dispatch, SetStateAction } from "react";

const EraseUserDrawer = ({users, setUsers, eraseUserOpen, setEraseUserOpen, usrsToDelete, setUsrsToDelete}: {users: IUser[], setUsers: Dispatch<SetStateAction<IUser[]>>, eraseUserOpen: boolean, setEraseUserOpen: Dispatch<SetStateAction<boolean>>, usrsToDelete: IUser[], setUsrsToDelete: Dispatch<SetStateAction<IUser[]>>}) => {
    
    const userTerm = usrsToDelete.length > 1 ? 'Users' : 'User'

    const { isLoading: eraseUsersLoading, mutate: eraseUsers, } = useMutation({
        mutationKey: ["user_eraseUsers"],
        mutationFn: (obj: {userIds: number[]})=> eraseMultipleUsers(obj),
        onSuccess: ({data}:{data:Number[]}) => {
            message.success(`${userTerm} erased successfully`);
            setEraseUserOpen(false);
            setUsrsToDelete([]);
            setUsers(users.filter((usr) => !data.includes(usr.id)))
        }
    })

    const onEraseUserDrawerFinish = () => {
        const userIds: number[] = []
        usrsToDelete.forEach((usr) => {
            if (JSON.stringify(usr) !== '{}') {
                userIds.push(usr.id)
            }
        })
        eraseUsers({
            userIds: userIds
        })
    }

    const formatUsrsToErase = () => {
        const deleteUsrs : JSX.Element[] = []
        usrsToDelete.forEach((usr) => {
            if (JSON.stringify(usr) !== '{}') {
                deleteUsrs.push(
                    <div style={{display: 'flex', alignItems: 'center', margin: '10px 0'}}>
                        <Avatar style={{backgroundColor: usr.avatar_color}}>{usr.firstName[0] + usr.lastName[0]}</Avatar>
                        <div style={{marginLeft: '10px', fontWeight: 500, fontSize: '15px'}}>
                            {usr.firstName+" "+usr.lastName}
                        </div>
                    </div>)
            }
        })
        return deleteUsrs
    }

    return (
        <>
            <Drawer open={eraseUserOpen} onClose={()=> {setEraseUserOpen(false)}} width={600} maskClosable={false}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Delete {userTerm}
                </div>
                <Alert
                    message={`User deletion is permanant and cannot be undone. ${userTerm} will be entirely removed from the database.`}
                    type="warning"
                    showIcon
                />
                <div style={{marginTop: '30px'}}>
                    Are you sure you want to delete the following {userTerm.toLowerCase()}?
                </div>
                <div style={{margin: '20px'}}>
                    {formatUsrsToErase()}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type='primary'
                        htmlType='submit'
                        danger
                        onClick={onEraseUserDrawerFinish}
                        style={{width: '25%', marginTop: '20px'}}
                        loading={eraseUsersLoading}
                    >
                        Delete {userTerm}
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default EraseUserDrawer