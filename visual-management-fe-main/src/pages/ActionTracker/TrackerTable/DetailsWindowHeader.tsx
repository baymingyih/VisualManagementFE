import { ITeam } from '@/types/team'
import { getSelectedTeam, getTeams } from '../../../../redux/features/ui/uiSlice'

import { Button, Popconfirm, Popover, Select, message } from 'antd'
import styles from './DetailsWindow.module.css'

import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { useSelector } from 'react-redux'

import { useMutation } from '@tanstack/react-query'
import { escalateAction, deleteAction } from '@/pages/api/ActTrackAPI'
import { deleteProjectAction } from '@/pages/api/ProjMgmtAPI'
import { IAction } from '@/types/action'
import { DeleteOutlined, MinusCircleOutlined, RiseOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { useRouter } from 'next/router'

function DetailsWindowHeader({rowDetails, setRowDetails, updateTableData, tableData, setTableData, forProject} : {rowDetails: IAction, setRowDetails: Dispatch<SetStateAction<IAction>>, updateTableData: (data: IAction) => void, tableData: IAction[], setTableData: Dispatch<SetStateAction<IAction[]>>, forProject: boolean}) {

  const selectedTeam: ITeam | null = useSelector(getSelectedTeam)
  const teams: ITeam[] = useSelector(getTeams)

  const [escalateTeam, setEscalateTeam] = useState(null)

  const router = useRouter();
  const { projId } = router.query;

  const { mutate: raiseAction } = useMutation({
    mutationFn: (obj: {actionId: number, teamId: number}) => escalateAction(obj),
    onSuccess: ({data}) => {
      message.success('Action escalated successfully')
      updateTableData(data)
    }
  })

  const { mutate: removeAction } = useMutation({
    mutationFn: (obj: {actionId: number})=> deleteAction(obj),
    onSuccess: ({data}) => {
      const newData = tableData.filter(function (obj) {
        return obj.id !== data
      })
      setTableData(newData)
      message.success('Action deleted successfully')
      setRowDetails({} as IAction)
    }
  })

  const { mutate: removeProjectAction } = useMutation({
    mutationFn: (obj: {projectId: number, actionId: number})=> deleteProjectAction(obj),
    onSuccess: ({data}) => {
      const newData = tableData.filter(function (obj) {
        return obj.id !== data
      })
      setTableData(newData)
      message.success('Project action removed successfully')
      setRowDetails({} as IAction)
    }
  })

  const onConfirmDelete = () => {
    removeAction({
      actionId: rowDetails.id
    })
  }

  const onConfirmRemove = () => {
    removeProjectAction({
      projectId: Number(projId),
      actionId: rowDetails.id
    })
  }

  const onConfirmEscalate = () => {
    raiseAction({
      actionId: rowDetails.id,
      teamId: Number(escalateTeam)
    })
    setEscalateTeam(null)
    setRowDetails({
      ...rowDetails,
      escalatedto_team: {
        id: Number(escalateTeam),
        name: teams.find((x) => x.id === Number(escalateTeam))!.name
      }
    })
  }

  const getAvailableTeams = useCallback(() => {
    const t = _.filter(teams, (obj) => obj.id !== selectedTeam?.id)

    return t.map((o: ITeam) => {
      return { value: o.id, label: o.name }
    })
  }, [teams, selectedTeam?.id])

  const escalateMenu = (
    <div style={{ width: '200px' }}>
      <span className={styles.escalateTitle}>Escalate To</span>
      <Select
        style={{ width: '100%' }}
        options={getAvailableTeams()}
        placeholder={'Select Team'}
        value={escalateTeam}
        onChange={setEscalateTeam}
      />
      <div
        style={{ marginTop: '10px', justifyContent: 'center', display: 'flex' }}
      >
        <Popconfirm
          title='This action is not reversible. Escalate?'
          placement='bottom'  
          okText='Escalate'
          okButtonProps={{
            style: { background: 'darkorange', borderColor: 'darkorange' }
          }}
          onConfirm={onConfirmEscalate}
        >
          <Button
            type='primary'
            style={{ background: '#008080', borderColor: '#008080' }}
          >
            <RiseOutlined />
            Escalate
          </Button>
        </Popconfirm>
      </div>
    </div>
  )

  return (
    <>
      <div>
        {forProject && (
          <Popconfirm
          title='This action is not reversible. Remove from project?'
          placement='bottom'
          okText='Remove'
          okButtonProps={{ danger: true }}
          onConfirm={onConfirmRemove}
        >
          <Button type='text' style={{ color: 'darkorange' }}>
            <MinusCircleOutlined /> Remove
          </Button>
        </Popconfirm>
        )}
        <Popconfirm
          title='This action is not reversible and will also remove action from all linked projects. Delete action?'
          placement='bottom'
          okText='Delete'
          okButtonProps={{ danger: true }}
          onConfirm={onConfirmDelete}
        >
          <Button danger type='text'>
            <DeleteOutlined /> Delete
          </Button>
        </Popconfirm>
        {rowDetails.escalatedto_team === null && (
          <Popover
            content={escalateMenu}
            trigger='click'
            placement='bottom'
          >
            <Button type='text' style={{ color: '#008080' }}>
              <RiseOutlined />
              Escalate
            </Button>
          </Popover>
        )}
      </div>
    </>
  )
}

export default DetailsWindowHeader