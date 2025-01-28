import {
    Plugin,
    showMessage,
    Dialog,
    Menu,
    getFrontend,
    IModel,
} from "siyuan";
import "@/index.scss";
import { TomatoClock } from "./components/tomato-clock/tomata-clock";
import { MemorialDay } from "./components/MemorialDay/memorial-day";
import { HabitTracker } from "./components/habit-tracker/habit-tracker";
import { StickyNote } from "./components/sticky-note/sticky-note";
import { Calendar } from "./components/calendar/calendar";
import { TodoList } from "./components/todo-list/todo-list";
import { Bookmark } from "./components/bookmark/bookmark";
import { DailyQuote } from "./components/daily-quote/daily-quote";
import { Muyu } from "./components/muyu/muyu";
import { RecentDocs } from "./components/recent-docs/recent-docs";
import { Memo } from "./components/memo/memo";
import { PhotoAlbum } from "./components/photo-album/photo-album";
import { Heatmap } from "./components/heatmap/heatmap";
import { MusicPlayer } from "./components/music-player/music-player";
import { QuickNote } from "./components/quick-note/quick-note";
import { QuickDoc } from "./components/quick-doc/quick-doc";
import { Birthday } from "./components/birthday/birthday";
import { getFile, putFile } from "./api";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

interface CardConfig {
    type: string;
    id: string;
}

export default class PluginSample extends Plugin {

    customTab: () => IModel;
    private isMobile: boolean;
    private tomatoClock: TomatoClock;
    private memorialDay: MemorialDay;
    private habitTracker: HabitTracker;
    private stickyNote: StickyNote;
    private calendar: Calendar;
    private todoList: TodoList;
    private bookmark: Bookmark;
    private dailyQuote: DailyQuote;
    private muyu: Muyu;
    private recentDocs: RecentDocs;
    private memo: Memo;
    private photoAlbum: PhotoAlbum;
    private heatmap: Heatmap;
    private musicPlayer: MusicPlayer;
    private quickDoc: QuickDoc;
    private birthday: Birthday;
    private layoutConfigPath: string = "/data/storage/siyuan-plugin-sidebar-widget/sidebar-layout.json";

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };
        this.layoutConfigPath = "/data/storage/siyuan-plugin-sidebar-widget/sidebar-layout.json";

        console.log("loading plugin-sample", this.i18n);

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        
        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
<path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
</symbol>
<symbol id="iconTime" viewBox="0 0 1024 1024">
<path d="M963.05566 345.393457c-34.433245-59.444739-83.5084-112.04244-142.458001-152.926613 3.805482-11.402299 2.23519-23.908046-4.272326-34.008842a39.5855 39.5855 0 0 0-29.198939-17.938108L617.888552 123.076923l-73.365164-105.421751c-7.398762-10.638373-19.55084-16.976127-32.509284-16.976127s-25.110522 6.337754-32.509283 16.976127L406.111363 123.076923 236.887668 140.505747A39.625111 39.625111 0 0 0 207.688729 158.443855a39.676039 39.676039 0 0 0-4.286473 34.008842C77.170603 279.724138 2.716138 415.179487 2.716138 560.311229c-0.04244 62.72679 13.849691 124.689655 40.671972 181.38992 25.916888 55.129973 62.924845 104.587091 110.005305 146.956676 46.769231 42.100796 101.177719 75.119363 161.683466 98.164456a559.214854 559.214854 0 0 0 393.846153 0c60.519894-23.030946 114.928382-56.06366 161.71176-98.164456 47.08046-42.369584 84.088417-91.826702 110.005305-146.956676A423.347834 423.347834 0 0 0 1021.283777 560.311229a429.629001 429.629001 0 0 0-58.228117-214.917772z m-530.786914-145.372237c11.473033-1.188329 21.856764-7.299735 28.44916-16.778072L511.999958 109.609195l51.239611 73.633953c6.592396 9.464191 16.976127 15.589744 28.44916 16.778072l80.580017 8.304156-47.278514 32.679045a39.601061 39.601061 0 0 0-15.971707 41.874447l14.458002 59.784262-97.655172-36.413793a39.633599 39.633599 0 0 0-27.671088 0l-97.655172 36.399646 14.458001-59.784262a39.601061 39.601061 0 0 0-15.971706-41.874447l-47.278515-32.679045 80.565871-8.290009zM817.570249 829.778957a434.642617 434.642617 0 0 1-136.94076 83.013262 480.025464 480.025464 0 0 1-337.457118 0 434.642617 434.642617 0 0 1-136.94076-83.013262C126.132584 757.545535 81.938065 661.842617 81.938065 560.311229c0-125.496021 68.923077-242.758621 184.615385-314.553492l65.018568 44.944297-25.563219 105.81786a39.619452 39.619452 0 0 0 52.34306 46.401415L511.999958 385.669319l153.676392 57.280283c13.72237 5.106985 29.142352 2.23519 40.106101-7.483643a39.58267 39.58267 0 0 0 12.222812-38.917772l-25.605659-105.81786 65.018568-44.93015c2.900088 1.79664 5.78603 3.621574 8.629531 5.488948 53.616269 35.083996 98.022989 81.343943 128.43855 133.842617 31.56145 54.507515 47.533156 113.471264 47.533156 175.221927 0.04244 101.488948-44.152078 197.191866-124.44916 269.425288z m0 0" fill="#3A3A3A"></path>
</symbol>
<symbol id="iconSettings" viewBox="0 0 24 24">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
</symbol>
<symbol id="iconPlay" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
</symbol>
<symbol id="iconPause" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
</symbol>
<symbol id="iconStop" viewBox="0 0 24 24">
    <path d="M6 6h12v12H6z"/>
