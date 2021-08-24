import instance from './axios'

const editApi = {
  jfdata: (id) => {
    const url = `/jobfair/${id}`
    return instance.get(url)
  },
  ifSchedule: (id) => {
    const url = `/jf-schedule/${id}`
    return instance.get(url)
  },
  editJF: (id) => {
    const url = `/jobfair/${id}`
    return instance.put(url, 'aaaa')
  },
  getSchedule: () => {
    const url = '/schedules'
    return instance.get(url)
  },

  getTaskList: (id) => {
    const url = `/schedules/${id}/template-tasks`
    return instance.get(url)
  },
  getMilestone: (id) => {
    const url = `/schedules/${id}/milestones`
    return instance.get(url)
  },
  getAdmin: () => {
    const url = '/admins'
    return instance.get(url)
  },
  getAll: (requests) => instance.all(requests),
}
export default editApi
