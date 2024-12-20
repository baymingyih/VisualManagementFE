import { ITeamFull } from "@/types/team"
import { Avatar, Col, Divider, Row, Typography } from "antd"
import { Dispatch, SetStateAction } from "react"

const TeamUsers = ({rowDetails, setUserDrawer}: {rowDetails: ITeamFull, setUserDrawer: Dispatch<SetStateAction<boolean>>}) => {
    
    const displayUsers = () => {
        const userCards: JSX.Element[] = []
        if (rowDetails.team_members) {
        if (rowDetails.team_members.length !== 0) {
            rowDetails.team_members.map((team_member) => {
                userCards.push(
                  <div key={team_member.id}>
                    <Row style={{margin: '15px 0'}}>
                    <Col span={11}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Avatar style={{marginRight: '10px', backgroundColor: team_member.avatar_color}} size={24} gap={6}>{team_member.firstName[0]}{team_member.lastName[0]}</Avatar><Typography.Text style={{width: '80%'}} ellipsis={true}>{team_member.firstName + ' ' + team_member.lastName}</Typography.Text>
                        </div>
                    </Col>
                    <Col span={10}>
                      {team_member.email}
                    </Col>
                    <Col span={3}>
                        <div>{team_member.role === 1 ? 'Admin' : 'Member'}</div>
                    </Col>
                    </Row>
                  </div>
                )
          })
        } else {
          userCards.push(
            <div style={{display: 'flex', justifyContent: 'center', opacity: '70%'}}>
              No users found
            </div>
          )
        }
        return userCards
      }}
    
      return (
        <>
          <a onClick={()=>setUserDrawer(true)} style={{fontSize: '14px'}}>Manage Users</a>
          <Row style={{fontWeight: 500, margin: '16px 0'}}>
            <Col span={11}>
              <div>User Name</div>
            </Col>
            <Col span={10}>
              <div>Email</div>
            </Col>
            <Col span={3}>
              <div>Role</div>
            </Col>
          </Row>
          <Divider/>
          <div>
            {displayUsers()}
          </div>
        </>
    )
}

export default TeamUsers