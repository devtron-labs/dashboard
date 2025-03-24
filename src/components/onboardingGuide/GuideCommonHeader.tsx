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
import { useHistory } from 'react-router-dom'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { GuideCommonHeaderType } from './OnboardingGuide.type'

const GuideCommonHeader = ({ loginCount, title, subtitle, isGettingStartedClicked }: GuideCommonHeaderType) => {
    const history = useHistory()
    const showCloseIcon = loginCount > 0 || isGettingStartedClicked

    const onClickCloseButton = () => {
        history.goBack()
    }

    return (
        <div className="common-guide__container">
            <div className="deploy-manage__header mh-300 bg__tertiary bcn-1">
                {showCloseIcon && (
                    <button
                        type="button"
                        className="w-100 flex right dc__transparent p-20"
                        onClick={onClickCloseButton}
                        data-testid="close-button"
                    >
                        <Close className="icon-dim-24" />
                    </button>
                )}
                <div className={`flex deploy-manage__upper top ${showCloseIcon ? '' : 'pt-64'}`}>
                    <div className="deploy__title flex center">
                        <div className="flex column">
                            <h1
                                className={`${showCloseIcon ? 'fs-24' : 'fs-36'} fw-6 mb-8`}
                                data-testid="common-heading"
                            >
                                {title}
                            </h1>
                            {subtitle && <p className="fs-14 cn-7">{subtitle}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GuideCommonHeader
