// ==UserScript==
// @name         JP Backups
// @namespace    https://angelolloti.com/
// @version      0.0.1
// @description  Extension to create backups for JP documents.
// @author       Angelo Lloti
// @match        https://www.jobprogress.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jobprogress.com
// @grant        unsafeWindow
// @downloadURL  https://angelolloti.com/jp_backups.user.js
// @updateURL    https://angelolloti.com/jp_backups.user.js
// ==/UserScript==

const SPECIAL_ID = 'JP_Document_Backup_Extension_9n809ny8g';

const getBackups = () => JSON.parse(localStorage.getItem(`${location.hash}-backups`) || '[]');

const setBackups = (arr = []) => localStorage.setItem(`${location.hash}-backups`, JSON.stringify(arr));

const addBackup = data => {
    const id = `${location.hash}-${Date.now()}`;
    localStorage.setItem(id, data);
    setBackups([id, ...getBackups()]);
    return id;
};

const interval = 1000 * 60 * 5;
const routes = ['/edit', '/create' /*, '/proposals-worksheet'*/];

unsafeWindow.executeRevertBackup = key => {
    const data = localStorage.getItem(key);
    if (!data) return alert('backup not found');

    const el = document.querySelector('.template-section');
    el.innerHTML = data;
};

unsafeWindow.executeDocumentBackup = () => {
    const data = document.querySelector('.template-section');
    addBackup(data.innerHTML);
    renderBackups();
};

unsafeWindow.executeClearHistory = () => {
    const items = getBackups();
    for (const item of items) localStorage.removeItem(item);
    setBackups([]);
    renderBackups();
};

(() => {
    'use strict';

    setInterval(() => {
        if (routes.some(l => location.hash.endsWith(l))) {
            injectPage();
        } else {
            destroyInjection();
        }
    }, 100);

    const execBackup = () => {
        if (routes.some(l => location.hash.endsWith(l))) {
            unsafeWindow.executeDocumentBackup();
        }
    };

    setInterval(execBackup, interval);
    window.addEventListener('beforeunload', execBackup);
})();

const renderBackups = () => {
    const el = document.getElementById(`${SPECIAL_ID}_Backups`);
    const backups = getBackups();

    el.innerHTML = backups.map(b => `
<div>
  <span>${new Date(Number(b.split('-').pop())).toLocaleString()}</span>
  <div class='${SPECIAL_ID}_Button' onclick='executeRevertBackup("${b}")'>Revert</div>
</div>
    `).join('\n');
};

const injectPage = () => {
    if (document.getElementById(SPECIAL_ID)) return;

    const container = document.createElement('div');
    container.id = SPECIAL_ID;

    container.innerHTML = `
<style>
#${SPECIAL_ID} {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 300px;
  background: #fff;
  z-index: 999;
}

#${SPECIAL_ID}:has(> #${SPECIAL_ID}_Arrow[data-open=false]) {
  transform: translateX(300px);
}

#${SPECIAL_ID}_Arrow {
  width: 20px;
  height: 20px;
  line-height: 20px;
  font-size: 16px;
  background: #fff;
  border-radius: 0 0 0 3px;
  position: absolute;
  cursor: pointer;
  left: -20px;
  top: 0;
  text-align: center;
  color: #000;
  font-weight: bold;
  font-family: monospace;
  vertical-align: middle;
}

#${SPECIAL_ID}_Arrow[data-open=true]::after {
  content: '>';
}

#${SPECIAL_ID}_Arrow[data-open=false]::after {
  content: '<';
}

.${SPECIAL_ID}_Button {
  background: #3071a9;
  border-radius: 3px;
  color: #fff;
  padding: 2px 8px;
  font-size: 14px;
  cursor: pointer;
  display: inline;
}

.${SPECIAL_ID}_Button:hover {
  background: #285e8e;
}

#${SPECIAL_ID}_Backups {
  margin: 10px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

#${SPECIAL_ID}_Backups > div {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}
</style>

<h3 style='margin-top: 5px; text-align: center'>Backups</h3>
<div style='display: flex; gap: 5px; margin: 0 10px;'>
  <div class='${SPECIAL_ID}_Button' onclick='executeDocumentBackup()'>Create Backup</div>
  <div class='${SPECIAL_ID}_Button' onclick='executeClearHistory()'>Clear History</div>
</div>
<div id='${SPECIAL_ID}_Backups'></div>
    `;

    const slideArrow = document.createElement('div');
    slideArrow.id = `${SPECIAL_ID}_Arrow`;
    slideArrow.setAttribute('data-open', 'false');
    slideArrow.onclick = () => {
        slideArrow.setAttribute('data-open', slideArrow.getAttribute('data-open') === 'true' ? 'false' : 'true');
    };

    container.prepend(slideArrow);
    document.body.appendChild(container);
    renderBackups();
};

const destroyInjection = () => {
    document.getElementById(SPECIAL_ID)?.remove();
};
