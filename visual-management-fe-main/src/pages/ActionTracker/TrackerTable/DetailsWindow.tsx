import { RiseOutlined, SwapRightOutlined } from '@ant-design/icons'
import {
  Select,
  DatePicker,
  Drawer,
  Space,
  Button,
  Spin,
  Radio,
  Input,
  SelectProps,
  Tag,
  Divider,
  Form,
  Typography,
} from 'antd'
const { TextArea } = Input
import type { DatePickerProps, InputRef } from 'antd'
import type { RadioChangeEvent } from 'antd'
import styles from './DetailsWindow.module.css'
import moment from 'moment'
import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react'
import _ from 'lodash'
import { useQuery, useMutation } from "@tanstack/react-query"

import { customDateFormat, getAvatarLabel } from '@/utilities/formatters'
import { ITeam, ITeamMemberFull, ITeamMembers } from '@/types/team'
import { useSelector } from 'react-redux'
import { getSelectedTeam } from '../../../../redux/features/ui/uiSlice'

import { getMembers, updateAction, updatePIC } from '@/pages/api/ActTrackAPI'
import { IAction } from '@/types/action'
import Link from 'next/link'

import DetailsWindowHeader from './DetailsWindowHeader'
import { createUser } from '@/pages/api/AdminAPI'
import { IUser } from '@/types/user'
import { addMemberById } from '@/pages/api/TeamAPI'
import { getPriorityLabel, useWindowSize } from '@/utilities/utilities'

const priorityDropdownValues = [
  {
    value: "3",
    label: <div style={{ display: 'flex', alignItems: 'center' }}>{getPriorityLabel(3, 8)} High</div>
  },
  {
    value: "2",
    label: <div style={{ display: 'flex', alignItems: 'center' }}>{getPriorityLabel(2, 8)} Medium</div>
  },
  {
    value: "1",
    label: <div style={{ display: 'flex', alignItems: 'center' }}>{getPriorityLabel(1, 8)} Low</div>
  }
]

