/*
    Animation types
    * onStart
    * onTrigger
    Shape Key types
    * onStart
    * onTrigger
 */
const GameAsset = {
    'test': [
        {
            'name': 'Test',
            'asset': './asset/Pyramid.glb',
            'animate': {
                'onStart': ['KeyAction']
            },
            'size': 2
        },
        {
            'name': 'Test2',
            'asset': './asset/ShapeKey.glb',
            'size': 2
        }
    ],
    'players': [
        {
            'name': 'Wizard',
            'asset': './asset/Wizard.glb',
            'size': 2
        }
    ],
    'terrain': [
        {
            'name': 'Spawn',
            'asset': './asset/Spawn.glb',
            'size': 2
        },
        {
            'name': 'Grassy',
            'asset': './asset/Grassy.glb',
            'shapekey': {
                'onStart': [
                    'GrassBlade1.x',
                    'GrassBlade1.y',
                    'GrassBlade1.z',
                    'GrassBlade2.x',
                    'GrassBlade2.y',
                    'GrassBlade2.z',
                    'GrassBlade3.x',
                    'GrassBlade3.y',
                    'GrassBlade3.z'
                ]
            },
            'size': 2
        }
    ],
    'surface': [
        {
            'name': 'Pillar',
            'asset': './asset/Pillar.glb',
            'animate': {
                'onStart': ['PillarAction']
            },
            'size': 2
        },
        {
            'name': 'PineTree',
            'asset': './asset/PineTree.glb',
            'size': 2
        }
    ]
}

export default GameAsset;