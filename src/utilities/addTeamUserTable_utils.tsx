import { ColumnsType } from "antd/lib/table";
import { Avatar, Select } from "antd";
import { Dispatch, SetStateAction } from "react";
import { IUserRole } from "@/types/user";

const roleOptions = [
    {
        value: '2',
        label: "Member"
    },
    {
      value: '1',
      label: "Admin"
    }
]

export const tableColumns = (availUsers: IUserRole[], setAvailUsers: Dispatch<SetStateAction<IUserRole[]>>): ColumnsType<IUserRole> => [
    {
        title: 'User Name',
        dataIndex: ['firstName', 'lastName', 'avatar_color'],
        key: 'username',
        render: (text: string, record) => (
            <><Avatar style={{marginRight: '10px', backgroundColor: record.avatar_color}} size={24} gap={6}>{record.firstName[0]}{record.lastName[0]}</Avatar>{record.firstName} {record.lastName}</>
        ),
        width: '40%'
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: '40%'
    },
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        width: '20%',
        render: (text: String, record) => {
            const handleRoleChange = (value: string) => {
                const updatedRecord:IUserRole = { ...record, role: Number(value) };
                const updatedAvailTeams = availUsers.map((user) => user.key === record.key ? updatedRecord : user);
                setAvailUsers(updatedAvailTeams);
            };
            return (
                <>
                    <Select 
                        options={roleOptions}
                        value={String(record.role)}
                        // bordered={false}
                        size='small'
                        style={{width: '100px'}}
                        onChange={handleRoleChange}
                    />
                </>
            )
        },
    }
]