export enum ReadFileAs {
    TEXT = 'text',
    DATA_URL = 'dataUrl',
    BINARY_STRING = 'binaryString',
    ARRAY_BUFFER = 'arrayBuffer',
}

export enum FileView {
    YAML = 'yaml',
    SAVED = 'saved',
}

export interface SavedVariablesViewI {
    scopedVariablesData: any
    setScopedVariables: (variables: any) => void
}

export interface FileReaderStatusI {
    status: boolean | 'loading'
    message: {
        data: any
        description: string
    }
}

export interface FileDataI {
    data: any
    type: string
    name: string
}

export interface LoadScopedVariablesI {
    status: FileReaderStatusI
    progress: number
    fileData: FileDataI
    abortRead: () => void
}

export interface ScopedVariablesInputI {
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    children?: React.ReactNode
}

export interface ScopedVariablesEditorI {
    variablesData: any
    name: string
    abortRead: () => void
    setScopedVariables: (variables: any) => void
}

export interface UploadScopedVariablesI {
    setScopedVariables: (variables: any) => void
}

export interface DescriptorI {
    children?: React.ReactNode
    showUploadButton?: boolean
    readFile?: (file: File, validator: ValidatorT, readAs: ReadFileAs) => void
}

export interface VariableListItemI {
    name: string
    description: string
}

export interface TableListI {
    children?: React.ReactNode
    width?: string[]
    headings?: string[]
}

export interface TableItemI {
    columnsData?: string[]
    width?: string[]
}

export interface ScopedVariablesI {
    isSuperAdmin: boolean
}

export type ValidatorT = (fileData: FileDataI) => FileReaderStatusI

export const ScopedVariablesSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
        AttributeType: {
            type: 'string',
            enum: ['ApplicationEnv', 'Application', 'Env', 'Cluster', 'Global'],
        },
        IdentifierType: {
            type: 'string',
            enum: ['ApplicationName', 'EnvName', 'ClusterName'],
        },
        Definition: {
            type: 'object',
            properties: {
                varName: { type: 'string' },
                dataType: { type: 'string', enum: ['json', 'yaml', 'primitive'] },
                varType: { type: 'string', enum: ['private', 'public'] },
                description: { type: 'string' },
            },
            required: ['varName', 'dataType', 'varType', 'description'],
        },
        VariableValue: {
            type: 'object',
            properties: {
                value: { type: 'string' },
            },
            required: ['value'],
        },
        AttributeValue: {
            type: 'object',
            properties: {
                variableValue: { $ref: '#/definitions/VariableValue' },
                attributeType: { $ref: '#/definitions/AttributeType' },
                attributeParams: {
                    type: 'object',
                    additionalProperties: { type: 'string' },
                },
            },
            required: ['variableValue', 'attributeType', 'attributeParams'],
        },
        Variables: {
            type: 'object',
            properties: {
                definition: { $ref: '#/definitions/Definition' },
                attributeValue: {
                    type: 'array',
                    items: { $ref: '#/definitions/AttributeValue' },
                },
            },
            required: ['definition', 'attributeValue'],
        },
        Payload: {
            type: 'object',
            properties: {
                variables: {
                    type: 'array',
                    items: { $ref: '#/definitions/Variables' },
                },
                userId: { type: 'integer' },
            },
            required: ['variables'],
        },
    },
    $ref: '#/definitions/Payload',
}
