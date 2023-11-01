import {
    CustomInput,
    InfoColourBar,
    RadioGroup,
    RadioGroupItem,
    ResizableTextarea,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { AppCreationType, repoType } from '../../config/constants'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'

function GitManagment() {
    const [defaultRepoState, setDefaultRepoState] = useState(true)
    const [selectedRepoType, setSelectedRepoType] = useState(repoType.DEFAULT)

    const repoTypeChange = () => {
        if (selectedRepoType === 'DEFAULT') {
            setSelectedRepoType('CONFIGURE')
        } else {
            setSelectedRepoType('DEFAULT')
        }
    }

    const handleOnChange = () => {}

    const handleOnBlur = () => {}

    const handleOnFocus = () => {}

    const inputUrlBox = () => {
        return (
            <div className="bearer-token mr-10">
                <input
                    type="text"
                    placeholder="Search Token"
                    data-testid="search-token-input"
                    value=""
                    className="gitops__id form__label--fs-13 mb-8 fw-5 fs-13"
                    onChange={handleOnChange}
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
        <div>
            <div className="form__row flex left">
                <div className="fw-6 cn-9 fs-14 mb-16">GitOps Configuration</div>
                <RadioGroup
                    className="radio-group-no-border"
                    name="trigger-type"
                    value={selectedRepoType}
                    onChange={repoTypeChange}
                >
                    <div className="">
                        <RadioGroupItem value={repoType.DEFAULT}>Auto-create repository</RadioGroupItem>
                        <div className="ml-24">Repository will be created automatically</div>
                    </div>
                    <div>
                        <RadioGroupItem value={repoType.CONFIGURE}>
                            Commit manifest to a desired repository.
                        </RadioGroupItem>
                    </div>
                </RadioGroup>
                {selectedRepoType === 'CONFIGURE' && inputUrlBox()}
            </div>
            {renderInfoColorBar()}
            <hr />
        </div>
    )
}

export default GitManagment
