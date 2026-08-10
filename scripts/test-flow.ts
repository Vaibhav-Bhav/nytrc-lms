import 'dotenv/config' // Loads your .env variables
import { supabase } from '../src/lib/supabase'
import { courseRepository } from '../src/repositories/course'
import { sectionRepository } from '../src/repositories/section'
import { lessonRepository } from '../src/repositories/lesson'

async function runTest() {
    console.log('🚀 Starting Supabase Repository Integration Test...\n')

    try {
        // Step 1: Find a valid Admin user to satisfy the foreign key constraint
        console.log('⏳ 1. Fetching Admin User...')
        const { data: admin, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .limit(1)
            .maybeSingle()

        if (userError || !admin) {
            console.error('❌ No admin user found in the database.')
            console.log('💡 TIP: Run the SQL Seed script at the bottom of your course.ts file in the Supabase SQL Editor to create your first admin user.')
            return
        }
        console.log(`✅ Admin User Found: ${admin.id}\n`)

        // Step 2: Create a Course
        console.log('⏳ 2. Creating Course...')
        const course = await courseRepository.create({
            title: 'Integration Testing Masterclass',
            description: 'Verifying the Phase 3 backend flow.',
            created_by: admin.id,
            status: 'draft',
            price: 0
        })
        console.log(`✅ Course Created: ${course.id}\n`)

        // Step 3: Create a Section inside the Course
        console.log('⏳ 3. Creating Section...')
        const section = await sectionRepository.create({
            course_id: course.id,
            title: 'Module 1: The Database Layer',
        })
        console.log(`✅ Section Created: ${section.id} (Order: ${section.order_number})\n`)

        // Step 4: Create a Lesson inside the Section
        console.log('⏳ 4. Creating Lesson...')
        const lesson = await lessonRepository.create({
            section_id: section.id,
            title: 'Connecting to Supabase',
            allow_download: true,
            status: 'draft'
        })
        console.log(`✅ Lesson Created: ${lesson.id} (Order: ${lesson.lesson_order})\n`)

        console.log('🎉 Flow Test Complete! Everything is working perfectly.')
        console.log('👉 Head over to your Supabase Dashboard to see the new rows in your tables!')

    } catch (error) {
        console.error('\n❌ Test Failed with error:', error)
    }
}

runTest()