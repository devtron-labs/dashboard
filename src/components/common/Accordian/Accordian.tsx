import React, { useState } from 'react'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { CHECKBOX_VALUE, Checkbox } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'
import AddChartSource from '../../charts/list/AddChartSource'

export function Accordian({ header, options, value, onChange, onClickViewChartButton,dataTestId }) {
    const [collapsed, setCollapse] = useState<boolean>(true)
    const [showAddSource, toggleAddSource] = useState<boolean>(false)
    const toggleDropdown = (): void => {
        setCollapse(!collapsed)
    }

    const handleTogleAddSource = () => {
        toggleAddSource(!showAddSource)
    }

    return (
        <div>
            <div
                className="flex fs-12 h-36 pt-8 pb-8 cn-6 fw-6 ml-8 dc__content-space cursor"
                data-testid={dataTestId}
                onClick={toggleDropdown}
            >
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
                        className="dc__position-rel dc__transparent dc__hover-n50 cursor flex left cb-5 fs-13 fw-6 lh-20 h-32 pl-10 w-100"
                        onClick={handleTogleAddSource}
                    >
                        <AddIcon className="icon-dim-16 fcb-5 mr-8" />
                        Add chart source
                    </button>
                    {showAddSource && <div className="dc__transparent-div" onClick={handleTogleAddSource}> <AddChartSource /> </div>}
                    {options.map((option) => (
                        <div
                            className="dc__position-rel flex left cursor dc__hover-n50"
                            data-testid={`${option.label}-chart-repo`}
                        >
                            <Checkbox
                                rootClassName="ml-7 h-32 fs-13 mb-0 mr-10 w-100"
                                isChecked={ value?.filter((selectedVal) => selectedVal.value === option.value).length}
                                value={CHECKBOX_VALUE.CHECKED}
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
