import { ApartmentOutlined, CreditCardOutlined, MenuOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Col, Layout, Menu, MenuProps, Row } from "antd";
import Sider from "antd/lib/layout/Sider";
import { Content } from "antd/lib/layout/layout";
import { useEffect, useState } from "react";
import OrganisationDash from "./OrganisationDash";
import UserDash from "./UsersDash/UsersDash";
import TeamsDash from "./TeamsDash/TeamsDash";
import BillingDash from "./BillingDash/BillingDash";

import { useRouter } from 'next/router';

const ContentStyle = {
  height: '100%',
  width: '100%',
  padding: '40px 60px',
}

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type
  } as MenuItem;
}

const items: MenuProps['items'] = [
  getItem('Organisation', 'org', <ApartmentOutlined />),
  getItem('Users', 'usrs', <UserOutlined />, [
    getItem('Active Users', 'activeusrs'),
    getItem('Inactive Users', 'deletedusrs'),
  ]),
  getItem('Teams', 'teams', <TeamOutlined />),
  getItem('Billing', 'billing', <CreditCardOutlined />),
];

const MainNav = (countries: any) => {

  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    const component = router.asPath.split('#')[1].split('?')[0];
    setSelectedKey(component);
  });

  return(
    <Layout style={{flexDirection: 'initial'}}>
    <Sider collapsible collapsed={collapsed} onCollapse={(collapsed)=>setCollapsed(collapsed)} theme={'light'} style={{marginTop: 2}}>
      <Button type='text' size="large" onClick={()=>{setCollapsed(!collapsed)}} style={{ height: 50,width: '100%' }}>
        {collapsed? <MenuOutlined /> : <div style={{textAlign: 'left', marginLeft: '8.2px', fontSize: '14px'}}><MenuOutlined/></div>}
      </Button>
      <Menu
        onClick={(item) => router.push(`/AdminCenter#${item.key}`)}
        selectedKeys={[selectedKey]}
        mode="inline"
        inlineCollapsed={collapsed}
        items={items}
      />
    </Sider>
    <Content style={ContentStyle}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {selectedKey === 'org' && <OrganisationDash/>}
          {selectedKey === 'activeusrs' && <UserDash active={true}/>}
          {selectedKey === 'deletedusrs' && <UserDash active={false}/>}
          {selectedKey === 'teams' && <TeamsDash/>}
          {selectedKey === 'billing' && <BillingDash countries = {countries}/>}
        </Col>
      </Row>
    </Content>    
    </Layout>
  )
}

export default MainNav;