let selection = { startX: -1, startY: -1, endX: -1, endY: -1 };
let isDragging = false;
let dragStartCell = null;

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrfToken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', function() {
    initDragSelection();
    initButtons();
    updateModeDisplay();
    loadVideoWallList();
});

function showToast(message, type = 'info') {

    const toast = document.getElementById('toastNotification');
    const toastBody = document.getElementById('toastMessage');
    if (!toast || !toastBody) return;

    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    const icon = icons[type] || 'info-circle';

    toastBody.innerHTML = `<i class="fas fa-${icon} me-2"></i>${message}`;

    toast.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
    if (type === 'success') toast.classList.add('bg-success');
    else if (type === 'error') toast.classList.add('bg-danger');
    else if (type === 'warning') toast.classList.add('bg-warning');
    else toast.classList.add('bg-info');

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

let isModeLoading = false;

function updateModeDisplay() {
    if (isModeLoading) return;
    isModeLoading = true;

    fetch('/api/device_mode/')
        .then(response => response.json())
        .then(data => {
            const modeText = document.getElementById('currentModeText');
            const badge = document.getElementById('modeBadge');

            if (data.success && modeText) {
                modeText.textContent = data.mode_name + ' 모드';
                if (badge) {
                    badge.className = 'badge ' + (data.mode === 1 ? 'splicer-mode' : 'matrix-mode');
                }
            } else if (modeText) {
                modeText.textContent = '연결 실패';
            }
        })
        .catch(err => {
            const modeText = document.getElementById('currentModeText');
            if (modeText) modeText.textContent = '연결 실패';
            console.log('모드 조회 실패:', err);
        })
        .finally(() => {
            isModeLoading = false;
        });
}

function switchMode(mode) {
    fetch('/api/toggle_mode/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ mode: mode })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                updateModeDisplay();
            } else {
                showToast('모드 전환 실패: ' + data.error, 'error');
            }
        })
        .catch(err => {
            showToast('통신 오류', 'error');
        });
}

function coordToMonitor(x, y) {
    return y * 4 + x + 1;
}

function updateSelection() {
    document.querySelectorAll('.monitor-cell').forEach(cell => {
        cell.classList.remove('selected');
    });

    const selectionText = document.getElementById('selectionText');
    const createBtn = document.getElementById('createVideoWallBtn');
    const applyBtn = document.getElementById('applyDirectBtn');

    if (selection.startX < 0) {
        if (selectionText) selectionText.textContent = '드래그하여 영역을 선택하세요';
        if (createBtn) createBtn.disabled = true;
        if (applyBtn) applyBtn.disabled = true;
        return;
    }

    const minX = Math.min(selection.startX, selection.endX);
    const maxX = Math.max(selection.startX, selection.endX);
    const minY = Math.min(selection.startY, selection.endY);
    const maxY = Math.max(selection.startY, selection.endY);

    const selectedMonitors = [];
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const monitor = coordToMonitor(x, y);
            selectedMonitors.push(monitor);
            const cell = document.querySelector(`.monitor-cell[data-monitor="${monitor}"]`);
            if (cell) cell.classList.add('selected');
        }
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    if (selectionText) {
        selectionText.textContent = `${width}×${height} 비디오월 선택됨 (모니터: ${selectedMonitors.join(', ')})`;
    }

    const isValid = selectedMonitors.length >= 2;
    if (createBtn) createBtn.disabled = !isValid;
    if (applyBtn) applyBtn.disabled = !isValid;

    selection.startX = minX;
    selection.startY = minY;
    selection.endX = maxX;
    selection.endY = maxY;
}

function initDragSelection() {
    const grid = document.getElementById('videowallGrid');
    if (!grid) return;

    grid.addEventListener('mousedown', function(e) {
        const cell = e.target.closest('.monitor-cell');
        if (!cell) return;

        isDragging = true;
        dragStartCell = cell;

        selection.startX = parseInt(cell.dataset.x);
        selection.startY = parseInt(cell.dataset.y);
        selection.endX = selection.startX;
        selection.endY = selection.startY;

        updateSelection();
    });

    grid.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        const cell = e.target.closest('.monitor-cell');
        if (!cell) return;

        selection.endX = parseInt(cell.dataset.x);
        selection.endY = parseInt(cell.dataset.y);

        updateSelection();
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            dragStartCell = null;
        }
    });
}

