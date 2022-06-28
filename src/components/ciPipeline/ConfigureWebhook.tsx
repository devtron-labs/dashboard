import React, { useState, useEffect } from 'react'
import { ReactComponent as Webhook } from '../../assets/icons/ic-CIWebhook.svg'
import { ReactComponent as Copy } from '../../assets/icons/ic-copy.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled-prple.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { WebhookSelectorCondition } from './WebhookSelectorCondition'
import Tippy from '@tippyjs/react'

export function ConfigureWebhook({
    webhookConditionList,
    copyToClipboard,
    gitHost,
    selectedWebhookEvent,
    addWebhookCondition,
    deleteWebhookCondition,
    onWebhookConditionSelectorChange,
    onWebhookConditionSelectorValueChange,
    canEditPipeline,
}) {
    const [copiedUrl, setCopiedUrl] = useState(false)
    const [copiedKey, setCopiedKey] = useState(false)

    let _allSelectorIdsInConditions = []
    webhookConditionList.map((_condition, index) => {
        _allSelectorIdsInConditions.push(Number(_condition.selectorId))
    })

    useEffect(() => {
        if (!copiedUrl) return
        setTimeout(() => setCopiedUrl(false), 2000)
    }, [copiedUrl])

    useEffect(() => {
        if (!copiedKey) return
        setTimeout(() => setCopiedKey(false), 2000)
    }, [copiedKey])

    return (
        <>
            <div className="ci-webhook-info bcv-1 bw-1 ev-2 br-4">
                <Info className="icon-dim-20" />
                <p className="fs-13 cn-9 m-0">
                    <span className="fw-6 mr-5">Info:</span>
                    This will checkout or merge required code locally to build an image. No changes will be pushed to
                    your remote git repository.
                </p>
            </div>
            <div className="bcn-1 pl-16 pr-16 pt-12 pb-12 cn-9 br-5 mt-16">
                <div className="configure-ci-webhook ">
                    <Webhook className="icon-dim-24" />
                    <p className="fs-13 fw-6 m-0">Pre Requisite: Configure Webhook</p>
                </div>
                <p className="fs-13 ml-32">
                    Use below details to add a webhook to the git repository.
                    <span className="cn-9 fw-6"> NOTE: Set Content type as “application/json” for Github.</span>
                </p>
                <div className="flex left fs-12 fw-6 mt-12">
                    {gitHost.webhookUrl && (
                        <Tippy content={copiedUrl ? 'Copied!' : 'Copy to clipboard.'}>
                            <div
                                className="bcn-0 pt-6 pb-6 pl-12 pr-12 pt-6 pb-2 br-4 bw-1 en-2 mr-12 flex left cursor"
                                onClick={() => {
                                    copyToClipboard(gitHost.webhookUrl, () => setCopiedUrl(true))
                                }}
                            >
                                Click to copy webhook URL
                                <Copy className="icon-dim-16 ml-4" />
                            </div>
                        </Tippy>
                    )}
                    {gitHost.webhookSecret && (
                        <Tippy content={copiedKey ? 'Copied!' : 'Copy to clipboard.'}>
                            <div
                                className="bcn-0 pt-6 pb-6 pl-12 pr-12 pt-6 pb-2 br-4 bw-1 en-2 flex left cursor"
                                onClick={() => {
                                    copyToClipboard(gitHost.webhookSecret, () => setCopiedKey(true))
                                }}
                            >
                                Click to copy secret key
                                <Copy className="icon-dim-16 ml-4 " />
                            </div>
                        </Tippy>
                    )}
                </div>
            </div>
            <div className="webhook-config-container">
                <p className="mt-16 fs-13 mb-0 cn-7">
                    Build {selectedWebhookEvent.name} Webhook CI which match below filters only{' '}
                    <span className="cn-9 fw-6">(NOTE: Only regex is supported for values)</span>
                </p>
                <p className="mb-16 fs-13">
                    Devtron uses regexp library,{' '}
                    <a
                        className="learn-more-href"
                        href="https://yourbasic.org/golang/regexp-cheat-sheet/"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        view regexp cheatsheet
                    </a>
                    . You can test your regex{' '}
                    <a
                        className="learn-more__href"
                        href="https://regex101.com/r/lHHuaE/1"
                        rel="noreferrer noopener"
                        target="_blank"
                    >
                        here
                    </a>
                </p>
                {webhookConditionList.map((_condition, index) => {
                    let _masterSelectorList = []
                    let _canEditSelectorCondition = canEditPipeline
                    selectedWebhookEvent.selectors.forEach((_selector) => {
                        let _selectorId = _selector.id
                        if (
                            _selector.toShowInCiFilter &&
                            (!_allSelectorIdsInConditions.includes(_selectorId) || _condition.selectorId == _selectorId)
                        ) {
                            _masterSelectorList.push({ label: _selector.name, value: _selector.id })
                        }
                        if (
                            _canEditSelectorCondition &&
                            _condition.selectorId == _selector.id &&
                            !!_selector.fixValue
                        ) {
                            _canEditSelectorCondition = false
                        }
                    })
                    _masterSelectorList.sort((a, b) => a.label.localeCompare(b.label))
                    return (
                        <div key={index}>
                            <WebhookSelectorCondition
                                conditionIndex={index}
                                masterSelectorList={_masterSelectorList}
                                selectorCondition={_condition}
                                onSelectorChange={onWebhookConditionSelectorChange}
                                onSelectorValueChange={onWebhookConditionSelectorValueChange}
                                deleteWebhookCondition={deleteWebhookCondition}
                                canEditSelectorCondition={_canEditSelectorCondition}
                            />
                        </div>
                    )
                })}

                {canEditPipeline && (
                    <div className="cb-5 fw-6 fs-14 cursor add-filter" onClick={addWebhookCondition}>
                        <Add className="icon-dim-20 mr-5 fs-14 fcb-5 mr-12 vertical-align-bottom " />
                        Add Filter
                    </div>
                )}
            </div>
        </>
    )
}
