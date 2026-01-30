/**
 * Splitter UI JavaScript
 * 프로토콜: 55 AA 04 15 XX CRC EE
 * CRC = 0x04 + 0x15 + XX (0x55, 0xAA 제외)
 */

const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
    || document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];

let currentMode = 0;   // 0=1분할, 1=1+3분할, 2=4분할, 3=16분할
let currentInput = 1;  // 1~16

document.addEventListener('DOMContentLoaded', function() {
    initModeButtons();
    initInputSelect();
    initActionButtons();
    updatePreview();
});

function initModeButtons() {
    const buttons = document.querySelectorAll('.btn-mode');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = parseInt(this.dataset.mode);
            updatePreview();
        });
    });
}

function initInputSelect() {
    const select = document.getElementById('inputSourceSelect');
    if (select) {
        select.addEventListener('change', function() {
            currentInput = parseInt(this.value);
        });
    }
}

function initActionButtons() {
    const sendBtn = document.getElementById('sendTestBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendCommand);
    }
}

function updatePreview() {
    const preview = document.getElementById('splitterPreview');
    if (!preview) return;

    preview.classList.remove('mode-1', 'mode-1-3', 'mode-4', 'mode-16');

    const modeClasses = ['mode-1', 'mode-1-3', 'mode-4', 'mode-16'];
    const windowCounts = [1, 4, 4, 16];

    preview.classList.add(modeClasses[currentMode]);
    const windowCount = windowCounts[currentMode];

    let cellsHtml = '';
    for (let i = 0; i < windowCount; i++) {
        cellsHtml += `
            <div class="preview-cell${i === 0 ? ' active' : ''}" data-index="${i}">
                <span class="preview-number">${i + 1}</span>
            </div>
        `;
    }
    preview.innerHTML = cellsHtml;
}

async function sendCommand() {
    const modeNames = ['1분할', '1+3분할', '4분할', '16분할'];
    updateStatus('전송 중...', 'warning');

    try {
        const response = await fetch('/api/splitter/test/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                mode: currentMode,
                input_source: currentInput
            })
        });

        const data = await response.json();

        if (data.success) {
            updateStatus('성공', 'success');
            showToast(`${modeNames[currentMode]} 적용 완료!`, 'success');
        } else {
            updateStatus('실패', 'danger');
            showToast(data.error, 'error');
        }
    } catch (error) {
        updateStatus('오류', 'danger');
        showToast('통신 오류', 'error');
    }
}

function updateStatus(text, type) {
    const badge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    if (badge) badge.className = `badge bg-${type}`;
    if (statusText) statusText.textContent = text;
}

function showToast(message, type) {
    const toastEl = document.getElementById('toastNotification');
    const toastBody = document.getElementById('toastMessage');
    if (!toastEl || !toastBody) return;

    toastEl.className = `toast bg-${type === 'error' ? 'danger' : type}`;
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    toastBody.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;

    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}