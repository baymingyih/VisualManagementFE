import { useState, useEffect } from "react";
import styles from './projectActionsTable.module.css'
import stylesExtra from './ProjDetails.module.css'

import { useRouter } from 'next/router';
import { useQuery } from "@tanstack/react-query";
import { getProjectActions } from "@/pages/api/ProjMgmtAPI";

import { IAction } from "@/types/action";

import { Table, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { tableColumns } from "../../../utilities/projectActionsTable_utils";

import AddActionDrawer from "./AddActionDrawer";
import DetailsWindow from "@/pages/ActionTracker/TrackerTable/DetailsWindow";

function ProjectActionsTable() {

  const [drawerOpen, setDrawerOpen] = useState(false)

  const [projActions, setProjActions] = useState<IAction[]>([])

  const [projRowDetails, setProjRowDetails] = useState<IAction>({} as IAction)

  const router = useRouter();
  const { projId } = router.query;

  const { refetch: fetchProjectActions, isLoading } = useQuery({
    queryKey: ["projects_getProjectActions", projId],
    queryFn: () => getProjectActions(Number(projId)),
    onSuccess: ({ data }) => {
      setProjActions(data)
    },
    onError: () => {
      console.log('Unable to fetch project actions data')
    },
    enabled: false
  })

  useEffect(() => {
    fetchProjectActions()
  }, [fetchProjectActions])

  return (
    <>
      <div className={stylesExtra.subtitle}>Project Actions</div>
      <div style={{ marginTop: '10px' }}>
        <Table
          // rowSelection={{
          //   ...rowSelection
          // }}
          size={'small'}
          columns={tableColumns(projActions)}
          dataSource={projActions}
          pagination={false}
          loading={isLoading}
          className={styles.tableHover}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setProjRowDetails(record)
              }
            }
          }}
          scroll={{ y: 180 }}
          summary={() => (
            <Table.Summary fixed='top'>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <Button
                    size='small'
                    icon={<PlusOutlined />}
                    type='text'
                    style={{ width: '100%', height: '100%' }}
                    onClick={() => setDrawerOpen(true)}
                  >Add Action</Button>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>
      <AddActionDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        projActions={projActions}
        setProjActions={setProjActions}
      />
      <DetailsWindow
        tableData={projActions}
        setTableData={setProjActions}
        rowDetails={projRowDetails}
        setRowDetails={setProjRowDetails}
        forProject={true}
      />
    </>
  )
}

export default ProjectActionsTable