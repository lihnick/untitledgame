const GameAsset = {
    'Players': [
        {
            'name': 'Wizard',
            'asset': './asset/Wizard.glb',
            'size': 2
        }
    ],
    'Terrain': [
        {
            'name': 'Spawn',
            'asset': './asset/Spawn.glb',
            'size': 2
        },
        {
            'name': 'Grassy',
            'asset': './asset/Grassy.glb',
            'size': 2
        }
    ],
    'Surface': [
        {
            'name': 'Pillar',
            'asset': './asset/Pillar.glb',
            'animate': 'PillarAction',
            'size': 2
        },
        {
            'name': 'PineTree',
            'asset': './asset/PineTree.glb',
            'size': 2
        }
    ]
}

module.exports = GameAsset;