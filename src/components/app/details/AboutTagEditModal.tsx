/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef, useState } from 'react'
import {
    showError,
    Progressing,
    Drawer,
    TagLabelSelect,
    TagType,
    DEFAULT_TAG_DATA,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import { AboutAppInfoModalProps } from '../types'
import { editApp } from '../service'
import { importComponentFromFELibrary } from '../../common'
import '../create/createApp.scss'
import { APP_TYPE } from '@Config/constants'

const TagsContainer = importComponentFromFELibrary('TagLabelSelect', TagLabelSelect)
export default function AboutTagEditModal({
    isLoading,
    appId,
    onClose,
    appMetaInfo,
    currentLabelTags,
    getAppMetaInfoRes,
    appType
}: AboutAppInfoModalProps) {
    const editLabelRef = useRef(null)
    const [submitting, setSubmitting] = useState(false)
    const [labelTags, setLabelTags] = useState<TagType[]>(
        currentLabelTags?.length ? currentLabelTags : [DEFAULT_TAG_DATA],
    )
    const [reloadMandatoryProjects, setReloadMandatoryProjects] = useState<boolean>(true)

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof onClose === 'function') {
            evt.preventDefault()
            onClose(evt)
        }
    }
    const outsideClickHandler = (evt): void => {
        if (editLabelRef.current && !editLabelRef.current.contains(evt.target) && typeof onClose === 'function') {
            onClose(evt)
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

    const handleSaveAction = async (e): Promise<void> => {
        e.preventDefault()
        const _labelTags = []
        let invalidLabels = false
        for (let index = 0; index < labelTags.length; index++) {
            const element = labelTags[index]
            if (element.isInvalidKey || element.isInvalidValue) {
                invalidLabels = true
                break
            } else if (element.key) {
                _labelTags.push({ key: element.key, value: element.value, propagate: element.propagate })
            }
        }
        if (invalidLabels) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some required fields are missing or invalid',
            })
            return
        }
        setSubmitting(true)

        const payload = {
            id: parseInt(appId),
            labels: _labelTags,
            teamId: appMetaInfo.projectId,
            description: appMetaInfo.description,
        }

        try {
            await editApp(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully saved',
            })
            // Fetch the latest project & labels details
            await getAppMetaInfoRes()
            onClose(e)
        } catch (err) {
            showError(err)
            setReloadMandatoryProjects(!reloadMandatoryProjects)
        } finally {
            setSubmitting(false)
        }
    }

    const renderAboutModalInfo = (): JSX.Element => {
        return (
            <>
                <div
                    className="cn-7 p-20 dc__overflow-scroll"
                    data-testid="tag-input-form"
                    style={{ height: 'calc(100vh - 122px)' }}
                >
                    <TagsContainer
                        labelTags={labelTags}
                        setLabelTags={setLabelTags}
                        selectedProjectId={appMetaInfo.projectId}
                        reloadProjectTags={reloadMandatoryProjects}
                        hidePropagateTag={appType === APP_TYPE.HELM_CHART}
                    />
                </div>
                <div className="form__buttons dc__border-top pt-16 pb-16 pl-20 pr-20">
                    <button
                        className="cta cancel flex h-36 mr-12"
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        tabIndex={6}
                    >
                        Cancel
                    </button>
                    <button
                        className="cta flex h-36"
                        type="submit"
                        disabled={submitting}
                        onClick={handleSaveAction}
                        tabIndex={5}
                        data-testid="overview-tag-save-button"
                    >
                        {submitting ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </>
        )
    }

    return (
        <Drawer position="right" width="800px">
            <div className="h-100 bcn-0 create-app-container" ref={editLabelRef}>
                <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 dc__border-bottom">
                    <h2 className="fs-16 cn-9 fw-6 m-0">Manage tags</h2>
                    <Close className="icon-dim-20 cursor" onClick={onClose} />
                </div>
                {isLoading ? <Progressing pageLoader /> : renderAboutModalInfo()}
            </div>
        </Drawer>
    )
}
