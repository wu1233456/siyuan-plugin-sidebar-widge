import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    openTab,
    adaptHotkey,
    getFrontend,
    getBackend,
    IModel,
    Protyle,
    openWindow,
    IOperation,
    Constants,
    openMobileFileById,
    lockScreen,
    ICard,
    ICardData
} from "siyuan";
import "@/index.scss";

import HelloExample from "@/hello.svelte";
import SettingExample from "@/setting-example.svelte";

import { SettingUtils } from "./libs/setting-utils";
import { svelteDialog } from "./libs/dialog";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class PluginSample extends Plugin {

    customTab: () => IModel;
    private isMobile: boolean;
    private settingUtils: SettingUtils;

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        console.log("loading plugin-sample", this.i18n);

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
<path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
</symbol>
<symbol id="iconSaving" viewBox="0 0 32 32">
<path d="M20 13.333c0-0.733 0.6-1.333 1.333-1.333s1.333 0.6 1.333 1.333c0 0.733-0.6 1.333-1.333 1.333s-1.333-0.6-1.333-1.333zM10.667 12h6.667v-2.667h-6.667v2.667zM29.333 10v9.293l-3.76 1.253-2.24 7.453h-7.333v-2.667h-2.667v2.667h-7.333c0 0-3.333-11.28-3.333-15.333s3.28-7.333 7.333-7.333h6.667c1.213-1.613 3.147-2.667 5.333-2.667 1.107 0 2 0.893 2 2 0 0.28-0.053 0.533-0.16 0.773-0.187 0.453-0.347 0.973-0.427 1.533l3.027 3.027h2.893zM26.667 12.667h-1.333l-4.667-4.667c0-0.867 0.12-1.72 0.347-2.547-1.293 0.333-2.347 1.293-2.787 2.547h-8.227c-2.573 0-4.667 2.093-4.667 4.667 0 2.507 1.627 8.867 2.68 12.667h2.653v-2.667h8v2.667h2.68l2.067-6.867 3.253-1.093v-4.707z"></path>
</symbol>`);

        const topBarElement = this.addTopBar({
            icon: "iconFace",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                if (this.isMobile) {
                    this.addMenu();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    this.addMenu(rect);
                }
            }
        });

        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="Remove plugin-sample Data">
    <svg>
        <use xlink:href="#iconTrashcan"></use>
    </svg>
</div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", () => {
            confirm("⚠️", this.i18n.confirmRemove.replace("${name}", this.name), () => {
                this.removeData(STORAGE_NAME).then(() => {
                    this.data[STORAGE_NAME] = { readonlyText: "Readonly" };
                    showMessage(`[${this.name}]: ${this.i18n.removedData}`);
                });
            });
        });
        this.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
        });

        this.addCommand({
            langKey: "showDialog",
            hotkey: "⇧⌘O",
            callback: () => {
                this.showDialog();
            },
            fileTreeCallback: (file: any) => {
                console.log(file, "fileTreeCallback");
            },
            editorCallback: (protyle: any) => {
                console.log(protyle, "editorCallback");
            },
            dockCallback: (element: HTMLElement) => {
                console.log(element, "dockCallback");
            },
        });
        this.addCommand({
            langKey: "getTab",
            hotkey: "⇧⌘M",
            globalCallback: () => {
                console.log(this.getOpenedTab());
            },
        });

        this.addDock({
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconSaving",
                title: "番茄钟",
                hotkey: "⌥⌘W",
            },
            data: {
                text: "番茄钟"
            },
            type: DOCK_TYPE,
            init: (dock) => {
                // 添加样式
                const style = document.createElement('style');
                style.textContent = `
                    :root {
                        --body-bg: #333;
                        --font-size: min(16vw, 4rem);
                        --center-border: 0.2vw solid #000;
                        --col-width: min(16vw, 4rem);
                        --col-height: calc(var(--col-width) * 1.4);
                        --col-color: #ddd;
                        --col-bg: #1a1a1a;
                    }

                    .time {
                        position: relative;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                        gap: 0.5rem 0.3rem;
                        font-family: sans-serif;
                        font-weight: 700;
                        overflow: hidden;
                        padding: 10px;
                    }

                    .time-group {
                        display: flex;
                        gap: 0.3rem;
                        margin: 0 0.5rem;
                    }

                    .col {
                        width: var(--col-width);
                        height: var(--col-height);
                        perspective: var(--col-height);
                    }

                    .curr,
                    .next {
                        position: relative;
                        width: var(--col-width);
                        height: calc(var(--col-height) / 2);
                        font-size: var(--font-size);
                        background: var(--col-bg);
                        border-radius: 0.3rem;
                        color: var(--col-color);
                        overflow: hidden;
                        box-sizing: border-box;
                    }

                    .flip .curr::before,
                    .flip .next::before,
                    .col > .curr::before,
                    .col > .next::before {
                        position: absolute;
                        content: attr(data-t);
                        line-height: var(--col-height);
                        text-align: center;
                        height: var(--col-height);
                        left: 0;
                        right: 0;
                    }

                    .flip .curr::before,
                    .col > .next::before {
                        top: 0;
                    }

                    .flip .next::before,
                    .col > .curr::before {
                        bottom: 0;
                    }

                    .flip .curr,
                    .col > .next {
                        border-bottom: var(--center-border);
                    }

                    .flip .next,
                    .col > .curr {
                        border-top: var(--center-border);
                    }

                    .flip .next {
                        transform: rotateX(-180deg);
                        backface-visibility: hidden;
                    }

                    .flip .curr {
                        position: absolute;
                        top: 0;
                        backface-visibility: hidden;
                    }

                    .flip {
                        position: absolute;
                        width: var(--col-width);
                        height: var(--col-height);
                        z-index: 1;
                        transform-style: preserve-3d;
                        transition: transform 0s;
                        transform: rotateX(0);
                    }

                    .flip.active {
                        transition: all 0.5s ease-in-out;
                        transform: rotateX(-180deg);
                    }
                `;
                dock.element.appendChild(style);

                // 创建时钟容器
                const timeDiv = document.createElement('div');
                timeDiv.className = 'time';
                timeDiv.id = 'time';

                // 创建时分秒分组
                const hourGroup = document.createElement('div');
                hourGroup.className = 'time-group';
                const minuteGroup = document.createElement('div');
                minuteGroup.className = 'time-group';
                const secondGroup = document.createElement('div');
                secondGroup.className = 'time-group';

                timeDiv.append(hourGroup, minuteGroup, secondGroup);
                dock.element.appendChild(timeDiv);

                // 时钟逻辑
                const colElms = [];

                function getTimeStr(date = new Date()) {
                    return [date.getHours(), date.getMinutes(), date.getSeconds()]
                        .map((item) => item.toString().padStart(2, "0"))
                        .join("");
                }

                function createCol(parent: HTMLElement) {
                    const createEl = (cls) => {
                        const div = document.createElement("div");
                        div.classList.add(cls);
                        return div;
                    };
                    const [col, flip, flipNext, flipCurr, next, curr] = ["col", "flip", "next", "curr", "next", "curr"].map(
                        (cls) => createEl(cls)
                    );
                    flip.append(flipNext, flipCurr);
                    col.append(flip, next, curr);
                    parent.append(col);
                    return {
                        toggleActive: () => flip.classList.toggle("active"),
                        getCurr: () => curr.dataset.t,
                        setCurr: (t) => [flipCurr, curr].forEach((el) => (el.dataset.t = t)),
                        setNext: (t) => [flipNext, next].forEach((el) => (el.dataset.t = t)),
                    };
                }

                // 创建时分秒的数字
                for (let i = 0; i < 2; i++) {
                    colElms.push(createCol(hourGroup));
                }
                for (let i = 2; i < 4; i++) {
                    colElms.push(createCol(minuteGroup));
                }
                for (let i = 4; i < 6; i++) {
                    colElms.push(createCol(secondGroup));
                }

                const timeStr = getTimeStr();
                colElms.forEach(({ setCurr }, i) => {
                    setCurr(timeStr[i]);
                });

                let lastSec = new Date().getSeconds();
                function updateTime() {
                    let s = new Date().getSeconds();
                    if (s === lastSec) {
                        return;
                    }
                    lastSec = s;
                    const currStr = getTimeStr();
                    colElms.forEach(({ toggleActive, getCurr, setCurr, setNext }, i) => {
                        var currTxt = getCurr();
                        setNext(currStr[i]);
                        if (currTxt !== currStr[i]) {
                            toggleActive();
                            setTimeout(() => {
                                toggleActive();
                                setCurr(currStr[i]);
                            }, 500);
                        }
                    });
                }

                function run() {
                    updateTime();
                    setTimeout(() => {
                        run();
                    }, 1000 / 60);
                }

                run();
            }
        });
    }
}