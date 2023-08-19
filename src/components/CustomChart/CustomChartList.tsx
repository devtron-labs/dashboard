import React, { useState, useEffect } from 'react'
import { CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT, DOCUMENTATION } from '../../config'
import './customChart.scss'
import UploadChartModal from './UploadChartModal'
import emptyCustomChart from '../../assets/img/ic-empty-custom-charts.png'
import { ReactComponent as Upload } from '../../assets/icons/ic-upload.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Download } from '../../assets/icons/ic-arrow-line-down-n6.svg'

import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import { getChartList } from './customChart.service'
import { sortObjectArrayAlphabetically } from '../common'
import { showError, Progressing, ErrorScreenManager, GenericEmptyState, TippyCustomized, TippyTheme, InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { ChartDetailType, ChartListResponse } from './types'
import Tippy from '@tippyjs/react'
import { EMPTY_STATE_STATUS } from '../../config/constantMessaging'

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
                showError(error, true, true)
                setErrorStatusCode(error.code)
                setLoader(false)
            })
    }
    console.log(chartList)
    const processChartData = (data: ChartDetailType[]): ChartDetailType[] => {
        let resultData = []
        const uniqueChartList = new Map<string, ChartDetailType>()
        data.forEach((element) => {
            const chartDetail = uniqueChartList.get(element.name)
            if (chartDetail) {
                chartDetail.count++
                chartDetail.versions.push({ id: element.id, version: element.version })
                if (chartDetail.version < element.version) {
                    chartDetail.version = element.version
                    chartDetail.chartDescription = element.chartDescription
                }
            } else {
                uniqueChartList.set(element.name, {
                    ...element,
                    count: 0,
                    versions: [{ id: element.id, version: element.version }],
                })
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
            <button onClick={openUploadPopup} className="cta h-32 flex">
                <Upload className="icon-dim-14 dc__no-svg-fill mr-8"  data-testid="upload-custom-chart-button"/>
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
                {renderSubtitleAndUploadButton('Manage custom charts to be used in Devtron applications.')}
            </>
        )
    }

    const renderEmptyState = (): JSX.Element => {
        return (
            <GenericEmptyState
                image={emptyCustomChart}
                title={EMPTY_STATE_STATUS.CUSTOM_CHART_LIST.TITLE}
                subTitle={
                    <>
                        Import custom charts to use them in apps instead of the default system template.
                        <div>
                            {renderLearnMoreLink()}
                        </div>
                        
                    </>    
                }
                isButtonAvailable={true}
                renderButton={renderUploadButton}
            />
        )
    }

    const additionalRegistryTitleTippyContent = () => {
        return <p className="p-12 fs-13 fw-4 lh-20">{CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.additionalParagraphText}</p>
    }
    const customChartInfoBarMessage = () : JSX.Element => {
        return (
            <>
                <span className="fs-13 fw-6 lh-20">How to use?</span>
                <span className="fs-13 fw-4 lh-20 ml-4 mr-4">
                    Uploaded charts can be used in Deployment template to deploy custom applications created in Devtron.
                </span>
                {renderLearnMoreLink()}
            </>
        )
    }
    const renderChartList = (): JSX.Element => {
        return (
            <div className="chart-list">
                <div className="flexbox dc__content-space cn-9 fw-6 fs-16 mb-20">
                    <div className="flex left">
                        {CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.heading}
                        <TippyCustomized
                            theme={TippyTheme.white}
                            className="w-300"
                            placement="top"
                            Icon={HelpIcon}
                            iconClass="fcv-5"
                            heading={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.heading}
                            infoText={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.infoText}
                            additionalContent={additionalRegistryTitleTippyContent()}
                            documentationLinkText={CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT.documentationLinkText}
                            documentationLink={DOCUMENTATION.CUSTOM_CHART}
                            showCloseButton={true}
                            trigger="click"
                            interactive={true}
                        >
                            <Question className="icon-dim-16 fcn-6 ml-4 cursor" />
                        </TippyCustomized>
                    </div>
                    {renderUploadButton()}
                </div>
                <div
                    data-testid="custom-chart-list"
                    className="mt-16 en-2 bw-1 bcn-0 br-8"
                    style={{ minHeight: 'calc(100vh - 235px)' }}
                >
                    <InfoColourBar
                        message={customChartInfoBarMessage()}
                        classname="dc__content-start dc__no-top-border dc__no-bottom-border dc__no-left-border dc__no-right-border bcv-1 bcv-1 w-100 custom-chart-info-bar"
                        Icon={HelpIcon}
                        iconClass="fcv-5 icon-dim-20"
                    />
                    <div className="chart-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-10 pb-10 pr-20 pl-20 dc__uppercase">
                        <div>Name</div>
                        <div>Version</div>
                        <div>Description</div>
                        <div>Uploaded by</div>
                    </div>
                    {chartList?.map((chartData) => (
                        <div className="chart-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20">
                            <div className="flexbox">
                                <span className="cn-9 dc__ellipsis-right">{chartData.name}</span>
                            </div>
                            <div>
                                {chartData.version}
                                <span className="cn-5 ml-8">
                                    {chartData.count > 0 ? `+${chartData.count} more` : ''}
                                </span>
                            </div>
                            <div className="dc__ellipsis-right">
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="left"
                                    content={chartData.chartDescription}
                                    trigger="mouseenter"
                                >
                                    <span>{chartData.chartDescription}</span>
                                </Tippy>
                            </div>
                            <div className="flexbox">
                                <span className="cn-9 dc__ellipsis-right">{chartData.name}</span>
                            </div>
                            <div className="flex">
                                <Download className="icon-dim-16 ic-download-n6" />
                            </div>
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
