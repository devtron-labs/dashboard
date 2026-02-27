import type { JSX } from 'react'

import {
    Button,
    ButtonVariantType,
    EMPTY_STATE_STATUS,
    GenericEmptyState,
    GenericFilterEmptyState,
    getIsApprovalPolicyConfigured,
} from '@devtron-labs/devtron-fe-common-lib'

import noArtifact from '@Images/no-artifact.webp'
import { importComponentFromFELibrary } from '@Components/common'

import { MaterialListEmptyStateProps } from './types'
import { getAllowWarningWithTippyNodeTypeProp, getIsCDTriggerBlockedThroughConsequences } from './utils'

const MissingPluginBlockState = importComponentFromFELibrary('MissingPluginBlockState', null, 'function')
const TriggerBlockEmptyState = importComponentFromFELibrary('TriggerBlockEmptyState', null, 'function')
const ApprovalEmptyState = importComponentFromFELibrary('ApprovalEmptyState')

const MaterialListEmptyState = ({
    isRollbackTrigger,
    stageType,
    appId,
    isSearchApplied,
    policyConsequences,
    isTriggerBlockedDueToPlugin,
    configurePluginURL,
    isConsumedImagePresent,
    envName,
    materialResponse,
    isExceptionUser,
    isLoadingMore,
    viewAllImages,
    triggerType,
    loadOlderImages,
    onSearchApply,
    eligibleImagesCount,
    handleEnableFiltersView,
    handleAllImagesView,
}: MaterialListEmptyStateProps) => {
    const allowWarningWithTippyNodeTypeProp = getAllowWarningWithTippyNodeTypeProp(stageType)
    const material = materialResponse?.materials || []
    const isApprovalConfigured = getIsApprovalPolicyConfigured(
        materialResponse?.deploymentApprovalInfo?.approvalConfigData,
    )
    const areNoMoreImagesPresent = materialResponse && material.length >= materialResponse.totalCount
    const resourceFilters = materialResponse?.resourceFilters ?? []

    const clearSearch = () => {
        onSearchApply('')
    }

    const renderFilterEmptyStateSubtitle = (): JSX.Element => (
        <p className="m-0 flex cn-8 fs-13 fw-4 lh-20">
            <button
                className="dc__no-background p-0 dc__outline-none-imp dc__no-border dc__border-bottom-imp mr-4"
                type="button"
                onClick={handleEnableFiltersView}
            >
                Filter
            </button>
            is applied on
            <button
                className="dc__no-background p-0 dc__outline-none-imp dc__no-border dc__border-bottom-imp ml-4 mb-neg-1"
                type="button"
                onClick={handleAllImagesView}
            >
                {` latest ${material.length} images`}
            </button>
        </p>
    )

    const renderLoadMoreButton = () => (
        <Button
            dataTestId="fetch-more-images"
            text="Fetch more images"
            onClick={loadOlderImages}
            isLoading={isLoadingMore}
            fullWidth
            variant={ButtonVariantType.secondary}
        />
    )

    if (isTriggerBlockedDueToPlugin && MissingPluginBlockState) {
        return (
            <MissingPluginBlockState
                configurePluginURL={configurePluginURL}
                nodeType={allowWarningWithTippyNodeTypeProp}
            />
        )
    }

    if (TriggerBlockEmptyState && getIsCDTriggerBlockedThroughConsequences(policyConsequences?.cd, stageType)) {
        return <TriggerBlockEmptyState appId={appId} stageType={stageType} />
    }

    if (
        resourceFilters?.length &&
        !eligibleImagesCount &&
        !isSearchApplied &&
        material.length - Number(isConsumedImagePresent) > 0
    ) {
        return (
            <GenericEmptyState
                image={noArtifact}
                title="No eligible image found"
                subTitle={renderFilterEmptyStateSubtitle()}
                isButtonAvailable={!areNoMoreImagesPresent}
                renderButton={renderLoadMoreButton}
            />
        )
    }

    if (isSearchApplied) {
        return (
            <GenericFilterEmptyState
                handleClearFilters={clearSearch}
                title="No matching image available"
                subTitle="We couldn't find any matching image"
            />
        )
    }

    if (ApprovalEmptyState && isApprovalConfigured && !isExceptionUser) {
        return (
            <ApprovalEmptyState
                className="dc__skip-align-reload-center"
                consumedImagePresent={isConsumedImagePresent}
                triggerType={triggerType}
                isRollbackTrigger={isRollbackTrigger}
                envName={envName}
                viewAllImages={viewAllImages}
            />
        )
    }

    return (
        <GenericEmptyState
            image={noArtifact}
            title={EMPTY_STATE_STATUS.CD_MATERIAL.TITLE}
            subTitle={
                isRollbackTrigger
                    ? 'Previously deployed images will be available here for rollback.'
                    : 'Please Trigger CI Pipeline and find the image here for deployment.'
            }
        />
    )
}

export default MaterialListEmptyState
