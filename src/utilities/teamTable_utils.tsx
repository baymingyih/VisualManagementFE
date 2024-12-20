import { getAvatarLabel } from "@/utilities/formatters";
import { UserDeleteOutlined } from "@ant-design/icons";
import { Avatar, Button, Select } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { ITeamFull } from "@/types/team";
import { Dispatch, SetStateAction } from "react";
import { UseMutateFunction } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

const formatAvatarGroup = (team_members: Array<{role: number, id: number, firstName: string, lastName: string, avatar_color: string}>) => {
    if (team_members.length !== 0) {
        return(
            <Avatar.Group>
                {
                    team_members.map((team_member) => {
                        const avatar = <Avatar key={team_member.id} style={{ backgroundColor: team_member.avatar_color}} size={30} gap={8}>{team_member.firstName[0]}{team_member.lastName[0]}</Avatar>
                        return avatar
                    })
                }
            </Avatar.Group>
        )
    } else {
        return(
            <Avatar.Group>
                <Avatar style={{ opacity: '0%'}} size={30} gap={8}></Avatar>
            </Avatar.Group>
        )
        }
}

export const tableColumns = (): ColumnsType<ITeamFull> => [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width:'40%',
        sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
        title: 'Tier',
        dataIndex: 'tier',
        key: 'tier',
        width: '4%',
    },
    {
        title: 'Members',
        dataIndex: 'team_members',
        key: 'team_members',
        render: (text: string, record) => 
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div><span>{record.team_members.length} </span><span style={{fontSize: '13px'}}>/10</span></div>
                <div>{formatAvatarGroup(record.team_members)}</div>
            </div>,
        width: '26%',
    },
    {
        title: 'Created On',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (text: string, record) => <div>{moment(record.created_at).format("DD MMM YYYY, H:MM:SS")}</div>,
        sorter: (a, b) => moment(a.created_at).valueOf() - moment(b.created_at).valueOf(),
        width: '15%',
    },
    {
        title: 'Last Updated',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (text: string, record) => <div>{moment(record.updated_at).format("DD MMM YYYY, H:MM:SS")}</div>,
        sorter: (a, b) => moment(a.updated_at).valueOf() - moment(b.updated_at).valueOf(),
        width: '15%',
    }
]