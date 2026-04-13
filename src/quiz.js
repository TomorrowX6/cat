import { shuffle, insertAtRandom, insertAfter } from './utils.js'

export function createQuiz(questions, config, onComplete) {
  const mainQuestions = shuffle(questions.main)
  const catnipGateQ1 = questions.special.find((q) => q.id === config.catnipGate.questionId)
  const catnipGateQ2 = questions.special.find((q) => q.id === 'catnip_gate_q2')

  let queue = insertAtRandom(mainQuestions, catnipGateQ1)
  let current = 0
  let answers = {}
  let isCatnipAddict = false

  const els = {
    fill: document.getElementById('progress-fill'),
    text: document.getElementById('progress-text'),
    qText: document.getElementById('question-text'),
    options: document.getElementById('options'),
  }

  function totalCount() {
    return queue.length
  }

  function updateProgress() {
    const pct = (current / totalCount()) * 100
    els.fill.style.width = pct + '%'
    els.text.textContent = `${current} / ${totalCount()}`
  }

  function renderQuestion() {
    const q = queue[current]
    els.qText.textContent = q.text

    els.options.innerHTML = ''
    q.options.forEach((opt) => {
      const btn = document.createElement('button')
      btn.className = 'btn btn-option'
      btn.textContent = opt.label
      btn.addEventListener('click', () => selectOption(q, opt))
      els.options.appendChild(btn)
    })

    updateProgress()
  }

  function selectOption(question, option) {
    answers[question.id] = option.value

    if (question.id === config.catnipGate.questionId && option.value === config.catnipGate.triggerValue) {
      queue = insertAfter(queue, question.id, catnipGateQ2)
    }

    if (question.id === 'catnip_gate_q2' && option.value === config.catnipGate.addictTriggerValue) {
      isCatnipAddict = true
    }

    current++
    if (current >= totalCount()) {
      onComplete(answers, isCatnipAddict)
    } else {
      renderQuestion()
    }
  }

  function start() {
    current = 0
    answers = {}
    isCatnipAddict = false
    queue = insertAtRandom(shuffle(questions.main), catnipGateQ1)
    renderQuestion()
  }

  return { start, renderQuestion }
}
