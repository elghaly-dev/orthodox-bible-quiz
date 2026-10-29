(function () {
  'use strict';
  var Core = self.QuizCore;
  var UI = {
    ar: { title: 'مسابقة الكتاب المقدس', toggle: 'English', intro: 'أسئلة من الكتاب المقدس. اختر إجابة واحدة لكل سؤال.',
          start: 'ابدأ', next: 'التالي', finish: 'النتيجة', again: 'العب مرة أخرى', right: 'إجابة صحيحة', wrong: 'الإجابة الصحيحة: ',
          ref: 'المرجع: ', progress: function (i, n) { return 'السؤال ' + i + ' من ' + n; },
          result: 'النتيجة', score: function (s) { return s.correct + ' من ' + s.total + ' (' + s.percent + '%)'; } },
    en: { title: 'Bible Quiz', toggle: 'العربية', intro: 'Questions from the Holy Bible. Pick one answer for each question.',
          start: 'Start', next: 'Next', finish: 'See score', again: 'Play again', right: 'Correct', wrong: 'Right answer: ',
          ref: 'Reference: ', progress: function (i, n) { return 'Question ' + i + ' of ' + n; },
          result: 'Your score', score: function (s) { return s.correct + ' of ' + s.total + ' (' + s.percent + '%)'; } }
  };
  var LANG_KEY = 'obq-lang';
  var lang = 'ar';
  try { var saved = localStorage.getItem(LANG_KEY); if (saved === 'en' || saved === 'ar') lang = saved; } catch (e) {}

  var all = Core.loadQuestions(self.QUIZ_DATA);
  var order = [], answers = [], index = 0, answered = false;
  var $ = function (id) { return document.getElementById(id); };

  function show(id) { ['start', 'quiz', 'result'].forEach(function (s) { $(s).hidden = s !== id; }); }

  function applyLang() {
    var t = UI[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t.title;
    $('title').textContent = t.title;
    $('lang-toggle').textContent = t.toggle;
    $('intro').textContent = t.intro;
    $('start-btn').textContent = t.start;
    $('again-btn').textContent = t.again;
    $('result-title').textContent = t.result;
    if (!$('quiz').hidden) renderQuestion();
    if (!$('result').hidden) renderResult();
  }

  function start() {
    order = Core.shuffle(all);
    answers = new Array(order.length).fill(null);
    index = 0;
    show('quiz');
    renderQuestion();
  }

  function renderQuestion() {
    var t = UI[lang], q = order[index];
    $('progress').textContent = t.progress(index + 1, order.length);
    $('question').textContent = q.q[lang];
    var box = $('options');
    box.textContent = '';
    answered = answers[index] !== null;
    q.options[lang].forEach(function (label, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'option'; b.textContent = label; b.setAttribute('role', 'listitem');
      if (answered) {
        b.disabled = true;
        if (i === q.answer) b.classList.add('correct');
        else if (i === answers[index]) b.classList.add('wrong');
      }
      b.addEventListener('click', function () { choose(i); });
      box.appendChild(b);
    });
    $('feedback').textContent = answered
      ? (Core.isCorrect(q, answers[index]) ? t.right : t.wrong + q.options[lang][q.answer]) : '';
    $('reference').textContent = answered ? t.ref + q.ref[lang] : '';
    $('next-btn').hidden = !answered;
    $('next-btn').textContent = index === order.length - 1 ? t.finish : t.next;
  }

  function choose(i) {
    if (answers[index] !== null) return;
    answers[index] = i;
    renderQuestion();
    $('next-btn').focus();
  }

  function next() {
    if (index < order.length - 1) { index++; renderQuestion(); }
    else { show('result'); renderResult(); }
  }

  function renderResult() { $('score').textContent = UI[lang].score(Core.score(order, answers)); }

  $('lang-toggle').addEventListener('click', function () {
    lang = lang === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyLang();
  });
  $('start-btn').addEventListener('click', start);
  $('next-btn').addEventListener('click', next);
  $('again-btn').addEventListener('click', start);
  applyLang();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
