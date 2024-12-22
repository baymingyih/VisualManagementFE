import { ITeamFull } from "@/types/team";
import { IUser } from "@/types/user";
import { UseMutateFunction } from "@tanstack/react-query";
import { Avatar, Select, Typography, message } from "antd";
import { ColumnsType } from "antd/lib/table";

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

export const tableColumns = ({updateRole, updateRoleLoading, rowDetails}: {updateRole: UseMutateFunction<{data: IUser;}, unknown, { teamId: number; userId: number; role: number;}, unknown>, updateRoleLoading: boolean, rowDetails: ITeamFull}): ColumnsType<ITeamFull['team_members'][0]> => [
    {
        title: 'User Name',
        dataIndex: ['firstName', 'lastName', 'avatar_color'],
        key: 'username',
        render: (text: string, record) => (
            <>
                <Avatar style={{marginRight: '10px', backgroundColor: record.avatar_color}} size={24} gap={6}>{record.firstName[0]}{record.lastName[0]}</Avatar>
                {record.firstName + ' ' + record.lastName}
            </>
        ),
        width: '40%',
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
        render: (text: string, record) => (
            <Select 
                options={accessOptions}
                defaultValue={record.role}
                // bordered={false}
                size='small'
                style={{width: '100px'}}
                onChange={(value) => {updateRole({teamId: rowDetails.id, userId: record.id, role: value})}}
                loading={updateRoleLoading}
            />
        ),
    }
]