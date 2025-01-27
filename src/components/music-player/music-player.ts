import { getFile, putFile } from "../../api";
import { showMessage, Dialog } from "siyuan";

interface Song {
    title: string;
    artist: string;
    url: string;
}

export class MusicPlayer {
    private container: HTMLElement;
    private audio: HTMLAudioElement;
    private playlist: Song[] = [];
    private currentSongIndex: number = 0;
    private isPlaying: boolean = false;
    private isLoopMode: boolean = true;
    private storagePath: string = "/data/storage/siyuan-plugin-sidebar-widget/music-player.json";
    private songTitleElement: HTMLDivElement;
    private songArtistElement: HTMLDivElement;
    private playButtonElement: HTMLButtonElement;
    private loopButtonElement: HTMLButtonElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.audio = new Audio();
        this.init();
        this.loadPlaylist();
    }

    private async init() {
        // 设置卡片样式
        this.container.style.cssText = `
            padding: 16px;
            display: flex;
            flex-direction: column;
            height: 120px;
            width: 100%;
            background: #e8e8e8;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            box-sizing: border-box;
            box-shadow: 6px 6px 12px #c5c5c5, -6px -6px 12px #ffffff;
            border: 1px solid #e8e8e8;
            transition: all 0.3s;
            cursor: pointer;
        `;

        // 添加点击事件
        this.container.addEventListener('click', (e) => {
            // 如果点击的是控制按钮或其子元素，不触发设置弹窗
            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('svg') || (e.target as HTMLElement).closest('use')) {
                return;
            }
            this.showPlaylistDialog();
        });

        // 创建音乐信息区域
        const musicInfo = document.createElement('div');
        musicInfo.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-bottom: 12px;
            width: 100%;
        `;

        const songTitle = document.createElement('div');
        songTitle.style.cssText = `
            font-size: 16px;
            font-weight: 500;
            color: #090909;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
            padding: 4px 0;
            width: 100%;
        `;
        songTitle.textContent = '未知歌曲';

        const songArtist = document.createElement('div');
        songArtist.style.cssText = `
            font-size: 14px;
            color: #666666;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
            padding: 2px 0;
            width: 100%;
        `;
        songArtist.textContent = '未知歌手';

        musicInfo.appendChild(songTitle);
        musicInfo.appendChild(songArtist);

        // 创建播放器控件
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 24px;
            margin-top: auto;
            padding: 4px 0;
            width: 100%;
        `;

        // 创建循环按钮
        const loopButton = this.createControlButton('iconRefresh', '循环播放');
        this.loopButtonElement = loopButton;
        loopButton.addEventListener('click', () => this.togglePlayMode());
        const prevButton = this.createControlButton('iconLeft', '上一首');
        const playButton = this.createControlButton('iconPlay', '播放');
        const nextButton = this.createControlButton('iconRight', '下一首');

        prevButton.addEventListener('click', () => this.playPrevious());
        playButton.addEventListener('click', () => this.togglePlay());
        nextButton.addEventListener('click', () => this.playNext());

        controls.appendChild(loopButton);
        controls.appendChild(prevButton);
        controls.appendChild(playButton);
        controls.appendChild(nextButton);

        this.container.appendChild(musicInfo);
        this.container.appendChild(controls);

        // 设置音频事件监听
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('error', () => {
            showMessage('音频加载失败');
        });

        // 保存对歌曲信息元素的引用
        this.songTitleElement = songTitle;
        this.songArtistElement = songArtist;
        this.playButtonElement = playButton;
    }

    private createControlButton(iconName: string, title: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.innerHTML = `<svg style="width: 12px; height: 12px;"><use xlink:href="#${iconName}"></use></svg>`;
        button.title = title;
        button.style.cssText = `
            padding: 4px;
            background: #e8e8e8;
            border: 1px solid #e8e8e8;
            border-radius: 6px;
            cursor: pointer;
            color: #090909;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            box-shadow: 3px 3px 6px #c5c5c5, -3px -3px 6px #ffffff;
            min-width: 24px;
            min-height: 24px;
        `;

        // 如果是播放按钮，稍微大一点
        if (iconName === 'iconPlay' || iconName === 'iconPause') {
            button.style.padding = '6px';
            button.style.minWidth = '28px';
            button.style.minHeight = '28px';
            button.innerHTML = `<svg style="width: 14px; height: 14px;"><use xlink:href="#${iconName}"></use></svg>`;
        }

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });

        button.addEventListener('mousedown', () => {
            button.style.boxShadow = 'inset 2px 2px 4px #c5c5c5, inset -2px -2px 4px #ffffff';
        });

        button.addEventListener('mouseup', () => {
            button.style.boxShadow = '3px 3px 6px #c5c5c5, -3px -3px 6px #ffffff';
        });

        return button;
    }

    private async loadPlaylist() {
        try {
            const data = await getFile(this.storagePath);
            if (data) {
                try {

                    this.playlist = data.playlist || [];
                    this.currentSongIndex = data.currentSongIndex || 0;
                    this.isLoopMode = data.isLoopMode !== undefined ? data.isLoopMode : true;
                    
                    if (this.playlist.length > 0) {
                        this.updateNowPlaying();
                    }
                    
                    // 更新循环模式按钮状态
                    if (this.loopButtonElement) {
                        this.loopButtonElement.innerHTML = `<svg style="width: 12px; height: 12px;"><use xlink:href="#icon${this.isLoopMode ? 'Refresh' : 'Forward'}"></use></svg>`;
                        this.loopButtonElement.title = this.isLoopMode ? '循环播放' : '顺序播放';
                    }
                } catch {
                    this.playlist = [];
                }
            }
        } catch (e) {
            console.log('加载播放列表失败');
            this.playlist = [];
        }
    }

    private async savePlaylist() {
        const config = {
            playlist: this.playlist,
            currentSongIndex: this.currentSongIndex,
            isLoopMode: this.isLoopMode
        };
        try {
            await putFile(this.storagePath, false, new Blob([JSON.stringify(config)], { type: "application/json" }));
            console.log('保存播放列表成功');
        } catch (e) {
            console.error('保存播放列表失败', e);
        }
    }

    private async showAddSongDialog() {
        const dialog = new Dialog({
            title: "添加音乐",
            content: `
                <div class="b3-dialog__content" style="padding: 16px;">
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 12px; color: var(--b3-theme-on-surface); opacity: 0.8; margin-bottom: 6px;">歌曲名称</div>
                        <input 
                            class="b3-text-field" 
                            placeholder="输入歌曲名称" 
                            id="song-title"
                            style="
                                width: calc(100% - 24px);
                                padding: 8px 12px;
                                border-radius: 6px;
                                font-size: 13px;
                                background: var(--b3-theme-surface);
                            "
                        />
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 12px; color: var(--b3-theme-on-surface); opacity: 0.8; margin-bottom: 6px;">艺术家</div>
                        <input 
                            class="b3-text-field" 
                            placeholder="输入艺术家名称" 
                            id="song-artist"
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
                        <div style="font-size: 12px; color: var(--b3-theme-on-surface); opacity: 0.8; margin-bottom: 6px;">音乐链接</div>
                        <input 
                            class="b3-text-field" 
                            placeholder="输入音乐链接" 
                            id="song-url"
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
            width: "400px",
        });

        const titleInput = dialog.element.querySelector('#song-title') as HTMLInputElement;
        const artistInput = dialog.element.querySelector('#song-artist') as HTMLInputElement;
        const urlInput = dialog.element.querySelector('#song-url') as HTMLInputElement;

        dialog.element.querySelector('.b3-button--cancel')?.addEventListener('click', () => {
            dialog.destroy();
        });

        dialog.element.querySelector('.b3-button--text')?.addEventListener('click', async () => {
            const title = titleInput.value.trim();
            const artist = artistInput.value.trim();
            const url = urlInput.value.trim();

            if (title && artist && url) {
                this.playlist.push({ title, artist, url });
                await this.savePlaylist();
                if (this.playlist.length === 1) {
                    this.updateNowPlaying();
                }
                dialog.destroy();
            } else {
                showMessage('请填写完整信息');
            }
        });
    }

    private showPlaylistDialog() {
        const dialog = new Dialog({
            title: "播放列表",
            content: `
                <div class="b3-dialog__content" style="padding: 16px;">
                    <div class="playlist-container" style="max-height: 300px; overflow-y: auto;">
                        ${this.playlist.length === 0 ? 
                            '<div style="text-align: center; padding: 20px; color: var(--b3-theme-on-surface); opacity: 0.6;">播放列表为空</div>' :
                            this.playlist.map((song, index) => `
                                <div class="playlist-item" data-index="${index}" style="
                                    display: flex;
                                    align-items: center;
                                    padding: 8px 12px;
                                    cursor: pointer;
                                    border-radius: 4px;
                                    transition: all 0.2s;
                                    position: relative;
                                    background: ${index === this.currentSongIndex ? 'var(--b3-theme-primary-light)' : 'transparent'};
                                ">
                                    <div style="flex: 1;">
                                        <div style="font-size: 14px; margin-bottom: 4px;">${song.title}</div>
                                        <div style="font-size: 12px; opacity: 0.8;">${song.artist}</div>
                                    </div>
                                    <button class="delete-song" data-index="${index}" style="
                                        padding: 4px 8px;
                                        background: var(--b3-theme-error);
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 12px;
                                        opacity: 0;
                                        transition: opacity 0.2s;
                                    ">
                                        删除
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>
                    <div style="margin-top: 16px; text-align: right;">
                        <button class="add-song-button b3-button b3-button--text" style="
                            padding: 6px 16px;
                            border-radius: 4px;
                            font-size: 14px;
                        ">
                            添加音乐
                        </button>
                    </div>
                </div>
            `,
            width: "400px",
        });

        // 添加事件监听
        const container = dialog.element.querySelector('.playlist-container');
        if (container) {
            // 添加鼠标悬浮效果
            container.addEventListener('mouseover', (e) => {
                const target = e.target as HTMLElement;
                const item = target.closest('.playlist-item') as HTMLElement;
                if (item) {
                    const deleteButton = item.querySelector('.delete-song') as HTMLElement;
                    if (deleteButton) {
                        deleteButton.style.opacity = '1';
                    }
                }
            });

            container.addEventListener('mouseout', (e) => {
                const target = e.target as HTMLElement;
                const item = target.closest('.playlist-item') as HTMLElement;
                if (item) {
                    const deleteButton = item.querySelector('.delete-song') as HTMLElement;
                    if (deleteButton) {
                        deleteButton.style.opacity = '0';
                    }
                }
            });

            container.addEventListener('click', async (e) => {
                const target = e.target as HTMLElement;
                const deleteButton = target.closest('.delete-song');
                const item = target.closest('.playlist-item') as HTMLElement;

                if (deleteButton) {
                    e.stopPropagation();
                    const index = parseInt(deleteButton.getAttribute('data-index') || '0');
                    this.playlist.splice(index, 1);
                    if (index === this.currentSongIndex) {
                        this.currentSongIndex = 0;
                        this.updateNowPlaying();
                    } else if (index < this.currentSongIndex) {
                        this.currentSongIndex--;
                    }
                    await this.savePlaylist();
                    dialog.destroy();
                    this.showPlaylistDialog();
                } else if (item) {
                    const index = parseInt(item.getAttribute('data-index') || '0');
                    this.playSong(index);
                    dialog.destroy();
                }
            });
        }

        // 添加新音乐按钮事件
        const addButton = dialog.element.querySelector('.add-song-button');
        if (addButton) {
            addButton.addEventListener('click', () => {
                dialog.destroy();
                this.showAddSongDialog();
            });
        }
    }

    private showSettingsDialog() {
        const dialog = new Dialog({
            title: "音乐播放器设置",
            content: `
                <div class="b3-dialog__content" style="padding: 16px;">
                    <div class="playlist-container" style="max-height: 300px; overflow-y: auto;">
                        ${this.playlist.length === 0 ? 
                            '<div style="text-align: center; padding: 20px; color: var(--b3-theme-on-surface); opacity: 0.6;">播放列表为空</div>' :
                            this.playlist.map((song, index) => `
                                <div class="playlist-item" style="
                                    display: flex;
                                    align-items: center;
                                    padding: 8px 12px;
                                    border-radius: 4px;
                                    margin-bottom: 8px;
                                    background: var(--b3-theme-surface);
                                ">
                                    <div style="flex: 1;">
                                        <div style="font-size: 14px; margin-bottom: 4px;">${song.title}</div>
                                        <div style="font-size: 12px; opacity: 0.8;">${song.artist}</div>
                                    </div>
                                    <button class="delete-song" data-index="${index}" style="
                                        padding: 4px 8px;
                                        background: var(--b3-theme-error);
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 12px;
                                    ">
                                        删除
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `,
            width: "400px",
        });

        // 添加删除按钮事件
        const container = dialog.element.querySelector('.playlist-container');
        if (container) {
            container.addEventListener('click', async (e) => {
                const target = e.target as HTMLElement;
                const deleteButton = target.closest('.delete-song');
                if (deleteButton) {
                    const index = parseInt(deleteButton.getAttribute('data-index') || '0');
                    this.playlist.splice(index, 1);
                    await this.savePlaylist();
                    dialog.destroy();
                    this.showSettingsDialog();
                }
            });
        }
    }

    private updateNowPlaying() {
        if (this.playlist.length > 0 && this.currentSongIndex >= 0) {
            const currentSong = this.playlist[this.currentSongIndex];
            this.songTitleElement.textContent = currentSong.title;
            this.songArtistElement.textContent = currentSong.artist;
        } else {
            this.songTitleElement.textContent = '未知歌曲';
            this.songArtistElement.textContent = '未知歌手';
        }
    }

    private updatePlayButton() {
        if (this.playButtonElement) {
            this.playButtonElement.innerHTML = `<svg style="width: 14px; height: 14px;"><use xlink:href="#icon${this.isPlaying ? 'Pause' : 'Play'}"></use></svg>`;
            this.playButtonElement.style.opacity = '1';
        }
    }

    private playSong(index: number) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentSongIndex = index;
            this.audio.src = this.playlist[index].url;
            this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton();
            this.updateNowPlaying();
        }
    }

    private togglePlay() {
        if (this.playlist.length === 0) {
            showMessage('播放列表为空');
            return;
        }

        if (this.isPlaying) {
            this.audio.pause();
        } else {
            if (!this.audio.src) {
                this.playSong(0);
            } else {
                this.audio.play();
            }
        }

        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
    }

    private playPrevious() {
        if (this.playlist.length === 0) return;
        const newIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playSong(newIndex);
    }

    private playNext() {
        if (this.playlist.length === 0) return;
        
        if (this.isLoopMode) {
            const newIndex = (this.currentSongIndex + 1) % this.playlist.length;
            this.playSong(newIndex);
        } else if (this.currentSongIndex < this.playlist.length - 1) {
            this.playSong(this.currentSongIndex + 1);
        } else {
            // 如果是最后一首歌且不是循环模式，则停止播放
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayButton();
        }
    }

    private togglePlayMode() {
        this.isLoopMode = !this.isLoopMode;
        if (this.loopButtonElement) {
            this.loopButtonElement.innerHTML = `<svg style="width: 12px; height: 12px;"><use xlink:href="#icon${this.isLoopMode ? 'Refresh' : 'Forward'}"></use></svg>`;
            this.loopButtonElement.title = this.isLoopMode ? '循环播放' : '顺序播放';
        }
        this.savePlaylist();
    }
} 