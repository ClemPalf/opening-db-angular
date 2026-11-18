# Opening DB

Study chess opening lines and their variations in the browser. This Angular port starts with the PGN study workflow from the original Flutter app.

Clément Palfroy created the original Flutter app to improve his chess by building and studying his opening repertoires. The Angular implementation is being developed with Codex.

## Run locally

Use the Node version in `.nvmrc`.

```sh
npm ci
npm start
```

Visit http://localhost:4200. Choose `e4`, then `c5` to explore the bundled Sicilian variation. Select an earlier move in the breadcrumb to return to that position. Paste a single game into the PGN field to study your own line.

## How the code fits together

1. [`app.routes.ts`](src/app/app.routes.ts) lazy-loads the study feature.
2. [`repertoire.ts`](src/app/study/repertoire.ts) parses PGN and checks each move with chess.js. Each position stores its FEN, incoming move, comment and next positions. Branches begin at the position before the move they replace.
3. [`study-page.ts`](src/app/study/study-page.ts) owns the current path and form. Signals keep the view tied to that path. Rewinding discards later positions from the path.
4. [`chessboard.ts`](src/app/study/chessboard.ts) renders a position from FEN and handles display orientation.

Start with the variation tests when extending the import. Browser persistence, repertoire editing and review are on the [migration backlog](ROADMAP.md).

## Checks

```sh
npm run format:check
npm run test:ci
npm run build
```

The same checks run on pushes and pull requests. Tests cover PGN variations, custom starting positions, invalid imports and study navigation.
