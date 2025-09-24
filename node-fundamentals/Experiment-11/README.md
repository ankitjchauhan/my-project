# Experiment-12 — REST API for Playing Card Collection (Express.js)

## Setup

```bash
npm i
npm run dev   # hot reload with nodemon
# or
npm start     # plain node
```

## Endpoints

GET /cards → list all

GET /cards/:id → one card or 404

POST /cards → body { "suit": "Clubs", "value": "Jack" } → 201

DELETE /cards/:id → message + removed card

Use the included `requests.http` (VS Code REST Client) or curl/Postman.

## Expected demo sequence (to mirror screenshots)

GET /cards → 3 seeded cards (Hearts/Ace, Spades/King, Diamonds/Queen).

GET /cards/2 → Spades King.

POST /cards with Clubs/Jack → returns id 4.

DELETE /cards/1 → message: "Card with ID 1 removed" + removed object.

## After generating

- Run:

```bash
cd Experiment-12
npm i
npm run dev
```

Test with `requests.http` or Postman to see outputs identical to the screenshots.
