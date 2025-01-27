import { Dialog, Menu, showMessage } from "siyuan";
import { getFile, putFile } from "../../api";

interface TomatoClockConfig {
    showSeconds: boolean;
    notification: boolean;
    cardColor: string;
    numberColor: string;
    showShadow: boolean;
    scrollingText: {
        content: string;
        fontSize: number;
        color: string;
        isBold: boolean;
    };
}

export class TomatoClock {
    private container: HTMLElement;
    private timeDiv: HTMLElement;
    private progressBar: HTMLElement;
    private progressContainer: HTMLElement;
    private buttonContainer: HTMLElement;
    private scrollingText: HTMLElement;
    private scrollingTextContainer: HTMLElement;
    private settingsButton: HTMLButtonElement;
    private countdownButton: HTMLButtonElement;
    private startButton: HTMLButtonElement;
    private pauseButton: HTMLButtonElement;
    private stopButton: HTMLButtonElement;
    private hourGroup: HTMLElement;
    private minuteGroup: HTMLElement;
    private secondGroup: HTMLElement;
    private hourElms: any[] = [];
    private minSecElms: any[] = [];
    private showSecondsCheckbox: HTMLInputElement;
    private notificationCheckbox: HTMLInputElement;
    private selectedFocusTime: number = 25;
    private selectedBreakTime: number = 5;
    private countdownTime: number = 0;
    private totalTime: number = 0;
    private isCountingDown: boolean = false;
    private isPaused: boolean = false;
    private isBreakTime: boolean = false;
    private isSimpleCountdown: boolean = false;
    private hasHours: boolean = true;
    private lastSec: number = new Date().getSeconds();
    private configPath: string = "/data/storage/tomato-clock.json";

    constructor(container: HTMLElement) {
        this.container = container;
        
        // 初始化复选框
        this.showSecondsCheckbox = document.createElement('input');
        this.showSecondsCheckbox.type = 'checkbox';
        this.showSecondsCheckbox.checked = false; // 默认不显示秒

        this.notificationCheckbox = document.createElement('input');
        this.notificationCheckbox.type = 'checkbox';
        this.notificationCheckbox.checked = true; // 默认开启通知
        
        this.loadConfig().then(() => {
            this.initElements();
            this.initStyles();
            this.initEvents();
            this.run();
        });
    }

    private async loadConfig() {
        try {
            const config = await getFile(this.configPath);
            if (config) {
                this.showSecondsCheckbox.checked = config.showSeconds ?? false;
                this.notificationCheckbox.checked = config.notification ?? true;
                this.applyCustomStyle(config.cardColor, config.numberColor, config.showShadow);
                if (config.scrollingText) {
                    this.scrollingText.textContent = config.scrollingText.content || '';
                    this.scrollingText.style.fontSize = `${config.scrollingText.fontSize || 12}px`;
                    this.scrollingText.style.color = config.scrollingText.color || 'var(--b3-theme-primary)';
                    this.scrollingText.style.fontWeight = config.scrollingText.isBold ? 'bold' : 'normal';
                    this.scrollingTextContainer.style.display = config.scrollingText.content ? 'flex' : 'none';
                }
            }
            console.log("加载番茄钟配置成功");
        } catch (e) {
            console.log("加载番茄钟配置失败，使用默认配置");
        }
    }

