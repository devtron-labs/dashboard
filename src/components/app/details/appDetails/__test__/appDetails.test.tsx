import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import AppDetail from '../AppDetails';
import '@testing-library/jest-dom';

describe('AppDetails testsuite', () => {
    let div;
    beforeAll(() => {
        div = document.createElement('div');
    })

    it('AppDetails renders without crashing', () => {
        render(<AppDetail />)
    })
})