import { UpSquareTwoTone, RiseOutlined, SwapRightOutlined, DownSquareTwoTone, MinusSquareTwoTone, DoubleRightOutlined, PauseOutlined } from '@ant-design/icons'
import { Tag, Tooltip, Typography } from 'antd'
import React from 'react';
const { Text } = Typography;
import { useState, useEffect } from "react";
import { ITeamMemberFull } from "@/types/team"

export const getPriorityLabel = (priority: number, size: number = 0) => {
  switch (priority) {
    case 3:
      return (
        <>
          <Tag style={{ fontSize: size }} color='red'><DoubleRightOutlined rotate={-90} /></Tag>
        </>
      )
    case 2:
      return (
        <>
          <Tag style={{ fontSize: size }} color='gold'><PauseOutlined rotate={-90} /></Tag>
        </>
      )
    default:
      return (
        <>
          <Tag style={{ fontSize: size }} color='cyan'><DoubleRightOutlined rotate={90} /></Tag>
        </>
      )
  }
}

export const getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center', fontWeight: 500 }} color='#1890FF'>In Progress</Tag>
        </>
      )
    case 2:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center', fontWeight: 500 }} color='#18C11E'>Completed</Tag>
        </>
      )
    case 3:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center', fontWeight: 500 }} color='#959595'>Pending</Tag>
        </>
      )
    default:
      return (<></>)
  }
}

export const getTitle = (title: string, escalatedfrom_team: string, escalatedto_team: string) => {
  if (escalatedfrom_team !== "" || escalatedto_team !== "") {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{ marginRight: '10px' }}
          ellipsis={true}
        >
          {title}
        </Text>
        {escalatedfrom_team !== "" &&
          <Tooltip title={'Escalated from ' + escalatedfrom_team} placement="top">
            <Tag color="#008080" style={{ fontSize: '10px' }}><SwapRightOutlined /></Tag>
          </Tooltip >
        }
        {
          escalatedto_team !== "" &&
          <Tooltip title={'Escalated to ' + escalatedto_team} placement="top">
            <Tag color="#008080" style={{ fontSize: '10px' }}><RiseOutlined /></Tag>
          </Tooltip >
        }
      </div >
    )
  } else {
    return (
      <>
        <Text
          style={{ marginRight: '10px' }}
          ellipsis={true}
        >
          {title}
        </Text>
        <Tag color="white" style={{ opacity: '0%' }}><RiseOutlined /></Tag>
      </>
    )
  }
}

export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export const getAccessLabel = (access: number) => {
  switch (access) {
    case 1:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center' }}>Admin</Tag>
        </>
      )
    case 2:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center' }}>Member</Tag>
        </>
      )
    default:
      return (<></>)
  }
}

export const generateUserString = (users: ITeamMemberFull[]) => {
  if (users.length === 1) {
    return users[0].firstName + ' ' + users[0].lastName
  } else {
    return users.map((user) => user.firstName + ' ' + user.lastName).join(', ')
  }
}


export const filterPICData = (data: any) => (formatter: any) => data.map((item: any) => ({
  text: formatter(item),
  value: formatter(item)
}));

export const pgmt_getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center', fontWeight: 500 }} color='#959595'>Pending</Tag>
        </>
      )
    case 2:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center', fontWeight: 500 }} color='#1890FF'>In Progress</Tag>
        </>
      )
    case 3:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center', fontWeight: 500 }} color='#18C11E'>Completed</Tag>
        </>
      )
    default:
      return (<></>)
  }
}

export const teamMgmt_getAccessLabel = (access: number) => {
  switch (access) {
    case 1:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center' }}>Admin</Tag>
        </>
      )
    case 2:
      return (
        <>
          <Tag style={{ width: '5rem', textAlign: 'center' }}>Member</Tag>
        </>
      )
    default:
      return (<></>)
  }
}
