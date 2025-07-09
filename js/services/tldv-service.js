/**
 * TL;DV API連携サービス
 * 会議のトランスクリプトを取得してSupabaseに保存
 */

class TldvService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.tldv.io/v1';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * ユーザーの全ミーティングを取得
     */
    async getMeetings(userId, options = {}) {
        try {
            const params = new URLSearchParams({
                limit: options.limit || 50,
                offset: options.offset || 0,
                ...options.filters
            });

            const response = await fetch(`${this.baseUrl}/meetings?${params}`, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`TL;DV API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching meetings:', error);
            throw error;
        }
    }

    /**
     * 特定のミーティングのトランスクリプトを取得
     */
    async getTranscript(meetingId) {
        try {
            const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/transcript`, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`TL;DV API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching transcript:', error);
            throw error;
        }
    }

    /**
     * ミーティングの詳細情報を取得
     */
    async getMeetingDetails(meetingId) {
        try {
            const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`TL;DV API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching meeting details:', error);
            throw error;
        }
    }

    /**
     * トランスクリプトを処理してSupabaseに保存
     */
    async processAndSaveTranscript(meetingData, userId) {
        try {
            // トランスクリプトを取得
            const transcript = await this.getTranscript(meetingData.id);
            const meetingDetails = await this.getMeetingDetails(meetingData.id);

            // キーワードとトピックを抽出（簡易版）
            const extractedData = this.extractKeywordsAndTopics(transcript.text);

            // Supabaseに保存
            const { data, error } = await window.supabase
                .from('transcripts')
                .insert({
                    user_id: userId,
                    meeting_id: meetingData.id,
                    meeting_title: meetingData.title || '無題のミーティング',
                    meeting_date: meetingData.date || meetingDetails.startTime,
                    meeting_duration: meetingDetails.duration || null,
                    participants: meetingDetails.participants?.map(p => p.name) || [],
                    raw_transcript: transcript.text,
                    summary: transcript.summary || this.generateSummary(transcript.text),
                    keywords: extractedData.keywords,
                    topics: extractedData.topics,
                    language: transcript.language || 'ja',
                    platform: meetingDetails.platform || 'unknown'
                })
                .select();

            if (error) {
                throw error;
            }

            // Difyで詳細分析（非同期）
            this.analyzeWithDify(data[0].id).catch(console.error);

            return data[0];
        } catch (error) {
            console.error('Error processing transcript:', error);
            throw error;
        }
    }

    /**
     * キーワードとトピックの抽出（簡易版）
     */
    extractKeywordsAndTopics(text) {
        // 日本語の重要キーワードを抽出する簡易ロジック
        const keywords = [];
        const topics = [];

        // ビジネス関連キーワードのパターン
        const businessKeywords = [
            'AI', 'DX', 'マーケティング', '営業', '経営', '戦略', 
            'ブランディング', 'イノベーション', 'テクノロジー',
            'スタートアップ', '投資', '成長', 'グローバル', 
            'サステナビリティ', 'ESG', 'SDGs'
        ];

        // トピック候補
        const topicPatterns = {
            'technology': ['AI', 'DX', 'テクノロジー', 'システム', 'デジタル'],
            'marketing': ['マーケティング', 'ブランド', '広告', 'PR'],
            'sales': ['営業', 'セールス', '顧客', 'クライアント'],
            'finance': ['投資', '資金', 'ファイナンス', '財務'],
            'strategy': ['戦略', '経営', 'ビジネスモデル', '成長']
        };

        // キーワード抽出
        businessKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                keywords.push(keyword);
            }
        });

        // トピック判定
        Object.entries(topicPatterns).forEach(([topic, patterns]) => {
            const count = patterns.filter(pattern => text.includes(pattern)).length;
            if (count >= 2) {
                topics.push(topic);
            }
        });

        return { keywords, topics };
    }

    /**
     * 簡易サマリー生成
     */
    generateSummary(text, maxLength = 200) {
        // 最初の200文字を抜粋
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Difyで詳細分析
     */
    async analyzeWithDify(transcriptId) {
        try {
            const difyService = new DifyService(
                process.env.DIFY_API_KEY,
                process.env.DIFY_WORKFLOW_ID
            );

            // トランスクリプトを取得
            const { data: transcript } = await window.supabase
                .from('transcripts')
                .select('*')
                .eq('id', transcriptId)
                .single();

            if (!transcript) return;

            // Difyで分析
            const analysis = await difyService.analyzeTranscript(transcript.raw_transcript);

            // 結果を更新
            await window.supabase
                .from('transcripts')
                .update({
                    keywords: analysis.keywords,
                    topics: analysis.topics,
                    summary: analysis.summary || transcript.summary
                })
                .eq('id', transcriptId);

            // ユーザー興味を更新
            await this.updateUserInterests(transcript.user_id, analysis);

        } catch (error) {
            console.error('Error analyzing with Dify:', error);
        }
    }

    /**
     * ユーザーの興味・関心を更新
     */
    async updateUserInterests(userId, analysis) {
        try {
            const interests = analysis.interests || [];

            for (const interest of interests) {
                await window.supabase
                    .from('user_interests')
                    .upsert({
                        user_id: userId,
                        interest_category: interest.category,
                        interest_keywords: interest.keywords,
                        strength: interest.strength || 0.5,
                        source: 'ai_analysis',
                        source_id: analysis.transcript_id
                    }, {
                        onConflict: 'user_id,interest_category'
                    });
            }
        } catch (error) {
            console.error('Error updating user interests:', error);
        }
    }

    /**
     * 定期同期処理
     */
    async syncUserMeetings(userId) {
        try {
            console.log(`Syncing meetings for user: ${userId}`);

            // 最新のミーティングを取得
            const meetings = await this.getMeetings(userId, {
                limit: 10,
                filters: {
                    from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                }
            });

            const results = [];

            for (const meeting of meetings.data) {
                // 既に処理済みかチェック
                const { data: existing } = await window.supabase
                    .from('transcripts')
                    .select('id')
                    .eq('meeting_id', meeting.id)
                    .single();

                if (!existing) {
                    const result = await this.processAndSaveTranscript(meeting, userId);
                    results.push(result);
                }
            }

            console.log(`Synced ${results.length} new meetings`);
            return results;

        } catch (error) {
            console.error('Error syncing meetings:', error);
            throw error;
        }
    }
}

// グローバルに公開
window.TldvService = TldvService;