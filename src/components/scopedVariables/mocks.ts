export const validScopedVariablesData = {
    result: {
        payload: {
            variables: [
                {
                    definition: {
                        varName: 'variable1',
                        dataType: 'primitive',
                        varType: 'private',
                        description: 'This is variable 1',
                    },
                    attributeValue: [
                        {
                            variableValue: {
                                value: '"valuewithoutquotes"',
                            },
                            attributeType: 'ApplicationEnv',
                            attributeParams: {
                                ApplicationName: 'app1',
                                EnvName: 'dev',
                            },
                        },
                        {
                            variableValue: {
                                value: '"valuewithquotes"',
                            },
                            attributeType: 'Env',
                            attributeParams: {
                                EnvName: 'prod',
                            },
                        },
                    ],
                },
                {
                    definition: {
                        varName: 'variable2',
                        dataType: 'primitive',
                        varType: 'public',
                        description: 'This is variable 2',
                    },
                    attributeValue: [
                        {
                            variableValue: {
                                value: '"12345"',
                            },
                            attributeType: 'Application',
                            attributeParams: {
                                ApplicationName: 'app2',
                            },
                        },
                        {
                            variableValue: {
                                value: '10000',
                            },
                            attributeType: 'ApplicationEnv',
                            attributeParams: {
                                ApplicationName: 'app2',
                            },
                        },
                    ],
                },
            ],
        },
        jsonSchema:
            '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "$id": "https://github.com/devtron-labs/devtron/pkg/variables/repository/payload",\n  "$ref": "#/$defs/Payload",\n  "$defs": {\n    "AttributeValue": {\n      "properties": {\n        "variableValue": {\n          "$ref": "#/$defs/VariableValue"\n        },\n        "attributeType": {\n          "type": "string"\n        },\n        "attributeParams": {\n          "patternProperties": {\n            ".*": {\n              "type": "string"\n            }\n          },\n          "type": "object"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "variableValue",\n        "attributeType",\n        "attributeParams"\n      ]\n    },\n    "Definition": {\n      "properties": {\n        "varName": {\n          "type": "string"\n        },\n        "dataType": {\n          "type": "string"\n        },\n        "varType": {\n          "type": "string"\n        },\n        "description": {\n          "type": "string"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "varName",\n        "dataType",\n        "varType",\n        "description"\n      ]\n    },\n    "Payload": {\n      "properties": {\n        "variables": {\n          "items": {\n            "$ref": "#/$defs/Variables"\n          },\n          "type": "array"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "variables"\n      ]\n    },\n    "VariableValue": {\n      "properties": {\n        "value": {\n          "type": "string"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "value"\n      ]\n    },\n    "Variables": {\n      "properties": {\n        "definition": {\n          "$ref": "#/$defs/Definition"\n        },\n        "attributeValue": {\n          "items": {\n            "$ref": "#/$defs/AttributeValue"\n          },\n          "type": "array"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "definition",\n        "attributeValue"\n      ]\n    }\n  }\n}',
    },
    code: 200,
}

export const noScopedVariablesData = {
    result: {
        payload: null,
        jsonSchema:
            '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "$id": "https://github.com/devtron-labs/devtron/pkg/variables/repository/payload",\n  "$ref": "#/$defs/Payload",\n  "$defs": {\n    "AttributeValue": {\n      "properties": {\n        "variableValue": {\n          "$ref": "#/$defs/VariableValue"\n        },\n        "attributeType": {\n          "type": "string"\n        },\n        "attributeParams": {\n          "patternProperties": {\n            ".*": {\n              "type": "string"\n            }\n          },\n          "type": "object"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "variableValue",\n        "attributeType",\n        "attributeParams"\n      ]\n    },\n    "Definition": {\n      "properties": {\n        "varName": {\n          "type": "string"\n        },\n        "dataType": {\n          "type": "string"\n        },\n        "varType": {\n          "type": "string"\n        },\n        "description": {\n          "type": "string"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "varName",\n        "dataType",\n        "varType",\n        "description"\n      ]\n    },\n    "Payload": {\n      "properties": {\n        "variables": {\n          "items": {\n            "$ref": "#/$defs/Variables"\n          },\n          "type": "array"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "variables"\n      ]\n    },\n    "VariableValue": {\n      "properties": {\n        "value": {\n          "type": "string"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "value"\n      ]\n    },\n    "Variables": {\n      "properties": {\n        "definition": {\n          "$ref": "#/$defs/Definition"\n        },\n        "attributeValue": {\n          "items": {\n            "$ref": "#/$defs/AttributeValue"\n          },\n          "type": "array"\n        }\n      },\n      "additionalProperties": false,\n      "type": "object",\n      "required": [\n        "definition",\n        "attributeValue"\n      ]\n    }\n  }\n}',
    },
    code: 200,
}
