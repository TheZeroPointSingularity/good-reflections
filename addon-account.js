/** * ADD-ON: ACCOUNT_BINDING [1]
 * Logic: Event Listen -> Local Storage Key -> GitHub API
 */
(function() {
  const REPO = 'TheZeroPointSingularity/good-reflections';
  const FILE = 'ledger.json';

  window.addEventListener('squeeze', async (e) => {
    const intent = e.detail;
    const token = localStorage.getItem('MY_OS_KEY');
    const box = document.getElementById('ledger-box');

    if (!token) {
      box.innerHTML += `<div style="color:red">> ERROR: NOT_BOUND. Set 'MY_OS_KEY' in console.</div>`;
      return;
    }

    // Physical Confirmation (The Ding)
    if (navigator.vibrate) navigator.vibrate([30, 60]);

    try {
      // 1. Get current SHA
      const get = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`);
      const data = await get.json();
      const content = JSON.parse(atob(data.content));

      // 2. Add Intent
      content.push({ ts: new Date().toISOString(), author: "USER", intent: intent });

      // 3. Push to Ledger
      await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
        method: 'PUT',
        headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `reflection: ${intent.slice(0,20)}`,
          content: btoa(JSON.stringify(content, null, 2)),
          sha: data.sha
        })
      });
      box.innerHTML += `<div style="color:#0f0">> REFLECTED: ${intent}</div>`;
    } catch (err) {
      box.innerHTML += `<div style="color:red">> SYNC_FAILED</div>`;
    }
  });

  document.getElementById('ledger-box').innerHTML += `<div>> ACCOUNT_BIND_ADDON: [1]</div>`;
})();
