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

import GettingToast from '../../../Assets/Img/lifebuoy.png'
import updateLoginCount from './service'
import { LOGIN_COUNT, MAX_LOGIN_COUNT, POSTHOG_EVENT_ONBOARDING } from '../../../Common'
import { handlePostHogEventUpdate, setActionWithExpiry } from '../Header/utils'
import { GettingStartedType } from './types'
import './gettingStarted.scss'

const GettingStartedCard = ({ className, hideGettingStartedCard }: GettingStartedType) => {
    const onClickedOkay = async (e) => {
        setActionWithExpiry('clickedOkay', 1)
        hideGettingStartedCard()
        await handlePostHogEventUpdate(e)
    }

    const onClickedDontShowAgain = async (e) => {
        const updatedPayload = {
            key: LOGIN_COUNT,
            value: `${MAX_LOGIN_COUNT}`,
        }
        await updateLoginCount(updatedPayload)
        hideGettingStartedCard(updatedPayload.value)
        await handlePostHogEventUpdate(e)
    }

    return (
        <div className="getting_tippy__position">
            <div className="arrow-up" />
            <div className={`getting-started-card cn-0 p-20 br-8 fs-13 ${className}`}>
                <img className="mb-12 icon-dim-32" src={GettingToast} alt="getting started icon" />
                <div className="flex column left fw-6">Getting started</div>
                <div>You can always access the Getting Started guide from here.</div>
                <div className="mt-12 lh-18">
                    <button
                        onClick={onClickedOkay}
                        type="button"
                        className="bw-0 cn-9 fw-6 br-4 mr-12 pt-4 pb-4 pl-8 pr-8 pl-8 pr-8"
                        data-posthog={POSTHOG_EVENT_ONBOARDING.TOOLTIP_OKAY}
                    >
                        Okay
                    </button>
                    <button
                        className="br-4 token__dont-show en-0 bw-1 dc__transparent pl-8 pr-8 pt-3 pb-3"
                        type="button"
                        data-posthog={POSTHOG_EVENT_ONBOARDING.TOOLTIP_DONT_SHOW_AGAIN}
                        onClick={onClickedDontShowAgain}
                    >
                        Don&apos;t show again
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GettingStartedCard
