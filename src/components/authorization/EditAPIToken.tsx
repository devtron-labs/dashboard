import React, { useEffect, useState } from 'react'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import RegeneratedModal from './RegenerateModal'
import { EditTokenType } from './authorization.type'
import { getDateInMilliseconds, PermissionType } from './authorization.utils'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import GenerateActionButton from './GenerateActionButton'
import { Link, useHistory, useRouteMatch } from 'react-router-dom'
import { useParams } from 'react-router'
import moment from 'moment'
import { Moment12HourFormat } from '../../config'
import { ConfirmationDialog, copyToClipboard, DeleteDialog, showError } from '../common'
import { deleteGeneratedAPIToken, updateGeneratedAPIToken } from './service'
import { toast } from 'react-toastify'
import warn from '../../assets/icons/ic-warning.svg'
import { string } from 'prop-types'

function EditAPIToken({
    setShowRegeneratedModal,
    showRegeneratedModal,
    handleRegenerateActionButton,
    selectedExpirationDate,
    setSelectedExpirationDate,
    formData,
    setFormData,
    customDate,
    setCustomDate,
    tokenResponse,
    tokenList,
    copied,
    setCopied,
    deleteConfirmation,
    setDeleteConfirmation,
    selectedList,
    setSelectedList,
}: EditTokenType) {
    const history = useHistory()
    const match = useRouteMatch()
    const params = useParams<{ id: string }>()
    const [loder, setLoader] = useState(false)

    // let list = tokenList && tokenList.length > 0 && tokenList.filter((list) => list.userId === parseInt(params.id))
    useEffect(() => {
        setEditData(tokenList && tokenList.find((list) => list?.userId === parseInt(params.id)))
    }, [params.id])

    // setSelectedList(list[0])

    const [editData, setEditData] = useState({
        name: selectedList?.name || '',
        description: selectedList?.description || '',
        expireAtInMs: selectedList?.expireAtInMs,
        token: selectedList?.token || '',
    })

    const renderActionButton = () => {
        return (
            <span className="cr-5 cursor" onClick={() => setShowRegeneratedModal(true)}>
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

    console.log(editData)

    const handleDeleteButton = () => {
        setDeleteConfirmation(true)
    }

    const handleUpdatedToken = async () => {
        try {
            setLoader(true)
            let payload = {
                description: editData.description,
                expireAtInMs: getDateInMilliseconds(editData.expireAtInMs),
            }

            await updateGeneratedAPIToken(payload, params?.id)
            toast.success('Updated successfully')
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
                    let url = match.path.split('edit')[0]
                    history.push(`${url}list`)
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    const renderDeleteModal = (token) => {
        return (
            <DeleteDialog
                title={`Delete API token '${token.name}'?`}
                delete={() => deleteToken(token.userId)}
                closeDelete={() => {
                    setDeleteConfirmation(false)
                }}
            >
                <DeleteDialog.Description>
                    <p className="fs-13 cn-7 lh-1-54">{token.description && token.desription}</p>
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

    const onChangeEditData = (event: React.ChangeEvent<HTMLInputElement>, key): void => {
        const _editData = { ...editData }
        _editData[key] = event.target.value || ''
        setEditData(_editData)

        if (key === 'customDate') {
            setCustomDate(parseInt(event.target.value))
        }
    }

    return (
        <div className="api-token__container fs-13 fw-4" style={{ minHeight: 'calc(100vh - 235px)' }}>
            <div className="cn-9 fw-6 fs-16">
                <span className="cb-5">API tokens</span> / Edit API token
            </div>
            <p className="fs-13 fw-4">
                API tokens function like ordinary OAuth access tokens. They can be used instead of a password for Git
                over HTTPS, or can be used to authenticate to the API over Basic Authentication.
            </p>

            <div className="bcn-0 br-8 en-2 bw-1">
                {renderRegenrateInfoBar()}
                <form
                    onSubmit={(e) => {
                        // saveToken()
                    }}
                    className="pl-20 pr-20 pb-20 "
                >
                    <div>
                        <label className="form__row">
                            <span className="form__label">Name</span>
                            <input
                                tabIndex={1}
                                className="form__input"
                                value={editData.name}
                                disabled={!!editData.name}
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
                            <input
                                tabIndex={1}
                                placeholder="Enter a description to remember where you have used this token"
                                className="form__input"
                                value={editData.description}
                                onChange={(e) => onChangeEditData(e, 'description')}
                            />
                        </label>
                        <label className="form__row">
                            <span className="form__label">Token</span>
                            <div className="flex content-space mono top">
                                <span style={{ wordBreak: 'break-word' }}>{editData.token}</span>
                                <Clipboard
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        copyToClipboard(selectedList.token, () => setCopied(true))
                                    }}
                                    className="icon-dim-16 ml-8 cursor"
                                />
                            </div>
                        </label>
                        <label className="form__row">
                            <span className="form__label">Expiration</span>
                            <div className="flex left">
                                This token expires on
                                {moment(editData.expireAtInMs).format(Moment12HourFormat)}.
                                <span className=" fw-4"> To set a new expiration date you must </span>
                                <span className="cb-5 ml-4 cursor" onClick={() => setShowRegeneratedModal(true)}>
                                    regenerate the token.
                                </span>
                            </div>
                        </label>
                        <div className="pointer flex form__permission">
                            {PermissionType.map(({ label: Lable, value }, index) => (
                                <div
                                    className="flex left"
                                    key={`generate_token_${index}`}
                                    // onChange={() => setAdminPermission(value)}
                                >
                                    <label key={value} className=" flex left">
                                        <input
                                            type="radio"
                                            name="auth"
                                            value={value}
                                            // checked={value === adminPermission}
                                        />
                                        <span className="ml-8 mt-4">{Lable}</span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* {adminPermission === 'SUPERADMIN' && ( */}
                        {/* <div> */}
                        {/* <AppPermissions
                                          data={userData}
                                          directPermission={directPermission}
                                          setDirectPermission={setDirectPermission}
                                          chartPermission={chartPermission}
                                          setChartPermission={setChartPermission}
/> */}
                        {/* </div> */}
                        {/* )} */}
                        {deleteConfirmation && renderDeleteModal(selectedList)}
                    </div>
                </form>
                <hr className="modal__divider mt-20 mb-0" />
                <GenerateActionButton
                    loader={false}
                    onCancel={redirectToTokenList}
                    onSave={handleUpdatedToken}
                    buttonText={'Update token'}
                    showDelete={true}
                    onDelete={handleDeleteButton}
                />
            </div>
            {showRegeneratedModal && (
                <RegeneratedModal
                    close={handleRegenerateActionButton}
                    selectedExpirationDate={selectedExpirationDate}
                    setSelectedExpirationDate={setSelectedExpirationDate}
                    setShowRegeneratedModal={setShowRegeneratedModal}
                />
            )}
        </div>
    )
}

export default EditAPIToken
