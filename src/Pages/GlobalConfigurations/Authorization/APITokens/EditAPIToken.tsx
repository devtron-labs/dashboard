/* eslint-disable jsx-a11y/tabindex-no-positive */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useContext, useEffect, useState } from 'react'
import {
    showError,
    Progressing,
    InfoColourBar,
    RadioGroup,
    RadioGroupItem,
    copyToClipboard,
    CustomInput,
    noop,
    OptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory, useRouteMatch, useParams } from 'react-router-dom'
import moment from 'moment'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import RegeneratedModal from './RegenerateModal'
import { EditDataType, EditTokenType } from './authorization.type'
import { createUserPermissionPayload, isFormComplete, isTokenExpired } from './authorization.utils'
import { ReactComponent as Clipboard } from '../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Delete } from '../../../../assets/icons/ic-delete-interactive.svg'
import GenerateActionButton from './GenerateActionButton'
import { MomentDateFormat } from '../../../../config'
import { ButtonWithLoader } from '../../../../components/common'
import { updateGeneratedAPIToken } from './service'
import GroupPermission from './GroupPermission'
import {
    ActionTypes,
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    EntityTypes,
} from '../shared/components/userGroups/userGroups.types'
import { mainContext } from '../../../../components/common/navigation/NavigationRoutes'
import DeleteAPITokenModal from './DeleteAPITokenModal'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'
import { API_COMPONENTS } from '../../../../config/constantMessaging'
import { renderQuestionwithTippy } from './CreateAPIToken'
import SuperAdminInfoBar from '../shared/components/SuperAdminInfoBar'
import { createOrUpdateUser, getUserById } from '../authorization.service'
import { User } from '../types'
import { PermissionType, PERMISSION_TYPE_LABEL_MAP } from '../constants'

