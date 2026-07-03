import { useEffect, useRef } from 'react';
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
import { useLocation } from 'react-router';

export default function Preview() {
  const editorRef = useRef<any>(null)
  const pendingHtmlRef = useRef<string | null>(null)
  const { state } = useLocation()

  useEffect(() => {
    if (!state?.html) return
    pendingHtmlRef.current = state.html
    if (editorRef.current) {
      editorRef.current.setContent(state.html)
    }
  }, [state])

  return (
    <Frame>
      <div className='absolute w-full top-12 bottom-0'>
        <Editor
          licenseKey='gpl'
          onInit={(_evt, editor) => {
            editorRef.current = editor
          }}
          initialValue={state?.html || ''}
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
              'insertdatetime', 'media', 'table', 'preview', 'wordcount',
              'codesample', 'emoticons', 'pagebreak', 'nonbreaking',
              'directionality', 'visualchars', 'quickbars'
            ],
            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | align lineheight | bullist numlist outdent indent | link image media table | charmap emoticons | removeformat | code fullscreen',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
        />
      </div>
    </Frame>
  );
}