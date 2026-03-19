/**
 * Grid Map MDP Implementation for HW1-2 and HW1-3
 */
const ACTIONS = [
    { dr: -1, dc: 0, name: 'UP', sym: '↑' },
    { dr: 1, dc: 0, name: 'DOWN', sym: '↓' },
    { dr: 0, dc: -1, name: 'LEFT', sym: '←' },
    { dr: 0, dc: 1, name: 'RIGHT', sym: '→' }
];

const GAMMA = 0.9;
const REWARD_STEP = -1.0;
const REWARD_GOAL = 10.0;

class GridMDP {
    constructor(n, startPos, endPos, obstacles) {
        this.n = n;
        this.startPos = startPos;
        this.endPos = endPos;
        this.obstacles = obstacles;
    }

    isObstacle(r, c) {
        return this.obstacles.some(obs => obs[0] === r && obs[1] === c);
    }

    isEnd(r, c) {
        return r === this.endPos[0] && c === this.endPos[1];
    }

    getNextState(r, c, action) {
        if (this.isEnd(r, c)) return [r, c];
        const nr = r + action.dr;
        const nc = c + action.dc;
        if (nr >= 0 && nr < this.n && nc >= 0 && nc < this.n) {
            if (!this.isObstacle(nr, nc)) {
                return [nr, nc];
            }
        }
        return [r, c]; // Stay in place if invalid move
    }

    getReward(s, nextS) {
        if (this.isEnd(s[0], s[1])) return 0; // Terminated
        if (this.isEnd(nextS[0], nextS[1])) return REWARD_GOAL;
        return REWARD_STEP;
    }

    evaluateRandomPolicy() {
        // Generate Random Policy
        let policy = {};
        for (let r = 0; r < this.n; r++) {
            for (let c = 0; c < this.n; c++) {
                if (this.isEnd(r, c) || this.isObstacle(r, c)) continue;
                policy[`${r},${c}`] = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            }
        }

        // Policy Evaluation
        let V = {};
        for (let r = 0; r < this.n; r++) {
            for (let c = 0; c < this.n; c++) V[`${r},${c}`] = 0;
        }

        let maxIter = 1000;
        for (let iter = 0; iter < maxIter; iter++) {
            let delta = 0;
            let newV = { ...V };
            for (let r = 0; r < this.n; r++) {
                for (let c = 0; c < this.n; c++) {
                    if (this.isEnd(r, c) || this.isObstacle(r, c)) continue;
                    let a = policy[`${r},${c}`];
                    let nextS = this.getNextState(r, c, a);
                    let reward = this.getReward([r, c], nextS);
                    let v = reward + GAMMA * V[`${nextS[0]},${nextS[1]}`];

                    delta = Math.max(delta, Math.abs(v - V[`${r},${c}`]));
                    newV[`${r},${c}`] = v;
                }
            }
            V = newV;
            if (delta < 1e-4) break;
        }

        // Format for output
        let resPolicy = {};
        let resV = {};
        for (let r = 0; r < this.n; r++) {
            for (let c = 0; c < this.n; c++) {
                if (this.isEnd(r, c) || this.isObstacle(r, c)) continue;
                resPolicy[`${r},${c}`] = policy[`${r},${c}`].sym;
                resV[`${r},${c}`] = V[`${r},${c}`].toFixed(2);
            }
        }

        return { V: resV, policy: resPolicy };
    }

    runValueIteration() {
        let V = {};
        for (let r = 0; r < this.n; r++) {
            for (let c = 0; c < this.n; c++) V[`${r},${c}`] = 0;
        }

        // Value Iteration Algorithm
        let maxIter = 1000;
        for (let iter = 0; iter < maxIter; iter++) {
            let delta = 0;
            let newV = { ...V };
            for (let r = 0; r < this.n; r++) {
                for (let c = 0; c < this.n; c++) {
                    if (this.isEnd(r, c) || this.isObstacle(r, c)) continue;

                    let maxV = -Infinity;
                    for (let a of ACTIONS) {
                        let nextS = this.getNextState(r, c, a);
                        let reward = this.getReward([r, c], nextS);
                        let v = reward + GAMMA * V[`${nextS[0]},${nextS[1]}`];
                        maxV = Math.max(maxV, v);
                    }
                    delta = Math.max(delta, Math.abs(maxV - V[`${r},${c}`]));
                    newV[`${r},${c}`] = maxV;
                }
            }
            V = newV;
            if (delta < 1e-4) break;
        }

        // Extract Optimal Policy
        let policy = {};
        let resPolicy = {};
        let resV = {};

        for (let r = 0; r < this.n; r++) {
            for (let c = 0; c < this.n; c++) {
                if (this.isEnd(r, c) || this.isObstacle(r, c)) continue;
                let maxV = -Infinity;
                let bestA = null;
                for (let a of ACTIONS) {
                    let nextS = this.getNextState(r, c, a);
                    let reward = this.getReward([r, c], nextS);
                    let v = reward + GAMMA * V[`${nextS[0]},${nextS[1]}`];
                    if (v > maxV) {
                        maxV = v;
                        bestA = a;
                    }
                }
                policy[`${r},${c}`] = bestA;
                resPolicy[`${r},${c}`] = bestA.sym;
                resV[`${r},${c}`] = V[`${r},${c}`].toFixed(2);
            }
        }

        // Trace Optimal Path
        let path = [];
        let curr = this.startPos;
        let visited = new Set();

        while (!this.isEnd(curr[0], curr[1]) && !visited.has(`${curr[0]},${curr[1]}`)) {
            visited.add(`${curr[0]},${curr[1]}`);
            path.push(curr);
            let action = policy[`${curr[0]},${curr[1]}`];
            if (action) {
                curr = this.getNextState(curr[0], curr[1], action);
            } else {
                break;
            }
        }
        path.push(this.endPos);

        return { V: resV, policy: resPolicy, path };
    }
}

// UI Interaction Logic
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

    function applyResults(resultData, showPath = false) {
        clearCellContents();
        const { policy, V, path } = resultData;

        document.querySelectorAll('.grid-cell').forEach(cell => {
            const r = parseInt(cell.dataset.r, 10);
            const c = parseInt(cell.dataset.c, 10);
            const key = `${r},${c}`;

            if (V && key in V) {
                cell.querySelector('.cell-value').textContent = V[key];
            }
            if (policy && key in policy) {
                cell.querySelector('.cell-policy').textContent = policy[key];
            }

            // Highlight optimal path
            if (showPath && path) {
                const isPath = path.some(p => p[0] === r && p[1] === c);
                if (isPath && !cell.classList.contains('start') && !cell.classList.contains('end')) {
                    cell.classList.add('path');
                }
            }
        });
    }

    btnHW12.addEventListener('click', () => {
        statusIndicator.textContent = "Evaluating Random Policy...";
        const mdp = new GridMDP(currentN, startPos, endPos, obstacles);
        const result = mdp.evaluateRandomPolicy();
        applyResults(result, false);
        statusIndicator.textContent = "HW1-2: Random Policy & Evaluation Matrix Displayed";
    });

    btnHW13.addEventListener('click', () => {
        statusIndicator.textContent = "Running Value Iteration...";
        const mdp = new GridMDP(currentN, startPos, endPos, obstacles);
        const result = mdp.runValueIteration();
        applyResults(result, true);
        statusIndicator.textContent = "HW1-3: Optimal Policy & Values Displayed";
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
