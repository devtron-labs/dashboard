import React, { useContext, useEffect, useState } from 'react'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import RegeneratedModal from './RegenerateModal'
import { EditDataType, EditTokenType } from './authorization.type'
import { createUserPermissionPayload, PermissionType } from './authorization.utils'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import GenerateActionButton from './GenerateActionButton'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useParams } from 'react-router'
import moment from 'moment'
import { Moment12HourFormat } from '../../config'
import { copyToClipboard, DeleteDialog, showError } from '../common'
import { deleteGeneratedAPIToken, updateGeneratedAPIToken } from './service'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import GroupPermission from './GroupPermission'
import {
    ActionTypes,
    ChartGroupPermissionsFilter,
    CreateUser,
    DirectPermissionsRoleFilter,
    EntityTypes,
    OptionType,
} from '../userGroups/userGroups.types'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { saveUser } from '../userGroups/userGroup.service'
import { mainContext } from '../common/navigation/NavigationRoutes'

function EditAPIToken({
    setShowRegeneratedModal,
    showRegeneratedModal,
    handleRegenerateActionButton,
    selectedExpirationDate,
    setSelectedExpirationDate,
    customDate,
    setCustomDate,
    tokenList,
    copied,
    setCopied,
    deleteConfirmation,
    setDeleteConfirmation,
    selectedList,
    usersList,
    reload,
}: EditTokenType) {
    const history = useHistory()
    const match = useRouteMatch()
    const params = useParams<{ id: string }>()
    const { serverMode } = useContext(mainContext)
    const [loder, setLoader] = useState(false)
    const [adminPermission, setAdminPermission] = useState('SUPERADMIN')
    const [userData, setUserData] = useState<CreateUser>()
    const [editData, setEditData] = useState<EditDataType>({
        name: selectedList?.name,
        description: selectedList?.description,
        expireAtInMs: selectedList?.expireAtInMs,
        token: selectedList?.token,
        id: selectedList?.id,
        userId: selectedList?.userId,
        userIdentifier: selectedList?.userIdentifier,
    })
    const [userGroups, setUserGroups] = useState<OptionType[]>([])
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })

    useEffect(() => {
        if (usersList && editData?.userId) {
            const _userData = usersList.find((_user) => _user.id === editData.userId)

            if (_userData) {
                setUserData(_userData)
                setAdminPermission(_userData.superAdmin ? 'SUPERADMIN' : 'SPECIFIC')
            }
        }
    }, [usersList, selectedList, editData])

    useEffect(() => {
        setEditData(tokenList && tokenList.find((list) => list?.id === parseInt(params.id)))
    }, [params.id])

    const renderActionButton = () => {
        return (
            <span
                style={{ width: '120px' }}
                className="cr-5 cursor flexbox top"
                onClick={() => setShowRegeneratedModal(true)}
            >
                Regenerate token
            </span>
        )
    }

    const renderRegenrateInfoBar = () => {
        return (
            <InfoColourBar
                message={
                    'If you’ve lost or forgotten this token, you can regenerate it. Any scripts or applications using this token will need to be updated.'
                }
                classname={'info m-20'}
                Icon={InfoIcon}
                iconClass={'icon-dim-20'}
                renderActionButton={renderActionButton}
            />
        )
    }

    const redirectToTokenList = () => {
        let url = match.path.split('edit')[0]
        history.push(`${url}list`)
    }

    const handleDeleteButton = () => {
        setDeleteConfirmation(true)
    }

    const handleUpdatedToken = async (tokenId) => {
        try {
            setLoader(true)
            const payload = {
                description: editData.description,
                expireAtInMs: editData.expireAtInMs,
            }

            const { result } = await updateGeneratedAPIToken(payload, tokenId)

            if (result) {
                const userPermissionPayload = createUserPermissionPayload(
                    editData.userId,
                    editData.userIdentifier,
                    serverMode,
                    userGroups,
                    directPermission,
                    chartPermission,
                    adminPermission === 'SUPERADMIN',
                )

                const { result: userPermissionResponse } = await saveUser(userPermissionPayload)
                if (userPermissionResponse) {
                    toast.success('Updated successfully')
                    history.push('/global-config/auth/api-token/list')
                }
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const deleteToken = (userId) => {
        deleteGeneratedAPIToken(userId)
            .then((response) => {
                if (response.code === 200) {
                    toast.success('Token Deleted!!!')
                    reload()
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    const renderDeleteModal = (tokenData) => {
        return (
            <DeleteDialog
                title={`Delete API token '${tokenData.name}'?`}
                delete={() => deleteToken(tokenData.id)}
                closeDelete={() => {
                    setDeleteConfirmation(false)
                }}
            >
                <DeleteDialog.Description>
                    <p className="fs-13 cn-7 lh-1-54">{tokenData?.description && tokenData.desription}</p>
                    <p className="fs-13 cn-7 lh-1-54">
                        Any applications or scripts using this token will no longer be able to access the Devtron API.
                    </p>
                    <p className="fs-13 cn-7 lh-1-54">
                        You cannot undo this action. Are you sure you want to delete this token?
                    </p>
                </DeleteDialog.Description>
            </DeleteDialog>
        )
    }

    const onChangeEditData = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key): void => {
        const _editData = { ...editData }
        _editData[key] = event.target.value
        setEditData(_editData)

        if (key === 'customDate') {
            setCustomDate(parseInt(event.target.value))
        }
    }

    const handlePermissionType = (e) => {
        setAdminPermission(e.target.value)
    }

    return (
        editData && (
            <div className="fs-13 fw-4" style={{ minHeight: 'calc(100vh - 235px)' }}>
                <div className="cn-9 fw-6 fs-16">
                    <span className="cb-5 cursor" onClick={redirectToTokenList}>
                        API tokens
                    </span>{' '}
                    / Edit API token
                </div>
                <p className="fs-13 fw-4">
                    API tokens function like ordinary OAuth access tokens. They can be used instead of a password for
                    Git over HTTPS, or can be used to authenticate to the API over Basic Authentication.
                </p>

                <div className="bcn-0 br-8 en-2 bw-1">
                    {renderRegenrateInfoBar()}
                    <div className="pl-20 pr-20 pb-20 ">
                        <div>
                            <label className="form__row w-400">
                                <span className="form__label">Name</span>
                                <input
                                    tabIndex={1}
                                    className="form__input"
                                    value={editData?.name}
                                    disabled={!!editData?.name}
                                />
                                {/* {this.state.showError && !this.state.isValid.name ? (
                                              <span className="form__error">
                                                  <Error className="form__icon form__icon--error" />
                                                  This is a required field
                                              </span>
                                              ) : null} */}
                            </label>
                            <label className="form__row">
                                <span className="form__label">Description</span>
                                <textarea
                                    tabIndex={1}
                                    placeholder="Enter a description to remember where you have used this token"
                                    className="form__textarea"
                                    value={editData?.description}
                                    onChange={(e) => onChangeEditData(e, 'description')}
                                />
                            </label>
                            <label className="form__row">
                                <span className="form__label">Token</span>
                                <div className="flex content-space mono top">
                                    <span style={{ wordBreak: 'break-word' }}>{editData?.token}</span>
                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="bottom"
                                        content={copied ? 'Copied!' : 'Copy'}
                                        trigger="mouseenter click"
                                        onShow={(instance) => {
                                            setCopied(false)
                                        }}
                                        interactive={true}
                                    >
                                        <Clipboard
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                copyToClipboard(selectedList.token, () => setCopied(true))
                                            }}
                                            className="icon-dim-16 ml-8 cursor"
                                        />
                                    </Tippy>
                                </div>
                            </label>
                            <label className="form__row">
                                <span className="form__label">Expiration</span>
                                <div className="align-left">
                                    This token expires on&nbsp;
                                    {moment(selectedList?.expireAtInMs).format(Moment12HourFormat)}.&nbsp;
                                    <span className="fw-4">To set a new expiration date you must</span>&nbsp;
                                    <span className="cb-5 cursor" onClick={() => setShowRegeneratedModal(true)}>
                                        regenerate the token.
                                    </span>
                                </div>
                            </label>
                            <div className="flex left">
                                <RadioGroup
                                    className="permission-type__radio-group"
                                    value={adminPermission || 'SUPERADMIN'}
                                    name="permission-type"
                                    onChange={handlePermissionType}
                                >
                                    {PermissionType.map(({ label, value }) => (
                                        <RadioGroupItem value={value}> {label} </RadioGroupItem>
                                    ))}
                                </RadioGroup>
                            </div>

                            {adminPermission !== 'SUPERADMIN' && (
                                <GroupPermission
                                    userData={userData}
                                    userGroups={userGroups}
                                    setUserGroups={setUserGroups}
                                    directPermission={directPermission}
                                    setDirectPermission={setDirectPermission}
                                    chartPermission={chartPermission}
                                    setChartPermission={setChartPermission}
                                />
                            )}
                            {deleteConfirmation && renderDeleteModal(editData)}
                        </div>
                    </div>
                    <hr className="modal__divider mt-20 mb-0" />
                    <GenerateActionButton
                        loader={false}
                        onCancel={redirectToTokenList}
                        onSave={() => handleUpdatedToken(editData.id)}
                        buttonText={'Update token'}
                        showDelete={true}
                        onDelete={handleDeleteButton}
                    />
                </div>
                {showRegeneratedModal && (
                    <RegeneratedModal
                        close={handleRegenerateActionButton}
                        setShowRegeneratedModal={setShowRegeneratedModal}
                        editData={editData}
                        setEditData={setEditData}
                        selectedList={selectedList}
                    />
                )}
            </div>
        )
    )
}

export default EditAPIToken
