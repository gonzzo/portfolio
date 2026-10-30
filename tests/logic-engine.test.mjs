import test from 'node:test';
import assert from 'node:assert/strict';
import { GATES, LEVELS, combinations, evaluate, checkCircuit } from '../logic-engine.js';

const binaryRows = [[false,false],[false,true],[true,false],[true,true]];
for (const [name, expected] of Object.entries({ AND:[false,false,false,true], OR:[false,true,true,true], XOR:[false,true,true,false], NAND:[true,true,true,false] })) {
  test(`${name}: all four input combinations`, () => {
    assert.deepEqual(binaryRows.map((args) => Boolean(GATES[name].run(...args))), expected);
  });
}
test('NOT and BUF distinguish inversion and pass-through', () => {
  assert.deepEqual([false,true].map(GATES.NOT.run), [true,false]);
  assert.deepEqual([false,true].map(GATES.BUF.run), [false,true]);
});
test('input combinations are complete and ordered', () => {
  assert.equal(combinations(['A','B','C']).length, 8);
  assert.deepEqual(combinations(['A','B']), [{A:false,B:false},{A:false,B:true},{A:true,B:false},{A:true,B:true}]);
});
test('missing and incompatible gates propagate an unknown output', () => {
  const level = LEVELS[3];
  const input = {A:true,B:true};
  assert.equal(evaluate(level, {}, input).output, null);
  assert.equal(evaluate(level, {G1:'NOT',G2:'BUF'}, input).output, null);
  assert.equal(evaluate(level, {G1:'AND',G2:'OR'}, input).output, null);
  assert.ok(checkCircuit(level, {}).every((row) => !row.pass));
});
const solutions = [ ['AND'],['XOR'],['NAND'],['AND','NOT'],['OR','AND'],['XOR','XOR'],['AND','AND','OR'],['AND','XOR','AND','OR'] ];
for (const [index, level] of LEVELS.entries()) {
  test(`chamber ${index + 1}: known solution satisfies every target row`, () => {
    const placements = Object.fromEntries(level.nodes.map((node, i) => [node.id, solutions[index][i]]));
    for (const node of level.nodes) assert.ok(level.choices.includes(placements[node.id]));
    const rows = checkCircuit(level, placements);
    assert.equal(rows.length, 2 ** level.inputs.length);
    assert.ok(rows.every((row) => row.pass));
    assert.ok(rows.some((row) => row.target));
    assert.ok(rows.some((row) => !row.target));
  });
}
test('one matching sample cannot win an incorrect circuit', () => {
  const rows = checkCircuit(LEVELS[0], {G1:'OR'});
  assert.equal(rows.filter((row) => row.pass).length, 2);
  assert.equal(rows.filter((row) => !row.pass).length, 2);
});
