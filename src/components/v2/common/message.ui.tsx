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

import React from 'react'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as InfoIcon } from '../assets/icons/ic-info-outline-gray.svg'
import { ReactComponent as FilledInfoIcon } from '../assets/icons/ic-info-filled.svg'
import { ReactComponent as MultipleContainer } from '../assets/icons/ic-select-container.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { Pod as PodIcon } from '../../common'

export enum MsgUIType {
    LOADING = 'loading',
    POD = 'pod',
    MULTI_CONTAINER = 'multi_container',
    ERROR = 'error',
    INFO = 'info',
}

export interface MsgUIProps {
    msg: string
    dataTestId?: string
    icon?: MsgUIType
    theme?: 'white' | 'dark' | 'light-gray'
    iconClassName?: string
    bodyStyle?: any
    msgStyle?: any
    actionButtonStyle?: any
    size: number
    isShowActionButton?: boolean
    actionButtonText?: string
    onActionButtonClick?: () => void
    minHeight?: string
}

const MessageUI: React.FC<MsgUIProps> = ({
    msg,
    dataTestId,
    icon,
    theme,
    iconClassName,
    bodyStyle,
    msgStyle,
    actionButtonStyle,
    size = 24,
    isShowActionButton,
    actionButtonText,
    onActionButtonClick,
    minHeight,
}: MsgUIProps) => {
    return (
        <div
            data-testid={dataTestId}
            className={`dc__text-center w-100 h-100 flexbox-col dc__content-center ${theme || 'dark'}-background`}
        >
            <div>
                {(() => {
                    switch (icon) {
                        case MsgUIType.LOADING:
                            return (
                                <div className={`fcn-0 ${iconClassName || ''}`}>
                                    <Progressing size={size} />
                                </div>
                            )
                        case MsgUIType.POD:
                            return (
                                <PodIcon
                                    color="var(--N400)"
                                    style={{ width: '48px', height: '48px', marginBottom: '12px' }}
                                />
                            )
                        case MsgUIType.MULTI_CONTAINER:
                            return <MultipleContainer className={iconClassName || ''} />
                        case MsgUIType.ERROR:
                            return <ErrorIcon className={iconClassName || ''} width={size} height={size} />
                        case MsgUIType.INFO:
                            return <FilledInfoIcon className={iconClassName || ''} width={size} height={size} />
                        default:
                            return <InfoIcon className={`fcn-0 ${iconClassName || ''}`} width={size} height={size} />
                    }
                })()}
            </div>
            <div className="fs-14 text__white">{msg}</div>
            {isShowActionButton && (
                <div
                    className="cursor dc__underline fs-14 cb-3"
                    onClick={onActionButtonClick}
                    style={{
                        ...actionButtonStyle,
                    }}
                >
                    {actionButtonText}
                </div>
            )}
        </div>
    )
}

export default MessageUI
