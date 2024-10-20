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
import { IMAGE_SCAN_TOOL, SCAN_TOOL_ID_TRIVY } from '../../constants'
import { ScannedByToolModalProps } from './types'
import { ReactComponent as ICClair } from '../../../Assets/Icon/ic-clair.svg'
import { ReactComponent as ICTrivy } from '../../../Assets/Icon/ic-trivy.svg'

const ScannedByToolModal: React.FC<ScannedByToolModalProps> = ({
    scanToolId,
    fontSize = 13,
    spacingBetweenTextAndIcon = 6,
}) => {
    const isTrivy = scanToolId === SCAN_TOOL_ID_TRIVY

    return (
        <div className="flexbox" style={{ gap: `${spacingBetweenTextAndIcon}px` }}>
            <span className={`dc__italic-font-style fs-${fontSize}`}>
                Scanned by
                <span className="fw-6 ml-4" data-testid="scanned-by-tool">
                    {isTrivy ? IMAGE_SCAN_TOOL.Trivy : IMAGE_SCAN_TOOL.Clair}
                </span>
            </span>
            {isTrivy ? (
                <ICTrivy className="icon-dim-20 dc__no-shrink" />
            ) : (
                <ICClair className="icon-dim-20 dc__no-shrink" />
            )}
        </div>
    )
}

export default ScannedByToolModal
