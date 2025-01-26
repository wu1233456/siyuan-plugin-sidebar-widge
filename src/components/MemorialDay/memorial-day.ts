import { Dialog } from "siyuan";

export enum RepeatType {
    NONE = "不重复",
    WEEKLY = "每周",
    MONTHLY = "每月",
    YEARLY = "每年"
}

export class MemorialDay {
    private container: HTMLElement;
    private title: string;
    private date: Date;
    private dayElement: HTMLElement;
    private repeatType: RepeatType;
    private titleElement: HTMLElement;
    private dateElement: HTMLElement;

    constructor(container: HTMLElement, title: string = "你在世界已经", date: Date = new Date('1997-10-01'), repeatType: RepeatType = RepeatType.NONE) {
        this.container = container;
        this.title = title;
        this.date = date;
        this.repeatType = repeatType;
        this.init();
        this.updateDays();
        setInterval(() => this.updateDays(), 1000 * 60 * 60); // 每小时更新一次
    }

    private init() {
        const card = document.createElement('div');
        card.className = 'memorial-day-card';
        card.style.cssText = `
            padding: 16px;
            text-align: left;
            color: var(--b3-theme-on-surface);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        `;

        // 左侧信息容器
        const leftContainer = document.createElement('div');
        leftContainer.style.cssText = `
            flex: 1;
            margin-right: 16px;
        `;

        // 添加点击事件
        card.addEventListener('click', () => this.showSettingsDialog());

        this.titleElement = document.createElement('div');
        this.titleElement.textContent = this.title;
        this.titleElement.style.cssText = `
            font-size: 14px;
            margin-bottom: 8px;
        `;

        this.dayElement = document.createElement('div');
        this.dayElement.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            margin: 8px 0;
            color: var(--b3-theme-primary);
        `;

        this.dateElement = document.createElement('div');
        this.dateElement.textContent = this.formatDate(this.date);
        this.dateElement.style.cssText = `
            font-size: 12px;
            color: var(--b3-theme-on-surface-light);
        `;

        leftContainer.appendChild(this.titleElement);
        leftContainer.appendChild(this.dayElement);
        leftContainer.appendChild(this.dateElement);

        // 右侧日历容器
        const calendarContainer = document.createElement('div');
        calendarContainer.style.cssText = `
            min-width: 110px;
            width: 110px;
            margin-left: 8px;
        `;

        // 检查容器宽度并设置日历显示
        const updateCalendarVisibility = () => {
            if (this.container.offsetWidth >= 200) {
                calendarContainer.style.display = 'block';
            } else {
                calendarContainer.style.display = 'none';
            }
        };

        // 初始检查
        updateCalendarVisibility();

        // 监听容器大小变化
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(updateCalendarVisibility);
            resizeObserver.observe(this.container);
        }

        this.updateCalendar(calendarContainer);

        card.appendChild(leftContainer);
        card.appendChild(calendarContainer);
        this.container.appendChild(card);
    }

    private updateCalendar(container: HTMLElement) {
        const currentDate = new Date();
        const targetDate = new Date(this.date);
        
        // 设置日历显示的月份
        let displayMonth: Date;
        if (this.repeatType === RepeatType.NONE) {
            displayMonth = new Date(this.date);
        } else {
            displayMonth = new Date();
            if (targetDate.getDate() < currentDate.getDate()) {
                displayMonth.setMonth(displayMonth.getMonth() + 1);
            }
        }

        const firstDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
        const lastDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0);
        
        // 创建星期头部
        const weekHeader = document.createElement('div');
        weekHeader.style.cssText = `
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-size: 10px;
            color: var(--b3-theme-on-surface-light);
            margin-bottom: 1px;
        `;
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        weekDays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            if (day === '日' || day === '六') {
                dayElement.style.color = 'var(--b3-theme-error)';
            }
            weekHeader.appendChild(dayElement);
        });

        // 创建日期网格
        const daysGrid = document.createElement('div');
        daysGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0px;
            text-align: center;
            font-size: 10px;
        `;

        // 填充日期前的空白
        const firstDayOfWeek = firstDay.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.style.padding = '4px';
            daysGrid.appendChild(emptyDay);
        }

