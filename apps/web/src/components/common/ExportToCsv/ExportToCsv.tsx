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

import { useEffect, useRef, useState } from 'react'
import { CSVLink } from 'react-csv'
import {
    ConditionalWrap,
    VisibleModal,
    DetailsProgressing,
} from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import Tippy from '@tippyjs/react'
import { CSV_HEADERS, ExportToCsvProps, FILE_NAMES } from './constants'
import { ReactComponent as ExportIcon } from '../../../assets/icons/ic-arrow-line-down.svg'
import { ReactComponent as Success } from '../../../assets/icons/ic-success.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import { Moment12HourExportFormat } from '../../../config'
import './exportToCsv.scss'

export default function ExportToCsv({
    apiPromise,
    fileName,
    className = '',
    disabled = false,
    showOnlyIcon = false,
}: ExportToCsvProps) {
    const [exportingData, setExportingData] = useState(false)
    const [showExportingModal, setShowExportingModal] = useState(false)
    const [errorExportingData, setErrorExportingData] = useState(false)
    const [dataToExport, setDataToExport] = useState(null)
    const [requestCancelled, setRequestCancelled] = useState(false)
    const csvRef = useRef(null)

    useEffect(() => {
        if (Array.isArray(dataToExport) && csvRef?.current && !requestCancelled) {
            initiateDownload()
        }
    }, [dataToExport])

    const generateDataToExport = async () => {
        if (disabled) {
            return
        }

        if (requestCancelled || errorExportingData) {
            setRequestCancelled(false)
            setErrorExportingData(false)
        }

        if (!exportingData) {
            const fileNameKey = Object.keys(FILE_NAMES).find((key) => FILE_NAMES[key] === fileName)
            console.info(`Started exporting data at ${moment().format('HH:mm:ss')}.`)
            setExportingData(true)
            setShowExportingModal(true)

            try {
                const response = await apiPromise()
                setDataToExport(response)

                console.info(
                    `Completed data export of ${response.length} ${fileNameKey || ''} at ${moment().format(
                        'HH:mm:ss',
                    )}.`,
                )
            } catch (err) {
                setErrorExportingData(true)

                console.error(
                    `Data export failed at ${moment().format('HH:mm:ss')}. Reason - ${err['message'] || err['name']}`,
                )
            } finally {
                setExportingData(false)
            }
        }
    }

    const handleCancelAction = () => {
        setRequestCancelled(true)
        setShowExportingModal(false)
    }

    const renderModalCTA = () => {
        return (
            <div className="modal__CTA flex right dc__border-top">
                <button
                    type="button"
                    className="flex cta cancel h-32"
                    onClick={handleCancelAction}
                    data-testid="close-export-csv-button"
                >
                    {exportingData ? 'Cancel' : 'Close'}
                </button>
                {!exportingData && errorExportingData && (
                    <button
                        type="button"
                        className="flex cta ml-12 h-32"
                        onClick={generateDataToExport}
                        data-testid="retry-export-csv-button"
                    >
                        Retry
                    </button>
                )}
            </div>
        )
    }

    const initiateDownload = () => {
        csvRef.current.link.click()
    }

    const renderExportStatus = () => {
        return (
            <div className="export-status flex">
                {exportingData && !errorExportingData && (
                    <DetailsProgressing size={32} loadingText="Preparing export..." fullHeight>
                        <span className="fs-13 fw-4">Please do not reload or press the browser back button.</span>
                    </DetailsProgressing>
                )}
                {errorExportingData && (
                    <div className="export-error bcn-0 flex column cn-9 h-100">
                        <Error className="icon-dim-32" />
                        <span className="fs-14 fw-6 mt-8">Unable to export data</span>
                        <span className="fs-13 fw-4 dc__align-center">
                            Encountered an error while trying to export. Please try again. If error persists then try
                            after some time.
                        </span>
                    </div>
                )}
                {!exportingData && !errorExportingData && (
                    <div className="export-success bcn-0 flex column cn-9 h-100">
                        <Success className="icon-dim-32" />
                        <span className="fs-14 fw-6 mt-8">Your export is ready</span>
                        <span className="fs-13 fw-4"> If download does not start automatically,</span>
                        <span className="fs-13 fw-4 cb-5 pointer" onClick={initiateDownload}>
                            click here to download manually.
                        </span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div
            className={`export-to-csv-button ${showOnlyIcon ? 'w-32' : ''} h-32 ${className}`}
        >
            <ConditionalWrap
                condition={disabled}
                wrap={(children) => (
                    <Tippy className="default-tt" arrow={false} placement="top" content="Nothing to export">
                        {children}
                    </Tippy>
                )}
            >
                <button
                    className={`flex cta ghosted flex dc__gap-8 ${showOnlyIcon ? 'w-32 mw-none' : 'w-100'} h-32 ${
                        disabled ? 'nothing-to-export' : ''
                    }`}
                    onClick={generateDataToExport}
                    data-testid="export-csv-button"
                >
                    <ExportIcon className="icon-dim-16" />
                    {!showOnlyIcon && <span>Export CSV</span>}
                </button>
            </ConditionalWrap>
            <CSVLink
                ref={csvRef}
                filename={`${fileName}_${moment().format(Moment12HourExportFormat)}.csv`}
                headers={CSV_HEADERS[fileName] || []}
                data={dataToExport || []}
            />
            {showExportingModal && (
                <VisibleModal className="export-to-csv-modal" data-testid="export-to-csv-modal">
                    <div className="modal__body">
                        <h2 className="cn-9 fw-6 fs-16 m-0 dc__border-bottom">Export to CSV</h2>
                        {renderExportStatus()}
                        {renderModalCTA()}
                    </div>
                </VisibleModal>
            )}
        </div>
    )
}
