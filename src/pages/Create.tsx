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
import 'tinymce/plugins/help'
import 'tinymce/plugins/wordcount'
import 'tinymce/skins/ui/oxide/skin.css'
import 'tinymce/skins/ui/oxide/content.css'
import 'tinymce/skins/content/default/content.css'
import '../App.css';
import Frame from '../comp/Frame';

export default function Create() {

  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  const [templates, setTemplates] = useState([])
  useEffect(() => {
    window.electron.listTemplates().then(setTemplates)
  }, [])

  const [name, setName] = useState("")

  const handleOpenFile = async () => {
    const content = await window.electron.openHtmlFile()
    if (content && editorRef.current) {
        editorRef.current.setContent(content)
      }
  }

  const handleExport = async () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent()
      await window.electron.exportHtml(html)
    }
  }

  const isValidFileName = (name: any) => {
    name = name.trim()
    if (name.length === 0) return false
    for (let i = 0; i < templates.length; i++) {
      if (templates[i].name == name) return false
    }
    return !/[<>:"/\\|?*]/.test(name)
  };

  const handleSaveTemplate = async () => {
    const html = editorRef.current.getContent()
    await window.electron.saveTemplate(html, name)
    document.getElementById('my_modal_1').showModal()

  }


  return (
    <Frame>
        <div className='absolute w-full top-12 bottom-0'>
          <Editor
            licenseKey='gpl'
            onInit={ (_evt, editor) => editorRef.current = editor }
            initialValue="<p>create variable like this {{crow}}</p>"
            init={{
              height: '100%',
              width: '100%',
              resize: false,
              menubar: true,
              promotion: false,
              branding: false,
              statusbar: false,
              images_upload_handler: (blobInfo) => {
                return new Promise((resolve) => {
                  const base64 = blobInfo.base64()
                  const mimeType = blobInfo.blob().type
                  resolve(`data:${mimeType};base64,${base64}`)
                })
              },
              automatic_uploads: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                'codesample', 'emoticons', 'pagebreak', 'nonbreaking',
                'directionality', 'visualchars', 'quickbars'
              ],
              toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | align lineheight | bullist numlist outdent indent | link image media table | charmap emoticons | removeformat | code fullscreen',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
        </div>

        <div className='absolute bottom-8 right-auto left-auto z-50 flex gap-3'>

          <div className='flex justify-center items-center gap-3'>

            <button className='btn btn-secondary' onClick={handleOpenFile}>📂 Open</button>


            <div className="dropdown dropdown-top dropdown-center">
              <div tabIndex={0} role="button" className="btn m-1">💾 Save</div>
              <ul tabIndex="-1" className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                <li>
                  <input type="text" placeholder="Type here" className="input" value={name} onChange={(e) => setName(e.target.value)} />
                  <button className='btn btn-primary' onClick={handleSaveTemplate} disabled={!isValidFileName(name)}>💾 Save</button>
                </li>
              </ul>
            </div>

            <button className='btn btn-accent' onClick={handleExport}>📄 Export</button>

          </div>

        </div>

        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Hello!</h3>
            <p className="py-4">Save successful</p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>

    </Frame>
  );
}