import React, { useRef, useState } from 'react'
import { showError, VisibleModal } from '../common'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'
import { validateChart } from './customChart.service'
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
    const [chartDetail, setChartDetail] = useState<{ chartName: string; description: string; fileId: number }>()
    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)

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
                showError(error)
                setUploadState(UPLOAD_STATE.ERROR)
            })
    }

    const onUpload = () => {
        inputFileRef.current.click()
    }

    const onCancelUpload = () => {}

    const renderSuccessPage = () => {
        return (
            <>
                <div className="bcb-1 eb-2 p-10 br-4 flexbox cn-9 fs-13">
                    <Info className="mr-8 ml-4 icon-dim-20" />
                    <span className="lh-20">
                        <span className="inline-block fs-13 fw-6">New version detected for “StatefulSet”</span>
                        <span className="inline-block fs-13 fw-4">
                            The version (v1.4.6) you’re uploading will be added to the existing chart.
                        </span>
                    </span>
                </div>
                <div>
                    <div>
                        <span className="fs-13 fw-4 cn-7">
                            Chart Name <span className="cr-5"> *</span>
                        </span>
                        <input type="text" className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-8 pb-8 mt-6" disabled />
                    </div>
                    <div>
                        <span className="fs-13 fw-4 cn-7">Description</span>
                        <textarea cols={3} className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-8 pb-8 mt-6"></textarea>
                    </div>
                </div>
            </>
        )
    }

    const renderErrorPage = () => {
        return (
            <div className="flex column" style={{ width: '100%', height: '310px' }}>
                <img src={errorImage} alt="Error image" style={{ height: '100px' }} />
                <h4 className="fw-6 fs-16">Unsupported chart template</h4>
                <p className="fs-13 fw-4">{`{{Show error message received from BE here}}`}</p>
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
            <div className="footer pt-15 border-top flexbox content-space">
                {uploadState !== UPLOAD_STATE.UPLOAD && (
                    <button className="cta delete ml-20 no-text-transform" onClick={onCancelUpload}>
                        Cancel upload
                    </button>
                )}
                <button className="cta mr-20 no-text-transform" onClick={onUpload}>
                    Select tar.gz file...
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
                    accept=".gz"
                    style={{ display: 'none' }}
                />
            </div>
        </VisibleModal>
    )
}
