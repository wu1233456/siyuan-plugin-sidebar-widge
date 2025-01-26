export class DailyQuote {
    private container: HTMLElement;
    private content: HTMLElement;
    private author: HTMLElement;
    private currentQuote: { content: string; author: string; from: string } = {
        content: '',
        author: '',
        from: ''
    };

    constructor(container: HTMLElement) {
        this.container = container;
        this.initUI();
        this.fetchQuote();
    }

    private initUI() {
        // 设置卡片背景和样式
        this.container.style.cssText += `
            background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://pics.tide.moreless.io/dailypics/FgiQK8yjvachUMD3QvHVdJH9SLUD?imageView2/1/w/1366/h/768/format/webp') center/cover no-repeat;
            border-radius: 16px;
            overflow: hidden;
            height: 180px;
            display: flex;
            flex-direction: column;
            position: relative;
        `;

        // 设置卡片标题样式
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 16px 16px 8px 16px;
            font-size: 16px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.9);
        `;
        header.innerHTML = '每日一言';
        this.container.appendChild(header);

        // 创建内容容器
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            padding: 0 16px 16px 16px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        `;
        this.container.appendChild(contentContainer);

        // 创建内容显示区域
        this.content = document.createElement('div');
        this.content.style.cssText = `
            font-size: 16px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.95);
            text-align: center;
            margin-bottom: 12px;
            font-weight: 500;
        `;
        contentContainer.appendChild(this.content);

        // 创建作者和来源显示区域
        this.author = document.createElement('div');
        this.author.style.cssText = `
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
        `;
        contentContainer.appendChild(this.author);
    }

    private async fetchQuote() {
        try {
            const response = await fetch('https://v1.hitokoto.cn');
            const data = await response.json();
            this.currentQuote = {
                content: data.hitokoto,
                author: data.from_who || '佚名',
                from: data.from || ''
            };
            this.updateUI();
        } catch (error) {
            console.error('Failed to fetch quote:', error);
            this.currentQuote = {
                content: '我们还有很长的路要走，不过没关系，道路就是生活。',
                author: '凯鲁亚克',
                from: '小说家'
            };
            this.updateUI();
        }
    }

    private updateUI() {
        this.content.textContent = this.currentQuote.content;
        const authorText = this.currentQuote.from 
            ? `${this.currentQuote.author}，${this.currentQuote.from}`
            : this.currentQuote.author;
        this.author.textContent = authorText;
    }
} 