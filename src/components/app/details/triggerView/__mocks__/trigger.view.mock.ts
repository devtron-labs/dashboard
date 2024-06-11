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

import { CDModalTab } from '@devtron-labs/devtron-fe-common-lib'

const materialInfo = {
    author: 'Test User',
    branch: 'main',
    commitLink: 'https://github.com:ajaydevtron/devtron-test/commit/7c97426aa94528319578c898a732efbcecaf0758',
    message: 'mg test',
    modifiedTime: 'Tue, 24 Jan 2023, 11:19 PM',
    revision: '7c97426aa9452732efbcecaf0758',
    tag: '',
    url: 'git@github.com:testuser/devtron.git',
    webhookData: '{"Id":0,"EventActionType":"","Data":null}',
}

export const cdTriggerResponse = [
    {
        id: '651',
        deployedTime: 'Wed, 01 Mar 2023, 06:29 PM',
        deployedBy: '',
        wfrId: 0,
        tab: CDModalTab.Changes,
        image: '7c97426a-355-1147',
        showChanges: false,
        vulnerabilities: [],
        buildTime: '',
        isSelected: true,
        showSourceInfo: false,
        deployed: true,
        latest: true,
        vulnerabilitiesLoading: true,
        scanned: false,
        scanEnabled: false,
        vulnerable: false,
        runningOnParentCd: undefined,
        artifactStatus: 'Succeeded',
        materialInfo: [materialInfo],
        lastExecution: undefined,
    },
]
