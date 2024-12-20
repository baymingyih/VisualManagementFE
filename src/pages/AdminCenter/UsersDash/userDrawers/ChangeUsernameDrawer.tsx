import { updateUser } from "@/pages/api/AdminAPI";
import { IUser } from "@/types/user";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Drawer, Form, Input, message } from "antd"
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const ChangePermsDrawer = ({users, setUsers, rowDetails, setRowDetails, usernameDrawer, setUsernameDrawer}: {users: IUser[], setUsers: Dispatch<SetStateAction<IUser[]>>, rowDetails: IUser, setRowDetails: Dispatch<SetStateAction<IUser>>, usernameDrawer: boolean, setUsernameDrawer: Dispatch<SetStateAction<boolean>>}) => {

    const [form] = Form.useForm()
    
    const [hasChangedFirst, setHasChangedFirst] = useState(false);
    const [hasChangedLast, setHasChangedLast] = useState(false);

    const { isLoading: updateUserLoading, mutate: editUser, } = useMutation({
        mutationKey: ["user_changeUsername"],
        mutationFn: (obj: {userId: number, firstName: string, lastName: string})=> updateUser(obj),
        onSuccess: ({data}:{data:IUser}) => {
            message.success('Username changed successfully');
            setUsernameDrawer(false);
            setHasChangedFirst(false);
            setHasChangedLast(false);
            setRowDetails(data);
            setUsers(users.map((user)=> user.id === data.id ? data : user).sort((a, b) => (a.firstName.toLowerCase() > b.firstName.toLowerCase()) ? 1 : -1))
        }
    })

    const onUsernameDrawerFinish = (values: any) => {
        editUser({
            userId: rowDetails.id,
            firstName: values.firstName,
            lastName: values.lastName
        })
    }

    useEffect(() => {
        form.setFieldsValue({
            firstName: rowDetails.firstName,
            lastName: rowDetails.lastName
        })
       }, [form, rowDetails])

    return (
        <>
            <Drawer open={usernameDrawer} onClose={()=> setUsernameDrawer(false)} mask={false} width={600} closeIcon={<ArrowLeftOutlined />}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Change Username
                </div>
                <div style={{margin: '30px 0', fontStyle: 'italic'}}>
                    You are changing the username of <b>{rowDetails.firstName} {rowDetails.lastName}</b>
                </div>
                <Form 
                    onFinish={onUsernameDrawerFinish}
                    layout= 'vertical'
                    form={form}
                >
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[{ required: true, message: '' }]}
                            style={{width: '47%'}}
                        >
                            <Input onChange={(e)=>{setHasChangedFirst(e.target.value !== rowDetails.firstName)}}/>
                        </Form.Item>
                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[{ required: true, message: '' }]}
                            style={{width: '47%'}}
                        >
                            <Input onChange={(e)=>{setHasChangedLast(e.target.value !== rowDetails.lastName)}}/>
                        </Form.Item>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%', marginTop: '20px'}}
                            disabled={!hasChangedFirst && !hasChangedLast}
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