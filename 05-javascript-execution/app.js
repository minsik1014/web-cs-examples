'use strict';

const examples = {
  intro: {
    default: {
      source: "console.log(gojo());\n\nfunction gojo() {\n  return '고죠 사토루'.split(' ').join(' / ');\n}",
      reason: '함수 선언문이 처리되면서 gojo에 함수가 연결되어, 선언 위치보다 앞에서도 호출할 수 있습니다.',
    },
  },
  hoisting: {
    declaration: {
      source: "console.log(gojo());\n\nfunction gojo() {\n  return '고죠 등장';\n}",
      reason: '함수 선언문은 본문 실행 전에 호출할 수 있는 함수로 준비됩니다.',
    },
    var: {
      source: "console.log(technique);\n\nvar technique = '무하한';\n\nconsole.log(technique);",
      reason: 'var는 undefined로 초기화됩니다. 무하한이라는 값은 대입문을 실행한 뒤에 들어갑니다.',
    },
    let: {
      source: "console.log(technique);\n\nlet technique = '무하한';",
      reason: 'let 바인딩은 준비되지만 초기화 전에는 TDZ에 있어 접근하면 ReferenceError가 발생합니다.',
    },
    const: {
      source: "console.log(technique);\n\nconst technique = '무하한';",
      reason: 'const도 초기화 전 접근 시 ReferenceError가 발생합니다.',
    },
    expression: {
      source: "gojo();\n\nconst gojo = function () {\n  console.log('고죠 등장');\n};",
      reason: '함수 표현식을 담는 const 변수가 아직 초기화되지 않았으므로 ReferenceError가 발생합니다.',
    },
  },
  scope: {
    shadow: {
      source: "const technique = '무하한';\n\nfunction gojo() {\n  const technique = '무량공처';\n  console.log(technique);\n}\n\ngojo();\nconsole.log(technique);",
      reason: 'gojo 안에서는 지역 변수 무량공처를 읽고, 밖에서는 최상위 변수 무하한을 읽습니다.',
      path: 'gojo 안: 지역 technique에서 발견 → 무량공처 / 함수 밖: 최상위 technique → 무하한',
    },
    lexical: {
      source: "const technique = '무하한';\n\nfunction gojo() {\n  console.log(technique);\n}\n\nfunction battle() {\n  const technique = '십종영법술';\n  gojo();\n}\n\nbattle();",
      reason: '호출한 battle의 변수가 아니라, gojo가 선언된 바깥 환경의 technique을 찾습니다.',
      path: 'gojo의 범위 → 선언 시 연결된 최상위 범위 → 무하한',
    },
  },
};

document.querySelectorAll('[data-demo]').forEach((section) => {
  const select = section.querySelector('select');
  const code = section.querySelector('code');
  const output = section.querySelector('output');
  const explanation = section.querySelector('[data-explanation]');
  const current = () => examples[section.dataset.demo][select?.value ?? 'default'];

  function reset() {
    code.textContent = current().source;
    output.textContent = '실행 전';
    output.dataset.error = 'false';
    explanation.textContent = '결과를 예상한 뒤 실행해보세요.';
    if (section.id === 'scope') document.querySelector('#scope-path').textContent = '실행 후 확인할 수 있습니다.';
  }

  section.querySelector('[data-run]').addEventListener('click', () => {
    const lines = [];
    const capture = { log: (...values) => lines.push(values.map(String).join(' ')) };
    output.dataset.error = 'false';
    try {
      // 화면에 표시한 고정 예제를 실행. 입력받은 코드는 실행하지 않음
      new Function('console', `'use strict';\n${current().source}`)(capture);
    } catch (error) {
      lines.push(`${error.name}: ${error.message}`);
      output.dataset.error = 'true';
    }
    output.textContent = lines.join('\n');
    explanation.textContent = current().reason;
    if (section.id === 'scope') document.querySelector('#scope-path').textContent = current().path;
  });
  section.querySelector('[data-reset]').addEventListener('click', reset);
  select?.addEventListener('change', reset);
  reset();
});

function captureStack() {
  const stack = ['전역 실행 컨텍스트'];
  const logs = [];
  const steps = [];
  const record = (note) => steps.push({ stack: [...stack], logs: [...logs], note });
  const log = (text) => { logs.push(text); record(`출력: ${text}`); };

  function startFight() {
    stack.push('startFight');
    record('startFight 호출: 새로운 실행 컨텍스트를 스택에 올립니다.');
    log('전투 시작');
    gojo();
    log('전투 종료');
    stack.pop();
    record('startFight 종료: 최상위 코드로 돌아갑니다.');
  }

  function gojo() {
    stack.push('gojo');
    record('gojo 호출: startFight는 잠시 멈추고 gojo가 실행됩니다.');
    log('고죠 등장');
    stack.pop();
    record('gojo 종료: startFight로 돌아갑니다.');
  }

  record('최상위 코드를 실행합니다.');
  startFight();
  return steps;
}

const steps = captureStack();
let stepIndex = 0;
function showStep() {
  const step = steps[stepIndex];
  const frames = document.querySelector('#frames');
  frames.replaceChildren();
  [...step.stack].reverse().forEach((name) => {
    const frame = document.createElement('li');
    frame.textContent = name;
    frames.append(frame);
  });
  document.querySelector('#stack-output').textContent = step.logs.join('\n') || '아직 출력이 없습니다.';
  document.querySelector('#stack-note').textContent = step.note;
  document.querySelector('#step-count').textContent = `${stepIndex} / ${steps.length - 1}`;
  document.querySelector('#next-step').disabled = stepIndex === steps.length - 1;
}
document.querySelector('#next-step').addEventListener('click', () => { if (stepIndex < steps.length - 1) stepIndex += 1; showStep(); });
document.querySelector('#reset-stack').addEventListener('click', () => { stepIndex = 0; showStep(); });
showStep();

function createCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}
let counter;
let counterLogs = [];
document.querySelector('#create-counter').addEventListener('click', () => {
  counter = createCounter();
  counterLogs = [];
  document.querySelector('#call-counter').disabled = false;
  document.querySelector('#counter-output').textContent = '카운터가 생성되었습니다.';
  document.querySelector('#counter-note').textContent = 'createCounter의 호출은 끝났습니다. 반환된 함수를 호출해보세요.';
});
document.querySelector('#call-counter').addEventListener('click', () => {
  counterLogs.push(String(counter()));
  document.querySelector('#counter-output').textContent = counterLogs.join('\n');
  document.querySelector('#counter-note').textContent = '같은 함수가 바깥 환경의 count를 계속 사용하고 갱신합니다.';
});
