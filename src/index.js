import h from 'hastscript';

const ELEMENT_NODE = 1;
// const ATTRIBUTE_NODE = 2;
const TEXT_NODE = 3;
// const CDATA_SECTION_NODE = 4;
// const ENTITY_REFERENCE_NODE = 5;
// const ENTITY_NODE = 6;
// const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_TYPE_NODE = 10;
const DOCUMENT_FRAGMENT_NODE = 11;
// const NOTATION_NODE = 12;

function transform(el) {
  const children = [];
  const length = el.childNodes ? el.childNodes.length : 0;
  for (let i = 0; i < length; i += 1) {
    children.push(transform(el.childNodes[i]));
  }

  switch (el.nodeType) {
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
      return root(el, children);
    case TEXT_NODE:
      return text(el, children);
    case COMMENT_NODE:
      return comment(el, children);
    case DOCUMENT_TYPE_NODE:
      return doctype(el, children);
    case ELEMENT_NODE:
      return element(el, children);
    default:
      break;
  }

  switch (el.nodeName) {
    case '#document':
    case '#document-fragment':
      return root(el, children);
    case '#text':
      return text(el, children);
    case '#comment':
      return comment(el, children);
    case 'html':
    case '#documentType':
      return doctype(el, children);
    default:
      return element(el, children);
  }
}

/**
 * Transform a document
 */
function root(el, children) {
  return { type: 'root', children };
}

/**
 * Transform a DOCTYPE
 */
function doctype(el) {
  return {
    type: 'doctype',
    name: el.name || '',
    public: el.publicId || null,
    system: el.systemId || null,
  };
}

/**
 * Transform text node
 */
function text(el) {
  return { type: 'text', value: el.nodeValue };
}

/**
 * Transform a comment node
 */
function comment(el) {
  return { type: 'comment', value: el.data };
}

/**
 * Transform an element
 */
function element(el, children) {
  const tagName = el.tagName.toLowerCase();
  const props = {};
  const attrs = typeof el.getAttributeNames === 'function'
    ? el.getAttributeNames()
    : [];
  const { length } = attrs;

  for (let i = 0; i < length; i += 1) {
    const key = attrs[i];
    const value = el.getAttribute(key);
    props[key] = value;
  }

  const node = h(tagName, props, children);

  if (tagName === 'template' && 'content' in el) {
    node.content = transform(el.content);
  }

  return node;
}

export default function fromDOM(el) {
  return transform(el);
}
