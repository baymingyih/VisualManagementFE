import {
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import {
  Space,
  Button,
  Row,
  Col,
  Divider,
  Typography,
  Modal,
  message,
} from 'antd'
import type { InputRef } from 'antd'
import { useState, useEffect, useRef } from 'react'
import Table from 'antd/lib/table'
import styles from './TrackerTable.module.css'

const { Title } = Typography
const { confirm } = Modal;

import DetailsWindow from './DetailsWindow'

import { tableColumns, getNumRows } from '../../../utilities/trackerTable_utils'
import { useWindowSize } from '../../../utilities/utilities'
import eventBus from '@/utilities/EventBus'
import { ITeam } from '@/types/team'
import { getSelectedTeam, toggleCreateActionFormIsOpen } from '../../../../redux/features/ui/uiSlice'
import { useDispatch, useSelector } from 'react-redux'
import { completeMultipleActions, deleteMultipleActions, getActions } from '@/pages/api/ActTrackAPI'
import { useMutation, useQuery } from '@tanstack/react-query'
import { IAction } from '@/types/action'
import { FilterConfirmProps } from 'antd/lib/table/interface'

const TrackerTable = () => {
  const dispatch = useDispatch();

  const selectedTeam: ITeam | null = useSelector(getSelectedTeam)

  const [tableData, setTableData] = useState<IAction[]>([])
  const [rowDetails, setRowDetails] = useState<IAction>({} as IAction)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const searchInput = useRef<InputRef>(null);

  const screenSize = useWindowSize()

  const { refetch: fetchActions, isLoading } = useQuery({
    queryKey: ["actions_getActions", selectedTeam],
    queryFn: () => getActions(selectedTeam),
    onSuccess: ({ data }) => {
      setTableData(data)
    },
    onError: () => {
      console.log('Unable to fetch table data')
    },
    enabled: false
  })

  const { mutate: deleteMultActions } = useMutation({
    mutationFn: (obj: {actionIds: number[]})=> deleteMultipleActions(obj),
    onSuccess: ({data}) => {
      const actionIds = [...data]
      const newData = tableData.filter(function (obj) {
        return !actionIds.includes(obj.id)
      })
      setTableData(newData)
      message.success('Action(s) deleted successfully')
      if (actionIds.includes(rowDetails.id)) {
        setRowDetails({} as IAction)
      }
      setSelectedRowKeys([])
    }
  })

  const { mutate: completeMultActions } = useMutation({
    mutationFn: (obj: {actionIds: number[]})=> completeMultipleActions(obj),
    onSuccess: ({data}) => {
      const actionIds = [...data]
      const newData = tableData.map(function (obj) {
        if (actionIds.includes(obj.id)) {
          obj.status = 2
        }
        return obj
      })
      setTableData(newData)
      message.success('Action(s) updated successfully')
      if (actionIds.includes(rowDetails.id)) {
        setRowDetails(rowDetails => ({...rowDetails, status: 2}))
      }
      // setSelectedRowKeys([])
    }
  })

  useEffect(() => {
    eventBus.on('actionCreated', () => {
      fetchActions()
    })
  })

  useEffect(() => {
    if (selectedTeam) {
      setRowDetails({} as IAction)
    }
  }, [selectedTeam])

  useEffect(() => {
    // if (selectedTeam) {
    fetchActions()
    return
    // }
  }, [fetchActions, selectedTeam])

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: IAction[]
  ) => {
    // console.log(
    //   'selectedRowKeys:',
    //   newSelectedRowKeys,
    //   'selectedRows:',
    //   selectedRows
    // )
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }

  const getRowClassName = (record: IAction): string => {
    let selected = false

    if (rowDetails && record.key === rowDetails.key) {
      selected = true
    }

    if (selected) {
      return styles.selected
    } else {
      return ""
    }
  }

  const renderDetailsWindow = () => {
    if (JSON.stringify(rowDetails) !== '{}') {
      return (
        <div className={styles.detailsDrawerContainer}>
          <DetailsWindow
            tableData={tableData}
            setTableData={setTableData}
            rowDetails={rowDetails}
            setRowDetails={setRowDetails}
            forProject={false}
          />
        </div>
      )
    } else {
      return (
        <></>
      )
    }
  }

  const onCreateActionButtonEvent = () => {
    dispatch(toggleCreateActionFormIsOpen());
  }

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
  ) => {
    confirm();
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Are you sure you want to delete action(s)?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is not reversible and will also delete action(s) from all linked projects. Delete action(s)?',
      okText: 'Delete',
      okType: 'danger',
      onOk() {
        deleteMultActions({actionIds: selectedRowKeys as number[]})
      },
      onCancel() {
      },
    });
  };

  const completeActions = () => {
    completeMultActions({actionIds: selectedRowKeys as number[]})
  }

  return (
    <>
      <div style={{padding: "30px 0"}}>
        <Row justify='center'>
          <Col span={JSON.stringify(rowDetails) !== '{}' ? 15 : 24}>
            <Space
              direction="horizontal"
              style={{
                  width: "100%",
                  justifyContent: "space-between",
                  marginBottom: "30px"
              }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', margin: '6px 0' }}>
                  <Title level={2} style={{ margin: 0 }}>Action Tracker</Title>
                  <Button type="primary" onClick={onCreateActionButtonEvent}>
                    Create Action
                  </Button>
              </div>
              {selectedRowKeys.length > 0 &&
                <div style={{display: 'flex', alignItems: 'center', padding: '5px 0'}}>
                  <div style={{fontSize: '0.9rem'}}>{selectedRowKeys.length} selected action(s)</div>
                  <div className={styles.actionButtonGroup}>
                    <Button type='text' onClick={completeActions}><CheckOutlined />Complete</Button>
                    <Button type='text' onClick={showDeleteConfirm}><DeleteOutlined />Delete</Button>
                  </div>
                </div>
              }
            </Space>
            <Table
              rowSelection={{
                ...rowSelection
              }}
              size={'middle'}
              columns={tableColumns(tableData, searchInput, handleSearch, handleReset)}
              dataSource={tableData}
              pagination={{
                position: ['bottomCenter'],
                defaultPageSize: getNumRows(screenSize, [10, 20, 50, 100]),
                pageSizeOptions: [10, 20, 50, 100],
                showSizeChanger: true,
                responsive: true
              }}
              rowClassName={(record) => getRowClassName(record)}
              loading={!selectedTeam || isLoading}
              className={styles.tableHover}
              onRow={(record, rowIndex) => {
                return {
                  onClick: (event) => {
                    setRowDetails(record)
                  }
                }
              }}
            />
          </Col>
          <Col
            span={JSON.stringify(rowDetails) !== '{}' ? 1 : 0}
            style={{ textAlign: 'center' }}
          >
            <Divider type='vertical' style={{ height: '100%' }} />
          </Col>
          <Col span={JSON.stringify(rowDetails) !== '{}' ? 8 : 0}>
            {renderDetailsWindow()}
          </Col>
        </Row>
      </div>
    </>
  )
}

export default TrackerTable
