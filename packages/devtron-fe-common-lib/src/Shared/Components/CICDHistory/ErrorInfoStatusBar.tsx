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

import { ReactComponent as Error } from '../../../Assets/Icon/ic-error-exclamation.svg'
import { ErrorInfoStatusBarType } from './types'
import { TIMELINE_STATUS } from '../../constants'

export const ErrorInfoStatusBar = ({
    nonDeploymentError,
    type,
    errorMessage,
    hideVerticalConnector,
    hideErrorIcon,
}: ErrorInfoStatusBarType) =>
    nonDeploymentError === type ? (
        <>
            <div
                className={`bcr-1 ${
                    type === TIMELINE_STATUS.HELM_MANIFEST_PUSHED_TO_HELM_REPO ? 'fs-13' : 'flex left'
                } ${!hideErrorIcon ? 'er-2 br-4 bw-1' : ''} p-8`}
            >
                {!hideErrorIcon && <Error className="icon-dim-20 mr-8" />}
                {errorMessage}
                {type === TIMELINE_STATUS.HELM_MANIFEST_PUSHED_TO_HELM_REPO && (
                    <ol className="m-0 pl-20">
                        <li>Ensure provided repository path is valid</li>
                        <li>Check if credentials provided for OCI registry are valid and have PUSH permission</li>
                    </ol>
                )}
            </div>
            {!hideVerticalConnector && <div className="vertical-connector" />}
        </>
    ) : null
