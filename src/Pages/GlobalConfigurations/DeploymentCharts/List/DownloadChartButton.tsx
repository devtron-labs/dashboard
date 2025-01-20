import { useState, useRef } from 'react'
import Tippy, { TippyProps } from '@tippyjs/react'
import {
    Progressing,
    showError,
    Host,
    Tooltip,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICDownload } from '@Icons/ic-arrow-line-down.svg'
import { Routes } from '@Config/constants'
import { DownloadChartButtonProps } from '../types'

const DownloadChartButton = ({ name, versions }: DownloadChartButtonProps) => {
    // TODO: replace with useDownload
    const [downloading, setDownloading] = useState(false)
    const tippyRef = useRef<Parameters<TippyProps['onMount']>[0]>(null)

    const handleCloseTippy = () => {
        tippyRef.current.hide()
    }

    const handleTippyOnMount: TippyProps['onMount'] = (ref) => {
        tippyRef.current = ref
    }

    const handleDownloadChart = async (e: any) => {
        const chartRefId = e.currentTarget.dataset.versionid
        const chartVersion = e.currentTarget.dataset.version
        const chartName = e.currentTarget.dataset.name
        try {
            setDownloading(true)
            const a = document.createElement('a')
            a.href = `${Host}/${Routes.DOWNLOAD_CUSTOM_CHART}/${chartRefId}`
            a.download = `${chartName}_${chartVersion}.tgz`
            a.click()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Chart Downloaded Successfully',
            })
            handleCloseTippy()
        } catch (error) {
            showError(error)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <Tippy
            className="tippy-white-container default-white no-content-padding tippy-shadow w-100"
            interactive
            arrow={false}
            placement="bottom-end"
            content={
                <>
                    <div
                        className="fs-12 fw-6 cn-9 bg__secondary pt-4 pb-4 pl-8 pr-8 dc__top-radius-4 dc__text-center"
                        data-testid="chart-versions-modal"
                    >
                        Select Version
                    </div>
                    <div className="mb-4 mxh-140 dc__overflow-scroll">
                        {versions.map((versionsList) => (
                            <button
                                type="button"
                                key={`custom-chart-version_${versionsList.id}`}
                                data-testid="chart-version-row"
                                data-versionid={versionsList.id}
                                data-version={versionsList.version}
                                data-name={name}
                                onClick={handleDownloadChart}
                                className="dc__hover-n50 anchor w-100 flex left pt-6 pb-6 pl-8 pr-8 lh-20 cn-9 fw-4 fs-13"
                            >
                                {versionsList.version}
                            </button>
                        ))}
                    </div>
                </>
            }
            trigger="click"
            onMount={handleTippyOnMount}
            onClickOutside={handleCloseTippy}
            animation="fade"
        >
            <div className="flex pointer p-4 dc__hover-n50 br-4">
                {downloading ? (
                    <Progressing pageLoader size={16} />
                ) : (
                    <Tooltip alwaysShowTippyOnHover content="Download Chart">
                        <span>
                            <ICDownload className="icon-dim-16 scn-6 dc__no-shrink" data-testid={`download-${name}`} />
                        </span>
                    </Tooltip>
                )}
            </div>
        </Tippy>
    )
}

export default DownloadChartButton
