import React, { useEffect, useState } from 'react'
import { Button, Drawer, List } from 'antd'
import FormDrawerSection from './FormDrawerSection'
import {
  CheckCircleOutlined,
  FileImageOutlined,
  FileTextOutlined,
  LinkOutlined,
  NumberOutlined,
  PercentageOutlined,
  PlusCircleOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useDispatch, useSelector } from 'react-redux'
import {
  getFormDrawerIsOpen,
  toggleFormDrawer,
  toggleCreateMetricFormIsOpen
} from '../../../../redux/features/ui/uiSlice'

const DATA = [
  {
    title: 'Metrics',
    children: [
      {
        title: 'Count',
        description: 'Data represented using absolute values',
        icon: <NumberOutlined />
      },
      {
        title: 'Percentage',
        description: 'Data represented using relative percentages',
        icon: <PercentageOutlined />
      },
      {
        title: 'Cumulative',
        description: 'Data represented using absolute values',
        icon: <PlusCircleOutlined />
      },
      {
        title: 'Boolean',
        description: 'Data represented using 2 values (eg. Yes/No)',
        icon: <CheckCircleOutlined />
      }
    ]
  },
  {
    title: 'Others',
    children: [
      {
        title: 'Album',
        description: 'Upload/Display images',
        icon: <FileImageOutlined />
      },
      {
        title: 'Text',
        description: 'Display textual data (eg. comments/information)',
        icon: <FileTextOutlined />
      },
      {
        title: 'Link',
        description: 'Display a clickable link',
        icon: <LinkOutlined />
      }
    ]
  }
]

function FormDrawer() {
  const dispatch = useDispatch()
  const formDrawerIsOpen: boolean = useSelector((state: any) =>
    getFormDrawerIsOpen(state)
  )

  const closeDrawer = () => {
    dispatch(toggleFormDrawer())
  }

  return (
    <>
      <Drawer
        title='Create Metric'
        placement='right'
        onClose={closeDrawer}
        open={formDrawerIsOpen || false}
        size='large'
      >
        {DATA.map((section) => {
          return (
            <div key={uuidv4()}>
              <FormDrawerSection title={section.title} />
              <List
                itemLayout='horizontal'
                style={{ margin: '10px 0' }}
                dataSource={section.children}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key={item.title}
                        icon={<PlusOutlined />}
                        onClick={() => dispatch(toggleCreateMetricFormIsOpen())}
                      ></Button>
                    ]}
                  >
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', padding: '10px 15px' }}>
                        {item.icon}
                      </div>

                      <div style={{ flexGrow: 1 }}>
                        <List.Item.Meta
                          title={<a href='https://ant.design'>{item.title}</a>}
                          description={item.description}
                        />
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )
        })}
      </Drawer>
    </>
  )
}

export default React.memo(FormDrawer)
