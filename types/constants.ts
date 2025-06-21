import { Enums } from "./supabase";

export const INDEX_MULTIPLIER = 10


export const SCROLLBAR_STYLE = "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary scrollbar-track-transparent"

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
export const NEW_BOARD_LINK = "/b/new"
export const DEMO_BOARD_LINK = "/demo"
export const DASHBOARD_LINK = "/dashboard"
export const LOGIN_LINK = "/login"
export const ROADMAP_LINK = "https://jondrew.notion.site/Mudboard-Roadmap-2162e809fa4e80eb94add8aa315c769d?source=copy_link"

export const INTEREST_LINK = "https://forms.gle/QA96JUcRRP5YSqRT6"