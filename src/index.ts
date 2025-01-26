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

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class PluginSample extends Plugin {

    customTab: () => IModel;
    private isMobile: boolean;
    private tomatoClock: TomatoClock;
    private memorialDay: MemorialDay;
    private habitTracker: HabitTracker;
    private stickyNote: StickyNote;

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

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
</symbol>`);

        // 创建行容器
        const createRow = () => {
            const row = document.createElement('div');
            row.className = 'card-row';
            row.style.cssText = `
                display: flex;
                flex-direction: row;
                gap: 5px;
                width: 100%;
                min-height: min-content;
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
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconTime",
                title: "番茄钟",
                hotkey: "⌥⌘W",
            },
            data: {
                text: "番茄钟"
            },
            type: DOCK_TYPE,
            init: (dock) => {
                // 设置dock容器的内边距，确保有足够的空间
                dock.element.style.padding = '8px';
                dock.element.style.boxSizing = 'border-box';
                dock.element.style.display = 'flex';
                dock.element.style.flexDirection = 'column';
                dock.element.style.gap = '5px';

                // 创建第一行并添加番茄钟卡片
                const tomatoRow = createRow();
                dock.element.appendChild(tomatoRow);
                const card = document.createElement('div');
                card.className = 'card';
                card.setAttribute('draggable', 'true');
                card.dataset.cardType = 'tomato';
                card.style.cssText = cardStyle;
                tomatoRow.appendChild(card);
                this.tomatoClock = new TomatoClock(card);

                // 创建第二行并添加纪念日卡片
                const memorialRow = createRow();
                dock.element.appendChild(memorialRow);
                const memorialCard = document.createElement('div');
                memorialCard.className = 'card';
                memorialCard.setAttribute('draggable', 'true');
                memorialCard.dataset.cardType = 'memorial';
                memorialCard.style.cssText = cardStyle;
                memorialRow.appendChild(memorialCard);
                this.memorialDay = new MemorialDay(memorialCard);

                // 创建第三行并添加习惯追踪器卡片
                const habitRow = createRow();
                dock.element.appendChild(habitRow);
                const habitCard = document.createElement('div');
                habitCard.className = 'card';
                habitCard.setAttribute('draggable', 'true');
                habitCard.dataset.cardType = 'habit';
                habitCard.style.cssText = cardStyle;
                habitRow.appendChild(habitCard);
                this.habitTracker = new HabitTracker(habitCard);

                // 创建第四行并添加贴纸卡片
                const stickyRow = createRow();
                dock.element.appendChild(stickyRow);
                const stickyCard = document.createElement('div');
                stickyCard.className = 'card';
                stickyCard.setAttribute('draggable', 'true');
                stickyCard.dataset.cardType = 'sticky';
                stickyCard.style.cssText = cardStyle;
                stickyRow.appendChild(stickyCard);
                this.stickyNote = new StickyNote(stickyCard);

                // 添加拖拽相关事件监听
                const cards = dock.element.getElementsByClassName('card');
                let draggedCard: HTMLElement | null = null;
                let placeholder: HTMLElement | null = null;

                Array.from(cards).forEach(card => {
                    card.addEventListener('dragstart', (e: DragEvent) => {
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
                    });

                    card.addEventListener('dragover', (e: DragEvent) => {
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
                    });

                    card.addEventListener('dragend', (e) => {
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
                        }
                        draggedCard = null;
                        placeholder = null;
                    });

                    card.addEventListener('drop', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });

                // 为dock容器添加dragover事件
                dock.element.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const target = e.target as HTMLElement;
                    if (target === dock.element && placeholder) {
                        const newRow = createRow();
                        newRow.appendChild(placeholder);
                        dock.element.appendChild(newRow);
                    }
                });
            }
        });
    }
}