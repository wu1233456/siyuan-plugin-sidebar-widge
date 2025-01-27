import { Dialog } from "siyuan";
import { getFile, putFile } from "../../api";

interface BookmarkConfig {
    bookmarks: { title: string; url: string }[];
}

export class Bookmark {
    private element: HTMLElement;
    private bookmarks: { title: string; url: string }[] = [];
    private configPath: string;

    constructor(element: HTMLElement) {
        this.element = element;
        this.configPath = "/data/storage/siyuan-plugin-sidebar-widget/bookmark.json";
        this.init();
        this.loadConfig().then(() => {
            this.renderBookmarks();
        });
    }

    private init() {
        this.element.innerHTML = `
            <div class="bookmark-container" style="padding: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; font-size: 13px;">收藏</div>
                    <div class="bookmark-add-btn" style="cursor: pointer;">
                        <svg class="bookmark-add-icon" viewBox="0 0 24 24" width="14" height="14">
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </div>
                </div>
                <div class="bookmark-list" style="
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                "></div>
            </div>
        `;

        const addBtn = this.element.querySelector('.bookmark-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddDialog());
        }

        this.renderBookmarks();
    }

    private async loadConfig() {
        try {
            const config = await getFile(this.configPath);
            if (config) {
                this.bookmarks = config.bookmarks || [];
            }
            console.log("加载收藏配置成功");
        } catch (e) {
            console.log("加载收藏配置失败，使用默认配置");
            this.bookmarks = [];
        }
    }

    private async saveConfig() {
        const config: BookmarkConfig = {
            bookmarks: this.bookmarks || []
        };
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(config)], { type: "application/json" }));
            console.log("保存收藏配置成功");
        } catch (e) {
            console.error("保存收藏配置失败", e);
        }
    }

    private showAddDialog() {
        const dialog = new Dialog({
            title: "添加收藏",
            content: `
                <div class="b3-dialog__content" style="padding: 16px;">
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 12px; color: var(--b3-theme-on-surface); opacity: 0.8; margin-bottom: 6px;">标题</div>
                        <input 
                            class="b3-text-field" 
                            placeholder="输入收藏标题" 
                            id="bookmark-title"
                            style="
                                width: calc(100% - 24px);
                                padding: 8px 12px;
                                border-radius: 6px;
                                font-size: 13px;
                                background: var(--b3-theme-surface);
                            "
                        />
                    </div>
                    <div style="margin-bottom: 24px;">
                        <div style="font-size: 12px; color: var(--b3-theme-on-surface); opacity: 0.8; margin-bottom: 6px;">链接</div>
                        <input 
                            class="b3-text-field" 
                            placeholder="输入网址" 
                            id="bookmark-url"
                            style="
                                width: calc(100% - 24px);
                                padding: 8px 12px;
                                border-radius: 6px;
                                font-size: 13px;
                                background: var(--b3-theme-surface);
                            "
                        />
                    </div>
                    <div class="b3-dialog__action" style="margin: 0; padding: 0;">
                        <button 
                            class="b3-button b3-button--cancel" 
                            style="
                                font-size: 13px;
                                padding: 6px 16px;
                                border-radius: 4px;
                            "
                        >取消</button>
                        <button 
                            class="b3-button b3-button--text" 
                            style="
                                font-size: 13px;
                                padding: 6px 16px;
                                border-radius: 4px;
                                margin-left: 8px;
                                font-weight: 500;
                            "
                        >添加</button>
                    </div>
                </div>
            `,
            width: "360px",
        });

        const titleInput = dialog.element.querySelector('#bookmark-title') as HTMLInputElement;
        const urlInput = dialog.element.querySelector('#bookmark-url') as HTMLInputElement;
        
        // 自动聚焦到标题输入框
        setTimeout(() => titleInput?.focus(), 100);

        // 回车键提交
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const title = titleInput.value.trim();
                const url = urlInput.value.trim();
                if (title && url) {
                    this.addBookmark(title, url);
                    dialog.destroy();
                }
            }
        };

        titleInput?.addEventListener('keyup', handleEnter);
        urlInput?.addEventListener('keyup', handleEnter);
        
        dialog.element.querySelector('.b3-button--cancel')?.addEventListener('click', () => {
            dialog.destroy();
        });

        dialog.element.querySelector('.b3-button--text')?.addEventListener('click', () => {
            const title = titleInput.value.trim();
            const url = urlInput.value.trim();
            
            if (title && url) {
                this.addBookmark(title, url);
                dialog.destroy();
            }
        });
    }

    private addBookmark(title: string, url: string) {
        this.bookmarks.push({ title, url });
        this.saveConfig();
        this.renderBookmarks();
    }

    private getHostname(url: string): string {
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace(/^www\./, '');
        } catch {
            return url;
        }
    }

    private getFaviconUrl(url: string): string {
        try {
            const hostname = new URL(url).origin;
            return `${hostname}/favicon.ico`;
        } catch {
            return '';
        }
    }

    private renderBookmarks() {
        const bookmarkList = this.element.querySelector('.bookmark-list');
        if (!bookmarkList) return;

        bookmarkList.innerHTML = '';
        
        this.bookmarks.forEach((bookmark, index) => {
            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'bookmark-item';
            bookmarkItem.style.cssText = `
                position: relative;
                cursor: pointer;
                padding: 2px 6px;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
                border-radius: 4px;
            `;

            // 添加悬停效果
            bookmarkItem.addEventListener('mouseover', () => {
                bookmarkItem.style.background = 'var(--b3-theme-surface-lighter)';
            });

            bookmarkItem.addEventListener('mouseout', () => {
                bookmarkItem.style.background = 'transparent';
            });

            // 添加文档图标
            const docIcon = document.createElement('div');
            docIcon.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
            `;
            docIcon.style.cssText = `
                color: var(--b3-theme-on-surface);
                opacity: 0.6;
                flex-shrink: 0;
                display: flex;
                align-items: center;
            `;

            const title = document.createElement('div');
            title.textContent = bookmark.title;
            title.style.cssText = `
                font-size: 12px;
                line-height: 1.2;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
                min-width: 0;
            `;

            const deleteButton = document.createElement('div');
            deleteButton.innerHTML = '×';
            deleteButton.style.cssText = `
                color: var(--b3-theme-on-surface);
                opacity: 0;
                transition: opacity 0.2s;
                margin-left: auto;
                flex-shrink: 0;
                font-size: 14px;
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            `;

            bookmarkItem.addEventListener('mouseover', () => {
                deleteButton.style.opacity = '1';
            });

            bookmarkItem.addEventListener('mouseout', () => {
                deleteButton.style.opacity = '0';
            });

            bookmarkItem.addEventListener('click', (e) => {
                if (e.target !== deleteButton) {
                    window.open(bookmark.url, '_blank');
                }
            });

            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.bookmarks.splice(index, 1);
                this.saveConfig();
                this.renderBookmarks();
            });

            bookmarkItem.appendChild(docIcon);
            bookmarkItem.appendChild(title);
            bookmarkItem.appendChild(deleteButton);
            bookmarkList.appendChild(bookmarkItem);
        });
    }
} 