</symbol>
<symbol id="iconEdit" viewBox="0 0 24 24">
    <path d="M19.045 3.875c-1.23-1.34-2.76-2.01-4.38-1.98-1.62.03-3.12.72-4.44 1.92-5.76 1.2-1.2 2.76-1.8 4.44-1.8 1.62.03 3.15.72 4.5 1.92 5.7 1.2 1.2 2.76 1.8 4.44 1.8zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6-3.6zM3.48 21c-.48.48-.48 1.2 0 1.68l.96.96c.48.48 1.2.48 1.68 0l.96-.96c.48-.48.48-1.2 0-1.68l-.96-.96zM12 12c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6-3.6z"/>
</symbol>
<symbol id="iconCalendar" viewBox="0 0 1024 1024">
    <path d="M896 128h-96v64c0 35.3-28.7 64-64 64s-64-28.7-64-64v-64H352v64c0 35.3-28.7 64-64 64s-64-28.7-64-64v-64h-96c-35.3 0-64 28.7-64 64v640c0 35.3 28.7 64 64 64h768c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64z m0 704H128V384h768v448zM288 64c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32s32-14.3 32-32V96c0-17.7-14.3-32-32-32z m448 0c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32s32-14.3 32-32V96c0-17.7-14.3-32-32-32z"></path>
</symbol>
<symbol id="iconTodo" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"/>
</symbol>
<symbol id="iconBookmark" viewBox="0 0 24 24">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
</symbol>
<symbol id="iconMuyu" viewBox="0 0 1024 1024">
<path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372z"></path>
</symbol>
<symbol id="iconMemo" viewBox="0 0 24 24">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
</symbol>
<symbol id="iconImage" viewBox="0 0 1024 1024">
    <path d="M896 128h-96v64c0 35.3-28.7 64-64 64s-64-28.7-64-64v-64H352v64c0 35.3-28.7 64-64 64s-64-28.7-64-64v-64h-96c-35.3 0-64 28.7-64 64v640c0 35.3 28.7 64 64 64h768c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64z m0 704H128V384h768v448zM288 64c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32s32-14.3 32-32V96c0-17.7-14.3-32-32-32z m448 0c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32s32-14.3 32-32V96c0-17.7-14.3-32-32-32z"></path>
