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

// Adding BITBUCKET_DC to GitProviderType Avoid adding directly as it will add Tab to GitProviderTab
export type GitProviderType = GitProvider | 'BITBUCKET_DC'

export interface GitProviderTabProps {
    /**
     * Currently selected tab
     */
    providerTab?: GitProviderType
    isTabChecked: boolean
    /**
     * Acts as handleChange on radio tab
     */
    handleGitopsTab: (e) => void
    /**
     * Based on this would showCheck of previous selected on tab
     */
    lastActiveTabName: GitProviderType
    /**
     * Value of tab to be rendered
     */
    provider: GitProvider
    /**
     * If true would disable radio tab
     */
    saveLoading: boolean
    dataTestId: string
}
