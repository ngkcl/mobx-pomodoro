import React, { Component } from 'react';

import {observer} from 'mobx-react';

import './TimerDisplay.css';

export const TimerDisplay = observer(({leftText, rightText}) => {
    return (
        <div className = 'main' >
            <div className = 'left' >
                {leftText}
            </div>
            <div className = 'right' >
                {rightText}
            </div>
        </div>
    )
})