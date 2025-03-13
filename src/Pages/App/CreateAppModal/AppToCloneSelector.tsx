import AsyncSelect from 'react-select/async'
import { AppSelectorNoOptionsMessage, InfoBlock, multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'
import { appListOptions } from '@Components/AppSelector/AppSelectorUtil'
import { Option } from '@Components/v2/common/ReactSelect.utils'
import { ReactComponent as ICError } from '@Icons/ic-warning.svg'
import { AppToCloneSelectorProps } from './types'

const _multiSelectStyles = {
    ...multiSelectStyles,
    control: (base, state) => ({
        ...multiSelectStyles.control(base, state),
        cursor: 'pointer',
    }),
    menu: (base, state) => ({
        ...multiSelectStyles.menu(base, state),
        marginTop: 'auto',
    }),
    menuList: (base) => ({
        ...base,
        position: 'relative',
        paddingBottom: '0px',
        maxHeight: '180px',
    }),
}

const AppToCloneSelector = ({ isJobView, error, handleCloneIdChange }: AppToCloneSelectorProps) => {
    const loadAppListOptions = (inputValue: string) => appListOptions(inputValue, isJobView)

    const onChange = (selectedClonedApp) => {
        handleCloneIdChange(selectedClonedApp.value)
    }

    return (
        <>
            <div>
                <span
                    className="form__label dc__required-field"
                    data-testid={`Clone-${isJobView ? 'job' : 'app'}-option`}
                >
                    Select an {isJobView ? 'job' : 'app'} to clone
                </span>
                <AsyncSelect
                    classNamePrefix={`${isJobView ? 'job' : 'app'}-name-for-clone`}
                    loadOptions={loadAppListOptions}
                    noOptionsMessage={AppSelectorNoOptionsMessage}
                    onChange={onChange}
                    styles={_multiSelectStyles}
                    components={{
                        IndicatorSeparator: null,
                        LoadingIndicator: null,
                        Option,
                    }}
                    placeholder={`Select ${isJobView ? 'job' : 'app'}`}
                />
                {error && (
                    <span className="form__error">
                        <ICError className="form__icon form__icon--error" />
                        {error}
                    </span>
                )}
            </div>
            <InfoBlock
                heading="Important:"
                description={
                    isJobView
                        ? 'Do not forget to modify git repositories and corresponding branches to be used for each Job Pipeline if required.'
                        : 'Do not forget to modify git repositories, corresponding branches and container registries to be used for each CI Pipeline if required.'
                }
            />
        </>
    )
}

export default AppToCloneSelector
