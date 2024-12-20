import { IUser } from "@/types/user";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { Col, Descriptions, Row } from "antd";
import moment from "moment";
import { Dispatch, SetStateAction } from "react";

const UserDetails = ({ rowDetails, setPermsDrawer }: { rowDetails: IUser, setPermsDrawer: Dispatch<SetStateAction<boolean>> }) => {

  return (
    <>
      <Descriptions layout="vertical" colon={false} column={2} labelStyle={{ color: "#545454",fontSize: '14px', marginBottom: '-10px' }} contentStyle={{ fontWeight: 600, fontSize: '15px', marginBottom: '20px' }}>
        <Descriptions.Item label="First Name">{rowDetails.firstName}</Descriptions.Item>
        <Descriptions.Item label="Last Name">{rowDetails.lastName}</Descriptions.Item>
        <Descriptions.Item label="Email" span={2}>{rowDetails.email ? rowDetails.email : <div style={{ color: 'gray' }}>Not Applicable</div>}</Descriptions.Item>
        <Descriptions.Item label="Permissions">
          <Row>
            <Col>
              <div>{rowDetails!.orgAdmin ? 'Super User ' : 'User'}</div>
              {Boolean(rowDetails!.active) && <a style={{ fontSize: '14px', textAlign: 'left' }} onClick={() => { setPermsDrawer(true) }}>Change Permissions</a>}
            </Col>
          </Row>
        </Descriptions.Item>
        <Descriptions.Item label="Status">{rowDetails!.active ? (<div><CheckCircleFilled style={{ color: 'green' }} /> Active</div>) : (<div><CloseCircleFilled style={{ color: 'red' }} /> Inactive</div>)}</Descriptions.Item>
        <Descriptions.Item label="Last Active">{moment(rowDetails!.lastActive).format('DD MMM YYYY, HH:MM:SS')}</Descriptions.Item>
        <Descriptions.Item label="Last Updated">{moment(rowDetails!.updated_at).format('DD MMM YYYY, HH:MM:SS')}</Descriptions.Item>
      </Descriptions>
    </>
  )
}

export default UserDetails;