const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Load the app's pure TypeScript modules without introducing a test framework.
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  if (request.startsWith('@/')) request = path.resolve(__dirname, '../src', request.slice(2));
  return originalResolve.call(this, request, ...args);
};
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  module._compile(result.outputText, filename);
};
require.extensions['.jpg'] = (module, filename) => { module.exports = filename; };
require.extensions['.png'] = (module, filename) => { module.exports = filename; };

test('saved profile updates notify consumers and partner matching uses the new profile', async () => {
  const service = require('../src/services/profile-service.ts');
  const { toPartnerMember } = require('../src/logic/partner-profile.ts');
  const before = service.getProfileSnapshot();
  let notifications = 0;
  const unsubscribe = service.subscribeProfile(() => notifications++);
  const changed = { ...before, homeBranchId: 'branch-002', fitnessLevel: 'Advanced', scheduleFrom: '08:00', scheduleDays: ['Mon'] };
  try {
    await service.saveProfile(changed);
    const member = toPartnerMember(service.getProfileSnapshot());
    assert.equal(member.id, before.id);
    assert.equal(member.branchId, 'branch-002');
    assert.equal(member.fitnessLevel, 'Advanced');
    assert.equal(member.schedule.preferredTime, 'Morning');
    assert.deepEqual(member.schedule.days, ['Monday']);
    assert.equal(notifications, 1);
    unsubscribe();
    await service.saveProfile(before);
    assert.equal(notifications, 1);
  } finally { unsubscribe(); await service.saveProfile(before); }
});

test('session repositories support successive updates and unsubscribe correctly', () => {
  const { createSessionStore } = require('../src/services/session-store.ts');
  let initializations = 0;
  const store = createSessionStore(() => { initializations++; return []; });
  assert.equal(store.getSnapshot(), store.getSnapshot());
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  store.update(items => [...items, 'first']);
  store.update(items => [...items, 'second']);
  assert.deepEqual(store.getSnapshot(), ['first', 'second']);
  assert.equal(initializations, 1);
  assert.equal(notifications, 2);
  unsubscribe();
  store.update([]);
  assert.equal(notifications, 2);
});

test('spotting requires restored attendance and expires only pending requests', () => {
  const { canUseSpotting, expireSpottingRequests } = require('../src/logic/spotting.ts');
  assert.equal(canUseSpotting(false, 'branch-001'), false);
  assert.equal(canUseSpotting(true, undefined), false);
  assert.equal(canUseSpotting(true, 'branch-001'), true);
  const requests = [
    { id: 'pending', status: 'pending', expiresAt: 120000 },
    { id: 'accepted', status: 'accepted', expiresAt: 120000 },
  ];
  assert.equal(expireSpottingRequests(requests, 119999), requests);
  const expired = expireSpottingRequests(requests, 120000);
  assert.equal(expired[0].status, 'expired');
  assert.equal(expired[1].status, 'accepted');
  assert.equal(requests[0].status, 'pending');
});

test('partner compatibility changes with saved preferences', () => {
  const { toPartnerMember } = require('../src/logic/partner-profile.ts');
  const { calculateCompatibility } = require('../src/logic/partner-matching.ts');
  const { mockUser } = require('../src/data/mock-user.ts');
  const current = toPartnerMember(mockUser);
  assert.equal(calculateCompatibility(current, current), 100);
  const changed = { ...current, trainingStyles: ['Cardio'], fitnessLevel: 'Beginner', schedule: { days: [], preferredTime: 'Morning' } };
  assert.ok(calculateCompatibility(current, changed) < 100);
});

test('member and admin share inventory; reports do not overwrite official status', async () => {
  const equipment = require('../src/services/equipment-service.ts');
  const reports = require('../src/services/equipment-report-service.ts');
  const item = (await equipment.listEquipment('branch-001'))[0];
  const changed = { ...item, station: 'Shared test station' };
  try {
    await equipment.saveEquipment(changed);
    assert.equal((await equipment.getEquipment(item.id)).station, changed.station);
    await reports.submitEquipmentReport({ equipmentId: item.id, reportedStatus: 'Available', note: 'Demo observation' });
    assert.equal((await reports.listEquipmentReports(item.id)).length, 1);
    assert.equal((await equipment.getEquipment(item.id)).status, item.status);
    await assert.rejects(reports.submitEquipmentReport({ equipmentId: 'missing', reportedStatus: 'Available' }));
  } finally { await equipment.saveEquipment(item); }
});
