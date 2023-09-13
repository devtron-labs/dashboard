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
        jsonSchema:
            '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "$id": "https://github.com/devtron-labs/devtron/pkg/variables/models/scoped-variable-manifest",\n  "$ref": "#/$defs/ScopedVariableManifest",\n  "$defs": {\n    "ScopedVariableManifest": {\n      "properties": {\n        "apiVersion": {\n          "type": "string"\n        },\n        "kind": {\n          "type": "string"\n        },\n        "spec": {\n          "items": {\n            "$ref": "#/$defs/VariableSpec"\n          },\n          "type": "array"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "apiVersion",\n        "kind",\n        "spec"\n      ]\n    },\n    "Selector": {\n      "properties": {\n        "attributeSelectors": {\n          "patternProperties": {\n            ".*": {\n              "type": "string"\n            }\n          },\n          "type": "object"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "attributeSelectors"\n      ]\n    },\n    "VariableSpec": {\n      "properties": {\n        "notes": {\n          "type": "string"\n        },\n        "shortDescription": {\n          "type": "string"\n        },\n        "isSensitive": {\n          "type": "boolean"\n        },\n        "name": {\n          "type": "string"\n        },\n        "values": {\n          "items": {\n            "$ref": "#/$defs/VariableValueSpec"\n          },\n          "type": "array"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "notes",\n        "shortDescription",\n        "isSensitive",\n        "name",\n        "values"\n      ]\n    },\n    "VariableValueSpec": {\n      "properties": {\n        "category": {\n          "type": "string"\n        },\n        "value": true,\n        "selectors": {\n          "$ref": "#/$defs/Selector"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "category",\n        "value"\n      ]\n    }\n  }\n}',
    },
}

export const noScopedVariablesData = {
    result: {
        manifest: null,
        jsonSchema:
            '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "$id": "https://github.com/devtron-labs/devtron/pkg/variables/repository/payload",\n  "$ref": "#/$defs/Payload",\n  "$defs": {\n    "AttributeValue": {\n      "properties": {\n        "variableValue": {\n          "$ref": "#/$defs/VariableValue"\n        },\n        "attributeType": {\n          "type": "string"\n        },\n        "attributeParams": {\n          "patternProperties": {\n            ".*": {\n              "type": "string"\n            }\n          },\n          "type": "object"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "variableValue",\n        "attributeType",\n        "attributeParams"\n      ]\n    },\n    "Definition": {\n      "properties": {\n        "varName": {\n          "type": "string"\n        },\n        "dataType": {\n          "type": "string"\n        },\n        "varType": {\n          "type": "string"\n        },\n        "description": {\n          "type": "string"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "varName",\n        "dataType",\n        "varType",\n        "description"\n      ]\n    },\n    "Payload": {\n      "properties": {\n        "variables": {\n          "items": {\n            "$ref": "#/$defs/Variables"\n          },\n          "type": "array"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "variables"\n      ]\n    },\n    "VariableValue": {\n      "properties": {\n        "value": {\n          "type": "string"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "value"\n      ]\n    },\n    "Variables": {\n      "properties": {\n        "definition": {\n          "$ref": "#/$defs/Definition"\n        },\n        "attributeValue": {\n          "items": {\n            "$ref": "#/$defs/AttributeValue"\n          },\n          "type": "array"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "definition",\n        "attributeValue"\n      ]\n    }\n  }\n}',
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
