import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { GraphVisualizer, GraphVisualizerEdge, GraphVisualizerNode, noop } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICNavRocket } from '@Icons/ic-nav-rocket.svg'

const initialNodes: GraphVisualizerNode[] = [
    {
        id: '1',
        type: 'iconNode',
        data: { icon: <ICNavRocket className="scg-5" /> },
    },
    {
        id: '2',
        type: 'dropdownNode',
        data: {
            icon: <ICNavRocket className="scg-5" />,
            inputId: 'terstst',
            options: [{ value: '123', label: '123' }],
            placeholder: 'Select Option',
        },
    },
    {
        id: '3',
        type: 'textNode',
        data: { icon: <ICNavRocket className="scy-5" />, text: 'Production' },
    },
    {
        id: '4',
        type: 'textNode',
        data: { icon: <ICNavRocket className="scy-5" />, text: 'Production' },
    },
    {
        id: '5',
        type: 'textNode',
        data: { icon: <ICNavRocket className="scy-5" />, text: 'Production' },
    },
    {
        id: '6',
        type: 'textNode',
        data: { icon: <ICNavRocket className="scy-5" />, text: 'Production' },
    },
]

const edges: GraphVisualizerEdge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '2', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
    { id: 'e5-6', source: '4', target: '6' },
]

const GraphVisualizerComponent = () => {
    const [nodes, setNodes] = useState(initialNodes)

    return (
        <div className="bg__primary h-200 p-16">
            <GraphVisualizer nodes={nodes} edges={edges} setEdges={noop} setNodes={setNodes} />
        </div>
    )
}

// Storybook Meta Configuration
const meta = {
    component: GraphVisualizerComponent,
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// Stories
export const Basic: Story = {
    args: {},
}
