/**
 * @return {void}
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
 * @param {Element} box 
 * @return {void}
 */
function switchShowBoard(box) {
    box.setAttribute('data-show-board', box.getAttribute('data-show-board') === 'false' ? 'true' : 'false');
}

document.querySelectorAll('.move-box').forEach(box => {
    box.setAttribute('data-show-board', 'false');

    box.addEventListener('click', () => {
        switchShowBoard(box);
    })
});

/**
 * @param {Element} box
 * @return {void}
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
 * @return {number}
 */
function compareBranches(branch_1, branch_2) {
    return branch_1.padEnd(branch_2.length, '0').localeCompare(branch_2.padEnd(branch_1.length, '0'));
}

// let 

document.querySelectorAll('.move-set').forEach(set => {
    let boxes = Array.from(set.querySelectorAll('.move-box'));

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

                // let syntheticClick = new Event('click');

                // box.dispatchEvent(syntheticClick);
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
})


document.querySelectorAll('.show-boards').forEach(button => {
    button.setAttribute('data-hide-boards', 'false');

    button.addEventListener('click', () => {
        let moveBoxes = button.parentElement.parentElement.querySelectorAll('.move-box')

        moveBoxes.forEach(box => {
            box.setAttribute('data-show-board', button.getAttribute('data-hide-boards') === 'true' ? 'false' : 'true');
        });

        toggleShowBoardsMode();
    })
});

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

document.querySelectorAll('.move-board').forEach(board => {
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
});