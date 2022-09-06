import React, { useEffect } from 'react'
import HelmCollage from '../../assets/img/helm-collage.png'
import DeployCICD from '../../assets/img/guide-onboard.png'
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom'
import { PREVIEW_DEVTRON, SERVER_MODE, URLS } from '../../config'
import './onboardingGuide.scss'
import PreviewImage from '../../assets/img/ic-preview.png'
import { handlePostHogEventUpdate, LOGIN_COUNT, POSTHOG_EVENT_ONBOARDING } from './onboarding.utils'
import GuideCommonHeader from './GuideCommonHeader'
import { OnboardingGuideProps } from './OnboardingGuide.type'
import { updateLoginCount } from '../../services/service'

function OnboardingGuide({
    loginCount,
    serverMode,
    onClickedDeployManageCardClicked,
    isGettingStartedClicked,
}: OnboardingGuideProps) {

  useEffect(() => {
      if (loginCount === 0) {
          const updatedPayload = {
              key: LOGIN_COUNT,
              value: '1',
          }
          updateLoginCount(updatedPayload)
      }
  }, [])

    const match = useRouteMatch()
    const history = useHistory()

    const onClickCloseButton = () => {
        history.goBack()
    }

    const redirectDeployCardToCICD = (): string => {
      return  serverMode === SERVER_MODE.FULL
            ?`${URLS.APP}/${URLS.APP_LIST}`
            : `${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=cicd`
    }

    const onClickedCICD = (e) => {
        if (serverMode === SERVER_MODE.FULL) {
            handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.DEPLOY_CUSTOM_APP_CI_CD)
        } else {
            handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.INSTALL_CUSTOM_CI_CD)
        }
    }

    const onClickPreviewCard = (e) => {
        handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.PREVIEW)
    }

    return (
        <div className="onboarding-container h-100">
            <GuideCommonHeader
                loginCount={loginCount}
                title="What will you use devtron for?"
                subtitle="This will help us in guiding you towards relevant product features"
                onClickCloseButton={onClickCloseButton}
                isGettingStartedClicked={isGettingStartedClicked}
            />
            <div className="bcn-0 onboarding__bottom flex position-rel cn-9">
                <div className="onboarding__abs">
                    <div className="onboarding-cards__wrap">
                        <div className="onboarding-card bcn-0 w-300 br-4 en-2 bw-1 cursor">
                            <a
                                className="learn-more__href cn-9"
                                href={PREVIEW_DEVTRON}
                                rel="noreferrer noopener"
                                target="_blank"
                                onClick={onClickPreviewCard}
                            >
                                <img className="onboarding-card__img top-radius-4" src={PreviewImage} />
                                <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                    Explore a preconfigured Demo app at <span className="cb-5">preview.devtron.ai</span>
                                </div>
                            </a>
                        </div>
                        <div className="onboarding__line" />
                        <div
                            className="onboarding-card bcn-0 w-300 br-4 en-2 bw-1 cursor"
                            onClick={onClickedDeployManageCardClicked}
                        >
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
                    <div className="fs-14 mt-40 mb-20 flex column">
                        <NavLink
                            to={`${URLS.APP}/${URLS.APP_LIST}`}
                            className="guide_skip no-decor cb-5 fw-6 cursor mb-4"
                        >
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
