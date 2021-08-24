import instance from './axios'

export const updateMilestone = (id, argument) => instance.put(`/milestone/${id}`, argument)

export const getMilestone = (id) => instance.get(`/milestone/${id}`)

export const getNameExitEdit = (id, name) => instance.get(`/check-unique-edit/${id}/${name}`)

export const getNameExitAdd = (name) => instance.get(`/check-unique-add/${name}`)

export const addMilestone = (argument) => instance.post('milestone/', argument)

export const getAllMileStone = () => instance.get('/milestone')
export const deleteMileStone = (id) => instance.delete(`/milestone/${id}`)