        // 填充日期
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day.toString();
            dayElement.style.cssText = `
                padding: 1px;
                border-radius: 2px;
            `;

            const currentDayDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
            const isWeekend = currentDayDate.getDay() === 0 || currentDayDate.getDay() === 6;
            
            if (isWeekend) {
                dayElement.style.color = 'var(--b3-theme-error)';
            }

            // 标记目标日期
            if (day === targetDate.getDate() && 
                displayMonth.getMonth() === targetDate.getMonth() && 
                displayMonth.getFullYear() === targetDate.getFullYear()) {
                dayElement.style.backgroundColor = 'var(--b3-theme-error)';
                dayElement.style.color = 'white';
            }

            daysGrid.appendChild(dayElement);
        }

        // 清空并添加新的日历内容
        container.innerHTML = '';
        container.appendChild(weekHeader);
        container.appendChild(daysGrid);
    }

    private showSettingsDialog() {
        const dialog = new Dialog({
            title: "纪念日设置",
            content: `
                <div class="b3-dialog__content">
                    <div class="b3-dialog__item">
                        <label>事件名称</label>
                        <input class="b3-text-field" type="text" value="${this.title}">
                    </div>
                    <div class="b3-dialog__item">
                        <label>日期</label>
                        <input class="b3-text-field" type="date" value="${this.formatDate(this.date)}">
                    </div>
                    <div class="b3-dialog__item">
                        <label>重复频率</label>
                        <select class="b3-select">
                            ${Object.values(RepeatType).map(type => 
                                `<option value="${type}" ${type === this.repeatType ? 'selected' : ''}>${type}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="b3-dialog__action">
                    <button class="b3-button b3-button--cancel">取消</button>
                    <button class="b3-button b3-button--text">保存</button>
                </div>
            `,
            width: "520px",
        });

        const saveButton = dialog.element.querySelector('.b3-button--text') as HTMLButtonElement;
        const cancelButton = dialog.element.querySelector('.b3-button--cancel') as HTMLButtonElement;

        saveButton.addEventListener("click", () => {
            const titleInput = dialog.element.querySelector('input[type="text"]') as HTMLInputElement;
            const dateInput = dialog.element.querySelector('input[type="date"]') as HTMLInputElement;
            const repeatSelect = dialog.element.querySelector('select') as HTMLSelectElement;

            this.title = titleInput.value;
            this.date = new Date(dateInput.value);
            this.repeatType = repeatSelect.value as RepeatType;

            // 更新卡片显示
            this.titleElement.textContent = this.title;
            this.dateElement.textContent = this.formatDate(this.date);
            this.updateDays();
            
            // 更新日历
            const calendarContainer = this.container.querySelector('.memorial-day-card > div:last-child') as HTMLElement;
            this.updateCalendar(calendarContainer);
            
            dialog.destroy();
        });

        cancelButton.addEventListener("click", () => {
            dialog.destroy();
        });
    }

    private calculateDays(): number {
        const now = new Date();
        const timeDiff = now.getTime() - this.date.getTime();
        
        switch (this.repeatType) {
            case RepeatType.NONE:
                return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            case RepeatType.WEEKLY: {
                const daysSinceLastOccurrence = timeDiff % (7 * 24 * 60 * 60 * 1000);
                return Math.ceil((7 * 24 * 60 * 60 * 1000 - daysSinceLastOccurrence) / (1000 * 60 * 60 * 24));
            }
            case RepeatType.MONTHLY: {
                const targetDate = new Date(this.date);
                targetDate.setMonth(now.getMonth());
                targetDate.setFullYear(now.getFullYear());
                if (targetDate < now) {
                    targetDate.setMonth(targetDate.getMonth() + 1);
                }
                return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            }
            case RepeatType.YEARLY: {
                const targetDate = new Date(this.date);
                targetDate.setFullYear(now.getFullYear());
                if (targetDate < now) {
                    targetDate.setFullYear(targetDate.getFullYear() + 1);
                }
                return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            }
        }
    }

    private updateDays() {
        const days = this.calculateDays();
        if (this.repeatType === RepeatType.NONE) {
            this.dayElement.textContent = `${days}天`;
        } else {
            this.dayElement.textContent = `还有${days}天`;
        }
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
} 