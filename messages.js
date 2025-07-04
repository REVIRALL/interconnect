// メッセージページの機能

let currentConversation = 1;
let conversations = {};
let messageServiceInstance = null;

// アバター生成機能
function generateSVGAvatar(name, size = 40) {
    // 安全な文字を取得（日本語対応）
    let firstChar = name.charAt(0) || 'U';
    // ASCII文字以外の場合は'U'を使用
    if (firstChar.charCodeAt(0) > 127) {
        firstChar = 'U';
    } else {
        firstChar = firstChar.toUpperCase();
    }
    
    const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e5ba8;stop-opacity:1" /><stop offset="100%" style="stop-color:#4a90e2;stop-opacity:1" /></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#grad-${Date.now()})"/><text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="${size/2.5}" font-weight="600">${firstChar}</text></svg>`;
    
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}

// デモデータを初期化
function initializeConversations() {
    conversations = {
        1: {
            name: '佐藤次郎',
            avatar: generateSVGAvatar('佐藤次郎', 40),
            status: 'online',
            messages: [
                { type: 'received', content: 'こんにちは田中さん。新規事業の件でご相談があります。', time: '14:30', avatar: generateSVGAvatar('佐藤次郎', 30) },
                { type: 'received', content: 'お時間があるときにお電話でお話しできればと思います。よろしくお願いします。', time: '14:32', avatar: generateSVGAvatar('佐藤次郎', 30) },
                { type: 'sent', content: '佐藤さん、お疲れ様です。明日の午後でしたらお時間作れます。', time: '14:45' },
                { type: 'received', content: 'ありがとうございます！明日14時頃はいかがでしょうか？', time: '15:20', avatar: generateSVGAvatar('佐藤次郎', 30) },
                { type: 'sent', content: '14時で大丈夫です。よろしくお願いします。', time: '15:25' }
            ]
        },
        2: {
            name: '山田花子',
            avatar: generateSVGAvatar('山田花子', 40),
            status: 'away',
            messages: [
                { type: 'received', content: '来週のイベントについてですが、会場の変更があります。', time: '13:00', avatar: generateSVGAvatar('山田花子', 30) },
                { type: 'received', content: '詳細は後ほどメールでお送りします。', time: '13:02', avatar: generateSVGAvatar('山田花子', 30) }
            ]
        },
        3: {
            name: '鈴木三郎',
            avatar: generateSVGAvatar('鈴木三郎', 40),
            status: 'offline',
            messages: [
                { type: 'received', content: '資料をお送りいただき、ありがとうございました。', time: '15:00', avatar: generateSVGAvatar('鈴木三郎', 30) },
                { type: 'sent', content: 'お役に立てて良かったです。', time: '15:30' }
            ]
        },
        4: {
            name: '田中一郎',
            avatar: generateSVGAvatar('田中一郎', 40),
            status: 'online',
            messages: [
                { type: 'received', content: 'プロジェクトの進捗はいかがでしょうか？', time: '昨日', avatar: generateSVGAvatar('田中一郎', 30) },
                { type: 'sent', content: '順調に進んでいます。来週には完成予定です。', time: '昨日' }
            ]
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    initializeMessagesWithSupabase();
});

// Supabaseとの統合初期化
async function initializeMessagesWithSupabase() {
    try {
        // MessageServiceの準備ができるまで待機
        if (typeof messageService === 'undefined') {
            setTimeout(initializeMessagesWithSupabase, 100);
            return;
        }

        messageServiceInstance = messageService;
        
        // MessageServiceの初期化を待つ
        await new Promise(resolve => {
            const checkReady = () => {
                if (messageServiceInstance.conversations && messageServiceInstance.conversations.size > 0) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });

        // 会話データをMessageServiceから取得
        const conversationList = messageServiceInstance.getAllConversations();
        conversations = {};
        conversationList.forEach(conv => {
            conversations[conv.id] = conv;
        });

        // 通常の初期化を実行
        initializeMessagePage();
        setupEventListeners();
        setupSupabaseEventListeners();

        // デフォルトで最初の会話を選択
        if (Object.keys(conversations).length > 0) {
            const firstConversationId = parseInt(Object.keys(conversations)[0]);
            await selectConversationWithSupabase(firstConversationId);
        }

        console.log('Messages page initialized with Supabase integration');
    } catch (error) {
        console.error('Failed to initialize messages with Supabase:', error);
        // フォールバック: 元の初期化を実行
        initializeConversations();
        initializeMessagePage();
        setupEventListeners();
    }
}

// Supabaseイベントリスナーの設定
function setupSupabaseEventListeners() {
    // リアルタイムメッセージ受信の設定
    if (messageServiceInstance && typeof messageServiceInstance.subscribeToConversation === 'function') {
        Object.keys(conversations).forEach(conversationId => {
            messageServiceInstance.subscribeToConversation(parseInt(conversationId), (newMessage) => {
                // 新しいメッセージを受信したときの処理
                handleNewMessage(parseInt(conversationId), newMessage);
            });
        });
    }
}

// 新しいメッセージの処理
function handleNewMessage(conversationId, message) {
    // 現在の会話に新しいメッセージを追加
    if (conversations[conversationId] && conversations[conversationId].messages) {
        conversations[conversationId].messages.push(message);
        
        // 現在表示中の会話の場合、UIを更新
        if (currentConversation === conversationId) {
            displayMessages(conversations[conversationId].messages);
        }
        
        // 会話リストのプレビューを更新
        updateConversationPreview(conversationId, message.content, message.time);
        
        // 通知を表示（現在の会話でない場合）
        if (currentConversation !== conversationId) {
            showNewMessageNotification(conversations[conversationId].name, message.content);
        }
    }
}

// 新しいメッセージ通知
function showNewMessageNotification(senderName, content) {
    // 簡単な通知表示（実際の実装ではブラウザ通知APIを使用）
    const notification = document.createElement('div');
    notification.className = 'message-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h4>${senderName}</h4>
            <p>${content}</p>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 5秒後に自動削除
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // クリックで削除
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

function initializeMessagePage() {
    // 会話リストのアバター画像を更新
    updateConversationListAvatars();
    
    // 認証ユーザーのアバター更新
    updateUserAvatars();
    
    // 会話リストのクリックイベント
    const conversationItems = document.querySelectorAll('.conversation-item');
    conversationItems.forEach(item => {
        item.addEventListener('click', function() {
            const conversationId = parseInt(this.getAttribute('data-conversation'));
            selectConversation(conversationId);
        });
    });
    
    // メッセージフィルターのイベント
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            applyMessageFilter(filter);
        });
    });
    
    // 検索機能
    const searchInput = document.getElementById('messageSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchMessages(this.value);
        });
    }
    
    // メッセージ入力エリアの自動サイズ調整
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        // Enterキーで送信（Shift+Enterで改行）
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // ファイル添付機能の初期化
    initializeFileAttachment();
}

