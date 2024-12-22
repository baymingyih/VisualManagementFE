import { Col, Row } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import TrackerTable from './TrackerTable/TrackerTable'

const ContentStyle = {
  height: '90%',
  width: '100%',
  padding: "0 40px",
  backgroundColor: '#FFF'
}

function Tracker() {
  return (
    <Content style={ContentStyle}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <TrackerTable />
        </Col>
      </Row>
    </Content>
  )
}

export default Tracker
