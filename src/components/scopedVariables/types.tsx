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

export type ValidatorT = (fileData: FileDataI) => FileReaderStatusI
