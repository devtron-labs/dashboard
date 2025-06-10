import { ComponentSizeType, CustomInput, Icon, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'

import { SourceMaterialsSelectorProps } from './types'

export const SourceMaterialsSelector = ({
    repoName,
    sourceTypePickerProps,
    branchInputProps,
}: SourceMaterialsSelectorProps) => (
    <div className="flexbox-col dc__gap-8">
        {repoName && (
            <div className="flex left dc__gap-8">
                <Icon name="ic-git" color={null} size={24} />
                <p className="m-0 fs-13 lh-20 fw-6 cn-9">{repoName}</p>
            </div>
        )}
        <div className="dc__grid-cols-2 dc__gap-12">
            <SelectPicker<string | number, false>
                {...sourceTypePickerProps}
                required
                isSearchable={false}
                isClearable={false}
                closeMenuOnSelect
                size={ComponentSizeType.large}
            />
            {!branchInputProps.hideInput && <CustomInput {...branchInputProps} type="text" required />}
        </div>
    </div>
)
