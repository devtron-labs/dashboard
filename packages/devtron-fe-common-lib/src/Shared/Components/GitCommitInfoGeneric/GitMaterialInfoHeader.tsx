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

import { CiPipelineSourceConfig } from '../CICDHistory/CiPipelineSourceConfig'
import './gitCommitInfoGeneric.scss'

/* eslint-disable react/prop-types */
function getGitIcon(repoUrl) {
    // eslint-disable-next-line no-restricted-syntax
    for (const gitProvider of ['github', 'gitlab', 'bitbucket']) {
        if (repoUrl.includes(gitProvider)) {
            return `${gitProvider}`
        }
    }
    return 'git'
}

const GitMaterialInfoHeader = ({
    index,
    repoUrl = '',
    materialType = '',
    materialValue = '',
    style = {},
    ...props
}) => {
    // eslint-disable-next-line no-param-reassign
    repoUrl = repoUrl.replace('.git', '')
    const tokens = repoUrl.split('/')
    const { length, [length - 1]: repo } = tokens
    return (
        <div
            {...props}
            className="git-commit-info-generic__header px-16 py-12 dc__box-shadow fs-12 fw-6 dc__gap-4"
            style={style}
        >
            <div className={getGitIcon(repoUrl)} />
            <div className="flex left left dc__gap-4 fs-13">
                <div
                    className="repo cn-9 fw-6 dc__mxw-250 dc__ellipsis-right"
                    data-testid={`deployment-history-source-code-repo${index}`}
                >
                    {repo}
                </div>
                <div className="branch flex left cn-7 dc__gap-4">
                    <span>/</span>
                    <CiPipelineSourceConfig sourceType={materialType} sourceValue={materialValue} showTooltip />
                </div>
            </div>
        </div>
    )
}

export default GitMaterialInfoHeader
