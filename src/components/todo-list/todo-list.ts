import { Dialog } from "siyuan";
import { getFile, putFile } from "../../api";

interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
    dueDate?: Date;
    priority?: 'high' | 'medium' | 'low' | 'none';
}

interface TodoItemStorage {
    id: number;
    text: string;
    completed: boolean;
    dueDate?: string;
    priority?: 'high' | 'medium' | 'low' | 'none';
}

interface TodoListConfig {
    todos: TodoItemStorage[];
    nextId: number;
}

export class TodoList {
    private element: HTMLElement;
    private todos: TodoItem[] = [];
    private nextId = 1;
    private configPath: string;

    constructor(element: HTMLElement) {
        this.element = element;
        this.configPath = "/data/storage/siyuan-plugin-sidebar-widget/todo-list.json";
        this.initUI();
        this.loadConfig();
    }

    private async loadConfig() {
        try {
            const config = await getFile(this.configPath);
            if (config) {
                this.todos = (config.todos as TodoItemStorage[]).map(todo => ({
                    id: todo.id,
                    text: todo.text,
                    completed: todo.completed,
                    dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
                    priority: todo.priority as TodoItem['priority']
                }));
                this.nextId = config.nextId;
                this.renderTodos();
                console.log("加载待办事项配置成功");
            }
        } catch (e) {
            console.log("加载待办事项配置失败，使用默认配置");
            this.loadFromLocalStorage();
        }
    }

    private async saveConfig() {
        const config: TodoListConfig = {
            todos: this.todos.map(todo => ({
                id: todo.id,
                text: todo.text,
                completed: todo.completed,
                dueDate: todo.dueDate ? todo.dueDate.toISOString() : undefined,
                priority: todo.priority
            })),
            nextId: this.nextId
        };
        try {
            await putFile(this.configPath, false, new Blob([JSON.stringify(config)], { type: "application/json" }));
            console.log("保存待办事项配置成功");
            this.saveToLocalStorage();
        } catch (e) {
            console.error("保存待办事项配置失败", e);
            this.saveToLocalStorage();
        }
    }

    private loadFromLocalStorage() {
        const saved = localStorage.getItem('todo-list');
        if (saved) {
            const data = JSON.parse(saved);
            this.todos = data.todos.map((todo: any) => ({
                ...todo,
                dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
                priority: todo.priority as TodoItem['priority']
            }));
            this.nextId = data.nextId;
            this.renderTodos();
        }
    }

    private saveToLocalStorage() {
        localStorage.setItem('todo-list', JSON.stringify({
            todos: this.todos,
            nextId: this.nextId
        }));
    }

    private updateCounter() {
        const counterElement = this.element.querySelector('.todo-counter');
        if (counterElement) {
            const uncompletedCount = this.todos.filter(todo => !todo.completed).length;
            counterElement.textContent = String(uncompletedCount);
        }
    }

    private initUI() {
        this.element.innerHTML = `
            <div class="todo-list-container" style="
                height: 100%;
                display: flex;
                background: var(--b3-theme-background);
                border-radius: 12px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            ">
                <!-- 左侧面板 -->
                <div style="
                    width: 32px;
                    padding: 10px 4px;
                    background: var(--b3-theme-surface);
                    border-radius: 12px 0 0 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                ">
                    <div class="todo-counter" style="
                        font-size: 14px;
                        font-weight: 600;
                        color: var(--b3-theme-on-background);
                        text-align: center;
                    ">0</div>
                    <div style="
                        font-size: 10px;
                        color: var(--b3-theme-on-surface-light);
                        text-align: center;
                    ">待办</div>
                    <div class="todo-add-btn" style="
                        cursor: pointer;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: #4285f4;
                        color: white;
                        margin: auto auto 0;
                        transition: all 0.2s ease;
                    ">
                        <svg class="todo-add-icon" viewBox="0 0 24 24" width="14" height="14">
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </div>
                </div>
                <!-- 右侧列表 -->
                <div class="todo-list" style="
                    flex: 1;
                    padding: 12px;
                    overflow-y: auto;
                    cursor: pointer;
                "></div>
            </div>
        `;

        const addBtn = this.element.querySelector('.todo-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddDialog());
            // 添加悬停效果
            addBtn.addEventListener('mouseover', () => {
                (addBtn as HTMLElement).style.transform = 'scale(1.1)';
            });
            addBtn.addEventListener('mouseout', () => {
                (addBtn as HTMLElement).style.transform = 'scale(1)';
            });
        }

        // 为右侧面板添加点击事件
        const listElement = this.element.querySelector('.todo-list');
        if (listElement) {
            listElement.addEventListener('click', (e) => {
                // 如果点击的不是复选框或删除按钮，则显示设置页面
                const target = e.target as HTMLElement;
                if (!(target instanceof HTMLInputElement) && 
                    !target.closest('.todo-delete-btn')) {
                    this.showAllTodosDialog();
                }
            });
        }

        this.renderTodos();
    }

