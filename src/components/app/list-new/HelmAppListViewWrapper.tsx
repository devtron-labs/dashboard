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

import { ComponentSizeType, DocLink, FiltersTypeEnum, TableViewWrapperProps, URLS as CommonURLS } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as InfoFillPurple } from '../../../assets/icons/ic-info-filled-purple.svg'
import { ReactComponent as ErrorExclamationIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
import HelmCluster from '../../../assets/img/guided-helm-cluster.png'
import DeployCICD from '../../../assets/img/guide-onboard.png'
import ContentCard from '../../common/ContentCard/ContentCard'
import { CardContentDirection, CardLinkIconPlacement } from '../../common/ContentCard/ContentCard.types'
import { HELM_GUIDED_CONTENT_CARDS_TEXTS } from '../../onboardingGuide/OnboardingGuide.constants'
import { SELECT_CLUSTER_FROM_FILTER_NOTE } from './Constants'
import { HelmAppListAdditionalProps, HelmAppListRowType } from './AppListType'
import { ModuleNameMap, URLS } from '../../../config'

export const HelmAppListViewWrapper = ({
    children,
    additionalProps,
}: TableViewWrapperProps<HelmAppListRowType, FiltersTypeEnum.URL, HelmAppListAdditionalProps>) => {
    const { showGuidedContentCards, externalHelmListFetchErrors, clusterIdsCsv, removeExternalAppFetchError } = additionalProps

    const renderFetchError = (externalHelmListFetchError: string, index: number) => (
        <div className="bg__primary" key={index}>
            <div className="h-8" />
            <div className="ea-fetch-error-message above-header-message flex left">
                <span className="mr-8 flex">
                    <ErrorExclamationIcon className="icon-dim-20" />
                </span>
                <span>{externalHelmListFetchError}</span>
                <CloseIcon
                    className="icon-dim-24 dc__align-right cursor"
                    onClick={() => removeExternalAppFetchError(index)}
                />
            </div>
        </div>
    )

    return (
        <div data-testid="helm-app-list-container">
            {!clusterIdsCsv && (
                <div className="bg__primary" data-testid="helm-app-list">
                    <div className="h-8" />
                    <div className="cluster-select-message-strip above-header-message flex left">
                        <span className="mr-8 flex">
                            <InfoFillPurple className="icon-dim-20" />
                        </span>
                        <div className="flexbox">
                            {SELECT_CLUSTER_FROM_FILTER_NOTE}&nbsp;
                            <DocLink
                                docLinkKey="HYPERION"
                                dataTestId="learn-more-about-hyperion-link"
                                size={ComponentSizeType.xs}
                            />
                        </div>
                    </div>
                </div>
            )}
            {externalHelmListFetchErrors.map((externalHelmListFetchError, index) =>
                renderFetchError(externalHelmListFetchError, index),
            )}
            {children}
            {showGuidedContentCards && (
                <div className="helm-app-guided-cards-wrapper">
                    <ContentCard
                        redirectTo={URLS.GLOBAL_CONFIG_CLUSTER}
                        direction={CardContentDirection.Horizontal}
                        imgSrc={HelmCluster}
                        title={HELM_GUIDED_CONTENT_CARDS_TEXTS.GlobalConfigCluster.title}
                        linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.GlobalConfigCluster.linkText}
                        LinkIcon={ArrowRight}
                        linkIconClass="scb-5"
                        linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                    />
                    <ContentCard
                        redirectTo={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=${ModuleNameMap.CICD}`}
                        direction={CardContentDirection.Horizontal}
                        imgSrc={DeployCICD}
                        title={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.title}
                        linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.installLinkText}
                        LinkIcon={ArrowRight}
                        linkIconClass="scb-5"
                        linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                    />
                </div>
            )}
        </div>
    )
}
