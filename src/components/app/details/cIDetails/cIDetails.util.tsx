import React from 'react'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import notScanned from '../../../../assets/img/not-scanned.png'
import scannedDisabled from '../../../../assets/img/ic-empty-scanner-disabled.png'
import { ReactComponent as NoVulnerability } from '../../../../assets/img/ic-vulnerability-not-found.svg'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as Arrow } from '../../../../assets/icons/ic-arrow-forward.svg'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'

export const ScanDisabledView = (props) => {
    const renderScanedViewButton = () => {
        return (
            <button className="flex cta h-36" onClick={props.redirectToCreate}>
                Go to pipeline configurations
                <Arrow className="button__icon" />
            </button>
        )
    }
    return (
        <GenericEmptyState
            image={notScanned}
            title={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_NOT_SCANNED.TITLE}
            subTitle={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_SCANNED_DISABLED}
            isButtonAvailable
            renderButton={renderScanedViewButton}
            classname="dc__position-rel-imp"
        />
    )
}

export const ImageNotScannedView = () => {
    return (
        <GenericEmptyState
            image={scannedDisabled}
            title={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_NOT_SCANNED.TITLE}
            subTitle={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_NOT_SCANNED.SUBTITLE}
        />
    )
}

export const NoVulnerabilityView = () => {
    return (
        <GenericEmptyState
            SvgImage={NoVulnerability}
            title={EMPTY_STATE_STATUS.CI_DEATILS_NO_VULNERABILITY_FOUND}
            classname="dc__position-rel-imp"
        />
    )
}

export const CIRunningView = (props) => {
    return (
        <GenericEmptyState
            SvgImage={MechanicalOperation}
            title={EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.TITLE}
            subTitle={props.isSecurityTab ? null : EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.SUBTITLE}
        />
    )
}
