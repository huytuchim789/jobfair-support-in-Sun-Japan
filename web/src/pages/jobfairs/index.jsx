import React, { useEffect, useState } from 'react'
import { Table, Button, Slider, DatePicker, Input, Empty, Select, Tooltip } from 'antd'
import './style.scss'
import { SearchOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import OtherLayout from '../../layouts/OtherLayout'
import { getJFList } from '../../api/jf-list'

export default function JFList() {
  // state of table
  const [itemCount, setItemCount] = useState(10)
  const [pagination, setPagination] = useState({ position: ['bottomCenter'], showTitle: false, showSizeChanger: false, pageSize: 10 })
  const [loading, setLoading] = useState(false)
  const [originalData, setOriginalData] = useState()
  const [temperaryData, setTemperaryData] = useState()
  const { Option } = Select

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
          idJF: response.data[i].id,
          JF名: response.data[i].name,
          開始日: response.data[i].start_date.replaceAll('-', '/'),
          推定参加学生数: response.data[i].number_of_students,
          参加企業社数: response.data[i].number_of_companies,
          管理者: response.data[i].admin,
        })
      }
      setTemperaryData(data)
      setOriginalData(data)
    }
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
      title: 'JF名',
      width: 80,
      dataIndex: 'JF名',
      fixed: 'left',
      ellipsis: {
        showTitle: false,
      },
      render: (JF名, record) => <Tooltip title={JF名}><a href={`/jf-toppage/${record.idJF}`}>{JF名}</a></Tooltip>,
    },

    {
      title: '開始日',
      width: 100,
      dataIndex: '開始日',
      fixed: 'left',
    },
    {
      title: '推定参加学生数',
      dataIndex: '推定参加学生数',
      width: 100,
    },
    {
      title: '参加企業社数',
      dataIndex: '参加企業社数',
      width: 100,
    },
    {
      title: '管理者',
      dataIndex: '管理者',
      width: 100,
    },
  ]

  // data of table get from database

  useEffect(async () => {
    setLoading(true)
    initPagination()
    await getJFList().then((response) => {
      addDataOfTable(response)
    })
      .catch((error) => Error(error.toString()))
    setLoading(false)
  }, [])

  // State of filter'
  const [valueSearch, setValueSearch] = useState('')
  const [rangeStudentsNumber, setRangeStudentsNumber] = useState([0, 100])
  const [rangeBussinessesNumber, setRangeBussinessesNumber] = useState([0, 100])
  const [startDate, setStartDate] = useState('')

  // Search data on Table

  const searchDataOnTable = (value) => {
    value = value.toLowerCase()
    const filteredData = originalData.filter((JF) => (value ? (JF.JF名.toLowerCase().includes(value)
      || JF.管理者.toLowerCase().includes(value)) : (JF.JF名))
      && (JF.推定参加学生数 <= rangeStudentsNumber[1] && JF.推定参加学生数 >= rangeStudentsNumber[0])
      && (JF.参加企業社数 <= rangeBussinessesNumber[1] && JF.参加企業社数 >= rangeBussinessesNumber[0])
      && (startDate ? !JF.開始日.localeCompare(startDate) : JF.開始日))
    setTemperaryData(filteredData)
  }
  const onSearch = (e) => {
    const currValue = e.target.value
    setValueSearch(currValue)
    searchDataOnTable(currValue)
  }

  // filter by number of students

  const FilterStudentsNumber = (value) => {
    setRangeStudentsNumber(value)
    const filteredData = originalData.filter((JF) => (JF.推定参加学生数 <= value[1] && JF.推定参加学生数 >= value[0])
      && (valueSearch ? (JF.JF名.toLowerCase().includes(valueSearch)
              || JF.管理者.toLowerCase().includes(valueSearch)) : JF.JF名)
      && (JF.参加企業社数 <= rangeBussinessesNumber[1] && JF.参加企業社数 >= rangeBussinessesNumber[0])
      && (startDate ? !JF.開始日.localeCompare(startDate) : JF.開始日))
    setTemperaryData(filteredData)
  }
  // filter by number of businesses

  const FilterBussinessesNumber = (value) => {
    setRangeBussinessesNumber(value)
    const filteredData = originalData.filter((JF) => (JF.参加企業社数 <= value[1] && JF.参加企業社数 >= value[0])
      && (valueSearch ? (JF.JF名.toLowerCase().includes(valueSearch)
                || JF.管理者.toLowerCase().includes(valueSearch)) : JF.JF名)
      && (JF.推定参加学生数 <= rangeStudentsNumber[1] && JF.推定参加学生数 >= rangeStudentsNumber[0])
      && (startDate ? !JF.開始日.localeCompare(startDate) : JF.開始日))
    setTemperaryData(filteredData)
  }

  // filter by start date

  const FilterStartDate = (date, dateString) => {
    setStartDate(dateString)
    const filteredData = originalData.filter((JF) => (dateString ? !JF.開始日.localeCompare(dateString) : JF.開始日)
      && (valueSearch ? (JF.JF名.toLowerCase().includes(valueSearch)
              || JF.管理者.toLowerCase().includes(valueSearch)) : JF.JF名)
      && (JF.推定参加学生数 <= rangeStudentsNumber[1] && JF.推定参加学生数 >= rangeStudentsNumber[0])
      && (JF.参加企業社数 <= rangeBussinessesNumber[1] && JF.参加企業社数 >= rangeBussinessesNumber[0]))
    setTemperaryData(filteredData)
  }

  const [showFilter, setShowFilter] = useState(true)

  return (
    <OtherLayout>
      <OtherLayout.Main>
        <div className="JFList">
          <div className="container mx-auto flex flex-col space-y-2 justify-center">
            <div className="flex-col space-y-9">
              <div className="flex items-center">
                <h1 className="text-3xl float-left">JF一覧</h1>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Button
                    type="primary"
                    className="flex items-center"
                    onClick={() => {
                      setShowFilter(!showFilter)
                    }}
                  >
                    {showFilter ? <UpOutlined /> : <DownOutlined />}
                    <span>フィルタ</span>
                  </Button>
                  <Button
                    className="float-right"
                    href="/add-jobfair"
                    type="primary"
                    style={{ letterSpacing: '-1px' }}
                  >
                    追加
                  </Button>
                </div>
                <div className="flex items-center space-x-8" style={{ display: showFilter ? '' : 'none' }}>
                  <DatePicker
                    inputReadOnly="true"
                    placeholder="開始日"
                    onChange={FilterStartDate}
                    format="YYYY/MM/DD"
                    dateRender={(current) => {
                      const style = {}
                      if (current.date() === 1) {
                        style.border = '1px solid #1890ff'
                        style.borderRadius = '50%'
                      }
                      return (
                        <div className="ant-picker-cell-inner" style={style}>
                          {current.date()}
                        </div>
                      )
                    }}
                  />
                  <div style={{ width: '15%', textAlign: 'center' }}>
                    <p>
                      推定参加学生数
                    </p>
                    <Slider
                      range="true"
                      defaultValue={[0, 100]}
                      onAfterChange={FilterStudentsNumber}
                    />
                  </div>
                  <div style={{ width: '15%', textAlign: 'center' }}>
                    <p>
                      参加企業社数
                    </p>
                    <Slider
                      range="true"
                      defaultValue={[0, 100]}
                      onAfterChange={FilterBussinessesNumber}
                    />
                  </div>
                </div>

              </div>
            </div>
            <div className="flex space-x-8 items-center justify-between">
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
                  placeholder="JF名, 管理者"
                  onChange={onSearch}
                  value={valueSearch}
                />
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
