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
        this.muyuImage.src = "https://i-blog.csdnimg.cn/direct/0bec4273d8bb43d38561f7f0c28435f6.png";
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