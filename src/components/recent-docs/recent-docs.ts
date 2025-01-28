import { getFile } from "../../api";
import { openTab, openMobileFileById, getFrontend } from 'siyuan';

interface RecentDoc {
    rootID: string;
    icon: string;
    title: string;
}

export class RecentDocs {
    private element: HTMLElement;
    private recentDocs: RecentDoc[] = [];
    private readonly STORAGE_PATH = "/data/storage/recent-doc.json";
    private isMobile: boolean;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.classList.add('recent-docs');
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        this.init();
    }

    private async init() {
        // 创建标题
        const header = document.createElement('div');
        header.className = 'card-header';
        header.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-weight: bold; font-size: 13px;">最近文档</div>
                <div class="refresh-button" title="刷新">
                    <svg><use xlink:href="#iconRefresh"></use></svg>
                </div>
            </div>
        `;
        this.element.appendChild(header);

        // 添加刷新按钮点击事件
        const refreshButton = header.querySelector('.refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                await this.loadRecentDocs();
                this.render();
            });
        }

        // 创建内容容器
        const content = document.createElement('div');
        content.className = 'card-content';
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 2px 8px;
        `;
        this.element.appendChild(content);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .recent-docs {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .recent-docs .card-header {
                padding: 8px;
            }
            .recent-docs .refresh-button {
                color: var(--b3-theme-on-surface);
                opacity: 0.6;
                cursor: pointer;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            .recent-docs .refresh-button:hover {
                opacity: 1;
                background-color: var(--b3-theme-surface-lighter);
            }
            .recent-docs .refresh-button svg {
                width: 14px;
                height: 14px;
                fill: currentColor;
            }
            .recent-docs .card-icon {
                color: var(--b3-theme-on-surface);
                opacity: 0.6;
            }
            .recent-docs .card-icon svg {
                width: 14px;
                height: 14px;
                fill: currentColor;
            }
            .recent-docs .doc-item {
                position: relative;
                cursor: pointer;
                padding: 2px 6px;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
                border-radius: 4px;
                text-decoration: none;
                color: var(--b3-theme-on-surface);
            }
            .recent-docs .doc-item:hover {
                background: var(--b3-theme-surface-lighter);
            }
            .recent-docs .doc-icon {
                color: var(--b3-theme-on-surface);
                opacity: 0.6;
                flex-shrink: 0;
                display: flex;
                align-items: center;
            }
            .recent-docs .doc-icon svg {
                width: 14px;
                height: 14px;
                fill: currentColor;
            }
            .recent-docs .doc-title {
                font-size: 12px;
                line-height: 1.2;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
                min-width: 0;
            }
        `;
        this.element.appendChild(style);

        // 加载数据
        await this.loadRecentDocs();
        this.render();

        // 每分钟更新一次
        setInterval(() => {
            this.loadRecentDocs();
            this.render();
        }, 60000);
    }

    private async loadRecentDocs() {
        try {
            const data = await getFile(this.STORAGE_PATH);
            if (Array.isArray(data)) {
                this.recentDocs = data;
            }
        } catch (error) {
            console.error('Failed to load recent docs:', error);
        }
    }

    private async openDoc(docId: string) {
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
    }

    private render() {
        const content = this.element.querySelector('.card-content');
        if (!content) return;

        content.innerHTML = '';
        
        if (this.recentDocs.length === 0) {
            content.innerHTML = '<div style="padding: 8px; color: var(--b3-theme-on-surface-light);">暂无最近文档</div>';
            return;
        }

        // 只显示前5条记录
        this.recentDocs.slice(0, 5).forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'doc-item';
            docItem.addEventListener('click', () => this.openDoc(doc.rootID));
            
            docItem.innerHTML = `
                <div class="doc-icon">
                    <svg><use xlink:href="#iconFile"></use></svg>
                </div>
                <div class="doc-title">${doc.title || '未命名文档'}</div>
            `;
            
            content.appendChild(docItem);
        });
    }
} 