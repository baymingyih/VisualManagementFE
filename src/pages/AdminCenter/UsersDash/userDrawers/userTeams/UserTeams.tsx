import { IUserTeam } from "@/types/team"
import { Col, Divider, Row } from "antd"
import { Dispatch, SetStateAction } from "react"

const UserDetails = ({userId, setTeamDrawer, teams}: {userId:number, setTeamDrawer: Dispatch<SetStateAction<boolean>>, teams: IUserTeam[]}) => {

  const displayTeams = () => {
    const teamCards: JSX.Element[] = []
    if (teams.length !== 0) {
      teams.map((team) => {
        teamCards.push(
          <div key={team.key}>
            <Row style={{margin: '15px 0', fontSize: '15px'}}>
              <Col span={14}>
                <div>{team.teamName}</div>
              </Col>
              <Col span={5}>
                <div>{team.tier}</div>
              </Col>
              <Col span={5}>
                <div>{team.role === 1 ? 'Admin' : 'Member'}</div>
              </Col>
            </Row>
          </div>
        )
      })
    } else {
      teamCards.push(
        <div key={1} style={{display: 'flex', justifyContent: 'center', opacity: '70%'}}>
          No teams found
        </div>
      )
    }
    return teamCards
  }

  return (
    <>
      <a onClick={()=>setTeamDrawer(true)} style={{fontSize: '14px'}}>Manage Teams</a>
      <Row style={{fontWeight: 500, margin: '16px 0'}}>
        <Col span={14}>
          <div>Team Name</div>
        </Col>
        <Col span={5}>
          <div>Tier</div>
        </Col>
        <Col span={5}>
          <div>Role</div>
        </Col>
      </Row>
      <Divider/>
      <div>
        {displayTeams()}
      </div>
    </>
  )}
  
export default UserDetails;