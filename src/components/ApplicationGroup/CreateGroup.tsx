import React, { useEffect, useRef, useState } from 'react'
import { Drawer, Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { CreateGroupType } from './AppGroup.types'

export default function CreateGroup({ appList, selectedAppList, closePopup }: CreateGroupType) {
    const CreateGroupRef = useRef<HTMLDivElement>(null)
    const [isLoading, setLoading] = useState(false)
    const [filterName, setFilterName] = useState<string>()
    const [filterDescription, setFilterDescription] = useState<string>()

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof closePopup === 'function') {
            evt.preventDefault()
            closePopup(evt)
        }
    }

    const outsideClickHandler = (evt): void => {
        if (
            CreateGroupRef.current &&
            !CreateGroupRef.current.contains(evt.target) &&
            typeof closePopup === 'function'
        ) {
            closePopup(evt)
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

    useEffect(() => {}, [])

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-17 pr-20 pb-17 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Save filter</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    disabled={isLoading}
                    onClick={closePopup}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const onInputChange = (event): void => {
        if (event.target.name === 'name') {
            setFilterName(event.target.value)
        } else {
            setFilterDescription(event.target.value)
        }
    }

    const renderBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="p-20 bcn-0 dc__overflow-auto" style={{ height: 'calc(100vh - 128px)' }}>
                <div className="form__row mb-16">
                    <span className="form__label dc__required-field">Name</span>
                    <input
                        tabIndex={0}
                        className="form__input"
                        autoComplete="off"
                        placeholder="Enter filter name"
                        type="text"
                        value={filterName}
                        name="name"
                        onChange={onInputChange}
                    />
                </div>
                <div className="form__row mb-16">
                    <span className="form__label">Description (Max 50 characters)</span>
                    <textarea
                        tabIndex={1}
                        placeholder="Write a description for this filter"
                        className="form__textarea"
                        value={filterDescription}
                        name="description"
                        onChange={onInputChange}
                    />
                </div>
                <div>
                    <div>
                        <span>Selected applications</span>
                        <span>Add/Remove applications</span>
                    </div>
                    <div></div>
                </div>
            </div>
        )
    }

    const isCreateGroupDisabled = (): boolean => {
        return false
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div className="dc__border-top flex right bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 w-800">
                <button className="cta cancel flex h-36 mr-12" onClick={closePopup}>
                    Cancel
                </button>
                <button className="cta flex h-36" onClick={() => {}} disabled={isCreateGroupDisabled()}>
                    Save
                </button>
            </div>
        )
    }

    return (
        <Drawer position="right" width="800px">
            <div className="dc__window-bg h-100" ref={CreateGroupRef}>
                {renderHeaderSection()}
                {renderBodySection()}
                {renderFooterSection()}
            </div>
        </Drawer>
    )
}
