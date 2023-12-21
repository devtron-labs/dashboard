import { InfoColourBar, RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { repoType } from '../../config/constants'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { ValidateForm } from '../common/ValidateForm/ValidateForm';
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging';
import { UserGitRepoProps } from './gitops.type';
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'

function UserGitRepo(props: UserGitRepoProps) {

    const repoTypeChange = () => {
        const newRepoType = props.selectedRepoType === repoType.DEFAULT ? repoType.CONFIGURE : repoType.DEFAULT
        props.setSelectedRepoType(newRepoType)
        if(props.displayValidation) {
            props.setDisplayValidation(false)
        }
    }

    const onChange = (event) => {
        props.setRepoURL(event.target.value)
    }

    const renderValidationErrorLabel = (message?: string): JSX.Element => {
        return (
            <div className="error-label flex left fs-11 fw-4 mt-6">
                <Error className="form__icon form__icon--error" />
                <div className="ml-4 cr-5">{message || REQUIRED_FIELD_MSG}</div>
            </div>
        )
    }

    const InputUrlBox = () => {
        return (
            <div className="ml-26 mt-8">
                <div className="gitops__id fw-5 fs-13 mb-8 dc__required-field">Git Repo URL</div>
                <input
                    type="text"
                    autoComplete="off"
                    name="name"
                    value={props.repoURL.trimEnd()}
                    placeholder="Enter repository URL"
                    className="form__input"
                    onChange={(event) => onChange(event)}
                />
                {!props.repoURL && renderValidationErrorLabel()}
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
        <div className="pt-16 pl-20">
            <div className="form__row flex left">
                <div className="fw-4 fs-13 fcn-9">
                    Application Deployemnt states are saved as manifest in a Git repository. ArgoCD uses these manifests
                    to sync with your live Kubernetes cluster.
                </div>
                <RadioGroup
                    className="radio-group-no-border mt-16"
                    name="trigger-type"
                    value={props.selectedRepoType}
                    onChange={repoTypeChange}
                >
                    <div>
                        <RadioGroupItem value={repoType.DEFAULT}>Auto-create repository</RadioGroupItem>
                        <div className="ml-26 cn-7 fs-12 fw-4">
                            Repository will be created automatically using application name
                        </div>
                    </div>
                    <div className="pt-12">
                        <RadioGroupItem value={repoType.CONFIGURE}>
                            Commit manifest to a desired repository.
                        </RadioGroupItem>
                    </div>
                    <div className="ml-26">
                        {props.displayValidation && (
                            <ValidateForm
                                id={1}
                                validationError={props.errorInFetching}
                                validationStatus={props.errorInFetching ? 'FAILURE' : 'SUCCESS'}
                                configName="gitOps"
                                showValidate={false}
                                onClickValidate={() => {}}
                            />
                        )}
                    </div>
                </RadioGroup>
                {props.selectedRepoType === repoType.CONFIGURE && InputUrlBox()}
            </div>
            {renderInfoColorBar()}
        </div>
    )
}

export default UserGitRepo
