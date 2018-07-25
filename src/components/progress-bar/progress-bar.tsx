import '@ionic/core';

import {Component, Prop, Element, State, Listen, Watch } from '@stencil/core';

const CHAR_WIDTH = 10.8;

@Component({
    tag: 'sq-progress-bar',
    styleUrl: 'progress-bar.scss',
})
export class ProgressBar {
    @Prop() totalValue: number;
    @Prop() currentValue: number;
    @Element() progressElem: HTMLElement;

    @State() elemWidth: number = 0;
    @State() totalCharsArray: number[];
    @State() currentChars: number;

    @Listen('window:resize')
    handleResize() {
        this.updateSizing();
    }
    @Listen('window:orientationChange')
    handleOrientationChange() {
        this.updateSizing();
    }

    @Watch('totalValue')
    totalValueHandler() {
        this.calculateChars();
    }
    @Watch('currentValue')
    currentValueHander() {
        this.calculateChars();
    }

    componentDidLoad() {
        setTimeout(this.updateSizing.bind(this), 30);
    }

    updateSizing() {
        this.elemWidth = this.progressElem.querySelector('.progressBar_inner').clientWidth;
        this.calculateChars();
    }
    
    calculateChars() {
        const numTotalChars = Math.max(Math.floor(this.elemWidth / CHAR_WIDTH) - 2, 4)
        this.totalCharsArray = new Array(numTotalChars);
        this.totalCharsArray.fill(0);
        this.currentChars = Math.floor(this.currentValue / this.totalValue * this.totalCharsArray.length + .01);        //avoid floating-point error when at 100%
    }
    
    render() {
        return (
            <div class="progressBar_wrapper">
                <div class="progressBar_inner">
                    &lt;
                        {
                            this.totalCharsArray && this.totalCharsArray.map((_val, index) => 
                                index < this.currentChars 
                                    ? <span>&#9619;</span>
                                    : <span>&#9617;</span>
                            )
                        }
                    &gt;
                </div>
            </div>
        )
    }
}
