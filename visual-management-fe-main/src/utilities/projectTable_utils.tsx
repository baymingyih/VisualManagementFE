import { getAvatarLabel } from "@/utilities/formatters";
import { getStatusLabel } from "../utilities/utilities";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { Button, Input, InputRef, Space } from "antd";
import { SearchOutlined, StarFilled, StarOutlined } from "@ant-design/icons";

import { filterPICData } from "../utilities/utilities";

import { IGeneralProject } from "@/types/project";
import { UseMutateFunction } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { ColumnFilterItem, FilterConfirmProps } from "antd/lib/table/interface";

import styles from "../pages/ProjectMgmt/ProjDashboard/projectTable.module.css";
import { RefObject } from "react";

export const getStarredButton = (
    starred: number,
    projectId: number,
    editStarred: UseMutateFunction<
        AxiosResponse<any, any>,
        unknown,
        { projectId: number; starred: number },
        unknown
    >
) => {
    if (starred === 1) {
        return (
            <>
                <Button
                    style={{ color: "#545454" }}
                    icon={<StarFilled />}
                    type="link"
                    size="small"
                    onClick={() =>
                        editStarred({ projectId: projectId, starred: starred === 1 ? 0 : 1 })
                    }
                />
            </>
        );
    } else {
        return (
            <>
                <Button
                    style={{ color: "#545454" }}
                    icon={<StarOutlined />}
                    type="link"
                    size="small"
                    onClick={() =>
                        editStarred({ projectId: projectId, starred: starred === 1 ? 0 : 1 })
                    }
                />
            </>
        );
    }
};

export const tableColumns = (
    projectsData: IGeneralProject[],
    editStarred: UseMutateFunction<
        AxiosResponse<any, any>,
        unknown,
        { projectId: number; starred: number },
        unknown
    >,
    searchInput: RefObject<InputRef>, handleSearch: (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void) => void, handleReset: (clearFilters: () => void) => void
): ColumnsType<IGeneralProject> => [
    {
        dataIndex: ["starred"],
        width: "3%",
        render: (text: String, record) => {
            return (
                <a onClick={(event) => event.stopPropagation()}>
                    {getStarredButton(record.starred, record.id, editStarred)}
                </a>
            );
        },
    },
    {
        title: "Project Title",
        dataIndex: ["title"],
        key: "title",
        width: "50%",
        ellipsis: true,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
              <Input
                ref={searchInput}
                placeholder={`Search Project`}
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
        title: "Owner",
        dataIndex: ["owner_firstName", "owner_lastName", "avatar_color"],
        key: "owner",
        render: (text: String, record) =>
            getAvatarLabel(
                record.owner_firstName + " " + record.owner_lastName,
                record.avatar_color,
                28,
                7,
                "right",
                0
            ),
        filters: [
            ...new Map(
                filterPICData(projectsData)(
                    (i: IGeneralProject) => i.owner_firstName + " " + i.owner_lastName
                ).map((item: any) => [item["text"], item])
            ).values(),
        ] as ColumnFilterItem[],
        onFilter: (value, record) =>
            (record.owner_firstName + " " + record.owner_lastName).includes(String(value)),
        sorter: (a, b) => a.owner_firstName.localeCompare(b.owner_firstName),
        align: "center" as const,
        width: "12.5%",
    },
    {
        title: "Due Date",
        dataIndex: "dueDateTime",
        key: "dueDateTime",
        render: (text, record) => (
            <div className={moment(record.dueDateTime) < moment() ? styles.overdue : ""}>
                {moment(text).format("DD-MMM-YYYY").toUpperCase()}
            </div>
        ),
        sorter: (a, b) => moment(a.dueDateTime).valueOf() - moment(b.dueDateTime).valueOf(),
        defaultSortOrder: 'ascend',
        align: "center" as const,
        width: "12.5%",
        ellipsis: true,
    },
    {
        title: "Status",
        dataIndex: ["status"],
        key: "status",
        render: (text: String, record) => getStatusLabel(record.status),
        filters: [
            { text: "Pending", value: 3 },
            { text: "In Progress", value: 1 },
            { text: "Completed", value: 2 },
        ],
        onFilter: (value, record) => record.status.toString().includes(String(value)),
        defaultFilteredValue: ["1", "3"],
        sorter: (a, b) => a.status - b.status,
        width: "12.5%",
        align: "center" as const,
    },
];

export const getNumRows = (
    screenSize: { width: number; height: number },
    pageOptions: Array<number>
): number => {
    const sHeight = screenSize.height;
    const tableHeaderHeight = 38; // the height of the table header
    const tablePaginationHeight = 64; // the height of the table pagination
    const mainHeaderHeight = 64;
    const mainMarginHeight = 80;
    const starredProjectsHeight = 52.675 + 198.3;
    const subHeaderHeight = 72.675;
    const footerHeight = 22;
    const tableHeight =
        sHeight -
        tableHeaderHeight -
        tablePaginationHeight -
        mainHeaderHeight -
        mainMarginHeight -
        starredProjectsHeight -
        subHeaderHeight -
        footerHeight;
    const tableRowHeight = 60.8;
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
