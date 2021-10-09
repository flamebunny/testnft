import * as apiService from "../api";
import { getMoviesFromApiAsync } from "../api";



export const GET_MOVIES = 'GET_MOVIES'
export function getMovies(movies) {
  return {
	  type:  GET_MOVIES,
	  movies: [{title: 'Lord of The Rings'}, {title: 'The Matrix'}]
  }
}

export const MOVIES_FETCH = 'MOVIES_FETCH'
export function moviesFetch() {
  return {
    type: MOVIES_FETCH
  }
}

export const MOVIES_FETCH_ASYNC = 'MOVIES_FETCH_ASYNC'
export function moviesFetchAsync() {
  return (dispatch, getStore) => {
    if(getStore().fetching) {
      return
    }
    dispatch(moviesFetch())

    const url =  "https://facebook.github.io/react-native/movies.json"
    const options = { }

    apiService.get({ url, options })
      .then(response => { console.log(response); return (response) })
      .then(responseJson => {
        return responseJson.movies
      })
      .then(response => { console.log(response); return (response) })
      .then(movies => dispatch(moviesFetchSuccess({ movies })))
      .catch(error => dispatch(moviesFetchFailed({ error })))
  }
}

export const MOVIES_FETCH_SUCCESS = 'MOVIES_FETCH_SUCCESS'
export function moviesFetchSuccess({ movies }) {
  return {
    type: MOVIES_FETCH_SUCCESS,
    movies
  }
}

export const MOVIES_FETCH_FAILED = 'MOVIES_FETCH_FAILED'
export function moviesFetchFailed({ error }) {
  return {
    type: MOVIES_FETCH_FAILED,
    errorMessage: error.message
  }
}