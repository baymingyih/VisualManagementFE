import {
    AppstoreOutlined,
    IdcardOutlined,
    LogoutOutlined,
    PlusOutlined,
    SettingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Layout, Menu, MenuProps, Popover, Select, Space, message } from "antd";
import { ITeam } from "../../types/team";
import { useRouter } from "next/router";
import {
    getBoardInViewMode,
    getSelectedTeam,
    getTeams,
    setSelectedTeam,
    setTeam,
    toggleCreateActionFormIsOpen,
} from "../../../redux/features/ui/uiSlice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeamsByOrgId } from "@/pages/api/TeamAPI";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../utilities/authConfig";
import { AccountInfo } from "@azure/msal-browser";
import Link from "next/link";

const { Header } = Layout;

const links = [
    { key: "VMBoard", label: "Boards" },
    { key: "ActionTracker", label: "Actions" },
    { key: "ProjectMgmt", label: "Projects" },
    { key: "TeamMgmt", label: "Team Management" },
];

function Navbar() {
    const dispatch = useDispatch();

    const router = useRouter();

    const teams: ITeam[] = useSelector(getTeams);
    const selectedTeam: ITeam | null = useSelector(getSelectedTeam);
    const inViewMode: boolean = useSelector(getBoardInViewMode);

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

    const { isLoading } = useQuery({
        queryKey: ["teams_getByOrg"],
        queryFn: () => getTeamsByOrgId(1),
        onSuccess: ({ data }: { data: ITeam[] }) => {
            if (data) {
                if (data.length && data[0]) {
                    dispatch(setSelectedTeam(data[0]));
                }
                dispatch(setTeam(data));
            }
        },
    });

    const getCurrentPageKey = useCallback(() => {
        switch (router.pathname) {
            case "/VMBoard":
                return "VMBoard";
            case "/ActionTracker":
                return "ActionTracker";
            case "/ProjectMgmt":
                return "ProjectMgmt";
            case "/TeamMgmt":
                return "TeamMgmt";
            default:
                return "";
        }
    }, [router.pathname]);

    const onCreateActionButtonClick = () => {
        dispatch(toggleCreateActionFormIsOpen());
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

    // const getProfileDropDownList = useCallback(() => {
    //     if (activeAccount) {
    //         return [
    //             {
    //                 label: `Welcome, ${activeAccount.name}`,
    //                 disabled: true,
    //             },
    //             {
    //                 label: '',
    //                 disabled: true,
    //                 type: 'divider'
    //             },
    //             {
    //                 key: 1,
    //                 label: "My Profile",
    //                 disabled: false,
    //                 icon: <UserOutlined />,
    //             },
    //             {
    //                 key: 0,
    //                 label: "Logout",
    //                 disabled: false,
    //                 icon: <LogoutOutlined />,
    //             },
    //         ]
    //     }

    //     return [
    //         {
    //             key: 0,
    //             label: "Login",
    //             disabled: false,
    //             icon: <UserOutlined />,
    //         }
    //     ]
    // }, [instance])

    const AppContent = (
        <Space direction="vertical" size="small" style={{ display: "flex" }}>
            <div>
                <Button
                    onClick={() => {
                        router.push(`/AdminCenter#org`);
                    }}
                    type={"text"}
                    size={"large"}
                    icon={<IdcardOutlined />}>
                    Admin Console
                </Button>
            </div>
        </Space>
    );

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
                <Link href={"/VMBoard"}>
                    <div style={{ display: "flex" }}>
                        <Image src="/caliba_logo.svg" alt="Caliba Logo" width={120} height={31} />
                    </div>
                </Link>
                <Menu
                    mode="horizontal"
                    style={{ borderBottom: 0, fontSize: "1rem", fontWeight: "600" }}
                    items={links}
                    disabledOverflow={true}
                    onClick={(e) => {
                        router.push(`/${e.key}`);
                    }}
                    selectedKeys={[getCurrentPageKey()]}
                />
            </Space>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                }}>
                <Select
                    value={selectedTeam?.id}
                    onChange={(value) => dispatch(setSelectedTeam(value))}
                    style={{
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                        marginRight: 10,
                        color: "black",
                    }}
                    disabled={isLoading || inViewMode}
                    loading={isLoading}
                    bordered={false}
                    options={teams.map((t: ITeam) => {
                        return {
                            label: t.name,
                            value: t.id,
                        };
                    })}
                />

                <div>
                    <Popover content={AppContent} trigger="hover" placement={"bottomRight"}>
                        <Button
                            icon={<AppstoreOutlined />}
                            style={{ marginRight: 20, marginLeft: 10 }}
                        />
                    </Popover>
                </div>
                <div>
                    <Dropdown menu={{ items: [], onClick: onProfileButtonClick }}>
                        <Button icon={<UserOutlined />} shape="circle" />
                    </Dropdown>
                </div>
            </div>
        </Header>
    );
}

export default Navbar;
