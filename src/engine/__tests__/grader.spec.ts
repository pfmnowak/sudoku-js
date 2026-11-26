import { describe, expect, it } from 'vitest';
import { EMPTY, parseGrid } from '../board';
import { gradePuzzle, humanSolve, type Technique } from '../grader';
import { DIFFICULTIES, puzzleBank } from '../puzzles';

/** Generated puzzles whose hardest required technique is the key, as `[puzzle, solution]`. */
const FIXTURES: Partial<Record<Technique, readonly [string, string]>> = {
  nakedPair: [
    '18--6--3---9--1----2-4--6--7---56----5-----9----74---5--2--7-5----1--3---4--3--86',
    '184569237679321548523478619738956421456812793291743865312687954865194372947235186'
  ],
  hiddenPair: [
    '-----5--64--2961----6--8-5----7--3-1--7---6--8-1--4----9-6--4----4951--85--8-----',
    '913475826485296173276138954659782341347519682821364597198627435734951268562843719'
  ],
  nakedTriple: [
    '3--------64-2-8---1--4---2--518-------97-51-------287--3---9--2---6-7-93--------1',
    '328971654645238917197456328751863249289745136463192875834519762512687493976324581'
  ],
  hiddenTriple: [
    '----1--56-----32---8-9-----4-9-8-16---8---9---16-7-5-4-----4-7---16-----85--9----',
    '942817356167543298385926741439285167578461932216379584623154879791638425854792613'
  ],
  xWing: [
    '-5--13-9-8-3-----7-1----2--9-7--4----8-3-7-5----9--4-1--8----6-3-----7-8-6-73--2-',
    '752413896893625147614879235927154683481367952536982471278541369345296718169738524'
  ],
  swordfish: [
    '--9---2---2-7-----7--59---396--8---2--5-6-4--8---5--975---18--4-----4-1---1---9--',
    '459831276123746859786592143964187532375269481812453697597618324638924715241375968'
  ],
  xyWing: [
    '7-9--8----435--8--1---7----2---9-7---7-213-4---4-5---6----6---5--2--531----7--4-2',
    '729148653643529871185376294251694738876213549934857126317462985462985317598731462'
  ],
  xyzWing: [
    '23-----6---8---9-2--48-----6--32-----57---62-----69--7-----17--8-6---2---1-----48',
    '239175864578643912164892375681327459957418623423569187345281796896754231712936548'
  ]
};

/** A 17-clue puzzle that needs techniques beyond the grader's set. */
const BEYOND = '8..........36......7..9.2...5...7.......457.....1...3...1....68..85...1..9....4..';

/** True when every digit the human solver placed agrees with the solution. */
const agreesWith = (puzzle: string, solution: string) => {
  const { grid } = humanSolve(parseGrid(puzzle));
  const expected = parseGrid(solution);
  return grid.every((value, i) => value === EMPTY || value === expected[i]);
};

describe('gradePuzzle', () => {
  it.each(Object.entries(FIXTURES))('needs %s on its fixture', (technique, fixture) => {
    const grade = gradePuzzle(parseGrid(fixture![0]));
    expect(grade.solved).toBe(true);
    expect(grade.hardest).toBe(technique);
  });

  it('maps the hardest technique to a level', () => {
    const levelOf = (technique: Technique) => gradePuzzle(parseGrid(FIXTURES[technique]![0])).level;
    expect(levelOf('nakedPair')).toBe('hard');
    expect(levelOf('xWing')).toBe('hard');
    expect(levelOf('swordfish')).toBe('master');
    expect(levelOf('xyWing')).toBe('master');
  });

  it('tells beginner from easy by the technique and the number of empty cells', () => {
    expect(gradePuzzle(parseGrid(puzzleBank.beginner[0].puzzle))).toMatchObject({
      hardest: 'hiddenSingleBox',
      level: 'beginner'
    });
    expect(gradePuzzle(parseGrid(puzzleBank.easy[0].puzzle))).toMatchObject({
      hardest: 'hiddenSingleBox',
      level: 'easy'
    });
  });

  it('grades a full grid as beginner with no technique', () => {
    expect(gradePuzzle(parseGrid(puzzleBank.easy[0].solution))).toEqual({
      solved: true,
      hardest: null,
      steps: {},
      level: 'beginner'
    });
  });

  it('leaves a puzzle beyond its techniques unsolved', () => {
    expect(gradePuzzle(parseGrid(BEYOND))).toMatchObject({ solved: false, level: null });
  });

  it('stops at maxLevel', () => {
    const xWing = parseGrid(FIXTURES.xWing![0]);
    expect(gradePuzzle(xWing, 'medium')).toMatchObject({ solved: false, level: null });
    expect(gradePuzzle(xWing, 'hard')).toMatchObject({ solved: true, level: 'hard' });
  });
});

describe('humanSolve', () => {
  it('only ever places correct digits, on the fixtures and the whole bank', () => {
    for (const [puzzle, solution] of Object.values(FIXTURES)) {
      expect(agreesWith(puzzle, solution)).toBe(true);
    }
    for (const level of DIFFICULTIES) {
      for (const { puzzle, solution } of puzzleBank[level]) {
        expect(agreesWith(puzzle, solution)).toBe(true);
      }
    }
  });
});
