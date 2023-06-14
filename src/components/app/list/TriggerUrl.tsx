import React, { useEffect, useState } from 'react'
import { copyToClipboard } from '../../common'
import { Progressing, VisibleModal, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as CopyText } from '../../../assets/icons/ic-copy.svg'
import Tippy from '@tippyjs/react'
import { getIngressServiceUrls } from '../service'
import { KIND } from '../../../config/constants'
import { getManifestUrlInfo } from '../../external-apps/ExternalAppService'
import { CopyToClipboardTextProps, ManifestUrlList, TriggerURL } from './types'
import { EMPTY_STATE_STATUS } from '../../../config/constantMessaging'

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

                <div className="dc__overflow-scroll" style={{ height: 'calc(100% - 67px)' }}>
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
                                                                <span className="url-box dc__ellipsis-right mr-6">
                                                                    {url}
                                                                </span>
                                                            </Tippy>
                                                            <span className="icon-dim-16">
                                                                <CopyToClipboardTextWithTippy
                                                                    iconClass="pointer dc__visible-hover--child icon-dim-16"
                                                                    text={url}
                                                                />
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
                                                        <span className="url-box dc__ellipsis-right mr-6">
                                                            {value.pointsTo}
                                                        </span>
                                                    </Tippy>
                                                    <span className="icon-dim-16 pt-2">
                                                        <CopyToClipboardTextWithTippy
                                                            iconClass="pointer dc__visible-hover--child icon-dim-16"
                                                            text={value.pointsTo}
                                                        />
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

export function CopyToClipboardTextWithTippy({
    text,
    rootClassName,
    iconClass,
    placement = 'bottom',
}: CopyToClipboardTextProps) {
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
            placement={placement}
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
            <div className={`cluster-clipboard cursor ${rootClassName ?? ''}`} onClick={copyClipboard}>
                <CopyText className={`${iconClass ?? 'icon-dim-16'}`} />
            </div>
        </Tippy>
    )
}

function EmptyUrlState({ title = '', subtitle = '' }) {
    return (
        <GenericEmptyState
            title={title || EMPTY_STATE_STATUS.TRIGGER_URL.TITLE}
            subTitle={subtitle || EMPTY_STATE_STATUS.TRIGGER_URL.SUBTITLE}
        />
    )
}
