import 'dotenv/config'
import { supabase } from '../src/lib/supabase'

async function testApi() {
    console.log('🚀 Starting API HTTP Test...\n')

    try {
        // 1. Get our Admin User
        const { data: admin, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .single()

        if (userError || !admin) {
            throw new Error('Admin user not found. Run the previous DB test first.')
        }

        // 2. Generate a fake session token and insert it into the database
        // This allows authService.getCurrentUser(token) to succeed!
        const fakeToken = 'test_token_' + Math.random().toString(36).substring(2)
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1 hour from now

        const { error: sessionError } = await supabase.from('sessions').insert({
            user_id: admin.id,
            token: fakeToken,
            expires_at: expiresAt,
            is_active: true
        })

        if (sessionError) {
            throw new Error(`Failed to create session: ${sessionError.message}`)
        }
        console.log(`✅ Forged Admin Session Token: ${fakeToken}`)

        // 3. Fire the HTTP POST request to the API
        // Make sure your dev server is running! (Change port to 5173 if needed)
        const apiUrl = 'http://localhost:3000/api/admin/courses'
        console.log(`\n⏳ Firing POST request to ${apiUrl}...`)

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Injecting the token exactly where auth.ts looks for it
                'Authorization': `Bearer ${fakeToken}`
            },
            body: JSON.stringify({
                title: 'API Route Masterclass',
                description: 'Created over HTTP, securely bypassing the middleware!',
                created_by: admin.id,
                status: 'draft',
                price: 1999
            })
        })

        const json = await response.json()

        console.log(`\n📡 HTTP Status Code: ${response.status}`)
        console.log('📦 Response Body:')
        console.log(json)

        if (response.status === 201) {
            console.log('\n🎉 SUCCESS! The middleware accepted the token and the API created the course.')
        } else {
            console.log('\n❌ FAILED. The API rejected the request.')
        }

    } catch (error) {
        console.error('\n❌ Test Script Failed:', error)
    }
}

testApi()