import { Layout } from 'antd'
import { Footer } from 'antd/lib/layout/layout'
import store from "../../../redux/store";
import AdminNavbar from './AdminNavbar'
import React from "react";
import { Provider } from 'react-redux'
import MainNav from './MainNav';
import parseCountries from '@/utilities/countryList';
import type { InferGetStaticPropsType, GetStaticProps } from 'next'

export const getStaticProps = (async (context) => {
  const countries = await parseCountries();
  return { props: { 
    countries: JSON.parse(JSON.stringify(countries)).slice(1) } }
}) satisfies GetStaticProps<{
  countries: any
}>

function AdminCenter({
  countries,
}: InferGetStaticPropsType<typeof getStaticProps>
) {
  return (
    <Provider store={store}>
      <Layout style={{ minHeight: '100vh' }}>
        <AdminNavbar/>
        <MainNav countries = {countries}/>
        <Footer
          style={{
              position: "sticky",
              bottom: 0,
              width: "100%",
              padding: "0 20px",
              textAlign: "right",
          }}>
          © {new Date().getFullYear()} Caliba
        </Footer>
      </Layout>
    </Provider>
  )
}

export default AdminCenter
