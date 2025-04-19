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

import emptyCustomChart from '../../../assets/img/empty-noresult@2x.png'
import { ResourceListEmptyStateType } from '../Types'

const ResourceListEmptyState = ({
    imgSource,
    title,
    subTitle,
    actionButtonText,
    actionHandler,
}: ResourceListEmptyStateType) => {
    const handleButton = () =>
        actionHandler ? (
            <button type="button" onClick={actionHandler} className="add-link cta flex">
                {actionButtonText ?? 'Clear filters'}
            </button>
        ) : null
    return (
        <GenericEmptyState
            classname="title dc__position-rel-imp"
            image={imgSource ?? emptyCustomChart}
            title={title ?? 'No resources found'}
            subTitle={subTitle}
            isButtonAvailable
            renderButton={handleButton}
        />
    )
}

export default ResourceListEmptyState
