/**
 * Dify AI連携サービス
 * トランスクリプト分析とマッチングスコア計算
 */

class DifyService {
    constructor(apiKey, workflowId) {
        this.apiKey = apiKey;
        this.workflowId = workflowId;
        this.baseUrl = 'https://api.dify.ai/v1';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * トランスクリプトを分析してキーワード・トピック・興味を抽出
     */
    async analyzeTranscript(transcriptText) {
        try {
            const response = await fetch(`${this.baseUrl}/workflows/${this.workflowId}/run`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    inputs: {
                        transcript: transcriptText,
                        analysis_type: 'interest_extraction',
                        language: 'ja',
                        max_keywords: 20,
                        max_topics: 10,
                        extract_interests: true,
                        extract_business_areas: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Dify API Error: ${response.status}`);
            }

            const result = await response.json();

            // レスポンスを整形
            return {
                keywords: result.outputs.keywords || [],
                topics: result.outputs.topics || [],
                interests: this.formatInterests(result.outputs.interests),
                business_areas: result.outputs.business_areas || [],
                summary: result.outputs.summary || '',
                sentiment: result.outputs.sentiment || 'neutral',
                key_points: result.outputs.key_points || []
            };
        } catch (error) {
            console.error('Error analyzing transcript:', error);
            throw error;
        }
    }

    /**
     * 2人のユーザーのマッチングスコアを計算
     */
    async calculateMatchingScore(user1Data, user2Data) {
        try {
            const response = await fetch(`${this.baseUrl}/workflows/${this.workflowId}/run`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    inputs: {
                        user1: this.prepareUserData(user1Data),
                        user2: this.prepareUserData(user2Data),
                        analysis_type: 'matching_calculation',
                        scoring_criteria: {
                            business_synergy: 30,
                            interest_overlap: 25,
                            communication_style: 15,
                            skill_complementarity: 20,
                            activity_similarity: 10
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Dify API Error: ${response.status}`);
            }

            const result = await response.json();

            return {
                total_score: Math.round(result.outputs.total_score || 0),
                category_scores: {
                    business_synergy: result.outputs.business_synergy || 0,
                    interest_overlap: result.outputs.interest_overlap || 0,
                    communication_style: result.outputs.communication_style || 0,
                    skill_complementarity: result.outputs.skill_complementarity || 0,
                    activity_similarity: result.outputs.activity_similarity || 0
                },
                match_reasons: result.outputs.match_reasons || [],
                recommendations: result.outputs.recommendations || [],
                collaboration_opportunities: result.outputs.collaboration_opportunities || [],
                conversation_starters: result.outputs.conversation_starters || []
            };
        } catch (error) {
            console.error('Error calculating matching score:', error);
            throw error;
        }
    }

    /**
     * バッチマッチング計算（複数ユーザー一括処理）
     */
    async batchCalculateMatching(userDataList) {
        try {
            const response = await fetch(`${this.baseUrl}/workflows/${this.workflowId}/run`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    inputs: {
                        users: userDataList.map(user => this.prepareUserData(user)),
                        analysis_type: 'batch_matching',
                        top_matches_per_user: 10,
                        min_score_threshold: 60
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Dify API Error: ${response.status}`);
            }

            const result = await response.json();
            return result.outputs.matches || [];
        } catch (error) {
            console.error('Error in batch matching:', error);
            throw error;
        }
    }

    /**
     * 興味データのフォーマット
     */
    formatInterests(rawInterests) {
        if (!rawInterests || !Array.isArray(rawInterests)) {
            return [];
        }

        return rawInterests.map(interest => ({
            category: interest.category || 'general',
            keywords: interest.keywords || [],
            strength: Math.min(1, Math.max(0, interest.strength || 0.5)),
            confidence: interest.confidence || 0.7
        }));
    }

    /**
     * ユーザーデータの準備（Dify API用）
     */
    prepareUserData(userData) {
        return {
            user_id: userData.profile.id,
            profile: {
                name: userData.profile.name,
                company: userData.profile.company,
                position: userData.profile.position,
                industry: userData.profile.industry,
                business_type: userData.profile.business_type,
                years_experience: userData.profile.years_experience
            },
            keywords: userData.aggregated_keywords || [],
            interests: userData.interests || [],
            recent_topics: this.extractRecentTopics(userData.transcripts),
            communication_frequency: userData.transcripts?.length || 0,
            active_since: userData.profile.created_at
        };
    }

    /**
     * 最近のトピックを抽出
     */
    extractRecentTopics(transcripts) {
        if (!transcripts || transcripts.length === 0) {
            return [];
        }

        const topicCounts = {};

        transcripts.forEach(transcript => {
            (transcript.topics || []).forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        return Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([topic, count]) => ({ topic, count }));
    }

    /**
     * キャッシュ付きAPI呼び出し
     */
    async cachedApiCall(cacheKey, apiFunction, ttl = 3600) {
        try {
            // キャッシュチェック
            const { data: cached } = await window.supabase
                .from('ai_analysis_cache')
                .select('output_data')
                .eq('source_type', 'api_call')
                .eq('source_id', cacheKey)
                .gte('expires_at', new Date().toISOString())
                .single();

            if (cached) {
                return cached.output_data;
            }

            // API呼び出し
            const startTime = Date.now();
            const result = await apiFunction();
            const processingTime = Date.now() - startTime;

            // 結果をキャッシュ
            await window.supabase
                .from('ai_analysis_cache')
                .insert({
                    source_type: 'api_call',
                    source_id: cacheKey,
                    analysis_type: 'dify_api',
                    provider: 'dify',
                    output_data: result,
                    processing_time_ms: processingTime,
                    expires_at: new Date(Date.now() + ttl * 1000).toISOString()
                });

            return result;
        } catch (error) {
            console.error('Error in cached API call:', error);
            throw error;
        }
    }

    /**
     * 会話のきっかけを生成
     */
    async generateConversationStarters(user1Data, user2Data, matchingResult) {
        try {
            const response = await fetch(`${this.baseUrl}/workflows/${this.workflowId}/run`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    inputs: {
                        user1: this.prepareUserData(user1Data),
                        user2: this.prepareUserData(user2Data),
                        matching_score: matchingResult.total_score,
                        common_interests: matchingResult.common_interests || [],
                        analysis_type: 'conversation_starters',
                        language: 'ja',
                        num_starters: 5
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Dify API Error: ${response.status}`);
            }

            const result = await response.json();
            return result.outputs.conversation_starters || [];
        } catch (error) {
            console.error('Error generating conversation starters:', error);
            return [
                '共通の興味があるトピックについて話してみましょう',
                'お互いのビジネスについて情報交換してみてはいかがでしょうか',
                '最近のプロジェクトについて共有してみましょう'
            ];
        }
    }
}

// グローバルに公開
window.DifyService = DifyService;