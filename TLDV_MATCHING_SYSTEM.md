# TL;DV × Supabase × Dify マッチングシステム設計書

## システム概要

TL;DVの会議トランスクリプトを分析し、コミュニティメンバー間のシナジーを自動的に検出してマッチングするシステム。

## アーキテクチャ

```
[TL;DV API] → [取得サービス] → [Supabase] → [Dify API] → [マッチングエンジン] → [結果表示]
```

## 1. データベース設計（Supabase）

### transcripts テーブル
```sql
CREATE TABLE transcripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    meeting_id TEXT NOT NULL,
    meeting_title TEXT,
    meeting_date TIMESTAMP,
    raw_transcript TEXT,
    summary TEXT,
    keywords TEXT[],
    topics TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### user_interests テーブル
```sql
CREATE TABLE user_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    interest_category TEXT NOT NULL,
    interest_keywords TEXT[],
    strength DECIMAL(3,2), -- 0.00 to 1.00
    source TEXT, -- 'transcript', 'profile', 'manual'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### matching_scores テーブル
```sql
CREATE TABLE matching_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES user_profiles(id),
    user2_id UUID REFERENCES user_profiles(id),
    total_score INTEGER, -- 0-100
    category_scores JSONB, -- 各カテゴリ別スコア
    match_reasons TEXT[],
    calculation_date TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user1_id, user2_id)
);
```

### matching_recommendations テーブル
```sql
CREATE TABLE matching_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    recommended_user_id UUID REFERENCES user_profiles(id),
    score INTEGER,
    status TEXT DEFAULT 'pending', -- pending, viewed, contacted, connected
    created_at TIMESTAMP DEFAULT NOW(),
    viewed_at TIMESTAMP,
    contacted_at TIMESTAMP
);
```

## 2. TL;DV API連携

### APIクライアント実装
```javascript
// js/services/tldv-service.js
class TldvService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.tldv.io/v1';
    }

    async getMeetings(userId) {
        const response = await fetch(`${this.baseUrl}/meetings`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }

    async getTranscript(meetingId) {
        const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/transcript`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }

    async processAndSaveTranscript(meetingData, userId) {
        // トランスクリプトを取得
        const transcript = await this.getTranscript(meetingData.id);
        
        // Supabaseに保存
        const { data, error } = await supabase
            .from('transcripts')
            .insert({
                user_id: userId,
                meeting_id: meetingData.id,
                meeting_title: meetingData.title,
                meeting_date: meetingData.date,
                raw_transcript: transcript.text,
                summary: transcript.summary
            });
        
        if (!error) {
            // Difyで分析
            await this.analyzeWithDify(data[0].id);
        }
        
        return data;
    }
}
```

## 3. Dify連携

### Difyワークフロー設定
```javascript
// js/services/dify-service.js
class DifyService {
    constructor(apiKey, workflowId) {
        this.apiKey = apiKey;
        this.workflowId = workflowId;
        this.baseUrl = 'https://api.dify.ai/v1';
    }

    async analyzeTranscript(transcriptText) {
        const response = await fetch(`${this.baseUrl}/workflows/${this.workflowId}/run`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {
                    transcript: transcriptText,
                    analysis_type: 'interest_extraction'
                }
            })
        });
        
        const result = await response.json();
        return {
            keywords: result.outputs.keywords,
            topics: result.outputs.topics,
            interests: result.outputs.interests,
            business_areas: result.outputs.business_areas
        };
    }

    async calculateMatchingScore(user1Data, user2Data) {
        const response = await fetch(`${this.baseUrl}/workflows/${this.workflowId}/run`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {
                    user1: user1Data,
                    user2: user2Data,
                    analysis_type: 'matching_calculation'
                }
            })
        });
        
        const result = await response.json();
        return {
            total_score: result.outputs.total_score,
            category_scores: result.outputs.category_scores,
            match_reasons: result.outputs.match_reasons,
            recommendations: result.outputs.recommendations
        };
    }
}
```

## 4. マッチングエンジン

### マッチングスコア計算
```javascript
// js/services/matching-engine.js
class MatchingEngine {
    constructor(difyService, supabase) {
        this.difyService = difyService;
        this.supabase = supabase;
    }

    async calculateUserSynergy(userId1, userId2) {
        // ユーザーデータ取得
        const user1Data = await this.getUserCompleteProfile(userId1);
        const user2Data = await this.getUserCompleteProfile(userId2);
        
        // Difyでスコア計算
        const matchingResult = await this.difyService.calculateMatchingScore(
            user1Data,
            user2Data
        );
        
        // スコア保存
        await this.saveMatchingScore(userId1, userId2, matchingResult);
        
        return matchingResult;
    }

    async getUserCompleteProfile(userId) {
        // ユーザー基本情報
        const { data: profile } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        // トランスクリプト分析結果
        const { data: transcripts } = await this.supabase
            .from('transcripts')
            .select('keywords, topics, summary')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
        
        // ユーザー興味
        const { data: interests } = await this.supabase
            .from('user_interests')
            .select('*')
            .eq('user_id', userId);
        
        return {
            profile,
            transcripts,
            interests,
            aggregated_keywords: this.aggregateKeywords(transcripts),
            business_focus: this.extractBusinessFocus(transcripts, profile)
        };
    }

