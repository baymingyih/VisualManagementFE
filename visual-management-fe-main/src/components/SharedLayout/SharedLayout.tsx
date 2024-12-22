import { Layout } from "antd";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import Navbar from "../Navbar/Navbar";
import { Content, Footer } from "antd/lib/layout/layout";
import React from "react";
import CreateActionDrawer from "../FormDrawer/CreateActionDrawer/CreateActionDrawer";

function SharedLayout({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <Provider store={store}>
            <Layout style={{ height: '100vh' }}>
                <Navbar />
                <Content
                    style={{
                        height: "90vh",
                        overflow: "scroll",
                        backgroundColor: "#FFF",
                        ...(style ? style : {}),
                    }}>
                    {children}
                </Content>
                <Footer
                    style={{
                        position: "sticky",
                        bottom: 0,
                        zIndex: 999,
                        width: "100%",
                        padding: "0 20px",
                        backgroundColor: "#FFF",
                        textAlign: "right",
                    }}>
                    © 2023 Caliba
                </Footer>
            </Layout>
            <CreateActionDrawer />
        </Provider >
    );
}

export default SharedLayout;
