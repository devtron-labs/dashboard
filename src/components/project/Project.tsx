import React, { Component } from 'react';
import { ButtonWithLoader } from '../../components/common';
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import folder from '../../assets/icons/ic-folder.svg';
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg';
import DeleteComponent from '../../util/DeleteComponent';
import { deleteProject } from './service';
import './project.scss'
import { DeleteComponentsName, DC_PROJECT_CONFIRMATION_MESSAGE } from '../../config/constantMessaging';

export interface ProjectProps {
    id: number;
    name: string;
    active: boolean;
    isCollapsed: boolean;
    saveProject: (index: number, key: 'name') => void;
    onCancel: (index) => void;
    handleChange: (Event, index: number, key: 'name') => void;
    loadingData: boolean;
    index: number;
    isValid: { name: boolean };
    errorMessage: { name: string };
    reload: () => void
}

export interface ProjectState {
    deleting: boolean;
    confirmation: boolean;
}
export class Project extends Component<ProjectProps, ProjectState>  {

    constructor(props) {
        super(props)

        this.state = {
            deleting: false,
            confirmation: false,
        }
    }

    toggleConfirmation = () => {
        this.setState((prevState)=>{
           return{ confirmation: !prevState.confirmation}
        })
    }

    setDeleting = () => {
        this.setState({
            deleting: true
        })
    }

    getProjectPayload = () => {
        return {
            id: this.props.id,
            name: this.props.name,
            active:this.props.active,
        }
    }

    handleActionChange = (event: React.ChangeEvent) => {
        this.props.handleChange(event, this.props.index, 'name')
    }

    saveProjectData = (event: React.SyntheticEvent) => {
        event.preventDefault()
        this.props.saveProject(this.props.index, 'name')
    }

    renderCollapsedView() {
        return (
            <div data-testid={`hover-project-id-${this.props.name}`} className="project__row white-card white-card--add-new-item mb-16">
                <img src={folder} alt="" className="icon-dim-24 mr-16" />
                <span className="project-title">{this.props.name}</span>
                <button
                    data-testid={`delete-project-button-${this.props.name}`}
                    type="button"
                    className="project__row__trash dc__transparent dc__align-right"
                    onClick={this.toggleConfirmation}
                >
                    <Trash className="scn-5 icon-dim-20" />
                </button>
                {this.state.confirmation && (
                    <DeleteComponent
                        setDeleting={this.setDeleting}
                        deleteComponent={deleteProject}
                        payload={this.getProjectPayload()}
                        title={this.props.name}
                        toggleConfirmation={this.toggleConfirmation}
                        component={DeleteComponentsName.Project}
                        confirmationDialogDescription={DC_PROJECT_CONFIRMATION_MESSAGE}
                        reload={this.props.reload}
                    />
                )}
            </div>
        );
    }

    renderForm() {
        let isValid = this.props.isValid;
        let errorMessage = this.props.errorMessage;
        return (
            <div>
                <form className="white-card p-24 mb-16 dashed" onSubmit={this.saveProjectData}>
                    <div className="white-card__header"> {this.props.id ? 'Edit project' : 'Add Project'} </div>
                    <label className="form__row">
                        <span className="form__label dc__required-field">Project name</span>
                        <input
                            type="text"
                            autoComplete="off"
                            name="name"
                            value={this.props.name}
                            placeholder="e.g. My Project"
                            className="form__input"
                            autoFocus
                            onChange={this.handleActionChange}
                        />
                        {!isValid.name ? (
                            <span className="form__error">
                                <>
                                    <Error className="form__icon form__icon--error" />
                                    {errorMessage.name}
                                </>
                            </span>
                        ) : null}
                    </label>
                    <div>
                        <div className="form__buttons">
                            <button data-testid="project-cancel-button" type="button" className="cta cancel mr-16" onClick={this.props.onCancel}>
                                Cancel
                            </button>
                            <ButtonWithLoader
                                type="submit"
                                rootClassName="cta"
                                loaderColor="#ffffff"
                                isLoading={this.props.loadingData}
                                dataTestId="project-save-button"
                            >
                                Save
                            </ButtonWithLoader>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    render() {
        if (this.props.isCollapsed) {
            return this.renderCollapsedView();
        }
        else{
            return this.renderForm();
        }
    }
}
