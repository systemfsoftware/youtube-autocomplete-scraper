# Youtube AutoComplete Scraper

A TypeScript library for scraping YouTube's autocomplete suggestions with intelligent deduplication.

## Features

- Scrapes YouTube's autocomplete API to get search suggestions
- Uses pglite for efficient similarity filtering
- Removes near-duplicate suggestions using trigram similarity
- Configurable similarity threshold
- TypeScript support
- Ready to deploy on Apify platform

## Installation

```bash
git clone https://github.com/yourusername/youtube-autocomplete-scraper.git
cd youtube-autocomplete-scraper
pnpm install
```

## Usage

There are two ways to use this scraper:

### 1. Local Development

Run the scraper locally by setting the required environment variables and using `pnpm start`:

```bash
# Set your input
export INPUT='{"query": "how to make"}'

# Run the scraper
pnpm start
```

The scraper will output results to the console and save them in the `apify_storage` directory.

### 2. Deploy to Apify

This scraper is designed to run on the Apify platform. To deploy:

1. Push this code to your Apify actor
2. Set the input JSON in Apify console:

```json
{
  "query": "how to make",
  "similarityThreshold": 0.7,
  "maxResults": 100,
  "language": "en",
  "region": "US"
}
```

## How it Works

Under the hood, this scraper does a few key things:

1. **API Querying**: Makes requests to YouTube's internal autocomplete API endpoint to get raw suggestions

2. **Deduplication**: Uses pglite (a lightweight Postgres implementation) to filter out near-duplicate results:

   - Converts suggestions to trigrams (3-letter sequences)
   - Calculates similarity scores between suggestions using trigram matching
   - Filters out suggestions that are too similar based on a configurable threshold
   - For example, "how to cook pasta" and "how to cook noodles" might be considered unique, while "how to make pancake" and "how to make pancakes" would be filtered as duplicates

3. **Result Processing**: Cleans and normalizes the suggestions before returning them

## Input Schema

The scraper accepts the following input parameters:

```typescript
interface Input {
  query: string // The search query to get suggestions for
  similarityThreshold?: number // How similar suggestions need to be to be considered duplicates (0-1)
  maxResults?: number // Maximum number of suggestions to return
  language?: string // Language code for suggestions
  region?: string // Region code for suggestions
}
```

## Output

The scraper outputs an array of unique autocomplete suggestions. Results are saved to the default dataset in Apify storage and can be accessed via the Apify API or console.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
