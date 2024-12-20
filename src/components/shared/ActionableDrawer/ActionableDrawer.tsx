import { Button, Col, Row } from "antd"

export default function ActionableDrawer({
    actionItem,
    onSuccess,
    onCancel
}: ActionableDrawerProps) {
    return (
        <Row align='middle'>
            <Col span={18}>{actionItem}</Col>
            <Col span={3}>
                <Button onClick={onCancel}>Cancel</Button>
            </Col>
            <Col span={3}>
                <Button onClick={onSuccess} type='primary'>
                    Create
                </Button>
            </Col>
        </Row>
    )
}

interface ActionableDrawerProps {
    actionItem: React.ReactNode
    onSuccess: () => void
    onCancel: () => void
}