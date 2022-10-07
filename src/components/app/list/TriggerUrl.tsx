import React, { useEffect, useState } from 'react'
import { copyToClipboard, Progressing, VisibleModal } from '../../common'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as CopyText } from '../../../assets/icons/ic-copy.svg'
import Tippy from '@tippyjs/react'
import { getIngressServiceUrls } from '../service'
import { KIND } from '../../../config/constants'
import EmptyState from '../../EmptyState/EmptyState'
import AppNotDeployed from '../../../assets/img/app-not-deployed.png'
import { getManifestUrlInfo } from '../../external-apps/ExternalAppService'
import IndexStore from '../../v2/appDetails/index.store'

interface TriggerURL {
    appId?: string
    envId: string
    installedAppId?: string
    close: () => void
    isEAMode?: boolean
}

export function TriggerUrlModal({ appId, envId, installedAppId, isEAMode, close }: TriggerURL) {
    const [resp, setResponse] = useState<any>()
    const [loading, setLoading] = useState(true)
    const data = { Ingress: [], Service: [] }

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
        } catch (error) {
            console.log('error')
        }
    }

    resp?.map((item) => {
        if (item?.kind === KIND.SERVICE && item.pointsTo) {
            data.Service.push(item)
            return
        }
        if (item?.kind === KIND.INGRESS && item.pointsTo && item.urls?.length) {
            data.Ingress.push(item)
            return
        }
    })

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

                {loading ? (
                    <Progressing pageLoader />
                ) : Object.values(data).every((value) => !value.length) ? (
                    <EmptyUrlState />
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
                                {item.map((v) => (
                                    <div className="url-table_row table-content pt-6 pb-6 fw-4 cn-9 fs-13 dc__visible-hover dc__visible-hover--parent">
                                        <div className="dc__ellipsis-left direction-left w-200">{v.name}</div>
                                        {v?.urls && (
                                            <div className="items-width-1">
                                                {v.urls.map((url) => (
                                                    <div className="flex left">
                                                        <span className="url-box dc__ellipsis-right mr-6">{url}</span>
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
                                            <span className="url-box dc__ellipsis-right mr-6">{v.pointsTo}</span>
                                            <span className="icon-dim-16">
                                                <CopyToClipboardText
                                                    iconClass="pointer dc__visible-hover--child icon-dim-16"
                                                    text={v.pointsTo}
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
        </VisibleModal>
    )
}

export function CopyToClipboardText({ text, iconClass }) {
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
            <div className="cluster-clipboard dc__position-abs cursor" onClick={copyClipboard}>
                <CopyText className={`${iconClass ? iconClass : 'icon-dim-16'}`} />
            </div>
        </Tippy>
    )
}

function EmptyUrlState() {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>No URLs available</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>No URLs found in ingress and service resources</EmptyState.Subtitle>
        </EmptyState>
    )
}
