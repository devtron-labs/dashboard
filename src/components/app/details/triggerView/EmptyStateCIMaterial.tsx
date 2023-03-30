import React from 'react'
import ErrorImage from '../../../../assets/img/ic-empty-error@2x.png'
import EmptyStateImage from '../../../../assets/img/app-not-deployed.png'
import NoResults from '../../../../assets/img/empty-noresult@2x.png'
import { ReactComponent as NextIcon } from '../../../../assets/icons/ic-arrow-right.svg'
import { EmptyStateCIMaterialProps } from './types'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from './Constants'
import { DOCKER_FILE_ERROR_MESSAGE, SOURCE_NOT_CONFIGURED_MESSAGE } from '../../../../config'
import { EmptyState } from '@devtron-labs/devtron-fe-common-lib'

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
    toggleWebHookModal,
    clearSearch,
    handleGoToWorkFlowEditor,
}: EmptyStateCIMaterialProps) {
    const getData = () => {
        if (isRepoError) {
            return {
                img: (
                    <img
                        src={ErrorImage}
                        alt={CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitAltText}
                        className="empty-state__img--ci-material"
                    />
                ),
                title: <h1 className="dc__empty-title">{repoErrorMsg}</h1>,
                subtitle: (
                    <a href={repoUrl} rel="noopener noreferrer" target="_blank">
                        {repoUrl}
                    </a>
                ),
                cta: null,
            }
        } else if (isDockerFileError) {
            return {
                img: <img src={ErrorImage} alt="no commits found" className="empty-state__img--ci-material" />,
                title: <h1 className="dc__empty-title">{dockerFileErrorMsg}</h1>,
                subtitle: DOCKER_FILE_ERROR_MESSAGE,
                cta:
                    repoUrl?.length === 0 ? (
                        <button className="cta flex" onClick={handleGoToWorkFlowEditor}>
                            Configure Source
                            <NextIcon className="icon-dim-16 ml-5 scn-0" />
                        </button>
                    ) : null,
            }
        } else if (isBranchError) {
            return {
                img: <img src={ErrorImage} alt="no commits found" className="empty-state__img--ci-material" />,
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
            }
        } else if (noSearchResults) {
            return {
                img: (
                    <img
                        src={NoResults}
                        alt={CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitAltText}
                        className="empty-state__img--ci-material"
                    />
                ),
                title: <h1 className="dc__empty-title dc__word-break-all">{noSearchResultsMsg}</h1>,
                subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.NoSearchResults,
                cta: (
                    <button type="button" className="cta ghosted small" onClick={clearSearch}>
                        {CI_MATERIAL_EMPTY_STATE_MESSAGING.ClearSearch}
                    </button>
                ),
            }
        } else if (!anyCommit) {
            return {
                img: (
                    <img
                        src={EmptyStateImage}
                        alt={CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitAltText}
                        className="empty-state__img--ci-material"
                    />
                ),
                title: <h1 className="dc__empty-title">{CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFound}</h1>,
                subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFoundSubtitle,
                cta: null,
            }
        } else {
            return {
                img: (
                    <img
                        src={ErrorImage}
                        alt={CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitAltText}
                        className="empty-state__img--ci-material"
                    />
                ),
                title: <h1 className="dc__empty-title">{CI_MATERIAL_EMPTY_STATE_MESSAGING.FailedToFetch}</h1>,
                subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.FailedToFetchSubtitle,
                cta: (
                    <button type="button" className="cta ghosted small" onClick={onRetry}>
                        {CI_MATERIAL_EMPTY_STATE_MESSAGING.Retry}
                    </button>
                ),
            }
        }
    }

    const { title, subtitle, img, cta } = getData()
    return isMaterialLoading ? (
        <EmptyState>
            <EmptyState.Loading text={CI_MATERIAL_EMPTY_STATE_MESSAGING.Loading} />
        </EmptyState>
    ) : (
        <EmptyState>
            <EmptyState.Image>{img}</EmptyState.Image>
            <EmptyState.Title>{title}</EmptyState.Title>
            <EmptyState.Subtitle className="mb-0">{subtitle}</EmptyState.Subtitle>
            <EmptyState.Button>{cta}</EmptyState.Button>
            {isWebHook && (
                <EmptyState.Button>
                    <span className="dc__link cursor" onClick={toggleWebHookModal}>
                        {CI_MATERIAL_EMPTY_STATE_MESSAGING.WebhookModalCTA}
                    </span>
                </EmptyState.Button>
            )}
        </EmptyState>
    )
}
