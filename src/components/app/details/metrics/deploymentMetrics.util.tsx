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

import Tippy from '@tippyjs/react'
import { ReactComponent as Smiley } from '../../../../assets/icons/ic-smiley-party.svg'
import { ReactComponent as ICHelpOutline } from '../../../../assets/icons/ic-help-outline.svg'
import { createTimestamp } from './deploymentMetrics.service'

export function frequencyXAxisLabel(props) {
    const { x, y, stroke } = props.viewBox
    return (
        <>
            <rect x={x} y={y + 10} width={12} height={12} fill="var(--G300)" />
            <text x={x + 20} y={y + 20} fill={stroke} textAnchor="start">
                Successful Deployments
            </text>
            <rect x={x + 180} y={y + 10} width={12} height={12} fill="var(--R300)" />
            <text x={x + 200} y={y + 20} fill={stroke} textAnchor="start">
                Failed Deployments
            </text>
        </>
    )
}

export function leadTimeXAxisLabel(props) {
    const { x, y, stroke } = props.viewBox
    return (
        <>
            <rect x={x} y={y + 10} width={12} height={12} fill="var(--B300)" />
            <text x={x + 20} y={y + 20} fill={stroke} textAnchor="start">
                Max Lead Time
            </text>
        </>
    )
}

export function recoveryTimeLabel(props) {
    const { x, y, stroke } = props.viewBox
    return (
        <>
            <rect x={x} y={y + 10} width={12} height={12} fill="var(--Y300)" />
            <text x={x + 20} y={y + 20} fill={stroke} textAnchor="start">
                Recovery Time for Failed Deployments
            </text>
        </>
    )
}

export const BenchmarkLine = (props) => {
    const { category } = props
    switch (category) {
        case 'LOW':
            return (
                <svg height="10" width="30">
                    <line stroke="var(--R500)" strokeWidth="2" x1="0" y1="5" x2="30" y2="5" />
                </svg>
            )
        case 'MEDIUM':
            return (
                <svg height="10" width="30">
                    <line stroke="var(--Y500)" strokeWidth="2" x1="0" y1="5" x2="30" y2="5" />
                </svg>
            )
        case 'HIGH':
            return (
                <svg height="10" width="30">
                    <line stroke="var(--G500)" strokeWidth="2" x1="0" y1="5" x2="30" y2="5" />
                </svg>
            )
        case 'ELITE':
            return (
                <svg height="10" width="30">
                    <line stroke="var(--V500)" strokeWidth="2" x1="0" y1="5" x2="30" y2="5" />
                </svg>
            )
        default:
            return <span />
    }
}

export function renderCategoryTag(category: string) {
    switch (category) {
        case 'LOW':
            return <span className="category__label category__label--low">Low</span>
        case 'MEDIUM':
            return <span className="category__label category__label--medium">Medium</span>
        case 'HIGH':
            return <span className="category__label category__label--high">high</span>
        case 'ELITE':
            return <span className="category__label category__label--elite">Elite</span>
    }
}

export const ReferenceLineLegend = () => {
    return (
        <svg height="10" width="30">
            <line stroke="var(--N900)" strokeWidth="2" strokeDasharray="8,3" x1="0" y1="5" x2="30" y2="5" />
        </svg>
    )
}

export const EliteCategoryMessage = (props) => {
    return (
        <div className="cursor" onClick={props.onClick}>
            <p className="graph-legend__secondary-label"> You are in elite category </p>
            <p className="graph-legend__secondary-value">Good job!</p>
        </div>
    )
}

export const FailureLegendEmptyState = (props) => {
    return (
        <div>
            <p className="graph-legend__primary-label">
                Change Failure Rate
                <Tippy className="default-tt" arrow={false} content="How often does the pipeline fail?">
                    <span>
                        <ICHelpOutline className="icon-dim-20 ml-8 dc__vertical-align-middle mr-5" />
                    </span>
                </Tippy>
            </p>
            <div className="mt-16">
                <Smiley className="mr-8 dc__inline-block dc__vertical-align-middle" style={{ width: '39px' }} />
                <p className="m-0 fw-6 dc__inline-block dc__vertical-align-middle">
                    Good Job! <br />
                    No pipeline failures in this period
                </p>
            </div>
        </div>
    )
}

export const FrequencyTooltip = (props) => {
    if (!props.active) {
        return <div />
    }
    const { success } = props.payload[0].payload
    const { failures } = props.payload[0].payload
    return (
        <div className="graph-tooltip">
            <p className="">{props.label}</p>
            <p className="m-0 flexbox flex-justify">
                <span>
                    <span className="graph-tooltip__icon" style={{ backgroundColor: 'var(--G300)' }} />
                    Succeeded
                </span>
                <span>{success}</span>
            </p>
            <p className="m-0 flexbox flex-justify">
                <span>
                    <span className="graph-tooltip__icon" style={{ backgroundColor: 'var(--R300)' }} />
                    Failed{' '}
                </span>
                <span>{failures}</span>
            </p>
        </div>
    )
}

export const LeadTimeTooltip = (props) => {
    if (!props.active) {
        return <div />
    }
    const yAxisLabel = props?.payload[0]?.payload?.yAxisLabel
    return (
        <div className="graph-tooltip">
            <p className="">{props.label}</p>
            <p className="m-0 flexbox flex-justify">
                <span>
                    <span className="graph-tooltip__icon" style={{ backgroundColor: 'var(--B300)' }} /> Max Lead Time
                </span>
                <span>{yAxisLabel}</span>
            </p>
        </div>
    )
}

export const RecoveryTimeTooltip = (props) => {
    if (!props.active) {
        return <div />
    }
    let yAxisLabel
    try {
        yAxisLabel = props?.payload[0]?.payload?.yAxisLabel || ''
    } catch (e) {
        yAxisLabel = ''
    }
    return (
        <div className="graph-tooltip">
            <p className="">{props.label}</p>
            <p className="m-0 flexbox flex-justify">
                <span>
                    <span className="graph-tooltip__icon" style={{ backgroundColor: 'var(--Y300)' }} />
                    Recovery Time
                </span>
                <span>{yAxisLabel}</span>
            </p>
        </div>
    )
}

export function getTimeperiod(timeInDays: number) {
    const timeInMinutes = 24 * 60 * (1 / timeInDays)
    return createTimestamp(timeInMinutes)
}
