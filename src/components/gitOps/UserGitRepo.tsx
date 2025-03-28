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

import { FunctionComponent, SyntheticEvent } from 'react'
import {
    CustomInput,
    GitOpsAuthModeType,
    InfoBlock,
    RadioGroup,
    RadioGroupItem,
} from '@devtron-labs/devtron-fe-common-lib'
import './gitops.scss'
import { repoType } from '../../config/constants'
import { ReactComponent as Error } from '@Icons/ic-error-exclamation.svg'
import { UserGitRepoProps } from './gitops.type'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'

const UserGitRepo: FunctionComponent<UserGitRepoProps> = ({
    setRepoURL,
    staleData,
    repoURL,
    selectedRepoType,
    setSelectedRepoType,
    authMode,
}: UserGitRepoProps) => {
    const isAuthModeSSH = authMode === GitOpsAuthModeType.SSH

    const repoTypeChange = (event: SyntheticEvent) => {
        const newRepoType = (event.target as HTMLInputElement).value
        setSelectedRepoType(newRepoType)
    }

    const onChange = (event) => {
        setRepoURL(event.target.value)
    }

    const InputUrlBox = () => {
        const _repoUrl = repoURL
        return (
            <div className={`${!isAuthModeSSH ? 'ml-26' : ''} mt-8`}>
                <CustomInput
                    label="Git Repo URL"
                    required
                    name="name"
                    value={_repoUrl.trim()}
                    placeholder="Enter repository URL"
                    onChange={onChange}
                    disabled={staleData}
                    error={_repoUrl.length === 0 ? REQUIRED_FIELD_MSG : null}
                    autoFocus
                />
            </div>
        )
    }

    const renderInfoColorBar = () => (
        <div className="mb-16">
            <InfoBlock
                variant="warning"
                description="GitOps repository cannot be changed for this application once deployed."
            />
        </div>
    )

    return (
        <div className="pt-16 pl-20">
            <div className="form__row flex left">
                <div className="fw-4 fs-13 fcn-9">
                    Application deployment states are saved as manifest in a Git repository. ArgoCD uses these manifests
                    to sync with your live Kubernetes cluster.
                </div>

                {!isAuthModeSSH && (
                    <RadioGroup
                        className="radio-group-no-border mt-16"
                        name="trigger-type"
                        value={staleData ? repoType.DEFAULT : selectedRepoType}
                        onChange={repoTypeChange}
                    >
                        <div>
                            <RadioGroupItem value={repoType.DEFAULT} dataTestId="auto-create-repository">
                                Auto-create repository
                            </RadioGroupItem>
                            <div className="ml-26 cn-7 fs-12 fw-4">
                                Repository will be created automatically using application name
                            </div>
                        </div>
                        <div className="pt-12">
                            <RadioGroupItem value={!staleData ? repoType.CONFIGURE : ''} disabled={staleData}>
                                Commit manifest to a desired repository.
                            </RadioGroupItem>
                        </div>
                    </RadioGroup>
                )}

                {selectedRepoType === repoType.CONFIGURE && !staleData && InputUrlBox()}
                {staleData && (
                    <div className="pt-16">
                        <div className="br-4 bw-1 er-2 pt-10 pb-10 pl-16 pr-16 bcr-1 mb-16 flex left">
                            <Error className="icon-dim-20 mr-8" />
                            <div className="cn-9 fs-13">
                                Ability to commit manifest to a desired repository has been disabled. Please continue
                                with Auto-create repository.
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {!staleData && renderInfoColorBar()}
        </div>
    )
}

export default UserGitRepo
