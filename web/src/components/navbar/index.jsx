import React from 'react'
import 'tailwindcss/tailwind.css'
import { Menu, Dropdown } from 'antd'
import { CaretDownOutlined, UserOutlined } from '@ant-design/icons'
import Link from 'next/link'
import './styles.scss'

import Notification from './notification'

export default function Navbar() {
  const moreNavbarOptions = (
    <Menu className="border-2 rounded-2xl py-2 top-5 absolute transform -translate-x-1/2 left-1/2">
      <Menu.Item key="0">
        <Link href="/template-tasks">
          <a>テンプレートタスク</a>
        </Link>
      </Menu.Item>
      <Menu.Item key="1">
        <Link href="/jf-schedules">
          <a>スケジュール</a>
        </Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link href="/milestones">
          <a>マスター設定</a>
        </Link>
      </Menu.Item>
    </Menu>
  )
  // const notifications = (
  //   <Menu className="border-2 rounded-2xl py-2 top-4 absolute transform -translate-x-1/2 left-1/2">
  //     <Menu.Item key="0">
  //       <Link href="/">
  //         <a>通知 1</a>
  //       </Link>
  //     </Menu.Item>
  //     <Menu.Item key="1">
  //       <Link href="/">
  //         <a>通知 2</a>
  //       </Link>
  //     </Menu.Item>
  //   </Menu>
  // )
  const userInformations = (
    <Menu className="border-2 rounded-2xl py-2 top-3 absolute transform -translate-x-1/2 left-1/2">
      <Menu.Item key="0">
        <Link href="/profile">
          <a>プロフィール表示</a>
        </Link>
      </Menu.Item>
      <Menu.Item key="1">
        <Link href="/logout">
          <a>ログアウト</a>
        </Link>
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="flex justify-between items-center border-2 navbar select-none">
      <div className="flex">
        <div className="w-20 ml-16">
          <Link href="top">
            <a>
              <img src="/images/logo.png" alt="logo" />
            </a>
          </Link>
        </div>
        <div className="flex items-center">
          <div className="px-8">
            <Link href="/jobfairs">
              <a>JF</a>
            </Link>
          </div>
          <div className="px-8">
            <Link href="/members">
              <a href="">メンバ</a>
            </Link>
          </div>
          <div className="px-8">
            <Dropdown overlay={moreNavbarOptions} trigger={['click']}>
              <div className="cursor-pointer">
                その他
                <span className="px-1">
                  <CaretDownOutlined className="text-lg" />
                </span>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="flex px-16 items-center">
        <Notification />
        <div className="px-4">
          <Dropdown overlay={userInformations} trigger={['click']}>
            <div className="px-2 border-4 border-white user-icon-container py-1 cursor-pointer">
              <UserOutlined className="text-xl user-icon" />
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}
