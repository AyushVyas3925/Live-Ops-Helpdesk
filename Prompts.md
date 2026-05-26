### What I needed help with

**Problem 1: Avoiding race conditions in collaborative ticket locking**

I wasn't sure whether to update the local ticket status optimistically on the client when the user clicks "Edit", or wait for the server's broadcast. Optimistic updates feel faster, but if two dispatchers click the same ticket at almost the exact same millisecond, both would think they got the lock before the server resolves the race.

**AI response summary:**
Avoid client-side optimistic updates for lock states. Rely purely on the server's broadcast as the single source of truth. When the user initiates an edit, emit the lock request but wait for the server's `ticket_locked` broadcast to actually transition the UI. If another agent's request arrived first, the server will broadcast their ownership, and the local UI will transition to disabled instead.

**Decision made:** Implemented server-driven locking updates in `features/presence-lock/hooks/useTicketLock.ts`. The UI remains in an available state until the socket server broadcasts the `ticket_locked` event. If another agent gets the lock first, the local UI transitions to a locked state and disables the "Edit" button (`aria-disabled="true"`), preventing any client-side race conditions.

---

**Problem 2: Avoiding a thundering herd on WebSocket server restart**

When the Node.js/Socket.io server restarts, all 50 active dispatcher screens will try to reconnect at the exact same millisecond. This sudden wave of concurrent upgrade requests could overwhelm the server process, causing it to crash or drop connections.

**AI response summary:**
Introduce randomized connection delays (jitter) and reconnection limits directly in the client configuration to stagger reconnection requests.

**Decision made:** Configured connection parameters in `shared/socket/socketClient.ts` with `reconnectionDelay: 1000`, `reconnectionDelayMax: 5000`, and `randomizationFactor: 0.5`. This spreads out client connection attempts over a randomized 1-to-5-second window upon server restart, preventing server CPU spikes and ensuring stable recovery.

---

**Problem 3: Cleaning up ghost locks on page refresh or tab closure**

If an agent has a ticket locked and then closes their browser tab, refreshes the page, or navigates away, the ticket remains locked in the server's memory indefinitely. Other agents would be locked out until a manual database cleanup occurred.

**AI response summary:**
Register a `beforeunload` event handler that triggers a best-effort `unlock_ticket` socket event immediately before the page/tab is destroyed.

**Decision made:** Created the custom hook `features/connection-resilience/hooks/useUnlockOnExit.ts`. It registers a listener on the window's `beforeunload` event. This issues the `unlock_ticket` payload to the socket server, successfully clearing the lock for other dispatchers when the tab is closed.

---

**Problem 4: Side panel clipping and non-blocking layout workflow**

Rendering the side editor drawer inline inside the `TicketBoard.tsx` component hierarchy caused z-index clipping issues from parent layout containers. Also, a typical overlay backdrop blocked the dispatcher from viewing the live ticket list in real-time while editing.

**AI response summary:**
Render the drawer at the body root using a React Portal. Remove the dark overlay backdrop entirely and handle sidebar transitions with state delays so that agents can interact with the table underneath while editing.

**Decision made:** Refactored `features/ticket-board/components/TicketEditPanel.tsx` to use `createPortal`. We completely removed the dark backdrop overlay so the agent can keep the panel open while clicking on other table rows (which automatically unlocks the previous ticket and opens the new one).

---

**Problem 5: Keyboard focus trapping in a backdrop-less drawer**

Because we removed the dark backdrop overlay to keep the sidebar non-blocking, tabbing with the keyboard could cause focus to escape the edit drawer and select elements in the background dashboard table, breaking accessibility compliance.

**AI response summary:**
Implement a zero-dependency focus trapping mechanism that intercepts the `Tab` and `Shift+Tab` keyboard inputs to loop focus strictly within the drawer's active form controls.

**Decision made:** Implemented keyboard focus trapping in `features/ticket-board/components/TicketEditPanel.tsx` using `useRef` and a `keydown` event listener. When the component mounts, it queries all focusable elements inside the drawer and wraps key focus navigation between the first and last element, keeping the background table untouchable via keyboard navigation.
