import { getFile, putFile } from "../../api";
import { Dialog, showMessage } from "siyuan";

interface BirthdayConfig {
    id: string;
    name: string;
    date: string;
}

export class Birthday {
    private container: HTMLElement;
    private id: string;
    private configPath: string = "/data/storage/siyuan-plugin-sidebar-widget/birthdays-config.json";
    private static configs: { [key: string]: BirthdayConfig[] } = {};
    private static configsLoaded: boolean = false;

    constructor(container: HTMLElement, id?: string) {
        this.container = container;
        this.id = id || `birthday-${Date.now()}`;
        
        this.loadConfig().then(() => {
            this.init();
        });
    }

    private async loadAllConfigs() {
        if (Birthday.configsLoaded) return;
        
        try {
            const configs = await getFile(this.configPath);
            if (configs) {
                Birthday.configs = configs;
            }
            console.log("加载所有生日配置成功", Birthday.configs);
            Birthday.configsLoaded = true;
        } catch (e) {
            console.log("加载生日配置失败，使用默认配置");
            Birthday.configs = {};
            Birthday.configsLoaded = true;
        }
    }

    private async loadConfig() {
        await this.loadAllConfigs();
    }

    private async saveConfig() {
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(Birthday.configs)], { type: "application/json" }));
            console.log("保存生日配置成功");
        } catch (e) {
            console.error("保存生日配置失败", e);
        }
    }

    private calculateDaysUntilBirthday(birthDate: string): number {
        const today = new Date();
        const birth = new Date(birthDate);
        
        // 设置生日为今年
        const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
        
        // 如果今年的生日已经过了，计算到明年的生日
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        const diffTime = nextBirthday.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    private formatDate(date: string): string {
        const d = new Date(date);
        return `${d.getMonth() + 1}月${d.getDate()}日`;
    }

    private init() {
        this.container.innerHTML = '';
        const card = document.createElement('div');
        card.style.cssText = `
            display: flex;
            flex-direction: column;
            height: 100%;
            color: var(--b3-theme-on-background);
            background: var(--b3-theme-background);
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        `;

        // 创建内容区域
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            flex: 1;
        `;

        // 左侧：下一个生日信息
        const leftSection = document.createElement('div');
        leftSection.style.cssText = `
            width: 50px;
            padding: 10px 4px;
            background: var(--b3-theme-background);
            display: flex;
            flex-direction: column;
            gap: 4px;
            position: relative;
        `;

        // 左侧标题
        const leftTitle = document.createElement('div');
        leftTitle.style.cssText = `
            font-size: 10px;
            color: var(--b3-theme-on-surface-light);
            margin-bottom: 8px;
            opacity: 0.8;
            text-align: center;
        `;
        leftTitle.textContent = "下一个生日";
        leftSection.appendChild(leftTitle);

        // 右侧：生日列表
        const rightSection = document.createElement('div');
        rightSection.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-height: 200px;
            overflow-y: auto;
            padding: 6px;
            background: var(--b3-theme-surface);
            cursor: pointer;
        `;
        
        // 添加点击事件，显示完整列表
        rightSection.addEventListener('click', () => {
            this.showBirthdayListDialog();
        });

        // 创建添加按钮
        const addButton = document.createElement('button');
        addButton.innerHTML = '+';
        addButton.style.cssText = `
            cursor: pointer;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #4285f4;
            color: white;
            border: none;
            margin: auto auto 0;
            font-size: 14px;
            transition: all 0.2s ease;
        `;
        addButton.addEventListener('mouseover', () => {
            addButton.style.transform = 'scale(1.1)';
        });
        addButton.addEventListener('mouseout', () => {
            addButton.style.transform = 'scale(1)';
        });
        addButton.addEventListener('click', () => this.showAddDialog());
        leftSection.appendChild(addButton);

        this.updateBirthdayDisplay(leftSection, rightSection);

        content.appendChild(leftSection);
        content.appendChild(rightSection);
        card.appendChild(content);
        this.container.appendChild(card);
    }

    private updateBirthdayDisplay(leftSection: HTMLElement, rightSection: HTMLElement) {
        console.log("更新生日显示");
        // 保存左侧标题和添加按钮的引用
        const leftTitle = leftSection.querySelector('div:first-child')?.cloneNode(true) as HTMLElement;
        const addButton = leftSection.querySelector('button')?.cloneNode(true) as HTMLElement;
        if (addButton) {
            addButton.addEventListener('click', () => this.showAddDialog());
        }
        
        // 完全清空左右区域
        leftSection.innerHTML = '';
        rightSection.innerHTML = '';

        // 重新设置左侧样式
        leftSection.style.cssText = `
            width: 50px;
            padding: 10px 4px;
            background: var(--b3-theme-background);
            display: flex;
            flex-direction: column;
            gap: 4px;
            position: relative;
        `;

        // 重新设置右侧样式
        rightSection.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-height: 200px;
            overflow-y: auto;
            padding: 6px;
            background: var(--b3-theme-surface);
            cursor: pointer;
        `;

        // 先添加回标题
        if (leftTitle) leftSection.appendChild(leftTitle);

        // 创建名字和天数显示
        const nameElement = document.createElement('div');
        nameElement.style.cssText = `
            font-size: 11px;
            font-weight: 600;
            color: var(--b3-theme-on-background);
            text-align: center;
        `;

        const daysElement = document.createElement('div');
        daysElement.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            color: var(--b3-theme-on-background);
            text-align: center;
        `;

        const dateElement = document.createElement('div');
        dateElement.style.cssText = `
            font-size: 10px;
            color: var(--b3-theme-on-surface-light);
            text-align: center;
            opacity: 0.8;
        `;

        leftSection.appendChild(nameElement);
        leftSection.appendChild(daysElement);
        leftSection.appendChild(dateElement);
        
        // 最后添加回按钮
        if (addButton) leftSection.appendChild(addButton);

        const birthdays = Birthday.configs[this.id] || [];
        if (birthdays.length === 0) {
            nameElement.textContent = '-';
            daysElement.textContent = '0';
            dateElement.textContent = '-';
        } else {
            // 按照到下一个生日的天数排序
            const sortedBirthdays = [...birthdays].sort((a, b) => {
                const daysA = this.calculateDaysUntilBirthday(a.date);
                const daysB = this.calculateDaysUntilBirthday(b.date);
                return daysA - daysB;
            });

            // 显示最近的生日
            const nextBirthday = sortedBirthdays[0];
            const daysUntil = this.calculateDaysUntilBirthday(nextBirthday.date);
            
            nameElement.textContent = nextBirthday.name;
            daysElement.textContent = String(daysUntil);
            dateElement.textContent = this.formatDate(nextBirthday.date);

            // 只显示最近的5个生日
            const displayBirthdays = sortedBirthdays.slice(0, 5);
            displayBirthdays.forEach(birthday => {
                const birthdayItem = document.createElement('div');
                birthdayItem.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background: var(--b3-theme-background);
                    font-size: 12px;
                    min-height: 24px;
                `;

                const leftContent = document.createElement('div');
                leftContent.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 0px;
                `;

                const name = document.createElement('div');
                name.style.cssText = `
                    color: var(--b3-theme-on-background);
                    opacity: 0.9;
                    line-height: 1.2;
                `;
                name.textContent = birthday.name;

                const date = document.createElement('div');
                date.style.cssText = `
                    color: var(--b3-theme-on-surface-light);
                    opacity: 0.7;
                    font-size: 10px;
                    line-height: 1.2;
                `;
                date.textContent = this.formatDate(birthday.date);

                const days = document.createElement('div');
                days.style.cssText = `
                    color: var(--b3-theme-on-background);
                    font-weight: 500;
                    opacity: 0.9;
                    font-size: 11px;
                `;
                days.textContent = `${this.calculateDaysUntilBirthday(birthday.date)}天`;

                leftContent.appendChild(name);
                leftContent.appendChild(date);
                birthdayItem.appendChild(leftContent);
                birthdayItem.appendChild(days);

                rightSection.appendChild(birthdayItem);
            });

            // 如果有更多生日，显示查看更多提示
            if (birthdays.length > 5) {
                const moreItem = document.createElement('div');
                moreItem.style.cssText = `
                    text-align: center;
                    padding: 4px;
                    color: var(--b3-theme-primary);
                    font-size: 12px;
                    opacity: 0.8;
                `;
                moreItem.textContent = `查看全部 ${birthdays.length} 个生日`;
                rightSection.appendChild(moreItem);
            }
        }
    }

    private showAddDialog() {
        const dialog = new Dialog({
            title: "添加生日",
            content: `
                <div class="b3-dialog__content" style="padding: 20px;">
                    <div class="b3-dialog__item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px;">姓名</label>
                        <input class="b3-text-field" type="text" placeholder="请输入姓名">
                    </div>
                    <div class="b3-dialog__item">
                        <label style="display: block; margin-bottom: 8px;">生日</label>
                        <input class="b3-text-field" type="date">
                    </div>
                </div>
                <div class="b3-dialog__action">
                    <button class="b3-button b3-button--cancel">取消</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text">确定</button>
                </div>
            `,
            width: "400px",
        });

        const saveButton = dialog.element.querySelector('.b3-button--text');
        const nameInput = dialog.element.querySelector('input[type="text"]') as HTMLInputElement;
        const dateInput = dialog.element.querySelector('input[type="date"]') as HTMLInputElement;

        saveButton?.addEventListener('click', async () => {
            const name = nameInput.value.trim();
            const date = dateInput.value;

            if (!name || !date) {
                showMessage('请填写完整信息');
                return;
            }

            if (!Birthday.configs[this.id]) {
                Birthday.configs[this.id] = [];
            }

            Birthday.configs[this.id].push({
                id: `birthday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name,
                date
            });

            await this.saveConfig();

            // 更新显示
            this.init();

            dialog.destroy();
        });
    }

    private showBirthdayListDialog() {
        const dialog = new Dialog({
            title: "生日列表",
            content: `
                <div class="b3-dialog__content" style="
                    padding: 0;
                    display: flex;
                    height: 70vh;
                    min-height: 60vh;
                    max-height: 60vh;
                    overflow: hidden;
                ">
                    <!-- 左侧导航 -->
                    <div style="
                        width: 200px;
                        background: var(--b3-theme-surface);
                        border-right: 1px solid var(--b3-theme-surface-lighter);
                        padding: 16px 0;
                        flex-shrink: 0;
                    ">
                        <div class="birthday-nav-item birthday-nav-item--active" data-type="upcoming" style="
                            padding: 8px 16px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 14px;
                            color: var(--b3-theme-on-background);
                        ">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                            </svg>
                            即将到来
                        </div>
                        <div class="birthday-nav-item" data-type="all" style="
                            padding: 8px 16px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 14px;
                            color: var(--b3-theme-on-background);
                        ">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                            </svg>
                            全部
                        </div>
                    </div>
                    <!-- 右侧内容 -->
                    <div style="
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    ">
                        <!-- 头部添加按钮 -->
                        <div style="
                            padding: 16px;
                            border-bottom: 1px solid var(--b3-theme-surface-lighter);
                            display: flex;
                            align-items: center;
                            flex-shrink: 0;
                        ">
                            <button class="birthday-add-btn" style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                padding: 8px 16px;
                                border: none;
                                background: var(--b3-theme-primary);
                                color: white;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                transition: opacity 0.2s;
                            ">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                                添加生日
                            </button>
                        </div>
                        <!-- 生日列表区域 -->
                        <div class="birthday-list" style="
                            flex: 1;
                            overflow-y: auto;
                            padding: 16px;
                        "></div>
                    </div>
                </div>
            `,
            width: "800px",
        });

        const renderBirthdayList = (type: 'upcoming' | 'all') => {
            const listContainer = dialog.element.querySelector('.birthday-list');
            if (!listContainer) return;

            const birthdays = Birthday.configs[this.id] || [];
            const sortedBirthdays = [...birthdays].sort((a, b) => {
                const daysA = this.calculateDaysUntilBirthday(a.date);
                const daysB = this.calculateDaysUntilBirthday(b.date);
                return daysA - daysB;
            });

            // 根据类型筛选生日
            const filteredBirthdays = type === 'upcoming' 
                ? sortedBirthdays.filter(b => this.calculateDaysUntilBirthday(b.date) > 0)
                : sortedBirthdays;

            listContainer.innerHTML = '';
            filteredBirthdays.forEach(birthday => {
                const birthdayItem = document.createElement('div');
                birthdayItem.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 6px;
                    background: var(--b3-theme-surface);
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                `;

                const leftContent = document.createElement('div');
                leftContent.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                `;

                const name = document.createElement('div');
                name.style.cssText = `
                    font-size: 14px;
                    color: var(--b3-theme-on-background);
                    font-weight: 500;
                `;
                name.textContent = birthday.name;

                const date = document.createElement('div');
                date.style.cssText = `
                    font-size: 12px;
                    color: var(--b3-theme-on-surface-light);
                `;
                date.textContent = this.formatDate(birthday.date);

                const days = document.createElement('div');
                days.style.cssText = `
                    font-size: 13px;
                    color: var(--b3-theme-primary);
                    font-weight: 500;
                `;
                const daysUntil = this.calculateDaysUntilBirthday(birthday.date);
                days.textContent = `${daysUntil}天后`;

                const deleteBtn = document.createElement('button');
                deleteBtn.style.cssText = `
                    border: none;
                    background: none;
                    padding: 8px;
                    cursor: pointer;
                    color: var(--b3-theme-on-surface-light);
                    opacity: 0.6;
                    border-radius: 4px;
                    transition: all 0.2s;
                `;
                deleteBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                `;

                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const index = Birthday.configs[this.id].findIndex(b => b.id === birthday.id);
                    if (index > -1) {
                        Birthday.configs[this.id].splice(index, 1);
                        await this.saveConfig();
                        renderBirthdayList(type);
                        this.updateBirthdayDisplay(
                            this.container.querySelector('div:first-child') as HTMLElement,
                            this.container.querySelector('div:last-child') as HTMLElement
                        );
                    }
                });

                leftContent.appendChild(name);
                leftContent.appendChild(date);
                birthdayItem.appendChild(leftContent);
                birthdayItem.appendChild(days);
                birthdayItem.appendChild(deleteBtn);

                // 添加悬停效果
                birthdayItem.addEventListener('mouseover', () => {
                    birthdayItem.style.transform = 'translateY(-1px)';
                    birthdayItem.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    deleteBtn.style.opacity = '1';
                });
                birthdayItem.addEventListener('mouseout', () => {
                    birthdayItem.style.transform = 'none';
                    birthdayItem.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    deleteBtn.style.opacity = '0.6';
                });

                listContainer.appendChild(birthdayItem);
            });

            // 更新导航项的激活状态
            dialog.element.querySelectorAll('.birthday-nav-item').forEach(item => {
                item.classList.remove('birthday-nav-item--active');
                if (item.getAttribute('data-type') === type) {
                    item.classList.add('birthday-nav-item--active');
                }
            });
        };

        // 添加导航项点击事件
        dialog.element.querySelectorAll('.birthday-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.getAttribute('data-type') as 'upcoming' | 'all';
                renderBirthdayList(type);
            });
        });

        // 添加新生日按钮点击事件
        const addBtn = dialog.element.querySelector('.birthday-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddDialog();
                // 添加完成后重新渲染列表
                const currentType = dialog.element.querySelector('.birthday-nav-item--active')?.getAttribute('data-type') as 'upcoming' | 'all';
                renderBirthdayList(currentType);
            });

            // 添加按钮悬停效果
            addBtn.addEventListener('mouseover', () => {
                (addBtn as HTMLElement).style.opacity = '0.9';
            });
            addBtn.addEventListener('mouseout', () => {
                (addBtn as HTMLElement).style.opacity = '1';
            });
        }

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .birthday-nav-item:hover {
                background: var(--b3-theme-surface-light);
            }
            .birthday-nav-item--active {
                background: var(--b3-theme-primary-lighter) !important;
                color: var(--b3-theme-primary) !important;
            }
        `;
        dialog.element.appendChild(style);

        // 初始渲染即将到来的生日
        renderBirthdayList('upcoming');
    }
} 