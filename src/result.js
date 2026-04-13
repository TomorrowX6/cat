import { drawRadar } from './chart.js'
import { generateShareImage } from './share.js'

const LEVEL_LABEL = { L: '低', M: '中', H: '高' }
const LEVEL_CLASS = { L: 'level-low', M: 'level-mid', H: 'level-high' }

export function renderResult(result, userLevels, dimOrder, dimDefs, config) {
  const { primary, secondary, rankings, mode } = result

  const kicker = document.getElementById('result-kicker')
  if (mode === 'catnip') kicker.textContent = '猫薄荷隐藏猫格已激活喵！'
  else if (mode === 'fallback') kicker.textContent = '薛定谔兜底模式喵'
  else kicker.textContent = '你的猫娘类型'

  document.getElementById('result-code').textContent = primary.code
  document.getElementById('result-name').textContent = primary.cn

  document.getElementById('result-badge').textContent =
    `匹配度 ${primary.similarity}%` + (primary.exact != null ? ` · 精准命中 ${primary.exact}/15 维` : '')

  document.getElementById('result-intro').textContent = primary.intro || ''
  document.getElementById('result-desc').textContent = primary.desc || ''

  const secEl = document.getElementById('result-secondary')
  if (secondary && (mode === 'catnip' || mode === 'fallback')) {
    secEl.style.display = ''
    document.getElementById('secondary-info').textContent =
      `${secondary.code}（${secondary.cn}）· 匹配度 ${secondary.similarity}%`
  } else {
    secEl.style.display = 'none'
  }

  const canvas = document.getElementById('radar-chart')
  drawRadar(canvas, userLevels, dimOrder, dimDefs)

  const detailEl = document.getElementById('dimensions-detail')
  detailEl.innerHTML = ''
  for (const dim of dimOrder) {
    const level = userLevels[dim] || 'M'
    const def = dimDefs[dim]
    if (!def) continue

    const row = document.createElement('div')
    row.className = 'dim-row'
    row.innerHTML = `
      <div class="dim-header">
        <span class="dim-name">${def.name}</span>
        <span class="dim-level ${LEVEL_CLASS[level]}">${LEVEL_LABEL[level]}</span>
      </div>
      <div class="dim-desc">${def.levels[level]}</div>
    `
    detailEl.appendChild(row)
  }

  const topEl = document.getElementById('top-list')
  topEl.innerHTML = ''
  const top5 = rankings.slice(0, 5)
  top5.forEach((t, i) => {
    const item = document.createElement('div')
    item.className = 'top-item'
    item.innerHTML = `
      <span class="top-rank">#${i + 1}</span>
      <span class="top-code">${t.code}</span>
      <span class="top-name">${t.cn}</span>
      <span class="top-sim">${t.similarity}%</span>
    `
    topEl.appendChild(item)
  })

  document.getElementById('disclaimer').textContent =
    mode === 'normal' ? config.display.funNote : config.display.funNoteSpecial

  const btnDownload = document.getElementById('btn-download')
  btnDownload.onclick = async () => {
    const originalText = btnDownload.textContent
    btnDownload.disabled = true
    btnDownload.textContent = '正在生成分享图...'
    try {
      await generateShareImage(primary, userLevels, dimOrder, dimDefs, mode)
    } finally {
      btnDownload.disabled = false
      btnDownload.textContent = originalText
    }
  }
}
