import React from 'react'
import GettingToast from '../../../assets/img/lifebuoy.png'
import { updateLoginCount } from '../../../services/service'
import { setActionWithExpiry } from '../helpers/Helpers'
import './gettingStarted.scss'

export interface GettingStartedType {
    className: string
    showHelpCard: boolean
    hideGettingStartedCard: () => void
    loginCount: number
}

function GettingStartedCard({ className, hideGettingStartedCard }: GettingStartedType) {
    const onClickedOkay = () => {
        setActionWithExpiry('clickedOkay', 1)
        hideGettingStartedCard()
    }

    const onClickedDontShowAgain = () => {
        let updatedPayload = {
            key: 'login-count',
            value: '5',
        }
        updateLoginCount(updatedPayload)
        hideGettingStartedCard()
    }

    return (
        <div className={`${className} getting_tippy__position getting-started-card cn-0 p-20 br-8 fs-13 `}>
            {/* <div className="arrow-up " /> */}
            <img className="mb-12 icon-dim-32" src={GettingToast} alt="getting started icon" />
            <div className="flex column left fw-6">Getting started</div>
            <div>You can always access the Getting Started guide from here.</div>
            <div className="mt-12">
                <button onClick={onClickedOkay} className="cn-9 fw-6 br-4 mr-16">
                    Okay
                </button>
                <button
                    className="br-4 token__dont-show en-0 bw-1 transparent pl-4 pr-4"
                    onClick={onClickedDontShowAgain}
                >
                    Don't show again
                </button>
            </div>
        </div>
    )
}

export default GettingStartedCard
