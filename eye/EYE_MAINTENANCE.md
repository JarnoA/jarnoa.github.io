# Eye Maintenance Guide 👁️

This guide explains how to safely modify `eyegemini.html` for your Samsung tablet setup.

## 1. Adjusting Eye Size
Find the `updateScale` function in the `<script>` section (near the middle of the file).

**Look for this line:**
```javascript
const scale = Math.min(window.innerWidth, window.innerHeight) / 650;
```

*   **To make it SMALLER:** Increase the number (e.g., `/ 750` or `/ 800`).
*   **To make it LARGER:** Decrease the number (e.g., `/ 550` or `/ 450`).

---

## 2. Adjusting Vertical Position
Find the `.eye-wrapper` style in the `<style>` section (near the top).

**Add or change the `margin-top` line:**
```css
.eye-wrapper {
    position: relative;
    width: 500px;
    height: 500px;
    margin-top: -50px; /* <--- ADD THIS LINE (Negative = UP, Positive = DOWN) */
    ...
}
```

---

## 3. Changing Background Color
Find the `:root` section at the very top of the `<style>` block.

**Change the hex code for `--main-color`:**
```css
:root {
    --main-color: #171616; /* Change this (e.g., #000000 for pure black) */
}
```

---

## 4. How to Add Comments
Comments are notes for yourself that the computer ignores.

### In the Style Section (CSS)
Use `/*` and `*/`:
```css
/* This is a comment in the CSS section */
.eye-wrapper { ... }
```

### In the Script Section (JavaScript)
Use `//` for a single line or `/* */` for blocks:
```javascript
// This is a single-line comment
const scale = 1;

/* This is a multi-line 
   comment block */
```

---

## ⚠️ Safety Tips
*   **Always include the semicolon (`;`)** at the end of a line in CSS or JavaScript.
*   **Keep a backup:** If you make a mistake and the eye disappears, use `Ctrl+Z` to undo or refer to your previous version.
*   **Hex Colors:** Use a site like [htmlcolorcodes.com](https://htmlcolorcodes.com) to find the exact code for the color you want.
