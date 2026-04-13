const LEVEL_NUM = { L: 1, M: 2, H: 3 }
const LEVEL_COLOR = { L: '#ffb347', M: '#ff9aa2', H: '#ff6978' }
const LEVEL_LABEL = { L: '低', M: '中', H: '高' }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const ch of text) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawShareRadar(ctx, cx, cy, maxR, userLevels, dimOrder, dimDefs) {
  const n = dimOrder.length
  const angleStep = (Math.PI * 2) / n
  const startAngle = -Math.PI / 2

  for (let level = 3; level >= 1; level--) {
    const r = (level / 3) * maxR
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,154,162,0.2)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const values = dimOrder.map((dim) => LEVEL_NUM[userLevels[dim]] || 2)

  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep
    const x = cx + Math.cos(angle) * maxR
    const y = cy + Math.sin(angle) * maxR
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.strokeStyle = 'rgba(255,154,162,0.12)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    const labelR = maxR + 18
    const lx = cx + Math.cos(angle) * labelR
    const ly = cy + Math.sin(angle) * labelR
    const dim = dimOrder[i]
    const label = dimDefs[dim]?.name?.replace(/^[A-Za-z0-9]+\s*/, '') || dim
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#b07080'
    ctx.fillText(label, lx, ly)
  }

  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep
    const r = (values[i] / 3) * maxR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,154,162,0.3)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,105,120,0.8)'
  ctx.lineWidth = 2
  ctx.stroke()
}

export async function generateShareImage(primary, userLevels, dimOrder, dimDefs, mode) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const W = 720, H = 1280
      const canvas = document.createElement('canvas')
      const dpr = 2
      canvas.width = W * dpr
      canvas.height = H * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      // 背景
      roundRect(ctx, 0, 0, W, H, 0)
      ctx.fillStyle = '#fff5f5'
      ctx.fill()

      // Kicker
      ctx.font = '14px system-ui, sans-serif'
      ctx.fillStyle = '#b07080'
      ctx.textAlign = 'center'
      const kickerText = mode === 'catnip' ? '猫薄荷隐藏猫格已激活' : mode === 'fallback' ? '薛定谔兜底模式已激活' : '你的猫娘类型'
      ctx.fillText(kickerText, W / 2, 60)

      // Code
      ctx.font = 'bold 36px system-ui, sans-serif'
      ctx.fillStyle = '#ff6978'
      ctx.fillText(primary.code, W / 2, 110)

      // Name
      ctx.font = '20px system-ui, sans-serif'
      ctx.fillStyle = '#333'
      ctx.fillText(primary.cn, W / 2, 145)

      // Badge
      ctx.font = '13px system-ui, sans-serif'
      const badgeText = `匹配度 ${primary.similarity}%`
      const bw = ctx.measureText(badgeText).width + 24
      roundRect(ctx, (W - bw) / 2, 158, bw, 26, 13)
      ctx.fillStyle = '#ff6978'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText(badgeText, W / 2, 175)

      // Intro
      ctx.font = '14px system-ui, sans-serif'
      ctx.fillStyle = '#666'
      const introLines = wrapText(ctx, primary.intro || '', W - 100)
      let y = 210
      introLines.forEach((line) => { ctx.fillText(line, W / 2, y); y += 20 })

      // Radar
      drawShareRadar(ctx, W / 2, y + 120, 100, userLevels, dimOrder, dimDefs)
      y += 260

      // Dimension bars
      ctx.textAlign = 'left'
      ctx.font = '12px system-ui, sans-serif'
      for (const dim of dimOrder) {
        const level = userLevels[dim] || 'M'
        const def = dimDefs[dim]
        if (!def) continue
        const label = def.name
        ctx.fillStyle = '#666'
        ctx.fillText(label, 50, y)
        const barX = 200, barW = 400, barH = 12
        roundRect(ctx, barX, y - 9, barW, barH, 6)
        ctx.fillStyle = '#f0e0e0'
        ctx.fill()
        const fillW = (LEVEL_NUM[level] / 3) * barW
        roundRect(ctx, barX, y - 9, fillW, barH, 6)
        ctx.fillStyle = LEVEL_COLOR[level]
        ctx.fill()
        ctx.fillStyle = '#999'
        ctx.textAlign = 'right'
        ctx.fillText(LEVEL_LABEL[level], barX + barW + 30, y)
        ctx.textAlign = 'left'
        y += 24
      }

      // Footer
      ctx.textAlign = 'center'
      ctx.font = '12px system-ui, sans-serif'
      ctx.fillStyle = '#ccc'
      ctx.fillText('猫娘TI · 基于15维度猫娘人格模型', W / 2, H - 30)

      // Download
      try {
        const link = document.createElement('a')
        link.download = `catgirl-ti-${primary.code}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } catch (err) {
        console.error('Failed to export image', err)
      }
      resolve()
    }, 100)
  })
}
