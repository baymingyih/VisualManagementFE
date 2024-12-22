import { useState, useEffect } from "react";
import styles from './ProjDetails.module.css'

import { useRouter } from 'next/router';
import { useQuery, useMutation } from "@tanstack/react-query";
import moment from 'moment'

import { getProjectById, updateProject, deleteProject, getProjectMembers, addProjectMember, deleteProjectMember } from "@/pages/api/ProjMgmtAPI";
import { getMembers } from "@/pages/api/ActTrackAPI";

import { Row, Col, Divider, Input, Space, DatePicker, Select, Button, Popconfirm, Modal, message, Typography, Tag, Form } from "antd";
const { TextArea } = Input

import { ITeam, ITeamMemberFull, ITeamMembers } from '@/types/team'
import { useSelector } from 'react-redux'
import { getSelectedTeam } from '../../../../redux/features/ui/uiSlice'
import { IFullProject } from "@/types/project";
import type { DatePickerProps, SelectProps } from 'antd';

import { getAvatarLabel, customDateFormat } from "@/utilities/formatters";

import ProjectActionsTable from "./ProjectActionsTable";
import ChangeModule from "./ChangeModule";
import ProjectMetrics from "./ProjectMetrics";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { IUser } from "@/types/user";
import { createUser } from "@/pages/api/AdminAPI";
import { addMemberById } from "@/pages/api/TeamAPI";
import { getStatusLabel } from "@/utilities/utilities";

const statusOptions = [
  {
    value: '1',
    label: <div style={{ display: 'flex', alignItems: 'center' }}>{getStatusLabel(1)}</div>
  },
  {
    value: '2',
    label: <div style={{ display: 'flex', alignItems: 'center' }}>{getStatusLabel(2)}</div>
  },
  {
    value: '3',
    label: <div style={{ display: 'flex', alignItems: 'center' }}>{getStatusLabel(3)}</div>
  }
]

