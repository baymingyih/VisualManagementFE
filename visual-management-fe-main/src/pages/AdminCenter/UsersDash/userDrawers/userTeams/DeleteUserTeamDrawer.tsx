import { deleteMultipleUserTeams } from "@/pages/api/AdminAPI";
import { IUserTeam } from "@/types/team";
import { ArrowLeftOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Drawer, message } from "antd";
import { Dispatch, SetStateAction } from "react";

const DeleteUserTeamDrawer = ({userId, deleteUserTeamOpen, setDeleteUserTeamOpen, usrTeamsToDelete, setSelectedUserTeamKeys, userTeams, setUserTeams}: {userId: number, deleteUserTeamOpen: boolean, setDeleteUserTeamOpen: Dispatch<SetStateAction<boolean>>, usrTeamsToDelete: IUserTeam[], setSelectedUserTeamKeys: Dispatch<SetStateAction<React.Key[]>>, userTeams: IUserTeam[], setUserTeams: Dispatch<SetStateAction<IUserTeam[]>>}) => {
    
    const teamTerm = usrTeamsToDelete.length > 1 ? 'Teams' : 'Team'

    const { isLoading: deleteMultipleUserTeamsLoading, mutate: removeMultipleUserTeams, } = useMutation({
        mutationKey: ["team_deleteMultipleUserTeams"],
        mutationFn: (obj: {userId: number, teamIds: number[]})=> deleteMultipleUserTeams(obj),
        onSuccess: ({data}) => {
            setSelectedUserTeamKeys([]);
            setDeleteUserTeamOpen(false);
            setUserTeams(userTeams.filter((team) => data.indexOf(team.teamId) === -1))
            message.success(`${teamTerm} removed successfully`);
        }
    })

    const onDeleteUserTeamDrawerFinish = () => {
        const teamIds = usrTeamsToDelete.map((team) => team.teamId)
        removeMultipleUserTeams({userId: userId, teamIds: teamIds})
    }

    const formatUsrsToDelete = () => {
        const deleteUsrs : JSX.Element[] = []
        usrTeamsToDelete.forEach((team) => {
            if (JSON.stringify(team) !== '{}') {
                deleteUsrs.push(
                    <div key={team.key} style={{display: 'flex', alignItems: 'center', margin: '10px 0'}}>
                        <CloseCircleOutlined style={{color:"red"}}/>
                        <div style={{marginLeft: '10px', fontWeight: 500, fontSize: '15px'}}>
                            {team.teamName}
                        </div>
                    </div>
                )
            }
        })
        return deleteUsrs
    }

    return (
        <>
            <Drawer open={deleteUserTeamOpen} onClose={()=> {setDeleteUserTeamOpen(false)}} width={600} mask={false} closeIcon={<ArrowLeftOutlined />}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Remove {teamTerm}
                </div>
                <Alert
                    message={`Team removal is permanant and cannot be undone. User will be unassigned from all items in the selected ${teamTerm.toLowerCase()}.`}
                    type="warning"
                    showIcon
                />
                <div style={{marginTop: '30px'}}>
                    Are you sure you want to remove the following {teamTerm.toLowerCase()}?
                </div>
                <div style={{margin: '20px'}}>
                    {formatUsrsToDelete()}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type='primary'
                        htmlType='submit'
                        danger
                        onClick={onDeleteUserTeamDrawerFinish}
                        style={{width: '25%', marginTop: '10px'}}
                        loading={deleteMultipleUserTeamsLoading}
                    >
                        Delete {teamTerm}
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default DeleteUserTeamDrawer