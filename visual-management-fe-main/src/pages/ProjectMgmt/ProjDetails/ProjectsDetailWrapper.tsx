import { Col, Row } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import ProjDetails from './ProjDetails'

const ContentStyle = {
  height: '90%',
  width: '100%',
  padding: '20px 40px',
  backgroundColor: '#FFF'
}

function ProjectsDetailWrapper() {
  return (
    <Content style={ContentStyle}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {// @ts-ignore
            <ProjDetails />
          }
        </Col>
      </Row>
    </Content>
  )
}

export default ProjectsDetailWrapper