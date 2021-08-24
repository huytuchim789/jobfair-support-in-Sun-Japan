import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Select, Modal, notification } from 'antd'
// import { useRouter } from 'next/router'
import CancelEditMilestone from '../../../../components/CancelEditMilestone'
import OtherLayout from '../../../../layouts/OtherLayout'
import { updateMilestone, getMilestone, getNameExitEdit } from '../../../../api/milestone'
import './styles.scss'

const toHalfWidth = (v) => v.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))

const EditMilestonePage = () => {
  // {query['id']}
  const [nameInput, setNameInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [typePeriodInput, setTypePeriodInput] = useState(0)
  const [checkSpace, setcheckSpace] = useState(false)
  const [form] = Form.useForm()
  const [errorUnique, setErrorUnique] = useState(false)

  // fetch data
  useEffect(async () => {
    const temp = /[/](\d+)[/]/.exec(window.location.pathname)
    const id = `${temp[1]}`
    getMilestone(id).then((res) => {
      setNameInput(res.data.name)
      setTimeInput(res.data.period.toString())
      setTypePeriodInput(res.data.is_week)

      form.setFieldsValue({
        name: res.data.name,
        time: res.data.period,
      })
    })
  }, [])

  const [isModalVisible, setIsModalVisible] = useState(false)
  const { Option } = Select

  const openNotificationSuccess = () => {
    notification.success({
      message: '変更は正常に保存されました。',
      duration: 0,

    })
    setTimeout(() => { window.location.href = '/milestones' }, 3000)
  }

  const onValueNameChange = (e) => {
    setcheckSpace(false)
    setErrorUnique(false)
    setNameInput(e.target.value)
    form.setFieldsValue({
      name: toHalfWidth(e.target.value),
    })
  }
  const onValueTimeChange = (e) => {
    setcheckSpace(false)
    setTimeInput(e.target.value)
    form.setFieldsValue({
      time: toHalfWidth(e.target.value),
    })
  }

  const showModal = () => {
    if (nameInput !== '' && timeInput !== '' && timeInput >= 0 && checkSpace === false && errorUnique === false) {
      setIsModalVisible(true)
    } else {
      const temp = /[/](\d+)[/]/.exec(window.location.pathname)
      const id = `${temp[1]}`
      const name = nameInput
      if (name !== '') {
        getNameExitEdit(id, name).then((res) => {
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
  }

  const handleOk = () => {
    setIsModalVisible(false)
    const temp = /[/](\d+)[/]/.exec(window.location.pathname)
    const id = `${temp[1]}`
    updateMilestone(id, {
      name: nameInput,
      period: timeInput,
      is_week: typePeriodInput,
    }).then(() => openNotificationSuccess())
      .catch((error) => {
        if (JSON.parse(error.response.request.response).errors.name[0] === 'The name has already been taken.') {
          notification.error({
            message: 'このマイルストーン名は存在しています',
          })
        }
      })
  }
  const onBlur = () => {
    const temp = /[/](\d+)[/]/.exec(window.location.pathname)
    const id = `${temp[1]}`
    const name = nameInput
    if (name !== '') {
      getNameExitEdit(id, name).then((res) => {
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

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const selectAfter = (
    <Select
      className="select-after"
      onChange={(value) => {
        setTypePeriodInput(parseInt(value, 10))
      }}
      value={typePeriodInput.toString()}
    >
      <Option value="0">日後</Option>
      <Option value="1">週間後</Option>

    </Select>
  )
  const specialCharRegex = new RegExp('[ 　]')

  return (
    <div>
      <OtherLayout>
        <OtherLayout.Main>
          {/* <p className="title mb-8" style={{ color: '#2d334a', fontSize: '36px' }}>マイルストーン編集</p> */}
          <h1 className="title">
            マイルストーン編集
          </h1>
          <div className="h-screen flex flex-col items-center pt-10 bg-white my-8">
            <Form
              form={form}
              name="basic"
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 12,
              }}
              className="space-y-12 w-1/2 justify-items-center"
              size="large"
            >
              <Form.Item
                label={
                  <p style={{ margin: 0 }}>マイルストーン名</p>
                }
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'この項目は必須です。',
                  },
                  () => ({
                    validator(_, value) {
                      if (specialCharRegex.test(value)) {
                        setcheckSpace(true)
                        return Promise.reject(new Error('マイルストーン名はスペースが含まれていません。'))
                      }

                      return Promise.resolve()
                    },

                  }),
                ]}
              >
                <Input
                  type="text"
                  size="large"
                  onChange={onValueNameChange}
                  onBlur={onBlur}
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

                  () => ({
                    validator(_, value) {
                    //   if (value < 0) {
                    //     return Promise.reject(new Error('半角の整数で入力してください。'))
                    //   }
                      if (specialCharRegex.test(value)) {
                        setcheckSpace(true)
                      }
                      return Promise.resolve()
                    },

                  }),
                ]}
              >
                <Input
                  className="inputNumber"
                  type="text"
                  size="large"
                  addonAfter={selectAfter}
                  onChange={onValueTimeChange}
                />

              </Form.Item>

              <Modal
                title="マイルストーン編集"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                cancelText="いいえ"
                okText="はい"
              >
                <p className="mb-5">このまま保存してもよろしいですか？ </p>
              </Modal>
              <div className="grid grid-cols-12 grid-rows-1 gap-x-5">
                <div className="col-span-8 justify-self-end">
                  <Form.Item>
                    <CancelEditMilestone />
                  </Form.Item>
                </div>
                <div>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={showModal}
                      className="w-32"
                    >
                      保存
                    </Button>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </OtherLayout.Main>
      </OtherLayout>
    </div>
  )
}

export default EditMilestonePage
