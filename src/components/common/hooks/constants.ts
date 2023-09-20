import { FileReaderStatus } from './types'

export const NO_FILE_SELECTED_STATUS = {
    message: {
        data: null,
        description: 'No file selected',
    },
    status: FileReaderStatus.FAILED,
}

export const FILE_READING_FAILED_STATUS = {
    message: {
        data: null,
        description: 'File reading failed',
    },
    status: FileReaderStatus.FAILED,
}
