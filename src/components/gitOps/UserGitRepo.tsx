import { InfoColourBar, RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { repoType } from '../../config/constants'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { ValidateForm } from '../common/ValidateForm/ValidateForm';
import { UserGitRepoProps } from './gitops.type';

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

    const InputUrlBox = () => {
        return (
                <div className="ml-26 mt-8">
                    <div className="gitops__id fw-5 fs-13 mb-8 dc__required-field">Git Repo URL</div>
                    <input
                        type="text"
                        autoComplete="off"
                        name="name"
                        value={props.repoURL.trim()}
                        placeholder="Enter repository URL"
                        className="form__input"
                        onChange={(event) => onChange(event)}
                        disabled={props.staleData}
                    />
                </div>
        )
    }

    const renderInfoColorBar = () => {
        return (
            <InfoColourBar
                message="GitOps repository cannot be changed for this application once deployed."
                classname="warn mb-16"
                Icon={Warn}
                iconClass="icon-dim-20"
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
                    value={props.staleData ? repoType.DEFAULT : props.selectedRepoType}
                    onChange={repoTypeChange}
                >
                    <div>
                        <RadioGroupItem value={repoType.DEFAULT}>Auto-create repository</RadioGroupItem>
                        <div className="ml-26 cn-7 fs-12 fw-4">
                            Repository will be created automatically using application name
                        </div>
                    </div>
                    <div className="pt-12">
                        <RadioGroupItem value={!props.staleData ? repoType.CONFIGURE : ''} disabled={props.staleData}>
                            Commit manifest to a desired repository.
                        </RadioGroupItem>
                    </div>
                    <div className="ml-26">
                        {props.displayValidation && !props.staleData && (
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
                {props.selectedRepoType === repoType.CONFIGURE && !props.staleData && InputUrlBox()}
                {props.staleData && (
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
            {!props.staleData && renderInfoColorBar()}
        </div>
    )
}

export default UserGitRepo
