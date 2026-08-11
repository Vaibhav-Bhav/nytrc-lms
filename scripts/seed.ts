// scripts/seed.ts
//
// Comprehensive database seed script.
// Run with:  npx tsx scripts/seed.ts
//
// Pre-requisites:
//   - .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
//   - At least 1 admin user in the users table (for created_by on courses)
//   - At least 1 student user in the users table (for enrollment simulation)
//     (run `npx tsx scripts/seed-students.ts` first if needed)

import 'dotenv/config'
import { supabase } from '../src/lib/supabase'

// ─── Helpers ────────────────────────────────────────────────────────────────

function fakeRazorpayOrderId() {
  return `order_SEED${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function fakeRazorpayPaymentId() {
  return `pay_SEED${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function invoiceNumber(index: number) {
  return `NYTRC-SEED-${String(index + 1).padStart(4, '0')}`
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 ─── NYTRC Database Seeder ───\n')

  // ────────────────────────────────────────────────────────────────────────
  // Step 1: Fetch existing users
  // ────────────────────────────────────────────────────────────────────────
  console.log('📋 Step 1: Fetching existing users...')

  const { data: adminRows, error: adminErr } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'admin')
    .limit(1)

  if (adminErr) throw new Error(`Failed to fetch admins: ${adminErr.message}`)
  if (!adminRows || adminRows.length === 0) {
    throw new Error('❌ No admin user found. Create an admin user first.')
  }
  const adminId = adminRows[0].id
  console.log(`   ✅ Admin: ${adminRows[0].name} (${adminRows[0].email})`)

  const { data: studentRows, error: studentErr } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'student')
    .limit(3)

  if (studentErr) throw new Error(`Failed to fetch students: ${studentErr.message}`)
  if (!studentRows || studentRows.length === 0) {
    throw new Error('❌ No student users found. Run `npx tsx scripts/seed-students.ts` first.')
  }
  console.log(`   ✅ Found ${studentRows.length} student(s): ${studentRows.map(s => s.name).join(', ')}\n`)

  // ────────────────────────────────────────────────────────────────────────
  // Step 2: Create 3 Courses
  // ────────────────────────────────────────────────────────────────────────
  console.log('📚 Step 2: Creating courses...')

  const courseDefs = [
    { title: 'React & Next.js Mastery', description: 'Master modern React patterns, Server Components, App Router, and full-stack Next.js development from scratch to production.', price: 4999, status: 'published' },
    { title: 'Python for Data Science', description: 'Learn Python programming with NumPy, Pandas, Matplotlib, and scikit-learn. Build real-world data pipelines and ML models.', price: 2499, status: 'published' },
    { title: 'Advanced UI/UX Principles', description: 'Deep dive into design systems, micro-interactions, accessibility best practices, and user research methodologies.', price: 999, status: 'draft' },
  ]

  const courses: { id: string; title: string; status: string; price: number }[] = []
  for (const def of courseDefs) {
    const { data: row, error } = await supabase
      .from('courses')
      .insert({ ...def, created_by: adminId })
      .select('id, title, status, price')
      .single()

    if (error) throw new Error(`Failed to create course "${def.title}": ${error.message}`)
    courses.push(row)
    console.log(`   ✅ Created: "${row.title}" (${row.status}, ₹${row.price})`)
  }
  console.log('')

  // ────────────────────────────────────────────────────────────────────────
  // Step 3: Create Sections & Lessons for published courses
  // ────────────────────────────────────────────────────────────────────────
  console.log('📖 Step 3: Creating curriculum (sections & lessons)...')

  const publishedCourses = courses.filter(c => c.status === 'published')

  const curriculumDefs: Record<string, { sections: { title: string; lessons: { title: string; description: string; video_id?: string; pdf_url?: string }[] }[] }> = {
    'React & Next.js Mastery': {
      sections: [
        {
          title: 'Foundations of React',
          lessons: [
            { title: 'Introduction to React & JSX', description: 'Learn the core building blocks of React: components, JSX syntax, and the virtual DOM.', video_id: 'react-intro-001' },
            { title: 'State Management with Hooks', description: 'Master useState, useEffect, and custom hooks for effective state management.', video_id: 'react-hooks-002' },
          ],
        },
        {
          title: 'Next.js App Router',
          lessons: [
            { title: 'Server Components Deep Dive', description: 'Understand how React Server Components work and when to use them.', video_id: 'nextjs-rsc-003' },
            { title: 'API Routes & Data Fetching Cheat Sheet', description: 'A comprehensive reference for all data fetching strategies in Next.js.', pdf_url: 'https://example.com/nextjs-cheatsheet.pdf' },
          ],
        },
      ],
    },
    'Python for Data Science': {
      sections: [
        {
          title: 'Python Fundamentals',
          lessons: [
            { title: 'Variables, Types & Control Flow', description: 'Get started with Python basics — variables, data types, loops, and conditionals.', video_id: 'python-basics-001' },
            { title: 'Functions & Modules', description: 'Write reusable code with functions, modules, and packages.', video_id: 'python-functions-002' },
          ],
        },
        {
          title: 'Data Analysis with Pandas',
          lessons: [
            { title: 'DataFrames & Series', description: 'Learn the core Pandas data structures for tabular data analysis.', video_id: 'pandas-df-003' },
            { title: 'Pandas Quick Reference Guide', description: 'A downloadable PDF with common Pandas operations and syntax.', pdf_url: 'https://example.com/pandas-reference.pdf' },
          ],
        },
      ],
    },
  }

  // Track all created lesson IDs grouped by course for progress seeding later
  const courseLessons: Record<string, string[]> = {}

  for (const course of publishedCourses) {
    const curriculum = curriculumDefs[course.title]
    if (!curriculum) continue

    courseLessons[course.id] = []

    for (let si = 0; si < curriculum.sections.length; si++) {
      const secDef = curriculum.sections[si]

      const { data: section, error: secErr } = await supabase
        .from('sections')
        .insert({ course_id: course.id, title: secDef.title, order_number: si })
        .select('id, title')
        .single()

      if (secErr) throw new Error(`Failed to create section "${secDef.title}": ${secErr.message}`)
      console.log(`   📁 Section: "${section.title}" → Course: "${course.title}"`)

      for (let li = 0; li < secDef.lessons.length; li++) {
        const lessonDef = secDef.lessons[li]

        const { data: lesson, error: lesErr } = await supabase
          .from('lessons')
          .insert({
            section_id: section.id,
            title: lessonDef.title,
            description: lessonDef.description,
            video_id: lessonDef.video_id ?? null,
            pdf_url: lessonDef.pdf_url ?? null,
            allow_download: !!lessonDef.pdf_url,
            lesson_order: li,
            status: 'published',
          })
          .select('id, title')
          .single()

        if (lesErr) throw new Error(`Failed to create lesson "${lessonDef.title}": ${lesErr.message}`)
        courseLessons[course.id].push(lesson.id)
        const icon = lessonDef.video_id ? '🎥' : '📄'
        console.log(`      ${icon} Lesson: "${lesson.title}"`)
      }
    }
  }
  console.log('')

  // ────────────────────────────────────────────────────────────────────────
  // Step 4: Simulate Purchases (Payments & Invoices) for Course 1
  // ────────────────────────────────────────────────────────────────────────
  console.log('💳 Step 4: Simulating purchases for "React & Next.js Mastery"...')

  const reactCourse = courses[0]
  const paymentIds: { studentId: string; paymentId: string }[] = []
  let invoiceIdx = 0

  for (const student of studentRows) {
    // Create payment
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({
        student_id: student.id,
        course_id: reactCourse.id,
        razorpay_order_id: fakeRazorpayOrderId(),
        razorpay_payment_id: fakeRazorpayPaymentId(),
        payment_status: 'success',
        amount_paid: reactCourse.price,
        currency: 'INR',
        gst_state: 'Maharashtra',
      })
      .select('id')
      .single()

    if (payErr) throw new Error(`Failed to create payment for ${student.name}: ${payErr.message}`)
    paymentIds.push({ studentId: student.id, paymentId: payment.id })
    console.log(`   ✅ Payment created for ${student.name} → ₹${reactCourse.price}`)

    // Create invoice linked to payment
    const baseAmount = reactCourse.price / 1.18 // reverse-calculate base from 18% GST
    const gstAmount = reactCourse.price - baseAmount

    const { error: invErr } = await supabase
      .from('invoices')
      .insert({
        payment_id: payment.id,
        invoice_number: invoiceNumber(invoiceIdx),
        invoice_status: 'generated',
        base_amount: Math.round(baseAmount * 100) / 100,
        gst_amount: Math.round(gstAmount * 100) / 100,
        gst_rate: 0.18,
        total_amount: reactCourse.price,
      })

    if (invErr) throw new Error(`Failed to create invoice for ${student.name}: ${invErr.message}`)
    console.log(`   🧾 Invoice ${invoiceNumber(invoiceIdx)} generated`)
    invoiceIdx++
  }
  console.log('')

  // ────────────────────────────────────────────────────────────────────────
  // Step 5: Grant Course Access
  // ────────────────────────────────────────────────────────────────────────
  console.log('🔑 Step 5: Granting course access...')

  for (const { studentId, paymentId } of paymentIds) {
    const studentName = studentRows.find(s => s.id === studentId)?.name || studentId

    const { error: accessErr } = await supabase
      .from('course_access')
      .insert({
        student_id: studentId,
        course_id: reactCourse.id,
        payment_id: paymentId,
        access_status: 'active',
      })

    if (accessErr) throw new Error(`Failed to grant access for ${studentName}: ${accessErr.message}`)
    console.log(`   ✅ Access granted: ${studentName} → "${reactCourse.title}"`)
  }
  console.log('')

  // ────────────────────────────────────────────────────────────────────────
  // Step 6: Seed Progress Records
  // ────────────────────────────────────────────────────────────────────────
  console.log('📊 Step 6: Seeding lesson progress...')

  const reactLessons = courseLessons[reactCourse.id] || []
  const totalLessons = reactLessons.length

  if (totalLessons === 0) {
    console.log('   ⚠️  No lessons found for React course — skipping progress.')
  } else {
    for (let si = 0; si < studentRows.length; si++) {
      const student = studentRows[si]

      // Vary completion: student 0 → 50%, student 1 → 25%, student 2 → 75%
      const completionRatios = [0.5, 0.25, 0.75]
      const ratio = completionRatios[si % completionRatios.length]
      const lessonsToComplete = Math.max(1, Math.round(totalLessons * ratio))

      for (let li = 0; li < totalLessons; li++) {
        const completed = li < lessonsToComplete
        const now = new Date().toISOString()

        const { error: progErr } = await supabase
          .from('progress')
          .insert({
            student_id: student.id,
            lesson_id: reactLessons[li],
            video_progress_seconds: completed ? 600 : Math.floor(Math.random() * 120),
            document_progress_page: 0,
            completed,
            completed_at: completed ? now : null,
          })

        if (progErr) {
          console.warn(`   ⚠️  Progress insert failed for ${student.name}, lesson ${li}: ${progErr.message}`)
        }
      }

      const pct = Math.round((lessonsToComplete / totalLessons) * 100)
      console.log(`   ✅ ${student.name}: ${lessonsToComplete}/${totalLessons} lessons completed (${pct}%)`)
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Done!
  // ────────────────────────────────────────────────────────────────────────
  console.log('\n🎉 ─── Seed completed successfully! ───')
  console.log(`   📚 ${courses.length} courses created`)
  console.log(`   📖 ${Object.values(courseLessons).flat().length} lessons across ${publishedCourses.length} published courses`)
  console.log(`   💳 ${paymentIds.length} payments + invoices generated`)
  console.log(`   🔑 ${paymentIds.length} course access grants`)
  console.log(`   📊 Progress seeded for ${studentRows.length} student(s)\n`)
}

// ─── Execute ────────────────────────────────────────────────────────────────

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message || err)
  process.exit(1)
})
