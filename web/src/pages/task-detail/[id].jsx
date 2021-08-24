import React, { useEffect, useState } from 'react'
import './style.scss'
import { useRouter } from 'next/router'
import { Button, Modal, notification, Tooltip } from 'antd'
import {
  ExclamationCircleOutlined,
  CheckCircleTwoTone,
} from '@ant-design/icons'
import JfLayout from '../../layouts/layout-task'
import {
  taskData,
  beforeTask,
  afterTask,
  deleteTask,
} from '../../api/task-detail'
import { webInit } from '../../api/web-init'

export default function TaskList() {
  const router = useRouter()
  const idTask = router.query.id
  const [user, setUser] = useState({})
  const [beforeTasks, setBeforeTask] = useState([])
  const [afterTasks, setAfterTasks] = useState([])
  const [infoTask, setInfoTask] = useState({
    name: '',
    categories: '',
    milestone: '',
    status: '',
    start_time: '',
    end_time: '',
    effort: '',
    is_day: null,
    unit: '',
    description_of_detail: '',
  })
  const [infoJF, setInfoJF] = useState({
    id: null,
    name: '',
  })
  const saveNotification = () => {
    notification.open({
      icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      duration: 3,
      message: '正常に削除されました',
      onClick: () => {},
    })
  }
  const [listMemberAssignee, setListMemberAssignee] = useState([])
  const deletetpl = async () => {
    await deleteTask(idTask)
      .then((response) => {
        console.log(response.data)
        router.push(`/tasks/${infoJF.id}`)
      })
      .catch((error) => {
        console.log(error)
      })
  }
  const truncate = (input) => (input.length > 21 ? `${input.substring(0, 21)}...` : input)
  const getDataUser = async () => {
    await webInit()
      .then((response) => {
        setUser(response.data.auth.user.role)
        console.log(response.data.auth.user.name)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const fetchTaskData = async () => {
    await taskData(idTask)
      .then((response) => {
        setInfoTask({
          name: response.data.name,
          categories: response.data.categories[0].category_name,
          milestone: response.data.milestone.name,
          status: response.data.status,
          start_time: response.data.start_time,
          end_time: response.data.end_time,
          effort: response.data.template_task.effort,
          is_day: response.data.template_task.is_day,
          unit: response.data.template_task.unit,
          description_of_detail: response.data.description_of_detail,
        })
        setListMemberAssignee(response.data.users)
        setInfoJF({
          id: response.data.schedule.jobfair.id,
          name: response.data.schedule.jobfair.name,
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }
  const fetchBeforeTask = async () => {
    await beforeTask(idTask)
      .then((response) => {
        setBeforeTask(response.data.before_tasks)
      })
      .catch((error) => {
        console.log(error)
      })
  }
  const fetchafterTask = async () => {
    await afterTask(idTask)
      .then((response) => {
        setAfterTasks(response.data.after_tasks)
      })
      .catch((error) => {
        console.log(error)
      })
  }
  const modelDelete = () => {
    Modal.confirm({
      title: '削除してもよろしいですか？',
      icon: <ExclamationCircleOutlined />,
      content: '',
      onOk: () => {
        deletetpl()
        saveNotification()
      },
      onCancel: () => {},
      centered: true,
      okText: 'はい',
      cancelText: 'いいえ',
    })
  }
  const handleBack = () => {
    router.push(`/tasks/${infoJF.id}`)
  }
  const handleEdit = () => {
    router.push(`/tasks/${infoJF.id}`)
  }
  useEffect(() => {
    getDataUser()
    fetchTaskData()
    fetchBeforeTask()
    fetchafterTask()
  }, [])
  return (
    <div>
      <JfLayout id={infoJF.id}>
        <JfLayout.Main>
          <div className="task-details">
            <div className="list__button">
              <div className="button__left">
                <Button
                  style={{ border: 'none' }}
                  type="primary"
                  onClick={handleBack}
                >
                  戻る
                </Button>
              </div>
              <div className="button__right">
                {user === 'admin' || user === 'superadmin' ? (
                  <>
                    <Button
                      style={{ border: 'none' }}
                      type="primary"
                      onClick={handleEdit}
                    >
                      編集
                    </Button>
                    <Button
                      style={{ border: 'none' }}
                      type="primary"
                      onClick={modelDelete}
                    >
                      削除
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
            <div className="title">
              <h1>タスク詳細</h1>
            </div>

            <div className="info__tplt">
              <div className="grid grid-cols-2 mx-5 info__center">
                <div className="col-span-1 mx-4 ">
                  <div className="grid grid-cols-3 ">
                    <div className=" layber col-span-1 mx-4">
                      <p>タスク名:</p>
                    </div>
                    <div className="col-span-2 mx-4">
                      <div className="item__right">{infoTask.name}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 mx-4 ">
                  <div className="grid grid-cols-3 ">
                    <div className="layber  col-span-1 mx-4">
                      <p>カテゴリ:</p>
                    </div>
                    <div className="col-span-2 mx-4">
                      <div className="item__right">{infoTask.categories}</div>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 mx-4 mt-5">
                  <div className="grid grid-cols-3 ">
                    <div className="layber col-span-1 mx-4">
                      <p>マイルストーン:</p>
                    </div>
                    <div className="col-span-2 mx-4">
                      <div className="item__right">{infoTask.milestone}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 mx-4 mt-5">
                  <div className="grid grid-cols-3 ">
                    <div className="layber col-span-1 mx-4">
                      <p>工数:</p>
                    </div>
                    <div className="col-span-2 mx-4">
                      {infoTask.unit === 'none' ? (
                        <>
                          <span className="ef">{infoTask.effort}</span>
                          <span className="ef">
                            {infoTask.is_day ? '日' : '時間'}
                          </span>

                        </>
                      ) : (
                        <>
                          <span className="ef">{infoTask.effort}</span>
                          <span className="ef">
                            {infoTask.is_day ? '日' : '時間'}
                          </span>
                          <span>/</span>
                          <span className="ef">{infoTask.unit}</span>
                        </>
                      ) }

                    </div>
                  </div>
                </div>
                <div className="col-span-1 mx-4 mt-5">
                  <div className="grid grid-cols-3">
                    <div className="layber col-span-1 mx-4">
                      <p>担当者:</p>
                    </div>
                    <div className="col-span-2 mx-4">
                      <ul className="list__member">
                        {listMemberAssignee
                          ? listMemberAssignee.map((item) => (
                            <li className="task__chil">{`${item.name},`}</li>
                          ))
                          : null}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 mx-4 mt-5">
                  <div className="grid grid-cols-3 ">
                    <div className="layber col-span-1 mx-4">
                      <p>ステータス:</p>
                    </div>
                    <div className="col-span-2 mx-4">
                      {infoTask.status === '未着手' ? (
                        <span
                          style={{ background: '#5EB5A6', color: '#fff' }}
                          className=" stt item__right"
                        >
                          {infoTask.status}
                        </span>
                      ) : null}
                      {infoTask.status === '進行中' ? (
                        <span
                          style={{ background: '#A1AF2F', color: '#fff' }}
                          className=" stt item__right"
                        >
                          {infoTask.status}
                        </span>
                      ) : null}
                      {infoTask.status === '完了' ? (
                        <span
                          style={{ background: '#4488C5', color: '#fff' }}
                          className=" stt item__right"
                        >
                          {infoTask.status}
                        </span>
                      ) : null}
                      {infoTask.status === '中断' ? (
                        <span
                          style={{
                            background: 'rgb(185, 86, 86)',
                            color: '#fff',
                          }}
                          className=" stt item__right"
                        >
                          {infoTask.status}
                        </span>
                      ) : null}
                      {infoTask.status === '未完了' ? (
                        <span
                          style={{
                            background: 'rgb(121, 86, 23)',
                            color: '#fff',
                          }}
                          className=" stt item__right"
                        >
                          {infoTask.status}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="col-span-1 mx-4 mt-5">
                  <div className="grid grid-cols-3 ">
                    <div className="layber col-span-1 mx-4">
                      <p>開始日:</p>
                    </div>
                    <div className="col-span-2 mx-4">
                      <span className="item__right">{infoTask.start_time}</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 mx-4 mt-5">
                  <div className="grid grid-cols-3 ">
                    <div className="layber col-span-1 mx-4">
                      <p>終了日:</p>
                    </div>
                    <div className="col-span-2 mx-4">
                      <span className="item__right">{infoTask.end_time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 mx-5 mt-5">
                <div className="rela col-span-1 mx-8">
                  <p className="mb-2">前のタスク </p>
                  <ul className="list__task">
                    {beforeTasks
                      ? beforeTasks.map((item) => (
                        <li className="task__chil">
                          <Tooltip placement="top" title={item.name}>
                            <a
                              href={`/task-detail/${item.id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {truncate(item.name)}
                            </a>
                          </Tooltip>

                        </li>
                      ))
                      : null}
                  </ul>
                </div>
                <div className="rela col-span-1 mx-8">
                  <p className="mb-2">次のタスク</p>
                  <ul className="list__task">
                    {afterTasks
                      ? afterTasks.map((item) => (
                        <li>
                          <Tooltip placement="top" title={item.name}>
                            <a
                              href={`/task-detail/${item.id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {truncate(item.name)}
                            </a>
                          </Tooltip>
                        </li>
                      ))
                      : null}
                  </ul>
                </div>
              </div>

              <div className="mx-5 mt-5">
                <div className=" mx-8 des demo-infinite-container">
                  {infoTask.description_of_detail}
                </div>
              </div>
            </div>
          </div>
        </JfLayout.Main>
      </JfLayout>
    </div>
  )
}
