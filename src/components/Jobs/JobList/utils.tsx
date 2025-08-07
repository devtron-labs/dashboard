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

import { FeatureTitleWithInfo } from '@devtron-labs/devtron-fe-common-lib'

const renderAppGroupDescriptionContent = () =>
    'Job allows execution of repetitive tasks in a manual or automated manner. Execute custom tasks or choose from a library of preset plugins in your job pipeline.'

export const renderAdditionalJobsHeaderInfo = () => (
    <FeatureTitleWithInfo
        title="Jobs"
        docLink="JOBS"
        renderDescriptionContent={renderAppGroupDescriptionContent}
        showInfoIconTippy
    />
)
