'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Core = require('../quiz-core.js');
const { render } = require('../scripts/build.js');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'questions.json'), 'utf8'));

test('question bank loads and passes validation', () => {
  assert.deepEqual(Core.validateQuestions(data), []);
  const qs = Core.loadQuestions(data);
  assert.ok(qs.length >= 30, 'need at least 30 questions, got ' + qs.length);
});

test('every question has a reference with chapter and verse', () => {
  for (const q of data.questions) {
    assert.match(q.ref.en, /\d+:\d+/, q.id + ' en ref');
    assert.match(q.ref.ar, /\d+:\s?\d+/, q.id + ' ar ref');
  }
});

test('ids are unique', () => {
  const ids = data.questions.map(q => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('bank covers Old Testament, Gospels, and Acts/Epistles', () => {
  const sections = new Set(data.questions.map(q => q.section));
  for (const s of ['ot', 'gospels', 'acts_epistles']) assert.ok(sections.has(s), s);
});

test('questions.js is in sync with questions.json', () => {
  const current = fs.readFileSync(path.join(root, 'questions.js'), 'utf8');
  assert.equal(current, render(), 'run: node scripts/build.js');
});
