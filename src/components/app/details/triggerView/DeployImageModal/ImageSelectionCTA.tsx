import {
    Button,
    ButtonVariantType,
    ComponentSizeType,
    EXCLUDED_IMAGE_TOOLTIP,
    FilterStates,
    Icon,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { getIsMaterialApproved } from '../cdMaterials.utils'
import { ImageSelectionCTAProps } from './types'
import { getIsImageApprover } from './utils'

const ExpireApproval = importComponentFromFELibrary('ExpireApproval')

const ImageSelectionCTA = ({
    material,
    disableSelection,
    requestedUserId,
    reloadMaterials,
    appId,
    pipelineId,
    canApproverDeploy,
    isExceptionUser,
    handleImageSelection: handleImageSelectionProp,
}: ImageSelectionCTAProps) => {
    const isApprovalRequester =
        material.userApprovalMetadata?.requestedUserData &&
        material.userApprovalMetadata.requestedUserData.userId === requestedUserId
    const isImageApprover = getIsImageApprover(material.userApprovalMetadata)
    const isMaterialApproved = getIsMaterialApproved(material.userApprovalMetadata)

    const shouldRenderExpireApproval =
        isApprovalRequester &&
        !isImageApprover &&
        !disableSelection &&
        isMaterialApproved &&
        material.userApprovalMetadata?.canCurrentUserApprove

    const handleImageSelection = () => {
        handleImageSelectionProp(material.index)
    }

    const renderMaterialCTA = () => {
        if (material.filterState !== FilterStates.ALLOWED) {
            return (
                <Tooltip alwaysShowTippyOnHover placement="top" content={EXCLUDED_IMAGE_TOOLTIP}>
                    <i className="cr-5 fs-13 fw-4 lh-24 m-0 cursor-not-allowed">Excluded</i>
                </Tooltip>
            )
        }

        if (material.vulnerable) {
            return (
                <span
                    className="material-history__scan-error"
                    data-testid={`cd-artifact-vulnerability-disabled-${material.index}`}
                >
                    Security Issues Found
                </span>
            )
        }
        if (disableSelection || (!isExceptionUser && !canApproverDeploy && isImageApprover)) {
            return (
                <Tooltip
                    alwaysShowTippyOnHover
                    placement="top"
                    content={
                        disableSelection
                            ? 'An image can be deployed only once after it has been approved. This image would need to be approved again for it to be eligible for deployment.'
                            : 'This image was approved by you. An image cannot be deployed by its approver.'
                    }
                >
                    <span
                        className="dc__opacity-0_5"
                        data-testid={`cd-approval-artifact-select-disabled-${material.index}`}
                    >
                        SELECT
                    </span>
                </Tooltip>
            )
        }
        if (material.isSelected) {
            return <Icon name="ic-selected" color="B500" size={24} />
        }

        return (
            <Button
                dataTestId={`cd-artifact-select-${material.index}`}
                onClick={handleImageSelection}
                text="SELECT"
                size={ComponentSizeType.medium}
                variant={ButtonVariantType.text}
            />
        )
    }

    return (
        <>
            {shouldRenderExpireApproval && ExpireApproval && (
                <>
                    <ExpireApproval
                        matId={material.id}
                        appId={appId}
                        pipelineId={pipelineId}
                        userApprovalMetadata={material.userApprovalMetadata}
                        reloadMaterials={reloadMaterials}
                    />

                    {material.filterState !== FilterStates.ALLOWED && (
                        <div className="flex dc__gap-12 mr-12">
                            <div className="dc__divider h12" />
                        </div>
                    )}
                </>
            )}
            {renderMaterialCTA()}
        </>
    )
}

export default ImageSelectionCTA
