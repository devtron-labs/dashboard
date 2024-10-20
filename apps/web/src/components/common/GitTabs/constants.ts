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

export enum GitProvider {
    GITHUB = 'GITHUB',
    GITLAB = 'GITLAB',
    AWS_CODE_COMMIT = 'AWS_CODE_COMMIT',
    AZURE_DEVOPS = 'AZURE_DEVOPS',
    BITBUCKET_CLOUD = 'BITBUCKET_CLOUD',
    OTHER_GIT_OPS = 'OTHER_GIT_OPS',
}
