import React from 'react'
import { Form, Select, Tag, Tooltip } from 'antd'
import './style.scss'
import PropTypes from 'prop-types'
import { getTemplateTasksList } from '../../../../api/template-task-edit'

const { Option } = Select

const toHalfWidth = (v) => {
  const newArr = []
  for (let i = 0; i < v.length; i += 1) {
    newArr.push(
      v[i].replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)),
    )
  }
  return newArr
}

let tasksList = []
getTemplateTasksList().then((res) => {
  tasksList = [...res.data]
})

const ItemMultipleDropdown = ({
  form,
  label,
  name,
  options,
  selectedItems,
  setSelectedItems,
}) => {
  const onValueNameChange = (value) => {
    const newArray = options.filter((o) => value.includes(o.name))

    setSelectedItems(newArray)
    const temp = {}
    temp[name] = toHalfWidth(value)
    form.setFieldsValue(temp)
  }
  return (
    <div className="">
      <Form.Item
        label={label}
        name={name}
        // style={{ display: 'flex', flexDirection: 'column', marginBottom: '3rem' }}
        className="justify-evenly"
        labelAlign="left"
      >
        <Select
          showArrow
          mode="multiple"
          placeholder={label}
          className="overflow-hidden w-full"
          maxTagCount="responsive"
          defaultValue={selectedItems.map((item) => item.name)}
          onChange={onValueNameChange}
          tagRender={tagRender}
        >
          {options.map((item) => (
            <Option key={item.id} value={item.name}>
              {item.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </div>
  )
}

function tagRender(props) {
  const { label, value, closable, onClose } = props
  const handleClick = (e) => {
    e.preventDefault()
    const id = tasksList.find((item) => item.name === e.target.innerHTML).id
    window.location.href = `/template-tasks/${id}`
  }
  const onPreventMouseDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }
  if (label.length > 20) {
    return (
      <Tag
        color={value}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        <Tooltip title={label}>
          <span
            className="inline-block text-blue-400  cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis"
            style={{ maxWidth: '18ch' }}
            onClick={handleClick}
          >
            {label}
          </span>
        </Tooltip>
      </Tag>
    )
  }
  return (
    <Tag
      color={value}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}
    >
      <span
        className="inline-block text-blue-400 cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis"
        onClick={handleClick}
      >
        {label}
      </span>
    </Tag>
  )
}

export default ItemMultipleDropdown

ItemMultipleDropdown.propTypes = {
  form: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  setSelectedItems: PropTypes.func.isRequired,
}
