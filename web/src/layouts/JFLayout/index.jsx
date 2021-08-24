import React, { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd'
import Link from 'next/link'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import '../../pages/global.scss'
import {
  HomeOutlined,
  FileProtectOutlined,
  BarChartOutlined,
  TableOutlined,
  FileOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { findSlot } from '../../utils/pages'
import Navbar from '../../components/navbar'
import './style.scss'

const JfLayout = ({ children }) => {
  const main = findSlot(JfLayout.Main, children)
  const { Sider, Content } = Layout
  const [collapsed, Setcollapsed] = useState(false)
  const toggleCollapsed = () => {
    Setcollapsed(!collapsed)
  }
  const [idJF, setIdJf] = useState('')
  useEffect(() => {
    setIdJf(localStorage.getItem('id-jf'))
  }, [children])
  return (
    <div className="menuu">
      <Navbar />
      <Layout className="site-layout" style={{ marginLeft: 0 }}>

        <Sider
          style={{
            background: '#bae8e8',
            left: 0,
            zIndex: 100,
          }}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <Menu
            style={{
              height: '100vh',
            }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            theme="dark"
            inlineCollapsed={collapsed}
          >
            <div className="relative h-10 ">
              <div className="absolute top-0 right-0 ">
                <div
                  className="button"
                  type="primary"
                  onClick={toggleCollapsed}
                  style={{ marginBottom: 16 }}
                >
                  {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                </div>
              </div>
            </div>
            <Menu.Item key="1" icon={<HomeOutlined />}>
              <Link href={`/jf-toppage/${idJF}`}>ホーム</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<FileProtectOutlined />}>
              <Link href={`/tasks/${idJF}`}>タスク</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<BarChartOutlined />}>
              <Link href={`/grantt-chart/${idJF}`}>ガントチャート</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<TableOutlined />}>
              <Link href={`/kanban/${idJF}`}>カンバン</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<FileOutlined />}>
              <Link href={`/file/${idJF}`}>ファイル</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">

          <Content
            className="site-layout-background"
          >
            {_get(main, 'props.children')}
          </Content>
        </Layout>
      </Layout>
    </div>
  )
}
JfLayout.Main = () => null

JfLayout.defaultProps = {
  children: [],
}
JfLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
}
export default JfLayout
