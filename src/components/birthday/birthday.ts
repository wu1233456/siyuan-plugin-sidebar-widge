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
        `;

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

            // 显示所有生日列表
            sortedBirthdays.forEach(birthday => {
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

                // 添加删除按钮
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '×';
                deleteButton.style.cssText = `
                    border: none;
                    background: none;
                    color: var(--b3-theme-on-surface-light);
                    cursor: pointer;
                    padding: 0 4px;
                    margin-left: 8px;
                    font-size: 14px;
                    opacity: 0;
                    transition: opacity 0.2s;
                `;
                birthdayItem.appendChild(deleteButton);

                // 显示/隐藏删除按钮
                birthdayItem.addEventListener('mouseenter', () => {
                    deleteButton.style.opacity = '1';
                });
                birthdayItem.addEventListener('mouseleave', () => {
                    deleteButton.style.opacity = '0';
                });

                // 删除功能
                deleteButton.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const index = Birthday.configs[this.id].findIndex(b => b.id === birthday.id);
                    if (index > -1) {
                        Birthday.configs[this.id].splice(index, 1);
                        await this.saveConfig();
                        this.updateBirthdayDisplay(leftSection, rightSection);
                    }
                });

                rightSection.appendChild(birthdayItem);
            });
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
            const content = this.container.querySelector('.card > div') as HTMLElement;
            if (content) {
                const leftSection = content.children[0] as HTMLElement;
                const rightSection = content.children[1] as HTMLElement;
                if (leftSection && rightSection) {
                    this.updateBirthdayDisplay(leftSection, rightSection);
                }
            }

            dialog.destroy();
        });
    }
} 