import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    openTab,
    adaptHotkey,
    getFrontend,
    getBackend,
    IModel,
    Protyle,
    openWindow,
    IOperation,
    Constants,
    openMobileFileById,
    lockScreen,
    ICard,
    ICardData
} from "siyuan";
import "@/index.scss";

import HelloExample from "@/hello.svelte";
import SettingExample from "@/setting-example.svelte";

import { SettingUtils } from "./libs/setting-utils";
import { svelteDialog } from "./libs/dialog";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class PluginSample extends Plugin {

    customTab: () => IModel;
    private isMobile: boolean;
    private settingUtils: SettingUtils;

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        console.log("loading plugin-sample", this.i18n);

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
<path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
</symbol>
<symbol id="iconSaving" viewBox="0 0 32 32">
<path d="M20 13.333c0-0.733 0.6-1.333 1.333-1.333s1.333 0.6 1.333 1.333c0 0.733-0.6 1.333-1.333 1.333s-1.333-0.6-1.333-1.333zM10.667 12h6.667v-2.667h-6.667v2.667zM29.333 10v9.293l-3.76 1.253-2.24 7.453h-7.333v-2.667h-2.667v2.667h-7.333c0 0-3.333-11.28-3.333-15.333s3.28-7.333 7.333-7.333h6.667c1.213-1.613 3.147-2.667 5.333-2.667 1.107 0 2 0.893 2 2 0 0.28-0.053 0.533-0.16 0.773-0.187 0.453-0.347 0.973-0.427 1.533l3.027 3.027h2.893zM26.667 12.667h-1.333l-4.667-4.667c0-0.867 0.12-1.72 0.347-2.547-1.293 0.333-2.347 1.293-2.787 2.547h-8.227c-2.573 0-4.667 2.093-4.667 4.667 0 2.507 1.627 8.867 2.68 12.667h2.653v-2.667h8v2.667h2.68l2.067-6.867 3.253-1.093v-4.707z"></path>
</symbol>`);

        const topBarElement = this.addTopBar({
            icon: "iconFace",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                if (this.isMobile) {
                    this.addMenu();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    this.addMenu(rect);
                }
            }
        });

        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="Remove plugin-sample Data">
    <svg>
        <use xlink:href="#iconTrashcan"></use>
    </svg>
</div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", () => {
            confirm("⚠️", this.i18n.confirmRemove.replace("${name}", this.name), () => {
                this.removeData(STORAGE_NAME).then(() => {
                    this.data[STORAGE_NAME] = { readonlyText: "Readonly" };
                    showMessage(`[${this.name}]: ${this.i18n.removedData}`);
                });
            });
        });
        this.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
        });

        this.addCommand({
            langKey: "showDialog",
            hotkey: "⇧⌘O",
            callback: () => {
                this.showDialog();
            },
            fileTreeCallback: (file: any) => {
                console.log(file, "fileTreeCallback");
            },
            editorCallback: (protyle: any) => {
                console.log(protyle, "editorCallback");
            },
            dockCallback: (element: HTMLElement) => {
                console.log(element, "dockCallback");
            },
        });
        this.addCommand({
            langKey: "getTab",
            hotkey: "⇧⌘M",
            globalCallback: () => {
                console.log(this.getOpenedTab());
            },
        });

        this.addDock({
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconSaving",
                title: "番茄钟",
                hotkey: "⌥⌘W",
            },
            data: {
                text: "番茄钟"
            },
            type: DOCK_TYPE,
            init: (dock) => {
                const style = document.createElement('style');
                style.textContent = `
                    .pomodoro-container { display: flex; flex-direction: column; align-items: center; height: 100%; padding: 20px; }
                    .timer-display { font-size: 48px; font-weight: bold; margin: 20px 0; position: relative; }
                    .flip-clock { display: flex; gap: 10px; }
                    .flip-unit { position: relative; width: 60px; height: 80px; }
                    .flip-card { position: relative; width: 100%; height: 100%; }
                    
                    .flip-top, .flip-bottom, .flip-back-top, .flip-back-bottom {
                        position: absolute;
                        width: 100%;
                        height: 50%;
                        overflow: hidden;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 48px;
                        background: var(--b3-theme-background);
                        color: var(--b3-theme-on-background);
                        border: 1px solid var(--b3-border-color);
                    }
                    
                    .flip-top, .flip-back-top {
                        background: var(--b3-theme-surface);
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                        border-bottom: 1px solid rgba(0,0,0,0.1);
                        align-items: flex-end;
                    }
                    
                    .flip-bottom, .flip-back-bottom {
                        bottom: 0;
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                        border-top: 1px solid rgba(0,0,0,0.1);
                        align-items: flex-start;
                    }
                    
                    .flip-top span, .flip-back-top span {
                        transform: translateY(50%);
                    }
                    
                    .flip-bottom span, .flip-back-bottom span {
                        transform: translateY(-50%);
                    }
                    
                    .flip-back {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        transform-origin: 50% 50%;
                        transition: transform 0.6s;
                        backface-visibility: hidden;
                        transform: rotateX(0deg);
                    }
                    
                    .flip-card.flipped .flip-back {
                        transform: rotateX(-180deg);
                    }

                    .progress-bar { width: 80%; height: 4px; background: var(--b3-theme-surface); border-radius: 2px; margin: 20px 0; }
                    .progress-bar-fill { height: 100%; background: var(--b3-theme-primary); width: 0%; transition: width 1s linear; }
                    .controls { display: flex; gap: 20px; margin-top: 20px; }
                    .control-btn { 
                        background: none; 
                        border: 1px solid var(--b3-border-color); 
                        color: var(--b3-theme-on-background); 
                        padding: 10px 20px; 
                        border-radius: 4px; 
                        cursor: pointer; 
                    }
                    .control-btn:hover { background: var(--b3-theme-surface); }
                `;
                document.head.appendChild(style);

                dock.element.innerHTML = `
                    <div class="pomodoro-container">
                        <div class="timer-display">
                            <div class="flip-clock">
                                <div class="flip-unit minutes-tens">
                                    <div class="flip-card">
                                        <div class="flip-top"><span>2</span></div>
                                        <div class="flip-bottom"><span>2</span></div>
                                        <div class="flip-back">
                                            <div class="flip-back-top"><span>1</span></div>
                                            <div class="flip-back-bottom"><span>1</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="flip-unit minutes-ones">
                                    <div class="flip-card">
                                        <div class="flip-top"><span>5</span></div>
                                        <div class="flip-bottom"><span>5</span></div>
                                        <div class="flip-back">
                                            <div class="flip-back-top"><span>4</span></div>
                                            <div class="flip-back-bottom"><span>4</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div style="font-size: 48px; margin: 0 5px;">:</div>
                                <div class="flip-unit seconds-tens">
                                    <div class="flip-card">
                                        <div class="flip-top"><span>0</span></div>
                                        <div class="flip-bottom"><span>0</span></div>
                                        <div class="flip-back">
                                            <div class="flip-back-top"><span>5</span></div>
                                            <div class="flip-back-bottom"><span>5</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="flip-unit seconds-ones">
                                    <div class="flip-card">
                                        <div class="flip-top"><span>0</span></div>
                                        <div class="flip-bottom"><span>0</span></div>
                                        <div class="flip-back">
                                            <div class="flip-back-top"><span>9</span></div>
                                            <div class="flip-back-bottom"><span>9</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="progress-bar"><div class="progress-bar-fill"></div></div>
                        <div class="controls">
                            <button class="control-btn" id="startBtn">开始</button>
                            <button class="control-btn" id="stopBtn">终止</button>
                        </div>
                    </div>
                `;

                let duration = 25 * 60;
                let timeLeft = duration;
                let isRunning = false;
                let timer = null;
                const elements = {
                    clock: {
                        minutesTens: dock.element.querySelector('.minutes-tens .flip-card'),
                        minutesOnes: dock.element.querySelector('.minutes-ones .flip-card'),
                        secondsTens: dock.element.querySelector('.seconds-tens .flip-card'),
                        secondsOnes: dock.element.querySelector('.seconds-ones .flip-card')
                    },
                    progress: dock.element.querySelector('.progress-bar-fill'),
                    startBtn: dock.element.querySelector('#startBtn'),
                    stopBtn: dock.element.querySelector('#stopBtn')
                };

                const updateDisplay = () => {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    
                    const minutesTens = Math.floor(minutes / 10);
                    const minutesOnes = minutes % 10;
                    const secondsTens = Math.floor(seconds / 10);
                    const secondsOnes = seconds % 10;

                    // 计算下一秒的值
                    const nextTimeLeft = timeLeft - 1;
                    const nextMinutes = Math.floor(nextTimeLeft / 60);
                    const nextSeconds = nextTimeLeft % 60;
                    const nextMinutesTens = Math.floor(nextMinutes / 10);
                    const nextMinutesOnes = nextMinutes % 10;
                    const nextSecondsTens = Math.floor(nextSeconds / 10);
                    const nextSecondsOnes = nextSeconds % 10;

                    // 更新翻页效果
                    const updateFlipCard = (element: Element, value: number, prevValue: number) => {
                        if (value !== prevValue) {
                            const front = element.querySelector('.flip-top span') as HTMLElement;
                            const bottom = element.querySelector('.flip-bottom span') as HTMLElement;
                            const backTop = element.querySelector('.flip-back-top span') as HTMLElement;
                            const backBottom = element.querySelector('.flip-back-bottom span') as HTMLElement;

                            front.textContent = value.toString();
                            bottom.textContent = value.toString();
                            backTop.textContent = prevValue.toString();
                            backBottom.textContent = prevValue.toString();

                            element.classList.add('flipped');
                            setTimeout(() => {
                                element.classList.remove('flipped');
                            }, 600);
                        }
                    };

                    // 只在值发生变化时才更新对应的卡片
                    updateFlipCard(elements.clock.minutesTens, minutesTens, nextMinutesTens);
                    updateFlipCard(elements.clock.minutesOnes, minutesOnes, nextMinutesOnes);
                    updateFlipCard(elements.clock.secondsTens, secondsTens, nextSecondsTens);
                    updateFlipCard(elements.clock.secondsOnes, secondsOnes, nextSecondsOnes);

                    (elements.progress as HTMLElement).style.width = `${((duration - timeLeft) / duration) * 100}%`;
                };

                elements.startBtn.addEventListener('click', () => {
                    if (!isRunning) {
                        isRunning = true;
                        elements.startBtn.textContent = '暂停';
                        timer = setInterval(() => {
                            if (timeLeft > 0) {
                                timeLeft--;
                                updateDisplay();
                            } else {
                                clearInterval(timer);
                                isRunning = false;
                                elements.startBtn.textContent = '开始';
                                new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IB').play();
                            }
                        }, 1000);
                    } else {
                        clearInterval(timer);
                        isRunning = false;
                        elements.startBtn.textContent = '继续';
                    }
                });

                elements.stopBtn.addEventListener('click', () => {
                    clearInterval(timer);
                    isRunning = false;
                    timeLeft = duration;
                    elements.startBtn.textContent = '开始';
                    updateDisplay();
                });

                updateDisplay();
            }
        });
    }
}