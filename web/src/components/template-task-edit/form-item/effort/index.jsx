import React from 'react'
import { Form, Input, Select, Space } from 'antd'
import PropTypes from 'prop-types'

const { Option } = Select

const toHalfWidth = (v) => v.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))

const Effort = ({
  form,
  unitData,
  isDayData,
  setCheckSpace,
  setInput,
  setUnit,
  setIsDay,
}) => {
  const numberInputValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('この項目は必須です'))
    }
    if (Number.isNaN(Number(value))) {
      return Promise.reject(new Error('Input must be a validate number'))
    }
    if (Number(value) <= 0) {
      return Promise.reject(new Error('0以上の半角の整数で入力してください'))
    }

    return Promise.resolve()
  }

  const onValueNameChange = (e) => {
    setCheckSpace(false)
    setInput(e.target.value)
    form.setFieldsValue({
      effort: toHalfWidth(e.target.value),
    })
  }
  const onValueIsDayChange = (value) => {
    setCheckSpace(false)
    setIsDay(isDayData.find((o) => o.name === value).id)
    form.setFieldsValue({
      is_day: toHalfWidth(value),
    })
  }
  const onValueUnitChange = (value) => {
    setCheckSpace(false)
    setUnit(unitData.find((o) => o.name === value).submit)
    form.setFieldsValue({
      unit: toHalfWidth(value),
    })
  }
  return (
    <Form.Item
      label="工数"
      name="effort"
      labelAlign="left"
      className="justify-evenly"
      rules={[
        {
          // required: true,
          // message: 'この項目は必須です。',
          validator: numberInputValidator,
        },

        // {
        //   pattern: /^(?:\d*)$/,
        //   message: '０以上の半角の整数で入力してください。',
        // },

        // () => ({
        //   validator(_, value) {
        //     // if (value < 0) {
        //     //   return Promise.reject(
        //     //     new Error('半角の整数で入力してください。')
        //     //   );
        //     // }
        //     if (specialCharRegex.test(value)) {
        //       setCheckSpace(true);
        //     }
        //     return Promise.resolve();
        //   },
        // }),
      ]}
    >
      <div className="flex flex-row justify-between ">
        <Form.Item name="effort" className="w-1/2 max-w-xs flex-1">
          <Input
            type="text"
            placeholder=""
            style={{ width: '80px' }}
            onChange={onValueNameChange}
          />
        </Form.Item>
        <Space>
          <Form.Item name="is_day">
            <Select
              placeholder="時間"
              style={{ width: '150px' }}
              onChange={onValueIsDayChange}
            >
              {isDayData.map((element) => (
                <Option key={element.id} value={element.name}>
                  {element.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <p className="slash-devider text-2xl font-extrabold mb-7"> / </p>

          <Form.Item name="unit">
            <Select
              placeholder="学生数"
              style={{ width: '150px' }}
              onChange={onValueUnitChange}
            >
              {unitData.map((element) => (
                <Option key={element.id} value={element.name}>
                  {element.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Space>
      </div>
    </Form.Item>
  )
}

export default Effort

Effort.propTypes = {
  form: PropTypes.object.isRequired,
  unitData: PropTypes.array.isRequired,
  isDayData: PropTypes.array.isRequired,
  setCheckSpace: PropTypes.func.isRequired,
  setInput: PropTypes.func.isRequired,
  setUnit: PropTypes.func.isRequired,
  setIsDay: PropTypes.func.isRequired,
}
