import React from 'react'
import { workflowsTrigger } from './workflow.mock'
import TriggerView from '../TriggerView'
import { createMemoryHistory, createLocation } from 'history'
import { match } from 'react-router'
const history = createMemoryHistory()
const path = `app/details/48/env/2/trigger`
const TriggerViewMatch: match<{ appId: string; envId: string }> = {
    isExact: false,
    path,
    url: path.replace(':id', '1'),
    params: { appId: '48', envId: '2' },
}
const location = createLocation(TriggerViewMatch.url)

it('fetch CI Material', () => {
    // const component = mount(<TriggerView history={history} location={location} match={TriggerViewMatch} />);
    // const instance = component.instance();
    // component.setState({ workflows: workflowsTrigger });
    // expect(instance.state.showCIModal).toBe(false);
    // expect(instance.state.showCDModal).toBe(false);
    // component.find('.workflow-node__deploy-btn--ci').at(0).simulate('click', { ciNodeId: "11", ciPipelineName: "pipeline-name" });
})
