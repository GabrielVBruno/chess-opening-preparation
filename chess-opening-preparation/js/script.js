class MoveBoxState {
    type = 'box';

    /**
     * @param {string} description
     * @param {string} fen
     * @param {string} perspective
     * @param {string} moveStart
     * @param {string} moveEnd
     * @param {(string|null)} branch
     * @param {(string|null)} moveClassification
     */
    constructor(description, fen, perspective, moveStart, moveEnd, branch, moveClassification) {
        this.description = description
        this.fen = fen
        this.perspective = perspective
        this.moveStart = moveStart
        this.moveEnd = moveEnd
        this.branch = branch
        this.moveClassification = moveClassification
    }

    /**
     * 
     * @param {Object} object 
     * @returns {MoveBoxState}
     */
    static from(object) {
        return Object.assign(new MoveBoxState(), object);
    }
}

/**
 * @param {Element} box
 * @returns {MoveBoxState}
 */
function getMoveBoxState(box) {
    let board = box.querySelector('.move-board');

    let moveClassification = box.querySelector('.move-classification');

    let state = new MoveBoxState(
        box.querySelector('p').textContent,
        board.getAttribute('data-fen'),
        board.getAttribute('data-perspective'),
        board.getAttribute('data-move-start'),
        board.getAttribute('data-move-end'),
        box.getAttribute('data-branch'),
        moveClassification === null ? null : moveClassification.classList.values().filter((cls) => cls !== 'move-classification').next().value
    );

    return state;
}


class MoveSetState {
    type = 'set';

    /**
     * @param {string} title
     * @param {MoveBoxState[]} moveBoxes
     */
    constructor(title, moveBoxes) {
        this.title = title
        this.moveBoxes = moveBoxes
    }

    /**
     * 
     * @param {Object} object 
     * @returns {MoveSetState}
     */
    static from(object) {
        return Object.assign(new MoveSetState(), object);
    }
}

/**
 * @param {Element} set
 * @returns {MoveSetState}
 */
function getMoveSetState(set) {
    let state = new MoveSetState(
        set.querySelector('.move-set-title > h2').textContent,
        Array.from(set.querySelectorAll('.move-box')).map(getMoveBoxState)
    );

    return state;
}


class PageState {
    /**
     * @param {(MoveBoxState|MoveSetState)[]} content
     */
    constructor(content) {
        this.content = content
    }

    /**
     * @param {Object} object 
     * @returns {PageState}
     */
    static from(object) {
        return Object.assign(new PageState(), object);
    }
}

/**
 * @returns {PageState}
 */
function getState() {
    let state = new PageState([]);
    let content = document.querySelectorAll('main > *');

    for (const element of content) {
        if (element.classList.contains('move-box')) {
            let boxState = getMoveBoxState(element);

            state.content.push(boxState);
        } else if (element.classList.contains('move-set-container')) {
            let setState = getMoveSetState(element);

            state.content.push(setState);
        }
    }

    return state;
}

/**
 * @param {PageState} state 
 * @returns {void}
 */
function saveState(state) {
    localStorage.setItem('state', JSON.stringify(state));
}


/**
 * @returns {void}
 */
function clearState() {
    localStorage.removeItem('state')
}


/**
 * @returns {PageState}
 */
function readState() {
    return PageState.from(JSON.parse(localStorage.getItem('state')));
}


/**
 * @returns {void}
 */
function clearContent() {
    for (const element of document.querySelectorAll('.move-set-container')) {
        element.remove()
    }

    for (const element of document.querySelectorAll('.move-box')) {
        element.remove()
    }
}


/**
 * @param {PageState} state 
 * @returns {void}
 */
function loadState(state) {
    let main = document.querySelector('main');

    for (const element of state.content) {
        if (element.type === 'box') {
            let box = createMoveBox(element)

            initMoveBox(box);

            main.appendChild(box);
        } else if (element.type === 'set') {
            let set = createMoveSetContainer(element)

            initMoveSetContainer(set);

            main.appendChild(set);
        }
    }
}


/**
 * @param {MoveBoxState} state 
 * @returns {Element}
 */
function createMoveBox(state) {
    let box = document.createElement('button');

    box.classList.add('move-box');

    if (state.branch !== null) {
        box.setAttribute('data-branch', state.branch);
    }


    if (state.moveClassification !== null) {
        let moveClassification = document.createElement('div');

        moveClassification.classList.add('move-classification');
        moveClassification.classList.add(state.moveClassification);

        box.appendChild(moveClassification);
    }


    let description = document.createElement('p');

    description.textContent = state.description;
    box.appendChild(description);


    let board = document.createElement('div');

    board.classList.add('move-board');

    board.setAttribute('data-fen', state.fen)
    board.setAttribute('data-perspective', state.perspective);
    board.setAttribute('data-move-start', state.moveStart);
    board.setAttribute('data-move-end', state.moveEnd);

    box.appendChild(board);


    return box;
}

