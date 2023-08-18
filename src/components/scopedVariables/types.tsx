export interface FileReaderStatusI {
    message: string
    status: boolean
}

export interface FileDataI {
    data: any
    type: string
}

export type ValidatorT = (fileData: FileDataI) => FileReaderStatusI

export enum ReadFileAs {
    TEXT = 'text',
    DATA_URL = 'dataUrl',
    BINARY_STRING = 'binaryString',
    ARRAY_BUFFER = 'arrayBuffer',
}
