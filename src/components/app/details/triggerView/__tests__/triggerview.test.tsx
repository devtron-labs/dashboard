import React from 'react'
import TriggerView from '../TriggerView'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { cdTriggerResponse } from '../__mocks__/trigger.view.mock'
import { DeploymentNodeType } from '../types'
import { CDMaterial } from '../cdMaterial'
import { unmountComponentAtNode } from 'react-dom'
describe('Trigger View', () => {
    it('Render Trigger View without crashing', () => {
        const { container } = render(<TriggerView />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()
    })
})

describe('cd trigger view service tests', () => {
    let container = null
    beforeEach(() => {
        // setup a DOM element as a render target
        container = document.createElement('div')
        document.body.appendChild(container)
    })

    afterEach(() => {
        // cleanup on exiting
        unmountComponentAtNode(container)
        container.remove()
        container = null
    })

    it('nested cd material without crashing', () => {
        const mockCallback = jest.fn()
        const { getByText, container} = render(
            <CDMaterial
                appId={302}
                pipelineId={297}
                stageType={DeploymentNodeType.CD}
                material={cdTriggerResponse}
                materialType={'inputMaterialList'}
                envName={'devtron-demo'}
                isLoading={false}
                triggerDeploy={undefined}
                onClickRollbackMaterial={undefined}
                closeCDModal={() => false}
                selectImage={undefined}
                toggleSourceInfo={undefined}
                parentPipelineId="297"
                parentPipelineType={'CI_PIPELINE"'}
                parentEnvironmentName={undefined}
            />,
            { wrapper: BrowserRouter, },
        )
        expect(container).toBeInTheDocument()
    })

    it('clicking on workflows uncollpases', async () => {
        const { container, getByTestId } = render(
            <CDMaterial
                appId={45}
                pipelineId={16}
                stageType={DeploymentNodeType.CD}
                material={[]}
                materialType='inputMaterialList'
                envName='devtron-demo'
                isLoading={false}
                triggerDeploy={jest.fn()}
                onClickRollbackMaterial={jest.fn()}
                closeCDModal={jest.fn()}
                selectImage={jest.fn()}
                toggleSourceInfo={jest.fn()}
                parentPipelineId="2"
                parentPipelineType='CI_PIPELINE'
                parentEnvironmentName={undefined}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        // expect(container.querySelector('.modal-body--cd-material')).toBeTruthy()
        // fireEvent.click(getByTestId('collapse-show-info'))

        //Click on Show Source Info
        // expect(screen.getByText('Show Source Info')).toBeInTheDocument()

        // expect(container.querySelector('.material-history')).toBeInTheDocument()
        // expect(container.querySelector('.material-history__top')).toBeInTheDocument()
        // expect(container.querySelector('.material-history__info')).toBeInTheDocument()
        // const element = fireEvent.click(getByTestId('collapse-show-info'))
    })
})
