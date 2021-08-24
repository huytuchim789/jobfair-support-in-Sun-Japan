import axios from './axios'

export const getJFList = () => axios.get('/jobfair')
export const deleteJFList = async (id) => axios.get(`/jf-list/delete/${id}`)
