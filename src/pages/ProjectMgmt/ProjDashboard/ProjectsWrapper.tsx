import { Col, Row } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import ProjDashboard from './ProjDashboard'
import CreateProjectForm from '@/components/ProjectMgmt/CreateProjectForm/CreateProjectForm'

const ContentStyle = {
  height: '90%',
  width: '100%',
  padding: '20px 40px',
  backgroundColor: '#FFF'
}

function ProjectsWrapper() {
  return (
    <Content style={ContentStyle}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <ProjDashboard />
        </Col>
      </Row>
      <CreateProjectForm />
    </Content>
  )
}

export default ProjectsWrapper