import fs from 'fs';
import path from 'path';
import glob from 'glob';

import fromDOM from './index';

describe('hast-util-from-dom', () => {
  it('should transform a complete document', () => {
    const actual = fromDOM(doc('<title>Hello!</title><h1>World!'));

    expect(actual).toEqual({
      type: 'root',
      children: [{
        type: 'element',
        tagName: 'html',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'head',
            properties: {},
            children: [{
              type: 'element',
              tagName: 'title',
              properties: {},
              children: [{ type: 'text', value: 'Hello!' }],
            }],
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
                children: [{ type: 'text', value: 'World!' }],
              },
            ],
          },
        ],
      }],
    });
  });

  it('should transform a fragment', () => {
    const actual = fromDOM(fragment('<title>Hello!</title><h1>World!'));

    expect(actual).toEqual({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'title',
          properties: {},
          children: [{ type: 'text', value: 'Hello!' }],
        },
        {
          type: 'element',
          tagName: 'h1',
          properties: {},
          children: [{ type: 'text', value: 'World!' }],
        },
      ],
    });
  });

  it('should support an empty fragment', () => {
    const actual = fromDOM(document.createDocumentFragment());

    expect(actual).toEqual({ type: 'root', children: [] });
  });

  it('should support a comment', () => {
    const actual = fromDOM(document.createComment('alpha'));

    expect(actual).toEqual({ type: 'comment', value: 'alpha' });
  });

  it('should support a text', () => {
    const actual = fromDOM(document.createTextNode('bravo'));

    expect(actual).toEqual({ type: 'text', value: 'bravo' });
  });

  it('should handle CDATA', () => {
    const xmlDoc = new DOMParser().parseFromString('<xml></xml>', 'application/xml');
    const actual = fromDOM(xmlDoc.createCDATASection('charlie'));

    expect(actual).toEqual({ type: 'root', children: [] });
  });

  it('should handle CDATA in HTML', () => {
    const xmlDoc = new DOMParser().parseFromString('<xml></xml>', 'application/xml');
    const frag = document.createDocumentFragment();

    frag.appendChild(xmlDoc.createCDATASection('charlie'));

    const actual = fromDOM(frag);

    expect(actual).toEqual({ type: 'root', children: [] });
  });

  it('should handle a missing DOM tree', () => {
    const actual = fromDOM();

    expect(actual).toEqual({ type: 'root', children: [] });
  });
});

describe('fixtures', () => {
  const root = path.join(__dirname, '__fixtures__');
  const fixturePaths = glob.sync(path.join(root, '**/*/'));

  fixturePaths.forEach((fixturePath) => {
    const fixture = path.relative(root, fixturePath);
    const input = path.join(fixturePath, 'index.html');
    const output = path.join(fixturePath, 'index.json');

    test(fixture, () => {
      const fixtureHtml = fs.readFileSync(input);
      const actual = fromDOM(doc(fixtureHtml));
      let parsedExpected;

      try {
        parsedExpected = JSON.parse(fs.readFileSync(output));
      } catch (e) {
        fs.writeFileSync(output, JSON.stringify(actual, null, 2));
        return;
      }

      expect(actual).toEqual(parsedExpected);
    });
  });
});

function fragment(htmlString) {
  const node = document.createDocumentFragment();
  const tempEl = document.createElement('body');

  tempEl.innerHTML = htmlString;

  let child = tempEl.firstChild;

  while (child) {
    node.appendChild(child);
    child = tempEl.firstChild;
  }

  return node;
}

function doc(htmlString) {
  const parser = new DOMParser();
  return parser.parseFromString(htmlString, 'text/html');
}
