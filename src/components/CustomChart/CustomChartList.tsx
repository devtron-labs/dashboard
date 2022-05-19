import React, { useState } from 'react'
import { DOCUMENTATION } from '../../config'
import './customChart.scss'
import UploadChartModal from './UploadChartModal'
import emptyCustomChart from '../../assets/img/ic-empty-custom-charts.png'
import { ReactComponent as Upload } from '../../assets/icons/ic-arrow-line-up.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Folder } from '../../assets/icons/ic-folder.svg'

export default function CustomChartList() {
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')

    const openUploadPopup = () => {
        setShowUploadPopup(true)
    }

    const closeUploadPopup = () => {
        setShowUploadPopup(false)
    }

    const handleFilterChanges = (selected, key): void => {}

    const renderSubtitleAndUploadButton = (subtitleText: string, isShowSearch) => {
        return (
            <>
                <p className="subtitle">
                    {subtitleText}
                    <a className="no-decor" href={DOCUMENTATION.CUSTOM_CHART}>
                        Learn more
                    </a>
                </p>
                <div className="flexbox content-space">
                    <div
                        className="bcb-5 fw-6 fs-13 flexbox cn-0 en-2 br-4 pl-16 pr-16 pt-8 pb-8 pointer lh-16"
                        onClick={openUploadPopup}
                        style={{ width: 'max-content' }}
                    >
                        <Upload className="dim-20 mr-10" /> Upload Chart
                    </div>
                    {isShowSearch && (
                        <form
                            onSubmit={(e) => handleFilterChanges(e, 'search')}
                            className="search position-rel margin-right-0 en-2 bw-1 br-4"
                        >
                            <Search className="search__icon icon-dim-18" />
                            <input
                                type="text"
                                placeholder="Search charts"
                                value={searchText}
                                className="search__input bcn-0"
                                onChange={(event) => {
                                    setSearchText(event.target.value)
                                }}
                            />
                            {searchApplied ? (
                                <button
                                    className="search__clear-button"
                                    type="button"
                                    onClick={(e) => handleFilterChanges(e, 'clear')}
                                >
                                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                                </button>
                            ) : null}
                        </form>
                    )}
                </div>
            </>
        )
    }

    const renderEmptyState = () => {
        return (
            <>
                <div className="flex column" style={{ width: '100%', height: '100%' }}>
                    <img src={emptyCustomChart} alt="Empty custom chart" style={{ height: '132px' }} />
                    <h4 className="fw-6 fs-16">Use custom charts in applications</h4>
                    {renderSubtitleAndUploadButton(
                        'Import custom charts to use them in apps instead of the default system template.',
                        false,
                    )}
                </div>
            </>
        )
    }

    const renderChartList = () => {
        return (
            <div className="chart-list">
                <div className="cn-9 fw-6 fs-16">Custom charts</div>
                {renderSubtitleAndUploadButton('Manage custom charts to be used in Devtron applications.', true)}
                <div className="mt-16 en-2 bw-1 bcn-0 br-8" style={{ minHeight: 'calc(100vh - 220px)' }}>
                    <div className="chart-list-row fw-6 cn-7 fs-12 border-bottom pt-10 pb-10 pr-20 pl-20 text-uppercase">
                        <div>Name</div>
                        <div>Version</div>
                        <div>Description</div>
                    </div>
                    <div className="chart-list-row fw-4 cn-9 fs-13 border-bottom pt-14 pb-14 pr-20 pl-20">
                        <div className="flexbox">
                            <Folder className="folder-icon icon-dim-16 mt-2 mr-15" />
                            <span className="cb-5">Bitcoind</span>
                        </div>
                        <div>
                            12.3.6 <span className="cn-5">+23 more</span>
                        </div>
                        <div className="ellipsis-right">
                            Bitcoin uses peer-to-peer technology to operate with no central authority or banks; managing
                        </div>
                    </div>
                    <div className="chart-list-row fw-4 cn-9 fs-13 border-bottom pt-14 pb-14 pr-20 pl-20">
                        <div className="flexbox">
                            <Folder className="folder-icon icon-dim-16 mt-2 mr-15" />
                            <span className="cb-5">StatefulSet</span>
                        </div>
                        <div>
                            12.3.6 <span className="cn-5">+1 more</span>
                        </div>
                        <div className="ellipsis-right">
                            StatefulSet is an open source, Kubernetes-native microservices API gateway built on the
                            Envoy Proxy.
                        </div>
                    </div>
                    <div className="chart-list-row fw-4 cn-9 fs-13 border-bottom pt-14 pb-14 pr-20 pl-20">
                        <div className="flexbox">
                            <Folder className="folder-icon icon-dim-16 mt-2 mr-15" />
                            <span className="cb-5">BitcoinE</span>
                        </div>
                        <div>
                            21.0.1 <span className="cn-5">+7 more</span>
                        </div>
                        <div className="ellipsis-right"></div>
                    </div>
                    <div className="chart-list-row fw-4 cn-9 fs-13 border-bottom pt-14 pb-14 pr-20 pl-20">
                        <div className="flexbox">
                            <Folder className="folder-icon icon-dim-16 mt-2 mr-15" />
                            <span className="cb-5">BitcoinF</span>
                        </div>
                        <div>3.9.0</div>
                        <div className="ellipsis-right">
                            Bitcoin uses peer-to-peer technology to operate with no central authority or banks;
                            managing.
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {renderChartList()}
            {showUploadPopup && <UploadChartModal closeUploadPopup={closeUploadPopup}></UploadChartModal>}
        </>
    )
}
