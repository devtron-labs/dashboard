import React, { useState, useEffect, ReactNode } from 'react'
import Tippy from '@tippyjs/react'
import { getWebhookEventsForEventId } from '@devtron-labs/devtron-fe-common-lib'
import branchIcon from '../../assets/icons/misc/branch.svg'
import webhookIcon from '../../assets/icons/misc/webhook.svg'
import { SourceTypeMap, GIT_BRANCH_NOT_CONFIGURED, DEFAULT_GIT_BRANCH_VALUE } from '../../config'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outlined.svg'
import regexIcon from '../../assets/icons/misc/regex.svg'

export interface CIPipelineSourceConfigInterface {
    sourceType
    sourceValue
    showTooltip?: boolean
    showIcons?: boolean
    baseText?: string
    regex?: any
    isRegex?: boolean
    primaryBranchAfterRegex?: string
}

export const CiPipelineSourceConfig = ({
    sourceType,
    sourceValue,
    showTooltip,
    showIcons = true,
    baseText = undefined,
    regex,
    isRegex,
    primaryBranchAfterRegex,
}: CIPipelineSourceConfigInterface) => {
    const _isWebhook = sourceType === SourceTypeMap.WEBHOOK
    const _isRegex = sourceType === SourceTypeMap.BranchRegex || !!regex || isRegex

    const [sourceValueBase, setSourceValueBase] = useState<ReactNode>('')
    const [sourceValueAdv, setSourceValueAdv] = useState<ReactNode>('')
    const [loading, setLoading] = useState(!!_isWebhook)

    useEffect(() => {
        updateSourceValue()
    }, [sourceValue])

    const updateSourceValue = () => {
        if (_isWebhook) {
            const _sourceValueObj = JSON.parse(sourceValue)
            getWebhookEventsForEventId(_sourceValueObj.eventId).then((_res) => {
                const _webhookEvent = _res.result
                setSourceValueBase(_webhookEvent.name)
                setSourceValueAdv(
                    _buildHoverHtmlForWebhook(_webhookEvent.name, _sourceValueObj.condition, _webhookEvent.selectors),
                )
                setLoading(false)
            })
        } else {
            setSourceValueBase(sourceValue)
            setSourceValueAdv(sourceValue)
        }
    }

    // tippy content for regex type
    const rendeRegexSourceVal = (): JSX.Element => {
        return (
            <>
                <>
                    <div className="fw-6">Regex</div>
                    <p>{regex}</p>
                </>

                {window.location.href.includes('trigger') && (
                    <>
                        <div className="fw-6">Primary Branch</div>
                        <p>{primaryBranchAfterRegex || 'Not set'}</p>
                    </>
                )}
            </>
        )
    }
    // for non webhook case, data is already set in use state initialisation
    function _init() {
        if (!_isWebhook) {
            return
        }
        const _sourceValueObj = JSON.parse(sourceValue)
        const _eventId = _sourceValueObj.eventId
        const _condition = _sourceValueObj.condition

        getWebhookEventsForEventId(_eventId).then((_res) => {
            const _webhookEvent = _res.result
            setSourceValueBase(_webhookEvent.name)
            setSourceValueAdv(_buildHoverHtmlForWebhook(_webhookEvent.name, _condition, _webhookEvent.selectors))
            setLoading(false)
        })
    }

    function regexTippyContent() {
        if (!_isRegex) {
            return
        }
        setSourceValueAdv(rendeRegexSourceVal())
    }

    function _buildHoverHtmlForWebhook(eventName, condition, selectors) {
        const _conditions = []
        Object.keys(condition).forEach((_selectorId) => {
            const _selector = selectors.find((i) => i.id == _selectorId)
            _conditions.push({ name: _selector ? _selector.name : '', value: condition[_selectorId] })
        })

        return (
            <>
                <span> {eventName} Filters </span>
                <br />
                <ul className="m-0">
                    {_conditions.map((_condition, index) => (
                        <li key={index}>
                            {_condition.name} : {_condition.value}
                        </li>
                    ))}
                </ul>
            </>
        )
    }

    useEffect(() => {
        _init()
        regexTippyContent()
    }, [])

    return (
        <div className={`flex left ${showTooltip ? 'branch-name' : ''}`}>
            {loading && showIcons && <span className="dc__loading-dots">loading</span>}
            {!loading && (
                <>
                    {showIcons && (
                        <img
                            src={_isWebhook ? webhookIcon : _isRegex ? regexIcon : branchIcon}
                            alt="branch"
                            className="icon-dim-12 mr-5"
                        />
                    )}
                    {showTooltip && (
                        <Tippy
                            className="default-tt dc__word-break-all"
                            arrow={false}
                            placement="bottom"
                            content={sourceValueAdv}
                        >
                            <div className="flex" style={{ maxWidth: !baseText ? 'calc(100% - 15px)' : 'auto' }}>
                                {!baseText && (
                                    <>
                                        <div
                                            className={`dc__ellipsis-right ${
                                                sourceValue === GIT_BRANCH_NOT_CONFIGURED ? 'cr-5' : ''
                                            }`}
                                        >
                                            {sourceValueBase}
                                        </div>
                                        {sourceValue !== DEFAULT_GIT_BRANCH_VALUE && (
                                            <div className="mt-2">
                                                <Info className="icon-dim-12 fcn-5 ml-4" />
                                            </div>
                                        )}
                                    </>
                                )}
                                {baseText && (
                                    <span className="cursor" style={{ borderBottom: '1px solid #3b444c' }}>
                                        {baseText}
                                    </span>
                                )}
                            </div>
                        </Tippy>
                    )}
                    {!showTooltip && <span className="dc__ellipsis-right">{sourceValueAdv}</span>}
                </>
            )}
        </div>
    )
}
