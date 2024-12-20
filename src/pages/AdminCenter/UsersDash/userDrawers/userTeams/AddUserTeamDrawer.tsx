import { getTeamsByOrgId } from "@/pages/api/TeamAPI";
import { ITeam, ITeamRole, IUserTeam } from "@/types/team";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Drawer, Table, message } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { tableColumns } from "../../../../../utilities/addUserTeamTable_utils";
import { IUser } from "@/types/user";
import { addMultipleUserTeams } from "@/pages/api/AdminAPI";

const AddUserTeamDrawer = ({ rowDetails, addUserTeamOpen, setAddUserTeamOpen, userTeams, setUserTeams }: { rowDetails: IUser, addUserTeamOpen: boolean, setAddUserTeamOpen: Dispatch<SetStateAction<boolean>>, userTeams: IUserTeam[], setUserTeams: Dispatch<SetStateAction<IUserTeam[]>> }) => {

    const [teams, setTeams] = useState<ITeam[]>([])
    const [availTeams, setAvailTeams] = useState<ITeamRole[]>([])

    const { refetch: fetchTeamsByOrg, isLoading } = useQuery({
        queryKey: ["teams_getTeamsByOrg"],
        queryFn: () => getTeamsByOrgId(1),
        onSuccess: ({ data }) => {
            setTeams(data)
        },
        onError: () => {
            console.log('Unable to fetch teams data')
        },
        enabled: false
    })

    useEffect(() => {
        fetchTeamsByOrg()
        return
    }, [fetchTeamsByOrg])

    useEffect(() => {
        setAvailTeams(teams.filter((team: ITeam) => !userTeams.some((userTeam: IUserTeam) => userTeam.teamId === team.id)).map((team: ITeam) => ({ ...team, role: 2 })))
    }, [teams, userTeams, addUserTeamOpen])

    const { isLoading: addMultipleUserTeamsLoading, mutate: createMultipleUserTeams, } = useMutation({
        mutationKey: ["team_addMultipleUserTeams"],
        mutationFn: (obj: { userId: number, teamUserObjs: Array<{ teamId: number, role: number }> }) => addMultipleUserTeams(obj),
        onSuccess: ({ data }) => {
            message.success(`Team${selectedUserTeamRowKeys.length > 1 ? 's' : ''} added successfully`);
            setSelectedUserTeamRowKeys([]);
            setSelectedUserTeamRows([]);
            setAddUserTeamOpen(false);
            setUserTeams([...userTeams, ...data])
        }
    })

    const [selectedUserTeamRowKeys, setSelectedUserTeamRowKeys] = useState<React.Key[]>([]);
    const [selectedUserTeamRows, setSelectedUserTeamRows] = useState<ITeamRole[]>([]);

    const onSelectUserTeamChange = (newSelectedRowKeys: React.Key[], selectedRows: ITeamRole[]) => {
        setSelectedUserTeamRows(selectedRows);
        setSelectedUserTeamRowKeys(newSelectedRowKeys);
    };

    const userTeamRowSelection = {
        selectedRowKeys: selectedUserTeamRowKeys,
        onChange: onSelectUserTeamChange,
    };

    const onAddUserDrawerFinish = () => {
        createMultipleUserTeams({ userId: rowDetails.id, teamUserObjs: selectedUserTeamRows.map((team: ITeamRole) => ({ teamId: team.id, role: team.role })) })
    }

    return (
        <>
            <Drawer open={addUserTeamOpen} onClose={() => { setAddUserTeamOpen(false); setSelectedUserTeamRowKeys([]); setSelectedUserTeamRows([]); }} width={600} mask={false} closeIcon={<ArrowLeftOutlined />}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>
                    Add Teams
                </div>
                <div style={{ margin: '30px 0', fontStyle: 'italic' }}>
                    You are adding teams for <b>{rowDetails.firstName} {rowDetails.lastName}</b>
                </div>
                <Table
                    rowSelection={{ ...userTeamRowSelection }}
                    columns={tableColumns(availTeams, setAvailTeams)}
                    dataSource={availTeams}
                    pagination={false}
                    loading={isLoading}
                />
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type='primary'
                        htmlType='submit'
                        style={{ width: '25%', marginTop: '20px' }}
                        disabled={selectedUserTeamRowKeys.length === 0}
                        onClick={onAddUserDrawerFinish}
                        loading={addMultipleUserTeamsLoading}
                    >
                        Add Team{selectedUserTeamRowKeys.length > 1 ? 's' : ''} {selectedUserTeamRowKeys.length > 0 ? `(${selectedUserTeamRowKeys.length})` : ''}
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default AddUserTeamDrawer