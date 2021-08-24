import React, { useEffect, useState } from 'react'
import { Table, Input, Empty, Select, Tooltip, Button } from 'antd'
import './style.scss'
import { SearchOutlined } from '@ant-design/icons'
import OtherLayout from '../../layouts/OtherLayout'
import { getTaskList, getCategories } from '../../api/template-task'
import { getAllMileStone } from '../../api/milestone'

export default function TemplateTaskList() {
  // state of table
  const [itemCount, setItemCount] = useState(10)
  const [pagination, setPagination] = useState({ position: ['bottomCenter'], showTitle: false, showSizeChanger: false, pageSize: 10 })
  const [loading, setLoading] = useState(false)
  const [originalData, setOriginalData] = useState()
  const [temperaryData, setTemperaryData] = useState()
  const [optionMilestone, setOptionMileStone] = useState([])
  const [optionCategory, setOptionCategory] = useState([])
  const [valueSearch, setValueSearch] = useState('')
  const { Option } = Select
  const [category, setCategory] = useState('')
  const [milestone, setMilestone] = useState('')
  // select number to display
  const handleSelect = (value) => {
    setPagination((preState) => ({
      ...preState,
      pageSize: value,
    }))
    setItemCount(value)
    localStorage.setItem('pagination', JSON.stringify({ ...pagination, pageSize: value }))
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

  // add data of table
  const addDataOfTable = (response) => {
    const data = []
    if (response) {
      for (let i = 0; i < response.data.length; i += 1) {
        data.push({
          id: i + 1,
          idTemplateTask: response.data[i].id,
          templateTaskName: response.data[i].name,
          category_name: response.data[i].categories[0].category_name,
          milestone_name: response.data[i].milestone.name,
        })
      }
      setTemperaryData(data)
      setOriginalData(data)
    }
  }

  const addOptionCategory = (response) => {
    const option = []
    for (let i = 0; i < response.data.length; i += 1) {
      option.push(
        <Option key={response.data[i].category_name}>{response.data[i].category_name}</Option>,
      )
    }
    setOptionCategory(option)
  }

  const addOptionMilestone = (response) => {
    const option = []
    for (let i = 0; i < response.data.length; i += 1) {
      option.push(
        <Option key={response.data[i].name}>{response.data[i].name}</Option>,
      )
    }
    setOptionMileStone(option)
  }

  // columns of tables

  const columns = [
    {
      title: 'No.',
      dataIndex: 'id',
      fixed: 'left',
      width: '5%',
      render: (id) => id,
    },
    {
      title: 'テンプレートタスク名',
      dataIndex: 'templateTaskName',
      fixed: 'left',
      ellipsis: {
        showTitle: false,
      },
      render: (templateTaskName, record) => <Tooltip title={templateTaskName}><a href={`/template-task-dt/${record.idTemplateTask}`}>{templateTaskName}</a></Tooltip>,
    },
    {
      title: 'カテゴリ',
      dataIndex: 'category_name',
      fixed: 'left',
    },
    {
      title: 'マイルストーン',
      dataIndex: 'milestone_name',
    },
  ]

  // data of table get from database

  useEffect(async () => {
    setLoading(true)
    initPagination()
    await getTaskList().then((response) => {
      addDataOfTable(response)
    })
    await getCategories().then((response) => {
      addOptionCategory(response)
    })
    await getAllMileStone().then((response) => {
      addOptionMilestone(response)
    })
      .catch((error) => Error(error.toString()))
    setLoading(false)
  }, [])

  // Search data on Table

  const searchDataOnTable = (value) => {
    const filteredData = originalData.filter(
      (templateTask) => (value ? templateTask.templateTaskName.toLowerCase().includes(value) : templateTask.templateTaskName)
      && (category ? !templateTask.category_name.localeCompare(category) : templateTask.category_name)
      && (milestone ? !templateTask.milestone_name.localeCompare(milestone) : templateTask.milestone_name),
    )
    setTemperaryData(filteredData)
  }
  const onSearch = (e) => {
    const currValue = e.target.value.toLowerCase()
    setValueSearch(currValue)
    searchDataOnTable(currValue)
  }

  const handleSelectCategory = (value) => {
    setCategory(value)
    const filteredData = originalData.filter(
      (templateTask) => (value ? !templateTask.category_name.localeCompare(value) : templateTask.category_name)
      && (valueSearch ? templateTask.templateTaskName.toLowerCase().includes(valueSearch) : templateTask.templateTaskName)
      && (milestone ? !templateTask.milestone_name.localeCompare(milestone) : templateTask.milestone_name),
    )
    setTemperaryData(filteredData)
  }

  const handlSelectMilestone = (value) => {
    setMilestone(value)
    const filteredData = originalData.filter(
      (templateTask) => (value ? !templateTask.milestone_name.localeCompare(value) : templateTask.milestone_name)
      && (valueSearch ? templateTask.templateTaskName.toLowerCase().includes(valueSearch) : templateTask.templateTaskName)
      && (category ? !templateTask.category_name.localeCompare(category) : templateTask.category_name),
    )
    setTemperaryData(filteredData)
  }

  return (
    <OtherLayout>
      <OtherLayout.Main>
        <h1 className="text-3xl float-left">テンプレートタスクー覧</h1>
        <div className="TemplateTaskList">
          <div className="container mx-auto flex flex-col space-y-2 justify-center">
            <div className="space-y-5">
              <div className="flex-col space-y-9">
                <div className="flex items-center">
                  {/* <h1 className="text-3xl float-left">テンプレートタスクー覧</h1> */}
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center space-x-4 w-9/12">
                    <Select className="w-1/4" placeholder="カテゴリ" allowClear="true" onChange={handleSelectCategory}>
                      {optionCategory}
                    </Select>
                    <Select className="w-1/4" placeholder="マイルストーン" allowClear="true" onChange={handlSelectMilestone}>
                      {optionMilestone}
                    </Select>
                  </div>
                  <Button
                    className="flex float-right"
                    href="/add-template-task"
                    type="primary"
                    style={{ letterSpacing: '-2px' }}
                  >
                    追加
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span>表示件数: </span>
                  <Select value={itemCount} onChange={handleSelect}>
                    <Option value={10}>10</Option>
                    <Option value={25}>25</Option>
                    <Option value={50}>50</Option>
                  </Select>
                </div>
                <div>
                  <Input
                    className="float-right"
                    allowClear="true"
                    prefix={<SearchOutlined />}
                    placeholder="テンプレートタスク名"
                    onChange={onSearch}
                    value={valueSearch}
                  />
                </div>
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={temperaryData}
              scroll={{ y: 400 }}
              loading={loading}
              pagination={pagination}
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="該当結果が見つかりませんでした" /> }}
            />
          </div>
        </div>
      </OtherLayout.Main>
    </OtherLayout>
  )
}
