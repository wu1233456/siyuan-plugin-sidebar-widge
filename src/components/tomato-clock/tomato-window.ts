import { TomatoClock } from "./tomato-clock";

export class TomatoWindow {
    private win: any;
    private isClosing: boolean = false;
    private static instance: TomatoWindow | null = null;
    private configPath: string = "/data/storage/siyuan-plugin-sidebar-widget/tomato-window.json";

    constructor() {}

    public static getInstance(): TomatoWindow {
        if (!TomatoWindow.instance) {
            TomatoWindow.instance = new TomatoWindow();
        }
        return TomatoWindow.instance;
    }

    public async createWindow() {
        if (this.win && !this.win.isDestroyed()) {
            this.win.show();
            this.win.focus();
            return;
        }
        const { BrowserWindow, screen } = require('@electron/remote');
        const isMac = process.platform === 'darwin';

        // 获取主屏幕的尺寸和工作区
        const primaryDisplay = screen.getPrimaryDisplay();
        const { workArea } = primaryDisplay;

        // 设置窗口尺寸
        const windowWidth = 200;
        const windowHeight = 150;

        // 计算右上角位置（考虑工作区，避免被系统菜单栏遮挡）
        const xPosition = workArea.x + workArea.width - windowWidth - 20; // 右边缘留20像素间距
        const yPosition = workArea.y + 20; // 顶部留20像素间距

        this.win = new BrowserWindow({
            width: windowWidth,
            height: windowHeight,
            x: xPosition,
            y: yPosition,
            frame: false,
            titleBarStyle: 'default',
            alwaysOnTop: true,
            skipTaskbar: true,
            title: "番茄时钟",
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                webSecurity: false
            },
            autoHideMenuBar: true,
            fullscreenable: false,
            maximizable: false,
            transparent: true,
            type: 'panel',
            show: true
        });

        // macOS 特定设置
        if (isMac) {
            this.win.setVisibleOnAllWorkspaces(true); // 在所有工作区显示
            this.win.setAlwaysOnTop(true, 'floating', 1);
        }

