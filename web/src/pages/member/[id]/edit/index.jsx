import React, { useState, useCallback, useEffect } from 'react'
import { Form, Input, Button, notification, Select, Modal } from 'antd'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import Layout from '../../../../layouts/OtherLayout'
import './styles.scss'
import { MemberApi } from '~/api/member'
import { CategoryApi } from '~/api/category'
import { webInit } from '~/api/web-init'
import * as Extensions from '../../../../utils/extensions'

const EditMember = ({ data }) => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isModalCancelVisible, setIsModalCancelVisible] = useState(false)
  const [emailInput, setEmailInput] = useState(data.user.email)
  const [nameInput, setNameInput] = useState(data.user.name)
  const router = useRouter()
  const [categories, setCategories] = useState(data.categories)
  const [categoriesSystem, setCategoriesSystem] = useState([])
  const [reqCategories, setReqCategories] = useState([])
  const [user, setUser] = useState({})
  const [showExitPrompt, setShowExitPrompt] = useState(false)

  const { id } = router.query

  const onValueNameChange = (e) => {
    setNameInput(e.target.value)
    setShowExitPrompt(true)
  }

  const onValueEmailChange = (e) => {
    setEmailInput(e.target.value)
    setShowExitPrompt(true)
  }

  const fetchData = useCallback(() => {
    webInit().then((res) => {
      if (res.data.auth !== null) {
        setUser(res.data.auth.user)
      } else {
        router.push('/login')
      }
    })
    CategoryApi.getFullCategories().then((res) => {
      setCategoriesSystem(res.data)
    })
  })

  const { Option } = Select

  const openNotificationSuccess = () => {
    notification.success({
      message: '変更は正常に保存されました。',
      duration: 1,
    })
  }

  const handleOk = () => {
    MemberApi.updateMember(id, {
      name: nameInput,
      email: emailInput,
      categories: reqCategories,
    })
      .then(() => {
        openNotificationSuccess()
        router.push(`/member/${data.user.id}`)
      })
      .catch((error) => {
        notification.error({
          message:
            error.response.data.errors.email || error.response.data.errors.name,
        })
      })
      .finally(() => {
        setIsModalCancelVisible(false)
        setIsModalVisible(false)
      })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleClick = (e) => {
    e.preventDefault()
    router.push(`/member/${data.user.id}`)
  }

  const showModal = () => {
    if (
      form.getFieldsError().filter(({ errors }) => errors.length).length === 0
    ) {
      setIsModalVisible(true)
    }
  }

  const showCancelModal = () => {
    setIsModalCancelVisible(true)
  }

  const handleCancelModal = () => {
    setIsModalCancelVisible(false)
  }

  const handleChangeSelect = (value) => {
    setCategories(value)
    const result = value.map((item) => categoriesSystem.indexOf(item) + 1)
    setReqCategories(result)
    setShowExitPrompt(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    Extensions.unSaveChangeConfirm(showExitPrompt)
  }, [showExitPrompt])

  useEffect(() => {
    if (user.role === 'member') {
      router.push('/login')
    }
  }, [user])

  return (
    <Layout>
      <Layout.Main>
        <h1>メンバ編集</h1>
        <div className="flex flex-col items-center inviteWrapper">
          <Form
            className="w-2/5"
            labelCol={{ span: 8 }}
            labelAlign="right"
            form={form}
            size="large"
          >
            <Form.Item
              name="name"
              label={<p style={{ fontSize: '18px' }}>フルネーム</p>}
              rules={[
                {
                  message: 'この項目は必須です',
                  required: true,
                },
              ]}
            >
              <Input
                onChange={onValueNameChange}
                type="name"
                value={nameInput}
                defaultValue={nameInput}
              />
            </Form.Item>
            <Form.Item
              name="email"
              label={<p style={{ fontSize: '18px' }}>メールアドレス</p>}
              rules={[
                {
                  type: 'email',
                  message: 'メールアドレス有効なメールではありません!',
                  required: true,
                },
              ]}
            >
              <Input
                onChange={onValueEmailChange}
                type="email"
                defaultValue={emailInput}
                value={emailInput}
              />
            </Form.Item>

            <Modal
              title="メンバ編集"
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
              cancelText="いいえ"
              okText="はい"
              centered
            >
              <p className="mb-5">このまま保存してもよろしいですか？ </p>
            </Modal>

            <Form.Item
              name="categories"
              label={<p style={{ fontSize: '18px' }}>カテゴリ</p>}
              rules={[
                {
                  required: false,
                },
              ]}
            >
              <Select
                mode="multiple"
                defaultValue={categories}
                onChange={handleChangeSelect}
                placeholder="カテゴリ"
                size="large"
                className="selectBar"
              >
                {categoriesSystem.map((item) => (
                  <Option key={item}>{item}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <div className="flex justify-end">
                <Modal
                  title="変更は保存されていません。続行してもよろしいですか？"
                  visible={isModalCancelVisible}
                  onOk={handleClick}
                  onCancel={handleCancelModal}
                  cancelText="いいえ"
                  okText="はい"
                  centered
                >
                  <p className="mb-5">このまま保存してもよろしいですか？ </p>
                </Modal>

                <Button size="middle" onClick={showCancelModal}>
                  キャンセル
                </Button>
                <Button
                  size="middle"
                  className="ml-4"
                  type="primary"
                  onClick={showModal}
                >
                  保存
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Layout.Main>
    </Layout>
  )
}

EditMember.getInitialProps = async (ctx) => {
  const { id } = ctx.query
  const res = await MemberApi.getMemberDetail(id)
  const dataRes = res.data
  return { data: dataRes }
}

EditMember.propTypes = {
  data: PropTypes.object.isRequired,
}

export default EditMember
