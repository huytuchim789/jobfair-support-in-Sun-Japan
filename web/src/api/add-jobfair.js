import instance from './axios'

const addJFAPI = {
  getSchedule: () => {
    const url = '/schedules'
    return instance.get(url)
    // expect result
    // "data": [
    // {
    //     "id": 7,
    //     "name": "Marilou Mitchell",
    //     "jobfair_id": null
    // },
    // ]
  },

  getTaskList: (id) => {
    const url = `/schedules/${id}/template-tasks`
    return instance.get(url)
    // expect result
    //     {
    //     "id": 1,
    //     "name": "Lance Lehner",
    //     "jobfair_id": null,
    //     "tasks": [
    //         {
    //             "id": 1,
    //             "name": "Mr. Gayle Stroman",
    //             "start_time": "1973-05-18",
    //             "end_time": "1995-06-16",
    //             "number_of_member": 6,
    //             "status": "完了",
    //             "remind_member": 1,
    //             "description_of_detail": "
    //             "milestone_id": 1,
    //             "user_id": 1,
    //             "created_at": "2021-07-20T09:28:55.000000Z",
    //             "updated_at": "2021-07-20T09:28:55.000000Z",
    //             "laravel_through_key": 1
    //         }
    //     ]
    // }
  },
  getMilestone: (id) => {
    const url = `/schedules/${id}/milestones`
    return instance.get(url)
    // expect result
    //      {
    //     "id": 1,
    //     "name": "Lance Lehner",
    //     "jobfair_id": null,
    //     "milestones": [
    //         {
    //             "id": 1,
    //             "name": "Miss Carolanne Smith",
    //             "period": 33,
    //             "is_week": 0,
    //             "schedule_id": 1
    //         }
    //     ]
    // }
  },
  getAdmin: () => {
    const url = '/admins'
    return instance.get(url)
  },
  addJF: (data) => {
    const url = '/jobfair'
    // const
    // data expect
    // 'name'
    // 'start_date'
    // 'number_of_students'
    // 'number_of_companies'
    // 'jobfair_admin_id'
    return instance.post(url, data)
  },
  isJFExisted: (name) => {
    const url = '/is-jf-existed/'
    return instance.post(url, name)
  },
  multiRequest: (requests) => instance.all(requests),
}
export default addJFAPI
