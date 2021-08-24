import {
  CheckCircleTwoTone,
  ExclamationCircleOutlined,
  ExclamationCircleTwoTone,
} from '@ant-design/icons'
import {
  Button,
  DatePicker, Empty, Form,
  Input,
  List, Modal,
  notification,
  Select,
  Space,
} from 'antd'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import addJFAPI from '../../api/add-jobfair'
import OtherLayout from '../../layouts/OtherLayout'
import * as Extensions from '../../utils/extensions'
// import useUnsavedChangesWarning from '../../components/load_more'
import './style.scss'

const index = () => {
  // page state.
  const [listAdminJF, setlistAdminJF] = useState([])
  const [listSchedule, setlistSchedule] = useState([])
  const [listMilestone, setlistMilestone] = useState([])
  const [listTask, setlistTask] = useState([])
  const [disableBtn, setdisableBtn] = useState(false)
  const [form] = Form.useForm()
  // const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning()
  const router = useRouter()

  // check if all input is empty.
  const checkIsFormInputEmpty = () => {
    // get all input values .
    const inputValues = form.getFieldsValue()
    //  return type :[]
    const inputs = Object.values(inputValues)

    for (let i = 0; i < inputs.length; i += 1) {
      const element = inputs[i]
      if (element) {
        return false
      }
    }
    return true
  }
  useEffect(() => {
    // Extensions.unSaveChangeConfirm(true)

    const fetchAPI = async () => {
      try {
        // TODO: optimize this one by using axios.{all,spread}
        const admins = await addJFAPI.getAdmin()
        const schedules = await addJFAPI.getSchedule()
        setlistAdminJF(Array.from(admins.data))
        setlistSchedule(Array.from(schedules.data))
        // Extensions.unSaveChangeConfirm(true)
        return null
      } catch (error) {
        return Error(error.toString())
      }
    }
    fetchAPI()
  }, [])

  /* utilities function for support handle form */
  // reset form.
  const onFormReset = () => {
    form.resetFields()
    setlistMilestone([])
    setlistTask([])
  }

  const autoConvertHalfwidth = (event) => {
    // get id (name) of the input that invoke this function
    const inputRef = event.target.id
    const dummyObject = {}
    dummyObject[inputRef] = Extensions.toHalfWidth(event.target.value)
    if (inputRef) {
      form.setFieldsValue(dummyObject)
    }
  }
  // route function handle all route in this page.
  const routeTo = async (url) => {
    // await router.prefetch(url)
    // await router.push(url)

    router.prefetch(url)
    router.push(url)
  }

  /* Handle 2 form event when user click  キャンセル button or  登録 button */
  const onFinishFailed = (errorInfo) => errorInfo

  /* handle modal or popup to notifiy to user */

  //  open prompt after cancel button clicked .
  const cancelConfirmModle = () => {
    if (checkIsFormInputEmpty()) {
      routeTo('/jobfairs')
    } else {
      Modal.confirm({
        title: '入力内容が保存されません。よろしいですか？',
        icon: <ExclamationCircleOutlined />,
        content: '',
        onOk: () => {
          onFormReset()
          routeTo('/jobfairs')
        },
        onCancel: () => {},
        centered: true,
        okText: 'はい',
        cancelText: 'いいえ',
      })
    }
  }
  //  open success notification after add jobfair button clicked .
  const saveNotification = () => {
    notification.open({
      icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      duration: 3,
      message: '正常に登録されました。',
      onClick: () => {},
    })
  }

  // handle user click add job fair.
  const onFinishSuccess = async (values) => {
    try {
      Extensions.unSaveChangeConfirm(false)
      const data = {
        name: values.name.toString(),
        schedule_id: values.schedule_id * 1.0,
        start_date: values.start_date.format(Extensions.dateFormat),
        number_of_students: values.number_of_students * 1.0,
        number_of_companies: values.number_of_companies * 1.0,
        jobfair_admin_id: values.jobfair_admin_id * 1.0,
      }
      setdisableBtn(true)

      const response = await addJFAPI.addJF(data)
      if (response.status < 299) {
        await saveNotification()
        routeTo(`/jf-toppage/${response.data.id}`)
      } else {
        setdisableBtn(false)
      }
      return response
    } catch (error) {
      setdisableBtn(false)
      const errorResponse = JSON.parse(error.request.response)
      if (errorResponse.message.toLocaleLowerCase().includes('duplicate')) {
        notification.open({
          icon: <ExclamationCircleTwoTone twoToneColor="#BB371A" />,
          duration: 3,
          message: errorResponse.errors.name[0],
          onClick: () => {},
        })
      } else {
        notification.open({
          icon: <ExclamationCircleTwoTone twoToneColor="#BB371A" />,
          duration: 3,
          message: errorResponse.errors.name[0],
          onClick: () => {},
        })
      }
      // console.log(JSON.parse(error.request.response).errors.name[0])
      return error
    }
  }
  /* handle jobfair schedule selector change .  */
  // call api get milestone  when selector change schedule.
  const getMilestone = async (id) => {
    const milestones = await addJFAPI.getMilestone(id)
    if (milestones.data.milestones) {
      setlistMilestone(Array.from(milestones.data.milestones))
    }
  }

  // call api get milestone  when selector change schedule
  const getTask = async (id) => {
    const tasks = await addJFAPI.getTaskList(id)
    if (tasks.data.template_tasks) {
      setlistTask(Array.from(tasks.data.template_tasks))
    }
  }

  // handle when ever selector change.
  const onScheduleSelect = (_, event) => {
    const scheduleId = event.key

    getMilestone(scheduleId)
    getTask(scheduleId)
  }
  const checkIsJFNameExisted = async () => {
    try {
      const name = form.getFieldValue('name')
      if (name) {
        const response = await addJFAPI.isJFExisted({ name })

        if (response.data.length) {
          document.getElementById('validate_name').style.border = '1px solid red'
          return document.getElementById('error-msg').removeAttribute('hidden')
        }
      }
      return false
    } catch (error) {
      return error
    }
  }

  /* Validator of all input. */
  const JFNameValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('この項目は必須です'))
    }
    // if (value) {
    //   if (checkIsJFNameExisted()) {
    //     return Promise.reject(new Error('JF名はすでに存在します'))
    //   }
    // }
    // check case when user type special characters

    if (value.match(Extensions.Reg.specialCharacter)) {
      return Promise.reject(new Error('使用できない文字が含まれています'))
    }

    // if (value.match(Extensions.Reg.vietnamese)) {
    //   return Promise.reject(new Error('ベトナム語は入力できない'))
    // }
    if (value.match(Extensions.Reg.onlyNumber)) {
      return Promise.reject(new Error('数字のみを含めることはできない'))
    }

    return Promise.resolve()
  }

  const startDayValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('この項目は必須です'))
    }

    // if (value.match(/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]*$/)) {
    //   return Promise.reject(new Error("使用できない文字が含まれています"));
    // }
    return Promise.resolve()
  }
  const companiesJoinValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('この項目は必須です'))
    }
    if (value <= 0) {
      return Promise.reject(new Error('1以上の半角の整数で入力してください'))
    }
    // check case when user set number of company that join JF smaller than 1
    if (Extensions.isFullWidth(value)) {

      // return Promise.reject(new Error('1以上の半角の整数で入力してください'))
    }
    // setinputTest(Extention.toHalfWidth(value.toString()))
    if (!value.match(Extensions.Reg.onlyNumber)) {
      return Promise.reject(new Error('使用できない文字が含まれています。'))
    }

    return Promise.resolve()
  }
  const studentsJoinValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('この項目は必須です'))
    }
    if (value <= 0) {
      return Promise.reject(new Error('1以上の半角の整数で入力してください'))
    }
    if (!value.match(Extensions.Reg.onlyNumber)) {
      return Promise.reject(new Error('使用できない文字が含まれています。'))
    }

    if (Extensions.isFullWidth(value)) {
      return Promise.reject(new Error('1以上の半角の整数で入力してください'))
    }

    return Promise.resolve()
  }
  const JFAdminValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('この項目は必須です'))
    }

    return Promise.resolve()
  }
  const JFScheduleValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('この項目は必須です'))
    }
    return Promise.resolve()
  }
  /* Validator of all input end */

  return (
    <OtherLayout>
      <OtherLayout.Main>
        <div className="addJF-page">
          {/* JF名 戻る JF-スケジュール 管理者 開始日 参加企業社数  推定参加学生数 タスク一賜 マイルストーン一覧 */}
          <div className="container mx-auto flex-1 justify-center px-4  pb-20">
            {/* page title */}
            <h1 className="text-3xl">JF追加 </h1>
            <div>
              <div className="container">
                <Form
                  form={form}
                  labelCol={{
                    span: 6,
                  }}
                  wrapperCol={{
                    span: 14,
                  }}
                  layout="horizontal"
                  colon={false}
                  initialValues={{ defaultInputValue: 0 }}
                  onFinish={onFinishSuccess}
                  onFinishFailed={onFinishFailed}

                >
                  {/* jobfair name */}
                  <Form.Item
                    label="JF名"
                    required
                  >
                    <Form.Item
                      name="name"
                      noStyle
                      rules={[
                        {
                          validator: JFNameValidator,
                        },
                      ]}
                    >
                      <Input
                        type="text"
                        id="validate_name"
                        onBlur={checkIsJFNameExisted}
                        onChange={() => {
                          document.getElementById('error-msg').setAttribute('hidden', 'true')
                          document.getElementById('validate_name').style.border = '1px solid #e5e7eb'
                        }}
                        placeholder="JF名を入力する"
                        maxLength={200}
                      />

                    </Form.Item>

                    <span id="error-msg" style={{ color: '#ff3860', fontSize: '14px' }} className="text-red-600" hidden>この名前はすでに存在します</span>
                  </Form.Item>
                  {/* start date */}
                  <Form.Item
                    required
                    name="start_date"
                    label="開始日"
                    // hasFeedback
                    rules={[
                      {
                        validator: startDayValidator,
                      },
                    ]}
                  >
                    <DatePicker
                      help="Please select the correct date"
                      className="py-2"
                      // style={{ backgroundColor: '#e3f6f5' }}
                      format={Extensions.dateFormat}
                      placeholder={Extensions.dateFormat}

                    // disable date in the past
                    // disabledDate={(current) => {
                    //   return current < moment();
                    // }}
                    />
                  </Form.Item>

                  {/* number of companies */}
                  <Form.Item
                    required
                    // hasFeedback
                    label="参加企業社数"
                    name="number_of_companies"
                    rules={[
                      {
                        validator: companiesJoinValidator,
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      size="large"
                      min={1}
                      onChange={autoConvertHalfwidth}
                      style={{ width: '130px' }}
                      placeholder="参加企業社数"
                    />
                  </Form.Item>

                  {/* number of students */}
                  <Form.Item
                    required
                    // hasFeedback
                    name="number_of_students"
                    label="推定参加学生数"
                    rules={[
                      {
                        validator: studentsJoinValidator,
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      size="large"
                      min={1}
                      onChange={autoConvertHalfwidth}
                      style={{ width: '130px' }}
                      placeholder="推定参加学生数"
                    />
                  </Form.Item>

                  {/* jobfair admin */}
                  <Form.Item
                    required
                    // hasFeedback
                    label="管理者"
                    name="jobfair_admin_id"
                    rules={[
                      {
                        validator: JFAdminValidator,
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      className="addJF-selector"
                      placeholder="管理者を選択"
                    >
                      {listAdminJF.map((element) => (
                        <Select.Option key={element.id} value={element.id}>
                          {element.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* jobfair schedule */}
                  <Form.Item
                    required
                    // hasFeedback
                    name="schedule_id"
                    label="JF-スケジュール"
                    rules={[
                      {
                        validator: JFScheduleValidator,
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      className="addJF-selector"
                      placeholder="JF-スケジュールを選択"
                      onSelect={onScheduleSelect}
                    >
                      {listSchedule.map((element) => (
                        <Select.Option key={element.id} value={element.id}>
                          {element.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* list milestones */}
                  <Form.Item label=" ">
                    <span className="label">マイルストーン一覧</span>
                    <List
                      className="demo-infinite-container"
                      bordered
                      locale={
                        { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="データがありません" /> }
                      }
                      // style={{ backgroundColor: '#e3f6f5' }}
                      size="small"
                      dataSource={listMilestone}
                      renderItem={(item) => (
                        <List.Item className="list-items" key={item.id}>
                          {item.name}
                        </List.Item>
                      )}
                    />
                  </Form.Item>

                  {/* list task */}
                  <Form.Item label=" ">
                    <span className="label">タスク一賜</span>
                    <List
                      className="demo-infinite-container"
                      bordered
                      // style={{ backgroundColor: '#e3f6f5' }}
                      size="small"
                      locale={
                        { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="データがありません" /> }
                      }
                      dataSource={listTask}
                      renderItem={(item) => (
                        <List.Item className="list-items" key={item.id}>
                          {item.name}
                        </List.Item>
                      )}
                    />
                  </Form.Item>

                  {/* 2 button */}
                  <Form.Item
                    label=" "
                    className="my-10"

                  >
                    <Space size={20} className="flex justify-end">
                      <Button
                        htmlType="button"
                        className="ant-btn"
                        onClick={cancelConfirmModle}
                        disabled={disableBtn}
                        loading={disableBtn}
                      >
                        キャンセル
                      </Button>
                      {/* --------------------------- */}
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={disableBtn}
                        loading={disableBtn}
                        style={{ letterSpacing: '-1px' }}
                      >
                        登録
                      </Button>
                    </Space>
                  </Form.Item>
                  {/* end form */}
                </Form>
              </div>
            </div>
          </div>
        </div>
      </OtherLayout.Main>
    </OtherLayout>
  )
}

export default index
