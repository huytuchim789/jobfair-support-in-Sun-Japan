import { Modal, Button } from 'antd'
import React, { useState } from 'react'
import { useRouter } from 'next/router'

const CancelEditProfile = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const router = useRouter()
  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = () => {
    setIsModalVisible(false)
    router.push('/profile/')
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <>
      <Button onClick={showModal} className="text-base px-8 mr-10" style={{ backgroundColor: '#fff' }}>
        キャンセル
      </Button>
      <Modal
        visible={isModalVisible}
        title="プロフィール編集"
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        cancelText="いいえ"
        okText="はい"
      >
        <p>変更内容が保存されません。よろしいですか？</p>

      </Modal>
    </>
  )
}

export default CancelEditProfile
