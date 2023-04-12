import React, { useState } from 'react'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { Checkbox } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'

export function Accordian({ header, options, value, onChange, onClickViewChartButton,dataTestId }) {
    const [collapsed, setCollapse] = useState<boolean>(true)

    const toggleDropdown = (): void => {
        setCollapse(!collapsed)
    }

    return (
        <div>
            <div className="flex fs-12 h-36 pt-8 pb-8 cn-6 fw-6 ml-8 dc__content-space cursor" data-testid={dataTestId} onClick={toggleDropdown}>
                {header}
                <Dropdown
                    className="icon-dim-24 rotate"
                    style={{ ['--rotateBy' as any]: collapsed ? '180deg' : '0deg' }}
                />
            </div>
            {collapsed && (
                <div>
                    <button
                        type="button"
                        className="dc__transparent dc__hover-n50 cursor flex left cb-5 fs-13 fw-6 lh-20 h-32 pl-10 w-100"
                        onClick={onClickViewChartButton}
                    >
                        <AddIcon className="icon-dim-16 fcb-5 mr-8" />
                        Add chart repository
                    </button>
                    {options.map((option) => (
                        <div className="dc__position-rel flex left cursor dc__hover-n50">
                            <Checkbox
                                rootClassName="ml-7 h-32 fs-13 mb-0 mr-10 w-100"
                                isChecked={value.filter((event) => event === option).length}
                                value={'CHECKED'}
                                onChange={() => onChange(option)}
                            >
                                <div className="ml-5">{option.label}</div>
                            </Checkbox>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
