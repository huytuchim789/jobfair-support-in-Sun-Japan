import React from 'react'
import { Form, Input, Button, notification } from 'antd'
import { useRouter } from 'next/router'
import Layout from '~/layouts/Default'
import { updatePassword } from '~/api/authenticate'
import './style.scss'

const ResetPage = () => {
  const [form] = Form.useForm()
  const router = useRouter()
  const { token } = router.query

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      duration: 2.5,
    })
  }

  /* eslint-disable no-template-curly-in-string */
  const validateMessages = {
    required: '${label}を入力してください。',
    types: {
      string: '',
    },
    string: {
      range: 'パスワードは${min}文字以上${max}文字以下で入力してください。',
    },
  }
  /* eslint-enable no-template-curly-in-string */

  const onFinish = async (values) => {
    const data = {
      token,
      password: values.confirm_password,
    }
    // console.log(data);
    try {
      const response = await updatePassword(data)
      if (response.request.status === 200) openNotification('success', 'パスワードを正常に変更しました')
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } catch (error) {
      if (error.request.status === 400) {
        openNotification('error', 'パスワードを正常に変更しません')
      }
    }
  }

  const onFinishFailed = (errorInfo) => {
    openNotification('error', errorInfo)
  }

  return (
    <Layout>
      <Layout.Main>
        <div className="h-screen flex flex-col items-center pt-10 bg-white">
          <img src="./logo.png" className="w-24" alt="logo" />
          <p className="text-3xl my-8">ログインパスワード変更</p>
          <Form
            form={form}
            name="reset_password"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            className="w-96"
            validateMessages={validateMessages}
          >
            <Form.Item
              label="新しいパスワード"
              name="password"
              rules={[{ required: true }, { type: 'string', min: 8, max: 24 }]}
              hasFeedback
            >
              <Input.Password placeholder="新しいパスワードを入力してください。" />
            </Form.Item>

            <Form.Item
              label="パスワード確認用"
              name="confirm_password"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(
                      new Error(
                        '新しいパスワードとパスワード確認用が一致しません。',
                      ),
                    )
                  },
                }),
              ]}
            >
              <Input.Password placeholder="パスワード確認用を入力してください。" />
            </Form.Item>

            <Form.Item shouldUpdate>
              {() => (
                <div className="flex justify-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="text-base px-14"
                    disabled={
                      !(
                        form.isFieldTouched('password')
                        && form.isFieldTouched('confirm_password')
                      )
                      || !!form
                        .getFieldsError()
                        .filter(({ errors }) => errors.length).length
                    }
                  >
                    保存
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

export default ResetPage
