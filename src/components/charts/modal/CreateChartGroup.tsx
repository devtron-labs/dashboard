import React, { Component } from 'react'
import { ChartGroup, CreateChartGroupProps } from '../charts.types'
import { showError, Progressing, DialogForm } from '../../common'
import { getChartGroups, saveChartGroup, updateChartGroup } from '../charts.service'
import { getChartGroupEditURL } from '../charts.helper'
import { toast } from 'react-toastify'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'

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
            errors.push('This is a required field')
        } else {
            if (event.target.value.trim().length < 5) {
                errors.push('Minimum 5 characters required')
            }

            if (!lowercaseRegex.test(event.target.value)) {
                errors.push('Use only lowercase alphanumeric characters "-" or "."')
            }

            if (!startAndEndAlphanumericRegex.test(event.target.value) && !(event.target.value.length == 1)) {
                errors.push('Start and end with an alphanumeric character only')
            }

            if (event.target.value.trim().indexOf(' ') >= 0) {
                errors.push("Do not use 'spaces'")
            }

            if (event.target.value.length > 30) {
                errors.push('Must not exceed 30 characters')
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

    checkValid() {
        if (this.state.name.value.length < 5) {
            return false
        }

        let isNameUsed = this.state.charts.some((r) => r.name === this.state.name.value)
        if (isNameUsed) {
            showError({
                message: `A chart group with name ${this.state.name.value} already exists!`,
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
                    error: ['This is a required field'],
                },
            })
        }

        const isValid = this.checkValid()

        if (!isValid) {
            return
        }

        let requestBody = {
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
                    toast.success('Successfully updated.')
                    this.props.closeChartGroupModal({
                        name: this.state.name.value,
                        description: this.state.description,
                    })
                } else {
                    toast.success('Successfully created.')
                    let url = getChartGroupEditURL(response.result.id)
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
    async getInitCharts(){
        this.setState({
            loading:true
        })
        try{
            const { result } = await getChartGroups();
            this.setState({ charts: result.groups });
        }catch(err){
            showError(err);
        }finally{
            this.setState({
                loading:false
            })
        }
        
    }

    //TODO: setting state from props is anti-pattern. what is the need of name and description in if condition?
    componentDidMount() {
        if (this.props.chartGroupId && this.props.name) {
            this.setState({ name: { value: this.props.name, error: [] }, description: this.props.description || '' })
        }
        
        this.getInitCharts();
        
    }

    render() {
        return (
            <DialogForm
                title={this.props.chartGroupId ? 'Update Chart Group' : `Create Chart Group`}
                className=""
                closeOnESC={true}
                isLoading={this.state.loading}
                close={this.props.closeChartGroupModal}
                onSave={this.saveChartGroup}
            >
                <label className="form__row">
                    <span className="form__label">Name*</span>
                    <input
                        className="form__input"
                        autoComplete="off"
                        type="text"
                        name="name"
                        value={this.state.name.value}
                        placeholder="e.g. elastic-stack"
                        autoFocus={true}
                        tabIndex={1}
                        onChange={this.handleNameChange}
                        required
                    />
                    <span className="form__error">
                        {this.state.name.error.map((err) => {
                            return (
                                <div>
                                    <Error className="form__icon form__icon--error" /> {err}
                                </div>
                            )
                        })}
                    </span>
                </label>

                <label className="form__row">
                    <span className="form__label">Description</span>
                    <textarea
                        className="form__input form__input--textarea"
                        name="description"
                        value={this.state.description}
                        placeholder="Enter a short description for this group."
                        autoFocus={true}
                        tabIndex={2}
                        onChange={this.handleDescriptionChange}
                        required
                    />
                    <span className="form__error"></span>
                </label>
                <button type="button" className="cta dc__align-right" onClick={this.saveChartGroup}>
                    {this.state.loading ? <Progressing /> : this.props.chartGroupId ? 'Update Group' : 'Create Group'}
                </button>
            </DialogForm>
        )
    }
}
