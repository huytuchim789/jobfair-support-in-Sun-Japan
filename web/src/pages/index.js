import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, Modal, notification } from 'antd'
import { useRouter } from 'next/router'
import Layout from '~/layouts/Default'
import { login, sendLinkResetPassword } from '~/api/authenticate'

const LoginPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDisableOk, setDisableOk] = useState(true)
  const [, forceUpdate] = useState({})
  const [form] = Form.useForm()
  const [form2] = Form.useForm()
  const router = useRouter()

  // To disable submit button at the beginning.
  useEffect(() => {
    forceUpdate({})
  }, [])

  /* eslint-disable no-template-curly-in-string */
  const validateMessages = {
    required: '${label}を入力してください。',
    types: {
      email: 'メールアドレスを正しく入力してください。',
      string: '',
    },
    string: {
      range: 'パスワードは${min}文字以上${max}文字以下で入力してください。',
    },
  }
  /* eslint-enable no-template-curly-in-string */

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      duration: 2.5,
    })
  }

  const onFinish = async (values) => {
    try {
      const response = await login(values)
      if (response.request.status === 200) openNotification('success', '正常にログインしました')
      setTimeout(() => {
        router.push('/top-page')
      }, 2500)
    } catch (error) {
      if (error.request.status === 400) {
        openNotification(
          'error',
          'メールアドレスもしくはパスワードが間違っています',
        )
      }
    }
  }

  const onChangeDisableOk = () => {
    setDisableOk(
      !form2.isFieldTouched('reset-email')
        || !!form2.getFieldsError().filter(({ errors }) => errors.length).length,
    )
  }

  const onFinishFailed = (errorInfo) => {
    openNotification('error', errorInfo)
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    setIsModalVisible(false)
    try {
      const response = await sendLinkResetPassword(
        form2.getFieldValue('reset-email'),
      )
      if (response.request.status === 200) {
        openNotification(
          'success',
          'メールは正常に送信されました',
          'メールを確認してください。',
        )
      }
    } catch (error) {
      if (error.request.status === 400) openNotification('error', 'メールが存在しません')
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <Layout>
      <Layout.Main>
        <div className="h-screen flex flex-col items-center pt-10 bg-white">
          <img src="./logo.png" className="w-24" alt="logo" />
          <p className="text-3xl my-8">Jobfair サポート</p>
          <Form
            form={form}
            name="login"
            initialValues={{
              remember: false,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            className="w-96"
            validateMessages={validateMessages}
          >
            <Form.Item
              label="メールアドレス"
              name="email"
              rules={[{ required: true }, { type: 'email' }]}
            >
              <Input
                type="email"
                placeholder="メールアドレスを入力してください。"
              />
            </Form.Item>

            <Form.Item
              label="パスワード"
              name="password"
              rules={[{ required: true }, { type: 'string', min: 8, max: 24 }]}
            >
              <Input.Password placeholder="パスワードを入力してください。" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <div className="flex justify-between item-center">
                <Checkbox>ログインしたままにする</Checkbox>
                <a className="text-blue-600" onClick={showModal}>
                  パスワードをお忘れの方
                </a>
              </div>
            </Form.Item>

            <Modal
              title="パスワード変更"
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
              cancelText="キャンセル"
              okButtonProps={{
                disabled: isDisableOk,
              }}
              centered
            >
              <Form
                form={form2}
                name="reset-password"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
                onValuesChange={onChangeDisableOk}
                validateMessages={validateMessages}
              >
                <Form.Item
                  label="メールアドレス"
                  name="reset-email"
                  rules={[{ required: true }, { type: 'email' }]}
                >
                  <Input
                    type="email"
                    placeholder="メールアドレスを入力してください。"
                  />
                </Form.Item>
              </Form>
            </Modal>

            <Form.Item shouldUpdate>
              {() => (
                <div className="flex justify-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="text-base px-14"
                    disabled={
                      !(
                        form.isFieldTouched('email')
                        && form.isFieldTouched('password')
                      )
                      || !!form
                        .getFieldsError()
                        .filter(({ errors }) => errors.length).length
                    }
                  >
                    ログイン
                  </Button>
                </div>
              )}
            </Form.Item>
          </Form>
        </div>
      </Layout.Main>
    </Layout>
  )
}

export default LoginPage
