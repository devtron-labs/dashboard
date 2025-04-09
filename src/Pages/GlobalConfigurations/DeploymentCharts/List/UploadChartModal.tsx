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

import { useRef, useState } from 'react'

import {
    ButtonWithLoader,
    CustomInput,
    noop,
    showError,
    Textarea,
    ToastManager,
    ToastVariantType,
    VisibleModal,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as CloseIcon } from '@Icons/ic-close.svg'
import { ReactComponent as Info } from '@Icons/ic-info-filled.svg'
import errorImage from '@Images/ic_upload_chart_error.png'
import { DOCUMENTATION, SERVER_ERROR_CODES } from '@Config/constants'

import uploadingImage from '../../../../assets/gif/uploading.gif'
import { ChartUploadResponse, ChartUploadType, UPLOAD_STATE, UploadChartModalType } from '../types'
import { uploadChart, validateChart } from './service'

const UploadChartModal = ({ closeUploadPopup }: UploadChartModalType) => {
    const inputFileRef = useRef(null)
    const [chartDetail, setChartDetail] = useState<ChartUploadType>()
    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)
    const [errorData, setErrorData] = useState<{ title: string; message: string[] }>({ title: '', message: [] })
    const [loadingData, setLoadingData] = useState(false)
    const [isDescriptionLengthError, setDescriptionLengthError] = useState(false)

    const onFileChange = (e): void => {
        setUploadState(UPLOAD_STATE.UPLOADING)
        const formData = new FormData()
        formData.append('BinaryFile', e.target.files[0])
        validateChart(formData)
            .then((response: ChartUploadResponse) => {
                setChartDetail(response.result)
                setDescriptionLengthError(response.result.description?.length > 250)
                setUploadState(UPLOAD_STATE.SUCCESS)
            })
            .catch((error) => {
                setUploadState(UPLOAD_STATE.ERROR)
                if (Array.isArray(error.errors)) {
                    if (error.errors[0].code === SERVER_ERROR_CODES.CHART_ALREADY_EXISTS) {
                        setErrorData({
                            title: error.errors[0]?.userMessage || '',
                            message: ['Try uploading another chart'],
                        })
                    } else if (error.errors[0].code === SERVER_ERROR_CODES.CHART_NAME_RESERVED) {
                        setErrorData({
                            title: error.errors[0]?.userMessage || '',
                            message: [error.errors[0]?.internalMessage || ''],
                        })
                    } else {
                        setErrorData({
                            title: 'Unsupported chart template',
                            message: error.errors[0].userMessage.split('; '),
                        })
                    }
                } else {
                    showError(error)
                }
            })
    }

    const resetCustomChart = (): void => {
        setChartDetail(null)
        setUploadState(UPLOAD_STATE.UPLOAD)
    }

    const handleDescriptionChange = (e): void => {
        const chartData = { ...chartDetail }
        chartData.description = e.target.value
        if (chartDetail.description.length > 250) {
            setDescriptionLengthError(true)
        } else {
            setDescriptionLengthError(false)
        }
        setChartDetail(chartData)
    }

    const onCancelUpload = (actionType: string): void => {
        if (actionType === 'Save') {
            if (isDescriptionLengthError || chartDetail.description.length > 250) {
                setDescriptionLengthError(true)
                return
            }
            setLoadingData(true)
        }
        const chartData = { ...chartDetail }
        chartData.action = actionType
        if (!chartData.fileId) {
            closeUploadPopup(false)
            return
        }
        uploadChart(chartData)
            .then(() => {
                if (actionType === 'Save') {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Chart saved',
                    })
                    closeUploadPopup(true)
                } else {
                    closeUploadPopup(false)
                }
            })
            .catch((error) => {
                showError(error)
                setLoadingData(false)
            })
    }

    const handleSuccessButton = (): void => {
        if (uploadState === UPLOAD_STATE.SUCCESS) {
            onCancelUpload('Save')
        } else if (uploadState === UPLOAD_STATE.UPLOAD) {
            inputFileRef.current.value = null // to upload the same chart
            inputFileRef.current.click()
        } else {
            resetCustomChart()
        }
    }

    const renderSuccessPage = (): JSX.Element => (
        <>
            {chartDetail.message && (
                <div className="bcb-1 eb-2 p-10 br-4 flexbox cn-9 fs-13 mb-20">
                    <Info className="mr-8 ml-4 icon-dim-20" />
                    <span className="lh-20">
                        <span className="dc__inline-block fs-13 fw-6">{chartDetail.message}</span>
                        <span className="dc__inline-block fs-13 fw-4">
                            The version ({chartDetail.chartVersion}) you’re uploading will be added to the existing
                            chart.
                        </span>
                    </span>
                </div>
            )}
            <div>
                <CustomInput
                    placeholder="Enter chart name"
                    label="Chart Name"
                    name="chartName"
                    onChange={noop}
                    fullWidth
                    disabled
                    value={chartDetail.chartName}
                    required
                />
                <div className="mt-16">
                    <Textarea
                        placeholder="Enter description"
                        name="upload-chart-description"
                        label="Description"
                        value={chartDetail.description}
                        onChange={handleDescriptionChange}
                        disabled={loadingData}
                        error={isDescriptionLengthError ? 'Maximum 250 characters allowed' : null}
                    />
                </div>
            </div>
        </>
    )

    const renderImageWithTitleDescription = (imgSrc: string, title: string, descriptionList: string[]): JSX.Element => (
        <div className="flex column" style={{ width: '100%', height: '310px' }}>
            <img src={imgSrc} alt={title} style={{ height: '100px' }} className="mb-10" />
            <h4 className="fw-6 fs-16 text-center">{title}</h4>
            {descriptionList.map((description) => (
                <p className="fs-13 fw-4 m-0">{description}</p>
            ))}
        </div>
    )

    const renderPreRequisitePage = (): JSX.Element => (
        <>
            <div className="cn-9 fw-6 fs-14 mb-8">Pre-requisites to upload a custom chart</div>
            <div className="cn-7 fw-4 fs-14 cn-7">
                1. A valid helm chart, which contains Chart.yaml file with name and version fields.
            </div>
            <div className="cn-7 fw-4 fs-14 cn-7">
                2. Image descriptor template file - .image_descriptor_template.json.
            </div>
            <div className="cn-7 fw-4 fs-14 cn-7 mb-20">3. Custom chart packaged in the *.tgz format.</div>
            <div className="sidebar-action-container pr-20">
                <div className="fw-6 fs-13 cn-9 mb-8">
                    📙 Need help?&nbsp;
                    <a
                        className="dc__link fw-6"
                        href={DOCUMENTATION.CUSTOM_CHART_PRE_REQUISITES}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        View documentation
                    </a>
                </div>
            </div>
        </>
    )

    const renderPageContent = (): JSX.Element => {
        if (uploadState === UPLOAD_STATE.SUCCESS) {
            return renderSuccessPage()
        }
        if (uploadState === UPLOAD_STATE.UPLOAD) {
            return renderPreRequisitePage()
        }
        if (uploadState === UPLOAD_STATE.UPLOADING) {
            return renderImageWithTitleDescription(uploadingImage, 'Uploading chart...', [
                'Hold tight! We’re uploading your chart.',
            ])
        }
        return renderImageWithTitleDescription(errorImage, errorData.title, errorData.message)
    }

    const getButtonDataTestId = () => {
        switch (uploadState) {
            case UPLOAD_STATE.UPLOAD:
                return 'select-tgz-file-button'
            case UPLOAD_STATE.ERROR:
                return 'upload-another-chart'
            case UPLOAD_STATE.SUCCESS:
                return 'save-chart'
            default:
                return ''
        }
    }

    const getButtonText = () => {
        switch (uploadState) {
            case UPLOAD_STATE.UPLOAD:
                return 'Select .tgz file...'
            case UPLOAD_STATE.ERROR:
                return 'Upload another chart'
            default:
                return 'Save'
        }
    }

    const renderFooter = (): JSX.Element => (
        <div
            className={`footer pt-16 pb-16 dc__border-top flexbox ${
                uploadState === UPLOAD_STATE.UPLOAD || uploadState === UPLOAD_STATE.UPLOADING
                    ? 'dc__content-end'
                    : 'dc__content-space'
            }`}
        >
            {uploadState !== UPLOAD_STATE.UPLOAD && (
                <button
                    type="button"
                    data-testid="cancel-upload-button"
                    className={`cta delete dc__no-text-transform ${
                        uploadState === UPLOAD_STATE.UPLOADING ? '  mr-20' : '  ml-20'
                    }`}
                    onClick={() => onCancelUpload('Cancel')}
                >
                    Cancel upload
                </button>
            )}
            {uploadState !== UPLOAD_STATE.UPLOADING && (
                <ButtonWithLoader
                    dataTestId={getButtonDataTestId()}
                    rootClassName="cta mr-20 dc__no-text-transform"
                    onClick={handleSuccessButton}
                    isLoading={loadingData}
                >
                    {getButtonText()}
                </ButtonWithLoader>
            )}
        </div>
    )
    return (
        <VisibleModal className="transition-effect">
            <div className="modal__body upload-modal dc__no-top-radius mt-0">
                <div className="flexbox dc__content-space pl-20 pr-20 pt-16 pb-16 dc__border-bottom">
                    <div className="fw-6 fs-16 cn-9" data-testid="using-custom-chart-heading">
                        {uploadState === UPLOAD_STATE.UPLOAD ? 'Using custom chart' : 'Upload chart'}
                    </div>
                    <CloseIcon className="pointer mt-2" onClick={() => closeUploadPopup(false)} />
                </div>
                <div className="p-20" style={{ paddingBottom: '93px' }}>
                    {renderPageContent()}
                </div>
                {renderFooter()}
                <input
                    type="file"
                    ref={inputFileRef}
                    onChange={onFileChange}
                    accept=".tgz"
                    style={{ display: 'none' }}
                />
            </div>
        </VisibleModal>
    )
}

export default UploadChartModal
