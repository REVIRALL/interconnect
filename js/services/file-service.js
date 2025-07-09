// ファイル添付とメディア送信サービス

class FileService {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        this.allowedAudioTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
        this.allowedDocumentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv'
        ];
        
        this.fileStorage = new Map(); // ローカルファイルストレージ
        this.initialize();
    }

    initialize() {
        // 保存されたファイル情報を読み込み
        this.loadStoredFiles();
        console.log('File service initialized');
    }

    // ファイルの検証
    validateFile(file) {
        const errors = [];

        // ファイルサイズチェック
        if (file.size > this.maxFileSize) {
            errors.push(`ファイルサイズが大きすぎます。${this.formatFileSize(this.maxFileSize)}以下にしてください。`);
        }

        // ファイル形式チェック
        const allowedTypes = [
            ...this.allowedImageTypes,
            ...this.allowedVideoTypes,
            ...this.allowedAudioTypes,
            ...this.allowedDocumentTypes
        ];

        if (!allowedTypes.includes(file.type)) {
            errors.push('サポートされていないファイル形式です。');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // ファイルの種類を判定
    getFileType(file) {
        if (this.allowedImageTypes.includes(file.type)) {
            return 'image';
        } else if (this.allowedVideoTypes.includes(file.type)) {
            return 'video';
        } else if (this.allowedAudioTypes.includes(file.type)) {
            return 'audio';
        } else if (this.allowedDocumentTypes.includes(file.type)) {
            return 'document';
        }
        return 'unknown';
    }

    // ファイルのアップロード処理
    async uploadFile(file, options = {}) {
        try {
            // ファイル検証
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }

            // ファイルIDを生成
            const fileId = this.generateFileId();
            const fileType = this.getFileType(file);

            // ファイル情報を作成
            const fileInfo = {
                id: fileId,
                name: file.name,
                type: file.type,
                size: file.size,
                fileType: fileType,
                uploadedAt: new Date().toISOString(),
                uploadedBy: options.userId || 'current-user'
            };

            // ファイルをBase64またはObjectURLで保存
            if (fileType === 'image' || file.size < 1024 * 1024) { // 1MB以下はBase64
                fileInfo.data = await this.fileToBase64(file);
                fileInfo.storageType = 'base64';
            } else {
                // 大きなファイルはObjectURL（セッション中のみ有効）
                fileInfo.url = URL.createObjectURL(file);
                fileInfo.storageType = 'objecturl';
                fileInfo.file = file; // 参照を保持
            }

            // サムネイル生成（画像の場合）
            if (fileType === 'image') {
                fileInfo.thumbnail = await this.generateThumbnail(file);
            }

            // ストレージに保存
            this.fileStorage.set(fileId, fileInfo);
            this.saveFilesToStorage();

            return {
                success: true,
                fileInfo: fileInfo
            };

        } catch (error) {
            console.error('File upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 複数ファイルのアップロード
    async uploadFiles(files, options = {}) {
        const results = [];
        
        for (const file of files) {
            const result = await this.uploadFile(file, options);
            results.push(result);
        }

        return results;
    }

    // ファイルの取得
    getFile(fileId) {
        return this.fileStorage.get(fileId);
    }

    // ファイルのダウンロードURL取得
    getFileUrl(fileId) {
        const fileInfo = this.fileStorage.get(fileId);
        if (!fileInfo) return null;

        if (fileInfo.storageType === 'base64') {
            return fileInfo.data;
        } else if (fileInfo.storageType === 'objecturl') {
            return fileInfo.url;
        }

        return null;
    }

    // ファイルの削除
    deleteFile(fileId) {
        const fileInfo = this.fileStorage.get(fileId);
        if (fileInfo) {
            // ObjectURLの場合はメモリから削除
            if (fileInfo.storageType === 'objecturl' && fileInfo.url) {
                URL.revokeObjectURL(fileInfo.url);
            }
            
            this.fileStorage.delete(fileId);
            this.saveFilesToStorage();
            return true;
        }
        return false;
    }

    // サムネイル生成
    async generateThumbnail(file, maxSize = 150) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // サムネイルサイズ計算
                let { width, height } = this.calculateThumbnailSize(
                    img.width, 
                    img.height, 
                    maxSize
                );

                canvas.width = width;
                canvas.height = height;

                // 画像を描画
                ctx.drawImage(img, 0, 0, width, height);

                // Base64として出力
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };

            img.onerror = () => reject(new Error('Thumbnail generation failed'));
            img.src = URL.createObjectURL(file);
        });
    }

    // サムネイルサイズ計算
    calculateThumbnailSize(originalWidth, originalHeight, maxSize) {
        let width = originalWidth;
        let height = originalHeight;

        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    // ファイルをBase64に変換
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsDataURL(file);
        });
    }

    // ファイルID生成
    generateFileId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ファイルサイズのフォーマット
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ファイル情報の保存
    saveFilesToStorage() {
        try {
            const filesToSave = [];
            
            this.fileStorage.forEach((fileInfo, fileId) => {
                // ObjectURLタイプは保存しない（セッション限定）
                if (fileInfo.storageType === 'base64') {
                    filesToSave.push({
                        id: fileId,
                        ...fileInfo,
                        file: undefined // File オブジェクトは除外
                    });
                }
            });
            
            localStorage.setItem('uploadedFiles', JSON.stringify(filesToSave));
        } catch (error) {
            console.error('Failed to save files to storage:', error);
        }
    }

    // 保存されたファイル情報の読み込み
    loadStoredFiles() {
        try {
            const stored = localStorage.getItem('uploadedFiles');
            if (stored) {
                const files = JSON.parse(stored);
                files.forEach(fileInfo => {
                    this.fileStorage.set(fileInfo.id, fileInfo);
                });
            }
        } catch (error) {
            console.error('Failed to load stored files:', error);
        }
    }

    // ファイルプレビューの生成
    generateFilePreview(fileInfo) {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'file-preview';
        previewContainer.dataset.fileId = fileInfo.id;

        let previewContent = '';

        switch (fileInfo.fileType) {
            case 'image':
                previewContent = `
                    <div class="image-preview">
                        <img src="${fileInfo.thumbnail || fileInfo.data}" alt="${fileInfo.name}" />
                        <div class="file-info">
                            <span class="file-name">${fileInfo.name}</span>
                            <span class="file-size">${this.formatFileSize(fileInfo.size)}</span>
                        </div>
                    </div>
                `;
                break;

            case 'video':
                const videoUrl = this.getFileUrl(fileInfo.id);
                previewContent = `
                    <div class="video-preview">
                        <video controls>
                            <source src="${videoUrl}" type="${fileInfo.type}">
                        </video>
                        <div class="file-info">
                            <span class="file-name">${fileInfo.name}</span>
                            <span class="file-size">${this.formatFileSize(fileInfo.size)}</span>
                        </div>
                    </div>
                `;
                break;

            case 'audio':
                const audioUrl = this.getFileUrl(fileInfo.id);
                previewContent = `
                    <div class="audio-preview">
                        <div class="audio-icon">🎵</div>
                        <audio controls>
                            <source src="${audioUrl}" type="${fileInfo.type}">
                        </audio>
                        <div class="file-info">
                            <span class="file-name">${fileInfo.name}</span>
                            <span class="file-size">${this.formatFileSize(fileInfo.size)}</span>
                        </div>
                    </div>
                `;
                break;

            case 'document':
                const docIcon = this.getDocumentIcon(fileInfo.type);
                previewContent = `
                    <div class="document-preview">
                        <div class="document-icon">${docIcon}</div>
                        <div class="file-info">
                            <span class="file-name">${fileInfo.name}</span>
                            <span class="file-size">${this.formatFileSize(fileInfo.size)}</span>
                        </div>
                        <button class="download-btn" onclick="fileService.downloadFile('${fileInfo.id}')">
                            ダウンロード
                        </button>
                    </div>
                `;
                break;

            default:
                previewContent = `
                    <div class="unknown-preview">
                        <div class="unknown-icon">📎</div>
                        <div class="file-info">
                            <span class="file-name">${fileInfo.name}</span>
                            <span class="file-size">${this.formatFileSize(fileInfo.size)}</span>
                        </div>
                    </div>
                `;
        }

        previewContainer.innerHTML = previewContent;
        return previewContainer;
    }

    // ドキュメントアイコンを取得
    getDocumentIcon(mimeType) {
        const iconMap = {
            'application/pdf': '📄',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'application/vnd.ms-excel': '📊',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
            'application/vnd.ms-powerpoint': '📽️',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
            'text/plain': '📄',
            'text/csv': '📊'
        };
        return iconMap[mimeType] || '📎';
    }

    // ファイルダウンロード
    downloadFile(fileId) {
        const fileInfo = this.fileStorage.get(fileId);
        if (!fileInfo) {
            alert('ファイルが見つかりません');
            return;
        }

        try {
            const url = this.getFileUrl(fileId);
            if (!url) {
                alert('ファイルのダウンロードに失敗しました');
                return;
            }

            const link = document.createElement('a');
            link.href = url;
            link.download = fileInfo.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            alert('ダウンロードに失敗しました');
        }
    }

    // ファイル選択ダイアログを開く
    openFileDialog(options = {}) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = options.multiple || false;
            
            // 受け入れるファイル形式を設定
            if (options.accept) {
                input.accept = options.accept;
            } else {
                const allTypes = [
                    ...this.allowedImageTypes,
                    ...this.allowedVideoTypes,
                    ...this.allowedAudioTypes,
                    ...this.allowedDocumentTypes
                ];
                input.accept = allTypes.join(',');
            }

            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                resolve(files);
            };

            input.click();
        });
    }

    // ドラッグ&ドロップのセットアップ
    setupDragAndDrop(element, callback) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', async (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                const results = await this.uploadFiles(files);
                callback(results);
            }
        });
    }

    // クリップボードからの画像貼り付け
    setupClipboardPaste(callback) {
        document.addEventListener('paste', async (e) => {
            const items = Array.from(e.clipboardData.items);
            const imageItems = items.filter(item => item.type.startsWith('image/'));

            if (imageItems.length > 0) {
                e.preventDefault();
                
                for (const item of imageItems) {
                    const file = item.getAsFile();
                    if (file) {
                        const result = await this.uploadFile(file);
                        callback(result);
                    }
                }
            }
        });
    }

    // 進行状況を表示するアップローダー
    async uploadFileWithProgress(file, progressCallback) {
        try {
            // プログレスのシミュレーション（実際のアップロードでは実際の進行状況を使用）
            progressCallback(0);

            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }

            progressCallback(25);

            const fileId = this.generateFileId();
            const fileType = this.getFileType(file);

            progressCallback(50);

            const fileInfo = {
                id: fileId,
                name: file.name,
                type: file.type,
                size: file.size,
                fileType: fileType,
                uploadedAt: new Date().toISOString(),
                uploadedBy: 'current-user'
            };

            progressCallback(75);

            if (fileType === 'image' || file.size < 1024 * 1024) {
                fileInfo.data = await this.fileToBase64(file);
                fileInfo.storageType = 'base64';
            } else {
                fileInfo.url = URL.createObjectURL(file);
                fileInfo.storageType = 'objecturl';
                fileInfo.file = file;
            }

            if (fileType === 'image') {
                fileInfo.thumbnail = await this.generateThumbnail(file);
            }

            this.fileStorage.set(fileId, fileInfo);
            this.saveFilesToStorage();

            progressCallback(100);

            return {
                success: true,
                fileInfo: fileInfo
            };

        } catch (error) {
            console.error('File upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// グローバルインスタンス
const fileService = new FileService();

// グローバルアクセス用
window.fileService = fileService;