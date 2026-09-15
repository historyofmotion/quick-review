const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const StorageService = require('../src/storage');

async function runTests() {
  console.log('🧪 Starting StorageService test suite...');

  const tempRoot = path.join(os.tmpdir(), `QuickReviewTest_${Date.now()}`);
  const storage = new StorageService(tempRoot);

  // 1. Verify Directory Structure Creation
  assert.strictEqual(fs.existsSync(storage.setsDir), true, 'Sets directory should exist');
  console.log('✓ Directory structure creation verified');

  // 2. Verify Initial Default Set
  const initialSets = storage.loadAllSets();
  assert.strictEqual(initialSets.length >= 1, true, 'Default set should be seeded');
  assert.strictEqual(initialSets[0].name, 'Getting Started');
  console.log('✓ Initial default set verification passed');

  // 3. Verify Set Creation and Persistence
  const newSet = {
    id: 'test-set-1',
    name: 'Vocabulary 101',
    folderName: 'Vocabulary 101',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    records: [
      {
        id: 'rec-101',
        shortId: 'VOC01',
        title: 'Ephemeral',
        description: 'Lasting for a very short time.',
        tags: ['Adjective', 'Gre'],
        imageFileName: null,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        sortOrder: 0
      }
    ]
  };

  storage.saveSet(newSet);
  const loadedSets = storage.loadAllSets();
  const foundSet = loadedSets.find(s => s.id === 'test-set-1');
  assert.ok(foundSet, 'Created set must be found');
  assert.strictEqual(foundSet.records.length, 1);
  assert.strictEqual(foundSet.records[0].title, 'Ephemeral');
  assert.strictEqual(foundSet.records[0].shortId, 'VOC01');
  console.log('✓ Set, Record, and Short ID persistence verified');

  // 4. Verify Image Saving & Deletion
  const dummyImageBuffer = Buffer.from('FakeImageDataContent');
  const savedImageName = storage.saveImage('Vocabulary_101', dummyImageBuffer, 'png');
  assert.ok(savedImageName, 'Image should return a valid filename');

  const savedImagePath = path.join(storage.getSetImagesDirectory('Vocabulary_101'), savedImageName);
  assert.strictEqual(fs.existsSync(savedImagePath), true, 'Saved image file must exist on disk');

  storage.deleteImage('Vocabulary_101', savedImageName);
  assert.strictEqual(fs.existsSync(savedImagePath), false, 'Deleted image file must not exist');
  console.log('✓ Image storage, path resolution, and deletion verified');

  // 5. Verify Set Renaming
  const renamed = storage.renameSet(newSet, 'Advanced Vocabulary');
  assert.strictEqual(renamed.name, 'Advanced Vocabulary');
  assert.strictEqual(renamed.folderName, 'Advanced Vocabulary');
  assert.strictEqual(fs.existsSync(storage.getSetDirectory('Advanced Vocabulary')), true);
  console.log('✓ Set renaming and folder sync verified');

  // 6. Verify Export
  const exportTarget = path.join(tempRoot, 'Exports');
  fs.mkdirSync(exportTarget, { recursive: true });
  const exportedPath = await storage.exportSet(renamed, exportTarget);

  assert.strictEqual(fs.existsSync(exportedPath), true, 'Exported directory should exist');
  assert.strictEqual(fs.existsSync(path.join(exportedPath, `${renamed.name}.md`)), true, 'Markdown export should exist');
  assert.strictEqual(fs.existsSync(path.join(exportedPath, 'set.json')), true, 'JSON export should exist');
  console.log('✓ Set export with Markdown and JSON verified');

  // Cleanup
  fs.rmSync(tempRoot, { recursive: true, force: true });
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
