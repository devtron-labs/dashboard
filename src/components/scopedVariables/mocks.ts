export const validScopedVariablesData = {
    code: 200,
    status: 'OK',
    result: {
        manifest: {
            apiVersion: 'devtron.ai/v1beta1',
            kind: 'Variable',
            spec: [
                {
                    notes: 'KAFKA',
                    shortDescription: '',
                    isSensitive: false,
                    name: 'KAFKA',
                    values: [
                        {
                            category: 'Global',
                            value: "'",
                        },
                    ],
                },
                {
                    notes: 'Microservices',
                    shortDescription: 'Short Description',
                    isSensitive: true,
                    name: 'Microservices',
                    values: [],
                },
            ],
        },
        jsonSchema: `{}`
    },
}

export const noScopedVariablesData = {
    result: {
        manifest: null,
        jsonSchema: '{}'
    },
    code: 200,
}

export const validVariablesList = [
    {
        name: 'newVariable',
        description: 'newVariableDescription',
        isSensitive: false,
    },
    {
        name: 'newVariable1',
        description: 'newVariable1Description',
        isSensitive: true,
    },
]
