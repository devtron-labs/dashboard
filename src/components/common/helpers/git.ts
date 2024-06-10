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

export function createGitCommitUrl(url: string, revision: string): string {
    if (!url || !revision) {
        return 'NA'
    }
    if (url.indexOf('gitlab') > 0 || url.indexOf('github') > 0 || url.indexOf('azure') > 0) {
        const urlpart = url.split('@')
        if (urlpart.length > 1) {
            return `https://${urlpart[1].split('.git')[0].replace(':', '/')}/commit/${revision}`
        }
        if (urlpart.length == 1) {
            return `${urlpart[0].split('.git')[0]}/commit/${revision}`
        }
    }
    if (url.indexOf('bitbucket') > 0) {
        const urlpart = url.split('@')
        if (urlpart.length > 1) {
            return `https://${urlpart[1].split('.git')[0].replace(':', '/')}/commits/${revision}`
        }
        if (urlpart.length == 1) {
            return `${urlpart[0].split('.git')[0]}/commits/${revision}`
        }
    }
    return 'NA'
}
