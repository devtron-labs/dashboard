import React from 'react'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import RegeneratedModal from './RegenerateModal'
import { EditTokenType } from './authorization.type'
import { PermissionType } from './authorization.utils'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import GenerateActionButton from './GenerateActionButton'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useParams } from 'react-router'
import moment from 'moment'
import { Moment12HourFormat } from '../../config'

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
}: EditTokenType) {
    const history = useHistory()
    const match = useRouteMatch()
    const params = useParams<{ id: string }>()

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

    const handleEditDeleteButton = () => {
        return
    }
    return (
        <div className="api-token__container" style={{ minHeight: 'calc(100vh - 235px)' }}>
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
                    {tokenList &&
                        tokenList
                            .filter((list) => list.userId === parseInt(params.id))
                            .map((list) => {
                                return (
                                    <div>
                                        <label className="form__row">
                                            <span className="form__label">Name</span>
                                            <input
                                                tabIndex={1}
                                                placeholder={formData.name}
                                                className="form__input"
                                                value={list.name}
                                                disabled={!!list.name}
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
                                                value={list.description}
                                                // onChange={(e) => onChangeFormData(e, 'name')}
                                            />
                                        </label>
                                        <label className="form__row">
                                            <span className="form__label">Token</span>
                                            <div className="flex content-space">
                                                {list.token}
                                                <Clipboard className="icon-dim-16 ml-8" />
                                            </div>
                                        </label>
                                        <label className="form__row">
                                            <span className="form__label">Expiration</span>
                                            <div className="flex left">
                                                This token expires on{' '}
                                                {moment(list.expireAtInMs).format(Moment12HourFormat)}.
                                                <span className=" fw-4"> To set a new expiration date you must </span>
                                                <span
                                                    className="cb-5 ml-4 cursor"
                                                    onClick={() => setShowRegeneratedModal(true)}
                                                >
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
                                    </div>
                                )
                            })}
                </form>
                <hr className="modal__divider mt-20 mb-0" />
                <GenerateActionButton
                    loader={false}
                    onCancel={redirectToTokenList}
                    onSave={undefined}
                    buttonText={'Update token'}
                    showDelete={true}
                    onDelete={handleEditDeleteButton}
                />
            </div>
            {showRegeneratedModal && (
                <RegeneratedModal
                    close={handleRegenerateActionButton}
                    selectedExpirationDate={selectedExpirationDate}
                    setSelectedExpirationDate={undefined}
                    setShowRegeneratedModal={setShowRegeneratedModal}
                />
            )}
        </div>
    )
}

export default EditAPIToken
