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

/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import moment from 'moment'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CustomInput,
    Icon,
    InfoBlock,
    noop,
    Progressing,
    showError,
    Textarea,
    ToastManager,
    ToastVariantType,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../../../../components/common'
import { MomentDateFormat } from '../../../../config'
import { API_COMPONENTS } from '../../../../config/constantMessaging'
import { createOrUpdateUser, getUserById } from '../authorization.service'
import { getDefaultUserStatusAndTimeout } from '../libUtils'
import {
    PermissionConfigurationForm,
    PermissionConfigurationFormProvider,
    usePermissionConfiguration,
} from '../Shared/components/PermissionConfigurationForm'
import { User } from '../types'
import { createUserPermissionPayload, validateDirectPermissionForm } from '../utils'
import { EditDataType, EditTokenType } from './apiToken.type'
import { isTokenExpired } from './apiToken.utils'
import { renderQuestionwithTippy } from './CreateAPIToken'
import DeleteAPITokenModal from './DeleteAPITokenModal'
import GenerateActionButton from './GenerateActionButton'
import RegeneratedModal from './RegenerateModal'
import { updateGeneratedAPIToken } from './service'

const showStatus = !!importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const EditAPIToken = ({
    setShowRegeneratedModal,
    showRegeneratedModal,
    handleRegenerateActionButton,
    reload,
    editData,
    setEditData,
    isLoading,
}: Omit<EditTokenType, 'tokenList'> & {
    editData: EditDataType
    isLoading: boolean
    setEditData: (editData: EditDataType) => void
}) => {
    const {
        permissionType,
        directPermission,
        setDirectPermission,
        chartPermission,
        k8sPermission,
        userRoleGroups,
        isSaveDisabled,
        allowManageAllAccess,
    } = usePermissionConfiguration()

    const history = useHistory()
    const match = useRouteMatch()
    const { serverMode } = useMainContext()
    const [loader, setLoader] = useState(false)

    const [customDate, setCustomDate] = useState<number>(undefined)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [invalidDescription, setInvalidDescription] = useState(false)

    const onClickShowRegenerateModal = () => {
        setShowRegeneratedModal(true)
    }

    const redirectToTokenList = () => {
        history.push(`${match.path.split('edit')[0]}list`)
    }

    const handleDeleteButton = () => {
        setShowDeleteConfirmation(true)
    }

    const handleUpdatedToken = async (tokenId) => {
        if (!validateDirectPermissionForm(directPermission, setDirectPermission, allowManageAllAccess).isValid) {
            return
        }

        if (invalidDescription) {
            return
        }

        try {
            setLoader(true)
            const payload = {
                description: editData.description,
                expireAtInMs: editData.expireAtInMs,
            }

            const { result } = await updateGeneratedAPIToken(payload, tokenId)

            if (result) {
                const userPermissionPayload = createUserPermissionPayload({
                    id: editData.userId,
                    userIdentifier: editData.userIdentifier,
                    userRoleGroups,
                    serverMode,
                    directPermission,
                    chartPermission,
                    k8sPermission,
                    permissionType,
                    userGroups: [],
                    canManageAllAccess: allowManageAllAccess,
                    ...getDefaultUserStatusAndTimeout(),
                })

                const { result: userPermissionResponse } = await createOrUpdateUser(userPermissionPayload)
                if (userPermissionResponse) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Changes saved',
                    })
                    reload()
                    redirectToTokenList()
                }
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const onChangeEditData = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        if (event.target.name === 'description' && invalidDescription) {
            setInvalidDescription(false)
        }

        if (event.target.name === 'description' && event.target.value.length > 350) {
            setInvalidDescription(true)
        }

        const _editData = { ...editData }
        _editData[event.target.name] = event.target.value
        setEditData(_editData)
    }

    const getExpirationText = () => {
        if (editData.expireAtInMs === 0) {
            return <span className="fw-6 cn-9">This token has no expiration date.</span>
        }

        return (
            <span className="fw-6 cn-9">
                This token {isTokenExpired(editData.expireAtInMs) ? 'expired' : 'expires'} on&nbsp;
                {moment(editData.expireAtInMs).format(MomentDateFormat)}.
            </span>
        )
    }

    const renderRegenerateInfoBar = () => (
        <InfoBlock
            heading={getExpirationText()}
            description="Regenerate this token to set a new expiration date. Any scripts or applications using this token will need to be updated."
            buttonProps={{
                dataTestId: 'regenerate-token-button',
                text: 'Regenerate token',
                onClick: onClickShowRegenerateModal,
                variant: ButtonVariantType.text,
                style: ButtonStyleType.negative,
            }}
            variant={isTokenExpired(editData.expireAtInMs) ? 'error' : 'information'}
        />
    )

    if (isLoading || !editData) {
        return <Progressing pageLoader />
    }

    return (
        <div className="fs-13 fw-4 w-100 flexbox-col flex-grow-1 dc__content-space pb-16">
            <div className="px-20 pb-20">
                <div className="flex dc__content-space py-16 dc__gap-8">
                    <div className="flex row ml-0">
                        <div className="cn-9 fw-6 fs-16">
                            <span className="cb-5 cursor" onClick={redirectToTokenList}>
                                {API_COMPONENTS.TITLE}
                            </span>
                            {API_COMPONENTS.EDIT_API_TITLE}
                        </div>
                        {renderQuestionwithTippy()}
                    </div>
                    <div className="flex dc__align-end dc__content-end">
                        <Button
                            onClick={handleDeleteButton}
                            disabled={loader}
                            isLoading={false}
                            dataTestId="delete-token"
                            text="Delete"
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.negative}
                            startIcon={<Icon name="ic-delete" color={null} />}
                        />
                    </div>
                </div>
                <div className="flexbox-col dc__gap-16">
                    {renderRegenerateInfoBar()}
                    <CustomInput
                        placeholder="Enter name"
                        label="Name"
                        data-testid="api-token-name-textbox"
                        value={editData.name}
                        disabled
                        name="name"
                        onChange={noop}
                    />
                    <Textarea
                        label="Description"
                        name="description"
                        value={editData.description}
                        onChange={onChangeEditData}
                        placeholder="Enter a description to remember where you have used this token"
                        error={invalidDescription ? 'Max 350 characters allowed.' : null}
                    />
                    <div className="dc__border-top" />
                    <PermissionConfigurationForm showUserPermissionGroupSelector isAddMode={false} />
                </div>
            </div>
            <GenerateActionButton
                loader={loader}
                onCancel={redirectToTokenList}
                onSave={() => handleUpdatedToken(editData.id)}
                buttonText="Update token"
                disabled={isSaveDisabled}
            />
            {showDeleteConfirmation && (
                <DeleteAPITokenModal
                    isEditView
                    tokenData={editData}
                    reload={reload}
                    setDeleteConfirmation={setShowDeleteConfirmation}
                />
            )}
            {showRegeneratedModal && (
                <RegeneratedModal
                    close={handleRegenerateActionButton}
                    setShowRegeneratedModal={setShowRegeneratedModal}
                    editData={editData}
                    customDate={customDate}
                    setCustomDate={setCustomDate}
                    reload={reload}
                    redirectToTokenList={redirectToTokenList}
                />
            )}
        </div>
    )
}

const EditAPITokenContainer = ({ tokenList, ...props }: EditTokenType) => {
    const params = useParams<{ id: string }>()
    const [isLoading, setLoading] = useState(true)
    const [userData, setUserData] = useState<User>()
    const [editData, setEditData] = useState<EditDataType>()

    const getUserData = async (userId: number) => {
        try {
            const user = await getUserById(userId)
            setUserData(user)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line radix
        const _editData = tokenList?.find((list) => list.id === parseInt(params.id))

        if (_editData) {
            setEditData(_editData)
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            getUserData(_editData.userId)
        }
    }, [])

    return (
        <PermissionConfigurationFormProvider data={userData} showStatus={showStatus}>
            <EditAPIToken {...props} editData={editData} setEditData={setEditData} isLoading={isLoading} />
        </PermissionConfigurationFormProvider>
    )
}

export default EditAPITokenContainer
