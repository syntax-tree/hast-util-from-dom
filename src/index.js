import ns from 'web-namespaces'
import h from 'hastscript/html.js'
import s from 'hastscript/svg.js'

const ELEMENT_NODE = 1
const TEXT_NODE = 3
const COMMENT_NODE = 8
const DOCUMENT_NODE = 9
const DOCUMENT_TYPE_NODE = 10
const DOCUMENT_FRAGMENT_NODE = 11

function transform(value) {
  const node = value || {}

  switch (node.nodeType) {
    case ELEMENT_NODE:
      return element(node)
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
      return root(node)
    case TEXT_NODE:
      return text(node)
    case COMMENT_NODE:
      return comment(node)
    case DOCUMENT_TYPE_NODE:
      return doctype(node)
    default:
      return null
  }
}

// Transform a document.
function root(node) {
  return {type: 'root', children: all(node)}
}

// Transform a doctype.
function doctype(node) {
  return {
    type: 'doctype',
    name: node.name || '',
    public: node.publicId || null,
    system: node.systemId || null
  }
}

// Transform text.
function text(node) {
  return {type: 'text', value: node.nodeValue}
}

// Transform a comment.
function comment(node) {
  return {type: 'comment', value: node.nodeValue}
}

// Transform an element.
function element(node) {
  const space = node.namespaceURI
  const fn = space === ns.svg ? s : h
  const tagName = space === ns.html ? node.tagName.toLowerCase() : node.tagName
  const content =
    space === ns.html && tagName === 'template' ? node.content : node
  const attributes = node.getAttributeNames()
  const {length} = attributes
  const props = {}
  let index = 0

  while (index < length) {
    const key = attributes[index]
    props[key] = node.getAttribute(key)
    index += 1
  }

  return fn(tagName, props, all(content))
}

function all(node) {
  const nodes = node.childNodes
  const {length} = nodes
  const children = []
  let index = 0

  while (index < length) {
    const child = transform(nodes[index])

    if (child !== null) {
      children.push(child)
    }

    index += 1
  }

  return children
}

export default function fromDOM(node) {
  return transform(node) || {type: 'root', children: []}
}
