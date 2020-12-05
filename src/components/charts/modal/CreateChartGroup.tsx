import React, { Component } from 'react';
import { CreateChartGroupProps } from '../charts.types';
import { showError, Progressing, DialogForm } from '../../common';
import { saveChartGroup, updateChartGroup } from '../charts.service';
import { getChartGroupEditURL } from '../charts.helper';
import { toast } from 'react-toastify';
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg';

interface ChartGroupCreateState {
    name: { value: string; error: string;};
    description: string;
    loading: boolean;
}

export default class CreateChartGroup extends Component<CreateChartGroupProps, ChartGroupCreateState> {

    constructor(props) {
        super(props);
        this.state = {
            name: {value: "", error: ""},
            description: "",
            loading: false
        }
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.saveChartGroup = this.saveChartGroup.bind(this);
    }

    handleNameChange(event) {
        this.setState({ name: {value: event.target.value, error: ""} });
    }

    handleDescriptionChange(event) {
        this.setState({ description: event.target.value });
    }

    async saveChartGroup(e) {
        const nameRegexp = new RegExp(`^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$`)
        if (!nameRegexp.test(this.state.name.value)) {
            this.setState({ name: { ...this.state.name, error: 'name must follow `^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$` pattern.'}})
            return
        }
        let requestBody = {
            name: this.state.name.value,
            description: this.state.description
        }
        let api = saveChartGroup
        if (this.props.chartGroupId) {
            requestBody['id'] = this.props.chartGroupId
            api = updateChartGroup
        }
        this.setState({ loading: true })
        api(requestBody).then((response) => {
            if (this.props.chartGroupId) {
                toast.success('Successfully updated.')
                this.props.closeChartGroupModal({name: this.state.name.value, description: this.state.description});
            }
            else {
                toast.success('Successfully created.')
                let url = getChartGroupEditURL(response.result.id);
                this.props.history.push(url);
            }
        }).catch((error) => {
            showError(error);
        }).finally(() => {
            this.setState({ loading: false })
        })
    }
    //TODO: setting state from props is anti-pattern. what is the need of name and description in if condition?
    componentDidMount() {
        if (this.props.chartGroupId && this.props.name) {
            this.setState({ name: {value: this.props.name, error: ""}, description: this.props.description || "" })
        }
    }

    render() {
        return <DialogForm title={this.props.chartGroupId ? 'Update Chart Group' : `Create Chart Group`} className=""
            closeOnESC={true}
            isLoading={this.state.loading}
            close={this.props.closeChartGroupModal}
            onSave={this.saveChartGroup}>
            <label className="form__row">
                <span className="form__label">Name*</span>
                <input className="form__input" autoComplete="off" type="text" name="name" value={this.state.name.value}
                    placeholder="e.g. elastic-stack" autoFocus={true} tabIndex={1} onChange={this.handleNameChange} required />
                <span className="form__error">
                    {this.state.name.error && <><Error className="form__icon form__icon--error" />{this.state.name.error}</>}
                </span>
            </label>

            <label className="form__row">
                <span className="form__label">Description</span>
                <textarea className="form__input form__input--textarea" name="description" value={this.state.description}
                    placeholder="Enter a short description for this group." autoFocus={true} tabIndex={1} onChange={this.handleDescriptionChange} required />
                <span className="form__error">
                    {/* {showError && !this.state.isValid.appName
                        ? <><Error className="form__icon form__icon--error" />{errorObject[0].message} <br /></>
                        : null} */}
                </span>
            </label>
            <button type="button" className="cta align-right" onClick={this.saveChartGroup}>
                {this.state.loading ? <Progressing /> : this.props.chartGroupId ? 'Update Group' : 'Create Group'}
            </button>
        </DialogForm >
    }
}