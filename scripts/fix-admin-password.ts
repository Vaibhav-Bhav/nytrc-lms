import { hashPassword } from '../src/lib/password'

async function generate() {
  // Using a compliant password with an uppercase letter and numbers
  const newPassword = 'Admin123!' 
  const hash = await hashPassword(newPassword)
  
  console.log('\n✅ Your new secure password hash is:\n')
  console.log(hash)
  console.log('\n📋 Copy the string above and paste it into the password_hash column in Supabase.')
}

generate()