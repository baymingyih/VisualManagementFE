import { Card, Row, Col, Typography, Button, Dropdown, Empty } from 'antd';
import type { MenuProps } from 'antd';
import { EllipsisOutlined, ClockCircleOutlined } from '@ant-design/icons'
const { Paragraph } = Typography;
import styles from './ProjectCard.module.css'
import { getAvatarLabel } from '@/utilities/formatters';
import moment from 'moment'

import { IGeneralProject } from '@/types/project';
import { UseMutateFunction } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import Link from 'next/link';
import { pgmt_getStatusLabel } from '@/utilities/utilities';

const items: MenuProps['items'] = [
    {
        key: '1',
        label: 'Unstar',
    }
]

const ProjectCard = ({ projectDetails, editStarred }: { projectDetails: IGeneralProject | null, editStarred: UseMutateFunction<AxiosResponse<any, any>, unknown, { projectId: number; starred: number; }, unknown> | null }) => {

    if (projectDetails !== null && editStarred !== null) {
        const handleMenuClick: MenuProps['onClick'] = e => {
            if (e.key === "1") {
                editStarred({
                    projectId: projectDetails.id,
                    starred: projectDetails.starred === 1 ? 0 : 1
                })
            };
        };

        const menuProps = {
            items,
            onClick: handleMenuClick,
        };
        return (
            <Link href={`/ProjectMgmt/${projectDetails.id}`}>
                <Card style={{ width: 300 }} hoverable>
                    <Row justify={'space-between'}>
                        <Col span={20} className={styles.card_title}>
                            <div style={{ lineHeight: '1.5em', height: '3em' }}>
                                <Paragraph ellipsis={{ rows: 2 }}>{projectDetails.title}</Paragraph>
                            </div>
                        </Col>
                        <Col onClick={e => e.stopPropagation()}>
                            <Dropdown menu={menuProps} placement="bottomRight" trigger={['click']}>
                                <Button size='small' type='text'><EllipsisOutlined rotate={90} /></Button>
                            </Dropdown>
                        </Col>
                    </Row>
                    <Row className={styles.card_status}>
                        {pgmt_getStatusLabel(projectDetails.status)}
                    </Row>
                    <Row justify={'space-between'} align={'bottom'}>
                        <Col className={styles.card_duedate}><ClockCircleOutlined /> {moment(projectDetails.dueDateTime).format('DD-MMM-YYYY').toUpperCase()}</Col>
                        <Col className={styles.card_avatar}>{getAvatarLabel(projectDetails.owner_firstName + ' ' + projectDetails.owner_lastName, projectDetails.avatar_color, 20, 5, 'left', 0)}</Col>
                    </Row>
                </Card>
            </Link>
        )
    } else {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{ height: 38 }}
                description={'No starred projects'}
            />
        )
    }
}

export default ProjectCard;