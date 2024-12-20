import { useState, useEffect, useRef } from 'react'

import { Button, Card, Empty, InputRef, Space, Table } from 'antd';

import styles from './ProjDashboard.module.css'

import { ITeam } from '@/types/team'
import { IGeneralProject } from '@/types/project';
import { getSelectedTeam } from '../../../../redux/features/ui/uiSlice'
import { useSelector } from 'react-redux'

import { useQuery, useMutation } from '@tanstack/react-query'
import { getProjects, updateProject } from '@/pages/api/ProjMgmtAPI'

import ProjectCard from './ProjectCard';
import { tableColumns, getNumRows } from '../../../utilities/projectTable_utils'
import { useWindowSize } from '../../../utilities/utilities'

import { useRouter } from 'next/router';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';

import CreateProjectDrawer from './CreateProjectDrawer';
import { FilterConfirmProps } from 'antd/lib/table/interface';

const ProjDashboard = () => {
  const dispatch = useDispatch()
  const router = useRouter();

  const [projectsData, setProjectsData] = useState<IGeneralProject[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  const selectedTeam: ITeam | null = useSelector(getSelectedTeam)
  const screenSize = useWindowSize()

  const searchInput = useRef<InputRef>(null);

  const { refetch: fetchProjects, isLoading } = useQuery({
    queryKey: ["projects_getProjects", selectedTeam],
    queryFn: () => getProjects(selectedTeam),
    onSuccess: ({ data }) => {
      setProjectsData(data)
    },
    onError: () => {
      console.log('Unable to fetch projects data')
    },
    enabled: false
  })

  const { mutate: editStarred } = useMutation({
    mutationFn: (obj: { projectId: number, starred: number }) => updateProject(obj),
    onSuccess: ({ data }) => {
      updateProjectData(data)
    }
  })

  useEffect(() => {
    if (selectedTeam) {
      fetchProjects()
      return
    }
  }, [fetchProjects, selectedTeam])

  const displayStarredProjects = () => {
    const projCards: JSX.Element[] = []
    if (projectsData.length !== 0) {
      projectsData.map((project) => {
        if (project.starred) {
          projCards.push(<ProjectCard key={project.id} projectDetails={project} editStarred={editStarred} />)
        }
      })
    }

    if (projCards.length === 0 || projectsData.length === 0) {
      return (
        <div style={{ overflow: 'hidden', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', alignItems: 'center', width: '100%', height: '210px', overflowX: 'scroll', padding: '10px 10px 20px 10px' }}>
          <Card style={{ width: '100%', height: '162px' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              // imageStyle={{height: 38}}
              description={'No starred projects'}
              style={{ width: '100%' }}
            />
          </Card>
        </div>
      )
    } else {
      return (
        <>
          <div style={{ overflow: 'hidden' }}>
            <Space style={{ width: '100%', height: '210px', overflowX: 'scroll', padding: '10px 10px 20px 10px' }}>
              {projCards}
            </Space>
          </div>
        </>
      )
    }
  }

  const onCreateProjectClicked = () => {
    setDrawerOpen(true);
  }

  const updateProjectData = (data: IGeneralProject) => {
    const newData = [...projectsData]
    const projectObjIdx = newData.findIndex((obj) => obj.id == data.id)
    newData[projectObjIdx] = data
    setProjectsData(newData)
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

  return (
    <>
      <div className={styles.title}>
        Starred Projects
      </div>
      <div>
        {displayStarredProjects()}
      </div>
      <div className={styles.subtitle}>
        <div style={{
          fontSize: '1.3rem',
          fontWeight: 600,
          margin: '30px 0px 20px 0px',
          color: '#545454'
        }}>
          Current Projects
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateProjectClicked}>Create Project</Button>
      </div>
      <Table
        columns={tableColumns(projectsData, editStarred, searchInput, handleSearch, handleReset)}
        dataSource={projectsData}
        pagination={{
          position: ['bottomCenter'],
          defaultPageSize: getNumRows(screenSize, [5, 10, 20]),
          pageSizeOptions: [5, 10, 20],
          showSizeChanger: true,
        }}
        size={'middle'}
        loading={!selectedTeam || isLoading}
        className={styles.tableHover}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              router.push(`/ProjectMgmt/${record.id}`)
            }
          }
        }}
      />
      <CreateProjectDrawer 
        drawerOpen={drawerOpen} 
        setDrawerOpen={setDrawerOpen} 
        projectsData={projectsData} 
        setProjectsData={setProjectsData} 
      />
    </>
  )
}

export default ProjDashboard