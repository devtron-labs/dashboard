/*
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { GitProvider } from './constants'

export const getProviderNameFromEnum = (provider: GitProvider, enableBitBucketSource?: boolean) => {
    switch (provider) {
        case GitProvider.GITHUB:
            return 'GitHub'
        case GitProvider.GITLAB:
            return 'GitLab'
        case GitProvider.AZURE_DEVOPS:
            return 'Azure'
        case GitProvider.BITBUCKET_CLOUD:
            return enableBitBucketSource ? 'Bitbucket' : 'Bitbucket Cloud'
        case GitProvider.AWS_CODE_COMMIT:
            return 'AWS Code Commit'
        default:
            return 'Other GitOps'
    }
}
