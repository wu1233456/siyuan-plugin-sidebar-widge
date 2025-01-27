import { putFile, getFile } from "../../api";

export class Memo {
    private container: HTMLElement;
    private storagePath: string = "/data/storage/memo.json";
    private content: string = "";

    constructor(container: HTMLElement) {
        this.container = container;
        this.init();
    }

    private async init() {
        // 创建卡片头部
        const header = document.createElement('div');
        header.style.cssText = `
            background: #FFD700;
            padding: 12px;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            text-align: center;
            font-weight: bold;
            color: #333;
        `;
        header.textContent = '备忘录';

        // 创建输入框容器
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            padding: 12px;
            flex: 1;
            display: flex;
            flex-direction: column;
        `;

        // 创建文本输入框
        const textarea = document.createElement('textarea');
        textarea.style.cssText = `
            width: 100%;
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
        `;

        // 加载保存的内容
        try {
            const savedContent = await getFile(this.storagePath);
            if (savedContent) {
                this.content = savedContent;
                textarea.value = this.content;
            }
        } catch (e) {
            console.log("加载备忘录内容失败");
        }

        // 添加输入事件监听
        let saveTimeout: NodeJS.Timeout;
        textarea.addEventListener('input', (e) => {
            const target = e.target as HTMLTextAreaElement;
            this.content = target.value;
            
            // 防抖：延迟1秒后保存
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveContent();
            }, 1000);
        });

        contentContainer.appendChild(textarea);
        this.container.appendChild(header);
        this.container.appendChild(contentContainer);
    }

    private async saveContent() {
        try {
            await putFile(this.storagePath, false, new Blob([this.content], { type: "text/plain" }));
            console.log("保存备忘录内容成功");
        } catch (e) {
            console.error("保存备忘录内容失败", e);
        }
    }
} 