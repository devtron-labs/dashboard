import React, { Fragment } from 'react'
import GettingToast from '../../../assets/img/lifebuoy.png'
import './gettingStarted.scss'

export interface GettingStartedType {
    className: string
    showHelpCard: boolean
    setShowHelpCard: React.Dispatch<React.SetStateAction<boolean>>
    hideGettingStartedCard: () => void
    loginCount: number
}

function GettingStarted({
    className,
    showHelpCard,
    setShowHelpCard,
    hideGettingStartedCard,
    loginCount,
}: GettingStartedType) {
    return (
        <div
            className={`${className} getting-started-card cn-0 p-20 br-8 fs-13 help-card__more-option`}
            onClick={() => setShowHelpCard(!showHelpCard)}
        >
            <img className="mb-12 icon-dim-32" src={GettingToast} alt="getting started icon" />
            <div className="flex column left fw-6">Getting started</div>
            <div>You can always access the Getting Started guide from here.</div>
            <div className="mt-12">
                <button onClick={hideGettingStartedCard} className="cn-9 fw-6 br-4 mr-16">Okay</button>
                <button className="br-4 token__dont-show en-0 bw-1 transparent pl-4 pr-4" onClick={hideGettingStartedCard}>
                    Don't show again
                </button>
            </div>
        </div>
    )
}

export default GettingStarted
