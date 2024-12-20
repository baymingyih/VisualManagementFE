import { ITeamFull } from "@/types/team";
import { ArrowLeftOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined } from "@ant-design/icons";
import { Button, Divider, Drawer, Table, message } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import { tableColumns } from "../../../../../utilities/teamUsersTable_utils";
import { useMutation } from "@tanstack/react-query";
import { updateMemberRole } from "@/pages/api/TeamAPI";

const ManageUsersDrawer = ({ teams, setTeams, rowDetails, setRowDetails, userDrawer, setUserDrawer, setAddTeamUserOpen, setDeleteTeamUserOpen, selectedTeamUserKeys, setSelectedTeamUserKeys, setSelectedTeamUserRows }: { teams: ITeamFull[], setTeams: Dispatch<SetStateAction<ITeamFull[]>>, rowDetails: ITeamFull, setRowDetails: Dispatch<SetStateAction<ITeamFull>>, userDrawer: boolean, setUserDrawer: Dispatch<SetStateAction<boolean>>, setAddTeamUserOpen: Dispatch<SetStateAction<boolean>>, setDeleteTeamUserOpen: Dispatch<SetStateAction<boolean>>, selectedTeamUserKeys: React.Key[], setSelectedTeamUserKeys: Dispatch<SetStateAction<React.Key[]>>, setSelectedTeamUserRows: Dispatch<SetStateAction<ITeamFull['team_members'][0][]>> }) => {

    const { isLoading: updateRoleLoading, mutate: updateRole } = useMutation({
        mutationKey: ["team_updateRole"],
        mutationFn: (obj: { teamId: number, userId: number, role: number }) => updateMemberRole(obj),
        onSuccess: ({ data }) => {
            message.success('Role changed successfully')
            setAddTeamUserOpen(false);
            const newTeamMembers = rowDetails.team_members.map((member) => {
                if (member.id === data.userId) {
                    return { ...member, role: data.role }
                }
                return member
            })
            setRowDetails({ ...rowDetails, team_members: newTeamMembers })
            setTeams(teams.map((team) => {
                if (team.id === data.teamId) {
                    return { ...team, team_members: newTeamMembers }
                }
                return team
            }))
        }
    })

    const onSelectUserChange = (newSelectedRowKeys: React.Key[], selectedRows: ITeamFull['team_members'][0][]) => {
        setSelectedTeamUserRows(selectedRows);
        setSelectedTeamUserKeys(newSelectedRowKeys);
    };

    const userRowSelection = {
        selectedRowKeys: selectedTeamUserKeys,
        onChange: onSelectUserChange,
    };

    return (
        <>
            <Drawer open={userDrawer} onClose={() => { setUserDrawer(false); setSelectedTeamUserKeys([]) }} mask={false} width={750} closeIcon={<ArrowLeftOutlined />}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>
                    Manage Users
                </div>
                <div style={{ margin: '30px 0', fontStyle: 'italic' }}>
                    You are managing the users of <b>{rowDetails.name}</b>
                </div>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <Button icon={<UsergroupAddOutlined style={{ color: '#1890ff' }} />} type='text' onClick={() => setAddTeamUserOpen(true)}>Add Users</Button>
                        {selectedTeamUserKeys.length > 0 && <Button icon={<UsergroupDeleteOutlined style={{ color: '#1890ff' }} />} type='text' onClick={() => setDeleteTeamUserOpen(true)}>Remove User</Button>}
                    </div>
                    {selectedTeamUserKeys.length > 0 && <div>{selectedTeamUserKeys.length} selected</div>}
                </div>
                <Table
                    rowSelection={userRowSelection}
                    columns={tableColumns({ updateRole, updateRoleLoading, rowDetails })}
                    dataSource={rowDetails.team_members}
                    pagination={false}
                />
            </Drawer>
        </>
    )
}

export default ManageUsersDrawer;