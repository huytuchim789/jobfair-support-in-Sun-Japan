import instance from './axios'

export const getMilestone = (id) => instance.get(`/milestones/${id}/list`)
