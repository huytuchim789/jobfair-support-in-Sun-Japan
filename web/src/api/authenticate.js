import instance from '~/api/axios'

export const login = (credentials) => instance.post('/login', credentials)
export const sendLinkResetPassword = (email) => instance.post('/reset-password', { email })
export const updatePassword = (data) => instance.post('/update-password', data)
