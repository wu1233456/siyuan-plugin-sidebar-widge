export class Muyu  {
    private element: HTMLElement;
    private count: number = 0;
    private countElement: HTMLElement;
    private muyuImage: HTMLImageElement;
    private tipElement: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.classList.add('muyu-container');
        this.init();
    }

    private init() {
        // 创建内容容器
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 180px;
        `;
        this.element.appendChild(content);

        // 创建顶部文本容器
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: auto;
        `;
        content.appendChild(textContainer);

        // 创建计数显示
        this.countElement = document.createElement('div');
        this.countElement.textContent = `已敲${this.count}次`;
        this.countElement.style.cssText = `
            font-size: 20px;
            font-weight: bold;
            color: #c4a484;
            margin-bottom: 4px;
        `;
        textContainer.appendChild(this.countElement);

        // 创建提示文本
        this.tipElement = document.createElement('div');
        this.tipElement.textContent = '木鱼一敲 烦恼丢掉';
        this.tipElement.style.cssText = `
            font-size: 14px;
            color: #c4a484;
        `;
        textContainer.appendChild(this.tipElement);

        // 创建木鱼图片
        this.muyuImage = document.createElement('img');
        // this.muyuImage.src = "https://i-blog.csdnimg.cn/direct/0bec4273d8bb43d38561f7f0c28435f6.png";
        // this.muyuImage.src = "@/assets/muyu.png";
        this.muyuImage.src = "data:image/png;base64,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";
        this.muyuImage.style.cssText = `
            width: 100px;
            height: 100px;
            cursor: pointer;
            transition: transform 0.1s ease;
            user-select: none;
            -webkit-user-drag: none;
            margin-top: auto;
        `;
        content.appendChild(this.muyuImage);

        // 添加点击事件
        this.muyuImage.addEventListener('click', () => {
            // 播放点击动画
            this.muyuImage.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.muyuImage.style.transform = 'scale(1)';
            }, 100);

            // 更新计数
            this.count++;
            this.countElement.textContent = `已敲${this.count}次`;

            // 播放木鱼音效
            const audio = new Audio('/plugins/siyuan-plugin-sidebar-widget/src/static/muyu.mp3');
            audio.play();
        });
    }
} 