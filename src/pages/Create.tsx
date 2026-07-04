import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/wordcount'
import 'tinymce/skins/ui/oxide/skin.css'
import 'tinymce/skins/ui/oxide/content.css'
import 'tinymce/skins/content/default/content.css'
import 'tinymce/plugins/codesample'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/emoticons/js/emojis'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/visualchars'
import 'tinymce/plugins/quickbars'
import '../App.css';
import Frame from '../comp/Frame';

const A4_HEIGHT_PX = 1123
const A4_WIDTH_PX = 794
const PAGE_MARGIN_PX = 40

const contentStyle = `
  body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 14px;
    width: ${A4_WIDTH_PX}px;
    margin: 0 auto;
    padding: ${PAGE_MARGIN_PX}px;
    box-sizing: border-box;
    background: white;
    position: relative;
    color: #000;
  }
  img {
    border: 2px solid #1e3a8a;
    border-radius: 2px;
    box-shadow: 2px 2px 0px #9ca3af, 0 1px 4px rgba(0,0,0,0.08);
    max-width: 100%;
    display: block;
  }
  p {
    margin: 0;
    padding: 0;
    min-height: 1em;
  }
  hr.page-break-visual {
    position: absolute;
    left: -${PAGE_MARGIN_PX}px;
    width: calc(100% + ${PAGE_MARGIN_PX * 2}px);
    margin: 20;
    padding: 0;
    border: none;
    border-top: 2px dashed #3b82f6;
    pointer-events: none;
    z-index: 999;
  }
  .content-frame {
    border: 2px solid #1e3a8a;
    background: #ffffff;
    padding: 16px;
    margin: 8px 0;
    border-radius: 4px;
    box-shadow: 4px 4px 0px #9ca3af, 0 2px 8px rgba(0,0,0,0.08);
    min-height: 60px;
  }
  .content-frame p:first-child {
    margin-top: 0;
  }
  .content-frame p:last-child {
    margin-bottom: 0;
  }
`

