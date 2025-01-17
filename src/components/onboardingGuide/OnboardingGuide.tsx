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

import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { AppListConstants, ModuleNameMap } from '@devtron-labs/devtron-fe-common-lib'
import HelmCollage from '../../assets/img/guided-helm-collage.png'
import HelmCluster from '../../assets/img/guided-helm-cluster.png'
import DeployCICD from '../../assets/img/guide-onboard.png'
import { SERVER_MODE, URLS } from '../../config'
import { ReactComponent as ArrowRight } from '../../assets/icons/ic-arrow-right.svg'
import { handlePostHogEventUpdate, LOGIN_COUNT, POSTHOG_EVENT_ONBOARDING } from './onboarding.utils'
import GuideCommonHeader from './GuideCommonHeader'
import { OnboardingGuideProps } from './OnboardingGuide.type'
import { updateLoginCount } from '../../services/service'
import './onboardingGuide.scss'
import ContentCard from '../common/ContentCard/ContentCard'
import { CardLinkIconPlacement } from '../common/ContentCard/ContentCard.types'
import {
    GUIDE_COMMON_HEADER,
    HELM_GUIDED_CONTENT_CARDS_TEXTS,
    SKIP_AND_EXPLORE_NOTE,
    TIP_RETURN_FROM_HELP_MENU,
} from './OnboardingGuide.constants'

export default function OnboardingGuide({ loginCount, serverMode, isGettingStartedClicked }: OnboardingGuideProps) {
    useEffect(() => {
        return () => {
            if (loginCount === 0) {
                const updatedPayload = {
                    key: LOGIN_COUNT,
                    value: '1',
                }
                updateLoginCount(updatedPayload)
            }
        }
    }, [])

    const redirectDeployCardToCICD = (): string => {
        return serverMode === SERVER_MODE.FULL
            ? `${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.DEVTRON_APPS}/${AppListConstants.CREATE_DEVTRON_APP_URL}`
            : `${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=${ModuleNameMap.CICD}`
    }

    const onClickHelmChart = (e) => {
        handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.BROWSE_HELM_CHART)
    }

    const onClickCluster = (e) => {
        handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.CONNECT_CLUSTER)
    }

    const onClickedCICD = (e) => {
        if (serverMode === SERVER_MODE.FULL) {
            handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.DEPLOY_CUSTOM_APP_CI_CD)
        } else {
            handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.INSTALL_CUSTOM_CI_CD)
        }
    }

    const handleSkipOnboarding = () => {
        const updatedPayload = {
            key: POSTHOG_EVENT_ONBOARDING.SKIP_AND_EXPLORE_DEVTRON,
            value: 'true',
        }
        updateLoginCount(updatedPayload)
    }

    const isFirstLogin = loginCount === 0 && !isGettingStartedClicked

    return (
        <div className="onboarding-container h-100">
            <GuideCommonHeader
                loginCount={loginCount}
                title={isFirstLogin ? GUIDE_COMMON_HEADER.welcomeText : GUIDE_COMMON_HEADER.title}
                subtitle={isFirstLogin ? '' : GUIDE_COMMON_HEADER.subtitle}
                isGettingStartedClicked={isGettingStartedClicked}
            />
            <div className="bg__primary onboarding__bottom flex dc__position-rel cn-9">
                <div className="onboarding__abs">
                    <div className="onboarding-cards__wrap">
                        <ContentCard
                            redirectTo={URLS.CHARTS_DISCOVER}
                            onClick={onClickHelmChart}
                            imgSrc={HelmCollage}
                            title={HELM_GUIDED_CONTENT_CARDS_TEXTS.ChartsDiscover.title}
                            linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.ChartsDiscover.linkText}
                            LinkIcon={ArrowRight}
                            linkIconClass="scb-5"
                            linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                            datatestid="Browse-hem-charts"
                        />
                        <ContentCard
                            redirectTo={URLS.GLOBAL_CONFIG_CLUSTER}
                            rootClassName={isFirstLogin ? 'ev-5' : ''}
                            onClick={onClickCluster}
                            imgSrc={HelmCluster}
                            title={HELM_GUIDED_CONTENT_CARDS_TEXTS.GlobalConfigCluster.title}
                            linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.GlobalConfigCluster.linkText}
                            LinkIcon={ArrowRight}
                            linkIconClass="scb-5"
                            linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                            datatestid="Connect-kubernetes-cluster"
                        />
                        <ContentCard
                            redirectTo={redirectDeployCardToCICD()}
                            onClick={onClickedCICD}
                            imgSrc={DeployCICD}
                            title={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.title}
                            linkText={
                                serverMode === SERVER_MODE.FULL
                                    ? HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.createLintText
                                    : HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.installLinkText
                            }
                            LinkIcon={ArrowRight}
                            linkIconClass="scb-5"
                            linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                            datatestid="create-application"
                        />
                    </div>
                    <div className="fs-14 mt-40 mb-20 flex column">
                        <NavLink
                            to={`${URLS.APP}/${URLS.APP_LIST}`}
                            className="guide_skip dc__no-decor cb-5 fw-6 cursor mb-4"
                            data-posthog={POSTHOG_EVENT_ONBOARDING.SKIP_AND_EXPLORE_DEVTRON}
                            onClick={handleSkipOnboarding}
                            data-testid="skip-explore-link"
                        >
                            {SKIP_AND_EXPLORE_NOTE}
                        </NavLink>
                        <div className="cn-7" data-testid="tip-return-from-help-menu">
                            {TIP_RETURN_FROM_HELP_MENU}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
