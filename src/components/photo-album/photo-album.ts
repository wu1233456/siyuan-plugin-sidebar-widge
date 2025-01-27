import { Dialog } from "siyuan";
import { getFile, putFile } from "../../api";

interface PhotoAlbumConfig {
    photos: string[];
}

export class PhotoAlbum {
    private element: HTMLElement;
    private photos: string[] = [];
    private currentPhotoIndex = 0;
    private autoplayInterval: NodeJS.Timeout | null = null;
    private configPath: string;

    constructor(element: HTMLElement) {
        this.element = element;
        this.configPath = "/data/storage/siyuan-plugin-sidebar-widget/photo-album.json";
        this.init();
        this.loadConfig().then(() => {
            if (this.photos.length > 0) {
                this.renderCurrentPhoto();
                this.startAutoplay();
            }
        });
    }

    private init() {
        this.element.style.height = '200px';
        this.element.innerHTML = `
            <div class="photo-album-container" style="
                position: relative;
                height: 100%;
                overflow: hidden;
                border-radius: 4px;
                cursor: pointer;
            ">
                <div class="photo-display" style="
                    width: 100%;
                    height: 100%;
                    position: relative;
                "></div>
                <div class="photo-title" style="
                    position: absolute;
                    left: 16px;
                    bottom: 16px;
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
                    z-index: 2;
                ">精选照片</div>
                <div class="photo-overlay" style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
                    z-index: 1;
                "></div>
            </div>
        `;

        this.element.addEventListener('click', () => this.showSettingsDialog());
    }

    private startAutoplay() {
        // 先清除可能存在的定时器
        this.stopAutoplay();
        
        // 只有当有多张图片时才启动轮播
        if (this.photos.length > 1) {
            this.autoplayInterval = setInterval(() => {
                this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.photos.length;
                this.renderCurrentPhoto();
            }, 5000);
        }
    }

    private stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    private async loadConfig() {
        try {
            const config = await getFile(this.configPath);
            if (config) {
                this.photos = config.photos || [];
            }
            console.log("加载相册配置成功", this.photos);
        } catch (e) {
            console.log("加载相册配置失败，使用默认配置");
        }
    }

    private async saveConfig() {
        const config: PhotoAlbumConfig = {
            photos: this.photos
        };
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(config)], { type: "application/json" }));
            console.log("保存相册配置成功");
        } catch (e) {
            console.error("保存相册配置失败", e);
        }
    }

    private renderCurrentPhoto() {
        const photoDisplay = this.element.querySelector('.photo-display');
        if (!photoDisplay || this.photos.length === 0) return;

        const currentPhoto = this.photos[this.currentPhotoIndex];
        const nextPhoto = this.photos[(this.currentPhotoIndex + 1) % this.photos.length];

        // 预加载下一张图片
        if (nextPhoto) {
            const preloadImg = new Image();
            preloadImg.src = nextPhoto;
        }

        // 创建新图片元素
        const newImg = document.createElement('img');
        newImg.src = currentPhoto;
        // 禁止拖动
        newImg.draggable = false;
        newImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            transition: opacity 0.5s ease;
            user-select: none;
            -webkit-user-drag: none;
        `;

        // 清除旧图片
        const oldImg = photoDisplay.querySelector('img');
        if (oldImg) {
            oldImg.style.opacity = '0';
            setTimeout(() => oldImg.remove(), 500);
        }

        // 添加新图片
        photoDisplay.appendChild(newImg);
        // 强制重排后显示新图片
        setTimeout(() => {
            newImg.style.opacity = '1';
        }, 50);
    }

    private showSettingsDialog() {
        const dialog = new Dialog({
            title: "相册设置",
            content: `
                <div style="padding: 16px;">
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                            <input type="text" class="photo-url-input" placeholder="输入图片URL" style="
                                flex: 1;
                                padding: 8px;
                                border: 1px solid var(--b3-theme-surface-lighter);
                                border-radius: 4px;
                            ">
                            <button class="add-photo-btn" style="
                                padding: 8px 16px;
                                background: var(--b3-theme-primary);
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                            ">添加</button>
                        </div>
                    </div>
                    <div class="photos-list" style="
                        max-height: 300px;
                        overflow-y: auto;
                    ">
                        ${this.photos.map((url, index) => `
                            <div class="photo-item" style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                padding: 8px;
                                border: 1px solid var(--b3-theme-surface-lighter);
                                border-radius: 4px;
                                margin-bottom: 8px;
                            ">
                                <img src="${url}" style="
                                    width: 60px;
                                    height: 60px;
                                    object-fit: cover;
                                    border-radius: 4px;
                                ">
                                <div style="flex: 1; word-break: break-all;">${url}</div>
                                <button class="delete-photo-btn" data-index="${index}" style="
                                    padding: 4px 8px;
                                    background: var(--b3-theme-error);
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                ">删除</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            width: "600px"
        });

        const input = dialog.element.querySelector('.photo-url-input') as HTMLInputElement;
        const addButton = dialog.element.querySelector('.add-photo-btn');
        const deleteButtons = dialog.element.querySelectorAll('.delete-photo-btn');

        if (addButton && input) {
            addButton.addEventListener('click', async () => {
                const url = input.value.trim();
                if (url) {
                    this.photos.push(url);
                    await this.saveConfig();
                    dialog.destroy();
                    this.showSettingsDialog();
                    this.renderCurrentPhoto();
                }
            });
        }

        deleteButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const index = parseInt((button as HTMLElement).dataset.index || '0');
                this.photos.splice(index, 1);
                await this.saveConfig();
                if (this.currentPhotoIndex >= this.photos.length) {
                    this.currentPhotoIndex = Math.max(0, this.photos.length - 1);
                }
                dialog.destroy();
                this.showSettingsDialog();
                this.renderCurrentPhoto();
            });
        });

        // 停止自动轮播
        this.stopAutoplay();

        // 当对话框关闭时重新启动自动轮播
        dialog.element.addEventListener('close', () => {
            this.startAutoplay();
        });
    }
} 