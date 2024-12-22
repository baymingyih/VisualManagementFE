import {
    AppstoreOutlined,
    BarChartOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Layout, Popover, Space, message } from "antd";
import { useRouter } from "next/router";
import Image from "next/image";
import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../utilities/authConfig";
import { AccountInfo } from "@azure/msal-browser";
import Link from "next/link";

const { Header } = Layout;

function AdminNavbar() {
    const router = useRouter();

    const { instance } = useMsal();
    let activeAccount: AccountInfo | null;

    if (instance) {
        activeAccount = instance.getActiveAccount();
    }

    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    const handleLogoutRedirect = () => {
        instance
            .logoutRedirect()
            .then(() => {
                router.push("/Home");
            })
            .catch((error) => console.log(error));
    };

    const onProfileButtonClick = ({ key }: any) => {
        switch (+key) {
            case 0:
                if (activeAccount) {
                    handleLogoutRedirect();
                } else {
                    handleLoginRedirect();
                }
                break;
            case 1:
                message.info("Feature not implemented yet");
                break;
        }
    };

    const getProfileDropDownList = useCallback(() => {
        if (activeAccount) {
            return [
                {
                    label: `Welcome, ${activeAccount.name}`,
                    disabled: true,
                },
                {
                    label: "",
                    disabled: true,
                    type: "divider",
                },
                {
                    key: 1,
                    label: "My Profile",
                    disabled: false,
                    icon: <UserOutlined />,
                },
                {
                    key: 0,
                    label: "Logout",
                    disabled: false,
                    icon: <LogoutOutlined />,
                },
            ];
        }

        return [
            {
                key: 0,
                label: "Login",
                disabled: false,
                icon: <UserOutlined />,
            },
        ];
    }, [instance]);

    const AppContent = (
        <div>
            <Button onClick={() => { router.push(`/VMBoard`) }} type={'text'} icon={<BarChartOutlined />}>Visual Management</Button>
        </div>
    );

    // const dropdownMenu = { items: getProfileDropDownList() }

    return (
        <Header
            style={{
                display: "flex",
                backgroundColor: "white",
                padding: "0 20px",
                justifyContent: "space-between",
                position: "relative",
                boxShadow: "0 4px 2px -2px gray",
            }}>
            <Space style={{ flexDirection: "row", alignItems: "center" }}>
                <Link href={"/AdminCenter/#org"}>
                    <div style={{ display: "flex" }}>
                        <Image src="/caliba_logo.svg" alt="Caliba Logo" width={120} height={31} />
                    </div>
                </Link>
                <div style={{ fontWeight: 500, marginLeft: 20, marginTop: 1, fontSize: 20, color: '#404040' }}>
                    Admin Console
                </div>
            </Space>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                }}>
                <div>
                    <Popover content={AppContent} trigger="hover" placement={'bottomRight'}>
                        <Button icon={<AppstoreOutlined />} style={{ marginRight: 20, marginLeft: 10 }} />
                    </Popover>
                </div>
                <div>
                    <Dropdown>
                        <Button icon={<UserOutlined />} shape="circle" />
                    </Dropdown>
                </div >
            </div >
        </Header >
    );
}

export default AdminNavbar;
