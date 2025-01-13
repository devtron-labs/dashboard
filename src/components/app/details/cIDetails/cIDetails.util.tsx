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
import notScanned from '../../../../assets/img/not-scanned.png'
import scannedDisabled from '../../../../assets/img/ic-empty-scanner-disabled.png'
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

export const CIRunningView = (props) => {
    return (
        <GenericEmptyState
            SvgImage={MechanicalOperation}
            title={EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.TITLE}
            subTitle={props.isSecurityTab ? null : EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.SUBTITLE}
        />
    )
}
