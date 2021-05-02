/* eslint-env browser */

import test from 'tape'
import fs from 'fs'
import path from 'path'
import glob from 'glob'
import {JSDOM} from 'jsdom'
import {fromDom} from '../index.js'

globalThis.window = new JSDOM().window
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
    fromDom(),
    {type: 'root', children: []},
    'should handle a missing DOM tree'
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

  function each(fixturePath) {
    const input = path.join(fixturePath, 'index.html')
    const output = path.join(fixturePath, 'index.json')
    const fixtureHtml = fs.readFileSync(input)
    const actual = fromDom(doc(fixtureHtml))
    let parsedExpected

    try {
      parsedExpected = JSON.parse(fs.readFileSync(output))
    } catch {
      fs.writeFileSync(output, JSON.stringify(actual, null, 2))
      return
    }

    t.deepEqual(actual, parsedExpected, path.basename(fixturePath))
  }
})

function fragment(htmlString) {
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

function doc(htmlString) {
  return new JSDOM(htmlString).window.document
}
