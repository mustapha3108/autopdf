import { Link, useNavigate } from 'react-router'
import Frame from '../comp/Frame'
import { useEffect, useState } from 'react'


export default function Grave(){

    const navigate = useNavigate()

    const createDoc = (path:string) => {
      navigate('/form', {state: {path : path}})
    }

    const [templates, setTemplates] = useState([])
    
    useEffect(() => {
      window.electron.listTemplates().then(setTemplates)
    }, [])

    return(
        <Frame>
            <div className='flex flex-col justify-center items-center gap-3 w-screen'> 
              {templates.map((template) => (
                <div className='w-1/2' key={template.name}>
                  <button className='btn btn-primar w-full' onClick={()=> createDoc(template.path)}>{template.name}</button>
                  <p>{template.path}</p>
                </div>
              ))}
            </div>
        </Frame>
    )
}