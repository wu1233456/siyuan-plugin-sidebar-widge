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
    private storagePath: string = "/data/storage/music-player.json";
    private songTitleElement: HTMLDivElement;
    private songArtistElement: HTMLDivElement;
    private playButtonElement: HTMLButtonElement;

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
            gap: 12px;
            height: 120px;
            background: var(--b3-theme-background);
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            box-sizing: border-box;
        `;

        // 创建音乐信息区域
        const musicInfo = document.createElement('div');
        musicInfo.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
        `;

        const songTitle = document.createElement('div');
        songTitle.style.cssText = `
            font-size: 16px;
            font-weight: 500;
            color: var(--b3-theme-on-background);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
        `;
        songTitle.textContent = '未知歌曲';

        const songArtist = document.createElement('div');
        songArtist.style.cssText = `
            font-size: 14px;
            color: var(--b3-theme-on-surface);
            opacity: 0.8;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
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
            padding: 8px 0;
        `;

        // 创建循环按钮
        const loopButton = this.createControlButton('iconRefresh', '循环播放');
        loopButton.style.cssText += `
            width: 20px;
            height: 20px;
        `;

        // 创建上一首按钮
        const prevButton = this.createControlButton('iconLeft', '上一首');
        prevButton.style.cssText += `
            width: 24px;
            height: 24px;
        `;

        // 创建播放按钮
        const playButton = this.createControlButton('iconPlay', '播放');
        playButton.style.cssText += `
            width: 32px;
            height: 32px;
            color: var(--b3-theme-primary);
            opacity: 1;
        `;

        // 创建下一首按钮
        const nextButton = this.createControlButton('iconRight', '下一首');
        nextButton.style.cssText += `
            width: 24px;
            height: 24px;
        `;

        // 创建菜单按钮
        const menuButton = this.createControlButton('iconMore', '播放列表');
        menuButton.style.cssText += `
            width: 20px;
            height: 20px;
        `;

        prevButton.addEventListener('click', () => this.playPrevious());
        playButton.addEventListener('click', () => this.togglePlay());
        nextButton.addEventListener('click', () => this.playNext());
        menuButton.addEventListener('click', () => this.showPlaylistDialog());

        controls.appendChild(loopButton);
        controls.appendChild(prevButton);
        controls.appendChild(playButton);
        controls.appendChild(nextButton);
        controls.appendChild(menuButton);

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
        button.innerHTML = `<svg style="width: 16px; height: 16px;"><use xlink:href="#${iconName}"></use></svg>`;
        button.title = title;
        button.style.cssText = `
            padding: 4px;
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--b3-theme-on-background);
            opacity: 0.6;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        `;
        button.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
            button.style.transform = 'scale(1.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.opacity = '0.6';
            button.style.transform = 'scale(1)';
        });
        return button;
    }

    private async loadPlaylist() {
        try {
            const data = await getFile(this.storagePath);
            if (data) {
                try {
                    this.playlist = JSON.parse(data as string);
                } catch {
                    this.playlist = [];
                }
                this.renderPlaylist();
            }
        } catch (e) {
            console.log('加载播放列表失败');
            this.playlist = [];
        }
    }

    private async savePlaylist() {
        try {
            await putFile(this.storagePath, false, new Blob([JSON.stringify(this.playlist)], { type: "application/json" }));
        } catch (e) {
            console.log('保存播放列表失败');
        }
    }

    private renderPlaylist() {
        const playlistContainer = this.container.querySelector('div:last-child') as HTMLElement;
        playlistContainer.innerHTML = '';

        this.playlist.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.style.cssText = `
                display: flex;
                align-items: center;
                padding: 8px;
                gap: 8px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;
                ${index === this.currentSongIndex ? 'background: var(--b3-theme-primary-light);' : ''}
            `;

            const songInfo = document.createElement('div');
            songInfo.style.cssText = `
                flex: 1;
                overflow: hidden;
            `;

            const title = document.createElement('div');
            title.textContent = song.title;
            title.style.cssText = `
                font-size: 13px;
                color: var(--b3-theme-on-background);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;

            const artist = document.createElement('div');
            artist.textContent = song.artist;
            artist.style.cssText = `
                font-size: 12px;
                color: var(--b3-theme-on-surface);
                opacity: 0.8;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;

            songInfo.appendChild(title);
            songInfo.appendChild(artist);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<svg><use xlink:href="#iconTrashcan"></use></svg>';
            deleteButton.style.cssText = `
                padding: 4px;
                background: transparent;
                border: none;
                cursor: pointer;
                color: var(--b3-theme-on-background);
                opacity: 0;
                transition: opacity 0.2s;
            `;

            songElement.addEventListener('mouseenter', () => {
                songElement.style.backgroundColor = 'var(--b3-theme-background-light)';
                deleteButton.style.opacity = '0.6';
            });

            songElement.addEventListener('mouseleave', () => {
                if (index !== this.currentSongIndex) {
                    songElement.style.backgroundColor = 'transparent';
                }
                deleteButton.style.opacity = '0';
            });

            songElement.addEventListener('click', (e) => {
                if (e.target !== deleteButton) {
                    this.playSong(index);
                }
            });

            deleteButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                this.playlist.splice(index, 1);
                await this.savePlaylist();
                this.renderPlaylist();
            });

            songElement.appendChild(songInfo);
            songElement.appendChild(deleteButton);
            playlistContainer.appendChild(songElement);
        });
    }

    private showAddSongDialog() {
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
                this.renderPlaylist();
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
                                    padding: 8px;
                                    gap: 8px;
                                    cursor: pointer;
                                    border-radius: 4px;
                                    transition: background-color 0.2s;
                                    ${index === this.currentSongIndex ? 'background: var(--b3-theme-primary-light);' : ''}
                                ">
                                    <div style="flex: 1;">
                                        <div style="font-size: 14px; margin-bottom: 2px;">${song.title}</div>
                                        <div style="font-size: 12px; opacity: 0.8;">${song.artist}</div>
                                    </div>
                                    <button class="delete-song" data-index="${index}" style="
                                        padding: 4px;
                                        background: transparent;
                                        border: none;
                                        cursor: pointer;
                                        opacity: 0.6;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                    ">
                                        <svg style="width: 14px; height: 14px;"><use xlink:href="#iconTrashcan"></use></svg>
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>
                    <div style="margin-top: 16px; text-align: center;">
                        <button class="add-song-button b3-button b3-button--outline" style="
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
            container.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const item = target.closest('.playlist-item') as HTMLElement;
                const deleteButton = target.closest('.delete-song');

                if (deleteButton) {
                    const index = parseInt(deleteButton.getAttribute('data-index') || '0');
                    this.playlist.splice(index, 1);
                    this.savePlaylist();
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
            this.playButtonElement.innerHTML = `<svg><use xlink:href="#icon${this.isPlaying ? 'Pause' : 'Play'}"></use></svg>`;
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
        const newIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.playSong(newIndex);
    }
} 