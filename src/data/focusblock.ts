// All dummy data for the FocusBlock prototype lives in this file.
// Nothing here is real. Invented company, invented people, invented content.

export type Tool = "Slack" | "Gmail" | "Jira" | "Google Drive";
export type Urgency = "Blocking" | "Action needed" | "FYI";
export type Priority = "High" | "Normal" | "Low";
export const PRIORITY_ORDER: Priority[] = ["High", "Normal", "Low"];

export type ChipKind = "slack" | "doc" | "sheet" | "slide" | "jira" | "email" | "link";

export type ContextChip = {
  id: string;
  kind: ChipKind;
  label: string;
  /** Where the chip points. Pasted links keep their real URL; seeded chips get a plausible one. */
  url?: string;
};

function slug(s: string) {
  return s.toLowerCase().replace(/^#/, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** The address a context chip opens. Seeded demo chips point at plausible addresses on the tool's own domain. */
export function chipUrl(chip: ContextChip): string {
  if (chip.url) return chip.url;
  const s = slug(chip.label);
  if (chip.kind === "slack") return `https://app.slack.com/client/harborandpine/${s}`;
  if (chip.kind === "doc") return `https://docs.google.com/document/d/${s}`;
  if (chip.kind === "sheet") return `https://docs.google.com/spreadsheets/d/${s}`;
  if (chip.kind === "slide") return `https://docs.google.com/presentation/d/${s}`;
  if (chip.kind === "jira") return `https://harborandpine.atlassian.net/browse/${chip.label}`;
  if (chip.kind === "email") return `https://mail.google.com/mail/#search/${encodeURIComponent(chip.label)}`;
  return chip.label.startsWith("http") ? chip.label : `https://${chip.label}`;
}

/** The address a cue opens in its source tool. Plausible, on the tool's own domain; nothing here is real. */
export function cueUrl(cue: Cue): string {
  const s = slug(cue.origin);
  if (cue.tool === "Slack") return `https://app.slack.com/client/harborandpine/${s}`;
  if (cue.tool === "Jira") return `https://harborandpine.atlassian.net/browse/${cue.ticketKey ?? s}`;
  if (cue.tool === "Gmail") return `https://mail.google.com/mail/#search/${encodeURIComponent(cue.origin)}`;
  return `https://docs.google.com/document/d/${s}`;
}

export type Cue = {
  id: string;
  blockId: string | null;
  tool: Tool;
  origin: string; // channel name, email subject, ticket key + title, document name
  ticketKey?: string;
  ticketStatus?: string;
  sender: string;
  time: string;
  minutesAgo: number;
  preview: string;
  body: string;
  urgency: Urgency;
  reason: string;
  openActionItem: boolean;
  ask?: string;
  draft: string;
  // runtime state
  resolved?: boolean;
  replied?: boolean;
  snoozed?: boolean;
  /** What the person has done on this cue, newest last. */
  history?: CueActivity[];
};

export type CueActivity = {
  at: string;
  label: string;
  detail?: string;
};

export type Block = {
  id: string;
  name: string;
  priority: Priority;
  members: string[];
  chips: ContextChip[];
  summary: string;
  summaryAfterUnblock: string;
};

export type Integration = {
  id: string;
  name: Tool;
  reads: string;
  connected: boolean;
};

export const PERSON = { name: "Maya Lindqvist", role: "Product Manager" };
export const COMPANY = "Harbor & Pine";

export const TOOL_ORDER: Tool[] = ["Slack", "Gmail", "Jira", "Google Drive"];

export const initialBlocks: Block[] = [
  {
    id: "checkout",
    name: "Checkout redesign",
    priority: "High",
    members: ["Maya Lindqvist", "Theo Okafor", "Priya Raman"],
    chips: [
      { id: "c1", kind: "slack", label: "#checkout-redesign" },
      { id: "c2", kind: "doc", label: "Checkout redesign brief" },
      { id: "c3", kind: "jira", label: "SHOP" },
    ],
    summary:
      "The address form change is finished on the engineering side and sitting one answer away from staging. Theo is blocked on you: he needs a yes or no on the error state before the 5 PM staging window closes. Priya already marked the error state final in the brief on Tuesday, so the answer is in hand. Handle Theo first, then the SHOP-482 edge case question.",
    summaryAfterUnblock:
      "Nothing is blocking the staging push anymore. What is left is the SHOP-482 edge case decision and a few review threads that need a short reply. Priya's brief updates are informational and can be read at the end.",
  },
  {
    id: "returns",
    name: "Returns pipeline",
    priority: "High",
    members: ["Maya Lindqvist", "Sam Castillo", "Dana Whitfield"],
    chips: [
      { id: "r1", kind: "slack", label: "#warehouse-returns" },
      { id: "r2", kind: "jira", label: "OPS" },
      { id: "r3", kind: "email", label: "Thread with Sam Castillo" },
    ],
    summary:
      "Warehouse B cannot scan labels printed after the format change, and returns are piling up on the dock. Sam needs a rollback decision from you today, which is the one thing holding the line. OPS-207 is ready to move to UAT as soon as warehouse A confirms. Dana's volume note can wait until the rollback is called.",
    summaryAfterUnblock:
      "The warehouse B scanning problem has a decision on it, so returns can move again. What is left is progressing OPS-207 to UAT and answering Dana on the refund wording. Nothing here is blocking anyone now.",
  },
  {
    id: "catalog",
    name: "Spring catalog launch",
    priority: "Normal",
    members: ["Maya Lindqvist", "Priya Raman", "Jules Moreau"],
    chips: [
      { id: "s1", kind: "doc", label: "Spring catalog plan" },
      { id: "s2", kind: "slack", label: "#catalog" },
    ],
    summary:
      "The catalog plan is close to locked, but the photography budget line is still open and Jules will not sign off without it. Priya has the shot list ready and is waiting on your ordering. Everything else in this Block is reading.",
    summaryAfterUnblock:
      "The budget question has an answer, so Jules can sign off. Priya's shot list ordering is the remaining piece, and the rest of the thread is context you can skim.",
  },
  {
    id: "vendor",
    name: "Vendor contract renewal",
    priority: "Normal",
    members: ["Maya Lindqvist", "Jules Moreau"],
    chips: [
      { id: "v1", kind: "email", label: "Thread with Rowan Ellis" },
      { id: "v2", kind: "jira", label: "OPS-233" },
    ],
    summary:
      "Summit Textiles wants a renewal answer by Friday at the rate they proposed. Jules has not finished the margin check, so the useful move is to buy time on the rate. The linked ticket is only there to track the signature step.",
    summaryAfterUnblock:
      "The Friday deadline has a response on it, so the renewal is no longer sitting on you. What is left is the signature tracking ticket and Jules's margin note when it lands.",
  },
];

export const initialCues: Cue[] = [
  // ---------- Checkout redesign ----------
  {
    id: "cue-1",
    blockId: "checkout",
    tool: "Slack",
    origin: "#checkout-redesign",
    sender: "Theo Okafor",
    time: "Today, 9:12 AM",
    minutesAgo: 190,
    preview: "Are we clear to ship the address form change to staging today?",
    body: "Are we clear to ship the address form change to staging today, or is design still iterating on the error state? I have the branch green and I would rather not sit on it overnight.",
    urgency: "Blocking",
    reason: "Theo cannot deploy until you answer, and the staging window closes at 5 PM.",
    openActionItem: true,
    ask: "Give a yes or no on shipping the address form change to staging.",
    draft:
      "Yes, ship it. Priya marked the error state final in the brief on Tuesday, so there is nothing left for design to iterate on before staging.",
  },
  {
    id: "cue-2",
    blockId: "checkout",
    tool: "Jira",
    origin: "SHOP-482 Address validation fails for apartment numbers",
    ticketKey: "SHOP-482",
    ticketStatus: "In Progress",
    sender: "Theo Okafor",
    time: "Today, 8:40 AM",
    minutesAgo: 222,
    preview: "Handle the apartment-number edge case now or in a follow-up ticket?",
    body: "Validation rejects unit formats like 'Apt 4B' and '#12'. I can patch it inside this ticket, but it widens the diff we are about to send to staging. Do you want it here or in a follow-up ticket?",
    urgency: "Action needed",
    reason: "A decision is requested of you, but no one is blocked while it waits.",
    openActionItem: true,
    ask: "Decide whether the edge case ships here or in a follow-up ticket.",
    draft:
      "Let us take this in a follow-up ticket. The staging push is already scoped and a wider diff makes the address form change harder to verify on its own.",
  },
  {
    id: "cue-3",
    blockId: "checkout",
    tool: "Google Drive",
    origin: "Checkout redesign brief",
    sender: "Priya Raman",
    time: "Yesterday, 4:15 PM",
    minutesAgo: 1250,
    preview: "Updated the error-state section with the final copy and spacing.",
    body: "I updated the error-state section. The inline message now sits under the field rather than above it, and the copy is final. No changes needed from you, just flagging it so the build matches.",
    urgency: "FYI",
    reason: "Informational. No question asked of you.",
    openActionItem: false,
    draft:
      "Thanks Priya, the under-field placement matches what Theo is building, so we are aligned for the staging push.",
  },
  {
    id: "cue-4",
    blockId: "checkout",
    tool: "Slack",
    origin: "#checkout-redesign",
    sender: "Priya Raman",
    time: "Today, 10:02 AM",
    minutesAgo: 140,
    preview: "Do you want the saved-card row above or below the address block?",
    body: "Last open layout question from me: saved-card row above the address block, or below it? Above tests better for returning shoppers, below reads cleaner on a first purchase.",
    urgency: "Action needed",
    reason: "Priya needs your call to finish the layout, though she has other work meanwhile.",
    openActionItem: true,
    ask: "Choose the position of the saved-card row.",
    draft:
      "Put the saved-card row above the address block. Returning shoppers are the bigger share of checkout traffic and the cleaner first-purchase read is a smaller loss.",
  },
  {
    id: "cue-5",
    blockId: "checkout",
    tool: "Jira",
    origin: "SHOP-471 Card errors show twice on retry",
    ticketKey: "SHOP-471",
    ticketStatus: "In Review",
    sender: "qa-bot",
    time: "Today, 7:05 AM",
    minutesAgo: 317,
    preview: "Automated run found a duplicate error toast on the retry path.",
    body: "Run 3411 on branch checkout-address-form: the card error toast renders twice when the shopper retries within five seconds. Screenshot attached in the run log.",
    urgency: "FYI",
    reason: "An automated report with no ask. The owning engineer is already assigned.",
    openActionItem: false,
    draft:
      "Noting this for the retry cleanup pass. It does not block the address form change going to staging today.",
  },
  {
    id: "cue-6",
    blockId: "checkout",
    tool: "Gmail",
    origin: "Checkout copy review, legal pass",
    sender: "Jules Moreau",
    time: "Yesterday, 11:30 AM",
    minutesAgo: 1535,
    preview: "Legal wants one word changed in the payment authorization line.",
    body: "Legal reviewed the checkout copy. Everything passes except the payment authorization line, where they want 'charge' replaced with 'authorize'. Can you get that into the build before launch?",
    urgency: "Action needed",
    reason: "A small change is requested of you with a launch deadline attached.",
    openActionItem: true,
    ask: "Get the wording change into the checkout build.",
    draft:
      "Will do. I will put the 'authorize' wording into the copy file today so it lands well before launch, and I will confirm here once it is merged.",
  },
  {
    id: "cue-7",
    blockId: "checkout",
    tool: "Slack",
    origin: "#checkout-redesign",
    sender: "Theo Okafor",
    time: "Yesterday, 5:48 PM",
    minutesAgo: 1157,
    preview: "Staging window tomorrow is 3 PM to 5 PM, just so it is written down.",
    body: "For the record: tomorrow's staging window is 3 PM to 5 PM. Anything not merged by 2:30 waits until Monday.",
    urgency: "FYI",
    reason: "A scheduling note with no action requested.",
    openActionItem: false,
    draft: "Noted, thanks. I will keep the merges before 2:30.",
  },
  {
    id: "cue-8",
    blockId: "checkout",
    tool: "Google Drive",
    origin: "Checkout redesign brief",
    sender: "Jules Moreau",
    time: "Today, 8:05 AM",
    minutesAgo: 257,
    preview: "Comment on the metrics section asking which number we report at launch.",
    body: "In the metrics section, are we reporting completed checkouts or started checkouts at launch? I need to know which one goes on the weekly finance summary.",
    urgency: "Action needed",
    reason: "Jules needs an answer to finish the finance summary, but nothing is stalled today.",
    openActionItem: true,
    ask: "Say which checkout metric goes on the weekly summary.",
    draft:
      "Report completed checkouts. Started checkouts move with traffic and will read as noise on the weekly summary.",
  },
  {
    id: "cue-9",
    blockId: "checkout",
    tool: "Slack",
    origin: "#checkout-redesign",
    sender: "Dana Whitfield",
    time: "Yesterday, 2:10 PM",
    minutesAgo: 1415,
    preview: "Support sees shoppers confused by the coupon field placement.",
    body: "Two tickets this week about the coupon field. Shoppers do not find it until after they have paid. Sharing in case it is cheap to move in the redesign.",
    urgency: "FYI",
    reason: "Useful background from support with no request attached.",
    openActionItem: false,
    draft:
      "Helpful, thank you. I will look at coupon placement in the redesign pass, as one change.",
  },

  // ---------- Returns pipeline ----------
  {
    id: "cue-10",
    blockId: "returns",
    tool: "Gmail",
    origin: "Warehouse B scanner rejecting new labels",
    sender: "Sam Castillo",
    time: "Today, 7:52 AM",
    minutesAgo: 270,
    preview: "Scanner in warehouse B rejects every label printed after the format change.",
    body: "Since the label format change went in, the returns scanner in warehouse B rejects every label we print. Warehouse A is fine. We have about 300 parcels stacking on the dock. I need a decision today on rolling the format back for B.",
    urgency: "Blocking",
    reason: "Returns processing is stopped in warehouse B until you approve a rollback.",
    openActionItem: true,
    ask: "Approve or reject rolling the label format back in warehouse B.",
    draft:
      "Approved, roll the format back for warehouse B only and leave warehouse A on v2. Please send me a few of the failing label examples so we can find what the B scanner is choking on.",
  },
  {
    id: "cue-11",
    blockId: "returns",
    tool: "Jira",
    origin: "OPS-207 Label format v2 rollout",
    ticketKey: "OPS-207",
    ticketStatus: "In Progress",
    sender: "Sam Castillo",
    time: "Today, 8:30 AM",
    minutesAgo: 232,
    preview: "Ready to move to UAT once warehouse A confirms a clean day.",
    body: "Warehouse A has run a clean day on format v2. This can move to UAT whenever you are ready to sign it off.",
    urgency: "Action needed",
    reason: "The ticket is ready to progress and only your sign-off is missing.",
    openActionItem: true,
    ask: "Move OPS-207 to UAT.",
    draft:
      "Moving this to UAT on the strength of warehouse A's clean day. Warehouse B stays on the rolled-back format until we have the failing samples.",
  },
  {
    id: "cue-12",
    blockId: "returns",
    tool: "Slack",
    origin: "#warehouse-returns",
    sender: "Dana Whitfield",
    time: "Yesterday, 3:20 PM",
    minutesAgo: 1345,
    preview: "Refund wording confuses shoppers when the return is partial.",
    body: "When only part of an order comes back, the refund email still says 'your return is complete'. Shoppers write in thinking they have been refunded for everything. Can we word it per item?",
    urgency: "Action needed",
    reason: "Dana is asking for a change you own, with no hard deadline.",
    openActionItem: true,
    ask: "Decide whether refund emails get per-item wording.",
    draft:
      "Yes, let us word it per item. I will write the two variants for full and partial returns and send them to you before they go into the template.",
  },
  {
    id: "cue-13",
    blockId: "returns",
    tool: "Slack",
    origin: "#warehouse-returns",
    sender: "Sam Castillo",
    time: "Today, 6:40 AM",
    minutesAgo: 342,
    preview: "Dock photo of the parcels waiting on the scanner decision.",
    body: "Photo of the dock this morning. This is what 300 parcels looks like. No action from you here beyond the email I sent.",
    urgency: "FYI",
    reason: "Context for the email you already have. The ask lives there.",
    openActionItem: false,
    draft: "Seen. Answering the rollback question in your email now.",
  },
  {
    id: "cue-14",
    blockId: "returns",
    tool: "Jira",
    origin: "OPS-198 Returns dashboard export times out",
    ticketKey: "OPS-198",
    ticketStatus: "Backlog",
    sender: "qa-bot",
    time: "Yesterday, 9:15 AM",
    minutesAgo: 1660,
    preview: "Export job exceeds the 30 second limit on ranges over 60 days.",
    body: "Nightly check: the returns dashboard export times out for date ranges longer than 60 days. Reproducible on three runs.",
    urgency: "FYI",
    reason: "An automated finding sitting in the backlog with no owner request.",
    openActionItem: false,
    draft: "Leaving this in the backlog for now. It does not affect the label rollout work.",
  },
  {
    id: "cue-15",
    blockId: "returns",
    tool: "Gmail",
    origin: "Carrier pickup schedule, week of the 14th",
    sender: "Sam Castillo",
    time: "Yesterday, 8:05 AM",
    minutesAgo: 1730,
    preview: "Pickups move to 7 AM next week at both warehouses.",
    body: "Carrier is shifting pickups to 7 AM next week at both warehouses. No change needed from your side, sharing so the dashboard numbers make sense.",
    urgency: "FYI",
    reason: "A logistics note shared for awareness only.",
    openActionItem: false,
    draft: "Thanks for the heads up, I will read the dashboard dip on Monday as the pickup shift.",
  },

  // ---------- Spring catalog launch ----------
  {
    id: "cue-16",
    blockId: "catalog",
    tool: "Google Drive",
    origin: "Spring catalog plan",
    sender: "Jules Moreau",
    time: "Today, 9:40 AM",
    minutesAgo: 162,
    preview: "Photography budget line is still empty and sign-off waits on it.",
    body: "I cannot sign off the plan while the photography line is blank. Give me a number or a range and I will run it through the quarter.",
    urgency: "Blocking",
    reason: "Jules cannot sign off the catalog plan until you fill this line.",
    openActionItem: true,
    ask: "Provide a photography budget number or range.",
    draft:
      "Put in a range of 8,000 to 10,000 for photography. That covers the two studio days and the outdoor shoot Priya has on the shot list.",
  },
  {
    id: "cue-17",
    blockId: "catalog",
    tool: "Slack",
    origin: "#catalog",
    sender: "Priya Raman",
    time: "Today, 8:55 AM",
    minutesAgo: 207,
    preview: "Shot list is ready, which twelve products lead the catalog?",
    body: "Shot list is drafted. I need your ordering for the twelve lead products so the studio days are booked around the right gear.",
    urgency: "Action needed",
    reason: "Priya needs your ordering before she can book the studio.",
    openActionItem: true,
    ask: "Order the twelve lead products for the shot list.",
    draft:
      "I will send the ordering today. Lead with the three-season tent and the insulated jackets, then the packs, then accessories.",
  },
  {
    id: "cue-18",
    blockId: "catalog",
    tool: "Slack",
    origin: "#catalog",
    sender: "Jules Moreau",
    time: "Yesterday, 1:05 PM",
    minutesAgo: 1480,
    preview: "Quarter close moves to the 27th, catalog spend lands in the next period.",
    body: "Finance calendar changed: quarter close is the 27th. Catalog spend after that date lands in the next period. Nothing needed from you, just plan around it.",
    urgency: "FYI",
    reason: "A calendar note with no request attached.",
    openActionItem: false,
    draft: "Understood, I will keep the studio days before the 27th where possible.",
  },
  {
    id: "cue-19",
    blockId: "catalog",
    tool: "Google Drive",
    origin: "Spring catalog plan",
    sender: "Priya Raman",
    time: "Yesterday, 10:20 AM",
    minutesAgo: 1645,
    preview: "Added the cover concepts to the plan for reading.",
    body: "Three cover concepts are in the plan now with notes on each. Read when you have a minute, I am not asking for a decision yet.",
    urgency: "FYI",
    reason: "Shared for reading. The decision comes later.",
    openActionItem: false,
    draft: "Read them, the second concept is the strongest to me. I will comment properly when you ask for the call.",
  },

  // ---------- Vendor contract renewal ----------
  {
    id: "cue-20",
    blockId: "vendor",
    tool: "Gmail",
    origin: "Renewal terms for the coming year",
    sender: "Rowan Ellis, Summit Textiles",
    time: "Today, 8:15 AM",
    minutesAgo: 247,
    preview: "Will Harbor & Pine renew at the proposed rate by Friday?",
    body: "Following up on the renewal. Can you confirm by Friday whether Harbor & Pine will renew at the rate in my last note? I need to hold production capacity for you either way.",
    urgency: "Action needed",
    reason: "A dated request addressed to you, though nothing is stopped in the meantime.",
    openActionItem: true,
    ask: "Confirm the renewal rate or ask for more time by Friday.",
    draft:
      "Thanks Rowan. We are still finishing our margin review, so could we have two more weeks before confirming? In the meantime, please send the volume-tier pricing sheet so we can compare properly.",
  },
  {
    id: "cue-21",
    blockId: "vendor",
    tool: "Jira",
    origin: "OPS-233 Track vendor renewal signature",
    ticketKey: "OPS-233",
    ticketStatus: "To Do",
    sender: "Jules Moreau",
    time: "Yesterday, 4:50 PM",
    minutesAgo: 1195,
    preview: "Ticket opened to track the signature step once terms are agreed.",
    body: "Opened this so the signature step does not get lost. Nothing to do until the terms are settled.",
    urgency: "FYI",
    reason: "A tracking ticket with no current action.",
    openActionItem: false,
    draft: "Good, leaving this until the terms are settled.",
  },
  {
    id: "cue-22",
    blockId: "vendor",
    tool: "Gmail",
    origin: "Margin review, first pass",
    sender: "Jules Moreau",
    time: "Today, 7:30 AM",
    minutesAgo: 292,
    preview: "First pass says the proposed rate costs us about two points of margin.",
    body: "First pass on the numbers: the proposed rate costs us roughly two points of margin at current volume. I want another day before you answer Rowan.",
    urgency: "Blocking",
    reason: "You should not answer the vendor until Jules finishes, so this gates the reply.",
    openActionItem: true,
    ask: "Hold the vendor reply until Jules finishes the margin review.",
    draft:
      "Understood, I will buy us time on the rate. I am asking Rowan for two more weeks and for the volume-tier sheet so your second pass has better inputs.",
  },

  // ---------- Unassigned ----------
  {
    id: "cue-23",
    blockId: null,
    tool: "Slack",
    origin: "#general",
    sender: "Dana Whitfield",
    time: "Today, 9:05 AM",
    minutesAgo: 197,
    preview: "Four damaged-on-arrival claims this week, all from the same carrier route.",
    body: "Heads up, we have had four damaged-on-arrival claims this week and all of them came through the same carrier route. Feels like a pattern rather than bad luck.",
    urgency: "Action needed",
    reason: "A pattern is being raised to you and no one else owns it yet.",
    openActionItem: true,
    ask: "Decide who owns the damaged-on-arrival pattern.",
    draft:
      "Thanks Dana. Let us treat this as its own workstream and start by pulling the claims from that route for the last month.",
  },
  {
    id: "cue-24",
    blockId: null,
    tool: "Gmail",
    origin: "Support pattern, damaged-on-arrival claims",
    sender: "Dana Whitfield",
    time: "Today, 9:20 AM",
    minutesAgo: 182,
    preview: "Claims are clustered on one route and the photos look like crush damage.",
    body: "Writing this up properly: the damaged-on-arrival claims cluster on one route, and the customer photos all show crush damage on the same box corner. I think it is handling, not packaging, but I cannot prove it from support data alone.",
    urgency: "Action needed",
    reason: "Dana is asking for a decision on how to investigate.",
    openActionItem: true,
    ask: "Decide how to investigate the crush damage claims.",
    draft:
      "This is enough to act on. Send me the claim IDs and photos and I will raise it with the carrier alongside the packaging check on our side.",
  },
  {
    id: "cue-25",
    blockId: null,
    tool: "Jira",
    origin: "OPS-241 Damaged-on-arrival claim intake is manual",
    ticketKey: "OPS-241",
    ticketStatus: "To Do",
    sender: "Sam Castillo",
    time: "Yesterday, 3:55 PM",
    minutesAgo: 1310,
    preview: "Every damaged-on-arrival claim is re-keyed by hand into the returns sheet.",
    body: "Right now every damaged-on-arrival claim gets re-keyed by hand into the returns sheet. If the volume keeps going up this becomes a person's whole morning.",
    urgency: "Action needed",
    reason: "A growing manual cost is being flagged for your prioritization.",
    openActionItem: true,
    ask: "Prioritize or defer automating claim intake.",
    draft:
      "Let us size this properly. Log how long the re-keying takes for a week and we will decide with a real number.",
  },
  {
    id: "cue-26",
    blockId: null,
    tool: "Slack",
    origin: "#general",
    sender: "Theo Okafor",
    time: "Yesterday, 12:40 PM",
    minutesAgo: 1505,
    preview: "Reminder that the staging database resets every Sunday night.",
    body: "Reminder for everyone: the staging database resets every Sunday night. Do not leave test data there expecting it on Monday.",
    urgency: "FYI",
    reason: "A general announcement with no ask for you.",
    openActionItem: false,
    draft: "Noted, thanks Theo.",
  },
  {
    id: "cue-27",
    blockId: null,
    tool: "Google Drive",
    origin: "Team offsite agenda",
    sender: "Priya Raman",
    time: "Yesterday, 5:30 PM",
    minutesAgo: 1170,
    preview: "Comment asking whether you want a slot on the offsite agenda.",
    body: "Do you want a slot on the offsite agenda? Twenty minutes is free in the afternoon if you have something to walk the team through.",
    urgency: "FYI",
    reason: "A light question with no deadline or dependency.",
    openActionItem: false,
    draft: "Yes please, put me down for the twenty minutes and I will walk through the checkout redesign.",
  },
  {
    id: "cue-28",
    blockId: null,
    tool: "Gmail",
    origin: "Re: Carrier pickup window change",
    sender: "Sam Castillo",
    time: "Today, 7:50 AM",
    minutesAgo: 272,
    preview: "The carrier moved our afternoon pickup to 2 PM starting next week.",
    body: "Heads up, the carrier moved our afternoon pickup from 4 PM to 2 PM starting next week. Warehouse A can make it. Warehouse B will need the packing cutoff moved earlier, which affects same-day returns processing. Do you want me to change the cutoff or push back on the carrier?",
    urgency: "Action needed",
    reason: "Sam is asking you to choose between two options with a deadline next week.",
    openActionItem: true,
    ask: "Choose between moving the packing cutoff or pushing back on the carrier.",
    draft:
      "Move the cutoff for warehouse B for now so we do not miss pickups, and send me the carrier's contact. I will ask whether 3 PM is possible before we make the change permanent.",
  },
  {
    id: "cue-29",
    blockId: null,
    tool: "Jira",
    origin: "SHOP-510 Gift card balance shows stale value after redemption",
    ticketKey: "SHOP-510",
    ticketStatus: "To Do",
    sender: "qa-bot",
    time: "Today, 6:15 AM",
    minutesAgo: 367,
    preview: "New bug filed by QA automation, no owner assigned yet.",
    body: "Automated regression found the gift card balance on the account page showing the pre-redemption value for up to ten minutes after a redemption. Severity medium. No owner assigned.",
    urgency: "Action needed",
    reason: "A new ticket with no owner will sit until someone triages it.",
    openActionItem: true,
    ask: "Assign an owner or move the ticket to a Block.",
    draft: "Assigning to the checkout team for triage. Please confirm whether this is a caching issue or a data issue before estimating.",
  },
  {
    id: "cue-30",
    blockId: null,
    tool: "Slack",
    origin: "#general",
    sender: "Jules Moreau",
    time: "Yesterday, 4:05 PM",
    minutesAgo: 1300,
    preview: "Q3 close is next Friday. Send any outstanding vendor invoices to me by Wednesday.",
    body: "Q3 close is next Friday. If you have any outstanding vendor invoices, send them to me by Wednesday so they land in the right quarter.",
    urgency: "FYI",
    reason: "A company-wide reminder. The vendor invoice for your Block is already with Jules.",
    openActionItem: false,
    draft: "Thanks Jules, the Summit Textiles invoice is already with you.",
  },
  {
    id: "cue-31",
    blockId: null,
    tool: "Google Drive",
    origin: "Returns dashboard, Q3",
    sender: "Dana Whitfield",
    time: "Yesterday, 10:20 AM",
    minutesAgo: 1645,
    preview: "Comment on the returns dashboard sheet asking whether refund time should include weekends.",
    body: "Should the refund time metric include weekends? Right now it does, which makes Monday look worse than it is. I can change the formula if you want business days only.",
    urgency: "Action needed",
    reason: "Dana is asking for a decision on how a metric is defined.",
    openActionItem: true,
    ask: "Decide whether refund time counts business days or calendar days.",
    draft: "Business days only, and add a note on the sheet saying so. Weekends make the trend read wrong.",
  },
];

export const SUGGESTED_BLOCK = {
  name: "Damaged-on-arrival claims",
  description: "Based on 3 unassigned items from Slack, Gmail, and Jira, all about the same carrier route.",
  cueIds: ["cue-23", "cue-24", "cue-25"],
};

export const initialIntegrations: Integration[] = [
  { id: "slack", name: "Slack", reads: "Messages and mentions from the channels you link to a Block.", connected: true },
  { id: "gmail", name: "Gmail", reads: "Email threads that involve the people and projects in your Blocks.", connected: false },
  { id: "jira", name: "Jira", reads: "Tickets and comments under the project keys you link.", connected: true },
  { id: "drive", name: "Google Drive", reads: "Comments on the documents you link to a Block.", connected: false },
];

export const SORT_OPTIONS = [
  "Urgency",
  "Newest first",
  "Oldest first",
  "Open action items first",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
