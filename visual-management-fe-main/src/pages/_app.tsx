import "@/styles/globals.css";
import "antd/dist/antd.css";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode, useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "react-redux";
import store from "../../redux/store";
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "@/utilities/authConfig";
import { MsalProvider } from "@azure/msal-react";

/**
* MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
* For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
*/
const msalInstance = new PublicClientApplication(msalConfig);


// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

msalInstance.addEventCallback((event: any) => {
    if (
        (event.eventType === EventType.LOGIN_SUCCESS ||
            event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
            event.eventType === EventType.SSO_SILENT_SUCCESS) &&
        event.payload.account
    ) {
        msalInstance.setActiveAccount(event.payload.account);
    }
});


export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        refetchOnMount: false,
                        retry: false,
                        // staleTime: 30000,
                        // refetchInterval: 30000,
                    },
                },
            })
    );

    const getLayout = Component.getLayout || ((page) => page);

    return (
        <Provider store={store}>
            <MsalProvider instance={msalInstance}>
                <QueryClientProvider client={queryClient}>
                    {getLayout(<Component {...pageProps} />)}

                    {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
                </QueryClientProvider>
            </MsalProvider>
        </Provider>
    );
}

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

App.getInitialProps = async ({ }) => {
    return {}
}
