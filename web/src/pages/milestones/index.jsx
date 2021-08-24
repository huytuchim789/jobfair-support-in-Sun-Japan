import React, { useState, useEffect } from 'react'
import 'tailwindcss/tailwind.css'
import { useRouter } from 'next/router'
import {
  Table,
  Space,
  Button,
  Row,
  Col,
  Input,
  Select,
  notification,
  Modal,
} from 'antd'
import { DeleteTwoTone, EditTwoTone, SearchOutlined } from '@ant-design/icons'
import { getAllMileStone, deleteMileStone } from '~/api/milestone'
import OtherLayout from '../../layouts/OtherLayout'
import 'antd/dist/antd.css'
import { webInit } from '../../api/web-init'
import './styles.scss'

const MilestonePage = () => {
  const [isRenderFirstly, setIsRenderFirstly] = useState(true)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [id, setId] = useState()
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [role, setRole] = useState()
  const [isModalType, setIsModalType] = useState({
    delete: false,
    edit: false,
    add: false,
  })

  const router = useRouter()
  webInit().then((res) => {
    setRole(res.data.auth.user.role)
  })
  const openNotificationSuccess = () => {
    notification.success({
      message: 'マイルストーンが正常に削除されました',
      duration: 3,
    })
  }

  const convertPeriod = (numOfDays, type) => {
    if (type === 'week' && numOfDays > 7) {
      return `${Math.ceil(numOfDays / 7)}週間後`
    }
    if (numOfDays <= 7) {
      return `${numOfDays}日後`
    }
    return `${Math.ceil(numOfDays / 7)}週間後`
  }

  const fetchData = async (inputSearch = null) => {
    setLoading(true)
    try {
      const res = await getAllMileStone()
      const dataArr = res.data
        .map((row) => ({
          ...row,
          period:
            row.is_week === 1
              ? { numOfDays: row.period * 7, type: 'week' }
              : { numOfDays: row.period, type: 'day' },
        }))
        .sort((a, b) => a.period.numOfDays - b.period.numOfDays)
        .map((row) => {
          const { numOfDays, type } = row.period
          return {
            ...row,
            period_sub: convertPeriod(numOfDays, type),
          }
        })

      if (inputSearch) {
        setData(
          dataArr
            .filter(
              (item) => item.name.toLowerCase().includes(inputSearch.toLowerCase())
                || item.period_sub
                  .toString()
                  .toLowerCase()
                  .includes(inputSearch.toString().toLowerCase()),
            )
            .map((item, idx) => {
              const newItem = { ...item, no: (idx += 1) }
              return newItem
            }),
        )
        setLoading(false)
        return
      }

      const newData = dataArr.map((item, idx) => {
        const newItem = { ...item, no: (idx += 1) }
        return newItem
      })

      setData(newData)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  const searchItemHandler = (e) => {
    setSearchValue(e.target.value)
  }

  const setPageSize = (e) => {
    setPagination((preState) => ({
      ...preState,
      current: 1,
      pageSize: e.value,
    }))
  }

  const tableChangeHandler = (e) => {
    setPagination((preState) => ({ ...preState, current: e.current }))
  }

  /// /////////////////////////////////
  /// ////// Modal function ///////////
  /// /////////////////////////////////
  const handleOk = async () => {
    setIsModalVisible(false)
    try {
      if (isModalType.delete) {
        await deleteMileStone(id)

        setPagination((preState) => ({
          ...preState,
          current: 1,
        }))

        setId(null)
        openNotificationSuccess()
        fetchData()
        setIsModalType((preState) => ({ ...preState, delete: false }))
      }

      if (isModalType.add) {
        setIsModalType((preState) => ({ ...preState, add: false }))
        router.push('/milestones/add')
      }

      if (isModalType.edit) {
        setIsModalType((preState) => ({ ...preState, edit: false }))
        router.push(`/milestones/${id}/edit`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setIsModalType({ delete: false, add: false, edit: false })
  }
  const showModal = (type) => {
    setIsModalVisible(true)
    let title
    if (type.add) {
      title = 'マイルストーンを追加しますか ?'
    } else if (type.edit) {
      title = 'マイルストーンを編集しますか ?'
    } else {
      title = 'マイルストーンを削除しますか ?'
    }
    Modal.confirm({
      title,
      visible: isModalVisible,
      onOk() {
        handleOk()
      },
      onCancel() {
        handleCancel()
      },
      okText: 'はい',
      cancelText: 'いいえ',
    })
  }

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      width: '5%',
    },
    {
      title: 'マイルストーン一名',
      dataIndex: 'name',
      render: (name) => `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`,
      width: '55%',
    },
    {
      title: '期日',
      dataIndex: 'period',
      width: `${role === 'superadmin' ? '20%' : '40%'}`,
      render: (period) => {
        const { numOfDays, type } = period
        return convertPeriod(numOfDays, type)
      },
    },
    {
      key: 'action',
      width: `${role === 'superadmin' ? '20%' : '0%'}`,
      render: (_text, record) => (role === 'superadmin' && (
        <Space size="middle">
          <EditTwoTone
            id={record.id}
            onClick={() => {
              setId(record.id)
              setIsModalType((preState) => ({
                ...preState,
                edit: true,
              }))
            }}
          />

          <DeleteTwoTone
            onClick={() => {
              setId(record.id)
              setIsModalType((preState) => ({
                ...preState,
                delete: true,
              }))
            }}
          />
        </Space>
      )),
    },
  ]

  useEffect(() => {
    if (isRenderFirstly) {
      return setIsRenderFirstly(false)
    }
    const timer = setTimeout(() => {
      setPageSize((preState) => ({ ...preState, current: 1 }))
      fetchData(searchValue)
    }, 600)
    return () => {
      clearTimeout(timer)
    }
  }, [searchValue])

  useEffect(() => {
    fetchData()
  }, [])
  useEffect(() => {
    if (!isModalType.add && !isModalType.delete && !isModalType.edit) {
      return
    }
    showModal(isModalType)
  }, [isModalType])

  return (
    <div>
      <OtherLayout>
        <OtherLayout.Main>
          <div className="container-list">
            <Row
              style={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Col>
                <h1 style={{ marginLeft: '0px' }}>マイルストーン一覧</h1>
              </Col>
              {role === 'superadmin' && (
                <Col>
                  <Button
                    style={{
                      backgroundColor: '#ffd803',
                      borderColor: '#ffd803',
                      color: 'black',
                    }}
                    type="primary"
                    danger
                    onClick={() => {
                      setIsModalType((preState) => ({
                        ...preState,
                        add: true,
                      }))
                    }}
                  >
                    追加
                  </Button>
                </Col>
              )}
            </Row>

            <Row style={{ justifyContent: 'space-between' }}>
              <Col>
                <span
                  style={{ paddingRight: '0.5rem' }}
                  className="dropdown-label"
                >
                  表示件数
                </span>
                <Select
                  labelInValue
                  defaultValue={{ value: '10' }}
                  style={{ width: 60, borderRadius: '1rem' }}
                  onChange={(e) => setPageSize(e)}
                >
                  <Select.Option value="10">10</Select.Option>
                  <Select.Option value="25">25</Select.Option>
                  <Select.Option value="50">50</Select.Option>
                </Select>
              </Col>
              <Col>
                <Input
                  placeholder="マイルストーン一名, 期日"
                  onChange={(e) => searchItemHandler(e)}
                  style={{ width: 250 }}
                  value={searchValue}
                  prefix={<SearchOutlined />}
                />
              </Col>
            </Row>

            <div className="box-body">
              <Table
                scroll={{ y: 380 }}
                columns={columns}
                rowKey={(record) => record.id}
                dataSource={data}
                pagination={pagination}
                loading={loading}
                onChange={(e) => tableChangeHandler(e)}
              />
            </div>
          </div>
        </OtherLayout.Main>
      </OtherLayout>
    </div>
  )
}

export default MilestonePage
