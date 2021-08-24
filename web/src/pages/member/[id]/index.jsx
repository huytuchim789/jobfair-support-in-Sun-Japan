import React, { useState, useContext, useEffect } from 'react'
import { ReactReduxContext } from 'react-redux'
import MemberDetailTable from '../../../components/member-detail-table'
import TaskControl from '../../../components/member-detail-task-control'
import NavBar from '../../../components/navbar'

function MemberDetailPage() {
  const [id, setID] = useState(0)
  const [role, setRole] = useState(3)
  const { store } = useContext(ReactReduxContext)
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(store.getState().get('auth').get('user'))
    if (user) {
      console.log()
      setRole(user.get('role'))
    }
    // alert(role);
  }, [user])
  function setIdFromtable(idTable) {
    setID(idTable)
  }
  return (
    <div>
      <header>
        <NavBar />
      </header>
      <div className="h-2/4 ml-auto mr-auto mt-16 pb-16 text-lg">
        <span id="screen-name" className="text-5xl inline-block ml-16 mt-4">
          メンバ詳細
        </span>
        <TaskControl id={id} role={role} />
        <MemberDetailTable setID={setIdFromtable} />
      </div>
    </div>
  )
}
MemberDetailPage.middleware = ['auth:superadmin', 'auth:admin', 'auth:member']
export default MemberDetailPage
