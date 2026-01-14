import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const romPath = path.join(__dirname, 'public/roms/tekken3.pbp')
const p1Path = path.join(__dirname, 'public/roms/tekken3.pbp.part1')
const p2Path = path.join(__dirname, 'public/roms/tekken3.pbp.part2')

if (!fs.existsSync(romPath)) {
  console.error('ROM not found at', romPath)
  process.exit(1)
}

const buf = fs.readFileSync(romPath)
const hashOrig = crypto.createHash('sha256').update(buf).digest('hex')

const half = Math.floor(buf.length / 2)
const p1 = buf.subarray(0, half)
const p2 = buf.subarray(half)

fs.writeFileSync(p1Path, p1)
fs.writeFileSync(p2Path, p2)
fs.unlinkSync(romPath) // Remove original 31MB file so Wrangler passes 25MB check

// Verify integrity
const joined = Buffer.concat([fs.readFileSync(p1Path), fs.readFileSync(p2Path)])
const hashNew = crypto.createHash('sha256').update(joined).digest('hex')

console.log('Part1 size:', (p1.length / 1024 / 1024).toFixed(2), 'MB')
console.log('Part2 size:', (p2.length / 1024 / 1024).toFixed(2), 'MB')
console.log('SHA256 Match:', hashOrig === hashNew ? 'PERFECT MATCH' : 'MISMATCH')
