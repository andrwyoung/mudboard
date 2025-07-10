import { Enums } from "./supabase";

export const INDEX_MULTIPLIER = 10
export const MAX_FREE_TIER_BOARDS = 3


export const SCROLLBAR_STYLE = "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary scrollbar-track-transparent"
export const SCROLLBAR_STYLE_WHITE = "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-white scrollbar-track-transparent"
export const ACCESSIBLE_BUTTON = "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"

// UI variables
export const MIN_COLUMNS = 1;
export const MAX_COLUMNS = 8;
export const DEFAULT_COLUMNS = 4;

export const DEFAULT_SPACING = 12;
export const DEFAULT_GALLERY_SPACING = 12;

export const DEFAULT_SECTION_NAME = "Untitled Section";
export const DEFAULT_BOARD_TITLE= "Untitled Board";

export const PINNED_IMAGE_PADDING = 800;

export const MAX_OVERLAY_ZOOM = 3;
export const MAX_FOCUS_ZOOM = 8;

export const MOBILE_BREAKPOINT = 640;
export const MOBILE_COLUMN_NUMBER = 2;

// login constants
export const DEFAULT_TIER : Enums<"tier_level"> = "free"


// links constants
export const BOARD_BASE_URL= "https://mudboard.com/b"
export const SECTION_BASE_URL = "https://mudboard.com/mudkit";

// hard coded links
export const SUPPORT_EMAIL = "andrew@mudboard.com"

export const NEW_BOARD_LINK = "/b/new"
export const DEMO_BOARD_LINK = "/demo"
export const DASHBOARD_LINK = "/dashboard"
export const PRICING_PAGE = "/#pricing"
export const LOGIN_LINK = "/login"
export const ROADMAP_LINK = "https://jondrew.notion.site/Mudboard-Roadmap-2162e809fa4e80eb94add8aa315c769d?source=copy_link"

export const INTEREST_LINK = "https://forms.gle/QA96JUcRRP5YSqRT6"




// thumbnail constants
export const NUM_SECTION_TO_CHECK = 3;
export const NUM_BLOCKS_TO_GRAB = 30;