import { Dialog, Menu, showMessage } from "siyuan";

export class TomatoClock {
    private container: HTMLElement;
    private timeDiv: HTMLElement;
    private progressBar: HTMLElement;
    private progressContainer: HTMLElement;
    private buttonContainer: HTMLElement;
    private scrollingText: HTMLElement;
    private scrollingTextContainer: HTMLElement;
    private settingsButton: HTMLElement;
    private startButton: HTMLElement;
    private pauseButton: HTMLElement;
    private stopButton: HTMLElement;
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
    private hasHours: boolean = true;
    private lastSec: number = new Date().getSeconds();

    constructor(container: HTMLElement) {
        this.container = container;
        
        // 初始化复选框
        this.showSecondsCheckbox = document.createElement('input');
        this.showSecondsCheckbox.type = 'checkbox';
        this.showSecondsCheckbox.checked = false; // 默认不显示秒

        this.notificationCheckbox = document.createElement('input');
        this.notificationCheckbox.type = 'checkbox';
        this.notificationCheckbox.checked = true; // 默认开启通知
        
        this.initElements();
        this.initStyles();
        this.initEvents();
        this.run();
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
            }
        });
        this.container.addEventListener('mouseleave', () => {
            this.settingsButton.style.opacity = '0';
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
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 5px auto;
        `;

        this.scrollingText = document.createElement('div');
        this.scrollingText.textContent = '一定要认真搞好论文，再弄其他的，千万不要被其他事情分心';
        this.scrollingText.style.cssText = `
            color: var(--b3-theme-primary);
            font-size: 12px;
            font-weight: normal;
            white-space: nowrap;
            animation: scrollText 10s linear infinite;
            opacity: 0.8;
        `;

        this.scrollingTextContainer.appendChild(this.scrollingText);
        this.scrollingTextContainer.style.display = this.scrollingText.textContent.trim() ? 'flex' : 'none';
    }

    private createSettingsButton() {
        this.settingsButton = this.createButton('iconTime');
        this.settingsButton.style.cssText = `
            position: absolute;
            top: 65%;
            left: 50%;
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
    }

    private createButton(iconName: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.innerHTML = `<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#${iconName}"></use></svg>`;
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
                    if (this.notificationCheckbox?.checked) {
                        showMessage(this.isBreakTime ? "休息时间结束！" : "专注时间结束！");
                    }
                    this.isBreakTime = !this.isBreakTime;
                    const nextMinutes = this.isBreakTime ? this.selectedBreakTime : this.selectedFocusTime;
                    this.countdownTime = nextMinutes * 60;
                    this.totalTime = this.countdownTime;
                    this.progressBar.style.width = '0%';
                    
                    this.updateTitle();
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
        this.settingsButton.style.display = 'block';
        this.settingsButton.style.opacity = '0';
        this.hasHours = true;
        this.hourGroup.style.display = 'flex';
        this.secondGroup.style.display = this.showSecondsCheckbox?.checked ? 'flex' : 'none';
        this.progressBar.style.width = '0%';
        this.progressContainer.style.opacity = '0';
        this.buttonContainer.style.opacity = '0';
        this.buttonContainer.style.pointerEvents = 'none';
        this.pauseButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPause"></use></svg>';
        this.isBreakTime = false;
        
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
                const minutes = this.isBreakTime ? this.selectedBreakTime : this.selectedFocusTime;
                this.countdownTime = minutes * 60;
                
                if (this.countdownTime > 0) {
                    this.totalTime = this.countdownTime;
                    this.isCountingDown = true;
                    this.isPaused = false;
                    this.startButton.style.display = 'none';
                    this.settingsButton.style.display = 'none';
                    
                    this.hasHours = false;
                    this.hourGroup.style.display = 'none';
                    this.secondGroup.style.display = 'flex';  // 在倒计时时始终显示秒

                    this.timeDiv.style.display = 'flex';
                    this.progressBar.style.width = '0%';
                    this.progressContainer.style.opacity = '1';
                    
                    // 更新标题显示当前是工作还是休息时间
                    const title = this.isBreakTime ? '休息时间' : '专注时间';
                    const titleElement = this.container.closest('.dock')?.querySelector('.dock__title');
                    if (titleElement) {
                        titleElement.textContent = title;
                    }
                }
                dialog.destroy();
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
            `,
            width: "520px",
        });

        // 绑定复选框事件
        const showSecondsCheckbox = dialog.element.querySelector('#show-seconds') as HTMLInputElement;
        showSecondsCheckbox.addEventListener('change', () => {
            if (this.showSecondsCheckbox) {
                this.showSecondsCheckbox.checked = showSecondsCheckbox.checked;
                if (!this.isCountingDown) {
                    this.secondGroup.style.display = this.showSecondsCheckbox.checked ? 'flex' : 'none';
                }
            }
        });

        const showNotificationCheckbox = dialog.element.querySelector('#show-notification') as HTMLInputElement;
        showNotificationCheckbox.addEventListener('change', () => {
            if (this.notificationCheckbox) {
                this.notificationCheckbox.checked = showNotificationCheckbox.checked;
            }
        });

        // 添加保存按钮
        const btns = document.createElement("div");
        btns.className = "fn__flex b3-dialog__action";
        btns.innerHTML = `
            <button class="b3-button b3-button--cancel">取消</button>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--text">保存</button>
        `;
        dialog.element.appendChild(btns);

        // 绑定保存按钮事件
        btns.querySelector('.b3-button--text')?.addEventListener('click', () => {
            // 保存时钟样式设置
            const cardColor = (dialog.element.querySelector('#card-color') as HTMLInputElement).value;
            const numberColor = (dialog.element.querySelector('#number-color') as HTMLInputElement).value;
            const showShadow = (dialog.element.querySelector('#show-shadow') as HTMLInputElement).checked;

            // 更新时钟样式
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

            // 保存滚动文字设置
            const content = (dialog.element.querySelector('#scrolling-text-content') as HTMLTextAreaElement).value;
            const fontSize = (dialog.element.querySelector('#scrolling-text-size') as HTMLInputElement).value;
            const textColor = (dialog.element.querySelector('#scrolling-text-color') as HTMLInputElement).value;
            const isBold = (dialog.element.querySelector('#scrolling-text-bold') as HTMLInputElement).checked;

            this.scrollingText.textContent = content;
            this.scrollingText.style.fontSize = `${fontSize}px`;
            this.scrollingText.style.color = textColor;
            this.scrollingText.style.fontWeight = isBold ? 'bold' : 'normal';
            this.scrollingTextContainer.style.display = content.trim() ? 'flex' : 'none';

            dialog.destroy();
        });

        btns.querySelector('.b3-button--cancel')?.addEventListener('click', () => {
            dialog.destroy();
        });
    }

    private getCardColor(): string {
        const customStyle = document.getElementById('clock-custom-style');
        if (customStyle) {
            const styleContent = customStyle.textContent || '';
            const cardColorMatch = styleContent.match(/background-color: (#[a-fA-F0-9]{6})/);
            if (cardColorMatch) {
                return cardColorMatch[1];
            }
        }
        return '#1e1e1e';
    }

    private getNumberColor(): string {
        const customStyle = document.getElementById('clock-custom-style');
        if (customStyle) {
            const styleContent = customStyle.textContent || '';
            const numberColorMatch = styleContent.match(/::before.*?color: (#[a-fA-F0-9]{6})/s);
            if (numberColorMatch) {
                return numberColorMatch[1];
            }
        }
        return '#ffffff';
    }

    private hasClockShadow(): boolean {
        const customStyle = document.getElementById('clock-custom-style');
        if (customStyle) {
            const styleContent = customStyle.textContent || '';
            return styleContent.includes('box-shadow: 0 4px 8px');
        }
        return false;
    }

    private run() {
        this.updateTime();
        setTimeout(() => {
            this.run();
        }, 1000);
    }
} 