// ファイル添付機能の初期化
function initializeFileAttachment() {
    // ファイル添付ボタンのイベント
    const attachmentBtn = document.querySelector('.toolbar-btn i.fa-paperclip');
    if (attachmentBtn) {
        attachmentBtn.parentElement.addEventListener('click', openFileDialog);
    }

    // ドラッグ&ドロップの設定
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer && fileService) {
        fileService.setupDragAndDrop(messagesContainer, handleFileUpload);
    }

    // クリップボード貼り付けの設定
    if (fileService) {
        fileService.setupClipboardPaste(handleClipboardFile);
    }

    // ファイルプレビューエリアの作成
    createFilePreviewArea();
}

// ファイル選択ダイアログを開く
async function openFileDialog() {
    try {
        const files = await fileService.openFileDialog({ multiple: true });
        if (files.length > 0) {
            handleFileUpload(await fileService.uploadFiles(files));
        }
    } catch (error) {
        console.error('File dialog error:', error);
        showErrorNotification('ファイル選択に失敗しました');
    }
}

// ファイルアップロード処理
function handleFileUpload(results) {
    const filePreviewArea = document.getElementById('filePreviewArea');
    
    results.forEach(result => {
        if (result.success) {
            addFileToPreview(result.fileInfo);
        } else {
            showErrorNotification(`ファイルアップロードエラー: ${result.error}`);
        }
    });

    // プレビューエリアを表示
    if (filePreviewArea && results.some(r => r.success)) {
        filePreviewArea.style.display = 'block';
    }
}

