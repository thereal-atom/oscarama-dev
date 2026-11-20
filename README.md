# oscarama.dev

[oscar's personal site](https://oscarama.dev)

## photo + video portfolio

Portfolio events are managed in Sanity and videos are delivered through Mux.

1. Copy the Sanity values from `.env.example` into `.env` and add the project ID.
2. Run `bun run studio` to open the local Sanity Studio.
3. Add a portfolio event, order the strongest gallery images first, and optionally upload a
   highlight film through the Mux field.

The public site reads published entries at request time. If the dataset is private, configure
`SANITY_API_READ_TOKEN` in the site runtime; Mux credentials stay in Sanity's protected secrets.
