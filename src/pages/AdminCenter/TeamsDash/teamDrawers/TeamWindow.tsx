import { ITeamFull } from "@/types/team";
import { EditOutlined, UsergroupDeleteOutlined } from "@ant-design/icons";
import { Button, Drawer, Menu, MenuProps } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import TeamDetails from "./TeamDetails";
import TeamUsers from "./teamUsers/TeamUsers";
import ChangeTeamNameDrawer from "./ChangeTeamNameDrawer";
import ManageUsersDrawer from "./teamUsers/ManageUsersDrawer";
import ChangeTierReportsToDrawer from "./ChangeTierReportsToDrawer";
import DeleteTeamDrawer from "./DeleteTeamDrawer";
import { IUserRole } from "@/types/user";
import AddTeamUserDrawer from "./teamUsers/AddTeamUserDrawer";
import DeleteTeamUserDrawer from "./teamUsers/DeleteTeamUserDrawer";

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

const TeamWindow = ({ teams, setTeams, rowDetails, setRowDetails, setTeamsToDelete }: { teams: ITeamFull[], setTeams: Dispatch<SetStateAction<ITeamFull[]>>, rowDetails: ITeamFull, setRowDetails: Dispatch<SetStateAction<ITeamFull>>, setTeamsToDelete: Dispatch<SetStateAction<ITeamFull[]>> }) => {

    const [selectedKey, setSelectedKey] = useState('details');

    const [teamNameDrawer, setTeamNameDrawer] = useState(false);
    const [tierReportDrawer, setTierReportDrawer] = useState(false);
    const [deleteTeamOpen, setDeleteTeamOpen] = useState(false);
    const [userDrawer, setUserDrawer] = useState(false);
    const [addTeamUserOpen, setAddTeamUserOpen] = useState(false);
    const [deleteTeamUserOpen, setDeleteTeamUserOpen] = useState(false);

    const [selectedTeamUserKeys, setSelectedTeamUserKeys] = useState<React.Key[]>([]);
    // const [selectedTeamUserRows, setSelectedTeamUserRows] = useState<ITeamFull['team_members'][0][]>([]);
    const [selectedTeamUserRows, setSelectedTeamUserRows] = useState<any[]>([]);

    const items: MenuProps['items'] = [
        getItem('Details', 'details'),
        getItem(`Users (${JSON.stringify(rowDetails) !== '{}' ? rowDetails.team_members.length : 0})`, 'users')
    ];

    return (
        <>
            <Drawer placement="right" onClose={() => setRowDetails({} as ITeamFull)} open={JSON.stringify(rowDetails) !== '{}'} width={750} maskClosable={false}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 30 }}>
                    <div style={{ fontWeight: 600, fontSize: '2.2rem', marginLeft: '20px' }}>
                        {rowDetails.name}
                    </div>
                </div>
                <div style={{ margin: '20px 0' }}>
                    <Button type='text' icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => { setTierReportDrawer(true) }}>
                        Change Tier & Reports To
                    </Button>
                    <Button type='text' icon={<UsergroupDeleteOutlined style={{ color: '#1890ff' }} />} onClick={() => { setDeleteTeamOpen(true) }}>
                        Delete Team
                    </Button>
                </div>
                <Menu
                    onClick={(item) => setSelectedKey(item.key as string)}
                    defaultSelectedKeys={['details']}
                    mode="horizontal"
                    items={items}
                />
                <div style={{ margin: '20px' }}>
                    {selectedKey === 'details' && <TeamDetails rowDetails={rowDetails} setTeamNameDrawer={setTeamNameDrawer} />}
                    {selectedKey === 'users' && <TeamUsers rowDetails={rowDetails} setUserDrawer={setUserDrawer} />}
                </div>
            </Drawer>
            <ChangeTeamNameDrawer teams={teams} setTeams={setTeams} rowDetails={rowDetails} setRowDetails={setRowDetails} teamNameDrawer={teamNameDrawer} setTeamNameDrawer={setTeamNameDrawer} />
            <ChangeTierReportsToDrawer teams={teams} setTeams={setTeams} rowDetails={rowDetails} setRowDetails={setRowDetails} tierReportDrawer={tierReportDrawer} setTierReportDrawer={setTierReportDrawer} />
            <DeleteTeamDrawer teams={teams} setTeams={setTeams} deleteTeamOpen={deleteTeamOpen} setDeleteTeamOpen={setDeleteTeamOpen} teamsToDelete={[rowDetails]} primary={false} setRowDetails={setRowDetails} setTeamsToDelete={setTeamsToDelete}/>
            <ManageUsersDrawer teams={teams} setTeams={setTeams} rowDetails={rowDetails} setRowDetails={setRowDetails} userDrawer={userDrawer} setUserDrawer={setUserDrawer} setAddTeamUserOpen={setAddTeamUserOpen} setDeleteTeamUserOpen={setDeleteTeamUserOpen} selectedTeamUserKeys={selectedTeamUserKeys} setSelectedTeamUserKeys={setSelectedTeamUserKeys} setSelectedTeamUserRows={setSelectedTeamUserRows} />
            <AddTeamUserDrawer teams={teams} setTeams={setTeams} rowDetails={rowDetails} setRowDetails={setRowDetails} addTeamUserOpen={addTeamUserOpen} setAddTeamUserOpen={setAddTeamUserOpen} />
            <DeleteTeamUserDrawer teams={teams} setTeams={setTeams} rowDetails={rowDetails} setRowDetails={setRowDetails} deleteTeamUserOpen={deleteTeamUserOpen} setDeleteTeamUserOpen={setDeleteTeamUserOpen} teamUsersToDelete={selectedTeamUserRows} setSelectedTeamUserKeys={setSelectedTeamUserKeys} />
        </>
    )
}

export default TeamWindow;

