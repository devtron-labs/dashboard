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
import { showError, Progressing, DialogForm, CustomInput, ToastVariantType, ToastManager } from '@devtron-labs/devtron-fe-common-lib'
import { ChartGroup, CreateChartGroupProps } from '../charts.types'
import { getChartGroups, saveChartGroup, updateChartGroup } from '../charts.service'
import { getChartGroupEditURL } from '../charts.helper'
import { REGEX_ERROR_MESSAGES, REQ_FIELD } from '../constants'

interface ChartGroupCreateState {
    name: { value: string; error: any[] }
    description: string
    loading: boolean
    charts: ChartGroup[]
}

export default class CreateChartGroup extends Component<CreateChartGroupProps, ChartGroupCreateState> {
    constructor(props) {
        super(props)
        this.state = {
            name: { value: '', error: [] },
            description: '',
            loading: false,
            charts: [],
        }
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
        this.handleNameChange = this.handleNameChange.bind(this)
        this.saveChartGroup = this.saveChartGroup.bind(this)
    }

    handleNameChange(event) {
        const lowercaseRegex = new RegExp('^[a-z0-9-. ]*$')
        const startAndEndAlphanumericRegex = new RegExp(`^[a-zA-Z0-9 ].*[a-zA-Z0-9 ]$`)
        const errors = []

        if (!event.target.value) {
            errors.push(REQ_FIELD)
        } else {
            if (event.target.value.trim().length < 5) {
                errors.push(REGEX_ERROR_MESSAGES.MIN_5_CHAR)
            }

            if (!lowercaseRegex.test(event.target.value)) {
                errors.push(REGEX_ERROR_MESSAGES.LOWER_CASE)
            }

            if (!startAndEndAlphanumericRegex.test(event.target.value) && !(event.target.value.length == 1)) {
                errors.push(REGEX_ERROR_MESSAGES.START_END_ALPHA)
            }

            if (event.target.value.trim().indexOf(' ') >= 0) {
                errors.push(REGEX_ERROR_MESSAGES.NO_SPACE)
            }

            if (event.target.value.length > 30) {
                errors.push(REGEX_ERROR_MESSAGES.MAX_30_CHAR)
            }
        }

        this.setState({
            name: {
                ...this.state.name,
                error: errors,
            },
        })
        this.setState({ name: { value: event.target.value.trim(), error: errors } })
    }

    handleDescriptionChange(event) {
        this.setState({ description: event.target.value })
    }

    checkIfNameIsValid() {
        if (this.state.name.value.length < 5) {
            return false
        }

        const isNameUsed = this.state.charts.some(
            (chart) => chart.name === this.state.name.value && chart.id !== this.props.chartGroupId,
        )
        if (isNameUsed) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: `A chart group with name ${this.state.name.value} already exists!`,
            })
            return false
        }
        return true
    }

    async saveChartGroup(e) {
        if (!this.state.name.value) {
            this.setState({
                name: {
                    ...this.state.name,
                    error: [REQ_FIELD],
                },
            })
        }

        if (!this.checkIfNameIsValid()) {
            return
        }

        const requestBody = {
            name: this.state.name.value.trim(),
            description: this.state.description,
        }
        let api = saveChartGroup
        if (this.props.chartGroupId) {
            requestBody['id'] = this.props.chartGroupId
            api = updateChartGroup
        }
        this.setState({ loading: true })
        api(requestBody)
            .then((response) => {
                if (this.props.chartGroupId) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Successfully updated.',
                    })
                    this.props.closeChartGroupModal({
                        name: this.state.name.value,
                        description: this.state.description,
                    })
                } else {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Successfully created.',
                    })
                    const url = getChartGroupEditURL(response.result.id)
                    this.props.history.push(url)
                }
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                this.setState({ loading: false })
            })
    }

    async getInitCharts() {
        this.setState({
            loading: true,
        })
        try {
            const { result } = await getChartGroups()
            this.setState({ charts: result.groups })
        } catch (err) {
            showError(err)
        } finally {
            this.setState({
                loading: false,
            })
        }
    }

    // TODO: setting state from props is anti-pattern. what is the need of name and description in if condition?
    componentDidMount() {
        if (this.props.chartGroupId && this.props.name) {
            this.setState({ name: { value: this.props.name, error: [] }, description: this.props.description || '' })
        }

        this.getInitCharts()
    }

    render() {
        return (
            <DialogForm
                title={this.props.chartGroupId ? 'Update Chart Group' : `Create Chart Group`}
                className=""
                closeOnESC
                isLoading={this.state.loading}
                close={this.props.closeChartGroupModal}
                onSave={this.saveChartGroup}
            >
                <label className="form__row">
                    <CustomInput
                        name="name"
                        label="Name"
                        value={this.state.name.value}
                        data-testid="create-group-name-value"
                        placeholder="e.g. elastic-stack"
                        autoFocus
                        tabIndex={1}
                        onChange={this.handleNameChange}
                        isRequiredField
                        error={this.state.name.error}
                    />
                </label>

                <label className="form__row">
                    <span className="form__label" data-testid="create-group-desc-heading">
                        Description
                    </span>
                    <textarea
                        className="form__input form__input--textarea"
                        name="description"
                        value={this.state.description}
                        placeholder="Enter a short description for this group."
                        autoFocus
                        tabIndex={2}
                        data-testid="create-group-desc"
                        onChange={this.handleDescriptionChange}
                        required
                    />
                    <span className="form__error" />
                </label>
                <button
                    type="button"
                    className="cta dc__align-right"
                    onClick={this.saveChartGroup}
                    data-testid="save-group-button"
                >
                    {this.state.loading ? <Progressing /> : this.props.chartGroupId ? 'Update Group' : 'Create Group'}
                </button>
            </DialogForm>
        )
    }
}
