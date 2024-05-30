/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect } from 'react'
import { FileDataType, FileReaderStatus, FileReaderStatusType, ReadFileAs, ValidatorType } from './types'
import { FILE_READING_FAILED_STATUS, NO_FILE_SELECTED_STATUS } from './constants'
import { getFileMimeType } from '../../scopedVariables/utils'

export const useFileReader = () => {
    const [fileData, setFileData] = useState<FileDataType>(null)
    const [progress, setProgress] = useState<number>(0)
    const [status, setStatus] = useState<FileReaderStatusType>(null)
    // Since its a function and not a value, we need to use a callback to set the value
    const [validator, setValidator] = useState<ValidatorType>(null)
    const reader = new FileReader()
    useEffect(() => {
        return () => {
            reader.removeEventListener('load', handleFileRead)
            reader.removeEventListener('error', handleFileError)
            reader.removeEventListener('progress', handleFileProgress)
        }
    }, [])

    useEffect(() => {
        // doing == since we want to check for null and undefined
        if (!fileData || fileData.data == null || !validator) {
            return
        }

        const { status, message } = validator(fileData)
        setStatus({ message, status })
        if (status === FileReaderStatus.SUCCESS) {
            setProgress(100)
        }
    }, [fileData, validator])

    const handleFileRead = (e: any) => {
        const content = e.target.result
        setFileData((prev) => ({
            ...prev,
            data: content,
        }))
    }

    const handleFileError = () => {
        setStatus(FILE_READING_FAILED_STATUS)
    }

    const handleFileProgress = (e: any) => {
        const progress = e.total ? Math.min(Math.round((e.loaded * 100) / e.total), 70) : 70
        setProgress(progress)
    }

    const readFile = (file: any, fileValidator: ValidatorType, readAs: string) => {
        if (!file) {
            setStatus(NO_FILE_SELECTED_STATUS)
            return
        }
        // If the MIME type is not there
        // In case of windows, the mime type gives some unexpected results so it needs to be handle explicitly
        setFileData({
            data: null,
            type: file.type || getFileMimeType(file.name),
            name: file.name,
        })
        setValidator(() => fileValidator)
        setProgress(0)
        setStatus({
            status: FileReaderStatus.LOADING,
            message: {
                data: null,
                description: 'File is being uploaded',
            },
        })
        try {
            reader.addEventListener('load', handleFileRead)
            reader.addEventListener('error', handleFileError)
            reader.addEventListener('progress', handleFileProgress)
            reader.addEventListener('loadend', () => {
                reader.removeEventListener('load', handleFileRead)
                reader.removeEventListener('error', handleFileError)
                reader.removeEventListener('progress', handleFileProgress)
            })
            switch (readAs) {
                case ReadFileAs.DATA_URL:
                    reader.readAsDataURL(file)
                    break
                case ReadFileAs.BINARY_STRING:
                    reader.readAsBinaryString(file)
                    break
                case ReadFileAs.ARRAY_BUFFER:
                    reader.readAsArrayBuffer(file)
                    break
                default:
                    reader.readAsText(file)
                    break
            }
        } catch (e) {
            reader.removeEventListener('load', handleFileRead)
            reader.removeEventListener('error', handleFileError)
            reader.removeEventListener('progress', handleFileProgress)
            setStatus(FILE_READING_FAILED_STATUS)
        }
    }

    const abortRead = () => {
        reader.abort()
        setStatus(null)
        setProgress(0)
        setFileData(null)
        reader.removeEventListener('load', handleFileRead)
        reader.removeEventListener('error', handleFileError)
        reader.removeEventListener('progress', handleFileProgress)
    }

    return { fileData, progress, status, readFile, abortRead }
}
