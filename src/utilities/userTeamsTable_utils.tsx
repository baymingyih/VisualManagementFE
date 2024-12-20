import { ColumnsType } from "antd/lib/table";
import { IUserTeam } from "@/types/team";
import { Select, message } from "antd";
import { UseMutateFunction } from "@tanstack/react-query";
import { IUser } from "@/types/user";

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

export const tableColumns = ({updateRole, updateRoleLoading, rowDetails}: {updateRole: UseMutateFunction<{data: IUser;}, unknown, { teamId: number; userId: number; role: number;}, unknown>, updateRoleLoading: boolean, rowDetails: IUser}): ColumnsType<IUserTeam> => [
    {
        title: 'Team Name',
        dataIndex: 'teamName',
        key: 'teamName',
        width: '65%'
    },
    {
        title: 'Tier',
        dataIndex: 'tier',
        key: 'tier',
        width: '15%'
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
                onChange={(value) => {updateRole({teamId: record.teamId, userId: rowDetails.id, role: value})}}
                loading={updateRoleLoading}
            />
        ),
    }
]