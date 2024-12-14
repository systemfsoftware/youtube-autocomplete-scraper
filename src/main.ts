import { NodeRuntime } from '@effect/platform-node'
import { Actor } from 'apify'
import { PlaywrightCrawler } from 'crawlee'
import { Config, Effect, Option, pipe } from 'effect'
import * as S from 'effect/Schema'
import inputSchema from '../.actor/input_schema.json' assert { type: 'json' }
import { router } from './routes.js'

const Input = S.Struct({
  keyPhrase: S.String,
  maxRequestsPerCrawl: S.optionalWith(S.Number.pipe(S.nonNegative()), {
    default: () => inputSchema.properties.maxRequestsPerCrawl.default,
  }),
  similarityThreshold: S.optionalWith(
    S.transform(
      S.Number.pipe(
        S.greaterThanOrEqualTo(
          inputSchema.properties.similarityThreshold.minimum,
        ),
        S.lessThanOrEqualTo(inputSchema.properties.similarityThreshold.maximum),
      ),
      S.Number.pipe(
        S.greaterThanOrEqualTo(
          inputSchema.properties.similarityThreshold.minimum / 100.0,
        ),
        S.lessThanOrEqualTo(
          inputSchema.properties.similarityThreshold.maximum / 100.0,
        ),
      ),
      {
        decode: (x) => x / 100.0,
        encode: (x) => x * 100.0,
        strict: true,
      },
    ),
    {
      default: () => inputSchema.properties.similarityThreshold.default / 100.0,
    },
  ),
})

type Input = S.Schema.Type<typeof Input>

const parseEnv = pipe(
  Config.all({
    input: Config.option(Config.string('INPUT')),
  }),
  Effect.andThen((c) =>
    Effect.gen(function*() {
      const parsedInput = yield* pipe(
        Option.map(c.input, S.decode(S.parseJson(S.Object))),
        Option.getOrElse(() => Effect.succeed({})),
      )

      return {
        ...c,
        input: parsedInput,
      }
    })
  ),
)

const getUserInput = pipe(
  Effect.promise(() => Actor.getInput()),
  Effect.andThen(S.decodeUnknown(S.Object)),
)

const program = Effect.gen(function*() {
  yield* Effect.addFinalizer(() => Effect.promise(() => Actor.exit()))

  yield* Effect.promise(() => Actor.init())

  const { keyPhrase, similarityThreshold, maxRequestsPerCrawl } = yield* pipe(
    Effect.all(
      [parseEnv, getUserInput],
      { concurrency: 'unbounded' },
    ),
    Effect.andThen(([env, userInput]) => ({
      ...env.input,
      ...userInput,
    })),
    Effect.andThen(S.decodeUnknown(Input)),
  )

  const proxyConfiguration = yield* Effect.promise(() =>
    Actor.createProxyConfiguration()
  )

  const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: router,
    launchContext: {
      launchOptions: {
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
      },
    },
  })

  yield* Effect.tryPromise(() =>
    crawler.run([{
      url: 'https://www.youtube.com',
      userData: {
        keyPhrase,
        similarityThreshold,
      },
    }])
  )
}).pipe(
  Effect.orDie,
  Effect.tapDefect((c) =>
    Effect.logFatal('FATAL ERROR: An unrecoverable error occurred', c)
  ),
  Effect.scoped,
)

NodeRuntime.runMain(program)
