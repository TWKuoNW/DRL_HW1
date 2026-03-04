document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const gridSizeInput = document.getElementById('grid-size');
    const gridContainer = document.getElementById('grid-container');
    const gridTitle = document.getElementById('grid-title');
    const statusIndicator = document.querySelector('.status-indicator');

    let currentN = 5;
    let state = 0; // 0: start, 1: end, 2: obstacles
    let obstaclesCount = 0;
    let maxObstacles = 0;

    function renderGrid(n) {
        currentN = n;
        maxObstacles = n - 2;
        state = 0;
        obstaclesCount = 0;

        gridTitle.textContent = `${n} x ${n} Square:`;
        updateStatusText();

        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${n}, 1fr)`;

        let cellNumber = 1;
        for (let i = 0; i < n * n; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.textContent = cellNumber++;
            cell.addEventListener('click', () => handleCellClick(cell));
            gridContainer.appendChild(cell);
        }
    }

    function handleCellClick(cell) {
        // Prevent re-clicking a finalized cell
        if (cell.classList.contains('start') || cell.classList.contains('end') || cell.classList.contains('obstacle')) {
            return;
        }

        if (state === 0) {
            cell.classList.add('start');
            state = 1;
        } else if (state === 1) {
            cell.classList.add('end');
            state = 2;
        } else if (state === 2 && obstaclesCount < maxObstacles) {
            cell.classList.add('obstacle');
            obstaclesCount++;
            if (obstaclesCount >= maxObstacles) {
                state = 3; // Done
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
            statusIndicator.textContent = "Setup Complete!";
            statusIndicator.style.color = "var(--accent-color)";
        }
    }

    generateBtn.addEventListener('click', () => {
        let n = parseInt(gridSizeInput.value, 10);
        if (isNaN(n) || n < 5 || n > 9) {
            alert('Please enter a valid number between 5 and 9.');
            return;
        }
        renderGrid(n);
    });

    // Initial render
    renderGrid(currentN);
});
