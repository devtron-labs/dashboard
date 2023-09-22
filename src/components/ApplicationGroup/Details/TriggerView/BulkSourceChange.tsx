import { CustomInput, Drawer, InfoColourBar, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'
import SourceUpdateResponseModal from './SourceUpdateResponseModal'

export default function BulkSourceChange({ closePopup, responseList, changeBranch, loading, selectedAppCount }) {
    const sourceChangeDetailRef = useRef<HTMLDivElement>(null)

    const [show, setShow] = useState(false)
    const [error, setError] = useState('')
    const [input, setInput] = useState('')

    const closeBulkCIModal = (evt) => {
        closePopup(evt)
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof closePopup === 'function') {
            evt.preventDefault()
            closeBulkCIModal(evt)
        }
    }
    const outsideClickHandler = (evt): void => {
        if (
            sourceChangeDetailRef.current &&
            !sourceChangeDetailRef.current.contains(evt.target) &&
            typeof closePopup === 'function'
        ) {
            closeBulkCIModal(evt)
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    useEffect(() => {
        setShow(responseList.length > 0)
    }, [responseList])

    const updateBranch = () => {
        if (input.length == 0) {
            setError('This is required')
            return
        }
        changeBranch(input)
    }

    const renderHeaderSection = (): JSX.Element | null => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-16 pr-20 pb-16 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">Change branch for {selectedAppCount} applications</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    disabled={loading}
                    onClick={closeBulkCIModal}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const renderInfoBar = (): JSX.Element => {
        return (
            <InfoColourBar
                message="Branch will be changed only for build pipelines with source type as ‘Branch Fixed’."
                classname="warn"
                Icon={Warn}
                iconClass="warning-icon"
            />
        )
    }

    const checkInput = (): boolean => {
        return input == ''
    }

    const handleInputChange = (e): void => {
        setInput(e.target.value)
        setError('')
    }

    const renderForm = (): JSX.Element => {
        const isDisabled = checkInput()

        return (
            <div className="p-20">
                <div className="form__row">
                    <CustomInput
                        labelClassName="dc__required-field"
                        autoComplete="off"
                        name="branch_name"
                        disabled={false}
                        value={input}
                        error={error}
                        onChange={handleInputChange}
                        label="Change to branch"
                        placeholder="Enter branch name"
                    />
                </div>
                <div className="">
                    <button
                        data-testid="cancel_button"
                        className="cta cancel h-36 lh-36"
                        type="button"
                        onClick={closeBulkCIModal}
                    >
                        Cancel
                    </button>
                    <button
                        data-testid="save_cluster_after_entering_cluster_details"
                        className="cta ml-12 h-36 lh-36"
                        onClick={() => {
                            updateBranch()
                        }}
                        disabled={isDisabled}
                    >
                        {loading ? <Progressing /> : 'Update branch'}
                    </button>
                </div>
            </div>
        )
    }
    return (
        <Drawer position="right" width="75%" minWidth={show ? '1024px' : '600px'} maxWidth={show ? '1200px' : '600px'}>
            <div className="dc__window-bg h-100 bcn-0 bulk-ci-trigger-container" ref={sourceChangeDetailRef}>
                {renderHeaderSection()}
                {show ? (
                    <SourceUpdateResponseModal closePopup={closePopup} isLoading={false} responseList={responseList} />
                ) : (
                    <>
                        {renderInfoBar()}
                        {renderForm()}
                    </>
                )}
            </div>
        </Drawer>
    )
}
