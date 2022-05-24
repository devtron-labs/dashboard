import React, { useRef, useState } from 'react'
import { showError, VisibleModal } from '../common'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'
import { uploadChart, validateChart } from './customChart.service'
import errorImage from '../../assets/img/ic_upload_chart_error.png'
import uploadImage from '../../assets/img/ic-empty-custom-charts.png'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'

const UPLOAD_STATE = {
    UPLOAD: 'Upload',
    VALIDATE: 'Validate',
    ERROR: 'Error',
    SUCCESS: 'Success',
}

interface UploadChartModalType {
    closeUploadPopup: () => void
}

export default function UploadChartModal({ closeUploadPopup: closeUploadPopup }: UploadChartModalType) {
    const inputFileRef = useRef(null)
    const [chartDetail, setChartDetail] =
        useState<{ chartName: string; description: string; fileId: number; message: string; version: number }>()
    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)
    const [errorData, setErrorData] = useState<{ title: string; message: string }>({
        title: 'Unsupported chart template',
        message: '',
    })

    const onFileChange = (e) => {
        /*Selected files data can be collected here.*/
        //setSelectedChart(e.target.files)
        let formData = new FormData()
        formData.append('BinaryFile', e.target.files[0])
        validateChart(formData)
            .then((response) => {
                setChartDetail(response.result)
                setUploadState(UPLOAD_STATE.SUCCESS)
            })
            .catch((error) => {
                setUploadState(UPLOAD_STATE.ERROR)
                setErrorData({ title: 'Unsupported chart template', message: error.errors[0].userMessage })
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
        const chartData = { ...chartDetail }
        chartData['action'] = actionType
        if (!chartData.fileId) {
            closeUploadPopup()
            return
        }
        uploadChart(chartData)
            .then((response) => {
                closeUploadPopup()
            })
            .catch((error) => {
                showError(error)
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
                                The version ({chartDetail.version || 'xx.xx'}) you’re uploading will be added to the
                                existing chart.
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
                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-8 pb-8 mt-6"
                            disabled
                            value={chartDetail.chartName}
                        />
                    </div>
                    <div className="mt-16">
                        <span className="fs-13 fw-4 cn-7">Description</span>
                        <textarea
                            cols={3}
                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-8 pb-8 mt-6"
                            value={chartDetail.description}
                            onChange={handleDescriptionChange}
                        ></textarea>
                    </div>
                </div>
            </>
        )
    }

    const renderErrorPage = () => {
        return (
            <div className="flex column" style={{ width: '100%', height: '310px' }}>
                <img src={errorImage} alt="Error image" style={{ height: '100px' }} />
                <h4 className="fw-6 fs-16">{errorData.title}</h4>
                <p className="fs-13 fw-4">{errorData.message}</p>
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
        } else {
            return renderErrorPage()
        }
    }

    const renderFooter = () => {
        return (
            <div
                className={`footer pt-15 border-top flexbox ${
                    uploadState === UPLOAD_STATE.UPLOAD ? 'content-end' : 'content-space'
                }`}
            >
                {uploadState !== UPLOAD_STATE.UPLOAD && (
                    <button className="cta delete ml-20 no-text-transform" onClick={(e) => onCancelUpload('Cancel')}>
                        Cancel upload
                    </button>
                )}
                <button className="cta mr-20 no-text-transform" onClick={handleSuccessButton}>
                    {uploadState === UPLOAD_STATE.UPLOAD
                        ? 'Select tar.gz file...'
                        : uploadState === UPLOAD_STATE.ERROR
                        ? 'Upload another chart'
                        : 'Save'}
                </button>
            </div>
        )
    }

    return (
        <VisibleModal className="transition-effect">
            <div className="modal__body upload-modal no-top-radius mt-0">
                <div className="flexbox content-space pl-20 pr-20">
                    <div className="fw-6 fs-16 cn-9">
                        {uploadState === UPLOAD_STATE.UPLOAD ? 'Using custom chart' : 'Upload chart'}
                    </div>
                    <CloseIcon className="pointer mt-2" onClick={closeUploadPopup} />
                </div>
                <hr />
                <div className="pl-20 pr-20" style={{ paddingBottom: '68px' }}>
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
