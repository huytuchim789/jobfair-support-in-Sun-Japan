import React, { useEffect, useState } from 'react'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import './style.scss'
import { Button, Typography } from 'antd'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.scss'
import 'swiper/components/navigation/navigation.scss'
import 'swiper/components/pagination/pagination.scss'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { RightCircleOutlined } from '@ant-design/icons'
import { getMilestone } from '../../../api/schedule-detail'
import Navbar from '../../../components/navbar/index'

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])
const { Text, Paragraph } = Typography
const getRandomColor = () => {
  const colors = ['pink', 'red', 'blue', 'green', 'black', 'yellow']
  const index = Math.ceil(Math.random() * colors.length)
  console.log(colors[index])
  return colors[index]
}
function scheduleDetail() {
  const [milestone, setMilestone] = useState([])
  const router = useRouter()
  useEffect(() => {
    const { id } = router.query
    getMilestone(id).then((res) => {
      console.log(res.data)
      const milestoneCopy = res.data
      milestoneCopy.forEach((element) => {
        if (element.name.length > 10) {
          element.wrapped = true
        }
        element.tasks.forEach((task) => {
          task.colorBorder = getRandomColor()
          task.categories.forEach((category) => {
            category.colorBorder = task.colorBorder
          })
        })
      })

      setMilestone(milestoneCopy)
    })
  }, [])

  return (
    <div className="app pb-2">
      <Navbar className="navbar" />
      <div className="px-12">
        <div className="flex justify-between mt-5 mb-4">
          <Link href="/schedule">
            <Button type="primary" id="back_btn">
              戻る
            </Button>
          </Link>
          <Link href={`/schedule/gantt-chart/${router.query.id}`}>
            <RightCircleOutlined className="gantt-chart text-4xl gantt-chart_btn" />
          </Link>
        </div>
        <span className="text-3xl inline-block mb-4 " id="title">
          JFスケジュール詳細
        </span>
      </div>
      <div>
        <Swiper
          spaceBetween={40}
          slidesPerView={4}
          navigation
          allowTouchMove={false}
          style={{ paddingRight: '45px', paddingLeft: '45px' }}
          id="swiper"
        >
          {milestone.map((element) => (
            <SwiperSlide>
              <div
                className="border-black border-2 px-4 border-gray-400 py-4 bg-gray-50 overflow-y-scroll"
                style={{ boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px', height: '35rem' }}
              >
                <Paragraph
                  className="text-xl break-words milestone-name"
                  ellipsis={element.wrapped ? { tooltip: element.name } : {}}
                >
                  {element.name}
                </Paragraph>
                {element.tasks.map((task) => (
                  <Link href={`/template-task-dt/${task.id}`}>
                    <a className="task-link">
                      <div className="task-hover task grid-rows-3 border-2 border-gray-400 rounded-3xl px-4 py-4">
                        <Paragraph
                          className="inline-block border-2 text-sm cursor-text px-1 py-1 task-name"
                          style={{ borderColor: task.colorBorder }}
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          {task.name}
                        </Paragraph>
                        <Paragraph
                          className="break-words text-sm cursor-text detail"
                          ellipsis={{ rows: 2, tooltip: task.description_of_detail }}
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          {task.description_of_detail}
                        </Paragraph>
                        <div className="flex justify-between">
                          <span
                            className="text-gray-400 inline-block text-sm cursor-text effort"
                            onClick={(e) => {
                              e.preventDefault()
                            }}
                          >
                            {`${task.effort.replace('.0', '')}h`}
                          </span>
                          {task.categories.length <= 2 ? (
                            <div className="flex">
                              {task.categories.map((category) => (
                                <Text
                                  className="inline-block border-2 mr-1 text-xs cursor-text category-name"
                                  style={{ borderColor: category.colorBorder }}
                                  onClick={(e) => {
                                    e.preventDefault()
                                  }}
                                >
                                  {category.category_name}
                                </Text>
                              ))}
                            </div>
                          ) : (
                            <Swiper
                              slidesPerView={2}
                              style={{ marginLeft: '12px' }}
                              spaceBetween={0}
                              className="swiper_category"
                              setWrapperSize
                              autoplay={{ delay: 2000 }}
                            >
                              {task.categories.map((category) => (
                                <SwiperSlide style={{ maxWidth: '75px', marginRight: '2px' }}>
                                  <Paragraph
                                    className="border-2 break-words text-center cursor-text"
                                    style={{ borderColor: category.colorBorder }}
                                    ellipsis={{ rows: 1, tooltip: category.name }}
                                    onClick={(e) => {
                                      e.preventDefault()
                                    }}
                                  >
                                    {category.category_name}
                                  </Paragraph>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          )}
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <Text className="text-2xl ml-4 mt-2 inline-block" id="total">
        トタル:
        {' '}
        {milestone.length}
      </Text>
    </div>
  )
}
scheduleDetail.middleware = ['auth:superadmin', 'auth:admin', 'auth:member']
export default scheduleDetail
