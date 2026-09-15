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

  // 3. Verify Set Creation and Day-Based AA999 IDs
  const day1 = new Date('2026-09-14T10:00:00Z');
  const day2 = new Date('2026-09-15T10:00:00Z');

  const id1 = storage.generateDayBasedId(day1, []);
  assert.strictEqual(id1, 'AA001', 'First record on Day 1 should be AA001');

  const setWithId1 = {
    id: 'test-set-1',
    name: 'Vocabulary 101',
    folderName: 'Vocabulary 101',
    createdAt: day1.toISOString(),
    modifiedAt: day1.toISOString(),
    records: [
      {
        id: 'rec-101',
        shortId: id1,
        title: 'Ephemeral',
        description: 'Lasting for a very short time.',
        tags: ['Adjective', 'Gre'],
        imageFileName: null,
        createdAt: day1.toISOString(),
        modifiedAt: day1.toISOString(),
        sortOrder: 0
      }
    ]
  };

  const id2 = storage.generateDayBasedId(day1, [setWithId1]);
  assert.strictEqual(id2, 'AA002', 'Second record on Day 1 should be AA002');

  const idDay2 = storage.generateDayBasedId(day2, [setWithId1]);
  assert.strictEqual(idDay2, 'AB001', 'First record on Day 2 should be AB001');

  storage.saveSet(setWithId1);
  const loadedSets = storage.loadAllSets();
  const foundSet = loadedSets.find(s => s.id === 'test-set-1');
  assert.ok(foundSet, 'Created set must be found');
  assert.strictEqual(foundSet.records[0].shortId, 'AA001');
  console.log('✓ AA999 day-based sequential ID generation verified (AA001, AA002, AB001)');

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
  const renamed = storage.renameSet(setWithId1, 'Advanced Vocabulary');
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
