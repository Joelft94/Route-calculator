// script.js
let grid = [];
const rows = 15;
const cols = 15;
let startNode = null;
let endNode = null;
let settingStart = false;
let settingEnd = false;
let addingObstacle = false;

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    // Initialize grid
    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            gridContainer.appendChild(cell);
            grid[i][j] = {
                row: i,
                col: j,
                isStart: false,
                isEnd: false,
                isObstacle: false,
                g: 0,
                h: 0,
                f: 0,
                previous: null
            };
        }
    }

    document.getElementById('set-start').addEventListener('click', () => {
        settingStart = true;
        settingEnd = false;
        addingObstacle = false;
    });

    document.getElementById('set-end').addEventListener('click', () => {
        settingStart = false;
        settingEnd = true;
        addingObstacle = false;
    });

    document.getElementById('add-obstacle').addEventListener('click', () => {
        settingStart = false;
        settingEnd = false;
        addingObstacle = true;
    });

    document.getElementById('start-pathfinding').addEventListener('click', startPathfinding);
});

function handleCellClick(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    const cell = grid[row][col];

    if (settingStart) {
        if (startNode) {
            startNode.isStart = false;
            document.querySelector(`.grid-item[data-row="${startNode.row}"][data-col="${startNode.col}"]`).classList.remove('start');
        }
        cell.isStart = true;
        event.target.classList.add('start');
        startNode = cell;
        settingStart = false;
    } else if (settingEnd) {
        if (endNode) {
            endNode.isEnd = false;
            document.querySelector(`.grid-item[data-row="${endNode.row}"][data-col="${endNode.col}"]`).classList.remove('end');
        }
        cell.isEnd = true;
        event.target.classList.add('end');
        endNode = cell;
        settingEnd = false;
    } else if (addingObstacle) {
        cell.isObstacle = !cell.isObstacle;
        event.target.classList.toggle('obstacle');
    }
}

async function startPathfinding() {
    if (!startNode || !endNode) {
        alert('Please set both a start and an end point.');
        return;
    }

    const openSet = [startNode];
    const closedSet = [];
    const path = [];

    while (openSet.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }

        const current = openSet[lowestIndex];

        if (current === endNode) {
            let temp = current;
            path.push(temp);
            while (temp.previous) {
                path.push(temp.previous);
                temp = temp.previous;
            }

            // Remove current and searched classes before marking the path
            document.querySelectorAll('.grid-item').forEach(item => {
                item.classList.remove('current');
                item.classList.remove('searched');
            });

            for (let i = 0; i < path.length; i++) {
                const cell = path[i];
                document.querySelector(`.grid-item[data-row="${cell.row}"][data-col="${cell.col}"]`).classList.add('path');
                await sleep(50); // Slow down for visualization
            }

            return;
        }

        openSet.splice(lowestIndex, 1);
        closedSet.push(current);

        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            if (closedSet.includes(neighbor) || neighbor.isObstacle) {
                continue;
            }

            const tentativeG = current.g + 1;

            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tentativeG >= neighbor.g) {
                continue;
            }

            neighbor.g = tentativeG;
            neighbor.h = heuristic(neighbor, endNode);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;

            document.querySelector(`.grid-item[data-row="${neighbor.row}"][data-col="${neighbor.col}"]`).classList.add('searched');
        }

        document.querySelector(`.grid-item[data-row="${current.row}"][data-col="${current.col}"]`).classList.add('current');
        await sleep(50); // Slow down for visualization
    }

    alert('No path found');
}

function getNeighbors(node) {
    const neighbors = [];
    const { row, col } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < rows - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < cols - 1) neighbors.push(grid[row][col + 1]);

    return neighbors;
}

function heuristic(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
