'use client'

import {
  useEditor,
  EditorContent
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Blockquote from '@tiptap/extension-blockquote'
import { TextStyle } from '@tiptap/extension-text-style'
import { Button } from 'web-utils-components/button'

import {
  Bold, Italic, Quote, AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Minus
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { FontSize } from './extension/FontSize'
import { cn } from 'web-utils-common'

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ value, onChange, placeholder, disabled }) => {
  const [isClient, setIsClient] = useState(false)
  
  const [isHoveringToolbar, setIsHoveringToolbar] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Blockquote,
      TextStyle,
      FontSize
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => {
      // Delay needed to allow hover to register before hiding
      setTimeout(() => setIsFocused(false), 150)
    },
    immediatelyRender: false
  })

  if (!isClient || !editor) return null

  const showToolbar = isFocused || isHoveringToolbar

  return (
    <div className="relative w-full space-y-2">
      {/* Sticky Toolbar */}
      <div
        className={cn(
          "absolute bottom-[-45px] left-0 w-full z-10 flex items-center flex-wrap gap-1 bg-background/90 backdrop-blur border rounded-md p-1 shadow transition-opacity",
          showToolbar ? "block opacity-100" : "hidden opacity-0 pointer-events-none"
        )}
        onMouseEnter={() => setIsHoveringToolbar(true)}
        onMouseLeave={() => setIsHoveringToolbar(false)}
      >
        {/* formatting controls */}
        <Button onClick={() => editor.chain().focus().toggleBold().run()} variant="ghost" size="icon">
          <Bold size={16} />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} variant="ghost" size="icon">
          <Italic size={16} />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} variant="ghost" size="icon">
          <Quote size={16} />
        </Button>

        <Button onClick={() => editor.chain().focus().setHorizontalRule().run()} variant="ghost" size="icon">
          <Minus size={16} />
        </Button>
        <select
          value={
            [1, 2, 3, 4, 5, 6].find(lvl => editor.isActive('heading', { level: lvl }))?.toString() ?? ''
          }
          onChange={(e) => {
            const level = Number(e.target.value)
            if (level) {
              editor.chain().focus().toggleHeading({ level: level as any }).run()
            } else {
              // Reset to paragraph
              editor.chain().focus().setParagraph().run()
            }
          }}
          className="text-sm rounded px-2 py-1 border mb-1"
        >
          <option value="">Normal text</option>
          {[1, 2, 3, 4, 5, 6].map(lvl => (
            <option key={lvl} value={lvl}>Heading {lvl}</option>
          ))}
        </select>
        <Button onClick={() => editor.chain().focus().setTextAlign('left').run()} variant="ghost" size="icon">
          <AlignLeft size={16} />
        </Button>
        <Button onClick={() => editor.chain().focus().setTextAlign('center').run()} variant="ghost" size="icon">
          <AlignCenter size={16} />
        </Button>
        <Button onClick={() => editor.chain().focus().setTextAlign('right').run()} variant="ghost" size="icon">
          <AlignRight size={16} />
        </Button>

        <select
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="text-sm rounded px-2 py-1 border ml-2 bg-background text-foreground border-border dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
          defaultValue=""
        >
          <option disabled value="">Font size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
          <option value="40px">40px</option>
          <option value="48px">48px</option>
          <option value="56px">56px</option>
          <option value="64px">64px</option>
        </select>

      </div>

      {/* Editor content */}
      <div className="relative">
        {editor && editor.isEmpty && !isFocused && (
          <div className="absolute top-2 left-3 text-sm text-muted-foreground pointer-events-none select-none">
            {placeholder || 'Write something...'}
          </div>
        )}
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm dark:prose-invert min-h-[56px] w-full rounded-sm px-3 py-2 text-sm hover:outline-1 focus:outline-none",
            "bg-white/10 dark:bg-gray-800/60",
            "text-foreground",
            "items-center align-middle"
          )}
        />
      </div>
    </div>
  )
}