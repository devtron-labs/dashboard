import { InfoColourBar, RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { repoType } from '../../config/constants'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { ValidateForm } from '../common/ValidateForm/ValidateForm'

function UserGitRepo({
    selectedRepoType,
    setSelectedRepoType,
    setRepoURL,
    repoURL,
    displayValidation,
    errorInFetching,
}) {
    const repoTypeChange = () => {
        const newRepoType = selectedRepoType === repoType.DEFAULT ? repoType.CONFIGURE : repoType.DEFAULT
        setSelectedRepoType(newRepoType)
        if (displayValidation) {
            setSelectedRepoType(false)
        }
    }

    const onChange = (event) => {
        setRepoURL(event.target.value)
    }

    const InputUrlBox = () => {
        return (
            <div className="mr-10 ml-26">
                <div className="gitops__id fw-5 fs-13 mb-8 dc__required-field">Git Repo URL</div>
                <input
                    type="text"
                    autoComplete="off"
                    name="name"
                    value={repoURL}
                    placeholder="Enter repository URL"
                    className="form__input"
                    onChange={(event) => onChange(event)}
                />
            </div>
        )
    }

    const renderInfoColorBar = () => {
        return (
            <InfoColourBar
                message="GitOps repository cannot be changed for this application once saved."
                classname="warn"
                Icon={Warn}
                iconClass="warning-icon"
            />
        )
    }

    return (
        <>
            <div>
                <div className="form__row flex left pr-20 pl-20">
                    <div className="fw-4 fs-13 mb-8 pt-16">
                        Application Deployemnt states are saved as manifest in a Git repository. ArgoCD uses these
                        manifests to sync with your live Kubernetes cluster.
                    </div>
                    <RadioGroup
                        className="radio-group-no-border pt-12 pb-16"
                        name="trigger-type"
                        value={selectedRepoType}
                        onChange={repoTypeChange}
                    >
                        <div className="pt-12">
                            <RadioGroupItem value={repoType.DEFAULT}>Auto-create repository</RadioGroupItem>
                            <div className="ml-26">Repository will be created automatically</div>
                        </div>
                        <div className="pt-12">
                            <RadioGroupItem value={repoType.CONFIGURE}>
                                Commit manifest to a desired repository.
                            </RadioGroupItem>
                        </div>
                        <div className="ml-26">
                            {displayValidation && (
                                <ValidateForm
                                    id={1}
                                    validationError={errorInFetching}
                                    validationStatus={errorInFetching ? 'FAILURE' : 'SUCCESS'}
                                    configName="gitOps"
                                    showValidate={false}
                                    onClickValidate={() => {}}
                                />
                            )}
                        </div>
                    </RadioGroup>
                    {selectedRepoType === repoType.CONFIGURE && InputUrlBox()}
                </div>
                {renderInfoColorBar()}
            </div>
        </>
    )
}

export default UserGitRepo