function ProjDetails(): React.ReactElement {
  const [projectData, setProjectData] = useState<IFullProject>({} as IFullProject)
  const selectedTeam: ITeam | null = useSelector(getSelectedTeam)

  const [changeFlag, setChangeFlag] = useState<boolean | null>()
  const [title, setTitle] = useState("")
  const [problem, setProblem] = useState("")
  const [goal, setGoal] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [results, setResults] = useState("")
  const [startDate, setStartDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [owner, setOwner] = useState("")
  const [teamMembers, setTeamMembers] = useState<SelectProps['options']>([])
  const [status, setStatus] = useState("")
  const [projMembers, setProjMembers] = useState<string[]>([])

  const router = useRouter();
  const { projId } = router.query;

  const [externalUserForm1] = Form.useForm();
  const [externalUserForm2] = Form.useForm();

  const { refetch: fetchMembers } = useQuery({
    queryKey: ["teams_getMembers", selectedTeam],
    queryFn: () => getMembers(selectedTeam),
    onSuccess: ({ data }: { data: Array<ITeamMembers> }) => {
      const members: SelectProps['options'] = []
      data.forEach((obj) => {
        if (obj.users.active) {
          members.push({
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
      setTeamMembers(members)
    },
    onError: () => {
      console.log('Unable to fetch team members data')
    },
    enabled: false
  })

  const { refetch: fetchProjectById } = useQuery({
    queryKey: ["projects_getProjectById", projId],
    queryFn: () => getProjectById(Number(projId)),
    onSuccess: ({ data }) => {
      setProjectData(data)
    },
    onError: () => {
      console.log('Unable to fetch project details data')
    },
    enabled: false
  })

  const { refetch: fetchProjectMembers } = useQuery({
    queryKey: ["projects_getProjectMembers", projId],
    queryFn: () => getProjectMembers(Number(projId)),
    onSuccess: ({ data }: { data: Array<{ id: number, firstName: string, lastName: string }> }) => {
      const proj_members: string[] = []
      data.forEach((obj) => {
        proj_members.push(String(obj.id))
      })
      setProjMembers(proj_members);
    },
    onError: () => {
      console.log('Unable to fetch project members data')
    },
    enabled: false
  })

  useEffect(() => {
    fetchProjectById()
  }, [fetchProjectById])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    fetchProjectMembers()
  }, [fetchProjectMembers])

  useEffect(() => {
    setTitle(projectData.title)
    setProblem(projectData.problem)
    setGoal(projectData.goal)
    setAnalysis(projectData.analysis)
    setResults(projectData.results)
    setStartDate(projectData.startDateTime)
    setDueDate(projectData.dueDateTime)
    setOwner(String(projectData.ownerId))
    setStatus(String(projectData.status))
  }, [projectData])

  const { mutate: editProject } = useMutation({
    mutationFn: (obj: { projectId: number, title?: string, problem?: string, goal?: string, analysis?: string, results?: string, status?: number, startDate?: string, dueDate?: string, completedDate?: string | undefined, ownerId?: number }) => updateProject(obj),
    onSuccess: ({ data }) => {
      setProjectData(data)
      setChangeFlag(false)
    }
  })

  const { mutate: removeProject } = useMutation({
    mutationFn: (projectId: number) => deleteProject(projectId),
    onSuccess: ({ data }) => {
      router.push('/ProjectMgmt')
      message.success('Project deleted successfully')
    }
  })

  const { mutate: addMember } = useMutation({
    mutationFn: (obj: { projectId: number, userId: number }) => addProjectMember(obj)
  })

  const { mutate: deleteMember } = useMutation({
    mutationFn: (obj: { projectId: number, userId: number }) => deleteProjectMember(obj)
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
      setTeamMembers([...teamMembers!,
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
      externalUserForm1.resetFields()
      externalUserForm2.resetFields()
    }
  })

  const onTitleChange = () => {
    editProject({
      projectId: Number(projId),
      title: title
    })
  }

  const onProblemChange = () => {
    editProject({
      projectId: Number(projId),
      problem: problem
    })
  }

  const onGoalChange = () => {
    editProject({
      projectId: Number(projId),
      goal: goal
    })
  }

  const onAnalysisChange = () => {
    editProject({
      projectId: Number(projId),
      analysis: analysis
    })
  }

  const onResultsChange = () => {
    editProject({
      projectId: Number(projId),
      results: results
    })
  }

  const onStatusChange = (newValue: string) => {
    setChangeFlag(true)
    setStatus(newValue)
    if (newValue === '1' || newValue === '2') {
      editProject({
        projectId: Number(projId),
        status: Number(newValue),
        completedDate: undefined
      })
    } else if (newValue === '3') {
      editProject({
        projectId: Number(projId),
        status: Number(newValue),
        completedDate: moment(new Date()).format()
      })
    }
  }

  const onStartDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setChangeFlag(true)
    setStartDate(dateString)
    editProject({
      projectId: Number(projId),
      startDate: moment(dateString, 'DD-MMM-YYYY').format('YYYY-MM-DD')
    })
    if (moment(dueDate) < moment(dateString)) {
      setDueDate(dateString)
      editProject({
        projectId: Number(projId),
        dueDate: moment(dateString, 'DD-MMM-YYYY').format('YYYY-MM-DD')
      })
    }
  }

  const onDueDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setChangeFlag(true)
    setDueDate(dateString)
    editProject({
      projectId: Number(projId),
      dueDate: moment(dateString, 'DD-MMM-YYYY').format('YYYY-MM-DD')
    })
  }

  const onOwnerChange = (newValue: string) => {
    setChangeFlag(true)
    setOwner(newValue)
    editProject({
      projectId: Number(projId),
      ownerId: Number(newValue)
    })
  }

  const onMembersChange = (newValues: string[]) => {
    setChangeFlag(true)
    newValues.forEach((uid) => {
      if (projMembers.indexOf(uid) === -1) {
        addMember({
          projectId: Number(projId),
          userId: Number(uid)
        })
      }
    })
    projMembers.forEach((uid) => {
      if (newValues.indexOf(uid) === -1) {
        deleteMember({
          projectId: Number(projId),
          userId: Number(uid)
        })
      }
    })
    setProjMembers(newValues)
    setChangeFlag(false)
  }

  const teamMembersForOwner = teamMembers?.filter(member => !projMembers.includes(member.value as string))
  const teamMembersWithoutOwner = teamMembers?.filter(member => member.value !== owner)

  const { confirm } = Modal;

  const showDeleteConfirm = () => {
    confirm({
      title: 'Delete Project',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is permanent and will delete this project and all its related data.',
      okText: 'Delete',
      okType: 'danger',
      okButtonProps: { type: 'primary' },
      cancelText: 'Cancel',
      maskClosable: true,
      onOk() {
        removeProject(Number(projId));
      }
    });
  };

  const disabledDate = (current: moment.Moment) => {
    return current && current < moment(startDate);
  };

  const addExternalUser1 = () => {
    const extUsr = externalUserForm1.getFieldValue('externalName')
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

  const addExternalUser2 = () => {
    const extUsr = externalUserForm2.getFieldValue('externalName')
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
    <>
      <Row style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div className={styles.project_code}>
          <span>Project Board / T{selectedTeam?.id}-P{projectData.id}</span>
          <span><ChangeModule changeFlag={changeFlag} /></span>
        </div>
        <Button onClick={showDeleteConfirm}>
          <DeleteOutlined /> Delete Project
        </Button>
      </Row>
      <Row justify='center' style={{ marginBottom: '30px' }}>
        <Col span={10}>
          <Row>
            <Col span={20} style={{ paddingRight: 15 }}>
              <TextArea
                bordered={false}
                value={title}
                onChange={(e) => {
                  setChangeFlag(true);
                  setTitle(e.target.value)
                }}
                onBlur={(e) => onTitleChange()}
                autoSize
                className={styles.title}
              />
            </Col>
            <Col span={4}>
              <div className={styles.subtitle}>Status</div>
              <div style={{ marginBottom: 5 }}>
                <Select
                  bordered={false}
                  value={status}
                  style={{ width: '100%' }}
                  options={statusOptions}
                  onChange={onStatusChange}
                  placeholder='Select status'
                  size='small'
                />
              </div>
            </Col>
          </Row>
          <Space direction="vertical" size='middle' style={{ width: '100%' }}>
            <div>
              <div className={styles.subtitle}>Problem</div>
              <div>
                <TextArea
                  style={{ minHeight: '74px', lineHeight: '22px' }}
                  bordered={false}
                  value={problem}
                  onChange={(e) => {
                    setChangeFlag(true)
                    setProblem(e.target.value)
                  }}
                  onBlur={(e) => onProblemChange()}
                  autoSize
                  placeholder="No problem provided"
                  className={styles.text}
                />
              </div>
            </div>
            <div>
              <div className={styles.subtitle}>Goal</div>
              <div>
                <TextArea
                  style={{ minHeight: '74px', lineHeight: '22px' }}
                  bordered={false}
                  value={goal}
                  onChange={(e) => {
                    setChangeFlag(true);
                    setGoal(e.target.value)
                  }}
                  onBlur={(e) => onGoalChange()}
                  autoSize
                  placeholder="No goal provided"
                  className={styles.text}
                  rows={3}
                />
              </div>
            </div>
            <div>
              <div className={styles.subtitle}>Analysis</div>
              <div>
                <TextArea
                  style={{ minHeight: '74px', lineHeight: '22px' }}
                  bordered={false}
                  value={analysis}
                  onChange={(e) => {
                    setChangeFlag(true);
                    setAnalysis(e.target.value)
                  }}
                  onBlur={(e) => onAnalysisChange()}
                  placeholder="No analysis provided"
                  autoSize
                  className={styles.text}
                />
              </div>
            </div>
            <Row>
              <Col span={11}>
                <>
                  <div className={styles.subtitle}>Start Date</div>
                  <div>
                    <DatePicker
                      value={moment(startDate)}
                      style={{ width: '100%' }}
                      format={customDateFormat}
                      onChange={onStartDateChange}
                      allowClear={false}
                    />
                  </div>
                </>
              </Col>
              <Col span={2}></Col>
              <Col span={11}>
                <>
                  <div className={styles.subtitle}>Due Date</div>
                  <div>
                    <DatePicker
                      value={moment(dueDate)}
                      style={{ width: '100%' }}
                      format={customDateFormat}
                      onChange={onDueDateChange}
                      allowClear={false}
                      disabledDate={disabledDate}
                    />
                  </div>
                </>
              </Col>
            </Row>
            <div>
              <div className={styles.subtitle}>Owner</div>
              <div>
                <Select
                  value={owner !== 'null' ? String(owner) : undefined}
                  style={{ width: '46%' }}
                  options={teamMembersForOwner}
                  onChange={onOwnerChange}
                  placeholder='Select owner'
                  listHeight={160}
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <Divider style={{ marginTop: '5px', marginBottom: '0' }} />
                      <Space direction="vertical" style={{ padding: '10px 14px', width: '100%' }}>
                        <div className={styles.selectMenuTitle}>Add External User</div>
                        <Form style={{ display: 'flex' }} form={externalUserForm1} onFinish={addExternalUser1}>
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
              </div>
            </div>
            <div>
              <div className={styles.subtitle}>Members</div>
              <div>
                <Select
                  mode="multiple"
                  value={projMembers}
                  style={{ width: '100%' }}
                  options={teamMembersWithoutOwner}
                  onChange={onMembersChange}
                  placeholder='Select project members'
                  listHeight={160}
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <Divider style={{ marginTop: '5px', marginBottom: '0' }} />
                      <Space direction="vertical" style={{ padding: '10px 14px', width: '100%' }}>
                        <div className={styles.selectMenuTitle}>Add External User</div>
                        <Form style={{ display: 'flex' }} form={externalUserForm2} onFinish={addExternalUser2}>
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
                  tagRender={(props) => (
                    <div style={{ width: '185px', margin: '5px', marginRight: '10px' }}>
                      {props.label}
                    </div>
                  )}
                />
              </div>
            </div>
          </Space>
        </Col>
        <Col span={1} style={{ textAlign: 'center' }}>
          <Divider type="vertical" style={{ height: '100%' }} />
        </Col>
        <Col span={13}>
          <Space direction="vertical" size='middle' style={{ width: '100%' }}>
            <div>
              <ProjectActionsTable />
            </div>
            <div>
              <div className={styles.subtitle}>Results</div>
              <TextArea
                style={{ minHeight: '74px', lineHeight: '22px' }}
                bordered={false}
                value={results}
                onChange={(e) => {
                  setChangeFlag(true);
                  setResults(e.target.value)
                }}
                onBlur={(e) => onResultsChange()}
                autoSize
                className={styles.text}
              />
            </div>
            <div>
              <div className={styles.subtitle}>Tracked Metrics</div>
              <ProjectMetrics />
            </div>
          </Space>
        </Col>
      </Row>
    </>
  )
}

export default ProjDetails