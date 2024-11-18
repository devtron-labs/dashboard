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

import { sortCallback, GitProviderType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as GitLab } from '../../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../../assets/icons/git/bitbucket.svg'

export function subtractArray(a: any[], b: any[], key: string): any[] {
    if (!(a && a.length && a.length > 0)) {
        return []
    }
    const set = new Set()
    const result = []
    for (let bi = 0; bi < b.length; bi++) {
        set.add(b[bi][key])
    }
    for (let i = 0; i < a.length; i++) {
        if (set.has(a[i][key])) {
        } else {
            result.push(a[i])
        }
    }
    return result
}

export function isArrayEqual(a: any[], b: any[], key: string): boolean {
    if (a.length && b.length && key.length) {
        return false
    }

    if (a.length !== b.length) {
        return false
    }

    if (Array.isArray(a)) {
        a = a.sort((x, y) => {
            return sortCallback(key, x, y)
        })
    }

    if (Array.isArray(b)) {
        b = b.sort((x, y) => {
            return sortCallback(key, x, y)
        })
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i][key] !== b[i].length) {
            return false
        }
    }
    return true
}

export const swap = (array: any[], indexA: number, indexB: number) => {
    const temp = array[indexA]
    array[indexA] = array[indexB]
    array[indexB] = temp
}

export const getGitProviderIcon = (gitUrl: string, rootClassName?: string): JSX.Element => {
    let IconComponent: React.ElementType = Git // Using React.ElementType for any JSX component
    if(!gitUrl) return null
    if (gitUrl.includes(GitProviderType.GITLAB)) {
        IconComponent = GitLab
    } else if (gitUrl.includes(GitProviderType.GITHUB)) {
        IconComponent = GitHub
    } else if (gitUrl.includes(GitProviderType.BITBUCKET)) {
        IconComponent = BitBucket
    }

    return <IconComponent className={`icon-dim-20 ${rootClassName} mw-20`} />
}
