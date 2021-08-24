import React from 'react'
import { Form, Input } from 'antd'
import './style.scss'
import PropTypes from 'prop-types'
import { getTemplateTasksList } from '../../../../api/template-task-edit'

const toHalfWidth = (v) => v.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))

let tasksList = []
getTemplateTasksList().then((res) => {
  tasksList = [...res.data]
})

const ItemInput = ({ form, label, name, setCheckSpace, setInput }) => {
  const specialCharRegex = new RegExp('[@!?$%]')
  const onValueNameChange = (e) => {
    setCheckSpace(false)
    setInput(e.target.value)
    const temp = {}
    temp[name] = toHalfWidth(e.target.value)
    form.setFieldsValue(temp)
  }
  return (
    <Form.Item
      label={label}
      labelAlign="left"
      name={name}
      className="justify-evenly"
      rules={[
        {
          required: true,
          message: 'この項目は必須です。',
        },
        () => ({
          validator(_, value) {
            if (specialCharRegex.test(value)) {
              setCheckSpace(true)
              return Promise.reject(
                new Error('使用できない文字が含まれています'),
              )
            }
            const temp = /[/](\d+)[/]/.exec(window.location.pathname)
            const id = `${temp[1]}`
            if ((tasksList.find((item) => item.name === value)) !== undefined) {
              if ((tasksList.find((item) => item.name === value)).id !== Number(id)) {
                return Promise.reject(
                  new Error('このマイルストーン名は存在しています'),
                )
              }
            }

            return Promise.resolve()
          },
        }),
      ]}
    >
      <Input
        type="text"
        onChange={onValueNameChange}
        placeholder={label}
      />
    </Form.Item>
  )
}

export default ItemInput

ItemInput.propTypes = {
  form: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  setCheckSpace: PropTypes.func.isRequired,
  setInput: PropTypes.func.isRequired,
}