    aggregateKeywords(transcripts) {
        const keywordMap = new Map();
        
        transcripts.forEach(transcript => {
            transcript.keywords?.forEach(keyword => {
                keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
            });
        });
        
        return Array.from(keywordMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([keyword, count]) => ({ keyword, count }));
    }

    async saveMatchingScore(userId1, userId2, result) {
        // 小さいIDを先に
        const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
        
        const { error } = await this.supabase
            .from('matching_scores')
            .upsert({
                user1_id: user1,
                user2_id: user2,
                total_score: result.total_score,
                category_scores: result.category_scores,
                match_reasons: result.match_reasons,
                calculation_date: new Date()
            });
        
        // 高スコアの場合は推薦を作成
        if (result.total_score >= 70) {
            await this.createRecommendations(user1, user2, result.total_score);
        }
    }

    async createRecommendations(userId1, userId2, score) {
        // 双方向の推薦を作成
        await this.supabase
            .from('matching_recommendations')
            .insert([
                {
                    user_id: userId1,
                    recommended_user_id: userId2,
                    score: score
                },
                {
                    user_id: userId2,
                    recommended_user_id: userId1,
                    score: score
                }
            ]);
    }
}
```

## 5. スコアリングシステム

### スコア計算基準（100点満点）

1. **ビジネス分野の関連性（30点）**
   - 同業種: 10点
   - 関連業種: 20点
   - 補完的業種: 30点

2. **興味・関心の一致度（25点）**
   - キーワード一致率による

3. **コミュニケーションスタイル（15点）**
   - トランスクリプトから分析

4. **専門性の補完性（20点）**
   - スキルセットの相互補完

5. **活動頻度の類似性（10点）**
   - ミーティング頻度など

## 6. フロントエンド実装

### マッチング結果表示
```html
<!-- matching.html -->
<div class="matching-container">
    <h2>おすすめのマッチング</h2>
    
    <div class="matching-filters">
        <select id="scoreFilter">
            <option value="all">すべて</option>
            <option value="90">90点以上</option>
            <option value="80">80点以上</option>
            <option value="70">70点以上</option>
        </select>
    </div>
    
    <div class="matching-grid" id="matchingGrid">
        <!-- 動的に生成 -->
    </div>
</div>

<script>
async function loadMatchingRecommendations() {
    const userId = getCurrentUserId();
    
    const { data: recommendations } = await supabase
        .from('matching_recommendations')
        .select(`
            *,
            recommended_user:recommended_user_id(
                name,
                company,
                position,
                avatar_url
            ),
            matching_score:matching_scores!user1_id(
                total_score,
                category_scores,
                match_reasons
            )
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('score', { ascending: false })
        .limit(10);
    
    displayRecommendations(recommendations);
}

function displayRecommendations(recommendations) {
    const grid = document.getElementById('matchingGrid');
    
    grid.innerHTML = recommendations.map(rec => `
        <div class="matching-card">
            <div class="matching-header">
                <img src="${rec.recommended_user.avatar_url}" alt="${rec.recommended_user.name}">
                <div class="matching-score-badge">${rec.score}点</div>
            </div>
            
            <div class="matching-info">
                <h3>${rec.recommended_user.name}</h3>
                <p>${rec.recommended_user.position} @ ${rec.recommended_user.company}</p>
            </div>
            
            <div class="matching-reasons">
                <h4>マッチング理由</h4>
                <ul>
                    ${rec.matching_score.match_reasons.map(reason => 
                        `<li>${reason}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="matching-scores">
                <div class="score-breakdown">
                    ${Object.entries(rec.matching_score.category_scores).map(([category, score]) => `
                        <div class="score-item">
                            <span>${category}</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${score}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="matching-actions">
                <button onclick="viewProfile('${rec.recommended_user_id}')">
                    プロフィールを見る
                </button>
                <button onclick="sendMessage('${rec.recommended_user_id}')" class="primary">
                    メッセージを送る
                </button>
            </div>
        </div>
    `).join('');
}
</script>
```

## 7. 定期実行ジョブ

```javascript
// js/jobs/matching-job.js
class MatchingJob {
    async runDailyMatching() {
        // 全ユーザーの組み合わせでマッチング計算
        const { data: users } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('is_active', true);
        
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                await matchingEngine.calculateUserSynergy(
                    users[i].id,
                    users[j].id
                );
            }
        }
    }
}
```

## 8. 環境変数設定

```javascript
// .env
TLDV_API_KEY=your_tldv_api_key
DIFY_API_KEY=your_dify_api_key
DIFY_WORKFLOW_ID=your_workflow_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 実装優先順位

1. Supabaseテーブル作成
2. TL;DV API連携
3. Dify ワークフロー設定
4. マッチングエンジン実装
5. フロントエンド実装