// クリップボードファイル処理
function handleClipboardFile(result) {
    if (result.success) {
        handleFileUpload([result]);
        showSuccessMessage('画像が添付されました');
    } else {
        showErrorNotification(`画像貼り付けエラー: ${result.error}`);
    }
}

// ファイルプレビューエリアの作成
function createFilePreviewArea() {
    const messageInputArea = document.querySelector('.message-input-area');
    if (!messageInputArea) return;

    const filePreviewArea = document.createElement('div');
    filePreviewArea.id = 'filePreviewArea';
    filePreviewArea.className = 'file-preview-area';
    filePreviewArea.style.display = 'none';
    
    filePreviewArea.innerHTML = `
        <div class="file-preview-header">
            <span>添付ファイル</span>
            <button class="clear-files-btn" onclick="clearAllFiles()">すべて削除</button>
        </div>
        <div class="file-preview-list" id="filePreviewList"></div>
    `;

    messageInputArea.insertBefore(filePreviewArea, messageInputArea.firstChild);

    // CSSスタイルを追加
    if (!document.getElementById('file-attachment-styles')) {
        const style = document.createElement('style');
        style.id = 'file-attachment-styles';
        style.textContent = `
            .file-preview-area {
                background: #f8f9fa;
                border: 1px solid #e1e5e9;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
            }
            .file-preview-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: var(--primary-blue);
            }
            .clear-files-btn {
                background: none;
                border: 1px solid #dc3545;
                color: #dc3545;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
            }
            .clear-files-btn:hover {
                background: #dc3545;
                color: white;
            }
            .file-preview-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .file-preview {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 0.5rem;
                background: white;
                position: relative;
                max-width: 200px;
            }
            .file-preview .remove-file {
                position: absolute;
                top: 5px;
                right: 5px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 0.7rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .image-preview img {
                max-width: 150px;
                max-height: 100px;
                object-fit: cover;
                border-radius: 4px;
            }
            .file-info {
                margin-top: 0.5rem;
            }
            .file-name {
                display: block;
                font-size: 0.8rem;
                font-weight: 600;
                color: #333;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .file-size {
                display: block;
                font-size: 0.7rem;
                color: #666;
            }
            .video-preview video {
                max-width: 150px;
                max-height: 100px;
            }
            .audio-preview {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1rem;
            }
            .audio-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            .document-preview {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1rem;
            }
            .document-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            .download-btn {
                background: var(--primary-blue);
                color: white;
                border: none;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
                margin-top: 0.5rem;
            }
            .drag-over {
                border: 2px dashed var(--primary-blue) !important;
                background-color: rgba(0, 123, 255, 0.1) !important;
            }
            .file-preview-area {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                background: #f9f9f9;
            }
            .file-preview-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }
            .clear-files-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
            }
            .file-preview-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .file-preview {
                position: relative;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 0.5rem;
                background: white;
            }
            .remove-file {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 0.8rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .message-attachments {
                margin-top: 0.5rem;
            }
            .message-attachments .file-preview {
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// ファイルをプレビューに追加
function addFileToPreview(fileInfo) {
    const filePreviewList = document.getElementById('filePreviewList');
    if (!filePreviewList) return;

    const previewElement = fileService.generateFilePreview(fileInfo);
    
    // 削除ボタンを追加
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => removeFileFromPreview(fileInfo.id);
    
    previewElement.appendChild(removeBtn);
    filePreviewList.appendChild(previewElement);
}

// ファイルプレビューエリアを表示
function showFilePreviewArea() {
    const filePreviewArea = document.getElementById('filePreviewArea');
    if (filePreviewArea) {
        filePreviewArea.style.display = 'block';
    }
}

// ファイルをプレビューから削除
function removeFileFromPreview(fileId) {
    fileService.deleteFile(fileId);
    
    const previewElement = document.querySelector(`[data-file-id="${fileId}"]`);
    if (previewElement) {
        previewElement.remove();
    }

    // プレビューエリアが空になったら非表示
    const filePreviewList = document.getElementById('filePreviewList');
    const filePreviewArea = document.getElementById('filePreviewArea');
    
    if (filePreviewList && filePreviewList.children.length === 0) {
        if (filePreviewArea) {
            filePreviewArea.style.display = 'none';
        }
    }
}

// 全ファイルをクリア
function clearAllFiles() {
    const filePreviewList = document.getElementById('filePreviewList');
    const filePreviewArea = document.getElementById('filePreviewArea');
    
    if (filePreviewList) {
        // 各ファイルを削除
        const previews = filePreviewList.querySelectorAll('.file-preview');
        previews.forEach(preview => {
            const fileId = preview.dataset.fileId;
            if (fileId) {
                fileService.deleteFile(fileId);
            }
        });
        
        filePreviewList.innerHTML = '';
    }
    
    if (filePreviewArea) {
        filePreviewArea.style.display = 'none';
    }
}

// 添付ファイル付きメッセージの送信
function getAttachedFiles() {
    const filePreviewList = document.getElementById('filePreviewList');
    if (!filePreviewList) return [];

    const attachedFiles = [];
    const previews = filePreviewList.querySelectorAll('.file-preview');
    
    previews.forEach(preview => {
        const fileId = preview.dataset.fileId;
        if (fileId) {
            const fileInfo = fileService.getFile(fileId);
            if (fileInfo) {
                attachedFiles.push(fileInfo);
            }
        }
    });

    return attachedFiles;
}

function setupEventListeners() {
    // ツールバーボタンのイベント
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-paperclip')) {
                attachFile();
            } else if (icon.classList.contains('fa-smile')) {
                insertEmoji();
            } else if (icon.classList.contains('fa-clock')) {
                scheduleMessage();
            }
        });
    });
    
    // アクションボタンのイベント
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-star')) {
                toggleImportant();
            } else if (icon.classList.contains('fa-archive')) {
                archiveConversation();
            } else if (icon.classList.contains('fa-trash')) {
                deleteConversation();
            }
        });
    });
    
    // ドラッグ&ドロップのセットアップ
    const messageInputArea = document.querySelector('.message-input-area');
    if (messageInputArea && fileService) {
        fileService.setupDragAndDrop(messageInputArea, (results) => {
            results.forEach(result => {
                if (result.success) {
                    addFileToPreview(result.fileInfo);
                    showFilePreviewArea();
                } else {
                    showNotification(`ファイルのアップロードに失敗しました: ${result.error}`, 'error');
                }
            });
        });
    }
    
    // クリップボード貼り付けのセットアップ
    if (fileService) {
        fileService.setupClipboardPaste((result) => {
            if (result.success) {
                addFileToPreview(result.fileInfo);
                showFilePreviewArea();
                showNotification('クリップボードから画像を貼り付けました', 'success');
            } else {
                showNotification(`画像の貼り付けに失敗しました: ${result.error}`, 'error');
            }
        });
    }
}

// 会話リストのアバター画像を更新
function updateConversationListAvatars() {
    const conversationItems = document.querySelectorAll('.conversation-item');
    conversationItems.forEach(item => {
        const conversationId = parseInt(item.getAttribute('data-conversation'));
        const conversation = conversations[conversationId];
        
        if (conversation) {
            const avatarImg = item.querySelector('.conversation-avatar img');
            if (avatarImg) {
                avatarImg.src = conversation.avatar;
                avatarImg.onerror = function() {
                    this.src = conversation.avatar; // フォールバックはSVGアバター
                };
            }
        }
    });
}

// 認証ユーザーのアバター更新
function updateUserAvatars() {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;
    
    const userName = currentUser.lastName && currentUser.firstName ? 
        `${currentUser.lastName} ${currentUser.firstName}` : 
        currentUser.name || 'ユーザー';
    
    const userAvatars = document.querySelectorAll('.user-avatar');
    userAvatars.forEach(avatar => {
        if (currentUser.profileImage && 
            !currentUser.profileImage.includes('placeholder') &&
            !currentUser.profileImage.includes('data:image/svg+xml')) {
            avatar.src = currentUser.profileImage;
            avatar.onerror = function() {
                this.src = generateSVGAvatar(userName, 40);
            };
        } else {
            avatar.src = generateSVGAvatar(userName, 40);
        }
    });
    
    // ユーザー名も更新
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = userName;
    });
}

function selectConversation(conversationId) {
    // Supabase統合の場合は新しい関数を使用
    if (messageServiceInstance) {
        selectConversationWithSupabase(conversationId);
    } else {
        selectConversationLegacy(conversationId);
    }
}

// Supabase統合版の会話選択
async function selectConversationWithSupabase(conversationId) {
    try {
        // アクティブな会話を変更
        const conversationItems = document.querySelectorAll('.conversation-item');
        conversationItems.forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.getAttribute('data-conversation')) === conversationId) {
                item.classList.add('active');
            }
        });
        
        currentConversation = conversationId;
        const conversation = messageServiceInstance.getConversation(conversationId);
        
        if (conversation) {
            // ヘッダー情報を更新
            updateConversationHeader(conversation);
            
            // Supabaseからメッセージを取得
            const messages = await messageServiceInstance.getConversationMessages(conversationId);
            
            // ローカル会話オブジェクトを更新
            conversations[conversationId].messages = messages;
            
            // メッセージを表示
            displayMessages(messages);
            
            // 未読カウントをクリア
            const activeItem = document.querySelector(`.conversation-item[data-conversation="${conversationId}"]`);
            if (activeItem) {
                const unreadCount = activeItem.querySelector('.unread-count');
                if (unreadCount) {
                    unreadCount.remove();
                }
            }
        }
    } catch (error) {
        console.error('Failed to select conversation with Supabase:', error);
        // フォールバック
        selectConversationLegacy(conversationId);
    }
}

// レガシー版の会話選択（フォールバック用）
function selectConversationLegacy(conversationId) {
    // アクティブな会話を変更
    const conversationItems = document.querySelectorAll('.conversation-item');
    conversationItems.forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.getAttribute('data-conversation')) === conversationId) {
            item.classList.add('active');
        }
    });
    
    currentConversation = conversationId;
    const conversation = conversations[conversationId];
    
    if (conversation) {
        // ヘッダー情報を更新
        updateConversationHeader(conversation);
        
        // メッセージを表示
        displayMessages(conversation.messages);
        
        // 未読カウントをクリア
        const activeItem = document.querySelector(`.conversation-item[data-conversation="${conversationId}"]`);
        if (activeItem) {
            const unreadCount = activeItem.querySelector('.unread-count');
            if (unreadCount) {
                unreadCount.remove();
            }
        }
    }
}

function updateConversationHeader(conversation) {
    const userAvatar = document.querySelector('.conversation-header-bar .user-avatar');
    const userName = document.querySelector('.conversation-header-bar h3');
    const userStatus = document.querySelector('.conversation-header-bar .user-status');
    
    if (userAvatar) userAvatar.src = conversation.avatar;
    if (userName) userName.textContent = conversation.name;
    if (userStatus) {
        userStatus.textContent = conversation.status === 'online' ? 'オンライン' : 
                                 conversation.status === 'away' ? '離席中' : 'オフライン';
        userStatus.className = `user-status ${conversation.status}`;
    }
}

function displayMessages(messages) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        
        let avatarHtml = '';
        if (message.type === 'received' && message.avatar) {
            avatarHtml = `
                <div class="message-avatar">
                    <img src="${message.avatar}" alt="送信者">
                </div>
            `;
        }
        
        // 添付ファイルのHTML
        let attachmentsHtml = '';
        if (message.attachments && message.attachments.length > 0) {
            attachmentsHtml = '<div class="message-attachments">';
            message.attachments.forEach(attachment => {
                const previewElement = fileService.generateFilePreview(attachment);
                attachmentsHtml += previewElement.outerHTML;
            });
            attachmentsHtml += '</div>';
        }
        
        messageDiv.innerHTML = `
            ${avatarHtml}
            <div class="message-content">
                <div class="message-bubble">
                    <p>${message.content}</p>
                    ${attachmentsHtml}
                </div>
                <div class="message-time">${message.time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    });
    
    // スクロールを最下部に
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;
    
    const content = messageInput.value.trim();
    if (!content) return;
    
    try {
        if (messageServiceInstance) {
            // Supabase統合版
            await sendMessageWithSupabase(content);
        } else {
            // レガシー版
            sendMessageLegacy(content);
        }
    } catch (error) {
        console.error('Failed to send message:', error);
        // エラー通知を表示
        showErrorNotification('メッセージの送信に失敗しました');
        // フォールバック: レガシー版を実行
        sendMessageLegacy(content);
    }
    
    // 入力欄をクリア
    messageInput.value = '';
    messageInput.style.height = 'auto';
}

