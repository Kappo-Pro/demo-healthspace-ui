import { combineReducers } from '@reduxjs/toolkit'
import myLibraryReducer from '@stores/content/myLibrary/myLibrary'

export default combineReducers({
	myLibrary: myLibraryReducer
})