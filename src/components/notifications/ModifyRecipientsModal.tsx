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

import { Component } from 'react'
import { showError, Progressing, VisibleModal, RadioGroup, RadioGroupItem, ToastVariantType, ToastManager } from '@devtron-labs/devtron-fe-common-lib'
import CreatableSelect from 'react-select/creatable'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Slack } from '../../assets/icons/slack-logo.svg'
import { ReactComponent as Email } from '../../assets/icons/ic-mail.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Webhook } from '../../assets/icons/ic-CIWebhook.svg'
import { updateNotificationRecipients } from './notifications.service'
import { multiSelectStyles, DropdownIndicator, MultiValueLabel, Option } from './notifications.util'
import './notifications.scss'
import { EMAIL_AGENT } from './types'

interface ModifyRecipientsModalProps {
    channelList: SelectedRecipientType[]
    onSaveSuccess: () => void
    closeModifyRecipientsModal: () => void
    notificationListFromParent: {
        id: number
        providers: { dest: string; configId: number; recipient: string; name?: string }[]
    }[]
}

interface RecipientType {
    configId: number
    recipient: string
    dest: string
    name?: string
}

interface SelectedRecipientType {
    __isNew__?: boolean
    label: string
    value: string
    data: RecipientType
}

interface ModifyRecipientsModalState {
    isLoading: boolean
    savedRecipients: RecipientType[]
    selectedRecipient: SelectedRecipientType[]
    showEmailAgents: boolean
    selectedEmailAgent: string
    recipientWithoutEmailAgent: boolean
}

