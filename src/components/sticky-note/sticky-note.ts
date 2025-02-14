import { getFile, putFile } from "../../api";

interface StickyNoteConfig {
    id: string;
    content: string;
    backgroundColor: string;
    textColor: string;
}

export class StickyNote {
    private container: HTMLElement;
    private content: string;
    private backgroundColor: string;
    private textColor: string;
    private configPath: string = "/data/storage/siyuan-plugin-sidebar-widget/sticky-notes-config.json";
    private id: string;
    private static configs: { [key: string]: StickyNoteConfig } = {};
    private static configsLoaded: boolean = false;

    constructor(container: HTMLElement, id?: string) {
        console.log("sticky-note constructor", id);
        this.container = container;
        this.id = id;
        this.content = '点击编辑内容';
        this.backgroundColor = '#FFE4B5';
        this.textColor = '#f3b670';
        
        this.loadConfig().then(() => {
            this.render();
            this.bindEvents();
        });
    }

    private async loadAllConfigs() {
        if (StickyNote.configsLoaded) return;
        
        try {
            const configs = await getFile(this.configPath);
            if (configs) {
                StickyNote.configs = configs;
            }
            console.log("加载所有便利贴配置成功", StickyNote.configs);
            StickyNote.configsLoaded = true;
            console.log("加载所有便利贴配置成功");
        } catch (e) {
            console.log("加载便利贴配置失败，使用默认配置");
            StickyNote.configs = {};
            StickyNote.configsLoaded = true;
        }
    }

    private async loadConfig() {
        await this.loadAllConfigs();
        const config = StickyNote.configs[this.id];
        if (config) {
            this.content = config.content || '贴纸';
            this.backgroundColor = config.backgroundColor;
            this.textColor = config.textColor;
        }
    }

    private async saveConfig() {
        StickyNote.configs[this.id] = {
            id: this.id,
            content: this.content,
            backgroundColor: this.backgroundColor,
            textColor: this.textColor
        };
        
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(StickyNote.configs)], { type: "application/json" }));
            console.log("保存便利贴配置成功");
        } catch (e) {
            console.error("保存便利贴配置失败", e);
        }
    }

    private render() {
        this.container.innerHTML = `
            <div class="sticky-note" style="
                padding: 16px;
                height: 100%;
                background-color: ${this.backgroundColor};
                color: ${this.textColor};
                font-size: 36px;
                font-weight: bold;
                line-height: 1.5;
                border-radius: 8px;
                position: relative;
                cursor: text;
                min-height: 100px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            ">
                <div class="sticky-note-content" style="
                    white-space: pre-wrap;
                    word-break: break-word;
                    text-align: center;
                    width: 100%;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">${this.content}</div>
                <div class="sticky-note-toolbar" style="
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 20px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 2;
                ">
                    <div class="color-button" style="
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
                    ">↺</div>
                </div>
            </div>
        `;
    }

    private bindEvents() {
        const noteEl = this.container.querySelector('.sticky-note') as HTMLDivElement;
        const contentEl = this.container.querySelector('.sticky-note-content') as HTMLDivElement;
        const toolbarEl = this.container.querySelector('.sticky-note-toolbar') as HTMLDivElement;
        const colorBtn = this.container.querySelector('.color-button') as HTMLDivElement;

        if (!noteEl || !contentEl || !toolbarEl || !colorBtn) return;

        // 显示/隐藏工具栏
        noteEl.addEventListener('mouseenter', () => {
            toolbarEl.style.opacity = '1';
        });

        noteEl.addEventListener('mouseleave', () => {
            toolbarEl.style.opacity = '0';
        });

        // 编辑内容
        contentEl.addEventListener('click', () => {
            contentEl.setAttribute('contenteditable', 'true');
            contentEl.focus();
        });

        contentEl.addEventListener('blur', () => {
            contentEl.setAttribute('contenteditable', 'false');
            this.content = contentEl.innerHTML;
            this.saveConfig();
        });

        // 颜色配置：[背景色, 文字色]
        const colorPairs = [
            ['#d25447', '#f3b670'], 
            ['#367e8b', '#e8df80'], // 浅粉色背景，深棕色文字
            ['#f8f7f4', '#b99588'], // 浅绿色背景，深绿色文字
            ['#646cd1', '#faf3e4'], // 浅蓝色背景，深蓝色文字
            ['#eee5d6', '#d87d5f'], // 浅紫色背景，深紫色文字
            ['#2f364f', '#d05f4f'], // 浅绿色背景，深绿色文字
        ];

        // 添加按钮悬停效果
        colorBtn.addEventListener('mouseenter', () => {
            colorBtn.style.background = 'var(--b3-theme-primary)';
            colorBtn.style.color = 'var(--b3-theme-on-primary)';
            colorBtn.style.transform = 'scale(1.1)';
        });

        colorBtn.addEventListener('mouseleave', () => {
            colorBtn.style.background = 'var(--b3-theme-background)';
            colorBtn.style.color = 'var(--b3-theme-on-background)';
            colorBtn.style.transform = 'scale(1)';
        });

        colorBtn.addEventListener('click', () => {
            const currentIndex = colorPairs.findIndex(pair => pair[0] === this.backgroundColor);
            const nextIndex = (currentIndex + 1) % colorPairs.length;
            this.backgroundColor = colorPairs[nextIndex][0];
            this.textColor = colorPairs[nextIndex][1];
            noteEl.style.backgroundColor = this.backgroundColor;
            noteEl.style.color = this.textColor;
            this.saveConfig();
        });
    }
} 