import React, { useEffect, useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { ReactComponent as Bulb } from '../../assets/icons/ic-slant-bulb.svg'
import { ReactComponent as Check } from '../../assets/icons/misc/checkGreen.svg'
import { ReactComponent as Document } from '../../assets/icons/ic-document.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import './docker.scss'
import Select from 'react-select'
import {
    ClearIndicator,
    multiSelectStyles,
    MultiValueChipContainer,
    MultiValueRemove,
    Option,
    RadioGroup,
    showError,
} from '../common'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { getClusterListMinWithoutAuth } from '../../services/service'

export const CredentialType = {
    SAME_AS_REGISTRY: 'SAME_AS_REGISTRY',
    NAME: 'NAME',
    CUSTOM_CREDENTIAL: 'CUSTOM_CREDENTIAL',
}

function ManageResgistry({
    clusterOption,
    blackList,
    setBlackList,
    whiteList,
    setWhiteList,
    onEdit,
    setOnEdit,
    credentialsType,
    setCredentialType,
    credentialValue,
    setCredentialValue,
}) {
    const onClickEditConfirmation = (): void => {
        whiteList.length > 0 ? setWhiteList([]) : setBlackList([])
    }

    const onClickCloseButton = () => {
        setOnEdit(false)
    }

    const renderActionButton = (): JSX.Element => {
        return <Close className="cursor" onClick={onClickCloseButton} />
    }

    const renderAlertMessage = () => {
        return (
            <div>
                If you want to edit this, below selection will not be applicable.
                <span className="cb-5 cursor ml-4 fw-6" onClick={onClickEditConfirmation}>
                    Confirm to edit
                </span>
            </div>
        )
    }

    const renderEditAlert = (): JSX.Element => {
        return (
            <InfoColourBar
                classname="warn"
                Icon={Warn}
                message={renderAlertMessage()}
                iconClass="warning-icon"
                renderActionButton={renderActionButton}
            />
        )
    }

    const onClickEditButton = () => {
        setOnEdit(true)
    }

    const renderNoSelectionview = (): JSX.Element => {
        return (
            <div className="flex en-2 bw-1 bcn-1 pr-20">
                <input
                    tabIndex={1}
                    placeholder="None"
                    className="form__input form__input__none bcn-1"
                    name="blacklist-none"
                    disabled={true}
                    autoFocus
                    autoComplete="off"
                />
                <Edit className="cursor pr-20" onClick={onClickEditButton} />
            </div>
        )
    }
    const renderIgnoredCluster = (): JSX.Element => {
        if (whiteList.length > 0) {
            return renderNoSelectionview()
        } else if (whiteList.length === 0) {
            return (
                <Select
                    isDisabled={whiteList.length > 0}
                    components={{
                        MultiValueContainer: ({ ...props }) => <MultiValueChipContainer {...props} validator={null} />,
                        DropdownIndicator: null,
                        ClearIndicator,
                        MultiValueRemove,
                        Option,
                    }}
                    styles={{
                        ...multiSelectStyles,
                        multiValue: (base) => ({
                            ...base,
                            border: `1px solid var(--N200)`,
                            borderRadius: `4px`,
                            background: 'white',
                            height: '30px',
                            margin: '0 8px 0 0',
                            padding: '1px',
                        }),
                    }}
                    closeMenuOnSelect={false}
                    isMulti
                    name="blacklist"
                    options={clusterOption}
                    hideSelectedOptions={false}
                    value={blackList}
                    onChange={(selected, actionMeta) => setBlackList((selected || []) as any)}
                />
            )
        }
    }

    const renderAppliedCluster = (): JSX.Element => {
        if (blackList.length > 0) {
            return (
                <div className="flex en-2 bw-1 bcn-1">
                    <input
                        tabIndex={1}
                        placeholder="None"
                        className="form__input form__input__none bcn-1"
                        name="blacklist-none"
                        disabled={true}
                        autoFocus
                        autoComplete="off"
                    />
                    <Edit className="cursor" onClick={() => setOnEdit(true)} />
                </div>
            )
        } else if (blackList.length === 0) {
            return (
                <Select
                    components={{
                        MultiValueContainer: ({ ...props }) => <MultiValueChipContainer {...props} validator={null} />,
                        DropdownIndicator: null,
                        ClearIndicator,
                        MultiValueRemove,
                        Option,
                    }}
                    isDisabled={blackList.length > 0}
                    styles={{
                        ...multiSelectStyles,
                        multiValue: (base) => ({
                            ...base,
                            border: `1px solid var(--N200)`,
                            borderRadius: `4px`,
                            background: 'white',
                            height: '30px',
                            margin: '0 8px 0 0',
                            padding: '1px',
                        }),
                    }}
                    closeMenuOnSelect={false}
                    isMulti
                    name="blacklist"
                    options={clusterOption}
                    hideSelectedOptions={false}
                    value={whiteList}
                    onChange={(selected) => setWhiteList((selected || []) as any)}
                />
            )
        }
    }

    const onHandleCredentialTypeChange = (e) => {
        setCredentialType(e.target.value)
    }

    const onClickSpecifyImagePullSecret = (e) => {
        setCredentialValue(e.target.value)
    }

    return (
        <div className="en-2 bw-1 br-4 fs-13 mb-20">
            <div className="bcn-1 p-16 dc__border-bottom flex left">Manage access of registry credentials</div>
            <div className="p-16">
                <div className="flex left cr-5 mb-6">
                    <Close className="icon-dim-16 fcr-5 mr-4" /> Do not inject credentials to clusters
                </div>
                {onEdit && blackList.length === 0 ? renderEditAlert() : renderIgnoredCluster()}

                <div className="flex left cg-5 mt-16 mb-6">
                    <Check className="icon-dim-16 mr-4" /> Auto-inject credentials to clusters
                </div>

                {onEdit && whiteList.length === 0 ? renderEditAlert() : renderAppliedCluster()}

                <div className="dc__border-top mb-20 mt-20" />

                <div className="flex left mb-16 cn-7">
                    <Bulb className="icon-dim-16 mr-8" />
                    Define credentials{' '}
                </div>
                <div className="flex left mb-16">
                    <RadioGroup
                        className="gui-yaml-switch"
                        name="credentials"
                        initialTab={
                            credentialsType === CredentialType.SAME_AS_REGISTRY
                                ? 'SAME_AS_REGISTRY'
                                : credentialsType === CredentialType.NAME
                                ? 'NAME'
                                : 'CUSTOM_CREDENTIAL'
                        }
                        disabled={false}
                        onChange={onHandleCredentialTypeChange}
                    >
                        <RadioGroup.Radio
                            value={CredentialType.SAME_AS_REGISTRY}
                            canSelect={credentialValue !== CredentialType.SAME_AS_REGISTRY}
                        >
                            <Document className="icon-dim-12 fcn-7 mr-8" />
                            Same as registry credentials
                        </RadioGroup.Radio>
                        <RadioGroup.Radio
                            value={CredentialType.NAME}
                            canSelect={credentialValue !== CredentialType.NAME}
                        >
                            <Bulb className="icon-dim-12 mr-8" /> Specify Image Pull Secret
                        </RadioGroup.Radio>
                        <RadioGroup.Radio
                            value={CredentialType.CUSTOM_CREDENTIAL}
                            canSelect={credentialValue !== CredentialType.CUSTOM_CREDENTIAL}
                        >
                            <Add className="icon-dim-16 fcn-7 mr-8" />
                            Create Image Pull secret
                        </RadioGroup.Radio>
                    </RadioGroup>
                </div>
                {credentialsType === CredentialType.NAME && (
                    <div>
                        <input
                            tabIndex={2}
                            placeholder="Name"
                            className="form__input"
                            name={CredentialType.NAME}
                            value={credentialValue}
                            onChange={onClickSpecifyImagePullSecret}
                            autoFocus
                            autoComplete="off"
                        />
                    </div>
                )}
                {credentialsType === CredentialType.CUSTOM_CREDENTIAL && (
                    <div className="" style={{ minHeight: '98px' }}></div>
                )}
            </div>
        </div>
    )
}

export default ManageResgistry
