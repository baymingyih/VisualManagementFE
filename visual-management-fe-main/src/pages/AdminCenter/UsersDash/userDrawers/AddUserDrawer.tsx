import { createUser } from "@/pages/api/AdminAPI";
import { IUser } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { Button, Drawer, Form, Input, Radio, Space, message } from "antd"
import { Dispatch, SetStateAction } from "react"

const AddUserDrawer = ({users, setUsers, addUserOpen, setAddUserOpen}: {users: IUser[], setUsers: Dispatch<SetStateAction<IUser[]>>, addUserOpen: boolean, setAddUserOpen: Dispatch<SetStateAction<boolean>>}) => {

    const [form] = Form.useForm();

    const { isLoading: createUserLoading, mutate: newUser, } = useMutation({
        mutationKey: ["user_createUser"],
        mutationFn: (obj: {firstName: string, lastName: string, email: string, organisationId: number, orgAdmin: number, external: number})=> createUser(obj),
        onSuccess: ({data}:{data:IUser}) => {
            message.success('User added successfully');
            setAddUserOpen(false);
            setUsers([...users, data].sort((a, b) => (a.firstName.toLowerCase() > b.firstName.toLowerCase()) ? 1 : -1))
        }
    })

    const onAddUserDrawerFinish = (values: any) => {
        newUser({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            organisationId: 1,
            orgAdmin: values.perms,
            external: 0
        })
    }

    return (
        <>
            <Drawer open={addUserOpen} onClose={()=> {setAddUserOpen(false); form.resetFields()}} width={600} maskClosable={false}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Add User
                </div>
                <Form 
                    onFinish={onAddUserDrawerFinish}
                    layout="vertical"
                    form={form}
                    initialValues={{perms: 0}}
                >
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[{ required: true, message: '' }]}
                            style={{width: '47%'}}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[{ required: true, message: '' }]}
                            style={{width: '47%'}}
                        >
                            <Input/>
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: ''},
                            { type: 'email', message: 'Email address is not valid' }
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="perms"
                        label="Permissions"
                        rules={[{ required: true, message: '' }]}
                    >
                        <Radio.Group style={{marginLeft: '20px'}}>
                            <Space direction="vertical">
                                <Radio value={0}>User: <i>Has no access to the admin console.</i></Radio>
                                <Radio value={1}>Super User: <i>Has full access to the admin console. Normally assigned to the organisation administrator.</i></Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            style={{width: '25%', marginTop: '20px'}}
                            loading={createUserLoading}
                        >
                            Add User
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default AddUserDrawer