/**
 * @param {('light-square'|'dark-square')} squareColor 
 * @param {boolean} highlight 
 * @param {('wp'|'wn'|'wb'|'wr'|'wq'|'wk'|'bp'|'bn'|'bb'|'br'|'bq'|'bk'|null)} piece 
 * @returns {Element}
 */
function createSquare(squareColor, highlight, piece) {
    let square = document.createElement('div');

    square.classList.add(squareColor);

    if (highlight) {
        square.classList.add('highlight');
    }

    if (piece !== null) {
        square.classList.add(piece);
    }

    return square;
}

/**
 * @param {Element} board 
 * @returns {void}
 */
function initMoveBoard(board) {
    let squareColor = 'light-square';

    let perspective = board.getAttribute('data-perspective');

    let fen = board.getAttribute('data-fen');
    let ranks = fen.slice(0, fen.includes(' ') ? fen.indexOf(' ') : fen.length).split('/');

    let moveStart = board.getAttribute('data-move-start');
    let moveStartFile = moveStart.at(0).charCodeAt(0) - 97;
    let moveStartRank = parseInt(moveStart.at(1)) - 1;

    let moveEnd = board.getAttribute('data-move-end');
    let moveEndFile = moveEnd.at(0).charCodeAt(0) - 97;
    let moveEndRank = parseInt(moveEnd.at(1)) - 1;

    for (let [rank, rankFEN] of (perspective === "w" ? ranks : ranks.slice().reverse()).entries()) {
        if (perspective === "w") {
            rank = 7 - rank;
        }

        let file = perspective === "w" ? 0 : 7

        for (const char of (perspective === "w" ? rankFEN : rankFEN.split('').reverse())) {
            if (char === char.toLowerCase()) {
                if (char === char.toUpperCase()) {
                    // Non-letter (number/empty square(s))
                    let emptySquares = parseInt(char);

                    for (let i = 0; i < emptySquares; i++) {
                        board.appendChild(createSquare(squareColor, (moveStartFile === file && moveStartRank === rank) || (moveEndFile === file && moveEndRank === rank), null));

                        squareColor = squareColor === 'light-square' ? 'dark-square' : 'light-square';

                        if (perspective === "w") {
                            file++;
                        } else {
                            file--;
                        }
                    }
                } else {
                    // Lowercase letter (black piece)
                    board.appendChild(createSquare(squareColor, (moveStartFile === file && moveStartRank === rank) || (moveEndFile === file && moveEndRank === rank), 'b' + char));

                    squareColor = squareColor === 'light-square' ? 'dark-square' : 'light-square';

                    if (perspective === "w") {
                        file++;
                    } else {
                        file--;
                    }
                }
            } else if (char === char.toUpperCase()) {
                // Uppercase letter (white piece)
                board.appendChild(createSquare(squareColor, (moveStartFile === file && moveStartRank === rank) || (moveEndFile === file && moveEndRank === rank), 'w' + char.toLowerCase()));

                squareColor = squareColor === 'light-square' ? 'dark-square' : 'light-square';

                if (perspective === "w") {
                    file++;
                } else {
                    file--;
                }
            }
        }
        squareColor = squareColor === 'light-square' ? 'dark-square' : 'light-square';
    }
}

// document.querySelectorAll('.move-board').forEach(initMoveBoard);

/**
 * @param {Element} box 
 * @returns {void}
 */
function switchShowBoard(box) {
    box.setAttribute('data-show-board', box.getAttribute('data-show-board') === 'false' ? 'true' : 'false');
}

/**
 * @param {Element} box 
 * @returns {void}
 */
function initMoveBox(box) {
    box.setAttribute('data-show-board', 'false');

    box.addEventListener('click', () => {
        switchShowBoard(box);
    })

    initMoveBoard(box.querySelector('.move-board'));
}

document.querySelectorAll('main > .move-box').forEach(initMoveBox);


/**
 * @param {MoveSetState} state
 * @returns {Element}
 */
