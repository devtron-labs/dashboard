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

export enum VariableCategories {
    APPLICATION_ENV = 'ApplicationEnv',
    APPLICATION = 'Application',
    ENVIRONMENT = 'Env',
    CLUSTER = 'Cluster',
    GLOBAL = 'Global',
}

export interface SavedVariablesViewI {
    scopedVariablesData: ScopedVariablesDataI
    jsonSchema: object
    reloadScopedVariables: () => void
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataI>>
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
    variablesData: string
    name: string
    jsonSchema: object
    abortRead: () => void
    setShowEditView?: React.Dispatch<React.SetStateAction<boolean>>
    reloadScopedVariables: () => void
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataI>>
}

export interface UploadScopedVariablesI {
    reloadScopedVariables: () => void
    jsonSchema: object
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataI>>
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

export interface ScopedVariablesDataI {
    apiVersion: 'devtron.ai/v1beta1'
    kind: 'Variable'
    spec: VariableSpecI[]
}

export interface VariableSpecI {
    description?: string
    name: string
    values: ValueI[]
}

export interface ValueI {
    category: VariableCategories
    value: any
    selectors?: object
}

export type ValidatorT = (fileData: FileDataI) => FileReaderStatusI