</symbol>
<symbol id="iconMusic" viewBox="0 0 24 24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
</symbol>
<symbol id="iconFile" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"/>
</symbol>`);

        // 修改卡片行样式
        const createRow = () => {
            const row = document.createElement('div');
            row.className = 'card-row';
            row.style.cssText = `
                display: flex;
                flex-direction: row;
                gap: 5px;
                width: 100%;
                min-height: min-content;
                margin-bottom: 5px;
            `;
            return row;
        };

        // 修改卡片样式，使其支持自适应宽度
        const cardStyle = `
            background: var(--b3-theme-surface);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid var(--b3-theme-surface-lighter);
            position: relative;
            cursor: move;
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
        `;

        this.addDock({
            config: {
                position: "RightTop",
                size: { width: 200, height: 0 },
                icon: "iconTime",
                title: "侧边栏小组件",
                hotkey: "⌥⌘W",
            },
            data: {
                text: "侧边栏小组件"
            },
            type: DOCK_TYPE,
            init: (dock) => {
                // 设置dock容器的内边距，确保有足够的空间
                dock.element.style.padding = '0 8px';
                dock.element.style.boxSizing = 'border-box';
                dock.element.style.display = 'flex';
                dock.element.style.flexDirection = 'column';
                dock.element.style.position = 'relative';

                // 创建header容器
                const header = document.createElement('div');
                header.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 32px;
                    position: relative;
                    padding: 0 8px;
                `;

                // 创建左侧标题区域
                const titleArea = document.createElement('div');
                titleArea.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 4px;
                `;

                // 添加图标
                const icon = document.createElement('svg');
                icon.style.cssText = `
                    width: 14px;
                    height: 14px;
                    fill: var(--b3-theme-on-surface);
                `;
                icon.innerHTML = '<use xlink:href="#iconSettings"></use>';

                // 添加标题文字
                const title = document.createElement('span');
                title.textContent = '小组件';
                title.style.cssText = `
                    font-size: 13px;
                    color: var(--b3-theme-on-surface);
                    opacity: 0.86;
                `;

                titleArea.appendChild(icon);
                titleArea.appendChild(title);
                header.appendChild(titleArea);

                // 添加+号按钮
                const addButton = document.createElement('button');
                addButton.innerHTML = '+';
                addButton.style.cssText = `
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    border: none;
                    background: transparent;
                    color: var(--b3-theme-on-surface);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    opacity: 0;
                    transition: all 0.2s ease;
                `;

                // 添加鼠标移入效果
                header.addEventListener('mouseenter', () => {
                    addButton.style.opacity = '1';
                });

                header.addEventListener('mouseleave', () => {
                    addButton.style.opacity = '0';
                });

                addButton.addEventListener('mouseenter', () => {
                    addButton.style.background = 'var(--b3-theme-background-light)';
                });

                addButton.addEventListener('mouseleave', () => {
                    addButton.style.background = 'transparent';
                });

                header.appendChild(addButton);
                dock.element.insertBefore(header, dock.element.firstChild);

                // 添加拖拽相关事件监听
                const setupDragEvents = () => {
                const cards = dock.element.getElementsByClassName('card');
                let draggedCard: HTMLElement | null = null;
                let placeholder: HTMLElement | null = null;

                    const handleDragStart = (e: DragEvent) => {
                        draggedCard = e.target as HTMLElement;
                        draggedCard.style.opacity = '0.5';
                        
                        if (e.dataTransfer) {
                            e.dataTransfer.effectAllowed = 'move';
                        }
                        
                        // 创建占位符并继承被拖动卡片的尺寸
                        const draggedRect = draggedCard.getBoundingClientRect();
                        placeholder = document.createElement('div');
                        placeholder.className = 'card-placeholder';
                        placeholder.style.cssText = `
                            ${cardStyle}
                            border: 2px dashed var(--b3-theme-primary);
                            background: var(--b3-theme-surface-light);
                            height: ${draggedRect.height}px;
                            min-height: ${draggedRect.height}px;
                            transition: none;
                        `;
                    };

                    const handleDragOver = (e: DragEvent) => {
                        e.preventDefault();
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'move';
                        }
                        
                        const target = e.target as HTMLElement;
                        const cardTarget = target.closest('.card') as HTMLElement;
                        if (!cardTarget || !draggedCard || cardTarget === draggedCard || cardTarget === placeholder) {
                            return;
                        }

                        const targetRect = cardTarget.getBoundingClientRect();
                        const mouseX = e.clientX;
                        const mouseY = e.clientY;
                        const horizontalThreshold = targetRect.left + targetRect.width / 2;
                        const verticalThreshold = targetRect.top + targetRect.height / 2;

                        // 判断是水平还是垂直移动
                        const isHorizontalMove = Math.abs(mouseX - horizontalThreshold) > Math.abs(mouseY - verticalThreshold);

                        if (placeholder) {
                            if (isHorizontalMove) {
                                // 水平移动
                                if (mouseX < horizontalThreshold) {
                                    cardTarget.parentNode?.insertBefore(placeholder, cardTarget);
                                } else {
                                    cardTarget.parentNode?.insertBefore(placeholder, cardTarget.nextSibling);
                                }
                            } else {
                                // 垂直移动
                                const currentRow = cardTarget.parentElement;
                                if (!currentRow) return;

                                // 如果占位符还没有自己的行，创建一个
                                if (!placeholder.parentElement) {
                                    const placeholderRow = createRow();
                                    placeholderRow.appendChild(placeholder);
                                }

                                const placeholderRow = placeholder.parentElement!;
                                
                                if (mouseY < verticalThreshold) {
                                    // 移动到上方
                                    currentRow.parentNode?.insertBefore(placeholderRow, currentRow);
                                } else {
                                    // 移动到下方
                                    currentRow.parentNode?.insertBefore(placeholderRow, currentRow.nextSibling);
                                }
                            }
                        }
                    };

                    const handleDragEnd = async (e: DragEvent) => {
                        if (draggedCard) {
                            draggedCard.style.opacity = '1';
                        }
                        if (placeholder && placeholder.parentNode) {
                            const targetRow = placeholder.parentElement;
                            targetRow?.insertBefore(draggedCard!, placeholder);
                            placeholder.remove();

                            // 清理空行
                            const rows = dock.element.getElementsByClassName('card-row');
                            Array.from(rows).forEach(row => {
                                if (!row.hasChildNodes()) {
                                    row.remove();
                                }
                            });

                            // 保存布局配置
                            await saveLayoutConfig();
                        }
                        draggedCard = null;
                        placeholder = null;
                    };

                    const handleDrop = (e: DragEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                    };

                    // 为新卡片添加拖拽事件
                    const addDragEvents = (card: Element) => {
                        card.addEventListener('dragstart', handleDragStart);
                        card.addEventListener('dragover', handleDragOver);
                        card.addEventListener('dragend', handleDragEnd);
                        card.addEventListener('drop', handleDrop);
                    };

                    // 为所有现有卡片添加拖拽事件
                    Array.from(cards).forEach(addDragEvents);

                // 为dock容器添加dragover事件
                    const handleDockDragOver = (e: DragEvent) => {
                    e.preventDefault();
                    const target = e.target as HTMLElement;
                    if (target === dock.element && placeholder) {
                        const newRow = createRow();
                        newRow.appendChild(placeholder);
                        dock.element.appendChild(newRow);
                    }
                    };

                    dock.element.addEventListener('dragover', handleDockDragOver);

                    // 返回添加拖拽事件的函数，供新卡片使用
                    return addDragEvents;
                };

                // 初始化拖拽事件，并获取添加拖拽事件的函数
                const addDragEvents = setupDragEvents();

                // 修改createCard函数，使用返回的addDragEvents函数
                const createCard = async (type: string, id?: string) => {
                    const row = createRow();
                    dock.element.appendChild(row);
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.setAttribute('draggable', 'true');
                    
                    // 为每个卡片生成唯一id
                    const cardId = id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    card.dataset.cardId = cardId;
                    card.dataset.cardType = type;
                    card.style.cssText = cardStyle;
                    row.appendChild(card);
                    
                    // 添加上下文菜单事件
                    card.addEventListener('mouseup', (e: MouseEvent) => {
                        // 只处理右键点击
                        if (e.button !== 2) return;
                        
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const menu = new Menu("cardOperation");
                        menu.addItem({
                            icon: "iconTrashcan",
                            label: "删除",
                            click: async () => {
                                const parentRow = card.parentElement;
                                // 如果是贴纸，从配置文件中删除其配置
                                if (card.dataset.cardType === 'sticky' && card.dataset.cardId) {
                                    try {
                                        const configPath = "/data/storage/siyuan-plugin-sidebar-widget/sticky-notes-config.json";
                                        const configs = await getFile(configPath);
                                        if (configs && configs[card.dataset.cardId]) {
                                            delete configs[card.dataset.cardId];
                                            await putFile(configPath, false, new Blob([JSON.stringify(configs)], { type: "application/json" }));
                                        }
                                    } catch (e) {
                                        console.error("删除贴纸配置失败", e);
                                    }
                                } else if (card.dataset.cardType === 'habit' && card.dataset.cardId) {
                                    try {
                                        const configPath = "/data/storage/siyuan-plugin-sidebar-widget/habit-trackers-config.json";
                                        const configs = await getFile(configPath);
                                        if (configs && configs[card.dataset.cardId]) {
                                            delete configs[card.dataset.cardId];
                                            await putFile(configPath, false, new Blob([JSON.stringify(configs)], { type: "application/json" }));
                                        }
                                    } catch (e) {
                                        console.error("删除习惯追踪器配置失败", e);
                                    }
                                }
                                card.remove();
                                // 如果行为空，删除行
                                if (parentRow && !parentRow.hasChildNodes()) {
                                    parentRow.remove();
                                }
                                // 保存布局配置
                                await saveLayoutConfig();
                            }
                        });
                        menu.open({
                            x: e.clientX,
                            y: e.clientY
                        });
                    });
                    
                    switch(type) {
                        case 'tomato':
                            this.tomatoClock = new TomatoClock(card);
                            break;
                        case 'memorial':
                            this.memorialDay = new MemorialDay(card, cardId);
                            break;
                        case 'habit':
                            this.habitTracker = new HabitTracker(card, cardId);
                            break;
                        case 'sticky':
                            this.stickyNote = new StickyNote(card, cardId);
                            break;
                        case 'calendar':
                            this.calendar = new Calendar(card);
                            break;
                        case 'todo':
                            this.todoList = new TodoList(card);
                            break;
                        case 'bookmark':
                            this.bookmark = new Bookmark(card);
                            break;
                        case 'quote':
                            this.dailyQuote = new DailyQuote(card);
                            break;
                        case 'muyu':
                            this.muyu = new Muyu(card);
                            break;
                        case 'recent':
                            this.recentDocs = new RecentDocs(card);
                            break;
                        case 'memo':
                            this.memo = new Memo(card,cardId);
                            break;
                        case 'photo':
                            this.photoAlbum = new PhotoAlbum(card);
                            break;
                        case 'heatmap':
                            this.heatmap = new Heatmap(card);
                            break;
                        case 'music':
                            this.musicPlayer = new MusicPlayer(card);
                            break;
                        case 'quicknote':
                            new QuickNote(card);
                            break;
                        case 'quickdoc':
                            this.quickDoc = new QuickDoc(card, cardId);
                            break;
                        case 'birthday':
                            this.birthday = new Birthday(card, cardId);
                            break;
                    }

                    // 为新卡片添加拖拽事件
                    addDragEvents(card);
                    
                    // 保存布局配置
                    await saveLayoutConfig();
                    
                    return card;
                };

                // 添加点击事件
                addButton.addEventListener('click', () => {
                    const dialog = new Dialog({
                        title: "添加卡片",
                        content: `<div class="card-selector">
                            <style>
                                .card-selector {
                                    display: grid;
                                    grid-template-columns: repeat(3, 1fr);
                                    gap: 16px;
                                    padding: 16px;
                                }
                                .card-option {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    padding: 16px;
                                    border-radius: 8px;
                                    border: 1px solid var(--b3-theme-surface-lighter);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                }
                                .card-option:hover {
                                    background: var(--b3-theme-primary-light);
                                    border-color: var(--b3-theme-primary);
                                }
                                .card-option svg {
                                    width: 24px;
                                    height: 24px;
                                    margin-bottom: 8px;
                                    fill: var(--b3-theme-on-surface);
                                }
                                .card-option:hover svg {
                                    fill: var(--b3-theme-primary);
                                }
                                .card-option-label {
                                    font-size: 14px;
                                    color: var(--b3-theme-on-surface);
                                }
                                .card-option:hover .card-option-label {
                                    color: var(--b3-theme-primary);
                                }
                            </style>
                            <div class="card-option" data-type="tomato">
                                <svg><use xlink:href="#iconTime"></use></svg>
                                <span class="card-option-label">番茄钟</span>
                            </div>
                            <div class="card-option" data-type="memorial">
                                <svg><use xlink:href="#iconCalendar"></use></svg>
                                <span class="card-option-label">纪念日</span>
                            </div>
                            <div class="card-option" data-type="habit">
                                <svg><use xlink:href="#iconSettings"></use></svg>
                                <span class="card-option-label">习惯追踪</span>
                            </div>
                            <div class="card-option" data-type="sticky">
                                <svg><use xlink:href="#iconEdit"></use></svg>
                                <span class="card-option-label">贴纸</span>
                            </div>
                            <div class="card-option" data-type="calendar">
                                <svg><use xlink:href="#iconCalendar"></use></svg>
                                <span class="card-option-label">日历</span>
                            </div>
                            <div class="card-option" data-type="todo">
                                <svg><use xlink:href="#iconTodo"></use></svg>
                                <span class="card-option-label">待办事项</span>
                            </div>
                            <div class="card-option" data-type="bookmark">
                                <svg><use xlink:href="#iconBookmark"></use></svg>
                                <span class="card-option-label">收藏</span>
                            </div>
                            <div class="card-option" data-type="quote">
                                <svg><use xlink:href="#iconFace"></use></svg>
                                <span class="card-option-label">每日一言</span>
                            </div>
                            <div class="card-option" data-type="muyu">
                                <svg><use xlink:href="#iconMuyu"></use></svg>
                                <span class="card-option-label">木鱼</span>
                            </div>
                            <div class="card-option" data-type="recent">
                                <svg><use xlink:href="#iconBookmark"></use></svg>
                                <span class="card-option-label">最近文档</span>
                            </div>
                            <div class="card-option" data-type="memo">
                                <svg><use xlink:href="#iconMemo"></use></svg>
                                <span class="card-option-label">备忘录</span>
                            </div>
                            <div class="card-option" data-type="photo">
                                <svg><use xlink:href="#iconImage"></use></svg>
                                <span class="card-option-label">相册</span>
                            </div>
                            <div class="card-option" data-type="heatmap">
                                <svg><use xlink:href="#iconCalendar"></use></svg>
                                <span class="card-option-label">热力图</span>
                            </div>
                            <div class="card-option" data-type="music">
                                <svg><use xlink:href="#iconMusic"></use></svg>
                                <span class="card-option-label">音乐播放器</span>
                            </div>
                            <div class="card-option" data-type="quicknote">
                                <svg><use xlink:href="#iconEdit"></use></svg>
                                <span class="card-option-label">快速笔记</span>
                            </div>
                            <div class="card-option" data-type="quickdoc">
                                <svg><use xlink:href="#iconFile"></use></svg>
                                <span class="card-option-label">快速文档</span>
                            </div>
                            <div class="card-option" data-type="birthday">
                                <svg><use xlink:href="#iconFace"></use></svg>
                                <span class="card-option-label">生日提醒</span>
                            </div>
                        </div>`,
                        width: "520px",
                    });

                    // 为卡片选项添加点击事件
                    const cardOptions = dialog.element.querySelectorAll('.card-option');
                    cardOptions.forEach(option => {
                        option.addEventListener('click', () => {
                            const type = option.getAttribute('data-type');
                            if (type) {
                                createCard(type);
                                dialog.destroy();
                            }
                        });
                    });
                });

                // 添加布局配置的保存函数
                const saveLayoutConfig = async () => {
                    const rows = dock.element.getElementsByClassName('card-row');
                    const layout = Array.from(rows).map(row => {
                        const cards = row.getElementsByClassName('card');
                        return Array.from(cards).map(card => {
                            const config: CardConfig = {
                                type: (card as HTMLElement).dataset.cardType,
                                id: (card as HTMLElement).dataset.cardId
                            };
                            return config;
                        });
                    });
                    try {
                        await putFile(this.layoutConfigPath, false, new Blob([JSON.stringify(layout)], { type: "application/json" }));
                        console.log("保存布局配置成功");
                    } catch (e) {
                        console.error("保存布局配置失败", e);
                    }
                };

                // 添加布局配置的加载函数
                const loadLayoutConfig = async () => {
                    try {
                        const config = await getFile(this.layoutConfigPath);
                        if (config && Array.isArray(config)) {
                            // 清除现有卡片
                            const existingCards = dock.element.getElementsByClassName('card');
                            while (existingCards.length > 0) {
                                existingCards[0].parentElement?.remove();
                            }
                            // 根据配置创建卡片和行
                            for (const rowConfig of config) {
                                if (Array.isArray(rowConfig)) {
                                    const row = createRow();
                                    dock.element.appendChild(row);
                                    for (const cardConfig of rowConfig) {
                                        if (typeof cardConfig === 'object' && cardConfig.type) {
                                            const card = document.createElement('div');
                                            card.className = 'card';
                                            card.setAttribute('draggable', 'true');
                                            card.dataset.cardType = cardConfig.type;
                                            card.dataset.cardId = cardConfig.id;
                                            card.style.cssText = cardStyle;
                                            row.appendChild(card);
                                            
                                            // 添加上下文菜单事件
                                            card.addEventListener('mouseup', (e: MouseEvent) => {
                                                // 只处理右键点击
                                                if (e.button !== 2) return;
                                                
                                                e.preventDefault();
                                                e.stopPropagation();
                                                
                                                const menu = new Menu("cardOperation");
                                                menu.addItem({
                                                    icon: "iconTrashcan",
                                                    label: "删除",
                                                    click: async () => {
                                                        const parentRow = card.parentElement;
                                                        // 如果是贴纸，从配置文件中删除其配置
                                                        if (card.dataset.cardType === 'sticky' && card.dataset.cardId) {
                                                            try {
                                                                const configPath = "/data/storage/siyuan-plugin-sidebar-widget/sticky-notes-config.json";
                                                                const configs = await getFile(configPath);
                                                                if (configs && configs[card.dataset.cardId]) {
                                                                    delete configs[card.dataset.cardId];
                                                                    await putFile(configPath, false, new Blob([JSON.stringify(configs)], { type: "application/json" }));
                                                                }
                                                            } catch (e) {
                                                                console.error("删除贴纸配置失败", e);
                                                            }
                                                        } else if (card.dataset.cardType === 'habit' && card.dataset.cardId) {
                                                            try {
                                                                const configPath = "/data/storage/siyuan-plugin-sidebar-widget/habit-trackers-config.json";
                                                                const configs = await getFile(configPath);
                                                                if (configs && configs[card.dataset.cardId]) {
                                                                    delete configs[card.dataset.cardId];
                                                                    await putFile(configPath, false, new Blob([JSON.stringify(configs)], { type: "application/json" }));
                                                                }
                                                            } catch (e) {
                                                                console.error("删除习惯追踪器配置失败", e);
                                                            }
                                                        }
                                                        card.remove();
                                                        // 如果行为空，删除行
                                                        if (parentRow && !parentRow.hasChildNodes()) {
                                                            parentRow.remove();
                                                        }
                                                        // 保存布局配置
                                                        await saveLayoutConfig();
                                                    }
                                                });
                                                menu.open({
                                                    x: e.clientX,
                                                    y: e.clientY
                                                });
                                            });
                                            
                                            switch(cardConfig.type) {
                                                case 'tomato':
                                                    this.tomatoClock = new TomatoClock(card);
                                                    break;
                                                case 'memorial':
                                                    this.memorialDay = new MemorialDay(card, cardConfig.id);
                                                    break;
                                                case 'habit':
                                                    this.habitTracker = new HabitTracker(card, cardConfig.id);
                                                    break;
                                                case 'sticky':
                                                    this.stickyNote = new StickyNote(card, cardConfig.id);
                                                    break;
                                                case 'calendar':
                                                    this.calendar = new Calendar(card);
                                                    break;
                                                case 'todo':
                                                    this.todoList = new TodoList(card);
                                                    break;
                                                case 'bookmark':
                                                    this.bookmark = new Bookmark(card);
                                                    break;
                                                case 'quote':
                                                    this.dailyQuote = new DailyQuote(card);
                                                    break;
                                                case 'muyu':
                                                    this.muyu = new Muyu(card);
                                                    break;
                                                case 'recent':
                                                    this.recentDocs = new RecentDocs(card);
                                                    break;
                                                case 'memo':
                                                    this.memo = new Memo(card,cardConfig.id);
                                                    break;
                                                case 'photo':
                                                    this.photoAlbum = new PhotoAlbum(card);
                                                    break;
                                                case 'heatmap':
                                                    this.heatmap = new Heatmap(card);
                                                    break;
                                                case 'music':
                                                    this.musicPlayer = new MusicPlayer(card);
                                                    break;
                                                case 'quicknote':
                                                    new QuickNote(card);
                                                    break;
                                                case 'quickdoc':
                                                    this.quickDoc = new QuickDoc(card, cardConfig.id);
                                                    break;
                                                case 'birthday':
                                                    this.birthday = new Birthday(card, cardConfig.id);
                                                    break;
                                            }
                                            
                                            // 为新卡片添加拖拽事件
                                            addDragEvents(card);
                                        }
                                    }
                                }
                            }
                            console.log("加载布局配置成功");
                        } else {
                            // 如果没有配置或配置无效，创建默认的番茄钟卡片
                            await createCard('tomato');
                        }
                    } catch (e) {
                        console.log("加载布局配置失败，使用默认配置");
                        await createCard('tomato');
                    }
                };

                // 初始加载布局配置
                loadLayoutConfig();
            }
        });
    }
}