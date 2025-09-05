#!/usr/bin/env node

/**
 * Test script to verify contact message deletion functionality
 * Tests all three data sources: database, file, and mock
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testDeleteMessages() {
  console.log('🧪 Testing Contact Message Deletion Functionality\n');

  // Test 1: Mock API
  console.log('1️⃣ Testing Mock API...');
  try {
    const mockResponse = await fetch(`${BASE_URL}/api/admin/contact-messages-mock`);
    if (mockResponse.ok) {
      const mockData = await mockResponse.json();
      console.log(`   ✅ Mock API accessible - ${mockData.messages?.length || 0} messages found`);
      
      if (mockData.messages && mockData.messages.length > 0) {
        const testMessage = mockData.messages[0];
        console.log(`   🗑️  Testing deletion of message: ${testMessage.id}`);
        
        const deleteResponse = await fetch(`${BASE_URL}/api/admin/contact-messages-mock`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: testMessage.id }),
        });
        
        if (deleteResponse.ok) {
          console.log('   ✅ Mock API deletion successful');
        } else {
          console.log('   ❌ Mock API deletion failed:', await deleteResponse.text());
        }
      }
    } else {
      console.log('   ❌ Mock API not accessible');
    }
  } catch (error) {
    console.log('   ❌ Mock API error:', error.message);
  }

  // Test 2: File API
  console.log('\n2️⃣ Testing File API...');
  try {
    const fileResponse = await fetch(`${BASE_URL}/api/admin/contact-messages-file`);
    if (fileResponse.ok) {
      const fileData = await fileResponse.json();
      console.log(`   ✅ File API accessible - ${fileData.messages?.length || 0} messages found`);
      
      if (fileData.messages && fileData.messages.length > 0) {
        const testMessage = fileData.messages[0];
        console.log(`   🗑️  Testing deletion of message: ${testMessage.id}`);
        
        const deleteResponse = await fetch(`${BASE_URL}/api/admin/contact-messages-file`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: testMessage.id }),
        });
        
        if (deleteResponse.ok) {
          console.log('   ✅ File API deletion successful');
        } else {
          console.log('   ❌ File API deletion failed:', await deleteResponse.text());
        }
      }
    } else {
      console.log('   ❌ File API not accessible');
    }
  } catch (error) {
    console.log('   ❌ File API error:', error.message);
  }

  // Test 3: Database API (Public)
  console.log('\n3️⃣ Testing Database API (Public)...');
  try {
    const dbResponse = await fetch(`${BASE_URL}/api/contact-messages-public`);
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log(`   ✅ Database API accessible - ${dbData.messages?.length || 0} messages found`);
      
      if (dbData.messages && dbData.messages.length > 0) {
        const testMessage = dbData.messages[0];
        console.log(`   🗑️  Testing deletion of message: ${testMessage.id}`);
        
        const deleteResponse = await fetch(`${BASE_URL}/api/contact-messages-public?id=${testMessage.id}`, {
          method: 'DELETE',
        });
        
        if (deleteResponse.ok) {
          console.log('   ✅ Database API deletion successful');
        } else {
          console.log('   ❌ Database API deletion failed:', await deleteResponse.text());
        }
      }
    } else {
      console.log('   ❌ Database API not accessible');
    }
  } catch (error) {
    console.log('   ❌ Database API error:', error.message);
  }

  // Test 4: Admin Database API
  console.log('\n4️⃣ Testing Admin Database API...');
  try {
    const adminResponse = await fetch(`${BASE_URL}/api/admin/contact-messages`);
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log(`   ✅ Admin API accessible - ${adminData.messages?.length || 0} messages found`);
      
      if (adminData.messages && adminData.messages.length > 0) {
        const testMessage = adminData.messages[0];
        console.log(`   🗑️  Testing deletion of message: ${testMessage.id}`);
        
        const deleteResponse = await fetch(`${BASE_URL}/api/admin/contact-messages?id=${testMessage.id}`, {
          method: 'DELETE',
        });
        
        if (deleteResponse.ok) {
          console.log('   ✅ Admin API deletion successful');
        } else {
          console.log('   ❌ Admin API deletion failed:', await deleteResponse.text());
        }
      }
    } else {
      console.log('   ❌ Admin API not accessible');
    }
  } catch (error) {
    console.log('   ❌ Admin API error:', error.message);
  }

  console.log('\n✨ Test completed!');
}

// Run the test
testDeleteMessages().catch(console.error);
