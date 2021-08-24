import React from 'react'
import { Button, Modal, notification } from 'antd'
import './styles.scss'
import Link from 'next/link'
import Router from 'next/router'
import PropTypes from 'prop-types'
import { deleteMember } from '~/api/member-detail'

export default class TaskControl extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    })
  }

  onhandleCancel = () => {
    this.setState({ visible: false })
  }

  onhandleOk = () => {
    const id = this.props.id
    deleteMember(id)
      .then(() => {
        this.setState({ visible: false }, () => {
          notification.success({
            message: 'メッセージ',
            description: '正常に削除されました',
            duration: 2,
          })
          setTimeout(() => {
            Router.push('/member/') // xoa xong thi ve man memberlist
          }, 2000)
        })
      })
      .catch(() => {
        this.setState({ visible: false }, () => {
          notification.error({
            message: 'メッセージ',
            description: '削除に失敗しました',
            duration: 3,
          })
        })
      })
  }

  render() {
    const { visible } = this.state
    return (
      <div className="task_control">
        <div className="control_btn pr-24">
          <Button
            id="btn-back"
            type="primary"
            size="middle"
            className="btn"
            style={{
              border: 'none',
              borderRadius: '3px',
              position: 'relative',
              right: '380px',
              bottom: '110px',
            }}
          >
            <Link href="/member/">戻る</Link>
          </Button>
          <Button type="primary" size="middle" className="btn">
            <Link href={`/member/${this.props.id}/tasks`}>タスクー覧</Link>
          </Button>
          <Button type="primary" size="middle" className="btn">
            <Link href={`/member/${this.props.id}/gantt-chart`}>ガンチャート</Link>
          </Button>
          <Button
            type="primary"
            size="middle"
            className="btn"
            style={{
              visibility: this.props.role === 'superadmin' ? 'visible' : 'hidden',
            }}
          >
            <Link href={`/member/${this.props.id}/edit`}>編集</Link>
          </Button>
          <Button
            onClick={this.showModal}
            type="primary"
            size="middle"
            className="btn"
            style={{
              visibility: this.props.role === 'superadmin' ? 'visible' : 'hidden',
            }}
          >
            削除
          </Button>
          <Modal
            visible={visible}
            title="削除"
            onOk={this.onhandleOk}
            onCancel={this.onhandleCancel}
            footer={[
              <Button key="back" onClick={this.onhandleCancel}>
                いいえ
              </Button>,
              <Button type="primary" size="large" className="btn" onClick={this.onhandleOk}>
                はい
              </Button>,
            ]}
          >
            <p>削除してもよろしいですか?</p>
          </Modal>
        </div>
      </div>
    )
  }
}
TaskControl.defaultProps = {
  id: 0,
  role: 0,
}
TaskControl.propTypes = {
  id: PropTypes.number,
  role: PropTypes.number,
}
