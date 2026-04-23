import { QUESTIONS } from "../data/questions.js";
import { RESULT_CONTENT } from "../data/resultContent.js";
import { escapeHtml } from "./dom.js";
import { ARCHETYPES } from "../data/archetypes.js";

export function renderDecor() {
  const stars = [
    { x: 12, y: 22, s: 1.0 },
    { x: 82, y: 16, s: 1.1 },
    { x: 68, y: 52, s: 0.9 },
    { x: 22, y: 62, s: 0.8 },
    { x: 90, y: 70, s: 0.95 },
  ]
    .map(
      (p) =>
        `<i class="star" style="left:${p.x}%;top:${p.y}%;transform:scale(${p.s});"></i>`,
    )
    .join("");

  const leaves = [
    { x: -20, y: 72, r: -18, o: 0.35 },
    { x: 82, y: -10, r: 22, o: 0.25 },
  ]
    .map(
      (p) =>
        `<i class="leaf" style="left:${p.x}%;top:${p.y}%;transform:rotate(${p.r}deg);opacity:${p.o};"></i>`,
    )
    .join("");

  return `<div class="decor" aria-hidden="true">${stars}${leaves}</div>`;
}

export function viewStart() {
  return `
    <div class="shell fadeSlideIn">
      <div class="page">
        <div class="brand center" style="margin-top:10px">
          <div class="name">YOUR INNER ARCHETYPE TEST</div>
        </div>

        <div class="card poster">
          <div class="brandline">《你的“女性力量”是哪种能量形态？》</div>

          <h1 class="title" style="margin-top:18px">
            <span class="titleLine">你的“女性力量”</span>
            <span class="titleLine">是哪种能量形态？</span>
          </h1>

          <p class="subtitle startSubtitle" style="margin-top:12px">在八种自然原型里，遇见更接近自己的那一种力量。</p>

          <p class="lead startLead" style="margin-top:10px">
            请尽量选“更像你真实反应”的选项。<br />
            没有标准答案，<br />你只是在更清楚地看见自己。
          </p>

          <div style="height:14px"></div>
          <div class="metaLine startMeta">20 道题｜预计 3–5 分钟｜主原型 & 副原型</div>

          <div style="height:18px"></div>
          <button type="button" class="btn primary" data-action="start">开始测试</button>

          <div class="bottomMeta">20 道题 · 约 5 分钟 · 8 种自然原型</div>
        </div>
      </div>
    </div>
  `;
}

export function viewQuiz({ index, answersById, slotMap }) {
  // 注意：slotMap 只影响“显示槽位 A/B/C 对应哪段文案”，不改变原始选项身份与计分
  const q = QUESTIONS[index];
  const picked = answersById[q.id];
  const progress = Math.round(((index + 1) / QUESTIONS.length) * 100);
  const slots = ["A", "B", "C"];
  const map = slotMap ?? { A: "A", B: "B", C: "C" };

  const opt = (slotLabel) => {
    const originalKey = map[slotLabel] ?? slotLabel;
    const selected = picked === originalKey ? "selected" : "";
    return `
      <button type="button" class="option ${selected}" data-pick="${originalKey}" data-qid="${q.id}">
        <span class="label" aria-hidden="true">${slotLabel}</span>
        <span class="text">${escapeHtml(q.options[originalKey])}</span>
      </button>
    `;
  };

  const isLast = index === QUESTIONS.length - 1;
  const nextLabel = isLast ? "查看结果" : "下一题";

  return `
    <div class="shell fadeSlideIn">
      <div class="topbar">
        <div></div>
        <div class="questionMeta" style="margin:0">
          <div>Question ${String(index + 1).padStart(2, "0")} / ${QUESTIONS.length}</div>
        </div>
      </div>

      <div class="progressWrap" aria-label="进度条">
        <div class="progressBar" style="width:${progress}%"></div>
      </div>

      <div class="card qCard">
        <div class="metaLine">Question ${index + 1}</div>
        <div style="height:8px"></div>
        <h2 class="qTitle">${escapeHtml(q.text)}</h2>
        <div class="options">
          ${slots.map((s) => opt(s)).join("")}
        </div>

        <div class="navRow">
          <button type="button" class="btn secondary" data-action="prev" ${index === 0 ? "disabled" : ""}>上一题</button>
          <button type="button" class="btn primary" data-action="next" ${picked ? "" : "disabled"}>${nextLabel}</button>
        </div>
      </div>
    </div>
  `;
}

function getEnglishTitleByCn(cnTitle) {
  return ARCHETYPES.find((a) => a.title === cnTitle)?.englishTitle || cnTitle;
}

export function viewResult({ result }) {
  const primaryTitle = result.primary.title;
  const secondaryTitle = result.secondary.title;
  const content = RESULT_CONTENT[primaryTitle];
  const en = getEnglishTitleByCn(primaryTitle);

  const secondaryText = content.secondaryTitleTemplate.replaceAll("{secondary}", secondaryTitle);
  const shareText = content.shareText.replaceAll("{secondary}", secondaryTitle);

  return `
    <div class="shell resultFade">
      <div class="topbar">
        <div class="brand">
          <div class="name">YOUR INNER ARCHETYPE TEST</div>
        </div>
      </div>

      <div class="card pad">
        <div class="resultWrap">
          <div class="brand center" style="margin-top:6px">
            <div class="name">YOUR INNER ARCHETYPE TEST</div>
          </div>
          <div style="height:22px"></div>

          <p class="kicker center">你的内在原型是</p>
          <h2 class="enHero center">${escapeHtml(en)}</h2>
          <h1 class="cnTitle center">${escapeHtml(primaryTitle)}</h1>

          <div style="height:12px"></div>
          <div class="keywordLine center">${escapeHtml(content.keywords)}</div>

          <div class="quote">${escapeHtml(content.quote)}</div>

          <div class="divider"></div>

          <div class="moduleTitle spacious">你的能量侧写</div>
          <p class="portrait">${escapeHtml(content.portrait)}</p>

          <div class="divider"></div>

          <div class="moduleTitle">你的副原型：${escapeHtml(secondaryTitle)}</div>
          <p class="portrait" style="margin-top:14px">${escapeHtml(secondaryText)}</p>

          <div class="divider"></div>

          <div class="moduleTitle">分享你的结果</div>
          <div class="shareBox shareBar" style="margin-top:12px">
            <p class="shareText">${escapeHtml(shareText)}</p>
          </div>

          <div class="btnRow" style="justify-content:center">
            <button type="button" class="btn primary" data-action="share">分享我的结果</button>
            <button type="button" class="btn secondary" data-action="restart">再测一次</button>
          </div>
        </div>
      </div>

      <div class="card pad" data-debug style="display:none">
        <div class="moduleTitle" style="margin-top:0">调试信息（原始 5 维得分 / 压缩向量 / 匹配排序）</div>
        <pre style="margin:0;white-space:pre-wrap;line-height:1.7;font-size:12.5px;color:var(--muted)"></pre>
      </div>
    </div>
  `;
}

