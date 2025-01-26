import { Dialog } from "siyuan";

export class TodoList {
    private element: HTMLElement;
    private todos: { id: number; text: string; completed: boolean; dueDate?: Date }[] = [];
    private nextId = 1;

    constructor(element: HTMLElement) {
        this.element = element;
        this.initUI();
        this.loadTodos();
    }

    private initUI() {
        this.element.innerHTML = `
            <div class="todo-list-container" style="padding: 10px; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; font-size: 14px;">待办事项</div>
                    <div class="todo-add-btn" style="cursor: pointer;">
                        <svg class="todo-add-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </div>
                </div>
                <div class="todo-list" style="overflow-y: auto; max-height: calc(100% - 40px);"></div>
            </div>
        `;

        const addBtn = this.element.querySelector('.todo-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddDialog());
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
        this.saveTodos();
        this.renderTodos();
    }

    private toggleTodo(id: number) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
        }
    }

    private deleteTodo(id: number) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
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
                padding: 6px;
                border-bottom: 1px solid var(--b3-theme-surface-lighter);
                gap: 6px;
                font-size: 13px;
            `;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.style.transform = 'scale(0.9)';
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

            const contentContainer = document.createElement('div');
            contentContainer.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
                cursor: pointer;
            `;
            contentContainer.addEventListener('click', () => this.showEditDialog(todo));

            const text = document.createElement('span');
            text.textContent = todo.text;
            text.style.cssText = `
                font-size: 13px;
                ${todo.completed ? 'text-decoration: line-through; color: var(--b3-theme-on-surface-light);' : ''}
            `;

            contentContainer.appendChild(text);

            if (todo.dueDate) {
                const dateText = document.createElement('span');
                dateText.textContent = this.formatDate(todo.dueDate);
                dateText.style.cssText = `
                    font-size: 11px;
                    color: var(--b3-theme-on-surface-light);
                `;
                contentContainer.appendChild(dateText);
            }

            const deleteBtn = document.createElement('div');
            deleteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
            `;
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

            todoElement.appendChild(checkbox);
            todoElement.appendChild(contentContainer);
            todoElement.appendChild(deleteBtn);
            listElement.appendChild(todoElement);
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
            this.saveTodos();
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

    private saveTodos() {
        localStorage.setItem('todo-list', JSON.stringify({
            todos: this.todos,
            nextId: this.nextId
        }));
    }

    private loadTodos() {
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
} 