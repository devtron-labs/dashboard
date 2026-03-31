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

import { EMPTY_STATE_STATUS, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as MechanicalOperation } from '@Images/ic-mechanical-operation.svg'


export const CIRunningView = (props) => {
    return (
        <div className="flexbox-col p-16 bg__primary flex-grow-1 en-2 bw-1 br-8">
        <GenericEmptyState
            SvgImage={MechanicalOperation}
            title={EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.TITLE}
            subTitle={props.isSecurityTab ? null : EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.SUBTITLE}
        />
        </div>
    )
}