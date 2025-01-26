import { Dialog } from "siyuan";

export class Bookmark {
    private element: HTMLElement;
    private bookmarks: { title: string; url: string }[] = [];

    constructor(element: HTMLElement) {
        this.element = element;
        this.init();
        this.loadBookmarks();
    }

    private init() {
        this.element.innerHTML = `
            <div class="bookmark-container" style="padding: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; font-size: 13px;">收藏</div>
                    <div class="bookmark-add-btn" style="cursor: pointer;">
                        <svg class="bookmark-add-icon" viewBox="0 0 24 24" width="14" height="14">
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </div>
                </div>
                <div class="bookmark-list" style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                "></div>
            </div>
        `;

        const addBtn = this.element.querySelector('.bookmark-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddDialog());
        }

        this.renderBookmarks();
    }

    private showAddDialog() {
        const dialog = new Dialog({
            title: "添加收藏",
            content: `
                <div class="b3-dialog__content">
                    <input class="b3-text-field" placeholder="标题" id="bookmark-title"/>
                    <input class="b3-text-field" placeholder="URL" id="bookmark-url" style="margin-top: 8px;"/>
                </div>
                <div class="b3-dialog__action">
                    <button class="b3-button b3-button--cancel">取消</button>
                    <button class="b3-button b3-button--text">添加</button>
                </div>
            `,
        });

        const titleInput = dialog.element.querySelector('#bookmark-title') as HTMLInputElement;
        const urlInput = dialog.element.querySelector('#bookmark-url') as HTMLInputElement;
        
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
        this.saveBookmarks();
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
                background: var(--b3-theme-background);
                border: 1px solid var(--b3-theme-surface-lighter);
                border-radius: 8px;
                position: relative;
                aspect-ratio: 1;
                cursor: pointer;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            `;

            // 添加悬停效果
            bookmarkItem.addEventListener('mouseover', () => {
                bookmarkItem.style.transform = 'translateY(-2px)';
                bookmarkItem.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            });

            bookmarkItem.addEventListener('mouseout', () => {
                bookmarkItem.style.transform = 'translateY(0)';
                bookmarkItem.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            });

            const content = document.createElement('div');
            content.style.cssText = `
                display: flex;
                flex-direction: column;
                height: 100%;
                padding: 12px;
            `;

            const title = document.createElement('div');
            title.textContent = bookmark.title;
            title.style.cssText = `
                font-weight: 500;
                font-size: 12px;
                line-height: 1.4;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                margin-bottom: auto;
            `;

            const urlBar = document.createElement('div');
            urlBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.06);
                padding: 8px 12px;
                backdrop-filter: blur(4px);
            `;

            const urlContainer = document.createElement('div');
            urlContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 4px;
            `;

            const favicon = document.createElement('img');
            favicon.src = this.getFaviconUrl(bookmark.url);
            favicon.style.cssText = `
                width: 16px;
                height: 16px;
                border-radius: 4px;
                flex-shrink: 0;
            `;
            favicon.onerror = () => {
                favicon.style.display = 'none';
            };

            const urlText = document.createElement('span');
            urlText.textContent = this.getHostname(bookmark.url);
            urlText.style.cssText = `
                color: var(--b3-theme-on-surface);
                font-size: 11px;
                opacity: 0.8;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '×';
            deleteButton.className = 'b3-button b3-button--outline';
            deleteButton.style.cssText = `
                position: absolute;
                top: 4px;
                right: 4px;
                padding: 2px 6px;
                min-width: auto;
                font-size: 12px;
                line-height: 1;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 1;
                background: var(--b3-theme-background);
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
                this.saveBookmarks();
                this.renderBookmarks();
            });

            urlContainer.appendChild(favicon);
            urlContainer.appendChild(urlText);
            urlBar.appendChild(urlContainer);
            content.appendChild(title);
            bookmarkItem.appendChild(content);
            bookmarkItem.appendChild(urlBar);
            bookmarkItem.appendChild(deleteButton);
            bookmarkList.appendChild(bookmarkItem);
        });
    }

    private saveBookmarks() {
        localStorage.setItem('siyuan-bookmark-data', JSON.stringify(this.bookmarks));
    }

    private loadBookmarks() {
        const savedData = localStorage.getItem('siyuan-bookmark-data');
        if (savedData) {
            this.bookmarks = JSON.parse(savedData);
            this.renderBookmarks();
        }
    }
} 