// Supabase統合版のメッセージ送信
async function sendMessageWithSupabase(content) {
    // 送信ボタンを無効化
    const sendButton = document.querySelector('.send-btn');
    if (sendButton) {
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    try {
        // 添付ファイルを取得
        const attachedFiles = getAttachedFiles();
        
        // メッセージタイプを決定
        let messageType = 'text';
        if (attachedFiles.length > 0) {
            messageType = 'file';
        }
        
        const result = await messageServiceInstance.sendMessage(currentConversation, content, messageType);
        
        if (result.success) {
            // 添付ファイル情報を追加
            if (attachedFiles.length > 0) {
                result.message.attachments = attachedFiles;
            }
            
            // UIメッセージをローカルに追加
            if (conversations[currentConversation]) {
                if (!conversations[currentConversation].messages) {
                    conversations[currentConversation].messages = [];
                }
                conversations[currentConversation].messages.push(result.message);
                
                // メッセージを再表示
                displayMessages(conversations[currentConversation].messages);
                
                // 会話リストの最終メッセージを更新
                const previewText = attachedFiles.length > 0 ? 
                    `📎 ${attachedFiles.length}個のファイル${content ? ': ' + content : ''}` : content;
                updateConversationPreview(currentConversation, previewText, result.message.time);
                
                // 添付ファイルをクリア
                clearAllFiles();
                
                // フォールバック使用の場合は警告
                if (result.fallback) {
                    console.warn('Message sent using localStorage fallback');
                }
            }
        } else {
            throw new Error('Failed to send message');
        }
    } finally {
        // 送信ボタンを再有効化
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }
}

// レガシー版のメッセージ送信
function sendMessageLegacy(content) {
    // 現在時刻を取得
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + 
                 now.getMinutes().toString().padStart(2, '0');
    
    // メッセージを追加
    if (conversations[currentConversation]) {
        if (!conversations[currentConversation].messages) {
            conversations[currentConversation].messages = [];
        }
        conversations[currentConversation].messages.push({
            type: 'sent',
            content: content,
            time: time
        });
        
        // メッセージを再表示
        displayMessages(conversations[currentConversation].messages);
        
        // 会話リストの最終メッセージを更新
        updateConversationPreview(currentConversation, content, time);
    }
}

// エラー通知表示
function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 5秒後に自動削除
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function updateConversationPreview(conversationId, lastMessage, time) {
    const conversationItem = document.querySelector(`.conversation-item[data-conversation="${conversationId}"]`);
    if (conversationItem) {
        const lastMessageElement = conversationItem.querySelector('.last-message');
        const timestampElement = conversationItem.querySelector('.timestamp');
        
        if (lastMessageElement) lastMessageElement.textContent = lastMessage;
        if (timestampElement) timestampElement.textContent = time;
    }
}

function applyMessageFilter(filter) {
    const conversationItems = document.querySelectorAll('.conversation-item');
    
    conversationItems.forEach(item => {
        let show = true;
        
        switch (filter) {
            case 'unread':
                show = item.querySelector('.unread-count') !== null;
                break;
            case 'important':
                // 重要メッセージの判定（実装予定）
                show = false;
                break;
            case 'sent':
                // 送信済みメッセージの判定（実装予定）
                show = false;
                break;
            default:
                show = true;
        }
        
        item.style.display = show ? 'flex' : 'none';
    });
}

function searchMessages(query) {
    const conversationItems = document.querySelectorAll('.conversation-item');
    
    if (!query) {
        conversationItems.forEach(item => {
            item.style.display = 'flex';
        });
        return;
    }
    
    conversationItems.forEach(item => {
        const name = item.querySelector('h4').textContent.toLowerCase();
        const message = item.querySelector('.last-message').textContent.toLowerCase();
        const show = name.includes(query.toLowerCase()) || message.includes(query.toLowerCase());
        
        item.style.display = show ? 'flex' : 'none';
    });
}

async function attachFile() {
    try {
        const files = await fileService.openFileDialog({ multiple: true });
        
        if (files.length === 0) return;
        
        // ファイルを順次アップロード
        for (const file of files) {
            const result = await fileService.uploadFile(file);
            
            if (result.success) {
                addFileToPreview(result.fileInfo);
                showFilePreviewArea();
            } else {
                showNotification(`ファイル「${file.name}」のアップロードに失敗しました: ${result.error}`, 'error');
            }
        }
    } catch (error) {
        console.error('File attachment error:', error);
        showNotification('ファイル添付でエラーが発生しました', 'error');
    }
}

function insertEmoji() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        const emojis = ['😊', '👍', '❤️', '😢', '😂', '🎉', '💼', '📊', '💡', '🚀', '✨', '🔥', '💯', '🎯', '📈'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        // カーソル位置に絵文字を挿入
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const text = messageInput.value;
        
        messageInput.value = text.substring(0, start) + randomEmoji + text.substring(end);
        messageInput.selectionStart = messageInput.selectionEnd = start + randomEmoji.length;
        messageInput.focus();
        
        // 高さ調整
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    }
}

