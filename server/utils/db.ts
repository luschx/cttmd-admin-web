import pg from 'pg'

let pool: pg.Pool | null = null

function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is missing')
    pool = new pg.Pool({ connectionString: url })
  }
  return pool
}

export const db = {
  query: (...args: Parameters<pg.Pool['query']>) => getPool().query(...args),
}
