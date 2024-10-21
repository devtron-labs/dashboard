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

import { FunctionComponent, ReactElement } from 'react'
import Tippy from '@tippyjs/react'
import { BUILD_INFRA_TEST_IDS, BUILD_INFRA_TEXT } from './constants'
import { FooterProps } from './types'
import { ConditionalWrap, Progressing } from '../../../Common'

const Footer: FunctionComponent<FooterProps> = ({ disabled, handleCancel, editProfile, loading }) => {
    const disableMessage = disabled
        ? BUILD_INFRA_TEXT.SUBMIT_BUTTON_TIPPY.INVALID_INPUT
        : BUILD_INFRA_TEXT.SUBMIT_BUTTON_TIPPY.REQUEST_IN_PROGRESS

    const getButtonText = () => {
        if (editProfile) {
            return BUILD_INFRA_TEXT.EDIT_SUBMIT
        }

        return BUILD_INFRA_TEXT.SAVE_SUBMIT
    }

    const renderTippy = (children: ReactElement) => (
        <Tippy content={disableMessage} placement="top" className="default-tt" arrow={false}>
            {children}
        </Tippy>
    )

    return (
        <div className="flex pl pr pb pt h-64 dc__gap-12 dc__border-top dc__content-start">
            <ConditionalWrap condition={disabled || loading} wrap={renderTippy}>
                <div className="flexbox dc__align-items-center">
                    <button
                        type="submit"
                        className="cta submit h-32 flex"
                        disabled={disabled || loading}
                        data-testid={BUILD_INFRA_TEST_IDS.SUBMIT_BUTTON}
                    >
                        {loading ? <Progressing size={16} /> : getButtonText()}
                    </button>
                </div>
            </ConditionalWrap>

            {handleCancel && (
                <button
                    type="button"
                    className="cta cancel h-32 flex"
                    disabled={loading}
                    data-testid={BUILD_INFRA_TEST_IDS.CANCEL_BUTTON}
                    onClick={handleCancel}
                >
                    {BUILD_INFRA_TEXT.EDIT_CANCEL}
                </button>
            )}
        </div>
    )
}

export default Footer
