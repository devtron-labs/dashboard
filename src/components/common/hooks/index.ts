import React, { useEffect, useState } from 'react'
import { FileDataInterface, FileReaderStatusInterface, ReadFileAs, ValidatorType } from './types'
import { FILE_READING_FAILED_STATUS, NO_FILE_SELECTED_STATUS } from './constants'

export const useFileReader = () => {
    const [fileData, setFileData] = useState<FileDataInterface>(null)
    const [progress, setProgress] = useState<number>(0)
    const [status, setStatus] = useState<FileReaderStatusInterface>(null)
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
        if (!fileData || fileData.data == null) return
        if (!validator) return
        const { status, message } = validator(fileData)
        setStatus(() => ({
            message,
            status,
        }))
        if (status) {
            setProgress(() => 100)
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
        setStatus(() => FILE_READING_FAILED_STATUS)
    }

    const handleFileProgress = (e: any) => {
        const progress = e.total ? Math.min(Math.round((e.loaded * 100) / e.total), 70) : 70
        setProgress(() => progress)
    }

    const readFile = (file: any, fileValidator: ValidatorType, readAs: string) => {
        if (!file) {
            setStatus(() => NO_FILE_SELECTED_STATUS)
            return
        }
        setFileData({
            data: null,
            type: file.type,
            name: file.name,
        })
        setValidator(() => fileValidator)
        setProgress(() => 0)
        setStatus(() => ({
            status: 'loading',
            message: {
                data: null,
                description: 'File is being uploaded',
            },
        }))
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
            setStatus(() => FILE_READING_FAILED_STATUS)
        }
    }

    const abortRead = () => {
        reader.abort()
        setStatus(() => null)
        setProgress(() => 0)
        setFileData(() => null)
        reader.removeEventListener('load', handleFileRead)
        reader.removeEventListener('error', handleFileError)
        reader.removeEventListener('progress', handleFileProgress)
    }

    return { fileData, progress, status, readFile, abortRead }
}

export const useClickOutside = (ref: any, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (ref?.current && !ref.current.contains(e.target)) {
                callback()
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [ref, callback])
}
