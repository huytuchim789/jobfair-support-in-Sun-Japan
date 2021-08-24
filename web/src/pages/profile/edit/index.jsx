import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Form, Input, Button, notification } from 'antd'
import cookies from 'axios/lib/helpers/cookies'
import Otherlayout from '../../../layouts/OtherLayout'
// import Avatar from '../UI/avatar/Avatar'
import ButtonChangePassword from '../UI/button/ButtonChangePassword'
import CancelEditProfile from '../UI/button/CancelEditProfile'
import { updateInfo, getAllProfile, getProfile, getAvatar } from '../../../api/profile'
import { webInit } from '../../../api/web-init'
import axios from '../../../api/axios'
import './styles.scss'

const EditProfilePage = () => {
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [idChatWorkInput, setIdChatWordInput] = useState('')
  const [form] = Form.useForm()
  const [image, setImage] = useState()
  const [avatarUser, setAvatarUser] = useState()
  const [preview, setPreview] = useState()
  const [isDisable, setIsDisable] = useState(false)
  const [pathName, setPathName] = useState()
  const router = useRouter()

  webInit().then((res) => {
    const id = res.data.auth.user.id
    getAvatar(id).then(() => {
      const link = `/api/avatar/${id}`
      setAvatarUser(link)
    })
  }, [])

  const updateAvt = async () => {
    const formData = new FormData()
    formData.append('avatar', image)

    const res = await webInit()
    const id = res.data.auth.user.id
    const { data } = await axios.post(
      `/profile/${id}/update_avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-XSRF-TOKEN': cookies.read('XSRF-TOKEN'),
        },
      },
    )
    setPathName(data)
  }

  useEffect(() => {
    if (image) {
      updateAvt()
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(image)
    }
  }, [image])

  useEffect(async () => {
    const resId = await webInit()
    const id = resId.data.auth.user.id
    const result = await getProfile(id)
    const data = result.data
    setNameInput(data.name)
    setIdChatWordInput(data.chatwork_id)
    setEmailInput(data.email)
    setPathName(data.avatar)
    form.setFieldsValue({
      name: data.name,
      chatwork: data.chatwork_id,
      email: data.email,
    })
  }, [])

  const fetchData = async (term) => {
    const resId = await webInit()
    const id = resId.data.auth.user.id
    const resCur = await getProfile(id)
    const emailCur = resCur.data.email
    const res = await getAllProfile()
    const data = res.data.map((item) => item.email)
    const email = data.find((item) => item === term)
    if (email && email !== emailCur) {
      setIsDisable(true)
      form.setFields([
        {
          name: 'email',
          errors: ['このメールは既に存在しました。'],
        },
      ])
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(emailInput)
    }, 100)
    return () => {
      clearTimeout(timer)
    }
  }, [emailInput])

  const openNotificationSuccess = () => {
    notification.success({
      message: '変更は正常に保存されました。',
      duration: 3,

    })
    router.push('/profile')
    // setTimeout(() => { router.push('/profile') }, 1000)
  }

  const handleOk = async () => {
    if (nameInput === '' || emailInput === '' || idChatWorkInput === '' || isDisable === true) {
      setIsDisable(true)
    } else {
      const data = await webInit()
      const id = data.data.auth.user.id
      updateInfo(id, {
        name: nameInput,
        email: emailInput,
        chatwork_id: idChatWorkInput,
        avatar: pathName,
      })
      openNotificationSuccess()
    }
  }

  const fileInputRef = useRef()

  const changeImageHandler = (e) => {
    const file = e.target.files[0]
    const fileType = file?.name.split('.')[file.name.split('.').length - 1]
    if (file) {
      if (file?.size > 4194304 || (fileType !== 'jpg' && fileType !== 'png')) {
        notification.error({
          message: '.jpg, .png, サイズ4MB未満の画像を選択してください',
          duration: 2,
        })
        setImage(null)
      } else {
        setImage(file)
        setIsDisable(false)
      }
    }
  }

  const clickHandler = (e) => {
    e.preventDefault()
    if (fileInputRef.current.value !== null) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    } else {
      fileInputRef.current.click()
    }
  }

  const onNameChange = (e) => {
    setIsDisable(false)
    setNameInput(e.target.value)
  }

  const onChatworkIdChange = (e) => {
    setIsDisable(false)
    setIdChatWordInput(e.target.value)
  }

  const onEmailChange = (e) => {
    setIsDisable(false)
    setEmailInput(e.target.value)
  }

  const specialCharRegex = new RegExp('[ 　]')

  return (
    <div>
      <Otherlayout>
        <Otherlayout.Main>
          <h1>プロフィール編集</h1>
          <div className="container__profile-edit">
            <div className="container-profile">
              <div className="grid justify-items-center">
                <div className="avatar">
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => changeImageHandler(e)}
                  />
                  {preview ? (
                    <div onClick={clickHandler}>
                      <img
                        src={preview}
                        alt="user-img"
                      />
                    </div>
                  ) : (
                    <div onClick={clickHandler}>
                      <img
                        className="avatar-img"
                        alt="user-img"
                        src={`${avatarUser}`}
                      />
                    </div>
                  )}
                </div>
                <ButtonChangePassword />
              </div>
              <div className="container-form">
                <div className="flex my-14">
                  <Form
                    form={form}
                    name="basic"
                    labelCol={{
                      span: 8,
                    }}
                    wrapperCol={{
                      span: 12,
                    }}
                    className="w-3/4"
                  >
                    <Form.Item
                      label={
                        <p>ユーザー名</p>
                      }
                      name="name"
                      rules={[
                        {
                          required: true,
                          message: 'この項目は必須です。',
                        },
                        () => ({
                          validator(_, value) {
                            if (/[0-9]/.test(value)) {
                              setIsDisable(true)
                              return Promise.reject(
                                new Error(
                                  '数字を入力しないでください。',
                                ),
                              )
                            }
                            if (/[?!@#$%^&*()_+\-=[\]{};':"\\/|,<>]/.test(value)) {
                              setIsDisable(true)
                              return Promise.reject(
                                new Error(
                                  '特殊文字を入力しないでください。',
                                ),
                              )
                            }

                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >
                      <Input
                        type="text"
                        size="large"
                        onChange={onNameChange}
                        placeholder="ユーザー名"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <p>チャットワークID</p>
                      }
                      name="chatwork"
                      rules={[
                        {
                          required: true,
                          message: 'この項目は必須です。',
                        },
                        () => ({
                          validator(_, value) {
                            if (specialCharRegex.test(value)) {
                              setIsDisable(true)
                              return Promise.reject(new Error('スペースを入力しないでください。'))
                            }
                            if (/[?!@#$%^&*()_+\-=[\]{};':"\\/|,.<>]/.test(value)) {
                              setIsDisable(true)
                              return Promise.reject(
                                new Error(
                                  '特殊文字を入力しないでください。',
                                ),
                              )
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >
                      <Input
                        type="text"
                        size="large"
                        onChange={onChatworkIdChange}
                        placeholder="チャットワークID"
                      />

                    </Form.Item>

                    <Form.Item
                      label={
                        <p>メール</p>
                      }
                      name="email"
                      rules={[
                        {
                          required: true,
                          message: 'この項目は必須です。',
                        },
                        () => ({
                          validator(_, value) {
                            if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(value) && value !== '') {
                              setIsDisable(true)
                              return Promise.reject(
                                new Error(
                                  'メールアドレスの形式が正しくありません。',
                                ),
                              )
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >

                      <Input
                        type="text"
                        size="large"
                        onChange={onEmailChange}
                        placeholder="メール"
                      />

                    </Form.Item>

                  </Form>
                </div>
              </div>
            </div>
            <div className="container-btn justify-end">
              <CancelEditProfile />
              <Button
                type="primary"
                className="text-base px-9 mr-10"
                htmlType="submit"
                onClick={handleOk}
              >
                保存
              </Button>
            </div>
          </div>
        </Otherlayout.Main>
      </Otherlayout>
    </div>
  )
}

export default EditProfilePage
