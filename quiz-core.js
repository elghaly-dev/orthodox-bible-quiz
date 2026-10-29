// Pure quiz logic, shared by the page and the tests. No network, no storage.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuizCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var LANGS = ['ar', 'en'];

  function isText(v) { return typeof v === 'string' && v.trim().length > 0; }

  function validateQuestions(data) {
    var errors = [];
    if (!data || !Array.isArray(data.questions)) return ['questions must be an array'];
    var seen = {};
    data.questions.forEach(function (q, i) {
      var tag = 'question ' + i + (q && q.id ? ' (' + q.id + ')' : '');
      if (!q || !isText(q.id)) { errors.push(tag + ': missing id'); return; }
      if (seen[q.id]) errors.push(tag + ': duplicate id');
      seen[q.id] = true;
      LANGS.forEach(function (l) {
        if (!q.q || !isText(q.q[l])) errors.push(tag + ': missing ' + l + ' text');
        if (!q.ref || !isText(q.ref[l])) errors.push(tag + ': missing ' + l + ' reference');
        var opts = q.options && q.options[l];
        if (!Array.isArray(opts) || opts.length < 3 || opts.length > 4) {
          errors.push(tag + ': ' + l + ' must have 3-4 options');
        } else {
          if (!opts.every(isText)) errors.push(tag + ': empty ' + l + ' option');
          if (new Set(opts).size !== opts.length) errors.push(tag + ': repeated ' + l + ' option');
        }
      });
      if (q.options && Array.isArray(q.options.ar) && Array.isArray(q.options.en) &&
          q.options.ar.length !== q.options.en.length) {
        errors.push(tag + ': ar and en option counts differ');
      }
      var n = q.options && Array.isArray(q.options.en) ? q.options.en.length : 0;
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= n) {
        errors.push(tag + ': answer must be one index inside the options');
      }
    });
    return errors;
  }

  function loadQuestions(data) {
    var errors = validateQuestions(data);
    if (errors.length) throw new Error('Invalid questions: ' + errors.join('; '));
    return data.questions.slice();
  }

  function isCorrect(question, choice) { return choice === question.answer; }

  // answers: array of chosen indexes (or null), aligned with questions.
  function score(questions, answers) {
    var correct = 0;
    questions.forEach(function (q, i) {
      if (answers && isCorrect(q, answers[i])) correct++;
    });
    var total = questions.length;
    return { correct: correct, total: total, percent: total ? Math.round((correct / total) * 100) : 0 };
  }

  // Fisher-Yates with an injectable random source (for tests).
  function shuffle(list, rand) {
    var a = list.slice(); rand = rand || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  return { LANGS: LANGS, validateQuestions: validateQuestions, loadQuestions: loadQuestions,
           isCorrect: isCorrect, score: score, shuffle: shuffle };
});
