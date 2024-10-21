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

import { useState, useEffect, ReactNode } from 'react'
import Tippy from '@tippyjs/react'
import { getWebhookEventsForEventId, SourceTypeMap } from '../../../Common'
import { GIT_BRANCH_NOT_CONFIGURED, DEFAULT_GIT_BRANCH_VALUE } from './constants'
import webhookIcon from '../../../Assets/Icon/ic-webhook.svg'
import branchIcon from '../../../Assets/Icon/ic-branch.svg'
import { ReactComponent as Info } from '../../../Assets/Icon/ic-info-outlined.svg'
import regexIcon from '../../../Assets/Icon/ic-regex.svg'
import { buildHoverHtmlForWebhook } from './utils'

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

    const updateSourceValue = () => {
        if (_isWebhook) {
            const _sourceValueObj = JSON.parse(sourceValue)
            getWebhookEventsForEventId(_sourceValueObj.eventId)
                .then((_res) => {
                    const _webhookEvent = _res.result
                    setSourceValueBase(_webhookEvent.name)
                    setSourceValueAdv(
                        buildHoverHtmlForWebhook(
                            _webhookEvent.name,
                            _sourceValueObj.condition,
                            _webhookEvent.selectors,
                        ),
                    )
                    setLoading(false)
                })
                .catch((error) => {
                    throw error
                })
        } else {
            setSourceValueBase(sourceValue)
            setSourceValueAdv(sourceValue)
        }
    }

    useEffect(() => {
        updateSourceValue()
    }, [sourceValue])

    // tippy content for regex type
    const renderRegexSourceVal = (): JSX.Element => (
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
    // for non webhook case, data is already set in use state initialisation
    function _init() {
        if (!_isWebhook) {
            return
        }
        const _sourceValueObj = JSON.parse(sourceValue)
        const _eventId = _sourceValueObj.eventId
        const _condition = _sourceValueObj.condition

        getWebhookEventsForEventId(_eventId)
            .then((_res) => {
                const _webhookEvent = _res.result
                setSourceValueBase(_webhookEvent.name)
                setSourceValueAdv(buildHoverHtmlForWebhook(_webhookEvent.name, _condition, _webhookEvent.selectors))
                setLoading(false)
            })
            .catch((error) => {
                throw error
            })
    }

    function regexTippyContent() {
        if (!_isRegex) {
            return
        }
        setSourceValueAdv(renderRegexSourceVal())
    }

    useEffect(() => {
        _init()
        regexTippyContent()
    }, [])

    const isRegexOrBranchIcon = _isRegex ? regexIcon : branchIcon

    return (
        <div className={`flex left ${showTooltip ? 'branch-name' : ''}`}>
            {loading && showIcons && <span className="dc__loading-dots">loading</span>}
            {!loading && (
                <div className="flex dc__gap-4">
                    {showIcons && (
                        <img
                            src={_isWebhook ? webhookIcon : isRegexOrBranchIcon}
                            alt="branch"
                            className="icon-dim-12"
                        />
                    )}
                    {showTooltip && (
                        <Tippy
                            className="default-tt dc__word-break-all"
                            arrow={false}
                            placement="bottom"
                            content={sourceValueAdv}
                        >
                            <div
                                className="flex left dc__gap-4"
                                style={{ maxWidth: !baseText ? 'calc(100% - 15px)' : 'auto' }}
                            >
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
                                            <Info className="icon-dim-12 fcn-5" />
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
                </div>
            )}
        </div>
    )
}
