import { deleteMultipleTeams } from "@/pages/api/AdminAPI";
import { ITeamFull } from "@/types/team";
import { ArrowLeftOutlined, CloseCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Alert, Avatar, Button, Drawer, message } from "antd";
import { Dispatch, SetStateAction } from "react";

const DeleteTeamDrawer = ({ teams, setTeams, deleteTeamOpen, setDeleteTeamOpen, teamsToDelete, setTeamsToDelete, primary, setRowDetails }: { teams: ITeamFull[], setTeams: Dispatch<SetStateAction<ITeamFull[]>>, deleteTeamOpen: boolean, setDeleteTeamOpen: Dispatch<SetStateAction<boolean>>, teamsToDelete: ITeamFull[], setTeamsToDelete: Dispatch<SetStateAction<ITeamFull[]>>, primary: boolean, setRowDetails: Dispatch<SetStateAction<ITeamFull>> | undefined }) => {

    const teamTerm = teamsToDelete && teamsToDelete!.length > 1 ? 'Teams' : 'Team'

    const { isLoading: deleteTeamsLoading, mutate: deleteTeams, } = useMutation({
        mutationKey: ["teams_deleteTeams"],
        mutationFn: (obj: { teamIds: number[] }) => deleteMultipleTeams(obj),
        onSuccess: ({ data }: { data: number[] }) => {
            message.success(`${teamTerm} deleted successfully`);
            setDeleteTeamOpen(false);
            if (setRowDetails) {
                setRowDetails({} as ITeamFull)
            }
            setTeamsToDelete([])
            setTeams(teams.filter((team) => !data.includes(team.id)))
        }
    })

    const onDeleteUserDrawerFinish = () => {
        deleteTeams({
            teamIds: teamsToDelete.map((team) => team.id)
        })
    }

    const formatTeamsToDelete = () => {
        const deleteTeams: JSX.Element[] = []
        teamsToDelete.forEach((team) => {
            if (JSON.stringify(team) !== '{}') {
                deleteTeams.push(
                    <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                        <CloseCircleOutlined style={{ color: "red" }} />
                        <div style={{ marginLeft: '10px', fontWeight: 500, fontSize: '15px' }}>
                            {team.name}
                        </div>
                    </div>
                )
            }
        })
        return deleteTeams
    }

    return (
        <>
            <Drawer open={deleteTeamOpen} onClose={() => { setDeleteTeamOpen(false) }} width={750} mask={primary ? true : false} closeIcon={primary ? <CloseOutlined /> : <ArrowLeftOutlined />} maskClosable={false}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>
                    Delete {teamTerm}
                </div>
                <Alert
                    message="Team deletion is permanant and cannot be undone."
                    type="warning"
                    showIcon
                />
                <div style={{ marginTop: '30px' }}>
                    Are you sure you want to delete the following {teamTerm.toLowerCase()}?
                </div>
                <div style={{ margin: '20px' }}>
                    {formatTeamsToDelete()}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type='primary'
                        htmlType='submit'
                        danger
                        onClick={onDeleteUserDrawerFinish}
                        style={{ width: '20%', marginTop: '20px' }}
                        loading={deleteTeamsLoading}
                    >
                        Delete {teamTerm}
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default DeleteTeamDrawer