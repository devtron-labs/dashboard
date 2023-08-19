export interface FileReaderStatusI {
    status: boolean
    message: string | {
        data: any
    }
}

export interface FileDataI {
    data: any
    type: string
    name: string
}

export type ValidatorT = (fileData: FileDataI) => FileReaderStatusI

export enum ReadFileAs {
    TEXT = 'text',
    DATA_URL = 'dataUrl',
    BINARY_STRING = 'binaryString',
    ARRAY_BUFFER = 'arrayBuffer',
}
