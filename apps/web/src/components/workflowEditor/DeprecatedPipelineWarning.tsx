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

import React from 'react'
import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { DEPRECATED_EXTERNAL_CI_MESSAGE, DOCUMENTATION } from '../../config'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'

export default function DeprecatedPipelineWarning() {
    const ExternalSecretHelpNote = () => {
        return (
            <div className="fs-13 fw-4 lh-18">
                {`${DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_ONE} ${DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_TWO} ${DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_THREE}`}
                &nbsp;
                <a className="dc__link" href={DOCUMENTATION.WEBHOOK_CI} rel="noreferrer noopener" target="_blank">
                    {DEPRECATED_EXTERNAL_CI_MESSAGE.DOC_LINK_TEXT}
                </a>
            </div>
        )
    }
    return (
        <InfoColourBar
            message={<ExternalSecretHelpNote />}
            classname="warn dc__no-border-radius dc__no-border"
            Icon={Warn}
            iconClass="warning-icon"
        />
    )
}
