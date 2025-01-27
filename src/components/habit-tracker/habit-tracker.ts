import { Dialog } from "siyuan";
import { getFile, putFile } from "../../api";

interface HabitTrackerConfig {
    currentValue: number;
    targetValue: number;
    title: string;
    autoReset: boolean;
}

export class HabitTracker {
    private container: HTMLElement;
    private progressRing: SVGElement;
    private currentValue: number = 0;
    private targetValue: number = 8;
    private title: string = "习惯打卡";
    private autoReset: boolean = true;
    private progressText: HTMLElement;
    private buttonsContainer: HTMLElement;
    private titleElement: HTMLElement;
    private configPath: string;

    constructor(container: HTMLElement) {
        this.container = container;
        this.configPath = "/data/storage/siyuan-plugin-sidebar-widget/habit-tracker.json";
        this.loadConfig().then(() => {
            this.init();
            // 添加点击事件监听
            this.container.addEventListener('click', (e) => {
                // 如果点击的是按钮，不触发设置对话框
                if ((e.target as HTMLElement).closest('.habit-buttons')) {
                    return;
                }
                this.showSettingsDialog();
            });
        });
    }

    private async loadConfig() {
        try {
            const config = await getFile(this.configPath);
            if (config) {
                this.currentValue = config.currentValue?config.currentValue:0;
                this.targetValue = config.targetValue?config.targetValue:8;
                this.title = config.title?config.title:"习惯打卡";
                this.autoReset = config.autoReset?config.autoReset:true;
            }
            console.log("加载习惯追踪器配置成功");
        } catch (e) {
            console.log("加载习惯追踪器配置失败，使用默认配置");
        }
    }

