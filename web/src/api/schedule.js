import axios from './axios'

const getListShedule = () => axios.get('/schedule')

const searchListShedule = (params) => axios.get('/search', { params })

export const ListScheduleApi = {
  getListShedule,
  searchListShedule,
}
