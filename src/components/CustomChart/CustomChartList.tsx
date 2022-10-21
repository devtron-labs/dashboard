import React, { useState, useEffect } from 'react'
import { DOCUMENTATION } from '../../config'
import './customChart.scss'
import UploadChartModal from './UploadChartModal'
import emptyCustomChart from '../../assets/img/ic-empty-custom-charts.png'
import { ReactComponent as Upload } from '../../assets/icons/ic-arrow-line-up.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getChartList } from './customChart.service'
import { ErrorScreenManager, Progressing, showError, sortObjectArrayAlphabetically } from '../common'
import { ChartDetailType, ChartListResponse } from './types'
import EmptyState from '../EmptyState/EmptyState'

export default function CustomChartList() {
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [loader, setLoader] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [chartList, setChartList] = useState([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)

    useEffect(() => {
        getData()
    }, [])

    const getData = (): void => {
        setLoader(true)
        getChartList()
            .then((response: ChartListResponse) => {
                if (response.result) {
                    setChartList(processChartData(response.result))
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error,true,true)
                setErrorStatusCode(error.code)
                setLoader(false)
            })
    }

    const processChartData = (data: ChartDetailType[]): ChartDetailType[] => {
        let resultData = []
        const uniqueChartList = new Map()
        data.forEach((element) => {
            const chartDetail = uniqueChartList.get(element.name)
            if (chartDetail) {
                chartDetail.count++
                if (chartDetail.version < element.version) {
                    chartDetail.version = element.version
                    chartDetail.chartDescription = element.chartDescription
                }
            } else {
                uniqueChartList.set(element.name, { ...element, count: 0 })
            }
        })
        uniqueChartList.forEach((element) => {
            resultData.push(element)
        })
        resultData = sortObjectArrayAlphabetically(resultData, 'name')
        return resultData
    }

    const openUploadPopup = (): void => {
        setShowUploadPopup(true)
    }

    const closeUploadPopup = (isReloadChartList: boolean): void => {
        setShowUploadPopup(false)
        isReloadChartList && getData()
    }

    const handleFilterChanges = (selected, key): void => {}

    const renderUploadButton = (): JSX.Element => {
        return (
            <button onClick={openUploadPopup} className="add-link cta flex">
                <Upload className="icon-dim-16 mr-8" />
                Upload Chart
            </button>
        )
    }

    const renderLearnMoreLink = (): JSX.Element => {
        return (
            <a className="dc__no-decor" href={DOCUMENTATION.CUSTOM_CHART} target="_blank" rel="noreferrer noopener">
                Learn more
            </a>
        )
    }

    const renderSubtitleAndUploadButton = (subtitleText: string): JSX.Element => {
        return (
            <>
                <p className="fs-13 fw-4">
                    {subtitleText}&nbsp;
                    {renderLearnMoreLink()}
                </p>
                <div className="flexbox dc__content-space">
                    {renderUploadButton()}
                    {false && (
                        <form
                            onSubmit={(e) => handleFilterChanges(e, 'search')}
                            className="search dc__position-rel margin-right-0 en-2 bw-1 br-4"
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
                                    <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                                </button>
                            ) : null}
                        </form>
                    )}
                </div>
            </>
        )
    }

    const renderEmptyState = (): JSX.Element => {
        return (
            <EmptyState>
                <EmptyState.Image>
                    <img src={emptyCustomChart} alt="Empty external links" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4 className="title">Use custom charts in applications</h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>
                    Import custom charts to use them in apps instead of the default system template.&nbsp;
                    {renderLearnMoreLink()}
                </EmptyState.Subtitle>
                <EmptyState.Button>{renderUploadButton()}</EmptyState.Button>
            </EmptyState>
        )
    }

    const renderChartList = (): JSX.Element => {
        return (
            <div className="chart-list">
                <div className="cn-9 fw-6 fs-16">Custom charts</div>
                {renderSubtitleAndUploadButton('Manage custom charts to be used in Devtron applications.')}
                <div className="mt-16 en-2 bw-1 bcn-0 br-8" style={{ minHeight: 'calc(100vh - 235px)' }}>
                    <div className="chart-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-10 pb-10 pr-20 pl-20 dc__uppercase">
                        <div>Name</div>
                        <div>Version</div>
                        <div>Description</div>
                    </div>
                    {chartList?.map((chartData) => (
                        <div className="chart-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-14 pb-14 pr-20 pl-20">
                            <div className="flexbox">
                                <span className="cn-9 dc__ellipsis-right">{chartData.name}</span>
                            </div>
                            <div>
                                {chartData.version}
                                <span className="cn-5 ml-8">
                                    {chartData.count > 0 ? `+${chartData.count} more` : ''}
                                </span>
                            </div>
                            <div className="dc__ellipsis-right">{chartData.chartDescription}</div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    if (loader) {
        return <Progressing pageLoader />
    }
    if (errorStatusCode > 0) {
        return (
            <div className="error-screen-wrapper flex column h-100">
                <ErrorScreenManager
                    code={errorStatusCode}
                    subtitle="Information on this page is available only to superadmin users."
                />
            </div>
        )
    }
    return (
        <>
            {chartList.length === 0 ? renderEmptyState() : renderChartList()}
            {showUploadPopup && <UploadChartModal closeUploadPopup={closeUploadPopup}></UploadChartModal>}
        </>
    )
}
