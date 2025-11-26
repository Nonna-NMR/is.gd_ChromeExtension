document.addEventListener('DOMContentLoaded', () => {
    const btnCurrent = document.getElementById('btn-current');
    const btnCustom = document.getElementById('btn-custom');
    const inputUrl = document.getElementById('input-url');
    const statusDiv = document.getElementById('status');

    // ①「現在のページ」ボタンが押されたとき
    btnCurrent.addEventListener('click', async () => {
        // 現在のアクティブなタブを取得
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            await shortenAndCopy(tab.url);
        } else {
            showStatus('URLが取得できませんでした', true);
        }
    });

    // ②「任意のURL」ボタンが押されたとき
    btnCustom.addEventListener('click', async () => {
        const text = inputUrl.value.trim();
        if (!text) {
            showStatus('URLを入力してください', true);
            return;
        }
        await shortenAndCopy(text);
    });

    // 共通処理: is.gdで短縮してクリップボードへ
    async function shortenAndCopy(originalUrl) {
        showStatus('短縮中...', false);

        try {
            const apiUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(originalUrl)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                // HTTPエラー（is.gdがダウンしているなど）
                throw new Error(`Error: ${response.status}`);
            }

            const shortUrl = await response.text();

            // エラーメッセージが返ってくる場合もあるので簡易チェック
            if (shortUrl.startsWith('Error:')) {
                throw new Error(shortUrl);
            }

            // クリップボードにコピー
            await navigator.clipboard.writeText(shortUrl);

            showStatus(`コピー完了!\n${shortUrl}`, false);

        } catch (err) {
            console.error(err);
            showStatus('失敗しました: ' + err.message, true);
        }
    }

    // ステータス表示用
    function showStatus(msg, isError) {
        statusDiv.textContent = msg;
        statusDiv.className = isError ? 'error' : '';
    }
});