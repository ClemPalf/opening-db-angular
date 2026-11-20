# Opening DB

Study chess opening lines and their variations in the browser. Chessbook is an Angular port of the original Flutter app.

Clément Palfroy created the original Flutter app to improve his chess by building and studying his opening repertoires. The Angular implementation is being developed with Codex.

## Run locally

Use the Node version in `.nvmrc`.

```sh
npm ci
npm start
```

Open [Chessbook locally](http://localhost:4200). Use **Create Repertoire** to name an empty white or black repertoire, or **Import PGN** to name a repertoire and paste one game with its variations. Open a card to study its lines. Its options button lets you rename or delete the repertoire. The empty list also links to a bundled demo. Choose `e4` and then `c5` to explore the Sicilian line.

Repertoires are saved on the current browser origin and profile in versioned local storage. Served deployments need HTTPS and an index.html fallback for study URLs. Clearing site data removes the saved library. The import accepts one game up to 75,000 characters, including comments, variations and a custom starting position. The browser uses native dialogs for creation, import and repertoire options.

## How the code fits together

1. [app.routes.ts](src/app/app.routes.ts) lazy-loads the library and study pages. A saved repertoire opens at its own study URL.
2. [repertoire-library.ts](src/app/repertoires/repertoire-library.ts) validates the PGN before writing to browser storage and records the selected side and move count.
3. [repertoire.ts](src/app/study/repertoire.ts) checks PGN moves with chess.js. Each position stores its FEN, incoming move, comment and next positions. Branches begin at the position before the move they replace.
4. [study-page.ts](src/app/study/study-page.ts) uses signals to track the current line and board orientation. The breadcrumb returns to an earlier position, and [chessboard.ts](src/app/study/chessboard.ts) renders the resulting FEN.

On desktop, drag the study divider or focus it and use the arrow keys to resize the board panel. Home and End set its minimum and maximum widths. At 700px and below, the study stacks the move panel beneath the board. With focus in the board controls, use Left and Right to step through the line, Home and End to jump, and F to flip. Board artwork uses [Colin M. L. Burnett’s Cburnett pieces](public/pieces/ATTRIBUTION.txt), the same set used by the Flutter board.

The library follows the Flutter source for its list hierarchy, surface gradient, cards, side and move badges, and create and import controls. Settings and opening-mistake actions will appear when those workflows are available. The [migration backlog](ROADMAP.md) tracks editing, review, and the remaining study UI work.

## Checks

```sh
npm run format:check
npm run test:ci
npm run build
```

The same checks run on pushes and pull requests. The current browser comparison used the Flutter source and the available move-panel reference captures. The full Flutter screens still need a live comparison at matching viewport sizes. Chrome checks covered the empty and populated library, import, and a study variation in light desktop and dark narrow layouts. Axe reported no violations in those sampled states. Tests cover PGN variations, custom starting positions, invalid imports, library persistence and study navigation.
