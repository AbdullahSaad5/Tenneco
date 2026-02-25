import { getMediaUrl } from './mediaUrl'

// Lexical text format bitmask constants
const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8
const IS_CODE = 16

interface LexicalNode {
  type: string
  children?: LexicalNode[]
  // text node
  text?: string
  format?: number
  // heading
  tag?: string
  // list
  listType?: 'bullet' | 'number' | 'check'
  // link
  url?: string
  fields?: { url?: string; newTab?: boolean }
  // upload (image)
  value?: {
    url?: string
    filename?: string
    alt?: string
  }
}

interface SerializedEditorState {
  root: LexicalNode
}

function serializeNode(node: LexicalNode): string {
  switch (node.type) {
    case 'root':
      return (node.children || []).map(serializeNode).join('')

    case 'paragraph': {
      const inner = (node.children || []).map(serializeNode).join('')
      return inner ? `<p>${inner}</p>` : '<p></p>'
    }

    case 'heading': {
      const tag = node.tag || 'h2'
      const inner = (node.children || []).map(serializeNode).join('')
      return `<${tag}>${inner}</${tag}>`
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      const inner = (node.children || []).map(serializeNode).join('')
      return `<${tag}>${inner}</${tag}>`
    }

    case 'listitem': {
      const inner = (node.children || []).map(serializeNode).join('')
      return `<li>${inner}</li>`
    }

    case 'quote': {
      const inner = (node.children || []).map(serializeNode).join('')
      return `<blockquote>${inner}</blockquote>`
    }

    case 'link': {
      const href = node.fields?.url || node.url || '#'
      const newTab = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      const inner = (node.children || []).map(serializeNode).join('')
      return `<a href="${escapeAttr(href)}"${newTab}>${inner}</a>`
    }

    case 'autolink': {
      const href = node.fields?.url || node.url || '#'
      const inner = (node.children || []).map(serializeNode).join('')
      return `<a href="${escapeAttr(href)}">${inner}</a>`
    }

    case 'upload': {
      if (!node.value?.url) return ''
      const src = getMediaUrl(node.value.url)
      const alt = escapeAttr(node.value.alt || node.value.filename || '')
      return `<img src="${escapeAttr(src ?? '')}" alt="${alt}" style="max-width:100%;height:auto;" />`
    }

    case 'linebreak':
      return '<br/>'

    case 'text': {
      if (!node.text) return ''
      let html = escapeHtml(node.text)
      const fmt = node.format || 0
      if (fmt & IS_CODE) html = `<code>${html}</code>`
      if (fmt & IS_BOLD) html = `<strong>${html}</strong>`
      if (fmt & IS_ITALIC) html = `<em>${html}</em>`
      if (fmt & IS_UNDERLINE) html = `<u>${html}</u>`
      if (fmt & IS_STRIKETHROUGH) html = `<s>${html}</s>`
      return html
    }

    default:
      // For unknown node types, still render children if present
      return (node.children || []).map(serializeNode).join('')
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/&/g, '&amp;')
}

/**
 * Converts a Payload Lexical SerializedEditorState to an HTML string.
 * - If value is already a plain string (e.g. old textarea content), returns it as-is.
 * - If value is null/undefined, returns "".
 * - If value is a Lexical JSON object, serializes it to HTML.
 */
export function lexicalToHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value

  // Must be a Lexical SerializedEditorState object
  if (typeof value === 'object') {
    const state = value as SerializedEditorState
    if (state.root) {
      return serializeNode(state.root)
    }
  }

  return ''
}
