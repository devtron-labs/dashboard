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

    // it('nested cd material without crashing', () => {
    //     render(
    //         <CDMaterial
    //         appId={302}
    //         pipelineId={297}
    //         stageType={DeploymentNodeType.CD}
    //         material={cdTriggerResponse}
    //         materialType={'inputMaterialList'}
    //         envName={'devtron-demo'}
    //         isLoading={false}
    //         triggerDeploy={undefined}
    //         onClickRollbackMaterial={undefined}
    //         closeCDModal={() => false}
    //         selectImage={undefined}
    //         toggleSourceInfo={undefined}
    //         parentPipelineId= '297'
    //         parentPipelineType={'CI_PIPELINE"'}
    //         parentEnvironmentName={undefined}
    //         />, container
    //     )
    // })

    it('clicking on workflows uncollpases', async () => {
        // const { getByTestId } = render(
        //     <CDMaterial
        //         appId={302}
        //         pipelineId={297}
        //         stageType={DeploymentNodeType.CD}
        //         material={cdTriggerResponse}
        //         materialType={'inputMaterialList'}
        //         envName={'devtron-demo'}
        //         isLoading={false}
        //         triggerDeploy={undefined}
        //         onClickRollbackMaterial={undefined}
        //         closeCDModal={() => false}
        //         selectImage={undefined}
        //         toggleSourceInfo={undefined}
        //         parentPipelineId="297"
        //         parentPipelineType={'CI_PIPELINE"'}
        //         parentEnvironmentName={undefined}
        //     />,
        //     {
        //         wrapper: BrowserRouter,
        //     },
        // )

    //     const element = fireEvent.click(getByTestId('collapse-show-info'))
    //     console.log(element)
    //     expect(screen.getByTestId('')).toBeInTheDocument()
    })
})
