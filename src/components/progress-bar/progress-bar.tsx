import '@ionic/core';
import {Component, Prop, Element, State, Watch } from '@stencil/core';
import ResizeObserver from 'resize-observer-polyfill';

const CHAR_WIDTH = 10.8;

@Component({
    tag: 'sq-progress-bar',
    styleUrl: 'progress-bar.scss',
})
export class ProgressBar {
    @Prop() totalValue: number;
    @Prop() currentValue: number;
    @Prop() tapOverlayText: string;
    @Element() progressElem: HTMLElement;

    @State() elemWidth: number = 0;
    @State() totalCharsArray: number[];
    @State() currentChars: number;
    @State() isTapOverlayActive: boolean = false;

    private resizeObserver: ResizeObserver;

    // @Listen('window:resize')
    // handleResize() {
    //     this.updateSizing();
    // }
    // @Listen('window:orientationChange')
    // handleOrientationChange() {
    //     this.updateSizing();
    // }

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

        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const {width} = entry.contentRect;

                console.log(`entry with: ${width}; this.elemWidth: ${this.elemWidth}`);
                this.updateSizing();
            }
        });

        this.resizeObserver.observe(this.progressElem);
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
            <div class="progressBar_wrapper" onClick={() => this.isTapOverlayActive = !this.isTapOverlayActive} overlay-active={!!this.tapOverlayText && this.isTapOverlayActive}>
                <div class="progressBar_inner">
                    &lt;

                        {
                            this.totalCharsArray && this.totalCharsArray.map((_val, index) => 
                                index < this.currentChars || (index === 0 && this.currentValue > 0)
                                    ? <span>&#9619;</span>
                                    : <span>&#9617;</span>
                            )
                        }
                    &gt;
                </div>
                <div class="tapOverlay">{this.tapOverlayText}</div>
            </div>
        )
    }
}
