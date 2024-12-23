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
    VisibleModal,
    DetailsProgressing,
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ButtonStyleType,
    logExceptionToSentry,
    GenericSectionErrorState,
} from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { ReactComponent as ExportIcon } from '@Icons/ic-arrow-line-down.svg'
import { ReactComponent as Success } from '@Icons/ic-success.svg'
import { ReactComponent as ICDownload } from '@Icons/ic-download.svg'
import { CSV_HEADERS, FILE_NAMES } from './constants'
import { Moment12HourExportFormat } from '../../../config'
import { ExportToCsvProps } from './types'
import { ExportConfiguration } from './ExportConfiguration'
import { getDefaultValueFromConfiguration } from './utils'

const ExportToCsv = <ConfigValueType extends string = string>({
    apiPromise,
    fileName,
    disabled = false,
    showOnlyIcon = false,
    configuration,
}: ExportToCsvProps<ConfigValueType>) => {
    const [selectedConfig, setSelectedConfig] = useState<Record<ConfigValueType, boolean>>(
        getDefaultValueFromConfiguration(configuration),
    )
    const [showConfiguration, setShowConfiguration] = useState(false)
    const [exportingData, setExportingData] = useState(false)
    const [showExportingModal, setShowExportingModal] = useState(false)
    const [errorExportingData, setErrorExportingData] = useState(false)
    const [dataToExport, setDataToExport] = useState(null)
    const [requestCancelled, setRequestCancelled] = useState(false)
    const csvRef = useRef(null)

    const isConfigurationAvailable = !!configuration && showConfiguration

    const initiateDownload = () => {
        csvRef.current.link.click()
    }

    useEffect(() => {
        if (Array.isArray(dataToExport) && csvRef?.current && !requestCancelled) {
            initiateDownload()
        }
    }, [dataToExport])

    const generateDataToExport = async () => {
        if (showConfiguration) {
            setShowConfiguration(false)
        }

        if (requestCancelled || errorExportingData) {
            setRequestCancelled(false)
            setErrorExportingData(false)
        }

        if (!exportingData) {
            const fileNameKey = Object.keys(FILE_NAMES).find((key) => FILE_NAMES[key] === fileName)
            // eslint-disable-next-line no-console
            console.info(`Started exporting data at ${moment().format('HH:mm:ss')}.`)
            setExportingData(true)
            setShowExportingModal(true)

            try {
                const response = await apiPromise(selectedConfig)
                setDataToExport(response)

                // eslint-disable-next-line no-console
                console.info(
                    `Completed data export of ${response.length} ${fileNameKey || ''} at ${moment().format(
                        'HH:mm:ss',
                    )}.`,
                )
            } catch (err) {
                setErrorExportingData(true)

                // eslint-disable-next-line no-console
                console.error(
                    `Data export failed at ${moment().format('HH:mm:ss')}. Reason - ${err.message || err.name}`,
                )
                logExceptionToSentry(err)
            } finally {
                setExportingData(false)
            }
        }
    }

    const handleExportToCsvClick = async () => {
        if (configuration) {
            setShowConfiguration(true)
        } else {
            await generateDataToExport()
        }
    }

    const handleCancelAction = () => {
        setShowConfiguration(false)
        setRequestCancelled(true)
        setShowExportingModal(false)
    }

    const renderModalCTA = () => {
        if (isConfigurationAvailable) {
            return (
                <>
                    <Button
                        variant={ButtonVariantType.secondary}
                        size={ComponentSizeType.medium}
                        style={ButtonStyleType.neutral}
                        onClick={handleCancelAction}
                        text="Cancel"
                        dataTestId="cancel-export-csv-button"
                    />
                    <Button
                        size={ComponentSizeType.medium}
                        onClick={generateDataToExport}
                        text="Download"
                        dataTestId="retry-export-csv-button"
                        startIcon={<ICDownload />}
                        disabled={!Object.values(selectedConfig).some((value) => value)}
                    />
                </>
            )
        }

        return (
            <>
                <Button
                    variant={ButtonVariantType.secondary}
                    size={ComponentSizeType.medium}
                    style={ButtonStyleType.neutral}
                    onClick={handleCancelAction}
                    text={exportingData ? 'Cancel' : 'Close'}
                    dataTestId="close-export-csv-button"
                />
                {!exportingData && errorExportingData && (
                    <Button
                        size={ComponentSizeType.medium}
                        onClick={generateDataToExport}
                        text="Retry"
                        dataTestId="retry-export-csv-button"
                    />
                )}
            </>
        )
    }

    const renderExportStatus = () => {
        if (isConfigurationAvailable && showConfiguration) {
            return (
                <ExportConfiguration
                    selectedConfig={selectedConfig}
                    setSelectedConfig={setSelectedConfig}
                    configuration={configuration}
                />
            )
        }

        if (errorExportingData) {
            return (
                <GenericSectionErrorState
                    title="Unable to export data"
                    description="Encountered an error while trying to export. Please try again. If error persists then try after
                        some time."
                    buttonText=""
                    subTitle=""
                />
            )
        }

        if (exportingData) {
            return (
                <DetailsProgressing size={32} loadingText="Preparing export..." fullHeight>
                    <span className="fs-13 fw-4">Please do not reload or press the browser back button.</span>
                </DetailsProgressing>
            )
        }

        return (
            <div className="export-success bcn-0 flex column cn-9 h-100 lh-20">
                <Success className="icon-dim-32" />
                <span className="fs-14 fw-6 mt-8">Your export is ready</span>
                <span className="fs-13 fw-4"> If download does not start automatically,</span>
                <Button
                    text="click here to download manually."
                    onClick={initiateDownload}
                    dataTestId="manual-download"
                    variant={ButtonVariantType.text}
                    size={ComponentSizeType.medium}
                />
            </div>
        )
    }

    return (
        <div>
            <Button
                {...(showOnlyIcon
                    ? {
                          icon: <ExportIcon />,
                          ariaLabel: 'Export CSV',
                          showAriaLabelInTippy: false,
                      }
                    : {
                          text: 'Export CSV',
                          startIcon: <ExportIcon />,
                      })}
                onClick={handleExportToCsvClick}
                size={ComponentSizeType.medium}
                variant={ButtonVariantType.secondary}
                dataTestId="export-csv-button"
                disabled={disabled}
                showTooltip={disabled}
                tooltipProps={{
                    content: 'Nothing to export',
                }}
            />
            <CSVLink
                ref={csvRef}
                filename={`${fileName}_${moment().format(Moment12HourExportFormat)}.csv`}
                headers={CSV_HEADERS[fileName] || []}
                data={dataToExport || []}
            />
            {(showExportingModal || isConfigurationAvailable) && (
                <VisibleModal className="export-to-csv-modal" data-testid="export-to-csv-modal">
                    <div className="modal__body mt-40 p-0">
                        <h2 className="cn-9 fw-6 fs-16 m-0 dc__border-bottom px-20 py-12">Export to CSV</h2>
                        <div
                            className={`py-16 flex ${isConfigurationAvailable ? 'top left dc__overflow-auto mxh-350 px-12' : 'px-20'}`}
                        >
                            {renderExportStatus()}
                        </div>
                        <div className="flex right dc__gap-12 dc__border-top py-16 px-20">{renderModalCTA()}</div>
                    </div>
                </VisibleModal>
            )}
        </div>
    )
}

export default ExportToCsv
