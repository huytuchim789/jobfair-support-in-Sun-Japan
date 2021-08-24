import React, { useEffect, useState, useContext } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { Modal, Input, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactReduxContext } from 'react-redux'
import JfLayout from '../../layouts/JFLayout'
import 'antd/dist/antd.css'
import './style.scss'
import { getTaskByJfId, updateTask, getJobfair } from '../../api/task-kanban'

const singleTask = (type, taskIds) => {
  const obj = {}
  obj[type] = {
    id: type,
    title: type,
    taskIds,
  }
  return obj
}

const columnTask = (type, data) => {
  const taskIds = data.filter((el) => el.status === type).map((el) => el.id)
  return singleTask(type, taskIds)
}

const Column = dynamic(() => import('../../components/kanban/Column'))

export default function KanBan() {
  const router = useRouter()
  const idJf = router.query.JFid

  const [isLoading, setIsLoading] = useState(false)
  const [loadingFirst, setLoadingFirst] = useState(true)
  const [task, setTask] = useState([])
  const [backupData, setBackupData] = useState([])
  const [visible, setVisible] = useState(false)
  const [memo, setMemo] = useState('')
  const [id, setId] = useState('')
  const [isControllable, setIsControllable] = useState(false)

  const { store } = useContext(ReactReduxContext)

  const currentUserId = store.getState().get('auth').get('user').get('id')

  const getJf = async () => {
    const { data } = await getJobfair(idJf * 1, currentUserId)
    if (data.length > 0) {
      setIsControllable(true)
    }
  }

  const fetchData = async () => {
    try {
      if (loadingFirst) {
        setIsLoading(true)
        setLoadingFirst(false)
      }
      let { data } = await getTaskByJfId(idJf)
      const jobfairName = data[0].jobfairName

      if (!isControllable) {
        data.forEach((el) => {
          if (el.userId === currentUserId) {
            setIsControllable(true)
          }
        })
      }

      // Auto update task's status when end_time expired
      /// //////////////////////////////////////

      data.forEach(async (el) => {
        const { id: taskId, end_time: endTime, status } = el
        if (
          Date.now() > new Date(endTime).getTime()
          && (status === '進行中' || status === '中断')
        ) {
          await updateTask(taskId, { status: '未完了' })
        }
      })

      // Format data
      /// ///////////
      const columnType = []
      data = Object.values(
        data.reduce((acc, cur) => {
          acc[cur.taskName] = acc[cur.taskName] || {
            ...cur,
            userName: [],
            avatar: [],
            userId: [],
          }
          acc[cur.taskName].userName = acc[cur.taskName].userName.concat(
            Array.isArray(cur.userName) ? cur.userName : [cur.userName],
          )
          acc[cur.taskName].avatar = acc[cur.taskName].avatar.concat(
            Array.isArray(cur.avatar) ? cur.avatar : [cur.avatar],
          )
          acc[cur.taskName].userId = acc[cur.taskName].userId.concat(
            Array.isArray(cur.userId) ? cur.userId : [cur.userId],
          )
          return acc
        }, {}),
      )

      data = data.map((el) => {
        const { avatar, userName, userId } = el
        const user = userName.map((uName, uId) => ({
          uName,
          avatar: avatar[uId],
          userId: userId[uId],
        }))
        return { ...el, user }
      })

      data.forEach((el) => {
        columnType.push(el.status)
      })
      const columnOrder = ['未着手', '進行中', '完了', '中断', '未完了']
      const tasks = data.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.id]: cur,
        }),
        {},
      )

      const newColumn = columnTask('未着手', data)
      const inProgressColumn = columnTask('進行中', data)
      const doneColumn = columnTask('完了', data)
      const pendingColumn = columnTask('中断', data)
      const breakColumn = columnTask('未完了', data)
      setTask({
        jobfairName,
        tasks: {
          ...tasks,
        },
        columns: {
          ...newColumn,
          ...inProgressColumn,
          ...doneColumn,
          ...pendingColumn,
          ...breakColumn,
        },
        columnOrder,
      })
      setBackupData({
        tasks: {
          ...tasks,
        },
        columns: {
          ...newColumn,
          ...inProgressColumn,
          ...doneColumn,
          ...pendingColumn,
          ...breakColumn,
        },
        columnOrder,
      })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
  }

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (
      !destination
      || source.droppableId === '未完了'
      || source.droppableId === '未着手'
      || source.droppableId === '完了'
      || destination.droppableId === '完了'
      || destination.droppableId === '未着手'
      || destination.droppableId === '未完了'
    ) {
      return
    }

    if (
      destination.droppableId === source.droppableId
      && destination.index === source.index
    ) {
      return
    }

    const start = task.columns[source.droppableId]
    const finish = task.columns[destination.droppableId]

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      }

      const newState = {
        ...task,
        columns: {
          ...task.columns,
          [newColumn.id]: newColumn,
        },
      }

      setTask(newState)
      return
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds)

    startTaskIds.splice(source.index, 1)
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    }

    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    }

    if (destination.droppableId === '中断') {
      finishTaskIds.forEach((taskId) => {
        if (typeof taskId === 'string') {
          setId(taskId * 1)
          Object.values(task.tasks).forEach((el) => {
            if (el.id === +taskId) {
              setMemo(el.memo)
            }
          })
        }
      })

      setVisible(true)
    }

    if (destination.droppableId !== '中断') {
      finishTaskIds.forEach(async (taskId) => {
        if (typeof taskId === 'string') {
          await updateTask(taskId * 1, { status: destination.droppableId })
          await fetchData()
        }
      })
    }

    const newState = {
      ...task,
      columns: {
        ...task.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }
    setTask(newState)
  }
  const resolved = async () => {
    await updateTask(id, { memo, status: '中断' })
    await fetchData()
    setMemo('')
    setId('')
    setVisible(false)
  }

  const rejected = () => {
    setVisible(false)
    setTask(backupData)
  }

  useEffect(() => {
    fetchData()
  }, [updateTask])

  useEffect(() => {
    localStorage.setItem('id-jf', idJf)
    getJf()
    fetchData()
  }, [])

  const antIcon = <LoadingOutlined style={{ fontSize: 120 }} spin />

  return (
    <div className="container__kanban">
      <JfLayout style={{ padding: '0px' }} id={idJf}>
        <JfLayout.Main>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {isLoading && (
              <Spin indicator={antIcon} style={{ marginTop: '50px' }} />
            )}
            {!isLoading && (
              <>
                <h1>
                  {task.jobfairName}
                  {' '}
                  (カンバン)
                </h1>
                <DragDropContext onDragEnd={onDragEnd}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    {task?.columnOrder?.map((columnId) => {
                      const column = task.columns[columnId]
                      const tasks = column.taskIds.map(
                        (taskId) => task.tasks[taskId],
                      )
                      return (
                        <Column
                          key={column.id}
                          column={column}
                          tasks={tasks}
                          isControllable={isControllable}
                        />
                      )
                    })}
                  </div>
                </DragDropContext>
              </>
            )}

            <Modal
              centered="true"
              title="理由を入力する"
              visible={visible}
              onOk={resolved}
              onCancel={rejected}
              okText="保存"
              cancelText="キャンセル"
            >
              <Input
                placeholder="メモ"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </Modal>
          </div>
        </JfLayout.Main>
      </JfLayout>
    </div>
  )
}
