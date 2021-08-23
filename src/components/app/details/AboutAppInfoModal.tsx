import React from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import moment from 'moment'
import { Moment12HourFormat } from '../../../config';


export default function AboutAppInfoModal({onClose, appMetaResult}) {
    return (
        <div>
             <div className="modal__header">
                                <div className="fs-20 cn-9 fw-6">About</div>
                                <button className="transparent" onClick={() => onClose(false)}>
                                    <Close className="icon-dim-24 cursor" />
                                </button>
                            </div>
                            <div className="pt-12">
                                <div className="cn-6 fs-12 mb-2">App name</div>
                                <div className="cn-9 fs-14 mb-16">{appMetaResult?.appName}</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Created on</div>
                                <div className="cn-9 fs-14 mb-16">{moment(appMetaResult?.createdOn).format(Moment12HourFormat)}</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Created by</div>
                                <div className="cn-9 fs-14 mb-16">{appMetaResult?.createdBy}</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Project</div>
                                <div className="cn-9 fs-14 mb-16">{appMetaResult?.projectName}</div>
                            </div>
        </div>
    )
}