const EditAPIToken = ({
    setShowRegeneratedModal,
    showRegeneratedModal,
    handleRegenerateActionButton,
    tokenList,
    copied,
    setCopied,
    reload,
}: EditTokenType) => {
    const history = useHistory()
    const match = useRouteMatch()
    const params = useParams<{ id: string }>()
    const { serverMode } = useContext(mainContext)
    const [isLoading, setLoading] = useState(true)
    const [loader, setLoader] = useState(false)
    const [adminPermission, setAdminPermission] = useState('')
    const [userData, setUserData] = useState<User>()
    const [editData, setEditData] = useState<EditDataType>()
    const [userGroups, setUserGroups] = useState<OptionType[]>([])
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [k8sPermission, setK8sPermission] = useState<any[]>([])
    const [customDate, setCustomDate] = useState<number>(undefined)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [invalidDescription, setInvalidDescription] = useState(false)

    const getUserData = async (userId: number) => {
        try {
            const user = await getUserById(userId)
            setUserData(user)
            setAdminPermission(user.superAdmin ? PermissionType.SUPER_ADMIN : PermissionType.SPECIFIC)
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

    const renderActionButton = () => {
        return (
            <span className="cr-5 cursor flexbox top fw-6" onClick={() => setShowRegeneratedModal(true)}>
                Regenerate token
            </span>
        )
    }

    const renderRegenerateInfoBar = () => {
        return (
            <InfoColourBar
                message="To set a new expiration date, you can regenerate this token. Any scripts or applications using this token will need to be updated."
                classname="info_bar"
                Icon={InfoIcon}
                iconClass="icon-dim-20"
                renderActionButton={renderActionButton}
            />
        )
    }

    const redirectToTokenList = () => {
        history.push(`${match.path.split('edit')[0]}list`)
    }

    const handleDeleteButton = () => {
        setDeleteConfirmation(true)
    }

    const handleUpdatedToken = async (tokenId) => {
        if (!isFormComplete(directPermission, setDirectPermission)) {
            toast.error('Some required fields are missing')
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
                const userPermissionPayload = createUserPermissionPayload(
                    editData.userId,
                    editData.userIdentifier,
                    serverMode,
                    userGroups,
                    directPermission,
                    chartPermission,
                    k8sPermission,
                    adminPermission === PermissionType.SUPER_ADMIN,
                )

                const { result: userPermissionResponse } = await createOrUpdateUser(userPermissionPayload)
                if (userPermissionResponse) {
                    toast.success('Changes saved')
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

    const handlePermissionType = (e) => {
        setAdminPermission(e.target.value)
    }

    const getExpirationText = () => {
        if (isTokenExpired(editData.expireAtInMs)) {
            return (
                <span className="cr-5">
                    This token expired on&nbsp;
                    {moment(editData.expireAtInMs).format(MomentDateFormat)}.
                </span>
            )
        }
        if (editData.expireAtInMs === 0) {
            return <span>This token has no expiration date.</span>
        }

        return (
            <span>
                This token expires on&nbsp;
                {moment(editData.expireAtInMs).format(MomentDateFormat)}.
            </span>
        )
    }

    if (isLoading || !editData) {
        return <Progressing pageLoader />
    }

    const handleCopyToClipboard = (e) => {
        e.stopPropagation()
        copyToClipboard(editData.token, () => setCopied(true))
    }

    return (
        <div className="fs-13 fw-4 w-100 flexbox-col flex-grow-1 dc__content-space pb-16">
            <div className="pl-20 pr-20 pb-20">
                <div className="flex dc__content-space pb-16 dc__gap-8">
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
                        <ButtonWithLoader
                            rootClassName="flex cta override-button delete scr-5 h-32"
                            onClick={handleDeleteButton}
                            disabled={loader}
                            isLoading={false}
                            dataTestId="delete-token"
                            loaderColor="white"
                        >
                            <Delete className="icon-dim-16 mr-8" />
                            <span>Delete</span>
                        </ButtonWithLoader>
                    </div>
                </div>
                <div className="flexbox-col dc__gap-12">
                    {renderRegenerateInfoBar()}
                    <label className="form__row">
                        <CustomInput
                            label="Name"
                            data-testid="api-token-name-textbox"
                            value={editData.name}
                            disabled
                            name="name"
                            onChange={noop}
                        />
                    </label>
                    <label className="form__row">
                        <span className="form__label">Description</span>
                        <textarea
                            tabIndex={1}
                            data-testid="api-token-description-textbox"
                            placeholder="Enter a description to remember where you have used this token"
                            className="form__textarea"
                            value={editData.description}
                            name="description"
                            onChange={onChangeEditData}
                        />
                        {invalidDescription && (
                            <span className="form__error flexbox-imp flex-align-center">
                                <Warn className="form__icon--error icon-dim-16 mr-4" />
                                Max 350 characters allowed.
                            </span>
                        )}
                    </label>
                    <label className="form__row">
                        <span className="form__label">Token</span>
                        <div className="flex dc__content-space top cn-9">
                            <span data-testid="api-token-string" className="mono fs-14 dc__word-break">
                                {editData.token}
                            </span>
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="bottom"
                                content={copied ? 'Copied!' : 'Copy'}
                                trigger="mouseenter click"
                                onShow={(_tippy) => {
                                    setTimeout(() => {
                                        _tippy.hide()
                                        setCopied(false)
                                    }, 5000)
                                }}
                                interactive
                            >
                                <div className="icon-dim-16 ml-8">
                                    <Clipboard onClick={handleCopyToClipboard} className="icon-dim-16 cursor" />
                                </div>
                            </Tippy>
                        </div>
                    </label>
                    <label className="form__row">
                        <span className="form__label">Expiration</span>
                        <div className="dc__align-left">
                            {getExpirationText()}
                            &nbsp;
                            <span className="fw-4">To set a new expiration date you must</span>&nbsp;
                            <span className="cb-5 cursor" onClick={() => setShowRegeneratedModal(true)}>
                                regenerate the token.
                            </span>
                        </div>
                    </label>
                    <div className="dc__border-top-n1" />
                    <div className="flex left">
                        <RadioGroup
                            className="permission-type__radio-group"
                            value={adminPermission}
                            name="permission-type"
                            onChange={handlePermissionType}
                        >
                            {Object.entries(PERMISSION_TYPE_LABEL_MAP).map(([value, label]) => (
                                <RadioGroupItem
                                    key={value}
                                    dataTestId={`${
                                        value === PermissionType.SPECIFIC ? 'specific-user' : 'super-admin'
                                    }-permission-radio-button`}
                                    value={value}
                                >
                                    <span
                                        className={`dc__no-text-transform ${
                                            adminPermission === value ? 'fw-6' : 'fw-4'
                                        }`}
                                    >
                                        {label}
                                    </span>
                                </RadioGroupItem>
                            ))}
                        </RadioGroup>
                    </div>
                    {adminPermission === PermissionType.SPECIFIC ? (
                        <GroupPermission
                            userData={userData}
                            userGroups={userGroups}
                            setUserGroups={setUserGroups}
                            directPermission={directPermission}
                            setDirectPermission={setDirectPermission}
                            chartPermission={chartPermission}
                            setChartPermission={setChartPermission}
                            setK8sPermission={setK8sPermission}
                            k8sPermission={k8sPermission}
                        />
                    ) : (
                        <SuperAdminInfoBar />
                    )}
                </div>
            </div>
            <GenerateActionButton
                loader={loader}
                onCancel={redirectToTokenList}
                onSave={() => handleUpdatedToken(editData.id)}
                buttonText="Update token"
            />
            {deleteConfirmation && (
                <DeleteAPITokenModal
                    isEditView
                    tokenData={editData}
                    reload={reload}
                    setDeleteConfirmation={setDeleteConfirmation}
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

export default EditAPIToken
