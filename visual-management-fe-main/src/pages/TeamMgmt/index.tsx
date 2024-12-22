import SharedLayout from "@/components/SharedLayout/SharedLayout";
import { ReactElement } from "react";

import { Col, Row } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import TeamDashboard from "./TeamDashboard";

const ContentStyle = {
  height: '90%',
  width: '100%',
  padding: '20px 40px',
  backgroundColor: '#FFF'
}

function TeamMgmt() {
  return (
    <Content style={ContentStyle}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <TeamDashboard/>
        </Col>
      </Row>
    </Content>
  )
}

TeamMgmt.getLayout = function getLayout(page: ReactElement) {
  return <SharedLayout>{page}</SharedLayout>;
};

export default TeamMgmt
