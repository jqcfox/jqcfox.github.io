(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = document.createElement('canvas')
  canvas.id = 'starfield'
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-998;pointer-events:none;'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  let W = 0
  let H = 0
  let dpr = 1
  const stars = []

  function resize () {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.width = Math.floor(window.innerWidth * dpr)
    H = canvas.height = Math.floor(window.innerHeight * dpr)
  }

  function seed () {
    stars.length = 0
    const target = Math.max(110, Math.min(320, Math.round((W * H) / 8000)))
    for (let i = 0; i < target; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (0.4 + Math.random() * 1.6) * dpr,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.025,
        alpha: 0.45 + Math.random() * 0.55,
        drift: (Math.random() - 0.5) * 0.04 * dpr
      })
    }
  }

  resize()
  seed()
  window.addEventListener('resize', function () {
    resize()
    seed()
  })

  const mouse = { x: -1e5, y: -1e5 }
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX * dpr
    mouse.y = e.clientY * dpr
  }, { passive: true })
  window.addEventListener('mouseleave', function () {
    mouse.x = -1e5
    mouse.y = -1e5
  })
  window.addEventListener('touchstart', function (e) {
    const t = e.touches[0]
    if (t) {
      mouse.x = t.clientX * dpr
      mouse.y = t.clientY * dpr
    }
  }, { passive: true })
  window.addEventListener('touchmove', function (e) {
    const t = e.touches[0]
    if (t) {
      mouse.x = t.clientX * dpr
      mouse.y = t.clientY * dpr
    }
  }, { passive: true })
  window.addEventListener('touchend', function () {
    mouse.x = -1e5
    mouse.y = -1e5
  })

  const LINK_DIST = 110 * dpr
  const MOUSE_DIST = 170 * dpr

  function drawFrame () {
    ctx.clearRect(0, 0, W, H)
    let i, j

    for (i = 0; i < stars.length; i++) {
      const s = stars[i]
      s.phase += s.speed
      s.x += s.drift
      if (s.x > W + 30) s.x = -30
      if (s.x < -30) s.x = W + 30
      const twinkle = 0.45 + 0.55 * Math.sin(s.phase)
      const a = s.alpha * twinkle
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'
      ctx.fill()
    }

    // 星星之间的星座连线
    ctx.lineWidth = 0.5 * dpr
    for (i = 0; i < stars.length; i++) {
      const a = stars[i]
      for (j = i + 1; j < stars.length; j++) {
        const b = stars[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d2 = dx * dx + dy * dy
        if (d2 < LINK_DIST * LINK_DIST) {
          const d = Math.sqrt(d2)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = 'rgba(160,210,255,' + (0.22 * (1 - d / LINK_DIST)).toFixed(3) + ')'
          ctx.stroke()
        }
      }
    }

    // 鼠标与周围星星的星座连线
    ctx.lineWidth = 0.7 * dpr
    for (i = 0; i < stars.length; i++) {
      const a = stars[i]
      const dx = a.x - mouse.x
      const dy = a.y - mouse.y
      const d2 = dx * dx + dy * dy
      if (d2 < MOUSE_DIST * MOUSE_DIST) {
        const d = Math.sqrt(d2)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(mouse.x, mouse.y)
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.75 * (1 - d / MOUSE_DIST)).toFixed(3) + ')'
        ctx.stroke()
      }
    }
  }

  if (reduceMotion) {
    drawFrame()
    return
  }

  function loop () {
    drawFrame()
    requestAnimationFrame(loop)
  }
  loop()
})()
