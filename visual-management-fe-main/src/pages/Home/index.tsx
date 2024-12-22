import { loginRequest } from "@/utilities/authConfig";
import { LoginOutlined } from "@ant-design/icons";
import { AccountInfo } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { Button, Card, Layout, Space } from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


function Home() {
    const router = useRouter();

    const { instance } = useMsal();

    useEffect(() => {
        if (instance) {
            router.replace('/VMBoard')
        }
    }, [instance])

    const handleLoginRedirect = () => {
        instance
            .loginRedirect(loginRequest)
            .catch((error) => console.log(error));
    };

    return (
        <Layout style={{ height: '100vh' }}>
            <Space style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Card cover={
                    <Image src="/caliba_logo.svg" alt="Caliba Logo" width={75} height={75} style={{ padding: 10 }} />
                }>
                    <Button type="primary" icon={<LoginOutlined />} onClick={handleLoginRedirect}>Login with Microsoft</Button>
                </Card>
            </Space>
        </Layout>
    );
}

export default Home;
