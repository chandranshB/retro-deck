import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  console.log('Fetching PSX Bios...')
  const biosRes = await fetch('https://www.retrogames.cc/bios/psx.7z')
  const biosBuf = Buffer.from(await biosRes.arrayBuffer())
  fs.writeFileSync(path.join(__dirname, 'public/bios/psx.7z'), biosBuf)
  console.log('Saved psx.7z:', biosBuf.length, 'bytes')

  console.log('Fetching Tekken 3 PBP...')
  const romRes = await fetch('https://filesus3.retrogames.cc/MndKa1p4bHJicGZxbUpScENaVnJaaGhsYVd2b0M1TnY3N0dYTkhCQm9lOVRuU1ZqVmtBc1ZBRFlzT2lOY2FnL25QNmpLbUlYam1WaDAvZDBQdz09/Tekken3.PBP')
  const romBuf = Buffer.from(await romRes.arrayBuffer())
  fs.writeFileSync(path.join(__dirname, 'public/roms/tekken3.pbp'), romBuf)
  console.log('Saved tekken3.pbp:', (romBuf.length / 1024 / 1024).toFixed(2), 'MB')
}

run().catch(console.error)