export default function Create() {
  const editorRef = useRef<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [name, setName] = useState("")

  useEffect(() => {
    window.electron.listTemplates().then(setTemplates)
  }, [])

  const updatePageBreaks = (editor: any) => {
    const body = editor.getBody()
    const doc = editor.getDoc()

    // remove all existing visual markers
    const existing = body.querySelectorAll('hr.page-break-visual')
    existing.forEach((el: Element) => el.remove())

    const totalHeight = body.scrollHeight
    // always draw one page ahead so the user sees the next sheet boundary
    const pageCount = Math.floor(totalHeight / A4_HEIGHT_PX) + 1

    for (let i = 1; i <= pageCount; i++) {
      const breakY = i * A4_HEIGHT_PX - PAGE_MARGIN_PX

      const hr = doc.createElement('hr')
      hr.className = 'page-break-visual'
      hr.setAttribute('contenteditable', 'false')
      hr.style.cssText = [
        'position: absolute',
        `top: ${breakY}px`,
        `left: -${PAGE_MARGIN_PX}px`,
        `width: calc(100% + ${PAGE_MARGIN_PX * 2}px)`,
        'margin: 0',
        'padding: 0',
        'border: none',
        'border-top: 2px dashed #3b82f6',
        'pointer-events: none',
        'z-index: 999',
      ].join('; ')

      body.appendChild(hr)
    }
  }

  const setupEditor = (editor: any) => {
    editor.on('init', () => updatePageBreaks(editor))
    editor.on('keyup', () => updatePageBreaks(editor))
    editor.on('Change', () => updatePageBreaks(editor))
    editor.on('SetContent', () => updatePageBreaks(editor))
    editor.on('Paste', () => {
      setTimeout(() => updatePageBreaks(editor), 100)
    })
  }

  const handleOpenFile = async () => {
    const content = await window.electron.openHtmlFile()
    if (content && editorRef.current) {
      editorRef.current.setContent(content)
    }
  }

  const stripVisualMarkers = (html: string) => {
    return html.replace(/<hr[^>]*class="page-break-visual"[^>]*\/?>/gi, '')
  }

  const handleAddFrame = () => {
    if (!editorRef.current) return
    const editor = editorRef.current
    editor.insertContent(
      `<div class="content-frame"><p>Frame content</p></div><p><br></p>`
    )
    updatePageBreaks(editor)
  }

  const handleExportHtml = async () => {
    if (!editorRef.current) return
    const html = editorRef.current.getContent()
    const clean = stripVisualMarkers(html)
    await window.electron.exportHtml(clean)
  }

  const handleExportPdf = async () => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const body = editor.getBody()
    const doc = editor.getDoc()

    // ---- compute live page breaks from DOM geometry ----
    const bodyRect = body.getBoundingClientRect()
    const scrollTop = body.scrollTop
    const blockElements = Array.from(
      body.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, img, table, ul, ol, blockquote, pre, li')
    )

    const pageCount = Math.ceil(body.scrollHeight / A4_HEIGHT_PX)
    const breaks: Element[] = []

    for (let i = 1; i < pageCount; i++) {
      const breakY = i * A4_HEIGHT_PX
      for (const el of blockElements) {
        const rect = el.getBoundingClientRect()
        const elTop = rect.top - bodyRect.top + scrollTop
        const elBottom = elTop + rect.height
        if (elTop <= breakY && elBottom > breakY) {
          breaks.push(el)
          break
        }
      }
    }

    // Temporarily insert invisible page-break markers into the live DOM
    const insertedMarkers: HTMLElement[] = []
    for (const el of breaks.reverse()) {
      const marker = doc.createElement('hr')
      marker.className = 'page-break-marker'
      marker.setAttribute('contenteditable', 'false')
      marker.style.cssText =
        'page-break-before:always;break-before:page;height:0;margin:0;padding:0;border:none;'
      el.parentNode?.insertBefore(marker, el)
      insertedMarkers.push(marker)
    }

    const html = editor.getContent()

    // Remove the temporary markers from the editor immediately
    insertedMarkers.forEach((m) => m.remove())

    // Replace flow markers with PDF page-break divs
    const withBreaks = html.replace(
      /<hr[^>]*class="page-break-marker"[^>]*\/?>/gi,
      '<div style="page-break-before: always; break-before: page; height: 0; margin: 0; padding: 0;"></div>'
    )

    // Remove visual dashed lines
    const clean = stripVisualMarkers(withBreaks)

    // wrap in full HTML document — CSS is now IDENTICAL to the editor contentStyle
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 14px;
            width: ${A4_WIDTH_PX}px;
            margin: 0 auto;
            padding: ${PAGE_MARGIN_PX}px;
            box-sizing: border-box;
            background: white;
            color: #000;
          }
          img {
            border: 2px solid #3b82f6;
            box-shadow: 4px 4px 0px #1d4ed8;
            max-width: 100%;
            display: block;
          }
          p {
            margin: 0;
            padding: 0;
            min-height: 1em;
          }
          .content-frame {
            border: 2px solid #1e3a8a;
            background: #ffffff;
            padding: 16px;
            margin: 8px 0;
            border-radius: 4px;
            box-shadow: 4px 4px 0px #9ca3af, 0 2px 8px rgba(0,0,0,0.08);
            min-height: 60px;
          }
          .content-frame p:first-child {
            margin-top: 0;
          }
          .content-frame p:last-child {
            margin-bottom: 0;
          }
        </style>
      </head>
      <body>
        ${clean}
      </body>
      </html>
    `

    await window.electron.exportPdf(fullHtml)
  }

  const isValidFileName = (n: string) => {
    n = n.trim()
    if (n.length === 0) return false
    for (let i = 0; i < templates.length; i++) {
      if (templates[i].name === n) return false
    }
    return !/[<>:"/\\|?*]/.test(n)
  }

  const handleSaveTemplate = async () => {
    if (!editorRef.current) return
    const html = editorRef.current.getContent()
    const clean = stripVisualMarkers(html)
    await window.electron.saveTemplate(clean, name)
    document.getElementById('my_modal_1')?.showModal()
  }

  return (
    <Frame>
      {/* Editor is now exactly A4 width and centred; overflow-x allows scrolling on small screens */}
      <div className='absolute w-full top-12 bottom-0 overflow-x-auto'>
        <div style={{ width: A4_WIDTH_PX, margin: '0 auto', height: '100%' }}>
          <Editor
            licenseKey='gpl'
            onInit={(_evt, editor) => {
              editorRef.current = editor
            }}
            initialValue="<p>Create your template here. Use {{variableName}} for dynamic fields.</p>"
            init={{
              height: '100%',
              width: '100%',
              resize: false,
              menubar: true,
              promotion: false,
              branding: false,
              statusbar: false,
              forced_root_block: 'p',
              keep_styles: true,
              entities: '160,nbsp',
              verify_html: false,
              cleanup: false,
              remove_trailing_brs: false,

              setup: setupEditor,
              images_upload_handler: (blobInfo) => {
                return new Promise((resolve) => {
                  const base64 = blobInfo.base64()
                  const mimeType = blobInfo.blob().type
                  resolve(`data:${mimeType};base64,${base64}`)
                })
              },
              automatic_uploads: true,
              valid_elements: '*[*]',
              extended_valid_elements: 'div[*],hr[*],p[*],span[*]',
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'preview', 'wordcount',
                'codesample', 'emoticons', 'pagebreak', 'nonbreaking',
                'directionality', 'visualchars', 'quickbars'
              ],
              toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | align lineheight | bullist numlist outdent indent | link image media table | charmap emoticons | removeformat | code fullscreen',
              content_style: contentStyle
            }}
          />
        </div>
      </div>

      <div className='absolute bottom-8 left-0 right-0 z-50 flex justify-center'>

        

        <div className='flex items-center gap-3'>
          <button className='btn btn-info' onClick={handleAddFrame}>🖼️ Add Frame</button>
          <button className='btn btn-secondary' onClick={handleOpenFile}>📂 Open</button>

          <div className="dropdown dropdown-top dropdown-center">
            <div tabIndex={0} role="button" className="btn m-1">💾 Save</div>
            <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li>
                <input
                  type="text"
                  placeholder="Template name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button
                  className='btn btn-primary'
                  onClick={handleSaveTemplate}
                  disabled={!isValidFileName(name)}
                >
                  💾 Save
                </button>
              </li>
            </ul>
          </div>

          
          <button className='btn btn-accent' onClick={handleExportHtml}>📄 Export HTML</button>
        </div>
      </div>

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Success!</h3>
          <p className="py-4">Template saved successfully.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </Frame>
  )
}