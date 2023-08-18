import React, { useEffect, useState } from 'react'
import { FileDataI, FileReaderStatusI, ReadFileAs, ValidatorT } from '../types'
import { FILE_READING_ABORTED_STATUS, FILE_READING_FAILED_STATUS, NO_FILE_SELECTED_STATUS } from '../constants'

export const useFileReader = () => {
    const [fileData, setFileData] = useState<FileDataI>({
        data: null,
        type: null,
    })
    const [progress, setProgress] = useState<number>(0)
    const [status, setStatus] = useState<FileReaderStatusI>(null)
    // Since its a function and not a value, we need to use a callback to set the value
    const [validator, setValidator] = useState<ValidatorT>(null)

    useEffect(() => {
        if (!fileData || !fileData.data) return
        if (!validator) return
        const { status, message } = validator(fileData)
        setStatus(() => ({
            message,
            status,
        }))
        if (status) {
            setProgress(() => 100)
            // Don't set the value of fileData to null here, as it will cause the cause useEffect to run again
        } else {
            setProgress(() => 0)
        }
        return () => {
            setProgress(() => 0)
            setStatus(() => null)
        }
    }, [fileData, validator])

    const handleFileRead = (e: any) => {
        const content = e.target.result
        setFileData((prev) => ({
            ...prev,
            data: content,
        }))
    }

    const handleFileError = (e: any) => {
        setStatus(() => FILE_READING_FAILED_STATUS)
        setFileData(() => null)
        setValidator(() => null)
    }

    const handleFileProgress = (e: any) => {
        const progress = Math.min(Math.round((e.loaded * 100) / e.total), 90)
        setProgress(() => progress)
    }

    const handleFileAbort = (e: any) => {
        setStatus(() => FILE_READING_ABORTED_STATUS)
        setProgress(() => 0)
        setFileData(() => null)
        setValidator(() => null)
    }

    const readFile = (file: any, fileValidator: ValidatorT, readAs: string) => {
        if (!file) {
            setStatus(() => NO_FILE_SELECTED_STATUS)
            return
        }
        setFileData({
            data: null,
            type: file.type,
        })
        setValidator(() => fileValidator)
        const reader = new FileReader()

        try {
            reader.addEventListener('load', handleFileRead)
            reader.addEventListener('error', handleFileError)
            reader.addEventListener('progress', handleFileProgress)
            reader.addEventListener('abort', handleFileAbort)
            reader.addEventListener('loadend', () => {
                reader.removeEventListener('load', handleFileRead)
                reader.removeEventListener('error', handleFileError)
                reader.removeEventListener('progress', handleFileProgress)
                reader.removeEventListener('abort', handleFileAbort)
            })
            switch (readAs) {
                case ReadFileAs.TEXT:
                    reader.readAsText(file)
                    break
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
            reader.removeEventListener('abort', handleFileAbort)
            setFileData(() => null)
            setValidator(() => null)
            setStatus(() => FILE_READING_FAILED_STATUS)
        }
    }

    return { fileData, progress, status, readFile }
}
