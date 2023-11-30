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
    const [selectedRepoType, setSelectedRepoTypeLocal] = useState(props.selectedRepoType || repoType.DEFAULT);
    const [repoText, setRepoText] = useState(props.repoURL)

    const repoTypeChange = () => {  
        const newRepoType = selectedRepoType === repoType.DEFAULT ? repoType.CONFIGURE : repoType.DEFAULT;
        setSelectedRepoTypeLocal(newRepoType);
        props.setSelectedRepoType(newRepoType);
    }

    const onChange = (event) => { 
        setRepoText(event.target.value)
        props.setRepoURL(event.target.value)
    }

    const inputUrlBox = () => {
        return (
            <div className="mr-10 ml-26">
                <div className="gitops__id fw-5 fs-13 mb-8 dc__required-field">Git Repo URL</div>
                <input
                    type="text"
                    autoComplete="off"
                    name="name"
                    value={repoText}
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

    }

    return (
        <>
            <div>
                <div className="form__row flex left">
                    {props.isDeploymentAllowed ? (
                        <div className="fw-6 cn-9 fs-14 mb-16">GitOps Configuration</div>
                    ) : (
                        <div className="fw-4 mb-8">
                            Application Deployemnt states are saved as manifest in a Git repository. ArgoCD uses these
                            manifests to sync with your live Kubernetes cluster.
                        </div>
                    )}
                    <RadioGroup
                        className="radio-group-no-border"
                        name="trigger-type"
                        value={selectedRepoType}
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
                        {/* <ValidateForm
                            id={1}
                            validationError={props.errorInFetching}
                            configName={''}
                            onClickValidate={onClickValidate}
                        /> */}
                    </RadioGroup>
                    {selectedRepoType === repoType.CONFIGURE && inputUrlBox()}
                </div>
                {renderInfoColorBar()}
                <hr />
            </div>
        </>
    )
}

export default UserGitRepo
