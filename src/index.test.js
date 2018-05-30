import fs from 'fs';
import path from 'path';
import glob from 'glob';

import fromDOM from './index';

function createFragmentFromHtml(htmlString) {
  const fragment = document.createDocumentFragment();
  const tempEl = document.createElement('body');
  tempEl.innerHTML = htmlString;
  let child = tempEl.firstChild;
  while (child) {
    fragment.appendChild(child);
    child = tempEl.firstChild;
  }
  return fragment;
}

function createDocumentFromHtml(htmlString) {
  const parser = new DOMParser();
  return parser.parseFromString(htmlString, 'text/html');
}

describe('hast-util-from-dom', () => {
  it('should transform a complete document', () => {
    const fixtureHtml = '<title>Hello!</title><h1>World!';
    const parsedActual = fromDOM(createDocumentFromHtml(fixtureHtml));
    const parsedExpected = {
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
    };
    expect(parsedActual).toEqual(parsedExpected);
  });

  it('should transform a fragment', () => {
    const fixtureHtml = '<title>Hello!</title><h1>World!';
    const parsedActual = fromDOM(createFragmentFromHtml(fixtureHtml));
    const parsedExpected = {
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
    };
    expect(parsedActual).toEqual(parsedExpected);
  });
});

describe('fixtures', () => {
  const FIXTURES_PATH = path.join(__dirname, '__fixtures__');
  const fixturePaths = glob.sync(path.join(FIXTURES_PATH, '**/*/'));
  fixturePaths.forEach((fixturePath) => {
    const fixture = path.relative(FIXTURES_PATH, fixturePath);
    const fixtureInput = path.join(fixturePath, 'index.html');
    const fixtureOutput = path.join(fixturePath, 'index.json');

    test(fixture, () => {
      const fixtureHtml = fs.readFileSync(fixtureInput);
      const parsedActual = fromDOM(createDocumentFromHtml(fixtureHtml));
      let parsedExpected;
      try {
        parsedExpected = JSON.parse(fs.readFileSync(fixtureOutput));
      } catch (e) {
        fs.writeFileSync(fixtureOutput, JSON.stringify(parsedActual, null, 2));
        return;
      }
      expect(parsedActual).toEqual(parsedExpected);
    });
  });
});
