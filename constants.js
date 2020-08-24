
module.exports = Object.freeze({
    "Spells": {
        "Confusion": {
            "Description":  "A hidden spell placed on the ground, randomizes a player's directional movement once stepped on."
        },
        "Teleport": {
            "Description": "A hidden spell placed on the ground, swap places with a random player on the map with the one that triggered the spell."
        },
        "Lightning": {
            "Description": "A visible spell placed on the ground, that spawns occasional lighnting strikes."
        },

        "Vision": {
            "Description": "A hidden spell that reveals spells that were cast in an area to the player that cast this spell or whoever that steps on this spell."
        },
        "Freeze": {
            "Description": "A hidden spell placed on the ground, stops player movements for a few seconds."
        }
    },
    "ForestLevel": {
        "size": [10, 10],
        "terrain": [
            [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, -1, -1, -1, -1, 1, -1, -1],
            [1, 1, 1, 1, 1, 1, -1, -1, -1, 1],
            [-1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [-1, -1, -1, -1, -1, 1, 1, 1, 1, -1],
            [-1, -1, -1, 1, 1, 1, 1, 1, -1, 1],
            [1, 1, 1, 1, -1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, -1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        "surface": [
            [1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [1, -1, -1, -1, 1, -1, 1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, 1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [1, -1, -1, -1, -1, -1, -1, -1, 1, -1],
            [-1, 0, -1, -1, -1, -1, -1, 1, 1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
        ]
    }
});