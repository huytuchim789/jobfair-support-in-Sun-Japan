/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useContext, useEffect, useState } from 'react'
import { ReactReduxContext } from 'react-redux'
import 'antd/dist/antd.css'

import { Input, Space, Table, Row, Col, Select } from 'antd'
import { LineHeightOutlined, SearchOutlined } from '@ant-design/icons'
import AddCategory from './AddCategory'
import EditCategory from './EditCategory'
import DeleteCategory from './DeleteCategory'
import { getCategories, searchCategory } from '../../api/category'

export default function ListCategories() {
  const [pageS, setPageS] = useState(10)
  const { store } = useContext(ReactReduxContext)
  const [reload, setReload] = useState(false)
  const [category, setCategory] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [user, setUser] = useState(store.getState().get('auth').get('user'))
  const [role, setRole] = useState(user.get('role'))

  // fetch data
  useEffect(async () => {
    setReload(false)
    getCategories().then((res) => {
      setCategory(res.data)
    }).catch((error) => console.log(error.response.request.response))
  }, [reload])

  // search data with key
  async function fetch(key) {
    if (key) {
      searchCategory(key).then((res) => {
        const result = Object.values(res.data)
        setCategory(result)
      })
    } else {
      setReload(true)
    }
    setSearchValue(key)
  }
  // set reload state
  const reloadPage = () => {
    setReload(true)
  }
  // table columns
  const columns = [
    {
      title: 'No.',
      dataIndex: 'key',
      width: '8%',
    },
    {
      key: '2',
      title: 'カテゴリー名',
      dataIndex: 'name',
      width: '60%',
    },
    {
      key: '3',
      width: '25%',
      render: (record) => (role === 'superadmin' && (
        <Space size="middle">
          <EditCategory
            record={record}
            reloadPage={reloadPage}
            role={role}
          />
          <DeleteCategory
            record={record}
            reloadPage={reloadPage}
            role={role}
          />
        </Space>
      )),
    },
  ]

  const data = []
  for (let i = 0; i < category.length; i += 1) {
    data.push({
      key: i + 1,
      id: category[i].id,
      name: category[i].category_name,
    })
  }

  return (
    <div>
      <Row
        style={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Col>
          <h1>カテゴリー覧</h1>
        </Col>
        <Col>
          <div className="add">
            {role === 'superadmin' && (
              <AddCategory reloadPage={reloadPage} role={role} />)}
          </div>
        </Col>
      </Row>

      <div className="list">
        <div className="flex text-xl list-ht">
          <p>表示件数: </p>
          &nbsp;
          <p>
            <Select
              labelInValue
              defaultValue={{ value: '10' }}
              style={{ width: 60, borderRadius: '1rem' }}
              onChange={(e) => setPageS(e.value)}
              className="selectBox"
            >
              <Select.Option value="10">10</Select.Option>
              <Select.Option value="25">25</Select.Option>
              <Select.Option value="50">50</Select.Option>
            </Select>
          </p>
          <p>
            <div className="absolute right-12 no-border">
              <Space direction="vertical">
                <Input
                  placeholder="カテゴリを検索"
                  onChange={(e) => fetch(e.target.value)}
                  style={{ width: 250 }}
                  value={searchValue}
                  // onPressEnter={(e) => search(searchValue)}
                  prefix={<SearchOutlined />}
                />
              </Space>
            </div>
          </p>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: pageS }}
          scroll={{ y: 510 }}
        />
      </div>
    </div>
  )
}
