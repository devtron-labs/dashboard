/*
 * Copyright (c) 2024. Devtron Inc.
 */

import React from 'react'
import dayjs from 'dayjs'
import { ScannedByToolModal } from '@Shared/Components/ScannedByToolModal'
import { SegmentedBarChart } from '@Common/SegmentedBarChart'
import { ReactComponent as ICClock } from '@Icons/ic-clock.svg'
import { ZERO_TIME_STRING, DATE_TIME_FORMATS } from '../../../../../Common/Constants'
import { InfoCardPropsType } from '../types'

const InfoCard: React.FC<InfoCardPropsType> = ({ entities, lastScanTimeString, scanToolId }) => (
    <div className="info-card">
        <SegmentedBarChart entities={entities} rootClassName="p-16 fs-13" countClassName="fw-6" />

        {(lastScanTimeString || scanToolId) && (
            <>
                <div className="dc__border-bottom-n1 w-100 h-1" />

                <div className="w-100 flexbox dc__content-space pl-16 pr-16 pb-8 pt-8">
                    {lastScanTimeString && lastScanTimeString !== ZERO_TIME_STRING && (
                        <div className="flexbox dc__gap-4 dc__align-items-center">
                            <ICClock className="icon-dim-16" />
                            <span
                                className="fs-12 lh-20 fw-4 fcn-8"
                                data-testid="security-info-card-last-scan-time"
                            >{`Scanned on ${dayjs(lastScanTimeString).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}`}</span>
                        </div>
                    )}
                    {scanToolId && (
                        <ScannedByToolModal scanToolId={scanToolId} fontSize={12} spacingBetweenTextAndIcon={8} />
                    )}
                </div>
            </>
        )}
    </div>
)

export default InfoCard
