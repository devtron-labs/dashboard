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
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import emptyNoResults from '../../assets/img/empty-noresult@2x.png'
import { EMPTY_LIST_MESSAGING } from './Constants'
import { EmptyEnvState } from './AppGroup.types'

export default function EnvEmptyStates({ title, subTitle, actionHandler }: EmptyEnvState) {
    const EnvEmptyStatesButton = () => {
        return actionHandler ? (
            <button onClick={actionHandler} className="saved-filter__clear-btn dc__saved-filter__clear-btn--dark">
                Clear filters
            </button>
        ) : null
    }
    return (
        <GenericEmptyState
            image={emptyNoResults}
            title={title || EMPTY_LIST_MESSAGING.NO_MATCHING_ENV}
            subTitle={subTitle || EMPTY_LIST_MESSAGING.NO_MATCHING_RESULT}
            isButtonAvailable
            renderButton={EnvEmptyStatesButton}
        />
    )
}
