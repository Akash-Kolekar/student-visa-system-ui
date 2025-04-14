import { Address } from 'viem'

// Common test accounts for easier development and testing
export const testAccounts = {
  // Roles
  verifier: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' as Address,
  university: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65' as Address,
  embassy: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc' as Address,
  admin: '0x976EA74026E726554dB657fA54763abd0C3a0aa9' as Address,
  
  // Students for testing
  student1: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955' as Address,
  student2: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f' as Address,
  
  // Helper function to get role from address
  getRoleFromAddress: (address: string): 'verifier' | 'university' | 'embassy' | 'admin' | 'student' => {
    const lowerAddress = address.toLowerCase();
    
    if (lowerAddress === testAccounts.verifier.toLowerCase()) return 'verifier';
    if (lowerAddress === testAccounts.university.toLowerCase()) return 'university';
    if (lowerAddress === testAccounts.embassy.toLowerCase()) return 'embassy';
    if (lowerAddress === testAccounts.admin.toLowerCase()) return 'admin';
    
    return 'student';
  }
}
