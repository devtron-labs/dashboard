import React from 'react'
import GettingToast from '../../../assets/img/lifebuoy.png'
import { updateLoginCount } from '../../../services/service'
import { OnClickedHandler, POSTHOG_EVENT_ONBOARDING } from '../../onboardingGuide/onboarding.utils'
import { GettingStartedType } from '../guidePage/onboarding.type'
import { setActionWithExpiry } from '../helpers/Helpers'
import './gettingStarted.scss'

function GettingStartedCard({ className, hideGettingStartedCard }: GettingStartedType) {
    const onClickedOkay = () => {
        setActionWithExpiry('clickedOkay', 1)
        hideGettingStartedCard()
        OnClickedHandler(POSTHOG_EVENT_ONBOARDING.TOOLTIP_OKAY)
    }

    const onClickedDontShowAgain = () => {
        const updatedPayload = {
            key: 'login-count',
            value: '5',
        }
        updateLoginCount(updatedPayload)
        hideGettingStartedCard(updatedPayload.value)
        OnClickedHandler(POSTHOG_EVENT_ONBOARDING.TOOLTIP_DONT_SHOW_AGAIN)
    }

    return (
        <div className="getting_tippy__position">
            <div className="arrow-up" />
            <div className={`getting-started-card cn-0 p-20 br-8 fs-13 ${className}`}>
                <img className="mb-12 icon-dim-32" src={GettingToast} alt="getting started icon" />
                <div className="flex column left fw-6">Getting started</div>
                <div>You can always access the Getting Started guide from here.</div>
                <div className="mt-12 lh-18">
                    <button onClick={onClickedOkay} className="bw-0 cn-9 fw-6 br-4 mr-12 pt-4 pb-4 pl-8 pr-8 pl-8 pr-8">
                        Okay
                    </button>
                    <button
                        className="br-4 token__dont-show en-0 bw-1 transparent pl-8 pr-8 pt-3 pb-3"
                        onClick={onClickedDontShowAgain}
                    >
                        Don't show again
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GettingStartedCard
