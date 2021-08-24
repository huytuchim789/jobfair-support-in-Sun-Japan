/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react'
import './style.scss'
import PropTypes from 'prop-types'
import MilestoneItem from './milestoneItem'
import { listmilestone } from '../../api/jf-toppage'

export default function ChartMilestone({ id }) {
  const [listTask, setlistTask] = useState([])
  const fetchTasks = async () => {
    await listmilestone(id).then((response) => {
      setlistTask(response.data.schedule.milestones)
    }).catch((error) => {
      console.log(error)
    })
  }
  useEffect(() => {
    fetchTasks()
  }, [])

  const listData = listTask.map((item) => (
    <MilestoneItem listTask={item.tasks} milestoneName={item.name} dealine={item.is_week ? `${item.period} 週間` : `${item.period} 日`} />
  ))
  return (
    <div>
      {listData}
    </div>
  )
}
ChartMilestone.propTypes = {
  id: PropTypes.number.isRequired,
}
