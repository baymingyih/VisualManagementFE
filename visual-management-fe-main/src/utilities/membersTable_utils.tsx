import { getAvatarLabel } from "@/utilities/formatters";
import { SearchOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Select, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { getAccessLabel } from "./utilities";
import { ITeamMemberFull } from "@/types/team";
import { RefObject } from "react";
import { UseMutateFunction } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { FilterConfirmProps } from "antd/lib/table/interface";

const accessOptions = [
    {
        value: 1,
        label: <div style={{ display: 'flex', alignItems: 'center' }}>{getAccessLabel(1)}</div>
    },
    {
        value: 2,
        label: <div style={{ display: 'flex', alignItems: 'center' }}>{getAccessLabel(2)}</div>
    }
]

const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
  ) => {
    confirm();
  };

export const tableColumns = (searchInput: RefObject<InputRef>, teamId: number, updateRole: UseMutateFunction<AxiosResponse<any, any>, unknown, { teamId: number; userId: number; role: number; }, unknown>): ColumnsType<ITeamMemberFull> => [
    {
        title: 'User',
        dataIndex: ['firstName', 'lastName', 'avatar_color', 'external'],
        key: 'user',
        render: (text: string, record) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '80%' }}>
                    {getAvatarLabel(record.firstName + ' ' + record.lastName, record.avatar_color, 28, 7, null, 7)}
                    <Typography.Text style={{ width: '90%' }} ellipsis={true}>{record.firstName + ' ' + record.lastName}</Typography.Text>
                </div>
                {record.external === 1 && <Tag>External</Tag>}
            </div>
        ),
        width: '36%',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
            <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
              <Input
                ref={searchInput}
                placeholder={`Search Action`}
                value={`${selectedKeys[0] || ''}`}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
                style={{ marginBottom: 8, width: '30vw' }}
                allowClear
              />
              <Space style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys as string[], confirm)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90 }}
                >
                  Search
                </Button>
              </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record.firstName
                .toString()
                .toLowerCase()
                .concat(' ', record.lastName.toString().toLowerCase())
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: '36%',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
            <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
              <Input
                ref={searchInput}
                placeholder={`Search Action`}
                value={`${selectedKeys[0] || ''}`}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
                style={{ marginBottom: 8, width: '30vw' }}
                allowClear
              />
              <Space style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys as string[], confirm)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90 }}
                >
                  Search
                </Button>
              </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record.email
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    },
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (text: string, record) => (
            <Select
                options={accessOptions}
                defaultValue={record.role}
                bordered={false}
                size='small'
                onChange={(value) => { updateRole({ teamId: teamId, userId: record.userId, role: value }) }}
            />
        ),
        width: '12%',
        filters: [
            { text: getAccessLabel(1), value: 1 },
            { text: getAccessLabel(2), value: 2 }
        ],
        onFilter: (value, record) => record.role.toString().includes(String(value)),
    },
    {
        title: 'Last Active',
        dataIndex: 'lastActive',
        key: 'lastActive',
        render: (text: string, record) => <div>{moment(record.lastActive).fromNow()}</div>,
        sorter: (a, b) => moment(a.lastActive).valueOf() - moment(b.lastActive).valueOf(),
        width: '13%',
    },
    // {
    //     dataIndex: 'userId',
    //     width:'3%',
    //     render: (text: String, record) => {
    //       return(
    //         <a
    //           onClick={(event) => event.stopPropagation()}
    //         >
    //           <Button onClick={()=>{setDeleteUser(record); setDeleteModalOpen(true)}} icon={<UserDeleteOutlined />} danger size='small'/>
    //         </a>
    //       )
    //     },
    //     align: 'center' as const,
    // }
]