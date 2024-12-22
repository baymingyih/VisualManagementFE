import { ITeam, ITeamFull, ITeamRole, IUserTeam } from "@/types/team";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Drawer, Form, Input, Table, message } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { tableColumns } from "../../../../../utilities/addTeamUserTable_utils";
import { IUser, IUserRole } from "@/types/user";
import { addMultipleUsers, getUsersByOrg } from "@/pages/api/AdminAPI";

const AddTeamUserDrawer = ({ teams, setTeams, rowDetails, setRowDetails, addTeamUserOpen, setAddTeamUserOpen }: { teams: ITeamFull[], setTeams: Dispatch<SetStateAction<ITeamFull[]>>, rowDetails: ITeamFull, setRowDetails: Dispatch<SetStateAction<ITeamFull>>, addTeamUserOpen: boolean, setAddTeamUserOpen: Dispatch<SetStateAction<boolean>> }) => {

    const [users, setUsers] = useState<IUser[]>([])
    const [availUsers, setAvailUsers] = useState<IUserRole[]>([])

    const { refetch: fetchUsersByOrg, isLoading } = useQuery({
        queryKey: ["teams_getUsersByOrg"],
        queryFn: () => getUsersByOrg(1),
        onSuccess: ({ data }) => {
            setUsers(data.filter((user: IUser) => user.active === 1))
        },
        onError: () => {
            console.log('Unable to fetch teams data')
        },
        enabled: false
    })

    useEffect(() => {
        fetchUsersByOrg()
        return
    }, [fetchUsersByOrg])

    useEffect(() => {
        if (JSON.stringify(rowDetails) !== '{}') {
            setAvailUsers(users.filter((user: IUser) => !rowDetails.team_members.some((teamMember) => teamMember.id === user.id || user.active === 0)).map((user: IUser) => ({ ...user, role: 2 })))
        }
    }, [users, addTeamUserOpen, rowDetails])

    const { isLoading: addMultipleUsersLoading, mutate: createMultipleUsers, } = useMutation({
        mutationKey: ["team_addMultipleUsers"],
        mutationFn: (obj: { teamId: number, teamUserObjs: Array<{ userId: number, role: number }> }) => addMultipleUsers(obj),
        onSuccess: ({ data }) => {
            setSelectedTeamUserRowKeys([]);
            setSelectedTeamUserRows([]);
            setAddTeamUserOpen(false);
            message.success(`User${selectedTeamUserRowKeys.length > 1 ? 's' : ''} added successfully`);
            setRowDetails({ ...rowDetails, team_members: [...rowDetails.team_members, ...data] })
            setTeams(teams.map((team: ITeamFull) => team.id === rowDetails.id ? { ...team, team_members: [...team.team_members, ...data] } : team))
        }
    })

    const [selectedTeamUserRowKeys, setSelectedTeamUserRowKeys] = useState<React.Key[]>([]);
    const [selectedTeamUserRows, setSelectedTeamUserRows] = useState<IUserRole[]>([]);

    const onSelectTeamUserChange = (newSelectedRowKeys: React.Key[], selectedRows: IUserRole[]) => {
        setSelectedTeamUserRows(selectedRows);
        setSelectedTeamUserRowKeys(newSelectedRowKeys);
    };

    const teamUserRowSelection = {
        selectedRowKeys: selectedTeamUserRowKeys,
        onChange: onSelectTeamUserChange,
    };

    const onAddUserDrawerFinish = () => {
        const teamUserObjs = selectedTeamUserRows.map((user: IUserRole) => ({ userId: user.id, role: user.role }))
        createMultipleUsers({ teamId: rowDetails.id, teamUserObjs })
    }

    return (
        <>
            <Drawer open={addTeamUserOpen} onClose={() => { setAddTeamUserOpen(false); setSelectedTeamUserRowKeys([]); setSelectedTeamUserRows([]); }} width={750} mask={false} closeIcon={<ArrowLeftOutlined />}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>
                    Add Users
                </div>
                <div style={{ margin: '30px 0', fontStyle: 'italic' }}>
                    You are adding users for <b>{rowDetails.name}</b>
                </div>
                <Table
                    rowSelection={{ ...teamUserRowSelection }}
                    columns={tableColumns(availUsers, setAvailUsers)}
                    dataSource={availUsers}
                    pagination={false}
                    loading={isLoading}
                />
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type='primary'
                        htmlType='submit'
                        style={{ width: '25%', marginTop: '20px' }}
                        disabled={selectedTeamUserRowKeys.length === 0}
                        onClick={onAddUserDrawerFinish}
                        loading={addMultipleUsersLoading}
                    >
                        Add User{selectedTeamUserRowKeys.length > 1 ? 's' : ''} {selectedTeamUserRowKeys.length > 0 ? `(${selectedTeamUserRowKeys.length})` : ''}
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default AddTeamUserDrawer