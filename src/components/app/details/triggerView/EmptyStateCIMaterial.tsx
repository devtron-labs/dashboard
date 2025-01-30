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

import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import ErrorImage from '../../../../assets/img/ic-empty-error@2x.png'
import EmptyStateImage from '../../../../assets/img/app-not-deployed.svg'
import NoEligibleCommit from '../../../../assets/gif/ic-no-eligible-commit.svg'
import NoResults from '../../../../assets/img/empty-noresult@2x.png'
import { ReactComponent as NextIcon } from '../../../../assets/icons/ic-arrow-right.svg'
import { EmptyStateCIMaterialProps } from './types'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from './Constants'
import { DOCKER_FILE_ERROR_MESSAGE, SOURCE_NOT_CONFIGURED_MESSAGE } from '../../../../config'
import { ReceivedWebhookRedirectButton } from '@Components/common/helpers/GitInfoMaterialCard/ReceivedWebhookRedirectButton'

export default function EmptyStateCIMaterial({
    isRepoError,
    isBranchError,
    isDockerFileError,
    dockerFileErrorMsg,
    repoUrl,
    branchErrorMsg,
    repoErrorMsg,
    isMaterialLoading,
    onRetry,
    anyCommit,
    isWebHook,
    noSearchResults,
    noSearchResultsMsg,
    clearSearch,
    handleGoToWorkFlowEditor,
    showAllCommits,
    toggleExclude,
}: EmptyStateCIMaterialProps) {
    const getData = () => {
        if (isRepoError) {
            return {
                img: ErrorImage,
                title: <h1 className="dc__empty-title">{repoErrorMsg}</h1>,
                subtitle: (
                    <a href={repoUrl} rel="noopener noreferrer" target="_blank">
                        {repoUrl}
                    </a>
                ),
                cta: null,
                link: null,
            }
        }
        if (isDockerFileError) {
            return {
                img: ErrorImage,
                title: <h1 className="dc__empty-title">{dockerFileErrorMsg}</h1>,
                subtitle: DOCKER_FILE_ERROR_MESSAGE,
                cta:
                    repoUrl?.length === 0 ? (
                        <button className="cta flex" onClick={handleGoToWorkFlowEditor}>
                            Configure Source
                            <NextIcon className="icon-dim-16 ml-5 scn-0" />
                        </button>
                    ) : null,
                link: null,
            }
        }
        if (isBranchError) {
            return {
                img: ErrorImage,
                title: <h1 className="dc__empty-title">{branchErrorMsg}</h1>,
                subtitle: repoUrl ? (
                    <a href={repoUrl} rel="noopener noreferrer" target="_blank" className="">
                        {repoUrl}
                    </a>
                ) : (
                    SOURCE_NOT_CONFIGURED_MESSAGE
                ),
                cta:
                    repoUrl?.length === 0 ? (
                        <button className="cta flex" onClick={handleGoToWorkFlowEditor}>
                            Configure Source
                            <NextIcon className="icon-dim-16 ml-5 scn-0" />
                        </button>
                    ) : null,
                link: null,
            }
        }
        if (noSearchResults) {
            return {
                img: NoResults,
                title: <h1 className="dc__empty-title dc__word-break-all">{noSearchResultsMsg}</h1>,
                subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.NoSearchResults,
                cta: (
                    <button type="button" className="cta ghosted small" onClick={clearSearch}>
                        {CI_MATERIAL_EMPTY_STATE_MESSAGING.ClearSearch}
                    </button>
                ),
                link: null,
            }
        }
        if (!anyCommit && !showAllCommits) {
            return {
                img: NoEligibleCommit,
                title: <h1 className="dc__empty-title">{CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitEligibleCommit}</h1>,
                subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitEligibleCommitSubtitle,
                link: (
                    <span
                        data-testid="show-excluded-commits-button"
                        className="dc__link dc__underline dc__block cursor"
                        onClick={toggleExclude}
                    >
                        {CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitEligibleCommitButtonText}
                    </span>
                ),
                cta: null,
            }
        }
        if (!anyCommit) {
            return {
                img: EmptyStateImage,
                title: <h1 className="dc__empty-title">{CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFound}</h1>,
                subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFoundSubtitle,
                cta: null,
                link: null,
            }
        }
        return {
            img: ErrorImage,
            title: <h1 className="dc__empty-title">{CI_MATERIAL_EMPTY_STATE_MESSAGING.FailedToFetch}</h1>,
            subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.FailedToFetchSubtitle,
            cta: (
                <button type="button" className="cta ghosted small" onClick={onRetry}>
                    {CI_MATERIAL_EMPTY_STATE_MESSAGING.Retry}
                </button>
            ),
            link: null,
        }
    }

    const handleMaterialLoadingButton = () => {
        return (
            <ReceivedWebhookRedirectButton />
        )
    }

    const { title, subtitle, img, cta, link } = getData()
    return isMaterialLoading ? (
        <GenericEmptyState image={EmptyStateImage} title={CI_MATERIAL_EMPTY_STATE_MESSAGING.Loading} />
    ) : (
        <GenericEmptyState
            image={img}
            title={title}
            subTitle={
                <>
                    {subtitle}
                    {link}
                </>
            }
            isButtonAvailable={isWebHook}
            renderButton={handleMaterialLoadingButton}
        />
    )
}
