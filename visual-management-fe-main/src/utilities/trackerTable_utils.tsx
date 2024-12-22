import { getPriorityLabel, getStatusLabel, getTitle } from "./utilities";
import { getAvatarLabel } from "@/utilities/formatters";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";

import styles from "./TrackerTable.module.css";

import { IAction } from "@/types/action";
import { ColumnFilterItem, FilterConfirmProps } from "antd/lib/table/interface";
import { Button, Input, InputRef, Space } from "antd";
import { RefObject } from "react";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

export const filterPICData = (data: IAction[]) => (formatter: any) =>
    data.map((item) => ({
        text: formatter(item),
        value: formatter(item),
    }));

export const tableColumns = (filteredData: IAction[], searchInput: RefObject<InputRef>, handleSearch: (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void) => void, handleReset: (clearFilters: () => void) => void): ColumnsType<IAction> => [
    {
        title: "Action Title",
        dataIndex: ["title", "escalatedfrom_team", "escalatedto_team"],
        render: (text, record) =>
            getTitle(
                record.title,
                record.escalatedfrom_team !== null ? record.escalatedfrom_team.name : "",
                record.escalatedto_team !== null ? record.escalatedto_team.name : ""
            ),
        key: "title",
        width: "50%",
        ellipsis: true,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
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
                {/* <Button
                  onClick={() => clearFilters && handleReset(clearFilters)}
                  size="small"
                  style={{ width: 90 }}
                >
                  Reset
                </Button> */}
              </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record.title
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
        title: "Assignee",
        dataIndex: ["PIC_firstName", "PIC_lastName", "avatar_color"],
        key: "pic",
        render: (text, record) =>
            getAvatarLabel(
                record.PIC_firstName + " " + record.PIC_lastName,
                record.avatar_color,
                28,
                7,
                "right",
                0
            ),
        filters: [
            ...new Map(
                filterPICData(filteredData)(
                    (i: IAction) => i.PIC_firstName + " " + i.PIC_lastName
                ).map((item: any) => [item["text"], item])
            ).values(),
        ] as ColumnFilterItem[],
        onFilter: (value, record) =>
            (record.PIC_firstName + " " + record.PIC_lastName).includes(String(value)),
        align: "center" as const,
        width: "12.5%",
    },
    {
        title: "Status",
        dataIndex: ["status"],
        key: "status",
        render: (text, record) => (
            <div style={{ display: "flex", justifyContent: "center" }}>
                {getStatusLabel(record.status)}
            </div>
        ),
        filters: [
            { text: getStatusLabel(1), value: 1 },
            { text: getStatusLabel(2), value: 2 },
            { text: getStatusLabel(3), value: 3 },
        ],
        onFilter: (value, record) => record.status.toString().includes(String(value)),
        defaultFilteredValue: ["1", "3"],
        sorter: (a, b) => a.status - b.status,
        width: "12.5%",
        align: "center" as const,
    },
    {
        title: "Due Date",
        dataIndex: "deadlineDateTime",
        key: "deadlineDateTime",
        render: (text, record) => (
            <div className={moment(record.deadlineDateTime) < moment() ? styles.overdue : ""}>
                {moment(text).format("DD-MMM-YYYY").toUpperCase()}
            </div>
        ),
        sorter: (a, b) =>
            moment(a.deadlineDateTime).valueOf() - moment(b.deadlineDateTime).valueOf(),
        defaultSortOrder: 'ascend',
        align: "center" as const,
        width: "12.5%",
        ellipsis: true,
    },
    {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        render: (value: number) => (
            <div style={{ display: "flex", verticalAlign: "center", justifyContent: "center" }}>
                {getPriorityLabel(value, 10)}
            </div>
        ),
        filters: [
            { text: <>{getPriorityLabel(1, 10)}Low</>, value: 1 },
            { text: <>{getPriorityLabel(2, 10)}Medium</>, value: 2 },
            { text: <>{getPriorityLabel(3, 10)}High</>, value: 3 },
        ],
        onFilter: (value, record) => record.priority.toString().includes(String(value)),
        sorter: (a, b) => a.priority - b.priority,
        width: "12.5%",
        align: "center" as const,
    },
];

export const getNumRows = (
    screenSize: { width: number; height: number },
    pageOptions: Array<number>
): number => {
    const sHeight = screenSize.height;
    const tableHeaderHeight = 54.8; // the height of the table header
    const tablePaginationHeight = 56; // the height of the table pagination
    const mainHeaderHeight = 64;
    const mainMarginHeight = 40;
    const actionBarHeight = 42;
    const footerHeight = 22;
    const tableHeight =
        sHeight -
        tableHeaderHeight -
        tablePaginationHeight -
        mainHeaderHeight -
        mainMarginHeight -
        actionBarHeight -
        footerHeight;
    const tableRowHeight = 52;
    const fitRows = Math.floor(tableHeight / tableRowHeight) - 1;

    let closestNumber: number = pageOptions[0];
    let minDifference: number = fitRows - closestNumber;

    for (const page of pageOptions) {
        const difference = Math.abs(fitRows - page);

        if (minDifference === null || difference < minDifference) {
            minDifference = difference;
            closestNumber = page;
        }
    }
    return closestNumber;
};
