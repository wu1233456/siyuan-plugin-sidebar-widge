export class HabitTracker {
    private container: HTMLElement;
    private progressRing: SVGElement;
    private currentValue: number = 0;
    private targetValue: number = 8;
    private title: string = "每天8杯水";
    private progressText: HTMLElement;
    private buttonsContainer: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.init();
    }

    private init() {
        // 创建卡片内容容器
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            position: relative;
        `;

        // 创建按钮容器
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 2;
        `;

        // 创建重置按钮
        const resetButton = this.createButton('↺', '重置');
        resetButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setCurrentValue(0);
        });

        // 创建增加按钮
        const addButton = this.createButton('+', '增加');
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentValue < this.targetValue) {
                this.setCurrentValue(this.currentValue + 1);
            }
        });

        this.buttonsContainer.appendChild(resetButton);
        this.buttonsContainer.appendChild(addButton);

        // 创建SVG进度环
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "120");
        svg.setAttribute("height", "120");
        svg.setAttribute("viewBox", "0 0 120 120");
        svg.style.position = "relative";
        svg.style.zIndex = "1";
        
        // 背景圆环
        const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        bgCircle.setAttribute("cx", "60");
        bgCircle.setAttribute("cy", "60");
        bgCircle.setAttribute("r", "54");
        bgCircle.setAttribute("fill", "none");
        bgCircle.setAttribute("stroke", "var(--b3-theme-background-light)");
        bgCircle.setAttribute("stroke-width", "12");

        // 进度圆环
        const progressCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        progressCircle.setAttribute("cx", "60");
        progressCircle.setAttribute("cy", "60");
        progressCircle.setAttribute("r", "54");
        progressCircle.setAttribute("fill", "none");
        progressCircle.setAttribute("stroke", "var(--b3-theme-primary)");
        progressCircle.setAttribute("stroke-width", "12");
        progressCircle.setAttribute("stroke-linecap", "round");
        progressCircle.setAttribute("transform", "rotate(-90 60 60)");
        progressCircle.style.transition = "stroke-dasharray 0.3s ease";
        this.progressRing = progressCircle;

        // 中间的文本容器
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 1;
        `;

        // 进度文本
        const progressText = document.createElement('div');
        progressText.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            color: var(--b3-theme-on-background);
        `;
        this.progressText = progressText;
        this.updateProgressText();

        // 标题文本
        const titleText = document.createElement('div');
        titleText.style.cssText = `
            font-size: 14px;
            color: var(--b3-theme-on-surface);
            margin-top: 4px;
        `;
        titleText.textContent = this.title;

        // 组装SVG
        svg.appendChild(bgCircle);
        svg.appendChild(progressCircle);

        // 组装文本容器
        textContainer.appendChild(progressText);
        textContainer.appendChild(titleText);

        // 将所有元素添加到内容容器
        const svgContainer = document.createElement('div');
        svgContainer.style.cssText = `
            position: relative;
            z-index: 1;
        `;
        svgContainer.appendChild(svg);
        svgContainer.appendChild(textContainer);
        content.appendChild(svgContainer);
        content.appendChild(this.buttonsContainer);

        // 添加到主容器
        this.container.appendChild(content);

        // 添加鼠标悬停效果
        content.addEventListener('mouseenter', () => {
            this.buttonsContainer.style.opacity = '1';
        });
        content.addEventListener('mouseleave', () => {
            this.buttonsContainer.style.opacity = '0';
        });

        // 更新进度环
        this.updateProgress(this.currentValue);
    }

    private createButton(text: string, title: string): HTMLElement {
        const button = document.createElement('div');
        button.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--b3-theme-background);
            color: var(--b3-theme-on-background);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.3s ease;
            border: 1px solid var(--b3-theme-surface-lighter);
            user-select: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;
        button.title = title;
        button.textContent = text;

        // 添加悬停效果
        button.addEventListener('mouseenter', () => {
            button.style.background = 'var(--b3-theme-primary)';
            button.style.color = 'var(--b3-theme-on-primary)';
            button.style.transform = 'scale(1.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'var(--b3-theme-background)';
            button.style.color = 'var(--b3-theme-on-background)';
            button.style.transform = 'scale(1)';
        });

        return button;
    }

    private updateProgressText() {
        this.progressText.textContent = `${this.currentValue}/${this.targetValue}`;
    }

    private updateProgress(value: number) {
        this.currentValue = value;
        const circumference = 2 * Math.PI * 54;
        const progress = value / this.targetValue;
        const dashArray = progress * circumference;
        this.progressRing.style.strokeDasharray = `${dashArray} ${circumference}`;
        this.updateProgressText();
    }

    // 公共方法：设置当前值
    public setCurrentValue(value: number) {
        if (value >= 0 && value <= this.targetValue) {
            this.updateProgress(value);
        }
    }

    // 公共方法：设置目标值
    public setTarget(value: number) {
        if (value > 0) {
            this.targetValue = value;
            this.updateProgress(this.currentValue);
        }
    }

    // 公共方法：设置标题
    public setTitle(title: string) {
        this.title = title;
        const titleElement = this.container.querySelector('div:last-child');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
} 