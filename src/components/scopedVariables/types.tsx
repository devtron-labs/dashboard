export enum ReadFileAs {
    TEXT = 'text',
    DATA_URL = 'dataUrl',
    BINARY_STRING = 'binaryString',
    ARRAY_BUFFER = 'arrayBuffer',
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
}

export interface ScopedVariablesEditorI {
    variablesData: any
    type: string
    name: string
}

export type ValidatorT = (fileData: FileDataI) => FileReaderStatusI
