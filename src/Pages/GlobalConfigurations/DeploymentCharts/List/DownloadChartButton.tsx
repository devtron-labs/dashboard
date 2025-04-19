/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRef } from 'react'
import Tippy, { TippyProps } from '@tippyjs/react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    useDownload,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICDownload } from '@Icons/ic-arrow-line-down.svg'
import { Routes } from '@Config/constants'

import { DownloadChartButtonProps } from '../types'

const DownloadChartButton = ({ name, versions }: DownloadChartButtonProps) => {
    const { isDownloading, handleDownload } = useDownload()
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
        await handleDownload({
            downloadUrl: `${Routes.DOWNLOAD_CUSTOM_CHART}/${chartRefId}`,
            fileName: `${chartName}_${chartVersion}.tgz`,
            showSuccessfulToast: true,
            downloadSuccessToastContent: 'Chart Downloaded Successfully',
        })
        handleCloseTippy()
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
                    <div className="mb-4 mxh-140 dc__overflow-auto">
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
            <div className="icon-dim-24">
                <Button
                    dataTestId={`download-${name}`}
                    icon={<ICDownload />}
                    ariaLabel="Download Chart"
                    size={ComponentSizeType.xs}
                    variant={ButtonVariantType.borderLess}
                    isLoading={isDownloading}
                    style={ButtonStyleType.neutral}
                />
            </div>
        </Tippy>
    )
}

export default DownloadChartButton
