import React, { useState, useEffect } from 'react'
import branchIcon from '../../assets/icons/misc/branch.svg'
import webhookIcon from '../../assets/icons/misc/webhook.svg'
import Tippy from '@tippyjs/react'
import { SourceTypeMap } from '../../config'
import { getWebhookEventsForEventId } from '../../services/service'
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

export function CiPipelineSourceConfig({
    sourceType,
    sourceValue,
    showTooltip,
    showIcons = true,
    baseText = undefined,
    regex,
    isRegex,
    primaryBranchAfterRegex,
}: CIPipelineSourceConfigInterface) {
    let _isWebhook = sourceType === SourceTypeMap.WEBHOOK
    let _isRegex = sourceType === SourceTypeMap.BranchRegex || !!regex || isRegex

    const [sourceValueBase, setSourceValueBase] = useState(_isWebhook ? '' : sourceValue)
    const [sourceValueAdv, setSourceValueAdv] = useState(_isWebhook ? '' : sourceValue)
    const [loading, setLoading] = useState(_isWebhook ? true : false)

    // for non webhook case, data is already set in use state initialisation
    function _init() {
        if (!_isWebhook) {
            return
        }
        let _sourceValueObj = JSON.parse(sourceValue)
        let _eventId = _sourceValueObj.eventId
        let _condition = _sourceValueObj.condition

        getWebhookEventsForEventId(_eventId).then((_res) => {
            let _webhookEvent = _res.result
            setSourceValueBase(_webhookEvent.name)
            setSourceValueAdv(_buildHoverHtmlForWebhook(_webhookEvent.name, _condition, _webhookEvent.selectors))
            setLoading(false)
        })
    }

    function _buildHoverHtmlForWebhook(eventName, condition, selectors) {
        let _conditions = []
        Object.keys(condition).forEach((_selectorId) => {
            let _selector = selectors.find((i) => i.id == _selectorId)
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
    }, [])

    const rendeRegexSourceVal = () => {
        return (
            <>
                <>
                    <div className="fw-6">Regex</div>
                    <p>{regex}</p>
                </>

                {window.location.href.includes('trigger') && (
                    <>
                        <div className="fw-6">Primary Branch</div>
                        <p>{primaryBranchAfterRegex ? primaryBranchAfterRegex : 'Not set'}</p>
                    </>
                )}
            </>
        )
    }

    return (
        <div className={showTooltip ? 'branch-name' : ''}>
            {loading && showIcons && <span className="loading-dots">loading</span>}
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
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={_isRegex ? rendeRegexSourceVal() : sourceValue}
                        >
                            <div>
                                {!baseText && (
                                    <div className="flex left">
                                        <div className="ellipsis-right">{sourceValueBase}</div>
                                        <Info className="icon-dim-12 fcn-5 ml-4" />
                                    </div>
                                )}
                                {baseText && (
                                    <span className="cursor" style={{ borderBottom: '1px solid #3b444c' }}>
                                        {baseText}
                                    </span>
                                )}
                            </div>
                        </Tippy>
                    )}
                    {!showTooltip && (
                        <>
                            <span className="ellipsis-right">{sourceValueAdv}</span>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
