import React, { useEffect, useState } from 'react'
import HelmCollage from '../../assets/img/helm-collage.png'
import DeployCICD from '../../assets/img/guide-onboard.png'
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom'
import { DOCUMENTATION, SERVER_MODE, URLS } from '../../config'
import './onboardingGuide.scss'
import PreviewImage from '../../assets/img/ic-preview.png'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { OnboardingGuideProps } from '../common/guidePage/onboarding.type'
import { OnClickedHandler, POSTHOG_EVENT_ONBOARDING}  from './onboarding.utils'


function OnboardingGuide({ loginCount, serverMode, onClickedDeployManageCardClicked }: OnboardingGuideProps) {
    const match = useRouteMatch()
    const history = useHistory()

    const onClickCloseButton = () => {
        history.goBack()
    }

    const redirectDeployCardToCICD = (): string => {
        if (serverMode === SERVER_MODE.FULL) {
            return `${URLS.APP}/${URLS.APP_LIST}`
        } else {
            return `${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=cicd`
        }
    }

    const onClickedCICD = () => {
        if (serverMode === SERVER_MODE.FULL) {
            OnClickedHandler(POSTHOG_EVENT_ONBOARDING.DEPLOY_CUSTOM_APP_CI_CD)
        } else {
            OnClickedHandler(POSTHOG_EVENT_ONBOARDING.INSTALL_CUSTOM_CI_CD)
        }
    }



    return (
        <div className="onboarding-container h-100">
            <div className="onboarding__upper bc-window bcn-1">
                {loginCount > 1 && (
                    <button type="button" className="w-100 flex right transparent p-20" onClick={onClickCloseButton}>
                        <Close className="icon-dim-24" />
                    </button>
                )}
                <div className="flex column">
                    <h1 className="fw-6 mb-8">What will you use devtron for?</h1>
                    <p className="fs-14 cn-7">This will help us in guiding you towards relevant product features</p>
                </div>
            </div>
            <div className="bcn-0 onboarding__bottom flex position-rel cn-9">
                <div className= "onboarding__abs"  >
                    <div className="onboarding-cards__wrap">
                        <div className="onboarding-card bcn-0 w-300 br-4 en-2 bw-1 cursor">
                            <a
                                className="learn-more__href cn-9"
                                href={DOCUMENTATION.PREVIEW_DEVTRON}
                                rel="noreferrer noopener"
                                target="_blank"
                                onClick={() => OnClickedHandler(POSTHOG_EVENT_ONBOARDING.PREVIEW)}
                            >
                                <img className="onboarding-card__img top-radius-4" src={PreviewImage} />
                                <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                    Explore a preconfigured Demo app at <span className="cb-5">preview.devtron.ai</span>
                                </div>
                            </a>
                        </div>
                        <div className="onboarding__line" />
                        <div className="onboarding-card bcn-0 w-300 br-4 en-2 bw-1 cursor" onClick={onClickedDeployManageCardClicked}>
                            <NavLink
                                to={`${match.path}/${URLS.GUIDE}`}
                                className="no-decor fw-6 cursor cn-9"
                                activeClassName="active"
                            >
                                <img
                                    className="onboarding-card__img top-radius-4"
                                    src={HelmCollage}
                                    alt="Deploy and manage helm"
                                />
                                <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                    Deploy and manage helm applications
                                </div>
                            </NavLink>
                        </div>

                        <div className="onboarding-card bcn-0 w-300 br-4 en-2 bw-1 cursor">
                            <NavLink
                                to={redirectDeployCardToCICD()}
                                className="no-decor fw-6 cursor cn-9"
                                activeClassName="active"
                                onClick={onClickedCICD}
                            >
                                <img
                                    className="onboarding-card__img top-radius-4"
                                    src={DeployCICD}
                                    alt="Please connect cluster"
                                />
                                <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24">
                                    Deploy custom applications using CI/CD pipelines
                                </div>
                            </NavLink>
                        </div>
                    </div>
                    <div className="fs-14 mt-20 mb-20 flex column">
                        <NavLink to={`${URLS.APP}/${URLS.APP_LIST}`} className="guide_skip no-decor cb-5 fw-6 cursor mb-8">
                            Skip and explore Devtron on your own
                        </NavLink>
                        <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OnboardingGuide

