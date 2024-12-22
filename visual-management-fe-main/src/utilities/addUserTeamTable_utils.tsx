import { ColumnsType } from "antd/lib/table";
import { ITeamRole } from "@/types/team";
import { Select } from "antd";
import { Dispatch, SetStateAction } from "react";

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

export const tableColumns = (availTeams: ITeamRole[], setAvailTeams: Dispatch<SetStateAction<ITeamRole[]>>): ColumnsType<ITeamRole> => [
    {
        title: 'Team Name',
        dataIndex: 'name',
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
        render: (text: String, record) => {
            const handleRoleChange = (value: string) => {
                const updatedRecord:ITeamRole = { ...record, role: Number(value) };
                const updatedAvailTeams = availTeams.map((team) => team.key === record.key ? updatedRecord : team);
                setAvailTeams(updatedAvailTeams);
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