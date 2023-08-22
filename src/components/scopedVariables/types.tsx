export enum ReadFileAs {
    TEXT = 'text',
    DATA_URL = 'dataUrl',
    BINARY_STRING = 'binaryString',
    ARRAY_BUFFER = 'arrayBuffer',
}

export enum FileView {
    UPLOADED = 'uploaded',
    SAVED = 'saved',
}

export interface SavedVariablesViewI {
    scopedVariables: any
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

export type ValidatorT = (fileData: FileDataI) => FileReaderStatusI
