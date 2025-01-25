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
</symbol>
<symbol id="iconSettings" viewBox="0 0 24 24">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
</symbol>
<symbol id="iconPlay" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
</symbol>
<symbol id="iconPause" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
</symbol>
<symbol id="iconStop" viewBox="0 0 24 24">
    <path d="M6 6h12v12H6z"/>
</symbol>`);


        this.addDock({
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconTime",
                title: "番茄钟",
                hotkey: "⌥⌘W",
            },
            data: {
                text: "番茄钟"
            },
            type: DOCK_TYPE,
            init: (dock) => {
                // 添加样式
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
                        overflow: hidden;
                        color: var(--b3-theme-on-background);
                    }

                    .time-group {
                        display: flex;
                        gap: 0.3rem;
                        margin: 0 0.2rem;
                    }

                    .col {
                        width: var(--col-width);
                        height: var(--col-height);
                        perspective: var(--col-height);
                        background: var(--b3-theme-background);
                        border-radius: 8px;
                        overflow: hidden;
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
                `;
                dock.element.appendChild(style);

                // 创建时钟容器和控制区域
                const container = document.createElement('div');
                container.style.cssText = 'display: flex; flex-direction: column; gap: 1rem; padding: 5px; padding-top: 30px; position: relative;';

                // 创建进度条容器
                const progressContainer = document.createElement('div');
                progressContainer.style.cssText = 'position: absolute; bottom: 0; left: 5px; right: 5px; height: 6px; background: var(--b3-theme-surface-lighter); overflow: hidden; opacity: 0; transition: opacity 0.3s; border-radius: 3px; margin: 5px;';
                
                const progressBar = document.createElement('div');
                progressBar.style.cssText = 'height: 100%; width: 0%; background: var(--b3-theme-primary); transition: width 0.5s linear; border-radius: 3px;';
                progressContainer.appendChild(progressBar);
                
                // 创建暂停和终止按钮容器
                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = `
                    position: absolute;
                    top: 5px;
                    left: 30px;
                    display: flex;
                    gap: 5px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                `;

                // 创建暂停按钮
                const pauseButton = document.createElement('button');
                pauseButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPause"></use></svg>';
                pauseButton.style.cssText = `
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    padding: 4px;
                    cursor: pointer;
                    transition: all 0.3s;
                `;
                pauseButton.addEventListener('mouseenter', () => {
                    pauseButton.style.background = 'var(--b3-theme-surface)';
                });
                pauseButton.addEventListener('mouseleave', () => {
                    pauseButton.style.background = 'transparent';
                });

                // 创建终止按钮
                const stopButton = document.createElement('button');
                stopButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconStop"></use></svg>';
                stopButton.style.cssText = `
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    padding: 4px;
                    cursor: pointer;
                    transition: all 0.3s;
                `;
                stopButton.addEventListener('mouseenter', () => {
                    stopButton.style.background = 'var(--b3-theme-surface)';
                });
                stopButton.addEventListener('mouseleave', () => {
                    stopButton.style.background = 'transparent';
                });

                buttonContainer.append(pauseButton, stopButton);

                // 在创建按钮容器的代码附近添加
                const settingsButton = document.createElement('button');
                settingsButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconSettings"></use></svg>';
                settingsButton.style.cssText = `
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    padding: 4px;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.3s;
                    z-index: 4;
                `;
                settingsButton.addEventListener('mouseenter', () => {
                    settingsButton.style.background = 'var(--b3-theme-surface)';
                });
                settingsButton.addEventListener('mouseleave', () => {
                    settingsButton.style.background = 'transparent';
                });

                // 添加设置菜单
                const settingsMenu = document.createElement('div');
                settingsMenu.style.cssText = `
                    position: absolute;
                    top: 35px;
                    left: 35px;
                    background: var(--b3-theme-surface);
                    border-radius: 4px;
                    padding: 8px;
                    display: none;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    z-index: 4;
                `;

                const showSecondsOption = document.createElement('div');
                showSecondsOption.style.cssText = 'display: flex; align-items: center; gap: 8px; cursor: pointer;';

                const showSecondsCheckbox = document.createElement('input');
                showSecondsCheckbox.type = 'checkbox';
                showSecondsCheckbox.checked = true; // 默认显示秒

                const showSecondsLabel = document.createElement('span');
                showSecondsLabel.textContent = '显示秒';
                showSecondsLabel.style.color = 'var(--b3-theme-on-surface)';

                showSecondsOption.append(showSecondsCheckbox, showSecondsLabel);
                settingsMenu.appendChild(showSecondsOption);

                // 在container的mouseenter和mouseleave事件中添加settingsButton的显示控制
                container.addEventListener('mouseenter', () => {
                    settingsButton.style.opacity = '1';
                    startButton.style.opacity = '1';
                    if (isCountingDown) {
                        buttonContainer.style.opacity = '1';
                        buttonContainer.style.pointerEvents = 'auto';
                    }
                });

                container.addEventListener('mouseleave', () => {
                    settingsButton.style.opacity = '0';
                    startButton.style.opacity = '0';
                    buttonContainer.style.opacity = '0';
                    buttonContainer.style.pointerEvents = 'none';
                    settingsMenu.style.display = 'none';
                });

                // 添加设置按钮点击事件
                settingsButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
                });

                // 修改秒显示控制的逻辑
                showSecondsCheckbox.addEventListener('change', () => {
                    if (!isCountingDown) {
                        secondGroup.style.display = showSecondsCheckbox.checked ? 'flex' : 'none';
                    }
                });

                // 点击其他区域关闭设置菜单
                document.addEventListener('click', () => {
                    settingsMenu.style.display = 'none';
                });

                settingsMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                // 创建时钟容器
                const timeDiv = document.createElement('div');
                timeDiv.className = 'time';
                timeDiv.id = 'time';
                timeDiv.style.marginTop = '2px';

                // 创建设置区域
                const settingArea = document.createElement('div');
                settingArea.style.cssText = 'display: none; flex-direction: column; gap: 1rem; padding: 10px;';
                
                // 创建专注时间选择区域
                const focusTimeArea = document.createElement('div');
                focusTimeArea.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';
                
                const focusLabel = document.createElement('div');
                focusLabel.textContent = '专注时长(分钟)';
                focusLabel.style.cssText = 'color: var(--b3-theme-on-background); font-size: 14px;';
                
                const focusButtonsContainer = document.createElement('div');
                focusButtonsContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem;';
                
                const focusTimes = [20, 25, 30, 45, 60, 90, 120, 150, 180];
                let selectedFocusTime = 25; // 默认选中25分钟
                
                focusTimes.forEach(time => {
                    const button = document.createElement('button');
                    button.textContent = time.toString();
                    button.style.cssText = 'padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); cursor: pointer; min-width: 45px;';
                    if (time === selectedFocusTime) {
                        button.style.background = 'var(--b3-theme-primary)';
                        button.style.color = '#fff';
                    }
                    button.addEventListener('click', () => {
                        selectedFocusTime = time;
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
                        selectedFocusTime = value;
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
                let selectedBreakTime = 5; // 默认选中5分钟
                
                breakTimes.forEach(time => {
                    const button = document.createElement('button');
                    button.textContent = time.toString();
                    button.style.cssText = 'padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); cursor: pointer; min-width: 45px;';
                    if (time === selectedBreakTime) {
                        button.style.background = 'var(--b3-theme-primary)';
                        button.style.color = '#fff';
                    }
                    button.addEventListener('click', () => {
                        selectedBreakTime = time;
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
                        selectedBreakTime = value;
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
                
                const notificationCheckbox = document.createElement('input');
                notificationCheckbox.type = 'checkbox';
                notificationCheckbox.style.cssText = 'opacity: 0; width: 0; height: 0;';
                notificationCheckbox.checked = true;
                
                const notificationSlider = document.createElement('span');
                notificationSlider.style.cssText = `
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--b3-theme-primary);
                    transition: .4s;
                    border-radius: 20px;
                `;
                notificationSlider.innerHTML = `
                    <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                `;
                
                notificationCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        notificationSlider.style.backgroundColor = 'var(--b3-theme-primary)';
                        notificationSlider.querySelector('span').style.transform = 'translateX(20px)';
                    } else {
                        notificationSlider.style.backgroundColor = '#ccc';
                        notificationSlider.querySelector('span').style.transform = 'translateX(0)';
                    }
                });
                
                notificationSwitch.append(notificationCheckbox, notificationSlider);
                notificationArea.append(notificationLabel, notificationSwitch);

                // 创建按钮区域
                const buttonArea = document.createElement('div');
                buttonArea.style.cssText = 'display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;';

                const confirmButton = document.createElement('button');
                confirmButton.textContent = '确定';
                confirmButton.style.cssText = 'padding: 8px 16px; border-radius: 4px; background: var(--b3-theme-background); color: var(--b3-theme-on-background); border: 1px solid var(--b3-theme-surface-lighter);';

                const cancelButton = document.createElement('button');
                cancelButton.textContent = '取消';
                cancelButton.style.cssText = 'padding: 8px 16px; border-radius: 4px; background: var(--b3-theme-background); color: var(--b3-theme-on-background); border: 1px solid var(--b3-theme-surface-lighter);';

                buttonArea.append(cancelButton, confirmButton);

                // 创建控制按钮区域
                const controlArea = document.createElement('div');
                controlArea.style.cssText = 'display: flex; justify-content: center; gap: 1rem;';
                
                const startButton = document.createElement('button');
                startButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPlay"></use></svg>';
                startButton.style.cssText = `
                    position: absolute;
                    top: 5px;
                    left: 30px;
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    padding: 4px;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.3s;
                `;
                startButton.addEventListener('mouseenter', () => {
                    startButton.style.background = 'var(--b3-theme-surface)';
                });
                startButton.addEventListener('mouseleave', () => {
                    startButton.style.background = 'transparent';
                });

                controlArea.appendChild(startButton);

                // 开始按钮点击事件
                startButton.addEventListener('click', () => {
                    const dialog = new Dialog({
                        title: '番茄钟设置',
                        content: `<div id="tomato-timer-settings" style="display: flex; flex-direction: column; gap: 1rem; padding: 10px;"></div>`,
                        width: '360px',
                        height: '400px',
                    });
                    const container = dialog.element.querySelector('#tomato-timer-settings');
                    const dialogContainer = dialog.element.querySelector('.b3-dialog__container') as HTMLElement;
                    if (container && dialogContainer) {
                        dialogContainer.style.maxWidth = 'none';
                        
                        // 重新创建设置区域的内容
                        const newFocusArea = focusTimeArea.cloneNode(false) as HTMLElement;
                        const newFocusLabel = focusLabel.cloneNode(true) as HTMLElement;
                        const newFocusButtonsContainer = document.createElement('div');
                        newFocusButtonsContainer.style.cssText = focusButtonsContainer.style.cssText;
                        
                        focusTimes.forEach(time => {
                            const button = document.createElement('button');
                            button.textContent = time.toString();
                            button.style.cssText = 'padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); cursor: pointer; min-width: 45px;';
                            if (time === selectedFocusTime && !focusCustomInput.value) {
                                button.style.background = 'var(--b3-theme-primary)';
                                button.style.color = '#fff';
                            }
                            button.addEventListener('click', () => {
                                selectedFocusTime = time;
                                newFocusButtonsContainer.querySelectorAll('button').forEach(btn => {
                                    btn.style.background = 'var(--b3-theme-surface)';
                                    btn.style.color = 'var(--b3-theme-on-surface)';
                                });
                                button.style.background = 'var(--b3-theme-primary)';
                                button.style.color = '#fff';
                                newFocusCustomInput.value = '';
                            });
                            newFocusButtonsContainer.appendChild(button);
                        });
                        
                        // 添加自定义输入框
                        const newFocusCustomInput = document.createElement('input');
                        newFocusCustomInput.type = 'number';
                        newFocusCustomInput.min = '1';
                        newFocusCustomInput.placeholder = '自定义';
                        newFocusCustomInput.style.cssText = 'width: 60px; padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); outline: none;';
                        newFocusCustomInput.value = focusCustomInput.value;
                        
                        newFocusCustomInput.addEventListener('input', () => {
                            const value = parseInt(newFocusCustomInput.value);
                            if (value > 0) {
                                selectedFocusTime = value;
                                newFocusButtonsContainer.querySelectorAll('button').forEach(btn => {
                                    btn.style.background = 'var(--b3-theme-surface)';
                                    btn.style.color = 'var(--b3-theme-on-surface)';
                                });
                                focusCustomInput.value = value.toString();
                            }
                        });
                        
                        newFocusButtonsContainer.appendChild(newFocusCustomInput);
                        
                        const newBreakArea = breakTimeArea.cloneNode(false) as HTMLElement;
                        const newBreakLabel = breakLabel.cloneNode(true) as HTMLElement;
                        const newBreakButtonsContainer = document.createElement('div');
                        newBreakButtonsContainer.style.cssText = breakButtonsContainer.style.cssText;
                        
                        breakTimes.forEach(time => {
                            const button = document.createElement('button');
                            button.textContent = time.toString();
                            button.style.cssText = 'padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); cursor: pointer; min-width: 45px;';
                            if (time === selectedBreakTime && !breakCustomInput.value) {
                                button.style.background = 'var(--b3-theme-primary)';
                                button.style.color = '#fff';
                            }
                            button.addEventListener('click', () => {
                                selectedBreakTime = time;
                                newBreakButtonsContainer.querySelectorAll('button').forEach(btn => {
                                    btn.style.background = 'var(--b3-theme-surface)';
                                    btn.style.color = 'var(--b3-theme-on-surface)';
                                });
                                button.style.background = 'var(--b3-theme-primary)';
                                button.style.color = '#fff';
                                newBreakCustomInput.value = '';
                            });
                            newBreakButtonsContainer.appendChild(button);
                        });

                        // 添加自定义输入框
                        const newBreakCustomInput = document.createElement('input');
                        newBreakCustomInput.type = 'number';
                        newBreakCustomInput.min = '1';
                        newBreakCustomInput.placeholder = '自定义';
                        newBreakCustomInput.style.cssText = 'width: 60px; padding: 6px 12px; border-radius: 6px; background: var(--b3-theme-surface); color: var(--b3-theme-on-surface); border: 1px solid var(--b3-theme-surface-lighter); outline: none;';
                        newBreakCustomInput.value = breakCustomInput.value;
                        
                        newBreakCustomInput.addEventListener('input', () => {
                            const value = parseInt(newBreakCustomInput.value);
                            if (value > 0) {
                                selectedBreakTime = value;
                                newBreakButtonsContainer.querySelectorAll('button').forEach(btn => {
                                    btn.style.background = 'var(--b3-theme-surface)';
                                    btn.style.color = 'var(--b3-theme-on-surface)';
                                });
                                breakCustomInput.value = value.toString();
                            }
                        });
                        
                        newBreakButtonsContainer.appendChild(newBreakCustomInput);

                        const newNotificationArea = notificationArea.cloneNode(true) as HTMLElement;
                        const newNotificationCheckbox = newNotificationArea.querySelector('input') as HTMLInputElement;
                        const newNotificationSlider = newNotificationArea.querySelector('span') as HTMLElement;
                        
                        if (newNotificationCheckbox && newNotificationSlider) {
                            newNotificationCheckbox.checked = notificationCheckbox.checked;
                            newNotificationCheckbox.addEventListener('change', function() {
                                notificationCheckbox.checked = this.checked;
                                if (this.checked) {
                                    newNotificationSlider.style.backgroundColor = 'var(--b3-theme-primary)';
                                    newNotificationSlider.querySelector('span').style.transform = 'translateX(20px)';
                                } else {
                                    newNotificationSlider.style.backgroundColor = '#ccc';
                                    newNotificationSlider.querySelector('span').style.transform = 'translateX(0)';
                                }
                            });
                        }
                        
                        const newButtonArea = buttonArea.cloneNode(true) as HTMLElement;
                        const newConfirmButton = newButtonArea.querySelector('button:last-child') as HTMLButtonElement;
                        const newCancelButton = newButtonArea.querySelector('button:first-child') as HTMLButtonElement;
                        
                        if (newConfirmButton && newCancelButton) {
                            newConfirmButton.onclick = () => {
                                dialog.destroy();
                                confirmButton.click();
                            };
                            
                            newCancelButton.onclick = () => {
                                dialog.destroy();
                            };
                        }
                        
                        // 组装新的设置区域
                        newFocusArea.appendChild(newFocusLabel);
                        newFocusArea.appendChild(newFocusButtonsContainer);
                        newBreakArea.appendChild(newBreakLabel);
                        newBreakArea.appendChild(newBreakButtonsContainer);
                        
                        // 添加所有内容到弹窗
                        container.appendChild(newFocusArea);
                        container.appendChild(newBreakArea);
                        container.appendChild(newNotificationArea);
                        container.appendChild(newButtonArea);
                    }
                });

                // 修改确认按钮点击事件，在开始倒计时时显示秒
                let isBreakTime = false;
                let notificationEnabled = true;

                confirmButton.addEventListener('click', () => {
                    const minutes = isBreakTime ? selectedBreakTime : selectedFocusTime;
                    countdownTime = minutes * 60;
                    
                    if (countdownTime > 0) {
                        totalTime = countdownTime;
                        isCountingDown = true;
                        isPaused = false;
                        startButton.style.display = 'none';
                        startButton.style.opacity = '0';
                        
                        hasHours = false;
                        hourGroup.style.display = 'none';
                        secondGroup.style.display = 'flex';  // 在倒计时时始终显示秒

                        timeDiv.style.display = 'flex';
                        controlArea.style.display = 'flex';
                        progressBar.style.width = '0%';
                        progressContainer.style.opacity = '1';
                        
                        // 更新标题显示当前是工作还是休息时间
                        const title = isBreakTime ? '休息时间' : '专注时间';
                        const titleElement = dock.element.querySelector('.dock__title');
                        if (titleElement) {
                            titleElement.textContent = title;
                        }
                    }
                });

                // 修改倒计时结束逻辑，支持自动切换
                function updateTime() {
                    if (!isCountingDown || isPaused) {
                        let s = new Date().getSeconds();
                        if (s === lastSec) {
                            return;
                        }
                        lastSec = s;
                    } else {
                        if (countdownTime > 0) {
                            countdownTime--;
                            updateProgress();
                            if (countdownTime === 0) {
                                if (notificationCheckbox.checked) {
                                    showMessage(isBreakTime ? "休息时间结束！" : "专注时间结束！");
                                }
                                isBreakTime = !isBreakTime;
                                const nextMinutes = isBreakTime ? selectedBreakTime : selectedFocusTime;
                                countdownTime = nextMinutes * 60;
                                totalTime = countdownTime;
                                progressBar.style.width = '0%';
                                
                                // 更新标题
                                const title = isBreakTime ? '休息时间' : '专注时间';
                                const titleElement = dock.element.querySelector('.dock__title');
                                if (titleElement) {
                                    titleElement.textContent = title;
                                }
                            }
                        }
                    }
                    
                    const currStr = getTimeStr();
                    const activeElms = hasHours ? [...hourElms, ...minSecElms] : minSecElms;
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

                // 修改终止按钮事件，结束倒计时时恢复秒的显示状态
                stopButton.addEventListener('click', () => {
                    isCountingDown = false;
                    isPaused = false;
                    countdownTime = 0;
                    startButton.style.display = 'block';
                    startButton.style.opacity = '1';
                    hasHours = true;
                    hourGroup.style.display = 'flex';
                    secondGroup.style.display = showSecondsCheckbox.checked ? 'flex' : 'none';
                    progressBar.style.width = '0%';
                    progressContainer.style.opacity = '0';
                    buttonContainer.style.opacity = '0';
                    buttonContainer.style.pointerEvents = 'none';
                    pauseButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPause"></use></svg>';
                    isBreakTime = false;
                    const titleElement = dock.element.querySelector('.dock__title');
                    if (titleElement) {
                        titleElement.textContent = '番茄钟';
                    }
                });

                // 创建时分秒分组
                const hourGroup = document.createElement('div');
                hourGroup.className = 'time-group';
                const minuteGroup = document.createElement('div');
                minuteGroup.className = 'time-group';
                const secondGroup = document.createElement('div');
                secondGroup.className = 'time-group';

                timeDiv.append(hourGroup, minuteGroup, secondGroup);
                hourGroup.style.display = 'flex'; // 默认显示小时

                // 时钟逻辑
                const colElms = [];
                let countdownTime = 0; // 倒计时总秒数
                let isCountingDown = false;
                let hasHours = true; // 默认显示小时

                function getTimeStr(date = new Date()) {
                    if (!isCountingDown) {
                        // 非倒计时状态始终显示完整时间
                        return [date.getHours(), date.getMinutes(), date.getSeconds()]
                            .map((item) => item.toString().padStart(2, "0"))
                            .join("");
                    } else {
                        const hours = Math.floor(countdownTime / 3600);
                        const minutes = Math.floor((countdownTime % 3600) / 60);
                        const seconds = countdownTime % 60;
                        if (!hasHours) {
                            return [minutes, seconds]
                                .map((item) => item.toString().padStart(2, "0"))
                                .join("");
                        }
                        return [hours, minutes, seconds]
                            .map((item) => item.toString().padStart(2, "0"))
                            .join("");
                    }
                }

                function createCol(parent: HTMLElement) {
                    const createEl = (cls) => {
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
                        setCurr: (t) => [flipCurr, curr].forEach((el) => (el.dataset.t = t)),
                        setNext: (t) => [flipNext, next].forEach((el) => (el.dataset.t = t)),
                    };
                }

                const hourElms = [];
                const minSecElms = [];

                // 创建时分秒的数字
                for (let i = 0; i < 2; i++) {
                    hourElms.push(createCol(hourGroup));
                }
                for (let i = 0; i < 2; i++) {
                    minSecElms.push(createCol(minuteGroup));
                }
                for (let i = 0; i < 2; i++) {
                    minSecElms.push(createCol(secondGroup));
                }

                function updateDisplay() {
                    const timeStr = getTimeStr();
                    if (hasHours) {
                        [...hourElms, ...minSecElms].forEach(({ setCurr }, i) => {
                            setCurr(timeStr[i]);
                        });
                    } else {
                        minSecElms.forEach(({ setCurr }, i) => {
                            setCurr(timeStr[i]);
                        });
                    }
                }

                updateDisplay();

                let lastSec = new Date().getSeconds();
                let isPaused = false;
                let totalTime = 0;

                function updateProgress() {
                    if (totalTime > 0) {
                        const progress = ((totalTime - countdownTime) / totalTime) * 100;
                        progressBar.style.width = `${progress}%`;
                    }
                }

                function run() {
                    updateTime();
                    setTimeout(() => {
                        run();
                    }, 1000);
                }

                // 修改添加到容器的顺序，确保设置按钮和菜单在正确的位置
                container.style.position = 'relative';

                // 添加到主容器
                container.appendChild(timeDiv);
                container.appendChild(settingArea);
                container.appendChild(controlArea);
                container.appendChild(progressContainer);
                container.appendChild(buttonContainer);
                container.appendChild(settingsButton);
                container.appendChild(settingsMenu);
                dock.element.appendChild(container);

                run();
            }
        });
    }
}