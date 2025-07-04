// イベント編集・削除機能

// イベント編集
function editEvent(eventId) {
    const event = eventService.getEvent(eventId);
    if (!event) {
        showNotification('イベントが見つかりません', 'error');
        return;
    }

    const currentUser = eventService.getCurrentUser();
    if (!currentUser || (event.organizerId !== currentUser.id && currentUser.role !== 'admin')) {
        showNotification('このイベントを編集する権限がありません', 'error');
        return;
    }

    // 編集モーダルを作成
    const modalHTML = `
        <div id="editEventModal" class="modal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>イベントを編集</h3>
                    <button class="close-modal" onclick="closeEditEvent()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editEventForm">
                        <div class="form-group">
                            <label>イベント名</label>
                            <input type="text" name="eventName" value="${event.title}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>カテゴリ</label>
                                <select name="category" required>
                                    <option value="networking" ${event.category === 'networking' ? 'selected' : ''}>ネットワーキング</option>
                                    <option value="seminar" ${event.category === 'seminar' ? 'selected' : ''}>セミナー</option>
                                    <option value="workshop" ${event.category === 'workshop' ? 'selected' : ''}>ワークショップ</option>
                                    <option value="conference" ${event.category === 'conference' ? 'selected' : ''}>カンファレンス</option>
                                    <option value="social" ${event.category === 'social' ? 'selected' : ''}>懇親会</option>
                                    <option value="pitch" ${event.category === 'pitch' ? 'selected' : ''}>ピッチ</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>開催日</label>
                                <input type="date" name="eventDate" value="${event.date}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>開始時間</label>
                                <input type="time" name="startTime" value="${event.startTime}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>終了時間</label>
                                <input type="time" name="endTime" value="${event.endTime}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>開催場所</label>
                            <input type="text" name="location" value="${event.location}" placeholder="例: 東京都港区または「オンライン」" required>
                        </div>
                        
                        <div class="form-group">
                            <label>最大参加者数</label>
                            <input type="number" name="maxAttendees" value="${event.maxAttendees}" min="1" max="500" required>
                        </div>
                        
                        <div class="form-group">
                            <label>説明</label>
                            <textarea name="description" rows="4" required>${event.description}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeEditEvent()">キャンセル</button>
                    <button class="btn-primary" onclick="updateEvent('${eventId}')">更新</button>
                </div>
            </div>
        </div>
    `;

    // 既存のモーダルを削除
    const existingModal = document.getElementById('editEventModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// イベント更新
function updateEvent(eventId) {
    const form = document.getElementById('editEventForm');
    if (!form) return;

    const formData = new FormData(form);
    const updates = {
        title: formData.get('eventName'),
        category: formData.get('category'),
        date: formData.get('eventDate'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        location: formData.get('location'),
        maxAttendees: parseInt(formData.get('maxAttendees')),
        description: formData.get('description')
    };

    // バリデーション
    if (!updates.title || !updates.category || !updates.date || 
        !updates.startTime || !updates.endTime || !updates.location ||
        !updates.maxAttendees || !updates.description) {
        alert('すべての項目を入力してください');
        return;
    }

    // 日付の妥当性チェック
    const eventDate = new Date(updates.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
        alert('開催日は今日以降を選択してください');
        return;
    }

    // 時間の妥当性チェック
    if (updates.startTime >= updates.endTime) {
        alert('終了時間は開始時間より後に設定してください');
        return;
    }

    try {
        // イベント更新
        eventService.updateEvent(eventId, updates);
        
        showNotification('イベントを更新しました', 'success');
        
        // モーダルを閉じる
        closeEditEvent();
        
        // 詳細モーダルも閉じる
        closeEventDetail();
        
        // イベント一覧を更新
        loadEventCards();
        
    } catch (error) {
        alert('エラー: ' + error.message);
    }
}

// 編集モーダルを閉じる
function closeEditEvent() {
    const modal = document.getElementById('editEventModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// イベント削除
function deleteEvent(eventId) {
    const event = eventService.getEvent(eventId);
    if (!event) {
        showNotification('イベントが見つかりません', 'error');
        return;
    }

    if (confirm(`イベント「${event.title}」を削除しますか？\nこの操作は取り消せません。`)) {
        try {
            eventService.deleteEvent(eventId);
            
            showNotification('イベントを削除しました', 'success');
            
            // 詳細モーダルを閉じる
            closeEventDetail();
            
            // イベント一覧を更新
            loadEventCards();
            
        } catch (error) {
            alert('エラー: ' + error.message);
        }
    }
}

// イベント参加者管理モーダル
function manageParticipants(eventId) {
    const event = eventService.getEvent(eventId);
    if (!event) return;

    const participants = eventService.getParticipants(eventId);

    const modalHTML = `
        <div id="participantsModal" class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>参加者管理 - ${event.title}</h3>
                    <button class="close-modal" onclick="closeParticipantsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="participants-stats">
                        <div class="stat">
                            <span class="stat-label">参加者数:</span>
                            <span class="stat-value">${participants.length} / ${event.maxAttendees}</span>
                        </div>
                    </div>
                    
                    <div class="participants-list" style="max-height: 400px; overflow-y: auto;">
                        ${participants.length > 0 ? participants.map(p => `
                            <div class="participant-item" style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 1rem;
                                border-bottom: 1px solid #eee;
                            ">
                                <div>
                                    <strong>${p.name}</strong>
                                    <div style="color: #666; font-size: 0.9rem;">
                                        ${p.position} - ${p.company}
                                    </div>
                                </div>
                                <button class="btn-small btn-danger" onclick="removeParticipant('${eventId}', '${p.id}')">
                                    削除
                                </button>
                            </div>
                        `).join('') : '<p style="text-align: center; color: #666;">参加者はいません</p>'}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="exportParticipants('${eventId}')">
                        <i class="fas fa-download"></i> CSVエクスポート
                    </button>
                    <button class="btn-primary" onclick="closeParticipantsModal()">閉じる</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// 参加者管理モーダルを閉じる
function closeParticipantsModal() {
    const modal = document.getElementById('participantsModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// 参加者を削除
function removeParticipant(eventId, userId) {
    if (confirm('この参加者を削除しますか？')) {
        try {
            eventService.cancelParticipation(eventId, userId);
            showNotification('参加者を削除しました', 'success');
            
            // モーダルを更新
            closeParticipantsModal();
            manageParticipants(eventId);
            
        } catch (error) {
            alert('エラー: ' + error.message);
        }
    }
}

// 参加者リストをエクスポート
function exportParticipants(eventId) {
    const event = eventService.getEvent(eventId);
    const participants = eventService.getParticipants(eventId);

    if (participants.length === 0) {
        showNotification('エクスポートする参加者がいません', 'warning');
        return;
    }

    // CSV作成
    const headers = ['名前', '役職', '会社名'];
    const rows = participants.map(p => [p.name, p.position, p.company]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    // BOMを追加（Excelで開く際の文字化け対策）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `participants_${event.title}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('参加者リストをエクスポートしました', 'success');
}