function DetailsWindow({
  tableData,
  setTableData,
  rowDetails,
  setRowDetails,
  forProject
}: { tableData: IAction[], setTableData: Dispatch<SetStateAction<IAction[]>>, rowDetails: IAction, setRowDetails: Dispatch<SetStateAction<IAction>>, forProject: boolean }) {
  const selectedTeam: ITeam | null = useSelector(getSelectedTeam)

  const [statusValue, setStatusValue] = useState(-1)
  const [priorityValue, setPriorityValue] = useState('')
  const [assigneeValue, setAssigneeValue] = useState<string | undefined>('')
  const [deadlineValue, setDeadlineValue] = useState('')
  const [descriptionValue, setDescriptionValue] = useState('')
  const [titleValue, setTitleValue] = useState('')
  const [open, setOpen] = useState(false)
  const [updating, setUpdating] = useState('')
  const [assigneeValues, setAssigneeValues] = useState<SelectProps['options']>([])
  const [name, setName] = useState(''); // for adding external user
  const inputRef = useRef<InputRef>(null); // for adding external user

  const [loading, setLoading] = useState(false)

  const screenSize = useWindowSize()

  const [externalUserForm] = Form.useForm();

  const { refetch: fetchMembers } = useQuery({
    queryKey: ["teams_getMembers", selectedTeam],
    queryFn: () => getMembers(selectedTeam),
    onSuccess: ({ data }: { data: Array<ITeamMembers> }) => {
      const assignees: SelectProps['options'] = []
      data.forEach((obj) => {
        if (obj.users.active) {
          assignees.push({
            value: String(obj.userId),
            label:
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '80%' }}>
                  {getAvatarLabel(obj.users.firstName + ' ' + obj.users.lastName, obj.avatar_color, 20, 5, null, 5)}
                  <Typography.Text style={{ width: '90%' }} ellipsis={true}>{obj.users.firstName + ' ' + obj.users.lastName}</Typography.Text>
                </div>
                {obj.users.external === 1 && <Tag>Ext</Tag>}
              </div>
          })
        }
      })
      setAssigneeValues(assignees)
    },
    enabled: false
  })

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open, fetchMembers])

  useEffect(() => {
    setTitleValue(rowDetails.title)
    setStatusValue(rowDetails.status)
    setPriorityValue(String(rowDetails.priority))
    setAssigneeValue(rowDetails.userId != -1 ? String(rowDetails.userId) : undefined)
    setDeadlineValue(rowDetails.deadlineDateTime)
    setDescriptionValue(String(rowDetails.description))
    if (JSON.stringify(rowDetails) !== '{}') {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [rowDetails])

  const updateTableData = (data: IAction) => {
    const newData = [...tableData]
    const actionObjIdx = newData.findIndex((obj) => obj.id == data.id)
    newData[actionObjIdx] = data
    setTableData(newData)
  }

  const { mutate: editAction } = useMutation({
    mutationFn: (obj: { actionId: number, title?: string, description?: string, priority?: number, status?: number, deadline?: string, completedDate?: string | undefined }) => updateAction(obj),
    onSuccess: ({ data }) => {
      setLoading(false)
      updateTableData(data)
    }
  })

  const { mutate: editAssignee } = useMutation({
    mutationFn: (obj: { actionId: number, userId: number }) => updatePIC(obj),
    onSuccess: ({ data }) => {
      setLoading(false)
      updateTableData(data)
    }
  })

  const { isLoading: addExtUserLoading, mutate: addExtUser, } = useMutation({
    mutationKey: ["user_addExtUser"],
    mutationFn: (obj: { firstName: string, lastName: string, email: string, organisationId: number, orgAdmin: number, external: number }) => createUser(obj),
    onSuccess: ({ data }: { data: IUser }) => {
      addTeamMember({
        teamId: selectedTeam?.id,
        userId: data.id,
        role: 2
      })
    }
  })

  const { isLoading: addTeamMemberLoading, mutate: addTeamMember, } = useMutation({
    mutationKey: ["team_addTeamMember"],
    mutationFn: (obj: { teamId: number, userId: number, role: number }) => addMemberById(obj),
    onSuccess: ({ data }: { data: ITeamMemberFull }) => {
      setAssigneeValues([...assigneeValues!,
      {
        value: String(data.userId),
        label:
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '80%' }}>
              {getAvatarLabel(data.firstName + ' ' + data.lastName, data.avatar_color, 20, 5, null, 5)}
              <Typography.Text style={{ width: '90%' }} ellipsis={true}>{data.firstName + ' ' + data.lastName}</Typography.Text>
            </div>
            <Tag>Ext</Tag>
          </div>
      }])
      externalUserForm.resetFields()
    }
  })

  const onStatusChange = ({ target: { value } }: RadioChangeEvent) => {
    setUpdating('status')
    setLoading(true)
    setStatusValue(value)
    if (value === 1 || value === 3) {
      editAction({
        actionId: rowDetails.id,
        status: Number(value),
        completedDate: undefined
      })
    } else if (value === 2) {
      editAction({
        actionId: rowDetails.id,
        status: Number(value),
        completedDate: moment(new Date()).format()
      })
    }
  }

  const onPriorityChange = (newValue: string) => {
    setUpdating('priority')
    setLoading(true)
    setPriorityValue(newValue)
    editAction({
      actionId: rowDetails.id,
      priority: Number(newValue)
    })
  }

  const onAssigneeChange = (newValue: string) => {
    setUpdating('assignee')
    setLoading(true)
    setAssigneeValue(newValue)
    editAssignee({
      actionId: rowDetails.id,
      userId: Number(newValue)
    })
  }

  const onDeadlineChange: DatePickerProps['onChange'] = (date, dateString) => {
    setUpdating('deadline')
    setLoading(true)
    setDeadlineValue(dateString)
    editAction({
      actionId: rowDetails.id,
      deadline: moment(dateString, 'DD-MMM-YYYY').format('YYYY-MM-DD')
    })
  }

  const onDescriptionChange = () => {
    setUpdating('description')
    setLoading(true)
    editAction({
      actionId: rowDetails.id,
      description: descriptionValue
    })
  }

  const onTitleChange = () => {
    setUpdating('title')
    setLoading(true)
    editAction({
      actionId: rowDetails.id,
      title: titleValue
    })
  }

  const closeActionDetails = () => {
    setRowDetails({} as IAction)
  }

  const renderLinkedProjects = () => {
    if (forProject !== true) {
      const projects: JSX.Element[] = []
      if (rowDetails.project_action_list.length === 0) {
        return (
          <></>
        )
      } else {
        rowDetails.project_action_list.map((project) => {
          projects.push(
            <Link key={project.projectId} href={`/ProjectMgmt/${project.projectId}`}>
              <Tag color='#804000'>T{selectedTeam?.id}-P{project.projectId} | {project.projectTitle}</Tag>
            </Link>
          )
        })
        return (
          <div style={{ margin: '0 10px' }}>
            <div className={styles.detailsSubTitle}>Linked Projects</div>
            {projects}
          </div>
        )
      }
    } else {
      return (
        <></>
      )
    }
  }

  const addExternalUser = () => {
    const extUsr = externalUserForm.getFieldValue('externalName')
    const spaceIdx = extUsr.indexOf(' ')
    addExtUser({
      firstName: spaceIdx !== -1 ? extUsr.substring(0, extUsr.indexOf(' ')) : extUsr,
      lastName: spaceIdx !== -1 ? extUsr.substring(extUsr.indexOf(' ') + 1) : '',
      email: "",
      organisationId: 1,
      orgAdmin: 0,
      external: 1
    })
  }

  return (
    <Drawer
      closable={true}
      open={open}
      getContainer={forProject ? "" : false}
      size={'large'}
      width={!forProject ? '100%' : undefined}
      mask={forProject ? true : false}
      style={forProject ? {} : { height: '100%' }}
      onClose={closeActionDetails}
      title={<DetailsWindowHeader
        rowDetails={rowDetails}
        setRowDetails={setRowDetails}
        updateTableData={updateTableData}
        tableData={tableData}
        setTableData={setTableData}
        forProject={forProject}
      />}
    >
      <Space direction='vertical' size='middle' style={{ width: '100%', marginBottom: '10px' }}>
        <div>
          <div className={styles.detailsHeader}>
            <span className={styles.detailsID}>
              Action / T{selectedTeam?.id}-A{rowDetails.id}
            </span>
          </div>
          <div className={styles.detailsTitle} style={{ margin: '0 10px' }}>
            <TextArea
              bordered={false}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={(e) => onTitleChange()}
              autoSize
              className={styles.detailsTitle}
            />
          </div>
        </div>
        <div style={{ margin: '0 10px' }}>
          <div className={styles.detailsSubTitle}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <Radio.Group
              onChange={onStatusChange}
              value={statusValue}
              optionType='button'
              buttonStyle='solid'
            >
              <Radio.Button style={{ textAlign: 'center' }} value={3}>Pending</Radio.Button>
              <Radio.Button style={{ textAlign: 'center' }} value={1}>In Progress</Radio.Button>
              <Radio.Button style={{ textAlign: 'center' }} value={2}>Completed</Radio.Button>
            </Radio.Group>
            <Spin
              spinning={updating === 'status' && loading}
              size='small'
              className={styles.loadingLogo}
            />
          </div>
          <div>
            {rowDetails.escalatedfrom_team !== null &&
              rowDetails.escalatedfrom_team !== undefined && (
                <Tag color="#008080">
                  <div>
                    <SwapRightOutlined /> Escalated from{' '}
                    {rowDetails.escalatedfrom_team.name}
                  </div>
                </Tag>
              )}
            {rowDetails.escalatedto_team !== null &&
              rowDetails.escalatedto_team !== undefined && (
                <Tag color="#008080">
                  <div>
                    <RiseOutlined /> Escalated to{' '}
                    {rowDetails.escalatedto_team.name}
                  </div>
                </Tag>
              )}
          </div>
        </div>
        <div style={{ margin: '0 10px' }}>
          <div className={styles.detailsSubTitle}>Description</div>
          <TextArea
            bordered={false}
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            onBlur={(e) => onDescriptionChange()}
            placeholder='No description provided'
            autoSize
            className={styles.descriptionStyle}
          />
        </div>
        <div style={{ margin: '0 10px' }}>
          <div className={styles.detailsSubTitle}>Assignee</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={assigneeValue !== undefined ? String(assigneeValue) : undefined}
              style={forProject ? { width: '50%' } : { width: '70%' }}
              options={assigneeValues}
              onChange={onAssigneeChange}
              placeholder='Select assignee'
              listHeight={160}
              dropdownRender={menu => (
                <>
                  {menu}
                  <Divider style={{ marginTop: '5px', marginBottom: '0' }} />
                  <Space direction="vertical" style={{ padding: '10px 14px', width: '100%' }}>
                    <div className={styles.selectMenuTitle}>Add External User</div>
                    <Form style={{ display: 'flex' }} form={externalUserForm} onFinish={addExternalUser}>
                      <Form.Item name="externalName" style={{ marginBottom: 0, marginRight: '8px', width: '100%' }}>
                        <Input
                          placeholder="John Doe"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item style={{ margin: '0px' }}>
                        <Button htmlType="submit">
                          Add
                        </Button>
                      </Form.Item>
                    </Form>
                  </Space>
                </>
              )}
            />
            <Spin
              spinning={updating === 'assignee' && loading}
              size='small'
              className={styles.loadingLogo}
            />
          </div>
        </div>
        <div style={{ margin: '0 10px' }}>
          <div className={styles.detailsSubTitle}>Due Date</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DatePicker
              value={moment(deadlineValue)}
              style={{ width: '50%' }}
              format={customDateFormat}
              onChange={onDeadlineChange}
              allowClear={false}
            />
            <Spin
              spinning={updating === 'deadline' && loading}
              size='small'
              className={styles.loadingLogo}
            />
          </div>
        </div>
        <div style={{ margin: '0 10px' }}>
          <div className={styles.detailsSubTitle}>Priority</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={priorityValue}
              style={{ width: '50%' }}
              options={priorityDropdownValues}
              onChange={onPriorityChange}
            />
            <Spin
              spinning={updating === 'priority' && loading}
              size='small'
              className={styles.loadingLogo}
            />
          </div>
        </div>
        <>{renderLinkedProjects()}</>
      </Space>
    </Drawer>
  )
}

export default DetailsWindow