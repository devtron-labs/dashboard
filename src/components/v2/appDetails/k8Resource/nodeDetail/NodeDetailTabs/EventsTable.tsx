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

import {
    AppThemeType,
    getComponentSpecificThemeClass,
    getTimeDifference,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { MESSAGING_UI } from '../../../../../../config/constants'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import { TERMINAL_STATUS, TERMINAL_TEXT } from './terminal/constants'
import { EVENT_TABLE_ITEM_CLASS } from './constants'
import { EventTableType } from './node.type'

const ExplainWithAIButton = importComponentFromFELibrary('ExplainWithAIButton', null, 'function')

const EVENTS_TABLE_HEADERS = [
    '',
    'Reason',
    'Message',
    'Count',
    'Age',
    'Last Seen',
    ...(ExplainWithAIButton ? [''] : []),
]

export const EventsTable = ({
    loading,
    eventsList,
    errorValue,
    reconnect,
    clusterId,
    aiWidgetAnalyticsEvent,
    shouldScroll = true,
}: EventTableType) => {
    const renderEventsTable = () => {
        if (loading) {
            return (
                <MessageUI
                    dataTestId="app-events-container-loading"
                    msg={MESSAGING_UI.FETCHING_EVENTS}
                    icon={MsgUIType.LOADING}
                    size={24}
                />
            )
        }

        if (eventsList && eventsList.length > 0) {
            return (
                <div
                    data-testid="app-events-container"
                    className={`text__white flex-grow-1 bg__primary ${shouldScroll ? 'dc__overflow-auto' : ''} ${getComponentSpecificThemeClass(AppThemeType.dark)}`}
                >
                    {errorValue?.status === TERMINAL_STATUS.TERMINATED && (
                        <div className="pl-20 h-24 flex left pr-20 w-100 bcr-7 cn-0">
                            {TERMINAL_TEXT.POD_TERMINATED}&nbsp; {errorValue.errorReason}&nbsp;
                            <u className="cursor" onClick={reconnect}>
                                {TERMINAL_TEXT.INITIATE_CONNECTION}
                            </u>
                        </div>
                    )}
                    <div
                        className={`dc__zi-1 dc__position-sticky dc__top-0 px-16 py-8 dc__grid dc__gap-16 event-row ${ExplainWithAIButton ? 'ai-widget' : ''}`}
                    >
                        {EVENTS_TABLE_HEADERS.map((header, idx) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <span className="fs-12 lh-1-5 fw-6 dc__uppercase" key={`${header}-${idx}`}>
                                {header}
                            </span>
                        ))}
                    </div>
                    {eventsList.map((event, index) => {
                        const { type, reason, message, count, firstTimestamp, lastTimestamp } = event

                        const currentTimeStamp = new Date().toISOString()
                        const lastSeen = getTimeDifference({ startTime: lastTimestamp, endTime: currentTimeStamp })
                        const age = getTimeDifference({ startTime: firstTimestamp, endTime: currentTimeStamp })

                        const isNormalEventType = type === 'Normal'
                        return (
                            <div
                                key={`${reason}-${message}`}
                                className={`px-16 py-12 fs-14 fw-4 lh-1-5 dc__grid dc__gap-16 event-row ${ExplainWithAIButton ? 'ai-widget' : ''} ${index % 2 === 0 && 'alternate-row'}`}
                            >
                                <Icon
                                    name={isNormalEventType ? 'ic-info-filled' : 'ic-warning'}
                                    size={20}
                                    color={isNormalEventType ? 'B500' : null}
                                />
                                <span className={EVENT_TABLE_ITEM_CLASS}>{reason}</span>
                                <span className={EVENT_TABLE_ITEM_CLASS}>{message}</span>
                                <span className={EVENT_TABLE_ITEM_CLASS}>{count}</span>
                                <span className={EVENT_TABLE_ITEM_CLASS}>{age}</span>
                                <span className={EVENT_TABLE_ITEM_CLASS}>{lastSeen}</span>
                                {clusterId && ExplainWithAIButton && !isNormalEventType ? (
                                    <ExplainWithAIButton
                                        intelligenceConfig={{
                                            metadata: { reason, message, count, lastSeen, age },
                                            clusterId,
                                            prompt: JSON.stringify(event),
                                            analyticsCategory: aiWidgetAnalyticsEvent,
                                        }}
                                    />
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            )
        }
        return <MessageUI dataTestId="app-events-container-empty" msg={MESSAGING_UI.NO_EVENTS} size={24} />
    }

    return <>{renderEventsTable()}</>
}
