import React from 'react'
import { connect } from 'react-redux'
import { moviesFetchAsync } from '../../actions/movies'

export const GetMoviesButton = ({ moviesFetchAsync }) =>
  <button onClick={moviesFetchAsync}>Get Movies</button>

export default connect(null, { moviesFetchAsync })(GetMoviesButton)
