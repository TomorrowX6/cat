import questions from './data/questions.json'
import dimensions from './data/dimensions.json'
import types from './data/types.json'
import config from './data/config.json'
import { calcDimensionScores, scoresToLevels, determineResult } from './engine.js'
import { createQuiz } from './quiz.js'
import { renderResult } from './result.js'
import './style.css'

function init() {
  try {
    const loadingScreen = document.getElementById('loading-screen')
    const appContent = document.getElementById('app-content')
    if (loadingScreen) loadingScreen.style.display = 'none'
    if (appContent) appContent.style.display = 'block'

    const pages = {
      intro: document.getElementById('page-intro'),
      quiz: document.getElementById('page-quiz'),
      result: document.getElementById('page-result'),
    }

    function showPage(name) {
      Object.values(pages).forEach((p) => p.classList.remove('active'))
      pages[name].classList.add('active')
      window.scrollTo(0, 0)
    }

    function onQuizComplete(answers, isCatnipAddict) {
      const scores = calcDimensionScores(answers, questions.main)
      const levels = scoresToLevels(scores, config.scoring.levelThresholds)
      const result = determineResult(levels, dimensions.order, types.standard, types.special, { isCatnipAddict })
      renderResult(result, levels, dimensions.order, dimensions.definitions, config)
      showPage('result')
    }

    const quiz = createQuiz(questions, config, onQuizComplete)

    document.getElementById('btn-start').addEventListener('click', () => {
      quiz.start()
      showPage('quiz')
    })

    document.getElementById('btn-restart').addEventListener('click', () => {
      quiz.start()
      showPage('quiz')
    })
  } catch (err) {
    console.error('Failed to load quiz data:', err)
    document.body.innerHTML = `<div style="padding:40px; text-align:center;">
      <h2 style="color:#ff6978;">哎呀，加载失败了喵...</h2>
      <p>可能是网络不太顺畅，请刷新重试一下喵~</p>
      <button onclick="location.reload()" class="btn btn-primary" style="margin-top:20px;">重新尝试</button>
    </div>`
  }
}

init()
