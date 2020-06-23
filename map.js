
module.exports = Object.freeze({
    "Forest": {
        "size": [10, 10],
        "Terrain": [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, -1, -1, -1, -1, 0, -1, -1],
            [0, 0, 0, 0, 0, 0, -1, -1, -1, 0],
            [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, -1, 0, 0, 0, 0, -1],
            [-1, -1, -1, 0, 0, 0, 0, 0, -1, 0],
            [0, 0, 0, 0, -1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, -1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ],
        "Surface": [
            [0, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [0, -1, -1, -1, 0, -1, 0, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, 0, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [0, -1, -1, -1, -1, -1, -1, -1, 0, -1],
            [-1, -1, -1, -1, -1, -1, -1, 0, 0, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
        ]
    }
});