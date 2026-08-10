import 'dotenv/config' // <-- This is the missing magic line!
import { supabase } from '../src/lib/supabase'
import { hashPassword } from '../src/lib/password'

async function seedStudents() {
    console.log('🚀 Starting Student Seeding Process...')

    const standardPassword = 'Student123!'
    console.log(`⏳ Generating cryptographic hash for password: ${standardPassword}`)
    const hashedPassword = await hashPassword(standardPassword)

    // We will use the names from the prototype UI so it looks familiar!
    const students = [
        { email: 'sarah.chen@example.com', name: 'Sarah Chen', role: 'student', password_hash: hashedPassword, is_active: true },
        { email: 'ananya.k@example.com', name: 'Ananya Krishnan', role: 'student', password_hash: hashedPassword, is_active: true },
        { email: 'diego.r@example.com', name: 'Diego Ramirez', role: 'student', password_hash: hashedPassword, is_active: true },
        { email: 'fatima.a@example.com', name: 'Fatima Al-Hassan', role: 'student', password_hash: hashedPassword, is_active: true },
        { email: 'yuki.t@example.com', name: 'Yuki Tanaka', role: 'student', password_hash: hashedPassword, is_active: true }
    ]

    console.log('⏳ Inserting 5 students into Supabase...')
    const { error } = await supabase.from('users').insert(students)

    if (error) {
        console.error('\n❌ Failed to seed students:', error.message)
    } else {
        console.log('\n✅ SUCCESS! 5 student accounts created.')
        console.log('🔑 You can now log into any of them using the password: Student123!')
    }
}

seedStudents()