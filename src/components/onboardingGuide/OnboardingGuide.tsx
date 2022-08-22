import React, { useEffect } from 'react'
import HelmCollage from '../../assets/img/helm-collage.png'
import DeployCICD from '../../assets/img/guide-onboard.png'
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom'
import { DOCUMENTATION, URLS } from '../../config'
import './onboardingGuide.scss'
import PreviewImage from '../../assets/img/ic-preview.png'
import { getAppList } from '../app/service'

export interface OnboardingGuide {
  onClickSetActionButtonToTrue: () => void
}

function OnboardingGuide({onClickSetActionButtonToTrue}) {
    const match = useRouteMatch()
    const history = useHistory()

    const redirectToDeployGuide = (url) => {
        history.push(url)
    }

    return (
        <div className="guide-container">
            <div className="flex h-300 guide-header column">
                <h1 className="fw-6 mb-8">What will you use devtron for?</h1>
                <p className="fs-14 cn-7">This will help us in guiding you towards relevant product features</p>
            </div>
            <div className="bcn-0 onboarding-body flex position-rel cn-9">
                <div className="onboarding-cards__wrap">
                    <div className="guide-card__left bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <a
                            className="learn-more__href cn-9"
                            href={DOCUMENTATION.PREVIEW_DEVTRON}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <img className="guide-card__img" src={PreviewImage} width="250" height="250" />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                Explore a preconfigured Demo at <span className="cb-5">preview.devtron.ai</span>
                            </div>
                        </a>
                    </div>
                    <div className="guide-card__left bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <NavLink
                            to={`${match.path}/${URLS.GUIDE}`}
                            className="no-decor fw-6 cursor cn-9"
                            activeClassName="active"
                            onClick={() => redirectToDeployGuide(`/${URLS.GUIDE}`)}
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
                            to={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=cicd`}
                            className="no-decor fw-6 cursor cn-9"
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
                    <NavLink to={`${URLS.APP}/${URLS.APP_LIST}`} className="cb-5 fw-6 cursor mb-8" onClick={onClickSetActionButtonToTrue}>
                        Skip and explore Devtron on your own
                    </NavLink>
                    <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                </div>
            </div>
        </div>
    )
}

export default OnboardingGuide
