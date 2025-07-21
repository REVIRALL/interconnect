/**
 * LINE Authentication Backend Function
 * Handles LINE OAuth callback and creates/updates Supabase users
 */

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const { 
    asyncHandler, 
    ValidationError, 
    AuthenticationError,
    APIError 
} = require('./utils/error-handler');
const { 
    validateRequest, 
    getClientIP, 
    checkRateLimit,
    isValidRedirectURL 
} = require('./utils/security');

// Environment variables
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// 環境変数の検証
if (!LINE_CHANNEL_ID || !LINE_CHANNEL_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing required environment variables');
}

// Initialize Supabase client with service key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 許可されたリダイレクトドメイン
const ALLOWED_REDIRECT_DOMAINS = process.env.ALLOWED_DOMAINS ? 
    process.env.ALLOWED_DOMAINS.split(',') : 
    ['localhost', 'netlify.app'];

exports.handler = asyncHandler(async (event, context) => {
    // リクエストの検証
    const validation = validateRequest(event, ['code', 'redirect_uri']);
    if (!validation.valid) {
        if (validation.response) {
            return validation.response; // OPTIONS response
        }
        throw new ValidationError(validation.error.message);
    }

    const { code, redirect_uri } = validation.body;

    // レート制限チェック
    const clientIP = getClientIP(event);
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
        throw new APIError('Too many requests', 429, {
            retryAfter: rateLimitResult.retryAfter
        });
    }

    // リダイレクトURLの検証
    if (!isValidRedirectURL(redirect_uri, ALLOWED_REDIRECT_DOMAINS)) {
        throw new ValidationError('Invalid redirect URI');
    }


        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
                client_id: LINE_CHANNEL_ID,
                client_secret: LINE_CHANNEL_SECRET
            })
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();
            console.error('LINE token exchange error:', error);
            throw new AuthenticationError('Failed to exchange LINE token');
        }

        const tokenData = await tokenResponse.json();
        const { access_token, id_token } = tokenData;

        // Verify ID token
        const verifyResponse = await fetch('https://api.line.me/oauth2/v2.1/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                id_token: id_token,
                client_id: LINE_CHANNEL_ID
            })
        });

        if (!verifyResponse.ok) {
            throw new AuthenticationError('Invalid LINE ID token');
        }

        const idTokenData = await verifyResponse.json();

        // Get user profile
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (!profileResponse.ok) {
            throw new APIError('Failed to get LINE user profile', 500);
        }

        const profile = await profileResponse.json();

        // Check if user already exists in Supabase
        const { data: existingProfile, error: searchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('line_user_id', profile.userId)
            .single();

        let userProfile;

        if (existingProfile) {
            // Update existing user profile
            const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({
                    display_name: profile.displayName,
                    picture_url: profile.pictureUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('line_user_id', profile.userId)
                .select()
                .single();

            if (updateError) {
                console.error('Profile update error:', updateError);
                throw new APIError('Failed to update user profile', 500, { error: updateError.message });
            }

            userProfile = updatedProfile;
        } else {
            // Create new user
            const email = idTokenData.email || `${profile.userId}@line.local`;
            
            // First create auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: email,
                email_confirm: true,
                user_metadata: {
                    provider: 'line',
                    line_user_id: profile.userId,
                    display_name: profile.displayName,
                    picture_url: profile.pictureUrl
                }
            });

            if (authError) {
                console.error('Auth user creation error:', authError);
                throw new APIError('Failed to create user', 500, { error: authError.message });
            }

            // The profile will be created automatically by the trigger,
            // but we need to get it to return to the client
            const { data: newProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !newProfile) {
                console.error('Profile retrieval error:', profileError);
                // Clean up auth user if profile wasn't created
                await supabase.auth.admin.deleteUser(authData.user.id);
                throw new APIError('Failed to create user profile', 500, { error: profileError?.message });
            }

            userProfile = newProfile;
        }

        // Generate Supabase session
        const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: userProfile.email,
            options: {
                redirectTo: `${process.env.URL}/dashboard.html`
            }
        });

        if (sessionError) {
            console.error('Session generation error:', sessionError);
            throw new APIError('Failed to create session', 500, { error: sessionError.message });
        }

        // Return user data and session
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                user: {
                    id: userProfile.id,
                    email: userProfile.email,
                    display_name: userProfile.display_name,
                    picture_url: userProfile.picture_url
                },
                session_url: session.properties.action_link
            })
        };
});