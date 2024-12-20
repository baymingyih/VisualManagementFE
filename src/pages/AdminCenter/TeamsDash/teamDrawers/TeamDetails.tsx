import { ITeamFull } from "@/types/team";
import { Col, Descriptions, Row, Tag } from "antd";
import moment from "moment";
import { Dispatch, SetStateAction } from "react";

const UserDetails = ({ rowDetails, setTeamNameDrawer }: { rowDetails: ITeamFull, setTeamNameDrawer: Dispatch<SetStateAction<boolean>> }) => {

  return (
    <>
      <Descriptions layout="vertical" colon={false} column={2} labelStyle={{ color: "#545454",fontSize: '14px', marginBottom: '-10px' }} contentStyle={{ fontWeight: 600, fontSize: '15px', marginBottom: '20px' }}>
        <Descriptions.Item label="Team Name" span={2}>
          <Row>
            <Col>
              <div>{rowDetails!.name}</div>
              <a style={{ fontSize: '14px', textAlign: 'left' }} onClick={() => { setTeamNameDrawer(true) }}>Change Team Name</a>
            </Col>
          </Row>
        </Descriptions.Item>
        <Descriptions.Item label="Tier">{rowDetails.tier}</Descriptions.Item>
        <Descriptions.Item label="Max Members" >{10}</Descriptions.Item>
        <Descriptions.Item label="Reports To" span={2}>
          {rowDetails!.reportTo ?
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tag> Tier {rowDetails!.reportTo.tier}</Tag> {rowDetails!.reportTo!.name}
            </div>
            : 'None'}
        </Descriptions.Item>
        <Descriptions.Item label="Created On">{moment(rowDetails!.created_at).format('DD MMM YYYY, HH:MM:SS')}</Descriptions.Item>
        <Descriptions.Item label="Last Updated">{moment(rowDetails!.updated_at).format('DD MMM YYYY, HH:MM:SS')}</Descriptions.Item>
      </Descriptions>
    </>
  )
}

export default UserDetails;