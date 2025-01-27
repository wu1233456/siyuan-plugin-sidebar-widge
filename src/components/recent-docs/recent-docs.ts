import { getFile } from "../../api";

interface RecentDoc {
    rootID: string;
    icon: string;
    title: string;
}

export class RecentDocs {
    private element: HTMLElement;
    private recentDocs: RecentDoc[] = [];
    private readonly STORAGE_PATH = "/data/storage/recent-doc.json";

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.classList.add('recent-docs');
        this.init();
    }

    private async init() {
        // 创建标题
        const header = document.createElement('div');
        header.className = 'card-header';
        header.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-weight: bold; font-size: 13px;">最近文档</div>
                <div class="card-icon">
                    <svg><use xlink:href="#iconBookmark"></use></svg>
                </div>
            </div>
        `;
        this.element.appendChild(header);

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
            const docItem = document.createElement('a');
            docItem.className = 'doc-item';
            docItem.href = `siyuan://blocks/${doc.rootID}`;
            
            const icon = doc.icon || '#iconBookmark';
            docItem.innerHTML = `
                <div class="doc-icon">
                    <svg><use xlink:href="${icon}"></use></svg>
                </div>
                <div class="doc-title">${doc.title || '未命名文档'}</div>
            `;
            
            content.appendChild(docItem);
        });
    }
} 