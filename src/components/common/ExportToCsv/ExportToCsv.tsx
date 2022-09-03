import React, { useEffect, useRef, useState } from 'react'
import { CSVLink } from 'react-csv'
import { CSV_HEADERS, ExportToCsvProps, FILE_NAMES } from './constants'
import { ReactComponent as ExportIcon } from '../../../assets/icons/ic-arrow-line-down.svg'
import { ReactComponent as Success } from '../../../assets/icons/ic-success.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import { VisibleModal } from '../modals/VisibleModal'
import './exportToCsv.scss'
import { DetailsProgressing } from '../icons/Progressing'
import moment from 'moment'
import { Moment12HourExportFormat } from '../../../config'

export default function ExportToCsv({
    apiPromise,
    fileName,
    className,
}: ExportToCsvProps) {
    const [exportingData, setExportingData] = useState(false)
    const [showExportingModal, setShowExportingModal] = useState(false)
    const [errorExportingData, setErrorExportingData] = useState(false)
    const [dataToExport, setDataToExport] = useState(null)
    const [requestCancelled, setRequestCancelled] = useState(false)
    const csvRef = useRef(null)
    let abortController = null

    useEffect(() => {
        if (Array.isArray(dataToExport) && csvRef?.current && !requestCancelled) {
            initiateDownload()
        }
    }, [dataToExport])

    const generateDataToExport = async () => {
        if (requestCancelled || errorExportingData) {
            setRequestCancelled(false)
            setErrorExportingData(false)
        }

        if (!exportingData) {
            const fileNameKey = Object.keys(FILE_NAMES).find((key) => FILE_NAMES[key] === fileName)
            console.info(`Started exporting data at ${moment().format('HH:mm:ss')}.`)
            abortController = new AbortController()
            setExportingData(true)
            setShowExportingModal(true)

            try {
                const response = await apiPromise({ signal: abortController.signal })
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

                if (abortController) {
                    abortController = null
                }
            }
        }
    }

    const handleCancelAction = () => {
        // Abort any ongoing request when cancel is clicked
        if (abortController) {
            abortController.abort()
            abortController = null
        }

        // Hide the export modal
        setRequestCancelled(true)
        setShowExportingModal(false)
    }

    const renderModalCTA = () => {
        return (
            <div className="modal__CTA flex right border-top">
                <button type="button" className="flex cta cancel h-32" onClick={handleCancelAction}>
                    Cancel
                </button>
                {!exportingData && errorExportingData && (
                    <button type="button" className="flex cta ml-12 h-32" onClick={generateDataToExport}>
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
                        <span className="fs-13 fw-4 align-center">
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
        <div className={`export-to-csv-button ${className}`}>
            <button className="flex cta ghosted w-100 h-36" onClick={generateDataToExport}>
                <ExportIcon className="icon-dim-16 mr-8" />
                <span>Export CSV</span>
            </button>
            <CSVLink
                ref={csvRef}
                filename={`${fileName}_${moment().format(Moment12HourExportFormat)}.csv`}
                headers={CSV_HEADERS[fileName] || []}
                data={dataToExport || []}
                separator=";"
            />
            {showExportingModal && (
                <VisibleModal className="export-to-csv-modal">
                    <div className="modal__body">
                        <h2 className="cn-9 fw-6 fs-16 m-0 border-bottom">Export to CSV</h2>
                        {renderExportStatus()}
                        {renderModalCTA()}
                    </div>
                </VisibleModal>
            )}
        </div>
    )
}
