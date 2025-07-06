// ログインページのエラー修正スクリプト

document.addEventListener('DOMContentLoaded', function() {
    // エラーハンドリングの改善
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        
        // togglePassword関数の重複エラーを無視
        if (event.error && event.error.message && 
            event.error.message.includes('togglePassword')) {
            event.preventDefault();
        }
    });
    
    // パスワード表示切り替えボタンの初期化
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(button => {
        // イベントリスナーを再設定（インラインonclickの代わりに）
        button.onclick = null;
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const wrapper = this.closest('.password-input-wrapper');
            const input = wrapper.querySelector('input[type="password"], input[type="text"]');
            
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            }
        });
    });
    
    // フォーム送信エラーの防止
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // 既存のイベントリスナーを削除
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        // 新しいイベントリスナーを追加
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const email = formData.get('email');
                const password = formData.get('password');
                
                if (!email || !password) {
                    if (window.showNotification) {
                        window.showNotification('メールアドレスとパスワードを入力してください', 'error');
                    } else {
                        alert('メールアドレスとパスワードを入力してください');
                    }
                    return;
                }
                
                // ログイン処理（auth.jsの関数を使用）
                if (window.auth && window.auth.login) {
                    const result = await window.auth.login(email, password);
                    
                    if (result.success) {
                        if (window.showNotification) {
                            window.showNotification('ログインに成功しました', 'success');
                        }
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                    } else {
                        if (window.showNotification) {
                            window.showNotification(result.message || 'ログインに失敗しました', 'error');
                        } else {
                            alert(result.message || 'ログインに失敗しました');
                        }
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                if (window.showNotification) {
                    window.showNotification('ログイン処理でエラーが発生しました', 'error');
                } else {
                    alert('ログイン処理でエラーが発生しました');
                }
            }
        });
    }
});