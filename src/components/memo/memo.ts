import { Dialog, Menu } from "siyuan";
import { putFile, getFile } from "../../api";

interface MemoConfig {
    id: string;
    title: string;
    content: string;
    color: string;
}

export class Memo {
    private container: HTMLElement;
    private configPath: string = "/data/storage/siyuan-plugin-sidebar-widget/memos-config.json";
    private content: string = "";
    private title: string = "备忘录";
    private color: string = "#FFD700";
    private id: string;
    private static configs: { [key: string]: MemoConfig } = {};
    private static configsLoaded: boolean = false;
    private titleElement: HTMLElement;
    private headerElement: HTMLElement;

    constructor(container: HTMLElement, id?: string) {
        this.container = container;
        this.id = id || `memo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.loadConfig().then(() => {
            this.init();
        });
    }

    private async loadAllConfigs() {
        if (Memo.configsLoaded) return;
        
        try {
            const configs = await getFile(this.configPath);
            if (configs) {
                Memo.configs = configs;
            }
            console.log("加载所有备忘录配置成功", Memo.configs);
            Memo.configsLoaded = true;
        } catch (e) {
            console.log("加载备忘录配置失败，使用默认配置");
            Memo.configs = {};
            Memo.configsLoaded = true;
        }
    }

    private async loadConfig() {
        await this.loadAllConfigs();
        const config = Memo.configs[this.id];
        if (config) {
            this.title = config.title;
            this.content = config.content;
            this.color = config.color || "#FFD700";
        }
    }

    private async saveConfig() {
        Memo.configs[this.id] = {
            id: this.id,
            title: this.title,
            content: this.content,
            color: this.color
        };
        
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(Memo.configs)], { type: "application/json" }));
            console.log("保存备忘录配置成功");
        } catch (e) {
            console.error("保存备忘录配置失败", e);
        }
    }

    private showSettingsDialog() {
        const dialog = new Dialog({
            title: "备忘录设置",
            content: `
                <div class="b3-dialog__content" style="padding: 20px;">
                    <div class="b3-dialog__item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">标题</label>
                        <input class="b3-text-field" type="text" value="${this.title}" style="
                            width: 100%;
                            padding: 8px 12px;
                            border-radius: 6px;
                            border: 1px solid var(--b3-theme-surface-lighter);
                            background: var(--b3-theme-surface);
                            transition: all 0.3s ease;
                        ">
                    </div>
                    <div class="b3-dialog__item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">颜色</label>
                        <input type="color" value="${this.color}" style="
                            width: 100%;
                            height: 40px;
                            padding: 4px;
                            border-radius: 6px;
                            border: 1px solid var(--b3-theme-surface-lighter);
                            background: var(--b3-theme-surface);
                            cursor: pointer;
                        ">
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

        const saveButton = dialog.element.querySelector('.b3-button--text') as HTMLButtonElement;
        const cancelButton = dialog.element.querySelector('.b3-button--cancel') as HTMLButtonElement;

        saveButton.addEventListener("click", async () => {
            const titleInput = dialog.element.querySelector('input[type="text"]') as HTMLInputElement;
            const colorInput = dialog.element.querySelector('input[type="color"]') as HTMLInputElement;
            this.title = titleInput.value;
            this.color = colorInput.value;
            this.titleElement.textContent = this.title;
            this.headerElement.style.background = this.color;
            await this.saveConfig();
            dialog.destroy();
        });

        cancelButton.addEventListener("click", () => {
            dialog.destroy();
        });
    }

    private async init() {
        // 创建卡片头部
        this.headerElement = document.createElement('div');
        this.headerElement.style.cssText = `
            background: ${this.color};
            padding: 12px;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            text-align: center;
            font-weight: bold;
            color: #FFFFFF;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        this.titleElement = document.createElement('span');
        this.titleElement.textContent = this.title;
        this.headerElement.appendChild(this.titleElement);

        // 添加点击事件
        this.headerElement.addEventListener('click', () => this.showSettingsDialog());

        // 创建输入框容器
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            padding: 12px;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        // 创建文本输入框
        const textarea = document.createElement('textarea');
        textarea.style.cssText = `
            width: 90%;
            height: 150px;
            padding: 8px;
            border: none;
            border-radius: 4px;
            resize: none;
            background: transparent;
            color: var(--b3-theme-on-background);
            font-size: 14px;
            line-height: 1.5;
            outline: none;
            margin: 0 auto;
        `;

        textarea.value = this.content;

        // 添加输入事件监听
        let saveTimeout: NodeJS.Timeout;
        textarea.addEventListener('input', (e) => {
            const target = e.target as HTMLTextAreaElement;
            this.content = target.value;
            
            // 防抖：延迟1秒后保存
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveConfig();
            }, 1000);
        });

        contentContainer.appendChild(textarea);
        this.container.appendChild(this.headerElement);
        this.container.appendChild(contentContainer);
    }
} 