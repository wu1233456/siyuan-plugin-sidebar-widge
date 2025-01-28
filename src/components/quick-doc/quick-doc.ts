import { Dialog, Menu } from "siyuan";
import { pushMsg, getFile, putFile, getDoc, getBlockByID } from "../../api";
import { openTab, openMobileFileById, getFrontend } from 'siyuan';

interface QuickDocConfig {
    id: string;
    docId: string;
}

export class QuickDoc {
    private element: HTMLElement;
    private configPath: string = "/data/storage/siyuan-plugin-sidebar-widget/quick-doc-config.json";
    private docId: string = "";
    private id: string;
    private isMobile: boolean;
    private static configs: { [key: string]: QuickDocConfig } = {};
    private static configsLoaded: boolean = false;

    constructor(element: HTMLElement, id?: string) {
        this.element = element;
        this.id = id || `quick-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        
        this.loadConfig().then(() => {
            this.init();
        });
    }

    private async loadAllConfigs() {
        if (QuickDoc.configsLoaded) return;
        
        try {
            const configs = await getFile(this.configPath);
            if (configs) {
                QuickDoc.configs = configs;
            }
            QuickDoc.configsLoaded = true;
        } catch (e) {
            console.log("加载快速文档配置失败，使用默认配置");
            QuickDoc.configs = {};
            QuickDoc.configsLoaded = true;
        }
    }

    private async loadConfig() {
        await this.loadAllConfigs();
        const config = QuickDoc.configs[this.id];
        if (config) {
            this.docId = config.docId;
        }
    }

    private async saveConfig() {
        QuickDoc.configs[this.id] = {
            id: this.id,
            docId: this.docId
        };
        
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(QuickDoc.configs)], { type: "application/json" }));
            console.log("保存快速文档配置成功");
        } catch (e) {
            console.error("保存快速文档配置失败", e);
        }
    }

    private async init() {
        // 创建容器
        const container = document.createElement('div');
        container.className = 'quick-doc';
        container.style.cssText = `
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

        // 添加容器的悬停效果
        container.addEventListener('mouseover', () => {
            container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });

        container.addEventListener('mouseout', () => {
            container.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        });

        // 创建主要内容区域
        const contentArea = document.createElement('div');
        contentArea.style.cssText = `
            display: flex;
            flex-direction: column;
            padding: 16px;
            cursor: pointer;
            flex: 1;
            min-width: 0;
        `;

        // 创建标题区域
        const titleArea = document.createElement('div');
        titleArea.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        `;

        // 添加图标
        const icon = document.createElement('div');
        icon.innerHTML = '📄';
        icon.style.cssText = `
            font-size: 16px;
            line-height: 1;
        `;

        // 创建标题文本
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 16px;
            color: var(--b3-theme-on-surface);
            opacity: 0.8;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            min-width: 0;
        `;

        titleArea.appendChild(icon);
        titleArea.appendChild(title);
        contentArea.appendChild(titleArea);

        // 创建内容预览
        const preview = document.createElement('div');
        preview.style.cssText = `
            font-size: 14px;
            color: var(--b3-theme-on-surface);
            opacity: 0.6;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            line-height: 1.5;
            margin-bottom: 12px;
        `;

        contentArea.appendChild(preview);

        // 创建底部信息区域
        const bottomInfo = document.createElement('div');
        bottomInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
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

        // 添加创建时间
        const timeText = document.createElement('div');
        timeText.style.cssText = `
            font-size: 12px;
            color: var(--b3-theme-on-surface);
            opacity: 0.6;
            transition: opacity 0.2s ease;
        `;

        bottomInfo.appendChild(timeText);

        // 添加底部区域的悬停效果
        bottomInfo.addEventListener('mouseover', () => {
            timeText.style.opacity = '1';
        });

        bottomInfo.addEventListener('mouseout', () => {
            timeText.style.opacity = '0.6';
        });

        contentArea.appendChild(bottomInfo);
        container.appendChild(contentArea);

        // 如果没有设置文档ID，显示设置界面
        if (!this.docId) {
            title.textContent = "点击设置文档";
            preview.textContent = "请先设置要快速打开的文档";
            timeText.textContent = "未设置";
            container.addEventListener('click', () => this.showDocIdInput());
        } else {
            // 加载文档内容
            try {
                const block = await getBlockByID(this.docId);
                if (block) {
                    title.textContent = block.content || "未命名文档";
                    // 获取文档内容
                    const data = await getDoc(this.docId);
                    if (data) {
                        // 移除 HTML 标签，只显示纯文本
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = data.content;
                        preview.textContent = tempDiv.textContent || "暂无内容";
                    }
                    // 格式化创建时间
                    const createTime = new Date(parseInt(block.created) * 1000);
                    timeText.textContent = createTime.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                    container.addEventListener('click', () => this.openDoc());
                } else {
                    title.textContent = "文档不存在";
                    preview.textContent = "请重新设置文档";
                    timeText.textContent = "未知";
                    container.addEventListener('click', () => this.showDocIdInput());
                }
            } catch (error) {
                console.error('Failed to load doc:', error);
                title.textContent = "加载失败";
                preview.textContent = "请重新设置文档";
                timeText.textContent = "未知";
                container.addEventListener('click', () => this.showDocIdInput());
            }
        }

        // 添加右键菜单
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const menu = new Menu("quickDocOperation");
            menu.addItem({
                icon: "iconSettings",
                label: "设置文档",
                click: () => {
                    this.showDocIdInput();
                }
            });
            menu.open({
                x: e.clientX,
                y: e.clientY
            });
        });

        this.element.appendChild(container);
    }

    private showDocIdInput() {
        const dialog = new Dialog({
            title: "设置快速打开的文档",
            content: `
                <div class="b3-dialog__content">
                    <div class="b3-dialog__desc">请输入要快速打开的文档ID：</div>
                    <input class="b3-text-field fn__block" value="${this.docId}" placeholder="请输入文档ID">
                </div>
                <div class="b3-dialog__action">
                    <button class="b3-button b3-button--cancel">取消</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text">确定</button>
                </div>
            `,
            width: "520px",
        });

        const input = dialog.element.querySelector('input');
        const cancelButton = dialog.element.querySelector('.b3-button--cancel');
        const confirmButton = dialog.element.querySelector('.b3-button--text');

        cancelButton.addEventListener('click', () => {
            dialog.destroy();
        });

        confirmButton.addEventListener('click', async () => {
            const newDocId = input.value.trim();
            if (newDocId) {
                try {
                    const block = await getBlockByID(newDocId);
                    if (block) {
                        this.docId = newDocId;
                        await this.saveConfig();
                        dialog.destroy();
                        // 重新初始化界面
                        this.element.innerHTML = '';
                        this.init();
                        pushMsg("设置成功");
                    } else {
                        pushMsg("文档不存在，请检查ID是否正确");
                    }
                } catch (error) {
                    console.error('Failed to verify doc:', error);
                    pushMsg("验证文档失败，请重试");
                }
            } else {
                pushMsg("请输入文档ID");
            }
        });
    }

    private async openDoc() {
        if (!this.docId) return;

        if (this.isMobile) {
            openMobileFileById(window.siyuan.ws.app, this.docId, ['cb-get-all']);
        } else {
            openTab({
                app: window.siyuan.ws.app,
                doc: {
                    id: this.docId,
                    zoomIn: false
                }
            });
        }
    }
} 