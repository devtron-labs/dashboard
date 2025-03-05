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

import moment from 'moment'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
    GenericFilterEmptyState,
    FeatureTitleWithInfo,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { HEADER_TEXT, MomentDateFormat } from '../../../../config'
import { ReactComponent as Key } from '../../../../assets/icons/ic-key-bulb.svg'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-interactive.svg'
import { APITokenListType, TokenListType } from './apiToken.type'
import { isTokenExpired } from './apiToken.utils'
import DeleteAPITokenModal from './DeleteAPITokenModal'
import './apiToken.scss'

const APITokenList = ({ tokenList, renderSearchToken, reload }: APITokenListType) => {
    const history = useHistory()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [selectedToken, setSelectedToken] = useState<TokenListType>()

    const handleGenerateRowActionButton = (key: 'create' | 'edit', id?) => {
        history.push(id ? `${key}/${id}` : key)
    }

    const handleDeleteButton = (_tokenList) => {
        setSelectedToken(_tokenList)
        setShowDeleteConfirmation(true)
    }

    const handleGenerateRowAction = () => {
        handleGenerateRowActionButton('create')
    }

    const handleEditRowAction = (e) => {
        const { id } = tokenList[e.currentTarget.dataset.index]
        handleGenerateRowActionButton('edit', id)
    }

    const handleDelete = (e) => {
        const list = tokenList[e.currentTarget.dataset.index]
        handleDeleteButton(list)
    }

    const noMatchingResults = () => <GenericFilterEmptyState />

    return (
        <div className="bg__primary">
            <div data-testid="api-token-page-header" className="flex dc__content-space pl-20 pr-20 pb-16">
                <FeatureTitleWithInfo
                    title={HEADER_TEXT.API_TOKEN.title}
                    renderDescriptionContent={() => HEADER_TEXT.API_TOKEN.description}
                    docLink={HEADER_TEXT.API_TOKEN.docLink}
                    showInfoIconTippy
                    dataTestId="api-token-feature-title"
                />
                <div className="flex dc__align-end dc__content-end">
                    {renderSearchToken()}
                    <button
                        type="button"
                        data-testid="api-token-generate-button"
                        className="flex cta h-32 ml-10"
                        onClick={handleGenerateRowAction}
                    >
                        Generate new token
                    </button>
                </div>
            </div>
            <div className="api-token__list">
                <div className="api-list__row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pl-20 pr-20 dc__uppercase">
                    <div />
                    <div>Name</div>
                    <div>Last Used On</div>
                    <div>Last used by Ip add.</div>
                    <div>Expires on</div>
                    <div />
                </div>
                <div className="dc__overflow-auto api__list__height dc__position-rel">
                    {!tokenList || tokenList.length === 0
                        ? noMatchingResults()
                        : tokenList.map((list, index) => (
                              <div
                                  key={`api_${list.id}`}
                                  data-testid="api-list-row"
                                  className="api-list__row api-list-row flex-align-center fw-4 cn-9 fs-13 pr-20 pl-20"
                                  style={{ height: '45px' }}
                              >
                                  <button
                                      type="button"
                                      className="dc__transparent cursor flex"
                                      data-index={index}
                                      onClick={handleEditRowAction}
                                      aria-label="Edit api token"
                                  >
                                      <Key
                                          className={`api-key-icon icon-dim-20 ${
                                              isTokenExpired(list.expireAtInMs) ? 'api-key-expired-icon' : ''
                                          }`}
                                      />
                                  </button>
                                  <div className="flexbox cb-5 cursor" data-index={index} onClick={handleEditRowAction}>
                                      <span className="dc__ellipsis-right">{list.name}</span>
                                  </div>
                                  <div className="dc__ellipsis-right">
                                      {list.lastUsedAt
                                          ? moment(list.lastUsedAt).format(MomentDateFormat)
                                          : 'Never used'}
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
                                  <div className="api__row-actions flex right dc__gap-8">
                                      <Button
                                          icon={<Edit />}
                                          ariaLabel="Edit api token"
                                          variant={ButtonVariantType.borderLess}
                                          style={ButtonStyleType.neutral}
                                          size={ComponentSizeType.xs}
                                          data-index={index}
                                          dataTestId="api-token-edit-button"
                                          onClick={handleEditRowAction}
                                      />

                                      <Button
                                          icon={<Trash />}
                                          variant={ButtonVariantType.borderLess}
                                          style={ButtonStyleType.negativeGrey}
                                          size={ComponentSizeType.xs}
                                          ariaLabel="Delete api token"
                                          data-index={index}
                                          dataTestId="api-token-delete-button"
                                          onClick={handleDelete}
                                      />
                                  </div>
                              </div>
                          ))}
                </div>
                {selectedToken && showDeleteConfirmation && (
                    <DeleteAPITokenModal
                        tokenData={selectedToken}
                        reload={reload}
                        setDeleteConfirmation={setShowDeleteConfirmation}
                    />
                )}
            </div>
        </div>
    )
}

export default APITokenList
