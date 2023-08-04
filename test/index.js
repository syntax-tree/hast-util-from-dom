/**
 * @typedef {import('../lib/index.js').HastNodes} HastNodes
 */

/* eslint-env browser */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {fromDom} from 'hast-util-from-dom'
import {JSDOM} from 'jsdom'

const window = new JSDOM().window
globalThis.document = window.document

test('fromDom', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('hast-util-from-dom')).sort(), [
      'fromDom'
    ])
  })

  await t.test('should transform a complete document', async function () {
    assert.deepEqual(fromDom(doc('<title>Hello!</title><h1>World!')), {
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
    })
  })

  await t.test('should transform a fragment', async function () {
    assert.deepEqual(fromDom(fragment('<title>Hello!</title><h1>World!')), {
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
    })
  })

  await t.test('should support an empty fragment', async function () {
    assert.deepEqual(fromDom(document.createDocumentFragment()), {
      type: 'root',
      children: []
    })
  })

  await t.test('should support a comment', async function () {
    assert.deepEqual(fromDom(document.createComment('alpha')), {
      type: 'comment',
      value: 'alpha'
    })
  })

  await t.test('should support a text', async function () {
    assert.deepEqual(fromDom(document.createTextNode('bravo')), {
      type: 'text',
      value: 'bravo'
    })
  })

  await t.test('should handle CDATA', async function () {
    const cdata = new JSDOM('<xml></xml>', {
      contentType: 'application/xml'
    }).window.document.createCDATASection('charlie')

    assert.deepEqual(fromDom(cdata), {type: 'root', children: []})
  })

  await t.test('should handle CDATA in HTML', async function () {
    const cdata = new JSDOM('<xml></xml>', {
      contentType: 'application/xml'
    }).window.document.createCDATASection('charlie')
    const frag = document.createDocumentFragment()

    // eslint-disable-next-line unicorn/prefer-dom-node-append
    frag.appendChild(cdata)

    assert.deepEqual(fromDom(frag), {type: 'root', children: []})
  })

  await t.test('should support a text w/o value', async function () {
    assert.deepEqual(fromDom(document.createTextNode('')), {
      type: 'text',
      value: ''
    })
  })

  await t.test('should support a comment w/o value', async function () {
    assert.deepEqual(fromDom(document.createComment('')), {
      type: 'comment',
      value: ''
    })
  })

  await t.test('should support an attribute w/o value', async function () {
    const attribute = document.createAttribute('title')
    const element = document.createElement('div')
    element.setAttributeNode(attribute)

    assert.deepEqual(fromDom(element), {
      type: 'element',
      tagName: 'div',
      properties: {title: ''},
      children: []
    })
  })

  await t.test('should call `afterTransform`', async function () {
    const heading = document.createElement('h2')
    const text = document.createTextNode('Hello')
    heading.append(text)

    /** @type {Array<[unknown, unknown]>} */
    const calls = []

    fromDom(heading, {
      afterTransform(node, transformed) {
        calls.push([node, transformed])
      }
    })

    assert.deepEqual(calls, [
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
    ])
  })
})

test('fixtures', async function (t) {
  const base = new URL('fixtures/', import.meta.url)
  const folders = await fs.readdir(base)

  for (const folder of folders) {
    if (folder.charAt(0) === '.') {
      continue
    }

    await t.test(folder, async function () {
      const treeUrl = new URL(folder + '/index.json', base)
      const fixtureUrl = new URL(folder + '/index.html', base)
      const input = String(await fs.readFile(fixtureUrl))
      const actual = fromDom(doc(input))
      /** @type {HastNodes} */
      let expected

      try {
        if ('UPDATE' in process.env) {
          throw new Error('Updating')
        }

        expected = JSON.parse(String(await fs.readFile(treeUrl)))
      } catch {
        await fs.writeFile(treeUrl, JSON.stringify(actual, undefined, 2))
        return
      }

      assert.deepEqual(actual, expected, folder)
    })
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
