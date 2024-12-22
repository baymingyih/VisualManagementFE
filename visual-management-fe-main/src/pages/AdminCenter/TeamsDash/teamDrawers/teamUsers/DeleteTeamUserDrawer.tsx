import { deleteMembers } from "@/pages/api/TeamAPI";
import { ITeamFull } from "@/types/team";
import { ArrowLeftOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Alert, Avatar, Button, Drawer, message } from "antd";
import { Dispatch, SetStateAction } from "react";

const DeleteTeamUserDrawer = ({teams, setTeams, rowDetails, setRowDetails, deleteTeamUserOpen, setDeleteTeamUserOpen, teamUsersToDelete, setSelectedTeamUserKeys}: {teams: ITeamFull[], setTeams: Dispatch<SetStateAction<ITeamFull[]>>, rowDetails: ITeamFull, setRowDetails: Dispatch<SetStateAction<ITeamFull>>, deleteTeamUserOpen: boolean, setDeleteTeamUserOpen: Dispatch<SetStateAction<boolean>>, teamUsersToDelete: ITeamFull['team_members'][0][], setSelectedTeamUserKeys: Dispatch<SetStateAction<React.Key[]>>}) => {
    
    const userTerm = teamUsersToDelete.length > 1 ? 'Users' : 'User'

    const { isLoading: deleteMultipleUsersLoading, mutate: deleteMultipleUsers, } = useMutation({
        mutationKey: ["team_deleteMultipleUsers"],
        mutationFn: (obj: {teamId: number, userIds: number[]})=> deleteMembers(obj),
        onSuccess: ({data}:{data:number[]}) => {
            setSelectedTeamUserKeys([]);
            setDeleteTeamUserOpen(false);
            const newMembers = rowDetails.team_members.filter((member) => !data.includes(member.id))
            setRowDetails({...rowDetails, team_members: newMembers});
            setTeams(teams.map((team) => {
                if(team.id === rowDetails.id) {
                    return {...team, team_members: newMembers}
                }
                return team
            }))
            message.success(`${userTerm} removed successfully`);
        }
    })

    const onDeleteTeamUserDrawerFinish = () => {
        const userIds = teamUsersToDelete.map((user) => user.id)
        deleteMultipleUsers({teamId: rowDetails.id, userIds: userIds})
    }

    const formatUsrsToDelete = () => {
        const deleteUsrs : JSX.Element[] = []
        teamUsersToDelete.forEach((usr) => {
            if (JSON.stringify(usr) !== '{}') {
                deleteUsrs.push(
                    <div key={usr.id} style={{display: 'flex', alignItems: 'center', margin: '10px 0'}}>
                        <Avatar style={{backgroundColor: usr.avatar_color}}>{usr.firstName[0]}{usr.lastName[0]}</Avatar>
                        <div style={{marginLeft: '10px', fontWeight: 500, fontSize: '15px'}}>
                            {usr.firstName+" "+usr.lastName}
                        </div>
                    </div>)
            }
        })
        return deleteUsrs
    }

    return (
        <>
            <Drawer open={deleteTeamUserOpen} onClose={()=> {setDeleteTeamUserOpen(false)}} width={750} mask={false} closeIcon={<ArrowLeftOutlined />}>
                <div style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px'}}>
                    Remove {userTerm}
                </div>
                <Alert
                    message={`User removal is permanant and cannot be undone. User will be unassigned from all items in the team.`}
                    type="warning"
                    showIcon
                />
                <div style={{marginTop: '30px'}}>
                    Are you sure you want to remove the following {userTerm.toLowerCase()}?
                </div>
                <div style={{margin: '20px'}}>
                    {formatUsrsToDelete()}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type='primary'
                        htmlType='submit'
                        danger
                        onClick={onDeleteTeamUserDrawerFinish}
                        style={{width: '20%', marginTop: '10px'}}
                        loading={deleteMultipleUsersLoading}
                    >
                        Delete {userTerm}
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default DeleteTeamUserDrawer