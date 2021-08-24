import { combineReducers } from 'redux-immutable'

import { reducers as auth } from './modules/auth'
import exampleReducer from './modules/example'

export default combineReducers({
  auth,
  exampleReducer,
})
