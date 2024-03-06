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

export interface FileReaderStatusType {
    status: FileReaderStatus
    message: {
        data: any
        description: string
    }
}

export interface FileDataType {
    data: any
    type: string
    name: string
}

export type ValidatorType = (fileData: FileDataType) => FileReaderStatusType

export enum FILE_EXTENSION {
    JSON = 'json',
    YAML = 'yaml',
    YML = 'yml',
}

export enum MIME_TYPE {
    APPLICATION_JSON = 'application/json',
    APPLICATION_X_YAML = 'application/x-yaml',
    APPLICATION_YAML = 'application/yaml',
    TEXT_X_YAML = 'text/x-yaml',
    TEXT_YAML = 'text/yaml',
}
