import React from "react";
import { render, act, screen } from "@testing-library/react";
import TriggerViewConfigDiff from "../triggerViewConfigDiff/TriggerViewConfigDiff";
import { BrowserRouter } from "react-router-dom";

// describe('Select Material and Rollback Modal',()=>{
//     beforeEach(()=>{
//         render(<TriggerViewConfigDiff/>, {
//             wrapper: BrowserRouter
//         })
//     })
    
//     it('Select Image/Rollback Modal appeared properly without breaking',async () => {
//         expect(screen.getByText('Finish configuring this application')).toBeInTheDocument
//     })
// })