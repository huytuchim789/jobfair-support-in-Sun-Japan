/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import 'antd/dist/antd.css'
import React, { useState, useEffect } from 'react'
import { Modal, Form, notification, Input } from 'antd'
import { EditTwoTone } from '@ant-design/icons'
import { updateCategory, getCategories, checkUniqueEdit } from '../../api/category'

const EditCategory = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [nameInput, setNameInput] = useState({})
  const [checkSpace, setcheckSpace] = useState(false)
  const [form] = Form.useForm()
  const specialCharRegex = new RegExp('[ 　]')
  const [reload, setReload] = useState(false)
  const role = props.role

  function toHalfWidth(fullWidthStr) {
    return fullWidthStr.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
  }

  useEffect(async () => {
    const id = props.record.id
    getCategories(id).then((res) => {
      setNameInput(res.data.name)
      form.setFieldsValue({
        name: res.data.name,
      })
    })
  }, [])

  const setReloadPage = () => {
    props.reloadPage()
  }

  const openNotificationSuccess = () => {
    notification.success({
      message: '変更は正常に保存されました。',
      duration: 3,
    })
    setIsModalVisible(false)
    setReloadPage()
  }

  // onBlur
  const onBlur = () => {
    const name = nameInput
    const id = props.record.id
    console.log(name)
    if (name !== '') {
      checkUniqueEdit(id, name).then((res) => {
        if (res.data.length !== 0) {
          console.log('duplicated')
          console.log(form.getFieldValue('name'))
          form.setFields([
            {
              name: 'name',
              errors: ['このカテゴリ名は存在しています'],
            },
          ])
        }
      })
    }
  }

  const onValueNameChange = (e) => {
    setcheckSpace(false)
    setNameInput(e.target.value)
    form.setFieldsValue({
      name: toHalfWidth(e.target.value),
    })
  }

  const showModal = (e) => {
    setIsModalVisible(true)
  }

  const handleOk = () => {
    if (role === 'superadmin') {
      const id = props.record.id
      updateCategory(id, {
        category_name: nameInput,
      }).then(() => openNotificationSuccess())
        .catch((error) => {
          notification.error({
            message: 'このカテゴリ名は存在しています',
          })
        })
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <>
      <EditTwoTone onClick={showModal} />
      <Modal
        title="カテゴリ編集"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="保存"
        cancelText="キャンセル"
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={
              <span>カテゴリ名</span>
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
                    return Promise.reject(new Error('カテゴリ名はスペースが含まれていません。'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input
              type="text"
              required="required"
              className="input-category"
              style={{ width: '-webkit-fill-available', paddingLeft: 10 }}
              onChange={onValueNameChange}
              onBlur={onBlur}
              placeholder="カテゴリ名を書いてください"
              defaultValue={props.record.name}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default EditCategory
