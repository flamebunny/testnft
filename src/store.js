import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { moviesReducer } from './reducers/movies'

export const store = createStore(
  combineReducers({ movies: moviesReducer }), 
  applyMiddleware(thunk)
)