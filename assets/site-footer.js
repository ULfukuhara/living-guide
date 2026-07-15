export function renderFooter(mountEl, { innerClass, right = "" } = {}) {
  if (!mountEl) return;
  mountEl.className = "border-t border-slate-200 bg-white";
  mountEl.innerHTML = `
    <div class="${innerClass}">
      <p>© ユニヴ・ライフ株式会社</p>
      ${right}
    </div>
  `;
}
