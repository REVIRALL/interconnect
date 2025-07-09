/**
 * Zapier Webhook受信用エンドポイント
 * ZapierからのTL;DVデータを受け取ってSupabaseに保存
 */

// Express.jsサーバーの例（Node.js環境）
const express = require('express');
const app = express();
app.use(express.json());

// Zapierからのwebhookを受信
app.post('/webhook/tldv-transcript', async (req, res) => {
    try {
        // Zapierから送られてくるデータ
        const {
            meeting_id,
            meeting_title,
            meeting_date,
            transcript_text,
            summary,
            user_email,
            recording_url,
            participants
        } = req.body;

        console.log('Received TL;DV data from Zapier:', meeting_id);

        // Supabaseに保存
        const { data, error } = await supabase
            .from('transcripts')
            .insert({
                meeting_id: meeting_id,
                meeting_title: meeting_title || '無題のミーティング',
                meeting_date: new Date(meeting_date),
                raw_transcript: transcript_text,
                summary: summary,
                // user_idはemailから取得
                user_id: await getUserIdByEmail(user_email)
            });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        // Difyで分析（非同期）
        analyzeWithDify(data[0].id, transcript_text);

        // Zapierに成功レスポンス
        res.json({ 
            success: true, 
            transcript_id: data[0].id,
            message: 'Transcript saved successfully'
        });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// メールアドレスからユーザーIDを取得
async function getUserIdByEmail(email) {
    const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();
    
    return data?.id || null;
}

// Difyで分析
async function analyzeWithDify(transcriptId, transcriptText) {
    const difyService = new DifyService(
        process.env.DIFY_API_KEY,
        process.env.DIFY_WORKFLOW_ID
    );

    try {
        const analysis = await difyService.analyzeTranscript(transcriptText);
        
        // 分析結果を更新
        await supabase
            .from('transcripts')
            .update({
                keywords: analysis.keywords,
                topics: analysis.topics
            })
            .eq('id', transcriptId);

    } catch (error) {
        console.error('Dify analysis error:', error);
    }
}

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook receiver listening on port ${PORT}`);
});