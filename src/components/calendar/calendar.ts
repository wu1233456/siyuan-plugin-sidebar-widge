import * as api from '../../api';
import { openTab, openMobileFileById, getFrontend } from 'siyuan';

export class Calendar  {
    private element: HTMLElement;
    private currentDate: Date;
    private selectedDate: Date;
    private notebooks: any[] = [];
    private selectedNotebook: any = null;
    private existingNotes: Set<string> = new Set();
    private existingNoteIds: Map<string, string> = new Map(); // 存储日期和文档ID的映射
    private isMobile: boolean;

    constructor(element: HTMLElement) {
        this.element = element;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        this.init();
        this.loadNotebooks();
    }

    private async loadNotebooks() {
        try {
            const response = await api.lsNotebooks();
            if (response.notebooks) {
                this.notebooks = response.notebooks;
                if (this.notebooks.length > 0) {
                    await this.selectNotebook(this.notebooks[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load notebooks:', error);
        }
    }

    private async selectNotebook(notebook: any) {
        try {
            const { conf } = await api.getNotebookConf(notebook.id);
            let { dailyNoteSavePath, dailyNoteTemplatePath } = conf;
            
            // 处理保存路径中的模板变量
            dailyNoteSavePath = dailyNoteSavePath.replace(/\{\{(.*?)\}\}/g, match =>
                match.replace(/\bnow\b(?=(?:(?:[^"]*"){2})*[^"]*$)/g, `(toDate "2006-01-02" "[[dateSlot]]")`)
            );

            // 处理模板路径
            if (dailyNoteTemplatePath) {
                const system = await api.request('/api/system/getConf', {});
                dailyNoteTemplatePath = system.conf.system.dataDir + '/templates' + dailyNoteTemplatePath;
            }

            this.selectedNotebook = {
                ...notebook,
                dailyNoteSavePath,
                dailyNoteTemplatePath
            };
            
            await this.loadExistingNotes();
        } catch (error) {
            console.error('Failed to get notebook config:', error);
        }
    }

    private async getSavePath(date: Date) {
        if (!this.selectedNotebook?.dailyNoteSavePath) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const path = this.selectedNotebook.dailyNoteSavePath.replaceAll('[[dateSlot]]', dateStr);
        return api.renderSprig(path);
    }

    private async loadExistingNotes() {
        if (!this.selectedNotebook) return;
        
        const currentMonth = this.currentDate.getMonth() + 1;
        const currentYear = this.currentDate.getFullYear();
        const yearMonth = `${currentYear}${String(currentMonth).padStart(2, '0')}`;
        
        try {
            const sql = `
                SELECT b.* FROM blocks b 
                JOIN attributes a ON b.id = a.block_id 
                WHERE b.type = 'd' 
                AND b.box = '${this.selectedNotebook.id}'
                AND a.name LIKE 'custom-dailynote-${yearMonth}__'
            `;
            const notes = await api.sql(sql);
            
            this.existingNotes.clear();
            this.existingNoteIds.clear();
            notes.forEach((note: any) => {
                const match = note.ial?.match(/custom-dailynote-(\d{8})/);
                if (match) {
                    const dateStr = match[1].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
                    this.existingNotes.add(dateStr);
                    this.existingNoteIds.set(dateStr, note.id);
                }
            });
            
            this.renderCalendar();
        } catch (error) {
            console.error('Failed to load existing notes:', error);
        }
    }

    private async createDailyNote(date: Date) {
        if (!this.selectedNotebook) return;

        try {
            // 获取保存路径
            const path = await this.getSavePath(date);
            if (!path) return;

            const docID = await api.createDocWithMd(this.selectedNotebook.id, path, '');

            // 如果有模板，则应用模板
            if (this.selectedNotebook.dailyNoteTemplatePath) {
                const res = await api.render(docID, this.selectedNotebook.dailyNoteTemplatePath);
                await api.prependBlock('dom', res.content, docID);
            }

            // 设置自定义属性
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;
            const attrName = `custom-dailynote-${dateStr}`;
            const attrs: { [key: string]: string } = {};
            attrs[attrName] = dateStr;
            await api.setBlockAttrs(docID, attrs);

            // 添加到已存在笔记集合中
            const formattedDateStr = `${year}-${month}-${day}`;
            this.existingNotes.add(formattedDateStr);
            this.existingNoteIds.set(formattedDateStr, docID);
            this.renderCalendar();

            return docID;
        } catch (error) {
            console.error('Failed to create daily note:', error);
        }
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
                <div class="calendar-footer">
                    <button class="calendar-today">今天</button>
                    <select class="notebook-select"></select>
                </div>
            </div>
        `;

        this.element.querySelector('.prev-year')?.addEventListener('click', () => this.previousYear());
        this.element.querySelector('.prev-month')?.addEventListener('click', () => this.previousMonth());
        this.element.querySelector('.next-month')?.addEventListener('click', () => this.nextMonth());
        this.element.querySelector('.next-year')?.addEventListener('click', () => this.nextYear());

        const notebookSelect = this.element.querySelector('.notebook-select');
        if (notebookSelect) {
            notebookSelect.addEventListener('change', async (e) => {
                const select = e.target as HTMLSelectElement;
                const notebook = this.notebooks.find(n => n.id === select.value);
                if (notebook) {
                    await this.selectNotebook(notebook);
                }
            });
        }

        this.element.querySelector('.calendar-today')?.addEventListener('click', () => this.goToToday());
        
        this.renderCalendar();
        this.addStyles();
    }

    private addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .calendar-widget {
                padding: 12px;
                font-family: var(--b3-font-family);
                color: var(--b3-theme-on-background);
                background: var(--b3-theme-surface);
                border-radius: 6px;
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
                transition: all 0.2s ease;
            }
            
            .calendar-header button:hover {
                opacity: 1;
                color: var(--b3-theme-primary);
            }

            .calendar-header .current-month {
                font-size: 15px;
                font-weight: 500;
                min-width: 100px;
                text-align: center;
            }
            
            .calendar-weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                text-align: center;
                margin-bottom: 8px;
                font-size: 13px;
                color: var(--b3-theme-on-surface);
                font-weight: 500;
            }
            
            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 4px;
                margin-bottom: 12px;
            }
            
            .calendar-day {
                position: relative;
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s ease;
                color: var(--b3-theme-on-background);
            }
            
            .calendar-day:hover {
                background-color: rgba(64, 128, 255, 0.1);
            }
            
            .calendar-day.today {
                color: var(--b3-theme-on-background);
            }

            .calendar-day.today::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background-color: rgb(64, 128, 255);
                border-radius: 50%;
            }
            
            .calendar-day.selected {
                background-color: rgb(64, 128, 255) !important;
                color: white !important;
            }
            
            .calendar-day.other-month {
                color: var(--b3-theme-on-surface);
                opacity: 0.3;
            }

            .calendar-day.has-note,
            .calendar-day.today {
                background-color: rgba(64, 128, 255, 0.1);
            }

            .calendar-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0 4px;
                border-top: 1px solid var(--b3-border-color);
                margin-top: 4px;
            }

            .calendar-today {
                color: var(--b3-theme-primary);
                cursor: pointer;
                padding: 4px 12px;
                font-size: 13px;
                background: none;
                border: 1px solid var(--b3-theme-primary);
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .calendar-today:hover {
                background-color: var(--b3-theme-primary);
                color: white;
            }

            .notebook-select {
                padding: 4px 8px;
                border: 1px solid var(--b3-border-color);
                border-radius: 4px;
                background: var(--b3-theme-background);
                color: var(--b3-theme-on-background);
                font-size: 13px;
                min-width: 120px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .notebook-select:hover, .notebook-select:focus {
                border-color: var(--b3-theme-primary);
                outline: none;
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

        // 更新笔记本选择框
        const notebookSelect = this.element.querySelector('.notebook-select');
        if (notebookSelect) {
            notebookSelect.innerHTML = this.notebooks.map(notebook => 
                `<option value="${notebook.id}" ${this.selectedNotebook?.id === notebook.id ? 'selected' : ''}>${notebook.name}</option>`
            ).join('');
        }

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

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (this.existingNotes.has(dateStr)) {
                dayElement.classList.add('has-note');
            }

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

    private async selectDate(day: number) {
        const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
        this.selectedDate = date;

        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        let docId;
        if (this.existingNoteIds.has(dateStr)) {
            docId = this.existingNoteIds.get(dateStr);
        } else {
            docId = await this.createDailyNote(date);
        }

        if (docId) {
            this.openDoc(docId);
        }
        
        this.renderCalendar();
    }

    private previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.loadExistingNotes();
        this.renderCalendar();
    }

    private nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.loadExistingNotes();
        this.renderCalendar();
    }

    private previousYear() {
        this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
        this.loadExistingNotes();
        this.renderCalendar();
    }

    private nextYear() {
        this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
        this.loadExistingNotes();
        this.renderCalendar();
    }

    private goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.loadExistingNotes();
        this.renderCalendar();
    }

    private async openDoc(docId: string) {
        if (this.isMobile) {
            openMobileFileById(window.siyuan.ws.app, docId, ['cb-get-all']);
        } else {
            openTab({
                app: window.siyuan.ws.app,
                doc: {
                    id: docId,
                    zoomIn: false
                }
            });
        }
    }
} 