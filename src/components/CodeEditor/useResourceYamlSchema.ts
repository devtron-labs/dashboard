import { useEffect } from 'react';

function useResourceYamlSchema(yaml: any, resource) {
    useEffect(() => {
        yaml &&
            yaml.yamlDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                hover: true,
                completion: true,
                isKubernetes: true,
                format: true,
                schemas: [
                    {
                        uri: 'https://devtron.ai/schema.json', // id of the first schema
                        fileMatch: ['*'], // associate with our model
                        schema: {
                            type: 'object',
                            properties: {
                                property: {
                                    description: 'I have a description',
                                },
                                titledProperty: {
                                    title: 'I have a title',
                                    description: 'I also have a description',
                                },
                                markdown: {
                                    markdownDescription: 'Even **markdown** _descriptions_ `are` ~~not~~ supported!',
                                },
                                enum: {
                                    description: 'Pick your starter',
                                    enum: ['Bulbasaur', 'Squirtle', 'Charmander', 'Pikachu'],
                                },
                                number: {
                                    description: 'Numbers work!',
                                    minimum: 42,
                                    maximum: 1337,
                                },
                                boolean: {
                                    description: 'Are boolean supported?',
                                    type: 'boolean',
                                },
                                string: {
                                    type: 'string',
                                },
                                reference: {
                                    description: 'JSON schemas can be referenced, even recursively',
                                    $ref: '#',
                                },
                                array: {
                                    description: 'It also works in arrays',
                                    items: {
                                        $ref: '#',
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource]);
}

export default useResourceYamlSchema;
