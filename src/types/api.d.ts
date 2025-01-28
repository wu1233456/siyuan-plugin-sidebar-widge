interface IResGetNotebookConf {
    box: string;
    conf: NotebookConf;
    name: string;
}

interface IReslsNotebooks {
    notebooks: Notebook[];
}

interface IResUpload {
    errFiles: string[];
    succMap: { [key: string]: string };
}

interface IResdoOperations {
    doOperations: doOperation[];
    undoOperations: doOperation[] | null;
}

interface IResGetBlockKramdown {
    id: BlockId;
    kramdown: string;
}

interface IResGetChildBlock {
    id: BlockId;
    type: BlockType;
    subtype?: BlockSubType;
}

interface IResGetTemplates {
    content: string;
    path: string;
}

interface IResReadDir {
    isDir: boolean;
    isSymlink: boolean;
    name: string;
}

interface IResExportMdContent {
    hPath: string;
    content: string;
}

interface IResBootProgress {
    progress: number;
    details: string;
}

interface IResForwardProxy {
    body: string;
    contentType: string;
    elapsed: number;
    headers: { [key: string]: string };
    status: number;
    url: string;
}

interface IResExportResources {
    path: string;
}

/**
 * Get block HTML DOM and other information
 */
interface IPayload {
    /**
     * The end block ID
     */
    readonly endID?: string;
    /**
     * Block ID
     */
    readonly id: string;
    /**
     * Block index
     */
    readonly index?: number;
    /**
     * Whether it is a reverse link
     */
    readonly isBacklink?: boolean;
    /**
     * Load mode
     */
    readonly mode?: number;
    /**
     * Query statements
     */
    readonly query?: string;
    /**
     * Query method
     */
    readonly queryMethod?: number;
    readonly queryTypes?: IQueryTypes;
    /**
     * Maximum number of loaded blocks
     */
    readonly size?: number;
    /**
     * The starting block ID
     */
    readonly startID?: string;
}

/**
 * Query the specified block type (block type filter)
 */
interface IQueryTypes {
    /**
     * Quote block
     */
    readonly blockquote?: boolean;
    /**
     * Code block
     */
    readonly codeBlock?: boolean;
    /**
     * Document block
     */
    readonly document?: boolean;
    /**
     * Embed block
     */
    readonly embedBlock?: boolean;
    /**
     * Heading block
     */
    readonly heading?: boolean;
    /**
     * HTML block
     */
    readonly htmlBlock?: boolean;
    /**
     * List block
     */
    readonly list?: boolean;
    /**
     * List item block
     */
    readonly listItem?: boolean;
    /**
     * Math formula block
     */
    readonly mathBlock?: boolean;
    /**
     * Paragraph block
     */
    readonly paragraph?: boolean;
    /**
     * Super blok
     */
    readonly superBlock?: boolean;
    /**
     * Table block
     */
    readonly table?: boolean;
}

/**
 * Get block HTML DOM and other information
 */
interface IResponse {
    /**
     * status code
     */
    readonly code: number;
    readonly data: IData;
    /**
     * status message
     */
    readonly msg: string;
}

/**
 * Response information
 */
interface IData {
    /**
     * Block count
     */
    readonly blockCount: number;
    /**
     * Notebook ID
     */
    readonly box: string;
    /**
     * HTML DOM string
     */
    readonly content: string;
    /**
     * End Of File
     */
    readonly eof: boolean;
    /**
     * Block ID
     */
    readonly id: string;
    /**
     * is backlink detail?
     */
    readonly isBacklinkExpand: boolean;
    /**
     * is syncing?
     */
    readonly isSyncing: boolean;
    /**
     * Load mode
     */
    readonly mode: number;
    /**
     * Logic parent block ID
     * if heading exists, it is heading block ID
     * else equal parentID
     */
    readonly parent2ID: string;
    /**
     * Parent block ID
     */
    readonly parentID: string;
    /**
     * Document path, which needs to start with / and separate levels with /
     * path here corresponds to the database path field
     */
    readonly path: string;
    /**
     * Document block ID
     */
    readonly rootID: string;
    /**
     * is dynamic loading?
     */
    readonly scroll: boolean;
    /**
     * Block type
     */
    readonly type: TBlockType;
}

/**
 * Block type
 */
type TBlockType = "NodeAttributeView" | "NodeAudio" | "NodeBlockQueryEmbed" | "NodeBlockquote" | "NodeCodeBlock" | "NodeDocument" | "NodeHeading" | "NodeHTMLBlock" | "NodeIFrame" | "NodeList" | "NodeListItem" | "NodeMathBlock" | "NodeParagraph" | "NodeSuperBlock" | "NodeTable" | "NodeThematicBreak" | "NodeVideo" | "NodeWidget";

