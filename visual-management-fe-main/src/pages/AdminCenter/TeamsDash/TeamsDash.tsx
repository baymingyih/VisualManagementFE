import { Button, Card, Divider, Input, Table } from 'antd';
import styles from '../mainStyles.module.css';
import { useEffect, useState } from 'react';
import { ITeamFull } from '@/types/team';
import { tableColumns } from '../../../utilities/teamTable_utils';
import { SearchOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getTeamsFullByOrg } from '@/pages/api/AdminAPI';
import TeamWindow from './teamDrawers/TeamWindow';
import AddTeamDrawer from './teamDrawers/AddTeamDrawer';
import DeleteTeamDrawer from './teamDrawers/DeleteTeamDrawer';

const TeamsDash = () => {

  const [teams, setTeams] = useState<ITeamFull[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<ITeamFull[]>([]);

  const [selectedTeamsRowKeys, setSelectedTeamsRowKeys] = useState<React.Key[]>([]);
  const [selectedTeamsRows, setSelectedTeamsRows] = useState<ITeamFull[]>([]);

  const [searchBarValue, setSearchBarValue] = useState("");

  const [rowDetails, setRowDetails] = useState({} as ITeamFull)

  const [addTeamOpen, setAddTeamOpen] = useState(false)
  const [deleteTeamOpen, setDeleteTeamOpen] = useState(false)

  const { refetch: fetchTeams, isLoading } = useQuery({
    queryKey: ["users_getTeamsFullByOrg"],
    queryFn: () => getTeamsFullByOrg(1),
    onSuccess: ({ data }) => {
      setTeams(data)
    },
    onError: () => {
      console.log('Unable to fetch teams data')
    },
    enabled: false
  })

  useEffect(() => {
    fetchTeams()
    return
  }, [fetchTeams])

  useEffect(() => {
    const filteredData = teams.filter((record) =>
      (record.name).toLowerCase().includes(searchBarValue.toLowerCase())
    )
    setFilteredTeams(filteredData)
  }, [teams, searchBarValue])

  useEffect(() => {
    if (selectedTeamsRows.length == 0) {
      setSelectedTeamsRowKeys([])
    }
  }, [selectedTeamsRows])

  const onSelectTeamsChange = (newSelectedRowKeys: React.Key[], selectedRows: any) => {
    setSelectedTeamsRows(selectedRows);
    setSelectedTeamsRowKeys(newSelectedRowKeys);
  };

  const teamsRowSelection = {
    selectedTeamsRowKeys,
    onChange: onSelectTeamsChange,
  };

  return (
    <>
      <div className={styles.title}>Teams</div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button type='text' icon={<UsergroupAddOutlined style={{ color: '#1890ff' }} />} onClick={() => { setAddTeamOpen(true) }}>Add Team</Button>
            {selectedTeamsRowKeys.length > 0 && <Button type='text' icon={<UsergroupDeleteOutlined style={{ color: '#1890ff' }} />} onClick={() => { setDeleteTeamOpen(true) }}>Delete {selectedTeamsRowKeys.length > 1 ? 'Teams' : 'Team'}</Button>}
          </div>
          {selectedTeamsRowKeys.length > 0 && <div>
            {selectedTeamsRowKeys.length} selected
          </div>}
        </div>
        <Divider />
        <Input
          placeholder='Search team list'
          style={{ width: '30%', marginBottom: '10px' }}
          allowClear={true}
          value={searchBarValue}
          onChange={(e) => {
            setSearchBarValue(e.target.value)
          }}
          suffix={<SearchOutlined />}
        />
        <Table
          rowSelection={teamsRowSelection}
          columns={tableColumns()}
          dataSource={filteredTeams}
          pagination={{
            position: ['bottomCenter'],
            showSizeChanger: true,
          }}
          loading={isLoading}
          className={styles.tableHover}
          onRow={(record) => {
            return {
              onClick: () => {
                setRowDetails(record)
              }
            }
          }}
        />
      </Card>

      <TeamWindow teams={teams} setTeams={setTeams} rowDetails={rowDetails} setRowDetails={setRowDetails} setTeamsToDelete={setSelectedTeamsRows}/>
      <AddTeamDrawer teams={teams} setTeams={setTeams} addTeamOpen={addTeamOpen} setAddTeamOpen={setAddTeamOpen} />
      <DeleteTeamDrawer teams={teams} setTeams={setTeams} deleteTeamOpen={deleteTeamOpen} setDeleteTeamOpen={setDeleteTeamOpen} teamsToDelete={selectedTeamsRows} setTeamsToDelete={setSelectedTeamsRows} primary={true} setRowDetails={undefined} />
    </>
  )
}

export default TeamsDash;