export class ModifyRecipientsModal extends Component<ModifyRecipientsModalProps, ModifyRecipientsModalState> {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            selectedRecipient: [],
            savedRecipients: [],
            showEmailAgents: false,
            selectedEmailAgent: null,
            recipientWithoutEmailAgent: false,
        }
        this.saveRecipients = this.saveRecipients.bind(this)
        this.changeEmailAgent = this.changeEmailAgent.bind(this)
    }

    componentDidMount() {
        let oldRecipientList = []
        let _recipientWithoutEmailAgent = false
        for (let i = 0; i < this.props.notificationListFromParent.length; i++) {
            if (!_recipientWithoutEmailAgent) {
                _recipientWithoutEmailAgent = !this.props.notificationListFromParent[i].providers.some(
                    (elem) => elem.dest === 'ses' || elem.dest === 'smtp',
                )
            }
            oldRecipientList = oldRecipientList.concat(this.props.notificationListFromParent[i].providers)
        }
        const set = new Set()
        const arrayWithouDuplicates = []
        for (let i = 0; i < oldRecipientList.length; i++) {
            const uniqueValue = `${oldRecipientList[i].configId}_${oldRecipientList[i].name}_${oldRecipientList[i].recipient}`
            if (set.has(uniqueValue)) {
                continue
            }
            set.add(uniqueValue)
            arrayWithouDuplicates.push(oldRecipientList[i])
        }
        this.setState({
            savedRecipients: arrayWithouDuplicates,
            recipientWithoutEmailAgent: _recipientWithoutEmailAgent,
        })
    }

    addRecipient = (selectedProviders): void => {
        const state = { ...this.state }
        state.selectedRecipient = selectedProviders || []
        state.recipientWithoutEmailAgent = selectedProviders.some(
            (item) => item.data.dest === 'ses' || item.data.dest === 'smtp',
        )
        state.selectedRecipient = state.selectedRecipient.map((p) => {
            if (p.__isNew__) {
                return { ...p, data: { dest: '', configId: 0, recipient: p.value } }
            }
            return p
        })
        this.setState(state)
    }

    removeRecipient(provider): void {
        const state = { ...this.state }
        state.savedRecipients = state.savedRecipients.filter((p) => {
            if (
                (provider.configId && (p.configId !== provider.configId || p.dest !== provider.dest)) ||
                !(provider.recipient === p.recipient)
            ) {
                return p
            }
        })
        this.setState(state)
    }

    saveRecipients(e) {
        e.preventDefault()
        if (
            this.state.selectedRecipient.length > 0 &&
            this.state.recipientWithoutEmailAgent &&
            !this.state.selectedEmailAgent
        ) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some required fields are missing',
            })
            return
        }
        updateNotificationRecipients(
            this.props.notificationListFromParent,
            this.state.savedRecipients,
            this.state.selectedRecipient,
            this.state.selectedEmailAgent,
        )
            .then((response) => {
                if (response.result) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Saved Successfully',
                    })

                    this.props.onSaveSuccess()
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    changeEmailAgent(event: any): void {
        const state = { ...this.state }
        state.selectedEmailAgent = event.target.value
        this.setState(state)
    }

    renderEmailAgentSelector() {
        if (this.state.selectedRecipient.length > 0 && this.state.recipientWithoutEmailAgent) {
            return (
                <div className="form__row">
                    <div className="bcy-1 ey-2 pt-8 pb-8 br-4 flexbox pl-4 cn-9 fs-13">
                        <AlertTriangle className="mr-8 ml-14 icon-dim-20 no-email-channel-warning" />
                        <span className="lh-20">
                            Email agent (SES/SMTP) is not configured for some selected notifications.
                        </span>
                    </div>
                    <div className="mt-20 mb-6 cn-9 fw-6 fs-14">Send email using*</div>
                    <div className="flexbox mb-20">
                        <RadioGroup
                            className="no-border"
                            value={this.state.selectedEmailAgent}
                            name="trigger-type"
                            onChange={this.changeEmailAgent}
                        >
                            <RadioGroupItem value={EMAIL_AGENT.SES}>{EMAIL_AGENT.SES}</RadioGroupItem>
                            <RadioGroupItem value={EMAIL_AGENT.SMTP}>{EMAIL_AGENT.SMTP}</RadioGroupItem>
                        </RadioGroup>
                    </div>
                </div>
            )
        }
    }

    renderWithBackdrop(body) {
        return (
            <VisibleModal className="">
                <div className="modal__body modal__body--w-600 modal__body--p-0 dc__no-top-radius mt-0">
                    <div className="modal__header m-24">
                        <h1 className="modal__title">Modify Recipients</h1>
                        <button
                            type="button"
                            className="dc__transparent"
                            onClick={this.props.closeModifyRecipientsModal}
                        >
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                        }}
                    >
                        {body}
                    </form>
                </div>
            </VisibleModal>
        )
    }

    render() {
        const body = (
            <>
                <div className="m-24">
                    <div className="form__row">
                        <span className="form__input-header">Remove recipients</span>
                        <span className="form__label mb-16">
                            Recipient will be removed from the respective notification.
                        </span>
                        <div className="form__input h-132">
                            {this.state.savedRecipients.map((p) => {
                                return (
                                    <div className="dc__devtron-tag mr-5 mb-5">
                                        {p.dest === 'ses' || p.dest === 'smtp' ? (
                                            <Email className="icon-dim-20 mr-5" />
                                        ) : null}
                                        {p.dest === 'slack' ? <Slack className="icon-dim-20 mr-5" /> : null}
                                        {p.dest === 'webhook' ? <Webhook className="icon-dim-20 mr-5" /> : null}
                                        {p.recipient ? p.recipient : p.name}
                                        <button
                                            type="button"
                                            className="dc__transparent"
                                            onClick={() => {
                                                this.removeRecipient(p)
                                            }}
                                        >
                                            <i className="fa fa-close ml-5" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="form__row">
                        <span className="form__input-header">Add recipients</span>
                        <span className="form__label mb-16">
                            Recipients will be added to all selected notifications.
                        </span>
                        <CreatableSelect
                            isMulti
                            isClearable={false}
                            autoFocus
                            options={this.props.channelList}
                            value={this.state.selectedRecipient}
                            onChange={this.addRecipient}
                            tabIndex={2}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                                MultiValueLabel,
                                Option,
                            }}
                            styles={{
                                ...multiSelectStyles,
                            }}
                        />
                        {(this.state.selectedRecipient.length === 0 || !this.state.recipientWithoutEmailAgent) && (
                            <div style={{ marginBottom: '60px' }} />
                        )}
                    </div>
                    <div>{this.renderEmailAgentSelector()}</div>
                </div>
                <div className="form__button-group-bottom flex right">
                    <button
                        type="button"
                        className="cta cancel mr-16"
                        tabIndex={3}
                        onClick={this.props.closeModifyRecipientsModal}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="cta"
                        tabIndex={4}
                        disabled={this.state.isLoading}
                        onClick={this.saveRecipients}
                    >
                        {this.state.isLoading ? <Progressing /> : 'Save Changes'}
                    </button>
                </div>
            </>
        )
        return this.renderWithBackdrop(body)
    }
}
