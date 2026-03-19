document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const gridSizeInput = document.getElementById('grid-size');
    const gridContainer = document.getElementById('grid-container');
    const gridTitle = document.getElementById('grid-title');
    const statusIndicator = document.querySelector('.status-indicator');
    const actionPanel = document.getElementById('action-panel');
    const btnHW12 = document.getElementById('btn-hw1-2');
    const btnHW13 = document.getElementById('btn-hw1-3');

    let currentN = 5;
    let state = 0; // 0: start, 1: end, 2: obstacles, 3: done
    let obstaclesCount = 0;
    let maxObstacles = 0;

    let startPos = null;
    let endPos = null;
    let obstacles = [];

    const ARROW_MAP = {
        'UP': '↑',
        'DOWN': '↓',
        'LEFT': '←',
        'RIGHT': '→'
    };

    function renderGrid(n) {
        currentN = n;
        maxObstacles = n - 2;
        state = 0;
        obstaclesCount = 0;
        startPos = null;
        endPos = null;
        obstacles = [];
        actionPanel.style.display = 'none';

        gridTitle.textContent = `${n} x ${n} Square:`;
        updateStatusText();

        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${n}, 1fr)`;

        let cellNumber = 1;
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.r = r;
                cell.dataset.c = c;

                const numSpan = document.createElement('span');
                numSpan.classList.add('cell-number');
                numSpan.textContent = cellNumber++;

                const valSpan = document.createElement('span');
                valSpan.classList.add('cell-value');

                const polSpan = document.createElement('span');
                polSpan.classList.add('cell-policy');

                cell.appendChild(numSpan);
                cell.appendChild(valSpan);
                cell.appendChild(polSpan);

                cell.addEventListener('click', () => handleCellClick(cell, r, c));
                gridContainer.appendChild(cell);
            }
        }
    }

    function handleCellClick(cell, r, c) {
        if (state === 3) return;
        if (cell.classList.contains('start') || cell.classList.contains('end') || cell.classList.contains('obstacle')) {
            return; // Prevent clicking assigned cell
        }

        if (state === 0) {
            cell.classList.add('start');
            startPos = [r, c];
            state = 1;
        } else if (state === 1) {
            cell.classList.add('end');
            endPos = [r, c];
            state = 2;
        } else if (state === 2 && obstaclesCount < maxObstacles) {
            cell.classList.add('obstacle');
            obstacles.push([r, c]);
            obstaclesCount++;
            if (obstaclesCount >= maxObstacles) {
                state = 3; // Done
                actionPanel.style.display = 'flex';
            }
        }
        updateStatusText();
    }

    function updateStatusText() {
        if (state === 0) {
            statusIndicator.textContent = "Please click to select Start Cell (Green)";
            statusIndicator.style.color = "var(--green-color)";
        } else if (state === 1) {
            statusIndicator.textContent = "Please click to select End Cell (Red)";
            statusIndicator.style.color = "var(--red-color)";
        } else if (state === 2) {
            statusIndicator.textContent = `Please click to set Obstacles (${obstaclesCount}/${maxObstacles} Gray)`;
            statusIndicator.style.color = "var(--text-color)";
        } else {
            statusIndicator.textContent = "Setup Complete! Choose an algorithm below.";
            statusIndicator.style.color = "var(--accent-color)";
        }
    }

    function clearCellContents() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.querySelector('.cell-value').textContent = '';
            cell.querySelector('.cell-policy').textContent = '';
            cell.classList.remove('path');
        });
    }

    function applyResults(data, showPath = false) {
        clearCellContents();
        const { policy, values, path } = data;

        document.querySelectorAll('.grid-cell').forEach(cell => {
            const r = cell.dataset.r;
            const c = cell.dataset.c;
            const key = `${r},${c}`;

            if (values && key in values) {
                cell.querySelector('.cell-value').textContent = values[key];
            }
            if (policy && key in policy) {
                cell.querySelector('.cell-policy').textContent = ARROW_MAP[policy[key]];
            }

            // Highlight optimal path
            if (showPath && path) {
                const isPath = path.some(p => p[0] == r && p[1] == c);
                if (isPath && !cell.classList.contains('start') && !cell.classList.contains('end')) {
                    cell.classList.add('path');
                }
            }
        });
    }

    btnHW12.addEventListener('click', async () => {
        statusIndicator.textContent = "Evaluating Random Policy...";
        try {
            const response = await fetch('/api/evaluate_random', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ n: currentN, start: startPos, end: endPos, obstacles: obstacles })
            });
            const data = await response.json();
            applyResults(data, false);
            statusIndicator.textContent = "HW1-2: Random Policy & Evaluation Matrix Displayed";
        } catch (e) {
            console.error(e);
            statusIndicator.textContent = "Error executing HW1-2";
        }
    });

    btnHW13.addEventListener('click', async () => {
        statusIndicator.textContent = "Running Value Iteration...";
        try {
            const response = await fetch('/api/value_iteration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ n: currentN, start: startPos, end: endPos, obstacles: obstacles })
            });
            const data = await response.json();
            applyResults(data, true);
            statusIndicator.textContent = "HW1-3: Optimal Policy & Values Displayed";
        } catch (e) {
            console.error(e);
            statusIndicator.textContent = "Error executing HW1-3";
        }
    });

    generateBtn.addEventListener('click', () => {
        let n = parseInt(gridSizeInput.value, 10);
        if (isNaN(n) || n < 5 || n > 9) {
            alert('Please enter a valid number between 5 and 9.');
            return;
        }
        renderGrid(n);
    });

    renderGrid(currentN);
});
