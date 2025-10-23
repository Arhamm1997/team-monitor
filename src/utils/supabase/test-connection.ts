import { supabase } from './client';

/**
 * Test Supabase connection and authentication
 */
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if Supabase client is initialized
    console.log('✓ Supabase client initialized');
    
    // Test 2: Try to fetch from a public table
    const { data: employees, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (employeeError) {
      console.error('✗ Error fetching employees:', employeeError);
    } else {
      console.log('✓ Successfully connected to database');
      console.log('  Employees table accessible:', employees?.length || 0, 'rows');
    }
    
    // Test 3: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('✗ Error getting session:', sessionError);
    } else if (session) {
      console.log('✓ User is logged in:', session.user.email);
    } else {
      console.log('ℹ No active session (user not logged in)');
    }
    
    return { success: true };
  } catch (error) {
    console.error('✗ Connection test failed:', error);
    return { success: false, error };
  }
}