    private async saveConfig() {
        const config: HabitTrackerConfig = {
            currentValue: this.currentValue,
            targetValue: this.targetValue,
            title: this.title,
            autoReset: this.autoReset
        };
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(config)], { type: "application/json" }));
            console.log("保存习惯追踪器配置成功");
        } catch (e) {
            console.error("保存习惯追踪器配置失败", e);
        }
    }

    private init() {
        // 创建卡片内容容器
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            position: relative;
        `;

        // 创建按钮容器
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 2;
        `;

        // 创建重置按钮
        const resetButton = this.createButton('↺', '重置');
        resetButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setCurrentValue(0);
        });

        // 创建增加按钮
        const addButton = this.createButton('+', '增加');
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentValue < this.targetValue) {
                this.setCurrentValue(this.currentValue + 1);
            }
        });

        this.buttonsContainer.appendChild(resetButton);
        this.buttonsContainer.appendChild(addButton);

        // 添加类名以便识别按钮容器
        this.buttonsContainer.className = 'habit-buttons';

        // 创建SVG进度环
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "120");
        svg.setAttribute("height", "120");
        svg.setAttribute("viewBox", "0 0 120 120");
        svg.style.position = "relative";
        svg.style.zIndex = "1";
        
        // 背景圆环
        const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        bgCircle.setAttribute("cx", "60");
        bgCircle.setAttribute("cy", "60");
        bgCircle.setAttribute("r", "54");
        bgCircle.setAttribute("fill", "none");
        bgCircle.setAttribute("stroke", "var(--b3-theme-background-light)");
        bgCircle.setAttribute("stroke-width", "12");

        // 进度圆环
        const progressCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        progressCircle.setAttribute("cx", "60");
        progressCircle.setAttribute("cy", "60");
        progressCircle.setAttribute("r", "54");
        progressCircle.setAttribute("fill", "none");
        progressCircle.setAttribute("stroke", "var(--b3-theme-primary)");
        progressCircle.setAttribute("stroke-width", "12");
        progressCircle.setAttribute("stroke-linecap", "round");
        progressCircle.setAttribute("transform", "rotate(-90 60 60)");
        progressCircle.style.transition = "stroke-dasharray 0.3s ease";
        this.progressRing = progressCircle;

        // 中间的文本容器
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 1;
        `;

        // 进度文本
        const progressText = document.createElement('div');
        progressText.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            color: var(--b3-theme-on-background);
        `;
        this.progressText = progressText;
        this.updateProgressText();

        // 标题文本
        this.titleElement = document.createElement('div');
        this.titleElement.style.cssText = `
            font-size: 14px;
            color: var(--b3-theme-on-surface);
            margin-top: 4px;
        `;
        this.titleElement.textContent = this.title;

        // 组装SVG
        svg.appendChild(bgCircle);
        svg.appendChild(progressCircle);

        // 组装文本容器
        textContainer.appendChild(progressText);
        textContainer.appendChild(this.titleElement);

        // 将所有元素添加到内容容器
        const svgContainer = document.createElement('div');
        svgContainer.style.cssText = `
            position: relative;
            z-index: 1;
        `;
        svgContainer.appendChild(svg);
        svgContainer.appendChild(textContainer);
        content.appendChild(svgContainer);
        content.appendChild(this.buttonsContainer);

        // 添加到主容器
        this.container.appendChild(content);

        // 添加鼠标悬停效果
        content.addEventListener('mouseenter', () => {
            this.buttonsContainer.style.opacity = '1';
        });
        content.addEventListener('mouseleave', () => {
            this.buttonsContainer.style.opacity = '0';
        });

        // 更新进度环
        this.updateProgress(this.currentValue);
    }

    private createButton(text: string, title: string): HTMLElement {
        const button = document.createElement('div');
        button.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--b3-theme-background);
            color: var(--b3-theme-on-background);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.3s ease;
            border: 1px solid var(--b3-theme-surface-lighter);
            user-select: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;
        button.title = title;
        button.textContent = text;

        // 添加悬停效果
        button.addEventListener('mouseenter', () => {
            button.style.background = 'var(--b3-theme-primary)';
            button.style.color = 'var(--b3-theme-on-primary)';
            button.style.transform = 'scale(1.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'var(--b3-theme-background)';
            button.style.color = 'var(--b3-theme-on-background)';
            button.style.transform = 'scale(1)';
        });

        return button;
    }

    private updateProgressText() {
        this.progressText.textContent = `${this.currentValue}/${this.targetValue}`;
    }

    private updateProgress(value: number) {
        this.currentValue = value;
        const circumference = 2 * Math.PI * 54;
        const progress = value / this.targetValue;
        const dashArray = progress * circumference;
        this.progressRing.style.strokeDasharray = `${dashArray} ${circumference}`;
        this.updateProgressText();
    }

    // 公共方法：设置当前值
    public setCurrentValue(value: number) {
        if (value >= 0 && value <= this.targetValue) {
            this.updateProgress(value);
            this.saveConfig();
        }
    }

    // 公共方法：设置目标值
    public setTarget(value: number) {
        if (value > 0) {
            this.targetValue = value;
            this.updateProgress(this.currentValue);
            this.saveConfig();
        }
    }

    // 公共方法：设置标题
    public setTitle(title: string) {
        this.title = title;
        if (this.titleElement) {
            this.titleElement.textContent = title;
        }
        this.saveConfig();
    }

    // 公共方法：设置是否自动重置
    public setAutoReset(value: boolean) {
        this.autoReset = value;
        this.saveConfig();
    }

    private showSettingsDialog() {
        const dialog = new Dialog({
            title: "习惯设置",
            content: `
                <div class="b3-dialog__content" style="padding: 20px;">
                    <div class="b3-dialog__item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">习惯名称</label>
                        <input class="b3-text-field" type="text" value="${this.title}" style="
                            width: 100%;
                            padding: 8px 12px;
                            border-radius: 6px;
                            border: 1px solid var(--b3-theme-surface-lighter);
                            background: var(--b3-theme-surface);
                            transition: all 0.3s ease;
                        ">
                    </div>
                    <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                        <div class="b3-dialog__item" style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">目标数量</label>
                            <input class="b3-text-field" type="number" min="1" value="${this.targetValue}" style="
                                width: 100%;
                                padding: 8px 12px;
                                border-radius: 6px;
                                border: 1px solid var(--b3-theme-surface-lighter);
                                background: var(--b3-theme-surface);
                                transition: all 0.3s ease;
                            ">
                        </div>
                        <div class="b3-dialog__item" style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">当前进度</label>
                            <input class="b3-text-field" type="number" min="0" value="${this.currentValue}" style="
                                width: 100%;
                                padding: 8px 12px;
                                border-radius: 6px;
                                border: 1px solid var(--b3-theme-surface-lighter);
                                background: var(--b3-theme-surface);
                                transition: all 0.3s ease;
                            ">
                        </div>
                    </div>
                    <div class="b3-dialog__item" style="margin-bottom: 16px;">
                        <label class="fn__flex" style="align-items: center; user-select: none; cursor: pointer;">
                            <input class="b3-switch fn__flex-center" type="checkbox" checked>
                            <span style="margin-left: 8px; color: var(--b3-theme-on-surface);">每天零点重置进度</span>
                        </label>
                    </div>
                </div>
                <div class="b3-dialog__action" style="
                    padding: 16px;
                    border-top: 1px solid var(--b3-theme-surface-lighter);
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                ">
                    <button class="b3-button b3-button--cancel" style="
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 14px;
                    ">取消</button>
                    <button class="b3-button b3-button--text" style="
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 14px;
                        background: var(--b3-theme-primary);
                        color: white;
                    ">保存</button>
                </div>
            `,
            width: "400px",
        });

        // 添加输入框焦点样式
        const inputs = dialog.element.querySelectorAll('.b3-text-field') as NodeListOf<HTMLElement>;
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = 'var(--b3-theme-primary)';
                input.style.boxShadow = '0 0 0 2px var(--b3-theme-primary-lighter)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = 'var(--b3-theme-surface-lighter)';
                input.style.boxShadow = 'none';
            });
        });

        const saveButton = dialog.element.querySelector('.b3-button--text') as HTMLButtonElement;
        const cancelButton = dialog.element.querySelector('.b3-button--cancel') as HTMLButtonElement;

        // 添加按钮悬停效果
        saveButton.addEventListener('mouseover', () => {
            saveButton.style.opacity = '0.9';
        });
        saveButton.addEventListener('mouseout', () => {
            saveButton.style.opacity = '1';
        });

        saveButton.addEventListener("click", () => {
            const titleInput = dialog.element.querySelector('input[type="text"]') as HTMLInputElement;
            const targetInput = dialog.element.querySelector('input[type="number"]:first-of-type') as HTMLInputElement;
            const currentInput = dialog.element.querySelector('input[type="number"]:last-of-type') as HTMLInputElement;
            const resetSwitch = dialog.element.querySelector('.b3-switch') as HTMLInputElement;

            this.setTitle(titleInput.value);
            this.setTarget(parseInt(targetInput.value));
            this.setCurrentValue(parseInt(currentInput.value));
            // TODO: 处理每日重置的逻辑

            dialog.destroy();
        });

        cancelButton.addEventListener("click", () => {
            dialog.destroy();
        });
    }
} 