function createMoveSetContainer(state) {
    let container = document.createElement('div');

    container.classList.add('move-set-container');


    let title = document.createElement('div');

    title.classList.add('move-set-title');

    let titleText = document.createElement('h2');
    titleText.textContent = state.title;
    title.appendChild(titleText);

    let spacing = document.createTextNode(' ')
    title.appendChild(spacing)

    let showBoards = document.createElement('button');
    showBoards.classList.add('show-boards');

    let showBoardsIcon = document.createElement('div');
    showBoardsIcon.classList.add('show-boards-icon');
    showBoards.appendChild(showBoardsIcon);

    title.appendChild(showBoards);

    container.appendChild(title);


    let set = document.createElement('div');

    set.classList.add('move-set');

    for (const moveBox of state.moveBoxes) {
        let box = createMoveBox(moveBox);

        set.appendChild(box);
    }

    container.appendChild(set);

    return container;
}

/**
 * @param {Element} button
 * @returns {void}
 */
function initShowBoardsButton(button) {
    button.setAttribute('data-hide-boards', 'false');

    button.addEventListener('click', () => {
        let moveBoxes = button.parentElement.parentElement.querySelectorAll('.move-box')

        moveBoxes.forEach(box => {
            box.setAttribute('data-show-board', button.getAttribute('data-hide-boards') === 'true' ? 'false' : 'true');
        });

        toggleShowBoardsMode();
    })
}

/**
 * @param {Element} box
 * @returns {void}
 */
function updateMoveBoxHeight(box) {
    if (box.getAttribute('data-show-board') === 'true') {
        if (box.style.height !== '') {
            box.style.height = ''
        }
    } else {
        let height = `calc(${box.querySelector('p').clientHeight}px + 4 * var(--border-size))`

        if (box.style.height !== height) {
            box.style.height = height
        }
    }
}

/**
 * @param {string} branch_1
 * @param {string} branch_2
 * @returns {number}
 */
function compareBranches(branch_1, branch_2) {
    return branch_1.padEnd(branch_2.length, '0').localeCompare(branch_2.padEnd(branch_1.length, '0'));
}

/**
 * @returns {void}
 */
function toggleShowBoardsMode() {
    document.querySelectorAll('.move-set-title').forEach(title => {
        let showBoardsButton = title.querySelector('.show-boards');
        let hideBoards = false;

        let set = title.nextElementSibling

        if (set.querySelector('.move-box[data-show-board="false"]')) {
            hideBoards = true;
        }

        showBoardsButton.setAttribute('data-hide-boards', hideBoards ? 'false' : 'true');
    });
}

/**
 * @param {Element} set 
 * @returns {void}
 */
function initMoveSet(set) {
    let boxes = Array.from(set.querySelectorAll('.move-box'));

    boxes.forEach(initMoveBox);

    boxes.sort((a, b) => compareBranches(a.getAttribute('data-branch'), b.getAttribute('data-branch')))

    let lines = 1;
    let currentBranch = boxes[0].getAttribute('data-branch');

    boxes.forEach(box => {
        const observer = new MutationObserver(() => {
            updateMoveBoxHeight(box);
            toggleShowBoardsMode();
        });

        observer.observe(box, {
            childList: false,
            attributes: true,
            subtree: false,
        });

        updateMoveBoxHeight(box);


        let branch = box.getAttribute('data-branch');

        if (compareBranches(branch, currentBranch) === 1) {
            lines++;
            currentBranch = branch;
        }

        box.style.gridRowStart = `${lines}`

        
        function showBranchBoards() {
            let branchBoxes = boxes.filter((other_box) => other_box.getAttribute('data-branch').startsWith(box.getAttribute('data-branch')));

            if (box.getAttribute('data-show-board') === 'true') {
                branchBoxes.forEach((other_box) => other_box.setAttribute('data-show-board', 'false'))
            } else {
                branchBoxes.forEach((other_box) => other_box.setAttribute('data-show-board', 'true'))
            }
        }

        box.addEventListener('dblclick', showBranchBoards)

        let holdTimeoutID;
        let holdTimeoutCalled = false;

        box.addEventListener('mousedown', () => {
            holdTimeoutID = setTimeout(() => {
                showBranchBoards();

                holdTimeoutCalled = true;
            }, 1500);

            holdTimeoutCalled = false;
        });

        box.addEventListener('mouseup', () => {
            clearTimeout(holdTimeoutID);

            if (holdTimeoutCalled) {
                let syntheticClick = new Event('click');

                box.dispatchEvent(syntheticClick);
            }
        });

        box.addEventListener('mouseleave', () => {
            clearTimeout(holdTimeoutID);
        });
    })
}

/**
 * @param {Element} container 
 * @returns {void}
 */
function initMoveSetContainer(container) {
    initShowBoardsButton(container.querySelector('.show-boards'));

    initMoveSet(container.querySelector('.move-set'));
}

document.querySelectorAll('.move-set-container').forEach(initMoveSetContainer);