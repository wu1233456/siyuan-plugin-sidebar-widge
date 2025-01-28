import { Dialog, Menu } from "siyuan";
import { lsNotebooks, createDocWithMd } from "../../api";
import { openTab, openMobileFileById, getFrontend } from 'siyuan';

interface Notebook {
    id: string;
    name: string;
    icon: string;
    sort: number;
    closed: boolean;
}

export class QuickNote {
    private element: HTMLElement;
    private notebooks: Notebook[] = [];
    private selectedNotebook: Notebook | null = null;
    private isMobile: boolean;
    private notebookText: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        // 设置最外层元素的样式
        this.element.style.cssText = `
            background: var(--b3-theme-background);
            border-radius: 16px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            margin: 4px;
            transition: all 0.3s ease;
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
        `;

        // 添加最外层元素的悬停效果
        this.element.addEventListener('mouseover', () => {
            this.element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });

        this.element.addEventListener('mouseout', () => {
            this.element.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        });

        this.init();
    }

    private async init() {
        // 创建容器
        const container = document.createElement('div');
        container.className = 'quick-note';
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            padding: 16px;
            cursor: pointer;
            flex: 1;
            min-width: 0;
        `;

        // 创建主要内容区域
        const contentArea = document.createElement('div');
        contentArea.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            min-width: 0;
        `;

        // 创建标题文本
        const title = document.createElement('div');
        title.textContent = "New Note?";
        title.style.cssText = `
            font-size: 16px;
            color: var(--b3-theme-on-surface);
            opacity: 0.8;
            margin-bottom: 4px;
        `;
        contentArea.appendChild(title);

        // 创建副标题文本
        const subtitle = document.createElement('div');
        subtitle.textContent = '新建笔记文档...';
        subtitle.style.cssText = `
            font-size: 14px;
            color: var(--b3-theme-on-surface);
            opacity: 0.6;
            margin-bottom: 8px;
        `;
        contentArea.appendChild(subtitle);

        // 添加点赞图标
        const thumbsUp = document.createElement('div');
        thumbsUp.innerHTML = '✍';
        thumbsUp.style.cssText = `
            font-size: 16px;
            margin-bottom: 12px;
        `;
        contentArea.appendChild(thumbsUp);

        // 创建底部信息区域
        const bottomInfo = document.createElement('div');
        bottomInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        `;

        // 添加绿色指示条
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            width: 3px;
            height: 16px;
            background-color: #10B981;
            border-radius: 2px;
        `;
        bottomInfo.appendChild(indicator);

        // 添加笔记本名称
        this.notebookText = document.createElement('div');
        this.notebookText.style.cssText = `
            font-size: 12px;
            color: var(--b3-theme-on-surface);
            opacity: 0.6;
            transition: opacity 0.2s ease;
        `;
        bottomInfo.appendChild(this.notebookText);

        // 添加底部区域的点击事件
        bottomInfo.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发容器的点击事件
            this.showNotebookSelector();
        });

        // 添加底部区域的悬停效果
        bottomInfo.addEventListener('mouseover', () => {
            this.notebookText.style.opacity = '1';
        });

        bottomInfo.addEventListener('mouseout', () => {
            this.notebookText.style.opacity = '0.6';
        });

        contentArea.appendChild(bottomInfo);
        container.appendChild(contentArea);

        // 添加整个容器的点击事件
        container.addEventListener('click', () => this.createNote());

        this.element.appendChild(container);

        // 加载笔记本列表并设置默认值
        await this.loadNotebooks();
        if (this.notebooks.length > 0) {
            this.selectedNotebook = this.notebooks[0];
            this.notebookText.textContent = this.selectedNotebook.name;
        }
    }

    private async loadNotebooks() {
        try {
            const response = await lsNotebooks();
            if (response.notebooks) {
                this.notebooks = response.notebooks;
            }
        } catch (error) {
            console.error('Failed to load notebooks:', error);
        }
    }

    private showNotebookSelector() {
        const dialog = new Dialog({
            title: "选择笔记本",
            content: `<div class="notebook-selector">
                <style>
                    .notebook-selector {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        padding: 16px;
                    }
                    .notebook-option {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .notebook-option:hover {
                        background: var(--b3-theme-surface-light);
                    }
                    .notebook-option.selected {
                        background: var(--b3-theme-primary-light);
                    }
                    .notebook-icon {
                        width: 16px;
                        height: 16px;
                        opacity: 0.6;
                    }
                    .notebook-name {
                        font-size: 14px;
                        color: var(--b3-theme-on-surface);
                    }
                </style>
                ${this.notebooks.map(notebook => `
                    <div class="notebook-option ${notebook.id === this.selectedNotebook?.id ? 'selected' : ''}" data-id="${notebook.id}">
                        <svg class="notebook-icon"><use xlink:href="#iconFile"></use></svg>
                        <span class="notebook-name">${notebook.name}</span>
                    </div>
                `).join('')}
            </div>`,
            width: "300px",
        });

        // 添加点击事件
        const options = dialog.element.querySelectorAll('.notebook-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const id = option.getAttribute('data-id');
                const notebook = this.notebooks.find(n => n.id === id);
                if (notebook) {
                    this.selectedNotebook = notebook;
                    this.notebookText.textContent = notebook.name;
                    dialog.destroy();
                }
            });
        });
    }

    private async createNote() {
        if (!this.selectedNotebook) {
            return;
        }

        try {
            // 使用当前时间作为文件名
            const now = new Date();
            const timestamp = now.getTime();
            const path = `/快速笔记/${timestamp}.md`;
            
            // 创建空文档
            const docId = await createDocWithMd(this.selectedNotebook.id, path, '');
            
            // 打开新创建的文档
            if (this.isMobile) {
                openMobileFileById(window.siyuan.ws.app, docId, ['cb-get-all']);
            } else {
                openTab({
                    app: window.siyuan.ws.app,
                    doc: {
                        id: docId,
                        zoomIn: false
                    }
                });
            }
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    }
} 