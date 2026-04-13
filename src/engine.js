/**
 * 猫娘TI 评分引擎 — 纯函数，无 DOM 依赖
 */

export function calcDimensionScores(answers, questions) {
  const scores = {}
  for (const q of questions) {
    if (answers[q.id] == null) continue
    scores[q.dim] = (scores[q.dim] || 0) + answers[q.id]
  }
  return scores
}

export function scoresToLevels(scores, thresholds) {
  const levels = {}
  for (const [dim, score] of Object.entries(scores)) {
    if (score <= thresholds.L[1]) levels[dim] = 'L'
    else if (score >= thresholds.H[0]) levels[dim] = 'H'
    else levels[dim] = 'M'
  }
  return levels
}

const LEVEL_NUM = { L: 1, M: 2, H: 3 }

export function parsePattern(pattern) {
  return pattern.replace(/-/g, '').split('')
}

export function matchType(userLevels, dimOrder, pattern) {
  const typeLevels = parsePattern(pattern)
  let distance = 0
  let exact = 0

  for (let i = 0; i < dimOrder.length; i++) {
    const userVal = LEVEL_NUM[userLevels[dimOrder[i]]] || 2
    const typeVal = LEVEL_NUM[typeLevels[i]] || 2
    const diff = Math.abs(userVal - typeVal)
    distance += diff
    if (diff === 0) exact++
  }

  const similarity = Math.max(0, Math.round((1 - distance / 30) * 100))
  return { distance, exact, similarity }
}

export function determineResult(userLevels, dimOrder, standardTypes, specialTypes, options = {}) {
  const rankings = standardTypes.map((type) => ({
    ...type,
    ...matchType(userLevels, dimOrder, type.pattern),
  }))

  rankings.sort((a, b) => a.distance - b.distance || b.exact - a.exact || b.similarity - a.similarity)

  const best = rankings[0]
  const catnip = specialTypes.find((t) => t.code === 'CATNIP')
  const hhhh = specialTypes.find((t) => t.code === 'HHHH')

  if (options.isCatnipAddict && catnip) {
    return {
      primary: { ...catnip, similarity: best.similarity, exact: best.exact },
      secondary: best,
      rankings,
      mode: 'catnip',
    }
  }

  if (best.similarity < 60 && hhhh) {
    return {
      primary: { ...hhhh, similarity: best.similarity, exact: best.exact },
      secondary: best,
      rankings,
      mode: 'fallback',
    }
  }

  return {
    primary: best,
    secondary: rankings[1] || null,
    rankings,
    mode: 'normal',
  }
}
