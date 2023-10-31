import { RadioGroup, RadioGroupItem, ResizableTextarea } from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { AppCreationType, repoType } from '../../config/constants'

function GitManagment() {
    const [defaultRepoState, setDefaultRepoState] = useState(true)
    const [repoState, setRepoState] = useState({})


    const repoTypeChange = (e) => {
        if(defaultRepoState) {
            
        }
    }

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
        <div className="form__row flex left">
            <div className="fw-6 cn-9 fs-14 mb-16">GitOps Configuration</div>
            <RadioGroup className="radio-group-no-border" name="trigger-type" onChange={(e) => repoTypeChange(e)} value="">
                <RadioGroupItem value={repoType.DEFAULT}>
                    Auto-create repository.
                </RadioGroupItem>
                <RadioGroupItem value={repoType.CONFIGURE}>
                    Commit manifest to a desired repository.                
                </RadioGroupItem>
            </RadioGroup>
        </div>
    )
}

export default GitManagment
