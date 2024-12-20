import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'

function FormLabel({ title, description }: IFormLabelProps) {
    return (
        <>
            {title}
            <Tooltip
                title={description || 'Mollis porta nibh nisi enim ullamcorper litora'}
            >
                <InfoCircleOutlined style={{ color: '#81C3FF', marginLeft: 10 }} />
            </Tooltip>
        </>
    )
}

interface IFormLabelProps {
    title: string
    description?: string
}

export default FormLabel
