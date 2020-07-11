const GameAsset = {
    'Players': [
        {
            'name': 'Wizard',
            'asset': './asset/Wizard.glb'
        }
    ],
    'Terrain': [
        {
            'name': 'Spawn',
            'asset': './asset/Spawn.glb'
        },
        {
            'name': 'Grassy',
            'asset': './asset/Grassy.glb'
        }
    ],
    'Surface': [
        {
            'name': 'Pillar',
            'asset': './asset/Pillar.glb',
            'animate': 'PillarAction'
        },
        {
            'name': 'PineTree',
            'asset': './asset/PineTree.glb'
        }
    ]
}

module.exports = GameAsset;