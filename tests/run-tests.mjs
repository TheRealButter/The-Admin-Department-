import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import {
  SYSTEMS,
  ID_KEY,
  buildProductionScaleDataset,
  expectedFailIds,
  assertSanitizedDataset
} from './fixtures/sanitized-production-scale-data.mjs';

process.env.NODE_ENV = 'production';

const code = readFileSync(new URL('../app/assets/engine.js', import.meta.url), 'utf8');
const context = { console, globalThis: {} };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(code, context);
const E = context.AdminEngine;

const expectedFails = {
  invoice: ['INV-008', 'INV-009', 'INV-010'],
  sales: ['LEAD-008', 'LEAD-009', 'LEAD-010'],
  client: ['ONB-008', 'ONB-009', 'ONB-010'],
  property: ['PROP-008', 'PROP-009', 'PROP-010'],
  practice: ['PRAC-008', 'PRAC-009', 'PRAC-010'],
  member: ['MEM-008', 'MEM-009', 'MEM-010']
};

const requiredRoutes = [
  '../index.html',
  '../admin-systems.html',
  '../app/index.html',
  '../app/invoice-admin/index.html',
  '../app/sales-admin/index.html',
  '../app/client-admin/index.html',
  '../app/property-admin/index.html',
  '../app/practice-admin/index.html',
  '../app/member-admin/index.html'
];

for (const route of requiredRoutes) {
  assert.equal(existsSync(new URL(route, import.meta.url)), true, `route file exists: ${route}`);
}

for (const system of SYSTEMS) {
  assert.ok(E.systems[system], `${system}: system definition exists`);
  assert.ok(E.systems[system].fields.length >= 10, `${system}: has enough editable fields`);
  assert.ok(E.systems[system].statuses.length >= 8, `${system}: has enough workflow statuses`);

  const records = E.sampleRecords(system);
  const validations = records.map((r) => E.validate(system, r, records));
  const failed = records.filter((_, i) => validations[i].status === 'Fail').map((r) => r[ID_KEY[system]]);
  const passed = records.length - failed.length;
  assert.equal(records.length, 10, `${system}: sample set should contain 10 records`);
  assert.equal(passed, 7, `${system}: should pass 7 records`);
  assert.equal(JSON.stringify(failed), JSON.stringify(expectedFails[system]), `${system}: failing records should match expected blockers`);

  const report = E.report(system, records);
  assert.equal(report.total, 10, `${system}: report total should be 10`);
  assert.equal(report.passed, 7, `${system}: report passed should be 7`);
  assert.equal(report.failed, 3, `${system}: report failed should be 3`);
  const roundTrip = E.parseCSV(E.toCSV(system, records));
  assert.equal(roundTrip.length, records.length, `${system}: CSV round-trip should preserve row count`);
  assert.equal(roundTrip[0][ID_KEY[system]], records[0][ID_KEY[system]], `${system}: CSV round-trip should preserve first ID`);

  const productionRecords = buildProductionScaleDataset(E, system, 240);
  assert.equal(productionRecords.length, 240, `${system}: production-scale fixture has 240 records`);
  assertSanitizedDataset(productionRecords);
  const ids = productionRecords.map((r) => r[ID_KEY[system]]);
  assert.equal(new Set(ids).size, ids.length, `${system}: production-scale fixture IDs are unique`);
  const productionValidations = productionRecords.map((r) => E.validate(system, r, productionRecords));
  const productionFailed = productionRecords.filter((_, i) => productionValidations[i].status === 'Fail').map((r) => r[ID_KEY[system]]);
  assert.equal(JSON.stringify(productionFailed), JSON.stringify(expectedFailIds(system, 240)), `${system}: production-scale failing records are deterministic`);
  const productionReport = E.report(system, productionRecords);
  assert.equal(productionReport.total, 240, `${system}: production report total should be 240`);
  assert.equal(productionReport.passed, 168, `${system}: production report passed should be 168`);
  assert.equal(productionReport.failed, 72, `${system}: production report failed should be 72`);
  const productionRoundTrip = E.parseCSV(E.toCSV(system, productionRecords));
  assert.equal(productionRoundTrip.length, productionRecords.length, `${system}: production CSV round-trip preserves row count`);
  assert.equal(productionRoundTrip[0][ID_KEY[system]], productionRecords[0][ID_KEY[system]], `${system}: production CSV round-trip preserves first ID`);
}

console.log('All Admin HQ inventory and production-scale regression tests passed.');
