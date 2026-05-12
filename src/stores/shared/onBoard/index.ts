import { combineReducers } from '@reduxjs/toolkit'
import onBoardReducer from '@stores/shared/onBoard/onBoard'

export default combineReducers({
  onBoard: onBoardReducer,
})