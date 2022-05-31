import React, { useRef, useState } from 'react'
import { ButtonWithLoader, showError, VisibleModal } from '../common'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'
import { uploadChart, validateChart } from './customChart.service'
import errorImage from '../../assets/img/ic_upload_chart_error.png'
import uploadingImage from '../../assets/gif/uploading.gif'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { toast } from 'react-toastify'
import { DOCUMENTATION } from '../../config'
import { ChartUploadResponse, ChartUploadType, UploadChartModalType, UPLOAD_STATE } from './types'

export default function UploadChartModal({ closeUploadPopup }: UploadChartModalType) {
    const inputFileRef = useRef(null)
    const [chartDetail, setChartDetail] = useState<ChartUploadType>()
    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)
    const [errorData, setErrorData] = useState<{ title: string; message: string[] }>({ title: '', message: [] })
    const [loadingData, setLoadingData] = useState(false)

    const onFileChange = (e): void => {
        setUploadState(UPLOAD_STATE.UPLOADING)
        let formData = new FormData()
        formData.append('BinaryFile', e.target.files[0])
        validateChart(formData)
            .then((response: ChartUploadResponse) => {
                setChartDetail(response.result)
                setUploadState(UPLOAD_STATE.SUCCESS)
            })
            .catch((error) => {
                setUploadState(UPLOAD_STATE.ERROR)
                if (Array.isArray(error.errors)) {
                    if (error.errors[0].code === '5001') {
                        setErrorData({ title: error.errors[0].userMessage, message: ['Try uploading another chart'] })
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

    const handleSuccessButton = (): void => {
        if (uploadState === UPLOAD_STATE.SUCCESS) {
            onCancelUpload('Save')
        } else if (uploadState === UPLOAD_STATE.UPLOAD) {
            inputFileRef.current.value = null //to upload the same chart
            inputFileRef.current.click()
        } else {
            resetCustomChart()
        }
    }

    const resetCustomChart = (): void => {
        setChartDetail(null)
        setUploadState(UPLOAD_STATE.UPLOAD)
    }

    const handleDescriptionChange = (e): void => {
        const chartData = { ...chartDetail }
        chartData.description = e.target.value
        setChartDetail(chartData)
    }

    const onCancelUpload = (actionType: string): void => {
        if (actionType === 'Save') {
            setLoadingData(true)
        }
        const chartData = { ...chartDetail }
        chartData['action'] = actionType
        if (!chartData.fileId) {
            closeUploadPopup(false)
            return
        }
        uploadChart(chartData)
            .then((response: ChartUploadResponse) => {
                if (actionType === 'Save') {
                    toast.success('Chart saved')
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

    const renderSuccessPage = (): JSX.Element => {
        return (
            <>
                {chartDetail.message && (
                    <div className="bcb-1 eb-2 p-10 br-4 flexbox cn-9 fs-13 mb-20">
                        <Info className="mr-8 ml-4 icon-dim-20" />
                        <span className="lh-20">
                            <span className="inline-block fs-13 fw-6">{chartDetail.message}</span>
                            <span className="inline-block fs-13 fw-4">
                                The version ({chartDetail.chartVersion}) you’re uploading will be added to the existing
                                chart.
                            </span>
                        </span>
                    </div>
                )}
                <div>
                    <div>
                        <span className="fs-13 fw-4 cn-7">
                            Chart Name <span className="cr-5"> *</span>
                        </span>
                        <input
                            type="text"
                            className="w-100 br-4 en-2 bw-1 mt-6 form__input"
                            disabled
                            value={chartDetail.chartName}
                        />
                    </div>
                    <div className="mt-16">
                        <span className="fs-13 fw-4 cn-7">Description</span>
                        <textarea
                            cols={3}
                            className="w-100 br-4 en-2 bw-1 mt-6 form__input"
                            value={chartDetail.description}
                            onChange={handleDescriptionChange}
                            disabled={loadingData}
                        ></textarea>
                    </div>
                </div>
            </>
        )
    }

    const renderImageWithTitleDescription = (imgSrc: string, title: string, descriptionList: string[]): JSX.Element => {
        return (
            <div className="flex column" style={{ width: '100%', height: '310px' }}>
                <img src={imgSrc} alt="image" style={{ height: '100px' }} className="mb-10" />
                <h4 className="fw-6 fs-16">{title}</h4>
                {descriptionList.map((description) => (
                    <p className="fs-13 fw-4 m-0">{description}</p>
                ))}
            </div>
        )
    }

    const renderPreRequisitePage = (): JSX.Element => {
        return (
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
                            className="learn-more__href fw-6"
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
    }

    const renderPageContent = (): JSX.Element => {
        if (uploadState === UPLOAD_STATE.SUCCESS) {
            return renderSuccessPage()
        } else if (uploadState === UPLOAD_STATE.UPLOAD) {
            return renderPreRequisitePage()
        } else if (uploadState === UPLOAD_STATE.UPLOADING) {
            return renderImageWithTitleDescription(uploadingImage, 'Uploading chart...', [
                'Hold tight! We’re uploading your chart.',
            ])
        } else {
            return renderImageWithTitleDescription(errorImage, errorData.title, errorData.message)
        }
    }

    const renderFooter = (): JSX.Element => {
        return (
            <div
                className={`footer pt-16 pb-16 border-top flexbox ${
                    uploadState === UPLOAD_STATE.UPLOAD || uploadState === UPLOAD_STATE.UPLOADING
                        ? 'content-end'
                        : 'content-space'
                }`}
            >
                {uploadState !== UPLOAD_STATE.UPLOAD && (
                    <button
                        className={`cta delete no-text-transform ${
                            uploadState === UPLOAD_STATE.UPLOADING ? '  mr-20' : '  ml-20'
                        }`}
                        onClick={(e) => onCancelUpload('Cancel')}
                    >
                        Cancel upload
                    </button>
                )}
                {uploadState !== UPLOAD_STATE.UPLOADING && (
                    <ButtonWithLoader
                        rootClassName="cta mr-20 no-text-transform"
                        loaderColor="white"
                        onClick={handleSuccessButton}
                        isLoading={loadingData}
                    >
                        {uploadState === UPLOAD_STATE.UPLOAD
                            ? 'Select .tgz file...'
                            : uploadState === UPLOAD_STATE.ERROR
                            ? 'Upload another chart'
                            : 'Save'}
                    </ButtonWithLoader>
                )}
            </div>
        )
    }

    return (
        <VisibleModal className="transition-effect">
            <div className="modal__body upload-modal no-top-radius mt-0">
                <div className="flexbox content-space pl-20 pr-20 pt-16 pb-16 border-bottom">
                    <div className="fw-6 fs-16 cn-9">
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
