import ReactGA from 'react-ga4'
import { Checkbox, CHECKBOX_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import { GUIViewCheckboxProps } from './types'

const GUIViewCheckbox = ({ node, updateNodeForPath }: GUIViewCheckboxProps) => {
    const getCheckboxClickHandler = () => {
        ReactGA.event({
            category: 'Deployment Template',
            action: 'GUI Checkbox clicked',
        })
        updateNodeForPath(node.path)
    }

    const hasChildren = !!node.children && !!node.children.length

    const title = node.title ?? node.key

    return (
        <div className="flexbox-col dc__gap-4">
            {!hasChildren ? (
                <Checkbox
                    value={CHECKBOX_VALUE.CHECKED}
                    isChecked={node.isChecked}
                    onChange={getCheckboxClickHandler}
                    rootClassName="mb-0 fs-13 cn-7 lh-20"
                    name={title}
                >
                    {title}
                </Checkbox>
            ) : (
                <span className="fs-13 lh-20 fw-6 cn-9">{title}</span>
            )}
            {hasChildren && (
                <div className="flexbox-col pl-12 mt-8 mb-8 dc__border-left-n1 dc__gap-8">
                    {node.children.map((child) => (
                        <GUIViewCheckbox key={child.key} node={child} updateNodeForPath={updateNodeForPath} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default GUIViewCheckbox
