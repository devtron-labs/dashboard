import React, { useState, useEffect, useRef } from 'react'
import { CUSTOM_CHART_TITLE_DESCRIPTION_CONTENT, DOCUMENTATION, Routes } from '../../config'
import './customChart.scss'
import UploadChartModal from './UploadChartModal'
import emptyCustomChart from '../../assets/img/ic-empty-custom-charts.png'
import { ReactComponent as Upload } from '../../assets/icons/ic-upload.svg'
import { ReactComponent as Download } from '../../assets/icons/ic-arrow-line-up.svg'
import { ReactComponent as DevtronIcon } from '../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import { getChartList } from './customChart.service'
import { showError, Progressing, ErrorScreenManager, GenericEmptyState, TippyCustomized, TippyTheme, InfoColourBar, closeOnEscKeyPressed, Host } from '@devtron-labs/devtron-fe-common-lib'
import { ChartDetailType, ChartListResponse } from './types'
import Tippy from '@tippyjs/react'
import { toast } from 'react-toastify'
import { EMPTY_STATE_STATUS } from '../../config/constantMessaging'
import { processChartData } from './CustomChartList.utils'

export default function CustomChartList() {
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [loader, setLoader] = useState(false)
    const [downloadInProgress, setDownloadInProgress] = useState<string>("")
    const [chartList, setChartList] = useState<ChartDetailType[]>([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const tippyRef = useRef(null)

    const onChartVersionsModalMount = (tippyInstance) => {
        tippyRef.current = tippyInstance
        document.addEventListener('keydown', closeOnEsc)
    }

    const closeChartVersionsModal = () => {
        if (tippyRef.current?.hide) {
            tippyRef.current.hide()
            tippyRef.current = null
        }
    }

    const closeOnEsc = (e: any) => {
        closeOnEscKeyPressed(e, closeChartVersionsModal)
    }

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

    

    const openUploadPopup = (): void => {
        setShowUploadPopup(true)
    }

    const closeUploadPopup = (isReloadChartList: boolean): void => {
        setShowUploadPopup(false)
        isReloadChartList && getData()
    }

    const renderUploadButton = (): JSX.Element => {
        return (
            <button onClick={openUploadPopup}  data-testid="upload-custom-chart-button" className="cta h-32 flex">
                <Upload className="icon-dim-14 dc__no-svg-fill mr-8"/>
                Upload Chart
            </button>
        )
    }

    const renderLearnMoreLink = (): JSX.Element => {
        return (
            <a className="dc__no-decor" href={DOCUMENTATION.DEPLOYMENT_TEMPLATE} target="_blank" rel="noreferrer noopener">
                Learn more
            </a>
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

    const handleCustomChartDownload = async(e: any) => {
        const chartRefId = e.currentTarget.dataset.versionid
        const chartVersion = e.currentTarget.dataset.version
        const chartName = e.currentTarget.dataset.name
        try {
            setDownloadInProgress(chartName)
            const a = document.createElement('a')
            a.href = `${Host}/${Routes.DOWNLOAD_CUSTOM_CHART}/${chartRefId}`
            a.download = `${chartName}_${chartVersion}.tgz`
            a.click()
            toast.success('Chart Downloaded Successfully')
            closeChartVersionsModal()
        } catch (error) {
            showError(error)
        } finally {
            setDownloadInProgress("")
        }
    }

    const renderChartVersionsModalBody = (chartData: ChartDetailType) : JSX.Element => {
        return (
            <>
                <div className="fs-12 fw-6 cn-9 bc-n50 pt-4 pb-4 pl-8 pr-8 dc__top-radius-4 dc__text-center" data-testid="chart-versions-modal">
                    Select Version
                </div>
                <div className="mb-4 mxh-140 dc__overflow-scroll">
                    {chartData.versions.map((versionsList) => (
                        <div
                            key={`custom-chart-version_${versionsList.version}`}
                            data-testid="chart-version-row"
                            data-versionid={versionsList.id}
                            data-version={versionsList.version}
                            data-name={chartData.name}
                            onClick={handleCustomChartDownload}
                            className="chart-version-row flex left pt-6 pb-6 pl-8 pr-8 lh-20 cn-9 fw-4 fs-13 pointer">
                            {versionsList.version}
                        </div>
                    ))}
                </div>
            </>
        )
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

    const renderDevtronChipTag = (chartData: ChartDetailType) : JSX.Element => { 
        return !chartData.isUserUploaded ? (
            <span className="pl-6 pr-6 ml-8 flex bcb-1 h-20 br-6">
                <DevtronIcon className="icon-dim-20" />
                <span className="ml-4 fs-11 fw-6 cn-7 lh-20 devtron-tag">by Devtron</span>
            </span>
        ) : null
    }

    const renderChartList = (): JSX.Element => {
        return (
            <div className="chart-list" data-testid="custom-charts-list">
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
                    style={{ minHeight: 'calc(100vh - 139px)' }}
                >
                    <InfoColourBar
                        message={customChartInfoBarMessage()}
                        classname="dc__content-start bcv-1 w-100 custom-chart-info-bar dc__border-bottom-v2 pt-6 pb-6 pl-16 pr-16"
                        Icon={HelpIcon}
                        iconClass="fcv-5 icon-dim-20"
                    />
                    <div className="chart-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-10 pb-10 pr-20 pl-20 dc__uppercase">
                        <div>Name</div>
                        <div>Version</div>
                        <div>Description</div>
                    </div>
                    {chartList?.map((chartData) => (
                        <div
                            key={`custom-chart_${chartData.name}`}
                            className="chart-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20"
                        >
                            <div className="flexbox">
                                <span className="cn-9 dc__ellipsis-right">{chartData.name}</span>
                                {renderDevtronChipTag(chartData)}
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
                            <Tippy
                                className="tippy-white-container default-white no-content-padding tippy-shadow w-100"
                                interactive
                                arrow={false}
                                placement="bottom-end"
                                content={renderChartVersionsModalBody(chartData)}
                                trigger="click"
                                onMount={onChartVersionsModalMount}
                                onClickOutside={closeChartVersionsModal}
                                animation="fade"
                            >
                                <div className="flex pointer">
                                    {downloadInProgress === chartData.name ? (
                                        <Progressing pageLoader size={16} />
                                    ) : (
                                        <Download
                                            className="icon-dim-16 scn-6 dc__flip-180"
                                            data-testid={`download-${chartData.name}`}
                                        />
                                    )}
                                </div>
                            </Tippy>
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
