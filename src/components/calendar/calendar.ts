export class Calendar  {
    private element: HTMLElement;
    private currentDate: Date;
    private selectedDate: Date;

    constructor(element: HTMLElement) {
        this.element = element;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.init();
    }

    private init() {
        this.element.innerHTML = `
            <div class="calendar-widget">
                <div class="calendar-header">
                    <button class="prev-year">«</button>
                    <button class="prev-month">‹</button>
                    <span class="current-month"></span>
                    <button class="next-month">›</button>
                    <button class="next-year">»</button>
                </div>
                <div class="calendar-weekdays">
                    <div>日</div>
                    <div>一</div>
                    <div>二</div>
                    <div>三</div>
                    <div>四</div>
                    <div>五</div>
                    <div>六</div>
                </div>
                <div class="calendar-days"></div>
                <div class="calendar-today">今天</div>
            </div>
        `;

        this.element.querySelector('.prev-year')?.addEventListener('click', () => this.previousYear());
        this.element.querySelector('.prev-month')?.addEventListener('click', () => this.previousMonth());
        this.element.querySelector('.next-month')?.addEventListener('click', () => this.nextMonth());
        this.element.querySelector('.next-year')?.addEventListener('click', () => this.nextYear());
        this.element.querySelector('.calendar-today')?.addEventListener('click', () => this.goToToday());

        this.renderCalendar();
        this.addStyles();
    }

    private addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .calendar-widget {
                padding: 8px;
                font-family: var(--b3-font-family);
                color: var(--b3-theme-on-background);
                background: var(--b3-theme-surface);
                border-radius: 4px;
                box-shadow: var(--b3-point-shadow);
            }
            
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding: 4px 0;
            }
            
            .calendar-header button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px 8px;
                color: var(--b3-theme-on-background);
                font-size: 16px;
                opacity: 0.7;
            }
            
            .calendar-header button:hover {
                opacity: 1;
            }

            .calendar-header .current-month {
                font-size: 14px;
                font-weight: 500;
            }
            
            .calendar-weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                text-align: center;
                margin-bottom: 8px;
                font-size: 12px;
                color: var(--b3-theme-on-surface);
            }
            
            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 4px;
                margin-bottom: 8px;
            }
            
            .calendar-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .calendar-day:hover {
                background-color: rgba(var(--b3-theme-primary-rgb), .1);
                color: var(--b3-theme-primary);
            }
            
            .calendar-day.today {
                background-color: var(--b3-theme-primary);
                color: white;
            }
            
            .calendar-day.selected {
                background-color: rgba(var(--b3-theme-primary-rgb), .1);
                color: var(--b3-theme-primary);
            }
            
            .calendar-day.other-month {
                color: var(--b3-theme-on-surface);
                opacity: 0.3;
            }

            .calendar-today {
                text-align: center;
                color: var(--b3-theme-primary);
                cursor: pointer;
                padding: 4px;
                font-size: 13px;
                margin-top: 8px;
                border-top: 1px solid var(--b3-border-color);
            }

            .calendar-today:hover {
                background-color: rgba(var(--b3-theme-primary-rgb), .1);
                border-radius: 4px;
            }
        `;
        this.element.appendChild(style);
    }

    private renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份显示
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        const monthDisplay = this.element.querySelector('.current-month');
        if (monthDisplay) {
            monthDisplay.textContent = `${year}年 ${monthNames[month]}`;
        }

        // 获取当月第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // 获取上个月的最后几天
        const prevMonthLastDay = new Date(year, month, 0);
        const prevMonthDays = prevMonthLastDay.getDate();
        const firstDayOfWeek = firstDay.getDay();

        // 获取当前日期信息
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        // 生成日历天数
        const daysContainer = this.element.querySelector('.calendar-days');
        if (!daysContainer) return;

        daysContainer.innerHTML = '';

        // 添加上个月的天数
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = String(prevMonthDays - i);
            daysContainer.appendChild(dayElement);
        }

        // 添加当月的天数
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = String(day);

            if (isCurrentMonth && day === today.getDate()) {
                dayElement.classList.add('today');
            }

            if (day === this.selectedDate.getDate() && 
                month === this.selectedDate.getMonth() && 
                year === this.selectedDate.getFullYear()) {
                dayElement.classList.add('selected');
            }

            dayElement.addEventListener('click', () => this.selectDate(day));
            daysContainer.appendChild(dayElement);
        }

        // 添加下个月的天数
        const totalDays = firstDayOfWeek + lastDay.getDate();
        const remainingDays = 42 - totalDays; // 6 rows × 7 days = 42
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = String(day);
            daysContainer.appendChild(dayElement);
        }
    }

    private selectDate(day: number) {
        this.selectedDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );
        this.renderCalendar();
    }

    private previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    private nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    private previousYear() {
        this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
        this.renderCalendar();
    }

    private nextYear() {
        this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
        this.renderCalendar();
    }

    private goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.renderCalendar();
    }
} 