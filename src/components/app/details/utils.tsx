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

import {
    DynamicDataTableRowDataType,
    DynamicDataTableRowType,
    getEmptyTagTableRow,
    TagsTableColumnsType,
    TagType,
} from '@devtron-labs/devtron-fe-common-lib'

const parseLabels = (currentLabelTags: TagType[]): DynamicDataTableRowType<TagsTableColumnsType>[] =>
    currentLabelTags.map((currentLabelTag) => ({
        data: {
            tagKey: {
                value: currentLabelTag.key,
                type: DynamicDataTableRowDataType.TEXT,
                props: {},
            },
            tagValue: {
                value: currentLabelTag.value,
                type: DynamicDataTableRowDataType.TEXT,
                props: {},
            },
        },
        id: (Date.now() * Math.random()).toString(16),
        customState: {
            propagateTag: currentLabelTag.propagate,
        },
    }))

export const getLabelTags = (currentLabelTags: TagType[]) =>
    currentLabelTags?.length ? parseLabels(currentLabelTags) : [getEmptyTagTableRow()]

export const projectChangeMessage = (): JSX.Element => (
    <>
        <span className="fs-13 fw-4 lh-20 cn-9">Project change may lead to:</span>
        <ol className="fs-13 fw-4 lh-20 cn-9 pl-20 pr-4 m-0">
            <li>Current users losing access to this application.</li>
            <li>
                Users getting an access to the application automatically, if they have an access to the selected
                project.
            </li>
        </ol>
    </>
)
