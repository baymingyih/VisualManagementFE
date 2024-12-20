import { getAvatarLabel } from '@/utilities/formatters'
import { getStatusLabel, getPriorityLabel, getTitle } from '@/utilities/utilities'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'

import styles from './projectActionsTable.module.css'

import { filterPICData } from '../utilities/utilities'

import { IAction } from '@/types/action'
import { ColumnFilterItem } from 'antd/lib/table/interface'

export const tableColumns = (actionsData: IAction[]): ColumnsType<IAction> => [
  {
    title: 'Action Title',
    dataIndex: ['title', 'escalatedfrom_team', 'escalatedto_team'],
    render: (text, record) => getTitle(record.title, record.escalatedfrom_team !== null ? record.escalatedfrom_team.name : "", record.escalatedto_team !== null ? record.escalatedto_team.name : ""),
    key: 'title',
    width: '50%',
    ellipsis: true,
  },
  {
    title: 'Assignee',
    dataIndex: ['PIC_firstName', 'PIC_lastName', 'avatar_color'],
    key: 'pic',
    render: (text: string, record) => (
      getAvatarLabel(record.PIC_firstName + " " + record.PIC_lastName, record.avatar_color, 28, 7, 'right', 0)
    ),
    filters: [...new Map(filterPICData(actionsData)((i: IAction) => (i.PIC_firstName + ' ' + i.PIC_lastName)).map((item: any) => [item['text'], item])).values()] as ColumnFilterItem[],
    onFilter: (value, record) => (record.PIC_firstName + ' ' + record.PIC_lastName).includes(String(value)),
    align: 'center' as const,
    width: '12.5%'
  },
  {
    title: 'Status',
    dataIndex: ['status'],
    key: 'status',
    render: (text: string, record) => getStatusLabel(record.status),
    filters: [
      { text: getStatusLabel(1), value: 1 },
      { text: getStatusLabel(2), value: 2 },
      { text: getStatusLabel(3), value: 3 }
    ],
    onFilter: (value, record) => record.status.toString().includes(String(value)),
    // defaultFilteredValue : ['1','3'],
    sorter: (a, b) => a.status - b.status,
    width: '12.5%',
    align: 'center' as const
  },
  {
    title: 'Due Date',
    dataIndex: 'deadlineDateTime',
    key: 'deadlineDateTime',
    render: (text: string, record) => (
      <div className={moment(record.deadlineDateTime) < moment() ? (styles.overdue) : ""}>{moment(text).format("DD-MMM-YYYY").toUpperCase()}</div>
    ),
    sorter: (a, b) => moment(a.deadlineDateTime).valueOf() - moment(b.deadlineDateTime).valueOf(),
    defaultSortOrder: 'ascend',
    align: 'center' as const,
    width: '12.5%',
    ellipsis: true
  },
  {
    title: 'Priority',
    dataIndex: 'priority',
    key: 'priority',
    render: (value: number) => <div style={{ display: 'flex', verticalAlign: 'center', justifyContent: 'center', fontSize: '18px' }}>{getPriorityLabel(value, 10)}</div>,
    filters: [
      { text: <>{getPriorityLabel(1, 10)}Low</>, value: 1 },
      { text: <>{getPriorityLabel(2, 10)}Medium</>, value: 2 },
      { text: <>{getPriorityLabel(3, 10)}High</>, value: 3 }
    ],
    onFilter: (value, record) => record.priority.toString().includes(String(value)),
    sorter: (a, b) => a.priority - b.priority,
    width: '12.5%',
    align: 'center' as const
  }
]