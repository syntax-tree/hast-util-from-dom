# hast-util-from-dom

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[hast][] utility to transform from a [DOM][] tree.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`fromDom(node)`](#fromdomnode)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [Related](#related)
*   [License](#license)

## What is this?

This package is a utility that takes a DOM tree (from the actual DOM or from
things like [`jsdom`][jsdom]) as input and turns it into a [hast][] (HTML)
syntax tree.

## When should I use this?

You can use this project when you want to use hast in browsers.
This package is very small, but it does so by:

*   …not providing positional information
*   …potentially yielding varying results in different (especially older)
    browsers

The hast utility [`hast-util-to-dom`][hast-util-to-dom] does the inverse of this
utility.
It turns hast into a DOM tree.

The rehype plugin [`rehype-dom-parse`][rehype-dom-parse] wraps this utility to
parse HTML with DOM APIs.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install hast-util-from-dom
```

In Deno with [`esm.sh`][esmsh]:

```js
import {fromDom} from 'https://esm.sh/hast-util-from-dom@4'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {fromDom} from 'https://esm.sh/hast-util-from-dom@4?bundle'
</script>
```

## Use

Say our page `example.html` looks as follows:

```html
<!doctype html>
<title>Example</title>
<body>
  <main>
    <h1>Hi</h1>
    <p><em>Hello</em>, world!</p>
  </main>
  <script type="module">
    import {fromDom} from 'https://esm.sh/hast-util-from-dom@4?bundle'

    const hast = fromDom(document.querySelector('main'))

    console.log(hast)
  </script>
```

Now running `open example.html` prints the following to the console:

```js
{type: "element", tagName: "main", properties: {}, children: Array}
```

## API

This package exports the identifier `fromDom`.
There is no default export.

### `fromDom(node)`

Turn a DOM tree into a hast tree.

##### options

Configuration (optional).

###### `options.afterTransform`

Called when a DOM node was transformed into a hast node
(`(Node, HastNode) => void?`).

##### Returns

[`HastNode`][hast-node].

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `Options`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

Use of `hast-util-from-dom` itself is safe but see other utilities for more
information on potential security problems.

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## Related

*   [`hast-util-from-parse5`][hast-util-from-parse5]
    — create hast from Parse5’s AST
*   [`hast-util-sanitize`](https://github.com/syntax-tree/hast-util-sanitize)
    — sanitize hast nodes
*   [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html)
    — serialize hast as HTML
*   [`hast-util-to-dom`](https://github.com/syntax-tree/hast-util-to-dom)
    — create DOM trees from hast

## License

[ISC][license] © [Keith McKnight][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/hast-util-from-dom/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/hast-util-from-dom/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hast-util-from-dom.svg

[coverage]: https://codecov.io/github/syntax-tree/hast-util-from-dom

[downloads-badge]: https://img.shields.io/npm/dm/hast-util-from-dom.svg

[downloads]: https://www.npmjs.com/package/hast-util-from-dom

[size-badge]: https://img.shields.io/bundlephobia/minzip/hast-util-from-dom.svg

[size]: https://bundlephobia.com/result?p=hast-util-from-dom

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://keith.mcknig.ht

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[hast]: https://github.com/syntax-tree/hast

[hast-node]: https://github.com/syntax-tree/hast#nodes

[dom]: https://developer.mozilla.org/docs/Web/API/Document_Object_Model

[hast-util-from-parse5]: https://github.com/syntax-tree/hast-util-from-parse5

[hast-util-to-dom]: https://github.com/syntax-tree/hast-util-to-dom

[rehype-dom-parse]: https://github.com/rehypejs/rehype-dom/tree/main/packages/rehype-dom-parse

[jsdom]: https://github.com/jsdom/jsdom
