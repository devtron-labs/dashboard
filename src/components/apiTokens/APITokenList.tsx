import moment from 'moment'
import React, { useState } from 'react'
import { DOCUMENTATION, MomentDateFormat } from '../../config'
import { ReactComponent as Key } from '../../assets/icons/ic-key-bulb.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete-interactive.svg'
import { useHistory } from 'react-router-dom'
import { APITokenListType, TokenListType } from './authorization.type'
import { isTokenExpired } from './authorization.utils'
import DeleteAPITokenModal from './DeleteAPITokenModal'
import NoResults from '../../assets/img/empty-noresult@2x.png'
import './apiToken.scss'
import { TippyCustomized, TippyTheme, EmptyState, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { EMPTY_STATE_STATUS } from '../../config/constantMessaging'


function APITokenList({ tokenList, renderSearchToken, reload }: APITokenListType) {
    const history = useHistory()
    const [showDeleteConfirmation, setDeleteConfirmation] = useState(false)
    const [selectedToken, setSelectedToken] = useState<TokenListType>()

    const handleGenerateRowActionButton = (key: 'create' | 'edit', id?) => {
        history.push(id ? `${key}/${id}` : key)
    }

    const handleDeleteButton = (tokenList) => {
        setSelectedToken(tokenList)
        setDeleteConfirmation(true)
    }

    const handleQuestion = () => {
        return (
            <TippyCustomized
                theme={TippyTheme.white}
                className="w-300 h-100 fcv-5"
                placement="right"
                Icon={QuestionFilled}
                heading={"API tokens"}
                infoText="Tokens you have generated that can be used to access the Devtron API."
                showCloseButton={true}
                trigger="click"
                interactive = {true}
                documentationLink={DOCUMENTATION.WEBHOOK_API_TOKEN}
                documentationLinkText="View Documentation"
            >
                <div className="icon-dim-16 fcn-9 ml-8 cursor">
                    <Question />
                </div>

            </TippyCustomized>
        )
    }

    const handleGenerateRowAction = () => {
        handleGenerateRowActionButton('create')
    }

    const handleEditRowAction = (e) => {
        const id = tokenList[e.currentTarget.dataset.index].id
        handleGenerateRowActionButton('edit',id)
    }

    const handleDelete = (e) => {
        const list = tokenList[e.currentTarget.dataset.index]
        handleDeleteButton(list)
    }

    const noMatchingResults = () => {
      return (
          <GenericEmptyState
              image={NoResults}
              title={EMPTY_STATE_STATUS.API_TOKEN.TITLE}
              subTitle={EMPTY_STATE_STATUS.API_TOKEN.SUBTITLE}
          />
      )
  }

    return (
        <div className="bcn-0">
            <div data-testid="api-token-page-header" className="flex dc__content-space pl-20 pr-20 pt-16 pb-16">
                <div className="flex row ml-0">
                    <div className="cn-9 fw-6 fs-16">API tokens</div>
                    {handleQuestion()}
                </div>
                <div className="flex dc__align-end dc__content-end">
                    {renderSearchToken()}
                    <button
                        data-testid="api-token-generate-button"
                        className="flex cta h-32 ml-10 app-status-card__divider"
                        onClick={handleGenerateRowAction}
                    >
                        Generate new token
                    </button>
                </div>
            </div>
            <div className="api-token__list">
                <div className="api-list__row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pl-20 pr-20 dc__uppercase">
                    <div></div>
                    <div>Name</div>
                    <div>Last Used On</div>
                    <div>Last used by Ip add.</div>
                    <div>Expires on</div>
                    <div></div>
                </div>
                <div className="dc__overflow-scroll api__list__height">
                    {!tokenList || tokenList.length === 0 ? (
                        noMatchingResults()
                    ) : (
                        tokenList.map((list, index) => (
                            <div
                                key={`api_${index}`}
                                data-testid="api-list-row"
                                className="api-list__row api-list-row flex-align-center fw-4 cn-9 fs-13 pr-20 pl-20"
                                style={{ height: '45px' }}
                            >
                                <button
                                    type="button"
                                    className="dc__transparent cursor flex"
                                    data-index={index}
                                    onClick={handleEditRowAction}
                                >
                                    <Key
                                        className={`api-key-icon icon-dim-20 ${
                                            isTokenExpired(list.expireAtInMs) ? 'api-key-expired-icon' : ''
                                        }`}
                                    />
                                </button>
                                <div className={`flexbox cb-5 cursor`} data-index={index} onClick={handleEditRowAction}>
                                    <span className="dc__ellipsis-right">{list.name}</span>
                                </div>
                                <div className="dc__ellipsis-right">
                                    {list.lastUsedAt ? moment(list.lastUsedAt).format(MomentDateFormat) : 'Never used'}
                                </div>
                                <div>{list.lastUsedByIp ? list.lastUsedByIp : '-'}</div>
                                <div className={`${isTokenExpired(list.expireAtInMs) ? 'cr-5' : ''}`}>
                                    {list.expireAtInMs === 0 ? (
                                        'No expiration date'
                                    ) : (
                                        <>
                                            {isTokenExpired(list.expireAtInMs) ? 'Expired on ' : ''}
                                            {moment(list.expireAtInMs).format(MomentDateFormat)}
                                        </>
                                    )}
                                </div>
                                <div className="api__row-actions flex right">
                                    <button
                                        type="button"
                                        className="dc__transparent mr-12"
                                        data-index={index}
                                        data-testid="api-token-edit-button"
                                        onClick={handleEditRowAction}
                                    >
                                        <Edit className="icon-dim-20" />
                                    </button>
                                    <button
                                        type="button"
                                        className="dc__transparent"
                                        data-index={index}
                                        data-testid="api-token-delete-button"
                                        onClick={handleDelete}
                                    >
                                        <Trash className="scn-6 icon-dim-20" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {showDeleteConfirmation && selectedToken && (
                    <DeleteAPITokenModal
                        tokenData={selectedToken}
                        reload={reload}
                        setDeleteConfirmation={setDeleteConfirmation}
                    />
                )}
            </div>
        </div>
    )
}

export default APITokenList
