import React, { useEffect, useState } from 'react'
import {
  CheckCircleTwoTone,
  ExclamationCircleOutlined,
  ExclamationCircleTwoTone,
} from '@ant-design/icons'
import { Button, DatePicker, Empty, Form, Input, List, Modal, notification, Select, Space } from 'antd'
import moment from 'moment'
import { useRouter } from 'next/router'
import editApi from '../../api/edit-jobfair'
import { editJF } from '../../api/jf-toppage'
import OtherLayout from '../../layouts/OtherLayout'
import * as Extensions from '../../utils/extensions'
import './style.scss'

const index = () => {
  const dateFormat = 'YYYY/MM/DD'
  // page state.
  const [listAdminJF, setlistAdminJF] = useState([])
  const [listSchedule, setlistSchedule] = useState([])
  const [listMilestone, setlistMilestone] = useState([])
  const [listTask, setlistTask] = useState([])
  const [disableBtn, setdisableBtn] = useState(false)
  const [changeAdmin, setAdmin] = useState(false)
  const [changeScedule, setSchedule] = useState(false)
  const [AdminDF, setAdminDF] = useState('')
  const [SceduleDF, setScheduleDF] = useState('')
  const [form] = Form.useForm()
  const router = useRouter()
  const idJf = router.query.id
  // check if all input is empty.
  const checkIsFormInputEmpty = () => {
    const inputValues = form.getFieldsValue()
    const inputs = Object.values(inputValues)
    for (let i = 0; i < inputs.length; i += 1) {
      const element = inputs[i]
      if (element) {
        return false
      }
    }
    return true
  }
  const getMilestone = async (id) => {
    const milestones = await editApi.getMilestone(id)
    if (milestones.data.milestones) {
      setlistMilestone(Array.from(milestones.data.milestones))
    }
  }
  const getTask = async (id) => {
    const tasks = await editApi.getTaskList(id)
    if (tasks.data.template_tasks) {
      setlistTask(Array.from(tasks.data.template_tasks))
      console.log(tasks.data.template_tasks)
    }
  }

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const infoJF = await editApi.jfdata(idJf)
        const admins = await editApi.getAdmin()
        const schedules = await editApi.getSchedule()
        const jfSchedules = await editApi.ifSchedule(idJf)
        if (jfSchedules.data.data[0].id) {
          getMilestone(jfSchedules.data.data[0].id)
          getTask(jfSchedules.data.data[0].id)
        }
        setlistAdminJF(Array.from(admins.data))
        setlistSchedule(Array.from(schedules.data))
        setScheduleDF((jfSchedules.data.data[0].id).toString())
        setAdminDF((infoJF.data.user.id).toString())
        form.setFieldsValue({
          name: infoJF.data.name,
          start_date: moment(infoJF.data.start_date.split('-').join('/'), dateFormat),
          number_of_students: infoJF.data.number_of_students,
          number_of_companies: infoJF.data.number_of_companies,
          jobfair_admin_id: infoJF.data.user.name,
          schedule_id: jfSchedules.data.data[0].name,
        })
        // Extensions.unSaveChangeConfirm(true)
        return null
      } catch (error) {
        return Error(error.toString())
      }
    }
    fetchAPI()
  }, [])
  // onValueNameChange
  const onValueNameChange = (e) => {
    form.setFieldsValue({
      name: e.target.value,
    })
  }
  /* utilities function for support handle form */
  // reset form.
  const onFormReset = () => {
    form.resetFields()
    setlistMilestone([])
    setlistTask([])
  }

  const autoConvertHalfwidth = (event) => {
    setAdmin(false)
    const inputRef = event.target.id
    const dummyObject = {}
    dummyObject[inputRef] = Extensions.toHalfWidth(event.target.value)
    if (inputRef) {
      form.setFieldsValue(dummyObject)
    }
  }
  /* Handle 2 form event when user click  ??????????????? button or  ?????? button */
  const onFinishFailed = (errorInfo) => errorInfo
  const cancelConfirmModle = () => {
    if (checkIsFormInputEmpty()) {
      router.push('/jobfairs')
    } else {
      Modal.confirm({
        title: '???????????????????????????????????????????????????????????????',
        icon: <ExclamationCircleOutlined />,
        content: '',
        centered: true,
        onOk: () => {
          onFormReset()
          router.push('/jobfairs')
        },

        onCancel: () => {},
        okText: '??????',
        cancelText: '?????????',
      })
    }
  }
  //  open success notification after add jobfair button clicked .
  const saveNotification = () => {
    notification.open({
      icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      message: '??????????????????????????????????????????',
      onClick: () => {},
    })
  }
  const onScheduleSelect = (_, event) => {
    setSchedule(true)
    const scheduleId = event.key

    getMilestone(scheduleId)
    getTask(scheduleId)
  }
  const adminSelect = () => {
    setAdmin(true)
  }
  // eslint-disable-next-line consistent-return
  const onFinishSuccess = async (values) => {
    try {
      Extensions.unSaveChangeConfirm(false)
      const data = {
        name: values.name.toString(),
        schedule_id: changeScedule ? values.schedule_id * 1.0 : SceduleDF,
        start_date: values.start_date.format(Extensions.dateFormat),
        number_of_students: values.number_of_students * 1.0,
        number_of_companies: values.number_of_companies * 1.0,
        jobfair_admin_id: changeAdmin ? values.jobfair_admin_id * 1.0 : AdminDF,
      }
      setdisableBtn(true)
      await editJF(idJf, data).then((response) => {
        console.log(response)
        saveNotification()
        router.push(`/jf-toppage/${idJf}`)
      }).catch((error) => {
        console.log(error)
        setdisableBtn(false)
      })
    } catch (error) {
      setdisableBtn(false)
      const isDuplicate = JSON.parse(error.request.response).message
      if (isDuplicate.toLocaleLowerCase().includes('duplicate')) {
        notification.open({
          icon: <ExclamationCircleTwoTone twoToneColor="#BB371A" />,
          message: '??????JF???????????????????????????????????????',
          onClick: () => {},
        })
      } else {
        notification.open({
          icon: <ExclamationCircleTwoTone twoToneColor="#BB371A" />,
          message: '??????????????????????????????',
          onClick: () => {},
        })
      }
      return error
    }
  }
  /* Validator of all input. */
  const companiesJoinValidator = (_, value) => {
    // if (!value) {
    //   return Promise.reject(new Error('???????????????????????????'))
    // }
    // if (value < 0) {
    //   return Promise.reject(new Error('1???????????????????????????????????????????????????'))
    // }
    // // check case when user set number of company that join JF smaller than 1
    // if (Extensions.isFullWidth(value)) {

    //   // return Promise.reject(new Error('1???????????????????????????????????????????????????'))
    // }
    // // setinputTest(Extention.toHalfWidth(value.toString()))
    // if (!value.match(Extensions.Reg.onlyNumber)) {
    //   return Promise.reject(new Error('???????????????????????????????????????????????????'))
    // }
    if (!value) {
      return Promise.reject(new Error('???????????????????????????'))
    }
    if (value * 1.0 < 1) {
      return Promise.reject(new Error('1?????????????????????????????????????????????'))
    }
    return Promise.resolve()
  }
  const studentsJoinValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('???????????????????????????'))
    }
    if (value * 1.0 < 1) {
      return Promise.reject(new Error('1?????????????????????????????????????????????'))
    }
    // if (!value.match(Extensions.Reg.onlyNumber)) {
    //   return Promise.reject(new Error('???????????????????????????????????????????????????'))
    // }

    // if (Extensions.isFullWidth(value)) {
    //   return Promise.reject(new Error('1???????????????????????????????????????????????????'))
    // }

    return Promise.resolve()
  }
  const JFNameValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('???????????????????????????'))
    }
    if (value.match(Extensions.Reg.specialCharacter)) {
      return Promise.reject(new Error('????????????????????????????????????????????????'))
    }
    if (value.match(Extensions.Reg.vietnamese)) {
      return Promise.reject(new Error('????????????????????????????????????'))
    }
    if (value.match(Extensions.Reg.onlyNumber)) {
      return Promise.reject(new Error('?????????????????????????????????????????????'))
    }

    return Promise.resolve()
  }

  const startDayValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('???????????????????????????'))
    }
    return Promise.resolve()
  }

  const JFAdminValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('???????????????????????????'))
    }

    return Promise.resolve()
  }
  const JFScheduleValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('???????????????????????????'))
    }
    return Promise.resolve()
  }

  return (
    <OtherLayout>
      <OtherLayout.Main>
        <h1>JF ?????? </h1>
        <div className="edit__jf">
          <Form
            form={form}
            labelCol={{
              span: 4,
            }}
            wrapperCol={{
              span: 18,
            }}
            layout="horizontal"
            colon={false}
            initialValues={{ defaultInputValue: 0 }}
            onFinish={onFinishSuccess}
            onFinishFailed={onFinishFailed}
          >
            <div className="grid grid-cols-2 mx-10">
              <div className="col-span-1 mx-4">
                <Form.Item
                  label="JF???"
                  name="name"
                  rules={[
                    {
                      validator: JFNameValidator,
                    },
                  ]}
                >
                  <Input
                    type="text"
                    placeholder="JF???????????????"
                    maxLength={20}
                    onChange={onValueNameChange}
                  />
                </Form.Item>
              </div>
              <div className="col-span-1 mx-4">
                <Form.Item
                  name="start_date"
                  label="?????????"
                  rules={[
                    {
                      validator: startDayValidator,
                    },
                  ]}
                >
                  <DatePicker
                    help="Please select the correct date"
                    format={Extensions.dateFormat}
                    placeholder={Extensions.dateFormat}
                  />
                </Form.Item>

              </div>
              <div className="col-span-1 mx-4">
                <Form.Item
                  label="??????????????????"
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
                    placeholder="??????????????????"
                  />
                </Form.Item>
              </div>
              <div className="col-span-1 mx-4">
                <Form.Item
                  name="number_of_students"
                  label="?????????????????????"
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
                    placeholder="?????????????????????"
                  />
                </Form.Item>
              </div>
              <div className="col-span-1 mx-4">
                <Form.Item
                  label="?????????"
                  name="jobfair_admin_id"
                  onSelect={adminSelect}
                  rules={[
                    {
                      validator: JFAdminValidator,
                    },
                  ]}
                >
                  <Select className="addJF-selector" placeholder="??????????????????">
                    {listAdminJF.map((element) => (
                      <Select.Option key={element.id} value={element.id}>
                        {element.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-span-1 mx-4">
                <Form.Item
                  name="schedule_id"
                  label="JF-??????????????????"
                  rules={[
                    {
                      validator: JFScheduleValidator,
                    },
                  ]}
                >
                  <Select
                    className="addJF-selector"
                    placeholder="JF-???????????????????????????"
                    onSelect={onScheduleSelect}
                  >
                    {listSchedule.map((element) => (
                      <Select.Option key={element.id} value={element.id}>
                        {element.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-span-1 mx-4">
                <Form.Item label=" ">
                  ???????????????????????????
                  <List
                    className="demo-infinite-container"
                    bordered
                    locale={
                      { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="?????????????????????????????????????????????" /> }
                    }
                    style={{ height: 250, overflow: 'auto' }}
                    size="small"
                    dataSource={listMilestone}
                    renderItem={(item) => (
                      <List.Item className="list-items" key={item.id}>
                        {item.name}
                      </List.Item>
                    )}
                  />
                </Form.Item>
              </div>
              <div className="col-span-1 mx-4">
                <Form.Item label=" ">
                  ???????????????
                  <List
                    className="demo-infinite-container"
                    bordered
                    style={{ height: 250, overflow: 'auto' }}
                    size="small"
                    locale={
                      { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="?????????????????????????????????????????????" /> }
                    }
                    dataSource={listTask}
                    renderItem={(item) => (
                      <List.Item className="list-items" key={item.id}>
                        {item.name}
                      </List.Item>
                    )}
                  />
                </Form.Item>
              </div>

            </div>
            <div className="flex justify-center ...">
              <Form.Item
                label=" "
                className="my-5 "
              >
                <Space size={30}>
                  <Button
                    htmlType="button"
                    type="primary"
                    onClick={cancelConfirmModle}
                    disabled={disableBtn}
                    className="button_cacel"
                  >
                    ???????????????
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={disableBtn}
                    loading={disableBtn}
                  >
                    ??????
                  </Button>
                </Space>
              </Form.Item>
            </div>
          </Form>
        </div>
      </OtherLayout.Main>
    </OtherLayout>
  )
}
index.middleware = ['auth:superadmin', 'auth:admin']
export default index
