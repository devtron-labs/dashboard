import React from 'react'
import {
    DEFAULT_DESCRIPTION,
    DOWNLOAD_TEMPLATE,
    DEFAULT_TITLE,
    UPLOAD_DESCRIPTION_L1,
    UPLOAD_DESCRIPTION_L2,
    PARSE_ERROR_STATUS,
    FILE_NOT_SUPPORTED_STATUS,
    JSON_PARSE_ERROR_STATUS,
    YAML_PARSE_ERROR_STATUS,
} from './constants'
import { useFileReader } from './utils/hooks'
import yaml from 'js-yaml'
import './styles.scss'
import { ReadFileAs, ValidatorT } from './types'

const ICUpload = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
                d="M10.2083 12.0835V3.3358M6.927 6.61389L10.2083 3.3335L13.4895 6.61389M17.0833 12.0835V16.4585C17.0833 16.6243 17.0174 16.7832 16.9002 16.9004C16.783 17.0176 16.624 17.0835 16.4583 17.0835H3.95825C3.79249 17.0835 3.63352 17.0176 3.51631 16.9004C3.3991 16.7832 3.33325 16.6243 3.33325 16.4585V12.0835"
                stroke="#0066CC"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

const UploadScopedVariables = () => {
    const { progress, status, readFile } = useFileReader()
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const file = e.target.files[0]
        const validator: ValidatorT = ({ data, type }) => {
            if (!data) {
                return {
                    status: false,
                    message: 'File is empty',
                }
            }

            switch (type) {
                case 'application/json':
                    try {
                        const parsedData = JSON.parse(data)
                        if (parsedData && typeof parsedData === 'object') {
                            return {
                                status: true,
                                message: parsedData,
                            }
                        }
                        return PARSE_ERROR_STATUS
                    } catch (e) {
                        return JSON_PARSE_ERROR_STATUS
                    }
                case 'application/x-yaml':
                case 'text/yaml':
                case 'text/x-yaml':
                    try {
                        const parsedData = yaml.safeLoad(data)
                        if (parsedData && typeof parsedData === 'object') {
                            return {
                                status: true,
                                message: parsedData,
                            }
                        }
                        return PARSE_ERROR_STATUS
                    } catch (e) {
                        return YAML_PARSE_ERROR_STATUS
                    }
                default:
                    return FILE_NOT_SUPPORTED_STATUS
            }
        }

        readFile(file, validator, ReadFileAs.TEXT)
    }

    return (
        <div className="flex column center h-100vh default-bg-color">
            <div className="flex column center dc__gap-20 w-320 dc__no-shrink">
                <div className="flex column center dc__gap-8">
                    <p className="default-view-title-typography">{DEFAULT_TITLE}</p>
                    <p className="default-view-description-typography">{DEFAULT_DESCRIPTION}</p>
                </div>
                <button className="upload-scoped-variables-button">
                    <input
                        type="file"
                        id="file"
                        accept=".yaml, .yml, .json"
                        style={{
                            display: 'none',
                        }}
                        onChange={handleFileUpload}
                    />

                    <label htmlFor="file" className="flex column center" style={{ cursor: 'pointer' }}>
                        <div className="flex center upload-scoped-variables-button__icon">
                            <ICUpload />
                        </div>
                        <div className="flex column center">
                            <p className="upload-description-l1-typography">{UPLOAD_DESCRIPTION_L1}</p>
                            <p className="upload-description-l2-typography">{UPLOAD_DESCRIPTION_L2}</p>
                        </div>
                    </label>
                </button>

                <button className="p-0 dc__no-background dc__no-border default-download-template-typography">
                    {DOWNLOAD_TEMPLATE}
                </button>
            </div>
        </div>
    )
}

const ScopedVariables = () => {
    return <UploadScopedVariables />
}
export default ScopedVariables
