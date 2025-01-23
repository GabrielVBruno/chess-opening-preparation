# Chess Opening Preparation

This repository is for a webpage about taking notes on chess openings.

The goal is to make a webpage where the user can write down about certain openings they want to study/memorize about in a tree-like structure with comments on each move.

To do:
- Higher priority:
  - [x] Add saving and loading via local storage
  - [ ] Add user input
  - [ ] Better visuals/customizability
    - [ ] Animations
    - [ ] Light mode
    - [ ] Board/Pieces Themes
- Less priority:
  - [ ] Fix show boards button

Latest changes (v0.1):
- Added saving and loading of the page using states and `window.localStorage`
  - State classes: `MoveBoxState`, `MoveSetState`, `PageState`
  - State getting functions: `getMoveBoxState`, `getMoveSetState`, `getState`
  - State manipulation functions: `saveState`, `clearState`
  - State loading functions: `loadState`, `createMoveBox`, `createMoveSetContainer`
  - Other functions: `readState`, `clearContent`
- Refactored parts of the code as functions so they can be used when loading states
  - Initialization functions: `initMoveBoard`, `initMoveBox`, `initShowBoardsButton`, `initMoveSet`, `initMoveSetContainer`
- Changed show boards button to not use a board character and instead have a background of a board (still has problems on Firefox and has inexact measures)
  - Added to do item about fixing the button (probably changing to an image)
- Fixed move classification path to images
- Added wrapping to the description of move boxes for later input capabilities
  - Changed HTML accordingly
- Added margin to move boxes that aren't children of move sets
- Added type documentation to `createSquare` function