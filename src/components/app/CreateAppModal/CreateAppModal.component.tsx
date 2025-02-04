import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    CustomInput,
    Drawer,
    noop,
    ResizableTextarea,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICDevtronApp } from '@Icons/ic-devtron-app.svg'
import { ReactComponent as ICCaretLeftSmall } from '@Icons/ic-caret-left-small.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ChangeEvent, useState } from 'react'
import ProjectSelector from './ProjectSelector'
import {
    CreateAppFormStateActionType,
    CreateAppFormStateType,
    CreationMethodType,
    HandleFormStateChangeParamsType,
} from './types'
import { createAppInitialFormState, CREATION_METHOD_CONFIG } from './constants'

const ApplicationInfoForm = ({
    formState,
    handleFormStateChange,
}: {
    formState: CreateAppFormStateType
    handleFormStateChange: (params: HandleFormStateChangeParamsType) => void
}) => {
    const handleInputChange =
        (action: HandleFormStateChangeParamsType['action']) =>
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            handleFormStateChange({ action, value: event.target.value })
        }

    const handleProjectIdChange = (projectId: CreateAppFormStateType['projectId']) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateProjectId,
            value: projectId,
        })
    }

    return (
        <div className="flexbox-col dc__gap-16 p-20 br-8 border__secondary bg__primary">
            <ICDevtronApp className="icon-dim-48 dc__no-shrink" />
            <div className="flexbox dc__gap-8">
                <ProjectSelector
                    selectedProjectId={formState.projectId}
                    handleProjectIdChange={handleProjectIdChange}
                />
                <span className="pt-26 fs-20 lh-36 cn-7 flex dc__no-shrink">/</span>
                <CustomInput
                    label="Application name"
                    isRequiredField
                    required
                    rootClassName="h-36"
                    name="name"
                    onChange={handleInputChange(CreateAppFormStateActionType.updateName)}
                    value={formState.name}
                    placeholder="Enter name"
                    inputWrapClassName="w-100"
                />
            </div>
            <ResizableTextarea
                name="description"
                placeholder="Write a description for this application"
                value={formState.description}
                onChange={handleInputChange(CreateAppFormStateActionType.updateDescription)}
            />
            <div className="flex left dc__gap-8">
                <ICCaretLeftSmall className="scn-7 dc__no-shrink dc__transition--transform dc__flip-180" />
                <span className="fs-13 fw-6 lh-20 cn-9">Add tags to application</span>
            </div>
        </div>
    )
}

const HeaderSection = ({
    isJobView,
    handleClose,
    disableClose,
}: {
    isJobView?: boolean
    handleClose
    disableClose: boolean
}) => (
    <div className="flex flex-align-center flex-justify border__primary--bottom py-12 px-20">
        <h2 className="fs-16 fw-6 lh-1-43 m-0">Create {isJobView ? 'Job' : 'Devtron Application'}</h2>
        <Button
            onClick={handleClose}
            dataTestId={`close-create-custom${isJobView ? 'job' : 'app'}-wing`}
            icon={<ICClose />}
            disabled={disableClose}
            ariaLabel="Close"
            showAriaLabelInTippy={false}
            style={ButtonStyleType.negativeGrey}
            size={ComponentSizeType.small}
            variant={ButtonVariantType.borderLess}
        />
    </div>
)

const Sidebar = ({
    selectedCreationMethod,
    handleCreationMethodChange,
}: {
    selectedCreationMethod: CreationMethodType
    handleCreationMethodChange: (creationMethod: CreationMethodType) => void
}) => {
    const getHandleCreationMethodChange = (creationMethod: CreationMethodType) => () => {
        handleCreationMethodChange(creationMethod)
    }

    return (
        <div className="w-250 p-20 flexbox-col dc__gap-24">
            <div className="flexbox-col">
                {CREATION_METHOD_CONFIG.map(({ label, value }) => {
                    const isSelected = value === selectedCreationMethod

                    return (
                        <button
                            className={`dc__transparent flex left dc__gap-8 py-6 px-8 ${isSelected ? 'br-4 bcb-1' : 'dc__hover-n50'}`}
                            key={value}
                            aria-label={`Creation method: ${label}`}
                            type="button"
                            onClick={getHandleCreationMethodChange(value)}
                        >
                            {/* Add icon */}
                            <span className={`fs-13 lh-20 dc__truncate ${isSelected ? 'cb-5 fw-6' : 'cn-9'}`}>
                                {label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreateAppModal = (props: any) => {
    const [selectedCreationMethod, setSelectedCreationMethod] = useState<CreationMethodType>(
        CREATION_METHOD_CONFIG[0].value,
    )
    const [formState, setFormState] = useState<CreateAppFormStateType>(structuredClone(createAppInitialFormState))

    const handleFormStateChange = ({ action, value }: HandleFormStateChangeParamsType) => {
        const updatedFormState = structuredClone(formState)

        switch (action) {
            case CreateAppFormStateActionType.updateProjectId:
                updatedFormState.projectId = value
                break
            case CreateAppFormStateActionType.updateName:
                updatedFormState.name = value
                break
            case CreateAppFormStateActionType.updateDescription:
                updatedFormState.description = value
                break
            default:
                throw new Error(`Invalid action type: ${action}`)
        }

        setFormState(updatedFormState)
    }

    return (
        <Drawer position="right" width="1024px">
            <div className="h-100 bg__primary flexbox-col dc__overflow-hidden">
                <HeaderSection isJobView={false} handleClose={noop} disableClose={false} />
                <div className="flexbox flex-grow-1 dc__overflow-auto">
                    <Sidebar
                        selectedCreationMethod={selectedCreationMethod}
                        handleCreationMethodChange={setSelectedCreationMethod}
                    />
                    <div className="p-20 flex-grow-1 bg__secondary h-100 dc__overflow-auto">
                        <ApplicationInfoForm formState={formState} handleFormStateChange={handleFormStateChange} />
                    </div>
                </div>
                <div className="px-20 py-16 flexbox dc__content-end dc__no-shrink border__primary--top">
                    <Button text="Create Application" dataTestId="create" />
                </div>
            </div>
        </Drawer>
    )
}

export default CreateAppModal
