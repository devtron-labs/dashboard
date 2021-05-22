import React from 'react';
import GitOpsConfiguration from './GitOpsConfiguration';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter, Route, Router } from 'react-router-dom';

describe('Gitopsconfiguration', () => {
    let div;

    beforeAll(() => {
        div = document.createElement('div');
    })

    it('GitOpsConfiguration renders without crashing', () => {
        render(
            <BrowserRouter>
                <GitOpsConfiguration />
            </BrowserRouter>)
    })
}) 
