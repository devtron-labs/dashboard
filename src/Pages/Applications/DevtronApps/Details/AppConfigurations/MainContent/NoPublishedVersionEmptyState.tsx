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
import noArtifact from '@Images/no-artifact.webp'

import { NoPublishedVersionEmptyStateProps } from './types'

const NoPublishedVersionEmptyState = ({ isOverride = true }: NoPublishedVersionEmptyStateProps) => (
    <GenericEmptyState
        image={noArtifact}
        title="No published version"
        subTitle={`Published ${isOverride ? 'override' : ''} for this file does not exist`}
    />
)

export default NoPublishedVersionEmptyState
