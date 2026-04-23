import { setHtml, qs } from "./ui/dom.js";
import { renderDecor, viewQuiz, viewResult, viewStart } from "./ui/views.js";
import { computeResult } from "./logic/computeResult.js";
import { copyText } from "./logic/clipboard.js";
import { showToast } from "./ui/toast.js";
import { QUESTIONS } from "./data/questions.js";

const APP_TITLE = "《你的“女性力量”是哪种能量形态？》";
const IS_DEV =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  location.hostname === "0.0.0.0";

const state = {
  route: "start", // start | quiz | result
  quizIndex: 0,
  answersById: {}, // { Q1: 'A'|'B'|'C' }
  lastResult: null,
  optionOrderByQid: {}, // { Q1: ['B','A','C'] ... } for this session
};

function shuffle3(arr) {
  const a = [...arr];
  // Fisher–Yates
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startNewSession() {
  // 每次开始新测试时生成一次随机显示顺序；同一次测试中保持固定
  state.optionOrderByQid = {};
  for (const q of QUESTIONS) {
    state.optionOrderByQid[q.id] = shuffle3(["A", "B", "C"]);
  }
}

function go(route, params = {}) {
  state.route = route;
  if (typeof params.quizIndex === "number") state.quizIndex = params.quizIndex;
  render();
}

function resetAll() {
  state.quizIndex = 0;
  state.answersById = {};
  state.lastResult = null;
  state.optionOrderByQid = {};
  go("start");
}

function ensureAnsweredBeforeNext() {
  // 防止没选就前进
  const qId = `Q${state.quizIndex + 1}`;
  return Boolean(state.answersById[qId]);
}

function render() {
  const root = qs("#app");
  if (!root) return;

  const decor = renderDecor();
  let body = "";

  if (state.route === "start") body = viewStart();
  else if (state.route === "quiz") {
    // 本次 session 的显示顺序：仅用于渲染，不改变 options/计分规则
    const q = QUESTIONS[state.quizIndex];
    const displayOrder = state.optionOrderByQid[q.id] ?? ["A", "B", "C"];
    body = viewQuiz({ index: state.quizIndex, answersById: state.answersById, displayOrder });
  }
  else if (state.route === "result") body = viewResult({ result: state.lastResult });
  else body = viewStart();

  setHtml(
    root,
    `
      <div class="app">
        ${decor}
        ${body}
      </div>
    `,
  );
}

function toResultFlow() {
  state.lastResult = computeResult(state.answersById);
  go("result");
}

function formatShareText(result) {
  const main = result.primary.title;
  const sub = result.secondary.title;
  return `${APP_TITLE}\n主原型：${main}\n副原型：${sub}`;
}

function attachGlobalHandlers() {
  document.addEventListener("click", async (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    const nav = t.closest("[data-nav]");
    if (nav) {
      const to = nav.getAttribute("data-nav");
      if (to === "start") return go("start");
    }

    const act = t.closest("[data-action]");
    if (act) {
      const a = act.getAttribute("data-action");
      if (a === "start") {
        startNewSession();
        return go("quiz", { quizIndex: 0 });
      }
      if (a === "restart") return resetAll();
      if (a === "prev") return go("quiz", { quizIndex: Math.max(0, state.quizIndex - 1) });
      if (a === "next") {
        if (!ensureAnsweredBeforeNext()) return;
        const isLast = state.quizIndex === 19;
        if (isLast) return void toResultFlow();
        return go("quiz", { quizIndex: Math.min(19, state.quizIndex + 1) });
      }
      if (a === "share") {
        if (!state.lastResult) return;
        const ok = await copyText(formatShareText(state.lastResult));
        showToast(ok ? "已复制结果文字，可以去粘贴分享啦" : "复制失败了，可能需要手动复制");
        return;
      }
      if (a === "debug" && IS_DEV) {
        const debugCard = qs("[data-debug]");
        if (!debugCard || !state.lastResult) return;
        const pre = debugCard.querySelector("pre");
        const shown = debugCard.style.display !== "none";
        debugCard.style.display = shown ? "none" : "block";
        if (pre) {
          const r = state.lastResult;
          pre.textContent = JSON.stringify(
            {
              rawScores: r.rawScores,
              compressedVector: r.compressedVector,
              ranking: r.ranking.map((x) => ({
                title: x.title,
                matchScore: x.matchScore,
                distance: x.distance,
                vector: x.vector,
              })),
            },
            null,
            2,
          );
        }
        return;
      }
    }

    const pick = t.closest("[data-pick]");
    if (pick) {
      const qid = pick.getAttribute("data-qid");
      const val = pick.getAttribute("data-pick");
      if (!qid || !val) return;
      state.answersById = { ...state.answersById, [qid]: val };
      // 修复滚动抖动：选项点击不再整页重渲染，只更新选中状态与“下一题”可用性
      const root = qs("#app");
      if (root) {
        root
          .querySelectorAll(`[data-qid="${CSS.escape(qid)}"][data-pick]`)
          .forEach((btn) => btn.classList.toggle("selected", btn.getAttribute("data-pick") === val));
        const nextBtn = root.querySelector('[data-action="next"]');
        if (nextBtn) nextBtn.toggleAttribute("disabled", false);
      }
      return;
    }
  });
}

function init() {
  render();
  attachGlobalHandlers();
  if (IS_DEV) {
    // dev-only shortcut: press "d" on result page to toggle debug
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() !== "d") return;
      if (state.route !== "result" || !state.lastResult) return;
      const debugCard = qs("[data-debug]");
      if (!debugCard) return;
      const pre = debugCard.querySelector("pre");
      const shown = debugCard.style.display !== "none";
      debugCard.style.display = shown ? "none" : "block";
      if (pre && !pre.textContent) {
        const r = state.lastResult;
        pre.textContent = JSON.stringify(
          {
            rawScores: r.rawScores,
            compressedVector: r.compressedVector,
            ranking: r.ranking.map((x) => ({
              title: x.title,
              matchScore: x.matchScore,
              distance: x.distance,
              vector: x.vector,
            })),
          },
          null,
          2,
        );
      }
    });
  }
}

init();

