import React from 'react'
import './onboardingGuide.css'
import HelmCollage from '../../assets/img/helm-collage.png'
import DeployCICD from '../../assets/img/guide-onboard.png'
import { NavLink, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../config'
import ReactGA from 'react-ga'

function OnboardingGuide() {
    const match = useRouteMatch()

    return (
        <div className="guide-container">
            <div className="flex h-300 guide-header column">
                <h1 className="fw-6 mb-8">What will you use devtron for?</h1>
                <p className="fs-14 cn-7">This will help us in guiding you towards relevant product features</p>
            </div>
            <div className="bcn-0 guide-body flex">
                <div>
                    <div className="guide-cards__wrap">
                        <NavLink
                            to={`${match.url}/${URLS.GUIDE}`}
                            className="guide-card guide-card__left w-300 br-4 en-2 bw-1 cursor"
                            activeClassName="active"
                            // onClick={(event) => {
                            //     ReactGA.event({
                            //         category: 'Onboarding',
                            //         action: 'Onboarding Guide Clicked',
                            //     })
                            // }}
                        >
                            <img
                                className="guide-card__img"
                                src={HelmCollage}
                                width="250"
                                height="250"
                                alt="Please connect cluster"
                            />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24">
                                Deploy and manage helm applications
                            </div>
                        </NavLink>
                        <div className="guide-card guide-card__right w-300 br-4 en-2 bw-1 cursor">
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
                {/* <div className="fs-14 mt-20">
                    <div className="cb-5  fw-6">Skip and explore Devtron on your own</div>
                    <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                </div> */}
            </div>
        </div>
    )
}

export default OnboardingGuide
