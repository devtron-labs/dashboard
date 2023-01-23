import React from 'react'
import ErrorImage from '../../../../assets/img/ic-empty-error@2x.png'
import EmptyStateImage from '../../../../assets/img/app-not-deployed.png'
import EmptyState from '../../../EmptyState/EmptyState'
import NoResults from '../../../../assets/img/empty-noresult@2x.png'
import { EmptyStateCIMaterialProps } from './types'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from './Constants'

export default function EmptyStateCIMaterial({
    isRepoError,
    isBranchError,
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
}: EmptyStateCIMaterialProps) {
    const getData = () => {
        if (isRepoError || isBranchError) {
            return {
                img: (
                    <img
                        src={ErrorImage}
                        alt={CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitAltText}
                        className="empty-state__img--ci-material"
                    />
                ),
                title: <h1 className="dc__empty-title">{isRepoError ? repoErrorMsg : branchErrorMsg}</h1>,
                subtitle: (
                    <a href={repoUrl} rel="noopener noreferrer" target="_blank">
                        {repoUrl}
                    </a>
                ),
                cta: null,
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
