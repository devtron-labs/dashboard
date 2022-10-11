import React, { useEffect, useState } from 'react'
import { copyToClipboard, Progressing, showError, VisibleModal } from '../../common'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as CopyText } from '../../../assets/icons/ic-copy.svg'
import Tippy from '@tippyjs/react'
import { getIngressServiceUrls } from '../service'
import { KIND } from '../../../config/constants'
import EmptyState from '../../EmptyState/EmptyState'
import AppNotDeployed from '../../../assets/img/app-not-deployed.png'
import { getManifestUrlInfo } from '../../external-apps/ExternalAppService'
import { ManifestUrlList, TriggerURL } from './types'

export function TriggerUrlModal({ appId, envId, installedAppId, isEAMode, close }: TriggerURL) {
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
                    return
                }
            }
        })
    }

    async function getManifest() {
        try {
            if (isEAMode) {
                const response = await getManifestUrlInfo(appId)
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
            setErrorMessage({title: 'Failed to fetch URLs', subtitle: 'Could not fetch service and ingress URLs. Please try again after some time.' })
        }
    }

    createUrlDataList()

    useEffect(() => {
        getManifest()
    }, [appId, envId])

    return (
        <VisibleModal className="" close={close}>
            <div className="modal-body--ci-material h-100 dc__overflow-hidden">
                <div className="trigger-modal__header">
                    <h1 className="modal__title flex left fs-16">URLs</h1>
                    <button type="button" className="dc__transparent" onClick={close}>
                        <Close />
                    </button>
                </div>

                <div className="h-100 dc__overflow-scroll">
                    {loading ? (
                        <Progressing pageLoader />
                    ) : Object.values(data).every((value) => !value.length) ? (
                        <EmptyUrlState title={errorMessage.title} subtitle={errorMessage.subtitle}/>
                    ) : (
                        Object.entries(data).map(([kind, item]) =>
                            item.length ? (
                                <div className="pt-20 pl-20 pr-20 cn-9">
                                    <h5 className="mt-0 fw-6 dc__first-letter-capitalize">{kind}</h5>
                                    <div className="url-table_row pt-6 pb-6 fw-6 cn-7">
                                        <div className="w-200">Name</div>
                                        {kind === KIND.INGRESS && <div className="items-width-1">Urls</div>}
                                        <div className="items-width-1">
                                            {kind === KIND.INGRESS ? 'Points to (loadBalancer)' : 'Loadbalancer'}
                                        </div>
                                    </div>
                                    {item.map((value) => (
                                        <div className="url-table_row table-content pt-6 pb-6 fw-4 cn-9 fs-13 dc__visible-hover dc__visible-hover--parent">
                                            <Tippy
                                                content={value.name}
                                                className="default-tt"
                                                arrow={false}
                                                placement="top"
                                            >
                                                <div className="dc__ellipsis-left direction-left w-200">
                                                    {value.name}
                                                </div>
                                            </Tippy>
                                            {kind === KIND.INGRESS && value?.urls && (
                                                <div className="items-width-1">
                                                    {value.urls.map((url) => (
                                                        <div className="flex left">
                                                            <Tippy
                                                                content={url}
                                                                className="default-tt"
                                                                arrow={false}
                                                                placement="top"
                                                            >
                                                                <span className="url-box dc__ellipsis-right mr-6">
                                                                    {url}
                                                                </span>
                                                            </Tippy>
                                                            <span className="icon-dim-16">
                                                                <CopyToClipboardText
                                                                    iconClass="pointer dc__visible-hover--child icon-dim-16"
                                                                    text={url}
                                                                />
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex left items-width-1">
                                                <Tippy
                                                    content={value.pointsTo}
                                                    className="default-tt"
                                                    arrow={false}
                                                    placement="top"
                                                >
                                                    <span className="url-box dc__ellipsis-right mr-6">
                                                        {value.pointsTo}
                                                    </span>
                                                </Tippy>
                                                <span className="icon-dim-16">
                                                    <CopyToClipboardText
                                                        iconClass="pointer dc__visible-hover--child icon-dim-16"
                                                        text={value.pointsTo}
                                                    />
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

export function CopyToClipboardText({ text, iconClass }: { text: string; iconClass?: string }) {
    const [copied, setCopied] = useState(false)
    const copyClipboard = (e): void => {
        e.stopPropagation()
        setCopied(true)
        copyToClipboard(text)
    }

    return (
        <Tippy
            className="default-tt"
            arrow={false}
            placement="bottom"
            content={copied ? 'Copied!' : 'Copy'}
            trigger="mouseenter click"
            onShow={(_tippy) => {
                setTimeout(() => {
                    _tippy.hide()
                    setCopied(false)
                }, 2000)
            }}
            interactive={true}
        >
            <div className="cluster-clipboard cursor" onClick={copyClipboard}>
                <CopyText className={`${iconClass ? iconClass : 'icon-dim-16'}`} />
            </div>
        </Tippy>
    )
}

function EmptyUrlState({title = "", subtitle = ""}) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>{title || "No URLs available"}</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>{subtitle || "No URLs found in ingress and service resources"}</EmptyState.Subtitle>
        </EmptyState>
    )
}
