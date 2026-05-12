import { combineReducers } from '@reduxjs/toolkit'
import onBoardReducer from '@stores/onBoard/onBoard'

export default combineReducers({
  onBoard: onBoardReducer,
})