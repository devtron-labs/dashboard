export enum ReadFileAs {
    TEXT = 'text',
    DATA_URL = 'dataUrl',
    BINARY_STRING = 'binaryString',
    ARRAY_BUFFER = 'arrayBuffer',
}

export enum FileReaderStatus {
    LOADING = 'loading',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export interface FileReaderStatusInterface {
    status: FileReaderStatus
    message: {
        data: any
        description: string
    }
}

export interface FileDataInterface {
    data: any
    type: string
    name: string
}

export type ValidatorType = (fileData: FileDataInterface) => FileReaderStatusInterface
