# Back up, restore and reset demo state

User edits live in the browser as an overlay on top of the base data (ADR 0002).

Back up
1. Use the overlay export in the app (available once the overlay slice is built).
2. Save the downloaded JSON file.

Restore
1. Use the overlay import and select the saved file.
2. Reload and check the edits are back.

Reset
1. Use the reset action in the app, or clear this site's localStorage in browser dev tools.
2. Reload. The base data shows again.

The role toggle is stored in the same browser storage, so a reset also returns the role to KAM.
