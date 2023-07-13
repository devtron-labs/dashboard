import React from 'react'
import ErrorImage from '../../../../assets/img/ic-empty-error@2x.png'
import EmptyStateImage from '../../../../assets/img/app-not-deployed.png'
import NoEligibleCommit from '../../../../assets/gif/no-eligible-commit.gif'
import NoResults from '../../../../assets/img/empty-noresult@2x.png'
import { ReactComponent as NextIcon } from '../../../../assets/icons/ic-arrow-right.svg'
import { EmptyStateCIMaterialProps } from './types'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from './Constants'
import { DOCKER_FILE_ERROR_MESSAGE, SOURCE_NOT_CONFIGURED_MESSAGE } from '../../../../config'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'

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
        } else if (isDockerFileError) {
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
        } else if (isBranchError) {
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
        } else if (noSearchResults) {
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
        } else if (!anyCommit && !showAllCommits) {
            return {
                img: NoEligibleCommit,
                title: <h1 className="dc__empty-title">{CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitEligibleCommit}</h1>,
                subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitEligibleCommitSubtitle,
                link: <span data-testid="show-excluded-commits-button" className="dc__link dc__underline dc__block cursor" onClick={toggleExclude}>{CI_MATERIAL_EMPTY_STATE_MESSAGING.NoCommitEligibleCommitButtonText}</span>,
                cta: null,
            }
        } else if (!anyCommit) {
            return {
                img: EmptyStateImage,
                title: <h1 className="dc__empty-title">{CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFound}</h1>,
                subtitle: CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFoundSubtitle,
                cta: null,
                link: null,
            }
        } else {
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
    }

    const handleMaterialLoadingButton = () => {
        return (
            <span className="dc__link cursor" onClick={toggleWebHookModal}>
                {CI_MATERIAL_EMPTY_STATE_MESSAGING.WebhookModalCTA}
            </span>
        )
    }

    const { title, subtitle, img, cta, link } = getData()
    return isMaterialLoading ? ( 
            <GenericEmptyState SvgImage="" image={EmptyStateImage} title={CI_MATERIAL_EMPTY_STATE_MESSAGING.Loading} />
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
                SvgImage=""
                isButtonAvailable={isWebHook}
                renderButton={handleMaterialLoadingButton}
            />
    )
}
