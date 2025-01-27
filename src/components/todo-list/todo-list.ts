import { Dialog } from "siyuan";
import { getFile, putFile } from "../../api";

interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
    dueDate?: Date;
}

interface TodoItemStorage {
    id: number;
    text: string;
    completed: boolean;
    dueDate?: string;
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
        this.configPath = "/data/storage/todo-list.json";
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
                    dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
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
                dueDate: todo.dueDate ? todo.dueDate.toISOString() : undefined
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
                dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
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
                    width: 40px;
                    padding: 12px 8px;
                    background: var(--b3-theme-surface);
                    border-radius: 12px 0 0 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                ">
                    <div style="
                        font-size: 16px;
                        font-weight: 600;
                        color: var(--b3-theme-on-background);
                        text-align: center;
                    ">${this.todos.length}</div>
                    <div style="
                        font-size: 11px;
                        color: var(--b3-theme-on-surface-light);
                        text-align: center;
                    ">待办事项</div>
                    <div class="todo-add-btn" style="
                        cursor: pointer;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: #4285f4;
                        color: white;
                        margin: auto auto 0;
                        transition: all 0.2s ease;
                    ">
                        <svg class="todo-add-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </div>
                </div>
                <!-- 右侧列表 -->
                <div class="todo-list" style="
                    flex: 1;
                    padding: 12px;
                    overflow-y: auto;
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
        
        this.todos.forEach(todo => {
            const todoElement = document.createElement('div');
            todoElement.style.cssText = `
                display: flex;
                align-items: center;
                padding: 4px 8px;
                margin-bottom: 2px;
                border-radius: 4px;
                background: var(--b3-theme-surface);
                gap: 6px;
                cursor: pointer;
                min-width: 0;
                height: 22px;
            `;
            
            // 为整个待办事项添加点击事件
            todoElement.addEventListener('click', (e) => {
                // 如果点击的是复选框或删除按钮，不触发弹窗
                const target = e.target as HTMLElement;
                if (!(target instanceof HTMLInputElement) && 
                    !target.closest('.todo-delete-btn')) {
                    this.showAllTodosDialog();
                }
            });

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
            todoElement.appendChild(deleteBtn);
            listElement.appendChild(todoElement);
        });
    }

    private showAllTodosDialog() {
        const dialog = new Dialog({
            title: "全部待办事项",
            content: `
                <div class="b3-dialog__content" style="
                    padding: 20px;
                    max-height: 70vh;
                    overflow-y: auto;
                ">
                    ${this.todos.map(todo => `
                        <div style="
                            display: flex;
                            align-items: center;
                            padding: 8px;
                            border-bottom: 1px solid var(--b3-theme-surface-lighter);
                            gap: 8px;
                        ">
                            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                                style="width: 14px; height: 14px; accent-color: var(--b3-theme-primary);"
                                onchange="window.todoList_${this.nextId}_toggleTodo(${todo.id})"
                            >
                            <span style="
                                flex: 1;
                                font-size: 14px;
                                ${todo.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}
                            ">${todo.text}</span>
                            ${todo.dueDate ? `
                                <span style="
                                    font-size: 12px;
                                    color: var(--b3-theme-on-surface-light);
                                ">${this.formatDate(todo.dueDate)}</span>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `,
            width: "500px",
        });

        // 添加全局函数用于复选框切换
        (window as any)[`todoList_${this.nextId}_toggleTodo`] = (id: number) => {
            this.toggleTodo(id);
            dialog.destroy();
            this.showAllTodosDialog();
        };

        // 清理全局函数
        dialog.element.addEventListener('close', () => {
            delete (window as any)[`todoList_${this.nextId}_toggleTodo`];
        });
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