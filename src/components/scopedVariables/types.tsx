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
    jsonSchema: object
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
    jsonSchema: object
    abortRead: () => void
    setScopedVariables: (variables: any) => void
    setShowEditView?: (show: boolean) => void
}

export interface UploadScopedVariablesI {
    setScopedVariables: (variables: any) => void
    jsonSchema: object
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
