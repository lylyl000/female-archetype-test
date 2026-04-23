import { QUESTIONS } from "../data/questions.js";
import { SCORING_RULES } from "../data/scoringRules.js";
import { ARCHETYPES } from "../data/archetypes.js";

const DIM_ORDER = ["D1", "D2", "D3", "D4", "D5"];

export function computeRawScores(answersById) {
  const raw = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };

  for (const q of QUESTIONS) {
    const picked = answersById[q.id];
    if (!picked) continue;
    const map = SCORING_RULES[q.id];
    const score = map?.[picked];
    if (typeof score !== "number") continue;
    raw[q.dimension] += score;
  }

  return raw;
}

export function rawToCompressed(rawScores) {
  const v = DIM_ORDER.map((d) => {
    const s = rawScores[d] ?? 0;
    if (s <= -2) return -1;
    if (s >= 2) return +1;
    return 0;
  });
  return v;
}

function matchDimensionScore(a, b) {
  // a / b ∈ {-1,0,1}
  if (a === b) return 2;
  const diff = Math.abs(a - b);
  if (diff === 1) return 1;
  return 0; // diff === 2
}

function matchTotalScore(userCompressed, archetypeVector) {
  return userCompressed.reduce((sum, u, i) => sum + matchDimensionScore(u, archetypeVector[i]), 0);
}

function tieBreakDistanceFromRaw(rawScores, archetypeVector) {
  // 产品说明：平分时优先选择“与原始分绝对差值总和更小”的原型。
  // 工程化处理：将原型三档向量映射到原始分的“代表值”，用 v*3（-3/0/+3）作为目标点，
  // 这样能更好利用 -4..+4 的信息来打破平分，同时不会过度放大极端值。
  const rawArr = DIM_ORDER.map((d) => rawScores[d] ?? 0);
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    sum += Math.abs(rawArr[i] - archetypeVector[i] * 3);
  }
  return sum;
}

export function computeArchetypeRanking({ rawScores, compressedVector }) {
  const ranked = ARCHETYPES.map((a, index) => {
    const matchScore = matchTotalScore(compressedVector, a.vector);
    const distance = tieBreakDistanceFromRaw(rawScores, a.vector);
    return { ...a, matchScore, distance, index };
  }).sort((x, y) => {
    if (y.matchScore !== x.matchScore) return y.matchScore - x.matchScore;
    if (x.distance !== y.distance) return x.distance - y.distance;
    return x.index - y.index;
  });

  return ranked;
}

export function computeResult(answersById) {
  const rawScores = computeRawScores(answersById);
  const compressedVector = rawToCompressed(rawScores);
  const ranking = computeArchetypeRanking({ rawScores, compressedVector });

  const primary = ranking[0];
  const secondary = ranking[1] ?? ranking[0];

  return {
    rawScores,
    compressedVector,
    ranking,
    primary,
    secondary,
  };
}

export function getDimOrder() {
  return [...DIM_ORDER];
}

