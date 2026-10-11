import pg from 'pg'

const url = process.env.DATABASE_URL

if (!url) {
  throw new Error('DATABASE_URL is missing')
}

console.log('DB host:', new URL(url).host)

export const db = new pg.Pool({
  connectionString: url,
})