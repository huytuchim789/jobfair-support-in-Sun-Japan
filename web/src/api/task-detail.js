import axios from './axios'

export const taskData = (id) => axios.get(`/task/${id}`)
export const beforeTask = (id) => axios.get(`/before-tasks/${id}`)
export const afterTask = (id) => axios.get(`/after-tasks/${id}`)
export const deleteTask = (id) => axios.delete(`/task/${id}`)
