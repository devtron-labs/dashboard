const cmSecretsMockData = {
    code: 200,
    status: 'OK',
    result: {
        resourceConfig: [
            {
                name: 'cm-1',
                configState: 2,
                type: 'ConfigMap',
            },
            {
                name: 'cm-2',
                configState: 2,
                type: 'ConfigMap',
            },
            {
                name: 's1',
                configState: 2,
                type: 'Secret',
            },
        ],
    },
}

export default cmSecretsMockData
