/**
 * @typedef {import('../lib/index.js').HastNode} HastNode
 */

/* eslint-env browser */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {JSDOM} from 'jsdom'
import {fromDom} from '../index.js'
import * as mod from '../index.js'

const window = new JSDOM().window
globalThis.document = window.document

test('fromDom', () => {
  assert.deepEqual(
    Object.keys(mod).sort(),
    ['fromDom'],
    'should expose the public api'
  )

  assert.deepEqual(
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

  assert.deepEqual(
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

  assert.deepEqual(
    fromDom(document.createDocumentFragment()),
    {type: 'root', children: []},
    'should support an empty fragment'
  )

  assert.deepEqual(
    fromDom(document.createComment('alpha')),
    {type: 'comment', value: 'alpha'},
    'should support a comment'
  )

  assert.deepEqual(
    fromDom(document.createTextNode('bravo')),
    {type: 'text', value: 'bravo'},
    'should support a text'
  )

  const cdata = new JSDOM('<xml></xml>', {
    contentType: 'application/xml'
  }).window.document.createCDATASection('charlie')

  assert.deepEqual(
    fromDom(cdata),
    {type: 'root', children: []},
    'should handle CDATA'
  )

  const frag = document.createDocumentFragment()

  // eslint-disable-next-line unicorn/prefer-dom-node-append
  frag.appendChild(cdata)

  assert.deepEqual(
    fromDom(frag),
    {type: 'root', children: []},
    'should handle CDATA in HTML'
  )

  assert.deepEqual(
    // @ts-expect-error runtime.
    fromDom(),
    {type: 'root', children: []},
    'should handle a missing DOM tree'
  )

  assert.deepEqual(
    fromDom(document.createTextNode('')),
    {type: 'text', value: ''},
    'should support a text w/o value'
  )

  assert.deepEqual(
    fromDom(document.createComment('')),
    {type: 'comment', value: ''},
    'should support a comment w/o value'
  )

  const attribute = document.createAttribute('title')
  const element = document.createElement('div')
  element.setAttributeNode(attribute)

  assert.deepEqual(
    fromDom(element),
    {type: 'element', tagName: 'div', properties: {title: ''}, children: []},
    'should support an attribute w/o value'
  )

  const heading = document.createElement('h2')
  const text = document.createTextNode('Hello')
  heading.append(text)

  assert.deepEqual(
    (() => {
      /** @type {Array<[Node, HastNode|undefined]>} */
      const calls = []
      fromDom(heading, {
        /**
         * @param {Node} node
         * @param {HastNode|undefined} transformed
         */
        afterTransform(node, transformed) {
          calls.push([node, transformed])
        }
      })
      return calls
    })(),
    [
      [text, {type: 'text', value: 'Hello'}],
      [
        heading,
        {
          type: 'element',
          tagName: 'h2',
          properties: {},
          children: [{type: 'text', value: 'Hello'}]
        }
      ]
    ],
    'should invoke afterTransform'
  )
})

test('fixtures', async () => {
  const base = new URL('fixtures/', import.meta.url)
  const folders = await fs.readdir(base)

  for (const folder of folders) {
    if (folder.charAt(0) === '.') {
      continue
    }

    const treeUrl = new URL(folder + '/index.json', base)
    const fixtureUrl = new URL(folder + '/index.html', base)
    const input = String(await fs.readFile(fixtureUrl))
    const actual = fromDom(doc(input))
    /** @type {HastNode} */
    let expected

    try {
      if ('UPDATE' in process.env) {
        throw new Error('Updating')
      }

      expected = JSON.parse(String(await fs.readFile(treeUrl)))
    } catch {
      await fs.writeFile(treeUrl, JSON.stringify(actual, null, 2))
      continue
    }

    assert.deepEqual(actual, expected, folder)
  }
})

/**
 * @param {string} value
 * @returns {DocumentFragment}
 */
function fragment(value) {
  const node = document.createDocumentFragment()
  const temporary = document.createElement('body')

  temporary.innerHTML = value

  let child = temporary.firstChild

  while (child) {
    // eslint-disable-next-line unicorn/prefer-dom-node-append
    node.appendChild(child)
    child = temporary.firstChild
  }

  return node
}

/**
 * @param {string} value
 * @returns {Document}
 */
function doc(value) {
  return new JSDOM(value).window.document
}
