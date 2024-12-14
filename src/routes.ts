import { PGlite } from '@electric-sql/pglite'
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm'
import { createPlaywrightRouter, Dataset } from 'crawlee'
import * as S from 'effect/Schema'
import inputSchema from '../.actor/input_schema.json' assert { type: 'json' }

export const router = createPlaywrightRouter()

const UserData = S.Struct({
  keyPhrase: S.String,
  similarityThreshold: S.Number.pipe(
    S.greaterThanOrEqualTo(
      inputSchema.properties.similarityThreshold.minimum / 100.0,
    ),
    S.lessThanOrEqualTo(
      inputSchema.properties.similarityThreshold.maximum / 100.0,
    ),
  ),
})

const charset = [...'abcdefghijklmnopqrstuvwxyz0123456789_-']

const generatePermutations = (input: string) =>
  charset.map((c) => [`${c} ${input}`, `${input} ${c}`]).flat()

router.addDefaultHandler(async ({ page, log, request }) => {
  // Log the input parameters
  log.info('Input parameters:', { userData: request.userData })

  // Get searchQueries from crawler configuration with proper typing
  const { keyPhrase, similarityThreshold } = await S.decodeUnknownPromise(
    UserData,
  )(
    request.userData,
  )

  const permutations = generatePermutations(keyPhrase)

  // Navigate to YouTube
  await page.goto('https://www.youtube.com')

  await page.evaluate(() => {
    const backdrop = document.querySelector('tp-yt-iron-overlay-backdrop')
    if (backdrop) {
      backdrop.remove()
    }
  })

  const suggestions: string[] = []
  // Process each search query
  for (const searchQuery of permutations) {
    log.debug('Processing search query', { searchQuery })

    // Wait for the search box to be available
    const searchBox = await page.waitForSelector('input[name="search_query"]')

    await searchBox.evaluate((el) => (el as HTMLInputElement).value = '')

    // Type slowly to trigger autocomplete
    await searchBox.fill(searchQuery)

    // Wait for suggestions to appear
    await page.waitForSelector('.ytSuggestionComponentSuggestion', {
      timeout: 5000,
    })

    // Get all autocomplete suggestions
    suggestions.push(
      ...(
        await page.evaluate(() => {
          const items = document.querySelectorAll('.ytSuggestionComponentText')
          return Array
            .from(items, (item) => item.getAttribute('aria-label'))
            .filter((s): s is string => s !== null)
        })
      ),
    )
  }

  const pglite = new PGlite({ extensions: { pg_trgm } })

  await pglite.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
  await pglite.query(`
    CREATE TABLE suggestions (
      id SERIAL PRIMARY KEY,
      suggestion TEXT NOT NULL
    );
  `)

  await pglite.query(
    `INSERT INTO suggestions (suggestion) VALUES ${
      suggestions.map((_, i) => `($${i + 1})`).join(',')
    }`,
    suggestions,
  )

  const dedupedSuggestions = await pglite.query(
    `
    WITH similar_groups AS (
      SELECT DISTINCT ON (s1.suggestion) 
        s1.suggestion
      FROM suggestions s1
      JOIN suggestions s2 ON similarity(s1.suggestion, s2.suggestion) > $1
      ORDER BY s1.suggestion, length(s1.suggestion)
    )
    SELECT * FROM similar_groups;
  `,
    [similarityThreshold],
  )

  await Dataset.pushData({
    keyPhrase,
    suggestions: dedupedSuggestions.rows.map((row) => (row as any).suggestion),
    timestamp: new Date().toISOString(),
  })

  log.info('Saved autocomplete suggestions', {
    keyPhrase,
    count: suggestions.length,
  })
})
