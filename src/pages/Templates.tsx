import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import Bar from '../comp/Bar'
import Frame from '../comp/Frame'

export default function Templates() {
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    window.electron.listTemplates().then(setTemplates)
  }, [])

  return (
    <Frame>
      <div>
        {templates.map((template) => (
          <div key={template.name}>
            <span>{template.name}</span>
            <button className='btn btn-primary btn-outline'>share</button>
            <button className='btn btn-error btn-dash'>delete</button>
          </div>
        ))}
      </div>
    </Frame>
  )
}

