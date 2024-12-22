import { LineChartOutlined } from '@ant-design/icons'
import { Divider, Space } from 'antd'

function FormDrawerSection({ title }: IFormDrawerSectionProps) {
  return (
    <>
      <Space
        style={{
          fontSize: '1.1rem',
          color: '#1890FF',
          padding: '10px 0'
        }}
      >
        <LineChartOutlined style={{ marginRight: 5 }} />
        {title}
      </Space>
      <Divider style={{ margin: 0, backgroundColor: '#1890FF' }} />
    </>
  )
}

interface IFormDrawerSectionProps {
  title: string
}

export default FormDrawerSection
