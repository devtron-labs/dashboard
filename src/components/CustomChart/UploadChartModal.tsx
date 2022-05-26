import React, { useRef, useState } from 'react'
import { ButtonWithLoader, showError, VisibleModal } from '../common'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'
import { uploadChart, validateChart } from './customChart.service'
import errorImage from '../../assets/img/ic_upload_chart_error.png'
import uploadingImage from '../../assets/gif/uploading.gif'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { toast } from 'react-toastify'

const UPLOAD_STATE = {
    UPLOAD: 'Upload',
    UPLOADING: 'Uploading',
    ERROR: 'Error',
    SUCCESS: 'Success',
}

interface UploadChartModalType {
    closeUploadPopup: () => void
}

export default function UploadChartModal({ closeUploadPopup: closeUploadPopup }: UploadChartModalType) {
    const inputFileRef = useRef(null)
    const [chartDetail, setChartDetail] =
        useState<{ chartName: string; description: string; fileId: number; message: string; chartVersion: number }>()
    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)
    const [errorData, setErrorData] = useState<{ title: string; message: string[] }>({ title: '', message: [] })
    const [loadingData, setLoadingData] = useState(false)

    const onFileChange = (e) => {
        setUploadState(UPLOAD_STATE.UPLOADING)
        let formData = new FormData()
        formData.append('BinaryFile', e.target.files[0])
        validateChart(formData)
            .then((response) => {
                setChartDetail(response.result)
                setUploadState(UPLOAD_STATE.SUCCESS)
            })
            .catch((error) => {
                setUploadState(UPLOAD_STATE.ERROR)
                if (error.errors[0].code === '5001') {
                    setErrorData({ title: error.errors[0].userMessage, message: ['Try uploading another chart'] })
                } else {
                    setErrorData({
                        title: 'Unsupported chart template',
                        message: error.errors[0].userMessage.split('; '),
                    })
                }
            })
    }

    const handleSuccessButton = () => {
        if (uploadState === UPLOAD_STATE.SUCCESS) {
            onCancelUpload('Save')
        } else if (uploadState === UPLOAD_STATE.UPLOAD) {
            inputFileRef.current.click()
        } else {
            return resetCustomChart()
        }
    }

    const resetCustomChart = () => {
        setChartDetail(null)
        setUploadState(UPLOAD_STATE.UPLOAD)
    }

    const handleDescriptionChange = (e) => {
        const chartData = { ...chartDetail }
        chartData.description = e.target.value
        setChartDetail(chartData)
    }

    const onCancelUpload = (actionType: string) => {
        if (actionType === 'Save') {
            setLoadingData(true)
        }
        const chartData = { ...chartDetail }
        chartData['action'] = actionType
        if (!chartData.fileId) {
            closeUploadPopup()
            return
        }
        uploadChart(chartData)
            .then((response) => {
                if (actionType === 'Save') {
                    toast.success('Chart saved')
                }
                closeUploadPopup()
            })
            .catch((error) => {
                showError(error)
                setLoadingData(false)
            })
    }

    const renderSuccessPage = () => {
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

    const renderErrorPage = () => {
        return (
            <div className="flex column" style={{ width: '100%', height: '310px' }}>
                <img src={errorImage} alt="Error image" style={{ height: '100px' }} className="mb-10" />
                <h4 className="fw-6 fs-16">{errorData.title}</h4>
                {errorData.message.map((error) => (
                    <p className="fs-13 fw-4 m-0">{error}</p>
                ))}
            </div>
        )
    }

    const renderPreRequisitePage = () => {
        return (
            <>
                <div className="cn-9 fw-6 fs-14">
                    Pre-requisites to upload and use a custom chart View documentation
                </div>
                <div className="cn-7 fw-4 fs-14">
                    Use these variables in your custom chart to enable Devtron to populate required values{' '}
                </div>
                <div className="prerequisite-table en-2 bw-1 mt-20">
                    <div className="p-5 border-bottom border-right">Variable</div>
                    <div className="p-5 border-bottom">Description</div>
                    <div className="p-5 border-bottom border-right">
                        {'{{ $.Values.server.deployment.image }}:{{ $.Values.server.deployment.image_tag }}'}
                    </div>
                    <div className="p-5 border-bottom">Inserts container image</div>
                    <div className="p-5 border-bottom border-right">{'{{.App}}'}</div>
                    <div className="p-5 border-bottom">Inserts app label</div>
                    <div className="p-5 border-right">{'{{.Env}}'}</div>
                    <div className="p-5">Inserts environment label</div>
                </div>
            </>
        )
    }

    const renderPageContent = () => {
        if (uploadState === UPLOAD_STATE.SUCCESS) {
            return renderSuccessPage()
        } else if (uploadState === UPLOAD_STATE.UPLOAD) {
            return renderPreRequisitePage()
        } else if (uploadState === UPLOAD_STATE.UPLOADING) {
            return (
                <div className="flex column" style={{ width: '100%', height: '310px' }}>
                    <img src={uploadingImage} alt="Uploading image" style={{ height: '100px' }} />
                </div>
            )
        } else {
            return renderErrorPage()
        }
    }

    const renderFooter = () => {
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
                    <CloseIcon className="pointer mt-2" onClick={closeUploadPopup} />
                </div>
                <div className="pl-20 pr-20 pt-16" style={{ paddingBottom: '89px' }}>
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
