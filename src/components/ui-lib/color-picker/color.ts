// @ts-nocheck

export const isOnePointZero = (n) => {
  return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1
}

export const isPercentage = (n) => {
  return typeof n === 'string' && n.indexOf('%') !== -1
}

export const bound01 = (value, max) => {
  if (isOnePointZero(value)) value = '100%'

  const processPercent = isPercentage(value)
  value = Math.min(max, Math.max(0, parseFloat(value)))

  // Automatically convert percentage into number
  if (processPercent) {
    value = parseInt(value * max, 10) / 100
  }

  // Handle floating point rounding errors
  if (Math.abs(value - max) < 0.000001) {
    return 1
  }

  // Convert into [0, 1] range if it isn't already
  return (value % max) / parseFloat(max)
}

export const rgbToHex = (r, g, b) => {
  r = parseInt(r)
  g = parseInt(g)
  b = parseInt(b)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

export const rgbObjectToString = (rgb) => {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

export const rgbToHsv = (r, g, b) => {
  r = bound01(r, 255)
  g = bound01(g, 255)
  b = bound01(b, 255)

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s
  let v = max
  const d = max - min
  s = max === 0 ? 0 : d / max
  if (max === min) {
    h = 0 // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, v: v * 100 }
}

export const hsvToRgb = (h, s, v) => {
  h = bound01(h, 360) * 6
  s = bound01(s, 100)
  v = bound01(v, 100)

  const i = Math.floor(h)
  const f = h - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const mod = i % 6
  const r = [v, q, p, p, t, v][mod]
  const g = [t, v, v, q, p, p][mod]
  const b = [p, p, t, v, v, q][mod]

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

export const rgbStringToObject = (rgb) => {
  rgb = rgb
    .substring(4, rgb.length - 1)
    .replace(/ /g, '')
    .split(',')

  return { r: rgb[0], g: rgb[1], b: rgb[2] }
}

export const isValidHex = (hex) => {
  return /^#[0-9A-F]{6}$/i.test(hex)
}

export const isValidRgb = (rgb) => {
  return /^rgb[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*(?:,(?![)])|(?=[)]))){3}[)]$/i.test(
    rgb
  )
}
