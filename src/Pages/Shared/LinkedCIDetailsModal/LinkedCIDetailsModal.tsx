import React from 'react'
import { Drawer, InfoColourBar, SearchBar, getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import ReactSelect from 'react-select'
import { LinkedCIDetailModalProps } from './types'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import LinkedCIAppList from './LinkedCIAppList'
import './linkedCIAppList.scss'

const commonStyles = getCommonSelectStyle()

const LinkedCIDetailsModal = ({
    ciPipelineName,
    linkedWorkflowCount,
    onCloseUrl,
    ciPipelineId,
}: LinkedCIDetailModalProps) => {
    const history = useHistory()

    const handleClose = () => {
        history.push(onCloseUrl)
    }

    return (
        <Drawer position="right" width="800px">
            <div className="bcn-0 h-100 flexbox-col flex-grow-1">
                <div className="flex flex-justify dc__border-bottom pt-12 pr-20 pb-12 pl-20 dc__position-sticky">
                    <h2 className="fs-16 fw-6 lh-24 m-0 dc__ellipsis-right">{ciPipelineName}</h2>
                    <button
                        type="button"
                        className="dc__transparent dc__no-shrink"
                        aria-label="close-modal"
                        onClick={handleClose}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="flexbox-col flex-grow-1">
                    <InfoColourBar
                        message={`This build pipeline is linked as image source in ${linkedWorkflowCount} ${linkedWorkflowCount === 1 ? 'workflow' : 'workflows'}.`}
                        classname="info_bar"
                        Icon={Info}
                    />
                    <div className="flex flex-justify-start dc__gap-8 pl-20 pr-20 pt-8 pb-8 lh-20">
                        <div className="w-250">
                            <SearchBar />
                        </div>
                        <div className="w-200">
                            <ReactSelect
                                styles={{
                                    ...commonStyles,
                                    control: (base) => ({
                                        ...base,
                                        ...commonStyles.control,
                                        backgroundColor: 'var(--N50)',
                                    }),
                                }}
                            />
                        </div>
                    </div>
                    <LinkedCIAppList ciPipelineId={ciPipelineId} />
                </div>
            </div>
        </Drawer>
    )
}

export default LinkedCIDetailsModal
