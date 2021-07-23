/**
 * @typedef {import('hast').Parent} HastParent
 * @typedef {import('hast').Root} HastRoot
 * @typedef {import('hast').DocType} HastDoctype
 * @typedef {import('hast').Element} HastElement
 * @typedef {import('hast').Text} HastText
 * @typedef {import('hast').Comment} HastComment
 * @typedef {HastParent['children'][number]} HastChild
 * @typedef {HastChild|HastRoot} HastNode
 */

import {webNamespaces} from 'web-namespaces'
import {h, s} from 'hastscript'

const ELEMENT_NODE = 1
const TEXT_NODE = 3
const COMMENT_NODE = 8
const DOCUMENT_NODE = 9
const DOCUMENT_TYPE_NODE = 10
const DOCUMENT_FRAGMENT_NODE = 11

/**
 * @param {Node} node
 * @returns {HastNode|undefined}
 */
function transform(node) {
  switch (node.nodeType) {
    case ELEMENT_NODE:
      // @ts-expect-error TypeScript is wrong.
      return element(node)
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
      // @ts-expect-error TypeScript is wrong.
      return root(node)
    case TEXT_NODE:
      // @ts-expect-error TypeScript is wrong.
      return text(node)
    case COMMENT_NODE:
      // @ts-expect-error TypeScript is wrong.
      return comment(node)
    case DOCUMENT_TYPE_NODE:
      return doctype()
    default:
      return undefined
  }
}

/**
 * Transform a document.
 *
 * @param {Document|DocumentFragment} node
 * @returns {HastRoot}
 */
function root(node) {
  return {type: 'root', children: all(node)}
}

/**
 * Transform a doctype.
 *
 * @returns {HastDoctype}
 */
function doctype() {
  // @ts-expect-error hast types out of date.
  return {type: 'doctype'}
}

/**
 * Transform a text.
 *
 * @param {Text} node
 * @returns {HastText}
 */
function text(node) {
  return {type: 'text', value: node.nodeValue || ''}
}

/**
 * Transform a comment.
 *
 * @param {Comment} node
 * @returns {HastComment}
 */
function comment(node) {
  return {type: 'comment', value: node.nodeValue || ''}
}

/**
 * Transform an element.
 *
 * @param {Element} node
 * @returns {HastElement}
 */
function element(node) {
  const space = node.namespaceURI
  const fn = space === webNamespaces.svg ? s : h
  const tagName =
    space === webNamespaces.html ? node.tagName.toLowerCase() : node.tagName
  /** @type {DocumentFragment|Element} */
  const content =
    // @ts-expect-error Types are wrong.
    space === webNamespaces.html && tagName === 'template' ? node.content : node
  const attributes = node.getAttributeNames()
  /** @type {Object.<string, string>} */
  const props = {}
  let index = -1

  while (++index < attributes.length) {
    props[attributes[index]] = node.getAttribute(attributes[index]) || ''
  }

  return fn(tagName, props, all(content))
}

/**
 * Transform an element.
 *
 * @param {Document|DocumentFragment|Element} node
 * @returns {Array.<HastChild>}
 */
function all(node) {
  const nodes = node.childNodes
  /** @type {Array.<HastChild>} */
  const children = []
  let index = -1

  while (++index < nodes.length) {
    const child = transform(nodes[index])

    if (child !== undefined) {
      // @ts-expect-error Assume no document inside document.
      children.push(child)
    }
  }

  return children
}

/**
 * @param {Node} node
 * @returns {HastNode}
 */
export function fromDom(node) {
  return transform(node || {}) || {type: 'root', children: []}
}
