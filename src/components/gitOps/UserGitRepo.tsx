import {
    InfoColourBar,
    RadioGroup,
    RadioGroupItem,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { repoType } from '../../config/constants'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { ValidateForm } from '../common/ValidateForm/ValidateForm';

function UserGitRepo(props) {
    // const [repoURL, setRepoURL] = useState(props.repoURL)

    const repoTypeChange = () => {  
        const newRepoType = props.selectedRepoType === repoType.DEFAULT ? repoType.CONFIGURE : repoType.DEFAULT;
        props.setSelectedRepoType(newRepoType);
    }

    const onChange = (event) => { 
        props.setRepoURL(event.target.value)
    }

    const InputUrlBox = () => {
        return (
            <div className="mr-10 ml-26">
                <div className="gitops__id fw-5 fs-13 mb-8 dc__required-field">Git Repo URL</div>
                <input
                    type="text"
                    autoComplete="off"
                    name="name"
                    value={props.repoURL}
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

    const onClickValidate = () => {
        props.validateRepoURL()
    }

    return (
        <>
            <div>
                <div className="form__row flex left">
                <div className="fw-4 mb-8">
                            Application Deployemnt states are saved as manifest in a Git repository. ArgoCD uses these
                            manifests to sync with your live Kubernetes cluster.
                        </div>
                    <RadioGroup
                        className="radio-group-no-border"
                        name="trigger-type"
                        value={props.selectedRepoType}
                        onChange={repoTypeChange}
                    >
                        <div className="">
                            <RadioGroupItem value={repoType.DEFAULT}>Auto-create repository</RadioGroupItem>
                            <div className="ml-26">Repository will be created automatically</div>
                        </div>
                        <div>
                            <RadioGroupItem value={repoType.CONFIGURE}>
                                Commit manifest to a desired repository.
                            </RadioGroupItem>
                        </div>
                        {props.displayValidation && <ValidateForm
                            id={1}
                            validationError={props.errorInFetching}
                            validationStatus={props.errorInFetching ? 'FAILURE' : 'SUCCESS'}
                            configName='gitOps'
                            onClickValidate={onClickValidate}
                        />}
                    </RadioGroup>
                    {props.selectedRepoType === repoType.CONFIGURE && InputUrlBox()}
                </div>
                {renderInfoColorBar()}
                <hr />
            </div>
        </>
    )
}

export default UserGitRepo
