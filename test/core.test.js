'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../quiz-core.js');

const sample = () => ({ questions: [
  { id: 'a', ref: { ar: 'م 1', en: 'R 1' }, q: { ar: 'س', en: 'Q' },
    options: { ar: ['1', '2', '3'], en: ['x', 'y', 'z'] }, answer: 0 },
  { id: 'b', ref: { ar: 'م 2', en: 'R 2' }, q: { ar: 'س2', en: 'Q2' },
    options: { ar: ['1', '2', '3', '4'], en: ['w', 'x', 'y', 'z'] }, answer: 3 }
] });

test('score counts only correct answers', () => {
  const qs = Core.loadQuestions(sample());
  assert.deepEqual(Core.score(qs, [0, 3]), { correct: 2, total: 2, percent: 100 });
  assert.deepEqual(Core.score(qs, [0, 1]), { correct: 1, total: 2, percent: 50 });
  assert.deepEqual(Core.score(qs, [2, 0]), { correct: 0, total: 2, percent: 0 });
});

test('unanswered questions score zero', () => {
  const qs = Core.loadQuestions(sample());
  assert.deepEqual(Core.score(qs, [null, null]), { correct: 0, total: 2, percent: 0 });
  assert.deepEqual(Core.score(qs, []), { correct: 0, total: 2, percent: 0 });
});

test('empty quiz scores 0 percent without dividing by zero', () => {
  assert.deepEqual(Core.score([], []), { correct: 0, total: 0, percent: 0 });
});

test('percent is rounded', () => {
  const qs = [{ answer: 0 }, { answer: 0 }, { answer: 0 }];
  assert.equal(Core.score(qs, [0, 1, 1]).percent, 33);
  assert.equal(Core.score(qs, [0, 0, 1]).percent, 67);
});

test('isCorrect needs the exact index', () => {
  assert.equal(Core.isCorrect({ answer: 2 }, 2), true);
  assert.equal(Core.isCorrect({ answer: 2 }, '2'), false);
  assert.equal(Core.isCorrect({ answer: 2 }, null), false);
});

test('shuffle keeps every item and does not change the input', () => {
  const input = [1, 2, 3, 4, 5];
  let s = 0.42; const rand = () => (s = (s * 9301 + 49297) % 233280 / 233280);
  const out = Core.shuffle(input, rand);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
});

test('validation rejects bad questions', () => {
  const cases = [
    d => { d.questions[1].id = 'a'; },
    d => { delete d.questions[0].q.ar; },
    d => { d.questions[0].q.en = '  '; },
    d => { delete d.questions[0].ref; },
    d => { d.questions[0].options.en = ['x', 'y']; },
    d => { d.questions[1].options.en.push('v'); d.questions[1].options.ar.push('5'); },
    d => { d.questions[0].options.ar = ['1', '2', '3', '4']; },
    d => { d.questions[0].answer = 3; },
    d => { d.questions[0].answer = -1; },
    d => { d.questions[0].answer = 1.5; },
    d => { d.questions[0].answer = [0, 1]; },
    d => { d.questions[0].options.en = ['x', 'x', 'z']; }
  ];
  cases.forEach((mutate, i) => {
    const d = sample(); mutate(d);
    assert.ok(Core.validateQuestions(d).length > 0, 'case ' + i + ' should fail');
    assert.throws(() => Core.loadQuestions(d), /Invalid questions/);
  });
  assert.deepEqual(Core.validateQuestions(sample()), []);
  assert.deepEqual(Core.validateQuestions({}), ['questions must be an array']);
});
