import { RadioGroup, RadioGroupItem, ResizableTextarea } from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { AppCreationType, repoType } from '../../config/constants'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'

function GitManagment() {
    const [defaultRepoState, setDefaultRepoState] = useState(true)
    const [selectedRepoType, setSelectedRepoType] = useState(repoType.DEFAULT);

    const repoTypeChange = (value) => {
        setSelectedRepoType(value);
    };

    const handleOnChange = () => {}

    const handleOnBlur = () => {}

    const handleOnFocus = () => {}

    const inputUrlBox = () => {
        return (
            <div className="bearer-token">
                <ResizableTextarea
                    className="dc__resizable-textarea__with-max-height dc__required-field"
                    name="token"
                    onChange={handleOnChange}
                    onBlur={handleOnBlur}
                    onFocus={handleOnFocus}
                    placeholder="Enter bearer token"
                    dataTestId="enter_bearer_token_input"
                />
            </div>
        )
    }

    return (
        
        <div>
            <div className="flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                <h2 data-testid="add_cluster_header" className="fs-16 fw-6 lh-1-43 m-0 title-padding">
                    <span className="fw-6 fs-16 cn-9">GitOps Configurations</span>
                </h2>
                <button
                    data-testid="header_close_icon"
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    // onClick={handleCloseButton}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
            <div className="form__row flex left">
                <div className="fw-6 cn-9 fs-14 mb-16">GitOps Configuration</div>
                <RadioGroup
                    className="radio-group-no-border"
                    name="trigger-type"
                    onChange={(e) => repoTypeChange(e)}
                    value=""
                >
                    <RadioGroupItem value={repoType.DEFAULT}>Auto-create repository.</RadioGroupItem>
                    <RadioGroupItem value={repoType.CONFIGURE}>Commit manifest to a desired repository.</RadioGroupItem>
                </RadioGroup>
            </div>
        </div>
    )
}

export default GitManagment
