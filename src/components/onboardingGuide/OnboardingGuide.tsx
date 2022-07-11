import React from 'react'
import './onboardingGuide.css'
import HelmCollage from '../../assets/img/helm-collage.png'
import DeployCICD from '../../assets/img/guide-onboard.png'

function OnboardingGuide() {
    return (
        <div className="guide-container">
            <div className="flex h-300 guide-header column">
                <h1 className="fw-6 mb-8">What will you use devtron for?</h1>
                <p className="fs-14 cn-7">This will help us in guiding you towards relevant product features</p>
            </div>
            <div className="bcn-0 guide-body flex">
                <div className="guide-cards__wrap">
                    <div className="guide-card w-300 br-4 en-2 bw-1">
                        <img
                            className="guide-card__img"
                            src={HelmCollage}
                            width="250"
                            height="250"
                            alt="Please connect cluster"
                        />
                        <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24">Deploy and manage helm applications</div>
                    </div>
                    <div className="guide-card w-300 br-4 en-2 bw-1">
                        <img
                            className="guide-card__img"
                            src={DeployCICD}
                            width="250"
                            height="250"
                            alt="Please connect cluster"
                        />
                        <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24">
                            Deploy custom applications using CI/CD pipelines
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OnboardingGuide
