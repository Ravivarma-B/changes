import { Mark, mergeAttributes } from '@tiptap/core'

export const FontSize = Mark.create({
  name: 'fontSize',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        style: 'font-size',
        getAttrs: (value: string) => {
          return value ? { fontSize: value } : false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, HTMLAttributes.fontSize ? { style: `font-size: ${HTMLAttributes.fontSize}` } : {}),
      0,
    ]
  },

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize || null,
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
    }
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ commands }: { commands: any }) => {
          return commands.setMark('fontSize', { fontSize: size })
        },
    } as Partial<import('@tiptap/core').RawCommands>
  },
})