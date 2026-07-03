import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import Bar from '../comp/Bar'
import Frame from '../comp/Frame'

function Home() {

  return (
    <Frame>
      <Link to="/Create" className='btn btn-dash btn-primary'>create new template</Link>
      <Link to="/Doc" className='btn btn-dash btn-secondary'>create new document</Link>
      <Link to="/Templates" className='btn btn-dash btn-accent'>View Templates</Link>
    </Frame>
  )
}

export default Home