    private showAddDialog() {
        const dialog = new Dialog({
            title: "添加待办事项",
            content: `
                <div class="b3-dialog__content" style="padding: 20px;">
                    <div class="b3-dialog__item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">待办内容</label>
                        <input class="b3-text-field" type="text" placeholder="请输入待办事项" style="
                            width: 100%;
                            padding: 8px 12px;
                            border-radius: 6px;
                            border: 1px solid var(--b3-theme-surface-lighter);
                            background: var(--b3-theme-surface);
                            transition: all 0.3s ease;
                        ">
                    </div>
                    <div class="b3-dialog__item">
                        <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">截止时间</label>
                        <input class="b3-text-field" type="datetime-local" style="
                            width: 100%;
                            padding: 8px 12px;
                            border-radius: 6px;
                            border: 1px solid var(--b3-theme-surface-lighter);
                            background: var(--b3-theme-surface);
                            transition: all 0.3s ease;
                        ">
                    </div>
                </div>
                <div class="b3-dialog__action" style="
                    padding: 16px;
                    border-top: 1px solid var(--b3-theme-surface-lighter);
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                ">
                    <button class="b3-button b3-button--cancel" style="
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 14px;
                    ">取消</button>
                    <button class="b3-button b3-button--text" style="
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 14px;
                        background: var(--b3-theme-primary);
                        color: white;
                    ">保存</button>
                </div>
            `,
            width: "400px",
        });

        // 添加输入框焦点样式
        const inputs = dialog.element.querySelectorAll('.b3-text-field') as NodeListOf<HTMLElement>;
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = 'var(--b3-theme-primary)';
                input.style.boxShadow = '0 0 0 2px var(--b3-theme-primary-lighter)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = 'var(--b3-theme-surface-lighter)';
                input.style.boxShadow = 'none';
            });
        });

        const saveButton = dialog.element.querySelector('.b3-button--text') as HTMLButtonElement;
        const cancelButton = dialog.element.querySelector('.b3-button--cancel') as HTMLButtonElement;
        const textInput = dialog.element.querySelector('input[type="text"]') as HTMLInputElement;
        const dateInput = dialog.element.querySelector('input[type="datetime-local"]') as HTMLInputElement;

        // 添加按钮悬停效果
        saveButton.addEventListener('mouseover', () => {
            saveButton.style.opacity = '0.9';
        });
        saveButton.addEventListener('mouseout', () => {
            saveButton.style.opacity = '1';
        });

        // 设置默认时间为当前时间
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

        textInput.focus();

        saveButton.addEventListener('click', () => {
            const text = textInput.value.trim();
            if (text) {
                const dueDate = dateInput.value ? new Date(dateInput.value) : undefined;
                this.addTodo(text, dueDate);
                dialog.destroy();
            }
        });

        cancelButton.addEventListener('click', () => {
            dialog.destroy();
        });

        // 支持回车键保存
        textInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                const text = textInput.value.trim();
                if (text) {
                    const dueDate = dateInput.value ? new Date(dateInput.value) : undefined;
                    this.addTodo(text, dueDate);
                    dialog.destroy();
                }
            }
        });
    }

    private addTodo(text: string, dueDate?: Date) {
        this.todos.push({
            id: this.nextId++,
            text,
            completed: false,
            dueDate
        });
        this.saveConfig();
        this.renderTodos();
    }

    private toggleTodo(id: number) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveConfig();
            this.renderTodos();
        }
    }

    private deleteTodo(id: number) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveConfig();
        this.renderTodos();
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    private renderTodos() {
        const listElement = this.element.querySelector('.todo-list');
        if (!listElement) return;

        listElement.innerHTML = '';
        this.updateCounter();
        
        const uncompletedTodos = this.todos.filter(todo => !todo.completed);
        
        uncompletedTodos.forEach(todo => {
            const todoElement = document.createElement('div');
            todoElement.style.cssText = `
                display: flex;
                align-items: center;
                padding: 4px 8px;
                margin-bottom: 2px;
                border-radius: 4px;
                background: var(--b3-theme-surface);
                gap: 6px;
                min-width: 0;
                height: 22px;
                ${todo.priority ? this.getPriorityStyle(todo.priority) : ''}
            `;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.style.cssText = `
                width: 12px;
                height: 12px;
                cursor: pointer;
                accent-color: var(--b3-theme-primary);
                flex-shrink: 0;
            `;
            checkbox.addEventListener('change', () => {
                this.toggleTodo(todo.id);
            });

            const text = document.createElement('span');
            text.textContent = todo.text;
            text.style.cssText = `
                flex: 1;
                font-size: 12px;
                color: var(--b3-theme-on-background);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                ${todo.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}
            `;

            const moreBtn = document.createElement('div');
            moreBtn.className = 'todo-more-btn';
            moreBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="12" height="12">
                    <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
            `;
            moreBtn.style.cssText = `
                opacity: 0.6;
                cursor: pointer;
                padding: 2px;
                border-radius: 2px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showPriorityMenu(todo, moreBtn);
            });

            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'todo-delete-btn';
            deleteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="12" height="12">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
            `;
            deleteBtn.style.cssText = `
                opacity: 0.6;
                cursor: pointer;
                padding: 2px;
                border-radius: 2px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTodo(todo.id);
            });

            todoElement.appendChild(checkbox);
            todoElement.appendChild(text);
            todoElement.appendChild(moreBtn);
            todoElement.appendChild(deleteBtn);
            listElement.appendChild(todoElement);
        });
    }

    private showInlineAddInput(container: HTMLElement, renderCallback: () => void) {
        const inputWrapper = document.createElement('div');
        inputWrapper.style.cssText = `
            display: flex;
            align-items: center;
            padding: 8px;
            margin-bottom: 4px;
            border-radius: 6px;
            background: var(--b3-theme-surface);
            gap: 8px;
            border: 1px solid var(--b3-theme-primary-lighter);
        `;

        // 创建一个隐藏的时间输入框
        const dateInput = document.createElement('input');
        dateInput.type = 'datetime-local';
        dateInput.style.cssText = `
            position: absolute;
            width: 0;
            height: 0;
            opacity: 0;
            pointer-events: none;
        `;
        let selectedDate: Date | undefined = new Date();
        dateInput.value = this.formatDateForInput(selectedDate);

        // 时间选择按钮
        const timeBtn = document.createElement('button');
        timeBtn.style.cssText = `
            border: none;
            background: none;
            padding: 4px;
            cursor: pointer;
            color: var(--b3-theme-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        `;
        timeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
        `;

        // 添加时间选择按钮的悬停效果
        timeBtn.addEventListener('mouseover', () => {
            timeBtn.style.backgroundColor = 'var(--b3-theme-surface-light)';
        });
        timeBtn.addEventListener('mouseout', () => {
            timeBtn.style.backgroundColor = 'transparent';
        });

        // 时间选择按钮点击事件
        timeBtn.addEventListener('click', () => {
            dateInput.showPicker();
        });

        // 时间变化事件
        dateInput.addEventListener('change', () => {
            selectedDate = dateInput.value ? new Date(dateInput.value) : undefined;
            timeBtn.style.color = selectedDate ? 'var(--b3-theme-primary)' : 'var(--b3-theme-on-surface-light)';
        });

        // 输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '添加任务';
        input.style.cssText = `
            flex: 1;
            border: none;
            background: none;
            outline: none;
            font-size: 14px;
            color: var(--b3-theme-on-background);
            min-width: 0;
        `;

        // 确认和取消按钮
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.style.cssText = `
            display: flex;
            gap: 4px;
        `;

        const confirmBtn = document.createElement('button');
        confirmBtn.style.cssText = `
            border: none;
            background: var(--b3-theme-primary);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: opacity 0.2s;
        `;
        confirmBtn.textContent = '确定';
        confirmBtn.addEventListener('mouseover', () => {
            confirmBtn.style.opacity = '0.9';
        });
        confirmBtn.addEventListener('mouseout', () => {
            confirmBtn.style.opacity = '1';
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.style.cssText = `
            border: none;
            background: var(--b3-theme-surface-light);
            color: var(--b3-theme-on-surface);
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        `;
        cancelBtn.textContent = '取消';
        cancelBtn.addEventListener('mouseover', () => {
            cancelBtn.style.backgroundColor = 'var(--b3-theme-surface-lighter)';
        });
        cancelBtn.addEventListener('mouseout', () => {
            cancelBtn.style.backgroundColor = 'var(--b3-theme-surface-light)';
        });

        // 添加事件处理
        const handleAdd = () => {
            const text = input.value.trim();
            if (text) {
                this.addTodo(text, selectedDate);
                inputWrapper.remove();
                renderCallback(); // 添加任务后重新渲染
            }
        };

        const handleCancel = () => {
            inputWrapper.remove();
        };

        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleAdd();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        });

        confirmBtn.addEventListener('click', handleAdd);
        cancelBtn.addEventListener('click', handleCancel);

        // 组装元素
        buttonsWrapper.appendChild(confirmBtn);
        buttonsWrapper.appendChild(cancelBtn);
        inputWrapper.appendChild(timeBtn);
        inputWrapper.appendChild(dateInput);  // 添加隐藏的时间输入框
        inputWrapper.appendChild(input);
        inputWrapper.appendChild(buttonsWrapper);

        // 插入到容器的第一个位置
        if (container.firstChild) {
            container.insertBefore(inputWrapper, container.firstChild);
        } else {
            container.appendChild(inputWrapper);
        }

        input.focus();
    }

    private showAllTodosDialog() {
        const dialog = new Dialog({
            title: "待办事项",
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
                        <div class="todo-nav-item todo-nav-item--active" data-type="today" style="
                            padding: 8px 16px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 14px;
                            color: var(--b3-theme-on-background);
                        ">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            今天
                            <span class="todo-count" style="
                                margin-left: auto;
                                background: var(--b3-theme-primary);
                                color: white;
                                padding: 2px 6px;
                                border-radius: 10px;
                                font-size: 12px;
                            ">${this.todos.filter(t => !t.completed && this.isToday(t.dueDate)).length}</span>
                        </div>
                        <div class="todo-nav-item" data-type="all" style="
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
                            所有
                            <span class="todo-count" style="
                                margin-left: auto;
                                background: var(--b3-theme-primary);
                                color: white;
                                padding: 2px 6px;
                                border-radius: 10px;
                                font-size: 12px;
                            ">${this.todos.filter(t => !t.completed).length}</span>
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
                            <button class="todo-add-task-btn" style="
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
                                添加任务
                            </button>
                        </div>
                        <!-- 待办列表区域 -->
                        <div style="
                            flex: 1;
                            overflow-y: auto;
                            padding: 16px;
                            min-height: 0;
                        ">
                            <!-- 未完成列表 -->
                            <div class="todo-uncompleted">
                                <button class="todo-section-header" style="
                                    width: 100%;
                                    border: none;
                                    background: var(--b3-theme-surface);
                                    padding: 12px;
                                    margin-bottom: 12px;
                                    border-radius: 6px;
                                    font-size: 13px;
                                    color: var(--b3-theme-on-surface);
                                    font-weight: 500;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                                    text-align: left;
                                ">
                                    <span style="
                                        width: 20px;
                                        height: 20px;
                                        border-radius: 4px;
                                        background: var(--b3-theme-primary-lighter);
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        flex-shrink: 0;
                                    ">
                                        <svg viewBox="0 0 24 24" width="14" height="14">
                                            <path fill="var(--b3-theme-primary)" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                                        </svg>
                                    </span>
                                    <span style="flex: 1;">未完成</span>
                                    <span class="todo-uncompleted-count" style="
                                        background: var(--b3-theme-primary-lighter);
                                        color: var(--b3-theme-primary);
                                        padding: 2px 8px;
                                        border-radius: 10px;
                                        font-size: 12px;
                                        margin-right: 4px;
                                    ">0</span>
                                    <svg class="todo-section-arrow" viewBox="0 0 24 24" width="20" height="20" style="transition: transform 0.2s;">
                                        <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                                    </svg>
                                </button>
                                <div class="todo-list-content"></div>
                            </div>
                            <!-- 已完成列表 -->
                            <div class="todo-completed" style="margin-top: 12px;">
                                <button class="todo-section-header" style="
                                    width: 100%;
                                    border: none;
                                    background: var(--b3-theme-surface);
                                    padding: 12px;
                                    margin-bottom: 12px;
                                    border-radius: 6px;
                                    font-size: 13px;
                                    color: var(--b3-theme-on-surface);
                                    font-weight: 500;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                                    text-align: left;
                                ">
                                    <span style="
                                        width: 20px;
                                        height: 20px;
                                        border-radius: 4px;
                                        background: var(--b3-theme-success-lighter);
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        flex-shrink: 0;
                                    ">
                                        <svg viewBox="0 0 24 24" width="14" height="14">
                                            <path fill="var(--b3-theme-success)" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                        </svg>
                                    </span>
                                    <span style="flex: 1;">已完成</span>
                                    <span class="todo-completed-count" style="
                                        background: var(--b3-theme-success-lighter);
                                        color: var(--b3-theme-success);
                                        padding: 2px 8px;
                                        border-radius: 10px;
                                        font-size: 12px;
                                        margin-right: 4px;
                                    ">0</span>
                                    <svg class="todo-section-arrow" viewBox="0 0 24 24" width="20" height="20" style="transition: transform 0.2s;">
                                        <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                                    </svg>
                                </button>
                                <div class="todo-list-completed"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            width: "800px",
        });

        // 添加展开收缩功能
        const toggleSection = (header: Element) => {
            const content = header.nextElementSibling as HTMLElement;
            const arrow = header.querySelector('.todo-section-arrow') as HTMLElement;
            if (content.style.display === 'none') {
                content.style.display = 'block';
                arrow.style.transform = 'rotate(0deg)';
                (header as HTMLElement).style.backgroundColor = 'var(--b3-theme-surface)';
            } else {
                content.style.display = 'none';
                arrow.style.transform = 'rotate(-90deg)';
                (header as HTMLElement).style.backgroundColor = 'var(--b3-theme-surface-lighter)';
            }
        };

        // 添加点击事件
        dialog.element.querySelectorAll('.todo-section-header').forEach(header => {
            header.addEventListener('click', () => toggleSection(header));
            header.addEventListener('mouseover', () => {
                (header as HTMLElement).style.transform = 'translateY(-1px)';
                (header as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            });
            header.addEventListener('mouseout', () => {
                (header as HTMLElement).style.transform = 'none';
                (header as HTMLElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            });
        });

        const renderTodoList = (type: 'today' | 'all') => {
            const uncompletedContainer = dialog.element.querySelector('.todo-list-content');
            const completedContainer = dialog.element.querySelector('.todo-list-completed');
            if (!uncompletedContainer || !completedContainer) return;

            // 根据类型筛选待办事项
            const filterTodos = (todos: TodoItem[]) => {
                if (type === 'today') {
                    return todos.filter(todo => this.isToday(todo.dueDate));
                }
                return todos;
            };

            // 获取筛选后的待办事项
            const filteredTodos = filterTodos(this.todos);
            const uncompletedTodos = filteredTodos.filter(todo => !todo.completed);
            const completedTodos = filteredTodos.filter(todo => todo.completed);

            // 渲染未完成列表
            uncompletedContainer.innerHTML = '';
            uncompletedTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo, () => {
                    this.toggleTodo(todo.id);
                    renderTodoList(type);
                }, () => {
                    this.deleteTodo(todo.id);
                    renderTodoList(type);
                });
                uncompletedContainer.appendChild(todoElement);
            });

            // 渲染已完成列表
            completedContainer.innerHTML = '';
            completedTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo, () => {
                    this.toggleTodo(todo.id);
                    renderTodoList(type);
                }, () => {
                    this.deleteTodo(todo.id);
                    renderTodoList(type);
                });
                completedContainer.appendChild(todoElement);
            });

            // 更新导航项的激活状态
            dialog.element.querySelectorAll('.todo-nav-item').forEach(item => {
                item.classList.remove('todo-nav-item--active');
                if (item.getAttribute('data-type') === type) {
                    item.classList.add('todo-nav-item--active');
                }
            });

            // 更新计数器
            const uncompletedCount = dialog.element.querySelector('.todo-uncompleted-count');
            const completedCount = dialog.element.querySelector('.todo-completed-count');
            if (uncompletedCount) {
                uncompletedCount.textContent = String(uncompletedTodos.length);
            }
            if (completedCount) {
                completedCount.textContent = String(completedTodos.length);
            }
        };

        // 添加导航项点击事件
        dialog.element.querySelectorAll('.todo-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.getAttribute('data-type') as 'today' | 'all';
                renderTodoList(type);
            });
        });

        // 添加新任务按钮点击事件
        const addTaskBtn = dialog.element.querySelector('.todo-add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                const container = dialog.element.querySelector('.todo-list-content') as HTMLElement;
                if (container) {
                    const currentType = dialog.element.querySelector('.todo-nav-item--active')?.getAttribute('data-type') as 'today' | 'all';
                    this.showInlineAddInput(container, () => renderTodoList(currentType));
                }
            });
        }

        // 初始渲染今天的待办事项
        renderTodoList('today');

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .todo-nav-item:hover {
                background: var(--b3-theme-surface-light);
            }
            .todo-nav-item--active {
                background: var(--b3-theme-primary-lighter) !important;
                color: var(--b3-theme-primary) !important;
            }
            .todo-add-task-btn:hover {
                opacity: 0.9;
            }
        `;
        dialog.element.appendChild(style);

        // 将渲染函数临时保存到全局，以便优先级更新时调用
        (window as any).tempRenderFunction = renderTodoList;

        // 在对话框关闭时清理
        dialog.element.addEventListener('close', () => {
            delete (window as any).tempRenderFunction;
        });
    }

    private isToday(date?: Date): boolean {
        if (!date) return false;
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    private createTodoElement(todo: TodoItem, onToggle: () => void, onDelete: () => void): HTMLElement {
        const todoElement = document.createElement('div');
        todoElement.style.cssText = `
            display: flex;
            align-items: center;
            padding: 8px;
            margin-bottom: 4px;
            border-radius: 6px;
            background: var(--b3-theme-surface);
            gap: 8px;
            ${todo.completed ? 'opacity: 0.6;' : ''}
            ${todo.priority ? this.getPriorityStyle(todo.priority) : ''}
        `;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.style.cssText = `
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: var(--b3-theme-primary);
        `;
        checkbox.addEventListener('change', onToggle);

        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            min-width: 0;
        `;

        const text = document.createElement('div');
        text.textContent = todo.text;
        text.style.cssText = `
            font-size: 14px;
            color: var(--b3-theme-on-background);
            ${todo.completed ? 'text-decoration: line-through;' : ''}
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;

        if (todo.dueDate) {
            const date = document.createElement('div');
            date.textContent = this.formatDate(todo.dueDate);
            date.style.cssText = `
                font-size: 12px;
                color: var(--b3-theme-on-surface-light);
                margin-top: 2px;
            `;
            content.appendChild(text);
            content.appendChild(date);
        } else {
            content.appendChild(text);
        }

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'todo-delete-btn';
        deleteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
        `;
        deleteBtn.style.cssText = `
            opacity: 0.6;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        deleteBtn.addEventListener('click', onDelete);

        const moreBtn = document.createElement('div');
        moreBtn.className = 'todo-more-btn';
        moreBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
        `;
        moreBtn.style.cssText = `
            opacity: 0.6;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showPriorityMenu(todo, moreBtn);
        });

        todoElement.appendChild(checkbox);
        todoElement.appendChild(content);
        todoElement.appendChild(moreBtn);
        todoElement.appendChild(deleteBtn);

        return todoElement;
    }

    private getPriorityStyle(priority: string): string {
        const styles = {
            high: 'border-left: 3px solid var(--b3-card-error-color);',
            medium: 'border-left: 3px solid var(--b3-card-warning-color);',
            low: 'border-left: 3px solid var(--b3-card-info-color);',
            none: 'border-left: 3px solid var(--b3-card-success-color);'
        };
        return styles[priority] || '';
    }

    private showPriorityMenu(todo: TodoItem, anchorEl: HTMLElement) {
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: absolute;
            background: var(--b3-theme-background);
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 4px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 2px;
        `;

        const priorities = [
            { value: 'high', label: '高优先级', color: 'var(--b3-card-error-color)' },
            { value: 'medium', label: '中优先级', color: 'var(--b3-card-warning-color)' },
            { value: 'low', label: '低优先级', color: 'var(--b3-card-info-color)' },
            { value: 'none', label: '无优先级', color: 'var(--b3-card-success-color)' }
        ];

        // 获取当前弹窗中的渲染函数
        const dialogElement = document.querySelector('.b3-dialog__content');
        const currentType = dialogElement?.querySelector('.todo-nav-item--active')?.getAttribute('data-type') as 'today' | 'all';
        const renderFunction = dialogElement ? 
            () => (window as any).tempRenderFunction?.(currentType) : 
            undefined;

        priorities.forEach(({ value, label, color }) => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 6px 12px;
                cursor: pointer;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--b3-theme-on-background);
                ${todo.priority === value ? 'background: var(--b3-theme-surface-light);' : ''}
            `;
            item.innerHTML = `
                <span style="
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: ${color};
                "></span>
                ${label}
            `;

            item.addEventListener('mouseover', () => {
                item.style.backgroundColor = 'var(--b3-theme-surface-light)';
            });
            item.addEventListener('mouseout', () => {
                if (todo.priority !== value) {
                    item.style.backgroundColor = 'transparent';
                }
            });
            item.addEventListener('click', () => {
                this.updateTodoPriority(todo.id, value as TodoItem['priority'], renderFunction);
                menu.remove();
            });

            menu.appendChild(item);
        });

        // 定位菜单
        const rect = anchorEl.getBoundingClientRect();
        menu.style.top = rect.bottom + 4 + 'px';
        menu.style.left = rect.left + 'px';

        // 点击外部关闭菜单
        const closeMenu = (e: MouseEvent) => {
            if (!menu.contains(e.target as Node)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);

        document.body.appendChild(menu);
    }

    private updateTodoPriority(id: number, priority: TodoItem['priority'], renderCallback?: () => void) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.priority = priority;
            this.saveConfig();
            this.renderTodos();
            // 如果有回调函数，则重新渲染弹窗列表
            if (renderCallback) {
                renderCallback();
            }
        }
    }

    private showEditDialog(todo: { id: number; text: string; completed: boolean; dueDate?: Date }) {
        const dialog = new Dialog({
            title: "编辑待办事项",
            content: `
                <div class="b3-dialog__content" style="padding: 20px;">
                    <div class="b3-dialog__item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">待办内容</label>
                        <input class="b3-text-field" type="text" value="${todo.text}" style="
                            width: 100%;
                            padding: 8px 12px;
                            border-radius: 6px;
                            border: 1px solid var(--b3-theme-surface-lighter);
                            background: var(--b3-theme-surface);
                            transition: all 0.3s ease;
                        ">
                    </div>
                    <div class="b3-dialog__item">
                        <label style="display: block; margin-bottom: 8px; color: var(--b3-theme-on-surface);">截止时间</label>
                        <input class="b3-text-field" type="datetime-local" value="${todo.dueDate ? this.formatDateForInput(todo.dueDate) : ''}" style="
                            width: 100%;
                            padding: 8px 12px;
                            border-radius: 6px;
                            border: 1px solid var(--b3-theme-surface-lighter);
                            background: var(--b3-theme-surface);
                            transition: all 0.3s ease;
                        ">
                    </div>
                </div>
                <div class="b3-dialog__action" style="
                    padding: 16px;
                    border-top: 1px solid var(--b3-theme-surface-lighter);
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                ">
                    <button class="b3-button b3-button--cancel" style="
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 14px;
                    ">取消</button>
                    <button class="b3-button b3-button--text" style="
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 14px;
                        background: var(--b3-theme-primary);
                        color: white;
                    ">保存</button>
                </div>
            `,
            width: "400px",
        });

        // 添加输入框焦点样式
        const inputs = dialog.element.querySelectorAll('.b3-text-field') as NodeListOf<HTMLElement>;
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = 'var(--b3-theme-primary)';
                input.style.boxShadow = '0 0 0 2px var(--b3-theme-primary-lighter)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = 'var(--b3-theme-surface-lighter)';
                input.style.boxShadow = 'none';
            });
        });

        const saveButton = dialog.element.querySelector('.b3-button--text') as HTMLButtonElement;
        const cancelButton = dialog.element.querySelector('.b3-button--cancel') as HTMLButtonElement;
        const textInput = dialog.element.querySelector('input[type="text"]') as HTMLInputElement;
        const dateInput = dialog.element.querySelector('input[type="datetime-local"]') as HTMLInputElement;

        // 添加按钮悬停效果
        saveButton.addEventListener('mouseover', () => {
            saveButton.style.opacity = '0.9';
        });
        saveButton.addEventListener('mouseout', () => {
            saveButton.style.opacity = '1';
        });

        textInput.focus();

        saveButton.addEventListener('click', () => {
            const text = textInput.value.trim();
            if (text) {
                this.updateTodo(todo.id, text, dateInput.value ? new Date(dateInput.value) : undefined);
                dialog.destroy();
            }
        });

        cancelButton.addEventListener('click', () => {
            dialog.destroy();
        });

        // 支持回车键保存
        textInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                const text = textInput.value.trim();
                if (text) {
                    this.updateTodo(todo.id, text, dateInput.value ? new Date(dateInput.value) : undefined);
                    dialog.destroy();
                }
            }
        });
    }

    private updateTodo(id: number, text: string, dueDate?: Date) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = text;
            todo.dueDate = dueDate;
            this.saveConfig();
            this.renderTodos();
        }
    }

    private formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
} 