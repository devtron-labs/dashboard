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

import { memo } from 'react'

import {
    getCITriggerInfo,
    getParsedCIMaterialInfo,
    GitProviderIcon,
    Icon,
    LoadingCard,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as CommitIcon } from '../../../../assets/icons/ic-code-commit.svg'
import { DeployedCommitCardType } from './appDetails.type'

const DeployedCommitCard = ({ cardLoading, showCommitInfoDrawer, envId, ciArtifactId }: DeployedCommitCardType) => {
    const { data: materials, isLoading } = useQuery({
        queryFn: () => getCITriggerInfo({ envId, ciArtifactId }),
        queryKey: [envId, ciArtifactId],
        select: ({ result }) => getParsedCIMaterialInfo(result).materials ?? [],
    })

    if (cardLoading || isLoading) {
        return <LoadingCard />
    }

    if (materials.length === 0 || !materials[0].history[0]?.commit?.slice(0, 7)) {
        return null
    }

    return (
        <div className="flexbox deployed-commit-card">
            {materials.map((material) => {
                const lastCommit = material.history[0]

                return (
                    <div
                        data-testid="deployed-commit-card"
                        onClick={showCommitInfoDrawer}
                        className="app-details-info-card pointer flex left bg__primary br-8 mr-12 lh-20 w-200"
                    >
                        <div className="app-details-info-card__top-container flex">
                            <div className="app-details-info-card__top-container__content">
                                <div className="app-details-info-card__top-container__content__title-wrapper">
                                    <div className="fs-12 fw-4 cn-7 mr-5">Deployed commit</div>
                                    <Icon
                                        name="ic-help-outline"
                                        color="N500"
                                        size={14}
                                        tooltipProps={{
                                            alwaysShowTippyOnHover: true,
                                            content: 'Last deployment was triggered with this commit',
                                            className: 'dc__mxw-250',
                                        }}
                                    />
                                </div>
                                <div className="flex fs-12 fw-4">
                                    <CommitIcon className="icon-dim-20" />
                                    <div className="dc__ellipsis-right cn-7 ml-2 fw-4 fs-12 mono">
                                        {lastCommit?.commit?.slice(0, 7) ?? ''}
                                    </div>
                                </div>
                            </div>
                            <GitProviderIcon gitRepoUrl={lastCommit?.commitURL} size={24} />
                            {/* @TODO: This should be dynamic, dependent on the source */}
                        </div>
                        <div className="app-details-info-card__bottom-container dc__content-space">
                            <span className="app-details-info-card__bottom-container__message fs-12 fw-4">
                                {lastCommit?.message ?? ''}
                            </span>
                            <div className="app-details-info-card__bottom-container__details fs-12 fw-6">Details</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default memo(DeployedCommitCard)
