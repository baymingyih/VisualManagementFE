import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { IUser } from "@/types/user";
import { Tag, Typography } from "antd";

export const tableColumns = (): ColumnsType<IUser> => [
    {
        title: 'Name',
        dataIndex: ['firstName', 'lastName', 'external'],
        key: 'user',
        render: (text: string, record) => (
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography.Text style={{width: '80%'}} ellipsis={true}>{record.firstName + ' ' + record.lastName}</Typography.Text>
                {record.external===1 && <Tag>External</Tag>}
            </div>
        ),
        ellipsis: true,
        width:'28%',
        sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
        width: '31%',
    },
    {
        title: 'Permissions',
        dataIndex: 'orgAdmin',
        key: 'perms',
        render: (text: string, record) => {
            if (record.orgAdmin) {
                return <>Super User</>
            } else {
                return <>User</>
            }
        },
        filters: [
            { text: 'User', value: 0 },
            { text: 'Super User', value: 1 }
          ],
          onFilter: (value, record) => record.orgAdmin.toString().includes(String(value)),
        width: '11%',
    },
    {
        title: 'Last Active',
        dataIndex: 'lastActive',
        key: 'lastActive',
        render: (text: string, record) => <div>{moment(record.lastActive).format("DD MMM YYYY, H:MM:SS")}</div>,
        sorter: (a, b) => moment(a.lastActive).valueOf() - moment(b.lastActive).valueOf(),
        width: '15%',
    },
    {
        title: 'Last Updated',
        dataIndex: 'updated_at',
        key: 'lastUpdated',
        render: (text: string, record) => <div>{moment(record.updated_at).format("DD MMM YYYY, H:MM:SS")}</div>,
        sorter: (a, b) => moment(a.lastActive).valueOf() - moment(b.lastActive).valueOf(),
        width: '15%',
    }
]