function selectPreset(preset) {
    switch(preset) {
        case '2x2':
            selection = { startX: 0, startY: 0, endX: 1, endY: 1 };
            break;
        case '2x4':
            selection = { startX: 0, startY: 0, endX: 3, endY: 1 };
            break;
        case '4x4':
            selection = { startX: 0, startY: 0, endX: 3, endY: 3 };
            break;
    }
    updateSelection();
}

function clearSelection() {
    selection = { startX: -1, startY: -1, endX: -1, endY: -1 };
    updateSelection();
}

function initButtons() {
    const clearBtn = document.getElementById('clearSelectionBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearSelection);

    const createBtn = document.getElementById('createVideoWallBtn');
    if (createBtn) createBtn.addEventListener('click', createVideoWall);

    const applyBtn = document.getElementById('applyDirectBtn');
    if (applyBtn) applyBtn.addEventListener('click', applyDirect);

    const releaseBtn = document.getElementById('releaseVideoWallBtn');
    if (releaseBtn) releaseBtn.addEventListener('click', releaseVideoWall);

    const matrixBtn = document.getElementById('switchToMatrixBtn');
    const splicerBtn = document.getElementById('switchToSplicerBtn');
    if (matrixBtn) matrixBtn.addEventListener('click', () => switchMode(0));
    if (splicerBtn) splicerBtn.addEventListener('click', () => switchMode(1));
}

function createVideoWall() {
    const nameInput = document.getElementById('videoWallName');
    const name = nameInput?.value.trim();

    if (!name) {
        showToast('비디오월 이름을 입력해주세요.', 'error');
        nameInput?.focus();
        return;
    }

    const inputSource = parseInt(document.getElementById('inputSourceSelect')?.value || 1);

    fetch('/api/video_wall/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            name: name,
            start_x: selection.startX,
            start_y: selection.startY,
            end_x: selection.endX,
            end_y: selection.endY,
            input_source: inputSource
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                if (nameInput) nameInput.value = '';
                loadVideoWallList();
            } else {
                showToast(data.error, 'error');
            }
        })
        .catch(err => {
            showToast('저장 실패', 'error');
        });
}

function applyDirect() {
    const inputSource = parseInt(document.getElementById('inputSourceSelect')?.value || 1);

    fetch('/api/video_wall/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            name: '_temp_' + Date.now(),
            start_x: selection.startX,
            start_y: selection.startY,
            end_x: selection.endX,
            end_y: selection.endY,
            input_source: inputSource
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return fetch(`/api/video_wall/apply/${data.id}/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': csrfToken }
                });
            }
            throw new Error(data.error);
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('비디오월이 적용되었습니다!', 'success');
                updateModeDisplay();
            } else {
                showToast(data.error, 'error');
            }
        })
        .catch(err => {
            showToast('적용 실패: ' + err.message, 'error');
        });
}

function releaseVideoWall() {
    if (!confirm('비디오월을 해제하고 Matrix 모드로 복귀하시겠습니까?')) return;

    fetch('/api/video_wall/release/', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                updateModeDisplay();
            } else {
                showToast(data.error, 'error');
            }
        });
}

function loadVideoWallList() {
    fetch('/api/video_wall/list/')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('videoWallList');
            if (!list) return;

            if (!data.success || data.video_walls.length === 0) {
                list.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-inbox mb-2" style="font-size: 1.5rem;"></i>
                        <p class="mb-0 small">저장된 비디오월이 없습니다</p>
                    </div>
                `;
                return;
            }

            list.innerHTML = data.video_walls.map(vw => `
                <div class="videowall-item">
                    <div class="videowall-item-info">
                        <div class="videowall-item-name">${escapeHtml(vw.name)}</div>
                        <div class="videowall-item-details">
                            ${vw.size} · Device ${String(vw.input_source).padStart(2, '0')}
                        </div>
                    </div>
                    <div class="videowall-item-actions">
                        <button class="btn btn-primary btn-sm" onclick="applyVideoWall(${vw.id})" title="적용">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteVideoWall(${vw.id}, '${escapeHtml(vw.name)}')" title="삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        });
}

function applyVideoWall(id) {
    fetch(`/api/video_wall/apply/${id}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                updateModeDisplay();
            } else {
                showToast(data.error, 'error');
            }
        });
}

function deleteVideoWall(id, name) {
    if (!confirm(`"${name}" 비디오월을 삭제하시겠습니까?`)) return;

    fetch(`/api/video_wall/delete/${id}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfToken }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                loadVideoWallList();
            } else {
                showToast(data.error, 'error');
            }
        });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}