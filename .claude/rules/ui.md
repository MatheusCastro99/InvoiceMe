---
paths:
  - "FRONTEND/src/**"
---

# Frontend essentials

The full guidelines, screen by screen, are in `Harness_Config/Context/UI_Guidelines.md`; read the section for the screen you're changing. For a UX review, use the `ux-design` skill.

- **Identity:** intuitive (a small-business owner finishes a task without instructions) and finance-like: the look and palette of a financial tool.
- **Components:** new screens and components take their components from MUI; no new `flowbite-react` imports (ADR-011, pending).
- **State:** components change what the page shows through React state, never by reading or changing the DOM (`document.getElementById`, `querySelector`, `classList`). Field validity and its styling are state, rendered through `className`. Mounting on `#root` in `main.jsx` is the one exception (ADR-009, pending).
- **API calls:** every URL comes from `API_ENDPOINTS` in `src/config/apiConfig.js`; pages and components never write an API URL as a string (ADR-002).
- **API calls, token:** API calls use the global `axios`, so the auth interceptors add the token; never `fetch` or `axios.create()` (ADR-014).
- **Money:** the tax rate, the tax and the final price come from `/api/v2/tax/rate` and `/api/v2/tax/calculate`; only the displayed line totals and subtotal are derived here (ADR-004).
- **Validation:** client checks accept and reject exactly what `NODEAPI/utils/validators.js` does (ADR-003, pending).
- **Styles:** Tailwind default classes in the JSX, with the few custom classes in `src/index.css`. New screens and components take their colors from the six tokens in the `@theme` block of `src/index.css` (`primary`, `primary-hover`, `primary-soft`, `ink`, `muted`, `danger`, as in `bg-primary` or `text-muted`, plus `white` for text on `primary`, `primary-hover` and `danger` and for the surfaces content sits on), their sizes and spacing from Tailwind's default steps, preferring the roles `UI_Guidelines.md` names, and show money in tabular figures (`tabular-nums`). Existing pages keep their classes until Epic 5. A color outside these, or a size Tailwind's defaults don't provide, is raised with the owner first. The PDF has its own styles in `src/pdfStyle.jsx`.
- **Patterns:** a sweetalert2 dialog confirms before a customer or invoice is deleted; react-toastify toasts report success and failure.
- **Accessibility:** text contrast at least 4.5:1 (3:1 for large text), targets at least 24×24 CSS pixels, an accessible name on icon-only controls, and state never shown by color alone.
- **Environment:** a new `import.meta.env` variable starts with `VITE_` and is listed in `FRONTEND/.env.example` (ADR-007).
