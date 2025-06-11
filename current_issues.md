# Current Issues Log – Map Not Displaying (CityHive2)

## Problem
The MapLibre map is not displaying in the app. The `#map` container is present, sized, and styled, but no map or canvas appears. No errors are shown in the console. The issue persists with both MapTiler and public MapLibre demo styles.

---

## Troubleshooting Steps Taken

1. **Verified CSS and Container**
   - Confirmed `#map` has correct width/height and is visible with a red border.
   - Confirmed only one `#map` element exists in the DOM.

2. **Checked for Console and Network Errors**
   - No errors in the browser console.
   - No failed network requests for map tiles or style JSON.

3. **Tested MapLibre Initialization**
   - Confirmed `createMap` is called after `DOMContentLoaded`.
   - Added logging to verify map object creation.
   - Confirmed map object is created, but no `<canvas>` appears in `#map`.

4. **Tested Container Sizing at Runtime**
   - Used browser console to check `#map` offsetWidth/offsetHeight (both non-zero).

5. **Attempted Manual Map Initialization**
   - Ran `new maplibregl.Map({...})` in the browser console. This produced an error if a map was already initialized, but otherwise did not render a map.

6. **Checked for Multiple Initializations**
   - Found and removed duplicate MapLibre initialization in `main.js`.
   - Confirmed only one map initialization remains (via `createMap`).

7. **Tested with Minimal HTML Example**
   - (Recommended, but not yet run on this machine) – Use a standalone HTML file to rule out project-specific issues.

8. **Checked for WebGL Support**
   - (Recommended, but not yet run) – Confirm browser supports WebGL.

9. **Checked for Ad Blockers/Extensions**
   - (Recommended, but not yet run) – Try disabling extensions or using incognito mode.

---

## Next Steps (Recommended)
- Test the minimal MapLibre HTML example outside the project.
- Check for WebGL support in the browser.
- Try a different browser or incognito mode.
- If the minimal example works, compare integration differences.

---

## Notes
- The map container is present and sized, but MapLibre does not render a canvas.
- No errors or failed requests suggest a logic or environment issue, not a network or style problem.
- This log can be updated as more troubleshooting is performed.
