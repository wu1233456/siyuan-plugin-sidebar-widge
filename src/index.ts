import {
    Plugin,
    showMessage,
    Dialog,
    Menu,
    getFrontend,
    IModel,
} from "siyuan";
import "@/index.scss";

import { SettingUtils } from "./libs/setting-utils";

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
<symbol id="iconTime" viewBox="0 0 1024 1024">
<path d="M963.05566 345.393457c-34.433245-59.444739-83.5084-112.04244-142.458001-152.926613 3.805482-11.402299 2.23519-23.908046-4.272326-34.008842a39.5855 39.5855 0 0 0-29.198939-17.938108L617.888552 123.076923l-73.365164-105.421751c-7.398762-10.638373-19.55084-16.976127-32.509284-16.976127s-25.110522 6.337754-32.509283 16.976127L406.111363 123.076923 236.887668 140.505747A39.625111 39.625111 0 0 0 207.688729 158.443855a39.676039 39.676039 0 0 0-4.286473 34.008842C77.170603 279.724138 2.716138 415.179487 2.716138 560.311229c-0.04244 62.72679 13.849691 124.689655 40.671972 181.38992 25.916888 55.129973 62.924845 104.587091 110.005305 146.956676 46.769231 42.100796 101.177719 75.119363 161.683466 98.164456a559.214854 559.214854 0 0 0 393.846153 0c60.519894-23.030946 114.928382-56.06366 161.71176-98.164456 47.08046-42.369584 84.088417-91.826702 110.005305-146.956676A423.347834 423.347834 0 0 0 1021.283777 560.311229a429.629001 429.629001 0 0 0-58.228117-214.917772z m-530.786914-145.372237c11.473033-1.188329 21.856764-7.299735 28.44916-16.778072L511.999958 109.609195l51.239611 73.633953c6.592396 9.464191 16.976127 15.589744 28.44916 16.778072l80.580017 8.304156-47.278514 32.679045a39.601061 39.601061 0 0 0-15.971707 41.874447l14.458002 59.784262-97.655172-36.413793a39.633599 39.633599 0 0 0-27.671088 0l-97.655172 36.399646 14.458001-59.784262a39.601061 39.601061 0 0 0-15.971706-41.874447l-47.278515-32.679045 80.565871-8.290009zM817.570249 829.778957a434.642617 434.642617 0 0 1-136.94076 83.013262 480.025464 480.025464 0 0 1-337.457118 0 434.642617 434.642617 0 0 1-136.94076-83.013262C126.132584 757.545535 81.938065 661.842617 81.938065 560.311229c0-125.496021 68.923077-242.758621 184.615385-314.553492l65.018568 44.944297-25.563219 105.81786a39.619452 39.619452 0 0 0 52.34306 46.401415L511.999958 385.669319l153.676392 57.280283c13.72237 5.106985 29.142352 2.23519 40.106101-7.483643a39.58267 39.58267 0 0 0 12.222812-38.917772l-25.605659-105.81786 65.018568-44.93015c2.900088 1.79664 5.78603 3.621574 8.629531 5.488948 53.616269 35.083996 98.022989 81.343943 128.43855 133.842617 31.56145 54.507515 47.533156 113.471264 47.533156 175.221927 0.04244 101.488948-44.152078 197.191866-124.44916 269.425288z m0 0" fill="#3A3A3A"></path>
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
</symbol>
<symbol id="iconEdit" viewBox="0 0 24 24">
    <path d="M19.045 3.875c-1.23-1.34-2.76-2.01-4.38-1.98-1.62.03-3.12.72-4.44 1.92-5.76 1.2-1.2 2.76-1.8 4.44-1.8 1.62.03 3.15.72 4.5 1.92 5.7 1.2 1.2 2.76 1.8 4.44 1.8zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6-3.6zM3.48 21c-.48.48-.48 1.2 0 1.68l.96.96c.48.48 1.2.48 1.68 0l.96-.96c.48-.48.48-1.2 0-1.68l-.96-.96zM12 12c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6-3.6z"/>
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
                `;
                dock.element.appendChild(style);

                // 创建时钟容器和控制区域
                const container = document.createElement('div');
                container.style.cssText = 'display: flex; flex-direction: column; gap: 1rem; padding: 5px; padding-top: 30px; padding-bottom: 40px; position: relative;';

                // 创建进度条容器
                const progressContainer = document.createElement('div');
                progressContainer.style.cssText = `
                    position: absolute;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    height: 6px;
                    background: var(--b3-theme-surface-lighter);
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 0.3s;
                    border-radius: 3px;
                    margin: 5px;
                `;
                
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

                // 添加必要的变量定义
                const showSecondsCheckbox = document.createElement('input');
                showSecondsCheckbox.type = 'checkbox';
                showSecondsCheckbox.checked = false; // 默认不显示秒

                const notificationCheckbox = document.createElement('input');
                notificationCheckbox.type = 'checkbox';
                notificationCheckbox.checked = true; // 默认开启通知

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
                });

                // 添加设置按钮点击事件
                settingsButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rect = settingsButton.getBoundingClientRect();
                    const menu = new Menu("settingsMenu");

                    // 添加显示秒选项
                    menu.addItem({
                        icon: showSecondsCheckbox.checked ? "iconSelect" : "",
                        label: "显示秒",
                        click: () => {
                            showSecondsCheckbox.checked = !showSecondsCheckbox.checked;
                            if (!isCountingDown) {
                                secondGroup.style.display = showSecondsCheckbox.checked ? 'flex' : 'none';
                            }
                        }
                    });

                    // 添加通知开关选项 
                    menu.addItem({
                        icon: notificationCheckbox.checked ? "iconSelect" : "",
                        label: "消息通知",
                        click: () => {
                            notificationCheckbox.checked = !notificationCheckbox.checked;
                        }
                    });

                    menu.addSeparator();

                    // 添加时钟样式设置选项
                    menu.addItem({
                        icon: "iconEdit",
                        label: "时钟样式设置",
                        click: () => {
                            // 获取当前的样式值
                            let currentCardColor = '#1e1e1e';
                            let currentNumberColor = '#ffffff';
                            let currentShowShadow = false;

                            // 尝试从现有的自定义样式中获取当前值
                            const customStyle = document.getElementById('clock-custom-style');
                            if (customStyle) {
                                const styleContent = customStyle.textContent;
                                // 提取卡片颜色
                                const cardColorMatch = styleContent.match(/background-color: (#[a-fA-F0-9]{6})/);
                                if (cardColorMatch) {
                                    currentCardColor = cardColorMatch[1];
                                }
                                // 提取数字颜色 - 从伪元素的颜色中获取
                                const numberColorMatch = styleContent.match(/::before.*?color: (#[a-fA-F0-9]{6})/s);
                                if (numberColorMatch) {
                                    currentNumberColor = numberColorMatch[1];
                                }
                                // 检查是否有阴影
                                currentShowShadow = styleContent.includes('box-shadow: 0 4px 8px');
                            } else {
                                // 如果没有自定义样式，从DOM中获取当前值
                                const col = document.querySelector('.col') as HTMLElement;
                                if (col) {
                                    const computedCol = getComputedStyle(col);
                                    // 将rgb颜色转换为hex
                                    const rgbToHex = (rgb) => {
                                        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                                        if (match) {
                                            const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
                                            return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
                                        }
                                        return rgb;
                                    };
                                    currentCardColor = rgbToHex(computedCol.backgroundColor);
                                    currentShowShadow = computedCol.boxShadow !== 'none';

                                    // 获取伪元素的颜色
                                    const beforeStyle = window.getComputedStyle(col.querySelector('.curr'), ':before');
                                    if (beforeStyle) {
                                        currentNumberColor = rgbToHex(beforeStyle.color);
                                    }
                                }
                            }

                            const dialog = new Dialog({
                                title: "时钟样式设置",
                                content: `
                                    <div class="b3-dialog__content" style="display: flex; flex-direction: column; gap: 1rem; padding: 20px;">
                                        <div class="fn__flex-column">
                                            <div class="fn__flex" style="align-items: center; margin-bottom: 10px;">
                                                <label class="fn__flex" style="width: 80px;">卡片颜色</label>
                                                <input type="color" id="card-color" class="b3-text-field" 
                                                    value="${currentCardColor}"
                                                    style="width: 80px; height: 32px; padding: 2px;">
                                            </div>
                                            <div class="fn__flex" style="align-items: center;">
                                                <label class="fn__flex" style="width: 80px;">数字颜色</label>
                                                <input type="color" id="number-color" class="b3-text-field"
                                                    value="${currentNumberColor}"
                                                    style="width: 80px; height: 32px; padding: 2px;">
                                            </div>
                                            <div class="fn__flex" style="align-items: center; margin-top: 10px;">
                                                <label class="fn__flex" style="width: 80px;">显示阴影</label>
                                                <input class="b3-switch fn__flex-center" type="checkbox" id="show-shadow" ${currentShowShadow ? 'checked' : ''}>
                                            </div>
                                        </div>
                                    </div>
                                `,
                                width: "320px",
                            });

                            const saveSettings = () => {
                                const cardColor = (dialog.element.querySelector('#card-color') as HTMLInputElement).value;
                                const numberColor = (dialog.element.querySelector('#number-color') as HTMLInputElement).value;
                                const showShadow = (dialog.element.querySelector('#show-shadow') as HTMLInputElement).checked;

                                // 更新样式
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
                                
                                // 移除旧的样式（如果存在）
                                const oldStyle = document.getElementById('clock-custom-style');
                                if (oldStyle) {
                                    oldStyle.remove();
                                }
                                
                                // 添加新样式
                                style.id = 'clock-custom-style';
                                document.head.appendChild(style);

                                dialog.destroy();
                            };

                            // 添加确定和取消按钮
                            const btns = document.createElement("div");
                            btns.className = "fn__flex b3-dialog__action";
                            btns.innerHTML = `
                                <button class="b3-button b3-button--cancel">取消</button>
                                <div class="fn__space"></div>
                                <button class="b3-button b3-button--text">确定</button>
                            `;
                            dialog.element.querySelector('.b3-dialog__content').appendChild(btns);

                            // 绑定按钮事件
                            btns.querySelector('.b3-button--cancel').addEventListener('click', () => {
                                dialog.destroy();
                            });
                            btns.querySelector('.b3-button--text').addEventListener('click', saveSettings);
                        }
                    });

                    menu.addSeparator();

                    // 添加滚动文字设置选项
                    menu.addItem({
                        icon: "iconEdit",
                        label: "滚动文字设置",
                        click: () => {
                            const dialog = new Dialog({
                                title: "滚动文字设置",
                                content: `
                                    <div class="b3-dialog__content" style="display: flex; flex-direction: column; gap: 1rem; padding: 20px;">
                                        <div class="fn__flex-column">
                                            <label class="fn__flex" style="margin-bottom: 4px;">文字内容</label>
                                            <textarea class="b3-text-field fn__block" id="scrolling-text-content" rows="3" style="resize: vertical;">${scrollingText.textContent || ''}</textarea>
                                        </div>
                                        <div class="fn__flex-column" style="gap: 0.5rem;">
                                            <div class="fn__flex" style="align-items: center;">
                                                <label class="fn__flex" style="width: 80px;">字体大小</label>
                                                <input type="number" min="8" max="24" value="${parseInt(scrollingText.style.fontSize) || 12}" 
                                                    class="b3-text-field" id="scrolling-text-size" style="width: 80px;">
                                                <span style="margin-left: 4px;">px</span>
                                            </div>
                                            <div class="fn__flex" style="align-items: center;">
                                                <label class="fn__flex" style="width: 80px;">字体颜色</label>
                                                <input type="color" value="${scrollingText.style.color || 'var(--b3-theme-primary)'}" 
                                                    class="b3-text-field" id="scrolling-text-color" style="width: 80px; height: 32px; padding: 2px;">
                                            </div>
                                        </div>
                                        <div class="fn__flex" style="align-items: center;">
                                            <label class="fn__flex" style="margin-right: 8px;">
                                                <input type="checkbox" class="b3-switch fn__flex-center" id="scrolling-text-bold" 
                                                    ${scrollingText.style.fontWeight === 'bold' ? 'checked' : ''}>
                                                <span style="margin-left: 8px;">文字加粗</span>
                                            </label>
                                        </div>
                                    </div>
                                `,
                                width: "520px",
                            });

                            const saveSettings = () => {
                                const content = (dialog.element.querySelector('#scrolling-text-content') as HTMLTextAreaElement).value;
                                const fontSize = (dialog.element.querySelector('#scrolling-text-size') as HTMLInputElement).value;
                                const color = (dialog.element.querySelector('#scrolling-text-color') as HTMLInputElement).value;
                                const isBold = (dialog.element.querySelector('#scrolling-text-bold') as HTMLInputElement).checked;

                                scrollingText.textContent = content;
                                scrollingText.style.fontSize = `${fontSize}px`;
                                scrollingText.style.color = color;
                                scrollingText.style.fontWeight = isBold ? 'bold' : 'normal';

                                // 根据内容是否为空来显示或隐藏滚动文字容器
                                scrollingTextContainer.style.display = content.trim() ? 'flex' : 'none';

                                dialog.destroy();
                            };

                            // 添加确定和取消按钮
                            const btns = document.createElement("div");
                            btns.className = "fn__flex b3-dialog__action";
                            btns.innerHTML = `
                                <button class="b3-button b3-button--cancel">取消</button>
                                <div class="fn__space"></div>
                                <button class="b3-button b3-button--text">确定</button>
                            `;
                            dialog.element.querySelector('.b3-dialog__content').appendChild(btns);

                            // 绑定按钮事件
                            btns.querySelector('.b3-button--cancel').addEventListener('click', () => {
                                dialog.destroy();
                            });
                            btns.querySelector('.b3-button--text').addEventListener('click', saveSettings);
                        }
                    });

                    menu.open({
                        x: rect.right,
                        y: rect.bottom,
                        isLeft: true,
                    });
                });

                // 创建时钟容器
                const timeDiv = document.createElement('div');
                timeDiv.className = 'time';
                timeDiv.id = 'time';
                timeDiv.style.cssText = 'margin-top: 2px; position: relative; z-index: 2;';

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
                startButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconTime"></use></svg>';
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

                        // 修改休息时间自定义输入框相关的代码
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

                // 添加暂停按钮点击事件
                pauseButton.addEventListener('click', () => {
                    if (!isCountingDown) return;
                    
                    isPaused = !isPaused;
                    if (isPaused) {
                        pauseButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPlay"></use></svg>';
                    } else {
                        pauseButton.innerHTML = '<svg class="icon" style="width: 12px; height: 12px; fill: var(--b3-theme-primary);"><use xlink:href="#iconPause"></use></svg>';
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
                secondGroup.style.display = 'none'; // 默认隐藏秒

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

                // 在添加到主容器之前，创建滚动文字区域
                const scrollingTextContainer = document.createElement('div');
                scrollingTextContainer.style.cssText = `
                    position: absolute;
                    bottom: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    overflow: hidden;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;

                const scrollingText = document.createElement('div');
                scrollingText.textContent = '一定要认真搞好论文，再弄其他的，千万不要被其他事情分心';
                scrollingText.style.cssText = `
                    color: var(--b3-theme-primary);
                    font-size: 12px;
                    font-weight: normal;
                    white-space: nowrap;
                    animation: scrollText 10s linear infinite;
                    opacity: 0.8;
                `;

                // 修改动画样式
                style.textContent += `
                    @keyframes scrollText {
                        0% {
                            transform: translateX(100%);
                        }
                        100% {
                            transform: translateX(-100%);
                        }
                    }
                `;

                scrollingTextContainer.appendChild(scrollingText);

                // 初始化时,如果文字内容为空则隐藏滚动文字容器
                scrollingTextContainer.style.display = scrollingText.textContent.trim() ? 'flex' : 'none';

                // 修改添加到主容器的顺序
                container.appendChild(timeDiv);
                container.appendChild(settingArea);
                container.appendChild(controlArea);
                container.appendChild(progressContainer);
                container.appendChild(buttonContainer);
                container.appendChild(settingsButton);
                container.appendChild(scrollingTextContainer);  // 添加滚动文字容器
                dock.element.appendChild(container);

                run();
            }
        });
    }
}