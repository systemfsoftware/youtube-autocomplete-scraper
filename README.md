## PlaywrightCrawler template

This template is a production ready boilerplate for developing an [Actor](https://apify.com/actors) with `PlaywrightCrawler`. Use this to bootstrap your projects using the most up-to-date code.

> We decided to split Apify SDK into two libraries, Crawlee and Apify SDK v3. Crawlee will retain all the crawling and scraping-related tools and will always strive to be the best [web scraping](https://apify.com/web-scraping) library for its community. At the same time, Apify SDK will continue to exist, but keep only the Apify-specific features related to building actors on the Apify platform. Read the upgrading guide to learn about the changes.
> 

## Resources

If you're looking for examples or want to learn more visit:

- [Crawlee + Apify Platform guide](https://crawlee.dev/docs/guides/apify-platform)
- [Documentation](https://crawlee.dev/api/playwright-crawler/class/PlaywrightCrawler) and [examples](https://crawlee.dev/docs/examples/playwright-crawler)
- [Node.js tutorials](https://docs.apify.com/academy/node-js) in Academy
- [Scraping single-page applications with Playwright](https://blog.apify.com/scraping-single-page-applications-with-playwright/)
- [How to scale Puppeteer and Playwright](https://blog.apify.com/how-to-scale-puppeteer-and-playwright/)
- [Integration with Zapier](https://apify.com/integrations), Make, GitHub, Google Drive and other apps
- [Video guide on getting scraped data using Apify API](https://www.youtube.com/watch?v=ViYYDHSBAKM)
- A short guide on how to build web scrapers using code templates:

[web scraper template](https://www.youtube.com/watch?v=u-i-Korzf8w)


## Getting started

For complete information [see this article](https://docs.apify.com/platform/actors/development#build-actor-locally). To run the actor use the following command:

```bash
apify run
```

## Deploy to Apify

### Connect Git repository to Apify

If you've created a Git repository for the project, you can easily connect to Apify:

1. Go to [Actor creation page](https://console.apify.com/actors/new)
2. Click on **Link Git Repository** button

### Push project on your local machine to Apify

You can also deploy the project on your local machine to Apify without the need for the Git repository.

1. Log in to Apify. You will need to provide your [Apify API Token](https://console.apify.com/account/integrations) to complete this action.

    ```bash
    apify login
    ```

2. Deploy your Actor. This command will deploy and build the Actor on the Apify Platform. You can find your newly created Actor under [Actors -> My Actors](https://console.apify.com/actors?tab=my).

    ```bash
    apify push
    ```

## Documentation reference

To learn more about Apify and Actors, take a look at the following resources:

- [Apify SDK for JavaScript documentation](https://docs.apify.com/sdk/js)
- [Apify SDK for Python documentation](https://docs.apify.com/sdk/python)
- [Apify Platform documentation](https://docs.apify.com/platform)
- [Join our developer community on Discord](https://discord.com/invite/jyEM2PRvMU)
