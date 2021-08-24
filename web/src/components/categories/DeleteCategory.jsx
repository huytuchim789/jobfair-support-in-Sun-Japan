/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable react/react-in-jsx-scope */
import { Modal, Space, notification } from 'antd'
import { ExclamationCircleOutlined, DeleteTwoTone } from '@ant-design/icons'

import { deleteCategory } from '../../api/category'

const { confirm } = Modal

const DeleteCategory = (props) => {
  const role = props.role
  const setReloadPage = () => {
    props.reloadPage()
  }
  const openNotificationSuccess = () => {
    notification.success({
      message: '変更は正常に保存されました。',
      duration: 3,
    })
    setReloadPage()
  }

  function showDeleteConfirm() {
    confirm({
      title: '削除カテゴリ',
      icon: <ExclamationCircleOutlined />,
      content: 'このカテゴリを削除してもよろしいですか？',
      okText: '保存',
      okType: 'danger',
      cancelText: 'キャンセル',
      centered: true,
      onOk() {
        if (role === 'superadmin') {
          console.log('OK')
          deleteCategory(props.record.id)
          openNotificationSuccess()
        }
      },
      onCancel() {
        console.log('Cancel')
      },
    })
  }

  return (
    <div>
      <Space>
        <DeleteTwoTone onClick={showDeleteConfirm} />
      </Space>
    </div>
  )
}

export default DeleteCategory
