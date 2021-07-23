/* eslint-env browser */

import test from 'tape'
import fs from 'fs'
import path from 'path'
import glob from 'glob'
import {JSDOM} from 'jsdom'
import {fromDom} from '../index.js'

const window = new JSDOM().window
globalThis.document = window.document

test('hast-util-from-dom', (t) => {
  t.deepEqual(
    fromDom(doc('<title>Hello!</title><h1>World!')),
    {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'html',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'head',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'title',
                  properties: {},
                  children: [{type: 'text', value: 'Hello!'}]
                }
              ]
            },
            {
              type: 'element',
              tagName: 'body',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'h1',
                  properties: {},
                  children: [{type: 'text', value: 'World!'}]
                }
              ]
            }
          ]
        }
      ]
    },
    'should transform a complete document'
  )

  t.deepEqual(
    fromDom(fragment('<title>Hello!</title><h1>World!')),
    {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'title',
          properties: {},
          children: [{type: 'text', value: 'Hello!'}]
        },
        {
          type: 'element',
          tagName: 'h1',
          properties: {},
          children: [{type: 'text', value: 'World!'}]
        }
      ]
    },
    'should transform a fragment'
  )

  t.deepEqual(
    fromDom(document.createDocumentFragment()),
    {type: 'root', children: []},
    'should support an empty fragment'
  )

  t.deepEqual(
    fromDom(document.createComment('alpha')),
    {type: 'comment', value: 'alpha'},
    'should support a comment'
  )

  t.deepEqual(
    fromDom(document.createTextNode('bravo')),
    {type: 'text', value: 'bravo'},
    'should support a text'
  )

  const cdata = new JSDOM('<xml></xml>', {
    contentType: 'application/xml'
  }).window.document.createCDATASection('charlie')

  t.deepEqual(
    fromDom(cdata),
    {type: 'root', children: []},
    'should handle CDATA'
  )

  const frag = document.createDocumentFragment()

  // eslint-disable-next-line unicorn/prefer-dom-node-append
  frag.appendChild(cdata)

  t.deepEqual(
    fromDom(frag),
    {type: 'root', children: []},
    'should handle CDATA in HTML'
  )

  t.deepEqual(
    // @ts-expect-error runtime.
    fromDom(),
    {type: 'root', children: []},
    'should handle a missing DOM tree'
  )

  t.deepEqual(
    fromDom(document.createTextNode('')),
    {type: 'text', value: ''},
    'should support a text w/o value'
  )

  t.deepEqual(
    fromDom(document.createComment('')),
    {type: 'comment', value: ''},
    'should support a comment w/o value'
  )

  const attribute = document.createAttribute('title')
  const element = document.createElement('div')
  element.setAttributeNode(attribute)

  t.deepEqual(
    fromDom(element),
    {type: 'element', tagName: 'div', properties: {title: ''}, children: []},
    'should support an attribute w/o value'
  )

  t.end()
})

test('fixtures', (t) => {
  const root = path.join('test', 'fixtures')
  const fixturePaths = glob.sync(path.join(root, '**/*/'))
  let index = -1

  while (++index < fixturePaths.length) {
    each(fixturePaths[index])
  }

  t.end()

  function each(/** @type {string} */ fixturePath) {
    const input = path.join(fixturePath, 'index.html')
    const output = path.join(fixturePath, 'index.json')
    const fixtureHtml = String(fs.readFileSync(input))
    const actual = fromDom(doc(fixtureHtml))
    /** @type {unknown} */
    let parsedExpected

    try {
      parsedExpected = JSON.parse(String(fs.readFileSync(output)))
    } catch {
      fs.writeFileSync(output, JSON.stringify(actual, null, 2))
      return
    }

    t.deepEqual(actual, parsedExpected, path.basename(fixturePath))
  }
})

function fragment(/** @type {string} */ htmlString) {
  const node = document.createDocumentFragment()
  const temporary = document.createElement('body')

  temporary.innerHTML = htmlString

  let child = temporary.firstChild

  while (child) {
    // eslint-disable-next-line unicorn/prefer-dom-node-append
    node.appendChild(child)
    child = temporary.firstChild
  }

  return node
}

function doc(/** @type {string} */ htmlString) {
  return new JSDOM(htmlString).window.document
}
