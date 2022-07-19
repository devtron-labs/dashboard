import React from 'react'
import HelmCollage from '../../assets/img/helm-collage.png'
import DeployCICD from '../../assets/img/guide-onboard.png'
import { NavLink, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../config'
import ReactGA from 'react-ga'
import './onboardingGuide.scss'

function OnboardingGuide() {
    const match = useRouteMatch()

    return (
        <div className="guide-container">
            <div className="flex h-300 guide-header column">
                <h1 className="fw-6 mb-8">What will you use devtron for?</h1>
                <p className="fs-14 cn-7">This will help us in guiding you towards relevant product features</p>
            </div>
            <div className="bcn-0 guide-body flex position-rel">
                <div className="guide-cards__wrap">
                    <div className="guide-card__left bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <NavLink
                            to={`${match.url}/${URLS.GUIDE}`}
                            className="no-decor fw-6 cursor"
                            activeClassName="active"
                        >
                            <img
                                className="guide-card__img"
                                src={HelmCollage}
                                width="250"
                                height="250"
                                alt="Please connect cluster"
                            />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                Deploy and manage helm applications
                            </div>
                        </NavLink>
                    </div>

                    <div className="guide-card__right bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <NavLink
                            to={`${match.url}/${URLS.GUIDE}`}
                            className="no-decor fw-6 cursor"
                            activeClassName="active"
                        >
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
                        </NavLink>
                    </div>
                </div>
                <div className="fs-14 mt-120 flex column">
                    <div className="cb-5 fw-6 cursor mb-8">Skip and explore Devtron on your own</div>
                    <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                </div>
            </div>
        </div>
    )
}

export default OnboardingGuide
