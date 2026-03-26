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

import { EMPTY_STATE_STATUS, Icon, IconName } from '@devtron-labs/devtron-fe-common-lib'

export const SecurityScanEmptyState = ({ title, subtitle, icon= "ic-warning" }: {
    title: string,
    subtitle: string,
    icon?: IconName
}) => {
    return (
        <div className="flex dc__border br-8 fs-13">
            <div className="flexbox-col dc__gap-12 dc__align-items-center p-20 w-300">
                <Icon name={icon} size={24} color="R500" />
                <div className="flex column dc__gap-4">
                    <div className="flex fw-6 cn-9 lh-20">{title}</div>
                    <div className="flex cn-8">{subtitle}</div>
                </div>
            </div>
        </div>
    )
}

export const ImageNotScannedView = (): JSX.Element => {
    return (
        <SecurityScanEmptyState
            title={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_NOT_SCANNED.TITLE}
            subtitle={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_NOT_SCANNED.SUBTITLE}
        />
    )
}

export const CIRunningView = (props): JSX.Element => {
    return (
        <SecurityScanEmptyState
            title={EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.TITLE}
            subtitle={props.isSecurityTab ? null : EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.SUBTITLE}
        />
    )
}