function scheduleMessage() {
    showNotification('メッセージ予約機能は実装予定です', 'info');
}

function toggleImportant() {
    const button = event.target.closest('.action-btn');
    const icon = button.querySelector('i');
    
    if (icon.classList.contains('fas')) {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('重要マークを解除しました', 'info');
    } else {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification('重要マークを設定しました', 'success');
    }
}

function archiveConversation() {
    if (confirm('この会話をアーカイブしますか？')) {
        showNotification('会話をアーカイブしました', 'success');
        // 実際の実装では会話を非表示にする
    }
}

function deleteConversation() {
    if (confirm('この会話を削除しますか？削除した会話は復元できません。')) {
        showNotification('会話を削除しました', 'info');
        // 実際の実装では会話を削除する
    }
}

// 新規メッセージ作成モーダル
function openCompose() {
    const modal = document.getElementById('composeModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeCompose() {
    const modal = document.getElementById('composeModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // フォームをリセット
        const form = document.getElementById('composeForm');
        if (form) {
            form.reset();
        }
    }
}

function sendNewMessage() {
    const form = document.getElementById('composeForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const recipient = document.getElementById('recipientSearch').value;
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    if (!recipient || !subject || !message) {
        showNotification('すべての項目を入力してください', 'error');
        return;
    }
    
    // 新しい会話を作成
    const newConversationId = Object.keys(conversations).length + 1;
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + 
                 now.getMinutes().toString().padStart(2, '0');
    
    conversations[newConversationId] = {
        name: recipient,
        avatar: generateSVGAvatar(recipient, 40),
        status: 'offline',
        messages: [
            {
                type: 'sent',
                content: message,
                time: time
            }
        ]
    };
    
    showNotification(`${recipient}さんにメッセージを送信しました！`, 'success');
    closeCompose();
    
    // 会話リストを更新（実際の実装では動的に追加）
    console.log('New conversation created:', { recipient, subject, message });
}

// 通知表示関数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ffc107';
        notification.style.color = '#212529';
    } else {
        notification.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(event) {
    const modal = document.getElementById('composeModal');
    if (modal && event.target === modal) {
        closeCompose();
    }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCompose();
    }
});