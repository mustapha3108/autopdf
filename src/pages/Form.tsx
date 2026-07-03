import { useLocation, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import Handlebars from 'handlebars'
import Frame from "../comp/Frame"

function extractVariables(html: string): string[] {
  const matches = html.match(/\{\{([^}]+)\}\}/g) || []
  return [
    ...new Set(
      matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim())
    ),
  ]
}

export default function Form() {
  const navigate = useNavigate()
  const [variables, setVariables] = useState<string[]>([])
  const [values, setValues] = useState<Record<string, string>>({});
  const [H, setH] = useState("")
  const { state } = useLocation()

  const handleGenerate = () => {
  const template = Handlebars.compile(H)
  const html = template(values)
  navigate('/Preview', {state: {html : html}})
  }

  useEffect(() => {
    async function loadTemplate() {
      if (!state?.path) return
      const html = await window.electron.loadTemplate(state.path)
      setH(html)
      const vv = extractVariables(html)
      setVariables(vv)
      const initialValues: Record<string, string> = {};
      vv.forEach((v) => {
          initialValues[v] = "";
      });
      setValues(initialValues);
    }
    loadTemplate()
  }, [state])

  return (
    <Frame>
      <div className="flex flex-col">
        {variables.map((variable) => (
          <div key={variable}>
            <label className="label">{variable}</label>
            <input className="input input-primary" type="text" placeholder={variable} 
              value={values[variable] || ""}
              onChange={(e) =>
                  setValues((prev) => ({
                      ...prev,
                      [variable]: e.target.value,
                  }))
              }
            />
          </div>
        ))}
      </div>
      <button className="btn btn-secondary" onClick={handleGenerate}>submit</button>
    </Frame>
  )
}