import React, { useState } from 'react'
import { DOCUMENTATION } from '../../config'
import './customChart.scss'
import UploadChartModal from './UploadChartModal'
import emptyCustomChart from '../../assets/img/ic-empty-custom-charts.png'
import { ReactComponent as Upload } from '../../assets/icons/ic-arrow-line-up.svg'

export default function CustomChartList() {
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const openUploadPopup = () => {
        setShowUploadPopup(true)
    }
    const closeUploadPopup = () => {
        setShowUploadPopup(false)
    }
    return (
        <>
            <div className="flex column empty-state" style={{ width: '100%', height: '100%' }}>
                <img src={emptyCustomChart} alt="Empty custom chart" />
                <h4 className="fw-6 fs-16">Use custom charts in applications</h4>
                <p className="subtitle">
                    Import custom charts to use them in apps instead of the default system template.{' '}
                    <a className="no-decor" href={DOCUMENTATION.CUSTOM_CHART}>
                        Learn more
                    </a>
                </p>
                <div
                    className="cb-5 fw-6 fs-13 flexbox bcn-0 en-2 br-4 pl-16 pr-16 pt-8 pb-8 pointer"
                    onClick={openUploadPopup}
                >
                    <Upload className="dim-20" /> Import chart
                </div>
            </div>
            {showUploadPopup && <UploadChartModal closeUploadPopup={closeUploadPopup}></UploadChartModal>}
        </>
    )
}
