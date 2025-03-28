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

import { useState } from 'react'
import {
    showError,
    Progressing,
    Drawer,
    ToastManager,
    ToastVariantType,
    Button,
    ComponentSizeType,
    ButtonStyleType,
    ButtonVariantType,
    stopPropagation,
    TagsContainer,
    DynamicDataTableRowType,
    TagsTableColumnsType,
    DynamicDataTableCellErrorType,
    validateTagKeyValue,
    validateTagValue,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import { AboutAppInfoModalProps } from '../types'
import { editApp } from '../service'
import { importComponentFromFELibrary } from '../../common'
import { APP_TYPE } from '@Config/constants'
import { getLabelTags } from './utils'

const MandatoryTagsContainer = importComponentFromFELibrary('MandatoryTagsContainer', null, 'function')

export default function AboutTagEditModal({
    isLoading,
    appId,
    onClose,
    appMetaInfo,
    currentLabelTags,
    getAppMetaInfoRes,
    appType,
}: AboutAppInfoModalProps) {
    const [submitting, setSubmitting] = useState(false)
    const [labelTags, setLabelTags] = useState<DynamicDataTableRowType<TagsTableColumnsType>[]>(
        MandatoryTagsContainer ? [] : getLabelTags(currentLabelTags),
    )
    const [tagsError, setTagErrors] = useState<DynamicDataTableCellErrorType<TagsTableColumnsType>>({})
    const [reloadMandatoryProjects, setReloadMandatoryProjects] = useState<boolean>(true)

    const configuredTagsMap = new Map<string, { value: string; propagate: boolean }>()
    currentLabelTags.forEach((configuredTag) => {
        configuredTagsMap.set(configuredTag.key, { value: configuredTag.value, propagate: configuredTag.propagate })
    })

    const handleSaveAction = async (e): Promise<void> => {
        e.preventDefault()
        const customLabelTags = []
        let invalidLabels = false
        const updatedTagsError: DynamicDataTableCellErrorType<TagsTableColumnsType> = {}
        for (let index = 0; index < labelTags.length; index++) {
            const element = labelTags[index]
            const currentKey = element.data.tagKey.value
            const currentVal = element.data.tagValue.value
            updatedTagsError[element.id] = {
                tagKey: { isValid: true, errorMessages: [] },
                tagValue: { isValid: true, errorMessages: [] },
            }
            if (!currentKey && !currentVal) {
                continue
            }
            const { isValid: isKeyValid, errorMessages: keyErrorMessages } = validateTagKeyValue(currentKey)
            const { isValid: isValueValid, errorMessages: valueErrorMessages } = validateTagValue(
                currentVal,
                currentKey,
            )
            if (!isKeyValid || !isValueValid) {
                invalidLabels = true
                updatedTagsError[element.id].tagKey = { isValid: isKeyValid, errorMessages: keyErrorMessages }
                updatedTagsError[element.id].tagValue = { isValid: isValueValid, errorMessages: valueErrorMessages }
            } else if (currentKey && currentVal) {
                customLabelTags.push({
                    key: currentKey,
                    value: currentVal,
                    propagate: element.customState.propagateTag,
                })
            }
        }
        setTagErrors(updatedTagsError)
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
            labels: customLabelTags,
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
                <div className="flex-grow-1 cn-7 p-20 dc__overflow-auto" data-testid="tag-input-form">
                    {MandatoryTagsContainer ? (
                        <MandatoryTagsContainer
                            appType={appType}
                            tags={labelTags}
                            setTags={setLabelTags}
                            projectId={appMetaInfo.projectId}
                            configuredTagsMap={configuredTagsMap}
                            tagsError={tagsError}
                            setTagErrors={setTagErrors}
                            hidePropagateTags={appType === APP_TYPE.HELM_CHART}
                        />
                    ) : (
                        <TagsContainer
                            appType={appType}
                            rows={labelTags}
                            setRows={setLabelTags}
                            hidePropagateTags={appType === APP_TYPE.HELM_CHART}
                            tagsError={tagsError}
                            setTagErrors={setTagErrors}
                        />
                    )}
                </div>
                <div className="form__buttons dc__border-top py-16 px-20 dc__gap-12">
                    <Button
                        dataTestId="overview-tag-cancel-button"
                        size={ComponentSizeType.large}
                        onClick={onClose}
                        text="Cancel"
                        disabled={submitting}
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                    />
                    <Button
                        dataTestId="overview-tag-save-button"
                        size={ComponentSizeType.large}
                        onClick={handleSaveAction}
                        text="Save"
                        isLoading={submitting}
                    />
                </div>
            </>
        )
    }

    return (
        <Drawer position="right" width="800px" onClose={onClose} onEscape={onClose}>
            <div className="h-100 flexbox-col bg__primary" onClick={stopPropagation}>
                <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 dc__border-bottom">
                    <h2 className="fs-16 cn-9 fw-6 m-0">Manage tags</h2>
                    <Close className="icon-dim-20 cursor" onClick={onClose} />
                </div>
                {isLoading ? <Progressing pageLoader /> : renderAboutModalInfo()}
            </div>
        </Drawer>
    )
}
