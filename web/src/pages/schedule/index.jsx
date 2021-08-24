import React, { useState, useEffect, useCallback } from 'react'
import { Select, Input, Table, Empty, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import Layout from '../../layouts/OtherLayout'
import { webInit } from '~/api/web-init'

import { ListScheduleApi } from '~/api/schedule'

const columns = [
  {
    title: 'No.',
    dataIndex: 'id',
    key: 'No.',
    width: '10%',
    render: (id) => id,
  },
  {
    title: 'スケジュール',
    dataIndex: 'name',
    key: 'スケジュール',
    width: '90%',
    render: (name) => `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`,
  },
]

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([])
  const [filterSchedules, setFilterSchedules] = useState([])
  const [itemCount, setItemCount] = useState(10)
  const [dataLoading, setDataLoading] = useState(false)
  const [pagination, setPagination] = useState({ position: ['bottomCenter'], current: 1, pageSize: 10, showSizeChanger: false })
  const [user, setUser] = useState({})
  const router = useRouter()
  const handleSelect = (value) => {
    setPagination((preState) => ({
      ...preState,
      pageSize: value,
    }))
    setItemCount(value)
    localStorage.setItem('pagination', JSON.stringify({ ...pagination, pageSize: value }))
  }

  const handleChange = (e) => {
    setPagination((preState) => ({
      ...preState,
      current: e.current,
    }))
  }

  const handleInput = (e) => {
    const result = schedules.filter((obj) => obj.name.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1)
    setFilterSchedules(result)
  }

  const initPagination = () => {
    const paginationData = JSON.parse(localStorage.getItem('pagination'))
    if (paginationData === null) {
      localStorage.setItem('pagination', JSON.stringify(pagination))
    } else {
      setPagination((preState) => ({
        ...preState,
        pageSize: paginationData.pageSize,
      }))
      setItemCount(paginationData.pageSize)
    }
  }

  const fetchData = useCallback(() => {
    setDataLoading(true)
    initPagination()
    webInit().then((res) => {
      if (res.data.auth != null) {
        setUser(res.data.auth.user)
      } else {
        router.push('/login')
      }
    })
    ListScheduleApi.getListShedule().then((res) => {
      const { data } = res
      setSchedules(data)
      setFilterSchedules(data)
    }).finally(() => {
      setDataLoading(false)
    })
  })

  const handleClick = (e) => {
    e.preventDefault()
    router.push('/schedule/add')
  }

  const handleRow = (record) => ({ onClick: () => {
    router.push(`/schedule/${record.id}`)
  } })

  useEffect(() => {
    fetchData()
  }, [itemCount])
  const { Option } = Select
  const role = user.role
  return (
    <Layout>
      <Layout.Main>
        <div className="flex flex-col h-full items-center justify-center bg-white-background">
          <div className="flex w-full justify-between">
            <div className="text-4xl title">JFスケジュール一覧</div>
            <div>
              { role === 'superadmin' ? (
                <Button
                  type="primary"
                  className="px-12"
                  htmlType="button"
                  enabled
                  onClick={handleClick}
                >
                  追加
                </Button>
              ) : ''}
            </div>
          </div>
          <div className="flex w-full justify-between">
            <div>
              <span className="text-xl">表示件数: </span>
              <Select className="ml-5" value={itemCount} onChange={handleSelect}>
                <Option value={10}>10</Option>
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
              </Select>
            </div>
            <div>
              <div className="text-2xl ml-auto flex items-center">
                <Input placeholder="スケジュール" onChange={handleInput} bordered prefix={<SearchOutlined />} />
              </div>
            </div>
          </div>
          <Table
            className="rounded-3xl table-styled my-5 table-striped-rows"
            columns={columns}
            dataSource={filterSchedules}
            rowKey={(record) => record.id}
            scroll={{ y: 360 }}
            onRow={handleRow}
            onChange={handleChange}
            loading={dataLoading}
            pagination={pagination}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="該当結果が見つかりませんでした" /> }}
          />
        </div>
      </Layout.Main>
    </Layout>
  )
}
