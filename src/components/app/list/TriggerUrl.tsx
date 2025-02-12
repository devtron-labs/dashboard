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

import { useEffect, useState } from 'react'
import {
    Progressing,
    VisibleModal,
    GenericEmptyState,
    ClipboardButton,
    EMPTY_STATE_STATUS,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { getIngressServiceUrls } from '../service'
import { KIND } from '../../../config/constants'
import { getManifestUrlInfo } from '../../external-apps/ExternalAppService'
import { ManifestUrlList, TriggerURL } from './types'

export const TriggerUrlModal = ({ appId, envId, installedAppId, isExternalApp, close, appType }: TriggerURL) => {
    const [result, setResponse] = useState<ManifestUrlList[]>()
    const [loading, setLoading] = useState(true)
    const data = { Ingress: [], Service: [] }
    const [errorMessage, setErrorMessage] = useState({ title: '', subtitle: '' })

    const createUrlDataList = () => {
        result?.map((item) => {
            if (item.kind && item.pointsTo) {
                if (item.kind === KIND.SERVICE) {
                    data.Service.push(item)
                    return
                }
                if (item.kind === KIND.INGRESS && item.urls?.length) {
                    data.Ingress.push(item)
                }
            }
        })
    }

    async function getManifest() {
        try {
            if (isExternalApp) {
                const response = await getManifestUrlInfo(appId, appType)
                setResponse(response.result)
                setLoading(false)
            } else {
                const response = await getIngressServiceUrls({ appId, envId, installedAppId })
                setResponse(response.result)
                setLoading(false)
            }
            setErrorMessage({ title: '', subtitle: '' })
        } catch (error) {
            setLoading(false)
            setErrorMessage({
                title: 'Failed to fetch URLs',
                subtitle: 'Could not fetch service and ingress URLs. Please try again after some time.',
            })
        }
    }

    createUrlDataList()

    useEffect(() => {
        getManifest()
    }, [appId, envId])

    const stopPropogation = (e) => {
        e.stopPropagation()
    }

    return (
        <VisibleModal className="" close={close}>
            <div onClick={stopPropogation} className="modal-body--ci-material h-100 dc__overflow-hidden">
                <div className="trigger-modal__header">
                    <h1 className="modal__title flex left fs-16" data-testid="app-details-url-heading">
                        URLs
                    </h1>
                    <button type="button" className="dc__transparent" onClick={close} data-testid="url-close-button">
                        <Close />
                    </button>
                </div>

                <div className="dc__overflow-auto" style={{ height: 'calc(100% - 67px)' }}>
                    {loading ? (
                        <Progressing pageLoader />
                    ) : Object.values(data).every((value) => !value.length) ? (
                        <EmptyUrlState title={errorMessage.title} subtitle={errorMessage.subtitle} />
                    ) : (
                        Object.entries(data).map(([kind, item]) =>
                            item.length ? (
                                <div className="pt-20 pl-20 pr-20 cn-9">
                                    <h5 className="mt-0 fw-6 dc__first-letter-capitalize">{kind}</h5>
                                    <div className="url-table_row pt-6 pb-6 fw-6 cn-7">
                                        <div className="w-200">Name</div>
                                        {kind === KIND.INGRESS && <div className="items-width-1">URLs</div>}
                                        <div className="items-width-1">
                                            {kind === KIND.INGRESS ? 'Points to Load Balancer' : 'Load Balancer'}
                                        </div>
                                    </div>
                                    {item.map((value) => (
                                        <div className="url-table_row table-content pt-6 pb-6 fw-4 cn-9 fs-13 dc__visible-hover dc__visible-hover--parent">
                                            <div className="flex dc__align-start dc__content-start w-200">
                                                <Tippy
                                                    content={value.name}
                                                    className="default-tt dc__word-break-all"
                                                    arrow={false}
                                                    placement="top"
                                                >
                                                    <span className="dc__ellipsis-left direction-left">
                                                        {value.name}
                                                    </span>
                                                </Tippy>
                                            </div>
                                            {kind === KIND.INGRESS && value?.urls && (
                                                <div className="items-width-1">
                                                    {value.urls.map((url) => (
                                                        <div className="flex left">
                                                            <Tippy
                                                                content={url}
                                                                className="default-tt dc__word-break-all"
                                                                arrow={false}
                                                                placement="top"
                                                            >
                                                                <a
                                                                    href={`//${url}`}
                                                                    className="url-box dc__ellipsis-right mr-6"
                                                                    target="_blank"
                                                                    rel="noreferrer noopener"
                                                                >
                                                                    {url}
                                                                </a>
                                                            </Tippy>
                                                            <span className="icon-dim-16 dc__visible-hover--child">
                                                                <ClipboardButton content={url} />
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flexbox dc__content-start items-width-1">
                                                <span className="flex dc__align-start">
                                                    <Tippy
                                                        content={value.pointsTo}
                                                        className="default-tt dc__word-break-all"
                                                        arrow={false}
                                                        placement="top"
                                                    >
                                                        <span className="dc__ellipsis-right mr-6">
                                                            {value.pointsTo}
                                                        </span>
                                                    </Tippy>
                                                    <span className="icon-dim-16 pt-2 dc__visible-hover--child">
                                                        <ClipboardButton content={value.pointsTo} />
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null,
                        )
                    )}
                </div>
            </div>
        </VisibleModal>
    )
}

const EmptyUrlState = ({ title = '', subtitle = '' }) => {
    return (
        <GenericEmptyState
            title={title || EMPTY_STATE_STATUS.TRIGGER_URL.TITLE}
            subTitle={subtitle || EMPTY_STATE_STATUS.TRIGGER_URL.SUBTITLE}
        />
    )
}