    private async saveConfig() {
        const config: TomatoClockConfig = {
            showSeconds: this.showSecondsCheckbox.checked,
            notification: this.notificationCheckbox.checked,
            cardColor: this.getCardColor(),
            numberColor: this.getNumberColor(),
            showShadow: this.hasClockShadow(),
            scrollingText: {
                content: this.scrollingText.textContent || '',
                fontSize: parseInt(this.scrollingText.style.fontSize) || 12,
                color: this.scrollingText.style.color || 'var(--b3-theme-primary)',
                isBold: this.scrollingText.style.fontWeight === 'bold'
            }
        };
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(config)], { type: "application/json" }));
            console.log("保存番茄钟配置成功");
        } catch (e) {
            console.error("保存番茄钟配置失败", e);
        }
    }

    private initElements() {
        // 创建基本元素
        this.createTimeElements();
        this.createControlElements();
        this.createProgressElements();
        this.createScrollingTextElements();
        this.createSettingsButton();
        
        // 初始化显示
        this.updateDisplay();
       
        // 添加到容器
        this.container.appendChild(this.timeDiv);
        this.container.appendChild(this.progressContainer);
        this.container.appendChild(this.buttonContainer);
        this.container.appendChild(this.scrollingTextContainer);

        // 添加点击事件监听
        this.container.addEventListener('click', (e) => {
            // 如果点击的是按钮，不触发设置对话框
            if ((e.target as HTMLElement).closest('.tomato-buttons') || 
                (e.target as HTMLElement).closest('button')) {
                return;
            }
            // 如果在番茄钟状态，不触发设置对话框
            if (this.isCountingDown) {
                return;
            }
            this.showSettingsMenu();
        });

        // 添加鼠标悬停效果
        this.container.addEventListener('mouseenter', () => {
            if (this.isCountingDown) {
                this.buttonContainer.style.opacity = '1';
                this.buttonContainer.style.pointerEvents = 'auto';
            } else {
                this.settingsButton.style.opacity = '1';
                this.countdownButton.style.opacity = '1';
            }
        });
        this.container.addEventListener('mouseleave', () => {
            this.settingsButton.style.opacity = '0';
            this.countdownButton.style.opacity = '0';
            this.buttonContainer.style.opacity = '0';
            this.buttonContainer.style.pointerEvents = 'none';
        });
    }

    private createTimeElements() {
        this.timeDiv = document.createElement('div');
        this.timeDiv.className = 'time';
        this.timeDiv.id = 'time';
        this.timeDiv.style.cssText = 'margin: 10px 0; position: relative; z-index: 2;';

        this.hourGroup = document.createElement('div');
        this.hourGroup.className = 'time-group';
        this.minuteGroup = document.createElement('div');
        this.minuteGroup.className = 'time-group';
        this.secondGroup = document.createElement('div');
        this.secondGroup.className = 'time-group';

        this.timeDiv.append(this.hourGroup, this.minuteGroup, this.secondGroup);
        this.hourGroup.style.display = 'flex';
        this.secondGroup.style.display = 'none';

        // 创建时分秒的数字
        for (let i = 0; i < 2; i++) {
            this.hourElms.push(this.createCol(this.hourGroup));
        }
        for (let i = 0; i < 2; i++) {
            this.minSecElms.push(this.createCol(this.minuteGroup));
        }
        for (let i = 0; i < 2; i++) {
            this.minSecElms.push(this.createCol(this.secondGroup));
        }
    }

    private createControlElements() {
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            z-index: 3;
        `;

        // 创建暂停按钮
        this.pauseButton = this.createButton('iconPause');
        this.styleControlButton(this.pauseButton);
        
        // 创建停止按钮
        this.stopButton = this.createButton('iconStop');
        this.styleControlButton(this.stopButton);

        this.buttonContainer.append(this.pauseButton, this.stopButton);
    }

    private styleControlButton(button: HTMLButtonElement) {
        button.style.cssText = `
            background: var(--b3-theme-background);
            border: 1px solid var(--b3-theme-surface-lighter);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;

        const icon = button.querySelector('.icon') as SVGElement;
        
        // 添加悬停效果
        button.addEventListener('mouseenter', () => {
            button.style.background = 'var(--b3-theme-primary)';
            button.style.transform = 'scale(1.1)';
            icon.style.fill = '#fff';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'var(--b3-theme-background)';
            button.style.transform = 'scale(1)';
            icon.style.fill = 'var(--b3-theme-primary)';
        });
    }

    private createProgressElements() {
        this.progressContainer = document.createElement('div');
        this.progressContainer.style.cssText = `
            width: 80%;
            height: 6px;
            background: var(--b3-theme-surface-lighter);
            overflow: hidden;
            opacity: 0;
            transition: opacity 0.3s;
            border-radius: 3px;
            margin: 10px auto;
        `;
        
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = 'height: 100%; width: 0%; background: var(--b3-theme-primary); transition: width 0.5s linear; border-radius: 3px;';
        this.progressContainer.appendChild(this.progressBar);
    }

    private createScrollingTextElements() {
        this.scrollingTextContainer = document.createElement('div');
        this.scrollingTextContainer.style.cssText = `
            width: 80%;
            overflow: hidden;
            height: 20px;
            display: none;
            align-items: center;
            justify-content: center;
            margin: 5px auto;
        `;

        this.scrollingText = document.createElement('div');
        this.scrollingText.textContent = '';
        this.scrollingText.style.cssText = `
            color: var(--b3-theme-primary);
            font-size: 12px;
            font-weight: normal;
            white-space: nowrap;
            animation: scrollText 10s linear infinite;
            opacity: 0.8;
        `;

        this.scrollingTextContainer.appendChild(this.scrollingText);
    }

    private createSettingsButton() {
        this.settingsButton = this.createButton('iconTime');
        this.settingsButton.style.cssText = `
            position: absolute;
            top: 65%;
            left: 40%;
            transform: translate(-50%, -50%);
            background: var(--b3-theme-background);
            border: 1px solid var(--b3-theme-surface-lighter);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            transition: all 0.3s;
            z-index: 4;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;

        this.settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showSettingsDialog();
        });

        // 添加悬停效果
        this.settingsButton.addEventListener('mouseenter', () => {
            this.settingsButton.style.background = 'var(--b3-theme-primary)';
            this.settingsButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
            (this.settingsButton.querySelector('.icon') as HTMLElement).style.fill = '#fff';
        });
        this.settingsButton.addEventListener('mouseleave', () => {
            this.settingsButton.style.background = 'var(--b3-theme-background)';
            this.settingsButton.style.transform = 'translate(-50%, -50%)';
            (this.settingsButton.querySelector('.icon') as HTMLElement).style.fill = 'var(--b3-theme-primary)';
        });

        this.container.appendChild(this.settingsButton);

        // 创建倒计时按钮
        this.countdownButton = this.createButton('countdown');
        this.countdownButton.style.cssText = `
            position: absolute;
            top: 65%;
            left: 60%;
            transform: translate(-50%, -50%);
            background: var(--b3-theme-background);
            border: 1px solid var(--b3-theme-surface-lighter);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            transition: all 0.3s;
            z-index: 4;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;

        this.countdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCountdownDialog();
        });

        // 添加悬停效果
        this.countdownButton.addEventListener('mouseenter', () => {
            this.countdownButton.style.background = 'var(--b3-theme-primary)';
            this.countdownButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
            (this.countdownButton.querySelector('.icon') as HTMLElement).style.fill = '#fff';
        });
        this.countdownButton.addEventListener('mouseleave', () => {
            this.countdownButton.style.background = 'var(--b3-theme-background)';
            this.countdownButton.style.transform = 'translate(-50%, -50%)';
            (this.countdownButton.querySelector('.icon') as HTMLElement).style.fill = 'var(--b3-theme-primary)';
        });

        this.container.appendChild(this.countdownButton);
    }

    private createButton(iconName: string): HTMLButtonElement {
        const button = document.createElement('button') as HTMLButtonElement;
        if (iconName === 'countdown') {
            button.innerHTML = `<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M341.333333 85.333333a42.666667 42.666667 0 0 0 0 85.333334h128v42.666666c0 0.853333 0 1.664 0.085334 2.474667a362.709333 362.709333 0 0 0-299.434667 481.066667 40.32 40.32 0 0 0 75.946667-26.88 282.069333 282.069333 0 1 1 77.994666 116.224 40.277333 40.277333 0 0 0-53.717333 60.074666 362.666667 362.666667 0 1 0 284.373333-630.485333L554.666667 213.333333V170.666667h128a42.666667 42.666667 0 1 0 0-85.333334H341.333333z m218.496 598.826667l-90.282666-90.282667L469.333333 448.042667A42.666667 42.666667 0 1 1 554.666667 447.914667v110.378666l65.536 65.493334a42.666667 42.666667 0 0 1-60.373334 60.330666z"></path></svg>`;
        } else if (iconName === 'iconTime') {
            button.innerHTML = `<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M767.138909 262.074182c262.469818 234.007273 82.199273 470.178909 53.038546 506.763636-42.821818 51.618909-355.607273 270.429091-608.41891 23.598546-120.040727-115.432727-141.358545-393.239273 21.038546-504.529455 0 54.388364 83.688727 123.205818 153.227636 77.381818 92.695273 159.813818 209.850182 77.591273 232.866909 6.446546 58.321455 26.530909 148.247273-7.261091 148.247273-109.661091z m89.739636 309.806545l11.822546-4.957091c-152.529455 64.651636-289.675636 96.116364-411.461818 94.487273l28.439272 53.457455c2.513455 4.770909 1.861818 11.613091-1.559272 15.197091a6.237091 6.237091 0 0 1-4.608 2.187636h-77.265455c-4.305455 0-7.749818-4.840727-7.749818-10.891636 0-2.792727 0.744727-5.352727 1.978182-7.261091l28.625454-53.922909c-95.906909-6.050909-181.853091-33.652364-257.815272-82.757819 8.913455 64.279273 37.585455 124.928 80.896 166.539637 222.138182 216.715636 497.012364 24.576 534.621091-20.759273 13.242182-16.570182 61.905455-72.145455 74.07709-151.319273z m-68.282181-216.040727c-5.818182 44.334545-87.389091 91.927273-146.781091 76.218182-60.695273 90.181818-188.485818 127.581091-269.963637-12.730182-69.515636 27.159273-139.054545-21.597091-148.084363-56.180364-36.770909 43.985455-55.389091 97.931636-58.833455 152.669091l-13.265454-7.912727a677.701818 677.701818 0 0 0 80.570181 43.985455v-32.628364a23.179636 23.179636 0 1 1 46.359273 0v48.104727c0 1.186909-0.093091 2.373818-0.256 3.490909 15.36 5.655273 30.929455 10.635636 46.615273 14.964364v-42.961455a23.179636 23.179636 0 0 1 46.359273 0v48.128c0 1.908364-0.232727 3.746909-0.674909 5.515637 15.522909 3.025455 31.185455 5.399273 47.010909 7.144727v-37.166545a23.179636 23.179636 0 1 1 46.359272 0v40.517818c123.741091 4.212364 255.092364-28.555636 394.053819-98.327273-4.957091-42.798545-22.248727-90.065455-59.601455-140.148364a390.958545 390.958545 0 0 0-9.867636-12.683636zM507.810909 152.832c62.789818-23.086545 106.728727-34.629818 131.816727-34.629818 37.608727 0 52.130909 34.629818 27.322182 100.002909 54.714182 25.6 72.727273 44.404364 71.819637 72.936727-0.442182 14.242909-5.934545 33.954909-35.304728 42.449455-57.902545 7.68-92.253091 10.589091-103.098182 8.750545-34.955636 37.562182-60.974545 56.343273-78.056727 56.343273-7.982545 0-18.571636 10.24-36.514909-3.607273-11.962182-9.216-34.676364-26.810182-68.119273-52.736-84.456727 4.258909-130.792727-8.052364-139.077818-36.933818-3.141818-11.008-3.351273-32.651636 4.305455-43.333818 7.447273-10.356364 29.207273-24.994909 65.233454-43.869091-21.015273-53.504-14.056727-86.830545 20.852364-100.002909 14.754909-6.679273 61.021091 4.887273 138.821818 34.629818z m119.714909 15.685818c-73.728 24.296727-113.640727 36.445091-119.714909 36.445091-6.050909 0-44.381091-10.496-114.967273-31.488 7.749818 35.863273 10.24 57.437091 7.540364 64.674909-2.722909 7.214545-22.621091 22.690909-59.671273 46.382546 60.578909 5.538909 93.416727 9.658182 98.513455 12.334545 5.12 2.653091 27.973818 19.130182 68.584727 49.431273 43.170909-32.209455 69.259636-50.036364 78.242909-53.457455 8.983273-3.421091 38.749091-6.190545 89.250909-8.308363-36.165818-24.971636-55.854545-40.448-59.112727-46.382546-3.258182-5.957818 0.512-29.160727 11.333818-69.632z"></path></svg>`;
        } else {
            button.innerHTML = `<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#${iconName}"></use></svg>`;
        }
        button.style.cssText = `
            background: transparent;
            border: none;
            border-radius: 4px;
            padding: 4px;
            cursor: pointer;
            transition: all 0.3s;
        `;
        
        return button;
    }

    private initStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --font-size: min(8vw, 2.5rem);
                --center-border: 1px solid var(--b3-theme-surface);
                --col-width: min(8vw, 2.5rem);
                --col-height: calc(var(--col-width) * 1.4);
            }

            .time {
                position: relative;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: 0.5rem 0.3rem;
                font-family: sans-serif;
                font-weight: 700;
                overflow: visible;
                color: var(--b3-theme-on-background);
                padding: 8px 0;
            }

            .time-group {
                display: flex;
                gap: 0.3rem;
                margin: 0 0.2rem;
                position: relative;
                z-index: 2;
            }

            .col {
                width: var(--col-width);
                height: var(--col-height);
                perspective: var(--col-height);
                background: var(--b3-theme-background);
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                z-index: 2;
            }

            .curr,
            .next {
                position: relative;
                width: var(--col-width);
                height: calc(var(--col-height) / 2);
                font-size: var(--font-size);
                background: var(--b3-theme-background);
                color: var(--b3-theme-on-background);
                overflow: hidden;
                box-sizing: border-box;
            }

            .flip .curr::before,
            .flip .next::before,
            .col > .curr::before,
            .col > .next::before {
                position: absolute;
                content: attr(data-t);
                line-height: var(--col-height);
                text-align: center;
                height: var(--col-height);
                left: 0;
                right: 0;
                background: var(--b3-theme-background);
            }

            .flip .curr::before,
            .col > .next::before {
                top: 0;
            }

            .flip .next::before,
            .col > .curr::before {
                bottom: 0;
            }

            .flip .curr,
            .col > .next {
                border-bottom: var(--center-border);
            }

            .flip .next,
            .col > .curr {
                border-top: var(--center-border);
            }

            .flip .next {
                transform: rotateX(-180deg);
                backface-visibility: hidden;
            }

            .flip .curr {
                position: absolute; 
                top: 0;
                backface-visibility: hidden;
            }

            .flip {
                position: absolute;
                width: var(--col-width);
                height: var(--col-height);
                z-index: 1;
                transform-style: preserve-3d;
                transition: transform 0s;
                transform: rotateX(0);
            }

            .flip.active {
                transition: all 0.5s ease-in-out;
                transform: rotateX(-180deg);
            }

            @keyframes scrollText {
                0% {
                    transform: translateX(100%);
                }
                100% {
                    transform: translateX(-100%);
                }
            }
        `;
        this.container.appendChild(style);
    }

    private initEvents() {
        // 按钮事件
        this.pauseButton.addEventListener('click', () => this.handlePause());
        this.stopButton.addEventListener('click', () => this.handleStop());
    }

    private createCol(parent: HTMLElement) {
        const createEl = (cls: string) => {
            const div = document.createElement("div");
            div.classList.add(cls);
            return div;
        };
        const [col, flip, flipNext, flipCurr, next, curr] = ["col", "flip", "next", "curr", "next", "curr"].map(
            (cls) => createEl(cls)
        );
        flip.append(flipNext, flipCurr);
        col.append(flip, next, curr);
        parent.append(col);
        return {
            toggleActive: () => flip.classList.toggle("active"),
            getCurr: () => curr.dataset.t,
            setCurr: (t: string) => [flipCurr, curr].forEach((el) => (el.dataset.t = t)),
            setNext: (t: string) => [flipNext, next].forEach((el) => (el.dataset.t = t)),
        };
    }

    private getTimeStr(date = new Date()): string {
        if (!this.isCountingDown) {
            return [date.getHours(), date.getMinutes(), date.getSeconds()]
                .map((item) => item.toString().padStart(2, "0"))
                .join("");
        } else {
            const hours = Math.floor(this.countdownTime / 3600);
            const minutes = Math.floor((this.countdownTime % 3600) / 60);
            const seconds = this.countdownTime % 60;
            if (!this.hasHours) {
                return [minutes, seconds]
                    .map((item) => item.toString().padStart(2, "0"))
                    .join("");
            }
            return [hours, minutes, seconds]
                .map((item) => item.toString().padStart(2, "0"))
                .join("");
        }
    }

    private updateDisplay() {
        const timeStr = this.getTimeStr();
        if (this.hasHours) {
            [...this.hourElms, ...this.minSecElms].forEach(({ setCurr }, i) => {
                setCurr(timeStr[i]);
            });
        } else {
            this.minSecElms.forEach(({ setCurr }, i) => {
                setCurr(timeStr[i]);
            });
        }
    }

    private updateTime() {
        if (!this.isCountingDown || this.isPaused) {
            let s = new Date().getSeconds();
            if (s === this.lastSec) {
                return;
            }
            this.lastSec = s;
        } else {
            if (this.countdownTime > 0) {
                this.countdownTime--;
                this.updateProgress();
                if (this.countdownTime === 0) {
                    if (this.isCountingDown && this.notificationCheckbox?.checked) {
                        if (this.isSimpleCountdown) {
                            new Dialog({
                                title: "倒计时提醒",
                                content: `<div class="b3-dialog__content">
                                    <div class="fn__flex-column" style="align-items: center; padding: 20px;">
                                        <div style="font-size: 16px; margin-bottom: 12px;">倒计时结束！</div>
                                    </div>
                                </div>`,
                                width: "300px",
                            });
                            this.handleStop();
                            return;
                        } else {
                            new Dialog({
                                title: "番茄钟提醒",
                                content: `<div class="b3-dialog__content">
                                    <div class="fn__flex-column" style="align-items: center; padding: 20px;">
                                        <div style="font-size: 16px; margin-bottom: 12px;">${this.isBreakTime ? "休息时间结束！" : "专注时间结束！"}</div>
                                    </div>
                                </div>`,
                                width: "300px",
                            });
                        }
                    }
                    if (!this.isSimpleCountdown && this.isCountingDown) {
                        this.isBreakTime = !this.isBreakTime;
                        const nextMinutes = this.isBreakTime ? this.selectedBreakTime : this.selectedFocusTime;
                        this.countdownTime = nextMinutes * 60;
                        this.totalTime = this.countdownTime;
                        this.progressBar.style.width = '0%';
                        this.updateTitle();
                    }
                }
            }
        }
        
        const currStr = this.getTimeStr();
        const activeElms = this.hasHours ? [...this.hourElms, ...this.minSecElms] : this.minSecElms;
        activeElms.forEach(({ toggleActive, getCurr, setCurr, setNext }, i) => {
            var currTxt = getCurr();
            setNext(currStr[i]);
            if (currTxt !== currStr[i]) {
                toggleActive();
                setTimeout(() => {
                    toggleActive();
                    setCurr(currStr[i]);
                }, 500);
            }
        });
    }

    private updateProgress() {
        if (this.totalTime > 0) {
            const progress = ((this.totalTime - this.countdownTime) / this.totalTime) * 100;
            this.progressBar.style.width = `${progress}%`;
        }
    }

    private updateTitle() {
        const title = this.isBreakTime ? '休息时间' : '专注时间';
        const titleElement = this.container.closest('.dock')?.querySelector('.dock__title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    private handlePause() {
        if (!this.isCountingDown) return;
        
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pauseButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPlay"></use></svg>';
        } else {
            this.pauseButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPause"></use></svg>';
        }
    }

    private handleStop() {
        this.isCountingDown = false;
        this.isPaused = false;
        this.countdownTime = 0;
        this.isSimpleCountdown = false;
        this.isBreakTime = false;
        this.totalTime = 0;
        
        this.settingsButton.style.display = 'block';
        this.countdownButton.style.display = 'block';
        this.settingsButton.style.opacity = '0';
        this.countdownButton.style.opacity = '0';
        this.hasHours = true;
        this.hourGroup.style.display = 'flex';
        this.secondGroup.style.display = this.showSecondsCheckbox?.checked ? 'flex' : 'none';
        this.progressBar.style.width = '0%';
        this.progressContainer.style.opacity = '0';
        this.buttonContainer.style.opacity = '0';
        this.buttonContainer.style.pointerEvents = 'none';
        this.pauseButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPause"></use></svg>';
        
        const titleElement = this.container.closest('.dock')?.querySelector('.dock__title');
        if (titleElement) {
            titleElement.textContent = '番茄钟';
        }
    }

    private showSettingsDialog() {
        const dialog = new Dialog({
            title: '番茄钟设置',
            content: `<div id="tomato-timer-settings" style="display: flex; flex-direction: column; gap: 1rem; padding: 10px;"></div>`,
            width: '360px',
            height: '400px',
        });

        const container = dialog.element.querySelector('#tomato-timer-settings');
        if (container) {
            // 创建专注时间选择区域
            const focusTimeArea = document.createElement('div');
            focusTimeArea.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';
            
            const focusLabel = document.createElement('div');
            focusLabel.textContent = '专注时长(分钟)';
            focusLabel.style.cssText = 'color: var(--b3-theme-on-background); font-size: 14px;';
            
            const focusButtonsContainer = document.createElement('div');
            focusButtonsContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem;';
            
            const focusTimes = [20, 25, 30, 45, 60, 90, 120, 150, 180];
            
            focusTimes.forEach(time => {
                const button = document.createElement('button');
                button.textContent = time.toString();
                button.style.cssText = 'padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); cursor: pointer; min-width: 45px;';
                if (time === this.selectedFocusTime) {
                    button.style.background = 'var(--b3-theme-primary)';
                    button.style.color = '#fff';
                }
                button.addEventListener('click', () => {
                    this.selectedFocusTime = time;
                    focusButtonsContainer.querySelectorAll('button').forEach(btn => {
                        btn.style.background = 'var(--b3-theme-surface)';
                        btn.style.color = 'var(--b3-theme-on-surface)';
                    });
                    button.style.background = 'var(--b3-theme-primary)';
                    button.style.color = '#fff';
                    focusCustomInput.value = '';
                });
                focusButtonsContainer.appendChild(button);
            });
            
            // 添加自定义输入框
            const focusCustomInput = document.createElement('input');
            focusCustomInput.type = 'number';
            focusCustomInput.min = '1';
            focusCustomInput.placeholder = '自定义';
            focusCustomInput.style.cssText = 'width: 60px; padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); outline: none;';
            
            focusCustomInput.addEventListener('input', () => {
                const value = parseInt(focusCustomInput.value);
                if (value > 0) {
                    this.selectedFocusTime = value;
                    focusButtonsContainer.querySelectorAll('button').forEach(btn => {
                        btn.style.background = 'var(--b3-theme-surface)';
                        btn.style.color = 'var(--b3-theme-on-surface)';
                    });
                }
            });
            
            focusButtonsContainer.appendChild(focusCustomInput);

            // 创建休息时间选择区域
            const breakTimeArea = document.createElement('div');
            breakTimeArea.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;';
            
            const breakLabel = document.createElement('div');
            breakLabel.textContent = '休息时长(分钟)';
            breakLabel.style.cssText = 'color: var(--b3-theme-on-background); font-size: 14px;';
            
            const breakButtonsContainer = document.createElement('div');
            breakButtonsContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem;';
            
            const breakTimes = [5, 10, 15];
            
            breakTimes.forEach(time => {
                const button = document.createElement('button');
                button.textContent = time.toString();
                button.style.cssText = 'padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); cursor: pointer; min-width: 45px;';
                if (time === this.selectedBreakTime) {
                    button.style.background = 'var(--b3-theme-primary)';
                    button.style.color = '#fff';
                }
                button.addEventListener('click', () => {
                    this.selectedBreakTime = time;
                    breakButtonsContainer.querySelectorAll('button').forEach(btn => {
                        btn.style.background = 'var(--b3-theme-surface)';
                        btn.style.color = 'var(--b3-theme-on-surface)';
                    });
                    button.style.background = 'var(--b3-theme-primary)';
                    button.style.color = '#fff';
                    breakCustomInput.value = '';
                });
                breakButtonsContainer.appendChild(button);
            });

            // 添加自定义输入框
            const breakCustomInput = document.createElement('input');
            breakCustomInput.type = 'number';
            breakCustomInput.min = '1';
            breakCustomInput.placeholder = '自定义';
            breakCustomInput.style.cssText = 'width: 60px; padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); outline: none;';
            
            breakCustomInput.addEventListener('input', () => {
                const value = parseInt(breakCustomInput.value);
                if (value > 0) {
                    this.selectedBreakTime = value;
                    breakButtonsContainer.querySelectorAll('button').forEach(btn => {
                        btn.style.background = 'var(--b3-theme-surface)';
                        btn.style.color = 'var(--b3-theme-on-surface)';
                    });
                }
            });
            
            breakButtonsContainer.appendChild(breakCustomInput);

            // 创建通知开关
            const notificationArea = document.createElement('div');
            notificationArea.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;';
            
            const notificationLabel = document.createElement('span');
            notificationLabel.textContent = '消息通知';
            notificationLabel.style.cssText = 'color: var(--b3-theme-on-background); font-size: 14px;';
            
            const notificationSwitch = document.createElement('label');
            notificationSwitch.style.cssText = 'position: relative; display: inline-block; width: 40px; height: 20px;';
            
            const notificationSlider = document.createElement('span');
            notificationSlider.style.cssText = `
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: ${this.notificationCheckbox.checked ? 'var(--b3-theme-primary)' : '#ccc'};
                transition: .4s;
                border-radius: 20px;
            `;
            notificationSlider.innerHTML = `
                <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; transform: ${this.notificationCheckbox.checked ? 'translateX(20px)' : 'translateX(0)'};"></span>
            `;
            
            this.notificationCheckbox.addEventListener('change', () => {
                if (this.notificationCheckbox.checked) {
                    notificationSlider.style.backgroundColor = 'var(--b3-theme-primary)';
                    notificationSlider.querySelector('span').style.transform = 'translateX(20px)';
                } else {
                    notificationSlider.style.backgroundColor = '#ccc';
                    notificationSlider.querySelector('span').style.transform = 'translateX(0)';
                }
            });
            
            notificationSwitch.append(this.notificationCheckbox, notificationSlider);
            notificationArea.append(notificationLabel, notificationSwitch);

            // 创建按钮区域
            const buttonArea = document.createElement('div');
            buttonArea.style.cssText = 'display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;';

            const confirmButton = document.createElement('button');
            confirmButton.textContent = '确定';
            confirmButton.style.cssText = 'padding: 8px 16px; border-radius: 4px; background: var(--b3-theme-primary); color: white; border: none; cursor: pointer;';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = '取消';
            cancelButton.style.cssText = 'padding: 8px 16px; border-radius: 4px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); cursor: pointer;';

            buttonArea.append(cancelButton, confirmButton);

            // 绑定按钮事件
            confirmButton.addEventListener('click', () => {
                dialog.destroy();
                // 启动番茄钟
                this.countdownTime = this.selectedFocusTime * 60;
                this.totalTime = this.countdownTime;
                this.isCountingDown = true;
                this.isPaused = false;
                this.isSimpleCountdown = false;
                this.isBreakTime = false;

                // 设置显示格式
                this.hasHours = false;
                this.hourGroup.style.display = 'none';
                this.secondGroup.style.display = 'flex';

                // 隐藏设置按钮和倒计时按钮
                this.settingsButton.style.display = 'none';
                this.countdownButton.style.display = 'none';

                // 显示进度条和控制按钮
                this.progressBar.style.width = '0%';
                this.progressContainer.style.opacity = '1';
                this.buttonContainer.style.opacity = '1';
                this.buttonContainer.style.pointerEvents = 'auto';

                // 更新标题
                const titleElement = this.container.closest('.dock')?.querySelector('.dock__title');
                if (titleElement) {
                    titleElement.textContent = '专注时间';
                }
            });

            cancelButton.addEventListener('click', () => {
                dialog.destroy();
            });

            // 组装所有元素
            focusTimeArea.appendChild(focusLabel);
            focusTimeArea.appendChild(focusButtonsContainer);
            breakTimeArea.appendChild(breakLabel);
            breakTimeArea.appendChild(breakButtonsContainer);
            
            container.appendChild(focusTimeArea);
            container.appendChild(breakTimeArea);
            container.appendChild(notificationArea);
            container.appendChild(buttonArea);
        }
    }

    private showSettingsMenu() {
        const dialog = new Dialog({
            title: "番茄钟设置",
            content: `
                <div class="b3-dialog__content" style="display: flex; flex-direction: column; gap: 1.5rem; padding: 20px;">
                    <div class="fn__flex-column" style="gap: 1rem;">
                        <div class="fn__flex" style="align-items: center;">
                            <label class="fn__flex" style="margin-right: 8px;">
                                <input type="checkbox" class="b3-switch fn__flex-center" id="show-seconds" ${this.showSecondsCheckbox?.checked ? 'checked' : ''}>
                                <span style="margin-left: 8px;">显示秒</span>
                            </label>
                        </div>
                        <div class="fn__flex" style="align-items: center;">
                            <label class="fn__flex" style="margin-right: 8px;">
                                <input type="checkbox" class="b3-switch fn__flex-center" id="show-notification" ${this.notificationCheckbox?.checked ? 'checked' : ''}>
                                <span style="margin-left: 8px;">消息通知</span>
                            </label>
                        </div>
                    </div>

                    <div class="fn__flex-column" style="gap: 1rem;">
                        <div class="b3-label">时钟样式</div>
                        <div class="fn__flex-column" style="gap: 0.8rem; padding-left: 1rem;">
                            <div class="fn__flex" style="align-items: center;">
                                <label class="fn__flex" style="width: 80px;">卡片颜色</label>
                                <input type="color" id="card-color" class="b3-text-field" 
                                    value="${this.getCardColor()}"
                                    style="width: 80px; height: 32px; padding: 2px;">
                            </div>
                            <div class="fn__flex" style="align-items: center;">
                                <label class="fn__flex" style="width: 80px;">数字颜色</label>
                                <input type="color" id="number-color" class="b3-text-field"
                                    value="${this.getNumberColor()}"
                                    style="width: 80px; height: 32px; padding: 2px;">
                            </div>
                            <div class="fn__flex" style="align-items: center;">
                                <label class="fn__flex" style="width: 80px;">显示阴影</label>
                                <input class="b3-switch fn__flex-center" type="checkbox" id="show-shadow" ${this.hasClockShadow() ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>

                    <div class="fn__flex-column" style="gap: 1rem;">
                        <div class="b3-label">滚动文字</div>
                        <div class="fn__flex-column" style="gap: 0.8rem; padding-left: 1rem;">
                            <div class="fn__flex-column" style="gap: 0.4rem;">
                                <label class="fn__flex">文字内容</label>
                                <textarea class="b3-text-field fn__block" id="scrolling-text-content" rows="3" 
                                    style="resize: vertical;">${this.scrollingText.textContent || ''}</textarea>
                            </div>
                            <div class="fn__flex" style="align-items: center;">
                                <label class="fn__flex" style="width: 80px;">字体大小</label>
                                <input type="number" min="8" max="24" value="${parseInt(this.scrollingText.style.fontSize) || 12}" 
                                    class="b3-text-field" id="scrolling-text-size" style="width: 80px;">
                                <span style="margin-left: 4px;">px</span>
                            </div>
                            <div class="fn__flex" style="align-items: center;">
                                <label class="fn__flex" style="width: 80px;">字体颜色</label>
                                <input type="color" value="${this.scrollingText.style.color || 'var(--b3-theme-primary)'}" 
                                    class="b3-text-field" id="scrolling-text-color" style="width: 80px; height: 32px; padding: 2px;">
                            </div>
                            <div class="fn__flex" style="align-items: center;">
                                <label class="fn__flex" style="margin-right: 8px;">
                                    <input type="checkbox" class="b3-switch fn__flex-center" id="scrolling-text-bold" 
                                        ${this.scrollingText.style.fontWeight === 'bold' ? 'checked' : ''}>
                                    <span style="margin-left: 8px;">文字加粗</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="b3-dialog__action" style="padding: 16px;">
                    <button class="b3-button b3-button--cancel">取消</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text">保存</button>
                </div>
            `,
            width: "520px",
        });

        // 绑定复选框事件
        const showSecondsCheckbox = dialog.element.querySelector('#show-seconds') as HTMLInputElement;
        const showNotificationCheckbox = dialog.element.querySelector('#show-notification') as HTMLInputElement;
        const cardColorInput = dialog.element.querySelector('#card-color') as HTMLInputElement;
        const numberColorInput = dialog.element.querySelector('#number-color') as HTMLInputElement;
        const showShadowCheckbox = dialog.element.querySelector('#show-shadow') as HTMLInputElement;
        const scrollingTextContent = dialog.element.querySelector('#scrolling-text-content') as HTMLTextAreaElement;
        const scrollingTextSize = dialog.element.querySelector('#scrolling-text-size') as HTMLInputElement;
        const scrollingTextColor = dialog.element.querySelector('#scrolling-text-color') as HTMLInputElement;
        const scrollingTextBold = dialog.element.querySelector('#scrolling-text-bold') as HTMLInputElement;

        // 绑定保存按钮事件
        dialog.element.querySelector('.b3-button--text')?.addEventListener('click', async () => {
            if (this.showSecondsCheckbox) {
                this.showSecondsCheckbox.checked = showSecondsCheckbox.checked;
                if (!this.isCountingDown) {
                    this.secondGroup.style.display = this.showSecondsCheckbox.checked ? 'flex' : 'none';
                }
            }

            if (this.notificationCheckbox) {
                this.notificationCheckbox.checked = showNotificationCheckbox.checked;
            }

            // 更新时钟样式
            this.applyCustomStyle(
                cardColorInput.value,
                numberColorInput.value,
                showShadowCheckbox.checked
            );

            // 更新滚动文字
            this.scrollingText.textContent = scrollingTextContent.value;
            this.scrollingText.style.fontSize = `${scrollingTextSize.value}px`;
            this.scrollingText.style.color = scrollingTextColor.value;
            this.scrollingText.style.fontWeight = scrollingTextBold.checked ? 'bold' : 'normal';
            this.scrollingTextContainer.style.display = scrollingTextContent.value.trim() ? 'flex' : 'none';

            // 保存配置
            await this.saveConfig();

            dialog.destroy();
        });

        // 绑定取消按钮事件
        dialog.element.querySelector('.b3-button--cancel')?.addEventListener('click', () => {
            dialog.destroy();
        });
    }

    private applyCustomStyle(cardColor: string, numberColor: string, showShadow: boolean) {
        const style = document.createElement('style');
        style.textContent = `
            .col {
                background-color: ${cardColor} !important;
                box-shadow: ${showShadow ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none'} !important;
            }
            .curr, .next {
                color: ${numberColor} !important;
                background-color: ${cardColor} !important;
            }
            .curr::before, .next::before {
                background-color: ${cardColor} !important;
                color: ${numberColor} !important;
            }
            .flip .curr::before, .flip .next::before {
                background-color: ${cardColor} !important;
                color: ${numberColor} !important;
            }
        `;
        
        const oldStyle = document.getElementById('clock-custom-style');
        if (oldStyle) {
            oldStyle.remove();
        }
        style.id = 'clock-custom-style';
        document.head.appendChild(style);
    }

    private getCardColor(): string {
        const customStyle = document.getElementById('clock-custom-style');
        if (customStyle) {
            const styleContent = customStyle.textContent || '';
            const cardColorMatch = styleContent.match(/background-color:\s*(#[a-fA-F0-9]{6}|rgba?\([^)]+\))\s*!important/);
            if (cardColorMatch && cardColorMatch[1]) {
                if (cardColorMatch[1].startsWith('rgb')) {
                    return this.rgbToHex(cardColorMatch[1]);
                }
                return cardColorMatch[1];
            }
        }
        return '#ffffff'; // 默认白色
    }

    private getNumberColor(): string {
        const customStyle = document.getElementById('clock-custom-style');
        if (customStyle) {
            const styleContent = customStyle.textContent || '';
            const numberColorMatch = styleContent.match(/\.curr,\s*\.next\s*{\s*color:\s*(#[a-fA-F0-9]{6}|rgba?\([^)]+\))\s*!important/);
            if (numberColorMatch && numberColorMatch[1]) {
                if (numberColorMatch[1].startsWith('rgb')) {
                    return this.rgbToHex(numberColorMatch[1]);
                }
                return numberColorMatch[1];
            }
        }
        return '#000000'; // 默认黑色
    }

    private rgbToHex(rgb: string): string {
        const rgbMatch = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!rgbMatch) return '#000000';
        
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    private hasClockShadow(): boolean {
        const customStyle = document.getElementById('clock-custom-style');
        if (customStyle) {
            const styleContent = customStyle.textContent || '';
            return styleContent.includes('box-shadow: 0 4px 8px');
        }
        return false;
    }

    private showCountdownDialog() {
        const dialog = new Dialog({
            title: '倒计时设置',
            content: `
                <div class="b3-dialog__content" style="display: flex; flex-direction: column; gap: 1rem; padding: 20px;">
                    <div class="fn__flex-column" style="gap: 1rem;">
                        <div class="fn__flex" style="align-items: center;">
                            <label class="fn__flex" style="width: 80px;">时长(分钟)</label>
                            <input type="number" id="countdown-minutes" class="b3-text-field" 
                                min="1" max="999" value="30" style="width: 80px;">
                        </div>
                    </div>
                    <div class="fn__flex b3-dialog__action">
                        <button class="b3-button b3-button--cancel">取消</button>
                        <div class="fn__space"></div>
                        <button class="b3-button b3-button--text">开始</button>
                    </div>
                </div>
            `,
            width: "300px",
        });

        // 绑定按钮事件
        const startButton = dialog.element.querySelector('.b3-button--text') as HTMLButtonElement;
        startButton.addEventListener('click', () => {
            const minutes = parseInt((dialog.element.querySelector('#countdown-minutes') as HTMLInputElement).value);
            if (minutes > 0) {
                this.startSimpleCountdown(minutes);
            }
            dialog.destroy();
        });

        const cancelButton = dialog.element.querySelector('.b3-button--cancel') as HTMLButtonElement;
        cancelButton.addEventListener('click', () => {
            dialog.destroy();
        });
    }

    private startSimpleCountdown(minutes: number) {
        this.countdownTime = minutes * 60;
        this.totalTime = this.countdownTime;
        this.isCountingDown = true;
        this.isPaused = false;
        this.isSimpleCountdown = true;
        this.isBreakTime = false;

        // 隐藏设置按钮和倒计时按钮
        this.settingsButton.style.display = 'none';
        this.countdownButton.style.display = 'none';

        // 设置显示格式
        this.hasHours = false;
        this.hourGroup.style.display = 'none';
        this.secondGroup.style.display = 'flex';

        // 显示进度条和控制按钮
        this.progressBar.style.width = '0%';
        this.progressContainer.style.opacity = '1';
        this.buttonContainer.style.opacity = '1';
        this.buttonContainer.style.pointerEvents = 'auto';

        // 更新标题
        const titleElement = this.container.closest('.dock')?.querySelector('.dock__title');
        if (titleElement) {
            titleElement.textContent = '倒计时';
        }
    }

    private run() {
        this.updateTime();
        setTimeout(() => {
            this.run();
        }, 1000);
    }
} 