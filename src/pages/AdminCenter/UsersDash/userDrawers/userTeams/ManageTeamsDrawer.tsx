import { IUserTeam } from "@/types/team";
import { IUser } from "@/types/user";
import { ArrowLeftOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined } from "@ant-design/icons";
import { Button, Divider, Drawer, Table, message } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import { tableColumns } from "../../../../../utilities/userTeamsTable_utils";
import { useMutation } from "@tanstack/react-query";
import { updateMemberRole } from "@/pages/api/TeamAPI";

const ManageTeamsDrawer = ({ rowDetails, teams, setTeams, teamDrawer, setTeamDrawer, setAddUserTeamOpen, setDeleteUserTeamOpen, selectedUserTeamKeys, setSelectedUserTeamKeys, setSelectedUserTeamRows }: { rowDetails: IUser, teams: IUserTeam[], setTeams: Dispatch<SetStateAction<IUserTeam[]>>, teamDrawer: boolean, setTeamDrawer: Dispatch<SetStateAction<boolean>>, setAddUserTeamOpen: Dispatch<SetStateAction<boolean>>, setDeleteUserTeamOpen: Dispatch<SetStateAction<boolean>>, selectedUserTeamKeys: React.Key[], setSelectedUserTeamKeys: Dispatch<SetStateAction<React.Key[]>>, setSelectedUserTeamRows: Dispatch<SetStateAction<IUserTeam[]>> }) => {

    const { isLoading: updateRoleLoading, mutate: updateRole, } = useMutation({
        mutationKey: ["team_updateRole"],
        mutationFn: (obj: { teamId: number, userId: number, role: number }) => updateMemberRole(obj),
        onSuccess: ({ data }) => {
            message.success('Role changed successfully')
            setAddUserTeamOpen(false);
            const newData = [...teams]
            const teamObjIdx = newData.findIndex((team) => team.teamId == data.teamId)
            newData[teamObjIdx].role = data.role
            setTeams(newData)
        }
    })

    const onSelectTeamChange = (newSelectedRowKeys: React.Key[], newSelectedRows: IUserTeam[]) => {
        setSelectedUserTeamKeys(newSelectedRowKeys);
        setSelectedUserTeamRows(newSelectedRows);
    };

    const teamRowSelection = {
        selectedRowKeys: selectedUserTeamKeys,
        onChange: onSelectTeamChange,
    };

    return (
        <>
            <Drawer open={teamDrawer} onClose={() => { setTeamDrawer(false); setSelectedUserTeamKeys([]) }} mask={false} width={600} closeIcon={<ArrowLeftOutlined />}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>
                    Manage Teams
                </div>
                <div style={{ margin: '30px 0', fontStyle: 'italic' }}>
                    You are managing the teams of <b>{rowDetails.firstName} {rowDetails.lastName}</b>
                </div>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <Button icon={<UsergroupAddOutlined style={{ color: '#1890ff' }} />} onClick={() => setAddUserTeamOpen(true)} type='text'>Add Teams</Button>
                        {selectedUserTeamKeys.length > 0 && <Button icon={<UsergroupDeleteOutlined style={{ color: '#1890ff' }} />} onClick={() => setDeleteUserTeamOpen(true)} type='text'>Remove Team</Button>}
                    </div>
                    {selectedUserTeamKeys.length > 0 && <div>{selectedUserTeamKeys.length} selected</div>}
                </div>
                <Table
                    rowSelection={teamRowSelection}
                    columns={tableColumns({ updateRole, updateRoleLoading, rowDetails })}
                    dataSource={teams}
                    pagination={false}
                />
            </Drawer>
        </>
    )
}

export default ManageTeamsDrawer;