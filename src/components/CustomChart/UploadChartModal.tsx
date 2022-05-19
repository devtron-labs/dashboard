import React from 'react'
import { VisibleModal } from '../common'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'

interface UploadChartModalType {
    closeUploadPopup: () => void
}

export default function UploadChartModal({ closeUploadPopup: closeUploadPopup }: UploadChartModalType) {
    return (
        <VisibleModal className="transition-effect">
            <div className="modal__body upload-modal">
                <div className="flexbox content-space">
                    <div className="fw-6 fs-16 cn-9">Using custom chart</div>
                    <CloseIcon className="pointer mt-2" onClick={closeUploadPopup} />
                </div>
                <hr />
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
                <div className="footer border-top">
                    <button className="cta align-right flex">Select tar.gz file...</button>
                </div>
            </div>
        </VisibleModal>
    )
}
