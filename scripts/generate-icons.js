/**
 * PWA图标生成脚本
 * 使用canvas将SVG转换为PNG
 */

const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')

// SVG图标内容
const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="256" fill="#5c6b5c"/>
  <g transform="translate(128, 128)">
    <rect x="20" y="40" width="216" height="160" rx="8" fill="#f5f0eb"/>
    <rect x="124" y="40" width="8" height="160" fill="#8da892"/>
    <line x1="40" y1="70" x2="108" y2="70" stroke="#5c6b5c" stroke-width="4" stroke-linecap="round"/>
    <line x1="40" y1="95" x2="108" y2="95" stroke="#5c6b5c" stroke-width="4" stroke-linecap="round"/>
    <line x1="40" y1="120" x2="108" y2="120" stroke="#5c6b5c" stroke-width="4" stroke-linecap="round"/>
    <line x1="40" y1="145" x2="90" y2="145" stroke="#5c6b5c" stroke-width="4" stroke-linecap="round"/>
    <line x1="148" y1="70" x2="216" y2="70" stroke="#5c6b5c" stroke-width="4" stroke-linecap="round"/>
    <line x1="148" y1="95" x2="216" y2="95" stroke="#5c6b5c" stroke-width="4" stroke-linecap="round"/>
    <line x1="148" y1="120" x2="216" y2="120" stroke="#5c6b5c" stroke-width="4" stroke-linecap="round"/>
    <line x1="148" y1="145" x2="198" y2="145" stroke="#5c6b5c" stroke-width="4" stroke-linecap="round"/>
    <rect x="180" y="50" width="24" height="50" fill="#d4ddd4"/>
    <polygon points="180,100 192,110 204,100" fill="#d4ddd4"/>
  </g>
  <circle cx="80" cy="100" r="6" fill="#b3c2b3" opacity="0.6"/>
  <circle cx="432" cy="140" r="4" fill="#b3c2b3" opacity="0.6"/>
  <circle cx="100" cy="400" r="5" fill="#b3c2b3" opacity="0.6"/>
  <circle cx="420" cy="380" r="7" fill="#b3c2b3" opacity="0.6"/>
</svg>`

async function generateIcon(size, outputPath) {
  console.log(`📝 生成 ${size}x${size} 图标...`)

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // 绘制圆形背景
  ctx.fillStyle = '#5c6b5c'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // 计算内容区域缩放
  const contentScale = size / 512
  const offset = size * 128 / 512

  ctx.save()
  ctx.translate(offset, offset)
  ctx.scale(contentScale, contentScale)

  // 绘制书本背景
  ctx.fillStyle = '#f5f0eb'
  roundRect(ctx, 20, 40, 216, 160, 8)
  ctx.fill()

  // 绘制书脊
  ctx.fillStyle = '#8da892'
  ctx.fillRect(124, 40, 8, 160)

  // 绘制文字线（左边）
  ctx.strokeStyle = '#5c6b5c'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'

  const leftLines = [[40, 70, 108], [40, 95, 108], [40, 120, 108], [40, 145, 90]]
  const rightLines = [[148, 70, 216], [148, 95, 216], [148, 120, 216], [148, 145, 198]]

  leftLines.forEach(([x1, y, x2]) => {
    ctx.beginPath()
    ctx.moveTo(x1, y)
    ctx.lineTo(x2, y)
    ctx.stroke()
  })

  rightLines.forEach(([x1, y, x2]) => {
    ctx.beginPath()
    ctx.moveTo(x1, y)
    ctx.lineTo(x2, y)
    ctx.stroke()
  })

  // 绘制书签
  ctx.fillStyle = '#d4ddd4'
  ctx.fillRect(180, 50, 24, 50)
  ctx.beginPath()
  ctx.moveTo(180, 100)
  ctx.lineTo(192, 110)
  ctx.lineTo(204, 100)
  ctx.fill()

  ctx.restore()

  // 绘制装饰星星
  const stars = [
    [80, 100, 6], [432, 140, 4], [100, 400, 5], [420, 380, 7]
  ]

  stars.forEach(([x, y, r]) => {
    const sx = x * size / 512
    const sy = y * size / 512
    const sr = r * size / 512

    ctx.fillStyle = 'rgba(179, 194, 179, 0.6)'
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  })

  // 保存为PNG
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, buffer)

  console.log(`✅ 已生成: ${outputPath}`)
}

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

async function main() {
  console.log('🎨 开始生成PWA图标...\n')

  const publicDir = path.join(__dirname, '../public')
  const sizes = [192, 512]

  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}.png`)
    await generateIcon(size, outputPath)
  }

  console.log('\n✨ 所有图标生成完成！')
  console.log('\n📁 文件位置:')
  sizes.forEach(size => {
    console.log(`   - public/icon-${size}.png`)
  })
}

main().catch(console.error)
