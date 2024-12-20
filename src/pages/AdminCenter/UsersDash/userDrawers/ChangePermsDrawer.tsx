import { updateUser } from "@/pages/api/AdminAPI";
import { IUser } from "@/types/user";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Drawer, Form, Radio, Space, message } from "antd"
import { Dispatch, SetStateAction, useState } from "react";

const ChangePermsDrawer = ({users, setUsers, rowDetails, setRowDetails, permsDrawer, setPermsDrawer}: {users: IUser[], setUsers: Dispatch<SetStateAction<IUser[]>>, rowDetails: IUser, setRowDetails:Dispatch<SetStateAction<IUser>>, permsDrawer: boolean, setPermsDrawer: Dispatch<SetStateAction<boolean>>}) => {

    
    const [hasChanged, setHasChanged] = useState(false);

    const { isLoading: updateUserLoading, mutate: editUser, } = useMutation({
        mutationKey: ["user_changePerms"],
        mutationFn: (obj: {userId: number, orgAdmin: number})=> updateUser(obj),
        onSuccess: ({data}:{data:IUser}) => {
            message.success('Permissions changed successfully');
            setPermsDrawer(false);
            setHasChanged(false);
            setRowDetails(data);
            setUsers(users.map((user)=> user.id === data.id ? data : user))
        }
    })

    const onPermsDrawerFinish = (values: any) => {
        editUser({
            userId: rowDetails.id,
            orgAdmin: values.perms
        })
    }

    return (
        <>
            <Drawer open={permsDrawer} onClose={()=> setPermsDrawer(false)} mask={false} width={600} closeIcon={<ArrowLeftOutlined />}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Change Permissions
                </div>
                <Alert
                    message="Permission change could potential expose sensitive information to the user."
                    type="warning"
                    showIcon
                />
                <div style={{margin: '30px 0', fontStyle: 'italic'}}>
                    You are changing the permissions of <b>{rowDetails.firstName} {rowDetails.lastName}</b>
                </div>
                <Form 
                    onFinish={onPermsDrawerFinish}
                    style={{margin: '0 20px'}}
                >
                    <Form.Item
                        name="perms"
                    >
                        <Radio.Group onChange={(e)=>{e.target.value !== rowDetails.orgAdmin ? setHasChanged(true): setHasChanged(false)}} defaultValue={rowDetails.orgAdmin}>
                            <Space direction="vertical">
                                <Radio value={0}><b>User</b>: Has no access to the admin console.</Radio>
                                <Radio value={1}><b>Super User</b>: Has full access to the admin console. Normally assigned to the organisation administrator.</Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%', marginTop: '20px'}}
                            disabled={!hasChanged}
                            loading={updateUserLoading}
                        >
                            Save changes
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default ChangePermsDrawer