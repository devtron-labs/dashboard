//@ts-nocheck

import React from 'react';

import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';

import { aggregateNodes } from '../details/appDetails/utils';

import { nodes, podMetadata } from '../details/appDetails/__test__/appDetails.mock';
import { Nodes, AggregationKeys, NodeDetailTabs, AppDetails } from '../types';

import {NodeManifestView, LogsView, EventsView, parsePipes, getGrepTokens} from '../EventsLogs';
import { render, fireEvent, screen, waitForElement } from '@testing-library/react';
import  { Subject } from '../../../util/Subject'
function renderWithRouter(ui, { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {}) {
    return {
        ...render(<Router history={history}>{ui}</Router>),
        history,
    };
}



describe('manifest, logs and events render without breaking', ()=>{
    let div, aggregatedNodes;

    beforeAll(() => {
        div = document.createElement('div');
        aggregatedNodes = aggregateNodes(nodes, podMetadata);
        global.fetch = jest.fn();

    });

    beforeEach(()=>{
        const mockSuccessResponse = {};
        const mockJsonPromise = Promise.resolve(mockSuccessResponse);
        const mockFetchPromise = Promise.resolve({
            json: () => mockJsonPromise,
        });
        jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);
    })

    afterEach(()=>{
        jest.resetAllMocks()
    })

    it('manifest renders without breaking', async ()=>{

        const { history, getByText, getByTestId } = renderWithRouter(
                <Route path="app/:appId/details/:envId/:kind/:tab">
                    <NodeManifestView
                        nodeName={'colorful-pod-logs-amit-dev-ingress'}
                        nodes={aggregatedNodes}
                        appName={'test-app'}
                        environmentName={'test-env'}
                    />
                </Route>,
            { route: `app/3/details/4/${Nodes.Pod}/${NodeDetailTabs.MANIFEST}?kind=${Nodes.Ingress}` },
        );
        await waitForElement(() => getByTestId('manifest-container'));
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            'undefined/api/v1/applications/test-app-test-env/resource?version=v1beta1&namespace=amit-dev&group=extensions&kind=Ingress&resourceName=colorful-pod-logs-amit-dev-ingress',
            expect.toBeObject()
        );
    });

    it('events renders without breaking', async ()=>{
        const { history, getByText, getByTestId } = renderWithRouter(
            <Route path="app/:appId/details/:envId/:kind/:tab">
                <EventsView
                    nodeName={'colorful-pod-logs-amit-dev-ingress'}
                    nodes={aggregatedNodes}
                    appDetails={{
                        appName:'blobs',
                        environmentName: 'dev',
                        namespace:'dev'
                    } as AppDetails}
                />
            </Route>,
            { route: `app/3/details/4/${Nodes.Pod}/${NodeDetailTabs.EVENTS}?kind=${Nodes.Ingress}` },
        );
        await waitForElement(() => getByTestId('events-container'));
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            'undefined/api/v1/applications/blobs-dev/events?resourceNamespace=dev&resourceUID=87bcb4e8-a188-11ea-9e9f-02d9ecfd9bc6&resourceName=colorful-pod-logs-amit-dev-ingress',
            expect.toBeObject(),
        );
    })

    it('parse pipes working', ()=>{
        expect(parsePipes('grep "a" | grep "b"|grep x')).toEqual(['"a"', '"b"', 'x']);
        expect(parsePipes('grep -A 1 -B 2 hello | grep world | grep -C ok')).toEqual([
            '-A 1 -B 2 hello',
            'world',
            '-C ok',
        ]);
    })

    it('getGrepTokens working', ()=>{
        expect(getGrepTokens('-A 1 -B 2 hello')).toEqual({ _args: 'hello', a: 1, b: 2, v: false });
        expect(getGrepTokens('world')).toEqual({ _args: 'world',a: 0, b: 0, v: false });
        expect(getGrepTokens('-C 5 ok')).toEqual({ _args: 'ok', v: false, a: 5, b: 5 });
        expect(getGrepTokens('-c 5 ok')).toEqual({ _args: 'ok', v: false, a: 5, b: 5 });
        expect(getGrepTokens('-c5 ok')).toEqual({ _args: 'ok', v: false, a: 5, b: 5 });
    })
})
