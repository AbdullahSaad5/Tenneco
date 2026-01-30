/**
 * Seed Languages Script
 *
 * This script adds initial languages (English and Italian) to the Payload CMS
 * Run with: npx tsx scripts/seedLanguages.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
  isEnabled: boolean;
  order: number;
}

const INITIAL_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isDefault: true,
    isEnabled: true,
    order: 1,
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    isDefault: false,
    isEnabled: true,
    order: 2,
  },
];

async function seedLanguages() {
  console.log('🌍 Starting language seeding...\n');

  for (const language of INITIAL_LANGUAGES) {
    try {
      console.log(`Adding language: ${language.name} (${language.code})...`);

      const response = await fetch(`${API_URL}/languages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(language),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${language.name} added successfully (ID: ${data.doc?.id || 'unknown'})\n`);
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to add ${language.name}: ${response.status} - ${errorText}\n`);
      }
    } catch (error) {
      console.error(`❌ Error adding ${language.name}:`, error, '\n');
    }
  }

  console.log('🎉 Language seeding complete!');
  console.log('\nYou can now see the language switcher on your homepage.');
  console.log('To add more languages, visit: https://tenneco-admin.vercel.app/admin/collections/languages\n');
}

// Run the seed function
seedLanguages().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
