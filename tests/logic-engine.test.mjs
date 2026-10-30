import test from 'node:test';
import assert from 'node:assert/strict';
import { GATES, difficulty, evaluateGate, generateChallenge, createRun, startRun, selectLane, togglePause, advance } from '../logic-engine.js';

function randomGenerator(seed = 142) {
  return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
}
function reachDoor(state, random) {
  const round = state.round;
  for (let i = 0; i < 150 && state.round === round; i++) advance(state, .1, random);
  assert.equal(state.round, round + 1, 'one gate group must resolve exactly once');
}
function nextQuestion(state, random) {
  for (let i = 0; i < 20 && state.phase === 'feedback'; i++) advance(state, .1, random);
  assert.equal(state.phase, 'reading');
}

const binaryRows = [{A:false,B:false},{A:false,B:true},{A:true,B:false},{A:true,B:true}];
for (const [gate, expected] of Object.entries({AND:[0,0,0,1],OR:[0,1,1,1],XOR:[0,1,1,0],NAND:[1,1,1,0],NOR:[1,0,0,0],XNOR:[1,0,0,1]})) {
  test(`${gate} truth table`, () => assert.deepEqual(binaryRows.map((input) => Number(evaluateGate(gate,input))),expected));
}
test('preplaced gates are evaluated before and after the unknown gate', () => {
  assert.equal(evaluateGate('AND',{A:true,B:true},1),false);
  assert.equal(evaluateGate('AND',{A:true,B:false,C:true},2,'OR'),true);
  assert.equal(evaluateGate('OR',{A:false,B:false,C:true},3),false);
  assert.equal(evaluateGate('AND',{A:true,B:false,C:true,D:false},4),false);
});
test('every numbered puzzle has exactly one correct choice, across 2,000 generated circuits', () => {
  const random = randomGenerator();
  for(let round=0;round<100;round++) for(let i=0;i<20;i++) {
    const c=generateChallenge(round,random);
    assert.equal(c.choices.length,3);
    assert.equal(new Set(c.choices).size,3);
    assert.deepEqual(c.choices.filter((name)=>evaluateGate(name,c.input,c.mode,c.fixed)===c.output),[c.target]);
    assert.ok(Object.values(c.input).every((value)=>typeof value==='boolean'));
    assert.equal(c.inputNames.length,round<8?2:round<16?3:4);
    assert.equal(typeof c.output,'boolean');
  }
});
test('difficulty and speed grow, with a bounded minimum reaction time', () => {
  assert.deepEqual([0,4,8,12,16,200].map((round)=>difficulty(round).level),[1,2,3,4,5,5]);
  assert.ok(difficulty(16).travelTime<difficulty(0).travelTime);
  assert.equal(difficulty(10000).travelTime,3.2);
  assert.ok(difficulty(16).readingTime>difficulty(0).readingTime);
});
test('a correct collision scores once and an error removes exactly one life', () => {
  const random=randomGenerator();const state=createRun();startRun(state,random);
  selectLane(state,state.challenge.choices.indexOf(state.challenge.target));
  reachDoor(state,random);
  assert.equal(state.score,100);assert.equal(state.lives,3);assert.equal(state.correct,1);
  advance(state,.1,random);assert.equal(state.score,100);
  nextQuestion(state,random);
  selectLane(state,state.challenge.choices.findIndex((name)=>name!==state.challenge.target));
  reachDoor(state,random);
  assert.equal(state.score,100);assert.equal(state.lives,2);assert.equal(state.streak,0);
  advance(state,.1,random);assert.equal(state.lives,2);
});
test('three mistakes end a run; restart resets play state and retains the best', () => {
  const random=randomGenerator();const state=createRun(700);startRun(state,random);
  for(let i=0;i<3;i++) {
    selectLane(state,state.challenge.choices.findIndex((name)=>name!==state.challenge.target));
    reachDoor(state,random);
    assert.equal(state.lives,2-i);
    if(i<2) { assert.equal(state.status,'running');nextQuestion(state,random); }
  }
  assert.equal(state.status,'over');
  const snapshot=JSON.stringify(state);advance(state,1,random);assert.equal(JSON.stringify(state),snapshot);
  startRun(state,random);
  assert.equal(state.status,'running');assert.equal(state.lives,3);assert.equal(state.score,0);
  assert.equal(state.round,0);assert.equal(state.lane,1);assert.equal(state.best,700);
});
test('an uninterrupted streak reaches all five circuit complexities and updates best score', () => {
  const random=randomGenerator();const state=createRun();startRun(state,random);
  for(let round=0;round<20;round++) {
    selectLane(state,state.challenge.choices.indexOf(state.challenge.target));
    reachDoor(state,random);
    assert.equal(state.outcome.points,100+Math.min(round,4)*25);
    nextQuestion(state,random);
  }
  assert.equal(state.correct,20);assert.equal(state.lives,3);
  assert.equal(state.challenge.mode,4);assert.equal(state.best,state.score);assert.equal(state.score,3750);
});
test('pause freezes time, distance, collisions, and lane input', () => {
  const random=randomGenerator();const state=createRun();startRun(state,random);advance(state,.1,random);
  togglePause(state);const snapshot=JSON.stringify(state);
  advance(state,100,random);assert.equal(JSON.stringify(state),snapshot);
  assert.equal(selectLane(state,0),false);assert.equal(state.lane,1);
  togglePause(state);advance(state,.1,random);assert.ok(state.elapsed>.1);
});
test('invalid input and long frames cannot skip multiple doors or drain lives', () => {
  const random=randomGenerator();const state=createRun();startRun(state,random);
  for(const lane of [-1,3,1.5,NaN]) assert.equal(selectLane(state,lane),false);
  advance(state,1000,random);assert.equal(state.round,0);assert.equal(state.elapsed,.1);
  const snapshot=JSON.stringify(state);
  for(const delta of [-1,NaN,Infinity,0]) advance(state,delta,random);
  assert.equal(JSON.stringify(state),snapshot);
});