        this.setupIPCListeners();
        await this.win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(this.getWindowContent())}`);
        this.setupWindowEvents();
    }

    private setupIPCListeners() {
        const { ipcMain } = require('@electron/remote');

        this.win.on('closed', () => {
            TomatoWindow.instance = null;
            console.log('Window closed');
        });
    }

    private setupWindowEvents() {
        this.win.once('ready-to-show', () => {
            console.log('Window ready to show');
            this.win.show();
            this.win.focus();
        });
    }

    private getWindowContent(): string {
        return `
            <html>
            <head>
                <style>
                    body {
                        margin: 0;
                        padding: 4px;
                        height: 100vh;
                        box-sizing: border-box;
                        background: var(--b3-theme-background);
                        border: 1px solid var(--b3-border-color);
                        color: var(--b3-theme-on-background);
                        font-family: var(--b3-font-family);
                        overflow: hidden;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: var(--b3-border-radius);
                    }
                    :root {
                        --b3-theme-primary: #3370ff;
                        --b3-theme-background: #fff;
                        --b3-theme-surface: #f5f5f5;
                        --b3-theme-error: #d23f31;
                        --b3-theme-on-primary: #fff;
                        --b3-theme-on-background: #202124;
                        --b3-theme-on-surface: #5f6368;
                        --b3-theme-on-error: #fff;
                        --b3-font-family: "Helvetica Neue", "Luxi Sans", "DejaVu Sans", "Hiragino Sans GB", "Microsoft Yahei", sans-serif;
                        --b3-border-color: rgba(0, 0, 0, .1);
                        --b3-border-radius: 4px;
                        --b3-dialog-shadow: 0 8px 24px rgba(0, 0, 0, .12);
                    }
                    .window-drag {
                        -webkit-app-region: drag;
                        height: 20px;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        display: flex;
                        justify-content: flex-end;
                        padding-right: 4px;
                        z-index: 100;
                    }
                    .close-button {
                        -webkit-app-region: no-drag;
                        background: none;
                        border: none;
                        padding: 2px;
                        cursor: pointer;
                        color: var(--b3-theme-on-surface);
                        opacity: 0.6;
                        transition: opacity 0.2s;
                    }
                    .close-button:hover {
                        opacity: 1;
                        color: var(--b3-theme-error);
                    }
                    .content {
                        margin-top: 20px;
                        height: calc(100% - 20px);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 12px;
                    }
                    .timer {
                        font-size: 48px;
                        font-weight: bold;
                        color: var(--b3-theme-on-background);
                        line-height: 1;
                        margin-bottom: -4px;
                    }
                    .controls {
                        display: flex;
                        gap: 12px;
                    }
                    .control-button {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        border: none;
                        background: var(--b3-theme-surface);
                        color: var(--b3-theme-primary);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s;
                        padding: 0;
                    }
                    .control-button:hover {
                        background: var(--b3-theme-primary);
                        color: white;
                    }
                    .progress-bar {
                        width: 80%;
                        height: 3px;
                        background: var(--b3-theme-surface);
                        border-radius: 1.5px;
                        overflow: hidden;
                        margin-top: -4px;
                    }
                    .progress {
                        width: 0%;
                        height: 100%;
                        background: var(--b3-theme-primary);
                        transition: width 0.5s linear;
                    }
                </style>
            </head>
            <body>
                <div class="window-drag">
                    <button class="close-button" id="closeButton" title="关闭">
                        <svg style="width: 16px; height: 16px;" viewBox="0 0 1024 1024">
                            <path d="M512 451.669333l165.973333-165.973333a21.333333 21.333333 0 0 1 30.122667 0l30.165333 30.208a21.333333 21.333333 0 0 1 0 30.165333L572.330667 512l165.973333 165.973333a21.333333 21.333333 0 0 1 0 30.122667l-30.208 30.165333a21.333333 21.333333 0 0 1-30.165333 0L512 572.330667l-165.973333 165.973333a21.333333 21.333333 0 0 1-30.122667 0l-30.165333-30.208a21.333333 21.333333 0 0 1 0-30.165333L451.669333 512l-165.973333-165.973333a21.333333 21.333333 0 0 1 0-30.122667l30.208-30.165333a21.333333 21.333333 0 0 1 30.165333 0L512 451.669333z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
                <div class="content">
                    <div class="timer" id="timer">25:00</div>
                    <div class="controls">
                        <button class="control-button" id="startButton">
                            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button class="control-button" id="pauseButton" style="display: none;">
                            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button class="control-button" id="stopButton">
                            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24">
                                <path d="M6 6h12v12H6z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" id="progress"></div>
                    </div>
                </div>
                <script>
                    const { ipcRenderer } = require('electron');
                    
                    const closeButton = document.getElementById('closeButton');
                    const startButton = document.getElementById('startButton');
                    const pauseButton = document.getElementById('pauseButton');
                    const stopButton = document.getElementById('stopButton');
                    const timerDisplay = document.getElementById('timer');
                    const progressBar = document.getElementById('progress');
                    
                    let isRunning = false;
                    let isPaused = false;
                    let isBreakTime = false;
                    let timeLeft = 25 * 60; // 25分钟
                    let totalTime = 25 * 60;
                    let timer = null;
                    
                    closeButton.addEventListener('click', () => {
                        window.close();
                    });

                    function updateDisplay() {
                        const minutes = Math.floor(timeLeft / 60);
                        const seconds = timeLeft % 60;
                        timerDisplay.textContent = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
                        
                        const progress = ((totalTime - timeLeft) / totalTime) * 100;
                        progressBar.style.width = \`\${progress}%\`;
                    }

                    function startTimer() {
                        if (!isRunning) {
                            isRunning = true;
                            isPaused = false;
                            startButton.style.display = 'none';
                            pauseButton.style.display = 'flex';
                            
                            timer = setInterval(() => {
                                if (timeLeft > 0) {
                                    timeLeft--;
                                    updateDisplay();
                                } else {
                                    // 时间到
                                    clearInterval(timer);
                                    isRunning = false;
                                    
                                    // 切换工作/休息状态
                                    isBreakTime = !isBreakTime;
                                    if (isBreakTime) {
                                        timeLeft = 5 * 60; // 5分钟休息
                                        totalTime = 5 * 60;
                                        // 发送通知
                                        new Notification('番茄钟', {
                                            body: '专注时间结束，开始休息！'
                                        });
                                    } else {
                                        timeLeft = 25 * 60; // 25分钟工作
                                        totalTime = 25 * 60;
                                        // 发送通知
                                        new Notification('番茄钟', {
                                            body: '休息结束，开始专注！'
                                        });
                                    }
                                    updateDisplay();
                                    startTimer(); // 自动开始下一个周期
                                }
                            }, 1000);
                        }
                    }

                    function pauseTimer() {
                        if (isRunning) {
                            clearInterval(timer);
                            isRunning = false;
                            isPaused = true;
                            startButton.style.display = 'flex';
                            pauseButton.style.display = 'none';
                        }
                    }

                    function stopTimer() {
                        clearInterval(timer);
                        isRunning = false;
                        isPaused = false;
                        isBreakTime = false;
                        timeLeft = 25 * 60;
                        totalTime = 25 * 60;
                        startButton.style.display = 'flex';
                        pauseButton.style.display = 'none';
                        updateDisplay();
                    }

                    startButton.addEventListener('click', startTimer);
                    pauseButton.addEventListener('click', pauseTimer);
                    stopButton.addEventListener('click', stopTimer);

                    // 初始化显示
                    updateDisplay();
                </script>
            </body>
            </html>
        `;
    }
} 