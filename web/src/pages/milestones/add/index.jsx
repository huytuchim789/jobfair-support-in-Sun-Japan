import React, { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Select,
  Modal,
  notification,
} from 'antd'
import OtherLayout from '../../../layouts/OtherLayout'
import { addMilestone, getNameExitAdd } from '../../../api/milestone'

export default function AddMilestonePage() {
  const [form] = Form.useForm()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isModalVisibleOfBtnCancel, setIsModalVisibleOfBtnCancel] = useState(false)
  const [typePeriodInput, setTypePeriodInput] = useState(0)
  const [nameInput, setNameInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [errorUnique, setErrorUnique] = useState(false)

  const { Option } = Select

  function toHalfWidth(fullWidthStr) {
    return fullWidthStr.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
  }

  const openNotificationSuccess = () => {
    notification.success({
      message: '正常に保存されました。',
    })
    setTimeout(() => {
      window.location.href = '/milestones'
    }, 3000)
  }

  const showModal = () => {
    if (
      !(form.isFieldTouched('name') && form.isFieldTouched('time'))
      || !!form.getFieldsError().filter(({ errors }) => errors.length).length
      || errorUnique === true
    ) {
      setIsModalVisible(false)
      const name = nameInput
      if (name !== '') {
        getNameExitAdd(name).then((res) => {
          if (res.data.length !== 0) {
            // setErrorUnique(true)
            form.setFields([
              {
                name: 'name',
                errors: ['このマイルストーン名は存在しています。'],
              },
            ])
          }
        })
      }
    } else {
      setIsModalVisible(true)
    }
  }

  const handleOk = () => {
    form.submit()
    setIsModalVisible(false)
    addMilestone({
      name: nameInput,
      period: timeInput,
      is_week: typePeriodInput,
    })
      .then(() => openNotificationSuccess())
      .catch((error) => {
        if (
          JSON.parse(error.response.request.response).errors.name[0]
          === 'The name has already been taken.'
        ) {
          notification.error({
            message: 'このマイルストーン名は存在しています',
          })
        }
      })
  }
  const onBlur = () => {
    const name = nameInput
    if (name !== '') {
      getNameExitAdd(name).then((res) => {
        if (res.data.length !== 0) {
          setErrorUnique(true)
          form.setFields([
            {
              name: 'name',
              errors: ['このマイルストーン名は存在しています。'],
            },
          ])
        }
      })
    }
  }

  const onValueNameChange = (e) => {
    setErrorUnique(false)
    setNameInput(e.target.value)
    form.setFieldsValue({
      name: toHalfWidth(e.target.value),
    })
  }
  const onValueTimeChange = (e) => {
    setTimeInput(e.target.value)
    form.setFieldsValue({
      time: toHalfWidth(e.target.value),
    })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const showModalOfBtnCancel = () => {
    setIsModalVisibleOfBtnCancel(true)
  }

  const handleCancelOfBtnCancel = () => {
    setIsModalVisibleOfBtnCancel(false)
  }

  const selectAfter = (
    <Form.Item name="typePeriod" noStyle>
      <Select
        className="select-after"
        onChange={(value) => {
          setTypePeriodInput(parseInt(value, 10))
        }}
        value={typePeriodInput.toString()}
        style={{
          width: 90,
        }}
      >
        <Option value="0">日後</Option>
        <Option value="1">週間後</Option>
      </Select>
    </Form.Item>
  )

  const blockInvalidChar = (e) => ['e', 'E', '+'].includes(e.key) && e.preventDefault()

  return (
    <>
      <OtherLayout>
        <OtherLayout.Main>
          {/* <p className="title mb-8" style={{ color: '#2d334a', fontSize: '36px' }}>
            マイルストーン追加
          </p> */}

          <h1 className="title">
            マイルストーン追加
          </h1>

          <div className="pt-10">
            <Form
              form={form}
              name="addMilestone"
              // onFinish={onFinish}
              initialValues={{
                typePeriod: '0',
              }}
              size="large"
              className="space-y-12"
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 6 }}
            >
              <Form.Item
                label={(
                  <p style={{ margin: 0 }}>
                    マイルストーン名
                  </p>
                )}
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'この項目は必須です。',
                  },

                  {
                    validator(_, value) {
                      const specialCharRegex = new RegExp('[ 　]')
                      if (specialCharRegex.test(value)) {
                        return Promise.reject(
                          new Error(
                            'マイルストーン名はスペースが含まれていません。',
                          ),
                        )
                      }

                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Input
                  className="w-full"
                  onBlur={onBlur}
                  onChange={onValueNameChange}
                  placeholder="マイルストーン名"
                />
              </Form.Item>
              <Form.Item
                label={
                  <p style={{ margin: 0 }}>期日</p>
                }
                name="time"
                rules={[
                  {
                    required: true,
                    message: 'この項目は必須です。',
                  },

                  {
                    pattern: /^(?:\d*)$/,
                    message: '０以上の半角の整数で入力してください。',
                  },
                ]}
              >
                <Input
                  /* type="number" */
                  type="text"
                  placeholder="期日"
                  addonAfter={selectAfter}
                  onKeyDown={blockInvalidChar}
                  onChange={onValueTimeChange}
                  min={0}
                />
              </Form.Item>
              <div className="grid grid-cols-12 grid-rows-1 mt-5 gap-x-5">
                <div className="col-span-7 justify-self-end">
                  <Form.Item>
                    <Button
                      onClick={showModalOfBtnCancel}
                      className="w-32"
                    >
                      キャンセル
                    </Button>
                  </Form.Item>
                </div>
                <div>
                  <Form.Item>
                    <Button
                      type="primary"
                      className="w-32"
                      onClick={showModal}
                      htmlType="submit"
                    >
                      登録
                    </Button>
                  </Form.Item>
                </div>
              </div>
              <Modal
                title="マイルストーン追加"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="はい"
                cancelText="いいえ"
              >
                <p className="mb-5">このまま保存してもよろしいですか？</p>
              </Modal>
              <Modal
                title="マイルストーン追加"
                visible={isModalVisibleOfBtnCancel}
                onCancel={handleCancelOfBtnCancel}
                footer={[
                  <Button key="back" onClick={handleCancelOfBtnCancel}>
                    いいえ
                  </Button>,
                  <Button key="submit" type="primary" href="../milestones">
                    はい
                  </Button>,
                ]}
              >
                <p className="mb-5">
                  変更内容が保存されません。よろしいですか？
                </p>
              </Modal>
            </Form>
          </div>
        </OtherLayout.Main>
      </OtherLayout>
    </>
  )
}
