/* eslint-disable react/react-in-jsx-scope */
import 'antd/dist/antd.css'
import ListCategory from '../../components/categories/ListCategory'
import OtherLayout from '../../layouts/OtherLayout'
import './style.scss'

function listCategories() {
  return (
    <div>
      <OtherLayout>
        <OtherLayout.Main>
          <div className="listCategory">
            <ListCategory />
          </div>
        </OtherLayout.Main>
      </OtherLayout>
    </div>
  )
}
listCategories.middleware = ['auth:superadmin', 'auth:admin', 'auth']
export default listCategories
