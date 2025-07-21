/**
 * LINE Authentication Backend Function
 * Handles LINE OAuth callback and creates/updates Supabase users
 */

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Environment variables
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Initialize Supabase client with service key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { code, redirect_uri } = JSON.parse(event.body);

        if (!code || !redirect_uri) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required parameters' })
            };
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
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Failed to exchange token' })
            };
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
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid ID token' })
            };
        }

        const idTokenData = await verifyResponse.json();

        // Get user profile
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (!profileResponse.ok) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Failed to get user profile' })
            };
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
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to update profile' })
                };
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
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to create user' })
                };
            }

            // Then create user profile
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: email,
                    line_user_id: profile.userId,
                    display_name: profile.displayName,
                    picture_url: profile.pictureUrl,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) {
                console.error('User profile creation error:', createError);
                // Clean up auth user if profile creation fails
                await supabase.auth.admin.deleteUser(authData.user.id);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to create user profile' })
                };
            }

            user = newUser;
        }

        // Generate Supabase session
        const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: user.email,
            options: {
                redirectTo: `${process.env.URL}/dashboard.html`
            }
        });

        if (sessionError) {
            console.error('Session generation error:', sessionError);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create session' })
            };
        }

        // Return user data and session
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                user: {
                    id: user.id,
                    email: user.email,
                    display_name: user.display_name,
                    picture_url: user.picture_url
                },
                session_url: session.properties.action_link
            })
        };

    } catch (error) {
        console.error('LINE auth error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};