import { useRef, useEffect, useState, useCallback, useGrokTheme, Page } from "grok/canvas";
import type { CSSProperties, ChangeEvent } from "grok/canvas";

type Scr = "select" | "play";
type Panel = "none" | "board" | "bag" | "shop" | "set" | "char" | "ware" | "temple" | "tele" | "quest" | "skills" | "craft" | "xchg" | "pets" | "rank" | "dun" | "dia";
const TS = 32, TAU = Math.PI * 2, PR = 10, HASTE = 120, WSEED = 20261125, TW = 36, TH = 28;
const MW = 192, MH = 160;
const BLOCK = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0];
interface Town { n: string; x: number; y: number }
const TOWNS: Town[] = [{ n: '銀月村', x: 14, y: 72 }, { n: '風木城', x: 116, y: 28 }];
let SPAWN_X = 27 * TS, SPAWN_Y = 84.5 * TS;
const ZN = ['城鎮', '晨風草原', '荒狼平原', '幽暗森林', '迷霧沼澤', '赤土荒野', '霜雪高原', '熔岩火山', '古代遺跡', '妖魔洞窟', '象牙塔', '龍之地監', '傲慢之塔', '火龍窟', '冰之女王城', '混沌神殿'];
const ZC = ['#8fe08f', '#e8e8a0', '#f0c070', '#f09060', '#a0d8b0', '#ffb070', '#c0e0ff', '#ff7050', '#ff6060', '#ffb060', '#c0a0ff', '#ff5040', '#d8b0ff', '#ff7a30', '#a0e0ff', '#c070ff'];
const ZLV = [1, 5, 10, 13, 17, 21, 26, 22, 10, 18, 32, 38, 46, 54, 62];
const ZG = [0, 14, 5, 11, 9, 10, 12, 6, 19, 21, 23];
const ZS: [number, number, number][] = [[0, 44, 100], [0, 26, 58], [1, 64, 72], [1, 66, 118], [2, 96, 94], [2, 90, 140], [3, 42, 142], [3, 14, 130], [4, 112, 66], [4, 158, 90], [5, 100, 14], [5, 162, 12], [5, 60, 24], [6, 174, 136], [6, 142, 148], [7, 128, 114]];
const OL = "rgba(22,14,10,0.9)";

interface MDef { n: string; lv: number; hp: number; atk: number; def: number; exp: number; gold: number; sp: number; r: number; c: string; c2: string; s: number; v: number; b: number; ag: boolean; z: number; cnt: number; ds: string; fl: number }
const MRAW = '綠史萊姆,1,22,4,0,6,3,45,11,#5fd35f,#2f8f3a,0,0,0,0,0,40,7.8.1.5;野兔精,2,30,5,0,9,4,80,10,#d8c7a8,#8a7458,1,0,0,0,0,30,5.4.9.3;哥布林,4,55,9,1,18,9,70,12,#7fae4a,#4a6a28,2,0,0,1,0,30,0.4.8.6.1;灰狼,6,85,13,2,30,12,105,13,#9aa0a8,#5a6068,1,1,0,1,1,35,5.3.12.0;紅帽哥布林,7,100,15,3,38,15,80,12,#c0503a,#6a2a1a,2,0,0,1,1,25,0.4.1.9;獸人戰士,9,140,18,4,52,22,75,15,#b07a3a,#6a4520,2,1,0,1,1,30,0.2.6.1.8;樹精,12,220,22,7,85,30,40,17,#4a8a3a,#5a3a20,3,0,0,0,2,30,3.2.11.9.0;毒蜘蛛,14,190,28,5,100,34,110,14,#6a3a8a,#2a1a3a,4,0,0,1,2,30,0.4.12.9.5;狼人,17,300,34,8,150,48,100,16,#7a5a3a,#3a2a1a,1,2,0,1,2,25,0.2.5.3.4;沼澤史萊姆,13,230,24,5,90,30,50,13,#8a5ac0,#3a2a6a,0,0,0,1,3,35,7.8.11.12;蜥蜴人,15,270,30,8,120,40,85,15,#3a9a7a,#1a4a3a,2,1,0,1,3,30,0.6.4.1.5;腐木樹妖,16,320,30,10,135,44,45,18,#5a4a6a,#3a2a1a,3,0,0,1,3,25,3.2.9.11;沙漠蠍,18,330,38,9,170,52,105,15,#d08a3a,#6a3a1a,4,0,0,1,4,35,0.5.4.12.9;沙丘狼,19,350,40,9,185,55,120,14,#c8a870,#7a5a30,1,1,0,1,4,30,5.3.8.0;獸人酋長,21,460,46,13,230,70,80,18,#a04a2a,#4a1a0a,2,1,0,1,4,25,0.2.6.1.11;冰狼,21,420,44,12,225,64,120,14,#b8d8f0,#5a7a9a,1,1,0,1,5,35,5.3.12.9;雪怪,24,560,52,15,300,80,85,19,#f0f4f8,#8a9aaa,1,2,0,1,5,30,0.2.1.4.8;冰晶魔像,25,600,50,20,320,85,70,18,#9ad8ff,#3a6a9a,5,0,0,1,5,25,6.2.11.9.12;火焰史萊姆,26,600,56,14,340,90,60,14,#ff7a30,#a02a0a,0,0,0,1,6,35,7.8.12.9;地獄犬,28,680,62,16,400,100,130,15,#6a1a1a,#2a0808,1,1,0,1,6,30,0.5.3.12;炎魔,31,820,70,20,500,130,85,19,#e04020,#4a0a04,5,0,0,1,6,25,0.2.11.9.3;骷髏兵,22,420,44,13,240,62,80,14,#e8e4d8,#8a8678,2,2,0,1,7,35,6.1.2.0.8;石像鬼,26,560,54,17,330,85,90,17,#7a8088,#3a4048,5,0,0,1,7,25,9.11.12.3.6;雪原之王,30,3000,68,20,2200,700,80,26,#e8f0ff,#6a8aaa,1,2,1,1,5,1,0.2.1.3.6.9.11.12;深淵魔王,32,3200,75,22,2500,800,70,30,#c03030,#3a0a0a,6,0,1,1,7,1,0.2.1.3.6.9.11.12;炎魔王,36,4200,88,26,3600,1200,75,30,#ff6a20,#5a1004,6,0,1,1,6,1,0.2.1.3.6.9.11.12;妖魔戰士,10,170,20,5,70,26,80,15,#c08040,#5a3010,2,1,0,1,8,14,0.2.6.1,0;洞窟蜘蛛,11,160,24,4,75,26,110,14,#5a4a3a,#2a1a10,4,0,0,1,8,10,0.4.12.9,0;妖魔巫師,13,190,28,5,95,32,75,13,#7a4ab0,#3a1a60,2,0,0,1,8,12,7.8.11.12,1;食屍鬼,14,260,30,7,110,36,70,14,#8a9a7a,#3a4a30,2,2,0,1,8,12,1.2.3.5,2;妖魔王 卡司特,18,2200,48,14,1400,500,80,24,#d07030,#4a1a08,6,0,1,1,8,1,0.2.1.3.6.9.11.12,2;活鎧甲,18,380,40,14,200,60,70,15,#b8c0cc,#4a5260,2,2,0,1,9,14,1.2.6.4.5,0;魔法石像鬼,19,360,44,12,210,62,95,16,#6a7a9a,#2a3a5a,5,0,0,1,9,10,9.11.12.3,0;幽靈,21,300,48,8,230,66,90,13,#d8e4f0,#7a8aa0,0,0,0,1,9,12,7.8.12.11,1;黑暗精靈法師,23,420,52,12,280,80,85,14,#4a3a6a,#1a1030,2,0,0,1,9,12,0.3.7.11.12,2;惡魔 巴風特,27,3200,66,20,2600,900,80,28,#8a2a5a,#2a0a1a,6,0,1,1,9,1,0.2.1.3.6.9.11.12,2;火焰蜥蜴,27,640,60,16,380,95,120,15,#e05a2a,#6a1a08,1,1,0,1,10,14,0.5.4.9,0;熔岩魔像,28,820,62,24,420,100,50,19,#c0502a,#3a1a10,3,0,0,1,10,10,2.6.1.8,0;龍人戰士,30,760,68,20,480,120,90,16,#3a7a4a,#1a3a20,2,1,0,1,10,12,0.2.6.1.4,1;小飛龍,32,800,74,20,540,130,110,17,#c03030,#4a0a0a,5,0,0,1,10,12,9.11.12.3.0,2;地龍 安塔瑞斯,38,6000,95,30,5000,2000,75,32,#6a4a2a,#2a1808,6,0,1,1,10,1,0.2.1.3.6.9.11.12,2';
const MD: MDef[] = MRAW.split(';').map((row: string) => {
  const f = row.split(','), n = (i: number): number => Number(f[i] ?? 0) || 0;
  return { n: f[0] ?? '', lv: n(1), hp: n(2), atk: n(3), def: n(4), exp: n(5), gold: n(6), sp: n(7), r: n(8), c: f[9] ?? '#888888', c2: f[10] ?? '#444444', s: n(11), v: n(12), b: n(13), ag: f[14] === '1', z: n(15), cnt: n(16), ds: (f[17] ?? '2').split('.').join(','), fl: n(18) };
});
{ const a = MD[40] as MDef; MD.push({ ...a, n: '死亡騎士 格蘭肯', lv: 40, hp: 8000, atk: Math.round(a.atk * 1.1), def: a.def + 2, exp: Math.round(a.exp * 1.2), gold: Math.round(a.gold * 1.1), c: '#3a3848', c2: '#100c18', r: 22, sp: 70, z: 99, cnt: 0, b: 1, fl: 0 }); MD.push({ ...a, n: '水龍 法利昂', lv: 43, hp: 10000, atk: Math.round(a.atk * 1.2), def: a.def + 3, exp: Math.round(a.exp * 1.4), gold: Math.round(a.gold * 1.2), c: '#3a8ad0', c2: '#0a2a5a', z: 99, cnt: 0, b: 1, fl: 0 }); MD.push({ ...a, n: '火龍 巴拉卡斯', lv: 46, hp: 13000, atk: Math.round(a.atk * 1.35), def: a.def + 4, exp: Math.round(a.exp * 1.7), gold: Math.round(a.gold * 1.4), c: '#d84a1a', c2: '#5a0a04', z: 99, cnt: 0, b: 1, fl: 0 }); }
const MALIAS: Record<string, string> = {};
{
  const base = (n: string): MDef => MD.find((q: MDef) => q.n === n) ?? (MD[0] as MDef);
  const add = (bn: string, n: string, lv: number, c: string, c2: string, z: number, fl: number, cnt: number, boss?: number): void => {
    const b = base(bn); MALIAS[n] = bn;
    MD.push({ ...b, n, lv, hp: boss ?? b.hp, atk: b.atk, def: Math.round(lv * 0.65), exp: b.exp, gold: Math.round(lv * (boss ? 40 : 4.5)), c, c2, z, fl, cnt: boss ? 1 : cnt, b: boss ? 1 : 0, ag: true, r: boss ? Math.max(b.r, 28) : Math.min(b.r, 20) });
  };
  add('活鎧甲', '黑曜騎士', 36, '#4a4a5e', '#12121e', 11, 0, 14); add('黑暗精靈法師', '傲慢法師', 38, '#6a2a8a', '#1e0a30', 11, 0, 12); add('幽靈', '怨靈', 39, '#a8f0d8', '#2a6a5a', 11, 1, 12); add('魔法石像鬼', '鋼鐵石像鬼', 41, '#9a9aac', '#2a2a3a', 11, 1, 10); add('惡魔 巴風特', '傲慢之王', 46, '#5a1a7a', '#14041e', 11, 2, 1, 12000);
  add('龍人戰士', '炎鱗龍人', 44, '#d0501a', '#4a1004', 12, 0, 14); add('熔岩魔像', '熔岩巨像', 45, '#9a2e10', '#2a0804', 12, 0, 10); add('地獄犬', '地獄火犬', 46, '#ff5a1a', '#4a0a00', 12, 1, 12); add('小飛龍', '赤翼飛龍', 48, '#ff7a20', '#6a1a04', 12, 1, 12); add('火龍 巴拉卡斯', '炎之龍王', 54, '#ff4a14', '#3a0600', 12, 2, 1, 18000);
  add('活鎧甲', '冰霜騎士', 52, '#c8e8ff', '#3a5a8a', 13, 0, 14); add('冰狼', '霜狼王', 53, '#e8f6ff', '#4a6a9a', 13, 0, 12); add('幽靈', '雪女', 55, '#eef8ff', '#6a9ac8', 13, 1, 12); add('冰晶魔像', '冰晶巨像', 57, '#7ac8ff', '#1a4a8a', 13, 1, 10); add('水龍 法利昂', '冰龍女王', 62, '#bfe8ff', '#2a5a9a', 13, 2, 1, 24000);
  add('骷髏兵', '混沌騎士', 60, '#7a6a9a', '#1a1030', 14, 0, 14); add('深淵魔王', '深淵魔物', 62, '#6a2a9a', '#14062a', 14, 0, 12); add('石像鬼', '虛空魔像', 64, '#4a3a6a', '#0a0418', 14, 1, 10); add('小飛龍', '混沌飛龍', 66, '#9a4ad8', '#1a0a3a', 14, 1, 12); add('地龍 安塔瑞斯', '混沌之神', 72, '#7a3ab0', '#12042a', 14, 2, 1, 32000);
  const hpC = (lv: number): number => 20 + 4.2 * Math.pow(lv, 1.6), atC = (lv: number): number => 3 + 1.6 * Math.pow(lv, 1.12);
  MD.forEach((d: MDef) => {
    if (d.z === 10) { if (d.b) { d.hp = Math.round(d.hp * 1.3); d.atk = Math.round(d.atk * 1.15); } else { d.hp = Math.round(d.hp * Math.pow(hpC(d.lv + 5) / hpC(d.lv), 1)); d.atk = Math.round(d.atk * atC(d.lv + 5) / atC(d.lv)); d.lv += 5; d.def += 4; } }
    if (d.b && MALIAS[d.n]) d.atk = Math.round(atC(d.lv) * 1.35);
    if (!d.b) {
      const fh = MALIAS[d.n] ? clamp(Math.sqrt((MD.find((q: MDef) => q.n === MALIAS[d.n])?.hp ?? 1) / hpC((MD.find((q: MDef) => q.n === MALIAS[d.n])?.lv ?? 1))), 0.85, 1.2) : clamp(Math.sqrt(d.hp / hpC(d.lv)), 0.75, 1.3);
      const fa = MALIAS[d.n] ? 1 : clamp(Math.sqrt(d.atk / atC(d.lv)), 0.75, 1.3);
      d.hp = Math.round(hpC(d.lv) * fh); d.atk = Math.round(atC(d.lv) * fa);
    }
    if (d.b) { d.hp = Math.round(d.hp * 10); d.atk = Math.round(d.atk * 3); d.lv += 2; } else d.hp = Math.round(d.hp * 1.4);
    d.exp = monExp(d.lv) * (d.b ? 20 : 1);
  });
}
function monExp(lv: number): number { return Math.max(3, Math.round(20 * Math.pow(lv, 2.1) / (6 + lv))); }
interface ADef { n: string; mi: number; lv: number; th: number; d: string }
const ARENAS: ADef[] = [
  { n: '妖魔王 卡司特', mi: 30, lv: 15, th: 0, d: '妖魔族的王者，揮舞巨斧的狂戰士。' },
  { n: '惡魔 巴風特', mi: 35, lv: 24, th: 1, d: '象牙塔深處的山羊惡魔，會召喚黑暗之力。' },
  { n: '雪原之王', mi: 23, lv: 27, th: 1, d: '霜雪高原的冰之巨人，皮厚力大。' },
  { n: '深淵魔王', mi: 24, lv: 29, th: 2, d: '來自深淵的魔王，雙翼帶來死亡之風。' },
  { n: '炎魔王', mi: 25, lv: 33, th: 2, d: '熔岩中誕生的炎之王者。' },
  { n: '地龍 安塔瑞斯', mi: 40, lv: 36, th: 2, d: '四大龍之一，大地的霸主。' },
  { n: '死亡騎士 格蘭肯', mi: 41, lv: 40, th: 0, d: '被詛咒的黑騎士，傳說中死亡騎士套裝的主人。' },
  { n: '水龍 法利昂', mi: 42, lv: 43, th: 1, d: '四大龍之一，掌控深海與寒冰。' },
  { n: '火龍 巴拉卡斯', mi: 43, lv: 46, th: 2, d: '四大龍之首，烈焰的化身。最強的挑戰。' },
];
const ACD = 300;
function arenaId(i: number): number { const a = ARENAS[i]; if (!a) return 0; let k = 0; for (let j = 0; j < i; j++) if (ARENAS[j]?.th === a.th) k++; return 1 + a.th * 10 + 5 + k; }
function arenaOf(id: number): number { if (id <= 0 || (id - 1) % 10 < 5) return -1; for (let i = 0; i < ARENAS.length; i++) if (arenaId(i) === id) return i; return -1; }
let ARCD: Record<string, number> = {}, ARET: { x: number; y: number } | null = null;
try { ARCD = JSON.parse((typeof localStorage !== 'undefined' ? localStorage.getItem('sm_arena') : null) ?? '{}') as Record<string, number>; } catch { ARCD = {}; }
function arenaLeft(i: number): number { return Math.max(0, ((ARCD[String(i)] ?? 0) - Date.now()) / 1000); }
interface CDef { n: string; d: string; hp: number; mp: number; atk: number; def: number; hpL: number; mpL: number; atkL: number; rng: number; cd: number; sp: number; mpReg: number; sk: string; skMp: number; c: string }
const CL: CDef[] = [
  { n: "騎士", d: "近戰·血厚·技能「猛擊」", hp: 150, mp: 20, atk: 11, def: 4, hpL: 16, mpL: 2, atkL: 2.2, rng: 30, cd: 0.75, sp: 125, mpReg: 0.6, sk: "猛擊", skMp: 8, c: "#c8d0dc" },
  { n: "妖精", d: "弓箭遠程·移動快·技能「三連箭」", hp: 100, mp: 40, atk: 9, def: 2, hpL: 10, mpL: 4, atkL: 2.0, rng: 220, cd: 0.62, sp: 145, mpReg: 1, sk: "三連箭", skMp: 10, c: "#6fdc8c" },
  { n: "法師", d: "魔法飛彈耗魔·技能「治癒術」", hp: 80, mp: 90, atk: 14, def: 1, hpL: 7, mpL: 9, atkL: 2.6, rng: 200, cd: 0.85, sp: 118, mpReg: 2.2, sk: "治癒術", skMp: 15, c: "#b48cff" },
];

interface Item { id: number; b: number; en: number; q?: number; af?: number[] }
const QN = ['白色', '綠色', '藍色', '紅色', '紫色', '金色'], QC = ['#eef2f8', '#60e070', '#5aa8ff', '#ff5a5a', '#c070ff', '#ffc830'];
const AFN = ['攻擊 +', 'AC -', '生命 +', '魔力 +', '暴擊 +', '閃避 +', '力量 +', '敏捷 +', '智力 +', '傷害 +', '吸血 +', '抗魔 +', '移速 +'], AFU = ['', '', '', '', '%', '%', '', '', '', '%', '%', '%', '%'];
const LGN = ['屠龍', '聖光', '暗影', '風神', '雷神', '冰后', '烈焰', '月影'];
const MTN = ['獸皮', '鐵礦石', '魔法水晶', '精靈之羽', '龍鱗'];
function afText(it: Item): string { return (it.af ?? []).map((c0: number) => { const k = Math.floor(c0 / 100), v = c0 % 100; return `${AFN[k] ?? ''}${k === 2 ? v * 5 : k === 3 ? v * 3 : v}${AFU[k] ?? ''}`; }).join(' · '); }
interface IDef { s: number; m: number; t: number; n: string; ac: number; atk: number; st: number[]; hp: number; mp: number; sp: string; r: number; p: number }
interface Drop { x: number; y: number; k: number; it: Item | null; t: number; bn: number; s?: number }
const SLOTN = ['武器', '頭盔', '盔甲', '斗篷', '手套', '長靴', '盾牌', 'T恤', '腰帶', '戒指', '戒指', '項鍊', '耳環'];
const STN = ['力量', '敏捷', '體質', '智力', '精神'], STD = ['近戰攻擊', '弓箭攻擊、命中、閃避', '生命上限與回復', '魔法攻擊與魔力', '魔力上限與回復'];
const CLN = ['騎士', '妖精', '法師'], VT = [0, 1, 2, 3, 4, 4, 4];
const TIERN = ['低階', '低階', '中階', '中階', '高階', '高階', '傳說'];
const SPN: Record<string, string> = { v: '吸血：傷害的 6% 轉為生命', f: '烈焰：傷害 +15%', c: '暴擊率 +8%', s: '移動速度 +12%', m: '魔力回復 +60%', h: '生命回復 +60%', r: '抗魔：受到傷害 -12%', d: '閃避 +6%' };
const IRAW = '0,1,0,短劍,0,3;0,7,0,匕首,0,2;0,1,1,長劍,0,6;0,1,1,武士刀,0,7,D1;0,1,2,雙手劍,0,11;0,1,2,騎士巨劍,0,12,S1;0,1,3,銀長劍,0,16,S1;0,1,3,秘銀長劍,0,18;0,1,4,惡魔之劍,0,24,,0,0,v,1;0,1,5,炎魔之刃,0,32,S2,0,0,f,1;0,1,5,屠龍劍,0,34,S1C1,0,0,c,1;0,2,0,短弓,0,3;0,2,1,長弓,0,6;0,2,1,獵人之弓,0,7,D1;0,2,2,精靈短弓,0,11,D1;0,2,2,精靈長弓,0,12;0,2,3,秘銀弓,0,17;0,2,4,狂風之弓,0,23,D1,0,0,s,1;0,2,5,妖精女王之弓,0,31,D2,0,0,c,1;0,2,5,風暴之弓,0,33,,0,0,f,1;0,4,0,木杖,0,3;0,4,1,橡木魔杖,0,6,I1;0,4,1,水晶杖,0,6,W1,0,10;0,4,2,瑪那魔杖,0,10,,0,20,m;0,4,2,賢者之杖,0,11,I1W1;0,4,3,秘銀法杖,0,16,I2;0,4,4,冰之女王權杖,0,22,I2,0,30,,1;0,4,5,深淵法杖,0,30,I3,0,40,f,1;1,7,0,皮帽,1,0;1,3,1,鐵頭盔,2,0;1,2,1,精靈頭盔,2,0,D1;1,4,1,魔法帽,1,0,,0,15;1,1,2,騎士面甲,3,0;1,3,2,鋼鐵頭盔,3,0;1,1,3,巨人頭盔,4,0,C1,30;1,4,3,智慧之冠,2,0,I1W1;1,7,4,黑暗頭盔,5,0,S1,0,0,,1;2,7,0,皮背心,2,0;2,3,0,皮甲,3,0;2,4,1,法師長袍,2,0,I1,0,20;2,1,1,鏈甲,5,0;2,2,2,精靈鏈甲,5,0,D1;2,1,2,環甲,6,0;2,1,3,鋼板甲,8,0;2,4,3,賢者長袍,4,0,W1,0,40;2,3,3,秘銀鎧甲,7,0;2,1,4,黑暗鎧甲,10,0,,20,0,,1;2,2,4,精靈女王之衣,9,0,D2,0,20,d,1;2,7,5,魔王鎧甲,13,0,,80,0,r,1;3,7,0,布斗篷,1,0;3,2,1,精靈斗篷,2,0;3,7,2,保護者斗篷,3,0;3,4,2,瑪那斗篷,2,0,,0,30,m;3,7,3,抗魔斗篷,3,0,,0,0,r;3,7,4,隱身斗篷,4,0,,0,0,d,1;3,7,4,黑暗斗篷,4,0,S1D1,0,0,,1;4,7,0,皮手套,1,0;4,1,1,鐵手套,2,0;4,2,1,精靈手套,1,0,D1;4,4,1,魔法手套,1,0,I1;4,7,3,力量手套,2,0,S2,0,0,,1;4,7,3,敏捷手套,2,0,D2,0,0,,1;5,7,0,皮靴,1,0;5,3,1,鐵靴,2,0;5,2,2,精靈長靴,2,0,D1;5,7,2,長筒靴,3,0;5,7,3,疾風之靴,2,0,,0,0,s;5,7,4,黑暗長靴,4,0,,0,0,s,1;6,5,0,小圓盾,1,0;6,1,0,木盾,2,0;6,2,1,精靈臂甲,2,0;6,1,1,鋼盾,3,0;6,1,2,騎士盾,4,0;6,2,3,秘銀臂甲,3,0,D1;6,1,3,塔盾,6,0;6,1,4,神聖之盾,7,0,,0,0,r,1;7,7,0,白色T恤,0,0,,10;7,7,1,藍色T恤,1,0,,0,10;7,7,2,紅色T恤,1,0,,30;7,7,3,黑色T恤,2,0,S1D1,0,0,,1;8,7,0,皮帶,1,0;8,7,2,力量腰帶,1,0,S1;8,7,2,瑪那腰帶,1,0,,0,25;8,7,4,泰坦腰帶,2,0,S1,60,0,,1;9,7,0,銅戒指,0,0,,5;9,7,1,銀戒指,1,0;9,7,2,力量戒指,0,0,S1;9,7,2,敏捷戒指,0,0,D1;9,7,2,智力戒指,0,0,I1;9,7,2,體質戒指,0,0,C1;9,7,3,守護戒指,2,0;9,7,3,召喚控制戒指,0,0,W1,0,15;9,7,4,吸血鬼之戒,0,0,,0,0,v,1;9,7,5,王者之戒,1,0,S1D1C1I1W1,0,0,,1;11,7,1,勇氣項鍊,0,0,S1;11,7,1,智慧項鍊,0,0,W1;11,7,2,守護項鍊,2,0;11,7,2,生命項鍊,0,0,,40,0,h;11,7,3,魔力項鍊,0,0,,0,40,m;11,7,4,地龍之項鍊,1,0,C2,50,0,,1;12,7,0,銅耳環,0,0,,0,5;12,7,1,銀耳環,1,0;12,7,2,生命耳環,0,0,,30;12,7,2,瑪那耳環,1,0,,0,25;12,7,3,疾風耳環,0,0,D1,0,0,c;12,7,4,黑暗耳環,2,0,S1I1,0,0,,1;2,7,1,阿克海盔甲,4,0,,10;1,7,1,阿克海頭盔,2,0;5,7,1,阿克海長靴,2,0;4,7,1,阿克海手套,1,0;0,1,1,歐西斯短劍,0,7;0,2,1,歐西斯短弓,0,7;0,4,1,歐西斯魔杖,0,7,I1;2,7,5,死亡騎士盔甲,14,0,S1,60,0,,1;1,7,5,死亡騎士頭盔,6,0,S1,30,0,,1;4,7,5,死亡騎士手套,4,0,S1,0,0,,1;5,7,5,死亡騎士長靴,5,0,,0,0,s,1;0,1,6,死亡騎士烈炎之劍,0,44,S2,0,0,f,1;2,7,5,惡魔鎧甲,13,0,C1,80,0,,1;1,7,5,惡魔頭盔,6,0,C1,30,0,,1;2,7,6,安塔瑞斯之鱗甲,18,0,C2,150,0,r,1;0,2,6,安塔瑞斯之弓,0,44,D3,0,0,c,1;0,4,6,巴拉卡斯之杖,0,42,I3,0,60,f,1;3,7,6,巴拉卡斯斗篷,7,0,,60,40,r,1;11,7,6,安塔瑞斯之心,3,0,S1D1C1I1W1,100,40,h,1;0,1,4,大馬士革刀,0,0;0,1,5,騎士團長之劍,0,0,S1;0,7,1,銀匕首,0,0;0,7,3,秘銀匕首,0,0,D1;0,7,5,暗殺者短刀,0,0,D2;0,2,3,複合弓,0,0;0,2,4,精靈族巨弓,0,0,D1;0,2,5,天空之弓,0,0,D2;0,4,3,精靈魔杖,0,0,I1;0,4,4,大法師之杖,0,0,I2,0,30;0,4,5,星辰法杖,0,0,I3,0,50;1,7,4,黃金頭盔,0,0;1,7,5,龍鱗頭盔,0,0,C1,30;2,7,4,黃金板甲,0,0;2,7,5,龍鱗鎧甲,0,0,C1,60;3,7,0,旅人斗篷,0,0;3,7,1,獵人斗篷,0,0;3,4,3,法師斗篷,0,0,I1,0,20;3,7,4,守護者斗篷,0,0;3,7,5,王者斗篷,0,0,C1,40;4,7,0,布手套,0,0;4,7,2,鋼鐵手套,0,0;4,7,3,秘銀手套,0,0;4,7,4,黃金手套,0,0,S1;4,7,5,龍鱗手套,0,0,S1D1;5,7,0,布鞋,0,0;5,7,3,秘銀長靴,0,0;5,7,4,黃金長靴,0,0;5,7,5,龍鱗長靴,0,0,D1,0,0,s;5,7,6,巴拉卡斯長靴,0,0,D2,40,0,s,1;6,1,2,鳶盾,0,0;6,1,4,黃金盾,0,0;6,5,5,龍鱗盾,0,0,C1,40;6,1,5,死亡騎士之盾,0,0,S1,40,0,,1;6,7,6,安塔瑞斯之盾,0,0,C2,80,0,r,1;7,7,0,灰色T恤,0,0;7,7,1,綠色T恤,0,0,,15;7,7,2,黃色T恤,0,0,,0,15;7,7,3,紫色T恤,0,0,I1;7,7,3,銀色T恤,0,0,,40;7,7,4,金色T恤,0,0,S1,30;7,7,5,白金T恤,0,0,C1,50;7,7,5,龍紋T恤,0,0,S1D1,60,0,,1;7,7,6,安塔瑞斯T恤,0,0,S1D1C1,100,0,h,1;8,7,0,布腰帶,0,0;8,7,1,鐵扣腰帶,1,0;8,7,3,守護腰帶,2,0;8,7,3,敏捷腰帶,1,0,D1;8,7,4,黃金腰帶,2,0,S1,20;8,7,5,龍皮腰帶,3,0,C1,50;8,7,5,死亡騎士腰帶,2,0,S2,40,0,,1;8,7,6,巴拉卡斯腰帶,3,0,S1C1,80,0,,1;9,7,4,黃金戒指,1,0,S1D1;9,7,5,龍之戒指,2,0,S1D1C1;9,7,6,安塔瑞斯之戒,3,0,S2D1C1,60,0,c,1;11,7,0,銅項鍊,0,0,,10;11,7,1,銀項鍊,1,0;11,7,3,敏捷項鍊,0,0,D2;11,7,4,黃金項鍊,1,0,S1I1,30;11,7,5,龍牙項鍊,2,0,S2,50;11,7,5,巴拉卡斯之焰,1,0,S2I1,60,0,f,1;12,7,0,骨耳環,0,0;12,7,1,精靈耳環,0,0,D1;12,7,3,秘銀耳環,1,0;12,7,4,黃金耳環,1,0,,40,20;12,7,5,龍之耳環,2,0,C1,50,20;12,7,5,死亡騎士耳環,2,0,S1,40,0,,1;12,7,6,法利昂之淚,2,0,W2I1,40,60,m,1';
const IT: IDef[] = IRAW.split(';').map((row: string) => {
  const f = row.split(','), n = (i: number): number => Number(f[i] ?? 0) || 0, s = n(0), t = n(2), r = n(10), st = [0, 0, 0, 0, 0], ss = f[6] ?? '';
  for (let i = 0; i + 1 < ss.length; i += 2) { const k = 'SDCIW'.indexOf(ss.charAt(i)); if (k >= 0) st[k] = Number(ss.charAt(i + 1)) || 0; }
  const TA = [1, 2, 3, 4.5, 6.5, 9, 12][t] ?? 1, TW0 = [3, 6, 11, 17, 25, 34, 46][t] ?? 3, SWt = [0, 1, 2.5, 1, 0.8, 1, 1.5, 0.6, 0.7, 0.5, 0.5, 0.6, 0.5][s] ?? 0.5;
  const atk0 = s === 0 ? Math.max(n(5), TW0 + (r ? 2 : 0)) : n(5), ac0 = s === 0 ? n(4) : Math.max(n(4), Math.round(TA * SWt) + (r ? 1 : 0)), hp0 = n(7) + (s !== 0 && t >= 2 ? Math.round((t - 1) * 6 * SWt) : 0);
  return { s, m: n(1), t, n: f[3] ?? '', ac: Math.max(0, ac0), atk: Math.max(0, atk0), st: st.map((v: number) => Math.max(0, v)), hp: Math.max(0, hp0), mp: Math.max(0, n(8)), sp: f[9] ?? '', r, p: Math.round((s === 0 ? 90 : s >= 9 ? 140 : 55) * Math.pow(3, t) * (r ? 2.5 : 1)) };
});
const DN = ['紅色藥水', '回城卷軸', '武器強化卷軸', '防具強化卷軸', '', '藍色藥水', '綠色加速藥水', '祝福的武器強化卷軸', '祝福的防具強化卷軸', '技能書'];
const DK = ['pr', 'sr', 'sw', 'sa', '', 'pb', 'pg', 'sx', 'sy', 'bk'];
const TIERC: [string, string][] = [["#dfe4ea", "#7d8791"], ["#f2f6fa", "#93a0ad"], ["#fff3cf", "#c49a3c"], ["#d6ecff", "#4a8ad6"], ["#ffd2a8", "#c8382a"]];
const ATC: [string, string][] = [["#b98552", "#6a4224"], ["#bcc4cc", "#5f6872"], ["#e4e9f0", "#7a8696"], ["#c4e2ff", "#4580c4"], ["#8a3040", "#2a0a12"]];
const CLOTH: [string, string][] = [["#8d98a8", "#4f5866"], ["#4ea85e", "#22603a"], ["#7048c0", "#341c6a"]];
const ORB = ["#a8e4ff", "#d0a8ff", "#ffe48a", "#8cd0ff", "#ff7048"];
let ITEM_ID = 1, fullWarn = -99;
function idf(it: Item): IDef { return IT[it.b] ?? (IT[0] as IDef); }
function mkItem(b: number, en?: number): Item { return { id: ITEM_ID++, b: clamp(Math.floor(b), 0, IT.length - 1), en: en ?? 0 }; }
function byName(n: string): number { return Math.max(0, IT.findIndex((d: IDef) => d.n === n)); }
function startEq(cls: number): (Item | null)[] { const e = new Array<Item | null>(13).fill(null); e[0] = mkItem(byName(['短劍', '短弓', '木杖'][cls] ?? '短劍')); e[2] = mkItem(byName('皮背心')); return e; }
function clsOk(d: IDef, cls: number): boolean { return (d.m & (1 << cls)) !== 0; }
function canEnch(_d: IDef): boolean { return true; }
function isAcc(d: IDef): boolean { return d.s >= 8; }
const TITLE_STUB = Math.random() > 2;
function itemName(it: Item): string { return `${it.en > 0 ? `+${it.en} ` : ''}${it.q === 5 ? `${LGN[it.b % LGN.length] ?? ''}·` : ''}${idf(it).n}`; }
function safeOf(d: IDef): number { return d.s >= 8 ? 0 : d.s === 0 ? 6 : 4; }
function rollQ(it: Item, boss: boolean, fq?: number): void {
  const d = idf(it), r = Math.random(), b = boss ? 1 : 0;
  const q = fq ?? (r < 0.004 + b * 0.03 ? 5 : r < 0.02 + b * 0.09 ? 4 : r < 0.07 + b * 0.2 ? 3 : r < 0.19 + b * 0.35 ? 2 : r < 0.47 + b * 0.25 ? 1 : 0);
  if (q <= 0) return;
  it.q = Math.min(5, q);
  if (it.q === 5 && d.s !== 0 && d.s !== 11) { it.af = d.s === 0 ? [6 + d.t, 912, 408, 1005] : d.s >= 9 ? [208, 405, 906, 1206] : [103, 210, 505, 1108]; return; }
  const n = it.q === 1 ? 1 : it.q === 2 ? 2 : it.q === 5 ? 4 : 3, mult = it.q === 5 ? 3 : it.q >= 3 ? 2 : 1, ks: number[] = [], pool = d.s === 0 ? [0, 4, 6, 7, 8, 9, 2] : d.s === 11 ? [2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 5, 6, 7, 8, 4];
  for (let t = 0; t < 40 && ks.length < n; t++) { const k = pool[Math.floor(Math.random() * pool.length)] ?? 0; if (ks.indexOf(k) < 0) ks.push(k); }
  it.af = ks.map((k: number) => k * 100 + Math.max(1, Math.round((1 + Math.random() * (1 + d.t * 0.6)) * mult)));
  if ((it.q ?? 0) >= 4) it.af.push(([10, 11, 12][Math.floor(Math.random() * 3)] ?? 10) * 100 + (it.q === 5 ? 4 : 2) + Math.floor(Math.random() * 4));
}
function invCap(p: Pl): number { return 150 + 10 * (p.bagX ?? 0); }
function bankCap(p: Pl): number { return 80 + 20 * (p.wareX ?? 0); }
function itemPrice(it: Item): number { return idf(it).p; }
function sellPrice(it: Item): number { return Math.round((itemPrice(it) / 4) * (1 + it.en * 0.5) * (1 + (it.q ?? 0) * 0.6)); }
function defDesc(d: IDef, en: number): string {
  const a: string[] = [`【${TIERN[d.t] ?? '低階'}】${SLOTN[d.s] ?? ''}`];
  if (d.s === 0) a.push(`攻擊 +${d.atk + en}`); else if (d.ac + en > 0) a.push(`AC -${d.ac + (canEnch(d) ? en : 0)}`);
  d.st.forEach((v: number, i: number) => { if (v) a.push(`${STN[i] ?? ''}+${v}`); });
  if (d.hp) a.push(`HP+${d.hp}`);
  if (d.mp) a.push(`MP+${d.mp}`);
  if (d.m !== 7) a.push(`${[0, 1, 2].filter((c: number) => clsOk(d, c)).map((c: number) => CLN[c] ?? '').join('/')}可用`);
  return a.join(' · ');
}
const SETS: [string, string, string][] = [['死亡騎士', '攻擊 +6', '傷害 +10%、生命 +150'], ['阿克海', 'AC -2', '生命 +40'], ['黑暗', '攻擊 +4', '暴擊 +8%、吸血 +3%'], ['精靈', '敏捷 +2、移速 +6%', '閃避 +6%、暴擊 +5%'], ['秘銀', 'AC -3、抗魔 +8%', '生命 +80、魔力 +40']];
function setOf(it: Item): [string, string, string] | null { const d = idf(it); if (it.q === 5) return ['傳說共鳴', '傷害 +6%', '生命 +120、暴擊 +6%']; return SETS.find((x: [string, string, string]) => d.n.indexOf(x[0]) === 0) ?? null; }
function setCount(eq: (Item | null)[], it: Item): number { const so = setOf(it); if (!so) return 0; return eq.filter((x: Item | null) => x !== null && (setOf(x)?.[0] ?? '') === so[0]).length; }
function setText(it: Item, eq: (Item | null)[]): string { const so = setOf(it); if (!so) return ''; const n = setCount(eq, it); return `${so[0] === '傳說共鳴' ? '傳說共鳴（金色裝備）' : `${so[0]}套裝`}：目前裝備 ${n} 件 · 2件：${so[1]}${n >= 2 ? '（生效）' : ''} · 4件：${so[2]}${n >= 4 ? '（生效）' : ''}`; }
function itemDesc(it: Item): string { const d = idf(it); return defDesc(d, it.en) + (isAcc(d) ? ' · 安定值：無（飾品任何強化都可能損壞，建議用祝福卷軸）' : ` · 安定值 +${safeOf(d)}（超過後一般卷軸可能損壞）`); }
function itemCol(it: Item): string { const d = idf(it); if (it.q) return QC[it.q] ?? '#eef2f8'; return it.en >= 7 ? '#ffd860' : d.r ? '#ffa860' : it.en >= 4 ? '#9fdcff' : d.t >= 3 ? '#c8a8ff' : '#eef2f8'; }
function iconKey(it: Item): string { return `g${it.b}`; }

interface Mon { d: number; x: number; y: number; hx: number; hy: number; hp: number; mhp: number; st: number; cd: number; wx: number; wy: number; wt: number; hit: number; dead: number; face: number; anim: number; dieT: number; atkT: number; ban: number; stun: number; slow: number; el?: boolean; wb?: boolean; sc?: number; th?: Record<string, number>; lk?: string }
interface Pt { x: number; y: number }
interface Pl { ab?: number; xs?: number[]; xb?: number[]; cpn?: number; skx?: Record<number, number>; bagX?: number; wareX?: number; pk?: number; mq?: number[]; bt?: BT; bc?: number; rs?: number; kc?: number; pets?: number[][]; pa?: number; dolls?: number[]; doll?: number; poly?: number; polyT?: number; mt?: number[]; dia?: number; dq?: number[]; dqd?: string; cls: number; x: number; y: number; hp: number; mp: number; lv: number; exp: number; gold: number; pots: number; blue: number; green: number; hasteT: number; tgt: Mon | null; path: number[]; dest: Pt | null; cd: number; potCd: number; mpCd: number; skCd: number; face: number; walk: number; moving: boolean; hurt: number; dead: number; swing: number; combatT: number; repath: number; stuck: number; inv: Item[]; eq: (Item | null)[]; scrolls: number; ew: number; ea: number; bw: number; ba: number; bs: number[]; lastHit: Mon | null; hitT: number; progT: number; progD: number; fails: number; lootT: number; idleT: number; lastX: number; lastY: number; loot: Drop | null; scanT: number; home: number; bank: Item[]; q: number[]; blessT: number; sk: number[]; hb: number[]; scd: Record<number, number>; bf: Record<string, number> }
interface Proj { x: number; y: number; t: Mon; k: number; mult: number; sp: number; life: number; a: number; sk?: number; dl?: number }
function hand(p: Pl): { x: number; y: number; dl: number } { const dir = Math.cos(p.face) < -0.01 ? -1 : 1; const sy = Math.sin(p.face); return p.cls === 1 ? (sy > 0.92 ? { x: p.x + dir, y: p.y - 31, dl: 0.12 } : sy < -0.92 ? { x: p.x + dir, y: p.y - 72, dl: 0.12 } : { x: p.x + dir * 19, y: p.y - 35, dl: 0.12 }) : p.cls === 2 ? { x: p.x + dir * 30, y: p.y - 62, dl: 0.08 } : { x: p.x, y: p.y - 26, dl: 0 }; }
interface Part { x: number; y: number; vx: number; vy: number; l: number; m: number; c: string; s: number }
interface FT { x: number; y: number; t: string; c: string; l: number; m: number; sz: number }
interface Ring { x: number; y: number; r: number; v: number; l: number; m: number; c: string }
interface Line { t: string; c: string; age: number }
interface Settings { hp: number; mp: number; haste: boolean; restock: boolean; zone: number }
interface G { p: Pl; mons: Mon[]; proj: Proj[]; parts: Part[]; texts: FT[]; rings: Ring[]; log: Line[]; time: number; camX: number; camY: number; vw: number; vh: number; zoom: number; mark: (Pt & { l: number }) | null; drops: Drop[]; flash: { c: string; l: number } | null; banner: { t: string; c: string; l: number } | null; shake: number; req: string; wantShop: boolean; wantNpc: Npc | null; npc: Npc | null; folk: Folk[]; panel: boolean; zone: number; set: Settings; auto: boolean; huntZ: number; autoPause: number; retreat: boolean; stocked: boolean; bolts: Bolt[]; pet: Pet | null; owMons: Mon[] | null; stairT: number; bots: Bot[]; bp: BP[]; chatT: number; fx: Fx[]; qg?: number }
interface Bot { n: string; cls: number; lv: number; exp: number; wt: number; at: number; ck: string; x: number; y: number; face: number; walk: number; mv: boolean; st: number; wx: number; wy: number; tg: Mon | null; cd: number; swing: number; hp: number; say: string; sayT: number; tm: number; z: number; pt: number; scan: number; kc?: number; en?: number; php?: number; ag?: number; dd?: number; acd?: number; vs?: number; dn?: number; agT?: number }
interface BP { x: number; y: number; m: Mon; d: number; k: number; b: number }
interface Inp { keys: Record<string, boolean>; down: boolean; id: number; sx: number; sy: number; rt: number }
interface St { mhp: number; mmp: number; atk: number; def: number; ac: number; a: number[]; hit: number; dodge: number; crit: number; vamp: number; dmgB: number; mr: number; spd: number; hpR: number; mpR: number; sets: string[] }

function rnd(a: number, b: number): number { return a + Math.random() * (b - a); }
function clamp(v: number, a: number, b: number): number { return v < a ? a : v > b ? b : v; }
function md(m: Mon): MDef { return MD[m.d] ?? (MD[0] as MDef); }
function cl(i: number): CDef { return CL[i] ?? (CL[0] as CDef); }
function needExp(lv: number): number { return Math.round(20 * Math.pow(lv, 2.1)); }
function zoneOf(tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return 0;
  return ZMAP[ty * MW + tx] ?? 0;
}
function zoneAt(x: number, y: number): number { return zoneOf(Math.floor(x / TS), Math.floor(y / TS)); }
function mulberry(seed: number): () => number {
  let a = seed;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

interface Bld { k: number; x: number; y: number; w: number; h: number; st: number }
interface Prop { k: number; x: number; y: number; c: number }
interface Npc { n: string; k: number; x: number; y: number; t: number; lk: number }
interface Folk { n: string; x: number; y: number; hx: number; hy: number; wx: number; wy: number; wt: number; face: number; walk: number; mv: boolean; lk: number; say: string; sayT: number }
const BKN = ['雜貨店', '鐵匠鋪', '魔法商店', '倉庫', '神殿'];
const BLAYS: [number, number, number, number, number][][] = [[[0, 4, 4, 4, 2], [1, 10, 4, 4, 2], [2, 23, 4, 4, 2], [3, 4, 19, 4, 2], [4, 23, 19, 5, 3]], [[0, 3, 3, 4, 2], [1, 3, 9, 4, 2], [2, 29, 3, 4, 2], [3, 29, 9, 4, 2], [4, 15, 4, 6, 3]]];
const NPCN = [['雜貨商 托雷', '鐵匠 巴爾德', '魔法商人 伊莉莎', '倉庫管理員 杜克', '祭司 瑪麗安', '傳送師 露西亞', '村長 哈丁', '飾品商人 莉娜'], ['雜貨商 卡洛', '鐵匠 葛倫', '魔法商人 賽菲爾', '倉庫管理員 波特', '祭司 艾琳', '傳送師 諾娃', '城主 雷歐', '飾品商人 米雅']];
NPCN[0]?.push('工匠 歐文', '兌換商 菲莉絲', '寵物・變身商 吉米', '聲望官 葛雷', '副本管理員 娜塔'); NPCN[1]?.push('工匠 哈洛', '兌換商 蕾娜', '寵物・變身商 波波', '聲望官 威爾', '副本管理員 奥斯卡');
const NPOSS: [number, number][][] = [[[6, 7], [12, 7], [25, 7], [6, 22.2], [25.5, 23.2], [13, 10.6], [22.5, 10.6], [13, 17.6], [21.6, 17.6], [29, 10.6], [29, 17.6], [8, 10.6], [9.5, 17.6]], [[5, 6.2], [5, 12.2], [31, 6.2], [31, 12.2], [18, 8.3], [12, 15.6], [18, 11.6], [24, 15.6], [12, 21], [24, 21], [8, 24], [30, 22.6], [18, 23.2]]];
function enterArena(g: G, i: number): string {
  const a = ARENAS[i], p = g.p; if (!a) return '';
  const sug = Math.max(a.lv, MD[a.mi]?.lv ?? a.lv); if (p.lv < sug) addLog(g, `建議等級 Lv.${sug}，你目前 Lv.${p.lv}，請小心！`, '#ffb070');
  const left = arenaLeft(i); if (left > 0) return `${a.n} 尚未復活，還要 ${fmtT(left)}。`;
  const id = arenaId(i), info = ensureDun(id); if (!info) return '';
  if (WID === 0) ARET = { x: p.x, y: p.y };
  goWorld(g, id, info.up.x, info.up.y, true); addLog(g, `進入 BOSS 挑戰場：${a.n}！擊敗後 ${ACD / 60} 分鐘才會再次出現。從下方的出口階梯離開。`, '#ff9070');
  g.banner = { t: `BOSS 挑戰：${a.n}`, c: '#ff8060', l: 2.5 };
  return `已傳送到 ${a.n} 的挑戰場`;
}
function enterDun(g: G, di: number, f: number): string {
  const D = DUNS[di], p = g.p; if (!D) return '';
  const need = Math.max(1, D.lv - 5 + f * 3);
  if (p.lv < need) addLog(g, `${D.n} ${f + 1}F 建議等級 Lv.${need}，請小心！`, '#ffb070');
  const id = 1 + di * 10 + f, info = ensureDun(id); if (!info) return '';
  goWorld(g, id, info.up.x, info.up.y, true); addLog(g, `副本管理員把你傳送到了${D.n} ${f + 1}F。`, '#ffb070');
  return `已傳送到 ${D.n} ${f + 1}F`;
}
const RKN = ['見習', '三等兵', '二等兵', '一等兵', '老兵', '下士', '中士', '上士', '士官長', '少尉', '中尉', '上尉', '少校', '中校', '上校', '少將', '中將', '上將'];
const RKT = [0, 100, 1000, 5000, 10000, 18000, 28000, 40000, 55000, 75000, 100000, 130000, 170000, 220000, 280000, 350000, 450000, 600000];
function rkBonus(i: number): number[] { return i <= 0 ? [0, 0, 0, 0, 0, 0, 0] : [i * 20, i % 2 ? i * 8 : 0, Math.floor(i * 0.7), Math.floor(i / 3), Math.floor(i / 4), i >= 6 ? Math.floor((i - 3) / 3) : 0, i >= 9 ? (i - 8) * 2 : 0]; }
const WBS = { P: 0, B: 0, T: 300, L: 0, m: null as Mon | null, D: {} as Record<string, number> };
function wbLoad(): void { try { const v = Number((typeof localStorage !== 'undefined' ? localStorage.getItem('sm_wbt') : null) ?? 0); if (v > 0) WBS.T = clamp((v - Date.now()) / 1000, 20, 300); } catch { /* ignore */ } }
function wbSet(sec: number): void { WBS.T = sec; try { localStorage.setItem('sm_wbt', String(Date.now() + sec * 1000)); } catch { /* ignore */ } }
wbLoad();
function rankOf(kc: number): number { let r = 0; RKT.forEach((t: number, i: number) => { if (kc >= t) r = i; }); return r; }
interface PSp { n: string; m: number; c: number; dia: number; sk: string; mu: number; aoe: number; d: string }
const PSP: PSp[] = [
  { n: '柴犬', m: 3, c: 3000, dia: 0, sk: '撕咬', mu: 2.2, aoe: 0, d: '忠心的狗狗，技能「撕咬」220% 傷害' },
  { n: '黑豹', m: 13, c: 9000, dia: 0, sk: '疾風爪', mu: 1.4, aoe: 0, d: '攻速快，技能「疾風爪」連抓三下' },
  { n: '雪原熊', m: 16, c: 18000, dia: 0, sk: '震地', mu: 1.6, aoe: 90, d: '技能「震地」範圍 160% 傷害並暈眩' },
  { n: '火狐', m: 19, c: 36000, dia: 0, sk: '火焰吐息', mu: 2.4, aoe: 70, d: '技能「火焰吐息」範圍 240% 火焰傷害' },
  { n: '幼龍', m: 39, c: 0, dia: 400, sk: '龍息', mu: 3.2, aoe: 110, d: '鑽石限定，技能「龍息」範圍 320% 傷害' },
];
const POLY = [{ lv: 1, m: 3, n: '灰狼' }, { lv: 10, m: 8, n: '狼人' }, { lv: 15, m: 14, n: '獸人酋長' }, { lv: 20, m: 16, n: '雪怪' }, { lv: 25, m: 38, n: '龍人戰士' }, { lv: 30, m: 20, n: '炎魔' }, { lv: 36, m: 39, n: '小飛龍' }];
function polyText(i: number): string { return `攻速 +${4 * (i + 1)}%、傷害 +${3 * (i + 1)}%${i ? `、AC -${i}、移速 +${3 * i}%` : ''}`; }
const DOLL = [{ n: '石頭高崙', m: 17, c: 2000, d: 'AC -3' }, { n: '狼人娃娃', m: 8, c: 4000, d: '攻擊 +3' }, { n: '雪怪娃娃', m: 16, c: 6000, d: '魔力回復 +50%、生命 +40' }, { n: '巫妖娃娃', m: 34, c: 0, d: '暴擊 +4%、魔力回復 +40%（鑽石兌換）' }, { n: '龍騎士娃娃', m: 39, c: 0, d: '傷害 +6%、生命 +100（鑽石兌換）' }];
const BPT = { x: 0, y: 0, face: 1, walk: 0, cd: 0, sk: 5, atk: 0, tg: null as Mon | null, say: '', sayT: 0 };
function petAtk(pd: number[]): number { return Math.round((6 + (pd[1] ?? 1) * 2.4) * (1 + (pd[0] ?? 0) * 0.22)); }
function petNeed(lv: number): number { return Math.round(40 * Math.pow(lv, 1.7)); }
let PMODE = 1, PHIDE = false;
const PMN = ['跟隨', '攻擊', '待命'];
function curPet(p: Pl): number[] | undefined { return !PHIDE && (p.pa ?? -1) >= 0 ? p.pets?.[p.pa ?? -1] : undefined; }
function rkText(i: number): string { const b = rkBonus(i), n = ['生命 +', '魔力 +', '攻擊 +', 'AC -', '暴擊 +', '閃避 +', '傷害 +'], u = ['', '', '', '', '%', '%', '%']; return b.map((v: number, j: number) => v ? `${n[j] ?? ''}${v}${u[j] ?? ''}` : '').filter((t: string) => t !== '').join('、') || '無'; }
const PLAYS: [number, number, number][][] = [[[3, 2.5, 6.6], [3, 27.5, 6.6], [4, 14.6, 11], [4, 21.4, 16.9], [1, 9, 6.6], [2, 9.6, 6.9], [1, 27.6, 22.4], [6, 11, 25.6], [6, 13.6, 25.6], [6, 22, 25.6], [7, 1.3, 12.3], [7, 34.7, 12.3], [7, 15.6, 26.6], [7, 20.4, 26.6], [9, 15, 21.4], [8, 11.4, 11.4], [5, 18, 14.7]], [[3, 14, 10], [3, 22, 10], [4, 12, 17.5], [4, 24, 17.5], [1, 7.8, 5.6], [2, 28.4, 5.6], [6, 21, 25.6], [6, 24, 25.6], [6, 27, 25.6], [7, 1.3, 12.3], [7, 34.7, 12.3], [7, 15.6, 26.6], [7, 20.4, 26.6], [9, 14, 22], [8, 10.5, 16.4], [5, 18, 20.7]]];
const FOLKN = [['村民 安娜', '小孩 提姆', '衛兵 雷克斯', '旅人 莫里', '吟遊詩人 費恩', '農夫 布魯'], ['商人 卡特', '少女 艾米', '衛兵 布朗', '旅人 席恩', '吟遊詩人 奧菲', '礦工 霍克']];
const FOLKS = ['聽說幽暗森林裡有狼人出沒……', '風木城的鐵匠手藝一流！', '出門前記得帶回城卷軸。', '古代遺跡深處封印著魔王。', '+7 以上的武器會發出光芒呢！', '今天天氣真好～', '倉庫在兩座城鎮是共用的喔。', '村長正在找人幫忙打史萊姆。', '雪原上的雪怪力氣很大，小心！', '傳送師可以送你到各個獵場。'];
let BLDS: Bld[] = [], PROPS: Prop[] = [], NPCS: Npc[] = [], ZPT: Pt[] = [];
interface WState { m: Uint8Array; d: Uint8Array; z: Int8Array; r: Uint8Array }
interface DInfo { up: Pt; dn: Pt | null; boss: Pt | null }
interface DDef { n: string; lv: number; fl: number; tf: number; tw: number; ex: number; ey: number; th: number; am: string }
const DUNS: DDef[] = [{ n: '妖魔洞窟', lv: 10, fl: 3, tf: 19, tw: 20, ex: 70, ey: 64, th: 0, am: '8,4,2' }, { n: '象牙塔', lv: 18, fl: 3, tf: 21, tw: 22, ex: 104, ey: 100, th: 1, am: '6,8,26' }, { n: '龍之地監', lv: 32, fl: 3, tf: 23, tw: 17, ex: 164, ey: 127, th: 2, am: '18,3,2' },
  { n: '傲慢之塔', lv: 38, fl: 3, tf: 21, tw: 22, ex: 178, ey: 140, th: 1, am: '16,4,26' }, { n: '火龍窟', lv: 46, fl: 3, tf: 23, tw: 17, ex: 150, ey: 146, th: 2, am: '30,6,0' }, { n: '冰之女王城', lv: 54, fl: 3, tf: 21, tw: 22, ex: 184, ey: 112, th: 1, am: '2,14,30' }, { n: '混沌神殿', lv: 62, fl: 3, tf: 19, tw: 20, ex: 140, ey: 120, th: 0, am: '12,2,22' }];
let WID = 0, OW: WState | null = null, DENT: Pt[] = [], DARR: Pt[] = [];
const WCACHE: Record<number, WState> = {}, DINFO: Record<number, DInfo> = {};
let MAP: Uint8Array = new Uint8Array(0), DEC: Uint8Array = new Uint8Array(0), ZMAP: Int8Array = new Int8Array(0), REACH: Uint8Array = new Uint8Array(0);
function hash2(x: number, y: number, s: number): number { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x: number, y: number, s: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, s: number): number { return vnoise(x, y, s) * 0.6 + vnoise(x * 2.1, y * 2.1, s + 7) * 0.3 + vnoise(x * 4.3, y * 4.3, s + 13) * 0.1; }
function genWorld(seed: number): { m: Uint8Array; d: Uint8Array; z: Int8Array; r: Uint8Array } {
  const w = MW, h = MH, N = w * h, R = mulberry(seed);
  const m = new Uint8Array(N), d = new Uint8Array(N), z = new Int8Array(N), r = new Uint8Array(N);
  const inT = (x: number, y: number, pad: number): boolean => TOWNS.some((t: Town) => x >= t.x - pad && x < t.x + TW + pad && y >= t.y - pad && y < t.y + TH + pad);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    d[i] = Math.floor(R() * 256);
    if (inT(x, y, 0)) { z[i] = -1; m[i] = 1; continue; }
    const wx = x + (fbm(x * 0.04, y * 0.04, seed + 1) - 0.5) * 36, wy = y + (fbm(x * 0.04, y * 0.04, seed + 2) - 0.5) * 36;
    let bz = 0, bd = 1e9;
    for (const s of ZS) { const ex = wx - s[1], ey = wy - s[2], dd = ex * ex + ey * ey; if (dd < bd) { bd = dd; bz = s[0]; } }
    z[i] = bz;
    const q = R(), n = fbm(x * 0.13, y * 0.13, seed + 3), wn = fbm(x * 0.07, y * 0.07, seed + 5), rv = Math.abs(fbm(x * 0.025, y * 0.025, seed + 9) - 0.5);
    const tp = [0.03, 0.02, 0.16, 0.07, 0.012, 0.06, 0.03, 0.04][bz] ?? 0.03;
    let v = ZG[bz] ?? 0;
    if (q < tp || (n > 0.64 && q < tp * 4)) v = bz === 7 ? 17 : 2;
    else if (q > 0.988) v = 7;
    if (wn > (bz === 3 ? 0.6 : 0.71)) v = bz === 6 ? 13 : 3;
    if (rv < 0.011 && bz < 6) v = 3;
    if (bz === 6 && rv < 0.016) v = 13;
    if (inT(x, y, 3)) v = ZG[bz] ?? 0;
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) v = 7;
    m[i] = v;
  }
  TOWNS.forEach((t: Town, ti: number) => {
    const st = (rx: number, ry: number, v: number): void => { m[(t.y + ry) * w + t.x + rx] = v; };
    for (let ry = 0; ry < TH; ry++) for (let rx = 0; rx < TW; rx++) {
      const gate = ((ry === 0 || ry === TH - 1) && (rx === 17 || rx === 18)) || ((rx === 0 || rx === TW - 1) && (ry === 13 || ry === 14));
      const edge = rx === 0 || ry === 0 || rx === TW - 1 || ry === TH - 1;
      const cross = (ry >= 12 && ry <= 15) || (rx >= 16 && rx <= 19);
      const g0 = ti === 0 ? (cross || ((ry === 7 || ry === 8 || ry === 22 || ry === 23) && rx >= 3 && rx <= 32) ? 1 : rx >= 14 && rx <= 21 && ry >= 10 && ry <= 17 ? 16 : 0)
        : (cross || ((rx === 9 || rx === 10 || rx === 25 || rx === 26) && ry >= 5 && ry <= 23) || ((ry === 5 || ry === 6 || ry === 22 || ry === 23) && rx >= 9 && rx <= 26) ? 1 : 16);
      st(rx, ry, edge && !gate ? 4 : g0);
    }
    for (const [k, bx, by, bw, bh] of BLAYS[ti] ?? []) { for (let yy = 0; yy < bh; yy++) for (let xx = 0; xx < bw; xx++) st(bx + xx, by + yy, 15); BLDS.push({ k, x: t.x + bx, y: t.y + by, w: bw, h: bh, st: ti }); }
    const fy = ti === 0 ? 13 : 19; st(17, fy, 15); st(18, fy, 15); st(17, fy + 1, 15); st(18, fy + 1, 15);
    for (const [k, px, py] of PLAYS[ti] ?? []) { PROPS.push({ k, x: (t.x + px) * TS, y: (t.y + py) * TS, c: ti }); if (k === 6) st(Math.floor(px), Math.floor(py), 15); }
    for (let rx = 1; rx < TW - 2; rx += 2) { if (rx === 17) continue; for (const ry of [0.9, TH - 0.15]) PROPS.push({ k: 20, x: (t.x + rx + 1) * TS, y: (t.y + ry) * TS, c: ti }); }
    for (let ry = 1; ry < TH - 1; ry++) { if (ry >= 12 && ry <= 15) continue; for (const rx of [0.5, TW - 0.5]) PROPS.push({ k: 21, x: (t.x + rx) * TS, y: (t.y + ry + 0.9) * TS, c: ti }); }
    for (const [tx, ty] of (ti === 0 ? [[2, 4], [2, 9], [2, 18], [2, 24], [33, 4], [33, 9], [33, 18], [33, 24]] : [[2, 17], [2, 21], [33, 17], [33, 21], [9, 2], [26, 2]]) as [number, number][]) st(tx, ty, 2);
    (NPOSS[ti] ?? []).forEach((np: [number, number], k: number) => NPCS.push({ n: NPCN[ti]?.[k] ?? '', k, x: (t.x + np[0]) * TS, y: (t.y + np[1]) * TS, t: ti, lk: k === 9 ? 14 : k }));
    if (ti === 0) { st(17, 10, 15); st(18, 10, 15); NPCS.push({ n: '英雄排行榜', k: 13, x: (t.x + 18) * TS, y: (t.y + 10.95) * TS, t: 0, lk: 0 }); }
  });
  const paint = (x: number, y: number): void => { if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) return; const i = y * w + x; if (z[i] === -1) return; m[i] = m[i] === 3 ? 18 : 8; };
  const road = (ax: number, ay: number, bx: number, by: number): void => {
    let x = ax, y = ay, guard = 0;
    while ((x !== bx || y !== by) && guard++ < 3000) {
      const dx = bx - x, dy = by - y;
      if (dy === 0 || (dx !== 0 && R() < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)))) x += Math.sign(dx); else y += Math.sign(dy);
      paint(x, y); paint(x + 1, y); paint(x, y + 1); paint(x + 1, y + 1);
    }
  };
  const gates = (t: Town): [number, number][] => [[t.x + 17, t.y], [t.x + 17, t.y + TH - 1], [t.x, t.y + 13], [t.x + TW - 1, t.y + 13]];
  const T0 = TOWNS[0], T1 = TOWNS[1];
  if (T0 && T1) road(T0.x + TW - 1, T0.y + 13, T1.x + 17, T1.y + TH - 1);
  for (const s of ZS) {
    let bg: [number, number] = [0, 0], bd = 1e9;
    for (const t of TOWNS) for (const gp of gates(t)) { const dd = Math.hypot(gp[0] - s[1], gp[1] - s[2]); if (dd < bd) { bd = dd; bg = gp; } }
    road(bg[0], bg[1], s[1], s[2]);
  }
  for (const bzn of [5, 6, 7]) {
    const s = ZS.find((q: [number, number, number]) => q[0] === bzn);
    if (!s) continue;
    for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) { const x = s[1] + xx, y = s[2] + yy; if (x > 0 && y > 0 && x < w - 1 && y < h - 1 && xx * xx + yy * yy <= 18) m[y * w + x] = ZG[bzn] ?? 0; }
  }
  const sx = (T0 ? T0.x : 0) + 13, sy = (T0 ? T0.y : 0) + 12, stk: number[] = [sy * w + sx];
  r[sy * w + sx] = 1;
  while (stk.length) {
    const c = stk.pop() ?? 0, cx = c % w, cy = (c - cx) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][]) {
      const nx = cx + dx, ny = cy + dy, n = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || r[n] || BLOCK[m[n] ?? 4]) continue;
      r[n] = 1; stk.push(n);
    }
  }
  return { m, d, z, r };
}
function nearFree(tx: number, ty: number): Pt | null {
  for (let rr = 0; rr < 16; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== rr) continue;
    const x = tx + dx, y = ty + dy;
    if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
    const i = y * MW + x;
    if (!blk(x, y) && REACH[i] === 1 && (ZMAP[i] ?? 0) !== -1) return { x: (x + 0.5) * TS, y: (y + 0.5) * TS };
  }
  return null;
}
function initWorld(): void {
  BLDS = []; PROPS = []; NPCS = [];
  const W0 = genWorld(WSEED);
  MAP = W0.m; DEC = W0.d; ZMAP = W0.z; REACH = W0.r;
  ZPT = [0, 1, 2, 3, 4, 5, 6, 7].map((zz: number) => { const ss = ZS.filter((q: [number, number, number]) => q[0] === zz), s = ss[ss.length - 1]; return (s ? nearFree(s[1] - 7, s[2] - 5) : null) ?? { x: SPAWN_X, y: SPAWN_Y }; });
  DENT = []; DARR = [];
  DUNS.forEach((D: DDef, i: number) => {
    const e = nearFree(D.ex, D.ey) ?? { x: SPAWN_X, y: SPAWN_Y }, tx = Math.floor(e.x / TS), ty = Math.floor(e.y / TS);
    MAP[ty * MW + tx] = 24; DENT.push(e); DARR.push(beside(e));
  });
  OW = { m: MAP, d: DEC, z: ZMAP, r: REACH };
}
initWorld();
function blk(tx: number, ty: number): boolean {
  if (tx <= 0 || ty <= 0 || tx >= MW - 1 || ty >= MH - 1) return true;
  const t = MAP[ty * MW + tx] ?? 4;
  if (t === 17 && WID === 0) return false;
  return BLOCK[t] === 1;
}
function free(x: number, y: number, r: number, mon: boolean): boolean {
  const k = r * 0.7;
  for (const [a, b] of [[-k, -k], [k, -k], [-k, k], [k, k]] as [number, number][]) {
    const tx = Math.floor((x + a) / TS), ty = Math.floor((y + b) / TS);
    if (blk(tx, ty) || (mon && zoneOf(tx, ty) === -1)) return false;
  }
  return true;
}
function moveBy(o: Pt, dx: number, dy: number, r: number, mon: boolean): void {
  if (free(o.x + dx, o.y, r, mon)) o.x += dx;
  if (free(o.x, o.y + dy, r, mon)) o.y += dy;
}
function los(ax: number, ay: number, bx: number, by: number): boolean {
  const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 10);
  for (let i = 1; i <= n; i++) { const t = i / n; if (!free(ax + (bx - ax) * t, ay + (by - ay) * t, PR, false)) return false; }
  return true;
}
const PREV = new Int32Array(MW * MH), QU = new Int32Array(MW * MH), GS = new Float32Array(MW * MH), SEEN = new Int32Array(MW * MH), HF = new Float32Array(MW * MH * 2);
const DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
let PGEN = 0, PPART = false;
function nearOpen(tx: number, ty: number): number {
  for (let rr = 0; rr < 6; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== rr) continue;
    if (!blk(tx + dx, ty + dy)) return (ty + dy) * MW + tx + dx;
  }
  return -1;
}
function findPath(sx: number, sy: number, gx: number, gy: number, part?: boolean): number[] | null {
  const s = Math.floor(sy / TS) * MW + Math.floor(sx / TS);
  let gtx = Math.floor(gx / TS), gty = Math.floor(gy / TS);
  if (blk(gtx, gty)) { const o = nearOpen(gtx, gty); if (o < 0) return null; gtx = o % MW; gty = Math.floor(o / MW); }
  const g = gty * MW + gtx;
  PPART = false;
  if (s === g) return [];
  if (++PGEN > 2e9) { PGEN = 1; SEEN.fill(0); }
  const hh = (n: number): number => { const dx = Math.abs((n % MW) - gtx), dy = Math.abs(Math.floor(n / MW) - gty); return Math.max(dx, dy) + 0.4142 * Math.min(dx, dy); };
  // binary heap of (f, node) pairs
  let hn = 0;
  const push = (f: number, n: number): void => { let k = hn++; while (k > 0) { const pa = (k - 1) >> 1; if ((HF[pa * 2] ?? 0) <= f) break; HF[k * 2] = HF[pa * 2] ?? 0; HF[k * 2 + 1] = HF[pa * 2 + 1] ?? 0; k = pa; } HF[k * 2] = f; HF[k * 2 + 1] = n; };
  const pop = (): number => { const top = HF[1] ?? 0; hn--; const lf = HF[hn * 2] ?? 0, ln = HF[hn * 2 + 1] ?? 0; let k = 0; for (;;) { let c = k * 2 + 1; if (c >= hn) break; if (c + 1 < hn && (HF[(c + 1) * 2] ?? 0) < (HF[c * 2] ?? 0)) c++; if ((HF[c * 2] ?? 0) >= lf) break; HF[k * 2] = HF[c * 2] ?? 0; HF[k * 2 + 1] = HF[c * 2 + 1] ?? 0; k = c; } HF[k * 2] = lf; HF[k * 2 + 1] = ln; return top; };
  SEEN[s] = PGEN; GS[s] = 0; PREV[s] = s; push(hh(s), s);
  let best = s, bh = hh(s), found = false, it = 0;
  while (hn > 0 && it++ < 40000) {
    const c = pop();
    if (c === g) { found = true; break; }
    const cx = c % MW, cy = (c - cx) / MW, cg = GS[c] ?? 0;
    const ch = hh(c); if (ch < bh) { bh = ch; best = c; }
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx, ny = cy + dy;
      if (blk(nx, ny)) continue;
      if (dx !== 0 && dy !== 0 && (blk(cx + dx, cy) || blk(cx, cy + dy))) continue;
      const n = ny * MW + nx;
      let w = dx !== 0 && dy !== 0 ? 1.4142 : 1;
      if (blk(nx + 1, ny) || blk(nx - 1, ny) || blk(nx, ny + 1) || blk(nx, ny - 1)) w += 0.35;
      const ng = cg + w;
      if (SEEN[n] === PGEN && ng >= (GS[n] ?? 0)) continue;
      SEEN[n] = PGEN; GS[n] = ng; PREV[n] = c; push(ng + hh(n), n);
    }
  }
  let e = g;
  if (!found) { if (!part || best === s) return null; e = best; PPART = true; }
  const out: number[] = [];
  let c = e, guard = 0;
  while (c !== s && guard++ < 20000) { out.push(c); c = PREV[c] ?? s; }
  if (QU.length < 0) QU[0] = 0;
  return out.reverse();
}

/* ---------- dungeons ---------- */
function beside(pt: Pt): Pt {
  const bx = Math.floor(pt.x / TS), by = Math.floor(pt.y / TS);
  for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [0, 2]] as [number, number][]) {
    const tx = bx + dx, ty = by + dy, t = MAP[ty * MW + tx] ?? 4;
    if (!blk(tx, ty) && t !== 24 && t !== 25) return { x: (tx + 0.5) * TS, y: (ty + 0.5) * TS };
  }
  return pt;
}
function genDun(id: number): WState {
  const di = Math.floor((id - 1) / 10), f = (id - 1) % 10, D = DUNS[di] ?? (DUNS[0] as DDef), R = mulberry(WSEED + id * 7919), W = 72, H = 60;
  const N = MW * MH, m = new Uint8Array(N).fill(D.tw), d = new Uint8Array(N), z = new Int8Array(N).fill(8 + di), r = new Uint8Array(N);
  for (let i = 0; i < N; i++) d[i] = Math.floor(R() * 256);
  const rooms: [number, number, number, number][] = [];
  for (let k = 0; k < 400 && rooms.length < 14; k++) {
    const w = 6 + Math.floor(R() * 9), h = 5 + Math.floor(R() * 7), x = 2 + Math.floor(R() * (W - w - 4)), y = 2 + Math.floor(R() * (H - h - 4));
    if (rooms.some((q: [number, number, number, number]) => x < q[0] + q[2] + 2 && x + w + 2 > q[0] && y < q[1] + q[3] + 2 && y + h + 2 > q[1])) continue;
    rooms.push([x, y, w, h]);
  }
  const set = (x: number, y: number): void => { if (x > 0 && y > 0 && x < W && y < H) m[y * MW + x] = D.tf; };
  if (f >= 5) {
    const cx = 36, cy = 28, rx = 15, ry = 12;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const e = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (e < 1 + (R() - 0.5) * 0.08) set(x, y); }
    for (let y = cy + ry - 1; y < cy + ry + 6; y++) for (let x = cx - 1; x <= cx + 1; x++) set(x, y);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU + 0.39, px = Math.round(cx + Math.cos(a) * rx * 0.72), py = Math.round(cy + Math.sin(a) * ry * 0.72); m[py * MW + px] = D.tw; }
    const up: [number, number] = [cx, cy + ry + 5];
    m[up[1] * MW + up[0]] = 25;
    DINFO[id] = { up: { x: (up[0] + 0.5) * TS, y: (up[1] + 0.5) * TS }, dn: null, boss: { x: (cx + 0.5) * TS, y: (cy - 2 + 0.5) * TS } };
    const s1 = up[1] * MW + up[0], sk1: number[] = [s1]; r[s1] = 1;
    while (sk1.length) { const c = sk1.pop() ?? 0, qx = c % MW, qy = (c - qx) / MW; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][]) { const nx = qx + dx, ny = qy + dy, n = ny * MW + nx; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH || r[n] || BLOCK[m[n] ?? 4]) continue; r[n] = 1; sk1.push(n); } }
    return { m, d, z, r };
  }
  for (const [x, y, w, h] of rooms) for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy);
  const ctr = (q: [number, number, number, number] | undefined): [number, number] => (q ? [q[0] + Math.floor(q[2] / 2), q[1] + Math.floor(q[3] / 2)] : [10, 10]);
  const dig = (a: [number, number], b: [number, number]): void => {
    let x = a[0], y = a[1];
    const sx = (): void => { while (x !== b[0]) { set(x, y); set(x, y + 1); x += Math.sign(b[0] - x); } };
    const sy = (): void => { while (y !== b[1]) { set(x, y); set(x + 1, y); y += Math.sign(b[1] - y); } };
    if (R() < 0.5) { sx(); sy(); } else { sy(); sx(); }
    set(x, y); set(x + 1, y); set(x, y + 1);
  };
  rooms.sort((a: [number, number, number, number], b: [number, number, number, number]) => a[0] + a[1] * 0.5 - (b[0] + b[1] * 0.5));
  for (let i = 1; i < rooms.length; i++) dig(ctr(rooms[i - 1]), ctr(rooms[i]));
  for (let i = 0; i < 3 && rooms.length > 4; i++) dig(ctr(rooms[Math.floor(R() * rooms.length)]), ctr(rooms[Math.floor(R() * rooms.length)]));
  for (const [x, y, w, h] of rooms) if (w >= 10 && h >= 8) for (const [px, py] of [[x + 2, y + 2], [x + w - 3, y + 2], [x + 2, y + h - 3], [x + w - 3, y + h - 3]] as [number, number][]) m[py * MW + px] = D.tw;
  const up = ctr(rooms[0]);
  let far = up, fd = -1;
  for (const q of rooms) { const c = ctr(q), dd = Math.hypot(c[0] - up[0], c[1] - up[1]); if (dd > fd) { fd = dd; far = c; } }
  const pt = (c: [number, number]): Pt => ({ x: (c[0] + 0.5) * TS, y: (c[1] + 0.5) * TS });
  m[up[1] * MW + up[0]] = 25;
  const last = f >= D.fl - 1;
  if (!last) m[far[1] * MW + far[0]] = 24;
  DINFO[id] = { up: pt(up), dn: last ? null : pt(far), boss: last ? pt(far) : null };
  const s0 = up[1] * MW + up[0], stk: number[] = [s0];
  r[s0] = 1;
  while (stk.length) {
    const c = stk.pop() ?? 0, cx = c % MW, cy = (c - cx) / MW;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][]) {
      const nx = cx + dx, ny = cy + dy, n = ny * MW + nx;
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH || r[n] || BLOCK[m[n] ?? 4]) continue;
      r[n] = 1; stk.push(n);
    }
  }
  return { m, d, z, r };
}
function setWorld(id: number): void {
  if (id === WID) return;
  if (WID === 0) OW = { m: MAP, d: DEC, z: ZMAP, r: REACH };
  let w: WState | null | undefined = id === 0 ? OW : WCACHE[id];
  if (!w) { w = genDun(id); WCACHE[id] = w; }
  MAP = w.m; DEC = w.d; ZMAP = w.z; REACH = w.r; WID = id;
  CHUNKS.clear(); MINI = null;
}
function ensureDun(id: number): DInfo | null { if (!WCACHE[id]) WCACHE[id] = genDun(id); return DINFO[id] ?? null; }
function spawnDun(id: number): Mon[] {
  const di = Math.floor((id - 1) / 10), f = (id - 1) % 10, D = DUNS[di], info = DINFO[id], out: Mon[] = [];
  const ai = arenaOf(id);
  if (ai >= 0 || f >= 5) { const a = ARENAS[ai]; if (a && info && info.boss && arenaLeft(ai) <= 0) { const bm = mkMon(a.mi, info.boss.x, info.boss.y); bm.mhp = Math.round(bm.mhp * 1.5); bm.hp = bm.mhp; out.push(bm); } return out; }
  MD.forEach((d: MDef, i: number) => {
    if (d.z !== 8 + di) return;
    if (d.b) { if (D && f === D.fl - 1 && info && info.boss) out.push(mkMon(i, info.boss.x, info.boss.y)); return; }
    if (d.fl > f) return;
    const n = Math.round(d.cnt * (d.fl === f ? 1.8 : 1.1));
    for (let k = 0; k < n; k++) for (let t = 0; t < 300; t++) {
      const x = 1 + Math.floor(Math.random() * 72), y = 1 + Math.floor(Math.random() * 60);
      if (REACH[y * MW + x] !== 1 || blk(x, y) || (info && Math.hypot((x + 0.5) * TS - info.up.x, (y + 0.5) * TS - info.up.y) < 8 * TS)) continue;
      out.push(mkMon(i, (x + 0.5) * TS, (y + 0.5) * TS)); break;
    }
  });
  let ei = -1;
  MD.forEach((d: MDef, i: number) => { if (d.z === 8 + di && !d.b && d.fl <= f && (ei < 0 || d.lv > (MD[ei]?.lv ?? 0))) ei = i; });
  if (ei >= 0) for (let t = 0; t < 400; t++) {
    const x = 1 + Math.floor(Math.random() * 72), y = 1 + Math.floor(Math.random() * 60);
    if (REACH[y * MW + x] !== 1 || blk(x, y) || (info && Math.hypot((x + 0.5) * TS - info.up.x, (y + 0.5) * TS - info.up.y) < 14 * TS)) continue;
    const em = mkMon(ei, (x + 0.5) * TS, (y + 0.5) * TS); em.el = true; em.mhp *= 6; em.hp = em.mhp; out.push(em); break;
  }
  return out;
}
function goWorld(g: G, id: number, x: number, y: number, near: boolean): void {
  if (id !== WID) {
    if (WID === 0) g.owMons = g.mons;
    setWorld(id);
    g.mons = id === 0 ? g.owMons ?? spawnMons([0, 1, 2, 3, 4, 5, 6, 7]) : spawnDun(id);
    if (id === 0) g.owMons = null;
    g.drops = []; g.proj = []; g.zone = -99;
  }
  const p = g.p, a = near ? beside({ x, y }) : { x, y };
  p.x = a.x; p.y = a.y; p.tgt = null; p.path = []; p.dest = null; p.lastHit = null; p.loot = null;
  if (g.pet) { g.pet.x = a.x - 20; g.pet.y = a.y + 8; g.pet.tg = null; }
  const qi = g.qg ?? -1, qq = QD[qi];
  if (qi >= 0 && qq) huntTarget(g, qq);
}
function dunName(): string { if (WID === 0) return ''; const ai = arenaOf(WID); if (ai >= 0 || (WID - 1) % 10 >= 5) return `BOSS 挑戰 · ${ARENAS[ai]?.n ?? ''}`; const D = DUNS[Math.floor((WID - 1) / 10)]; return D ? `${D.n} ${((WID - 1) % 10) + 1}F` : ''; }
function useStairs(g: G, down: boolean): void {
  const p = g.p;
  if (WID === 0) {
    const di = DENT.findIndex((e: Pt) => Math.hypot(e.x - p.x, e.y - p.y) < TS * 1.2), D = DUNS[di];
    if (!D) return;
    if (p.lv < D.lv - 5) addLog(g, `${D.n}建議等級 Lv.${D.lv}+，你的等級偏低，請小心！`, '#ffb070');
    const info = ensureDun(1 + di * 10);
    if (info) { goWorld(g, 1 + di * 10, info.up.x, info.up.y, true); addLog(g, `進入了${D.n}。地城的怪物更強，掉寶也更好！`, '#ffb070'); }
    return;
  }
  const di = Math.floor((WID - 1) / 10), f = (WID - 1) % 10;
  if (f >= 5) { const r0 = ARET ?? { x: SPAWN_X, y: SPAWN_Y }; goWorld(g, 0, r0.x, r0.y, true); ARET = null; addLog(g, '離開了 BOSS 挑戰場。', '#a0d0ff'); return; }
  if (down) { const info = ensureDun(WID + 1); if (info) goWorld(g, WID + 1, info.up.x, info.up.y, true); }
  else if (f === 0) { const e = DENT[di]; if (e) { goWorld(g, 0, e.x, e.y, true); addLog(g, '回到了地面。', '#a0d0ff'); } }
  else { const info = ensureDun(WID - 1); if (info && info.dn) goWorld(g, WID - 1, info.dn.x, info.dn.y, true); }
}
function drawGate(ctx: CanvasRenderingContext2D, x: number, y: number, k: number, time: number, font: string): void {
  const col = ['#ff9040', '#a080ff', '#ff4020', '#d080ff', '#ff6a10', '#80d8ff', '#b050ff'][k] ?? '#ffffff', st = ['#7a6a5a', '#c8c4d8', '#4a3a3a', '#8a80a8', '#5a2a1a', '#a8c8e0', '#3a2a4a'][k] ?? '#888888';
  shadow(ctx, x, y, 40);
  ctx.fillStyle = '#0a0608'; ctx.beginPath(); ctx.moveTo(x - 22, y - 4); ctx.lineTo(x - 22, y - 46); ctx.quadraticCurveTo(x, y - 76, x + 22, y - 46); ctx.lineTo(x + 22, y - 4); ctx.closePath(); ctx.fill();
  ball(ctx, x, y - 30, 26 + Math.sin(time * 3) * 3, col + '88', 'rgba(0,0,0,0)');
  for (let i = 0; i < 4; i++) { const a = time * 2 + i * 1.6; circ(ctx, x + Math.cos(a) * 12, y - 30 + Math.sin(a) * 16, 2.5, col); }
  for (const sx of [-32, 22]) box(ctx, x + sx, y - 56, 10, 54, 2, lg(ctx, x + sx, 0, x + sx + 10, 0, mix(st, '#ffffff', 0.3), st), OL);
  ctx.strokeStyle = OL; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(x, y - 52, 27, Math.PI, TAU); ctx.stroke(); ctx.strokeStyle = st; ctx.lineWidth = 9; ctx.stroke();
  ball(ctx, x, y - 80, 5, '#ffffff', col, OL);
  label(ctx, DUNS[k]?.n ?? '', x, y - 96, '#ffe0b0', 13, font, 'center');
  label(ctx, `建議 Lv.${DUNS[k]?.lv ?? 1}+`, x, y - 112, '#ffb080', 10, font, 'center');
}

/* ---------- audio (Web Audio synth, no files) ---------- */
let ACX: AudioContext | null = null, MASTER: GainNode | null = null, BGMG: GainNode | null = null, NOISE: AudioBuffer | null = null;
let VOL = 0.6, MUTE = false, BGM_ON = true, BGM_NEXT = 0, BGM_STEP = 0, BGM_AREA = -1;
const SFXT: Record<string, number> = {};
function setVol(): void { if (MASTER) MASTER.gain.value = MUTE ? 0 : VOL; }
function audioInit(): void {
  try {
    if (!ACX) { ACX = new AudioContext(); MASTER = ACX.createGain(); MASTER.connect(ACX.destination); }
    if (ACX.state === 'suspended') { ACX.resume().catch(() => { /* needs gesture */ }); }
    setVol();
  } catch { /* no audio */ }
}
function tone(f0: number, f1: number, dur: number, type: OscillatorType, vol: number, delay?: number, out?: GainNode | null): void {
  const A = ACX, M = out ?? MASTER;
  if (!A || !M || A.state !== 'running') return;
  const t = A.currentTime + (delay ?? 0), o = A.createOscillator(), g = A.createGain();
  o.type = type; o.frequency.setValueAtTime(Math.max(20, f0), t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(M); o.start(t); o.stop(t + dur + 0.03);
}
function noise(dur: number, vol: number, freq: number, q: number, delay?: number, f1?: number): void {
  const A = ACX, M = MASTER;
  if (!A || !M || A.state !== 'running') return;
  if (!NOISE) { NOISE = A.createBuffer(1, A.sampleRate, A.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const t = A.currentTime + (delay ?? 0), s = A.createBufferSource(), bf = A.createBiquadFilter(), g = A.createGain();
  s.buffer = NOISE; bf.type = 'bandpass'; bf.frequency.setValueAtTime(freq, t); if (f1) bf.frequency.exponentialRampToValueAtTime(f1, t + dur); bf.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(bf); bf.connect(g); g.connect(M); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
}
function arp(fs: number[], step: number, dur: number, type: OscillatorType, vol: number): void { fs.forEach((f: number, i: number) => tone(f, f, dur, type, vol, i * step)); }
function sfx(k: string): void {
  const A = ACX;
  if (!A || MUTE || A.state !== 'running') return;
  const now = A.currentTime;
  if ((SFXT[k] ?? 0) > now) return;
  SFXT[k] = now + (k === 'hit' || k === 'gold' ? 0.06 : 0.04);
  if (k === 'swing') noise(0.14, 0.35, 2200, 0.8, 0, 500);
  else if (k === 'hit') { noise(0.07, 0.4, 1000, 1); tone(170, 60, 0.1, 'square', 0.1); }
  else if (k === 'crit') { noise(0.12, 0.5, 1400, 0.8); tone(240, 50, 0.18, 'square', 0.16); tone(1200, 600, 0.12, 'triangle', 0.08); }
  else if (k === 'bow') { tone(190, 120, 0.18, 'triangle', 0.25); noise(0.08, 0.2, 3500, 2); }
  else if (k === 'magic') { tone(500, 1100, 0.18, 'sine', 0.15); tone(800, 1600, 0.15, 'triangle', 0.06, 0.04); }
  else if (k === 'potion') { tone(300, 700, 0.1, 'sine', 0.18); tone(500, 1000, 0.08, 'sine', 0.12, 0.09); tone(700, 1300, 0.07, 'sine', 0.1, 0.16); }
  else if (k === 'buff' || k === 'e1') arp([523, 659, 784, 1047], 0.06, 0.2, 'sine', 0.12);
  else if (k === 'lvl') { arp([523, 659, 784, 1047, 1319], 0.09, 0.25, 'square', 0.06); tone(1047, 1047, 0.7, 'triangle', 0.12, 0.45); }
  else if (k === 'gold') { tone(1568, 1568, 0.06, 'square', 0.04); tone(2093, 2093, 0.1, 'square', 0.04, 0.05); }
  else if (k === 'pickup') tone(660, 990, 0.08, 'triangle', 0.12);
  else if (k === 'rare') arp([784, 988, 1175, 1568], 0.07, 0.14, 'triangle', 0.12);
  else if (k === 'enchOk') { arp([523, 784, 1047, 1568, 2093], 0.08, 0.3, 'sine', 0.14); noise(0.6, 0.08, 6000, 3, 0.1); }
  else if (k === 'enchFail') { tone(300, 40, 1.0, 'sawtooth', 0.2); noise(0.8, 0.3, 300, 0.6, 0, 80); }
  else if (k === 'death') { tone(440, 60, 1.2, 'triangle', 0.25); tone(330, 50, 1.2, 'sawtooth', 0.07, 0.1); }
  else if (k === 'hurt') { noise(0.09, 0.28, 600, 1); tone(140, 70, 0.1, 'square', 0.08); }
  else if (k === 'click') tone(1300, 1000, 0.035, 'square', 0.04);
  else if (k === 'boom') { noise(0.5, 0.55, 500, 0.6, 0, 60); tone(90, 35, 0.45, 'sine', 0.35); }
  else if (k === 'e0') { noise(0.18, 0.45, 1600, 0.7, 0, 300); tone(200, 50, 0.2, 'square', 0.18); }
  else if (k === 'e2') { noise(0.35, 0.35, 900, 0.8, 0, 200); tone(300, 120, 0.3, 'sawtooth', 0.07); }
  else if (k === 'e3') { tone(2000, 2600, 0.2, 'sine', 0.1); tone(2600, 1800, 0.25, 'triangle', 0.06, 0.05); noise(0.2, 0.15, 7000, 2); }
  else if (k === 'e4') { noise(0.4, 0.5, 2500, 0.5, 0, 200); tone(120, 40, 0.4, 'sawtooth', 0.14); }
  else if (k === 'e5') arp([659, 784, 988, 1319], 0.07, 0.3, 'sine', 0.12);
  else if (k === 'e6') noise(0.45, 0.28, 700, 1.5, 0, 2600);
  else if (k === 'e7') { tone(220, 440, 0.5, 'sawtooth', 0.07); tone(330, 660, 0.5, 'sine', 0.12, 0.1); }
  else if (k === 'e8') { tone(400, 1600, 0.35, 'sine', 0.14); tone(800, 3200, 0.3, 'sine', 0.06, 0.08); }
}
const BGMP: number[][] = [[0, 4, 7, 12, 11, 7, 4, 7, 5, 9, 12, 9, 7, 4, 2, 99], [0, 3, 7, 99, 10, 7, 3, 5, 8, 7, 3, 99, 2, 5, 7, 99], [0, 99, 3, 99, 1, 99, 99, 0, -2, 99, 0, 99, 3, 1, 99, 99]];
const BGMC: number[][] = [[0, 5, 7, 0], [0, 8, 3, 10], [0, 0, 1, 0]], BGMR = [392, 330, 196];
function bgmTick(area: number): void {
  const A = ACX;
  if (!A || !MASTER || A.state !== 'running') return;
  if (!BGMG) { BGMG = A.createGain(); BGMG.connect(MASTER); }
  BGMG.gain.value = BGM_ON ? 0.2 : 0;
  if (!BGM_ON) return;
  if (area !== BGM_AREA) { BGM_AREA = area; BGM_STEP = 0; }
  if (BGM_NEXT < A.currentTime) BGM_NEXT = A.currentTime + 0.05;
  const pat = BGMP[area] ?? [], ch = BGMC[area] ?? [0], root = BGMR[area] ?? 330, sp = area === 2 ? 0.5 : 0.28;
  while (BGM_NEXT < A.currentTime + 0.4) {
    const n = pat[BGM_STEP % pat.length] ?? 99, t0 = BGM_NEXT - A.currentTime, cr = ch[Math.floor(BGM_STEP / 4) % ch.length] ?? 0;
    if (n !== 99) tone(root * Math.pow(2, (n + (area === 0 ? 0 : cr * 0)) / 12), root * Math.pow(2, n / 12), sp * 0.95, area === 2 ? 'sine' : 'triangle', 0.35, t0, BGMG);
    if (BGM_STEP % 4 === 0) tone((root / 4) * Math.pow(2, cr / 12), (root / 4) * Math.pow(2, cr / 12), sp * 3.9, 'sine', area === 2 ? 0.5 : 0.4, t0, BGMG);
    if (area === 2 && BGM_STEP % 16 === 0) tone(root / 8, root / 8, sp * 15, 'triangle', 0.25, t0, BGMG);
    BGM_STEP++; BGM_NEXT += sp;
  }
}

/* ---------- game logic ---------- */
const BASE = [[16, 12, 16, 8, 9], [11, 18, 12, 12, 12], [8, 9, 12, 18, 17]], MAIN = [0, 1, 3];
function stats(p: Pl): St {
  const c = cl(p.cls), l = p.lv - 1, a = (BASE[p.cls] ?? [10, 10, 10, 10, 10]).map((v: number, i: number) => v + (p.bs[i] ?? 0));
  let ac = 0, watk = 0, hp = 0, mp = 0, crit = 0.06, dodge = p.cls === 1 ? 0.1 : 0.04, vamp = 0, dmgB = 1, mr = 0, spd = 1, hpR = 1, mpR = 1;
  const sets: string[] = [], cnt: Record<string, number> = {};
  for (const it of p.eq) {
    if (!it) continue;
    const d = idf(it);
    if (d.s === 0) { if (clsOk(d, p.cls)) watk += d.atk + it.en; } else ac += d.ac + (canEnch(d) ? it.en : 0);
    d.st.forEach((v: number, i: number) => { a[i] = (a[i] ?? 0) + v; });
    hp += d.hp; mp += d.mp;
    if (it.q === 5) cnt['傳說'] = (cnt['傳說'] ?? 0) + 1;
    for (const c0 of it.af ?? []) {
      const k = Math.floor(c0 / 100), v = c0 % 100, si = [0, 1, 3][k - 6] ?? 0;
      if (k === 0) watk += v; else if (k === 1) ac += v; else if (k === 2) hp += v * 5; else if (k === 3) mp += v * 3; else if (k === 4) crit += v / 100; else if (k === 5) dodge += v / 100;
      else if (k >= 6 && k <= 8) a[si] = (a[si] ?? 0) + v; else if (k === 9) dmgB += v / 100; else if (k === 10) vamp += v / 100; else if (k === 11) mr += v / 100; else if (k === 12) spd += v / 100;
    }
    for (const ch of d.sp.split('')) { if (ch === 'v') vamp += 0.06; else if (ch === 'f') dmgB += 0.15; else if (ch === 'c') crit += 0.08; else if (ch === 's') spd += 0.12; else if (ch === 'm') mpR += 0.6; else if (ch === 'h') hpR += 0.6; else if (ch === 'r') mr += 0.12; else if (ch === 'd') dodge += 0.06; }
    for (const k of ['黑暗', '精靈', '秘銀', '死亡騎士', '阿克海']) if (d.n.indexOf(k) === 0) cnt[k] = (cnt[k] ?? 0) + 1;
  }
  const dkn = cnt['黑暗'] ?? 0, ekn = cnt['精靈'] ?? 0, mkn = cnt['秘銀'] ?? 0, lgn = cnt['傳說'] ?? 0;
  if (dkn >= 2) { sets.push('黑暗套裝（2件）：攻擊 +4'); watk += 4; }
  if (dkn >= 4) { sets.push('黑暗套裝（4件）：暴擊 +8%、吸血 +3%'); crit += 0.08; vamp += 0.03; }
  if (ekn >= 2) { sets.push('精靈套裝（2件）：敏捷 +2、移速 +6%'); a[1] = (a[1] ?? 0) + 2; spd += 0.06; }
  if (ekn >= 4) { sets.push('精靈套裝（4件）：閃避 +6%、暴擊 +5%'); dodge += 0.06; crit += 0.05; }
  if (mkn >= 2) { sets.push('秘銀套裝（2件）：AC -3、抗魔 +8%'); ac += 3; mr += 0.08; }
  if (mkn >= 4) { sets.push('秘銀套裝（4件）：生命 +80、魔力 +40'); hp += 80; mp += 40; }
  const dkk = cnt['死亡騎士'] ?? 0, akh = cnt['阿克海'] ?? 0;
  if (akh >= 2) { sets.push('阿克海套裝（2件）：AC -2'); ac += 2; }
  if (akh >= 4) { sets.push('阿克海套裝（4件）：生命 +40'); hp += 40; }
  if (dkk >= 2) { sets.push('死亡騎士套裝（2件）：攻擊 +6'); watk += 6; }
  if (dkk >= 4) { sets.push('死亡騎士套裝（4件）：傷害 +10%、生命 +150'); dmgB += 0.1; hp += 150; }
  if (lgn >= 2) { sets.push('傳說共鳴（2件金色）：傷害 +6%'); dmgB += 0.06; }
  if (lgn >= 4) { sets.push('傳說共鳴（4件金色）：生命 +120、暴擊 +6%'); hp += 120; crit += 0.06; }
  if (p.blessT > 0) ac += 3;
  const bf = p.bf;
  const L = (k: string): number => bfL(p, k) - 1;
  if ((bf['ac'] ?? 0) > 0) ac += 4 + Math.floor(L('ac') / 2);
  if ((bf['sh'] ?? 0) > 0) ac += 3 + Math.floor(L('sh') / 2);
  if ((bf['at'] ?? 0) > 0) dmgB += 0.2 + 0.025 * L('at');
  if ((bf['sp'] ?? 0) > 0) spd += 0.25 + 0.025 * L('sp');
  if ((bf['dg'] ?? 0) > 0) dodge += 0.15 + 0.0125 * L('dg');
  if ((bf['hb'] ?? 0) > 0) ac += 6 + Math.floor(L('hb') / 2);
  if ((bf['fw'] ?? 0) > 0) dmgB += 0.15 + 0.025 * L('fw');
  if ((bf['pc'] ?? 0) > 0) crit += 0.15 + 0.0125 * L('pc');
  if ((bf['mb'] ?? 0) > 0) mr += 0.15 + 0.0125 * L('mb');
  if ((bf['tw'] ?? 0) > 0) { dmgB += 0.12 + 0.02 * L('tw'); crit += 0.05 + 0.0075 * L('tw'); }
  let hitB = 0;
  if ((bf['he'] ?? 0) > 0) { crit += 0.1 + 0.01 * L('he'); hitB = 0.1 + 0.01 * L('he'); }
  if ((bf['ma'] ?? 0) > 0) dmgB += 0.2 + 0.025 * L('ma');
  if ((bf['cp'] ?? 0) > 0) { if (p.cls === 1) mpR += 0.5; else if (p.cls === 2) { dmgB += 0.15; mpR += 1; } }
  if ((p.pa ?? -1) >= 0 && (p.pets ?? []).length > 0) { hp += 30; ac += 1; }
  { const dw = p.doll ?? -1; if (dw === 0) ac += 3; else if (dw === 1) watk += 3; else if (dw === 2) { mpR += 0.5; hp += 40; } else if (dw === 3) { crit += 0.04; mpR += 0.4; } else if (dw === 4) { dmgB += 0.06; hp += 100; } }
  if ((p.polyT ?? 0) > 0 && (p.poly ?? -1) >= 0) { const f = p.poly ?? 0; dmgB += 0.03 * (f + 1); ac += f; spd += 0.03 * f; }
  { const rb = rkBonus(rankOf(p.kc ?? 0)); hp += rb[0] ?? 0; mp += rb[1] ?? 0; watk += rb[2] ?? 0; ac += rb[3] ?? 0; crit += (rb[4] ?? 0) / 100; dodge += (rb[5] ?? 0) / 100; dmgB += (rb[6] ?? 0) / 100; }
  const pas = (i: number): boolean => p.sk.indexOf(i) >= 0;
  if (pas(35)) ac += 3 + Math.floor(L('pk') / 2);
  if (pas(37)) { dmgB += 0.08 + 0.01 * L('pe'); crit += 0.05 + 0.005 * L('pe'); }
  if (pas(39)) mpR += 0.4 + 0.05 * L('pm');
  const S = a[0] ?? 10, D = a[1] ?? 10, C = a[2] ?? 10, I = a[3] ?? 10, W = a[4] ?? 10, main = a[MAIN[p.cls] ?? 0] ?? 10;
  return {
    mhp: Math.round((c.hp + c.hpL * l + (C - 10) * (4 + l * 0.35) + hp) * (pas(35) ? 1.08 + 0.01 * L('pk') : 1)),
    mmp: Math.round((c.mp + c.mpL * l + (W - 10) * (2 + l * 0.25) + (I - 10) + mp) * (pas(39) ? 1.1 + 0.01 * L('pm') : 1)),
    atk: c.atk + c.atkL * l + (main - 10) * 0.9 + (p.cls === 0 ? 0 : (S - 10) * 0.2) + watk,
    def: c.def + l * 0.45 + ac * 0.85, ac, a,
    hit: (D - 10) * 0.01 + hitB, dodge: Math.min(0.45, dodge + (D - 10) * 0.004), crit: crit + (p.cls === 1 ? (D - 10) * 0.004 : 0), vamp, dmgB, mr: Math.min(0.5, mr), spd,
    hpR: hpR * (1 + (C - 10) * 0.05), mpR: mpR * (1 + (W - 10) * 0.06), sets,
  };
}
function ptsLeft(p: Pl): number { return Math.max(0, p.lv - 1 - p.bs.reduce((a: number, b: number) => a + b, 0)); }
function addStat(g: G, i: number): void { const p = g.p; if (ptsLeft(p) <= 0) return; p.bs[i] = (p.bs[i] ?? 0) + 1; }
function speed(p: Pl): number { return 0.7 * cl(p.cls).sp * stats(p).spd * (p.hasteT > 0 ? 1.35 : 1); }
const ASPD = 2.3;
let BOWT = -99, FASTT = 0, LOGT = 0, BUFR: { x: number; y: number; t: string }[] = [], BTIP: { x: number; y: number } | null = null, LOGOFF = 0, TIPEL: HTMLDivElement | null = null, TIPIT: Item | null = null;
function placeTip(el: HTMLDivElement, x: number, y: number): void { const vw = window.innerWidth, vh = window.innerHeight; el.style.left = `${Math.max(4, Math.min(x + 16, vw - 276))}px`; el.style.top = `${y + 16 > vh - 200 ? Math.max(4, y - 190) : y + 16}px`; }
function addLog(g: G, t: string, c: string): void { g.log.push({ t, c, age: 0 }); if (LOGOFF > 0) { if (Date.now() - LOGT > 3000) LOGOFF = 0; else LOGOFF++; } if (g.log.length > 200) g.log.shift(); }
function addText(g: G, x: number, y: number, t: string, c: string, sz: number): void { if (g.texts.length > 60) g.texts.shift(); g.texts.push({ x, y, t, c, l: 1, m: 1, sz }); }
function emit(g: G, x: number, y: number, n: number, c: string, sp: number, life: number, s: number): void {
  for (let i = 0; i < n; i++) {
    if (g.parts.length > 450) g.parts.shift();
    const a = Math.random() * TAU, v = rnd(0.3, 1) * sp;
    g.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, l: life, m: life, c, s: s * rnd(0.6, 1.3) });
  }
}
function ring(g: G, x: number, y: number, c: string, v: number, l: number): void { g.rings.push({ x, y, r: 4, v, l, m: l, c }); }

function mkMon(i: number, hx: number, hy: number): Mon { const d = MD[i] ?? (MD[0] as MDef); return { d: i, x: hx, y: hy, hx, hy, hp: d.hp, mhp: d.hp, st: 0, cd: 0, wx: hx, wy: hy, wt: rnd(0, 3), hit: 0, dead: 0, face: 1, anim: rnd(0, 5), dieT: 0, atkT: 0, ban: 0, stun: 0, slow: 0 }; }
function spawnMons(zs: number[]): Mon[] {
  const mons: Mon[] = [];
  MD.forEach((d: MDef, i: number) => {
    if (zs.indexOf(d.z) < 0) return;
    for (let k = 0; k < d.cnt; k++) {
      let pt: Pt | null = null;
      if (d.b) { const s = ZS.find((q: [number, number, number]) => q[0] === d.z); if (s) pt = nearFree(s[1], s[2]); }
      else for (let tries = 0; tries < 400 && !pt; tries++) {
        const x = 1 + Math.floor(Math.random() * (MW - 2)), y = 1 + Math.floor(Math.random() * (MH - 2));
        if (zoneOf(x, y) !== d.z || REACH[y * MW + x] !== 1 || blk(x, y) || TOWNS.some((t: Town) => x > t.x - 5 && x < t.x + TW + 5 && y > t.y - 5 && y < t.y + TH + 5)) continue;
        pt = { x: (x + 0.5) * TS, y: (y + 0.5) * TS };
      }
      if (pt) mons.push(mkMon(i, pt.x, pt.y));
    }
  });
  return mons;
}
function newGame(cls: number): G {
  const t0 = TOWNS[0];
  if (t0) { SPAWN_X = (t0.x + 18) * TS; SPAWN_Y = (t0.y + 15.5) * TS; }
  setWorld(0);
  const mons = spawnMons([0, 1, 2, 3, 4, 5, 6, 7]);
  const c = cl(cls);
  const p: Pl = { cls, x: SPAWN_X, y: SPAWN_Y, hp: c.hp, mp: c.mp, lv: 1, exp: 0, gold: 50, pots: 8, blue: cls === 2 ? 3 : 0, green: 1, hasteT: 0, tgt: null, path: [], dest: null, cd: 0, potCd: 0, mpCd: 0, skCd: 0, face: 0, walk: 0, moving: false, hurt: 0, dead: 0, swing: 0, combatT: 99, repath: 0, stuck: 0, inv: [], eq: startEq(cls), scrolls: 1, ew: 0, ea: 0, bw: 0, ba: 0, bs: [0, 0, 0, 0, 0], lastHit: null, hitT: -9, progT: 0, progD: 1e9, fails: 0, lootT: 0, idleT: 0, lastX: 0, lastY: 0, loot: null, scanT: 0, home: 0, bank: [], q: QD.map(() => 0), blessT: 0, sk: [BSK[cls] ?? 0], hb: [BSK[cls] ?? 0, -1, -1, -1, -1, -1, -1, -1], scd: {}, bf: {} };
  const g: G = { p, mons, proj: [], parts: [], texts: [], rings: [], log: [], time: 0, camX: 0, camY: 0, vw: 400, vh: 400, zoom: 1, mark: null, drops: [], flash: null, banner: null, shake: 0, req: "", wantShop: false, wantNpc: null, npc: null, folk: mkFolk(), panel: false, zone: -1, set: { hp: 50, mp: cls === 2 ? 30 : 0, haste: true, restock: true, zone: -1 }, auto: false, huntZ: 0, autoPause: 0, retreat: false, stocked: false, bolts: [], pet: null, owMons: null, stairT: 0, bots: mkBots(), bp: [], chatT: 20, fx: [] };
  addLog(g, `歡迎來到銀月大陸，${c.n}！點擊怪物即可自動攻擊。`, "#ffe08a");
  addLog(g, "按「掛機」可自動打怪，「設定」可調整自動喝水與存檔。", "#a0ffa0");
  return g;
}

function goTo(g: G, wx: number, wy: number): void {
  const p = g.p;
  p.dest = { x: wx, y: wy }; p.stuck = 0;
  if (los(p.x, p.y, wx, wy)) { p.path = []; return; }
  const fp = findPath(p.x, p.y, wx, wy, true);
  p.path = fp ?? [];
  const last = p.path[p.path.length - 1];
  if (fp && (PPART || (last !== undefined && !free(wx, wy, PR, false)))) { if (last !== undefined) p.dest = tc(last); }
  else if (!fp) p.dest = null;
}
function stepTo(g: G, tx: number, ty: number, dt: number): boolean {
  const p = g.p, dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), wt = MAP[Math.floor(p.y / TS) * MW + Math.floor(p.x / TS)] ?? 0, sp = speed(p) * dt * (wt < -1 ? 0 : 1);
  p.moving = true; p.walk += dt;
  if (d > 0.5) p.face = Math.atan2(dy, dx);
  if (d <= sp) { moveBy(p, dx, dy, PR, false); return true; }
  const ox = p.x, oy = p.y;
  moveBy(p, (dx / d) * sp, (dy / d) * sp, PR, false);
  if (Math.hypot(p.x - ox, p.y - oy) < sp * 0.15) { p.stuck += dt; if (p.stuck > 0.35) { p.stuck = 0; return !snap(p); } } else p.stuck = 0;
  return false;
}
function tc(n: number): Pt { return { x: ((n % MW) + 0.5) * TS, y: (Math.floor(n / MW) + 0.5) * TS }; }
function follow(g: G, dt: number): void {
  const p = g.p;
  const n2 = p.path[1];
  if (n2 !== undefined) { const c = tc(n2); if (los(p.x, p.y, c.x, c.y)) p.path.shift(); }
  const n = p.path[0];
  let t: Pt;
  if (n !== undefined) t = tc(n);
  else if (p.dest) t = p.dest;
  else return;
  if (stepTo(g, t.x, t.y, dt)) { if (n !== undefined) p.path.shift(); else p.dest = null; }
}
function bowOn(p: Pl): boolean { const w = p.eq[0]; return !!w && idf(w).m === 2; }
function prng(p: Pl): number { return p.cls === 1 && !bowOn(p) ? 30 : cl(p.cls).rng; }
function nearest(g: G, range: number): Mon | null {
  let best: Mon | null = null, bd = range;
  for (const m of g.mons) {
    if (m.dead > 0) continue;
    const d = Math.hypot(m.x - g.p.x, m.y - g.p.y);
    if (d < bd) { bd = d; best = m; }
  }
  return best;
}
function pickMon(g: G, wx: number, wy: number, pad: number): Mon | null {
  let best: Mon | null = null, bd = 1e9;
  for (const m of g.mons) {
    if (m.dead > 0) continue;
    const d = md(m), k = mvk(m.d), hh = (MHT[m.d] ?? d.r * 2) * k * 0.85, dist = Math.hypot(m.x - wx, clamp(wy, m.y - hh, m.y - d.r * 0.5) - wy);
    if (dist < d.r * Math.max(1, k * 0.7) + pad && dist < bd) { bd = dist; best = m; }
  }
  return best;
}

function gainExp(g: G, v: number): void {
  const p = g.p;
  p.exp += v;
  while (p.exp >= needExp(p.lv)) {
    p.exp -= needExp(p.lv); p.lv++; sfx('lvl');
    const s = stats(p); p.hp = s.mhp; p.mp = s.mmp;
    addText(g, p.x, p.y - 50, "等級提升！", "#ffe060", 22);
    ring(g, p.x, p.y - 15, "#ffe060", 180, 0.7); ring(g, p.x, p.y - 15, "#ffffff", 120, 0.5);
    emit(g, p.x, p.y - 15, 40, "#ffe060", 160, 1, 3.5);
    addLog(g, `恭喜！你升到了 ${p.lv} 級，獲得 1 點能力點數（按 C 分配）。`, "#ffe060");
  }
}
function killMon(g: G, m: Mon): void {
  const d = md(m), p = g.p;
  m.dead = d.b ? 300 : m.el ? 90 : rnd(10, 18); m.hp = 0; m.dieT = 0.7;
  const aix = d.b ? arenaOf(WID) : -1;
  if (aix >= 0) { m.dead = 1e9; ARCD[String(aix)] = Date.now() + ACD * 1000; try { localStorage.setItem('sm_arena', JSON.stringify(ARCD)); } catch { /* ignore */ } addLog(g, `挑戰成功！${d.n} 將在 ${ACD / 60} 分鐘後再次出現。走下方的階梯離開挑戰場。`, '#ffd860'); }
  if (p.tgt === m) p.tgt = null;
  let exp = Math.round(d.exp * (m.el ? 5 : 1) * (d.b ? 1 : 0.85) * xbMul(p));
  for (const sid of p.sk) { const ss = SK[sid]; if (!ss) continue; if (ss.k === 12) skUse(g, sid, 0.3); else if ((ss.k === 11 || ss.k === 1) && (p.bf[ss.b] ?? 0) > 0) skUse(g, sid, ss.k === 11 ? 0.5 : 0.3); }
  if (m.el) { g.banner = { t: `擊敗了精英 ${d.n}！`, c: '#e0a0ff', l: 2.5 }; p.gold += d.gold * 4; }
  const gold = Math.max(1, Math.round(d.gold * rnd(0.8, 1.25) / 4));
  p.gold += gold; sfx('gold'); addText(g, p.x + 14, p.y - 38, `+${gold} 金幣`, '#ffd860', 12);
  emit(g, m.x, m.y - d.r, 26, d.c, 140, 0.7, 3.5); ring(g, m.x, m.y - d.r, d.c, 140, 0.4);
  addText(g, m.x, m.y - d.r * 2 - 14, `+${exp} 經驗`, "#a0e0ff", 13);
  addLog(g, `擊敗了 ${d.n}，獲得 ${exp} 經驗、${gold} 金幣。`, "#d8e4f0");
  if (d.b) { g.banner = { t: `擊敗了${d.n}！`, c: '#ffd860', l: 3 }; addLog(g, `你擊敗了${d.n}！它掉落了傳說級的寶物。`, '#ffd860'); }
  questKill(g, m.d);
  mqKill(g, m.d); btKill(g, m.d);
  if (d.b && Math.random() < 0.35) { p.rs = (p.rs ?? 0) + 1; addLog(g, `${d.n} 掉落了洗鍊石！`, '#d0a0ff'); }
  dailyKill(g, m);
  { const r0 = rankOf(p.kc ?? 0); p.kc = (p.kc ?? 0) + 1; const r1 = rankOf(p.kc); if (r1 > r0) { g.banner = { t: `聲望提升：${RKN[r1] ?? ''}！`, c: '#ffd860', l: 3 }; addLog(g, `聲望提升為「${RKN[r1] ?? ''}」！加成：${rkText(r1)}`, '#ffd860'); ring(g, p.x, p.y - 20, '#ffd860', 180, 0.8); sfx('rare'); } }
  dropLoot(g, m);
  gainExp(g, exp);
  petExp(g, Math.max(1, Math.round(exp * 0.6)));
  if (m.wb) wbEnd(g, m);
}
function petExp(g: G, v: number): void {
  const pd = curPet(g.p); if (!pd) return;
  pd[2] = (pd[2] ?? 0) + v;
  while ((pd[1] ?? 1) < 50 && (pd[2] ?? 0) >= petNeed(pd[1] ?? 1)) { pd[2] = (pd[2] ?? 0) - petNeed(pd[1] ?? 1); pd[1] = (pd[1] ?? 1) + 1; addLog(g, `寵物 ${PSP[pd[0] ?? 0]?.n ?? ''} 升到了 Lv.${pd[1]}！`, '#ffe060'); ring(g, BPT.x, BPT.y - 10, '#ffe060', 120, 0.6); }
}
function petDmg(g: G, t: Mon, dmg: number, col: string): void {
  if (t.dead > 0) return;
  t.hp -= dmg; t.hit = 0.12; if (t.st !== 1) t.st = 1;
  addThreat(t, 'p', dmg);
  if (t.wb) WBS.P += dmg;
  addText(g, t.x + rnd(-6, 6), t.y - md(t).r * 1.6, String(dmg), col, 13); emit(g, t.x, t.y - md(t).r, 5, col, 100, 0.3, 2.5);
  if (t.hp <= 0) killMon(g, t);
}
function stepBPet(g: G, dt: number): void {
  const p = g.p, pd = curPet(p);
  if (!pd || p.dead > 0) { BPT.tg = null; return; }
  const s0 = PSP[pd[0] ?? 0] ?? (PSP[0] as PSp);
  BPT.cd -= dt; BPT.sk -= dt; BPT.atk = Math.max(0, BPT.atk - dt); BPT.sayT = Math.max(0, BPT.sayT - dt);
  if (Math.hypot(BPT.x - p.x, BPT.y - p.y) > (PMODE === 2 ? 900 : 500)) { BPT.x = p.x + 26; BPT.y = p.y + 10; if (!free(BPT.x, BPT.y, 8, false)) { BPT.x = p.x; BPT.y = p.y; } BPT.tg = null; }
  if (PMODE === 2) { BPT.tg = null; return; }
  let t: Mon | null = BPT.tg && BPT.tg.dead <= 0 ? BPT.tg : null;
  if (PMODE !== 1) t = null;
  else if (p.tgt && p.tgt.dead <= 0) t = p.tgt;
  else if (!t) { let bd = 240; for (const m of g.mons) { if (m.dead > 0) continue; const dd = Math.hypot(m.x - p.x, m.y - p.y); if (dd < bd) { bd = dd; t = m; } } }
  BPT.tg = t;
  if (t && Math.hypot(t.x - p.x, t.y - p.y) > 420) { t = null; BPT.tg = null; }
  const tx = t ? t.x : p.x + 30, ty = t ? t.y : p.y + 12, dx = tx - BPT.x, dy = ty - BPT.y, dist = Math.hypot(dx, dy) || 1, reach = t ? md(t).r + 14 : 30;
  if (dist > reach) { const far = !t && Math.hypot(BPT.x - p.x, BPT.y - p.y) > 140, sp = Math.max(t ? 200 : 180, speed(p) * 1.1) * (far ? 1.5 : 1) * dt, ox = BPT.x, oy = BPT.y; moveBy(BPT, (dx / dist) * sp, (dy / dist) * sp, 8, false); if (Math.hypot(BPT.x - ox, BPT.y - oy) < sp * 0.25) { BPT.x += (dx / dist) * sp; BPT.y += (dy / dist) * sp; } BPT.walk += dt; if (Math.abs(dx) > 1) BPT.face = dx < 0 ? -1 : 1; }
  else if (t && BPT.cd <= 0) {
    BPT.cd = pd[0] === 1 ? 0.65 : 0.95; BPT.face = t.x < BPT.x ? -1 : 1; BPT.atk = 0.28;
    const base = petAtk(pd), def = md(t).def;
    if (BPT.sk <= 0) {
      BPT.sk = 7; BPT.say = s0.sk; BPT.sayT = 1.2;
      const hits = pd[0] === 1 ? 3 : 1, cx = t.x, cy = t.y;
      for (let h = 0; h < hits; h++) petDmg(g, t, Math.max(1, Math.round(base * s0.mu * rnd(0.9, 1.15) - def * 0.4)), '#ffb070');
      if (s0.aoe > 0) { for (const o of g.mons) if (o !== t && o.dead <= 0 && Math.hypot(o.x - cx, o.y - cy) < s0.aoe) { if (pd[0] === 2) o.stun = Math.max(o.stun, 1.2); petDmg(g, o, Math.max(1, Math.round(base * s0.mu * 0.8 - md(o).def * 0.4)), '#ffb070'); } ring(g, cx, cy - 6, (pd[0] ?? 0) >= 3 ? '#ff7030' : '#d8c090', s0.aoe * 1.6, 0.4); }
      emit(g, cx, cy - 12, 16, ['#ffffff', '#e0e0ff', '#d8c090', '#ff8030', '#ff5020'][pd[0] ?? 0] ?? '#ffffff', 140, 0.5, 3);
    } else petDmg(g, t, Math.max(1, Math.round(base * rnd(0.85, 1.2) - def * 0.5)), '#ffd8a0');
  }
}
function buyPet(g: G, i: number): string {
  const s = PSP[i], p = g.p; if (!s) return '';
  const own = p.pets ?? [];
  if (own.length >= 8) return '寵物欄已滿（最多 8 隻）。';
  if (s.dia > 0) { if ((p.dia ?? 0) < s.dia) return `鑽石不足（需要 ${s.dia}）。`; p.dia = (p.dia ?? 0) - s.dia; }
  else { if (p.gold < s.c) return '金幣不足。'; p.gold -= s.c; }
  p.pets = own.concat([[i, 1, 0]]);
  if ((p.pa ?? -1) < 0) { p.pa = p.pets.length - 1; BPT.x = p.x + 26; BPT.y = p.y + 10; }
  sfx('rare'); addLog(g, `購買了寵物 ${s.n}！`, '#80ffa0');
  return `購買了 ${s.n}！`;
}
function usePoly(g: G, i: number): string {
  const f = POLY[i], p = g.p; if (!f) return '';
  if (p.lv < f.lv) return `需要 Lv.${f.lv} 才能變身成 ${f.n}。`;
  if (p.gold < 400) return '金幣不足（變身卷軸 400 金幣）。';
  p.gold -= 400; p.poly = i; p.polyT = 900;
  emit(g, p.x, p.y - 20, 30, '#d8b0ff', 160, 0.8, 3.5); ring(g, p.x, p.y - 10, '#d8b0ff', 160, 0.6); sfx('rare');
  addLog(g, `使用變身卷軸，變身成 ${f.n}（15 分鐘）！`, '#d8b0ff');
  return `變身成 ${f.n}（15 分鐘）！`;
}
function buyDoll(g: G, i: number): string {
  const d = DOLL[i], p = g.p; if (!d) return '';
  const o = p.dolls ?? [];
  if (o.indexOf(i) >= 0) { p.doll = p.doll === i ? -1 : i; return p.doll === i ? `召喚了 ${d.n}。` : `收回了 ${d.n}。`; }
  if (d.c <= 0) return '這個娃娃只能在兌換商用鑽石換取。';
  if (p.gold < d.c) return '金幣不足。';
  p.gold -= d.c; p.dolls = o.concat([i]); p.doll = i; sfx('rare');
  return `購買並召喚了 ${d.n}！`;
}
function drawSpr(ctx: CanvasRenderingContext2D, mi: number, x: number, y: number, sc: number, face: number, fi: number): number {
  const fr = monFrames(mi), d = mdef(mi); if (!fr || !d) return 30;
  const S = Math.ceil(d.r * 5 * mvk(mi)) * sc, img = fr[fi] ?? fr[0];
  if (img) { ctx.save(); ctx.translate(x, y); ctx.scale(face < 0 ? -1 : 1, 1); ctx.drawImage(img, -S / 2, -S * 0.84, S, S); ctx.restore(); }
  return S * 0.84;
}
function drawBPet(ctx: CanvasRenderingContext2D, g: G, font: string): void {
  const pd = curPet(g.p); if (!pd) return; const s = PSP[pd[0] ?? 0], d = s ? MD[s.m] : undefined; if (!s || !d) return;
  shadow(ctx, BPT.x, BPT.y + 1, d.r * 0.8);
  const h = drawSpr(ctx, 100 + (pd[0] ?? 0), BPT.x, BPT.y, 1, BPT.face, BPT.atk > 0 ? 6 : Math.floor(BPT.walk * 7) % 6);
  label(ctx, `${s.n} Lv.${pd[1] ?? 1}`, BPT.x, BPT.y - h - 4, '#a0ffb0', 10, font, 'center');
  if (BPT.sayT > 0) label(ctx, `${BPT.say}！`, BPT.x, BPT.y - h - 18, '#ffb070', 12, font, 'center');
}
function hitMon(g: G, m: Mon, mult: number): void {
  if (m.dead > 0) return;
  const d = md(m), s = stats(g.p);
  const miss = clamp(0.05 + ((m.sc ? Math.min(d.lv, g.p.lv + 2) : d.lv) - g.p.lv) * 0.025 - s.hit, 0.03, 0.45);
  const hy = m.y - d.r * 1.6;
  if (Math.random() < miss) { addText(g, m.x, hy, "未命中", "#c0c0c0", 13); return; }
  const crit = Math.random() < s.crit;
  const dmg = Math.max(1, Math.round((s.atk * rnd(0.85, 1.25) - d.def * (m.sc ?? 1) * 0.6) * mult * s.dmgB * (crit ? 1.6 : 1)));
  m.hp -= dmg; m.hit = 0.12; sfx(crit ? 'crit' : 'hit'); addThreat(m, 'p', dmg); if (m.wb) WBS.P += dmg;
  if (s.vamp > 0) g.p.hp = Math.min(s.mhp, g.p.hp + dmg * s.vamp);
  if (m.st !== 1) m.st = 1;
  addText(g, m.x + rnd(-6, 6), hy, crit ? `${dmg}!` : String(dmg), crit ? "#ffe830" : "#ffffff", crit ? 30 : 15);
  emit(g, m.x, m.y - d.r, crit ? 12 : 6, crit ? "#ffd040" : "#ffeedd", 120, 0.35, 2.5);
  if (crit) ring(g, m.x, m.y - d.r, "#ffd040", 120, 0.25);
  if (m.hp <= 0) killMon(g, m);
}
function attack(g: G, m: Mon): void {
  const p = g.p, d = md(m);
  let mult = 1;
  if (p.cls === 2) { if (p.mp >= 2) p.mp -= 2; else mult = 0.4; }
  p.cd = atkInt(p, true); p.swing = 0.22; p.combatT = 0;
  p.face = Math.atan2(m.y - p.y, m.x - p.x);
  if (p.cls === 1 && bowOn(p)) BOWT = -99;
  const fist = !p.eq[0] && p.cls !== 2, elfMelee = p.cls === 1 && !bowOn(p);
  if (fist) mult *= 0.45; else if (elfMelee) mult *= 0.6;
  sfx(p.cls === 0 || elfMelee ? 'swing' : p.cls === 1 ? 'bow' : 'magic');
  if (p.cls === 0 || elfMelee) { hitMon(g, m, mult); emit(g, (p.x + m.x) / 2, m.y - d.r, 5, "#ffffff", 90, 0.2, 2); }
  else { const h = hand(p); g.proj.push({ x: h.x, y: h.y, t: m, k: p.cls === 1 ? 0 : 1, mult, sp: p.cls === 1 ? 560 : 400, life: 2, a: p.face, dl: h.dl }); }
}
function drinkPot(g: G, quiet: boolean): void {
  const p = g.p, s = stats(p);
  if (p.dead > 0 || p.potCd > 0) return;
  if (p.pots <= 0) { if (!quiet) addLog(g, "沒有紅色藥水了！", "#ff9090"); return; }
  if (p.hp >= s.mhp) { if (!quiet) addLog(g, "生命已經是滿的。", "#c0c8d0"); return; }
  const v = 40 + p.lv * 5;
  p.pots--; p.potCd = 0.6; sfx('potion'); p.hp = Math.min(s.mhp, p.hp + v);
  addText(g, p.x, p.y - 44, `+${v}`, "#60ff80", 16);
  emit(g, p.x, p.y - 15, 14, "#ff5050", 70, 0.6, 3);
}
function drinkBlue(g: G, quiet: boolean): void {
  const p = g.p, s = stats(p);
  if (p.dead > 0 || p.mpCd > 0) return;
  if (p.blue <= 0) { if (!quiet) addLog(g, "沒有藍色藥水了！", "#90b0ff"); return; }
  if (p.mp >= s.mmp) { if (!quiet) addLog(g, "魔力已經是滿的。", "#c0c8d0"); return; }
  const v = 30 + p.lv * 3;
  p.blue--; p.mpCd = 0.8; sfx('potion'); p.mp = Math.min(s.mmp, p.mp + v);
  addText(g, p.x, p.y - 44, `+${v} MP`, "#80b0ff", 15);
  emit(g, p.x, p.y - 15, 14, "#5080ff", 70, 0.6, 3);
}
function drinkGreen(g: G, quiet: boolean): void {
  const p = g.p;
  if (p.dead > 0) return;
  if (p.green <= 0) { if (!quiet) addLog(g, "沒有綠色加速藥水了！", "#90ffa0"); return; }
  p.green--; p.hasteT = HASTE; sfx('buff');
  addText(g, p.x, p.y - 50, "加速！", "#60ff90", 16);
  ring(g, p.x, p.y, "#60ff90", 120, 0.5); emit(g, p.x, p.y - 15, 20, "#60ff90", 110, 0.6, 3);
  addLog(g, "喝下綠色加速藥水，移動與攻擊速度提升。", "#80ffa0");
}
function castSkill(g: G): void {
  const p = g.p, c = cl(p.cls), s = stats(p);
  if (p.dead > 0 || p.skCd > 0) return;
  if (p.cls === 1 && !bowOn(p)) { if (g.time - BOWT > 30) { BOWT = g.time; addLog(g, `需要裝備弓才能施放${c.sk}。`, '#ff9090'); } return; }
  if (p.mp < c.skMp) { addLog(g, `魔力不足，無法施放${c.sk}。`, "#90b0ff"); return; }
  if (p.cls === 2) {
    if (p.hp >= s.mhp) { addLog(g, "生命已經是滿的。", "#c0c8d0"); return; }
    const v = Math.round((35 + p.lv * 7 + s.atk) * skM(p, 13));
    skUse(g, 13); p.mp -= c.skMp; p.skCd = 1.2; p.hp = Math.min(s.mhp, p.hp + v); p.swing = 0.3; sfx('e5');
    addText(g, p.x, p.y - 44, `+${v}`, "#60ff80", 18);
    ring(g, p.x, p.y - 12, "#80ffa0", 90, 0.5); ring(g, p.x, p.y, "#ffffff", 60, 0.4); emit(g, p.x, p.y - 15, 30, "#a0ffb0", 80, 0.9, 3);
    return;
  }
  const m = p.tgt ?? nearest(g, prng(p) + 80);
  if (!m) { addLog(g, "附近沒有可攻擊的目標。", "#c0c8d0"); return; }
  const d = md(m);
  p.tgt = m;
  if (Math.hypot(m.x - p.x, m.y - p.y) > prng(p) + d.r + 24) { addLog(g, "目標太遠了，先靠近一點。", "#c0c8d0"); return; }
  p.mp -= c.skMp; p.skCd = 1.5; p.cd = c.cd * ASPD; p.swing = 0.3; p.combatT = 0; skUse(g, BSK[p.cls] ?? 0);
  p.face = Math.atan2(m.y - p.y, m.x - p.x);
  sfx(p.cls === 0 ? 'e0' : 'bow');
  if (p.cls === 0) {
    hitMon(g, m, 2.4 * skM(p, 0)); ring(g, m.x, m.y - d.r, "#ffb040", 160, 0.35); ring(g, m.x, m.y - d.r, "#ffffff", 90, 0.25); emit(g, m.x, m.y - d.r, 26, "#ffb040", 220, 0.5, 3.5);
    g.shake = Math.max(g.shake, 0.15);
    addText(g, p.x, p.y - 50, "猛擊！", "#ffb040", 15);
  } else {
    const h = hand(p);
    for (let i = 0; i < 3; i++) g.proj.push({ x: h.x, y: h.y, t: m, k: 0, mult: 0.9 * skM(p, 6), sp: 560 - i * 70, life: 2, a: p.face + (i - 1) * 0.2, dl: h.dl + i * 0.05 });
    addText(g, p.x, p.y - 50, "三連箭！", "#80ffa0", 15);
  }
}
function attackNearest(g: G): void {
  if (g.p.dead > 0) return;
  const m = nearest(g, 420);
  if (!m) { addLog(g, "附近沒有怪物。", "#c0c8d0"); return; }
  g.p.tgt = m; g.p.repath = 0;
}
function die(g: G, by: string): void {
  const p = g.p;
  sfx('death');
  p.hp = 0; p.dead = 3.5; p.tgt = null; p.path = []; p.dest = null; p.hasteT = 0;
  const loss = Math.min(p.exp, Math.round(needExp(p.lv) * rnd(0.05, 0.08)));
  p.exp -= loss;
  addLog(g, `你被 ${by} 擊倒了……損失 ${loss} 經驗。`, "#ff7070");
}
function addThreat(m: Mon, key: string, dmg: number): void {
  if (md(m).b < 1 || dmg <= 0) return;
  const th = m.th ?? (m.th = {});
  th[key] = (th[key] ?? 0) + dmg;
}
function thAlive(g: G, key: string): boolean {
  if (key === 'p') return g.p.dead <= 0 && zoneAt(g.p.x, g.p.y) !== -1;
  if (key.charAt(0) !== 'b') return false;
  const b = g.bots[Number(key.slice(1))];
  return !!b && (b.dd ?? 0) <= 0 && b.st !== 3 && (WID !== 0 || zoneAt(b.x, b.y) !== -1);
}
function bossLock(g: G, m: Mon): string {
  const th = m.th ?? {};
  let best = '', bestV = 0;
  for (const k of Object.keys(th)) {
    const v = th[k] ?? 0;
    if (v <= 0 || !thAlive(g, k)) continue;
    if (v > bestV) { best = k; bestV = v; }
  }
  if (!best) return '';
  const cur = m.lk && thAlive(g, m.lk) ? m.lk : '';
  if (cur && cur !== best && bestV < (th[cur] ?? 0) * 1.1) return cur;
  return best;
}
function monAim(g: G, m: Mon): { x: number; y: number; k: string } | null {
  const d = md(m), p = g.p, pSafe = p.dead > 0 || zoneAt(p.x, p.y) === -1;
  if (!d.b) return pSafe ? null : { x: p.x, y: p.y, k: 'p' };
  const lk = bossLock(g, m);
  if (lk === 'p' && !pSafe) { m.lk = lk; return { x: p.x, y: p.y, k: 'p' }; }
  if (lk.charAt(0) === 'b') {
    const b = g.bots[Number(lk.slice(1))];
    if (b && (b.dd ?? 0) <= 0 && b.st !== 3) { m.lk = lk; return { x: b.x, y: b.y, k: lk }; }
  }
  const fighters: { x: number; y: number; k: string; dd: number }[] = [];
  if (WID === 0) g.bots.forEach((b: Bot, i: number) => {
    if ((b.dd ?? 0) > 0 || b.st === 3 || zoneAt(b.x, b.y) === -1) return;
    const dd = Math.hypot(b.x - m.x, b.y - m.y);
    if (dd < 280 || b.tg === m) fighters.push({ x: b.x, y: b.y, k: `b${i}`, dd });
  });
  if (fighters.length) {
    fighters.sort((a, b) => a.dd - b.dd);
    const f = fighters[0]; if (f) { m.lk = f.k; return f; }
  }
  if (pSafe) return null;
  const pd = Math.hypot(p.x - m.x, p.y - m.y);
  if (pd < 220) { m.lk = 'p'; return { x: p.x, y: p.y, k: 'p' }; }
  return null;
}
function monHitBot(g: G, m: Mon, b: Bot, mult: number): void {
  if ((b.dd ?? 0) > 0 || b.st === 3) return;
  const d = md(m), mx = bMhp(b);
  m.atkT = 0.28;
  const dmg = Math.max(1, Math.round((d.atk * (m.sc ?? 1) * mult * (m.el ? 1.6 : 1) * rnd(0.8, 1.2) - bDef(b) * 0.7)));
  b.php = (b.php ?? mx) - dmg;
  addText(g, b.x + rnd(-6, 6), b.y - 58, `-${dmg}`, '#ffb0a0', 12);
  emit(g, b.x, b.y - 20, 5, '#ff6060', 80, 0.3, 2);
  if ((b.php ?? 0) <= 0) {
    emit(g, b.x, b.y - 20, 22, '#ff4040', 140, 0.7, 3);
    b.dd = 20; b.php = 0; b.tg = null; b.ag = 0; b.vs = -1;
    if (m.lk === `b${g.bots.indexOf(b)}`) m.lk = '';
    addLog(g, `${d.n} 擊殺了 ${b.n}！`, '#ffb080');
  }
}
function monStrike(g: G, m: Mon, aim: { x: number; y: number; k: string }, mult: number): void {
  if (aim.k === 'p') monHit(g, m, mult);
  else { const b = g.bots[Number(aim.k.slice(1))]; if (b) monHitBot(g, m, b, mult); }
}
function monHit(g: G, m: Mon, mult: number): void {
  const p = g.p, d = md(m), s = stats(p);
  if (p.dead > 0) return;
  p.combatT = 0; m.atkT = 0.28; p.lastHit = m; p.hitT = g.time;
  if (!p.tgt && !p.dest && p.path.length === 0) p.tgt = m;
  if (Math.random() < s.dodge) { addText(g, p.x, p.y - 44, "閃避", "#a0e0ff", 13); return; }
  const dmg = Math.max(1, Math.round((d.atk * (m.sc ?? 1) * mult * (m.el ? 1.6 : 1) * rnd(0.8, 1.2) - s.def * 0.7) * (1 - s.mr)));
  p.hp -= dmg; p.hurt = 0.25; sfx('hurt');
  if ((p.bf['cb'] ?? 0) > 0 && Math.random() < 0.25 + 0.025 * (bfL(p, 'cb') - 1) && m.dead <= 0) { m.hp -= dmg * 2; m.hit = 0.12; addThreat(m, 'p', dmg * 2); addText(g, m.x, m.y - d.r * 1.6, `反擊 ${dmg * 2}`, '#ffb040', 14); ring(g, p.x, p.y - 12, '#ffb040', 90, 0.3); if (m.hp <= 0) killMon(g, m); }
  addText(g, p.x + rnd(-6, 6), p.y - 44, `-${dmg}`, "#ff5050", 15);
  emit(g, p.x, p.y - 15, 6, "#ff4040", 90, 0.35, 2.5);
  if (p.hp <= 0) die(g, d.n);
}

/* ---------- skills ---------- */
interface SDef { c: number; n: string; lv: number; mp: number; cd: number; k: number; v: number; e: number; b: string; d: string; p: number }
const SK: SDef[] = [
  { c: 0, n: '猛擊', lv: 1, mp: 8, cd: 1.5, k: 0, v: 2.4, e: 0, b: '', d: '強力一擊，造成 240% 傷害', p: 0 },
  { c: 0, n: '堅韌護甲', lv: 5, mp: 15, cd: 30, k: 1, v: 120, e: 1, b: 'ac', d: 'AC -4，持續 2 分鐘', p: 800 },
  { c: 0, n: '狂暴', lv: 10, mp: 20, cd: 60, k: 1, v: 120, e: 2, b: 'at', d: '傷害 +20%，持續 2 分鐘', p: 3000 },
  { c: 0, n: '衝擊之暈', lv: 15, mp: 20, cd: 8, k: 0, v: 1.8, e: 4, b: 'stun', d: '180% 傷害並暈眩目標 2 秒', p: 8000 },
  { c: 0, n: '旋風斬', lv: 20, mp: 25, cd: 6, k: 4, v: 1.6, e: 0, b: '', d: '對周圍所有敵人造成 160% 傷害', p: 20000 },
  { c: 0, n: '堅守', lv: 25, mp: 30, cd: 60, k: 1, v: 60, e: 1, b: 'dg', d: '閃避 +15%，持續 1 分鐘', p: 40000 },
  { c: 1, n: '三連箭', lv: 1, mp: 10, cd: 1.5, k: 6, v: 0.9, e: 0, b: '', d: '連射三箭，每箭 90% 傷害', p: 0 },
  { c: 1, n: '風之疾走', lv: 5, mp: 15, cd: 30, k: 1, v: 120, e: 6, b: 'sp', d: '移動速度 +25%，持續 2 分鐘', p: 800 },
  { c: 1, n: '火焰箭', lv: 8, mp: 15, cd: 3, k: 3, v: 2.2, e: 2, b: '', d: '燃燒之箭，造成 220% 傷害', p: 2000 },
  { c: 1, n: '大地屏障', lv: 12, mp: 20, cd: 30, k: 1, v: 120, e: 1, b: 'ac', d: 'AC -4，持續 2 分鐘', p: 4000 },
  { c: 1, n: '冰霜之箭', lv: 15, mp: 18, cd: 5, k: 3, v: 1.8, e: 3, b: 'slow', d: '180% 傷害並緩速 3 秒', p: 8000 },
  { c: 1, n: '箭雨', lv: 20, mp: 30, cd: 8, k: 5, v: 1.5, e: 6, b: '', d: '目標周圍的敵人受到 150% 傷害', p: 20000 },
  { c: 1, n: '生命之泉', lv: 25, mp: 30, cd: 20, k: 2, v: 0.4, e: 5, b: '', d: '回復 40% 生命', p: 40000 },
  { c: 2, n: '治癒術', lv: 1, mp: 15, cd: 1.2, k: 2, v: 0, e: 5, b: '', d: '回復生命（隨等級提升）', p: 0 },
  { c: 2, n: '光箭', lv: 1, mp: 6, cd: 1, k: 3, v: 1.8, e: 4, b: '', d: '射出光之箭，180% 傷害', p: 100 },
  { c: 2, n: '日光術', lv: 2, mp: 5, cd: 5, k: 1, v: 600, e: 4, b: 'lt', d: '照亮四周 10 分鐘（夜晚與地城視野更好）', p: 200 },
  { c: 2, n: '保護罩', lv: 4, mp: 12, cd: 10, k: 1, v: 180, e: 1, b: 'sh', d: 'AC -3，持續 3 分鐘', p: 600 },
  { c: 2, n: '火球術', lv: 8, mp: 20, cd: 3, k: 5, v: 2.0, e: 2, b: '', d: '爆炸火球，目標周圍 200% 傷害', p: 2500 },
  { c: 2, n: '加速術', lv: 12, mp: 25, cd: 30, k: 10, v: 120, e: 6, b: '', d: '獲得加速效果 2 分鐘', p: 5000 },
  { c: 2, n: '冰錐術', lv: 15, mp: 22, cd: 4, k: 3, v: 2.4, e: 3, b: 'slow', d: '240% 傷害並緩速 3 秒', p: 8000 },
  { c: 2, n: '瞬間移動', lv: 18, mp: 20, cd: 10, k: 8, v: 0, e: 8, b: '', d: '隨機傳送到目前區域的某處', p: 12000 },
  { c: 2, n: '落雷', lv: 20, mp: 30, cd: 5, k: 7, v: 3.0, e: 4, b: '', d: '雷擊目標 300% 並連鎖 2 個敵人', p: 20000 },
  { c: 2, n: '召喚術', lv: 25, mp: 40, cd: 60, k: 9, v: 60, e: 7, b: '', d: '召喚戰狼協助戰鬥 60 秒', p: 40000 },
  { c: 0, n: '反擊屏障', lv: 18, mp: 25, cd: 60, k: 1, v: 90, e: 1, b: 'cb', d: '受到攻擊時 25% 機率反彈 2 倍傷害，持續 90 秒', p: 15000 },
  { c: 0, n: '增幅防禦', lv: 30, mp: 30, cd: 90, k: 1, v: 120, e: 1, b: 'hb', d: 'AC -6，持續 2 分鐘', p: 60000 },
  { c: 1, n: '風之神射', lv: 10, mp: 20, cd: 60, k: 1, v: 120, e: 6, b: 'ws', d: '攻擊速度 +30%，持續 2 分鐘', p: 3000 },
  { c: 1, n: '火焰武器', lv: 14, mp: 20, cd: 60, k: 1, v: 120, e: 2, b: 'fw', d: '傷害 +15%，持續 2 分鐘', p: 6000 },
  { c: 1, n: '精準目標', lv: 18, mp: 20, cd: 45, k: 1, v: 90, e: 4, b: 'pc', d: '暴擊率 +15%，持續 90 秒', p: 15000 },
  { c: 1, n: '召喚屬性精靈', lv: 28, mp: 40, cd: 60, k: 9, v: 60, e: 7, b: '', d: '召喚精靈協助戰鬥 60 秒', p: 50000 },
  { c: 2, n: '魔法屏障', lv: 10, mp: 20, cd: 60, k: 1, v: 120, e: 7, b: 'mb', d: '受到的傷害 -15%，持續 2 分鐘', p: 3000 },
  { c: 2, n: '冰矛', lv: 22, mp: 28, cd: 4, k: 3, v: 3.0, e: 3, b: 'slow', d: '300% 冰屬性傷害並緩速', p: 25000 },
  { c: 2, n: '龍捲風', lv: 26, mp: 35, cd: 7, k: 5, v: 2.2, e: 6, b: '', d: '在目標處捲起龍捲風，範圍 220% 傷害', p: 40000 },
  { c: 2, n: '聖結界', lv: 28, mp: 30, cd: 60, k: 1, v: 120, e: 4, b: 'hb', d: 'AC -6，持續 2 分鐘', p: 50000 },
  { c: 2, n: '隕石', lv: 32, mp: 50, cd: 10, k: 5, v: 3.2, e: 2, b: '', d: '召喚隕石砸向目標，範圍 320% 傷害', p: 80000 },
  { c: 0, n: '戰鬥意志', lv: 22, mp: 10, cd: 1, k: 11, v: 0.8, e: 2, b: 'tw', d: '切換技能：開啟時傷害 +12%、暴擊 +5%，每秒消耗 0.8 MP（再按一次關閉）', p: 25000 },
  { c: 0, n: '重甲精通', lv: 16, mp: 0, cd: 0, k: 12, v: 0, e: 1, b: 'pk', d: '被動技能：AC -3、最大生命 +8%', p: 10000 },
  { c: 1, n: '鷹眼', lv: 20, mp: 10, cd: 1, k: 11, v: 0.8, e: 4, b: 'he', d: '切換技能：開啟時暴擊 +10%、命中 +10%，每秒消耗 0.8 MP（再按一次關閉）', p: 20000 },
  { c: 1, n: '弓術精通', lv: 16, mp: 0, cd: 0, k: 12, v: 0, e: 0, b: 'pe', d: '被動技能：傷害 +8%、暴擊 +5%', p: 10000 },
  { c: 2, n: '魔力增幅', lv: 24, mp: 15, cd: 1, k: 11, v: 2, e: 7, b: 'ma', d: '切換技能：開啟時魔法傷害 +20%，每秒消耗 2 MP（再按一次關閉）', p: 30000 },
  { c: 2, n: '魔力精通', lv: 16, mp: 0, cd: 0, k: 12, v: 0, e: 7, b: 'pm', d: '被動技能：最大魔力 +10%、魔力回復 +40%', p: 10000 },
  { c: 0, n: '審判之劍', lv: 20, mp: 30, cd: 6, k: 0, v: 4.0, e: 4, b: 'stun', d: '聖光斬擊，400% 傷害並暈眩（鑽石兌換限定）', p: 0 },
  { c: 1, n: '暴風三連矢', lv: 20, mp: 28, cd: 4, k: 6, v: 1.9, e: 6, b: '', d: '連射三支暴風箭，每箭 190% 傷害（鑽石兌換限定）', p: 0 },
  { c: 2, n: '冰雪暴', lv: 24, mp: 45, cd: 8, k: 5, v: 3.0, e: 3, b: '', d: '在目標處降下冰雪暴，範圍 300% 傷害（鑽石兌換限定）', p: 0 },
];
const SKC = ['#ffb040', '#ffe08a', '#ff7030', '#80e0ff', '#fff6a0', '#80ffa0', '#a0ffd0', '#c0a0ff', '#a0d0ff'];
const PJC = ['#ffffff', '#c9a0ff', '#ff8a30', '#a0e8ff', '#fff6a0', '#c8f4ff', '#ff8a30'];
const BSK = [0, 6, 13], HK = ['Q', 'E', 'R', 'T', 'G', 'Z', 'X', 'V'];
interface Bolt { x1: number; y1: number; x2: number; y2: number; l: number }
interface Pet { x: number; y: number; life: number; cd: number; face: number; walk: number; tg: Mon | null; sp?: boolean }
interface Fx { k: number; x: number; y: number; l: number; m: number }
const SKT = [0, 40, 150, 400, 900];
function skLv(p: Pl, id: number): number { const u = p.skx?.[id] ?? 0; let l = 1; for (let i = 1; i < SKT.length; i++) if (u >= (SKT[i] ?? 1e9)) l = i + 1; return l; }
function skM(p: Pl, id: number): number { return 1 + (skLv(p, id) - 1) / 12; }
function skNext(p: Pl, id: number): string { const l = skLv(p, id), u = p.skx?.[id] ?? 0; return l >= 5 ? `熟練度 Lv.5（已滿）` : `熟練度 Lv.${l}（${Math.floor(u)}/${SKT[l] ?? 0}）`; }
function skUse(g: G, id: number, n?: number): void {
  const p = g.p, s = SK[id]; if (!s) return;
  if (!p.skx) p.skx = {};
  const l0 = skLv(p, id); p.skx[id] = (p.skx[id] ?? 0) + (n ?? 1);
  const l1 = skLv(p, id);
  if (l1 > l0) { addLog(g, `技能熟練度提升：${s.n} Lv.${l1}！`, '#c8a8ff'); addText(g, p.x, p.y - 66, `${s.n} Lv.${l1}`, '#c8a8ff', 15); ring(g, p.x, p.y - 12, '#c8a8ff', 130, 0.5); }
}
function bfL(p: Pl, k: string): number { const id = SK.findIndex((s: SDef) => s.b === k && s.c === p.cls && (s.k === 1 || s.k === 11 || s.k === 12)); return id >= 0 ? skLv(p, id) : 1; }
function skLvText(p: Pl, id: number): string {
  const s = SK[id]; if (!s) return ''; const l = skLv(p, id), L = l - 1;
  if (s.k === 0 || s.k === 3 || s.k === 4 || s.k === 5 || s.k === 6 || s.k === 7) return `目前效果：傷害 ${Math.round(s.v * skM(p, id) * 100)}%（每級 +${Math.round(s.v * 100 / 12)}%）`;
  if (s.k === 2) return `目前效果：回復量 ×${skM(p, id).toFixed(2)}`;
  const tab: Record<string, string> = { ac: `AC -${4 + Math.floor(L / 2)}`, sh: `AC -${3 + Math.floor(L / 2)}`, at: `傷害 +${Math.round((0.2 + 0.025 * L) * 100)}%`, sp: `移動速度 +${Math.round((0.25 + 0.025 * L) * 100)}%`, dg: `閃避 +${Math.round((0.15 + 0.0125 * L) * 1000) / 10}%`, hb: `AC -${6 + Math.floor(L / 2)}`, fw: `傷害 +${Math.round((0.15 + 0.025 * L) * 100)}%`, pc: `暴擊 +${Math.round((0.15 + 0.0125 * L) * 1000) / 10}%`, mb: `受到傷害 -${Math.round((0.15 + 0.0125 * L) * 1000) / 10}%`, tw: `傷害 +${Math.round((0.12 + 0.02 * L) * 100)}%、暴擊 +${Math.round((0.05 + 0.0075 * L) * 1000) / 10}%`, he: `暴擊 +${10 + L}%、命中 +${10 + L}%`, ma: `魔法傷害 +${Math.round((0.2 + 0.025 * L) * 100)}%`, cb: `反擊機率 ${Math.round((0.25 + 0.025 * L) * 100)}%`, ws: `攻擊速度 +${Math.round((1 / (0.75 - 0.0125 * L) - 1) * 100)}%`, pk: `AC -${3 + Math.floor(L / 2)}、最大生命 +${8 + L}%`, pe: `傷害 +${8 + L}%、暴擊 +${5 + L * 0.5}%`, pm: `最大魔力 +${10 + L}%、魔力回復 +${40 + L * 5}%` };
  const t = tab[s.b]; const dur = s.k === 1 || s.k === 9 || s.k === 10 ? `，持續 ${fmtT(Math.round(s.v * (1 + 0.1 * L)))}` : '';
  return t ? `目前效果：${t}${dur}` : dur ? `目前效果${dur}` : '';
}
function learnSk(g: G, id: number): boolean {
  const p = g.p, s = SK[id];
  if (!s) return false;
  if (s.c !== p.cls) { addLog(g, `這是${CLN[s.c] ?? ''}專用的技能書。`, '#ff9090'); return false; }
  if (p.sk.indexOf(id) >= 0) { addLog(g, `已經學會 ${s.n} 了。`, '#c0c8d0'); return false; }
  if (p.lv < s.lv) { addLog(g, `需要等級 ${s.lv} 才能學習 ${s.n}。`, '#ff9090'); return false; }
  p.sk.push(id);
  const e = s.k === 12 ? -1 : p.hb.indexOf(-1);
  if (e >= 0) p.hb[e] = id;
  addLog(g, `學會了新技能：${s.n}！${e >= 0 ? `已放入快捷欄 ${HK[e] ?? ''}。` : ''}`, '#c8a8ff');
  g.banner = { t: `學會技能：${s.n}`, c: '#c8a8ff', l: 2 };
  ring(g, p.x, p.y - 12, '#c8a8ff', 150, 0.6); emit(g, p.x, p.y - 15, 30, '#c8a8ff', 110, 0.9, 3);
  return true;
}
function castSk(g: G, id: number): boolean {
  const p = g.p, s = SK[id];
  if (!s || p.dead > 0) return false;
  if (p.sk.indexOf(id) < 0) { addLog(g, `尚未學會 ${s.n}。`, '#c0c8d0'); return false; }
  if (BSK.indexOf(id) >= 0) { castSkill(g); return true; }
  if (s.k === 12) { addLog(g, `${s.n} 是被動技能，學會後自動生效。`, '#c0c8d0'); return false; }
  if ((p.scd[id] ?? 0) > g.time) return false;
  if (s.c === 1 && /箭|矢/.test(s.n) && !bowOn(p)) { if (g.time - BOWT > 30) { BOWT = g.time; addLog(g, `需要裝備弓才能施放${s.n}。`, '#ff9090'); } return false; }
  if (s.k === 11 && (p.bf[s.b] ?? 0) > 0) { p.bf[s.b] = 0; p.scd[id] = g.time + s.cd; addLog(g, `${s.n} 已關閉。`, '#c0c8d0'); addText(g, p.x, p.y - 56, `${s.n} 關閉`, '#a0a8b8', 13); return true; }
  if (p.mp < s.mp) { addLog(g, `魔力不足，無法施放${s.n}。`, '#90b0ff'); return false; }
  const col = SKC[s.e] ?? '#ffffff', st = stats(p);
  if (s.k === 1) { const fk = ({ cb: 2, hb: 1, mb: 3, ws: 4, fw: 5, pc: 6 } as Record<string, number>)[s.b]; if (fk !== undefined) { const tg = fk === 6 && p.tgt && p.tgt.dead <= 0 ? p.tgt : null; g.fx.push({ k: fk, x: tg ? tg.x : p.x, y: tg ? tg.y : p.y, l: 1, m: 1 }); } const had = (p.bf[s.b] ?? 0) > 0; p.bf[s.b] = Math.round(s.v * (1 + 0.1 * (skLv(p, id) - 1))); if (s.b === 'ws' && !had && p.cd > 0) p.cd *= 0.75; addText(g, p.x, p.y - 56, `${s.n}！`, col, 14); ring(g, p.x, p.y - 12, col, 130, 0.6); emit(g, p.x, p.y - 15, 26, col, 100, 0.8, 3); }
  else if (s.k === 11) { p.bf[s.b] = 1e6; addLog(g, `${s.n} 已開啟（每秒消耗 ${s.v} MP）。`, col); g.fx.push({ k: s.e === 7 ? 3 : s.e === 4 ? 6 : 5, x: p.x, y: p.y, l: 0.8, m: 0.8 }); ring(g, p.x, p.y - 12, col, 120, 0.5); emit(g, p.x, p.y - 15, 20, col, 90, 0.7, 3); }
  else if (s.k === 2) { const v = Math.round(st.mhp * s.v * skM(p, id)); p.hp = Math.min(st.mhp, p.hp + v); addText(g, p.x, p.y - 44, `+${v}`, '#60ff80', 18); ring(g, p.x, p.y - 12, col, 110, 0.6); emit(g, p.x, p.y - 15, 30, col, 80, 0.9, 3); }
  else if (s.k === 10) { p.hasteT = Math.max(p.hasteT, Math.round(s.v * (1 + 0.1 * (skLv(p, id) - 1)))); ring(g, p.x, p.y, col, 120, 0.5); emit(g, p.x, p.y - 15, 20, col, 110, 0.6, 3); }
  else if (s.k === 8) { const z = zoneAt(p.x, p.y), sp = z >= 0 ? zoneSpot(z) : null; if (!sp) { addLog(g, '這裡無法使用瞬間移動。', '#c0c8d0'); return false; } tpTo(g, sp.x, sp.y); }
  else if (s.k === 9) { g.pet = { x: p.x - 24, y: p.y + 6, life: Math.round(s.v * (1 + 0.1 * (skLv(p, id) - 1))), cd: 0, face: 1, walk: 0, tg: null, sp: id === 28 }; ring(g, p.x - 24, p.y, col, 140, 0.6); emit(g, p.x - 24, p.y - 10, 30, col, 120, 0.8, 3); }
  else if (s.k === 4) {
    let n = 0;
    for (const m of g.mons) if (m.dead <= 0 && Math.hypot(m.x - p.x, m.y - p.y) < 95 + md(m).r) { hitMon(g, m, s.v * skM(p, id)); n++; }
    if (!n) { if (!g.auto) addLog(g, '附近沒有敵人。', '#c0c8d0'); return false; }
    ring(g, p.x, p.y - 10, col, 260, 0.45); ring(g, p.x, p.y - 10, '#ffffff', 180, 0.35); emit(g, p.x, p.y - 12, 40, col, 260, 0.5, 3.5); g.shake = Math.max(g.shake, 0.15); p.combatT = 0;
  } else {
    const m = p.tgt && p.tgt.dead <= 0 ? p.tgt : nearest(g, prng(p) + 120);
    if (!m) { if (!g.auto) addLog(g, '附近沒有可攻擊的目標。', '#c0c8d0'); return false; }
    const d = md(m), rng = (s.k === 0 ? prng(p) : Math.max(prng(p), 220)) + d.r + 24;
    if (Math.hypot(m.x - p.x, m.y - p.y) > rng) { if (!g.auto) addLog(g, '目標太遠了，先靠近一點。', '#c0c8d0'); p.tgt = m; return false; }
    p.tgt = m; p.face = Math.atan2(m.y - p.y, m.x - p.x); p.combatT = 0; p.cd = Math.max(p.cd, 0.4);
    const km = skM(p, id);
    if (s.k === 0) { hitMon(g, m, s.v * km); if (s.b === 'stun' && m.dead <= 0) m.stun = 2; ring(g, m.x, m.y - d.r, col, 160, 0.35); emit(g, m.x, m.y - d.r, 26, col, 220, 0.5, 3.5); g.shake = Math.max(g.shake, 0.12); }
    else if (s.k === 6) { const h = hand(p); for (let i = 0; i < 3; i++) g.proj.push({ x: h.x, y: h.y, t: m, k: 0, mult: s.v * km, sp: 560 - i * 70, life: 2, a: p.face + (i - 1) * 0.2, dl: h.dl + i * 0.05 }); }
    else if (s.k === 7) {
      hitMon(g, m, s.v * km); g.bolts.push({ x1: m.x + rnd(-20, 20), y1: m.y - 260, x2: m.x, y2: m.y - d.r, l: 0.35 }); ring(g, m.x, m.y, col, 150, 0.4); emit(g, m.x, m.y - d.r, 24, col, 200, 0.5, 3);
      let last: Mon = m, hops = 0;
      for (const o of g.mons) { if (hops >= 2) break; if (o === m || o.dead > 0 || Math.hypot(o.x - last.x, o.y - last.y) > 160) continue; g.bolts.push({ x1: last.x, y1: last.y - md(last).r, x2: o.x, y2: o.y - md(o).r, l: 0.3 }); hitMon(g, o, s.v * 0.5 * km); last = o; hops++; }
      g.shake = Math.max(g.shake, 0.12);
    } else { const h = id === 33 ? { x: m.x - 150, y: m.y - 380, dl: 0.15 } : hand(p); g.proj.push({ x: h.x, y: h.y, t: m, k: id === 30 ? 5 : id === 33 ? 6 : s.e === 2 ? 2 : s.e === 3 ? 3 : 4, mult: s.v, sp: id === 33 ? 650 : 460, life: 2, a: p.face, sk: id, dl: h.dl }); }
  }
  p.mp -= s.mp; p.scd[id] = g.time + s.cd; p.swing = 0.3; skUse(g, id);
  sfx(s.k === 6 ? 'bow' : `e${s.e}`);
  addText(g, p.x, p.y - 56, s.n, col, 14);
  return true;
}
function skHit(g: G, id: number, m: Mon): void {
  const s = SK[id];
  if (!s) return;
  const d = md(m), col = SKC[s.e] ?? '#ffffff', km = skM(g.p, id);
  if (s.k === 5) {
    for (const o of g.mons) if (o.dead <= 0 && Math.hypot(o.x - m.x, o.y - m.y) < 85 + md(o).r) hitMon(g, o, s.v * km);
    if (s.e === 6) g.fx.push({ k: 0, x: m.x, y: m.y, l: 1.3, m: 1.3 });
    if (s.e === 6) for (let i = 0; i < 40; i++) { const a = Math.random() * TAU, rr = rnd(5, 40); if (g.parts.length > 450) g.parts.shift(); g.parts.push({ x: m.x + Math.cos(a) * rr, y: m.y - rnd(0, 20), vx: -Math.sin(a) * 130, vy: -rnd(140, 280), l: 0.9, m: 0.9, c: i % 2 ? '#c0ffe0' : '#ffffff', s: 3 }); }
    if (s.e === 2 && s.v >= 3) { g.fx.push({ k: 8, x: m.x, y: m.y, l: 0.9, m: 0.9 }); ring(g, m.x, m.y, '#ff6020', 320, 0.7); g.shake = Math.max(g.shake, 0.35); emit(g, m.x, m.y - 10, 50, '#ff8030', 300, 0.8, 4.5); }
    sfx('boom'); ring(g, m.x, m.y - d.r * 0.5, col, 200, 0.5); ring(g, m.x, m.y - d.r * 0.5, '#ffffff', 120, 0.35); emit(g, m.x, m.y - d.r, 40, col, 220, 0.6, 4); g.shake = Math.max(g.shake, 0.12);
  } else { if (id === 30) g.fx.push({ k: 7, x: m.x, y: m.y - d.r, l: 0.6, m: 0.6 }); hitMon(g, m, s.v * km); if (s.b === 'slow' && m.dead <= 0) m.slow = 3; ring(g, m.x, m.y - d.r, col, 110, 0.3); emit(g, m.x, m.y - d.r, 18, col, 160, 0.5, 3); }
}
function useSlot(g: G, i: number): void {
  const id = g.p.hb[i] ?? -1;
  if (id < 0) { addLog(g, '這個快捷欄還沒有技能（按 K 開啟技能視窗設定）。', '#c0c8d0'); return; }
  castSk(g, id);
}
const AUTO: Set<number> = (() => { try { const a: unknown = JSON.parse(localStorage.getItem('sm_autocast') ?? '[]'); return new Set<number>(Array.isArray(a) ? a.filter((v: unknown): v is number => typeof v === 'number') : []); } catch { return new Set<number>(); } })();
function saveAuto(): void { try { localStorage.setItem('sm_autocast', JSON.stringify(Array.from(AUTO))); } catch { /* ignore */ } }
let ACT = 0;
const HBD = { i: -1, y: 0, x: 0, moved: false, done: false };
function autoSkill(g: G, inRange: boolean): void {
  const p = g.p, st = stats(p);
  if (AUTO.size === 0 || p.dead > 0) return;
  const m = p.tgt && p.tgt.dead <= 0 ? p.tgt : null;
  for (let i = 0; i < p.hb.length; i++) {
    if (!AUTO.has(i)) continue;
    const id = p.hb[i] ?? -1, s = SK[id];
    if (!s || (p.scd[id] ?? 0) > g.time || p.mp < s.mp) continue;
    if (s.k === 12 || s.k === 8) continue;
    if (s.k === 1 || s.k === 11) { if ((p.bf[s.b] ?? 0) <= 0 && (s.k === 1 || p.mp > st.mmp * 0.3)) castSk(g, id); continue; }
    if (s.k === 10) { if (p.hasteT <= 0) { castSk(g, id); return; } continue; }
    if (s.k === 2) { if (p.hp < st.mhp * 0.6) { castSk(g, id); return; } continue; }
    if (!m) continue;
    const near = inRange || Math.hypot(m.x - p.x, m.y - p.y) < (p.cls === 0 && s.k !== 3 && s.k !== 5 ? 46 : 300) + md(m).r;
    if (!near) continue;
    if (s.k === 9) { if (!g.pet) { castSk(g, id); return; } continue; }
    if (BSK.indexOf(id) >= 0 && p.skCd > 0) continue;
    if (castSk(g, id)) return;
  }
}
function autoCast(g: G, dt: number): void {
  ACT -= dt;
  if (ACT > 0 || AUTO.size === 0) return;
  ACT = 0.25;
  const p = g.p;
  if (g.auto) { for (let i = 0; i < p.hb.length; i++) { const id = p.hb[i] ?? -1, s = SK[id]; if (!AUTO.has(i) || !s || p.dead > 0 || (p.scd[id] ?? 0) > g.time || p.mp < s.mp) continue; if (s.k === 1 && (p.bf[s.b] ?? 0) <= 0) castSk(g, id); else if (s.k === 10 && p.hasteT <= 0) castSk(g, id); } return; }
  const m = p.tgt && p.tgt.dead <= 0 ? p.tgt : null;
  autoSkill(g, !!m && p.combatT < 4 && Math.hypot(m.x - p.x, m.y - p.y) < (p.cls === 0 ? 46 : 300) + md(m).r);
}
function stepPet(g: G, dt: number): void {
  const pt = g.pet, p = g.p;
  if (!pt) return;
  pt.life -= dt; pt.cd -= dt;
  if (pt.life <= 0 || p.dead > 0) { emit(g, pt.x, pt.y - 10, 20, '#c0a0ff', 100, 0.6, 3); g.pet = null; return; }
  if (Math.hypot(pt.x - p.x, pt.y - p.y) > 600) { pt.x = p.x - 20; pt.y = p.y + 8; pt.tg = null; }
  let t: Mon | null = pt.tg && pt.tg.dead <= 0 ? pt.tg : null;
  if (!t) {
    const pm = p.tgt;
    t = pm && pm.dead <= 0 ? pm : null;
    if (!t) { let bd = 240; for (const m of g.mons) { if (m.dead > 0 || m.st !== 1) continue; const dd = Math.hypot(m.x - pt.x, m.y - pt.y); if (dd < bd) { bd = dd; t = m; } } }
    pt.tg = t;
  }
  const tx = t ? t.x : p.x - 30, ty = t ? t.y : p.y + 10, dx = tx - pt.x, dy = ty - pt.y, dist = Math.hypot(dx, dy) || 1, reach = t ? md(t).r + 16 : 36;
  if (dist > reach) { const sp = 170 * dt; moveBy(pt, (dx / dist) * sp, (dy / dist) * sp, 8, false); pt.walk += dt; if (Math.abs(dx) > 1) pt.face = dx < 0 ? -1 : 1; }
  else if (t && pt.cd <= 0) {
    pt.cd = 0.9;
    const dmg = Math.max(1, Math.round(stats(p).atk * 0.7 * rnd(0.85, 1.2) - md(t).def * 0.5));
    t.hp -= dmg; t.hit = 0.12;
    if (t.st !== 1) t.st = 1;
    addText(g, t.x, t.y - md(t).r * 1.6, String(dmg), '#c8b0ff', 13); emit(g, t.x, t.y - md(t).r, 6, '#c8b0ff', 100, 0.3, 2.5);
    if (t.hp <= 0) killMon(g, t);
  }
}

/* ---------- AI players ---------- */
const BOTN = ['小雪', '暗夜騎士', '風之妖精', '藍色法師', '阿傑', '銀月守護者', '無名劍士', '星辰', '紅月', '小狼'];
const BOTCK = ['#3a5ac0', '#8a2a2a', '#2a6a3a', '#5a3a8a', '#7a5a2a', '#2a2a3a'];
const BCHAT = ['有人要組隊嗎？', '這裡的怪好多啊', '+7 武器終於成功了！', '誰有多的紅水？', '晚上的森林好可怕…', '剛剛差點死掉', '求組 古代遺跡', '收 精靈鏈甲', '哈哈，又升級了！', '妖魔洞窟 3F 有王！', '有人看到雪原之王嗎？', '銀月村集合～', '強化失敗了…哭', '掛機打寶中', '新手可以去晨風草原練功喔'];
function townPt(ti: number): Pt {
  const t = TOWNS[ti] ?? (TOWNS[0] as Town);
  if (WID === 0) for (let k = 0; k < 30; k++) { const x = (t.x + 4 + Math.random() * 28) * TS, y = (t.y + 5 + Math.random() * 19) * TS; if (free(x, y, 8, false)) return { x, y }; }
  return { x: (t.x + 18) * TS, y: (t.y + 15.5) * TS };
}
function spotNear(c: Pt, r: number): Pt {
  if (WID !== 0) return { x: c.x, y: c.y };
  const tx0 = Math.floor(c.x / TS), ty0 = Math.floor(c.y / TS);
  for (let i = 0; i < 30; i++) { const tx = tx0 + Math.floor(rnd(-r, r + 1)), ty = ty0 + Math.floor(rnd(-r, r + 1)); if (tx > 0 && ty > 0 && tx < MW - 1 && ty < MH - 1 && !blk(tx, ty) && REACH[ty * MW + tx] === 1 && (ZMAP[ty * MW + tx] ?? 0) !== -1) return { x: (tx + 0.5) * TS, y: (ty + 0.5) * TS }; }
  return { x: c.x, y: c.y };
}
function botInit(b: Bot): Bot { if (b.kc === undefined) b.kc = Math.round(b.lv * 20 * rnd(0.7, 1.3)); if (b.en === undefined) b.en = Math.round(b.lv * 0.25 * rnd(0.6, 1.4)); return b; }
function bMhp(b: Bot): number { return Math.round((60 + b.lv * 24) * ([1.3, 1, 0.85][b.cls] ?? 1)) + b.at * 40; }
function bDef(b: Bot): number { return b.lv * 0.5 + b.at * 2; }
function bAtk(b: Bot): number { return (8 + b.lv * 2.6 + b.wt * 4) * 0.8; }
const AFS = [4, 5, 1.25, 0.6, 3, 3, 6, 6, 6, 3, 4, 3, 2.5];
function itemScore(it: Item): number {
  const d = idf(it); let s = d.s === 0 ? (d.atk + it.en) * 4 : (d.ac + it.en) * 5;
  s += d.st.reduce((a: number, v: number) => a + v, 0) * 6 + d.hp * 0.25 + d.mp * 0.2 + (d.sp ? 12 : 0);
  for (const c0 of it.af ?? []) s += (AFS[Math.floor(c0 / 100)] ?? 0) * (c0 % 100);
  return Math.max(1, Math.round(s));
}
let TSC: number[] = [];
function tierScore(t: number): number { if (!TSC.length) TSC = [0, 1, 2, 3, 4, 5, 6].map((tt: number) => { const ids = IT.map((_d: IDef, i: number) => i).filter((i: number) => (IT[i] as IDef).t === tt && (IT[i] as IDef).r === 0); return ids.length ? ids.reduce((a: number, i: number) => a + itemScore({ id: 0, b: i, en: 0 }), 0) / ids.length : 30 * (tt + 1); }); return TSC[clamp(t, 0, 6)] ?? 30; }
function gearTotal(p: Pl): number { return p.eq.reduce((a: number, it: Item | null) => a + (it ? itemScore(it) : 0), 0); }
function enTotal(p: Pl): number { return p.eq.reduce((a: number, it: Item | null) => a + (it ? it.en : 0), 0); }
function botGS(b: Bot): number { const worn = Math.min(13, 5 + Math.floor(b.lv / 6)), t = clamp(Math.floor(b.lv / 12), 0, 5); return Math.round(worn * tierScore(t) * 1.25 + (b.en ?? 0) * 4.5); }
let PVP = -1, PVPC = -1, PVPCT = 0;
const PKATK: Record<number, { dmg: number; t: number }> = {};
function pkNote(g: G, bi: number, dmg: number): void {
  const rec = PKATK[bi];
  if (!rec || g.time - rec.t > 6) PKATK[bi] = { dmg: Math.max(0, dmg), t: g.time };
  else { rec.dmg += Math.max(0, dmg); rec.t = g.time; }
}
function pkShow(g: G): Bot | null {
  if (g.p.dead > 0) return null;
  let bestI = -1, bestD = -1, lateI = -1, lateT = -1, lateD = 0;
  for (const ks of Object.keys(PKATK)) {
    const i = Number(ks), rec = PKATK[i];
    if (!rec || g.time - rec.t > 6) continue;
    const b = g.bots[i];
    if (!b || (b.dd ?? 0) > 0 || b.st === 3 || zoneAt(b.x, b.y) === -1 || zoneAt(g.p.x, g.p.y) === -1) continue;
    if (rec.dmg > bestD || (rec.dmg === bestD && rec.t >= lateT)) { bestI = i; bestD = rec.dmg; }
    if (rec.t > lateT) { lateI = i; lateT = rec.t; lateD = rec.dmg; }
  }
  const i = lateI >= 0 && lateD >= bestD * 0.9 ? lateI : bestI;
  return i >= 0 ? (g.bots[i] ?? null) : null;
}
function pkRetaliate(g: G): void {
  const b = pkShow(g); if (!b) return;
  const i = g.bots.indexOf(b);
  if (i < 0 || !pvpOk(g, b)) { addLog(g, '現在無法反擊（城鎮內禁止 PvP，或對方已離開）。', '#ff9090'); return; }
  if (PVP === i) return;
  PVP = i; PVPC = -1;
  g.p.tgt = null; g.p.path = []; g.p.dest = null; g.p.repath = 0;
  addLog(g, `【PvP】你向 ${b.n} 反擊！`, '#ff8080');
  g.banner = { t: `反擊 ${b.n}！`, c: '#ff8080', l: 1.6 };
}
function nearWB(b: Bot): boolean { const m = WBS.m; return !!m && m.dead <= 0 && WID === 0 && Math.hypot(m.x - b.x, m.y - b.y) < 700; }

function pvpOk(g: G, b: Bot): boolean { return WID === 0 && b.st === 2 && (b.dd ?? 0) <= 0 && zoneAt(b.x, b.y) !== -1 && zoneAt(g.p.x, g.p.y) !== -1 && g.p.dead <= 0; }
function pickBot(g: G, wx: number, wy: number): number { if (WID !== 0) return -1; let bi = -1, bd = 22; g.bots.forEach((b: Bot, i: number) => { if ((b.dd ?? 0) > 0 || b.st === 3) return; const d = Math.hypot(b.x - wx, clamp(wy, b.y - 50, b.y - 6) - wy); if (d < bd) { bd = d; bi = i; } }); return bi; }
function pvpStep(g: G, dt: number): void {
  const p = g.p, b = g.bots[PVP];
  if (!b || !pvpOk(g, b)) { if (b && zoneAt(b.x, b.y) === -1) addLog(g, '城鎮內禁止 PvP。', '#ff9090'); PVP = -1; return; }
  const dist = Math.hypot(b.x - p.x, b.y - p.y);
  if (dist > prng(p) + 14) {
    if (p.repath <= 0) { p.repath = 0.4; if (los(p.x, p.y, b.x, b.y)) p.path = []; else { const fp = findPath(p.x, p.y, b.x, b.y); p.path = fp ?? []; } }
    p.dest = { x: b.x, y: b.y }; follow(g, dt);
  } else {
    p.path = []; p.dest = null; p.face = Math.atan2(b.y - p.y, b.x - p.x);
    if (p.cd <= 0) {
      const s = stats(p), crit = Math.random() < s.crit; let mult = 1;
      if (!p.eq[0] && p.cls !== 2) mult *= 0.45; else if (p.cls === 1 && !bowOn(p)) mult *= 0.6;
      const dmg = Math.max(1, Math.round((s.atk * rnd(0.85, 1.25) - bDef(b) * 0.6) * mult * s.dmgB * (crit ? 1.6 : 1)));
      p.cd = atkInt(p, true); p.swing = 0.22; p.combatT = 0; sfx(p.cls === 2 ? 'magic' : p.cls === 1 && bowOn(p) ? 'bow' : 'swing');
      if (p.cls !== 0) for (let k = 0; k < 6; k++) emit(g, p.x + (b.x - p.x) * (k / 6), p.y - 24 + (b.y - p.y) * (k / 6), 2, p.cls === 2 ? '#b07cff' : '#ffe0a0', 40, 0.25, 2);
      pvpHurt(g, b, dmg, crit);
    }
  }
}
function pvpHurt(g: G, b: Bot, dmg: number, crit: boolean): void {
  const mx = bMhp(b); b.php = (b.php ?? mx) - dmg; b.swing = 0;
  if (!b.ag) { b.ag = 1; b.acd = 0.4; b.agT = 60; b.vs = -1; botSay(g, b, ['你幹嘛打我！', '想打架？來啊！', '偷襲？太卑鄙了！'][Math.floor(Math.random() * 3)] ?? '', true); }
  addText(g, b.x + rnd(-6, 6), b.y - 58, crit ? `暴擊 ${dmg}` : String(dmg), crit ? '#ffb040' : '#ffffff', crit ? 15 : 13);
  emit(g, b.x, b.y - 20, 6, '#ff6060', 90, 0.3, 2);
  if (b.php <= 0) {
    emit(g, b.x, b.y - 20, 26, '#ff4040', 150, 0.8, 3.5); ring(g, b.x, b.y - 15, '#ff4040', 150, 0.6);
    b.dd = 20; b.ag = 0; b.php = 0; b.tg = null; PVP = -1;
    g.p.pk = (g.p.pk ?? 0) + 1;
    addLog(g, `【PvP】你擊殺了玩家 ${b.n}（${CLN[b.cls] ?? ''} Lv.${b.lv}）！PvP 擊殺 ${g.p.pk}`, '#ff8080');
    g.banner = { t: `擊殺玩家 ${b.n}！`, c: '#ff8080', l: 2.2 };
  }
}
function botPvp(g: G, b: Bot, dt: number, near: boolean): boolean {
  const p = g.p, mx = bMhp(b);
  if ((b.dd ?? 0) > 0) { b.dd = (b.dd ?? 0) - dt; if ((b.dd ?? 0) <= 0) { b.dd = 0; b.php = mx; b.st = 0; b.tm = rnd(20, 40); b.pt = -1; botWarp(g, b, townPt(Math.random() < 0.5 ? 0 : 1), false); addLog(g, `${b.n} 在城鎮復活了。`, '#c8d8ff'); } return true; }
  if (!b.ag) { if ((b.php ?? mx) < mx && (b.vs ?? -1) < 0) b.php = Math.min(mx, (b.php ?? mx) + mx * 0.04 * dt); return false; }
  b.agT = (b.agT ?? 60) - dt; if ((b.agT ?? 0) <= 0 && !(PVP >= 0 && g.bots[PVP] === b)) { b.ag = 0; b.agT = 60; botSay(g, b, '算了，今天先放過你。', near); return false; }
  if (!near || p.dead > 0 || WID !== 0 || zoneAt(p.x, p.y) === -1 || zoneAt(b.x, b.y) === -1 || Math.hypot(p.x - b.x, p.y - b.y) > 700) { b.ag = 0; if (PVP >= 0 && g.bots[PVP] === b) PVP = -1; return false; }
  b.tg = null; const rng = b.cls === 0 ? 34 : 170, dd = Math.hypot(p.x - b.x, p.y - b.y);
  b.face = Math.atan2(p.y - b.y, p.x - b.x);
  if (dd > rng) { if (!botMove(b, p.x, p.y, (b.cls === 1 ? 135 : 118) * dt, dt)) botWarp(g, b, spotNear({ x: p.x, y: p.y }, 2), true); return true; }
  b.acd = (b.acd ?? 0) - dt;
  if ((b.acd ?? 0) <= 0) {
    b.acd = ([0.95, 0.85, 1.05][b.cls] ?? 1) * 1.2; b.swing = 0.22;
    const s = stats(p);
    if (b.cls !== 0) for (let k = 0; k < 6; k++) emit(g, b.x + (p.x - b.x) * (k / 6), b.y - 24 + (p.y - b.y) * (k / 6), 2, b.cls === 2 ? '#b07cff' : '#ffe0a0', 40, 0.25, 2);
    const bi = g.bots.indexOf(b);
    if (Math.random() < s.dodge) { pkNote(g, bi, 0); addText(g, p.x, p.y - 44, '閃避', '#a0e0ff', 13); return true; }
    const dmg = Math.max(1, Math.round((bAtk(b) * rnd(0.8, 1.2) - s.def * 0.7) * (1 - s.mr)));
    p.hp -= dmg; p.hurt = 0.25; p.combatT = 0; sfx('hurt'); addText(g, p.x, p.y - 44, `-${dmg}`, '#ff7070', 13);
    pkNote(g, bi, dmg);
    if (p.hp <= 0) { die(g, `玩家 ${b.n}`); b.kc = (b.kc ?? 0) + 1; b.ag = 0; PVP = -1; botSay(g, b, '哼，自找的。', true); }
  }
  return true;
}
function boardRows(g: G): { n: string; me: boolean; v: number[] }[] {
  const p = g.p, out = [{ n: CLN[p.cls] ?? '你', me: true, v: [p.lv, gearTotal(p), (p.kc ?? 0) + (p.pk ?? 0), enTotal(p)] }];
  g.bots.forEach((b: Bot) => out.push({ n: `${b.n}（${CLN[b.cls] ?? ''}）`, me: false, v: [b.lv, botGS(b), Math.floor(b.kc ?? 0), b.en ?? 0] }));
  return out;
}
function botGear(b: Bot): Bot { b.wt = clamp(Math.floor(b.lv / 7), 0, 4); b.at = clamp(Math.floor((b.lv + 3) / 8), 0, 4); return b; }
function mkBots(): Bot[] {
  return BOTN.map((n: string, i: number) => { const t = townPt(i % 2), lv = 2 + Math.floor(Math.random() * 16); return botGear({ n, cls: Math.floor(Math.random() * 3), lv, exp: 0, wt: 0, at: 0, ck: BOTCK[i % BOTCK.length] ?? '#3a5ac0', x: t.x, y: t.y, face: 0, walk: 0, mv: false, st: 0, wx: t.x, wy: t.y, tg: null, cd: 0, swing: 0, hp: 1, say: '', sayT: 0, tm: rnd(4, 60), z: 0, pt: -1, scan: 0 }); }).map((b: Bot) => botInit(b));
}
function botZone(lv: number): number { const ok = [0, 1, 2, 3, 4, 5, 6, 7].filter((z: number) => (ZLV[z] ?? 99) <= lv + 1).sort((a: number, b: number) => (ZLV[b] ?? 0) - (ZLV[a] ?? 0)); return ok[Math.floor(Math.random() * Math.min(2, ok.length))] ?? 0; }
function botSay(g: G, b: Bot, t: string, log: boolean): void { b.say = t; b.sayT = 4; if (log) addLog(g, `[${b.n}] ${t}`, '#e8c8ff'); }
function botExp(g: G, b: Bot, v: number, near: boolean): void {
  b.exp += v;
  while (b.exp >= needExp(b.lv) && b.lv < 80) {
    b.exp -= needExp(b.lv); b.lv++; botGear(b); if (Math.random() < 0.4) b.en = (b.en ?? 0) + 1;
    if (near) { ring(g, b.x, b.y - 15, '#ffe060', 140, 0.6); emit(g, b.x, b.y - 15, 24, '#ffe060', 140, 0.8, 3); }
    if (near || Math.random() < 0.25) addLog(g, `【玩家】${b.n}（${CLN[b.cls] ?? ''}）升到了 Lv.${b.lv}！`, '#c8e0ff');
  }
}
function botWarp(g: G, b: Bot, q: Pt, vis: boolean): void {
  if (vis) emit(g, b.x, b.y - 15, 16, '#a0d0ff', 100, 0.5, 3);
  b.x = q.x; b.y = q.y; b.wx = q.x; b.wy = q.y; b.tg = null;
  if (vis) ring(g, b.x, b.y - 10, '#a0d0ff', 100, 0.5);
}
function botMove(b: Bot, tx: number, ty: number, sp: number, dt: number): boolean {
  const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
  if (d < 3) return true;
  const ox = b.x, oy = b.y, s = Math.min(sp, d);
  moveBy(b, (dx / d) * s, (dy / d) * s, 8, false);
  b.face = Math.atan2(dy, dx); b.walk += dt; b.mv = true;
  if (Math.hypot(b.x - ox, b.y - oy) < s * 0.2) { b.wx = b.x; b.wy = b.y; return false; }
  return true;
}
function botHit(g: G, b: Bot, m: Mon, dmg: number): void {
  if (m.dead > 0) return;
  const d = md(m);
  m.hp -= dmg; m.hit = 0.1; if (m.st !== 1) m.st = 1; addThreat(m, `b${g.bots.indexOf(b)}`, dmg); if (m.wb) { WBS.B += dmg; WBS.D[b.n] = (WBS.D[b.n] ?? 0) + dmg; }
  addText(g, m.x + rnd(-6, 6), m.y - d.r * 1.6, String(dmg), '#b8c8d8', 11);
  emit(g, m.x, m.y - d.r, 4, '#ffeedd', 90, 0.3, 2);
  if (m.hp <= 0 && m.wb) { killMon(g, m); return; }
  if (m.hp <= 0) {
    m.dead = rnd(10, 18); m.hp = 0; m.dieT = 0.7; m.st = 0;
    if (g.p.tgt === m) g.p.tgt = null;
    emit(g, m.x, m.y - d.r, 18, d.c, 120, 0.6, 3);
    botExp(g, b, d.exp * 0.8, true); b.tg = null; b.kc = (b.kc ?? 0) + 1;
    if (Math.random() < 0.05) botSay(g, b, ['好耶！', '輕鬆～', '再來！', '這隻好硬'][Math.floor(Math.random() * 4)] ?? '', false);
  }
}
function stepWB(g: G, dt: number): void {
  const m = WBS.m;
  if (m) {
    WBS.L -= dt;
    if (m.dead > 0) { WBS.m = null; wbSet(300); return; }
    if (WBS.L <= 0) { m.dead = 1e9; m.hp = 0; m.dieT = 0; if (g.p.tgt === m) g.p.tgt = null; WBS.m = null; wbSet(300); addLog(g, `【世界首領】${md(m).n} 離開了……下次再來吧。`, '#ff9a9a'); }
    return;
  }
  WBS.T -= dt;
  if (m === null && WBS.T > 0 && Math.floor(WBS.T + dt) !== Math.floor(WBS.T) && Math.floor(WBS.T) % 10 === 0) { try { localStorage.setItem('sm_wbt', String(Date.now() + WBS.T * 1000)); } catch { /* ignore */ } }
  if (WBS.T > 0 || WID !== 0 || g.p.lv < 5) return;
  const bi = [23, 24, 25, 40][Math.floor(Math.random() * 4)] ?? 23, d = MD[bi]; if (!d) return;
  const z = clamp(botZone(g.p.lv), 0, 7), c = spotNear(ZPT[z] ?? { x: SPAWN_X, y: SPAWN_Y }, 5);
  const nm = mkMon(bi, c.x, c.y); nm.sc = clamp((g.p.lv + 3) / d.lv, 0.2, 1.1); nm.mhp = Math.round(d.hp * 3 * nm.sc); nm.hp = nm.mhp; nm.wb = true;
  g.mons.push(nm); WBS.m = nm; WBS.P = 0; WBS.B = 0; WBS.D = {}; WBS.L = 600;
  g.banner = { t: `世界首領 ${d.n} 降臨「${ZN[z + 1] ?? ''}」！`, c: '#ff6040', l: 4 }; g.shake = 0.5; sfx('rare');
  addLog(g, `【世界首領】${d.n} 出現在「${ZN[z + 1] ?? ''}」！所有冒險者快去討伐，依貢獻度分配獎勵！（10 分鐘內）`, '#ff8060');
  const b = g.bots[Math.floor(Math.random() * g.bots.length)]; if (b) botSay(g, b, `${d.n} 出現了！大家一起上！`, true);
}
function wbEnd(g: G, m: Mon): void {
  const p = g.p, d = md(m), tot = Math.max(1, WBS.P + WBS.B), sh = clamp(WBS.P / tot, 0, 1);
  m.dead = 1e9; WBS.m = null; wbSet(300);
  const gold = Math.round(3000 + 30000 * sh * (1 + p.lv / 20)), dia = 200 + Math.round(sh * 300), n = sh >= 0.05 ? 2 + Math.round(sh * 2) : 1;
  p.gold += gold; p.dia = (p.dia ?? 0) + dia;
  const slots = (d.ds || '2').split(',').map((v: string) => Number(v)), got: string[] = [];
  giveXs(g, d.n);
  for (let i = 0; i < Math.max(1, n); i++) { const it = mkItem(rollItem(d.lv, slots, true, p.cls, true, i === 0 && Math.random() < 0.5)); rollQ(it, true, bossQ()); if (addItem(g, it)) got.push(`【${QN[it.q ?? 0] ?? ''}】${itemName(it)}`); else { p.bank.push(it); got.push(`${itemName(it)}（已送到倉庫）`); } }
  bossExtra(g, true);
  g.banner = { t: `世界首領被討伐！你的貢獻度 ${Math.round(sh * 100)}%`, c: '#ffd860', l: 4 };
  addLog(g, `【世界首領】${d.n} 被討伐了！你的貢獻度 ${Math.round(sh * 100)}%，獲得 ${gold} 金幣、${dia} 鑽石${got.length ? `、${got.join('、')}` : ''}。`, '#ffd860');
}
let AIPK = ((): boolean => { try { return localStorage.getItem('sm_aipk') !== '0'; } catch { return true; } })();
function setAipk(v: boolean): void { AIPK = v; try { localStorage.setItem('sm_aipk', v ? '1' : '0'); } catch { /* ignore */ } }
const AGS = ['看招！', '這片地圖是我的！', '把你的裝備交出來！', '嘿嘿，練練手～', '你擋到我練功了！'];
function botAggro(g: G, b: Bot, bi: number, dt: number, near: boolean): void {
  const p = g.p;
  if (b.ag || (b.dd ?? 0) > 0 || (b.vs ?? -1) >= 0 || zoneAt(b.x, b.y) === -1) return;
  const wbHere = nearWB(b);
  const pRate = wbHere ? 18000 : 900, bRate = wbHere ? 8000 : (near ? 700 : 1800);
  if (AIPK && near && PVP < 0 && p.dead <= 0 && zoneAt(p.x, p.y) !== -1 && b.pt < 0 && !g.bots.some((o: Bot) => o.ag) && Math.hypot(p.x - b.x, p.y - b.y) < 600 && Math.random() < dt / pRate) {
    b.ag = 1; b.acd = 1.2; b.agT = 45; b.tg = null;
    botSay(g, b, AGS[Math.floor(Math.random() * AGS.length)] ?? '', true);
    pkNote(g, bi, 0);
    addLog(g, `【PK】${b.n}（${CLN[b.cls] ?? ''} Lv.${b.lv}）對你發動攻擊！點畫面中央的劍可立即反擊。`, '#ff8080');
    g.banner = { t: `${b.n} 對你發動攻擊！`, c: '#ff8080', l: 2.2 };
    return;
  }
  if (Math.random() < dt / bRate) {
    const oi = g.bots.findIndex((o: Bot, i: number) => i !== bi && o.st === 2 && o.z === b.z && !o.ag && (o.dd ?? 0) <= 0 && (o.vs ?? -1) < 0 && o.pt !== bi && b.pt !== i && zoneAt(o.x, o.y) !== -1);
    const o = g.bots[oi]; if (!o) return;
    const onear = Math.abs(o.x - p.x) < 1400 && Math.abs(o.y - p.y) < 1100;
    if (near && onear) {
      b.vs = oi; o.vs = bi; b.acd = 0.5; o.acd = 0.9;
      botSay(g, b, ['你搶我的怪！', '決鬥吧！', '看你不順眼很久了！'][Math.floor(Math.random() * 3)] ?? '', true); botSay(g, o, '想打架？來啊！', false);
      addLog(g, `【PK】${b.n} 和 ${o.n} 打起來了！`, '#ffb080');
    } else {
      const pw = (x: Bot): number => (x.lv + (x.en ?? 0) * 0.3) * rnd(0.8, 1.2), win = pw(b) >= pw(o) ? b : o, lose = win === b ? o : b;
      lose.dd = 20; lose.php = 0; lose.tg = null; win.kc = (win.kc ?? 0) + 1;
      if (Math.random() < 0.5) addLog(g, `【PK】${win.n} 在${ZN[win.z + 1] ?? '野外'}擊殺了 ${lose.n}！`, '#ffb080');
    }
  }
}
function botDuel(g: G, b: Bot, bi: number, dt: number, near: boolean): boolean {
  const o = g.bots[b.vs ?? -1];
  if (!o || (o.dd ?? 0) > 0 || o.vs !== bi || b.ag || o.ag || !near || b.st !== 2 || o.st !== 2 || zoneAt(b.x, b.y) === -1 || zoneAt(o.x, o.y) === -1) { b.vs = -1; if (o && o.vs === bi) o.vs = -1; return false; }
  b.tg = null; const rng = b.cls === 0 ? 34 : 160, dd = Math.hypot(o.x - b.x, o.y - b.y); b.face = Math.atan2(o.y - b.y, o.x - b.x);
  if (dd > rng) { if (!botMove(b, o.x, o.y, (b.cls === 1 ? 135 : 118) * dt, dt)) botWarp(g, b, spotNear({ x: o.x, y: o.y }, 1), near); return true; }
  b.acd = (b.acd ?? 0) - dt;
  if ((b.acd ?? 0) <= 0) {
    b.acd = ([0.95, 0.85, 1.05][b.cls] ?? 1) * 1.2; b.swing = 0.22;
    if (b.cls !== 0) for (let k = 0; k < 6; k++) emit(g, b.x + (o.x - b.x) * (k / 6), b.y - 24 + (o.y - b.y) * (k / 6), 2, b.cls === 2 ? '#b07cff' : '#ffe0a0', 40, 0.25, 2);
    const mx = bMhp(o), dmg = Math.max(1, Math.round(bAtk(b) * rnd(0.8, 1.2) - bDef(o) * 0.6));
    o.php = (o.php ?? mx) - dmg; addText(g, o.x + rnd(-6, 6), o.y - 58, String(dmg), '#ffb0a0', 12); emit(g, o.x, o.y - 20, 5, '#ff6060', 80, 0.3, 2);
    if ((o.php ?? 0) <= 0) {
      emit(g, o.x, o.y - 20, 26, '#ff4040', 150, 0.8, 3.5); o.dd = 20; o.php = 0; o.vs = -1; b.vs = -1; o.tg = null; b.kc = (b.kc ?? 0) + 1;
      addLog(g, `【PK】${b.n} 擊殺了 ${o.n}！`, '#ffb080'); botSay(g, b, '下次別再搶我的怪！', true);
    }
  }
  return true;
}
function stepBots(g: G, dt: number): void {
  const p = g.p, ow = WID === 0;
  stepWB(g, dt);
  if (!ow) g.bp = [];
  for (const q of g.bp) {
    const m = q.m, tx = m.x, ty = m.y - md(m).r, dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy), sp = 480 * dt;
    if (m.dead > 0) { q.k = -1; continue; }
    if (d <= sp + 4) { const b = g.bots[q.b]; if (b) botHit(g, b, m, q.d); q.k = -1; continue; }
    q.x += (dx / d) * sp; q.y += (dy / d) * sp;
  }
  g.bp = g.bp.filter((q: BP) => q.k >= 0);
  g.chatT -= dt;
  if (g.chatT <= 0) { g.chatT = rnd(25, 60); const b = g.bots[Math.floor(Math.random() * g.bots.length)]; if (b) botSay(g, b, BCHAT[Math.floor(Math.random() * BCHAT.length)] ?? '', true); }
  g.bots.forEach((b: Bot, bi: number) => {
    b.sayT = Math.max(0, b.sayT - dt); b.swing = Math.max(0, b.swing - dt); b.cd -= dt; b.tm -= dt; b.mv = false;
    const near = ow && Math.abs(b.x - p.x) < 1400 && Math.abs(b.y - p.y) < 1100;
    if (WBS.m && WBS.m.dead <= 0 && nearWB(b) && b.ag && !(PVP >= 0 && g.bots[PVP] === b)) { b.ag = 0; b.tg = WBS.m; }
    if (botPvp(g, b, dt, near)) return;
    if (b.st === 3) { botExp(g, b, (needExp(b.lv) * dt) / (150 + b.lv * 16), false); b.kc = (b.kc ?? 0) + dt * 0.15; if (b.tm <= 0) { const D = DUNS[b.dn ?? 0]; b.st = 0; b.tm = rnd(30, 90); b.dn = -1; b.pt = -1; botWarp(g, b, townPt(Math.random() < 0.5 ? 0 : 1), false); if (Math.random() < 0.6) addLog(g, `【玩家】${b.n} 從${D?.n ?? '副本'}凱旋歸來（Lv.${b.lv}）。`, '#c8e0ff'); } return; }
    if ((b.vs ?? -1) >= 0 && botDuel(g, b, bi, dt, near)) return;
    if (b.st === 2 && ow) botAggro(g, b, bi, dt, near);
    const wbm = WBS.m;
    if (wbm && wbm.dead <= 0 && ow && b.lv >= 5) { if (b.st !== 2) { b.st = 2; b.tm = 120; b.pt = -1; } if (Math.hypot(wbm.x - b.x, wbm.y - b.y) > 520) botWarp(g, b, spotNear({ x: wbm.x, y: wbm.y }, 3), near); b.tg = wbm; }
    if (b.st === 2 && !near) { botExp(g, b, (needExp(b.lv) * dt) / (160 + b.lv * 18), false); b.kc = (b.kc ?? 0) + dt * 0.1; }
    if (b.tm <= 0) {
      if (b.st === 0 && b.lv >= 22 && Math.random() < 0.25) {
        const ds = DUNS.map((_D: DDef, i: number) => i).filter((i: number) => (DUNS[i]?.lv ?? 99) <= b.lv + 4), di = ds[Math.floor(Math.random() * ds.length)];
        if (di !== undefined) { b.st = 3; b.dn = di; b.tm = rnd(180, 480); b.pt = -1; b.tg = null; b.vs = -1; if (near || Math.random() < 0.5) addLog(g, `【玩家】${b.n}（${CLN[b.cls] ?? ''} Lv.${b.lv}）進入了${DUNS[di]?.n ?? ''}。`, '#c8e0ff'); return; }
      }
      if (b.st === 0) {
        if (b.lv >= 30 && Math.random() < 0.5) b.z = Math.min(ZPT.length - 1, botZone(b.lv) + 1); else b.z = botZone(b.lv);
        b.st = 2; b.tm = rnd(150, 420); b.pt = -1;
        const mate = g.bots.findIndex((o: Bot, oi: number) => oi !== bi && o.st === 2 && o.z === b.z && o.pt < 0);
        const L = mate >= 0 && Math.random() < 0.45 ? g.bots[mate] : undefined;
        if (L) { b.pt = mate; addLog(g, `【隊伍】${b.n} 加入了 ${L.n} 的隊伍，一起在${ZN[b.z + 1] ?? ''}狩獵。`, '#a0e0ff'); botWarp(g, b, spotNear({ x: L.x, y: L.y }, 2), near); }
        else botWarp(g, b, spotNear(ZPT[b.z] ?? { x: SPAWN_X, y: SPAWN_Y }, 6), near);
      } else {
        b.st = 0; b.tm = rnd(30, 90); b.pt = -1; b.hp = 1;
        botWarp(g, b, townPt(Math.random() < 0.5 ? 0 : 1), near);
        if (Math.random() < 0.3) botSay(g, b, '回村補給一下～', near);
      }
      return;
    }
    if (!near) return;
    const sp = (b.cls === 1 ? 135 : 118) * dt;
    if (b.st === 0) {
      if (Math.hypot(b.wx - b.x, b.wy - b.y) < 4) { if (Math.random() < dt * 0.4) { const t = townPt(townIdx(b.x, b.y) === 1 ? 1 : 0); b.wx = t.x; b.wy = t.y; } }
      else if (!botMove(b, b.wx, b.wy, sp * 0.6, dt)) { b.wx = b.x; b.wy = b.y; }
      return;
    }
    const L = b.pt >= 0 ? g.bots[b.pt] : undefined;
    if (L && L.st !== 2) b.pt = -1;
    let m: Mon | null = b.tg && b.tg.dead <= 0 ? b.tg : null;
    if (!m && L && L.tg && L.tg.dead <= 0) m = L.tg;
    if (!m && b.scan <= g.time) {
      b.scan = g.time + 0.8;
      let bd = 280;
      for (const o of g.mons) { if (o.dead > 0 || o === p.tgt || o.st === 1 || md(o).b || md(o).lv > b.lv + 4) continue; const dd = Math.hypot(o.x - b.x, o.y - b.y); if (dd < bd) { bd = dd; m = o; } }
    }
    b.tg = m;
    if (m) {
      const d = md(m), rng = (b.cls === 0 ? 24 : 160) + d.r, dd = Math.hypot(m.x - b.x, m.y - b.y);
      b.face = Math.atan2(m.y - b.y, m.x - b.x);
      if (dd > rng) { if (!botMove(b, m.x, m.y, sp, dt)) { b.tg = null; b.scan = g.time + 1.5; } }
      else if (b.cd <= 0) {
        b.cd = [0.95, 0.85, 1.05][b.cls] ?? 0.95; b.swing = 0.22;
        const dmg = Math.max(1, Math.round((8 + b.lv * 2.6 + b.wt * 4) * rnd(0.8, 1.2) - d.def * 0.6));
        if (b.cls === 0) botHit(g, b, m, dmg);
        else { const dir = Math.cos(b.face) < -0.01 ? -1 : 1; g.bp.push({ x: b.x + dir * (b.cls === 1 ? 13 : 20), y: b.y - (b.cls === 1 ? 20 : 55), m, d: dmg, k: b.cls === 1 ? 0 : 1, b: bi }); }
        if (m.st === 0) {
          m.face = b.x < m.x ? -1 : 1; m.wx = m.x; m.wy = m.y;
          if (dd < d.r + 34 && Math.random() < 0.5) { m.atkT = 0.28; b.hp -= 0.05 + Math.random() * 0.05; if (b.hp < 0.35) { b.hp = 1; emit(g, b.x, b.y - 15, 10, '#ff5050', 60, 0.5, 3); } }
        }
      }
    } else if (L && Math.hypot(L.x - b.x, L.y - b.y) > 110) botMove(b, L.x - 28, L.y + 10, sp, dt);
    else if (Math.hypot(b.wx - b.x, b.wy - b.y) < 6) { const q = spotNear({ x: b.x, y: b.y }, 6); b.wx = q.x; b.wy = q.y; }
    else if (!botMove(b, b.wx, b.wy, sp * 0.7, dt)) { b.wx = b.x; b.wy = b.y; }
  });
}
function drawBot(ctx: CanvasRenderingContext2D, g: G, i: number, font: string): void {
  const b = g.bots[i];
  if (!b || (b.dd ?? 0) > 0 || b.st === 3) return;
  if (b.ag || (b.vs ?? -1) >= 0 || (b.php !== undefined && b.php < bMhp(b))) { const fr = clamp((b.php ?? 1) / bMhp(b), 0, 1); box(ctx, b.x - 22, b.y - 88, 44, 6, 2, 'rgba(0,0,0,0.7)', 'rgba(255,255,255,0.3)'); ctx.fillStyle = b.ag ? '#ff4a3a' : '#e0a040'; ctx.fillRect(b.x - 21, b.y - 87, 42 * fr, 4); }
  drawHero(ctx, { cls: b.cls, wt: b.wt, at: b.at, en: b.lv >= 30 ? 7 : 0, ck: b.ck, sh: b.cls === 0 ? b.ck : undefined }, b.x, b.y, b.face, b.walk, b.mv, b.swing, 0, g.time, false);
  label(ctx, `${b.n} Lv.${b.lv}`, b.x, b.y - 72, b.ag || (b.vs ?? -1) >= 0 ? '#ff7060' : b.pt >= 0 ? '#a0e0ff' : '#c8d8ff', 10, font, 'center');
  if (b.sayT > 0) bubble(ctx, b.say, b.x, b.y - 90, font);
}

/* ---------- auto hunt & auto potion ---------- */
function bestZone(g: G): number {
  if (g.set.zone >= 0) return g.set.zone;
  const z = zoneAt(g.p.x, g.p.y);
  if (z >= 0) return z;
  const lv = g.p.lv;
  return ZLV.slice(0, 8).reduce((b: number, l: number, i: number) => (lv >= l + 2 && l >= (ZLV[b] ?? 0) ? i : b), 0);
}
function toggleAuto(g: G): void {
  g.auto = !g.auto; g.retreat = false; g.stocked = false; g.autoPause = 0;
  if (g.auto) { g.huntZ = bestZone(g); addLog(g, `開始自動掛機：${ZN[g.huntZ + 1] ?? ""}`, "#80ffa0"); }
  else { g.p.tgt = null; g.p.dest = null; g.p.path = []; addLog(g, "已停止自動掛機。", "#c0c8d0"); }
}
function restock(g: G): void {
  const p = g.p;
  let spent = 0;
  const want = (cur: number, max: number, price: number, add: () => void): void => { let c = cur; while (c < max && p.gold >= price) { p.gold -= price; spent += price; c++; add(); } };
  want(p.pots, 30, 25, () => { p.pots++; });
  if (g.set.haste) want(p.green, 3, 120, () => { p.green++; });
  if (p.cls === 2 || g.set.mp > 0) want(p.blue, 15, 60, () => { p.blue++; });
  want(p.scrolls, 2, 60, () => { p.scrolls++; });
  want(p.cpn ?? 0, 3, 200, () => { p.cpn = (p.cpn ?? 0) + 1; });
  if (spent > 0) addLog(g, `自動補給完成，花費 ${spent} 金幣。`, "#ffd860");
}
function autoPotions(g: G): void {
  const p = g.p, s = stats(p), st = g.set;
  if (p.dead > 0) return;
  if (st.hp > 0 && (p.hp / s.mhp) * 100 < st.hp && p.pots > 0 && p.potCd <= 0) drinkPot(g, true);
  if (st.mp > 0 && (p.mp / s.mmp) * 100 < st.mp && p.blue > 0 && p.mpCd <= 0) drinkBlue(g, true);
  if ((p.cpn ?? 0) > 0 && (p.bf['cp'] ?? 0) <= 0 && zoneAt(p.x, p.y) !== -1 && (g.auto || p.tgt || p.combatT < 3)) drinkCp(g, true);
  if (st.haste && p.hasteT <= 0 && p.green > 0 && zoneAt(p.x, p.y) !== -1 && (g.auto || p.tgt || p.combatT < 3)) drinkGreen(g, true);
}
function huntOk(g: G, m: Mon): boolean {
  if (m.dead > 0 || m.st === 2 || m.ban > g.time || zoneAt(m.hx, m.hy) !== g.huntZ) return false;
  return !(md(m).b && g.p.lv < md(m).lv - 4);
}
function distField(p: Pl, maxN: number): Map<number, number> {
  const out = new Map<number, number>(), s = Math.floor(p.y / TS) * MW + Math.floor(p.x / TS), q: number[] = [s];
  out.set(s, 0);
  for (let h = 0; h < q.length && q.length < maxN; h++) {
    const c = q[h] ?? 0, cx = c % MW, cy = (c - cx) / MW, dc = out.get(c) ?? 0;
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx, ny = cy + dy;
      if (blk(nx, ny) || (dx !== 0 && dy !== 0 && (blk(cx + dx, cy) || blk(cx, cy + dy)))) continue;
      const n = ny * MW + nx;
      if (out.has(n)) continue;
      out.set(n, dc + (dx !== 0 && dy !== 0 ? 1.4 : 1)); q.push(n);
    }
  }
  return out;
}
let QPRI = ((): boolean => { try { return localStorage.getItem('sm_qpri') === '1'; } catch { return false; } })();
function setQpri(v: boolean): void { QPRI = v; try { localStorage.setItem('sm_qpri', v ? '1' : '0'); } catch { /* ignore */ } }
function wantMons(g: G): number[] {
  const p = g.p, out: number[] = [];
  QD.forEach((q: QDef, i: number) => { const v = p.q[i] ?? 0; if (v > 0 && v - 1 < q.c) out.push(q.m); });
  const s = mqs(p), mq = MQS[s[0] ?? 0]; if (mq && s[2] === 1 && (s[1] ?? 0) < mq.c) out.push(mq.m);
  bts(p).b.forEach((r: number[]) => { if ((r[3] ?? 0) === 0 && (r[2] ?? 0) < (r[1] ?? 0)) out.push(r[0] ?? -1); });
  return out;
}
function pickTarget(g: G): Mon | null {
  const df = distField(g.p, 7000), want = QPRI ? wantMons(g) : [];
  let best: Mon | null = null, bd = 1e9;
  for (const m of g.mons) {
    if (!huntOk(g, m)) continue;
    const t = df.get(Math.floor(m.y / TS) * MW + Math.floor(m.x / TS));
    if (t === undefined) continue;
    const sc = t - (m.st === 1 ? 4 : 0) - (want.length && want.indexOf(m.d) >= 0 ? 60 : 0);
    if (sc < bd) { bd = sc; best = m; }
  }
  return best;
}
function zoneSpot(z: number): Pt | null {
  for (let i = 0; i < 300; i++) {
    const tx = 1 + Math.floor(Math.random() * (MW - 2)), ty = 1 + Math.floor(Math.random() * (MH - 2));
    if (zoneOf(tx, ty) === z && REACH[ty * MW + tx] === 1 && !blk(tx, ty)) return { x: (tx + 0.5) * TS, y: (ty + 0.5) * TS };
  }
  return null;
}
let RPN = 0;
function snap(p: Pl): boolean {
  const cx = (Math.floor(p.x / TS) + 0.5) * TS, cy = (Math.floor(p.y / TS) + 0.5) * TS;
  if (Math.hypot(cx - p.x, cy - p.y) < 2 || !free(cx, cy, PR, false)) return false;
  p.x = cx; p.y = cy; return true;
}
function unstick(g: G, dt: number): void {
  const p = g.p, mv = Math.hypot(p.x - p.lastX, p.y - p.lastY);
  p.lastX = p.x; p.lastY = p.y;
  if (!p.dest && p.path.length === 0) { p.idleT = 0; return; }
  p.idleT = mv < 0.6 ? p.idleT + dt : 0;
  if (p.idleT > 1) { p.idleT = 0; const d0 = p.dest; if (!snap(p)) { if (d0 && RPN < 3) { RPN++; goTo(g, d0.x, d0.y); } else { RPN = 0; p.dest = null; p.path = []; } } }
  else if (mv > 0.6) RPN = 0;
}
function autoHunt(g: G, dt: number): void {
  const p = g.p, s = stats(p), c = cl(p.cls);
  if (!g.auto || p.dead > 0) return;
  if (g.autoPause > 0) { g.autoPause -= dt; return; }
  const town = zoneAt(p.x, p.y) === -1, hpPct = p.hp / s.mhp;
  let near = 0;
  for (const m of g.mons) if (m.dead <= 0 && m.st === 1 && Math.hypot(m.x - p.x, m.y - p.y) < md(m).r + 80) near++;
  if (!g.retreat && !town && ((hpPct < 0.3 && p.pots === 0) || (hpPct < 0.25 && near >= 3) || hpPct < 0.15)) {
    g.retreat = true; p.tgt = null;
    if (p.scrolls > 0) { addLog(g, '情況危險，自動使用回城卷軸！', '#ffb070'); recall(g); }
    else if (WID !== 0) { addLog(g, '情況危險，往地城出口撤退。', '#ffb070'); const up = DINFO[WID]?.up; if (up) goTo(g, up.x, up.y); }
    else { addLog(g, '情況危險，自動撤退回村莊。', '#ffb070'); goTo(g, SPAWN_X, SPAWN_Y); }
  }
  if (g.retreat) {
    if (zoneAt(p.x, p.y) === -1) g.retreat = false;
    else { p.tgt = null; if (!p.dest && p.path.length === 0) { const up = WID !== 0 ? DINFO[WID]?.up : null; if (up) goTo(g, up.x, up.y); else goTo(g, SPAWN_X, SPAWN_Y); } unstick(g, dt); return; }
  }
  if (zoneAt(p.x, p.y) === -1) {
    if (g.set.restock && !g.stocked) { restock(g); g.stocked = true; }
    if (hpPct < 0.8) { p.tgt = null; p.path = []; p.dest = null; return; }
    if (g.huntZ >= 8) { const a = DARR[g.huntZ - 8], c2 = 200 + (ZLV[g.huntZ] ?? 1) * 20; if (a && p.gold >= c2 + 200) { p.gold -= c2; tpTo(g, a.x, a.y); addLog(g, `自動傳送到${DUNS[g.huntZ - 8]?.n ?? ''}入口（${c2} 金幣）`, '#a0d0ff'); return; } }
    const zp = ZPT[g.huntZ];
    if (zp && Math.hypot(zp.x - p.x, zp.y - p.y) > 50 * TS && p.gold >= teleCost(g.huntZ) + 200) { p.gold -= teleCost(g.huntZ); tpTo(g, zp.x, zp.y); addLog(g, `自動傳送到 ${ZN[g.huntZ + 1] ?? ''}（${teleCost(g.huntZ)} 金幣）`, '#a0d0ff'); return; }
  } else g.stocked = false;
  if (WID === 0 && g.huntZ >= 8) { const e = DENT[g.huntZ - 8]; if (e && !p.dest && p.path.length === 0) goTo(g, e.x, e.y); unstick(g, dt); return; }
  if (p.cls === 2 && hpPct < 0.55 && p.mp >= c.skMp && p.skCd <= 0) { castSkill(g); return; }
  const lh = p.lastHit;
  if (lh && lh.dead <= 0 && lh !== p.tgt && g.time - p.hitT < 1.2) {
    const cur = p.tgt;
    if (!cur || cur.dead > 0 || Math.hypot(cur.x - p.x, cur.y - p.y) > prng(p) + md(cur).r + 12) { p.tgt = lh; p.repath = 0; p.fails = 0; p.progT = 0; p.progD = 1e9; p.loot = null; }
  }
  if (near === 0 && (!p.tgt || p.combatT > 1.5)) {
    let best: Drop | null = null, bd = 230;
    for (const dr of g.drops) {
      const d = Math.hypot(dr.x - p.x, dr.y - p.y);
      if (d < bd && dr.bn <= g.time && !(dr.it && p.inv.length >= invCap(p))) { bd = d; best = dr; }
    }
    if (best) {
      if (best !== p.loot) { p.loot = best; p.lootT = 0; p.tgt = null; goTo(g, best.x, best.y); }
      else if (!p.dest && p.path.length === 0) goTo(g, best.x, best.y);
      p.lootT += dt;
      if (p.lootT > 5) { best.bn = g.time + 60; p.dest = null; p.path = []; p.loot = null; }
      unstick(g, dt);
      return;
    }
  }
  p.loot = null;
  if (p.tgt && p.tgt.dead > 0) p.tgt = null;
  if (!p.tgt && p.scanT <= g.time) {
    p.scanT = g.time + 0.5;
    const t = pickTarget(g);
    if (t) { p.tgt = t; p.repath = 0; p.fails = 0; p.progT = 0; p.progD = 1e9; p.dest = null; p.path = []; }
    else if (!p.dest && p.path.length === 0) { const sp = zoneSpot(g.huntZ); if (sp) goTo(g, sp.x, sp.y); }
  }
  const m = p.tgt;
  if (m) {
    const dist = Math.hypot(m.x - p.x, m.y - p.y), reach = prng(p) + md(m).r + 4;
    if (dist > reach) {
      p.progT += dt;
      if (dist < p.progD - 8) { p.progD = dist; p.progT = 0; }
      if (p.progT > 1.5) {
        p.progT = 0; p.progD = dist; p.fails++; p.repath = 0; snap(p);
        if (p.fails >= 3) { m.ban = g.time + 15; p.tgt = null; p.fails = 0; addLog(g, `無法接近 ${md(m).n}，改找其他目標。`, '#c0c8d0'); }
      }
    } else { p.progT = 0; p.progD = dist; p.fails = 0; }
    autoSkill(g, dist < reach + 6);
  } else unstick(g, dt);
}

function update(g: G, inp: Inp, dt: number): void {
  g.time += dt;
  const p = g.p, c = cl(p.cls), s = stats(p);
  p.cd -= dt; p.potCd -= dt; p.mpCd -= dt; p.skCd -= dt; p.repath -= dt; p.combatT += dt;
  p.hurt = Math.max(0, p.hurt - dt); p.swing = Math.max(0, p.swing - dt);
  if (p.hasteT > 0) { p.hasteT = Math.max(0, p.hasteT - dt); if (p.hasteT === 0) addLog(g, "加速效果結束了。", "#a0c0a0"); }
  if (p.xb && (p.xb[1] ?? 0) > 0) { p.xb[1] = Math.max(0, (p.xb[1] ?? 0) - dt); if (p.xb[1] === 0) addLog(g, "經驗卷軸的效果結束了。", "#a0c0a0"); }
  p.moving = false;
  if (p.dead > 0) {
    p.dead -= dt;
    if (p.dead <= 0) { goWorld(g, 0, SPAWN_X, SPAWN_Y, false); p.hp = s.mhp; p.mp = s.mmp; g.retreat = false; addLog(g, `你在${TOWNS[g.p.home]?.n ?? '城鎮'}復活了。`, '#8fe08f'); }
  } else {
    autoPotions(g);
    const k = inp.keys;
    let ix = 0, iy = 0;
    if (k["KeyA"] || k["ArrowLeft"]) ix -= 1;
    if (k["KeyD"] || k["ArrowRight"]) ix += 1;
    if (k["KeyW"] || k["ArrowUp"]) iy -= 1;
    if (k["KeyS"] || k["ArrowDown"]) iy += 1;
    if (ix || iy) {
      p.tgt = null; p.path = []; p.dest = null;
      if (g.auto) g.autoPause = 2.5;
      const m = Math.hypot(ix, iy), sp = speed(p) * dt;
      moveBy(p, (ix / m) * sp, (iy / m) * sp, PR, false);
      p.face = Math.atan2(iy, ix); p.walk += dt; p.moving = true;
    } else {
      if (PVP < 0) autoHunt(g, dt); else p.tgt = null;
      if (inp.down && !p.tgt && PVP < 0) { inp.rt -= dt; if (inp.rt <= 0) { inp.rt = 0.25; goTo(g, g.camX + inp.sx / g.zoom, g.camY + inp.sy / g.zoom); } }
      const m = p.tgt;
      if (m) {
        if (m.dead > 0) p.tgt = null;
        else {
          const dist = Math.hypot(m.x - p.x, m.y - p.y);
          if (dist > prng(p) + md(m).r + 4) {
            if (p.repath <= 0) {
              p.repath = 0.4;
              if (los(p.x, p.y, m.x, m.y)) p.path = [];
              else { const fp = findPath(p.x, p.y, m.x, m.y); if (fp) p.path = fp; else { p.path = []; if (g.auto) { m.ban = g.time + 20; p.tgt = null; } } }
            }
            p.dest = { x: m.x, y: m.y }; follow(g, dt);
          } else {
            p.path = []; p.dest = null; p.face = Math.atan2(m.y - p.y, m.x - p.x);
            if (p.cd <= 0) attack(g, m);
          }
        }
      } else if (PVP >= 0) pvpStep(g, dt); else follow(g, dt);
    }
    const zz = zoneAt(p.x, p.y), town = zz === -1;
    if (zz !== g.zone) {
      g.zone = zz;
      if (town) { const tw = townIdx(p.x, p.y), t0 = TOWNS[tw]; if (t0) { SPAWN_X = (t0.x + 18) * TS; SPAWN_Y = (t0.y + 15.5) * TS; p.home = tw; } }
      if (!g.banner || g.banner.l < 0.5) g.banner = { t: town ? `${townName(p.x, p.y)} · 安全區域` : WID !== 0 ? `${dunName()}（建議 Lv.${ZLV[zz] ?? 1}+）` : `進入 ${ZN[zz + 1] ?? ''}（建議 Lv.${ZLV[zz] ?? 1}+）`, c: ZC[zz + 1] ?? '#ffffff', l: 2 };
    }
    const stt = MAP[Math.floor(p.y / TS) * MW + Math.floor(p.x / TS)] ?? 0;
    if (stt === 24 || stt === 25) { if (g.stairT <= 0 && !(g.auto && WID !== 0 && !(g.retreat && stt === 25))) { g.stairT = 1; useStairs(g, stt === 24); } } else g.stairT = 0;
    if (p.combatT > 5 || town) p.hp = Math.min(s.mhp, p.hp + s.mhp * (town ? 0.08 : 0.015) * s.hpR * dt);
    p.mp = Math.min(s.mmp, p.mp + (c.mpReg + p.lv * 0.06) * s.mpR * (town ? 3 : 1) * dt);
  }
  const pSafe = p.dead > 0 || zoneAt(p.x, p.y) === -1;
  for (const m of g.mons) {
    const d = md(m);
    if (m.dead > 0) {
      m.dieT = Math.max(0, m.dieT - dt);
      m.dead -= dt;
      if (m.dead <= 0) { m.x = m.hx; m.y = m.hy; m.hp = m.mhp; m.st = 0; m.dieT = 0; m.th = undefined; m.lk = ''; ring(g, m.x, m.y - d.r, "#ffffff", 60, 0.4); }
      continue;
    }
    if (m.st === 0 && Math.abs(m.x - p.x) + Math.abs(m.y - p.y) > 1800) continue;
    if (m.slow > 0) m.slow -= dt;
    if (m.stun > 0) { m.stun -= dt; m.hit = Math.max(0, m.hit - dt); continue; }
    m.hit = Math.max(0, m.hit - dt); m.atkT = Math.max(0, m.atkT - dt); m.cd -= dt; m.anim += dt;
    const dx = p.x - m.x, dy = p.y - m.y, dist = Math.hypot(dx, dy) || 1;
    const sl = m.slow > 0 ? 0.5 : 1;
    const step = (ux: number, uy: number, v: number): void => { moveBy(m, ux * v * sl, uy * v * sl, d.r * 0.8, true); if (Math.abs(ux) > 0.1) m.face = ux < 0 ? -1 : 1; };
    if (m.st === 0) {
      if (d.b) { const aim0 = monAim(g, m); if (aim0 && Math.hypot(aim0.x - m.x, aim0.y - m.y) < 220) m.st = 1; }
      else if (d.ag && !pSafe && dist < 150) m.st = 1;
      m.wt -= dt;
      if (m.wt <= 0) { m.wt = rnd(2, 5); m.wx = m.hx + rnd(-70, 70); m.wy = m.hy + rnd(-70, 70); }
      const wx = m.wx - m.x, wy = m.wy - m.y, wd = Math.hypot(wx, wy);
      if (wd > 4) step(wx / wd, wy / wd, d.sp * 0.35 * dt); else m.anim -= dt * 0.7;
    } else if (m.st === 1) {
      const aim = monAim(g, m), adx = aim ? aim.x - m.x : 0, ady = aim ? aim.y - m.y : 0, adist = Math.hypot(adx, ady) || 1;
      const reach = d.r + (aim && aim.k === 'p' ? PR : 8) + 8;
      if (!aim || Math.hypot(m.x - m.hx, m.y - m.hy) > (m.wb ? 1400 : d.b ? 800 : 480)) m.st = 2;
      else if (adist > reach) step(adx / adist, ady / adist, d.sp * dt);
      else { m.face = adx < 0 ? -1 : 1; if (m.cd <= 0) { m.cd = d.b ? 1.5 : 1.8; monStrike(g, m, aim, 1); } }
      if (d.b && m.st === 1) {
        m.wt -= dt;
        if (m.wt <= 0) {
          m.wt = 5; ring(g, m.x, m.y, "#ff5030", 300, 0.6); ring(g, m.x, m.y, "#ffb040", 200, 0.5); emit(g, m.x, m.y - 10, 40, "#ff6030", 260, 0.7, 4); g.shake = 0.3;
          addLog(g, `${d.n}釋放了震擊！`, '#ff8060');
          if (aim && adist < 170) monStrike(g, m, aim, 1.3);
        }
      }
    } else {
      const hx = m.hx - m.x, hy = m.hy - m.y, hd = Math.hypot(hx, hy);
      m.hp = Math.min(m.mhp, m.hp + m.mhp * 0.3 * dt);
      if (hd < 10) { m.st = 0; if (d.b) { m.th = undefined; m.lk = ''; } } else step(hx / hd, hy / hd, d.sp * 1.4 * dt);
    }
  }
  for (const pr of g.proj) {
    const m = pr.t;
    pr.life -= dt;
    if (m.dead > 0) { pr.life = 0; continue; }
    if ((pr.dl ?? 0) > 0) { pr.dl = (pr.dl ?? 0) - dt; pr.life += dt; continue; }
    const tx = m.x, ty = m.y - md(m).r * 0.9, dx = tx - pr.x, dy = ty - pr.y, d = Math.hypot(dx, dy), sp = pr.sp * dt;
    if (d <= sp + 4) { pr.life = 0; if (pr.sk !== undefined && pr.sk >= 0) skHit(g, pr.sk, m); else hitMon(g, m, pr.mult); if (pr.k === 1) ring(g, tx, ty, "#c9a0ff", 90, 0.25); continue; }
    pr.a = Math.atan2(dy, dx); pr.x += (dx / d) * sp; pr.y += (dy / d) * sp;
    if (pr.k >= 1 && Math.random() < 0.85) emit(g, pr.x, pr.y, pr.k === 2 ? 2 : 1, Math.random() < 0.5 ? PJC[pr.k] ?? '#c9a0ff' : '#ffffff', 20, 0.3, 3);
  }
  g.proj = g.proj.filter((q: Proj) => q.life > 0);
  for (const dr of g.drops) dr.t += dt;
  if (p.dead <= 0) for (const dr of g.drops) if (dr.t > 0.4 && Math.hypot(dr.x - p.x, dr.y - p.y) < 28 && pickUp(g, dr)) dr.t = -1;
  g.drops = g.drops.filter((dr: Drop) => dr.t >= 0 && dr.t < 180);
  const wn = g.wantNpc;
  if (wn && p.dead <= 0 && Math.hypot(p.x - wn.x, p.y - wn.y) < 62) { g.wantNpc = null; g.npc = wn; g.req = 'npc'; }
  if (p.blessT > 0) p.blessT = Math.max(0, p.blessT - dt);
  if ((p.polyT ?? 0) > 0) { p.polyT = Math.max(0, (p.polyT ?? 0) - dt); if ((p.polyT ?? 0) <= 0) { addLog(g, '變身效果結束了。', '#d8b0ff'); emit(g, p.x, p.y - 20, 20, '#d8b0ff', 120, 0.6, 3); } }
  stepFolk(g, dt);
  stepBots(g, dt);
  stepPet(g, dt);
  stepBPet(g, dt);
  autoCast(g, dt);
  for (const bk of Object.keys(p.bf)) p.bf[bk] = Math.max(0, (p.bf[bk] ?? 0) - dt);
  for (const ts of SK) if (ts.k === 11 && ts.c === p.cls && (p.bf[ts.b] ?? 0) > 0) { if (p.dead > 0) { p.bf[ts.b] = 0; continue; } p.mp -= ts.v * dt; if (p.mp <= 0) { p.mp = 0; p.bf[ts.b] = 0; addLog(g, `魔力耗盡，${ts.n} 已關閉。`, '#90b0ff'); } }
  if (p.hasteT > 0 && p.moving && Math.random() < 0.4) emit(g, p.x + rnd(-6, 6), p.y - 2, 1, "#80ffa0", 15, 0.35, 2.5);
  stepFx(g, dt);
}
function stepFx(g: G, dt: number): void {
  for (const q of g.parts) { q.l -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 160 * dt; q.vx *= 0.97; }
  g.parts = g.parts.filter((q: Part) => q.l > 0);
  for (const r of g.rings) { r.l -= dt; r.r += r.v * dt; }
  g.rings = g.rings.filter((r: Ring) => r.l > 0);
  for (const t of g.texts) { t.l -= dt; t.y -= 32 * dt; }
  g.texts = g.texts.filter((t: FT) => t.l > 0);
  for (const l of g.log) l.age += dt;
  if (g.mark) { g.mark.l -= dt; if (g.mark.l <= 0) g.mark = null; }
  if (g.flash) { g.flash.l -= dt; if (g.flash.l <= 0) g.flash = null; }
  if (g.banner) { g.banner.l -= dt; if (g.banner.l <= 0) g.banner = null; }
  for (const b of g.bolts) b.l -= dt;
  g.bolts = g.bolts.filter((b: Bolt) => b.l > 0);
  for (const f of g.fx) f.l -= dt;
  g.fx = g.fx.filter((f: Fx) => f.l > 0);
  g.shake = Math.max(0, g.shake - dt);
}

/* ---------- loot, shop, enchant ---------- */
function lootBand(lv: number): number[] { return lv < 14 ? [0, 1] : lv < 30 ? [2, 3] : [4, 5]; }
function rollItem(lv: number, slots: number[], boss: boolean, cls: number, wb?: boolean, uniq?: boolean): number {
  const ids = IT.map((_d: IDef, i: number) => i);
  let slot = slots[Math.floor(Math.random() * slots.length)] ?? 2;
  if (Math.random() < 0.1) slot = 7;
  const pickC = (pool: number[], pr: number): number => { const mine = pool.filter((i: number) => clsOk(IT[i] as IDef, cls)), pk = mine.length && Math.random() < pr ? mine : pool; return pk[Math.floor(Math.random() * pk.length)] ?? 0; };
  if (uniq) {
    const bt = clamp(Math.floor(lv / 9) + 1 + (wb ? 1 : 0), 3, 6);
    let bp = ids.filter((i: number) => { const d = IT[i] as IDef; return d.r === 1 && d.s === slot && Math.abs(d.t - bt) <= 1; });
    if (!bp.length) bp = ids.filter((i: number) => { const d = IT[i] as IDef; return d.r === 1 && Math.abs(d.t - bt) <= 1; });
    if (!bp.length) bp = ids.filter((i: number) => (IT[i] as IDef).r === 1);
    return pickC(bp, 0.75);
  }
  const band = lootBand(boss ? lv + 4 : lv), t0 = band[0] ?? 0, t1 = band[1] ?? 1;
  let pool = ids.filter((i: number) => { const d = IT[i] as IDef; return d.r === 0 && d.s === slot && d.t >= t0 && d.t <= t1; });
  if (!pool.length) pool = ids.filter((i: number) => { const d = IT[i] as IDef; return d.r === 0 && d.t >= t0 && d.t <= t1; });
  if (!pool.length) pool = ids.filter((i: number) => { const d = IT[i] as IDef; return d.r === 0 && d.t <= t1; });
  return pickC(pool, boss ? 0.75 : 0.65);
}
function normQ(_lv: number): number { const r = Math.random(); return r < 0.55 ? 0 : r < 0.8 ? 1 : r < 0.92 ? 2 : r < 0.975 ? 3 : r < 0.995 ? 4 : 5; }
function bossQ(): number { const r = Math.random(); return r < 0.1 ? 5 : r < 0.3 ? 4 : r < 0.6 ? 3 : 2; }
const XSP = [15, 20, 25], XSM = [5, 10, 20], XSC = [30, 55, 100, 45, 80, 150, 60, 110, 200];
function xsName(i: number): string { return `經驗卷軸 +${XSP[Math.floor(i / 3)] ?? 15}%（${XSM[i % 3] ?? 5} 分鐘）`; }
function xsArr(p: Pl): number[] { if (!p.xs || p.xs.length < 9) p.xs = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i: number) => p.xs?.[i] ?? 0); return p.xs; }
function xbMul(p: Pl): number { const b = p.xb; return b && (b[1] ?? 0) > 0 ? 1 + (b[0] ?? 0) / 100 : 1; }
function useXs(g: G, i: number): string {
  const p = g.p, a = xsArr(p);
  if ((a[i] ?? 0) <= 0) return '沒有這種經驗卷軸。';
  const pct = XSP[Math.floor(i / 3)] ?? 15, sec = (XSM[i % 3] ?? 5) * 60, b = p.xb ?? [0, 0];
  if ((b[1] ?? 0) > 0 && (b[0] ?? 0) > pct) return `目前的經驗加成（+${b[0] ?? 0}%）比較高，等它結束再使用吧。`;
  a[i] = (a[i] ?? 0) - 1; p.xb = [pct, ((b[0] ?? 0) === pct ? (b[1] ?? 0) : 0) + sec];
  sfx('buff'); ring(g, p.x, p.y - 12, '#ffe08a', 140, 0.6); emit(g, p.x, p.y - 15, 26, '#ffe08a', 110, 0.8, 3);
  const t = `使用${xsName(i)}：獲得經驗 +${pct}%（剩餘 ${fmtT(p.xb[1] ?? 0)}）。`; addLog(g, t, '#ffe08a'); return t;
}
function giveXs(g: G, src: string): void { const r1 = Math.random(), r2 = Math.random(), i = (r1 < 0.5 ? 0 : r1 < 0.85 ? 1 : 2) * 3 + (r2 < 0.5 ? 0 : r2 < 0.85 ? 1 : 2), a = xsArr(g.p); a[i] = (a[i] ?? 0) + 1; addLog(g, `${src} 掉落了 ${xsName(i)}！`, '#ffe08a'); }
const CPN = ['勇敢藥水', '精靈餅乾', '慎重藥水'], CPD = ['攻擊速度 +25%，持續 5 分鐘（騎士專用）', '攻擊速度 +18%、魔力回復 +50%，持續 5 分鐘（妖精專用）', '魔法傷害 +15%、魔力回復 +100%，持續 5 分鐘（法師專用）'];
function drinkCp(g: G, quiet: boolean): void {
  const p = g.p; if (p.dead > 0) return;
  if ((p.cpn ?? 0) <= 0) { if (!quiet) addLog(g, `沒有${CPN[p.cls] ?? ''}了（雜貨店有賣）。`, '#ff9090'); return; }
  p.cpn = (p.cpn ?? 0) - 1; p.bf['cp'] = 300; sfx('buff');
  addText(g, p.x, p.y - 50, `${CPN[p.cls] ?? ''}！`, '#ffd080', 15); ring(g, p.x, p.y, '#ffd080', 120, 0.5); emit(g, p.x, p.y - 15, 20, '#ffd080', 110, 0.6, 3);
  if (!quiet) addLog(g, `使用${CPN[p.cls] ?? ''}：${CPD[p.cls] ?? ''}`, '#ffd080');
}
function bossExtra(g: G, wb: boolean): void {
  const p = g.p, rs = wb ? 2 + Math.floor(Math.random() * 3) : 1 + (Math.random() < 0.4 ? 1 : 0), dia = 0, bl = wb ? 2 : Math.random() < 0.6 ? 1 : 0;
  p.rs = (p.rs ?? 0) + rs; p.dia = (p.dia ?? 0) + dia;
  for (let i = 0; i < bl; i++) { if (Math.random() < 0.5) p.bw++; else p.ba++; }
  addLog(g, `首領獎勵：洗鍊石 ×${rs}${dia ? `、鑽石 ×${dia}` : ''}${bl ? `、祝福強化卷軸 ×${bl}` : ''}`, '#ffd860');
}
function dropLoot(g: G, m: Mon): void {
  const d = md(m), boss = d.b === 1 || !!m.el;
  const put = (k: number, it: Item | null, sk?: number): void => {
    const dr: Drop = { x: m.x, y: m.y, k, it, t: 0, bn: 0 };
    if (sk !== undefined) dr.s = sk;
    if (pickUp(g, dr)) return;
    let x = m.x + rnd(-22, 22), y = m.y + rnd(-14, 14);
    if (!free(x, y, 8, false)) { x = m.x; y = m.y; }
    dr.x = x; dr.y = y; g.drops.push(dr);
    addLog(g, `背包已滿，${dropName(dr)} 掉在地上了（清出空位後走過去撿）。`, '#ff9090');
  };
  if (boss || Math.random() < 0.32) put(0, null);
  if (Math.random() < 0.08) put(0, null);
  if (boss || Math.random() < 0.14) put(5, null);
  if (boss || Math.random() < 0.07) put(6, null);
  if (Math.random() < (d.b === 1 ? 0.6 : m.el ? 0.3 : 0.015)) { const n = d.b === 1 ? 2 : 1; g.p.cpn = (g.p.cpn ?? 0) + n; addLog(g, `獲得 ${CPN[g.p.cls] ?? ''} ×${n}`, '#ffd080'); }
  if (Math.random() < 0.05) put(1, null);
  if (boss || Math.random() < 0.02 + d.lv * 0.001) put(2, null);
  if (boss || Math.random() < 0.03 + d.lv * 0.001) put(3, null);
  if (boss || Math.random() < 0.004 + d.lv * 0.0002) put(Math.random() < 0.5 ? 7 : 8, null);
  if (Math.random() < (boss ? 0.5 : 0.006 + d.lv * 0.0003)) {
    const cs = SK.map((_s: SDef, i: number) => i).filter((i: number) => { const s = SK[i] as SDef; return s.c === g.p.cls && s.p > 0 && s.lv <= g.p.lv + 3 && g.p.sk.indexOf(i) < 0; });
    const sid = cs[Math.floor(Math.random() * cs.length)];
    if (sid !== undefined) { addLog(g, `掉落了技能書：${SK[sid]?.n ?? ''}！`, '#c8a8ff'); put(9, null, sid); }
  }
  const slots = (d.ds || '2').split(',').map((v: string) => Number(v));
  const arena = d.b === 1 && arenaOf(WID) >= 0, big = d.b === 1 && (arena || !!m.wb || d.z >= 8);
  if (boss) bossExtra(g, arena);
  {
    let dia = 0;
    if (m.wb) dia = 0; else if (d.b === 1) dia = big ? 200 + Math.floor(Math.random() * 301) : 50 + Math.floor(Math.random() * 51); else if (m.el) dia = 20 + Math.floor(Math.random() * 21); else if (Math.random() < 0.05) dia = 1 + Math.floor(Math.random() * 3);
    if (dia > 0) { g.p.dia = (g.p.dia ?? 0) + dia; addText(g, m.x, m.y - d.r * 2 - 30, `+${dia} 鑽石`, '#a8ecff', 14); addLog(g, `獲得鑽石 ×${dia}${d.b === 1 ? `（${big ? '大型首領' : '野外首領'}獎勵）` : m.el ? '（精英獎勵）' : ''}`, '#a0e8ff'); }
  }
  if (d.b === 1 && !m.wb && Math.random() < 0.6) giveXs(g, d.n);
  const gear: Item[] = [];
  const mkG = (q: number, uq: boolean): void => { const it = mkItem(rollItem(d.lv, slots, boss, g.p.cls, !!m.wb, uq)); if (!uq && Math.random() < 0.08) it.en = 1 + Math.floor(Math.random() * 2); rollQ(it, boss, q); gear.push(it); };
  if (d.b === 1) { if (Math.random() < (big ? 0.4 : 0.3)) { mkG(bossQ(), true); if (Math.random() < 0.4) mkG(bossQ(), false); } else { const n = (big ? 3 : 2) + (Math.random() < 0.4 ? 1 : 0); for (let i = 0; i < n; i++) mkG(bossQ(), false); } }
  else if (m.el) mkG(bossQ(), false);
  else if (Math.random() < (0.09 + d.lv * 0.002) / 12) mkG(normQ(d.lv), false);
  for (const it of gear) {
    if ((it.q ?? 0) >= 3) { sfx('rare'); addLog(g, `【${QN[it.q ?? 0] ?? ''}】品質裝備：${itemName(it)}！`, QC[it.q ?? 0] ?? '#ffffff'); g.banner = { t: `${QN[it.q ?? 0] ?? ''}裝備：${itemName(it)}`, c: QC[it.q ?? 0] ?? '#ffffff', l: 2.4 }; ring(g, m.x, m.y, QC[it.q ?? 0] ?? '#ffffff', 160, 0.7); }
    put(4, it);
    if (idf(it).r) { addLog(g, `首領限定裝備：${itemName(it)}！`, '#ffa860'); ring(g, m.x, m.y, '#ffa860', 120, 0.6); }
  }
  const mm = mats(g.p), mpool = d.lv < 8 ? [0, 0, 1] : d.lv < 18 ? [0, 1, 1, 2] : [1, 2, 2, 3];
  if (Math.random() < (boss ? 1 : 0.14)) { const mi = mpool[Math.floor(Math.random() * mpool.length)] ?? 0; mm[mi] = (mm[mi] ?? 0) + 1; addLog(g, `獲得材料：${MTN[mi] ?? ''}`, '#c8e0a0'); }
  if (d.lv >= 12 && Math.random() < (boss ? 0.5 : 0.03)) { mm[3] = (mm[3] ?? 0) + 1; addLog(g, '獲得材料：精靈之羽', '#c8e0a0'); }
  if (boss && Math.random() < 0.4) { mm[4] = (mm[4] ?? 0) + 1; addLog(g, '獲得稀有材料：龍鱗！', '#ffb070'); }
  while (g.drops.length > 50) g.drops.shift();
}
function dropName(dr: Drop): string { return dr.it ? itemName(dr.it) : dr.k === 9 ? `技能書：${SK[dr.s ?? 0]?.n ?? ''}` : DN[dr.k] ?? ""; }
function addItem(g: G, it: Item): boolean {
  if (g.p.inv.length >= invCap(g.p)) { if (g.time - fullWarn > 4) { fullWarn = g.time; addLog(g, `背包已滿（${invCap(g.p)} 格）！`, '#ff9090'); } return false; }
  g.p.inv.push(it); return true;
}
function pickUp(g: G, dr: Drop): boolean {
  const p = g.p;
  if (dr.it) { if (!addItem(g, dr.it)) return false; }
  else if (dr.k === 0) p.pots++; else if (dr.k === 1) p.scrolls++; else if (dr.k === 2) p.ew++; else if (dr.k === 3) p.ea++; else if (dr.k === 5) p.blue++; else if (dr.k === 7) p.bw++; else if (dr.k === 8) p.ba++; else if (dr.k === 9) { const sd = SK[dr.s ?? 0]; if (!learnSk(g, dr.s ?? 0)) { const v = Math.round((sd ? sd.p : 300) / 3); p.gold += v; addLog(g, `無法學習的技能書，換得 ${v} 金幣。`, '#ffd860'); } } else p.green++;
  const rare = !!dr.it || dr.k === 2 || dr.k === 3 || dr.k >= 7;
  sfx(rare ? 'rare' : 'pickup');
  addText(g, p.x, p.y - 54, `獲得 ${dropName(dr)}`, rare ? "#80d0ff" : "#ffffff", 13);
  addLog(g, `獲得了 ${dropName(dr)}。`, rare ? "#80d0ff" : "#d8e4f0");
  return true;
}
function inTown(g: G): boolean { return zoneAt(g.p.x, g.p.y) === -1; }
function recall(g: G): void {
  const p = g.p;
  if (p.dead > 0) return;
  if (p.scrolls <= 0) { addLog(g, "沒有回城卷軸了。", "#ff9090"); return; }
  p.scrolls--; sfx('e8'); emit(g, p.x, p.y - 15, 30, "#a0d0ff", 120, 0.6, 3);
  goWorld(g, 0, SPAWN_X, SPAWN_Y, false);
  ring(g, p.x, p.y - 12, "#a0d0ff", 140, 0.6); emit(g, p.x, p.y - 15, 30, "#a0d0ff", 120, 0.6, 3);
  addLog(g, `使用回城卷軸，回到了${TOWNS[g.p.home]?.n ?? '城鎮'}。`, '#a0d0ff');
}
function clampHM(p: Pl): void { const st = stats(p); p.hp = Math.min(p.hp, st.mhp); p.mp = Math.min(p.mp, st.mmp); }
function lookOf(p: Pl): Look { const w0 = p.eq[0], a0 = p.eq[2]; return { cls: p.cls, wt: w0 ? VT[idf(w0).t] ?? 0 : -1, at: a0 ? VT[idf(a0).t] ?? 0 : -1, en: w0 ? w0.en : 0, ck: p.eq[3] ? mat(idf(p.eq[3] as Item))[1] : undefined, sh: p.eq[6] ? mat(idf(p.eq[6] as Item))[0] : undefined }; }
function drawLook(el: HTMLCanvasElement | null, p: Pl): void { if (!el) return; const c = el.getContext('2d'); if (!c) return; el.width = 240; el.height = 300; c.setTransform(2.6, 0, 0, 2.6, 0, 0); c.clearRect(0, 0, 93, 116); drawHero(c, lookOf(p), 46, 104, 0.35, 0, false, 0, 0, 0, false); }
function equip(g: G, it: Item, slot?: number): void {
  const p = g.p, d = idf(it);
  if (!clsOk(d, p.cls)) { addLog(g, `${d.n} 無法由${CLN[p.cls] ?? ''}裝備。`, '#ff9090'); return; }
  let s = d.s;
  if (slot !== undefined && (slot === 10 ? 9 : slot) === d.s) s = slot;
  else if (s === 9 && p.eq[9] && !p.eq[10]) s = 10;
  p.inv = p.inv.filter((x: Item) => x !== it);
  const old = p.eq[s];
  if (old) p.inv.push(old);
  p.eq[s] = it;
  clampHM(p);
  addLog(g, `裝備了 ${itemName(it)}。`, '#d8e4f0');
}
function unequip(g: G, s: number): void {
  const p = g.p, it = p.eq[s];
  if (!it) return;
  if (p.inv.length >= invCap(p)) { addLog(g, '背包已滿，無法卸下。', '#ff9090'); return; }
  p.eq[s] = null; p.inv.push(it); clampHM(p);
}
function sell(g: G, it: Item): void {
  const v = sellPrice(it);
  g.p.inv = g.p.inv.filter((x: Item) => x !== it); g.p.gold += v;
  addLog(g, `賣出 ${itemName(it)}，獲得 ${v} 金幣。`, "#ffd860");
}
const SELLQ: boolean[] = [true, true, true, true, true, false];
function sellList(g: G): Item[] { return g.p.inv.filter((it: Item) => SELLQ[it.q ?? 0] === true && g.p.eq.indexOf(it) < 0); }
function sellByQ(g: G): [number, number] { const l = sellList(g); let v = 0; for (const it of l) v += sellPrice(it); g.p.inv = g.p.inv.filter((it: Item) => l.indexOf(it) < 0); g.p.gold += v; return [l.length, v]; }
function equipBest(g: G): number {
  const p = g.p; let n = 0;
  for (let s = 0; s < 13; s++) {
    const ds = s === 10 ? 9 : s, cur = p.eq[s] ?? null; let bi: Item | null = null, bv = cur ? itemScore(cur) : -1;
    for (const it of p.inv) { const d = idf(it); if (d.s !== ds || !clsOk(d, p.cls)) continue; const v = itemScore(it); if (v > bv) { bv = v; bi = it; } }
    if (bi) { equip(g, bi, s); n++; }
  }
  return n;
}
interface Ware { n: string; d: string; p: number; ic: string; f: (g: G) => boolean; g?: number }
function wares(cls: number, k: number): Ware[] { return waresAll(cls).filter((w: Ware) => (w.g ?? (w.n.indexOf('祝福') >= 0 ? 2 : w.n.indexOf('強化') >= 0 ? 1 : 0)) === k); }
function waresAll(cls: number): Ware[] {
  const w: Ware[] = [
    { n: "紅色藥水", d: "回復生命（快捷鍵 1）", p: 25, ic: "pr", f: (g: G) => { g.p.pots++; return true; } },
    { n: "紅色藥水 ×10", d: "一次買十瓶，更划算", p: 230, ic: "pr", f: (g: G) => { g.p.pots += 10; return true; } },
    { n: "藍色藥水 ×10", d: "一次買十瓶，更划算", p: 570, ic: "pb", f: (g: G) => { g.p.blue += 10; return true; } },
    { n: "綠色加速藥水 ×10", d: "一次買十瓶，更划算", p: 1150, ic: "pg", f: (g: G) => { g.p.green += 10; return true; } },
    { n: CPN[cls] ?? "", d: CPD[cls] ?? "", p: 200, ic: `pk${cls}`, f: (g: G) => { g.p.cpn = (g.p.cpn ?? 0) + 1; return true; } },
    { n: `${CPN[cls] ?? ""} ×10`, d: "一次買十個，更划算", p: 1900, ic: `pk${cls}`, f: (g: G) => { g.p.cpn = (g.p.cpn ?? 0) + 10; return true; } },
    { n: "綠色加速藥水", d: "移動與攻擊加速 2 分鐘（快捷鍵 4）", p: 120, ic: "pg", f: (g: G) => { g.p.green++; return true; } },
    { n: "藍色藥水", d: "回復魔力（快捷鍵 5）", p: 60, ic: "pb", f: (g: G) => { g.p.blue++; return true; } },
    { n: "回城卷軸", d: "回到最後造訪的城鎮（快捷鍵 3）", p: 60, ic: "sr", f: (g: G) => { g.p.scrolls++; return true; } },
    { n: "武器強化卷軸", d: "武器 +1，超過 +6 可能爆掉", p: 500, ic: "sw", f: (g: G) => { g.p.ew++; return true; } },
    { n: "防具強化卷軸", d: "防具／飾品 +1；防具超過 +4、飾品任何強化都可能爆掉", p: 300, ic: "sa", f: (g: G) => { g.p.ea++; return true; } },
    { n: '祝福的武器強化卷軸', d: '武器一次 +1～3；失敗機率較低，失敗時一半機率保住裝備', p: 2500, ic: 'sx', f: (g: G) => { g.p.bw++; return true; } },
    { n: '祝福的防具強化卷軸', d: '防具／飾品一次 +1～3；失敗機率較低，失敗時一半機率保住裝備', p: 1600, ic: 'sy', f: (g: G) => { g.p.ba++; return true; } },
  ];
  IT.forEach((d: IDef, i: number) => { if (!d.r && clsOk(d, cls) && (d.s < 7 ? d.t <= 2 : d.t <= 1)) w.push({ n: d.n, d: defDesc(d, 0), p: d.p, ic: `g${i}`, f: (g: G) => addItem(g, mkItem(i)), g: d.s >= 7 ? 7 : 1 }); });
  w.push({ n: '藍色藥水', d: '回復魔力（快捷鍵 5）', p: 60, ic: 'pb', f: (g: G) => { g.p.blue++; return true; }, g: 2 });
  SK.forEach((s: SDef, i: number) => { if (s.c === cls && s.p > 0) w.push({ n: `技能書：${s.n}`, d: `需要 Lv.${s.lv} · ${s.k === 12 ? '被動' : `${s.mp}MP`} · ${s.d}`, p: s.p, ic: `k${i}`, f: (g: G) => learnSk(g, i), g: 2 }); });
  return w;
}
function buy(g: G, w: Ware): void {
  if (g.p.gold < w.p) { addLog(g, "金幣不足。", "#ff9090"); return; }
  if (w.f(g)) { g.p.gold -= w.p; addLog(g, `購買了 ${w.n}。`, "#ffd860"); }
}
interface QDef { t: number; n: string; m: number; c: number; g: number; e: number; it: string; lv: number; d: string }
const QD: QDef[] = [
  { t: 0, n: '史萊姆之亂', m: 0, c: 10, g: 300, e: 120, it: '皮帽', lv: 1, d: '村外的綠史萊姆越來越多，請消滅 10 隻。' },
  { t: 0, n: '獵狼行動', m: 3, c: 15, g: 900, e: 500, it: '銀戒指', lv: 5, d: '荒狼平原的灰狼襲擊商隊，消滅 15 隻。' },
  { t: 0, n: '獸人來襲', m: 5, c: 12, g: 2000, e: 1200, it: '保護者斗篷', lv: 8, d: '獸人戰士在平原集結，擊退 12 名。' },
  { t: 0, n: '森林的哀嚎', m: 8, c: 10, g: 5000, e: 3500, it: '守護項鍊', lv: 14, d: '幽暗森林的狼人在夜裡嚎叫，討伐 10 隻。' },
  { t: 1, n: '沙漠毒蠍', m: 12, c: 15, g: 6000, e: 6000, it: '長筒靴', lv: 17, d: '赤土荒野的毒蠍威脅旅人，消滅 15 隻。' },
  { t: 1, n: '雪原獵人', m: 16, c: 12, g: 9000, e: 9000, it: '守護戒指', lv: 21, d: '霜雪高原的雪怪越來越兇暴，討伐 12 隻。' },
  { t: 1, n: '火山試煉', m: 20, c: 10, g: 15000, e: 15000, it: '魔力項鍊', lv: 26, d: '熔岩火山的炎魔蠢蠢欲動，擊敗 10 隻。' },
  { t: 1, n: '封印魔王', m: 24, c: 1, g: 50000, e: 20000, it: '黑暗耳環', lv: 28, d: '古代遺跡的深淵魔王甦醒了，擊敗它！' },
  { t: 0, n: '洞窟掃蕩', m: 26, c: 20, g: 4000, e: 3000, it: '黑暗斗篷', lv: 10, d: '妖魔洞窟裡的妖魔戰士越來越多，消滅 20 名。' },
  { t: 0, n: '妖魔王討伐', m: 30, c: 1, g: 12000, e: 8000, it: '力量手套', lv: 15, d: '妖魔洞窟最深處（3F）的妖魔王卡司特，擊敗它！' },
  { t: 1, n: '象牙塔之謎', m: 35, c: 1, g: 30000, e: 18000, it: '智慧之冠', lv: 22, d: '象牙塔頂層的惡魔巴風特正在召喚魔物，擊敗它！' },
  { t: 1, n: '屠龍者', m: 40, c: 1, g: 80000, e: 40000, it: '王者之戒', lv: 32, d: '龍之地監深處的地龍安塔瑞斯，只有真正的勇者能挑戰。' },
];
QD.forEach((q: QDef) => { q.g = Math.round(q.g / 4); });
let QRT: number[] = [];
function qNpcName(q: QDef): string { return NPCN[q.t]?.[6] ?? '任務委託人'; }
function freeNear(x: number, y: number): Pt {
  for (let rr = 0; rr <= 200; rr += 12) for (let k = 0; k < 16; k++) { const a = Math.PI / 2 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (TAU / 16), sx = x + Math.cos(a) * rr, sy = y + Math.sin(a) * rr; if (free(sx, sy, PR, false) && (REACH[Math.floor(sy / TS) * MW + Math.floor(sx / TS)] ?? 0) === 1) return { x: sx, y: sy }; if (rr === 0) break; }
  return { x, y };
}
function huntTarget(g: G, q: QDef): void {
  const d = MD[q.m], p = g.p;
  if (!d) return;
  g.qg = -1; g.wantNpc = null; if (g.auto) g.autoPause = 3;
  let want = 0;
  if (d.z >= 8) { const di = d.z - 8, tf = d.b ? Math.max(0, (DUNS[di]?.fl ?? 1) - 1) : Math.max(0, d.fl); want = 1 + di * 10 + tf; }
  if (WID !== want) goWorld(g, want, p.x, p.y, false);
  let best: Mon | null = null, bd = 1e18;
  for (const m of g.mons) { if (m.d !== q.m || m.dead > 0) continue; const dd = Math.hypot(m.x - p.x, m.y - p.y); if (dd < bd) { bd = dd; best = m; } }
  const pt: Pt | null | undefined = best ? { x: best.x, y: best.y + 60 } : want === 0 ? ZPT[d.z] : DINFO[want]?.boss ?? DINFO[want]?.up;
  if (!pt) return;
  const sp = freeNear(pt.x, pt.y); tpTo(g, sp.x, sp.y);
  if (best) { p.face = Math.atan2(best.y - sp.y, best.x - sp.x); }
  addLog(g, `傳送到${want === 0 ? ZN[d.z + 1] ?? '' : dunName()}，${best ? `${d.n} 就在旁邊` : `這附近就有 ${d.n}`}！`, '#80ffa0');
}
function guideQuest(g: G, q: QDef): void {
  g.qg = -1;
  const tn = TOWNS[q.t]?.n ?? '城鎮';
  const np = NPCS.find((n: Npc) => n.k === 6 && n.t === q.t);
  if (!np) return;
  if (WID !== 0) goWorld(g, 0, np.x, np.y + 30, false);
  const sp = freeNear(np.x, np.y + 30); tpTo(g, sp.x, sp.y);
  g.p.tgt = null; goTo(g, np.x, np.y + 22); g.wantNpc = np; if (g.auto) g.autoPause = 8;
  addLog(g, `傳送到${tn}的 ${np.n} 身邊，回報任務「${q.n}」。`, '#ffe08a');
}
function questKill(g: G, mi: number): void {
  QD.forEach((q: QDef, i: number) => {
    const v = g.p.q[i] ?? 0;
    if (q.m !== mi || v <= 0 || v - 1 >= q.c) return;
    g.p.q[i] = v + 1;
    if (v === q.c) { addLog(g, `任務「${q.n}」目標達成！回去向委託人回報。`, '#ffe08a'); g.banner = { t: `任務目標達成：${q.n}`, c: '#ffe08a', l: 2 }; }
  });
}
function questAct(g: G, i: number): void {
  const q = QD[i], p = g.p;
  if (!q) return;
  const v = p.q[i] ?? 0;
  if (v === 0) {
    if (p.lv < q.lv) { addLog(g, `需要等級 ${q.lv} 才能接受這個任務。`, '#ff9090'); return; }
    p.q[i] = 1; addLog(g, `接受任務「${q.n}」：${q.d}`, '#ffe08a');
  } else if (v > 0 && v - 1 >= q.c) {
    p.q[i] = -1; p.gold += q.g;
    const it = mkItem(byName(q.it));
    if (!addItem(g, it)) p.bank.push(it);
    addLog(g, `完成任務「${q.n}」！獲得 ${q.g} 金幣、${q.e} 經驗與 ${itemName(it)}。`, '#ffd860');
    g.banner = { t: `任務完成：${q.n}`, c: '#ffd860', l: 2.5 };
    gainExp(g, q.e);
  }
}
interface MQ { n: string; d: string; m: number; c: number; lv: number }
const MQS: MQ[] = [
  { n: '初來乍到', d: '村長哈丁：「年輕人，先在村子附近練練身手，到 3 級再來找我。」', m: -1, c: 0, lv: 3 },
  { n: '村外的騷動', d: '村長哈丁：「綠史萊姆把麥田弄得一團糟，幫我清掉一些。」', m: 0, c: 15, lv: 1 },
  { n: '狼群的威脅', d: '村長哈丁：「荒狼平原的灰狼開始攻擊旅人了。」', m: 3, c: 20, lv: 4 },
  { n: '成長的試煉', d: '村長哈丁：「要對付獸人，你得先到 8 級。」', m: -1, c: 0, lv: 8 },
  { n: '獸人的陰謀', d: '村長哈丁：「獸人戰士在平原集結，他們背後似乎有人指使。」', m: 5, c: 20, lv: 8 },
  { n: '深入洞窟', d: '村長哈丁：「線索指向妖魔洞窟，去看看裡面有什麼。」', m: 26, c: 25, lv: 10 },
  { n: '妖魔之王', d: '村長哈丁：「洞窟最深處的妖魔王卡司特就是幕後黑手之一，打倒它！」', m: 30, c: 1, lv: 14 },
  { n: '幽暗森林', d: '村長哈丁：「森林裡的狼人在夜裡嚎叫，好像在呼應什麼。」', m: 8, c: 20, lv: 14 },
  { n: '前往楓木城', d: '村長哈丁：「你已經是可靠的冒險者了。到 18 級後，去楓木城一帶看看。」', m: -1, c: 0, lv: 18 },
  { n: '赤土的毒蠍', d: '村長哈丁：「楓木城的商隊被沙漠蠍襲擊，他們需要你。」', m: 12, c: 25, lv: 17 },
  { n: '霜雪的異變', d: '村長哈丁：「霜雪高原的雪怪變得異常兇暴。」', m: 16, c: 25, lv: 21 },
  { n: '象牙塔之主', d: '村長哈丁：「象牙塔頂的惡魔巴風特在召喚魔物，阻止它！」', m: 35, c: 1, lv: 22 },
  { n: '火山的低語', d: '村長哈丁：「熔岩火山的炎魔正在聚集力量。」', m: 20, c: 20, lv: 26 },
  { n: '深淵甦醒', d: '村長哈丁：「古代遺跡的深淵魔王醒了，這是最終決戰前的一戰。」', m: 24, c: 1, lv: 28 },
  { n: '屠龍傳說', d: '村長哈丁：「傳說中的地龍安塔瑞斯……只有你能打倒它了。」', m: 40, c: 1, lv: 32 },
];
function mqRw(i: number): { g: number; e: number; dia: number } { return { g: Math.round(100 * Math.pow(i + 1, 1.7)), e: Math.round(300 * Math.pow(i + 1, 1.9)), dia: 2 + Math.floor(i / 3) }; }
function mqs(p: Pl): number[] { if (!p.mq || p.mq.length < 3) p.mq = [0, 0, 0]; return p.mq; }
function mqReady(p: Pl): boolean { const s = mqs(p), q = MQS[s[0] ?? 0]; if (!q || s[2] !== 1) return false; return q.m < 0 ? p.lv >= q.lv : (s[1] ?? 0) >= q.c; }
function mqAct(g: G): { ok: boolean; t: string } {
  const p = g.p, s = mqs(p), i = s[0] ?? 0, q = MQS[i];
  if (!q) return { ok: false, t: '主線任務已全部完成！' };
  if (s[2] !== 1) {
    if (q.m >= 0 && p.lv < q.lv) return { ok: false, t: `需要等級 ${q.lv} 才能接受。` };
    s[2] = 1; s[1] = 0; addLog(g, `接受主線任務「${q.n}」。`, '#ffd0a0'); return { ok: true, t: `接受主線任務「${q.n}」` };
  }
  if (!mqReady(p)) return { ok: false, t: '任務還沒完成。' };
  const r = mqRw(i);
  p.gold += r.g; p.dia = (p.dia ?? 0) + r.dia; gainExp(g, r.e);
  s[0] = i + 1; s[1] = 0; s[2] = 0; sfx('rare');
  g.banner = { t: `主線完成：${q.n}`, c: '#ffd0a0', l: 2.5 };
  const t = `完成主線「${q.n}」！獲得 ${r.g} 金幣、${r.e} 經驗、${r.dia} 鑽石。`;
  addLog(g, t, '#ffd0a0'); return { ok: true, t };
}
function mqKill(g: G, mi: number): void {
  const s = mqs(g.p), q = MQS[s[0] ?? 0];
  if (!q || s[2] !== 1 || q.m !== mi || (s[1] ?? 0) >= q.c) return;
  s[1] = (s[1] ?? 0) + 1;
  if (s[1] === q.c) { addLog(g, `主線「${q.n}」目標達成！回去向村長哈丁回報。`, '#ffd0a0'); g.banner = { t: `主線目標達成：${q.n}`, c: '#ffd0a0', l: 2 }; }
}
function fakeQ(m: number): QDef { return { t: 0, n: '', m, c: 0, g: 0, e: 0, it: '', lv: 0, d: '' }; }
interface BT { d: string; n: number; b: number[][] }
const BT_MAX = 10;
let QTAB = 0;
interface TX { k: string; n: string; t: string; ready: boolean; m: number }
function trackX(p: Pl): TX[] {
  const out: TX[] = [], s = mqs(p), q = MQS[s[0] ?? 0];
  if (q && s[2] === 1) { const rd = mqReady(p); out.push({ k: 'mq', n: `主線：${q.n}`, t: rd ? '完成！請回報村長哈丁（點我前往）' : q.m < 0 ? `等級 ${p.lv}/${q.lv}` : `${MD[q.m]?.n ?? ''} ${Math.min(q.c, s[1] ?? 0)}/${q.c}（點我導引）`, ready: rd, m: q.m }); }
  if (p.bt && p.bt.d === today()) p.bt.b.forEach((r: number[], i: number) => { if ((r[3] ?? 0) === 1) return; const rd = (r[2] ?? 0) >= (r[1] ?? 0); out.push({ k: `bt${i}`, n: `懸賞：${MD[r[0] ?? 0]?.n ?? ''}`, t: rd ? '完成！請回報村長哈丁（點我前往）' : `${r[2] ?? 0}/${r[1] ?? 0}（點我導引）`, ready: rd, m: r[0] ?? 0 }); });
  return out;
}
function btGen(p: Pl): number[][] {
  let c = MD.map((_d: MDef, i: number) => i).filter((i: number) => { const d = MD[i] as MDef; return !d.b && d.lv >= p.lv - 6 && d.lv <= p.lv + 3; });
  if (c.length < 3) c = MD.map((_d: MDef, i: number) => i).filter((i: number) => !(MD[i] as MDef).b).sort((a: number, b: number) => Math.abs((MD[a] as MDef).lv - p.lv) - Math.abs((MD[b] as MDef).lv - p.lv)).slice(0, 6);
  const out: number[][] = [];
  for (let t = 0; t < 40 && out.length < 3; t++) {
    const m = c[Math.floor(Math.random() * c.length)] ?? 0;
    if (t < 30 && out.some((r: number[]) => r[0] === m)) continue;
    const d = MD[m] as MDef;
    out.push([m, 15 + Math.floor(Math.random() * 16), 0, 0, d.lv >= p.lv ? 2 : 1, 5 + Math.floor(Math.random() * 6)]);
  }
  return out;
}
function bts(p: Pl): BT { const t = today(); if (!p.bt || p.bt.d !== t || p.bt.b.length < 3) p.bt = { d: t, n: 1, b: btGen(p) }; return p.bt; }
function btKill(g: G, mi: number): void {
  bts(g.p).b.forEach((r: number[]) => {
    if (r[0] !== mi || (r[3] ?? 0) !== 0 || (r[2] ?? 0) >= (r[1] ?? 0)) return;
    r[2] = (r[2] ?? 0) + 1;
    if (r[2] === r[1]) { addLog(g, `每日懸賞完成：${MD[mi]?.n ?? ''} ×${r[1]}！回去找村長領取獎勵。`, '#ffb070'); g.banner = { t: '每日懸賞完成！', c: '#ffb070', l: 2 }; }
  });
}
function btGold(p: Pl): number { return 300 + p.lv * 60; }
function btClaim(g: G, i: number): { ok: boolean; t: string } {
  const p = g.p, r = bts(p).b[i];
  if (!r) return { ok: false, t: '' };
  if ((r[3] ?? 0) === 1) return { ok: false, t: '這個懸賞已經領過了。' };
  if ((r[2] ?? 0) < (r[1] ?? 0)) return { ok: false, t: '懸賞還沒完成。' };
  r[3] = 1; p.dia = (p.dia ?? 0) + (r[4] ?? 1); p.bc = (p.bc ?? 0) + (r[5] ?? 5); p.gold += btGold(p); sfx('rare');
  const t = `領取懸賞獎勵：${r[4] ?? 1} 鑽石、${r[5] ?? 5} 懸賞幣、${btGold(p)} 金幣。`;
  addLog(g, t, '#ffb070'); return { ok: true, t };
}
function btRefresh(g: G): { ok: boolean; t: string } {
  const b = bts(g.p);
  if (!b.b.every((r: number[]) => (r[3] ?? 0) === 1)) return { ok: false, t: '三個懸賞都完成並領取後才能刷新。' };
  if (b.n >= BT_MAX) return { ok: false, t: `今天的懸賞已全部完成（每天 ${BT_MAX} 組，共 ${BT_MAX * 3} 個），明天再來！` };
  b.n++; b.b = btGen(g.p);
  return { ok: true, t: `刷新了新的懸賞（今日第 ${b.n}/${BT_MAX} 組）。` };
}
interface BX { n: string; c: number; d: string; f: (g: G) => string }
const BXS: BX[] = [
  { n: '洗鍊石', c: 25, d: '紫色／金色武器與項鍊重新隨機詞綴', f: (g: G) => { g.p.rs = (g.p.rs ?? 0) + 1; return '洗鍊石'; } },
  { n: '祝福的武器強化卷軸', c: 40, d: '一次 +1～3，失敗機率較低', f: (g: G) => { g.p.bw++; return '祝福的武器強化卷軸'; } },
  { n: '祝福的防具強化卷軸', c: 30, d: '防具／飾品一次 +1～3', f: (g: G) => { g.p.ba++; return '祝福的防具強化卷軸'; } },
  { n: '武器強化卷軸', c: 8, d: '武器 +1', f: (g: G) => { g.p.ew++; return '武器強化卷軸'; } },
  { n: '防具強化卷軸', c: 6, d: '防具／飾品 +1', f: (g: G) => { g.p.ea++; return '防具強化卷軸'; } },
  { n: '紅色藥水 ×50', c: 5, d: '大量補給', f: (g: G) => { g.p.pots += 50; return '紅色藥水 ×50'; } },
  { n: '龍鱗 ×1', c: 35, d: '稀有製作材料', f: (g: G) => { const mm = mats(g.p); mm[4] = (mm[4] ?? 0) + 1; return '龍鱗'; } },
  { n: '鑽石 ×1', c: 15, d: '可在兌換商使用', f: (g: G) => { g.p.dia = (g.p.dia ?? 0) + 1; return '鑽石'; } },
];
function bxBuy(g: G, i: number): { ok: boolean; t: string } {
  const x = BXS[i], p = g.p;
  if (!x) return { ok: false, t: '' };
  if ((p.bc ?? 0) < x.c) return { ok: false, t: `懸賞幣不足（需要 ${x.c}）。完成每日懸賞可以獲得。` };
  p.bc = (p.bc ?? 0) - x.c;
  const out = x.f(g); sfx('rare'); addLog(g, `懸賞幣兌換：${out}！`, '#ffb070');
  return { ok: true, t: `兌換成功：${out}` };
}
function canReroll(it: Item): boolean { const d = idf(it); return (it.q ?? 0) >= 4 && (d.s === 0 || d.s === 11); }
function rerollGold(p: Pl): number { return 8000 + p.lv * 600; }
const RR_DIA = 3;
function reroll(g: G, it: Item, how: number): { ok: boolean; t: string } {
  const p = g.p;
  if (!canReroll(it)) return { ok: false, t: '只有紫色、金色的武器與項鍊可以洗鍊。' };
  if (how === 0) { const c = rerollGold(p); if (p.gold < c) return { ok: false, t: `金幣不足（需要 ${c}）。` }; p.gold -= c; }
  else if (how === 1) { if ((p.dia ?? 0) < RR_DIA) return { ok: false, t: `鑽石不足（需要 ${RR_DIA}）。` }; p.dia = (p.dia ?? 0) - RR_DIA; }
  else { if ((p.rs ?? 0) < 1) return { ok: false, t: '沒有洗鍊石。首領有機會掉落，也可用懸賞幣兌換。' }; p.rs = (p.rs ?? 0) - 1; }
  const before = afText(it);
  rollQ(it, true, it.q);
  clampHM(p); sfx('rare');
  const t = `洗鍊 ${itemName(it)}：${before || '無'} → ${afText(it)}`;
  addLog(g, t, '#d0a0ff'); return { ok: true, t };
}
function bankIn(g: G, it: Item): void {
 const p = g.p; if (p.bank.length >= bankCap(p)) { addLog(g, '倉庫已滿。', '#ff9090'); return; } p.inv = p.inv.filter((x: Item) => x !== it); p.bank.push(it); }
function bankOut(g: G, it: Item): void { if (!addItem(g, it)) return; g.p.bank = g.p.bank.filter((x: Item) => x !== it); }
function templeHeal(g: G): void { const p = g.p, s = stats(p); p.hp = s.mhp; p.mp = s.mmp; ring(g, p.x, p.y - 12, '#a0ffb0', 120, 0.6); emit(g, p.x, p.y - 15, 26, '#c0ffd0', 90, 0.9, 3); addLog(g, '祭司為你祈禱，生命與魔力完全恢復。', '#a0ffb0'); }
function templeBless(g: G): void { const p = g.p; if (p.gold < 300) { addLog(g, '金幣不足。', '#ff9090'); return; } p.gold -= 300; p.blessT = 600; ring(g, p.x, p.y - 12, '#ffe08a', 140, 0.7); emit(g, p.x, p.y - 15, 30, '#fff0a0', 100, 1, 3); addLog(g, '獲得神聖祝福：AC -3，持續 10 分鐘。', '#ffe08a'); }
interface Tele { n: string; d: string; p: number; x: number; y: number }
function teleCost(z: number): number { return 100 + (ZLV[z] ?? 1) * 20; }
function teleList(g: G): Tele[] {
  const out: Tele[] = [], here = townIdx(g.p.x, g.p.y);
  TOWNS.forEach((t: Town, i: number) => { if (i !== here) out.push({ n: t.n, d: '城鎮廣場', p: 300, x: (t.x + 13) * TS, y: (t.y + 12.5) * TS }); });
  ZPT.forEach((pt: Pt, z: number) => out.push({ n: ZN[z + 1] ?? '', d: `建議 Lv.${ZLV[z] ?? 1}+`, p: teleCost(z), x: pt.x, y: pt.y }));
  DARR.forEach((pt: Pt, i: number) => out.push({ n: `${DUNS[i]?.n ?? ''}入口`, d: `地城 · 建議 Lv.${DUNS[i]?.lv ?? 1}+`, p: 200 + (DUNS[i]?.lv ?? 1) * 20, x: pt.x, y: pt.y }));
  return out;
}
function tpTo(g: G, x: number, y: number): void {
  const p = g.p;
  emit(g, p.x, p.y - 15, 30, '#a0d0ff', 120, 0.6, 3); sfx('e8');
  p.x = x; p.y = y; p.tgt = null; p.path = []; p.dest = null;
  ring(g, p.x, p.y - 12, '#a0d0ff', 140, 0.6); emit(g, p.x, p.y - 15, 30, '#a0d0ff', 120, 0.6, 3);
}
function teleport(g: G, t: Tele): void {
  if (g.p.gold < t.p) { addLog(g, '金幣不足。', '#ff9090'); return; }
  g.p.gold -= t.p; tpTo(g, t.x, t.y); addLog(g, `傳送到 ${t.n}。`, '#a0d0ff');
}
function townIdx(x: number, y: number): number { const tx = x / TS, ty = y / TS; return TOWNS.findIndex((t: Town) => tx >= t.x && tx < t.x + TW && ty >= t.y && ty < t.y + TH); }
function townName(x: number, y: number): string { return TOWNS[townIdx(x, y)]?.n ?? '城鎮'; }
function today(): string { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
interface DQ { n: string; c: number; dia: number; gold: number }
const DQD: DQ[] = [{ n: '擊敗 60 隻怪物（等級不低於自己 −8）', c: 60, dia: 15, gold: 2000 }, { n: '擊敗 1 隻精英怪或首領', c: 1, dia: 25, gold: 3000 }, { n: '擊敗 150 隻怪物（等級不低於自己 −8）', c: 150, dia: 40, gold: 5000 }];
function dq(p: Pl): number[] { const t = today(); if (p.dqd !== t || !p.dq || p.dq.length < 6) { p.dqd = t; p.dq = [0, 0, 0, 0, 0, 0]; } return p.dq; }
function dailyKill(g: G, m: Mon): void {
  const p = g.p, d = md(m), q = dq(p), before = q.slice();
  if (d.lv >= p.lv - 8) { q[0] = Math.min(60, (q[0] ?? 0) + 1); q[2] = Math.min(150, (q[2] ?? 0) + 1); }
  if (d.b || m.el) q[1] = 1;
  DQD.forEach((D: DQ, i: number) => { if ((before[i] ?? 0) < D.c && (q[i] ?? 0) >= D.c) { addLog(g, `每日任務完成：${D.n}！到兌換商領取 ${D.dia} 鑽石。`, '#80e8ff'); g.banner = { t: '每日任務完成！', c: '#80e8ff', l: 2 }; } });
}
function claimDaily(g: G, i: number): { ok: boolean; t: string } {
  const p = g.p, q = dq(p), D = DQD[i];
  if (!D) return { ok: false, t: '' };
  if ((q[i + 3] ?? 0) === 1) return { ok: false, t: '今天已經領過了。' };
  if ((q[i] ?? 0) < D.c) return { ok: false, t: '任務還沒完成。' };
  const gd = Math.round(D.gold * (1 + p.lv / 10));
  q[i + 3] = 1; p.dia = (p.dia ?? 0) + D.dia; p.gold += gd; sfx('rare');
  addLog(g, `領取每日獎勵：${D.dia} 鑽石、${gd} 金幣。`, '#80e8ff');
  return { ok: true, t: `獲得 ${D.dia} 鑽石、${gd} 金幣！` };
}
interface XC { n: string; c: number; d: string; f: (g: G) => string }
const XCL: XC[] = [
  { n: '祝福的武器強化卷軸', c: 40, d: '一次 +1～3', f: (g: G) => { g.p.bw++; return '祝福的武器強化卷軸'; } },
  { n: '祝福的防具強化卷軸', c: 30, d: '一次 +1～3', f: (g: G) => { g.p.ba++; return '祝福的防具強化卷軸'; } },
  { n: '精靈之羽 ×3', c: 30, d: '製作精靈裝備的材料', f: (g: G) => { const mm = mats(g.p); mm[3] = (mm[3] ?? 0) + 3; return '精靈之羽 ×3'; } },
  { n: '龍鱗 ×1', c: 50, d: '只有首領會掉的稀有材料', f: (g: G) => { const mm = mats(g.p); mm[4] = (mm[4] ?? 0) + 1; return '龍鱗'; } },
  { n: '紫色武器（你的職業）', c: 240, d: '3 條強化屬性 + 1 條特殊屬性', f: (g: G) => craftGear(g, 4, 4, '', 0) },
  { n: '金色傳說武器（你的職業）', c: 640, d: '兌換限定，怪物不會掉落這個等級的保證品', f: (g: G) => craftGear(g, 5, 5, '', 0) },
  { n: '金色傳說項鍊', c: 480, d: '兌換限定，固定強力屬性', f: (g: G) => craftGear(g, 5, 5, '', 11) },
  { n: '限定技能書（依職業）', c: 200, d: '騎士：審判之劍 · 妖精：暴風三連矢（Lv.20）· 法師：冰雪暴（Lv.24）', f: (g: G) => { const id = 40 + g.p.cls; if (learnSk(g, id)) return `技能書：${SK[id]?.n ?? ''}`; g.p.dia = (g.p.dia ?? 0) + 200; return '未能學習（等級不足或已學會），鑽石已退回'; } },
  { n: '龍騎士娃娃', c: 240, d: '魔法娃娃：傷害 +6%、生命 +100', f: (g: G) => { const o = g.p.dolls ?? []; if (o.indexOf(4) >= 0) { g.p.dia = (g.p.dia ?? 0) + 240; return '已擁有，鑽石已退回'; } g.p.dolls = o.concat([4]); return '魔法娃娃：龍騎士娃娃（到寵物・變身商召喚）'; } },
  { n: '巫妖娃娃', c: 120, d: '魔法娃娃：暴擊 +4%、魔力回復 +40%', f: (g: G) => { const o = g.p.dolls ?? []; if (o.indexOf(3) >= 0) { g.p.dia = (g.p.dia ?? 0) + 120; return '已擁有，鑽石已退回'; } g.p.dolls = o.concat([3]); return '魔法娃娃：巫妖娃娃（到寵物・變身商召喚）'; } },
];
function exchange(g: G, i: number): { ok: boolean; t: string } {
  const x = XCL[i], p = g.p;
  if (!x) return { ok: false, t: '' };
  if ((p.dia ?? 0) < x.c) return { ok: false, t: `鑽石不足（需要 ${x.c}）。完成每日任務可以獲得鑽石。` };
  p.dia = (p.dia ?? 0) - x.c;
  const out = x.f(g); sfx('rare'); addLog(g, `兌換成功：${out}！`, '#80e8ff');
  return { ok: true, t: `兌換成功：${out}` };
}
function synKey(it: Item): string { const d = idf(it); return d.s === 0 ? `W${d.m}` : `S${d.s === 10 ? 9 : d.s}`; }
function synName(k: string): string { if (k.charAt(0) === 'W') { const m = Number(k.slice(1)); return m === 1 ? '劍' : m === 2 ? '弓' : m === 4 ? '魔杖' : m === 7 ? '匕首' : '武器'; } return SLOTN[Number(k.slice(1))] ?? '裝備'; }
interface SynG { k: string; q: number; its: Item[] }
function synGroups(p: Pl): SynG[] {
  const m: Record<string, Item[]> = {};
  for (const it of p.inv) { const q = it.q ?? 0; if (q >= 5 || p.eq.indexOf(it) >= 0) continue; const k = `${synKey(it)}|${q}`; (m[k] = m[k] ?? []).push(it); }
  return Object.keys(m).map((k: string) => ({ k: k.split('|')[0] ?? '', q: Number(k.split('|')[1] ?? 0), its: m[k] ?? [] })).sort((a: SynG, b: SynG) => (b.its.length >= 3 ? 1 : 0) - (a.its.length >= 3 ? 1 : 0) || a.q - b.q || a.k.localeCompare(b.k));
}
function synCost(q: number): number { return [200, 600, 2000, 6000, 15000][q] ?? 15000; }
function synth(g: G, k: string, q: number): { ok: boolean; t: string } {
  const p = g.p, grp = synGroups(p).find((x: SynG) => x.k === k && x.q === q);
  if (q >= 5) return { ok: false, t: '金色已經是最高品質了。' };
  if (!grp || grp.its.length < 3) return { ok: false, t: '需要 3 件同顏色、同類型的裝備（身上穿的不算）。' };
  const c = synCost(q); if (p.gold < c) return { ok: false, t: `金幣不足（合成需要 ${c} 金幣）。` };
  const use = grp.its.slice().sort((a: Item, b: Item) => itemScore(a) - itemScore(b)).slice(0, 3);
  const bt = Math.max(...use.map((it: Item) => idf(it).t));
  const cand = IT.map((_d: IDef, i: number) => i).filter((i: number) => { const d = IT[i] as IDef; return d.r === 0 && d.t === bt && synKey(mkItem(i)) === k; });
  const b0 = cand[Math.floor(Math.random() * cand.length)] ?? use[use.length - 1]?.b ?? 0;
  p.gold -= c; p.inv = p.inv.filter((it: Item) => use.indexOf(it) < 0);
  const it = mkItem(b0); rollQ(it, false, q + 1); p.inv.push(it);
  sfx('rare'); emit(g, p.x, p.y - 20, 24, QC[q + 1] ?? '#fff', 140, 0.7, 3); ring(g, p.x, p.y - 10, QC[q + 1] ?? '#fff', 120, 0.5);
  const t = `合成成功：3 件${QN[q] ?? ''}${synName(k)} → 【${QN[q + 1] ?? ''}】${itemName(it)}（評分 ${itemScore(it)}）`;
  addLog(g, t, QC[q + 1] ?? '#fff'); g.banner = { t: '合成成功！', c: QC[q + 1] ?? '#fff', l: 1.8 };
  return { ok: true, t };
}
function resetStats(g: G): string { const p = g.p; p.bs = [0, 0, 0, 0, 0]; clampHM(p); addLog(g, '能力點數已重置，可以重新分配。', '#a0e0ff'); return `已重置，可分配點數 ${ptsLeft(p)}。`; }
interface DS { n: string; c: number; d: string; ic: string; q?: boolean; tag?: string; ok?: (g: G) => string; f: (g: G, n: number) => string }
function dsPet(i: number, c: number): DS { const s = PSP[i]; return { n: `寵物：${s?.n ?? ''}`, c, d: `${s?.d ?? ''}。出戰時生命 +30、AC +1`, ic: '', tag: '寵', ok: (g: G) => ((g.p.pets ?? []).length >= 8 ? '寵物欄已滿（最多 8 隻）。' : ''), f: (g: G) => { const p = g.p; p.pets = (p.pets ?? []).concat([[i, 1, 0]]); if ((p.pa ?? -1) < 0) { p.pa = p.pets.length - 1; BPT.x = p.x + 26; BPT.y = p.y + 10; } return `寵物 ${s?.n ?? ''}`; } }; }
function dsDoll(i: number, c: number): DS { const d = DOLL[i]; return { n: `魔法娃娃：${d?.n ?? ''}`, c, d: d?.d ?? '', ic: '', tag: '娃', ok: (g: G) => ((g.p.dolls ?? []).indexOf(i) >= 0 ? '已經擁有這個娃娃了。' : ''), f: (g: G) => { const p = g.p; p.dolls = (p.dolls ?? []).concat([i]); p.doll = i; return `${d?.n ?? ''}（已自動召喚）`; } }; }
const DSHOP: DS[] = [
  { n: '防爆卷軸', c: 50, d: '強化失敗會爆裝時，自動消耗 1 張保住裝備，強化值不變。放在背包裡就會生效。', ic: 'sp', q: true, f: (g: G, n: number) => { g.p.ab = (g.p.ab ?? 0) + n; return `防爆卷軸 ×${n}`; } },
  ...XSP.flatMap((_pp: number, pi: number) => XSM.map((_mm: number, mi: number) => { const i = pi * 3 + mi; return { n: xsName(i), c: XSC[i] ?? 100, d: '使用後獲得經驗值加成（同時只能有一種，使用新的會覆蓋）。首領也會掉落。', ic: `se${pi + 1}`, q: true, f: (g: G, n: number) => { const a = xsArr(g.p); a[i] = (a[i] ?? 0) + n; return `${xsName(i)} ×${n}`; } } as DS; })),
  { n: '洗鍊石', c: 30, d: '紫色／金色武器與項鍊重新隨機詞綴（到鍛造屋使用）', ic: 'rk', q: true, f: (g: G, n: number) => { g.p.rs = (g.p.rs ?? 0) + n; return `洗鍊石 ×${n}`; } },
  { n: '背包擴充 +10 格', c: 150, d: '永久增加背包 10 格（最多 +150 格）', ic: 'xb', ok: (g: G) => ((g.p.bagX ?? 0) >= 15 ? '背包已經擴充到上限了。' : ''), f: (g: G) => { g.p.bagX = (g.p.bagX ?? 0) + 1; return `背包擴充（現在 ${invCap(g.p)} 格）`; } },
  { n: '倉庫擴充 +20 格', c: 120, d: '永久增加倉庫 20 格（最多 +200 格）', ic: 'xw', ok: (g: G) => ((g.p.wareX ?? 0) >= 10 ? '倉庫已經擴充到上限了。' : ''), f: (g: G) => { g.p.wareX = (g.p.wareX ?? 0) + 1; return `倉庫擴充（現在 ${bankCap(g.p)} 格）`; } },
  dsPet(3, 250), dsPet(4, 400), dsDoll(2, 100), dsDoll(3, 150), dsDoll(4, 300),
];
function dsCost(x: DS, n: number): number { return n >= 10 ? Math.round(x.c * n * 0.9) : x.c * n; }
function dsBuy(g: G, i: number, n0: number): { ok: boolean; t: string } {
  const x = DSHOP[i], p = g.p; if (!x) return { ok: false, t: '' };
  const n = x.q ? Math.max(1, Math.min(999, Math.floor(n0))) : 1, cost = dsCost(x, n);
  const er = x.ok ? x.ok(g) : ''; if (er) return { ok: false, t: er };
  if ((p.dia ?? 0) < cost) return { ok: false, t: `鑽石不足（需要 ${cost}，目前 ${p.dia ?? 0}）。打倒首領可以獲得大量鑽石。` };
  p.dia = (p.dia ?? 0) - cost; const out = x.f(g, n); sfx('rare');
  addLog(g, `鑽石商城：購買 ${out}（-${cost} 鑽石）`, '#80e8ff');
  return { ok: true, t: `購買成功：${out}` };
}
function mats(p: Pl): number[] { if (!p.mt || p.mt.length < 5) p.mt = [0, 1, 2, 3, 4].map((i: number) => p.mt?.[i] ?? 0); return p.mt; }
interface Rcp { n: string; m: number[]; g: number; f: (g: G) => string }
function craftGear(g: G, qmin: number, qmax: number, pre: string, slot: number): string {
  const p = g.p, tier = Math.floor(p.lv / 7);
  const ids = IT.map((_d: IDef, i: number) => i).filter((i: number) => { const d = IT[i] as IDef; return clsOk(d, p.cls) && d.r === 0 && (slot < 0 || d.s === slot) && (pre ? d.n.indexOf(pre) === 0 : Math.abs(d.t - tier) <= 1); });
  const b = ids[Math.floor(Math.random() * ids.length)] ?? byName('皮背心'), it = mkItem(b);
  rollQ(it, true, qmin + Math.floor(Math.random() * (qmax - qmin + 1)));
  if (!addItem(g, it)) { p.bank.push(it); addLog(g, '背包已滿，成品已送到倉庫。', '#ffc080'); }
  return `【${QN[it.q ?? 0] ?? ''}】${itemName(it)}`;
}
const RCP: Rcp[] = [
  { n: '紅色藥水 ×10', m: [2, 0, 0, 0, 0], g: 50, f: (g: G) => { g.p.pots += 10; return '紅色藥水 ×10'; } },
  { n: '藍色藥水 ×5', m: [0, 0, 1, 0, 0], g: 100, f: (g: G) => { g.p.blue += 5; return '藍色藥水 ×5'; } },
  { n: '回城卷軸 ×3', m: [1, 1, 0, 0, 0], g: 60, f: (g: G) => { g.p.scrolls += 3; return '回城卷軸 ×3'; } },
  { n: '綠色加速藥水 ×3', m: [1, 0, 1, 0, 0], g: 150, f: (g: G) => { g.p.green += 3; return '綠色加速藥水 ×3'; } },
  { n: '防具強化卷軸', m: [0, 3, 1, 0, 0], g: 500, f: (g: G) => { g.p.ea++; return '防具強化卷軸'; } },
  { n: '武器強化卷軸', m: [0, 4, 2, 0, 0], g: 800, f: (g: G) => { g.p.ew++; return '武器強化卷軸'; } },
  { n: '祝福的武器強化卷軸', m: [0, 6, 4, 0, 1], g: 5000, f: (g: G) => { g.p.bw++; return '祝福的武器強化卷軸'; } },
  { n: '藍～紅色裝備（隨機，適合你的職業與等級）', m: [4, 6, 3, 0, 0], g: 3000, f: (g: G) => craftGear(g, 2, 3, '', -1) },
  { n: '精靈系列裝備（綠～紅色，可湊精靈套裝）', m: [2, 0, 3, 5, 0], g: 4000, f: (g: G) => craftGear(g, 1, 3, '精靈', -1) },
  { n: '紫色武器（你的職業）', m: [0, 8, 6, 2, 3], g: 20000, f: (g: G) => craftGear(g, 4, 4, '', 0) },
];
function craft(g: G, i: number): { ok: boolean; t: string } {
  const r = RCP[i], p = g.p, mm = mats(p);
  if (!r) return { ok: false, t: '' };
  if (!r.m.every((c0: number, j: number) => (mm[j] ?? 0) >= c0)) return { ok: false, t: '材料不足。' };
  if (p.gold < r.g) return { ok: false, t: '金幣不足。' };
  r.m.forEach((c0: number, j: number) => { mm[j] = (mm[j] ?? 0) - c0; }); p.gold -= r.g;
  const out = r.f(g); sfx('rare'); emit(g, p.x, p.y - 20, 30, '#ffe08a', 120, 0.8, 3);
  addLog(g, `製作成功：${out}！`, '#ffe08a');
  return { ok: true, t: `製作成功：${out}` };
}
function enchant(g: G, it: Item, bless: boolean): { ok: boolean; t: string } {
  const p = g.p, d = idf(it), isW = d.s === 0, kind = isW ? '武器' : '防具', acc = isAcc(d);
  const have = isW ? (bless ? p.bw : p.ew) : bless ? p.ba : p.ea;
  if (have <= 0) { const t = `沒有${bless ? '祝福的' : ''}${kind}強化卷軸${acc ? '（飾品使用防具強化卷軸）' : ''}，可在商店購買或打怪取得。`; addLog(g, t, '#ff9090'); return { ok: false, t }; }
  if (isW) { if (bless) p.bw--; else p.ew--; } else if (bless) p.ba--; else p.ea--;
  const before = itemName(it), safe = safeOf(d);
  let ok = true;
  const up = bless ? 1 + (Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2) : 1;
  if (it.en < safe) it.en = Math.min(safe, it.en + up);
  else if (Math.random() < Math.max(0.1, (isAcc(d) ? 0.6 : 0.5) - (it.en - safe) * 0.08) + (bless ? 0.12 : 0)) it.en += up;
  else if (bless && Math.random() < 0.5) { sfx('enchFail'); const t = `${before} 發出黑光，但祝福的力量保護了它，強化值不變。`; g.banner = { t: '強化失敗，但裝備受祝福保護', c: '#ffe08a', l: 2.2 }; addLog(g, t, '#ffe08a'); return { ok: false, t }; }
  else ok = false;
  if (ok) {
    sfx('enchOk');
    const t = `${before} 發出耀眼的藍光，變成了 ${itemName(it)}！`;
    g.flash = { c: "120,200,255", l: 0.6 }; g.banner = { t: `強化成功！${itemName(it)}`, c: "#80d8ff", l: 2.2 };
    ring(g, p.x, p.y - 15, "#80d8ff", 220, 0.8); ring(g, p.x, p.y - 15, "#ffe060", 150, 0.6);
    emit(g, p.x, p.y - 15, 60, "#80d8ff", 220, 1, 3.5); emit(g, p.x, p.y - 15, 30, "#ffe060", 160, 0.9, 3);
    addLog(g, t, "#80d8ff"); return { ok, t };
  }
  sfx('enchFail');
  if ((p.ab ?? 0) > 0) { p.ab = (p.ab ?? 0) - 1; const t = `${before} 發出強烈的黑光，但防爆卷軸保護了它，裝備沒有損壞（強化值不變）。`; g.banner = { t: '防爆卷軸發動，裝備沒有損壞', c: '#9fdcff', l: 2.2 }; addLog(g, t, '#9fdcff'); return { ok: false, t }; }
  p.inv = p.inv.filter((x: Item) => x !== it);
  const si = p.eq.indexOf(it);
  if (si >= 0) p.eq[si] = null;
  clampHM(p);
  const t = `${before} 發出強烈的黑光後化為灰燼……${acc ? `（飾品沒有安定值，${bless ? '祝福的' : '一般'}防具強化卷軸也可能使其損壞）` : ''}`;
  g.flash = { c: "110,0,30", l: 0.9 }; g.banner = { t: "強化失敗，裝備消失了", c: "#ff5060", l: 2.4 }; g.shake = 0.5;
  emit(g, p.x, p.y - 15, 60, "#2a0a2a", 180, 1.1, 4); emit(g, p.x, p.y - 15, 30, "#ff3050", 140, 0.8, 3);
  addLog(g, t, "#ff6070"); return { ok, t };
}

/* ---------- save: storage + save code ---------- */
const SAVE_KEY = "silvermoon-legend-save-v2";
let MEM_SAVE = "";
interface SaveData { cls: number; lv: number; exp: number; gold: number; pots: number; blue: number; green: number; scrolls: number; ew: number; ea: number; bw: number; ba: number; x: number; y: number; hasteT: number; set: Settings; eq: (Item | null)[]; inv: Item[]; bs: number[]; ext: Record<string, unknown> }
interface OldIt { k: number; tr: number; en: number; c: number }
function num(v: unknown, d: number): number { return typeof v === 'number' && isFinite(v) ? v : d; }
function packItem(it: Item | null): number[] | number { return it ? (it.q ? [it.b, it.en, it.q].concat(it.af ?? []) : [it.b, it.en]) : 0; }
function unpackItem(a: unknown): Item | null {
  if (!Array.isArray(a) || a.length < 2) return null;
  try {
  const it = mkItem(num(a[0], 0), clamp(Math.floor(num(a[1], 0)), 0, 30)), q = Math.floor(num(a[2], 0));
  if (q > 0 && q <= 5) { it.q = q; it.af = a.slice(3).map((v: unknown) => Math.floor(num(v, 0))).filter((v: number) => v > 0 && v < 1400).slice(0, 5); }
  return it;
  } catch { return null; }
}
const LEGW = [['短劍', '長劍', '騎士巨劍', '秘銀長劍', '炎魔之刃'], ['短弓', '長弓', '精靈長弓', '秘銀弓', '風暴之弓'], ['木杖', '水晶杖', '賢者之杖', '秘銀法杖', '深淵法杖']], LEGA = ['皮甲', '鏈甲', '鋼板甲', '秘銀鎧甲', '魔王鎧甲'];
function legacyItem(a: unknown): Item | null {
  if (!Array.isArray(a) || a.length < 4) return null;
  const k = num(a[0], 0), tr = clamp(Math.floor(num(a[1], 0)), 0, 4), c = clamp(Math.floor(num(a[3], 0)), 0, 2);
  return mkItem(byName(k === 0 ? LEGW[c]?.[tr] ?? '短劍' : LEGA[tr] ?? '皮甲'), clamp(Math.floor(num(a[2], 0)), 0, 30));
}
function extSave(g: G): Record<string, unknown> { const p = g.p; return { v: 3, w: 2, kc: p.kc ?? 0, pets: p.pets ?? [], pa: p.pa ?? -1, dl: p.dolls ?? [], dw: p.doll ?? -1, pf: [p.poly ?? -1, Math.round(p.polyT ?? 0)], mt: p.mt ?? [], dia: p.dia ?? 0, dq: p.dq ?? [], dqd: p.dqd ?? '', mq: p.mq ?? [0, 0, 0], bt: p.bt ?? null, bc: p.bc ?? 0, rs: p.rs ?? 0, s: WSEED, h: p.home, q: p.q, bk: p.bank.map(packItem), bl: Math.round(p.blessT), sk: p.sk, hb: p.hb, t: Date.now(), ab: p.ab ?? 0, xs: p.xs ?? [], xb: p.xb ?? [0, 0], cpn: p.cpn ?? 0, skx: Object.keys(p.skx ?? {}).map((k: string) => [Number(k), Math.round((p.skx?.[Number(k)] ?? 0) * 10) / 10]), bx: p.bagX ?? 0, wx: p.wareX ?? 0, r13: 1, au: [VOL, MUTE ? 1 : 0, BGM_ON ? 1 : 0], ai: g.bots.map((b: Bot) => [b.cls, b.lv, Math.round(b.exp), Math.floor(b.kc ?? 0), b.en ?? 0]), pk: p.pk ?? 0 }; }
function extLoad(g: G, e: Record<string, unknown>): void {
  const p = g.p;
  p.dia = Math.max(0, Math.floor(num(e.dia, 0)));
  p.ab = Math.max(0, Math.floor(num(e.ab, 0))); p.cpn = Math.max(0, Math.floor(num(e.cpn, 0)));
  p.bagX = clamp(Math.floor(num(e.bx, 0)), 0, 15); p.wareX = clamp(Math.floor(num(e.wx, 0)), 0, 10);
  if (Array.isArray(e.xs)) { const xa = e.xs as unknown[]; p.xs = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i: number) => Math.max(0, Math.floor(num(xa[i], 0)))); }
  if (Array.isArray(e.xb)) { const xa = e.xb as unknown[]; p.xb = [clamp(Math.floor(num(xa[0], 0)), 0, 25), clamp(num(xa[1], 0), 0, 7200)]; }
  if (Array.isArray(e.skx)) { const sx: Record<number, number> = {}; for (const r of e.skx as unknown[]) { if (!Array.isArray(r)) continue; const ra = r as unknown[], id = Math.floor(num(ra[0], -1)), v = Math.max(0, num(ra[1], 0)); if (SK[id]) sx[id] = v; } p.skx = sx; }
  p.kc = Math.max(0, Math.floor(num(e.kc, 0))); p.pk = Math.max(0, Math.floor(num(e.pk, 0)));
  if (Array.isArray(e.mq)) { const a = e.mq as unknown[]; p.mq = [clamp(Math.floor(num(a[0], 0)), 0, MQS.length), Math.max(0, Math.floor(num(a[1], 0))), num(a[2], 0) === 1 ? 1 : 0]; }
  { const bt = e.bt as { d?: unknown; n?: unknown; b?: unknown } | null | undefined; if (bt && typeof bt === 'object' && typeof bt.d === 'string' && Array.isArray(bt.b)) p.bt = { d: bt.d, n: clamp(Math.floor(num(bt.n, 1)), 1, BT_MAX), b: (bt.b as unknown[]).filter((r: unknown) => Array.isArray(r)).slice(0, 3).map((r: unknown) => [0, 1, 2, 3, 4, 5].map((k: number) => Math.max(0, Math.floor(num((r as unknown[])[k], 0))))) }; }
  p.bc = Math.max(0, Math.floor(num(e.bc, 0))); p.rs = Math.max(0, Math.floor(num(e.rs, 0)));
  if (Array.isArray(e.pets)) p.pets = (e.pets as unknown[]).filter((a: unknown) => Array.isArray(a)).slice(0, 8).map((a: unknown) => { const r = a as unknown[]; return [clamp(Math.floor(num(r[0], 0)), 0, 4), clamp(Math.floor(num(r[1], 1)), 1, 50), Math.max(0, num(r[2], 0))]; });
  p.pa = clamp(Math.floor(num(e.pa, -1)), -1, (p.pets?.length ?? 0) - 1);
  if (Array.isArray(e.dl)) p.dolls = (e.dl as unknown[]).map((v: unknown) => Math.floor(num(v, -1))).filter((v: number) => v >= 0 && v < 5);
  p.doll = Math.floor(num(e.dw, -1)); if ((p.dolls ?? []).indexOf(p.doll) < 0) p.doll = -1;
  if (Array.isArray(e.pf)) { p.poly = Math.floor(num(e.pf[0], -1)); p.polyT = Math.max(0, num(e.pf[1], 0)); }
  if (typeof e.dqd === 'string' && Array.isArray(e.dq)) { p.dqd = e.dqd; p.dq = [0, 1, 2, 3, 4, 5].map((i: number) => Math.max(0, Math.floor(num((e.dq as unknown[])[i], 0)))); }
  if (Array.isArray(e.mt)) p.mt = [0, 1, 2, 3, 4].map((i: number) => Math.max(0, Math.floor(num((e.mt as unknown[])[i], 0))));
  p.home = clamp(Math.floor(num(e.h, 0)), 0, TOWNS.length - 1);
  const t = TOWNS[p.home];
  if (t) { SPAWN_X = (t.x + 18) * TS; SPAWN_Y = (t.y + 15.5) * TS; }
  const qa = e.q, ba = e.bk;
  if (Array.isArray(qa)) p.q = QD.map((_q: QDef, i: number) => clamp(Math.floor(num((qa as unknown[])[i], 0)), -1, 999));
  if (Array.isArray(ba)) p.bank = (ba as unknown[]).map((x: unknown) => unpackItem(x)).filter((x: Item | null): x is Item => x !== null).slice(0, 600);
  p.blessT = clamp(num(e.bl, 0), 0, 600);
  const ai = e.ai;
  if (Array.isArray(ai)) (ai as unknown[]).forEach((v: unknown, i: number) => { const b = g.bots[i]; if (!b || !Array.isArray(v)) return; const a = v as unknown[]; b.cls = clamp(Math.floor(num(a[0], b.cls)), 0, 2); b.lv = clamp(Math.floor(num(a[1], b.lv)), 1, 80); b.exp = Math.max(0, num(a[2], 0)); if (a[3] !== undefined) b.kc = Math.max(0, Math.floor(num(a[3], 0))); if (a[4] !== undefined) b.en = clamp(Math.floor(num(a[4], 0)), 0, 200); botGear(b); botInit(b); });
  const au = e.au;
  if (Array.isArray(au)) { const aa = au as unknown[]; VOL = clamp(num(aa[0], 0.6), 0, 1); MUTE = num(aa[1], 0) === 1; BGM_ON = num(aa[2], 1) === 1; setVol(); }
  const ska = e.sk, hba = e.hb;
  if (Array.isArray(ska)) { const all = [BSK[p.cls] ?? 0].concat((ska as unknown[]).map((v: unknown) => Math.floor(num(v, -1))).filter((v: number) => (SK[v]?.c ?? -1) === p.cls)); p.sk = all.filter((v: number, i: number) => all.indexOf(v) === i); }
  if (Array.isArray(hba)) p.hb = [0, 1, 2, 3, 4, 5, 6, 7].map((i: number) => { const v = Math.floor(num((hba as unknown[])[i], -1)); return p.sk.indexOf(v) >= 0 ? v : -1; });
}
function toSave(g: G): SaveData {
  const p = g.p, town = p.dead > 0 || WID !== 0;
  return { cls: p.cls, lv: p.lv, exp: p.exp, gold: p.gold, pots: p.pots, blue: p.blue, green: p.green, scrolls: p.scrolls, ew: p.ew, ea: p.ea, bw: p.bw, ba: p.ba, x: town ? SPAWN_X : p.x, y: town ? SPAWN_Y : p.y, hasteT: p.hasteT, set: { ...g.set }, eq: p.eq, inv: p.inv, bs: p.bs, ext: extSave(g) };
}
const B64A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function b64raw(r: string): string { let o = ''; for (let i = 0; i < r.length; i += 3) { const a = r.charCodeAt(i) & 255, b = i + 1 < r.length ? r.charCodeAt(i + 1) & 255 : -1, c = i + 2 < r.length ? r.charCodeAt(i + 2) & 255 : -1; o += B64A[a >> 2]; o += B64A[((a & 3) << 4) | (b < 0 ? 0 : b >> 4)]; o += b < 0 ? '=' : B64A[((b & 15) << 2) | (c < 0 ? 0 : c >> 6)]; o += c < 0 ? '=' : B64A[c & 63]; } return o; }
function b64e(s: string): string { try { return btoa(s); } catch { const u = new TextEncoder().encode(s); let r = ''; u.forEach((c: number) => { r += String.fromCharCode(c); }); try { return btoa(r); } catch { return b64raw(r); } } }
function b64draw(b: string): string { let o = '', bits = 0, n = 0; for (let i = 0; i < b.length; i++) { const v = B64A.indexOf(b.charAt(i)); if (v < 0) continue; bits = (bits << 6) | v; n += 6; if (n >= 8) { n -= 8; o += String.fromCharCode((bits >> n) & 255); } } return o; }
function b64d(b: string): string { let r = ''; try { r = atob(b); } catch { r = b64draw(b); } if (!/[\x80-\xff]/.test(r)) return r; try { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(r, (c: string) => c.charCodeAt(0))); } catch { return r; } }
function cks(s: string): string { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h.toString(36); }
function encodeSave(s: SaveData): string {
  const arr = [3, s.cls, s.lv, Math.floor(s.exp), Math.floor(s.gold), s.pots, s.blue, s.green, s.scrolls, s.ew, s.ea, Math.round(s.x), Math.round(s.y), Math.round(s.hasteT), [s.set.hp, s.set.mp, s.set.haste ? 1 : 0, s.set.restock ? 1 : 0, s.set.zone], s.eq.map(packItem), s.inv.map(packItem), s.bw, s.ba, s.bs, s.ext];
  const b = b64e(JSON.stringify(arr));
  return `SM3-${b}-${cks(b)}`;
}
function decodeSave(code: string): SaveData | null {
  try {
    const t = code.trim().replace(/\s+/g, "");
    const mm = /^SM[23]-([A-Za-z0-9+/=]+)-([0-9a-z]+)$/.exec(t);
    if (!mm) return null;
    const b = mm[1] ?? "";
    if (cks(b) !== (mm[2] ?? "")) return null;
    const a = JSON.parse(b64d(b)) as unknown;
    if (!Array.isArray(a) || (a[0] !== 2 && a[0] !== 3)) return null;
    const v3 = a[0] === 3;
    const n = (i: number, d: number): number => { const v: unknown = a[i]; return typeof v === "number" && isFinite(v) ? v : d; };
    const sa: unknown[] = Array.isArray(a[14]) ? (a[14] as unknown[]) : [];
    const sn = (i: number, d: number): number => { const v = sa[i]; return typeof v === "number" ? v : d; };
    const eq: (Item | null)[] = new Array<Item | null>(13).fill(null);
    let inv: Item[] = [];
    if (v3) {
      const ea: unknown[] = Array.isArray(a[15]) ? (a[15] as unknown[]) : [];
      for (let i = 0; i < 13; i++) eq[i] = unpackItem(ea[i]);
      inv = Array.isArray(a[16]) ? (a[16] as unknown[]).map((x: unknown) => unpackItem(x)).filter((x: Item | null): x is Item => x !== null).slice(0, 600) : [];
    } else {
      eq[0] = legacyItem(a[15]); eq[2] = legacyItem(a[16]);
      inv = Array.isArray(a[17]) ? (a[17] as unknown[]).map((x: unknown) => legacyItem(x)).filter((x: Item | null): x is Item => x !== null).slice(0, 600) : [];
    }
    const bsA: unknown[] = v3 && Array.isArray(a[19]) ? (a[19] as unknown[]) : [];
    const bs = [0, 1, 2, 3, 4].map((i: number) => clamp(Math.floor(num(bsA[i], 0)), 0, 99));
    const e0: unknown = v3 ? a[20] : null;
    const ext: Record<string, unknown> = e0 && typeof e0 === 'object' && !Array.isArray(e0) ? (e0 as Record<string, unknown>) : {};
    return {
      cls: clamp(Math.floor(n(1, 0)), 0, 2), lv: clamp(Math.floor(n(2, 1)), 1, 99), exp: Math.max(0, n(3, 0)), gold: Math.max(0, n(4, 0)),
      pots: Math.max(0, n(5, 0)), blue: Math.max(0, n(6, 0)), green: Math.max(0, n(7, 0)), scrolls: Math.max(0, n(8, 0)), ew: Math.max(0, n(9, 0)), ea: Math.max(0, n(10, 0)),
      x: n(11, SPAWN_X), y: n(12, SPAWN_Y), hasteT: clamp(n(13, 0), 0, HASTE),
      set: { hp: clamp(sn(0, 50), 0, 95), mp: clamp(sn(1, 30), 0, 95), haste: sn(2, 1) === 1, restock: sn(3, 1) === 1, zone: clamp(sn(4, -1), -1, 40) },
      eq, inv, bw: v3 ? Math.max(0, n(17, 0)) : 0, ba: v3 ? Math.max(0, n(18, 0)) : 0, bs, ext,
    };
  } catch { return null; }
}
let IDB_OK = false, IDB_SAVE: SaveData | null = null, BKT = 0, PREV_SEEN = '';
const DIAG = ((): { origin: string; host: string; ls: boolean; ck: boolean; ss: boolean; prev: string; sandbox: boolean } => {
  const d = { origin: '', host: '', ls: false, ck: false, ss: false, prev: '', sandbox: false };
  try { d.origin = String(self.origin); d.host = String(location.host || location.protocol); d.sandbox = d.origin === 'null'; } catch { /* blocked */ }
  try { d.prev = window.localStorage.getItem('sm_seen') ?? ''; window.localStorage.setItem('sm_seen', String(Date.now())); d.ls = window.localStorage.getItem('sm_seen') !== null; } catch { /* blocked */ }
  try { document.cookie = 'smck=1; max-age=31536000; path=/; SameSite=None; Secure'; d.ck = document.cookie.indexOf('smck=1') >= 0; } catch { /* blocked */ }
  try { window.sessionStorage.setItem('sm_ss', '1'); d.ss = window.sessionStorage.getItem('sm_ss') === '1'; } catch { /* blocked */ }
  PREV_SEEN = d.prev; return d;
})();
function diagText(): string { const t = PREV_SEEN ? new Date(Number(PREV_SEEN)).toLocaleString() : '無紀錄'; return `儲存診斷：來源 ${DIAG.sandbox ? '隔離（null）' : DIAG.host || '未知'} · localStorage ${DIAG.ls ? '✓' : '✗'} · IndexedDB ${IDB_OK ? '✓' : '✗'} · Cookie ${DIAG.ck ? '✓' : '✗'} · 上次開啟：${t}`; }
function newestOf(a: SaveData | null, b: SaveData | null): SaveData | null { return a && b ? (saveTime(b) > saveTime(a) ? b : a) : a ?? b; }
function idbOpen(cb: (db: IDBDatabase | null) => void): void {
  try {
    const q = indexedDB.open('silvermoon-db', 1);
    q.onupgradeneeded = () => { try { q.result.createObjectStore('s'); } catch { /* exists */ } };
    q.onsuccess = () => cb(q.result);
    q.onerror = () => cb(null);
  } catch { cb(null); }
}
function idbPut(code: string, key?: string): void { idbOpen((db: IDBDatabase | null) => { if (!db) return; try { const tx = db.transaction('s', 'readwrite'); tx.objectStore('s').put(code, key ?? 'save'); tx.oncomplete = () => { try { db.close(); } catch { /* closed */ } }; } catch { /* blocked */ } }); }
function idbGet(key?: string): Promise<string> {
  return new Promise((res: (v: string) => void) => {
    idbOpen((db: IDBDatabase | null) => {
      if (!db) { res(''); return; }
      try { const r = db.transaction('s', 'readonly').objectStore('s').get(key ?? 'save'); r.onsuccess = () => { IDB_OK = true; res(typeof r.result === 'string' ? r.result : ''); try { db.close(); } catch { /* closed */ } }; r.onerror = () => res(''); } catch { res(''); }
    });
  });
}
function cookieGet(): string {
  try {
    const parts: Record<string, string> = {};
    document.cookie.split(';').forEach((c: string) => { const i = c.indexOf('='); if (i > 0) parts[c.slice(0, i).trim()] = c.slice(i + 1); });
    const n = Number(parts['smn'] ?? 0);
    let s = '';
    for (let i = 0; i < n; i++) s += decodeURIComponent(parts[`sm${i}`] ?? '');
    return s;
  } catch { return ''; }
}
function cookiePut(code: string): boolean {
  try {
    const n = Math.ceil(code.length / 3000), tail = '; max-age=31536000; path=/; SameSite=None; Secure';
    for (let i = 0; i < n; i++) document.cookie = `sm${i}=${encodeURIComponent(code.slice(i * 3000, (i + 1) * 3000))}${tail}`;
    document.cookie = `smn=${n}${tail}`;
    return cookieGet() === code;
  } catch { return false; }
}
function nameGet(): string { try { const n = window.name || ''; return n.indexOf('SMSAVE:') === 0 ? n.slice(7) : ''; } catch { return ''; } }
function storeSave(code: string): string {
  MEM_SAVE = code;
  let m = 'none';
  try { window.name = `SMSAVE:${code}`; } catch { /* blocked */ }
  idbPut(code);
  if (cookiePut(code)) m = 'local';
  try { window.sessionStorage.setItem(SAVE_KEY, code); if (m === 'none' && window.sessionStorage.getItem(SAVE_KEY) === code) m = 'session'; } catch { /* blocked */ }
  try { window.localStorage.setItem(SAVE_KEY, code); if (window.localStorage.getItem(SAVE_KEY) === code) m = 'local'; } catch { /* blocked */ }
  if (m !== 'local' && IDB_OK) m = 'local';
  return m;
}
function saveTime(s: SaveData): number { return num(s.ext.t, 0) || s.lv * 1e6 + s.exp; }
const BAK_KEY = SAVE_KEY + '-bak';
function bakGet(): SaveData | null { let c = ''; try { c = window.localStorage.getItem(BAK_KEY) ?? ''; } catch { /* blocked */ } return c ? decodeSave(c) : null; }
function bakPut(s: SaveData): void { try { const c = encodeSave(s); try { window.localStorage.setItem(BAK_KEY, c); } catch { /* blocked */ } idbPut(c, 'bak'); } catch { /* encode failed */ } }
function bakAll(): Promise<SaveData | null> { return idbGet('bak').then((c: string) => { const a = bakGet(), b = c ? decodeSave(c) : null; return a && b ? (saveTime(b) > saveTime(a) ? b : a) : a ?? b; }, () => bakGet()); }
function pickNewest(cs: string[]): SaveData | null {
  let best: SaveData | null = null;
  for (const c of cs) { if (!c) continue; const s = decodeSave(c); if (s && (!best || saveTime(s) > saveTime(best))) best = s; }
  return best;
}
function loadAll(): Promise<{ sv: SaveData | null; idb: boolean }> {
  return idbGet().then((c: string) => { const a = loadStored(), b = c ? decodeSave(c) : null; IDB_SAVE = b; return { sv: a && b ? (saveTime(b) > saveTime(a) ? b : a) : a ?? b, idb: IDB_OK }; });
}
function probeStorage(): string {
  try { window.localStorage.setItem("sm-probe", "1"); if (window.localStorage.getItem("sm-probe") === "1") return "local"; } catch { /* blocked */ }
  try { document.cookie = 'smprobe=1; path=/; SameSite=None; Secure'; if (document.cookie.indexOf('smprobe=1') >= 0) return 'local'; } catch { /* blocked */ }
  if (IDB_OK) return 'local';
  try { window.sessionStorage.setItem("sm-probe", "1"); if (window.sessionStorage.getItem("sm-probe") === "1") return "session"; } catch { /* blocked */ }
  return "none";
}
function readOld(): SaveData | null {
  try {
    const r = window.localStorage.getItem("silvermoon-legend-save-v1");
    if (!r) return null;
    const o = JSON.parse(r) as { cls?: number; lv?: number; exp?: number; gold?: number; pots?: number; scrolls?: number; ew?: number; ea?: number; inv?: OldIt[]; eqW?: OldIt | null; eqA?: OldIt | null };
    const ui = (it: OldIt | null | undefined): Item | null => (it ? legacyItem([it.k, it.tr, it.en, it.c]) : null);
    const eq = new Array<Item | null>(13).fill(null);
    eq[0] = ui(o.eqW); eq[2] = ui(o.eqA);
    return { cls: clamp(o.cls ?? 0, 0, 2), lv: o.lv ?? 1, exp: o.exp ?? 0, gold: o.gold ?? 0, pots: o.pots ?? 0, blue: 0, green: 0, scrolls: o.scrolls ?? 0, ew: o.ew ?? 0, ea: o.ea ?? 0, bw: 0, ba: 0, x: SPAWN_X, y: SPAWN_Y, hasteT: 0, set: { hp: 50, mp: 30, haste: true, restock: true, zone: -1 }, eq, inv: (o.inv ?? []).map((x: OldIt) => ui(x)).filter((x: Item | null): x is Item => x !== null), bs: [0, 0, 0, 0, 0], ext: {} };
  } catch { return null; }
}
function loadStored(): SaveData | null {
  const cs: string[] = [MEM_SAVE, cookieGet(), nameGet()];
  try { cs.push(window.localStorage.getItem(SAVE_KEY) ?? ''); } catch { /* blocked */ }
  try { cs.push(window.sessionStorage.getItem(SAVE_KEY) ?? ''); } catch { /* blocked */ }
  return pickNewest(cs) ?? readOld();
}
function applySave(g: G, s: SaveData): void {
  const p = g.p;
  p.lv = s.lv; p.exp = s.exp; p.gold = s.gold; p.pots = s.pots; p.blue = s.blue; p.green = s.green; p.scrolls = s.scrolls; p.ew = s.ew; p.ea = s.ea; p.hasteT = s.hasteT; p.bw = s.bw; p.ba = s.ba; p.bs = s.bs.slice(0, 5);
  p.inv = s.inv.slice(0, 600); p.eq = new Array<Item | null>(13).fill(null);
  s.eq.forEach((it: Item | null, i: number) => { if (!it) return; if (clsOk(idf(it), p.cls) && i < 13) p.eq[i] = it; else if (p.inv.length < 600) p.inv.push(it); });
  g.set = { ...s.set };
  try { extLoad(g, s.ext); } catch { /* partial ext load: keep core progress */ }
  if (s.ext.w === 2 && free(s.x, s.y, PR, false) && REACH[Math.floor(s.y / TS) * MW + Math.floor(s.x / TS)] === 1) { p.x = s.x; p.y = s.y; } else { p.x = SPAWN_X; p.y = SPAWN_Y; }
  const st = stats(p); p.hp = st.mhp; p.mp = st.mmp;
  addLog(g, `讀取存檔成功，歡迎回來！（Lv.${p.lv}）`, "#ffe08a");
}

/* ---------- sprites: tiles, trees, icons, shadow ---------- */
function mk(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] | null {
  try { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); return x ? [c, x] : null; } catch { return null; }
}
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function lg(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, c0: string, c1: string): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g;
}
function shape(ctx: CanvasRenderingContext2D, pts: number[], fill: string | CanvasGradient, stroke?: string, lw?: number): void {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2) { const x = pts[i] ?? 0, y = pts[i + 1] ?? 0; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw ?? 1.2; ctx.stroke(); }
}
function ball(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c0: string, c1: string, stroke?: string): void {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
}
function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient, stroke?: string): void {
  rrect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
}
let SHADOW: HTMLCanvasElement | null = null;
function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
  if (!SHADOW) {
    const r = mk(64, 32);
    if (!r) return;
    const [c, s] = r;
    s.setTransform(1, 0, 0, 0.5, 0, 0);
    const g = s.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, "rgba(0,0,0,0.5)"); g.addColorStop(0.6, "rgba(0,0,0,0.25)"); g.addColorStop(1, "rgba(0,0,0,0)");
    s.fillStyle = g; s.fillRect(0, 0, 64, 64); SHADOW = c;
  }
  ctx.drawImage(SHADOW, x - w, y - w * 0.4, w * 2, w * 0.8);
}
function speck(x: CanvasRenderingContext2D, R: () => number, n: number, cols: string[], w: number, h: number): void {
  for (let i = 0; i < n; i++) { x.fillStyle = cols[Math.floor(R() * cols.length)] ?? "#000"; x.fillRect(Math.floor(R() * w), Math.floor(R() * h), R() < 0.3 ? 2 : 1, 1); }
}
function blot(x: CanvasRenderingContext2D, R: () => number, n: number, cols: string[], r0: number, r1: number): void {
  for (let i = 0; i < n; i++) { const r = r0 + R() * (r1 - r0), cx = r + R() * (TS - 2 * r), cy = r + R() * (TS - 2 * r); x.fillStyle = cols[Math.floor(R() * cols.length)] ?? '#000'; x.beginPath(); x.ellipse(cx, cy, r, r * (0.55 + R() * 0.35), R() * 3, 0, TAU); x.fill(); }
}
function blades(x: CanvasRenderingContext2D, R: () => number, n: number, cols: string[], h: number): void {
  x.lineWidth = 1;
  for (let i = 0; i < n; i++) { const bx = 1 + R() * 30, by = 4 + R() * 27; x.strokeStyle = cols[Math.floor(R() * cols.length)] ?? '#000'; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + R() * 2.4 - 1.2, by - h * (0.5 + R() * 0.6)); x.stroke(); }
}
function pebbles(x: CanvasRenderingContext2D, R: () => number, n: number, c0: string, c1: string): void {
  for (let i = 0; i < n; i++) { const px = 3 + R() * 26, py = 3 + R() * 26, r = 0.8 + R() * 1.4; x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.ellipse(px + 0.6, py + 0.8, r, r * 0.7, 0, 0, TAU); x.fill(); ball(x, px, py, r, c0, c1); }
}
function cobble(x: CanvasRenderingContext2D, R: () => number, cols: string[], mort: string): void {
  x.fillStyle = mort; x.fillRect(0, 0, TS, TS);
  speck(x, R, 25, ['rgba(0,0,0,0.22)', 'rgba(255,255,255,0.1)'], TS, TS);
  let y0 = 0;
  for (const rh of [11, 10, 11]) {
    const cuts = [0]; let cx = R() < 0.5 ? 9 + R() * 5 : 13 + R() * 6; while (cx < TS - 6) { cuts.push(cx); cx += 10 + R() * 8; } cuts.push(TS);
    for (let k = 0; k + 1 < cuts.length; k++) {
      const sx = (cuts[k] ?? 0) + 0.9, ex = (cuts[k + 1] ?? TS) - 0.9, sy = y0 + 0.9, ey = y0 + rh - 0.9, c0 = cols[Math.floor(R() * cols.length)] ?? '#aaa';
      box(x, sx + 0.5, sy + 0.8, ex - sx, ey - sy, 2.6, 'rgba(30,22,14,0.45)');
      box(x, sx, sy, ex - sx, ey - sy, 2.6, lg(x, sx, sy, sx + 3, ey + 3, c0, 'rgba(96,86,70,1)'));
      x.fillStyle = 'rgba(255,250,232,0.25)'; x.fillRect(sx + 2, sy + 1, ex - sx - 4, 1.2);
      if (R() < 0.35) { x.strokeStyle = 'rgba(40,30,20,0.35)'; x.lineWidth = 0.8; x.beginPath(); const mx = sx + (ex - sx) * R(); x.moveTo(mx, sy + 1); x.lineTo(mx + R() * 4 - 2, ey - 1); x.stroke(); }
      if (R() < 0.3) speck(x, R, 3, ['rgba(90,110,50,0.6)'], TS, TS);
    }
    y0 += rh;
  }
}
function paintTileL1(x: CanvasRenderingContext2D, t: number, v: number, R: () => number): void {
  const base = (c0: string): void => { x.fillStyle = c0; x.fillRect(0, 0, TS, TS); };
  if (t === 0 || t === 2) {
    base(v % 2 ? '#6e8a3a' : '#698536');
    blot(x, R, 5, ['rgba(140,160,70,0.28)', 'rgba(70,90,35,0.3)', 'rgba(120,110,60,0.18)'], 4, 9);
    speck(x, R, 70, ['#7e9a46', '#55702c', '#86a04e', '#4c6428', '#8a8a4a'], TS, TS);
    blades(x, R, 12, ['#4a6226', '#90aa56', '#a4b468', '#3e5420'], 4);
    if (v === 2) { blot(x, R, 2, ['rgba(130,105,65,0.55)'], 4, 6); pebbles(x, R, 2, '#c8bca4', '#7a6e5c'); }
    if (v === 3) { ball(x, 9, 12, 1.8, '#fff6c0', '#d8b030'); ball(x, 23, 21, 1.7, '#f8f0ff', '#b8a0d8'); ball(x, 15, 26, 1.5, '#fff6c0', '#d8b030'); }
  } else if (t === 1) {
    cobble(x, R, ['#c4b69a', '#b8aa8e', '#cbbfa4', '#ad9f84', '#bfae90', '#a89a80'], '#6c6252');
  } else if (t === 5) {
    base(v % 2 ? '#4a5a2c' : '#465628');
    blot(x, R, 5, ['rgba(90,70,40,0.35)', 'rgba(40,60,25,0.4)', 'rgba(110,90,50,0.25)'], 4, 9);
    speck(x, R, 60, ['#56682e', '#33421c', '#6a5a34', '#4e5e2a'], TS, TS);
    for (let i = 0; i < 4; i++) { x.fillStyle = ['#6e5430', '#7e6234', '#5a6428', '#644226'][Math.floor(R() * 4)] ?? '#8a5a2a'; x.beginPath(); x.ellipse(R() * 26 + 3, R() * 26 + 3, 2.4, 1.2, R() * 3, 0, TAU); x.fill(); }
    blades(x, R, 6, ['#2e3e18', '#62763a'], 3.5);
    if (v === 3) { ball(x, 20, 20, 3, '#e8d8b8', '#a88a5a'); x.fillStyle = '#efe6d6'; x.fillRect(19, 22, 2, 4); }
  } else {
    base(v % 2 ? '#9c8258' : '#977d54');
    blot(x, R, 5, ['rgba(70,52,30,0.22)', 'rgba(190,165,120,0.22)', 'rgba(110,90,60,0.25)'], 4, 9);
    speck(x, R, 60, ['#7a6240', '#b49a6e', '#8a7050', '#a68c62'], TS, TS);
    pebbles(x, R, 3 + v, '#c4b49a', '#6e5e48');
  }
}
function paintTile(x: CanvasRenderingContext2D, t: number, v: number, R: () => number): void {
  if (t === 0 || t === 1 || t === 2 || t === 5 || t === 8) { paintTileL1(x, t, v, R); return; }
  if (paintDunFloor(x, t, v, R)) return;
  const base = (c0: string, c1: string): void => { x.fillStyle = lg(x, 0, 0, TS, TS, c0, c1); x.fillRect(0, 0, TS, TS); };
  if (t === 0 || t === 2) {
    base(v % 2 ? "#5c9c45" : "#56953f", "#4a8538");
    speck(x, R, 80, ["#6bb052", "#3f7a32", "#62a64a", "#467f36"], TS, TS);
    for (let i = 0; i < 7; i++) { const bx = R() * 30, by = R() * 26 + 5; x.strokeStyle = R() < 0.5 ? "#3a722e" : "#7cc05d"; x.lineWidth = 1; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + R() * 3 - 1.5, by - 3 - R() * 3); x.stroke(); }
    if (v === 3) { ball(x, 10, 12, 2.2, "#fff6a0", "#e8c030"); ball(x, 22, 22, 2, "#ffd0e8", "#e870a0"); }
  } else if (t === 1) {
    base("#aa9f89", "#958a74");
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const ox = (r % 2) * 5 - 3 + c * 11, oy = r * 8;
      box(x, ox + 1, oy + 1, 9.5, 6.5, 2.5, lg(x, ox, oy, ox, oy + 7, R() < 0.5 ? "#c2b8a2" : "#b6ab94", "#8d826d"));
    }
    speck(x, R, 25, ["#7c725f", "#cfc6b2"], TS, TS);
  } else if (t === 3) {
    base("#3283c0", "#1f5690");
    speck(x, R, 30, ["#4a9ad4", "#2a6aa8"], TS, TS);
  } else if (t === 4) {
    base("#7a746c", "#5c5750");
    for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) {
      const ox = c * 14 + (r % 2) * 7, oy = r * 8;
      box(x, ox + 0.5, oy + 0.5, 13, 7, 1.5, lg(x, ox, oy, ox, oy + 8, "#958f86", "#625d56"));
      x.fillStyle = "rgba(255,255,255,0.18)"; x.fillRect(ox + 1.5, oy + 1, 11, 1);
    }
  } else if (t === 5) {
    base(v % 2 ? "#356530" : "#315e2c", "#28502a");
    speck(x, R, 60, ["#417a3a", "#244a22", "#3c6e34"], TS, TS);
    for (let i = 0; i < 3; i++) { x.fillStyle = ["#8a5a2a", "#a8702a", "#5e7a2a"][Math.floor(R() * 3)] ?? "#8a5a2a"; x.beginPath(); x.ellipse(R() * 28 + 2, R() * 28 + 2, 2.5, 1.3, R() * 3, 0, TAU); x.fill(); }
    if (v === 3) { ball(x, 20, 20, 3.2, "#ff8a7a", "#b02a20"); x.fillStyle = "#efe6d6"; x.fillRect(19, 22, 2, 4); }
  } else if (t === 6 || t === 7) {
    base("#433c4a", "#2f2a36");
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) box(x, c * 16 + 1, r * 16 + 1, 14, 14, 2, lg(x, 0, r * 16, 0, r * 16 + 16, R() < 0.5 ? "#4d4556" : "#463f4f", "#332d3a"));
    speck(x, R, 30, ["#2a2530", "#5a5264"], TS, TS);
    if (v === 1) { x.strokeStyle = "rgba(0,0,0,0.45)"; x.lineWidth = 1; x.beginPath(); x.moveTo(5, 8); x.lineTo(12, 14); x.lineTo(10, 22); x.stroke(); }
    if (t === 7) { shadowBlob(x, 16, 26, 13); ball(x, 16, 18, 12, "#a19fa6", "#55535a", OL); ball(x, 11, 13, 4, "rgba(255,255,255,0.35)", "rgba(255,255,255,0)"); }
  } else if (t === 9) {
    base(v % 2 ? '#dcbc80' : '#d6b478', '#c09a5c');
    speck(x, R, 60, ['#c8a468', '#ecd09a', '#b08a50'], TS, TS);
    x.strokeStyle = 'rgba(150,110,60,0.35)'; x.lineWidth = 1;
    for (let i = 0; i < 2; i++) { const yy = 8 + i * 13 + R() * 4; x.beginPath(); x.moveTo(2, yy); x.quadraticCurveTo(16, yy - 3, 30, yy); x.stroke(); }
    if (v === 3) ball(x, 20, 22, 2.5, '#c8b8a0', '#8a7a60');
  } else if (t === 10) {
    base(v % 2 ? '#eef4fa' : '#e8f0f8', '#cfdbe8');
    speck(x, R, 30, ['#ffffff', '#c4d4e6', '#dbe6f2'], TS, TS);
    if (v === 2) { x.fillStyle = 'rgba(160,190,220,0.35)'; x.beginPath(); x.ellipse(16, 18, 10, 4, 0.3, 0, TAU); x.fill(); }
  } else if (t === 11) {
    base(v % 2 ? '#5e5e3c' : '#58583a', '#3e4228');
    speck(x, R, 50, ['#6a6a44', '#3a3c24', '#4a5230'], TS, TS);
    x.fillStyle = 'rgba(30,40,30,0.45)'; x.beginPath(); x.ellipse(8 + R() * 16, 10 + R() * 12, 6, 3, 0, 0, TAU); x.fill();
    if (v === 1) for (let i = 0; i < 4; i++) seg(x, 22 + i * 2, 28, 21 + i * 2.5, 18 - R() * 4, '#6a7a3a', 1.2);
  } else if (t === 12) {
    base(v % 2 ? '#4c3c38' : '#463634', '#2c2220');
    speck(x, R, 50, ['#5a4a44', '#241a18', '#3a2e2a'], TS, TS);
    if (v >= 2) speck(x, R, 6, ['#ff7a2a', '#ffb040'], TS, TS);
    x.strokeStyle = 'rgba(0,0,0,0.4)'; x.lineWidth = 1; x.beginPath(); x.moveTo(4, 6 + v * 5); x.lineTo(14, 12 + v * 3); x.lineTo(26, 9 + v * 4); x.stroke();
  } else if (t === 13) {
    base('#ff7a20', '#b0280a');
    for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(60,20,10,0.55)'; x.beginPath(); x.ellipse(R() * 32, R() * 32, 3 + R() * 5, 2 + R() * 3, R() * 3, 0, TAU); x.fill(); }
    speck(x, R, 20, ['#ffe080', '#ffb040'], TS, TS);
  } else if (t === 14) {
    base(v % 2 ? '#a8a25a' : '#a29c54', '#8a8240');
    speck(x, R, 70, ['#b8b068', '#7e7638', '#c4bc70'], TS, TS);
    for (let i = 0; i < 8; i++) { const bx = R() * 30, by = R() * 26 + 5; seg(x, bx, by, bx + R() * 3 - 1.5, by - 3 - R() * 4, R() < 0.5 ? '#7a7030' : '#d0c878', 1); }
  } else if (t === 16) {
    base('#c8bca0', '#b0a488');
    for (let r2 = 0; r2 < 2; r2++) for (let c2 = 0; c2 < 2; c2++) box(x, c2 * 16 + 0.5, r2 * 16 + 0.5, 15, 15, 1.5, lg(x, 0, r2 * 16, 0, r2 * 16 + 16, R() < 0.5 ? '#d6ccb2' : '#cec2a6', '#ac9e80'));
    speck(x, R, 20, ['#9a8e74', '#e4dac4'], TS, TS);
  } else if (t === 17) {
    base('#3a3442', '#24202c');
    box(x, 1, 1, 30, 30, 3, lg(x, 0, 0, 0, 32, '#5a5266', '#2a2632'), OL);
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(3, 3, 26, 3);
    seg(x, 2, 16, 30, 16, 'rgba(0,0,0,0.35)', 1); seg(x, 16, 2, 16, 16, 'rgba(0,0,0,0.35)', 1); seg(x, 9, 16, 9, 30, 'rgba(0,0,0,0.35)', 1); seg(x, 24, 16, 24, 30, 'rgba(0,0,0,0.35)', 1);
  } else if (t === 18) {
    base('#3283c0', '#1f5690');
    for (let i = 0; i < 4; i++) box(x, 0, i * 8 + 0.5, TS, 7, 1, lg(x, 0, i * 8, 0, i * 8 + 8, i % 2 ? '#a87444' : '#9a6a3c', '#6a4424'), OL);
    seg(x, 0, 1, TS, 1, '#5a3a20', 2); seg(x, 0, 31, TS, 31, '#5a3a20', 2);
  } else if (t === 19) {
    base(v % 2 ? '#5a4a3a' : '#544434', '#3a2e24');
    speck(x, R, 60, ['#6a5a48', '#2a2018', '#4a3c2e'], TS, TS);
    for (let i = 0; i < 3; i++) ball(x, R() * 28 + 2, R() * 28 + 2, 1.5 + R() * 2, '#7a6a58', '#3a2e22');
  } else if (t === 20 || t === 22) {
    const cw = t === 20;
    base(cw ? '#2e2620' : '#3a4050', cw ? '#16120e' : '#1e222c');
    if (cw) { for (let i = 0; i < 5; i++) ball(x, R() * 30 + 1, R() * 30 + 1, 5 + R() * 6, '#6a5a4a', '#2a2018', OL); }
    else for (let r2 = 0; r2 < 4; r2++) for (let c2 = -1; c2 < 3; c2++) { const ox = c2 * 14 + (r2 % 2) * 7, oy = r2 * 8; box(x, ox + 0.5, oy + 0.5, 13, 7, 1.5, lg(x, ox, oy, ox, oy + 8, '#7a849a', '#4a5264')); }
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, TS - 5, TS, 5);
  } else if (t === 21) {
    base('#c8c4d4', '#a8a4b8');
    const a1 = v % 2 ? '#e4e0ec' : '#b0acc0', a2 = v % 2 ? '#9894ac' : '#d4d0e0';
    box(x, 0.5, 0.5, 15, 15, 1, a1); box(x, 16.5, 16.5, 15, 15, 1, a1); box(x, 16.5, 0.5, 15, 15, 1, a2); box(x, 0.5, 16.5, 15, 15, 1, a2);
    x.strokeStyle = 'rgba(200,170,90,0.5)'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, TS - 1, TS - 1);
  } else if (t === 23) {
    base(v % 2 ? '#2e2228' : '#2a1e24', '#180e12');
    speck(x, R, 40, ['#3a2a30', '#120a0c'], TS, TS);
    x.strokeStyle = 'rgba(255,110,30,0.75)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(R() * 10, R() * 32); x.lineTo(10 + R() * 12, R() * 32); x.lineTo(22 + R() * 10, R() * 32); x.stroke();
  } else if (t === 24 || t === 25) {
    const dn = t === 24;
    base('#4a4248', '#2a2428');
    for (let i = 0; i < 5; i++) { const k = dn ? i : 4 - i, c0 = 150 - k * 26; box(x, 3 + i * 1.5, 3 + i * 5.5, 26 - i * 3, 5, 1, `rgb(${c0},${c0 - 8},${c0 - 4})`, OL); }
    shape(x, dn ? [16, 30, 11, 24, 21, 24] : [16, 4, 11, 10, 21, 10], dn ? '#ffb060' : '#80e0ff', OL, 1);
  } else {
    base(v % 2 ? "#bba273" : "#b39a69", "#a08658");
    speck(x, R, 50, ["#8e7a52", "#cdb88a", "#9a8460"], TS, TS);
    x.strokeStyle = "rgba(110,90,60,0.35)"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 9); x.lineTo(TS, 9); x.moveTo(0, 23); x.lineTo(TS, 23); x.stroke();
  }
}
function shadowBlob(x: CanvasRenderingContext2D, cx: number, cy: number, w: number): void {
  x.fillStyle = "rgba(0,0,0,0.3)"; x.beginPath(); x.ellipse(cx, cy, w, w * 0.35, 0, 0, TAU); x.fill();
}
let TILES: HTMLCanvasElement[][] | null = null;
function tiles(): HTMLCanvasElement[][] {
  if (TILES) return TILES;
  const R = mulberry(99), out: HTMLCanvasElement[][] = [];
  for (let t = 0; t < 26; t++) {
    const row: HTMLCanvasElement[] = [];
    for (let v = 0; v < 4; v++) { const r = mk(TS * 2, TS * 2); if (r) { r[1].scale(2, 2); paintTile(r[1], t, v, R); row.push(r[0]); } }
    out.push(row);
  }
  TILES = out;
  return out;
}
let TREES: HTMLCanvasElement[] | null = null;
function trees(): HTMLCanvasElement[] {
  if (TREES) return TREES;
  const out: HTMLCanvasElement[] = [];
  for (let i = 0; i < 8; i++) {
    const r = mk(96, 128);
    if (!r) continue;
    const x = r[1], forest = i >= 2;
    if (i < 99) { paintTree3(x, i); out.push(r[0]); continue; }
    shadowBlob(x, 30, 74, 20);
    box(x, 26, 46, 8, 30, 2, lg(x, 26, 0, 34, 0, "#86603a", "#4a301c"), OL);
    shape(x, [26, 74, 20, 78, 30, 72], "#5a3a22"); shape(x, [34, 74, 40, 78, 30, 72], "#5a3a22");
    seg(x, 28, 74, 28.5, 48, 'rgba(255,230,190,0.25)', 1); seg(x, 31, 72, 30.5, 52, 'rgba(40,20,10,0.45)', 1); seg(x, 32.5, 66, 32.8, 56, 'rgba(40,20,10,0.4)', 0.8);
    if (i >= 4) paintTree2(x, i);
    else if (i === 3) pineTree(x, false, 9); else {
      const c0 = forest ? "#4c9246" : "#7ccc5c", c1 = forest ? "#1d4a22" : "#2f7a2c";
      const bl: [number, number, number][] = i % 2 ? [[30, 34, 17], [16, 40, 11], [44, 40, 11], [30, 18, 13]] : [[30, 32, 19], [17, 42, 10], [43, 42, 10], [24, 20, 11], [37, 18, 11]];
      for (const [bx, by, br] of bl) ball(x, bx, by, br + 1.2, OL, OL);
      for (const [bx, by, br] of bl) ball(x, bx, by, br, c0, c1);
      for (const [bx, by, br] of bl) ball(x, bx - br * 0.3, by - br * 0.35, br * 0.4, "rgba(255,255,255,0.22)", "rgba(255,255,255,0)");
      const LR = mulberry(31 + i);
      for (const [bx, by, br] of bl) for (let k = 0; k < 10; k++) { const a = LR() * TAU, rr = LR() * br * 0.78, lx = bx + Math.cos(a) * rr, ly = by + Math.sin(a) * rr, up = ly < by - br * 0.15; ball(x, lx, ly, 2 + LR() * 2, up ? (forest ? '#6aa85a' : '#a4d47a') : (forest ? '#2a5a2c' : '#3e7a36'), up ? (forest ? '#356a34' : '#5a9a48') : (forest ? '#163a1a' : '#24562a')); }
      if (!forest && i === 1) { ball(x, 22, 30, 2.4, "#ff6a5a", "#c02a20"); ball(x, 38, 26, 2.4, "#ff6a5a", "#c02a20"); }
    }
    out.push(r[0]);
  }
  TREES = out;
  return out;
}
function pineTier(x: CanvasRenderingContext2D, cx: number, y0: number, w: number, h: number, c0: string, c1: string, snow: boolean, R: () => number): void {
  const pts = [cx, y0 - h, cx + w * 0.5, y0 - h * 0.42, cx + w, y0], n = 8;
  for (let k = n; k >= 0; k--) pts.push(cx - w + (2 * w * k) / n, y0 + (k % 2 ? 3.5 : -0.5));
  pts.push(cx - w * 0.5, y0 - h * 0.42);
  shape(x, pts, lg(x, cx - w * 0.6, y0 - h, cx + w * 0.8, y0, c0, c1), OL, 1.2);
  shape(x, [cx - w * 0.92, y0, cx + w * 0.92, y0, cx + w * 0.55, y0 - 5, cx - w * 0.55, y0 - 5], 'rgba(0,0,0,0.2)');
  for (let k = 0; k < 9; k++) { const t = R(), sx = cx + (R() - 0.5) * w * 1.3 * t, sy = y0 - h * (1 - t) * 0.9 - 1; seg(x, sx, sy, sx + (sx < cx ? -3 : 3), sy + 3, sx < cx ? 'rgba(180,230,160,0.45)' : 'rgba(10,40,20,0.45)', 1); }
  if (snow) shape(x, [cx, y0 - h, cx + w * 0.42, y0 - h * 0.5, cx + w * 0.15, y0 - h * 0.42, cx - w * 0.2, y0 - h * 0.48, cx - w * 0.62, y0 - h * 0.3, cx - w * 0.45, y0 - h * 0.6], '#f4f8ff');
  else shape(x, [cx, y0 - h, cx - w * 0.5, y0 - h * 0.42, cx - w * 0.2, y0 - h * 0.46], 'rgba(255,255,220,0.14)');
}
function pineTree(x: CanvasRenderingContext2D, snow: boolean, seed: number): void {
  const R = mulberry(seed);
  for (let k = 0; k < 4; k++) { const y0 = (snow ? 56 : 54) - k * 12.5, w = 25 - k * 4.8; pineTier(x, 30, y0, w, 22 - k, snow ? '#4e8a70' : '#4a8a4a', snow ? '#163830' : '#163e22', snow, R); }
}
function paintTree2(x: CanvasRenderingContext2D, i: number): void {
  if (i === 4) pineTree(x, true, 8); else if (i === 5 || i === 7) {
    const c = i === 5 ? '#6a5a4a' : '#2a2220';
    limb(x, [30, 74, 30, 40, 22, 26, 14, 20], 5, c); limb(x, [30, 46, 40, 30, 46, 22], 4, c); limb(x, [30, 40, 33, 22, 30, 12], 3.5, c); limb(x, [22, 26, 24, 16], 2.5, c); limb(x, [40, 30, 36, 20], 2.5, c);
    seg(x, 28.5, 72, 29, 44, 'rgba(255,240,210,0.22)', 1.2); seg(x, 31.5, 70, 32, 50, 'rgba(0,0,0,0.3)', 1);
    if (i === 5) for (const [mx, my] of [[14, 22], [46, 24], [30, 14], [24, 18]] as [number, number][]) { x.fillStyle = 'rgba(120,150,90,0.85)'; x.fillRect(mx - 1, my, 2.5, 9); x.fillStyle = 'rgba(80,110,60,0.7)'; x.fillRect(mx + 1, my + 2, 1.5, 6); }
    else for (const [ex, ey] of [[14, 20], [46, 22], [30, 12], [24, 16]] as [number, number][]) ball(x, ex, ey, 2.5, '#ffd080', '#ff4010');
  } else if (i === 6) {
    x.clearRect(0, 0, 60, 80); shadowBlob(x, 30, 74, 14);
    box(x, 24, 22, 12, 54, 6, lg(x, 24, 0, 36, 0, '#7ac060', '#2a6a2a'), OL);
    box(x, 10, 36, 9, 22, 4.5, lg(x, 10, 0, 19, 0, '#7ac060', '#2a6a2a'), OL); box(x, 14, 52, 12, 7, 3, '#4a8a3a', OL);
    box(x, 41, 30, 9, 20, 4.5, lg(x, 41, 0, 50, 0, '#7ac060', '#2a6a2a'), OL); box(x, 34, 46, 12, 7, 3, '#4a8a3a', OL);
    for (let k = 0; k < 6; k++) seg(x, 27 + (k % 2) * 6, 28 + k * 8, 25 + (k % 2) * 10, 27 + k * 8, '#e8f0c0', 0.8);
    ball(x, 30, 22, 3, '#ff8ab0', '#c03060');
  }
}
const ICONS: Record<string, HTMLCanvasElement> = {};
const ICON_URL: Record<string, string> = {};
function paintIcon(x: CanvasRenderingContext2D, key: string): void {
  if (key === 'pk0' || key === 'pk2') { paintPot(x, key === 'pk0' ? 'pr' : 'pb', key === 'pk0' ? ['#fff4b0', '#ff9a18', '#6a2a00'] : ['#f0d0ff', '#9040e0', '#24084a']); icBadge(x, key === 'pk0' ? '勇' : '慎', key === 'pk0' ? '#c86010' : '#6a2ab0'); return; }
  if (key === 'pk1') { paintCookie(x); return; }
  if (key === 'xb' || key === 'xw') { paintExp(x, key === 'xw'); return; }
  if (key === 'rk') { paintStone(x); return; }
  const k0 = key[0] ?? "", a1 = Number(key[1] ?? 0), a2 = Number(key[2] ?? 0);
  if (k0 === 'G') { paintGear(x, Number(key.slice(1))); return; }
  if (k0 === 'g') { gearSlot(x, Number(key.slice(1))); return; }
  if (k0 === 'k') { paintSk(x, Number(key.slice(1))); return; }
  if (key === 'bk') { paintBook(x); return; }
  if (k0 === "w") {
    const tr = a2, [lc, dc] = TIERC[tr] ?? ["#ddd", "#888"];
    if (tr >= 3) ball(x, 24, 24, 22, tr === 4 ? "rgba(255,120,60,0.45)" : "rgba(120,190,255,0.45)", "rgba(0,0,0,0)");
    x.save(); x.translate(24, 24); x.rotate(Math.PI / 4);
    if (a1 === 0) {
      const L = 17 + tr * 1.5;
      shape(x, [-3.5 - tr * 0.3, 7, -3.5 - tr * 0.3, -L, 0, -L - 5, 3.5 + tr * 0.3, -L, 3.5 + tr * 0.3, 7], lg(x, -4, 0, 4, 0, lc, dc), OL, 1.4);
      x.strokeStyle = "rgba(255,255,255,0.55)"; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 5); x.lineTo(0, -L + 2); x.stroke();
      box(x, -10, 7, 20, 4, 2, lg(x, 0, 7, 0, 11, tr === 4 ? "#ff9a50" : "#f0cc60", "#8a6420"), OL);
      box(x, -2, 11, 4, 9, 1, "#5a3a22", OL); ball(x, 0, 22, 3.2, "#f0cc60", "#8a6420", OL);
    } else if (a1 === 1) {
      x.strokeStyle = OL; x.lineWidth = 6; x.beginPath(); x.moveTo(-2, -21); x.quadraticCurveTo(14, 0, -2, 21); x.stroke();
      x.strokeStyle = lg(x, 0, -20, 0, 20, lc, dc); x.lineWidth = 4; x.beginPath(); x.moveTo(-2, -21); x.quadraticCurveTo(14, 0, -2, 21); x.stroke();
      x.strokeStyle = "#f4f4f4"; x.lineWidth = 1; x.beginPath(); x.moveTo(-2, -20); x.lineTo(-2, 20); x.stroke();
      box(x, 3, -4, 5, 8, 1.5, "#6a4224", OL);
      shape(x, [-14, 0, 6, -1, 6, 1], "#d8c090"); shape(x, [10, 0, 5, -3, 5, 3], "#e8e8e8", OL, 0.8);
    } else {
      x.strokeStyle = OL; x.lineWidth = 5; x.beginPath(); x.moveTo(0, 22); x.lineTo(0, -12); x.stroke();
      x.strokeStyle = lg(x, -2, 0, 2, 0, "#a87a4a", "#5a3a20"); x.lineWidth = 3; x.beginPath(); x.moveTo(0, 22); x.lineTo(0, -12); x.stroke();
      shape(x, [-6, -12, -4, -20, 0, -14, 4, -20, 6, -12], lg(x, 0, -20, 0, -10, lc, dc), OL);
      const oc = ORB[tr] ?? "#fff";
      ball(x, 0, -19, 9, oc + "66", "rgba(0,0,0,0)"); ball(x, 0, -19, 5.5, "#ffffff", oc, OL);
    }
    x.restore();
  } else if (k0 === "a") {
    const tr = a1, [lc, dc] = ATC[tr] ?? ["#ccc", "#666"];
    if (tr >= 3) ball(x, 24, 24, 22, tr === 4 ? "rgba(255,60,60,0.35)" : "rgba(120,190,255,0.4)", "rgba(0,0,0,0)");
    shape(x, [12, 10, 19, 7, 24, 11, 29, 7, 36, 10, 41, 18, 36, 21, 35, 40, 13, 40, 12, 21, 7, 18], lg(x, 8, 0, 40, 0, lc, dc), OL, 1.5);
    x.strokeStyle = "rgba(0,0,0,0.3)"; x.lineWidth = 1; x.beginPath(); x.moveTo(24, 12); x.lineTo(24, 39); x.stroke();
    if (tr === 1) { x.fillStyle = "rgba(40,40,50,0.35)"; for (let yy = 14; yy < 38; yy += 3) for (let xx = 15 + (yy % 2); xx < 34; xx += 3) x.fillRect(xx, yy, 1.2, 1.2); }
    if (tr >= 2) { for (const [rx, ry] of [[16, 22], [32, 22], [16, 34], [32, 34]] as [number, number][]) ball(x, rx, ry, 1.5, "#ffffff", "#888"); x.fillStyle = "rgba(255,255,255,0.35)"; x.fillRect(15, 14, 6, 2); }
    if (tr === 4) { shape(x, [8, 16, 3, 7, 12, 12], "#e0d0b0", OL); shape(x, [40, 16, 45, 7, 36, 12], "#e0d0b0", OL); ball(x, 24, 26, 3, "#ff8080", "#a01010"); }
    box(x, 13, 30, 22, 3, 1, tr === 0 ? "#5a3a1a" : "#8a6a30");
  } else if (k0 === "p") { paintPot(x, key);
  } else if (k0 === "s") { paintScroll(x, key);
  }
}
function icBadge(x: CanvasRenderingContext2D, t: string, c: string): void { ball(x, 38, 39, 7, mix(c, '#ffffff', 0.35), c, OL); x.fillStyle = '#ffffff'; x.font = 'bold 9px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, 38, 39.5); }
function paintCookie(x: CanvasRenderingContext2D): void {
  x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(24, 41, 15, 3.2, 0, 0, TAU); x.fill();
  glow(x, 24, 24, 21, '#90ff90', 0.3);
  const pts: number[] = []; for (let i = 0; i < 20; i++) { const a = (i / 20) * TAU, r = 15 + (i % 2 ? 0.8 : -0.6); pts.push(24 + Math.cos(a) * r, 25 + Math.sin(a) * r * 0.92); }
  shape(x, pts, lg(x, 10, 10, 38, 40, '#f8d898', '#a8642a'), OL, 1.3);
  x.strokeStyle = 'rgba(120,60,20,0.55)'; x.lineWidth = 1; x.beginPath(); x.ellipse(24, 25, 11.5, 10.5, 0, 0, TAU); x.stroke();
  x.save(); x.translate(24, 24); x.rotate(-0.5);
  shape(x, [0, -9, 5, -3, 4.5, 4, 0, 8, -4.5, 4, -5, -3], lg(x, -5, -9, 5, 8, '#c8ffb0', '#2a8a30'), '#1a4a18', 1);
  seg(x, 0, -7, 0, 7, 'rgba(20,70,20,0.8)', 0.8); seg(x, 0, -2, 3, -4, 'rgba(20,70,20,0.6)', 0.6); seg(x, 0, 2, -3, 0, 'rgba(20,70,20,0.6)', 0.6);
  x.restore();
  for (const [sx, sy] of [[15, 18], [32, 19], [17, 32], [31, 31], [24, 13]] as [number, number][]) { ball(x, sx, sy, 1.3, '#fff8e0', '#d8b070'); }
  x.fillStyle = 'rgba(255,255,255,0.4)'; x.beginPath(); x.ellipse(17, 17, 4, 2, -0.6, 0, TAU); x.fill();
  gStar(x, 9, 9, 2.6, '#c8ffb0'); gStar(x, 40, 13, 2, '#c8ffb0');
  icBadge(x, '精', '#2a8a30');
}
function paintExp(x: CanvasRenderingContext2D, ware: boolean): void {
  x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(24, 42, 16, 3, 0, 0, TAU); x.fill();
  if (ware) {
    box(x, 8, 18, 32, 22, 3, lg(x, 0, 18, 0, 40, '#c8905a', '#5a3418'), OL); shape(x, [8, 20, 10, 10, 38, 10, 40, 20], lg(x, 0, 10, 0, 20, '#e0aa70', '#8a5428'), OL, 1.2);
    for (const xx of [12, 36]) box(x, xx - 1.5, 10, 3, 30, 1, '#c8c8d8', OL);
    box(x, 21, 19, 6, 7, 1.5, lg(x, 0, 19, 0, 26, '#fff0a0', '#a07010'), OL); ball(x, 24, 22.5, 1.2, '#3a2000', '#000');
  } else {
    box(x, 10, 17, 28, 24, 6, lg(x, 0, 17, 0, 41, '#d8a868', '#6a4220'), OL); x.strokeStyle = OL; x.lineWidth = 2.4; x.beginPath(); x.arc(24, 17, 7, Math.PI, TAU); x.stroke(); x.strokeStyle = '#8a5a30'; x.lineWidth = 1.2; x.stroke();
    box(x, 13, 24, 22, 6, 2, lg(x, 0, 24, 0, 30, '#b88048', '#5a3418'), OL); box(x, 21, 25, 6, 4, 1, '#f0cc60', OL);
  }
  ball(x, 36, 12, 7, '#a0ffb0', '#1a8a3a', OL); seg(x, 32.5, 12, 39.5, 12, '#ffffff', 2); seg(x, 36, 8.5, 36, 15.5, '#ffffff', 2);
}
function paintStone(x: CanvasRenderingContext2D): void {
  x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(24, 42, 13, 3, 0, 0, TAU); x.fill();
  glow(x, 24, 25, 21, '#c080ff', 0.45);
  shape(x, [24, 6, 36, 16, 34, 34, 24, 41, 13, 34, 12, 16], lg(x, 12, 6, 36, 41, '#f0d8ff', '#4a1a8a'), OL, 1.3);
  shape(x, [24, 6, 28, 20, 24, 41, 20, 20], 'rgba(255,255,255,0.25)'); shape(x, [12, 16, 20, 20, 24, 41, 13, 34], 'rgba(0,0,0,0.18)');
  seg(x, 20, 20, 28, 20, 'rgba(255,255,255,0.5)', 0.8); gStar(x, 30, 14, 2.4, '#ffffff'); gRays(x, 24, 24, 15, 20, 8, 'rgba(220,180,255,0.5)', 1);
}
function paintPot(x: CanvasRenderingContext2D, key: string, cc?: string[]): void {
  const col = cc ? cc : key === 'pr' ? ['#ffb0a0', '#e02020', '#5a0606'] : key === 'pb' ? ['#c0dcff', '#2060e0', '#081a5a'] : ['#d0ffc0', '#30c040', '#063a10'];
  x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(24, 43, 14, 3, 0, 0, TAU); x.fill();
  glow(x, 24, 30, 20, col[1] ?? '#fff', 0.35);
  const body = (): void => {
    x.beginPath();
    if (key === 'pr') { x.moveTo(20, 13); x.lineTo(20, 18); x.bezierCurveTo(9, 21, 8, 42, 24, 42); x.bezierCurveTo(40, 42, 39, 21, 28, 18); x.lineTo(28, 13); }
    else if (key === 'pb') { x.moveTo(21, 12); x.lineTo(21, 20); x.bezierCurveTo(14, 22, 14, 26, 14, 30); x.lineTo(14, 39); x.quadraticCurveTo(14, 42, 17, 42); x.lineTo(31, 42); x.quadraticCurveTo(34, 42, 34, 39); x.lineTo(34, 30); x.bezierCurveTo(34, 26, 34, 22, 27, 20); x.lineTo(27, 12); }
    else { x.moveTo(21, 13); x.lineTo(21, 19); x.lineTo(10, 38); x.quadraticCurveTo(8, 42, 13, 42); x.lineTo(35, 42); x.quadraticCurveTo(40, 42, 38, 38); x.lineTo(27, 19); x.lineTo(27, 13); }
    x.closePath();
  };
  body(); x.fillStyle = 'rgba(220,240,255,0.28)'; x.fill();
  x.save(); body(); x.clip();
  const lv = key === 'pb' ? 24 : 24;
  const lq = x.createLinearGradient(0, lv, 0, 43); lq.addColorStop(0, col[0] ?? '#fff'); lq.addColorStop(0.35, col[1] ?? '#f00'); lq.addColorStop(1, col[2] ?? '#000');
  x.fillStyle = lq; x.beginPath(); x.moveTo(0, lv); x.quadraticCurveTo(24, lv + 3, 48, lv); x.lineTo(48, 48); x.lineTo(0, 48); x.closePath(); x.fill();
  x.fillStyle = 'rgba(255,255,255,0.5)'; x.beginPath(); x.ellipse(24, lv + 1, 16, 1.6, 0, 0, TAU); x.fill();
  for (const [bx, by, br] of [[19, 34, 1.4], [27, 30, 1], [24, 38, 1.2], [30, 36, 0.9]] as [number, number, number][]) { x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = 0.7; x.beginPath(); x.arc(bx, by, br, 0, TAU); x.stroke(); }
  if (key === 'pg') { x.strokeStyle = 'rgba(255,255,200,0.9)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(26, 27); x.lineTo(21, 34); x.lineTo(26, 34); x.lineTo(21, 41); x.stroke(); }
  x.fillStyle = 'rgba(255,255,255,0.55)'; x.beginPath(); x.ellipse(key === 'pg' ? 18 : 17.5, 30, 2.2, 6, 0.2, 0, TAU); x.fill();
  x.restore();
  body(); x.strokeStyle = '#1a2030'; x.lineWidth = 1.4; x.stroke(); x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 0.6; x.stroke();
  box(x, 19, 11, 10, 3, 1.2, lg(x, 0, 11, 0, 14, '#e8e0d0', '#9a9080'), OL);
  box(x, 20, 5, 8, 7, 1.5, lg(x, 20, 0, 28, 0, '#c8905a', '#6a4020'), OL); seg(x, 22, 6, 22, 11, 'rgba(255,230,190,0.5)', 0.8);
  if (key === 'pr') { x.strokeStyle = '#c8a040'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(20, 15); x.lineTo(28, 15); x.stroke(); }
  if (key === 'pb') { box(x, 18, 31, 12, 7, 1, '#f0e6c8', '#6a5a3a'); gStar(x, 24, 34.5, 2.6, '#4080ff'); }
}
function paintScroll(x: CanvasRenderingContext2D, key: string): void {
  const blessed = key === 'sx' || key === 'sy' || key === 'se3';
  if (blessed) { glow(x, 24, 24, 23, '#ffe060', 0.7); gRays(x, 24, 24, 16, 22, 12, 'rgba(255,240,160,0.6)', 1.2); }
  const seal = key === 'sp' ? ['#d0e8ff', '#2a4a8a'] : key.slice(0, 2) === 'se' ? ['#fff0a0', '#a07010'] : key === 'sr' ? ['#a0d0ff', '#1a4aa0'] : key === 'sw' || key === 'sx' ? ['#ffb0a0', '#a01818'] : ['#b0f0c0', '#1a7a3a'];
  x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(24, 42, 17, 3, 0, 0, TAU); x.fill();
  const tint = ({ sr: ['#eef6ff', '#bcd4f2', '#7a98c8'], sw: ['#fff0ea', '#f2c4b4', '#c07a66'], sa: ['#f0fff0', '#c6eac6', '#7aaa7a'], sx: ['#fff8dc', '#ffd890', '#d09a40'], sy: ['#fffbe6', '#e8f0a0', '#a8b048'], sp: ['#f4f8ff', '#c4d4ea', '#6a7a98'], se1: ['#fbffe8', '#dcefa0', '#90a840'], se2: ['#fff8e0', '#f6dc8c', '#c09a30'], se3: ['#fff0e8', '#ffc8a0', '#d0703a'] } as Record<string, string[]>)[key] ?? ['#fff6dc', '#ead6a4', '#c8a868'];
  const pg = x.createLinearGradient(0, 10, 0, 38); pg.addColorStop(0, tint[0] ?? '#fff6dc'); pg.addColorStop(0.6, tint[1] ?? '#ead6a4'); pg.addColorStop(1, tint[2] ?? '#c8a868');
  shape(x, [11, 12, 37, 12, 37, 36, 11, 36], pg, OL, 1.1);
  for (const yy of [12, 36]) { const rg = x.createLinearGradient(0, yy - 4, 0, yy + 4); rg.addColorStop(0, blessed ? '#fff0b0' : '#f4e4c0'); rg.addColorStop(0.5, blessed ? '#e0b040' : '#c8a870'); rg.addColorStop(1, blessed ? '#8a6010' : '#7a5a30'); box(x, 7, yy - 4, 34, 8, 4, rg, OL); ball(x, 7.5, yy, 2.4, '#6a4020', '#2a1608', OL); ball(x, 40.5, yy, 2.4, '#6a4020', '#2a1608', OL); }
  x.save(); x.translate(24, 24);
  if (key === 'sr') { shape(x, [-7, 1, 0, -6, 7, 1], '#4a6aa8', OL, 0.9); box(x, -5.5, 1, 11, 7, 0.5, '#e8d8b0', OL); box(x, -1.5, 3.5, 3, 4.5, 0.5, '#5a3a1a'); }
  else if (key === 'sp') { shape(x, [-7, -8, 7, -8, 7, 0, 0, 8, -7, 0], lg(x, -7, -8, 7, 8, '#e8f4ff', '#3a5a94'), OL, 0.9); box(x, -3, -3, 6, 5, 1, '#f0cc60', OL); x.strokeStyle = OL; x.lineWidth = 1.2; x.beginPath(); x.arc(0, -3, 2.2, Math.PI, TAU); x.stroke(); }
  else if (key.slice(0, 2) === 'se') { gRays(x, 0, -1, 4, 10, 8, 'rgba(255,200,60,0.7)', 1.2); gStar(x, 0, -1, 7, key === 'se1' ? '#a8d040' : key === 'se2' ? '#f0b020' : '#ff6a30'); x.fillStyle = '#3a2000'; x.font = 'bold 6px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('EXP', 0, -0.5); }
  else if (key === 'sw' || key === 'sx') { x.rotate(Math.PI / 4); shape(x, [-1.6, 4, -1.6, -9, 0, -11, 1.6, -9, 1.6, 4], '#c8ccd8', OL, 0.8); box(x, -4.5, 4, 9, 2, 0.8, '#c8a040', OL); box(x, -0.9, 6, 1.8, 4, 0.4, '#5a3a1a'); }
  else { shape(x, [-7, -8, 7, -8, 7, 0, 0, 8, -7, 0], lg(x, -7, -8, 7, 8, '#d8e0ec', '#5a6a84'), OL, 0.9); box(x, -0.8, -6, 1.6, 11, 0.4, '#c8a040'); box(x, -5, -3, 10, 1.6, 0.4, '#c8a040'); }
  x.restore();
  x.strokeStyle = 'rgba(120,80,30,0.35)'; x.lineWidth = 0.8; for (const yy of [17, 31]) { x.beginPath(); x.moveTo(14, yy); x.lineTo(34, yy); x.stroke(); }
  box(x, 21, 33, 6, 9, 0.5, seal[1] ?? '#800'); shape(x, [21, 42, 24, 39.5, 27, 42], '#c8a868');
  ball(x, 24, 35, 4.6, seal[0] ?? '#fff', seal[1] ?? '#000', '#2a0a0a'); gStar(x, 24, 35, 2.2, seal[1] ?? '#000');
  if (blessed) { gStar(x, 10, 7, 3.2, '#ffd040'); gStar(x, 40, 22, 2.6, '#ffd040'); }
  { const bc = ({ sr: ['#2a5ab0', '回'], sw: ['#b02020', '武'], sa: ['#1a8a3a', '防'], sx: ['#c88a10', '武'], sy: ['#c88a10', '防'], sp: ['#2a4a8a', '保'], se1: ['#6a8a10', '經'], se2: ['#b07a10', '經'], se3: ['#c04010', '經'] } as Record<string, string[]>)[key]; if (bc) { ball(x, 38, 39, 7, blessed ? '#ffe680' : mix(bc[0] ?? '#444', '#ffffff', 0.3), bc[0] ?? '#444', OL); x.fillStyle = blessed ? '#5a3a00' : '#ffffff'; x.font = 'bold 9px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(bc[1] ?? '', 38, 39.5); } }
}
const SKBG = ['#7a3a10', '#6a5418', '#7a1a08', '#0e4a7a', '#6a5a10', '#145a24', '#0e5a4a', '#3a1a6a', '#1a3a6a'];
function skFrame(x: CanvasRenderingContext2D, e: number): void {
  const bg = SKBG[e] ?? '#333344';
  const fr = x.createLinearGradient(0, 0, 48, 48); fr.addColorStop(0, '#fff0b8'); fr.addColorStop(0.35, '#c8a050'); fr.addColorStop(0.7, '#7a5a20'); fr.addColorStop(1, '#e8c878');
  box(x, 1, 1, 46, 46, 6, fr); box(x, 1, 1, 46, 46, 6, 'rgba(0,0,0,0)', '#2a1a08');
  const rg = x.createRadialGradient(24, 22, 2, 24, 26, 30); rg.addColorStop(0, mix(bg, '#ffffff', 0.18)); rg.addColorStop(0.55, bg); rg.addColorStop(1, '#06040a');
  box(x, 4, 4, 40, 40, 4, rg); x.strokeStyle = 'rgba(0,0,0,0.7)'; x.lineWidth = 1; x.stroke();
}
function skGloss(x: CanvasRenderingContext2D): void {
  x.save(); rrect(x, 4, 4, 40, 40, 4); x.clip();
  const g = x.createLinearGradient(0, 4, 0, 24); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(24, 6, 26, 14, 0, 0, TAU); x.fill();
  const v = x.createRadialGradient(24, 24, 14, 24, 24, 30); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)'); x.fillStyle = v; x.fillRect(4, 4, 40, 40);
  x.restore();
}
function glow(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string, a: number): void { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, hexA(c, a)); g.addColorStop(1, hexA(c, 0)); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
function hexA(c: string, a: number): string { const h = c.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((q: string) => q + q).join('') : h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
function gSword(x: CanvasRenderingContext2D, cx: number, cy: number, ang: number, L: number, bl0: string, bl1: string, gd: string): void {
  x.save(); x.translate(cx, cy); x.rotate(ang);
  shape(x, [-2.6, 6, -2.6, -L, 0, -L - 5, 2.6, -L, 2.6, 6], lg(x, -3, 0, 3, 0, bl0, bl1), OL, 1.1);
  seg(x, 0, 4, 0, -L - 2, 'rgba(255,255,255,0.7)', 0.8);
  box(x, -8, 6, 16, 3.4, 1.5, lg(x, 0, 6, 0, 10, '#fff0a0', gd), OL); box(x, -1.6, 9.4, 3.2, 7, 1, '#4a2a14', OL); ball(x, 0, 18, 2.6, '#fff0a0', gd, OL);
  x.restore();
}
function gArrow(x: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, head: string, fl: string): void {
  seg(x, x0, y0, x1, y1, OL, 3); seg(x, x0, y0, x1, y1, '#e8d0a0', 1.4);
  const a = Math.atan2(y1 - y0, x1 - x0), c = Math.cos(a), s = Math.sin(a);
  shape(x, [x1 + c * 6, y1 + s * 6, x1 - s * 3, y1 + c * 3, x1 + s * 3, y1 - c * 3], head, OL, 0.9);
  for (const k of [0, 3]) shape(x, [x0 + c * k, y0 + s * k, x0 + c * (k + 4) - s * 3, y0 + s * (k + 4) + c * 3, x0 + c * (k + 4) + s * 3, y0 + s * (k + 4) - c * 3], fl, OL, 0.6);
}
function gFlame(x: CanvasRenderingContext2D, cx: number, cy: number, s: number, outer: string, inner: string): void {
  x.beginPath(); x.moveTo(cx, cy - s * 1.3); x.bezierCurveTo(cx + s * 0.9, cy - s * 0.4, cx + s * 0.9, cy + s * 0.7, cx, cy + s * 0.75); x.bezierCurveTo(cx - s * 0.9, cy + s * 0.7, cx - s * 0.8, cy - s * 0.1, cx - s * 0.35, cy - s * 0.5); x.bezierCurveTo(cx - s * 0.3, cy - s * 0.1, cx - s * 0.1, cy, cx, cy - s * 1.3); x.closePath();
  x.fillStyle = lg(x, 0, cy - s * 1.3, 0, cy + s * 0.8, '#ffe070', outer); x.fill(); x.strokeStyle = 'rgba(80,10,0,0.7)'; x.lineWidth = 1; x.stroke();
  x.beginPath(); x.moveTo(cx, cy - s * 0.5); x.bezierCurveTo(cx + s * 0.45, cy, cx + s * 0.4, cy + s * 0.55, cx, cy + s * 0.6); x.bezierCurveTo(cx - s * 0.4, cy + s * 0.55, cx - s * 0.4, cy + s * 0.05, cx, cy - s * 0.5); x.fillStyle = inner; x.fill();
}
function gBolt(x: CanvasRenderingContext2D, pts: number[], c: string): void { glowPath(x, pts, c); shape(x, pts, lg(x, 0, 4, 0, 44, '#ffffff', c), OL, 1); }
function glowPath(x: CanvasRenderingContext2D, pts: number[], c: string): void { x.save(); x.shadowColor = c; x.shadowBlur = 8; shape(x, pts, hexA(c, 0.5)); x.restore(); }
function gShield(x: CanvasRenderingContext2D, cx: number, cy: number, s: number, c0: string, c1: string, rim: string): void {
  const p = [cx - s, cy - s * 1.05, cx + s, cy - s * 1.05, cx + s, cy + s * 0.15, cx, cy + s * 1.2, cx - s, cy + s * 0.15];
  shape(x, p, lg(x, cx - s, cy - s, cx + s, cy + s, c0, c1), OL, 1.4);
  x.strokeStyle = rim; x.lineWidth = 2; x.beginPath(); x.moveTo(cx - s + 2.5, cy - s + 1.5); x.lineTo(cx + s - 2.5, cy - s + 1.5); x.lineTo(cx + s - 2.5, cy + s * 0.12); x.lineTo(cx, cy + s * 1.08); x.lineTo(cx - s + 2.5, cy + s * 0.12); x.closePath(); x.stroke();
  shape(x, [cx - s + 3, cy - s + 3, cx - 1, cy - s + 3, cx - 1, cy + s * 0.9, cx - s + 3, cy + s * 0.1], 'rgba(255,255,255,0.14)');
}
function gIce(x: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, ang: number): void {
  x.save(); x.translate(cx, cy); x.rotate(ang); shape(x, [0, -h, w, -h * 0.3, w * 0.6, h, -w * 0.6, h, -w, -h * 0.3], lg(x, -w, -h, w, h, '#ffffff', '#3a9ae0'), '#0a2a5a', 1); seg(x, 0, -h + 1, 0, h - 1, 'rgba(255,255,255,0.7)', 0.8); x.restore();
}
function gStar(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string): void { const p: number[] = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; p.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } shape(x, p, lg(x, 0, cy - r, 0, cy + r, '#ffffff', c), OL, 0.8); }
function gSwirl(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string, w: number, turns: number): void { x.strokeStyle = c; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); for (let t = 0; t <= 1; t += 0.02) { const a = t * TAU * turns, rr = r * (1 - t * 0.85); const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr; if (t === 0) x.moveTo(px, py); else x.lineTo(px, py); } x.stroke(); x.lineCap = 'butt'; }
function gRays(x: CanvasRenderingContext2D, cx: number, cy: number, r0: number, r1: number, n: number, c: string, w: number): void { for (let i = 0; i < n; i++) { const a = (i / n) * TAU; seg(x, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, c, w); } }
function gBow(x: CanvasRenderingContext2D, cx: number, cy: number, s: number, wood: string): void {
  x.strokeStyle = OL; x.lineWidth = 4.4; x.beginPath(); x.moveTo(cx - s * 0.3, cy - s); x.quadraticCurveTo(cx + s * 0.9, cy, cx - s * 0.3, cy + s); x.stroke();
  x.strokeStyle = lg(x, 0, cy - s, 0, cy + s, mix(wood, '#ffffff', 0.4), wood); x.lineWidth = 2.6; x.stroke();
  seg(x, cx - s * 0.3, cy - s, cx - s * 0.3, cy + s, '#f4f4f4', 0.8); box(x, cx + s * 0.22, cy - 3, 4, 6, 1, '#5a3418', OL);
}
function paintSk(x: CanvasRenderingContext2D, id: number): void {
  const s = SK[id];
  if (!s) return;
  const e = s.e, c = SKC[e] ?? '#ffffff', n = s.n;
  skFrame(x, e);
  x.save(); rrect(x, 4, 4, 40, 40, 4); x.clip();
  glow(x, 24, 24, 20, c, 0.35);
  switch (n) {
    case '猛擊': gRays(x, 33, 15, 4, 13, 10, '#ffe0a0', 1.6); gStar(x, 33, 15, 7, '#ff9a30'); gSword(x, 20, 28, Math.PI / 4, 18, '#ffffff', '#8a96a6', '#b08020'); break;
    case '堅韌護甲': { shape(x, [12, 12, 19, 9, 24, 13, 29, 9, 36, 12, 40, 20, 35, 22, 34, 40, 14, 40, 13, 22, 8, 20], lg(x, 8, 9, 40, 40, '#fff4c0', '#a07018'), OL, 1.3); seg(x, 24, 14, 24, 39, 'rgba(80,50,10,0.6)', 1); for (const yy of [26, 32]) seg(x, 15, yy, 33, yy, 'rgba(80,50,10,0.45)', 1); ball(x, 24, 21, 2.5, '#ffffff', '#40a0ff', OL); break; }
    case '狂暴': { glow(x, 24, 26, 20, '#ff2000', 0.6); for (const [fx, fs] of [[14, 7], [34, 7], [24, 9]] as [number, number][]) gFlame(x, fx, 30 - fs * 0.6, fs, '#e02000', '#ffd060'); shape(x, [14, 30, 15, 18, 24, 13, 33, 18, 34, 30, 30, 36, 18, 36], lg(x, 14, 13, 34, 36, '#8a8a96', '#2a2a34'), OL, 1.2); shape(x, [15, 20, 8, 10, 12, 22], '#e8dcc0', OL, 0.8); shape(x, [33, 20, 40, 10, 36, 22], '#e8dcc0', OL, 0.8); shape(x, [17, 25, 22, 26, 22, 28, 17, 27], '#ff3020'); shape(x, [31, 25, 26, 26, 26, 28, 31, 27], '#ff3020'); seg(x, 24, 18, 24, 34, 'rgba(0,0,0,0.5)', 1); break; }
    case '衝擊之暈': { x.strokeStyle = 'rgba(255,240,150,0.7)'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(24, 16, 15, 5, 0, 0, TAU); x.stroke(); for (const [sx, sy] of [[10, 16], [24, 11], [37, 18]] as [number, number][]) gStar(x, sx, sy, 4.6, '#ffc020'); x.save(); x.translate(24, 32); x.rotate(-0.5); box(x, -2, -4, 4, 16, 1, '#6a4020', OL); box(x, -9, -11, 18, 9, 2, lg(x, 0, -11, 0, -2, '#e0e4ec', '#6a7080'), OL); x.restore(); break; }
    case '旋風斬': { for (let k = 0; k < 3; k++) { x.strokeStyle = `rgba(255,${200 - k * 30},120,${0.85 - k * 0.2})`; x.lineWidth = 2.6 - k * 0.6; x.beginPath(); x.arc(24, 24, 16 - k * 4, k * 1.2, k * 1.2 + Math.PI * 1.4); x.stroke(); } gSword(x, 24, 26, -Math.PI * 0.3, 15, '#ffffff', '#8a96a6', '#b08020'); break; }
    case '堅守': gShield(x, 24, 22, 13, '#d8e4f4', '#506488', '#e8c860'); box(x, 22, 13, 4, 20, 1, '#c8a040', OL); box(x, 16, 19, 16, 4, 1, '#c8a040', OL); break;
    case '三連箭': for (const o of [-7, 0, 7]) gArrow(x, 10 + o, 38 - o * 0.2 + (o === 0 ? 0 : 2), 34 + o, 12 + (o === 0 ? 0 : 2) - o * 0.2, '#e0e8f0', '#f0f0f0'); break;
    case '風之疾走': { for (const yy of [16, 22, 28]) seg(x, 6, yy, 14, yy, 'rgba(200,255,230,0.8)', 1.4); shape(x, [17, 10, 27, 10, 27, 28, 38, 31, 38, 38, 15, 38, 15, 30], lg(x, 15, 10, 38, 38, '#a8784a', '#4a2a14'), OL, 1.2); box(x, 15, 35, 23, 4, 1.5, '#2a1a0a'); shape(x, [27, 15, 42, 8, 38, 15, 44, 16, 36, 21, 27, 21], lg(x, 27, 8, 44, 21, '#ffffff', '#7ae0c0'), OL, 1); seg(x, 30, 15, 39, 11, 'rgba(40,120,100,0.5)', 0.8); break; }
    case '火焰箭': { for (let k = 0; k < 4; k++) gFlame(x, 12 + k * 4, 34 - k * 4, 4.5 - k * 0.6, '#e03010', '#ffe080'); gArrow(x, 10, 38, 36, 12, '#ff9030', '#ffd060'); glow(x, 37, 11, 8, '#ffb040', 0.8); break; }
    case '大地屏障': { for (let k = 0; k < 4; k++) { const bx0 = 8 + k * 8.5, h = 18 + (k % 2) * 6; shape(x, [bx0, 40, bx0 + 1, 40 - h, bx0 + 4.5, 36 - h - 3, bx0 + 8, 40 - h, bx0 + 9, 40], lg(x, bx0, 40 - h, bx0 + 9, 40, '#c8a070', '#5a3a1a'), OL, 1); seg(x, bx0 + 3, 38 - h * 0.5, bx0 + 6, 36 - h * 0.3, 'rgba(40,20,0,0.5)', 0.8); } box(x, 5, 38, 38, 5, 1, '#3a2a14'); break; }
    case '冰霜之箭': { for (let k = 0; k < 6; k++) gStar(x, 12 + k * 3.5, 34 - k * 3.6 + (k % 2) * 4, 1.8, '#a0e0ff'); gArrow(x, 10, 38, 33, 15, '#c0f0ff', '#e0f8ff'); gIce(x, 35, 13, 4, 7, Math.PI / 4); break; }
    case '箭雨': { x.fillStyle = 'rgba(160,200,230,0.25)'; x.fillRect(4, 4, 40, 8); for (let k = 0; k < 7; k++) { const ax = 9 + k * 5, ay = 8 + (k % 3) * 6; gArrow(x, ax + 4, ay - 4, ax - 2, ay + 18, '#e0e8f0', '#f0f0f0'); } box(x, 4, 38, 40, 6, 0, '#3a4a2a'); break; }
    case '生命之泉': { box(x, 10, 34, 28, 6, 3, lg(x, 0, 34, 0, 40, '#d8d0c0', '#6a6458'), OL); shape(x, [12, 34, 36, 34, 32, 28, 16, 28], '#4ab0c8', OL, 0.8); x.beginPath(); x.moveTo(24, 7); x.bezierCurveTo(33, 18, 33, 27, 24, 27); x.bezierCurveTo(15, 27, 15, 18, 24, 7); x.fillStyle = lg(x, 0, 7, 0, 27, '#e0fff0', '#20b060'); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.1; x.stroke(); ball(x, 21, 18, 2.6, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'); gStar(x, 34, 12, 3, '#a0ffc0'); gStar(x, 13, 15, 2.4, '#a0ffc0'); break; }
    case '治癒術': { glow(x, 24, 24, 18, '#80ff90', 0.6); box(x, 19.5, 8, 9, 32, 2, lg(x, 0, 8, 0, 40, '#f0fff0', '#30b050'), OL); box(x, 8, 19.5, 32, 9, 2, lg(x, 0, 19, 0, 29, '#f0fff0', '#30b050'), OL); box(x, 20.5, 20.5, 7, 7, 1, '#e8fff0'); for (const [px, py] of [[11, 11], [37, 12], [36, 37]] as [number, number][]) gStar(x, px, py, 2.6, '#c0ffd0'); break; }
    case '光箭': { glowPath(x, [8, 40, 36, 12, 38, 14, 10, 42], '#fff6a0'); seg(x, 8, 40, 36, 12, '#fffbe0', 3); shape(x, [42, 6, 32, 11, 37, 16], '#ffffff', '#c8a020', 0.8); gRays(x, 39, 9, 3, 8, 8, '#fff0a0', 1); break; }
    case '日光術': { gRays(x, 24, 24, 10, 19, 12, '#ffe060', 2.2); ball(x, 24, 24, 10, '#ffffff', '#ffc020', '#a06010'); ball(x, 21, 21, 3, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'); break; }
    case '保護罩': { const g0 = x.createRadialGradient(20, 18, 2, 24, 24, 17); g0.addColorStop(0, 'rgba(255,255,255,0.7)'); g0.addColorStop(0.7, 'rgba(120,190,255,0.35)'); g0.addColorStop(1, 'rgba(60,140,255,0.8)'); x.fillStyle = g0; x.beginPath(); x.arc(24, 25, 16, 0, TAU); x.fill(); x.strokeStyle = '#d0f0ff'; x.lineWidth = 1.4; x.stroke(); x.strokeStyle = 'rgba(220,240,255,0.5)'; x.lineWidth = 0.8; for (let k = -1; k <= 1; k++) { x.beginPath(); x.ellipse(24, 25, 16, 6 + Math.abs(k) * 4, 0, 0, TAU); x.stroke(); } shape(x, [24, 18, 28, 26, 26, 34, 22, 34, 20, 26], '#2a3a6a', OL, 0.8); ball(x, 24, 17, 3, '#e8d0b0', '#8a6040', OL); break; }
    case '火球術': { for (let k = 0; k < 3; k++) { x.fillStyle = `rgba(255,${120 + k * 40},40,${0.5 - k * 0.12})`; x.beginPath(); x.ellipse(16 - k * 4, 32 + k * 4, 9 - k * 2, 5 - k, -0.8, 0, TAU); x.fill(); } glow(x, 28, 20, 16, '#ff6020', 0.8); ball(x, 28, 20, 10, '#fff4a0', '#e03000', '#6a1000'); ball(x, 25, 17, 4, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'); break; }
    case '加速術': { for (const yy of [14, 22, 30]) seg(x, 6, yy, 13, yy, 'rgba(255,245,170,0.9)', 1.5); shape(x, [16, 8, 36, 8, 28, 24, 36, 40, 16, 40, 24, 24], lg(x, 16, 8, 36, 40, '#fff6c0', '#c89030'), OL, 1.3); shape(x, [19, 37, 33, 37, 26, 30], '#ffd040'); shape(x, [20, 11, 32, 11, 26, 19], 'rgba(255,220,80,0.7)'); box(x, 14, 6, 24, 3, 1, '#6a4020', OL); box(x, 14, 39, 24, 3, 1, '#6a4020', OL); break; }
    case '冰錐術': { box(x, 4, 38, 40, 6, 0, '#bfe4ff'); gIce(x, 24, 24, 6, 15, 0); gIce(x, 13, 30, 4, 10, -0.35); gIce(x, 35, 30, 4, 10, 0.35); break; }
    case '瞬間移動': { glow(x, 24, 24, 20, '#c080ff', 0.7); for (let k = 0; k < 3; k++) gSwirl(x, 24, 24, 17 - k * 2, ['#f0d0ff', '#b070ff', '#6030c0'][k] ?? '#fff', 2.2 - k * 0.4, 1.6 + k * 0.2); ball(x, 24, 24, 3.5, '#ffffff', '#c080ff'); for (const [px, py] of [[10, 12], [38, 10], [38, 36]] as [number, number][]) gStar(x, px, py, 2.4, '#e0c0ff'); break; }
    case '落雷': { for (const [cx2, cy2, r2] of [[16, 13, 7], [25, 10, 9], [34, 13, 7]] as [number, number, number][]) ball(x, cx2, cy2, r2, '#a0a8c0', '#3a3e58'); x.fillStyle = '#3a3e58'; x.fillRect(10, 13, 30, 6); gBolt(x, [27, 17, 18, 31, 24, 31, 17, 44, 33, 26, 26, 26, 31, 17], '#ffe040'); break; }
    case '召喚術': { x.strokeStyle = '#c8a0ff'; x.lineWidth = 1.6; x.beginPath(); x.arc(24, 24, 16, 0, TAU); x.stroke(); x.beginPath(); for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * (TAU * 2 / 5); const px = 24 + Math.cos(a) * 15, py = 24 + Math.sin(a) * 15; if (i === 0) x.moveTo(px, py); else x.lineTo(px, py); } x.strokeStyle = '#f0e0ff'; x.lineWidth = 1.4; x.stroke(); glow(x, 24, 24, 10, '#e0c0ff', 0.9); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * (TAU / 5); ball(x, 24 + Math.cos(a) * 16, 24 + Math.sin(a) * 16, 2, '#ffffff', '#a060ff'); } break; }
    case '反擊屏障': { for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; shape(x, [24 + Math.cos(a) * 14, 24 + Math.sin(a) * 14, 24 + Math.cos(a + 0.18) * 20, 24 + Math.sin(a + 0.18) * 20, 24 + Math.cos(a + 0.3) * 13, 24 + Math.sin(a + 0.3) * 13], '#ffb040', OL, 0.6); } gShield(x, 24, 22, 11, '#ffcf80', '#a04010', '#ffe8a0'); gArrow(x, 18, 28, 30, 16, '#ffffff', '#ffd0a0'); break; }
    case '增幅防禦': { gShield(x, 22, 23, 12, '#c8d4e8', '#3a4a6a', '#c0a050'); shape(x, [36, 8, 43, 17, 39, 17, 39, 26, 33, 26, 33, 17, 29, 17], lg(x, 0, 8, 0, 26, '#c0ffc0', '#20a040'), OL, 1); break; }
    case '風之神射': { gSwirl(x, 24, 24, 18, 'rgba(160,255,210,0.7)', 1.6, 1.3); gBow(x, 20, 24, 16, '#8a5a2a'); gArrow(x, 12, 24, 40, 24, '#e0fff0', '#a0ffd0'); glow(x, 41, 24, 6, '#a0ffd0', 0.9); break; }
    case '火焰武器': { gSword(x, 24, 26, Math.PI / 4, 18, '#fff0d0', '#c06030', '#b08020'); x.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) gFlame(x, 14 + k * 5.5, 24 - k * 5 + 3, 4.2, 'rgba(255,60,0,0.6)', 'rgba(255,220,100,0.6)'); x.globalCompositeOperation = 'source-over'; break; }
    case '精準目標': { x.strokeStyle = '#ff5040'; x.lineWidth = 2; x.beginPath(); x.arc(24, 24, 14, 0, TAU); x.stroke(); x.beginPath(); x.arc(24, 24, 7, 0, TAU); x.stroke(); for (const [a, b, c2, d] of [[24, 5, 24, 15], [24, 33, 24, 43], [5, 24, 15, 24], [33, 24, 43, 24]] as [number, number, number, number][]) seg(x, a, b, c2, d, '#ffd0c0', 1.8); ball(x, 24, 24, 2.6, '#ffffff', '#ff2010'); break; }
    case '召喚屬性精靈': { for (const [px, py, cc] of [[11, 12, '#ff6030'], [37, 12, '#40a0ff'], [11, 36, '#60d060'], [37, 36, '#e0e0ff']] as [number, number, string][]) { glow(x, px, py, 6, cc, 0.8); ball(x, px, py, 3, '#ffffff', cc); } glow(x, 24, 24, 14, '#c0a0ff', 0.7); x.beginPath(); x.moveTo(24, 12); x.bezierCurveTo(33, 16, 32, 30, 24, 36); x.bezierCurveTo(20, 32, 15, 30, 17, 22); x.bezierCurveTo(18, 17, 21, 14, 24, 12); x.fillStyle = lg(x, 0, 12, 0, 36, '#ffffff', '#9070e0'); x.fill(); ball(x, 22, 22, 1.4, '#20103a', '#20103a'); ball(x, 27, 22, 1.4, '#20103a', '#20103a'); break; }
    case '魔法屏障': { const hx: number[] = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * TAU) / 6; hx.push(24 + Math.cos(a) * 17, 24 + Math.sin(a) * 17); } shape(x, hx, 'rgba(160,110,255,0.35)', '#e0c8ff', 1.8); const hx2: number[] = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * TAU) / 6; hx2.push(24 + Math.cos(a) * 10, 24 + Math.sin(a) * 10); } shape(x, hx2, 'rgba(200,170,255,0.4)', '#f0e0ff', 1); x.font = 'bold 11px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff'; x.fillText('✦', 24, 24); break; }
    case '冰矛': { glow(x, 24, 24, 18, '#80d0ff', 0.5); x.save(); x.translate(24, 24); x.rotate(Math.PI / 4); box(x, -1.5, -6, 3, 26, 1, '#6a8aa8', OL); shape(x, [0, -22, 5, -8, 0, -4, -5, -8], lg(x, -5, -22, 5, -4, '#ffffff', '#40a0e0'), '#0a2a5a', 1); x.restore(); for (const [px, py] of [[12, 14], [34, 34], [14, 36]] as [number, number][]) gStar(x, px, py, 2.2, '#c0f0ff'); break; }
    case '龍捲風': { for (let k = 0; k < 6; k++) { const yy = 9 + k * 5.4, w = 16 - k * 2.3; x.strokeStyle = `rgba(210,255,240,${0.9 - k * 0.08})`; x.lineWidth = 2.2; x.beginPath(); x.ellipse(24 + Math.sin(k) * 2, yy, w, 2.6, 0, 0, TAU); x.stroke(); } for (const [px, py] of [[10, 24], [38, 20], [36, 34]] as [number, number][]) box(x, px, py, 3, 2, 0.5, '#6a8a4a'); break; }
    case '聖結界': { x.fillStyle = 'rgba(255,240,170,0.25)'; x.fillRect(16, 4, 16, 36); glow(x, 24, 34, 18, '#fff0a0', 0.8); x.strokeStyle = '#ffe080'; x.lineWidth = 1.8; x.beginPath(); x.ellipse(24, 36, 17, 5.5, 0, 0, TAU); x.stroke(); box(x, 22.3, 9, 3.4, 22, 1, lg(x, 0, 9, 0, 31, '#ffffff', '#e0b030'), OL); box(x, 16, 14, 16, 3.4, 1, lg(x, 0, 14, 0, 17, '#ffffff', '#e0b030'), OL); break; }
    case '隕石': { for (let k = 0; k < 5; k++) { x.fillStyle = `rgba(255,${90 + k * 30},30,${0.55 - k * 0.09})`; x.beginPath(); x.ellipse(30 - k * 4.2, 12 - k * 1.5, 9 - k, 5 - k * 0.6, -0.65, 0, TAU); x.fill(); } ball(x, 20, 28, 9, '#d08050', '#3a1a10', OL); for (const [px, py] of [[17, 26], [23, 31], [21, 24]] as [number, number][]) ball(x, px, py, 1.6, '#ffb040', '#ff5000'); box(x, 4, 40, 40, 4, 0, 'rgba(255,90,20,0.6)'); break; }
    case '戰鬥意志': { box(x, 12, 6, 2.6, 36, 1, '#6a4020', OL); ball(x, 13.3, 6, 2.2, '#ffe080', '#a07010', OL); shape(x, [14.5, 8, 38, 10, 33, 17, 38, 24, 14.5, 26], lg(x, 14, 8, 38, 26, '#ff6040', '#8a1008'), OL, 1); gSword(x, 24, 18, Math.PI / 4, 6, '#ffffff', '#a0a8b8', '#c8a040'); break; }
    case '重甲精通': { shape(x, [12, 34, 12, 16, 16, 9, 24, 7, 32, 9, 36, 16, 36, 34, 30, 40, 18, 40], lg(x, 12, 7, 36, 40, '#e8ecf4', '#4a5260'), OL, 1.3); box(x, 15, 20, 18, 3, 1, '#14161c'); for (let k = 0; k < 4; k++) box(x, 17 + k * 4, 26, 1.6, 7, 0.5, '#14161c'); seg(x, 24, 8, 24, 19, 'rgba(255,255,255,0.5)', 1.2); shape(x, [24, 7, 22, 2, 26, 2], '#c03020', OL, 0.6); break; }
    case '鷹眼': { x.beginPath(); x.moveTo(5, 24); x.quadraticCurveTo(24, 6, 43, 24); x.quadraticCurveTo(24, 42, 5, 24); x.fillStyle = '#f4f0e0'; x.fill(); x.strokeStyle = OL; x.lineWidth = 1.4; x.stroke(); ball(x, 24, 24, 8.5, '#ffe080', '#c06010', OL); ball(x, 24, 24, 3.6, '#000000', '#000000'); ball(x, 21.5, 21.5, 1.8, '#ffffff', 'rgba(255,255,255,0.4)'); seg(x, 8, 15, 15, 18, '#3a2a14', 1.6); seg(x, 40, 15, 33, 18, '#3a2a14', 1.6); break; }
    case '弓術精通': { gBow(x, 18, 24, 17, '#a06a30'); gStar(x, 34, 14, 7, '#ffd040'); gArrow(x, 12, 36, 36, 28, '#e0e8f0', '#f0f0f0'); break; }
    case '魔力增幅': { glow(x, 22, 26, 16, '#6aa0ff', 0.8); ball(x, 22, 27, 11, '#e0f0ff', '#2050c0', '#0a1a50'); ball(x, 19, 23, 3.4, 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0)'); for (const ax of [35, 41]) shape(x, [ax, 6, ax + 4, 12, ax + 1.6, 12, ax + 1.6, 18, ax - 1.6, 18, ax - 1.6, 12, ax - 4, 12], '#a0ffb0', OL, 0.6); break; }
    case '魔力精通': { glow(x, 24, 20, 16, '#80a0ff', 0.8); shape(x, [24, 18, 8, 14, 8, 36, 24, 40], lg(x, 8, 14, 24, 40, '#fff8e8', '#c8b890'), OL, 1); shape(x, [24, 18, 40, 14, 40, 36, 24, 40], lg(x, 24, 14, 40, 40, '#fff8e8', '#c8b890'), OL, 1); for (let k = 0; k < 3; k++) { seg(x, 11, 21 + k * 5, 21, 22.5 + k * 5, 'rgba(60,80,180,0.7)', 1); seg(x, 27, 22.5 + k * 5, 37, 21 + k * 5, 'rgba(60,80,180,0.7)', 1); } gStar(x, 24, 10, 5, '#80b0ff'); break; }
    case '審判之劍': { x.fillStyle = 'rgba(255,250,200,0.3)'; x.beginPath(); x.moveTo(18, 4); x.lineTo(30, 4); x.lineTo(40, 44); x.lineTo(8, 44); x.closePath(); x.fill(); gRays(x, 24, 36, 6, 14, 10, 'rgba(255,240,170,0.8)', 1.2); x.save(); x.translate(24, 18); x.rotate(Math.PI); gSword(x, 0, 0, 0, 18, '#ffffff', '#c0a040', '#fff0a0'); x.restore(); break; }
    case '暴風三連矢': { gSwirl(x, 24, 24, 19, 'rgba(120,255,220,0.65)', 2, 1.1); for (const o of [-6, 0, 6]) gArrow(x, 9, 30 + o, 37, 18 + o, '#d0fff0', '#80ffd0'); break; }
    case '冰雪暴': { glow(x, 24, 24, 20, '#c0e8ff', 0.6); gSwirl(x, 24, 24, 18, 'rgba(220,245,255,0.75)', 2, 1.4); const flake = (fx: number, fy: number, r: number): void => { for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI; seg(x, fx - Math.cos(a) * r, fy - Math.sin(a) * r, fx + Math.cos(a) * r, fy + Math.sin(a) * r, '#ffffff', 1.2); } }; flake(24, 24, 7); flake(12, 13, 3.5); flake(36, 15, 3.5); flake(14, 36, 3); flake(35, 35, 3.5); break; }
    default: { gStar(x, 24, 24, 12, c); }
  }
  x.restore();
  skGloss(x);
  if (s.k >= 11) { box(x, 4, 4, 13, 10, 3, s.k === 12 ? 'rgba(40,110,50,0.92)' : 'rgba(110,50,150,0.92)', '#e8d8a0'); x.font = 'bold 8px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff'; x.fillText(s.k === 12 ? '被' : '切', 10.5, 9.2); }
}
function paintBook(x: CanvasRenderingContext2D): void {
  ball(x, 24, 24, 22, 'rgba(200,160,255,0.45)', 'rgba(0,0,0,0)');
  box(x, 10, 8, 28, 34, 3, lg(x, 10, 0, 38, 0, '#8a4ad0', '#3a1a70'), OL);
  box(x, 34, 9, 5, 32, 1.5, '#f4ecd8', OL);
  box(x, 10, 8, 5, 34, 2, '#2a1050');
  shape(x, [25, 14, 27.5, 21, 35, 21, 29, 25.5, 31, 33, 25, 28.5, 19, 33, 21, 25.5, 15, 21, 22.5, 21], '#ffe080', OL, 0.8);
}
const SPC: Record<string, string> = { v: '#ff3048', f: '#ff8a20', c: '#ffe040', s: '#60ff90', m: '#4a8aff', h: '#ff6a8a', r: '#f0f4ff', d: '#b070ff' };
function has(n: string, ks: string): boolean { return ks.split(' ').some((k: string) => n.indexOf(k) >= 0); }
function mat(d: IDef): [string, string] {
  const n = d.n;
  if (has(n, '死亡騎士')) return ['#c05058', '#200810'];
  if (has(n, '安塔瑞斯 巴拉卡斯')) return ['#ffe080', '#a04010'];
  if (has(n, '黑暗 黑色')) return ['#7a6a9a', '#1a1028'];
  if (has(n, '秘銀 冰')) return ['#d6ecff', '#4a8ad6'];
  if (has(n, '精靈 妖精 疾風 狂風')) return ['#c0f0b0', '#3a8a4a'];
  if (has(n, '魔王 炎魔 惡魔 紅 吸血 生命')) return ['#ff9a80', '#8a1018'];
  if (has(n, '銅')) return ['#f0b080', '#8a4a20'];
  if (has(n, '白')) return ['#ffffff', '#a8b0bc'];
  if (has(n, '皮 木 布 獵人 橡木')) return ['#d09a62', '#6a4224'];
  if (has(n, '藍 瑪那 魔力 魔法 智 賢者 水晶')) return ['#b0c8ff', '#3a4ab0'];
  if (has(n, '王 神聖 龍 泰坦 巨人 勇氣')) return ['#fff0a0', '#b07a10'];
  return TIERC[Math.min(4, d.t)] ?? ['#dddddd', '#888888'];
}
function gemCol(d: IDef, b: number): string {
  const s = d.sp.charAt(0);
  if (s) return SPC[s] ?? '#ffffff';
  const k = d.st.findIndex((v: number) => v > 0);
  if (k >= 0) return ['#ff5040', '#50e070', '#ffa040', '#5090ff', '#60e0ff'][k] ?? '#ffffff';
  if (d.hp) return '#ff6a8a';
  if (d.mp) return '#4a8aff';
  return ['#e0e8f0', '#ffd860', '#a0e0ff', '#ffa0d0'][b % 4] ?? '#ffffff';
}
function gem(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string): void { ball(x, cx, cy, r * 2, c + '55', 'rgba(0,0,0,0)'); ball(x, cx, cy, r, '#ffffff', c, OL); }
function tint(x: CanvasRenderingContext2D, c: string, a: number): void { x.save(); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = a; x.fillStyle = c; x.fillRect(0, 0, 48, 48); x.restore(); }
const TBG = ['#3a3a40', '#3a3a40', '#1e3448', '#1e3448', '#4a3010', '#4a3010', '#3a1450'];
function gearSlot(x: CanvasRenderingContext2D, b: number): void {
  const d = IT[b]; if (!d) return;
  const t = clamp(d.t, 0, 6), tc = TBG[t] ?? '#333', leg = t >= 6, hi = t >= 4;
  const fr = x.createLinearGradient(0, 0, 0, 48); fr.addColorStop(0, '#6a5a44'); fr.addColorStop(0.5, '#2a2218'); fr.addColorStop(1, '#4a3e2e');
  box(x, 1, 1, 46, 46, 5, fr, '#0e0a06');
  const rg = x.createRadialGradient(24, 22, 3, 24, 26, 30); rg.addColorStop(0, mix(tc, '#ffffff', 0.12)); rg.addColorStop(0.6, tc); rg.addColorStop(1, '#08070a');
  box(x, 3.5, 3.5, 41, 41, 3, rg); x.strokeStyle = 'rgba(0,0,0,0.8)'; x.lineWidth = 1; x.stroke();
  seg(x, 4, 4.5, 44, 4.5, 'rgba(255,255,255,0.12)', 1);
  if (leg) { glow(x, 24, 24, 22, '#d080ff', 0.45); gRays(x, 24, 24, 14, 22, 12, 'rgba(255,210,120,0.25)', 1.2); } else if (hi) glow(x, 24, 24, 20, '#ffb040', 0.3);
  const r0 = mk(96, 96);
  if (r0) { r0[1].scale(2, 2); paintGear(r0[1], b); x.save(); x.shadowColor = 'rgba(0,0,0,0.75)'; x.shadowBlur = 3; x.shadowOffsetY = 1.5; x.drawImage(r0[0], 4, 4, 40, 40); x.restore(); }
  const pc = leg ? '#ffd040' : hi ? '#ffb040' : t >= 2 ? '#80c0ff' : '#c8c8c8', np = leg ? 4 : hi ? 3 : t >= 2 ? 2 : 1;
  for (let i = 0; i < np; i++) { const px = 8 + i * 5, py = 41; shape(x, [px, py - 2.6, px + 2.2, py, px, py + 2.6, px - 2.2, py], pc, 'rgba(0,0,0,0.8)', 0.6); }
  if (leg) { box(x, 33, 3.5, 11, 8, 2, 'rgba(60,10,80,0.9)', '#ffd040'); x.font = 'bold 7px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffe080'; x.fillText('傳', 38.5, 7.8); }
}
function paintGear(x: CanvasRenderingContext2D, b: number): void {
  const d = IT[b];
  if (!d) return;
  const [lc, dc] = mat(d), gc = gemCol(d, b), v = b % 3, gr = lg(x, 8, 6, 40, 42, lc, dc), s = d.s;
  if (s === 0 && d.m !== 1 && d.m !== 7) {
    paintIcon(x, `w${d.m === 2 ? 1 : 2}${VT[d.t] ?? 0}`); tint(x, lc, 0.3);
    if (d.m === 2) { gem(x, 28, 28, 2.6, gc); if (v === 1) { seg(x, 31, 31, 36, 40, '#d03a3a', 1.5); seg(x, 31, 31, 39, 37, '#d03a3a', 1.5); } }
    else { gem(x, 28, 20, 2.6, gc); if (v === 1) seg(x, 30, 18, 37, 27, '#e8c050', 1.5); }
  } else if (s === 0) {
    x.save(); x.translate(24, 25); x.rotate(Math.PI / 4);
    const L = d.m === 7 ? 13 : 16 + d.t * 1.6, w = has(d.n, '巨 雙手 屠龍') ? 5 : d.m === 7 ? 3 : 3.6, cv = has(d.n, '刀') ? 4 : 0;
    x.beginPath(); x.moveTo(-w, 7); x.quadraticCurveTo(-w - cv, -L / 2, -w * 0.4, -L); x.lineTo(0, -L - 5); x.lineTo(w * 0.4 + cv * 0.5, -L); x.quadraticCurveTo(w - cv * 0.3, -L / 2, w, 7); x.closePath();
    x.fillStyle = lg(x, -w, 0, w, 0, lc, dc); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.4; x.stroke();
    seg(x, 0, 5, 0, -L + 2, 'rgba(255,255,255,0.5)', 1);
    if (has(d.n, '炎魔 惡魔 屠龍')) { x.strokeStyle = d.n.indexOf('屠龍') >= 0 ? 'rgba(120,220,255,0.9)' : 'rgba(255,140,40,0.9)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(-w + 1, 2); x.lineTo(-w + 2, -L * 0.5); x.lineTo(-w + 1, -L * 0.85); x.stroke(); }
    const gw = v === 0 ? 10 : v === 1 ? 12 : 8;
    if (v === 2) shape(x, [-gw, 9, -gw + 2, 5, gw - 2, 5, gw, 9, gw - 2, 11, -gw + 2, 11], '#e8c050', OL);
    else box(x, -gw, 7, gw * 2, 4, 2, lg(x, 0, 7, 0, 11, d.r ? '#ff9a50' : '#f0cc60', '#8a6420'), OL);
    box(x, -2, 11, 4, d.m === 7 ? 7 : 9, 1, '#5a3a22', OL);
    gem(x, 0, 9, 2.2, gc);
    ball(x, 0, d.m === 7 ? 19.5 : 21.5, 3, '#f0cc60', '#8a6420', OL);
    x.restore();
  } else if (s === 1) {
    if (has(d.n, '帽')) {
      shape(x, [6, 36, 42, 36, 30, 30, 22, 4, 16, 30], gr, OL, 1.4);
      x.fillStyle = dc; x.beginPath(); x.ellipse(24, 36, 19, 5, 0, 0, TAU); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke();
      box(x, 15, 28, 18, 4, 2, '#e8c050', OL); gem(x, 24, 30, 2.5, gc);
    } else if (has(d.n, '冠')) {
      shape(x, [8, 36, 8, 16, 15, 24, 20, 10, 24, 20, 28, 10, 33, 24, 40, 16, 40, 36], lg(x, 0, 10, 0, 36, '#fff0a0', '#b07a10'), OL, 1.4);
      for (const gx of [14, 24, 34]) gem(x, gx, 30, 2.4, gc);
    } else {
      x.beginPath(); x.moveTo(9, 34); x.bezierCurveTo(9, 6, 39, 6, 39, 34); x.closePath(); x.fillStyle = gr; x.fill(); x.strokeStyle = OL; x.lineWidth = 1.5; x.stroke();
      if (v === 0) { x.fillStyle = '#14161c'; x.beginPath(); x.ellipse(24, 28, 8, 7, 0, 0, TAU); x.fill(); }
      else if (v === 1) { box(x, 12, 23, 24, 10, 2, lg(x, 0, 23, 0, 33, lc, dc), OL); x.fillStyle = '#14161c'; for (let i = 0; i < 3; i++) x.fillRect(15, 25.5 + i * 2.6, 18, 1.2); }
      else { box(x, 22, 17, 4, 17, 1.5, dc, OL); x.fillStyle = '#14161c'; x.fillRect(14, 24, 7, 4); x.fillRect(27, 24, 7, 4); }
      box(x, 8, 32, 32, 5, 2, lg(x, 0, 32, 0, 37, dc, '#2a2a30'), OL);
      if (d.t >= 3) { shape(x, [11, 20, 3, 6, 15, 15], '#f0e6d0', OL); shape(x, [37, 20, 45, 6, 33, 15], '#f0e6d0', OL); }
      if (has(d.n, '騎士')) { x.strokeStyle = '#d03030'; x.lineWidth = 3; x.beginPath(); x.moveTo(24, 9); x.quadraticCurveTo(14, 2, 8, 10); x.stroke(); }
      x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(15, 12, 6, 2);
      gem(x, 24, 15, 2.4, gc);
    }
  } else if (s === 2) {
    if (has(d.n, '袍 衣')) {
      shape(x, [16, 6, 32, 6, 38, 14, 34, 18, 40, 44, 8, 44, 14, 18, 10, 14], gr, OL, 1.5);
      seg(x, 24, 9, 24, 43, '#e8c050', 2);
      shape(x, [18, 6, 24, 14, 30, 6], dc, OL, 1);
      box(x, 14, 22, 20, 3, 1, '#e8c050'); gem(x, 24, 23.5, 2.4, gc);
    } else {
      paintIcon(x, `a${VT[d.t] ?? 0}`); tint(x, lc, 0.35);
      if (v === 1) { ball(x, 10, 13, 5, lc, dc, OL); ball(x, 38, 13, 5, lc, dc, OL); }
      if (v === 2) { seg(x, 15, 20, 33, 20, dc, 1.5); seg(x, 15, 26, 33, 26, dc, 1.5); }
      gem(x, 24, 18, 2.6, gc);
    }
  } else if (s === 3) {
    shape(x, [17, 7, 31, 7, 41, 40, 35, 44, 29, 40, 24, 44, 19, 40, 13, 44, 7, 40], gr, OL, 1.5);
    shape(x, [19, 10, 29, 10, 33, 34, 15, 34], 'rgba(0,0,0,0.22)');
    seg(x, 20, 12, 14, 40, 'rgba(0,0,0,0.25)', 1); seg(x, 28, 12, 34, 40, 'rgba(0,0,0,0.25)', 1);
    box(x, 14, 5, 20, 6, 3, lg(x, 0, 5, 0, 11, dc, '#222228'), OL);
    if (v === 1) for (let i = 0; i < 5; i++) ball(x, 15 + i * 4.5, 8, 2.6, '#f4f0e8', '#b0a898');
    gem(x, 24, 9, 3, gc);
  } else if (s === 4) {
    box(x, 13, 15, 22, 20, 5, gr, OL);
    for (let i = 0; i < 4; i++) box(x, 13.5 + i * 5.4, 6 + (i === 1 || i === 2 ? 0 : 3), 5, 13, 2.5, gr, OL);
    x.save(); x.translate(35, 24); x.rotate(-0.5); box(x, -3, -8, 7, 13, 3, gr, OL); x.restore();
    box(x, 12, 33, 24, 9, 2, lg(x, 0, 33, 0, 42, dc, '#2a2018'), OL);
    if (v !== 0) for (let i = 0; i < 3; i++) box(x, 15 + i * 6, 20, 4, 4, 1, 'rgba(255,255,255,0.35)');
    gem(x, 24, 37.5, 2.4, gc);
  } else if (s === 5) {
    shape(x, [15, 5, 30, 5, 30, 27, 41, 31, 42, 41, 11, 41, 13, 27], gr, OL, 1.5);
    box(x, 10, 39, 33, 5, 2, '#2a2018', OL);
    box(x, 14, 5, 17, 6, 2, lg(x, 0, 5, 0, 11, dc, '#2a2018'), OL);
    if (has(d.n, '疾風 黑暗')) shape(x, [14, 14, 4, 8, 8, 16, 2, 18, 13, 22], '#f0f6ff', OL, 1);
    if (v === 1) for (let i = 0; i < 3; i++) seg(x, 16, 15 + i * 5, 28, 15 + i * 5, dc, 1.5);
    gem(x, 22, 8, 2.2, gc);
  } else if (s === 6) {
    if (has(d.n, '臂甲')) {
      x.save(); x.translate(24, 24); x.rotate(-0.6);
      box(x, -9, -17, 18, 34, 7, gr, OL);
      for (const yy of [-9, 0, 9]) box(x, -10, yy - 1.5, 20, 3, 1.5, dc, OL);
      x.restore(); gem(x, 24, 24, 3, gc);
    } else if (has(d.n, '圓 木')) {
      ball(x, 24, 24, 18, lc, dc, OL);
      if (has(d.n, '木')) for (const xx of [16, 24, 32]) seg(x, xx, 8, xx, 40, 'rgba(60,30,10,0.5)', 1);
      x.strokeStyle = '#e8c050'; x.lineWidth = 2; x.beginPath(); x.arc(24, 24, 15, 0, TAU); x.stroke();
      ball(x, 24, 24, 5, '#f0f0f0', '#808890', OL); gem(x, 24, 24, 2, gc);
    } else if (has(d.n, '塔')) {
      box(x, 11, 4, 26, 40, 4, gr, OL); box(x, 14, 7, 20, 34, 3, 'rgba(0,0,0,0.12)');
      seg(x, 24, 8, 24, 40, '#e8c050', 2.5); seg(x, 14, 20, 34, 20, '#e8c050', 2.5); gem(x, 24, 20, 3, gc);
    } else {
      shape(x, [8, 7, 40, 7, 40, 22, 24, 44, 8, 22], gr, OL, 1.6);
      shape(x, [12, 10, 36, 10, 36, 21, 24, 39, 12, 21], 'rgba(0,0,0,0.15)');
      if (has(d.n, '騎士 神聖')) { x.fillStyle = has(d.n, '神聖') ? '#fff6c0' : '#c83030'; x.fillRect(22, 12, 4, 20); x.fillRect(15, 18, 18, 4); }
      gem(x, 24, 20, 2.6, gc);
    }
  } else if (s === 7) {
    shape(x, [6, 14, 16, 7, 32, 7, 42, 14, 37, 22, 33, 19, 33, 42, 15, 42, 15, 19, 11, 22], gr, OL, 1.5);
    x.strokeStyle = dc; x.lineWidth = 2; x.beginPath(); x.arc(24, 7, 5, 0.2, Math.PI - 0.2); x.stroke();
    if (d.t >= 1) ball(x, 24, 26, 5, gc, mix(gc, '#000000', 0.4));
  } else if (s === 8) {
    box(x, 3, 19, 42, 11, 4, gr, OL);
    for (const hx of [8, 12, 36, 40]) circ(x, hx, 24.5, 1.2, '#1a1208');
    box(x, 17, 15, 14, 19, 3, lg(x, 0, 15, 0, 34, '#ffe8a0', '#a87a20'), OL);
    box(x, 20, 18, 8, 13, 2, 'rgba(0,0,0,0.35)');
    gem(x, 24, 24.5, 2.6, gc);
  } else if (s === 9) {
    x.lineWidth = 7; x.strokeStyle = OL; x.beginPath(); x.ellipse(24, 29, 12, 10, 0, 0, TAU); x.stroke();
    x.lineWidth = 4.5; x.strokeStyle = lg(x, 12, 20, 36, 40, lc, dc); x.stroke();
    x.lineWidth = 1; x.strokeStyle = 'rgba(255,255,255,0.6)'; x.beginPath(); x.ellipse(24, 29, 12, 10, 0, Math.PI * 1.1, Math.PI * 1.5); x.stroke();
    if (v === 2) shape(x, [17, 21, 24, 12, 31, 21], '#e8c050', OL);
    gem(x, 24, 17, 5.5, gc);
  } else if (s === 11) {
    x.strokeStyle = OL; x.lineWidth = 3.5; x.beginPath(); x.moveTo(8, 5); x.quadraticCurveTo(24, 34, 40, 5); x.stroke();
    x.strokeStyle = '#e8c050'; x.lineWidth = 2; x.setLineDash([2, 2]); x.stroke(); x.setLineDash([]);
    if (v === 0) shape(x, [24, 22, 33, 32, 24, 44, 15, 32], gr, OL, 1.4); else if (v === 1) ball(x, 24, 33, 9, lc, dc, OL); else shape(x, [24, 22, 34, 28, 30, 42, 18, 42, 14, 28], gr, OL, 1.4);
    gem(x, 24, 33, 4.2, gc);
  } else {
    x.strokeStyle = OL; x.lineWidth = 3.5; x.beginPath(); x.arc(24, 12, 7, Math.PI * 1.1, Math.PI * 2.2); x.stroke();
    x.strokeStyle = '#e8c050'; x.lineWidth = 2; x.stroke();
    x.lineWidth = 3; x.strokeStyle = OL; x.beginPath(); x.arc(24, 21, 4, 0, TAU); x.stroke(); x.strokeStyle = lc; x.lineWidth = 2; x.stroke();
    if (v === 1) seg(x, 24, 25, 24, 30, '#e8c050', 1.5);
    shape(x, [24, 26, 31, 35, 24, 45, 17, 35], lg(x, 17, 26, 31, 45, '#ffffff', gc), OL, 1.4);
  }
  if (d.r) shape(x, [40, 2, 41.5, 6.5, 46, 8, 41.5, 9.5, 40, 14, 38.5, 9.5, 34, 8, 38.5, 6.5], '#ffe8a0', OL, 0.8);
  if (d.r || d.t >= 4) { x.save(); x.globalCompositeOperation = 'destination-over'; ball(x, 24, 24, 23, d.r ? 'rgba(255,150,60,0.5)' : 'rgba(170,120,255,0.45)', 'rgba(0,0,0,0)'); x.restore(); }
}
function icon(key: string): HTMLCanvasElement | null {
  const c = ICONS[key];
  if (c) return c;
  const r = mk(96, 96);
  if (!r) return null;
  r[1].scale(2, 2); paintIcon(r[1], key);
  ICONS[key] = r[0];
  return r[0];
}
function iconURL(key: string): string {
  const u = ICON_URL[key];
  if (u) return u;
  const c = icon(key);
  if (!c) return "";
  try { const d = c.toDataURL(); ICON_URL[key] = d; return d; } catch { return ""; }
}

/* ---------- drawing ---------- */
function ell(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, c: string): void {
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); ctx.fill();
}
function circ(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string): void { ell(ctx, x, y, r, r, c); }
function tri(ctx: CanvasRenderingContext2D, a: number, b: number, c: number, d: number, e: number, f: number, col: string): void {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.lineTo(e, f); ctx.closePath(); ctx.fill();
}
function seg(ctx: CanvasRenderingContext2D, a: number, b: number, c: number, d: number, col: string, w: number): void {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke();
}
function label(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, c: string, sz: number, font: string, align: CanvasTextAlign): void {
  ctx.font = `700 ${sz}px ${font}`; ctx.textAlign = align; ctx.textBaseline = "middle";
  ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,0.75)"; ctx.strokeText(s, x, y);
  ctx.fillStyle = c; ctx.fillText(s, x, y);
}

interface Look { cls: number; wt: number; at: number; en: number; ck?: string; sh?: string }
function drawWeapon(ctx: CanvasRenderingContext2D, L: Look, swing: number, time: number): void {
  const tr = Math.max(0, L.wt), [lc, dc] = TIERC[tr] ?? ["#ddd", "#888"];
  if (L.en >= 7 || tr >= 3) { ctx.shadowColor = tr === 4 ? "#ff7040" : "#80d0ff"; ctx.shadowBlur = 8; }
  if (L.cls === 0) {
    const Ln = 16 + tr * 1.5;
    shape(ctx, [-2, 0, -2, -Ln, 0, -Ln - 4, 2, -Ln, 2, 0], lg(ctx, -2, 0, 2, 0, lc, dc), OL, 1);
    box(ctx, -6, -1, 12, 3, 1.2, tr === 4 ? "#ff9a50" : "#e8c050", OL);
    box(ctx, -1.5, 2, 3, 5, 1, "#5a3a22");
  } else if (L.cls === 1) {
    const pull = swing > 0 ? 5 * Math.sin((swing / 0.22) * Math.PI) : 0;
    ctx.strokeStyle = OL; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(10, 0, 0, 14); ctx.stroke();
    ctx.strokeStyle = lc; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(10, 0, 0, 14); ctx.stroke();
    ctx.strokeStyle = dc; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1, -10); ctx.quadraticCurveTo(7, 0, 1, 10); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#f0f0f0"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-pull, 0); ctx.lineTo(0, 14); ctx.stroke();
    if (pull > 1) { seg(ctx, -pull, 0, 14, 0, "#d8c090", 1.5); tri(ctx, 17, 0, 13, -2.5, 13, 2.5, "#eeeeee"); }
  } else {
    seg(ctx, 0, 14, 0, -26, OL, 4); seg(ctx, 0, 14, 0, -26, "#8a5c34", 2.4);
    shape(ctx, [-4, -26, -3, -32, 0, -28, 3, -32, 4, -26], lc, OL, 1);
    const oc = ORB[tr] ?? "#fff", pulse = 1 + Math.sin(time * 5) * 0.15 + (swing > 0 ? 0.6 : 0);
    ctx.shadowBlur = 0;
    ball(ctx, 0, -31, 8 * pulse, oc + "70", "rgba(0,0,0,0)"); ball(ctx, 0, -31, 3.8, "#ffffff", oc, OL);
  }
  ctx.shadowBlur = 0;
}
/* ---------- L2-style hero sprites (pre-rendered, cached) ---------- */
const HSPR = new Map<string, { cv: HTMLCanvasElement; tx: number; ty: number }>();
const HS = 1.6, HW = 110, HH = 106, HOX = 55, HOY = 92;
function hl(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, w: number, c0: string, c1: string): void {
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
  c.strokeStyle = OL; c.lineWidth = w + 1.4; c.stroke();
  c.strokeStyle = c1; c.lineWidth = w; c.stroke();
  c.beginPath(); c.moveTo(x1 - w * 0.2, y1 - 0.2); c.lineTo(x2 - w * 0.2, y2 - 0.2);
  c.strokeStyle = c0; c.lineWidth = w * 0.42; c.stroke();
}
function paintHero(c: CanvasRenderingContext2D, L: Look, v: number, pose: number, fr: number): Pt {
  if (pose === 4) { c.translate(24, -4); c.rotate(-Math.PI / 2 * 0.95); return paintHero(c, L, 2, 3, 0); }
  const cls = L.cls, fx = [0, 0.55, 1, 0.55, 0][v] ?? 0, bk = v >= 3, side = v === 2, front = v === 0;
  const wf = [1, 0.84, 0.6, 0.84, 1][v] ?? 1, mf = 0.35 + 0.65 * fx;
  const ar = L.at >= 0 ? ATC[L.at] ?? CLOTH[cls] : CLOTH[cls], A0 = ar?.[0] ?? '#8d98a8', A1 = ar?.[1] ?? '#4f5866';
  const S0 = '#f8dcc0', S1 = '#c48a66', trim = '#e8c050', trim1 = '#8a6420';
  const walk = pose === 1, atk = pose === 2, hit = pose === 3, a = atk ? fr : -1;
  const ph = (fr / 8) * TAU, s = walk ? Math.sin(ph) : 0;
  const br = pose === 0 ? Math.sin((fr / 4) * TAU) : 0;
  const by = walk ? -(1 - Math.abs(s)) * 1.3 : 0;
  const lean = hit ? -2.6 : atk && cls === 0 ? [-1.5, -0.5, 2.5, 2][a] ?? 0 : walk ? fx * 0.9 : 0;
  const hipY = -23 + by, shY = -40 + by - br * 0.35, hy = -49.5 + by - br * 0.25 + (hit ? 0.8 : 0), tx = lean, hx = tx * 1.15 + fx * 1.4;
  const cape = L.ck ?? (cls === 0 ? '#8e2020' : cls === 1 ? '#2c5e36' : '');
  const tw = (cls === 1 ? 8 : 8.8) * wf, ww = (cls === 1 ? 5.4 : 6.2) * wf;
  const shx = (sg: number): number => (side ? tx + sg * 1.6 : tx + sg * tw * 0.86);
  let tip: Pt = { x: tx, y: shY };
  // arm angles: 0 = down, +PI/2 = forward, PI = up
  let nU = 0.15 + (walk ? -s * 0.55 : 0), nF = nU + 0.35, fU = -0.1 + (walk ? s * 0.55 : 0), fF = fU + 0.3;
  let gam = 0, pull = 0, rel = false;
  if (cls === 0) { nF = nU + 0.9; gam = 2.5 - s * 0.2; fU = 0.55; fF = 1.45; if (atk) { nU = [-2.6, 3.0, 1.25, 0.75][a] ?? 0; nF = nU + 0.5; gam = [-2.0, 2.9, 1.4, 0.95][a] ?? 1; } }
  if (cls === 1 && atk) { nU = 1.5; nF = 1.55; pull = [1, 6, 11, 0][a] ?? 0; rel = a === 3; }
  if (cls === 2) { nF = nU + 0.5; gam = 3.0 - s * 0.08; if (atk) { nU = [1.9, 2.6, 1.6, 0.9][a] ?? 1; nF = nU - 0.2; gam = [3.5, 3.2, 2.5, 2.7][a] ?? 3; fU = [0.6, 1.2, 1.5, 0.9][a] ?? 1; fF = fU + 0.2; } }
  if (hit) { nU = -0.5; nF = -0.2; fU = -0.6; fF = -0.3; gam = cls === 2 ? 3.5 : 2.9; }
  const joint = (sg: number, u: number, f: number): [Pt, Pt, Pt] => {
    const s0 = { x: shx(sg), y: shY + 2 }, mo = side ? 0 : sg * 1.2;
    const el = { x: s0.x + Math.sin(u) * 9 * mf + mo, y: s0.y + Math.cos(u) * 9 };
    return [s0, el, { x: el.x + Math.sin(f) * 8.5 * mf + mo * 0.5, y: el.y + Math.cos(f) * 8.5 }];
  };
  const aC0 = cls === 0 ? A0 : cls === 1 ? A0 : '#7a5ad0', aC1 = cls === 0 ? A1 : cls === 1 ? A1 : '#2e1868';
  const drawArm = (j: [Pt, Pt, Pt], far: boolean): void => {
    const s0 = j[0], el = j[1], hd = j[2], d = far ? 0.28 : 0, c0 = mix(aC0, '#000000', d), c1 = mix(aC1, '#000000', d);
    if (cls === 2) {
      hl(c, s0.x, s0.y, el.x, el.y, 5.2, c0, c1); hl(c, el.x, el.y, hd.x, hd.y - 1.2, 6.6, c0, c1);
      seg(c, hd.x - 3, hd.y - 1.6, hd.x + 3, hd.y - 0.6, trim, 1.3);
      ball(c, hd.x, hd.y + 0.6, 2.1, S0, S1, OL);
    } else {
      hl(c, s0.x, s0.y, el.x, el.y, 4.4, c0, c1); hl(c, el.x, el.y, hd.x, hd.y, 4, c0, c1);
      if (cls === 0) { hl(c, el.x + (hd.x - el.x) * 0.25, el.y + (hd.y - el.y) * 0.25, hd.x, hd.y, 4.8, mix(aC0, '#ffffff', 0.12), c1); ball(c, el.x, el.y, 2.4, mix(A0, '#ffffff', 0.25), mix(A1, '#000000', d), OL); ball(c, hd.x, hd.y, 2.5, mix(A0, '#ffffff', 0.1), mix(A1, '#000000', d), OL); }
      else { hl(c, el.x + (hd.x - el.x) * 0.3, el.y + (hd.y - el.y) * 0.3, hd.x, hd.y, 4.5, mix('#8a5a30', '#000000', d), '#4a2a14'); ball(c, hd.x, hd.y, 2.1, S0, S1, OL); }
    }
  };
  const sword = (hd: Pt): void => {
    const tr = Math.max(0, L.wt), cc: [string, string] = TIERC[tr] ?? ['#dddddd', '#888888'], Ln = 22 + tr * 1.5, dx = Math.sin(gam), dy = Math.cos(gam), px = -dy, py = dx;
    const b0x = hd.x + dx * 3, b0y = hd.y + dy * 3, ex = hd.x + dx * (Ln + 3), ey = hd.y + dy * (Ln + 3);
    if (L.en >= 7 || tr >= 3) { c.shadowColor = tr >= 4 ? '#ff7040' : '#80d0ff'; c.shadowBlur = 6; }
    shape(c, [b0x + px * 1.9, b0y + py * 1.9, ex - dx * 4 + px * 1.6, ey - dy * 4 + py * 1.6, ex, ey, ex - dx * 4 - px * 1.6, ey - dy * 4 - py * 1.6, b0x - px * 1.9, b0y - py * 1.9], lg(c, b0x + px * 2, b0y + py * 2, b0x - px * 2, b0y - py * 2, cc[0], cc[1]), OL, 1);
    c.shadowBlur = 0;
    seg(c, b0x, b0y, ex - dx * 5, ey - dy * 5, 'rgba(255,255,255,0.6)', 0.7);
    const gx = hd.x + dx * 2.5, gy = hd.y + dy * 2.5;
    seg(c, gx + px * 5, gy + py * 5, gx - px * 5, gy - py * 5, OL, 3.4); seg(c, gx + px * 5, gy + py * 5, gx - px * 5, gy - py * 5, tr >= 4 ? '#ff9a50' : trim, 1.9);
    seg(c, hd.x - dx * 3.5, hd.y - dy * 3.5, hd.x + dx * 2, hd.y + dy * 2, '#4a2a16', 2.3);
    ball(c, hd.x - dx * 4.5, hd.y - dy * 4.5, 1.7, trim, trim1, OL);
    tip = { x: ex, y: ey };
  };
  const shield = (hd: Pt): void => {
    const sc = L.sh ?? '#3a5ac0', w2 = 6.4 * (side ? 0.6 : bk ? 0.9 : 1), x0 = hd.x + (side ? 2 : 0), y0 = hd.y - 4;
    shape(c, [x0 - w2, y0 - 7.5, x0 + w2, y0 - 7.5, x0 + w2, y0 + 3, x0, y0 + 10.5, x0 - w2, y0 + 3], lg(c, x0 - w2, y0 - 7, x0 + w2, y0 + 10, mix(sc, '#ffffff', 0.3), mix(sc, '#000000', 0.5)), OL, 1.2);
    if (bk) { seg(c, x0 - w2 + 1.5, y0 - 2, x0 + w2 - 1.5, y0 - 2, '#5a3a1a', 1.6); return; }
    c.strokeStyle = trim; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x0 - w2 + 1.3, y0 - 6.2); c.lineTo(x0 + w2 - 1.3, y0 - 6.2); c.lineTo(x0 + w2 - 1.3, y0 + 2.6); c.lineTo(x0, y0 + 8.8); c.lineTo(x0 - w2 + 1.3, y0 + 2.6); c.closePath(); c.stroke();
    seg(c, x0, y0 - 4.6, x0, y0 + 6.4, trim, 1.6); seg(c, x0 - w2 * 0.6, y0 - 1, x0 + w2 * 0.6, y0 - 1, trim, 1.6);
    ball(c, x0 - w2 * 0.45, y0 - 4.2, 1.3, 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0)');
  };
  const bow = (hd: Pt, aim: boolean): void => {
    const tr = Math.max(0, L.wt), cc: [string, string] = TIERC[tr] ?? ['#dddddd', '#888888'], bx = hd.x, byy = hd.y, h = 16;
    if (L.en >= 7 || tr >= 3) { c.shadowColor = tr >= 4 ? '#ff7040' : '#80d0ff'; c.shadowBlur = 6; }
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(bx - 2.5, byy - h); c.quadraticCurveTo(bx + 8, byy - h * 0.55, bx + 1.5, byy); c.quadraticCurveTo(bx + 8, byy + h * 0.55, bx - 2.5, byy + h);
    c.strokeStyle = OL; c.lineWidth = 4.2; c.stroke(); c.strokeStyle = cc[1]; c.lineWidth = 2.8; c.stroke(); c.strokeStyle = cc[0]; c.lineWidth = 1.1; c.stroke();
    c.shadowBlur = 0;
    ball(c, bx - 2.5, byy - h, 1.3, trim, trim1); ball(c, bx - 2.5, byy + h, 1.3, trim, trim1);
    const sx = bx - 2.5 - (aim ? pull : 0);
    seg(c, bx - 2.5, byy - h, sx, byy, '#f4f4f4', 0.8); seg(c, sx, byy, bx - 2.5, byy + h, '#f4f4f4', 0.8);
    tip = { x: bx + 4, y: byy };
    if (aim && !rel) {
      seg(c, sx, byy, bx + 13, byy, OL, 2.4); seg(c, sx, byy, bx + 13, byy, '#e0c898', 1.2);
      tri(c, bx + 17, byy, bx + 12, byy - 2.4, bx + 12, byy + 2.4, '#f0f0f0');
      tri(c, sx + 0.5, byy, sx + 3.5, byy - 2, sx + 3.5, byy, '#d04040'); tri(c, sx + 0.5, byy, sx + 3.5, byy + 2, sx + 3.5, byy, '#d04040');
      tip = { x: bx + 17, y: byy };
    }
    if (rel) { c.globalAlpha = 0.55; seg(c, bx + 6, byy, bx + 32, byy, '#ffffff', 1.5); c.globalAlpha = 1; }
  };
  const staff = (hd: Pt): void => {
    const tr = Math.max(0, L.wt), cc: [string, string] = TIERC[tr] ?? ['#dddddd', '#888888'], dx = Math.sin(gam), dy = Math.cos(gam), px = -dy, py = dx;
    const tp = { x: hd.x + dx * 26, y: hd.y + dy * 26 }, bt = { x: hd.x - dx * 14, y: hd.y - dy * 14 };
    seg(c, bt.x, bt.y, tp.x, tp.y, OL, 4); seg(c, bt.x, bt.y, tp.x, tp.y, '#6a4224', 2.6); seg(c, bt.x - 0.6, bt.y, tp.x - 0.6, tp.y, '#b08050', 0.9);
    for (const k of [0.25, 0.55]) ball(c, hd.x + dx * 26 * k, hd.y + dy * 26 * k, 1.4, cc[0], trim1);
    const ox = tp.x + dx * 4.5, oy = tp.y + dy * 4.5;
    for (const sg of [-1, 1]) {
      c.beginPath(); c.moveTo(tp.x, tp.y); c.quadraticCurveTo(tp.x + px * sg * 6, tp.y + py * sg * 6, ox + px * sg * 3 + dx * 4, oy + py * sg * 3 + dy * 4);
      c.strokeStyle = OL; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = trim; c.lineWidth = 1.3; c.stroke();
    }
    ball(c, ox, oy, 4.2, '#ffffff', ORB[tr] ?? '#ffffff', OL);
    ball(c, ox - 1.3, oy - 1.4, 1.3, 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0)');
    tip = { x: ox, y: oy };
  };
  const leg = (sg: number, p2: number, far: boolean): void => {
    const sw = walk ? Math.sin(p2) : 0, lift = walk ? Math.max(0, Math.cos(p2)) * 3.2 : 0;
    const hx2 = tx * 0.4 + sg * 3.1 * wf;
    const fxp = hx2 + sw * 7 * fx + (walk ? 0 : sg * 0.5) + (hit ? -1 : 0), fy = -1 - lift * (1 - fx * 0.3);
    const kx = (hx2 + fxp) / 2 + (fx > 0 ? 1 + lift * 0.6 : sg * 0.6), ky = (hipY + fy) / 2 - lift * 0.5;
    const d = far ? 0.28 : 0, pc = cls === 2 ? '#3a2a55' : cls === 1 ? '#5a4a30' : '#3a3a40';
    hl(c, hx2, hipY + 1, kx, ky, 5.4, mix(pc, '#ffffff', 0.18 - d * 0.3), mix(pc, '#000000', d));
    hl(c, kx, ky, fxp, fy - 2.5, 4.6, mix(pc, '#ffffff', 0.1 - d * 0.3), mix(pc, '#000000', d + 0.1));
    if (cls === 0) { hl(c, kx, ky + 1, fxp, fy - 3, 5.4, mix(A0, '#000000', d), mix(A1, '#000000', d)); ball(c, kx, ky, 2.5, mix(A0, '#ffffff', 0.25), mix(A1, '#000000', d), OL); }
    else if (cls === 1) { hl(c, kx, ky - 1, fxp, fy - 2.8, 5, mix('#8a5a30', '#000000', d), mix('#4a2a14', '#000000', d)); seg(c, kx - 2.2, ky, kx + 2.2, ky, '#c8a060', 1); }
    else hl(c, kx, ky + 3, fxp, fy - 2.8, 4.6, mix('#4a3a5a', '#000000', d), '#22182e');
    const fl = side || v === 1 || v === 3 ? 2.6 : 0.8;
    shape(c, [fxp - 2.6, fy - 2.4, fxp + 2.2 + fl, fy - 1.8, fxp + 2.6 + fl, fy + 0.6, fxp - 2.8, fy + 0.6], lg(c, 0, fy - 3, 0, fy + 1, far ? '#3a2a1a' : '#6a4224', '#1e1208'), OL, 1);
  };
  const drawCape = (): void => {
    if (!cape) return;
    const sw = s * 2.2, c0 = mix(cape, '#ffffff', 0.18), c1 = mix(cape, '#000000', 0.5);
    if (side) shape(c, [tx - 2, shY - 0.5, tx + 2, shY + 1, tx - 4 - sw * 0.5, -3, tx - 13 - sw - (walk ? 3 : 0), -2.5], lg(c, tx, shY, tx - 12, 0, c0, c1), OL, 1.1);
    else shape(c, [tx - tw + 1, shY - 0.5, tx + tw - 1, shY - 0.5, tx + tw + 3 + sw, -2.5, tx - tw - 3 + sw, -3], lg(c, tx - tw, shY, tx + tw, 0, c0, c1), OL, 1.1);
    c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = 1;
    for (let i = -1; i <= 1; i++) { const x0 = side ? tx - 3 + i : tx + i * 3.5; c.beginPath(); c.moveTo(x0, shY + 5); c.quadraticCurveTo(x0 + sw * 0.5 + i, -14, x0 + (side ? -6 - sw : sw + i * 1.5), -4); c.stroke(); }
    if (bk) { seg(c, tx - tw + 1.5, shY + 0.5, tx + tw - 1.5, shY + 0.5, trim, 1.4); }
  };
  const quiver = (): void => {
    c.save(); c.translate(tx - 3 - fx * 2, shY + 7); c.rotate(0.35);
    box(c, -2.6, -11, 5.2, 17, 2, lg(c, -3, 0, 3, 0, '#9a6a3a', '#4a2a14'), OL); seg(c, -2.6, -7, 2.6, -7, trim, 1);
    for (const ox of [-1.4, 0, 1.4]) { seg(c, ox, -11, ox, -15, '#d8c8a0', 0.8); shape(c, [ox - 1.1, -15, ox + 1.1, -15, ox, -18.5], '#e8f0f0', OL, 0.6); }
    c.restore();
  };
  const torso = (): void => {
    const L0 = tx - tw, R0 = tx + tw, cx = tx + fx * 2.4;
    if (cls === 2) {
      const hw = 11 * wf, sw = s * 1.6;
      shape(c, [L0 + 0.5, shY, R0 - 0.5, shY, tx + hw + sw + fx * 2, -3, tx - hw + sw - fx * 1.5, -3.4], lg(c, L0, shY, R0, -3, L.at >= 0 ? mix('#7a58d0', A0, 0.25) : '#7a58d0', '#1e0e44'), OL, 1.2);
      c.strokeStyle = 'rgba(10,0,30,0.4)'; c.lineWidth = 1;
      for (let i = -2; i <= 2; i++) { if (i === 0) continue; c.beginPath(); c.moveTo(tx + i * 1.8 * wf, hipY); c.quadraticCurveTo(tx + i * 3.2 * wf + sw, -12, tx + i * 4.6 * wf + sw * 1.4, -3.5); c.stroke(); }
      seg(c, tx - hw + sw - fx * 1.5 + 0.5, -4.4, tx + hw + sw + fx * 2 - 0.5, -4, trim, 1.5);
      if (!bk) { const sc = L.at >= 0 ? A0 : trim; seg(c, cx, shY + 2, cx + sw * 0.8, -4, OL, 3.4); seg(c, cx, shY + 2, cx + sw * 0.8, -4, sc, 2); shape(c, [cx - 3.2, shY - 0.5, cx + 3.2, shY - 0.5, cx, shY + 5], lg(c, 0, shY, 0, shY + 5, '#fff0b0', '#b08020'), OL, 0.8); }
      box(c, tx - ww - 0.5, hipY - 3.4, (ww + 0.5) * 2, 3.2, 1.2, lg(c, 0, hipY - 3.4, 0, hipY, '#e8c050', '#7a5418'), OL);
      if (!bk) { seg(c, cx + 1, hipY - 1, cx + 2 + sw, hipY + 9, '#c89a38', 1.6); ball(c, cx, hipY - 1.8, 1.4, '#c080ff', '#5020a0', OL); }
      return;
    }
    shape(c, [L0 + 0.5, shY, R0 - 0.5, shY, tx + ww + 0.6 + fx * 1.5, hipY - 1, tx - ww - 0.6 + fx * 0.4, hipY - 1], lg(c, L0, shY, R0, hipY, mix(A0, '#ffffff', 0.22), mix(A1, '#000000', 0.25)), OL, 1.2);
    if (cls === 0) {
      c.strokeStyle = mix(A1, '#000000', 0.4); c.lineWidth = 0.9;
      if (!bk) {
        c.beginPath(); c.moveTo(cx, shY + 1); c.lineTo(cx, hipY - 2); c.stroke();
        c.beginPath(); c.moveTo(L0 + 2, shY + 8); c.quadraticCurveTo(cx, shY + 12.5, R0 - 2, shY + 8); c.stroke();
        for (let i = 0; i < 2; i++) { const yy = shY + 13 + i * 2.6; c.beginPath(); c.moveTo(tx - ww + 0.5, yy); c.quadraticCurveTo(cx, yy + 1.4, tx + ww - 0.5, yy); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(cx - 3, shY + 5, 1.6, 3, -0.3, 0, TAU); c.fill();
        seg(c, cx - 3.5, shY + 0.5, cx + 3.5, shY + 0.5, trim, 1.2);
      } else { c.beginPath(); c.moveTo(tx, shY + 1); c.lineTo(tx, hipY - 2); c.stroke(); for (let i = 0; i < 3; i++) { const yy = shY + 6 + i * 4; c.beginPath(); c.moveTo(L0 + 1.5, yy); c.lineTo(R0 - 1.5, yy); c.stroke(); } }
      // mail skirt + tassets
      shape(c, [tx - ww - 1, hipY - 1, tx + ww + 1, hipY - 1, tx + ww + 2.2, hipY + 6, tx - ww - 2.2, hipY + 6], '#4a4e58', OL, 1);
      for (let i = -1; i <= 1; i++) { if (side && i === -1) continue; const x0 = tx + i * ww * 0.72 + fx; shape(c, [x0 - 2.8 * wf, hipY - 0.5, x0 + 2.8 * wf, hipY - 0.5, x0 + 3.3 * wf, hipY + 7, x0 - 3.3 * wf, hipY + 7], lg(c, x0 - 3, hipY, x0 + 3, hipY + 7, mix(A0, '#ffffff', 0.2), A1), OL, 0.9); seg(c, x0 - 3 * wf, hipY + 3, x0 + 3 * wf, hipY + 3, mix(A1, '#000000', 0.3), 0.7); }
    } else {
      if (!bk) {
        shape(c, [cx - 2.4, shY, cx + 2.4, shY, cx, shY + 5], S1, OL, 0.6);
        c.strokeStyle = '#d8b878'; c.lineWidth = 0.7; c.beginPath(); for (let i = 0; i < 4; i++) { const yy = shY + 5 + i * 2.6; c.moveTo(cx - 1.6, yy); c.lineTo(cx + 1.6, yy + 1.3); c.moveTo(cx + 1.6, yy); c.lineTo(cx - 1.6, yy + 1.3); } c.stroke();
      }
      shape(c, [tx - ww - 0.8, hipY - 1, tx + ww + 0.8, hipY - 1, tx + ww + 2.6 + s, hipY + 8, tx + (side ? 0 : 0.6), hipY + 6.5, tx - ww - 2.6 + s, hipY + 8], lg(c, tx - ww, hipY, tx + ww, hipY + 8, mix(A0, '#000000', 0.05), mix(A1, '#000000', 0.3)), OL, 1);
      ball(c, shx(1), shY + 1.2, 3, '#8a5a30', '#4a2a14', OL); if (!side) ball(c, shx(-1), shY + 1.2, 3, '#8a5a30', '#4a2a14', OL);
    }
    box(c, tx - ww - 0.8, hipY - 3.2, (ww + 0.8) * 2, 3, 1, lg(c, 0, hipY - 3.2, 0, hipY, '#7a4e28', '#3a2210'), OL);
    if (!bk) box(c, cx - 1.6, hipY - 3.6, 3.2, 3.8, 0.8, lg(c, cx - 2, 0, cx + 2, 0, '#fff0a0', '#b08020'), OL);
    if (cls === 1) box(c, tx - ww - 1 - fx * 1.5, hipY - 2, 3.4, 4, 1, '#6a4224', OL);
    if (cls === 0) for (const sg of side ? [1] : [-1, 1]) { const px2 = shx(sg); ball(c, px2, shY + 1, 4.9, mix(A0, '#ffffff', 0.35), mix(A1, '#000000', 0.2), OL); c.strokeStyle = trim; c.lineWidth = 1; c.beginPath(); c.arc(px2, shY + 1, 4.1, Math.PI * 0.05, Math.PI * 0.95); c.stroke(); }
  };
  const head = (): void => {
    if (cls === 1 && !bk) shape(c, [hx - 5.6, hy - 3, hx + 5 - fx * 3, hy - 4, hx + 4 - fx * 7, hy + 13 - s, hx - 6.5 - fx * 3, hy + 14], lg(c, 0, hy - 4, 0, hy + 14, '#f6dc84', '#a87a28'), OL, 1);
    if (cls === 2) { c.beginPath(); c.ellipse(hx - fx * 1.6, hy - 0.5, 7, 7.6, 0, 0, TAU); c.fillStyle = lg(c, hx - 7, hy - 8, hx + 7, hy + 7, '#6a48c0', '#24124e'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke(); }
    hl(c, tx * 0.8 + fx * 0.6, shY + 0.5, hx, hy + 4.5, 3.2, S0, S1);
    c.beginPath(); c.ellipse(hx, hy, side ? 5 : 5.2, 6, 0, 0, TAU); c.fillStyle = lg(c, hx - 5, hy - 6, hx + 5, hy + 6, S0, S1); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke();
    const eyes = side ? [hx + 2.8] : [hx - 1.9 + fx * 2.2, hx + 1.9 + fx * 1.5];
    const face = (): void => {
      if (bk) return;
      for (const ex of eyes) { c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(ex, hy + 0.4, 1.05, 0.8, 0, 0, TAU); c.fill(); c.fillStyle = cls === 1 ? '#2a6a3a' : cls === 2 ? '#4a2a8a' : '#2a3a5a'; c.beginPath(); c.ellipse(ex + fx * 0.3, hy + 0.5, 0.65, 0.8, 0, 0, TAU); c.fill(); seg(c, ex - 1.2, hy - 1.3, ex + 1.2, hy - 1.6, '#5a3a22', 0.7); }
      if (side) shape(c, [hx + 4.6, hy + 0.6, hx + 6.2, hy + 2.6, hx + 4.6, hy + 3], S0, OL, 0.6);
      else seg(c, hx + fx * 2.4, hy + 1.6, hx + fx * 2.6 + 0.4, hy + 2.6, S1, 0.7);
      seg(c, hx - 1 + fx * 2.4, hy + 3.9, hx + 1 + fx * 2.6, hy + 3.9, '#a8605a', 0.7);
    };
    if (cls === 0) {
      c.beginPath(); c.ellipse(hx, hy - 0.4, 5.9, 6.7, 0, 0, TAU); c.fillStyle = lg(c, hx - 6, hy - 7, hx + 6, hy + 6, '#f2f6fa', '#5a6474'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke();
      seg(c, hx - 5.6, hy - 2.6, hx + 5.6, hy - 2.6, trim, 1.2);
      if (!bk) {
        const vx0 = side ? hx + 0.8 : hx - 4.2 + fx * 2, vx1 = side ? hx + 5.9 : hx + 4.2 + fx * 1.6;
        seg(c, vx0, hy + 0.2, vx1, hy + 0.2, '#0e1014', 1.6);
        if (!side) seg(c, hx + fx * 2, hy - 2.4, hx + fx * 2, hy + 5.6, mix('#aab4c2', '#000000', 0.2), 1.2);
        for (let i = 0; i < 3; i++) circ(c, vx0 + 1.5 + i * 1.6 * (vx1 - vx0) / 7, hy + 3.4, 0.45, '#0e1014');
        c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(hx - 2.6, hy - 4, 1.2, 1.8, -0.4, 0, TAU); c.fill();
      }
      const pc0 = mix(cape || '#c02a2a', '#ffffff', 0.2), sw = s * 1.5;
      c.beginPath(); c.moveTo(hx + (side ? 2 : 0), hy - 6.6); c.quadraticCurveTo(hx - 3 - sw, hy - 13, hx - 10 - sw * 2 - fx * 2, hy - 6); c.quadraticCurveTo(hx - 5 - sw, hy - 8.5, hx - 1, hy - 5.5);
      c.closePath(); c.fillStyle = lg(c, hx, hy - 12, hx - 10, hy - 5, pc0, mix(cape || '#c02a2a', '#000000', 0.4)); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
    } else if (cls === 1) {
      face();
      if (!bk) {
        const ex2 = side ? hx - 1 : hx - 5.2 + fx * 0.5;
        shape(c, [ex2, hy - 0.5, ex2 - (side ? 3 : 4.5), hy - 5, ex2 + 1.2, hy + 2.2], S0, OL, 0.8);
        if (!side && fx === 0) shape(c, [hx + 5.2, hy - 0.5, hx + 9.7, hy - 5, hx + 4, hy + 2.2], S0, OL, 0.8);
        c.beginPath(); c.moveTo(hx - 5.6, hy + 1); c.quadraticCurveTo(hx - 6, hy - 7.5, hx + fx, hy - 6.8); c.quadraticCurveTo(hx + 6, hy - 6.5, hx + 5.4 - fx * 0.5, hy - 1); c.lineTo(hx + 3 + fx, hy - 3.4); c.lineTo(hx + 0.6 + fx, hy - 2); c.lineTo(hx - 1.4 + fx, hy - 3.6); c.lineTo(hx - 3.4, hy - 1.8);
        c.closePath(); c.fillStyle = lg(c, 0, hy - 7, 0, hy, '#fff0a8', '#d0a040'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
        seg(c, hx - 5, hy - 3.8, hx + 5, hy - 4.2, '#3a8a4a', 1);
        circ(c, hx + fx * 1.5, hy - 4, 0.9, '#80ffb0');
      } else { shape(c, [hx - 5.6, hy, hx + 5.6, hy, hx + 5, hy + 14 - s, hx - 5.8, hy + 14], lg(c, 0, hy, 0, hy + 14, '#e8c870', '#a87a28'), OL, 1); c.beginPath(); c.ellipse(hx, hy - 0.6, 5.9, 6.6, 0, 0, TAU); c.fillStyle = lg(c, hx - 6, hy - 7, hx + 6, hy + 6, '#fff0a8', '#b88a30'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); seg(c, hx - 5.6, hy - 3.6, hx + 5.6, hy - 3.6, '#3a8a4a', 1); }
    } else {
      face();
      if (!bk) {
        c.beginPath(); c.moveTo(hx - 6.5 - fx * 1.5, hy + 4); c.quadraticCurveTo(hx - 7.5, hy - 9.5, hx + fx * 1.2, hy - 8.4); c.quadraticCurveTo(hx + 7.5 - fx * 2, hy - 8, hx + 6.2 - fx * 3.5, hy + 1); c.quadraticCurveTo(hx + 4 - fx, hy - 5.5, hx - 4 + fx * 2, hy - 5); c.quadraticCurveTo(hx - 5, hy, hx - 6.5 - fx * 1.5, hy + 4);
        c.closePath(); c.fillStyle = lg(c, hx - 7, hy - 9, hx + 7, hy + 4, '#7a58d0', '#2a1460'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
        seg(c, hx - 4.3 + fx * 1.6, hy - 4.2, hx + 4.3 + fx * 1.2, hy - 4.4, trim, 1); ball(c, hx + fx * 1.4, hy - 4.4, 1.2, '#ffe080', '#c04040', OL);
      } else { c.beginPath(); c.ellipse(hx, hy - 0.8, 6.6, 7.2, 0, 0, TAU); c.fillStyle = lg(c, hx - 7, hy - 8, hx + 7, hy + 7, '#6a48c0', '#24124e'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); shape(c, [hx - 3, hy + 5, hx + 3, hy + 5, hx, hy + 12], '#2a1460', OL, 0.8); }
    }
  };
  let nj = joint(1, nU, nF);
  let fj = joint(-1, fU, fF);
  if (cls === 1 && atk) { const bh = nj[2], ph2 = { x: bh.x - 2.5 - (rel ? 13 : pull), y: bh.y - (rel ? 2 : 0) }, s0 = { x: shx(-1), y: shY + 2 }; fj = [s0, { x: (s0.x + ph2.x) / 2 - 2, y: Math.max(s0.y, ph2.y) + 3 }, ph2]; }
  const weapon = (): void => { const hd = nj[2]; if (cls === 0) sword(hd); else if (cls === 1) bow(hd, atk); else staff(hd); };
  const nearArm = (): void => { if (cls === 1) { weapon(); drawArm(nj, false); } else { drawArm(nj, false); weapon(); if (cls === 0) ball(c, nj[2].x, nj[2].y, 2.5, mix(A0, '#ffffff', 0.1), A1, OL); } };
  const pullFront = cls === 1 && atk;
  const vElf = cls === 1 && atk && (v === 0 || v === 4), vUp = v === 4;
  const vbh: Pt = { x: tx + 0.6, y: vUp ? hy - 10 : shY + 9 }, vsh: Pt = { x: tx + 1.8, y: vUp ? hy - 3 : hy + 5.5 };
  if (vElf) { const s1 = { x: shx(1), y: shY + 2 }, s2 = { x: shx(-1), y: shY + 2 }; nj = [s1, { x: (s1.x + vbh.x) / 2 + 3, y: (s1.y + vbh.y) / 2 + (vUp ? 0 : 2) }, vbh]; fj = [s2, { x: (s2.x + vsh.x) / 2 - 3, y: (s2.y + vsh.y) / 2 + 1.5 }, vsh]; }
  const vBow = (): void => {
    const tr = Math.max(0, L.wt), cc: [string, string] = TIERC[tr] ?? ['#dddddd', '#888888'], bx = vbh.x, byy = vbh.y, h = 15;
    c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 1.5, byy - h); c.quadraticCurveTo(bx + 2.4, byy, bx - 1.5, byy + h);
    c.strokeStyle = OL; c.lineWidth = 4.2; c.stroke(); c.strokeStyle = cc[1]; c.lineWidth = 2.8; c.stroke(); c.strokeStyle = cc[0]; c.lineWidth = 1.1; c.stroke();
    ball(c, bx - 1.5, byy - h, 1.3, trim, trim1); ball(c, bx - 1.5, byy + h, 1.3, trim, trim1);
    if (!rel) {
      if (vUp) { seg(c, bx, vsh.y, bx, byy - 9, OL, 2.4); seg(c, bx, vsh.y, bx, byy - 9, '#e0c898', 1.2); tri(c, bx, byy - 14, bx - 2.4, byy - 9, bx + 2.4, byy - 9, '#f0f0f0'); tip = { x: bx, y: byy - 14 }; }
      else { seg(c, vsh.x, vsh.y, bx, byy, '#e0c898', 1.4); shape(c, [bx, byy - 2.8, bx + 2.6, byy, bx, byy + 2.8, bx - 2.6, byy], '#f4f4f4', OL, 0.8); tip = { x: bx, y: byy }; }
    } else { c.globalAlpha = 0.55; if (vUp) seg(c, bx, byy - 6, bx, byy - 28, '#ffffff', 1.6); else ball(c, bx, byy, 6, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'); c.globalAlpha = 1; tip = { x: bx, y: byy }; }
  };
  if (vElf && vUp) {
    vBow(); leg(-1, ph, false); leg(1, ph + Math.PI, false); torso(); quiver(); drawCape(); head();
    drawArm(nj, false); drawArm(fj, false);
  } else if (vElf) {
    drawCape(); quiver(); leg(-1, ph, false); leg(1, ph + Math.PI, false); torso(); head();
    drawArm(fj, false); drawArm(nj, false); vBow(); ball(c, vbh.x, vbh.y, 2.1, S0, S1, OL);
  } else if (bk) {
    nearArm(); drawArm(fj, true); if (cls === 0) shield(fj[2]);
    leg(-1, ph, false); leg(1, ph + Math.PI, false);
    torso();
    if (cls === 1) quiver();
    drawCape();
    head();
  } else {
    drawCape();
    if (cls === 1) quiver();
    if (!front && !pullFront) drawArm(fj, true);
    if (!front && cls === 0) shield(fj[2]);
    leg(-1, ph, !front); leg(1, ph + Math.PI, false);
    torso();
    if (front && !pullFront) drawArm(fj, false);
    head();
    nearArm();
    if (pullFront) drawArm(fj, false);
    if (front && cls === 0) shield(fj[2]);
  }
  if (cls === 0 && atk && a >= 2) {
    const sx = nj[0].x, sy = nj[0].y;
    c.save(); c.lineCap = 'round'; c.strokeStyle = L.en >= 7 ? '#9fe0ff' : '#ffffff';
    c.globalAlpha = a === 2 ? 0.7 : 0.35; c.lineWidth = 3; c.beginPath(); c.arc(sx, sy, 30, -1.9, 0.5); c.stroke();
    c.globalAlpha *= 0.35; c.lineWidth = 10; c.beginPath(); c.arc(sx, sy, 26, -1.9, 0.5); c.stroke();
    c.restore();
  }
  if (cls === 2 && atk && a >= 1) { ball(c, fj[2].x + 2, fj[2].y, 4 + a, 'rgba(220,190,255,0.85)', 'rgba(160,100,255,0)'); }
  return tip;
}
let GRAIN: HTMLCanvasElement | null = null;
function grain(): HTMLCanvasElement | null {
  if (GRAIN) return GRAIN;
  const r = mk(64, 64); if (!r) return null;
  const R = mulberry(77);
  for (let i = 0; i < 1100; i++) { const v = R(); r[1].fillStyle = v < 0.5 ? `rgba(0,0,0,${0.3 + R() * 0.4})` : `rgba(255,255,255,${0.25 + R() * 0.4})`; r[1].fillRect(Math.floor(R() * 64), Math.floor(R() * 64), 1 + Math.floor(R() * 2), 1); }
  GRAIN = r[0]; return GRAIN;
}
function matPass(x: CanvasRenderingContext2D, _m: HTMLCanvasElement, W: number, H: number, gk: number, ok: number): void {
  const mm = mk(W, H); if (!mm) return; mm[1].drawImage(x.canvas, 0, 0); const mask = mm[0];
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = ok;
  const g = x.createLinearGradient(W * 0.15, H * 0.1, W * 0.75, H * 0.95); g.addColorStop(0, '#fff0d0'); g.addColorStop(0.5, '#808080'); g.addColorStop(1, '#141830'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const gt = grain(); if (gt) { const pt = x.createPattern(gt, 'repeat'); if (pt) { x.globalCompositeOperation = 'soft-light'; x.globalAlpha = gk; x.fillStyle = pt; x.fillRect(0, 0, W, H); } }
  x.globalAlpha = 1; x.globalCompositeOperation = 'destination-in'; x.drawImage(mask, 0, 0);
}
function heroFinish(cv: HTMLCanvasElement): void {
  const x = cv.getContext('2d'), W = cv.width, H = cv.height, a = mk(W, H), b = mk(W, H);
  if (!x || !a || !b) return;
  const [ac, ax] = a, [bc, bx] = b;
  ax.drawImage(cv, 0, 0); ax.globalCompositeOperation = 'source-in'; ax.fillStyle = '#fff0c8'; ax.fillRect(0, 0, W, H);
  ax.globalCompositeOperation = 'destination-out'; ax.drawImage(cv, -3, 3);
  bx.drawImage(cv, 0, 0); bx.globalCompositeOperation = 'source-in'; bx.fillStyle = 'rgba(10,6,14,0.95)'; bx.fillRect(0, 0, W, H);
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
  matPass(x, bc, W, H, 0.14, 0.26);
  x.globalCompositeOperation = 'source-atop';
  const gr = x.createLinearGradient(W * 0.3, H * 0.2, W * 0.55, H * 0.95);
  gr.addColorStop(0, 'rgba(255,248,230,0.12)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(14,8,34,0.3)');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.5; x.drawImage(ac, 0, 0);
  x.globalCompositeOperation = 'destination-over'; x.globalAlpha = 1;
  for (const [ox, oy] of [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5]] as [number, number][]) x.drawImage(bc, ox, oy);
  x.restore();
}
function heroFrame(L: Look, v: number, pose: number, fr: number): { cv: HTMLCanvasElement; tx: number; ty: number } | null {
  const key = `${L.cls}|${L.wt}|${L.at}|${L.en >= 7 ? 1 : 0}|${L.ck ?? ''}|${L.sh ?? ''}|${v}|${pose}|${fr}`;
  const got = HSPR.get(key);
  if (got) return got;
  const m0 = mk(Math.ceil(HW * HS), Math.ceil(HH * HS));
  if (!m0) return null;
  const [cv, c] = m0;
  c.setTransform(HS, 0, 0, HS, HOX * HS, HOY * HS);
  const tp = paintHero(c, L, v, pose, fr);
  heroFinish(cv);
  if (HSPR.size >= 260) { const k0 = HSPR.keys().next().value; if (k0 !== undefined) HSPR.delete(k0); }
  const e = { cv, tx: tp.x, ty: tp.y };
  HSPR.set(key, e);
  return e;
}
function warmHero(L: Look): void { for (let v = 0; v <= 4; v++) { for (let f = 0; f < 4; f++) heroFrame(L, v, 0, f); for (let f = 0; f < 8; f++) heroFrame(L, v, 1, f); } }
function drawHero(ctx: CanvasRenderingContext2D, L: Look, x: number, y: number, face: number, walk: number, moving: boolean, swing: number, hurt: number, time: number, haste: boolean, dead?: number): void {
  const dir = Math.cos(face) < -0.01 ? -1 : 1, an = Math.atan2(Math.sin(face), Math.abs(Math.cos(face)));
  const v = clamp(Math.round((Math.PI / 2 - an) / (Math.PI / 4)), 0, 4);
  let pose = 0, fr = Math.floor(time * 2.2) % 4;
  if ((dead ?? 0) > 0) { pose = 4; fr = 0; }
  else if (swing > 0) { pose = 2; fr = clamp(Math.floor((1 - Math.min(swing, 0.22) / 0.22) * 4), 0, 3); }
  else if (hurt > 0.12) { pose = 3; fr = 0; }
  else if (moving) { pose = 1; fr = ((Math.floor(((walk * 12) / TAU) * 8) % 8) + 8) % 8; }
  const f = heroFrame(L, v, pose, fr);
  if (!f) { drawHeroOld(ctx, L, x, y, face, walk, moving, swing, hurt, time, haste); return; }
  shadow(ctx, x, y, pose === 4 ? 24 : 15);
  if (haste) { ctx.globalAlpha = 0.25 + Math.sin(time * 8) * 0.1; ell(ctx, x, y, 17, 6, "#60ff90"); ctx.globalAlpha = 1; }
  if (hurt > 0 && Math.floor(time * 30) % 2 === 0) ctx.globalAlpha = 0.6;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.drawImage(f.cv, -HOX, -HOY, HW, HH);
  if (pose !== 4) {
    if (L.cls === 2) { const oc = ORB[Math.max(0, L.wt)] ?? '#ffffff', pu = 1 + Math.sin(time * 5) * 0.15 + (swing > 0 ? 0.7 : 0); ctx.globalCompositeOperation = 'lighter'; ball(ctx, f.tx, f.ty, 7 * pu, oc + '88', 'rgba(0,0,0,0)'); ctx.globalCompositeOperation = 'source-over'; }
    if (L.en >= 7 || L.wt >= 3) { const tw2 = 0.5 + Math.sin(time * 6) * 0.5; ctx.globalAlpha = 0.5 + tw2 * 0.5; ball(ctx, f.tx, f.ty, 2 + tw2 * 2.5, '#ffffff', L.wt >= 4 ? 'rgba(255,112,64,0)' : 'rgba(128,208,255,0)'); ctx.globalAlpha = 1; }
    if (L.cls === 2 && swing > 0) { const a = Math.min(swing, 0.22) / 0.22; ctx.save(); ctx.globalAlpha = a * 0.8; ctx.strokeStyle = '#d8b8ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, -1, 17, 6, 0, 0, TAU); ctx.stroke(); ctx.rotate(time * 3); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, -1, 12, 4.4, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
function drawHeroOld(ctx: CanvasRenderingContext2D, L: Look, x: number, y: number, face: number, walk: number, moving: boolean, swing: number, hurt: number, time: number, haste: boolean): void {
  const dir = Math.cos(face) < -0.01 ? -1 : 1, back = Math.sin(face) < -0.8 && moving;
  const ph = walk * 12, st = moving ? Math.sin(ph) : 0, bob = moving ? -Math.abs(Math.cos(ph)) * 1.6 : Math.sin(time * 2.2) * 0.6;
  shadow(ctx, x, y, 13);
  if (haste) { ctx.globalAlpha = 0.25 + Math.sin(time * 8) * 0.1; ell(ctx, x, y, 15, 5, "#60ff90"); ctx.globalAlpha = 1; }
  if (hurt > 0 && Math.floor(time * 30) % 2 === 0) ctx.globalAlpha = 0.55;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  const cls = L.cls, ar = L.at >= 0 ? ATC[L.at] ?? CLOTH[cls] : CLOTH[cls], a0 = ar?.[0] ?? "#888", a1 = ar?.[1] ?? "#444";
  const skin0 = "#f8d8b6", skin1 = "#d49c74";
  const arm = swing > 0 ? (cls === 0 ? -3.5 + (1 - Math.min(swing, 0.22) / 0.22) * 2.6 : cls === 2 ? -2.5 : -1.4) : -0.35 + st * 0.25;
  const weaponGroup = (): void => {
    ctx.save(); ctx.translate(4, -20 + bob); ctx.rotate(arm);
    box(ctx, -2.2, -1, 4.4, 10, 2, lg(ctx, -2, 0, 2, 0, cls === 2 ? "#7a52c8" : a0, cls === 2 ? "#3a2070" : a1), OL);
    ball(ctx, 0, 10, 2.4, skin0, skin1, OL);
    ctx.translate(0, 10); ctx.rotate(cls === 0 ? (swing > 0 ? Math.PI - 0.3 : -1.25) : cls === 1 ? 0.1 - arm : (swing > 0 ? 0.35 : 0.12) - arm);
    drawWeapon(ctx, L, swing, time);
    ctx.restore();
  };
  const elfAim = (): void => {
    const s = 1 - Math.min(swing, 0.22) / 0.22, nock = s < 0.55, pull = nock ? 10 * Math.min(1, s / 0.4) : 0, by = -20 + bob, bx = 15;
    const cc = TIERC[Math.max(0, L.wt)] ?? ['#dddddd', '#888888'];
    seg(ctx, 3, by, bx, by, OL, 5.4); seg(ctx, 3, by, bx, by, a0, 3.6);
    if (L.en >= 7 || L.wt >= 3) { ctx.shadowColor = L.wt >= 4 ? '#ff7040' : '#80d0ff'; ctx.shadowBlur = 8; }
    ctx.strokeStyle = OL; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(bx - 3, by - 15); ctx.quadraticCurveTo(bx + 9, by, bx - 3, by + 15); ctx.stroke();
    ctx.strokeStyle = cc[0]; ctx.lineWidth = 2.8; ctx.stroke(); ctx.shadowBlur = 0;
    seg(ctx, bx - 3, by - 15, bx - 3 - pull, by, '#f4f4f4', 0.9); seg(ctx, bx - 3 - pull, by, bx - 3, by + 15, '#f4f4f4', 0.9);
    if (nock) { seg(ctx, bx - 3 - pull, by, bx + 9, by, OL, 2.6); seg(ctx, bx - 3 - pull, by, bx + 9, by, '#e0c898', 1.4); tri(ctx, bx + 13, by, bx + 8, by - 2.6, bx + 8, by + 2.6, '#f0f0f0'); }
    else { ctx.globalAlpha = 0.5 * (1 - s); seg(ctx, bx + 4, by, bx + 30, by, '#ffffff', 1.5); ctx.globalAlpha = 1; }
    const hx = bx - 3 - pull;
    seg(ctx, -2, by + 1, hx, by, OL, 5.4); seg(ctx, -2, by + 1, hx, by, a1, 3.6);
    ball(ctx, hx, by, 2.4, skin0, skin1, OL); ball(ctx, bx, by, 2.6, skin0, skin1, OL);
  };
  const wg = (): void => { if (cls === 1 && swing > 0) elfAim(); else weaponGroup(); };
  if (cls === 0) { const cw = st * 2; shape(ctx, [-6, -21 + bob, 6, -21 + bob, 8 - cw, -3, -10 - cw, -2], lg(ctx, 0, -21, 0, -2, "#d03a3a", "#6a1010"), OL); }
  if (L.ck && cls !== 0) { const cw = st * 2; shape(ctx, [-6, -22 + bob, 6, -22 + bob, 9 - cw, -1, -11 - cw, 0], lg(ctx, 0, -22, 0, 0, mix(L.ck, '#ffffff', 0.25), L.ck), OL); }
  if (cls === 1) { box(ctx, -9, -24 + bob, 5, 14, 2, "#7a4a24", OL); seg(ctx, -7, -24 + bob, -9, -29 + bob, "#e8e0c0", 1.5); seg(ctx, -5.5, -24 + bob, -6, -30 + bob, "#e8e0c0", 1.5); }
  if (back) wg();
  const leg = (lx: number, off: number, dark: boolean): void => {
    box(ctx, lx - 2.4, -10 + Math.min(0, off), 4.8, 9, 2, dark ? "#2a2620" : cls === 2 ? "#3a2a55" : "#4a4238", OL);
    box(ctx, lx - 3 + off * 0.3, -3, 6.2, 4, 1.6, dark ? "#2a1a10" : "#4a2e18", OL);
  };
  leg(-2.5 - st * 2.5, -st, true); leg(2.5 + st * 2.5, st, false);
  if (cls === 0) {
    box(ctx, -7.5, -23 + bob, 15, 15, 4, lg(ctx, -7, 0, 8, 0, a0, a1), OL);
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(-5, -21 + bob, 3, 9);
    box(ctx, -7.5, -11 + bob, 15, 3, 1, "#5a3a1a", OL); ball(ctx, 0, -9.5 + bob, 1.6, "#f0cc60", "#8a6420");
    ball(ctx, -6.5, -21 + bob, 4, a0, a1, OL);
    if (!back) { shape(ctx, [-12, -20 + bob, -4, -20 + bob, -4, -11 + bob, -8, -7 + bob, -12, -11 + bob], lg(ctx, -12, 0, -4, 0, L.sh ?? "#3a5ac0", L.sh ? mix(L.sh, '#000000', 0.45) : "#1a2a70"), OL, 1.2); seg(ctx, -8, -19 + bob, -8, -9 + bob, "#e8c050", 1.5); }
  } else if (cls === 1) {
    shape(ctx, [-6.5, -23 + bob, 6.5, -23 + bob, 7.5, -8 + bob, -7.5, -8 + bob], lg(ctx, -7, 0, 8, 0, a0, a1), OL);
    if (L.at < 0) { ctx.fillStyle = "#7a4a24"; ctx.fillRect(-6, -18 + bob, 12, 2); }
    box(ctx, -7.5, -11 + bob, 15, 2.6, 1, "#6a4224", OL);
  } else {
    shape(ctx, [-6, -23 + bob, 6, -23 + bob, 10 + st, -1, -10 + st, -1], lg(ctx, -8, 0, 10, 0, "#8a62d8", "#341c6a"), OL);
    if (L.at >= 0) { ctx.fillStyle = a0; ctx.fillRect(-9.5 + st, -4, 19, 2.5); ctx.fillRect(-2, -23 + bob, 4, 20); }
    else { ctx.fillStyle = "#e8c050"; ctx.fillRect(-9.5 + st, -4, 19, 2); }
    box(ctx, -6.5, -12 + bob, 13, 2.5, 1, "#3a2060", OL);
  }
  const hy = -29 + bob;
  ball(ctx, 0, hy, 6.8, skin0, skin1, OL);
  if (cls === 0) {
    ctx.beginPath(); ctx.arc(0, hy - 0.5, 7.6, Math.PI * 0.95, Math.PI * 2.05); ctx.closePath(); ctx.fillStyle = lg(ctx, -7, 0, 7, 0, "#eef2f6", "#7a8696"); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.2; ctx.stroke();
    if (!back) { box(ctx, -7.5, hy - 1, 3.5, 7, 1.5, "#aab4c2", OL); ctx.fillStyle = "#1a1e24"; ctx.fillRect(0, hy - 1, 7, 2); }
    else box(ctx, -7.5, hy - 1, 15, 7, 2, "#9aa4b2", OL);
    ctx.strokeStyle = "#d02a2a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, hy - 8); ctx.quadraticCurveTo(-6 - st, hy - 14, -10 - st * 2, hy - 8); ctx.stroke();
  } else if (cls === 1) {
    ctx.beginPath(); ctx.arc(0, hy - 0.5, 7.4, Math.PI * 0.85, Math.PI * 2.1); ctx.closePath(); ctx.fillStyle = lg(ctx, 0, hy - 8, 0, hy + 2, "#fff09a", "#d8a830"); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.1; ctx.stroke();
    shape(ctx, [-7, hy - 2, -8.5, hy + 9 - st, -3, hy + 6], "#e8c050", OL, 1);
    if (!back) shape(ctx, [-2, hy, -12, hy - 6, -3, hy + 3], skin0, OL, 1);
    else box(ctx, -7, hy - 3, 14, 10, 4, "#e8c050", OL);
    ctx.fillStyle = "#3a8a4a"; ctx.fillRect(-6, hy - 6, 12, 1.6);
  } else {
    shape(ctx, [-10, hy - 3, 10, hy - 3, 4, hy - 7, 1, hy - 21, -3 - st, hy - 18, -5, hy - 7], lg(ctx, -10, 0, 10, 0, "#6a42b8", "#2a1260"), OL);
    ctx.fillStyle = "#e8c050"; ctx.fillRect(-5, hy - 7.5, 10, 2);
    ball(ctx, 1, hy - 20, 1.8, "#ffe080", "#c08020");
    if (back) box(ctx, -6, hy - 3, 12, 8, 3, "#5a3a2a", OL);
  }
  if (!back) { ctx.fillStyle = "#1a1410"; ctx.fillRect(3, hy - 0.5, 1.8, 2.2); ctx.fillStyle = "rgba(220,120,110,0.5)"; ctx.fillRect(3.5, hy + 3, 2.5, 1); }
  if (!back) wg();
  if (cls === 0 && swing > 0) {
    const a = Math.min(swing, 0.22) / 0.22, e1 = arm + Math.PI / 2 - 0.15, e0 = Math.max(-3.5 + Math.PI / 2 - 0.15, e1 - 2.2);
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = L.en >= 7 ? '#9fe0ff' : '#ffffff';
    ctx.globalAlpha = clamp(a * 1.3, 0, 1) * 0.85; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(4, -20 + bob, 29, e0, e1); ctx.stroke();
    ctx.globalAlpha *= 0.3; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(4, -20 + bob, 25, e0, e1); ctx.stroke();
    ctx.restore();
  }
  if (cls === 2 && swing > 0) { const a = Math.min(swing, 0.22) / 0.22; ctx.save(); ctx.globalAlpha = a * 0.8; ctx.strokeStyle = '#d8b8ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, -1, 14, 5, 0, 0, TAU); ctx.stroke(); ctx.rotate(time * 3); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, -1, 10, 3.6, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawMon(ctx: CanvasRenderingContext2D, m: Mon, sel: boolean, font: string, time: number): void {
  const d = md(m), r = d.r, fl = m.hit > 0, c = fl ? "#ffffff" : d.c, c2 = fl ? "#dddddd" : d.c2, a = m.anim;
  const dying = m.dead > 0, k = dying ? clamp(m.dieT / 0.7, 0, 1) : 1;
  const lunge = m.atkT > 0 ? Math.sin((1 - m.atkT / 0.28) * Math.PI) * 7 : 0;
  shadow(ctx, m.x, m.y + 1, r * 1.15 * (dying ? k : 1));
  ctx.save(); ctx.translate(m.x + lunge * (m.face < 0 ? -1 : 1), m.y);
  if (dying) { ctx.globalAlpha = k; ctx.scale(1 + (1 - k) * 0.4, k); }
  if (sel && !dying) { ctx.strokeStyle = "#ff5050"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 1, r * 1.35, r * 0.55, 0, 0, TAU); ctx.stroke(); }
  ctx.scale(m.face < 0 ? -1 : 1, 1);
  const lgg = Math.sin(a * 10) * r * 0.2;
  if (d.s === 0) {
    const q = 1 + Math.sin(a * 6) * 0.1;
    ell(ctx, 0, -r * 0.75, r * q, (r * 0.8) / q, c); ell(ctx, -r * 0.35, -r * 1.05, r * 0.25, r * 0.15, "rgba(255,255,255,0.45)");
    circ(ctx, r * 0.35, -r * 0.8, r * 0.13, "#132"); circ(ctx, -r * 0.05, -r * 0.8, r * 0.13, "#132");
  } else if (d.s === 1) {
    seg(ctx, -r * 0.5 + lgg, -r * 0.4, -r * 0.5 + lgg, 0, c2, 3); seg(ctx, r * 0.5 - lgg, -r * 0.4, r * 0.5 - lgg, 0, c2, 3);
    seg(ctx, -r * 0.9, -r * 0.8, -r * 1.4, -r * 1.1 - lgg * 0.5, c, 3);
    ell(ctx, 0, -r * 0.7, r, r * 0.5, c); circ(ctx, r * 0.85, -r * 1.05, r * 0.45, c);
    if (r <= 10) { ell(ctx, r * 0.7, -r * 1.9, r * 0.15, r * 0.5, c); ell(ctx, r * 0.95, -r * 1.85, r * 0.15, r * 0.5, c2); }
    else { tri(ctx, r * 0.6, -r * 1.3, r * 0.8, -r * 1.85, r * 1.0, -r * 1.35, c2); tri(ctx, r * 1.25, -r * 1.05, r * 1.6, -r * 0.95, r * 1.25, -r * 0.85, c2); }
    circ(ctx, r * 1.0, -r * 1.15, r * 0.1, d.ag ? "#ff3030" : "#111");
  } else if (d.s === 2) {
    ctx.fillStyle = c2; ctx.fillRect(-r * 0.4 + lgg * 0.5, -r * 0.6, r * 0.3, r * 0.6); ctx.fillRect(r * 0.1 - lgg * 0.5, -r * 0.6, r * 0.3, r * 0.6);
    ctx.fillStyle = c; ctx.fillRect(-r * 0.5, -r * 1.45, r, r * 0.9);
    circ(ctx, 0, -r * 1.75, r * 0.42, c);
    circ(ctx, r * 0.18, -r * 1.8, r * 0.09, d.s === 2 && d.lv === 20 ? "#200" : "#ff3030");
    seg(ctx, r * 0.55, -r * 0.9, r * 1.1, -r * 1.9 + lgg * 0.3, d.lv === 20 ? "#d8dce4" : "#6a4a2a", d.lv === 9 ? 4 : 3);
  } else if (d.s === 3) {
    ctx.fillStyle = c2; ctx.fillRect(-r * 0.4, -r * 1.3, r * 0.8, r * 1.3);
    seg(ctx, -r * 0.3, -r * 1.0, -r * 1.0, -r * 1.4 + lgg, c2, 3); seg(ctx, r * 0.3, -r * 1.0, r * 1.0, -r * 1.4 - lgg, c2, 3);
    circ(ctx, 0, -r * 1.8, r * 0.85, c); circ(ctx, -r * 0.6, -r * 1.5, r * 0.5, c); circ(ctx, r * 0.6, -r * 1.55, r * 0.5, c);
    circ(ctx, -r * 0.15, -r * 0.95, r * 0.09, "#ffe060"); circ(ctx, r * 0.2, -r * 0.95, r * 0.09, "#ffe060");
  } else if (d.s === 4) {
    for (let i = 0; i < 4; i++) {
      const o = (i - 1.5) * r * 0.35, w = Math.sin(a * 12 + i) * r * 0.15;
      seg(ctx, o, -r * 0.6, o - r * 0.6, -r * 0.1 + w, c2, 2); seg(ctx, o, -r * 0.6, o + r * 0.6, -r * 0.1 - w, c2, 2);
    }
    circ(ctx, -r * 0.35, -r * 0.7, r * 0.65, c); circ(ctx, r * 0.5, -r * 0.65, r * 0.4, c2);
    circ(ctx, r * 0.7, -r * 0.75, r * 0.08, "#ff3030"); circ(ctx, r * 0.55, -r * 0.8, r * 0.08, "#ff3030");
  } else {
    const boss = d.s === 6, fw = Math.sin(a * (boss ? 4 : 8)) * r * 0.3;
    if (boss) circ(ctx, 0, -r * 1.0, r * (1.5 + Math.sin(time * 3) * 0.08), "rgba(255,60,30,0.15)");
    tri(ctx, -r * 0.2, -r * 1.2, -r * 1.5, -r * 1.9 - fw, -r * 1.1, -r * 0.6, c2);
    tri(ctx, r * 0.2, -r * 1.2, r * 1.5, -r * 1.9 - fw, r * 1.1, -r * 0.6, c2);
    ctx.fillStyle = c2; ctx.fillRect(-r * 0.4, -r * 0.5, r * 0.3, r * 0.5); ctx.fillRect(r * 0.1, -r * 0.5, r * 0.3, r * 0.5);
    ell(ctx, 0, -r * 0.95, r * 0.6, r * 0.6, c); circ(ctx, 0, -r * 1.7, r * 0.38, c);
    tri(ctx, -r * 0.3, -r * 1.9, -r * 0.5, -r * 2.4, -r * 0.1, -r * 2.0, boss ? "#f0e0c0" : c2);
    tri(ctx, r * 0.3, -r * 1.9, r * 0.5, -r * 2.4, r * 0.1, -r * 2.0, boss ? "#f0e0c0" : c2);
    circ(ctx, r * 0.15, -r * 1.75, r * 0.08, boss ? "#ffe040" : "#ff3030");
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  if (dying) return;
  monLabel(ctx, m, sel, font);
}
function mix(a: string, b: string, t: number): string {
  const pp = (h: string): number[] => [1, 3, 5].map((i: number) => parseInt(h.slice(i, i + 2), 16) || 0);
  const u = pp(a), v = pp(b);
  return `rgb(${u.map((q: number, i: number) => Math.round(q + ((v[i] ?? 0) - q) * t)).join(",")})`;
}
function limb(x: CanvasRenderingContext2D, pts: number[], w: number, col: string): void {
  x.lineCap = "round"; x.lineJoin = "round";
  for (const [lw, cc] of [[w + 2.2, OL], [w, col]] as [number, string][]) {
    x.strokeStyle = cc; x.lineWidth = lw; x.beginPath();
    for (let i = 0; i < pts.length; i += 2) { const px = pts[i] ?? 0, py = pts[i + 1] ?? 0; if (i === 0) x.moveTo(px, py); else x.lineTo(px, py); }
    x.stroke();
  }
}
function eye(x: CanvasRenderingContext2D, ex: number, ey: number, rr: number, col: string): void { ball(x, ex, ey, rr * 2.4, col + "66", "rgba(0,0,0,0)"); ball(x, ex, ey, rr, "#ffffff", col); }
function al(cc: string, a: number): string { return (cc.indexOf('rgb(') === 0 ? cc : mix(cc, cc, 0)).replace('rgb(', 'rgba(').replace(')', `,${a})`); }
function paintSlime(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean): void {
  const r = d.r, c = d.c, dk = d.c2, hi = mix(c, '#ffffff', 0.55), ghost = d.n.indexOf('幽靈') >= 0;
  if (ghost) {
    const bob = Math.sin((f / 6) * TAU) * r * 0.18, h = r * 2.6, w = r * 0.95;
    x.translate(0, -r * 0.5 + bob);
    x.beginPath(); x.moveTo(-w, -h * 0.55); x.bezierCurveTo(-w, -h * 1.05, w, -h * 1.05, w, -h * 0.55);
    for (let i = 0; i <= 4; i++) { const t = i / 4, xx = w - t * 2 * w, yy = -h * 0.12 + Math.sin(t * TAU * 1.5 + f) * r * 0.12 + (i % 2 ? -r * 0.18 : r * 0.12); x.quadraticCurveTo(xx + r * 0.25, yy + r * 0.25, xx, yy); }
    x.closePath(); const gg = x.createLinearGradient(0, -h, 0, 0); gg.addColorStop(0, hi); gg.addColorStop(0.6, mix(c, '#ffffff', 0.1)); gg.addColorStop(1, al(mix(dk, '#ffffff', 0.2), 0.50));
    x.fillStyle = gg; x.globalAlpha = 0.9; x.fill(); x.globalAlpha = 1; x.strokeStyle = OL; x.lineWidth = 1.3; x.stroke();
    for (const sg of [-1, 1]) { const ax = sg * w * 0.9, ay = -h * 0.5; limb(x, [ax, ay, ax + sg * r * 0.55, ay + (atk ? -r * 0.6 : r * 0.25) + bob * 0.3], r * 0.22, mix(c, '#ffffff', 0.25)); }
    for (const ex of [w * 0.05, w * 0.5]) { x.fillStyle = '#10141c'; x.beginPath(); x.ellipse(ex, -h * 0.68, r * 0.15, r * (atk ? 0.26 : 0.2), 0, 0, TAU); x.fill(); ball(x, ex + 1, -h * 0.68, r * 0.07, '#a0e8ff', '#2080c0'); }
    x.fillStyle = '#10141c'; x.beginPath(); x.ellipse(w * 0.3, -h * 0.47, r * 0.14, r * (atk ? 0.24 : 0.1), 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.beginPath(); x.ellipse(-w * 0.45, -h * 0.82, r * 0.18, r * 0.35, -0.4, 0, TAU); x.fill();
    return;
  }
  const SQ = atk ? 0.8 : [1, 0.84, 1.16, 1.1, 0.96, 0.86][f] ?? 1, lift = (atk ? 0.1 : [0, 0, 0.3, 0.55, 0.3, 0][f] ?? 0) * r;
  const w = (r * 1.2) / Math.sqrt(SQ) * (atk ? 1.15 : 1), h = r * 1.6 * SQ;
  if (lift < 1) { x.fillStyle = al(mix(dk, '#000000', 0.2), 0.60); x.beginPath(); x.ellipse(r * 0.1, 0, w * 1.15, r * 0.2, 0, 0, TAU); x.fill(); }
  x.save(); x.translate(atk ? r * 0.35 : 0, -lift);
  x.beginPath(); x.moveTo(-w, 0);
  x.bezierCurveTo(-w * 1.08, -h * 0.6, -w * 0.5, -h, w * 0.05, -h); x.bezierCurveTo(w * 0.62, -h, w * 1.1, -h * 0.6, w, 0);
  const dr = [0.7, 0.25, -0.2, -0.62];
  for (let i = 0; i < dr.length; i++) { const xx = w * (dr[i] ?? 0); x.quadraticCurveTo(xx + w * 0.14, r * 0.05, xx, r * (0.12 + ((i + f) % 2) * 0.1)); }
  x.quadraticCurveTo(-w * 0.85, r * 0.08, -w, 0); x.closePath();
  const gr = x.createRadialGradient(-w * 0.3, -h * 0.75, 1, 0, -h * 0.45, w * 1.35); gr.addColorStop(0, hi); gr.addColorStop(0.5, c); gr.addColorStop(1, dk);
  x.fillStyle = gr; x.globalAlpha = 0.94; x.fill(); x.globalAlpha = 1; x.strokeStyle = OL; x.lineWidth = 1.5; x.stroke();
  x.save(); x.clip();
  x.fillStyle = al(mix(dk, '#000000', 0.25), 0.40); x.beginPath(); x.ellipse(-w * 0.2, -h * 0.32, r * 0.42, r * 0.34, 0.4, 0, TAU); x.fill();
  ball(x, -w * 0.22, -h * 0.34, r * 0.2, al(mix(c, '#ffffff', 0.3), 0.67), al(dk, 0.33));
  x.save(); x.translate(w * 0.35, -h * 0.18); x.rotate(0.6 + f * 0.05); x.globalAlpha = 0.45;
  if (d.z === 6) { shape(x, [-r * 0.25, 0, 0, -r * 0.35, r * 0.25, 0, 0, r * 0.1], '#fff0a0'); } else { box(x, -r * 0.28, -r * 0.05, r * 0.56, r * 0.1, 1, '#f4f0e0'); ball(x, -r * 0.3, -r * 0.08, r * 0.08, '#f4f0e0', '#c0b8a0'); ball(x, -r * 0.3, r * 0.06, r * 0.08, '#f4f0e0', '#c0b8a0'); ball(x, r * 0.3, -r * 0.08, r * 0.08, '#f4f0e0', '#c0b8a0'); ball(x, r * 0.3, r * 0.06, r * 0.08, '#f4f0e0', '#c0b8a0'); }
  x.restore(); x.globalAlpha = 1;
  for (const [bx, by, br2] of [[-w * 0.55, -h * 0.25, 0.09], [w * 0.1, -h * 0.12, 0.07], [-w * 0.05, -h * 0.6, 0.06], [w * 0.6, -h * 0.45, 0.05]] as [number, number, number][]) { x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 0.8; x.beginPath(); x.arc(bx, by - (f % 3) * r * 0.04, r * br2, 0, TAU); x.stroke(); }
  x.strokeStyle = al(mix(dk, '#000000', 0.3), 0.53); x.lineWidth = r * 0.25; x.beginPath(); x.moveTo(-w * 0.9, -r * 0.05); x.quadraticCurveTo(0, r * 0.25, w * 0.9, -r * 0.05); x.stroke();
  x.restore();
  x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(0, -h * 0.5, w * 0.86, h * 0.44, 0, Math.PI * 1.08, Math.PI * 1.42); x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.ellipse(-w * 0.42, -h * 0.8, w * 0.2, h * 0.08, -0.5, 0, TAU); x.fill();
  circ(x, -w * 0.15, -h * 0.9, r * 0.05, 'rgba(255,255,255,0.9)');
  const tipx = w * 0.05 + (1 - SQ) * r * 0.8;
  x.beginPath(); x.moveTo(-r * 0.18, -h * 0.97); x.quadraticCurveTo(tipx - r * 0.1, -h - r * 0.55, tipx + r * 0.3, -h - r * 0.4); x.quadraticCurveTo(tipx, -h - r * 0.2, r * 0.25, -h * 0.97); x.closePath(); x.fillStyle = mix(c, '#ffffff', 0.2); x.fill(); x.strokeStyle = OL; x.lineWidth = 1; x.stroke();
  if (d.z === 6) for (let i = 0; i < 3; i++) { const fxx = -w * 0.4 + i * w * 0.4, fl = r * (0.45 + ((i + f) % 3) * 0.15); shape(x, [fxx - r * 0.18, -h * 0.85 + Math.abs(fxx) * 0.2, fxx + ((f + i) % 2 ? 1 : -1) * r * 0.1, -h * 0.85 - fl + Math.abs(fxx) * 0.2, fxx + r * 0.18, -h * 0.85 + Math.abs(fxx) * 0.2], 'rgba(255,220,90,0.85)'); }
  if (d.z === 3) { x.save(); x.translate(-w * 0.35, -h * 0.9); x.rotate(-0.3); x.fillStyle = '#4a8a3a'; x.beginPath(); x.ellipse(0, 0, r * 0.4, r * 0.16, 0, 0.3, TAU - 0.3); x.lineTo(0, 0); x.closePath(); x.fill(); x.strokeStyle = OL; x.lineWidth = 0.9; x.stroke(); ball(x, r * 0.1, -r * 0.08, r * 0.1, '#ffb0d0', '#c05080'); x.restore(); }
  const ey = -h * 0.56, ag = d.ag;
  for (const [ex, er] of [[w * 0.12, 0.25], [w * 0.62, 0.21]] as [number, number][]) {
    x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(ex, ey, r * er * 0.85, r * er * (atk ? 0.75 : 1.05), 0, 0, TAU); x.fill(); x.strokeStyle = OL; x.lineWidth = 1; x.stroke();
    ball(x, ex + r * 0.07, ey + r * 0.03, r * er * 0.55, '#3a3a50', '#0a0a14');
    circ(x, ex + r * 0.02, ey - r * 0.06, r * er * 0.22, '#ffffff');
    seg(x, ex - r * 0.2, ey - r * (ag ? 0.18 : 0.33), ex + r * 0.2, ey - r * (ag ? 0.34 : 0.36), mix(dk, '#000000', 0.5), 1.6);
  }
  if (atk) { x.fillStyle = '#3a0a10'; x.beginPath(); x.ellipse(w * 0.42, -h * 0.27, r * 0.34, r * 0.22, 0, 0, TAU); x.fill(); x.strokeStyle = OL; x.lineWidth = 1; x.stroke(); x.fillStyle = '#ff7080'; x.beginPath(); x.ellipse(w * 0.42, -h * 0.2, r * 0.18, r * 0.08, 0, 0, TAU); x.fill(); tri(x, w * 0.3, -h * 0.36, w * 0.36, -h * 0.25, w * 0.42, -h * 0.36, '#ffffff'); tri(x, w * 0.46, -h * 0.36, w * 0.52, -h * 0.25, w * 0.58, -h * 0.36, '#ffffff'); }
  else { x.strokeStyle = mix(dk, '#000000', 0.5); x.lineWidth = 1.3; x.beginPath(); x.arc(w * 0.4, -h * 0.36, r * 0.16, 0.25, Math.PI - 0.25); x.stroke(); ball(x, w * 0.52, -h * 0.25 + (f % 3) * r * 0.05, r * 0.06, mix(c, '#ffffff', 0.5), c); }
  x.restore();
}
function paintHare(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean): void {
  const r = d.r, c = d.c, dk = d.c2, hi = mix(c, '#ffffff', 0.45), sh = mix(dk, '#000000', 0.2), ph = (f / 6) * TAU, sn = atk ? 0 : Math.sin(ph);
  const bob = atk ? 0 : -Math.abs(Math.sin(ph)) * r * 0.25, hipY = -r * 0.95 + bob, shY = -r * 2.0 + bob, hx = r * 0.32, hy = -r * 2.45 + bob;
  const fur = (cx: number, cy: number, rx: number, ry: number, rot: number, c0: string, c1: string): void => { x.save(); x.translate(cx, cy); x.rotate(rot); const g2 = x.createRadialGradient(-rx * 0.3, -ry * 0.4, 1, 0, 0, Math.max(rx, ry) * 1.1); g2.addColorStop(0, mix(c0, '#ffffff', 0.35)); g2.addColorStop(0.6, c0); g2.addColorStop(1, c1); x.fillStyle = g2; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke(); x.restore(); };
  const leg = (sg: number, a: number, far: boolean): void => {
    const c0 = far ? sh : c, c1 = far ? mix(sh, '#000000', 0.3) : dk, tx2 = sg * r * 0.12 + Math.sin(a) * r * 0.35, lift = Math.max(0, Math.cos(a)) * r * 0.2;
    fur(sg * r * 0.15 + Math.sin(a) * r * 0.12, hipY + r * 0.25, r * 0.36, r * 0.48, -0.2 + Math.sin(a) * 0.3, c0, c1);
    limb(x, [sg * r * 0.15 + Math.sin(a) * r * 0.2, hipY + r * 0.55, tx2, -r * 0.18 - lift], r * 0.2, c0);
    fur(tx2 + r * 0.22, -r * 0.1 - lift, r * 0.38, r * 0.13, 0, far ? sh : mix(c, '#ffffff', 0.2), c1);
  };
  const arm = (sg: number, far: boolean, up: boolean): Pt => {
    const s0 = { x: sg * r * 0.25, y: shY + r * 0.2 }, a = up ? -2.4 : 0.3 + sn * 0.4 * sg, e = { x: s0.x + Math.sin(a) * r * 0.45, y: s0.y + Math.cos(a) * r * 0.45 }, hd = { x: e.x + Math.sin(a + (up ? 0.4 : 0.9)) * r * 0.42, y: e.y + Math.cos(a + (up ? 0.4 : 0.9)) * r * 0.42 };
    limb(x, [s0.x, s0.y, e.x, e.y, hd.x, hd.y], r * 0.17, far ? sh : c); ball(x, hd.x, hd.y, r * 0.13, far ? sh : hi, far ? mix(sh, '#000000', 0.3) : c, OL); return hd;
  };
  fur(-r * 0.6, hipY - r * 0.15, r * 0.26, r * 0.24, 0, '#ffffff', '#c8c0b0');
  const ea = atk ? -0.5 : sn * 0.15;
  x.save(); x.translate(hx - r * 0.2, hy - r * 0.3); x.rotate(-0.9 + ea * 0.5); fur(0, -r * 0.6, r * 0.17, r * 0.62, 0, sh, mix(sh, '#000000', 0.3)); x.restore();
  arm(-1, true, false);
  leg(-1, ph + Math.PI, true);
  fur(0, (hipY + shY) / 2 + r * 0.05, r * 0.62, r * 0.78, 0.08, c, dk);
  fur(r * 0.18, (hipY + shY) / 2 + r * 0.15, r * 0.36, r * 0.55, 0.1, '#fff8ec', '#d8cbb0');
  shape(x, [-r * 0.55, shY + r * 0.15, r * 0.55, shY + r * 0.1, r * 0.6, shY + r * 0.75, r * 0.1, shY + r * 0.95, -r * 0.6, shY + r * 0.8], lg(x, 0, shY, 0, shY + r, '#7aa84a', '#3a6a2a'), OL, 1.1);
  for (let i = 0; i < 3; i++) seg(x, -r * 0.45 + i * r * 0.15, shY + r * 0.25, -r * 0.4 + i * r * 0.15, shY + r * 0.75, 'rgba(20,50,10,0.5)', 0.8);
  shape(x, [-r * 0.45, shY + r * 0.05, r * 0.5, shY, r * 0.45, shY + r * 0.2, -r * 0.45, shY + r * 0.25], '#c83a2a', OL, 1);
  shape(x, [-r * 0.4, shY + r * 0.15, -r * 0.75 - sn * r * 0.1, shY + r * 0.55, -r * 0.55, shY + r * 0.6, -r * 0.3, shY + r * 0.25], '#a82a1a', OL, 0.9);
  box(x, -r * 0.6, hipY - r * 0.1, r * 1.2, r * 0.16, 1.5, '#5a3a1a', OL);
  leg(1, ph, false);
  fur(hx, hy, r * 0.5, r * 0.46, 0, c, dk);
  fur(hx + r * 0.38, hy + r * 0.12, r * 0.24, r * 0.2, 0, '#fff8ec', '#d8cbb0');
  ball(x, hx + r * 0.6, hy + r * 0.03, r * 0.08, '#ff8aa0', '#c04060', OL);
  for (const k of [-1, 0, 1]) seg(x, hx + r * 0.45, hy + r * 0.12, hx + r * 0.85, hy + r * (0.08 + k * 0.1), 'rgba(40,30,20,0.6)', 0.6);
  x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(hx + r * 0.2, hy - r * 0.08, r * 0.14, r * 0.17, 0, 0, TAU); x.fill(); x.strokeStyle = OL; x.lineWidth = 0.9; x.stroke();
  ball(x, hx + r * 0.24, hy - r * 0.06, r * 0.1, d.ag ? '#ff5040' : '#5a2a1a', '#100808'); circ(x, hx + r * 0.21, hy - r * 0.11, r * 0.035, '#ffffff');
  seg(x, hx + r * 0.05, hy - r * (d.ag ? 0.22 : 0.3), hx + r * 0.35, hy - r * (d.ag ? 0.3 : 0.32), mix(dk, '#000000', 0.4), 1.2);
  ball(x, hx + r * 0.05, hy + r * 0.2, r * 0.09, 'rgba(255,150,160,0.6)', 'rgba(255,150,160,0)');
  if (atk) tri(x, hx + r * 0.45, hy + r * 0.28, hx + r * 0.55, hy + r * 0.28, hx + r * 0.5, hy + r * 0.42, '#ffffff');
  x.save(); x.translate(hx + r * 0.05, hy - r * 0.35); x.rotate(-0.15 + ea); fur(0, -r * 0.62, r * 0.18, r * 0.66, 0, c, dk); x.fillStyle = '#f4a8b8'; x.beginPath(); x.ellipse(r * 0.02, -r * 0.62, r * 0.08, r * 0.48, 0, 0, TAU); x.fill(); x.restore();
  const hd = arm(1, false, atk);
  x.save(); x.translate(hd.x, hd.y); x.rotate(atk ? 1.0 : 0.85 + sn * 0.12);
  shape(x, [-r * 0.12, r * 0.1, r * 0.12, r * 0.1, r * 0.3, -r * 1.05, 0, -r * 1.25, -r * 0.3, -r * 1.05], lg(x, -r * 0.3, 0, r * 0.3, 0, '#ffa040', '#c05a10'), OL, 1.1);
  for (let i = 1; i < 4; i++) seg(x, -r * 0.2, -r * 0.25 * i, r * 0.05, -r * 0.25 * i - r * 0.05, 'rgba(120,50,0,0.6)', 0.8);
  for (const a of [-0.5, 0, 0.5]) { x.save(); x.translate(0, -r * 1.2); x.rotate(a); shape(x, [0, 0, -r * 0.1, -r * 0.35, 0, -r * 0.5, r * 0.1, -r * 0.35], '#5aa83a', OL, 0.8); x.restore(); }
  box(x, -r * 0.1, -r * 0.05, r * 0.2, r * 0.3, 1, '#6a4224', OL);
  x.restore();
  ball(x, hd.x, hd.y, r * 0.13, hi, c, OL);
  if (atk) { x.globalAlpha = 0.5; x.strokeStyle = '#ffffff'; x.lineWidth = 2; x.beginPath(); x.arc(r * 0.3, shY, r * 1.3, -1.6, 0.4); x.stroke(); x.globalAlpha = 1; }
}
function paintGob(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean): void {
  const r = d.r, red = d.n.indexOf('紅帽') >= 0, skin = '#8ab650', skinD = '#3e6224', ph = (f / 6) * TAU, sn = atk ? 0 : Math.sin(ph);
  const cl0 = red ? '#c0503a' : '#8a6a42', cl1 = red ? '#5a1a10' : '#4a3018';
  const bob = atk ? r * 0.05 : -Math.abs(Math.sin(ph)) * r * 0.12, lean = atk ? r * 0.25 : r * 0.12;
  const hipY = -r * 0.85 + bob, shY = -r * 1.65 + bob, hx = lean + r * 0.35, hy = -r * 1.95 + bob;
  const leg = (sg: number, a: number, far: boolean): void => {
    const col = far ? mix(skinD, '#000000', 0.2) : skin, c1 = far ? mix(skinD, '#000000', 0.4) : skinD, hp = { x: sg * r * 0.18, y: hipY }, lift = Math.max(0, Math.cos(a)) * r * 0.18;
    const ft = { x: hp.x + Math.sin(a) * r * 0.45, y: -lift }, kn = { x: (hp.x + ft.x) / 2 + r * 0.22, y: (hp.y + ft.y) / 2 - lift * 0.5 };
    hl(x, hp.x, hp.y, kn.x, kn.y, r * 0.24, col, c1); hl(x, kn.x, kn.y, ft.x, ft.y - r * 0.1, r * 0.2, col, c1); ball(x, kn.x, kn.y, r * 0.13, col, c1, OL);
    shape(x, [ft.x - r * 0.2, ft.y - r * 0.15, ft.x + r * 0.35, ft.y - r * 0.08, ft.x + r * 0.42, ft.y + r * 0.03, ft.x - r * 0.22, ft.y + r * 0.03], lg(x, 0, ft.y - r * 0.15, 0, ft.y, col, c1), OL, 1);
    for (let i = 0; i < 3; i++) circ(x, ft.x + r * 0.35 + i * r * 0.03, ft.y - r * 0.04 + i * r * 0.03, r * 0.03, '#e8e0c8');
  };
  const arm = (sg: number, far: boolean, a: number, b: number): Pt => {
    const col = far ? mix(skinD, '#000000', 0.2) : skin, c1 = far ? mix(skinD, '#000000', 0.4) : skinD, s0 = { x: lean + sg * r * 0.3, y: shY + r * 0.12 };
    const e = { x: s0.x + Math.sin(a) * r * 0.5, y: s0.y + Math.cos(a) * r * 0.5 }, h2 = { x: e.x + Math.sin(a + b) * r * 0.48, y: e.y + Math.cos(a + b) * r * 0.48 };
    hl(x, s0.x, s0.y, e.x, e.y, r * 0.2, col, c1); hl(x, e.x, e.y, h2.x, h2.y, r * 0.18, col, c1); ball(x, h2.x, h2.y, r * 0.13, col, c1, OL); return h2;
  };
  arm(-1, true, 0.2 - sn * 0.5, 0.6);
  leg(-1, ph + Math.PI, true);
  shape(x, [lean - r * 0.42, shY, lean + r * 0.38, shY - r * 0.05, r * 0.32, hipY + r * 0.05, -r * 0.36, hipY + r * 0.05], lg(x, -r * 0.4, 0, r * 0.4, 0, mix(skin, '#ffffff', 0.15), skinD), OL, 1.2);
  shape(x, [lean - r * 0.1, shY + r * 0.25, lean + r * 0.25, shY + r * 0.2, r * 0.2, hipY - r * 0.1, -r * 0.05, hipY - r * 0.05], 'rgba(255,255,220,0.18)');
  seg(x, lean - r * 0.38, shY + r * 0.05, r * 0.3, hipY - r * 0.05, OL, r * 0.16); seg(x, lean - r * 0.38, shY + r * 0.05, r * 0.3, hipY - r * 0.05, '#6a4224', r * 0.1);
  box(x, r * 0.12, hipY - r * 0.3, r * 0.26, r * 0.24, 1.5, '#8a5a2a', OL);
  shape(x, [-r * 0.42, hipY - r * 0.08, r * 0.38, hipY - r * 0.08, r * 0.42 + sn * r * 0.05, hipY + r * 0.42, r * 0.05, hipY + r * 0.32, -r * 0.4 + sn * r * 0.05, hipY + r * 0.45], lg(x, 0, hipY, 0, hipY + r * 0.45, cl0, cl1), OL, 1.1);
  box(x, -r * 0.42, hipY - r * 0.14, r * 0.82, r * 0.12, 1, '#3a2614', OL);
  for (let i = 0; i < 4; i++) ball(x, lean - r * 0.2 + i * r * 0.14, shY + r * 0.12 + Math.abs(i - 1.5) * r * 0.05, r * 0.06, '#f4ecd8', '#a8a088', OL);
  leg(1, ph, false);
  shape(x, [hx - r * 0.35, hy - r * 0.08, hx - r * 1.15, hy - r * (0.45 + sn * 0.05), hx - r * 0.3, hy + r * 0.2], lg(x, hx - r, 0, hx, 0, skinD, skin), OL, 1.1);
  shape(x, [hx - r * 0.45, hy, hx - r * 0.95, hy - r * 0.3, hx - r * 0.4, hy + r * 0.1], '#c87a70');
  x.beginPath(); x.ellipse(hx, hy, r * 0.45, r * 0.42, 0, 0, TAU); x.fillStyle = lg(x, hx - r * 0.4, hy - r * 0.4, hx + r * 0.4, hy + r * 0.4, mix(skin, '#ffffff', 0.25), skinD); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke();
  shape(x, [hx + r * 0.35, hy - r * 0.1, hx + r * 0.95, hy + r * 0.2, hx + r * 0.38, hy + r * 0.15], lg(x, hx + r * 0.3, 0, hx + r, 0, skin, skinD), OL, 1);
  shape(x, [hx - r * 0.05, hy + r * 0.2, hx + r * 0.45, hy + r * 0.2, hx + r * 0.4, hy + r * (atk ? 0.4 : 0.3), hx, hy + r * (atk ? 0.4 : 0.3)], '#2a0a08', OL, 0.8);
  for (let i = 0; i < 3; i++) tri(x, hx + r * (0.02 + i * 0.14), hy + r * 0.2, hx + r * (0.08 + i * 0.14), hy + r * 0.31, hx + r * (0.14 + i * 0.14), hy + r * 0.2, '#f4ecc8');
  x.fillStyle = '#fff060'; x.beginPath(); x.ellipse(hx + r * 0.2, hy - r * 0.08, r * 0.12, r * 0.09, -0.2, 0, TAU); x.fill(); x.strokeStyle = OL; x.lineWidth = 0.8; x.stroke(); circ(x, hx + r * 0.24, hy - r * 0.08, r * 0.045, '#200000');
  seg(x, hx + r * 0.02, hy - r * 0.24, hx + r * 0.36, hy - r * 0.16, '#1a2a0a', 1.6);
  if (red) { x.beginPath(); x.moveTo(hx - r * 0.48, hy - r * 0.12); x.quadraticCurveTo(hx - r * 0.3, hy - r * 0.75, hx + r * 0.2, hy - r * 0.52); x.quadraticCurveTo(hx - r * 0.55 - sn * r * 0.1, hy - r * 1.1, hx - r * 0.75 - sn * r * 0.15, hy - r * 0.7); x.quadraticCurveTo(hx - r * 0.55, hy - r * 0.45, hx + r * 0.42, hy - r * 0.2); x.closePath(); x.fillStyle = lg(x, 0, hy - r, 0, hy, '#e06050', '#7a1a10'); x.fill(); x.strokeStyle = OL; x.lineWidth = 1; x.stroke(); ball(x, hx - r * 0.75 - sn * r * 0.15, hy - r * 0.72, r * 0.1, '#ffffff', '#c0c0c0', OL); }
  else { for (let i = 0; i < 3; i++) seg(x, hx - r * 0.2 + i * r * 0.12, hy - r * 0.38, hx - r * 0.28 + i * r * 0.15, hy - r * 0.6, '#2a1a0a', 1.2); }
  const hd = arm(1, false, atk ? 1.6 : 0.5 + sn * 0.4, atk ? 0.1 : 0.9);
  x.save(); x.translate(hd.x, hd.y); x.rotate(atk ? 1.5 : 0.3 + sn * 0.2);
  if (red) { box(x, -r * 0.07, -r * 1.1, r * 0.14, r * 1.25, 1, lg(x, -r * 0.1, 0, r * 0.1, 0, '#8a5a30', '#4a2a14'), OL); ball(x, 0, -r * 1.15, r * 0.24, '#7a4a24', '#3a2010', OL); for (let i = 0; i < 5; i++) { const a2 = (i / 5) * TAU; tri(x, Math.cos(a2) * r * 0.2, -r * 1.15 + Math.sin(a2) * r * 0.2, Math.cos(a2) * r * 0.38, -r * 1.15 + Math.sin(a2) * r * 0.38, Math.cos(a2 + 0.3) * r * 0.2, -r * 1.15 + Math.sin(a2 + 0.3) * r * 0.2, '#c8ccd0'); } }
  else { shape(x, [-r * 0.08, -r * 0.1, -r * 0.1, -r * 0.6, -r * 0.02, -r * 0.7, r * 0.06, -r * 0.62, r * 0.13, -r * 0.85, r * 0.1, -r * 0.4, r * 0.08, -r * 0.1], lg(x, -r * 0.1, 0, r * 0.13, 0, '#c8b8a0', '#6a5a48'), OL, 1); seg(x, -r * 0.18, -r * 0.08, r * 0.18, -r * 0.08, '#5a3a22', 2.2); box(x, -r * 0.05, -r * 0.06, r * 0.1, r * 0.25, 1, '#4a2a14', OL); circ(x, 0, -r * 0.45, r * 0.03, 'rgba(120,60,20,0.7)'); }
  x.restore();
  ball(x, hd.x, hd.y, r * 0.13, skin, skinD, OL);
}
const MHT = [23,42,31,24,34,36,63,30,64,27,52,66,40,25,42,25,68,64,29,27,78,49,65,105,114,117,36,30,51,45,94,55,61,39,49,109,27,67,66,63,91];
function mvk(i: number): number { if (i >= 100) return 1.35; const d = MD[i]; return !d || d.b ? 1 : Math.max(1, 54 / (MHT[i] ?? 54)); }
function smp(x: CanvasRenderingContext2D, p: number[], fill: string | CanvasGradient, lw: number): void {
  const n = p.length / 2; if (n < 3) return; x.beginPath();
  const mx = (i: number): number => ((p[(i % n) * 2] ?? 0) + (p[((i + 1) % n) * 2] ?? 0)) / 2, my = (i: number): number => ((p[(i % n) * 2 + 1] ?? 0) + (p[((i + 1) % n) * 2 + 1] ?? 0)) / 2;
  x.moveTo(mx(0), my(0)); for (let i = 1; i <= n; i++) x.quadraticCurveTo(p[(i % n) * 2] ?? 0, p[(i % n) * 2 + 1] ?? 0, mx(i), my(i));
  x.closePath(); x.fillStyle = fill; x.fill(); if (lw > 0) { x.strokeStyle = OL; x.lineWidth = lw; x.stroke(); }
}
function tuft(x: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, a: number, col: string): void { x.save(); x.translate(cx, cy); x.rotate(a); shape(x, [-w, 0, w, 0, w * 0.2, -h], col, OL, 0.8); x.restore(); }
function wingB(x: CanvasRenderingContext2D, bx: number, by: number, s: number, fl: number, c0: string, c1: string): void {
  const tipX = bx - s * 1.9, tipY = by - s * (1.3 + fl * 0.7);
  shape(x, [bx, by, bx - s * 0.7, tipY + s * 0.2, tipX, tipY, tipX - s * 0.1, by - s * 0.2 + fl * s * 0.3, tipX + s * 0.45, by + s * 0.1, tipX + s * 0.9, by - s * 0.05, bx - s * 0.6, by + s * 0.35], lg(x, bx, by, tipX, tipY, c0, c1), OL, 1.1);
  for (const k of [0.45, 0.72, 1]) seg(x, bx - s * 0.7, tipY + s * 0.2, tipX + s * 0.9 * (1 - k) + s * 0.1, by + s * 0.1 * k, mix(c1, '#000000', 0.4), 1);
  seg(x, bx, by, bx - s * 0.7, tipY + s * 0.2, mix(c1, '#000000', 0.3), 2); seg(x, bx - s * 0.7, tipY + s * 0.2, tipX, tipY, mix(c1, '#000000', 0.3), 1.6);
}
interface BO { sk: number; hd: number; wp: number; tl: number; wg: number; hn: number; bk: number; c3: string; fm?: number; cp?: string }
function paintBiped(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean, o: BO): void {
  const r = d.r, c = o.sk === 7 ? '#6a3424' : d.c, dk = o.sk === 7 ? '#1a0806' : d.c2, hi = mix(c, '#ffffff', 0.42), sh = mix(dk, '#000000', 0.25), ph = (f / 6) * TAU, sn = atk ? 0 : Math.sin(ph), cs = atk ? 0 : Math.cos(ph);
  const bk = o.bk, wide = o.hd === 9 || o.hd === 1 ? 1.4 : o.hd === 3 ? 0.78 : o.hd === 6 || o.hd === 5 ? 0.85 : 1;
  const bob = atk ? r * 0.12 : -Math.abs(cs) * r * 0.08, hipY = -r * 1.15 * bk + bob, shY = -r * 2.3 * bk + bob;
  const hunch = o.hd === 10 || o.hd === 2 || o.hd === 1 || o.hd === 0 ? r * 0.22 : 0, lean = (atk ? (ATKPH ? r * 0.18 : -r * 0.08) : 0) + hunch;
  const ws = r * 0.6 * wide, wa = r * 0.4 * wide, robe = o.sk === 4, bone = o.sk === 2, met = o.sk === 3, stone = o.sk === 5;
  const digi = o.hd === 0 || o.hd === 2 || o.hd === 7 || o.hd === 8 || o.hd === 11;
  const lc = (far: boolean): string => far ? sh : c, ld = (far: boolean): string => far ? mix(sh, '#000000', 0.35) : dk;
  const metG = (x0: number, y0: number, x1: number, y1: number, far: boolean): CanvasGradient => lg(x, x0, y0, x1, y1, far ? mix(c, '#000000', 0.35) : mix(c, '#ffffff', 0.35), far ? mix(dk, '#000000', 0.4) : dk);
  const legW = r * (bone ? 0.13 : o.hd === 9 ? 0.42 : o.hd === 1 ? 0.36 : 0.26);
  const leg = (sg: number, a: number, far: boolean): void => {
    if (robe) return;
    const hx0 = sg * wa * 0.55 + lean * 0.3, st = atk ? sg * r * 0.35 : Math.sin(a) * r * 0.42, lift = atk ? 0 : Math.max(0, -Math.cos(a)) * r * 0.22;
    const fx = hx0 + st, kn = { x: (hx0 + fx) / 2 + r * 0.2, y: (hipY - lift) / 2 - r * 0.05 };
    const col = lc(far);
    if (digi) { const hk = { x: fx - r * 0.22, y: -r * 0.32 - lift }; limb(x, [hx0, hipY, kn.x, kn.y], legW * 1.25, col); limb(x, [kn.x, kn.y, hk.x, hk.y, fx + r * 0.05, -lift], legW * 0.8, col); }
    else limb(x, [hx0, hipY, kn.x, kn.y, fx, -r * 0.12 - lift], legW, col);
    if (met) { ball(x, kn.x, kn.y, legW * 0.75, far ? sh : hi, dk, OL); box(x, fx - r * 0.15, -r * 0.55 - lift, r * 0.3, r * 0.45, 2, metG(fx, -r * 0.5, fx, 0, far), OL); }
    if (bone) ball(x, kn.x, kn.y, legW * 0.9, far ? sh : '#ffffff', dk, OL);
    if (met || o.hd === 4 || o.hd === 5 || o.hd === 6) shape(x, [fx - r * 0.2, -lift, fx + r * 0.42, -lift, fx + r * 0.36, -r * 0.2 - lift, fx - r * 0.18, -r * 0.24 - lift], far ? '#2a2030' : '#4a3a3a', OL, 1);
    else { ell(x, fx + r * 0.14, -r * 0.06 - lift, r * 0.3 * (o.hd === 9 ? 1.4 : 1), r * 0.12, col); x.strokeStyle = OL; x.lineWidth = 1; x.stroke(); for (let k = 0; k < 3; k++) tri(x, fx + r * (0.3 + k * 0.08), -r * (0.12 - k * 0.04) - lift, fx + r * (0.5 + k * 0.06), -r * (0.02 - k * 0.04) - lift, fx + r * (0.3 + k * 0.08), -r * (0.02 - k * 0.04) - lift, bone ? '#d8d0c0' : '#efe8d8'); }
  };
  const armW = r * (bone ? 0.12 : o.hd === 9 ? 0.4 : o.hd === 1 ? 0.34 : 0.22), aL = r * (o.hd === 1 || o.hd === 9 ? 0.72 : 0.6);
  const arm = (sg: number, far: boolean, mode: number): Pt => {
    const s0 = { x: sg * ws * 0.8 + lean, y: shY + r * 0.15 }, a = mode === 2 ? (ATKPH ? 1.1 : -2.5) : mode === 1 ? (ATKPH ? -0.5 : 0.5) : 0.15 - sn * 0.45 * sg, e = { x: s0.x + Math.sin(a) * aL, y: s0.y + Math.cos(a) * aL }, a2 = a + (mode === 2 ? (ATKPH ? 0.4 : 0.9) : mode === 1 ? -0.9 : 0.7), hd = { x: e.x + Math.sin(a2) * aL, y: e.y + Math.cos(a2) * aL };
    const col = lc(far); limb(x, [s0.x, s0.y, e.x, e.y, hd.x, hd.y], armW, col);
    if (bone) ball(x, e.x, e.y, armW * 0.9, far ? sh : '#ffffff', dk, OL);
    if (met || o.hd === 9) { ball(x, s0.x, s0.y - r * 0.05, r * (o.hd === 9 ? 0.45 : 0.36), far ? sh : hi, ld(far), OL); box(x, e.x - armW * 0.7, e.y, armW * 1.4, r * 0.35, 2, met ? metG(e.x, e.y, e.x + 3, e.y + 6, far) : col, OL); }
    if (o.hd === 1) for (let k = 0; k < 3; k++) tuft(x, e.x + (hd.x - e.x) * k * 0.3, e.y + (hd.y - e.y) * k * 0.3, r * 0.12, r * 0.28, -1.8 + k * 0.1, far ? sh : hi);
    ball(x, hd.x, hd.y, armW * 0.85, far ? sh : hi, ld(far), OL);
    if (o.wp === 0) for (let k = -1; k <= 1; k++) { const ca = a2 + k * 0.35; seg(x, hd.x, hd.y, hd.x + Math.sin(ca) * r * 0.32, hd.y + Math.cos(ca) * r * 0.32, '#f0ead8', 1.6); }
    return hd;
  };
  const fl = Math.sin(ph * 1) * 0.6 + (atk ? 0.8 : 0);
  if (o.cp) { const cw2 = Math.sin(ph) * r * 0.12 - (atk ? r * 0.2 : 0); smp(x, [-ws * 0.95 + lean, shY - r * 0.02, ws * 0.5 + lean, shY - r * 0.08, wa * 0.3, -r * 0.15, -wa - r * 0.5 + cw2, -r * 0.02, -ws - r * 0.55 + cw2, hipY + r * 0.2], lg(x, 0, shY, 0, 0, o.cp, mix(o.cp, '#000000', 0.6)), 1.2); for (let k = 0; k < 3; k++) seg(x, -ws * 0.6 + k * r * 0.25 + lean * 0.5, shY + r * 0.3, -wa - r * 0.4 + k * r * 0.3 + cw2, -r * 0.1, al(mix(o.cp, '#000000', 0.5), 0.6), 1.2); }
  if (o.wg) { wingB(x, -ws * 0.4 + lean * 0.5, shY + r * 0.2, r * 0.85, fl, mix(c, '#000000', 0.2), sh); }
  if (o.tl) { const t0 = { x: -wa * 0.8, y: hipY + r * 0.05 }, tw = Math.sin(ph) * r * 0.25; x.lineCap = 'round';
    if (o.hd === 7 || o.hd === 8) { seg(x, t0.x, t0.y, t0.x - r * 0.8, t0.y + r * 0.6 + tw, OL, r * 0.2); seg(x, t0.x, t0.y, t0.x - r * 0.8, t0.y + r * 0.6 + tw, dk, r * 0.13); tri(x, t0.x - r * 0.95, t0.y + r * 0.45 + tw, t0.x - r * 0.65, t0.y + r * 0.62 + tw, t0.x - r * 1.05, t0.y + r * 0.85 + tw, dk); }
    else if (o.hd === 2) { shape(x, [t0.x + r * 0.1, t0.y - r * 0.25, t0.x - r * 0.7, t0.y + r * 0.35 + tw * 0.5, t0.x - r * 1.5, t0.y + r * 0.95 + tw, t0.x - r * 0.6, t0.y + r * 0.6, t0.x + r * 0.1, t0.y + r * 0.25], lg(x, 0, t0.y - 4, 0, t0.y + 8, c, dk), OL, 1.1); }
    else { x.save(); x.translate(t0.x, t0.y); x.rotate(-0.8 + Math.sin(ph) * 0.2); smp(x, [0, -r * 0.15, -r * 0.5, -r * 0.4, -r * 1.0, -r * 0.2, -r * 0.85, r * 0.1, -r * 0.3, r * 0.15], lg(x, 0, -6, 0, 6, hi, dk), 1); x.restore(); }
  }
  arm(-1, true, atk ? 1 : 0);
  leg(-1, ph + Math.PI, true);
  // torso
  const tg = lg(x, -ws, shY, ws, hipY, hi, dk);
  if (robe) { const sw = Math.sin(ph) * r * 0.1; smp(x, [-ws * 0.9, shY + r * 0.05, ws + lean * 0.6, shY, ws * 0.95 + lean * 0.3, hipY, r * 0.85 + sw, -r * 0.05, r * 0.2, r * 0.05, -r * 0.75 + sw, -r * 0.02, -wa * 1.1, hipY], tg, 1.2);
    for (let k = 0; k < 3; k++) seg(x, -r * 0.3 + k * r * 0.3 + lean * 0.3, hipY + r * 0.2, -r * 0.45 + k * r * 0.38 + sw, -r * 0.08, al(dk, 0.6), 1);
    shape(x, [-r * 0.12 + lean, shY + r * 0.1, r * 0.12 + lean, shY + r * 0.1, r * 0.3, -r * 0.02, r * 0.0, -r * 0.02], o.c3, OL, 0.8);
    box(x, -wa * 1.05, hipY - r * 0.1, wa * 2.1 + lean * 0.3, r * 0.17, 1.5, '#3a2a1a', OL); ball(x, lean * 0.3 + r * 0.05, hipY - r * 0.02, r * 0.09, '#ffe08a', '#a07020', OL);
  } else if (bone) { seg(x, lean * 0.4, shY, 0, hipY, '#e8e0d0', r * 0.1); x.strokeStyle = OL; for (let k = 0; k < 4; k++) { const yy = shY + r * 0.15 + k * r * 0.2, w2 = ws * (0.95 - k * 0.12); x.lineWidth = 3; x.beginPath(); x.ellipse(lean * 0.35, yy, w2, r * 0.12, 0, 0.1, Math.PI - 0.1); x.strokeStyle = OL; x.stroke(); x.lineWidth = 1.6; x.strokeStyle = k % 2 ? '#d8d0c0' : '#f2ece0'; x.stroke(); }
    smp(x, [-wa, hipY - r * 0.1, wa, hipY - r * 0.12, wa * 0.7, hipY + r * 0.15, -wa * 0.7, hipY + r * 0.15], '#e8e0d0', 1);
    shape(x, [-wa * 1.1, hipY - r * 0.05, wa * 1.1, hipY - r * 0.05, wa * 0.9, hipY + r * 0.45, -wa * 0.6, hipY + r * 0.5], lg(x, 0, hipY, 0, hipY + 8, '#6a4a3a', '#3a2420'), OL, 1);
  } else {
    smp(x, [-ws, shY + r * 0.05, -ws * 0.2 + lean, shY - r * 0.15, ws + lean, shY, ws * 0.95 + lean * 0.6, (shY + hipY) / 2, wa + lean * 0.2, hipY + r * 0.05, -wa, hipY + r * 0.08, -ws * 0.9, (shY + hipY) / 2], met ? metG(-ws, shY, ws, hipY, false) : tg, 1.3);
    if (met) { seg(x, lean * 0.6, shY, lean * 0.2, hipY, al(dk, 0.8), 1.4); for (let k = 0; k < 3; k++) seg(x, -wa, hipY - r * 0.15 - k * r * 0.2, wa + lean * 0.4, hipY - r * 0.2 - k * r * 0.2, al(dk, 0.7), 1); for (const s2 of [-1, 1]) circ(x, s2 * ws * 0.5 + lean * 0.5, shY + r * 0.3, r * 0.05, '#f0e0a0'); if (o.hd === 4) ball(x, lean * 0.5, shY + r * 0.45, r * 0.16, o.c3, 'rgba(0,0,0,0)'); }
    else if (stone) { for (let k = 0; k < 4; k++) seg(x, -ws * 0.6 + k * r * 0.3, shY + r * 0.1 + (k % 2) * r * 0.3, -ws * 0.4 + k * r * 0.32, hipY - (k % 2) * r * 0.2, mix(dk, '#000000', 0.4), 1.2); ball(x, lean * 0.5, (shY + hipY) / 2, r * 0.32, o.c3, 'rgba(0,0,0,0)'); ball(x, lean * 0.5, (shY + hipY) / 2, r * 0.13, '#ffffff', o.c3); }
    else if (o.sk === 1) { smp(x, [-ws * 0.2 + lean * 0.6, shY + r * 0.15, ws * 0.8 + lean * 0.5, shY + r * 0.2, wa * 0.9 + lean * 0.2, hipY, -wa * 0.1 + lean * 0.2, hipY], lg(x, 0, shY, 0, hipY, '#f0e0a8', '#b8a070'), 0.8); for (let k = 1; k < 5; k++) seg(x, -ws * 0.15 + lean * 0.5, shY + k * r * 0.22, ws * 0.8 + lean * 0.4, shY + k * r * 0.22 + r * 0.04, 'rgba(90,70,30,0.6)', 0.8); }
    else if (o.sk === 0) { smp(x, [-ws * 0.1 + lean * 0.6, shY + r * 0.05, ws * 0.85 + lean * 0.5, shY + r * 0.15, wa * 0.8 + lean * 0.2, hipY - r * 0.1, lean * 0.2, hipY - r * 0.1], al(hi, 0.85), 0); for (let k = 0; k < 7; k++) tuft(x, -ws + k * r * 0.3 + lean * 0.3, shY + r * 0.02 - (k % 2) * r * 0.05, r * 0.14, r * (0.3 + (k % 3) * 0.08), -0.3 + k * 0.08, k % 2 ? c : hi); }
    else if (o.sk === 7) { const cr = (pts: number[]): void => { x.lineJoin = 'round'; x.beginPath(); x.moveTo(pts[0] ?? 0, pts[1] ?? 0); for (let q = 2; q < pts.length; q += 2) x.lineTo(pts[q] ?? 0, pts[q + 1] ?? 0); x.strokeStyle = 'rgba(255,120,20,0.55)'; x.lineWidth = 4; x.stroke(); x.strokeStyle = '#ffb030'; x.lineWidth = 1.8; x.stroke(); x.strokeStyle = '#fff0a0'; x.lineWidth = 0.7; x.stroke(); };
      cr([lean * 0.5, shY + r * 0.1, lean * 0.3 - r * 0.15, shY + r * 0.5, lean * 0.4 + r * 0.1, hipY - r * 0.2, lean * 0.2, hipY]); cr([-ws * 0.7, shY + r * 0.3, -ws * 0.3, shY + r * 0.55, lean * 0.3 - r * 0.15, shY + r * 0.5]); cr([ws * 0.8 + lean, shY + r * 0.25, ws * 0.4 + lean * 0.6, shY + r * 0.6, lean * 0.4 + r * 0.1, hipY - r * 0.2]); ball(x, lean * 0.45, shY + r * 0.55, r * 0.35, 'rgba(255,170,40,0.7)', 'rgba(255,80,0,0)'); }
    else if (o.sk === 6) { for (let k = 0; k < 4; k++) seg(x, -ws * 0.5 + lean * 0.4, shY + r * 0.3 + k * r * 0.18, ws * 0.6 + lean * 0.4, shY + r * 0.33 + k * r * 0.18, al(dk, 0.7), 1); shape(x, [-wa * 1.1, hipY - r * 0.1, wa * 1.1, hipY - r * 0.1, wa * 0.6, hipY + r * 0.5, -wa * 0.9, hipY + r * 0.45], '#4a3a2a', OL, 1); }
    if (o.sk !== 4 && !met && !stone && o.sk !== 6) box(x, -wa * 1.05, hipY - r * 0.12, wa * 2.1 + lean * 0.3, r * 0.16, 1.5, '#4a2c18', OL);
  }
  leg(1, ph, false);
  // head
  const hx = r * 0.18 + lean * 1.3, hy = shY - r * (o.hd === 9 ? 0.5 : o.hd === 1 ? 0.35 : 0.5), ag = d.ag, gl = o.c3;
  const glowE = (ex: number, ey: number, rr: number, col: string): void => { ball(x, ex, ey, rr * 2.6, al(col, 0.45), al(col, 0)); ball(x, ex, ey, rr, '#ffffff', col); };
  if (o.hd === 0) { // wolf
    smp(x, [hx - r * 0.45, hy + r * 0.1, hx - r * 0.3, hy - r * 0.4, hx + r * 0.25, hy - r * 0.42, hx + r * 0.5, hy - r * 0.15, hx + r * 1.05, hy + r * 0.05, hx + r * 1.0, hy + r * 0.25, hx + r * 0.3, hy + r * 0.35], lg(x, hx, hy - r * 0.4, hx, hy + r * 0.35, hi, dk), 1.2);
    if (atk) shape(x, [hx + r * 0.3, hy + r * 0.3, hx + r * 0.95, hy + r * 0.28, hx + r * 0.85, hy + r * 0.6, hx + r * 0.25, hy + r * 0.45], '#5a1a1a', OL, 1);
    for (let k = 0; k < 3; k++) tri(x, hx + r * (0.55 + k * 0.15), hy + r * 0.25, hx + r * (0.62 + k * 0.15), hy + r * 0.25, hx + r * (0.58 + k * 0.15), hy + r * 0.38, '#ffffff');
    ball(x, hx + r * 1.02, hy + r * 0.08, r * 0.08, '#2a2020', '#000000');
    for (const k of [0, 1]) shape(x, [hx - r * (0.3 - k * 0.25), hy - r * 0.3, hx - r * (0.15 - k * 0.25), hy - r * 0.95, hx + r * (0.0 + k * 0.25), hy - r * 0.32], k ? c : sh, OL, 1);
    glowE(hx + r * 0.4, hy - r * 0.12, r * 0.07, ag ? '#ffd020' : '#ffb020'); seg(x, hx + r * 0.25, hy - r * 0.28, hx + r * 0.55, hy - r * 0.2, OL, 1.4);
    for (let k = 0; k < 5; k++) tuft(x, hx - r * 0.5 + k * r * 0.08, hy + r * 0.05 + k * r * 0.08, r * 0.12, r * 0.4, -2.2 + k * 0.15, k % 2 ? c : sh);
  } else if (o.hd === 1) { // yeti
    smp(x, [hx - r * 0.55, hy + r * 0.3, hx - r * 0.5, hy - r * 0.35, hx, hy - r * 0.62, hx + r * 0.5, hy - r * 0.38, hx + r * 0.62, hy + r * 0.2, hx + r * 0.25, hy + r * 0.55], lg(x, hx, hy - r * 0.6, hx, hy + r * 0.5, '#ffffff', dk), 1.3);
    smp(x, [hx - r * 0.05, hy - r * 0.15, hx + r * 0.5, hy - r * 0.2, hx + r * 0.58, hy + r * 0.25, hx + r * 0.3, hy + r * 0.48, hx, hy + r * 0.3], lg(x, hx, hy, hx, hy + r * 0.5, '#a8c4dc', '#5a7a9a'), 1);
    seg(x, hx + r * 0.02, hy - r * 0.18, hx + r * 0.55, hy - r * (ag ? 0.1 : 0.2), '#3a4a5a', 3);
    glowE(hx + r * 0.2, hy - r * 0.05, r * 0.06, '#40c8ff'); glowE(hx + r * 0.45, hy - r * 0.04, r * 0.06, '#40c8ff');
    shape(x, [hx + r * 0.12, hy + r * 0.22, hx + r * 0.52, hy + r * 0.2, hx + r * 0.45, hy + r * (atk ? 0.5 : 0.35), hx + r * 0.18, hy + r * (atk ? 0.48 : 0.33)], '#3a1020', OL, 1);
    tri(x, hx + r * 0.16, hy + r * 0.22, hx + r * 0.24, hy + r * 0.22, hx + r * 0.2, hy + r * 0.38, '#ffffff'); tri(x, hx + r * 0.42, hy + r * 0.21, hx + r * 0.5, hy + r * 0.21, hx + r * 0.46, hy + r * 0.37, '#ffffff');
    for (let k = 0; k < 6; k++) tuft(x, hx - r * 0.45 + k * r * 0.16, hy - r * 0.45 - (k % 2) * r * 0.08, r * 0.14, r * 0.3, -0.6 + k * 0.22, k % 2 ? '#ffffff' : '#dce8f4');
  } else if (o.hd === 2 || o.hd === 8) { // lizard / gargoyle
    const op = atk ? r * 0.25 : 0;
    smp(x, [hx - r * 0.35, hy + r * 0.15, hx - r * 0.25, hy - r * 0.35, hx + r * 0.3, hy - r * 0.38, hx + r * 1.05, hy - r * 0.05, hx + r * 1.0, hy + r * 0.12, hx + r * 0.2, hy + r * 0.2], lg(x, hx, hy - r * 0.4, hx, hy + r * 0.2, hi, dk), 1.2);
    smp(x, [hx - r * 0.2, hy + r * 0.15, hx + r * 0.85, hy + r * 0.12 + op * 0.4, hx + r * 0.7, hy + r * 0.32 + op, hx, hy + r * 0.38], lg(x, hx, hy, hx, hy + 6, c, dk), 1.1);
    if (atk) { ell(x, hx + r * 0.55, hy + r * 0.2 + op * 0.4, r * 0.35, r * 0.08 + op * 0.25, '#4a0a10'); x.strokeStyle = '#e04060'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(hx + r * 0.6, hy + r * 0.2 + op * 0.4); x.lineTo(hx + r * 1.2, hy + r * 0.3); x.lineTo(hx + r * 1.3, hy + r * 0.2); x.stroke(); }
    for (let k = 0; k < 4; k++) tri(x, hx + r * (0.4 + k * 0.15), hy + r * 0.12, hx + r * (0.47 + k * 0.15), hy + r * 0.12, hx + r * (0.43 + k * 0.15), hy + r * 0.24, '#fffbe8');
    glowE(hx + r * 0.38, hy - r * 0.15, r * 0.07, o.hd === 8 ? gl : '#ffe040'); seg(x, hx + r * 0.38, hy - r * 0.22, hx + r * 0.38, hy - r * 0.08, '#000000', 1.2);
    if (o.hd === 2) for (let k = 0; k < 5; k++) tri(x, hx - r * 0.35 - k * r * 0.12, hy - r * 0.3 + k * r * 0.22, hx - r * 0.15 - k * r * 0.12, hy - r * 0.32 + k * r * 0.22, hx - r * 0.45 - k * r * 0.14, hy - r * 0.55 + k * r * 0.2, o.c3);
  } else if (o.hd === 3) { // skull
    smp(x, [hx - r * 0.35, hy, hx - r * 0.25, hy - r * 0.42, hx + r * 0.3, hy - r * 0.45, hx + r * 0.5, hy - r * 0.05, hx + r * 0.4, hy + r * 0.2, hx - r * 0.1, hy + r * 0.2], lg(x, hx, hy - r * 0.4, hx, hy + r * 0.2, '#fffaf0', '#b0a890'), 1.2);
    box(x, hx - r * 0.05, hy + r * 0.15 + (atk ? r * 0.12 : 0), r * 0.45, r * 0.18, 2, '#e0d8c4', OL); for (let k = 0; k < 4; k++) seg(x, hx + r * (0.02 + k * 0.1), hy + r * 0.15, hx + r * (0.02 + k * 0.1), hy + r * 0.24, OL, 0.8);
    ell(x, hx + r * 0.25, hy - r * 0.1, r * 0.12, r * 0.14, '#1a1014'); ell(x, hx - r * 0.02, hy - r * 0.1, r * 0.1, r * 0.13, '#1a1014'); glowE(hx + r * 0.25, hy - r * 0.08, r * 0.05, gl); glowE(hx - r * 0.02, hy - r * 0.08, r * 0.04, gl);
    tri(x, hx + r * 0.38, hy + r * 0.04, hx + r * 0.46, hy + r * 0.1, hx + r * 0.36, hy + r * 0.12, '#2a1a1a');
    shape(x, [hx - r * 0.4, hy - r * 0.2, hx - r * 0.3, hy - r * 0.55, hx + r * 0.35, hy - r * 0.58, hx + r * 0.5, hy - r * 0.25], lg(x, hx, hy - r * 0.6, hx, hy - r * 0.2, '#a0a8b0', '#4a5058'), OL, 1.1); seg(x, hx - r * 0.42, hy - r * 0.2, hx + r * 0.55, hy - r * 0.24, '#6a3a2a', 2);
  } else if (o.hd === 4) { // helm
    smp(x, [hx - r * 0.35, hy + r * 0.25, hx - r * 0.38, hy - r * 0.35, hx, hy - r * 0.55, hx + r * 0.4, hy - r * 0.35, hx + r * 0.45, hy + r * 0.25], metG(hx - 5, hy - 8, hx + 5, hy + 5, false), 1.3);
    box(x, hx - r * 0.05, hy - r * 0.12, r * 0.5, r * 0.1, 1, '#100810', OL); ball(x, hx + r * 0.25, hy - r * 0.07, r * 0.25, al(gl, 0.5), al(gl, 0)); seg(x, hx, hy - r * 0.07, hx + r * 0.42, hy - r * 0.07, gl, 1.6);
    seg(x, hx + r * 0.05, hy - r * 0.52, hx + r * 0.05, hy + r * 0.2, al(dk, 0.7), 1.2); for (let k = 0; k < 3; k++) seg(x, hx + r * 0.15, hy + r * (0.05 + k * 0.07), hx + r * 0.4, hy + r * (0.05 + k * 0.07), OL, 0.8);
    x.save(); x.translate(hx, hy - r * 0.5); x.rotate(-0.4 + sn * 0.1); smp(x, [0, 0, -r * 0.4, -r * 0.35, -r * 0.95, -r * 0.2, -r * 1.1, r * 0.2, -r * 0.5, r * 0.05], lg(x, 0, -6, 0, 6, '#ff6070', '#901020'), 1); x.restore();
  } else if (o.hd === 5 || o.hd === 6) { // hood / elf
    if (o.hd === 6) { for (let k = 0; k < 5; k++) smp(x, [hx - r * 0.2, hy - r * 0.3, hx - r * (0.5 + k * 0.08), hy + r * (0.3 + k * 0.12) + sn * r * 0.05, hx - r * (0.3 + k * 0.04), hy + r * (0.5 + k * 0.1), hx - r * 0.05, hy], k % 2 ? '#e8e8f8' : '#c8c8e0', 0.8);
      smp(x, [hx - r * 0.25, hy - r * 0.1, hx, hy - r * 0.42, hx + r * 0.35, hy - r * 0.3, hx + r * 0.42, hy + r * 0.1, hx + r * 0.2, hy + r * 0.35, hx - r * 0.1, hy + r * 0.25], lg(x, hx, hy - 6, hx, hy + 6, '#a898c0', '#5a4a78'), 1.1);
      shape(x, [hx - r * 0.1, hy - r * 0.05, hx - r * 0.65, hy - r * 0.45, hx - r * 0.05, hy - r * 0.18], '#8a7aa8', OL, 1);
      smp(x, [hx - r * 0.3, hy - r * 0.2, hx - r * 0.1, hy - r * 0.5, hx + r * 0.35, hy - r * 0.42, hx + r * 0.4, hy - r * 0.2, hx + r * 0.05, hy - r * 0.28], '#f0f0ff', 1);
      glowE(hx + r * 0.25, hy - r * 0.06, r * 0.05, gl); seg(x, hx + r * 0.15, hy - r * 0.16, hx + r * 0.35, hy - r * 0.12, OL, 1.1); seg(x, hx + r * 0.22, hy + r * 0.2, hx + r * 0.35, hy + r * 0.18, '#3a1a3a', 1);
    } else { const hc = mix(c, '#000000', 0.15);
      smp(x, [hx - r * 0.5, hy + r * 0.45, hx - r * 0.45, hy - r * 0.3, hx - r * 0.1, hy - r * 0.62, hx + r * 0.2, hy - r * 0.7, hx + r * 0.5, hy - r * 0.25, hx + r * 0.52, hy + r * 0.35], lg(x, hx, hy - 8, hx, hy + 6, mix(hc, '#ffffff', 0.25), dk), 1.3);
      tri(x, hx + r * 0.2, hy - r * 0.68, hx - r * 0.2, hy - r * 0.6, hx - r * 0.5, hy - r * 1.05, hc);
      smp(x, [hx - r * 0.05, hy - r * 0.25, hx + r * 0.42, hy - r * 0.22, hx + r * 0.45, hy + r * 0.25, hx + r * 0.05, hy + r * 0.28], '#120a18', 0);
      if (d.n.indexOf('妖魔') >= 0) { smp(x, [hx + r * 0.05, hy - r * 0.12, hx + r * 0.42, hy - r * 0.1, hx + r * 0.42, hy + r * 0.22, hx + r * 0.1, hy + r * 0.25], '#8a9a5a', 0.8); tri(x, hx + r * 0.2, hy + r * 0.2, hx + r * 0.27, hy + r * 0.2, hx + r * 0.23, hy + r * 0.06, '#ffffff'); }
      glowE(hx + r * 0.18, hy - r * 0.04, r * 0.05, gl); glowE(hx + r * 0.36, hy - r * 0.04, r * 0.05, gl);
      for (const s2 of [-1, 1]) circ(x, hx + s2 * r * 0.05 + r * 0.1, hy + r * 0.45, r * 0.05, '#ffe08a'); }
  } else if (o.hd === 7) { // demon
    smp(x, [hx - r * 0.38, hy + r * 0.2, hx - r * 0.35, hy - r * 0.35, hx + r * 0.1, hy - r * 0.5, hx + r * 0.5, hy - r * 0.25, hx + r * 0.6, hy + r * 0.15, hx + r * 0.2, hy + r * 0.42], lg(x, hx, hy - 8, hx, hy + 6, hi, dk), 1.2);
    for (const s2 of [0, 1]) { x.save(); x.translate(hx - r * 0.1 + s2 * r * 0.25, hy - r * 0.38); x.rotate(-0.4 + s2 * 0.3); smp(x, [-r * 0.1, 0, r * 0.1, 0, r * 0.05, -r * 0.4, -r * 0.3, -r * 0.75, -r * 0.12, -r * 0.35], lg(x, 0, 0, 0, -10, '#e8dcc0', '#6a5a40'), 1); x.restore(); }
    glowE(hx + r * 0.25, hy - r * 0.1, r * 0.07, '#ffe040'); glowE(hx + r * 0.48, hy - r * 0.08, r * 0.06, '#ffe040'); seg(x, hx + r * 0.1, hy - r * 0.25, hx + r * 0.55, hy - r * 0.12, OL, 1.6);
    shape(x, [hx + r * 0.15, hy + r * 0.18, hx + r * 0.55, hy + r * 0.12, hx + r * 0.45, hy + r * (atk ? 0.45 : 0.3)], '#3a0808', OL, 1); if (atk) ball(x, hx + r * 0.6, hy + r * 0.25, r * 0.3, 'rgba(255,220,80,0.9)', 'rgba(255,80,0,0)');
    for (let k = 0; k < 3; k++) tri(x, hx + r * (0.2 + k * 0.1), hy + r * 0.17, hx + r * (0.26 + k * 0.1), hy + r * 0.16, hx + r * (0.23 + k * 0.1), hy + r * 0.26, '#ffffff');
  } else if (o.hd === 11) { // goat
    for (const s2 of [0, 1]) { x.save(); x.translate(hx - r * 0.05 + s2 * r * 0.15, hy - r * 0.35); const sg = s2 ? 1 : -1; x.lineCap = 'round'; x.strokeStyle = OL; x.lineWidth = r * 0.24; x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-r * 0.6 * (s2 ? 0.7 : 1), -r * 0.6, -r * 1.05, r * 0.05, -r * 0.55, r * 0.35 + sg * r * 0.02); x.stroke(); x.strokeStyle = s2 ? '#d8c8a0' : '#8a7a5a'; x.lineWidth = r * 0.16; x.stroke(); for (let q = 1; q < 5; q++) { const t = q / 5; seg(x, -r * 0.75 * Math.sin(t * 2.6) - r * 0.05, -r * 0.5 * Math.sin(t * 3.1) + r * 0.25 * t, -r * 0.75 * Math.sin(t * 2.6) + r * 0.05, -r * 0.5 * Math.sin(t * 3.1) + r * 0.25 * t + r * 0.05, 'rgba(60,40,20,0.6)', 1); } x.restore(); }
    smp(x, [hx - r * 0.3, hy - r * 0.2, hx + r * 0.05, hy - r * 0.48, hx + r * 0.4, hy - r * 0.35, hx + r * 0.62, hy + r * 0.25, hx + r * 0.55, hy + r * 0.45, hx + r * 0.25, hy + r * 0.4, hx - r * 0.15, hy + r * 0.2], lg(x, hx, hy - r * 0.5, hx, hy + r * 0.45, hi, dk), 1.2);
    smp(x, [hx + r * 0.15, hy + r * 0.35, hx + r * 0.5, hy + r * 0.42, hx + r * 0.35, hy + r * 0.95 + sn * r * 0.04, hx + r * 0.2, hy + r * 0.6], '#2a1a24', 1);
    for (const s2 of [0, 1]) shape(x, [hx - r * 0.25 + s2 * r * 0.1, hy - r * 0.1, hx - r * 0.75 + s2 * r * 0.15, hy + r * 0.05, hx - r * 0.3 + s2 * r * 0.1, hy + r * 0.1], s2 ? c : sh, OL, 1);
    glowE(hx + r * 0.25, hy - r * 0.1, r * 0.07, gl); glowE(hx + r * 0.45, hy - r * 0.05, r * 0.06, gl);
    ball(x, hx + r * 0.58, hy + r * 0.3, r * 0.06, '#1a0a10', '#000000');
    x.strokeStyle = gl; x.lineWidth = 1; x.beginPath(); for (let q = 0; q <= 5; q++) { const a = -Math.PI / 2 + q * 4 * Math.PI / 5; const px = hx + r * 0.12 + Math.cos(a) * r * 0.1, py = hy - r * 0.3 + Math.sin(a) * r * 0.1; if (q) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); ball(x, hx + r * 0.12, hy - r * 0.3, r * 0.2, al(gl, 0.4), al(gl, 0));
  } else if (o.hd === 12) { // orc king
    smp(x, [hx - r * 0.4, hy + r * 0.15, hx - r * 0.35, hy - r * 0.3, hx + r * 0.1, hy - r * 0.42, hx + r * 0.5, hy - r * 0.25, hx + r * 0.58, hy + r * 0.15, hx + r * 0.35, hy + r * 0.45, hx - r * 0.1, hy + r * 0.42], lg(x, hx, hy - r * 0.4, hx, hy + r * 0.45, '#9ab06a', '#3a4a22'), 1.2);
    smp(x, [hx - r * 0.1, hy + r * 0.25, hx + r * 0.5, hy + r * 0.2, hx + r * 0.4, hy + r * 0.75 + sn * r * 0.03, hx + r * 0.15, hy + r * 0.9, hx - r * 0.1, hy + r * 0.6], lg(x, hx, hy, hx, hy + r * 0.9, '#5a3a22', '#1a0e06'), 1);
    for (let q = 0; q < 3; q++) seg(x, hx + q * r * 0.12, hy + r * 0.35, hx + q * r * 0.1 + r * 0.05, hy + r * 0.8, 'rgba(0,0,0,0.4)', 1);
    box(x, hx + r * 0.18, hy + r * 0.6, r * 0.12, r * 0.12, 1, '#ffd040', OL);
    for (const tx2 of [hx + r * 0.12, hx + r * 0.42]) shape(x, [tx2 - r * 0.05, hy + r * 0.22, tx2 + r * 0.05, hy + r * 0.22, tx2 + r * 0.02, hy - r * 0.02], '#fff8e0', OL, 0.8);
    seg(x, hx + r * 0.05, hy - r * 0.2, hx + r * 0.55, hy - r * (ag ? 0.08 : 0.15), '#2a3014', 3); glowE(hx + r * 0.22, hy - r * 0.06, r * 0.06, '#ff4020'); glowE(hx + r * 0.45, hy - r * 0.03, r * 0.05, '#ff4020');
    shape(x, [hx - r * 0.38, hy - r * 0.25, hx + r * 0.52, hy - r * 0.3, hx + r * 0.55, hy - r * 0.55, hx + r * 0.38, hy - r * 0.42, hx + r * 0.25, hy - r * 0.72, hx + r * 0.08, hy - r * 0.45, hx - r * 0.08, hy - r * 0.75, hx - r * 0.2, hy - r * 0.45, hx - r * 0.4, hy - r * 0.62], lg(x, hx, hy - r * 0.75, hx, hy - r * 0.25, '#fff0a0', '#b08010'), OL, 1.2);
    for (const [gx2, gc] of [[hx + r * 0.08, '#ff3040'], [hx + r * 0.32, '#40a0ff'], [hx - r * 0.18, '#40ff80']] as [number, string][]) ball(x, gx2, hy - r * 0.34, r * 0.05, '#ffffff', gc);
  } else if (o.hd === 9) { // golem
    smp(x, [hx - r * 0.3, hy + r * 0.15, hx - r * 0.25, hy - r * 0.32, hx + r * 0.35, hy - r * 0.35, hx + r * 0.42, hy + r * 0.12], lg(x, hx, hy - 6, hx, hy + 5, hi, dk), 1.3);
    box(x, hx - r * 0.05, hy - r * 0.12, r * 0.45, r * 0.12, 1, '#100810', OL); ball(x, hx + r * 0.22, hy - r * 0.06, r * 0.28, al(gl, 0.55), al(gl, 0)); seg(x, hx, hy - r * 0.06, hx + r * 0.38, hy - r * 0.06, '#ffffff', 1.4);
    for (let k = 0; k < 3; k++) { const a0 = -0.8 + k * 0.7; shape(x, [hx - r * 0.2 + k * r * 0.2, hy - r * 0.3, hx - r * 0.12 + k * r * 0.2 + Math.sin(a0) * r * 0.1, hy - r * 0.62, hx - r * 0.02 + k * r * 0.2, hy - r * 0.32], o.c3, OL, 0.8); }
  } else { // ghoul
    smp(x, [hx - r * 0.3, hy + r * 0.1, hx - r * 0.25, hy - r * 0.4, hx + r * 0.25, hy - r * 0.42, hx + r * 0.5, hy - r * 0.05, hx + r * 0.45, hy + r * 0.2, hx + r * 0.1, hy + r * 0.48], lg(x, hx, hy - 8, hx, hy + 8, hi, dk), 1.2);
    ell(x, hx + r * 0.25, hy - r * 0.12, r * 0.12, r * 0.1, '#1a1a10'); glowE(hx + r * 0.26, hy - r * 0.11, r * 0.045, '#d8ff60');
    shape(x, [hx + r * 0.05, hy + r * 0.15, hx + r * 0.45, hy + r * 0.12, hx + r * 0.38, hy + r * (atk ? 0.55 : 0.42), hx + r * 0.1, hy + r * 0.45], '#2a0a0a', OL, 1);
    for (let k = 0; k < 4; k++) { tri(x, hx + r * (0.1 + k * 0.08), hy + r * 0.15, hx + r * (0.15 + k * 0.08), hy + r * 0.15, hx + r * (0.12 + k * 0.08), hy + r * 0.25, '#e8e0b0'); }
    for (let k = 0; k < 4; k++) seg(x, hx - r * 0.2 + k * r * 0.08, hy - r * 0.38, hx - r * 0.45 + k * r * 0.05, hy + r * 0.15 + sn * r * 0.05, '#3a3a2a', 1);
  }
  if (o.hn) for (const s2 of [0, 1]) { x.save(); x.translate(hx - r * 0.15 + s2 * r * 0.3, hy - r * (o.hd === 1 ? 0.5 : 0.35)); x.rotate(-0.6 + s2 * 0.5); smp(x, [-r * 0.12, 0, r * 0.12, 0, r * 0.1, -r * 0.35, -r * 0.35, -r * 0.8, -r * 0.1, -r * 0.4], lg(x, 0, 0, 0, -12, '#f8f0d8', '#7a6a50'), 1); x.restore(); }
  if (o.fm) for (let q = 0; q < 7; q++) { const fx = hx - r * 0.45 + q * r * 0.15, fy = hy - r * 0.3 - Math.abs(q - 3) * -r * 0.04, fh = r * (0.45 + ((q * 37) % 5) * 0.08) * (1 + Math.sin(ph * 2 + q) * 0.15); shape(x, [fx - r * 0.1, fy, fx + r * 0.1, fy, fx - r * 0.2 + Math.sin(ph + q) * r * 0.08, fy - fh], q % 2 ? 'rgba(255,90,20,0.9)' : 'rgba(255,190,40,0.9)'); }
  if (o.fm) for (const sx2 of [-ws * 0.8 + lean, ws * 0.8 + lean]) for (let q = 0; q < 3; q++) shape(x, [sx2 - r * 0.12 + q * r * 0.1, shY + r * 0.1, sx2 + q * r * 0.1, shY + r * 0.1, sx2 - r * 0.1 + q * r * 0.1, shY - r * 0.35 - (q % 2) * r * 0.1], 'rgba(255,140,30,0.85)');
  // front arm + weapon
  const hd = arm(1, false, atk ? 2 : 0), wa2 = atk ? (ATKPH ? 2.3 : -0.9) : 0.35 + sn * 0.1;
  if (o.wp) { x.save(); x.translate(hd.x, hd.y); x.rotate(wa2);
    if (o.wp === 1) { box(x, -r * 0.05, -r * 0.05, r * 0.1, r * 0.3, 1, '#4a2a1a', OL); box(x, -r * 0.25, -r * 0.12, r * 0.5, r * 0.08, 1, '#c8a040', OL); shape(x, [-r * 0.09, -r * 0.12, r * 0.09, -r * 0.12, r * 0.07, -r * 1.35, 0, -r * 1.5, -r * 0.07, -r * 1.35], lg(x, -3, 0, 3, 0, '#ffffff', mix(o.c3, '#606870', 0.6)), OL, 1); seg(x, 0, -r * 0.2, 0, -r * 1.3, 'rgba(255,255,255,0.5)', 0.8); }
    else if (o.wp === 2) { box(x, -r * 0.07, -r * 0.1, r * 0.14, r * 0.3, 1, '#5a3a1a', OL); smp(x, [-r * 0.1, -r * 0.1, r * 0.1, -r * 0.1, r * 0.25, -r * 0.9, 0, -r * 1.15, -r * 0.25, -r * 0.9], lg(x, -4, 0, 4, 0, '#a07040', '#4a2a10'), 1); for (let k = 0; k < 4; k++) tri(x, (k % 2 ? 1 : -1) * r * 0.2, -r * (0.5 + k * 0.15), (k % 2 ? 1 : -1) * r * 0.38, -r * (0.55 + k * 0.15), (k % 2 ? 1 : -1) * r * 0.22, -r * (0.62 + k * 0.15), '#d8d8d0'); }
    else if (o.wp === 3) { seg(x, 0, r * 0.6, 0, -r * 1.3, OL, r * 0.16); seg(x, 0, r * 0.6, 0, -r * 1.3, '#5a3a2a', r * 0.09); for (let k = 0; k < 3; k++) { x.save(); x.translate(0, -r * 1.3); x.rotate(-0.8 + k * 0.8); tri(x, -r * 0.05, 0, r * 0.05, 0, 0, -r * 0.35, '#3a2a3a'); x.restore(); } ball(x, 0, -r * 1.45, r * 0.4, al(gl, 0.5), al(gl, 0)); ball(x, 0, -r * 1.45, r * 0.16, '#ffffff', gl, OL); }
    else if (o.wp === 4) { seg(x, 0, r * 0.5, 0, -r * 1.8, OL, r * 0.13); seg(x, 0, r * 0.5, 0, -r * 1.8, '#6a4a2a', r * 0.07); shape(x, [-r * 0.12, -r * 1.75, r * 0.12, -r * 1.75, 0, -r * 2.25], lg(x, -3, 0, 3, 0, '#ffffff', '#7a8a9a'), OL, 1); }
    else if (o.wp === 6) { seg(x, 0, r * 0.7, 0, -r * 1.7, OL, r * 0.15); seg(x, 0, r * 0.7, 0, -r * 1.7, '#2a1a2a', r * 0.08); x.beginPath(); x.moveTo(0, -r * 1.6); x.quadraticCurveTo(r * 1.1, -r * 1.9, r * 1.5, -r * 1.0); x.quadraticCurveTo(r * 0.9, -r * 1.45, 0, -r * 1.35); x.closePath(); x.fillStyle = lg(x, 0, -r * 1.8, r * 1.4, -r * 1.1, '#ffffff', mix(o.c3, '#404050', 0.5)); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke(); ball(x, 0, -r * 1.65, r * 0.12, '#ffffff', o.c3, OL); }
    else if (o.wp === 5) { seg(x, 0, r * 0.4, 0, -r * 1.3, OL, r * 0.15); seg(x, 0, r * 0.4, 0, -r * 1.3, '#5a3a20', r * 0.08); smp(x, [0, -r * 1.3, r * 0.55, -r * 1.55, r * 0.7, -r * 1.1, r * 0.5, -r * 0.75, 0, -r * 0.95], lg(x, 0, -r * 1.5, r * 0.6, -r * 0.8, '#ffffff', mix(o.c3, '#5a6068', 0.5)), 1.1); }
    x.restore(); ball(x, hd.x, hd.y, armW * 0.85, hi, dk, OL); }
  if (atk && ATKPH) { x.globalAlpha = 0.45; x.strokeStyle = '#ffffff'; x.lineWidth = 2.2; x.beginPath(); x.arc(lean, shY + r * 0.2, r * (o.wp ? 1.7 : 1.2), -1.9, 0.75); x.stroke(); x.globalAlpha = 1; }
}
const BOT: Record<string, BO> = {
  '狼人': { sk: 0, hd: 0, wp: 0, tl: 1, wg: 0, hn: 0, bk: 1.05, c3: '#ffb020' },
  '雪怪': { sk: 0, hd: 1, wp: 0, tl: 0, wg: 0, hn: 0, bk: 1.0, c3: '#40c8ff' },
  '雪原之王': { sk: 0, hd: 1, wp: 5, tl: 0, wg: 0, hn: 1, bk: 1.05, c3: '#80d8ff' },
  '蜥蜴人': { sk: 1, hd: 2, wp: 4, tl: 1, wg: 0, hn: 0, bk: 1.0, c3: '#e0a030' },
  '龍人戰士': { sk: 1, hd: 2, wp: 1, tl: 1, wg: 1, hn: 1, bk: 1.08, c3: '#d04030' },
  '骷髏兵': { sk: 2, hd: 3, wp: 1, tl: 0, wg: 0, hn: 0, bk: 1.0, c3: '#60e0ff' },
  '食屍鬼': { sk: 6, hd: 10, wp: 0, tl: 0, wg: 0, hn: 0, bk: 0.95, c3: '#d8ff60' },
  '活鎧甲': { sk: 3, hd: 4, wp: 1, tl: 0, wg: 0, hn: 0, bk: 1.05, c3: '#60c0ff' },
  '妖魔巫師': { sk: 4, hd: 5, wp: 3, tl: 0, wg: 0, hn: 0, bk: 1.0, c3: '#c070ff' },
  '黑暗精靈法師': { sk: 4, hd: 6, wp: 3, tl: 0, wg: 0, hn: 0, bk: 1.05, c3: '#a060ff' },
  '炎魔': { sk: 6, hd: 7, wp: 0, tl: 1, wg: 1, hn: 0, bk: 1.08, c3: '#ff8020' },
  '石像鬼': { sk: 5, hd: 8, wp: 0, tl: 1, wg: 1, hn: 1, bk: 0.95, c3: '#ff4040' },
  '魔法石像鬼': { sk: 5, hd: 8, wp: 0, tl: 1, wg: 1, hn: 1, bk: 0.95, c3: '#60a0ff' },
  '深淵魔王': { sk: 3, hd: 7, wp: 1, tl: 1, wg: 1, hn: 1, bk: 0.95, c3: '#ff3040', cp: '#4a0614' },
  '炎魔王': { sk: 7, hd: 7, wp: 5, tl: 1, wg: 1, hn: 1, bk: 0.95, c3: '#ff8020', fm: 1 },
  '妖魔王 卡司特': { sk: 3, hd: 12, wp: 5, tl: 0, wg: 0, hn: 0, bk: 1.12, c3: '#ffd040', cp: '#8a1a1a' },
  '惡魔 巴風特': { sk: 0, hd: 11, wp: 6, tl: 1, wg: 1, hn: 0, bk: 1.12, c3: '#c040ff' },
  '死亡騎士 格蘭肯': { sk: 3, hd: 4, wp: 1, tl: 0, wg: 0, hn: 1, bk: 1.15, c3: '#ff3030', cp: '#2a0608' },
  '冰晶魔像': { sk: 5, hd: 9, wp: 0, tl: 0, wg: 0, hn: 0, bk: 1.0, c3: '#a0f0ff' },
  '熔岩魔像': { sk: 5, hd: 9, wp: 0, tl: 0, wg: 0, hn: 0, bk: 1.0, c3: '#ffa020' },
};
function paintQuad(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean, sp: number): void {
  const r = d.r, c = d.c, dk = d.c2, hi = mix(c, '#ffffff', 0.4), sh = mix(dk, '#000000', 0.25), ph = (f / 6) * TAU, sn = atk ? 0 : Math.sin(ph);
  const bulk = sp === 2 ? 1.3 : sp === 1 ? 0.9 : 1, legL = r * (sp === 2 ? 0.6 : sp === 1 ? 0.78 : 0.68), bob = atk ? -r * 0.15 : -Math.abs(Math.cos(ph)) * r * 0.1;
  const by = -legL - r * 0.62 * bulk + bob, bl = r * (sp === 1 ? 1.35 : sp === 2 ? 1.2 : 1.1), lean = atk ? r * 0.3 : 0;
  const belly = sp === 0 ? '#fff4e0' : sp === 3 ? '#fff0e0' : sp === 2 ? '#ffffff' : mix(c, '#ffffff', 0.15);
  const leg = (lx: number, a: number, far: boolean, front: boolean): void => {
    const st = atk ? (front ? r * 0.35 : -r * 0.2) : Math.sin(a) * r * 0.35, lift = atk ? 0 : Math.max(0, -Math.cos(a)) * r * 0.2, col = far ? sh : c, w = r * 0.4 * bulk;
    const top = { x: lx, y: by + r * 0.15 }, kn = { x: lx + st * 0.5 + (front ? 0 : -r * 0.15), y: by + legL * 0.55 }, ft = { x: lx + st, y: -lift };
    limb(x, [top.x, top.y, kn.x, kn.y, ft.x, ft.y - r * 0.08], w, col);
    ell(x, ft.x + r * 0.1, ft.y - r * 0.06, r * 0.2 * bulk, r * 0.1, far ? sh : (sp === 0 || sp === 3 ? belly : col)); x.strokeStyle = OL; x.lineWidth = 0.9; x.stroke();
  };
  // tail
  x.save(); x.translate(-bl * 0.95, by - r * 0.1); x.rotate(sp === 0 ? -1.3 : -0.4 + sn * 0.25);
  if (sp === 0) { smp(x, [0, 0, -r * 0.2, -r * 0.5, r * 0.2, -r * 0.75, r * 0.45, -r * 0.4, r * 0.2, -r * 0.3, r * 0.15, 0], lg(x, 0, -8, 0, 0, belly, c), 1); }
  else if (sp === 1) { x.lineCap = 'round'; x.strokeStyle = OL; x.lineWidth = r * 0.22; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-r * 0.9, r * 0.2, -r * 1.2, -r * 0.6 + sn * r * 0.2); x.stroke(); x.strokeStyle = c; x.lineWidth = r * 0.13; x.stroke(); }
  else if (sp === 2) ball(x, -r * 0.05, 0, r * 0.2, hi, c, OL);
  else { smp(x, [0, -r * 0.15, -r * 0.8, -r * 0.45, -r * 1.35, -r * 0.1, -r * 0.9, r * 0.3, 0, r * 0.15], lg(x, 0, 0, -r * 1.3, 0, c, '#ff3010'), 1.1); ball(x, -r * 1.15, -r * 0.05, r * 0.35, 'rgba(255,240,140,0.95)', 'rgba(255,120,0,0)'); smp(x, [-r * 0.85, -r * 0.3, -r * 1.35, -r * 0.1, -r * 0.9, r * 0.25], '#fff4d0', 0.9); }
  x.restore();
  leg(-bl * 0.6, ph + Math.PI, true, false); leg(bl * 0.55 + lean, ph, true, true);
  // body
  smp(x, [-bl, by - r * 0.15, -bl * 0.5, by - r * 0.72 * bulk, bl * 0.4 + lean, by - r * 0.78 * bulk, bl + lean, by - r * 0.25, bl * 0.85 + lean, by + r * 0.6 * bulk, -bl * 0.3, by + r * 0.55 * bulk, -bl * 1.05, by + r * 0.3], lg(x, 0, by - r * 0.6, 0, by + r * 0.5, hi, dk), 1.3);
  smp(x, [-bl * 0.4, by + r * 0.15, bl * 0.75 + lean, by - r * 0.05, bl * 0.7 + lean, by + r * 0.42 * bulk, -bl * 0.3, by + r * 0.4 * bulk], belly, 0);
  if (sp === 1) for (let k = 0; k < 5; k++) ball(x, -bl * 0.6 + k * r * 0.35, by - r * 0.2 + (k % 2) * r * 0.2, r * 0.09, 'rgba(70,70,90,0.8)', 'rgba(20,20,30,0.2)');
  if (sp === 2) for (let k = 0; k < 6; k++) tuft(x, -bl * 0.8 + k * r * 0.35, by - r * 0.5 * bulk + Math.abs(k - 2.5) * r * 0.05, r * 0.14, r * 0.22, -0.5, k % 2 ? hi : '#ffffff');
  leg(-bl * 0.5, ph, false, false); leg(bl * 0.62 + lean, ph + Math.PI, false, true);
  // head
  const hx = bl + lean + r * 0.2, hy = by - r * (sp === 1 ? 0.6 : 0.9);
  if (sp === 0) { box(x, hx - r * 0.55, hy + r * 0.25, r * 0.5, r * 0.16, 2, '#d03030', OL); ball(x, hx - r * 0.3, hy + r * 0.45, r * 0.1, '#ffe060', '#c09020', OL); }
  const hr = r * (sp === 2 ? 0.7 : 0.64);
  for (const s2 of [0, 1]) { const ex = hx - r * 0.25 + s2 * r * 0.3;
    if (sp === 2 || sp === 1) ball(x, ex, hy - hr * 0.75, r * 0.17, s2 ? c : sh, dk, OL);
    else shape(x, [ex - r * 0.16, hy - hr * 0.5, ex + r * 0.04, hy - hr * (sp === 3 ? 1.9 : 1.55), ex + r * 0.18, hy - hr * 0.5], s2 ? lg(x, ex, hy - hr * 1.5, ex, hy, c, dk) : sh, OL, 1); if (sp !== 2 && sp !== 1 && s2) tri(x, ex - r * 0.06, hy - hr * 0.6, ex + r * 0.04, hy - hr * (sp === 3 ? 1.6 : 1.3), ex + r * 0.1, hy - hr * 0.6, '#ffd0c0'); }
  smp(x, [hx - hr, hy, hx - hr * 0.7, hy - hr * 0.8, hx + hr * 0.4, hy - hr * 0.85, hx + hr, hy - hr * 0.2, hx + hr * (sp === 2 ? 1.4 : sp === 1 ? 1.3 : 1.7), hy + hr * 0.1, hx + hr * 1.2, hy + hr * 0.55, hx, hy + hr * 0.75], lg(x, hx, hy - hr, hx, hy + hr, hi, dk), 1.2);
  smp(x, [hx + hr * 0.1, hy + hr * 0.05, hx + hr * (sp === 2 ? 1.35 : sp === 1 ? 1.25 : 1.65), hy + hr * 0.12, hx + hr * 1.15, hy + hr * 0.58, hx + hr * 0.1, hy + hr * 0.65, hx - hr * 0.6, hy + hr * 0.45], belly, 0);
  if (sp === 3 || sp === 0) smp(x, [hx - hr * 0.95, hy + hr * 0.1, hx - hr * 0.5, hy + hr * 0.75, hx - hr * 0.2, hy + hr * 0.4], belly, 0);
  const nx = hx + hr * (sp === 2 ? 1.35 : sp === 1 ? 1.25 : 1.65); ball(x, nx, hy + hr * 0.12, r * 0.09, '#3a2a2a', '#000000');
  if (atk) { shape(x, [hx + hr * 0.4, hy + hr * 0.45, nx, hy + hr * 0.4, nx - hr * 0.2, hy + hr * 0.9, hx + hr * 0.5, hy + hr * 0.75], '#6a1a20', OL, 1); tri(x, nx - hr * 0.35, hy + hr * 0.42, nx - hr * 0.25, hy + hr * 0.42, nx - hr * 0.3, hy + hr * 0.6, '#ffffff'); }
  else seg(x, hx + hr * 0.6, hy + hr * 0.5, nx - hr * 0.1, hy + hr * 0.45, OL, 1);
  const ec = sp === 1 ? '#80ff60' : sp === 3 ? '#ffb020' : '#2a1a10';
  if (sp === 1 || sp === 3) { ball(x, hx + hr * 0.35, hy - hr * 0.2, r * 0.17, al(ec, 0.4), al(ec, 0)); ell(x, hx + hr * 0.35, hy - hr * 0.2, r * 0.1, r * 0.07, ec); seg(x, hx + hr * 0.35, hy - hr * 0.27, hx + hr * 0.35, hy - hr * 0.13, '#000000', 1.1); }
  else { ball(x, hx + hr * 0.35, hy - hr * 0.2, r * 0.1, ec, '#000000'); circ(x, hx + hr * 0.32, hy - hr * 0.25, r * 0.035, '#ffffff'); }
  if (sp === 0) ball(x, hx + hr * 0.1, hy + hr * 0.25, r * 0.1, 'rgba(255,140,140,0.55)', 'rgba(255,140,140,0)');
  if (sp === 3 && atk) ball(x, nx + r * 0.6, hy + hr * 0.3, r * 0.7, 'rgba(255,230,120,0.95)', 'rgba(255,80,0,0)');
  if (atk) { x.globalAlpha = 0.45; x.strokeStyle = '#ffffff'; x.lineWidth = 2; x.beginPath(); x.arc(hx, hy, r * 1.1, -1.2, 0.9); x.stroke(); x.globalAlpha = 1; }
}
function paintDrake(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean, baby: boolean): void {
  const r = d.r, c = d.c, dk = d.c2, hi = mix(c, '#ffffff', 0.4), sh = mix(dk, '#000000', 0.2), ph = (f / 6) * TAU, fl = atk ? 1 : Math.sin(ph);
  const by = (baby ? -r * 1.3 : -r * 1.9) - fl * r * 0.15, hs = baby ? 1.35 : 1, belly = baby ? '#ffe0a0' : '#e8c080';
  wingB(x, -r * 0.1, by - r * 0.4, r * (baby ? 0.7 : 1.05), fl, mix(c, '#000000', 0.25), sh);
  x.save(); x.translate(-r * 0.6, by + r * 0.2); x.rotate(0.3 + Math.sin(ph) * 0.2); smp(x, [0, -r * 0.25, -r * 1.0, r * 0.1, -r * 1.6, r * 0.55, -r * 0.9, r * 0.35, 0, r * 0.25], lg(x, 0, -4, 0, 6, c, dk), 1.1); tri(x, -r * 1.55, r * 0.4, -r * 1.85, r * 0.3, -r * 1.7, r * 0.75, dk); x.restore();
  for (const [lx, far] of [[-r * 0.3, true], [r * 0.35, true], [-r * 0.15, false], [r * 0.5, false]] as [number, boolean][]) { const k = Math.sin(ph + lx) * r * 0.12; limb(x, [lx, by + r * 0.3, lx + r * 0.15 + k, by + r * 0.8, lx + r * 0.25 + k, by + r * 1.05], r * 0.17, far ? sh : c); for (let q = 0; q < 3; q++) tri(x, lx + r * (0.18 + q * 0.07) + k, by + r * 1.0, lx + r * (0.24 + q * 0.07) + k, by + r * 1.0, lx + r * (0.25 + q * 0.07) + k, by + r * 1.15, '#f0ead8'); }
  smp(x, [-r * 0.8, by + r * 0.1, -r * 0.4, by - r * 0.5, r * 0.4, by - r * 0.55, r * 0.85, by - r * 0.1, r * 0.6, by + r * 0.5, -r * 0.4, by + r * 0.5], lg(x, 0, by - r * 0.5, 0, by + r * 0.5, hi, dk), 1.3);
  smp(x, [-r * 0.2, by + r * 0.05, r * 0.7, by - r * 0.05, r * 0.5, by + r * 0.45, -r * 0.3, by + r * 0.45], belly, 0); for (let q = 1; q < 4; q++) seg(x, -r * 0.2 + q * r * 0.05, by + q * r * 0.11, r * 0.65, by + q * r * 0.11 - r * 0.05, 'rgba(120,80,30,0.5)', 0.8);
  for (let q = 0; q < 5; q++) tri(x, -r * 0.7 + q * r * 0.28, by - r * 0.38 - (q === 2 ? r * 0.06 : 0), -r * 0.5 + q * r * 0.28, by - r * 0.48, -r * 0.6 + q * r * 0.28, by - r * 0.72, dk);
  const nx = r * 0.75, ny = by - r * 0.45, hx = nx + r * 0.45 * hs, hy = ny - r * 0.55 * hs + (atk ? r * 0.2 : 0);
  limb(x, [r * 0.4, by - r * 0.2, nx, ny, hx - r * 0.2, hy + r * 0.2], r * 0.34, c);
  for (const s2 of [0, 1]) { x.save(); x.translate(hx - r * 0.2 * hs + s2 * r * 0.15, hy - r * 0.3 * hs); x.rotate(-0.9 + s2 * 0.3); smp(x, [-r * 0.08, 0, r * 0.08, 0, 0, -r * 0.5 * hs], '#f0e0b8', 1); x.restore(); }
  const op = atk ? r * 0.3 : 0;
  smp(x, [hx - r * 0.45 * hs, hy + r * 0.1, hx - r * 0.35 * hs, hy - r * 0.38 * hs, hx + r * 0.3 * hs, hy - r * 0.4 * hs, hx + r * (baby ? 0.7 : 1.0), hy - r * 0.05, hx + r * (baby ? 0.65 : 0.95), hy + r * 0.15, hx, hy + r * 0.3 * hs], lg(x, hx, hy - r * 0.4, hx, hy + r * 0.3, hi, dk), 1.2);
  smp(x, [hx - r * 0.2, hy + r * 0.2, hx + r * (baby ? 0.6 : 0.9), hy + r * 0.12 + op * 0.4, hx + r * (baby ? 0.5 : 0.75), hy + r * 0.32 + op, hx - r * 0.1, hy + r * 0.4], lg(x, hx, hy, hx, hy + 6, belly, dk), 1);
  if (baby) { ball(x, hx + r * 0.15, hy - r * 0.1, r * 0.17, '#ffffff', '#e0e0e0', OL); ball(x, hx + r * 0.2, hy - r * 0.08, r * 0.1, '#ffb020', '#5a2a00'); circ(x, hx + r * 0.17, hy - r * 0.13, r * 0.04, '#ffffff'); ball(x, hx - r * 0.05, hy + r * 0.12, r * 0.1, 'rgba(255,140,140,0.6)', 'rgba(255,140,140,0)'); }
  else { ball(x, hx + r * 0.3, hy - r * 0.15, r * 0.18, 'rgba(255,220,60,0.5)', 'rgba(0,0,0,0)'); ell(x, hx + r * 0.3, hy - r * 0.15, r * 0.09, r * 0.06, '#ffe040'); seg(x, hx + r * 0.3, hy - r * 0.21, hx + r * 0.3, hy - r * 0.09, '#000000', 1); seg(x, hx + r * 0.12, hy - r * 0.27, hx + r * 0.5, hy - r * 0.2, OL, 1.5); for (let q = 0; q < 4; q++) tri(x, hx + r * (0.4 + q * 0.13), hy + r * 0.12, hx + r * (0.46 + q * 0.13), hy + r * 0.12, hx + r * (0.43 + q * 0.13), hy + r * 0.24, '#fffbe8'); }
  if (atk) { const fx = hx + r * (baby ? 0.7 : 1.0); ball(x, fx + r * 0.6, hy + r * 0.3, r * 0.75, 'rgba(255,240,160,0.95)', 'rgba(255,90,0,0)'); ball(x, fx + r * 1.2, hy + r * 0.4, r * 0.5, 'rgba(255,170,60,0.8)', 'rgba(255,60,0,0)'); }
}
const PETSP: Record<string, number> = { '柴犬': 0, '黑豹': 1, '雪原熊': 2, '火狐': 3 };
const PETC: Record<string, [string, string]> = { '柴犬': ['#e8a050', '#9a5a20'], '黑豹': ['#3a3a48', '#14141c'], '雪原熊': ['#f4f8fc', '#9aacbc'], '火狐': ['#ff8a30', '#b03a10'], '幼龍': ['#5ac070', '#2a6a3a'] };
function paintSerpent(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean): void {
  const r = d.r, c = '#26a8ff', dk = '#063a8a', hi = '#d8f6ff', ph = (f / 6) * TAU, wind = atk && ATKPH === 0, strike = atk && ATKPH !== 0;
  const pts: [number, number][] = [];
  const N = 26;
  for (let i = 0; i <= N; i++) {
    const t = i / N, bx = -r * 1.9 + t * r * 2.4, wav = Math.sin(t * TAU * 1.2 - ph) * r * 0.22 * (1 - t * 0.6);
    let by = -r * 0.28 + wav - Math.max(0, t - 0.55) / 0.45 * r * (wind ? 1.2 : strike ? 0.95 : 1.15);
    let bxx = bx - (t > 0.75 ? (t - 0.75) * r * (wind ? 1.6 : strike ? -0.8 : 0.6) : 0);
    if (t > 0.85) by -= (t - 0.85) * r * 1.5;
    pts.push([bxx, by]);
  }
  const wid = (t: number): number => r * (0.12 + Math.sin(Math.min(1, t * 1.25) * Math.PI) * 0.26 + (t > 0.8 ? 0.06 : 0));
  x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.ellipse(-r * 0.4, 0, r * 1.6, r * 0.2, 0, 0, TAU); x.fill();
  // dorsal fins
  for (let i = 3; i < N - 3; i += 2) { const [px, py] = pts[i] ?? [0, 0], t = i / N, w = wid(t); shape(x, [px - r * 0.12, py - w * 0.7, px + r * 0.02, py - w - r * (0.22 + Math.sin(i + ph) * 0.05), px + r * 0.12, py - w * 0.7], lg(x, px, py - w - r * 0.25, px, py - w, '#e0f6ff', mix(c, '#000000', 0.1)), OL, 0.8); }
  // body (outline then fill)
  for (const pass of [0, 1, 2]) for (let i = 0; i <= N; i++) { const [px, py] = pts[i] ?? [0, 0], t = i / N, w = wid(t); if (pass === 0) { x.fillStyle = OL; x.beginPath(); x.arc(px, py, w + 1.2, 0, TAU); x.fill(); } else if (pass === 1) { const g0 = x.createRadialGradient(px - w * 0.3, py - w * 0.5, 0.5, px, py, w); g0.addColorStop(0, hi); g0.addColorStop(0.6, c); g0.addColorStop(1, dk); x.fillStyle = g0; x.beginPath(); x.arc(px, py, w, 0, TAU); x.fill(); } else if (i % 2 === 0 && t < 0.9) { x.fillStyle = 'rgba(230,240,220,0.55)'; x.beginPath(); x.ellipse(px, py + w * 0.55, w * 0.55, w * 0.28, 0, 0, TAU); x.fill(); } }
  // scales sheen
  for (let i = 2; i < N - 2; i += 3) { const [px, py] = pts[i] ?? [0, 0], w = wid(i / N); x.strokeStyle = 'rgba(255,255,255,0.25)'; x.lineWidth = 0.8; x.beginPath(); x.arc(px, py - w * 0.1, w * 0.6, Math.PI * 1.1, Math.PI * 1.6); x.stroke(); }
  // side fins
  const [fx, fy] = pts[Math.round(N * 0.55)] ?? [0, 0];
  shape(x, [fx, fy, fx - r * 0.55, fy + r * 0.35 + Math.sin(ph) * r * 0.08, fx - r * 0.2, fy + r * 0.15, fx - r * 0.35, fy + r * 0.42], lg(x, fx, fy, fx - r * 0.5, fy + r * 0.4, '#c8ecff', c), OL, 0.9);
  // head
  const [hx, hy] = pts[N] ?? [0, 0], ha = strike ? 0.15 : wind ? -0.45 : -0.15;
  x.save(); x.translate(hx, hy); x.rotate(ha);
  for (const s2 of [-1, 1]) shape(x, [-r * 0.15, -r * 0.1 * s2 - r * 0.05, -r * 0.65, -r * 0.5 + s2 * r * 0.1, -r * 0.35, -r * 0.08, -r * 0.7, -r * 0.2 + s2 * r * 0.25], lg(x, 0, -r * 0.5, 0, 0, '#e8fbff', mix(c, '#ffffff', 0.2)), OL, 0.9);
  const op = strike ? r * 0.22 : 0;
  smp(x, [-r * 0.25, -r * 0.2, r * 0.2, -r * 0.3, r * 0.75, -r * 0.12, r * 0.8, r * 0.02, r * 0.1, r * 0.08, -r * 0.2, r * 0.12], lg(x, 0, -r * 0.3, 0, r * 0.1, hi, c), 1.2);
  smp(x, [-r * 0.15, r * 0.08, r * 0.7, r * 0.05 + op * 0.4, r * 0.55, r * 0.22 + op, -r * 0.1, r * 0.25], lg(x, 0, 0, 0, r * 0.25, c, dk), 1);
  for (let q = 0; q < 4; q++) tri(x, r * (0.2 + q * 0.13), r * 0.06, r * (0.26 + q * 0.13), r * 0.06, r * (0.23 + q * 0.13), r * 0.15, '#fffbe8');
  ball(x, r * 0.25, -r * 0.13, r * 0.16, 'rgba(120,240,255,0.6)', 'rgba(120,240,255,0)'); ell(x, r * 0.25, -r * 0.13, r * 0.08, r * 0.05, '#a0f8ff');
  x.strokeStyle = '#e0f8ff'; x.lineWidth = 1; for (const s2 of [0, 1]) { x.beginPath(); x.moveTo(r * 0.7, r * 0.02); x.quadraticCurveTo(r * 0.9, r * (0.2 + s2 * 0.15), r * (1.0 - s2 * 0.1), r * (0.35 + s2 * 0.25) + Math.sin(ph + s2) * r * 0.06); x.stroke(); }
  for (const s2 of [0, 1]) shape(x, [-r * 0.05 + s2 * r * 0.12, -r * 0.25, -r * 0.3 + s2 * r * 0.1, -r * 0.75, -r * 0.0 + s2 * r * 0.12, -r * 0.3], '#d8e8f0', OL, 0.8);
  if (strike) { x.globalCompositeOperation = 'lighter'; for (let q = 0; q < 7; q++) { const t = q / 6; ball(x, r * (0.85 + t * 1.2), r * (0.1 + t * 0.15), r * (0.1 + t * 0.2), 'rgba(200,245,255,0.9)', 'rgba(40,140,255,0.25)'); } x.globalCompositeOperation = 'source-over'; }
  x.restore();
}
function paintWyvern(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean): void {
  const r = d.r, c = d.c, dk = d.c2, hi = mix(c, '#ffd080', 0.4), sh = mix(dk, '#000000', 0.3), ph = (f / 6) * TAU, sn = atk ? 0 : Math.sin(ph), wind = atk && ATKPH === 0, strike = atk && ATKPH !== 0;
  const flap = wind ? 1 : strike ? -0.4 : sn * 0.5, by = -r * 1.25 - (atk ? 0 : Math.abs(Math.cos(ph)) * r * 0.05);
  x.fillStyle = 'rgba(0,0,0,0.28)'; x.beginPath(); x.ellipse(0, 0, r * 1.5, r * 0.25, 0, 0, TAU); x.fill();
  const wing = (bx: number, wy: number, s: number, fl: number, back: boolean): void => {
    const tip = { x: bx - s * 1.2, y: wy - s * (1.5 + fl * 0.6) }, el = { x: bx - s * 0.35, y: wy - s * (0.9 + fl * 0.4) };
    const fingers = [{ x: bx - s * 1.9, y: wy - s * (0.6 + fl * 0.3) }, { x: bx - s * 1.7, y: wy + s * 0.1 }, { x: bx - s * 1.1, y: wy + s * 0.45 }];
    x.beginPath(); x.moveTo(bx, wy); x.lineTo(el.x, el.y); x.lineTo(tip.x, tip.y);
    let prev = tip; for (const fp of fingers) { x.quadraticCurveTo((prev.x + fp.x) / 2 + s * 0.15, (prev.y + fp.y) / 2 + s * 0.12, fp.x, fp.y); prev = fp; }
    x.quadraticCurveTo(bx - s * 0.5, wy + s * 0.55, bx, wy + s * 0.2); x.closePath();
    const g0 = x.createLinearGradient(bx, wy, tip.x, tip.y); g0.addColorStop(0, back ? sh : mix(c, '#000000', 0.15)); g0.addColorStop(1, back ? mix(sh, '#000000', 0.3) : '#ff9a40'); x.fillStyle = g0; x.fill(); x.strokeStyle = OL; x.lineWidth = 1.3; x.stroke();
    seg(x, bx, wy, el.x, el.y, mix(dk, '#000000', 0.2), 3); seg(x, el.x, el.y, tip.x, tip.y, mix(dk, '#000000', 0.2), 2.4);
    for (const fp of fingers) seg(x, el.x, el.y, fp.x, fp.y, mix(dk, '#000000', 0.2), 1.4);
    tri(x, tip.x, tip.y, tip.x - s * 0.08, tip.y - s * 0.16, tip.x + s * 0.06, tip.y - s * 0.06, '#f0e0c0');
  };
  wing(r * 0.25, by - r * 0.35, r * 1.05, flap + 0.15, true);
  // tail
  smp(x, [-r * 0.3, by + r * 0.4, -r * 1.2, -r * 0.35, -r * 2.0, -r * 0.15 + sn * r * 0.05, -r * 2.3, -r * 0.05, -r * 1.9, -r * 0.02, -r * 1.1, -r * 0.1, -r * 0.1, by + r * 0.75], lg(x, 0, by, 0, 0, c, dk), 1.3);
  shape(x, [-r * 2.3, -r * 0.05, -r * 2.6, -r * 0.3, -r * 2.45, r * 0.05], '#3a0a04', OL, 0.8);
  // legs
  const leg = (lx: number, a: number, far: boolean): void => { const st = atk ? 0 : Math.sin(a) * r * 0.12; limb(x, [lx, by + r * 0.5, lx + r * 0.3 + st, by + r * 0.95, lx - r * 0.05 + st, -r * 0.08], r * 0.38, far ? sh : c); ell(x, lx + st + r * 0.08, -r * 0.05, r * 0.3, r * 0.1, far ? sh : hi); x.strokeStyle = OL; x.lineWidth = 1; x.stroke(); for (let q = 0; q < 3; q++) tri(x, lx + st + r * (0.2 + q * 0.09), -r * 0.08, lx + st + r * (0.32 + q * 0.09), 0, lx + st + r * (0.16 + q * 0.09), 0, '#f0e8d0'); };
  leg(-r * 0.35, ph + Math.PI, true);
  // body upright
  const lean = strike ? r * 0.25 : wind ? -r * 0.15 : 0;
  smp(x, [-r * 0.65, by + r * 0.7, -r * 0.7, by - r * 0.1, -r * 0.3 + lean, by - r * 0.85, r * 0.35 + lean, by - r * 0.8, r * 0.6 + lean, by - r * 0.1, r * 0.45, by + r * 0.75], lg(x, -r * 0.6, by - r, r * 0.6, by + r * 0.6, hi, dk), 1.4);
  // glowing belly plates
  for (let q = 0; q < 5; q++) { const yy = by - r * 0.55 + q * r * 0.25, w = r * (0.32 - Math.abs(q - 2) * 0.03); box(x, r * 0.05 + lean * (1 - q / 5) - w * 0.5, yy, w, r * 0.2, 3, lg(x, 0, yy, 0, yy + r * 0.2, '#ffe080', '#d04010'), OL); }
  leg(r * 0.15, ph, false);
  // neck + head
  const nx = r * 0.35 + lean, ny = by - r * 0.75, hx = nx + r * (strike ? 0.95 : wind ? 0.15 : 0.55), hy = ny - r * (strike ? 0.55 : wind ? 1.05 : 0.95);
  limb(x, [nx - r * 0.1, ny + r * 0.2, nx + r * 0.05, ny - r * 0.4, hx - r * 0.25, hy + r * 0.12], r * 0.42, c);
  for (let q = 0; q < 4; q++) { const t = q / 4, sx = nx - r * 0.15 + (hx - nx) * t * 0.8, sy = ny - r * 0.2 + (hy - ny) * t * 0.9; tri(x, sx - r * 0.08, sy, sx - r * 0.3, sy - r * 0.12, sx - r * 0.06, sy - r * 0.18, '#3a0a04'); }
  const op = strike ? r * 0.3 : 0;
  x.save(); x.translate(hx, hy);
  for (const s2 of [0, 1]) { x.save(); x.translate(-r * 0.15 + s2 * r * 0.12, -r * 0.2); x.rotate(-0.9 + s2 * 0.3); smp(x, [-r * 0.08, 0, r * 0.08, 0, r * 0.02, -r * 0.55, -r * 0.2, -r * 0.8, -r * 0.08, -r * 0.4], lg(x, 0, -r * 0.8, 0, 0, '#2a1a14', '#e8d8b0'), 1); x.restore(); }
  smp(x, [-r * 0.3, r * 0.05, -r * 0.2, -r * 0.3, r * 0.3, -r * 0.3, r * 0.85, -r * 0.08, r * 0.85, r * 0.08, 0, r * 0.15], lg(x, 0, -r * 0.3, 0, r * 0.1, hi, c), 1.3);
  smp(x, [-r * 0.15, r * 0.1, r * 0.75, r * 0.08 + op * 0.4, r * 0.6, r * 0.3 + op, -r * 0.1, r * 0.32], lg(x, 0, 0, 0, r * 0.3, c, dk), 1.1);
  for (let q = 0; q < 5; q++) tri(x, r * (0.18 + q * 0.12), r * 0.08, r * (0.24 + q * 0.12), r * 0.08, r * (0.21 + q * 0.12), r * 0.19, '#fffbe8');
  ball(x, r * 0.25, -r * 0.13, r * 0.2, 'rgba(255,220,60,0.65)', 'rgba(255,160,40,0)'); ell(x, r * 0.25, -r * 0.13, r * 0.09, r * 0.055, '#fff060');
  if (wind) ball(x, r * 0.6, r * 0.15, r * 0.25, 'rgba(255,200,80,0.9)', 'rgba(255,80,0,0)');
  if (strike) { x.globalCompositeOperation = 'lighter'; for (let q = 0; q < 8; q++) { const t = q / 7; ball(x, r * (0.9 + t * 1.6), r * (0.2 + t * 0.45), r * (0.15 + t * 0.35), 'rgba(255,240,140,0.85)', 'rgba(255,60,0,0.15)'); } x.globalCompositeOperation = 'source-over'; }
  x.restore();
  wing(r * 0.05 + lean, by - r * 0.45, r * 1.2, flap, false);
}
function paintEarth(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean): void {
  const r = d.r, c = d.c, dk = d.c2, hi = mix(c, '#ffffff', 0.35), sh = mix(dk, '#000000', 0.3), ph = (f / 6) * TAU, sn = atk ? 0 : Math.sin(ph);
  const by = -r * 0.95 + (atk ? -r * 0.05 : Math.abs(Math.cos(ph)) * -r * 0.04), lean = atk ? r * 0.15 : 0;
  // tail
  x.save(); x.translate(-r * 0.9, by - r * 0.1); x.rotate(0.15 + sn * 0.08);
  smp(x, [0, -r * 0.35, -r * 0.7, -r * 0.2, -r * 1.3, r * 0.2, -r * 1.5, r * 0.55, -r * 1.1, r * 0.45, -r * 0.5, r * 0.3, 0, r * 0.3], lg(x, 0, -r * 0.3, 0, r * 0.4, c, dk), 1.3);
  for (let k = 0; k < 5; k++) tri(x, -r * (0.1 + k * 0.28), -r * (0.3 - k * 0.1), -r * (0.25 + k * 0.28), -r * (0.25 - k * 0.1), -r * (0.2 + k * 0.28), -r * (0.5 - k * 0.08), '#c8b088');
  x.restore();
  // small wings
  wingB(x, -r * 0.2, by - r * 0.55, r * 0.7, Math.sin(ph) * 0.4 + (atk ? 0.6 : 0), mix(c, '#000000', 0.3), sh);
  const leg = (lx: number, a: number, far: boolean, front: boolean): void => { const st = atk ? (front ? r * 0.15 : 0) : Math.sin(a) * r * 0.18, lift = atk ? 0 : Math.max(0, -Math.cos(a)) * r * 0.1, col = far ? sh : c;
    limb(x, [lx, by, lx + st * 0.4 + (front ? r * 0.1 : -r * 0.12), by + r * 0.5, lx + st, -lift - r * 0.1], r * 0.32, col);
    ell(x, lx + st + r * 0.08, -lift - r * 0.06, r * 0.26, r * 0.1, far ? sh : hi); x.strokeStyle = OL; x.lineWidth = 1; x.stroke();
    for (let q = 0; q < 3; q++) tri(x, lx + st + r * (0.15 + q * 0.08), -lift - r * 0.08, lx + st + r * (0.25 + q * 0.08), -lift, lx + st + r * (0.12 + q * 0.08), -lift, '#f0e8d0'); };
  leg(-r * 0.55, ph + Math.PI, true, false); leg(r * 0.55 + lean, ph, true, true);
  // body
  smp(x, [-r * 1.0, by - r * 0.1, -r * 0.6, by - r * 0.75, r * 0.3 + lean, by - r * 0.85, r * 0.95 + lean, by - r * 0.4, r * 0.85 + lean, by + r * 0.4, -r * 0.2, by + r * 0.5, -r * 1.0, by + r * 0.3], lg(x, 0, by - r * 0.8, 0, by + r * 0.5, hi, dk), 1.5);
  smp(x, [-r * 0.5, by + r * 0.1, r * 0.75 + lean, by - r * 0.05, r * 0.7 + lean, by + r * 0.38, -r * 0.3, by + r * 0.45], lg(x, 0, by, 0, by + r * 0.45, '#d8c090', '#8a7040'), 0);
  for (let q = 1; q < 4; q++) seg(x, -r * 0.4 + q * r * 0.05, by + q * r * 0.1 + r * 0.05, r * 0.72 + lean, by + q * r * 0.1, 'rgba(90,60,20,0.5)', 1);
  // rocky back plates
  for (let q = 0; q < 6; q++) { const px = -r * 0.85 + q * r * 0.32 + lean * q / 6, py = by - r * (0.6 + Math.sin(q / 5 * Math.PI) * 0.25); shape(x, [px - r * 0.16, py + r * 0.12, px - r * 0.05, py - r * 0.32, px + r * 0.12, py - r * 0.22, px + r * 0.18, py + r * 0.12], lg(x, px, py - r * 0.3, px, py + r * 0.1, '#a89a88', '#4a4238'), OL, 1); seg(x, px - r * 0.02, py - r * 0.25, px + r * 0.02, py + r * 0.05, 'rgba(0,0,0,0.35)', 0.8); }
  for (let q = 0; q < 8; q++) { const px = -r * 0.7 + ((q * 37) % 15) / 15 * r * 1.4, py = by - r * 0.4 + ((q * 53) % 9) / 9 * r * 0.4; smp(x, [px - r * 0.08, py, px, py - r * 0.06, px + r * 0.09, py, px, py + r * 0.06], al(sh, 0.55), 0); }
  leg(-r * 0.45, ph, false, false); leg(r * 0.65 + lean, ph + Math.PI, false, true);
  // neck + head
  const nx = r * 0.85 + lean, ny = by - r * 0.45, hx = nx + r * 0.55, hy = ny - r * 0.55 + (atk ? r * 0.2 : sn * r * 0.03);
  limb(x, [nx - r * 0.2, ny + r * 0.1, nx + r * 0.2, ny - r * 0.25, hx - r * 0.25, hy + r * 0.1], r * 0.5, c);
  for (let q = 0; q < 3; q++) tri(x, nx - r * 0.1 + q * r * 0.2, ny - r * 0.35 - q * r * 0.12, nx + q * r * 0.2, ny - r * 0.45 - q * r * 0.12, nx + r * 0.02 + q * r * 0.2, ny - r * 0.65 - q * r * 0.12, '#a89a88');
  for (const s2 of [0, 1]) { x.save(); x.translate(hx - r * 0.3 + s2 * r * 0.15, hy - r * 0.25); x.rotate(-0.7 + s2 * 0.25); smp(x, [-r * 0.1, 0, r * 0.1, 0, r * 0.05, -r * 0.45, -r * 0.25, -r * 0.85, -r * 0.08, -r * 0.4], lg(x, 0, 0, 0, -r * 0.8, '#f0e4c8', '#6a5a40'), 1.1); x.restore(); }
  const op = atk ? r * 0.25 : 0;
  smp(x, [hx - r * 0.45, hy + r * 0.1, hx - r * 0.35, hy - r * 0.32, hx + r * 0.25, hy - r * 0.35, hx + r * 0.85, hy - r * 0.05, hx + r * 0.85, hy + r * 0.12, hx, hy + r * 0.2], lg(x, hx, hy - r * 0.35, hx, hy + r * 0.2, hi, dk), 1.3);
  smp(x, [hx - r * 0.3, hy + r * 0.15, hx + r * 0.75, hy + r * 0.12 + op * 0.4, hx + r * 0.6, hy + r * 0.35 + op, hx - r * 0.15, hy + r * 0.4], lg(x, hx, hy, hx, hy + r * 0.4, c, dk), 1.1);
  for (let q = 0; q < 5; q++) tri(x, hx + r * (0.2 + q * 0.12), hy + r * 0.12, hx + r * (0.26 + q * 0.12), hy + r * 0.12, hx + r * (0.23 + q * 0.12), hy + r * 0.24, '#fffbe8');
  tri(x, hx + r * 0.7, hy - r * 0.08, hx + r * 0.85, hy - r * 0.05, hx + r * 0.78, hy - r * 0.3, '#e8dcc0');
  ball(x, hx + r * 0.2, hy - r * 0.12, r * 0.2, 'rgba(255,200,40,0.55)', 'rgba(255,200,40,0)'); ell(x, hx + r * 0.2, hy - r * 0.12, r * 0.09, r * 0.06, '#ffd040'); seg(x, hx + r * 0.2, hy - r * 0.18, hx + r * 0.2, hy - r * 0.06, '#000000', 1.2); seg(x, hx, hy - r * 0.26, hx + r * 0.4, hy - r * 0.18, OL, 2);
  if (atk) { const fx = hx + r * 0.85; ball(x, fx + r * 0.5, hy + r * 0.25, r * 0.6, 'rgba(220,200,140,0.9)', 'rgba(160,120,60,0)'); for (let q = 0; q < 5; q++) ball(x, fx + r * (0.3 + q * 0.2), hy + r * (0.1 + (q % 2) * 0.25), r * 0.08, '#8a7a60', '#4a3a28', OL); }
}
function paintBug(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean, sc: boolean): void {
  const r = d.r, c = d.c, dk = d.c2, hi = mix(c, '#ffffff', 0.4), sh = mix(dk, '#000000', 0.3), ph = (f / 6) * TAU;
  const by = -r * 0.95 + (atk ? -r * 0.1 : Math.sin(ph * 2) * r * 0.05), bx = atk ? r * 0.2 : 0;
  const legs = (far: boolean): void => { for (let k = 0; k < 4; k++) { const a = ph + k * 1.6 + (far ? Math.PI : 0), lx = bx + r * (0.3 - k * 0.2), sw = Math.sin(a) * r * 0.18, lift = Math.max(0, -Math.cos(a)) * r * 0.15, fx = bx + r * (1.7 - k * 1.05) * (far ? 0.8 : 1) + sw, kx = lx + (fx - lx) * 0.45, ky = by - r * (sc ? 0.55 : 1.05) + Math.abs(k - 1.5) * r * 0.08;
    limb(x, [lx, by, kx, ky, fx, -lift], r * 0.13, far ? sh : dk); if (!far) ball(x, kx, ky, r * 0.08, hi, dk); } };
  legs(true);
  if (sc) { // scorpion tail
    const tw = atk ? 1 : Math.sin(ph) * 0.15; let px = bx - r * 0.9, py = by - r * 0.1; const pts: number[] = [];
    for (let k = 0; k < 5; k++) { const a = -0.6 - k * 0.55 - tw * 0.4 * k; px += Math.cos(Math.PI + a) * r * 0.36 * (k === 0 ? 0.5 : 1); py += Math.sin(a) * r * 0.36 - r * 0.02; pts.push(px, py); }
    for (let k = 0; k < 5; k++) ball(x, pts[k * 2] ?? 0, pts[k * 2 + 1] ?? 0, r * (0.3 - k * 0.03), hi, dk, OL);
    const tx = (pts[8] ?? 0), ty = (pts[9] ?? 0); x.save(); x.translate(tx, ty); x.rotate(atk ? 1.8 : 1.2); smp(x, [-r * 0.12, -r * 0.1, r * 0.22, -r * 0.15, r * 0.5, r * 0.25, r * 0.1, r * 0.1], lg(x, 0, 0, 8, 6, '#ffe080', '#a04010'), 1); ball(x, r * 0.5, r * 0.25, r * 0.15, 'rgba(160,255,80,0.6)', 'rgba(160,255,80,0)'); x.restore();
  } else smp(x, [bx - r * 0.3, by - r * 0.1, bx - r * 0.6, by - r * 0.85, bx - r * 1.5, by - r * 0.7, bx - r * 1.75, by + r * 0.05, bx - r * 1.2, by + r * 0.5, bx - r * 0.4, by + r * 0.35], lg(x, bx - r, by - r * 0.8, bx - r, by + r * 0.4, hi, dk), 1.3);
  if (!sc) { smp(x, [bx - r * 1.4, by - r * 0.5, bx - r * 0.9, by - r * 0.65, bx - r * 0.75, by - r * 0.3, bx - r * 1.1, by - r * 0.1, bx - r * 1.45, by - r * 0.15], d.z === 8 ? '#a08060' : '#e03040', 0.8); for (let k = 0; k < 4; k++) circ(x, bx - r * (0.6 + k * 0.28), by + r * (0.2 - (k % 2) * 0.08), r * 0.04, 'rgba(255,255,255,0.35)'); }
  smp(x, [bx - r * 0.45, by + r * 0.1, bx - r * 0.3, by - r * 0.4, bx + r * 0.4, by - r * 0.42, bx + r * 0.65, by - r * 0.05, bx + r * 0.3, by + r * 0.3, bx - r * 0.3, by + r * 0.3], lg(x, bx, by - r * 0.4, bx, by + r * 0.3, hi, dk), 1.2);
  if (sc) for (let k = 0; k < 3; k++) seg(x, bx - r * 0.3 + k * r * 0.3, by - r * 0.38, bx - r * 0.25 + k * r * 0.3, by + r * 0.25, al(sh, 0.6), 1);
  legs(false);
  const hx = bx + r * 0.7, hy = by - r * 0.08;
  if (sc) { for (const s2 of [0, 1]) { const a = atk ? -0.3 : -0.1 + Math.sin(ph + s2) * 0.15, ex = hx + r * 0.1 - s2 * r * 0.15, ey = hy - s2 * r * 0.1; limb(x, [ex - r * 0.2, ey, ex + r * 0.35, ey - r * 0.3, ex + r * 0.7 + Math.cos(a) * r * 0.1, ey - r * 0.2 + a * r], r * 0.14, s2 ? sh : c); const cx = ex + r * 0.85, cy = ey - r * 0.2 + a * r; smp(x, [cx - r * 0.2, cy, cx + r * 0.1, cy - r * 0.35, cx + r * 0.5, cy - r * 0.25, cx + r * 0.25, cy - r * 0.05, cx + r * 0.5, cy + r * 0.12, cx + r * 0.05, cy + r * 0.25], lg(x, cx, cy - 6, cx, cy + 4, s2 ? c : hi, dk), 1); } }
  ball(x, hx, hy, r * 0.32, hi, dk, OL);
  for (let k = 0; k < 4; k++) ball(x, hx + r * (0.12 + (k % 2) * 0.1), hy - r * (0.12 - Math.floor(k / 2) * 0.12), r * 0.06, '#ffffff', d.ag ? '#ff3030' : '#ffb020');
  if (!sc) for (const s2 of [-1, 1]) { const op = atk ? 0.4 : 0.1; seg(x, hx + r * 0.25, hy + r * 0.15, hx + r * 0.45 + s2 * op * r * 0.2, hy + r * 0.45, OL, r * 0.12); seg(x, hx + r * 0.25, hy + r * 0.15, hx + r * 0.45 + s2 * op * r * 0.2, hy + r * 0.45, '#d8c0a0', r * 0.07); }
  if (atk && !sc) { x.globalAlpha = 0.6; ball(x, hx + r * 0.6, hy + r * 0.5, r * 0.25, 'rgba(160,255,80,0.8)', 'rgba(160,255,80,0)'); x.globalAlpha = 1; }
}
function paintTreant(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean): void {
  const r = d.r, ph = (f / 6) * TAU, sn = atk ? 0 : Math.sin(ph), rot = d.z === 3, bark = rot ? '#5a4a3a' : '#7a5230', bk2 = rot ? '#2a2018' : '#3a2410', leaf = d.c, leaf2 = mix(d.c, '#000000', 0.35);
  const by = -r * 0.1, lean = atk ? r * 0.25 : sn * r * 0.05;
  x.save(); x.scale(0.84, 0.84);
  for (const [sg, far] of [[-1, true], [1, false]] as [number, boolean][]) { const a = ph + (far ? Math.PI : 0), st = atk ? sg * r * 0.3 : Math.sin(a) * r * 0.3, lift = atk ? 0 : Math.max(0, -Math.cos(a)) * r * 0.15;
    smp(x, [sg * r * 0.25 - r * 0.2, -r * 1.1, sg * r * 0.25 + r * 0.2, -r * 1.1, sg * r * 0.25 + st + r * 0.25, -lift, sg * r * 0.25 + st - r * 0.3, -lift], lg(x, 0, -r, r * 0.4, 0, far ? bk2 : bark, bk2), 1.1);
    for (let k = 0; k < 3; k++) { x.save(); x.translate(sg * r * 0.25 + st + (k - 1) * r * 0.2, -lift); x.rotate((k - 1) * 0.6); limb(x, [0, 0, (k - 1) * r * 0.2, r * 0.08], r * 0.09, far ? bk2 : bark); x.restore(); } }
  const tx = lean, ty = -r * 1.0 + by;
  smp(x, [tx - r * 0.55, ty, tx - r * 0.5, ty - r * 1.3, tx - r * 0.2, ty - r * 1.9, tx + r * 0.35, ty - r * 1.9, tx + r * 0.6, ty - r * 1.2, tx + r * 0.5, ty], lg(x, tx - r * 0.5, 0, tx + r * 0.6, 0, mix(bark, '#ffffff', 0.15), bk2), 1.4);
  for (let k = 0; k < 5; k++) seg(x, tx - r * 0.35 + k * r * 0.18, ty - r * 0.1, tx - r * 0.3 + k * r * 0.17 + (k % 2) * r * 0.05, ty - r * 1.6, al(bk2, 0.6), 1);
  const fy = ty - r * 1.1; ell(x, tx + r * 0.15, fy, r * 0.32, r * 0.2, '#1a0e06'); ell(x, tx + r * 0.1, fy + r * 0.45, r * 0.25, atk ? r * 0.2 : r * 0.08, '#1a0e06');
  for (const ex of [tx, tx + r * 0.32]) { ball(x, ex, fy, r * 0.16, rot ? 'rgba(200,120,255,0.6)' : 'rgba(255,230,100,0.6)', 'rgba(0,0,0,0)'); circ(x, ex, fy, r * 0.06, rot ? '#e0b0ff' : '#fff080'); }
  seg(x, tx - r * 0.15, fy - r * 0.2, tx + r * 0.45, fy - r * 0.15, bk2, 2.5);
  for (const [sg, far] of [[-1, true], [1, false]] as [number, boolean][]) { const s0 = { x: tx + sg * r * 0.45, y: ty - r * 1.45 }, a = far ? -0.3 - sn * 0.2 : (atk ? -1.2 : 0.4 + sn * 0.25), e = { x: s0.x + sg * r * 0.5 + (far ? 0 : r * 0.3), y: s0.y + Math.cos(a) * r * 0.5 }, h = { x: e.x + r * 0.5 * (atk && !far ? 1.2 : 0.5) * (sg > 0 ? 1 : -0.6), y: e.y + Math.sin(-a) * r * 0.5 + r * 0.3 };
    limb(x, [s0.x, s0.y, e.x, e.y, h.x, h.y], r * 0.2, far ? bk2 : bark); for (let k = 0; k < 3; k++) { x.save(); x.translate(h.x, h.y); x.rotate(-0.6 + k * 0.6 + (sg < 0 ? Math.PI * 0.3 : 0)); limb(x, [0, 0, r * 0.3, r * 0.05, r * 0.42, -r * 0.08], r * 0.07, far ? bk2 : bark); x.restore(); } }
  const cy = ty - r * 2.15;
  for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU, rr = r * (0.55 + (k % 3) * 0.1); ball(x, tx + Math.cos(a) * r * 0.65 + sn * r * 0.05, cy + Math.sin(a) * r * 0.35, rr, mix(leaf, '#ffffff', 0.15), leaf2, OL); }
  ball(x, tx + r * 0.1, cy - r * 0.15, r * 0.6, mix(leaf, '#ffffff', 0.3), leaf, OL);
  for (let k = 0; k < 8; k++) circ(x, tx + Math.cos(k * 2.4) * r * 0.7, cy + Math.sin(k * 2.4) * r * 0.4, r * 0.06, rot ? '#c060e0' : (k % 2 ? '#ff7090' : '#ffffff'));
  if (rot) for (let k = 0; k < 4; k++) ball(x, tx - r * 0.5 + k * r * 0.35, ty - r * (0.3 + (k % 2) * 0.5), r * 0.1, '#c8ff60', '#4a6a10', OL);
  if (atk) { x.globalAlpha = 0.45; x.strokeStyle = '#ffffff'; x.lineWidth = 2.5; x.beginPath(); x.arc(tx + r * 0.3, ty - r * 1.2, r * 1.5, -1.5, 0.6); x.stroke(); x.globalAlpha = 1; }
  x.restore();
}
const PDF: MDef[] = PSP.map((s0: PSp) => { const b = MD[s0.m] ?? (MD[0] as MDef), cc = PETC[s0.n] ?? [b.c, b.c2]; return { ...b, n: s0.n, c: cc[0], c2: cc[1], b: 0 }; });
function mdef(i: number): MDef | undefined { return i >= 100 ? PDF[i - 100] : MD[i]; }
function paintMon(x: CanvasRenderingContext2D, d: MDef, f: number, atk: boolean): void {
  const al = MALIAS[d.n]; if (al) { const b = MD.find((q: MDef) => q.n === al); if (b) { paintMon(x, { ...d, n: al, s: b.s, v: b.v }, f, atk); return; } }
  const bo = BOT[d.n]; if (bo) { paintBiped(x, d, f, atk, bo); return; }
  if (d.n.indexOf('法利昂') >= 0) { paintSerpent(x, d, f, atk); return; }
  if (d.n.indexOf('巴拉卡斯') >= 0) { paintWyvern(x, d, f, atk); return; }
  if (d.n.indexOf('地龍') >= 0) { paintEarth(x, d, f, atk); return; }
  const qs = PETSP[d.n]; if (qs !== undefined) { paintQuad(x, d, f, atk, qs); return; }
  if (d.n === '小飛龍' || d.n === '幼龍') { paintDrake(x, d, f, atk, d.n === '幼龍'); return; }
  if (d.s === 4) { paintBug(x, d, f, atk, d.n.indexOf('蠍') >= 0); return; }
  if (d.s === 3) { paintTreant(x, d, f, atk); return; }
  if (d.s === 0) { paintSlime(x, d, f, atk); return; }
  if (d.n.indexOf('野兔') >= 0) { paintHare(x, d, f, atk); return; }
  if (d.n.indexOf('哥布林') >= 0) { paintGob(x, d, f, atk); return; }
  const r = d.r, ph = (f / 6) * TAU, sn = Math.sin(ph), c = d.c, dk = d.c2, hi = mix(d.c, "#ffffff", 0.4), sh = mix(d.c2, "#000000", 0.35);
  const body = (cx: number, cy: number, rx: number, ry: number, rot: number): void => {
    const gr = x.createRadialGradient(cx - rx * 0.35, cy - ry * 0.45, 1, cx, cy, Math.max(rx, ry) * 1.1);
    gr.addColorStop(0, hi); gr.addColorStop(0.55, c); gr.addColorStop(1, dk);
    x.fillStyle = gr; x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, TAU); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.4; x.stroke();
  };
  if (d.s === 0) {
    const q = atk ? 0.82 : 1 + sn * 0.1, w = r * q, h = ((r * 0.9) / q) * (atk ? 1.3 : 1);
    x.beginPath(); x.moveTo(-w, 0); x.bezierCurveTo(-w * 1.1, -h * 1.15, w * 1.1, -h * 1.15, w, 0); x.quadraticCurveTo(0, r * 0.18, -w, 0); x.closePath();
    const gr = x.createRadialGradient(-w * 0.3, -h * 0.75, 1, 0, -h * 0.4, w * 1.3); gr.addColorStop(0, hi); gr.addColorStop(0.55, c); gr.addColorStop(1, dk);
    x.fillStyle = gr; x.fill(); x.strokeStyle = OL; x.lineWidth = 1.4; x.stroke();
    ball(x, -w * 0.2, -h * 0.3, r * 0.3, "rgba(255,255,255,0.18)", "rgba(0,60,0,0.15)");
    x.fillStyle = "rgba(255,255,255,0.75)"; x.beginPath(); x.ellipse(-w * 0.42, -h * 0.78, w * 0.22, h * 0.1, -0.5, 0, TAU); x.fill();
    for (const ex of [w * 0.12, w * 0.5]) { ball(x, ex, -h * 0.55, r * 0.17, "#ffffff", "#cfe0cf", OL); ball(x, ex + r * 0.05, -h * 0.53, r * 0.08, "#303030", "#000000"); }
    if (atk) { x.fillStyle = "#1a3a1a"; x.beginPath(); x.ellipse(w * 0.32, -h * 0.28, r * 0.18, r * 0.14, 0, 0, TAU); x.fill(); }
    else { x.strokeStyle = "#1a3a1a"; x.lineWidth = 1; x.beginPath(); x.arc(w * 0.32, -h * 0.36, r * 0.12, 0.3, Math.PI - 0.3); x.stroke(); }
  } else if (d.s === 1 && d.v === 0) {
    const hop = Math.abs(sn) * r * 0.45;
    x.translate(0, -hop);
    ball(x, -r * 0.95, -r * 0.8, r * 0.3, "#ffffff", "#d0d0d0", OL);
    body(0, -r * 0.72, r * 0.95, r * 0.68, 0);
    for (const [o, rot] of [[0.5, -0.35], [0.85, 0.05]] as [number, number][]) {
      x.save(); x.translate(r * o, -r * 1.55); x.rotate(rot + (atk ? -0.4 : sn * 0.06));
      body(0, -r * 0.5, r * 0.17, r * 0.6, 0); x.fillStyle = "#f4a8b8"; x.beginPath(); x.ellipse(0, -r * 0.5, r * 0.07, r * 0.42, 0, 0, TAU); x.fill();
      x.restore();
    }
    body(r * 0.72, -r * 1.2, r * 0.5, r * 0.45, 0);
    ball(x, r * 0.92, -r * 1.28, r * 0.1, d.ag ? "#ff5040" : "#3a1a10", "#000000");
    ball(x, r * 1.2, -r * 1.12, r * 0.07, "#ff9ab0", "#c05070");
  } else if (d.s === 1 && d.v === 1) {
    const leg = (hx: number, a: number, col: string): void => limb(x, [hx, -r * 0.6, hx + Math.sin(a) * r * 0.3, -r * 0.3, hx + Math.sin(a) * r * 0.45 - r * 0.05, 0], r * 0.2, col);
    leg(r * 0.5, -sn * 0.8, sh); leg(-r * 0.6, sn * 0.8, sh);
    x.lineCap = "round";
    for (const [lw, cc] of [[r * 0.42, OL], [r * 0.3, c]] as [number, string][]) { x.strokeStyle = cc; x.lineWidth = lw; x.beginPath(); x.moveTo(-r * 0.85, -r * 0.8); x.quadraticCurveTo(-r * 1.45, -r * (0.95 + sn * 0.15), -r * 1.65, -r * 0.45); x.stroke(); }
    body(0, -r * 0.75, r * 1.05, r * 0.46, 0);
    x.strokeStyle = sh; x.lineWidth = 1;
    for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(-r * 0.6 + i * r * 0.28, -r * 1.12); x.lineTo(-r * 0.7 + i * r * 0.28, -r * 0.98); x.stroke(); }
    leg(r * 0.6, sn * 0.8, c); leg(-r * 0.5, -sn * 0.8, c);
    x.save(); x.translate(r * 0.95, -r * 1.0 + (atk ? r * 0.18 : 0)); x.rotate(atk ? 0.3 : sn * 0.05);
    body(-r * 0.2, r * 0.08, r * 0.42, r * 0.45, 0);
    shape(x, [-r * 0.2, -r * 0.25, -r * 0.05, -r * 0.75, r * 0.12, -r * 0.28], dk, OL); shape(x, [r * 0.05, -r * 0.25, r * 0.2, -r * 0.7, r * 0.32, -r * 0.22], c, OL);
    ball(x, r * 0.05, -r * 0.05, r * 0.38, hi, c, OL);
    shape(x, [r * 0.2, -r * 0.18, r * 0.8, -r * 0.05, r * 0.78, r * 0.08, r * 0.2, r * 0.12], c, OL);
    if (atk) { shape(x, [r * 0.2, r * 0.12, r * 0.72, r * 0.22, r * 0.68, r * 0.34, r * 0.18, r * 0.3], "#5a1010", OL); tri(x, r * 0.5, r * 0.1, r * 0.55, r * 0.22, r * 0.6, r * 0.1, "#ffffff"); tri(x, r * 0.35, r * 0.12, r * 0.4, r * 0.24, r * 0.45, r * 0.12, "#ffffff"); }
    ball(x, r * 0.8, 0, r * 0.08, "#333333", "#000000");
    eye(x, r * 0.22, -r * 0.12, r * 0.07, "#ff4030");
    x.restore();
  } else if (d.s === 1) {
    const legW = (hx: number, a: number, col: string): void => limb(x, [hx, -r * 0.95, hx + r * 0.25 + Math.sin(a) * r * 0.2, -r * 0.5, hx - r * 0.1 + Math.sin(a) * r * 0.35, -r * 0.12, hx + r * 0.15 + Math.sin(a) * r * 0.35, 0], r * 0.22, col);
    const arm = (sx: number, a: number, col: string): void => {
      const ex = sx + Math.sin(a) * r * 0.55, ey = -r * 1.6 + Math.cos(a) * r * 0.55, hx2 = ex + Math.sin(a * 0.8) * r * 0.5, hy2 = ey + Math.cos(a * 0.8) * r * 0.5;
      limb(x, [sx, -r * 1.6, ex, ey, hx2, hy2], r * 0.2, col);
      for (let i = -1; i <= 1; i++) seg(x, hx2, hy2, hx2 + Math.sin(a) * r * 0.22 + i * 2, hy2 + Math.cos(a) * r * 0.22 + 2, "#f0ead8", 1.2);
    };
    legW(-r * 0.15, -sn * 0.5, sh);
    arm(-r * 0.35, atk ? -1.2 : -0.2 - sn * 0.15, sh);
    body(0, -r * 1.35, r * 0.55, r * 0.6, 0.1);
    ball(x, r * 0.12, -r * 1.3, r * 0.3, mix(c, "#ffffff", 0.3), c);
    box(x, -r * 0.5, -r * 0.98, r * 1.0, r * 0.25, 2, "#3a2a1a", OL);
    legW(r * 0.15, sn * 0.5, c);
    x.save(); x.translate(r * 0.2, -r * 2.0); x.rotate(atk ? 0.25 : 0);
    shape(x, [-r * 0.25, -r * 0.15, -r * 0.12, -r * 0.7, r * 0.05, -r * 0.2], dk, OL); shape(x, [0, -r * 0.2, r * 0.15, -r * 0.68, r * 0.3, -r * 0.18], c, OL);
    ball(x, 0, 0, r * 0.36, hi, c, OL);
    shape(x, [r * 0.15, -r * 0.12, r * 0.72, 0, r * 0.7, r * 0.12, r * 0.15, r * 0.18], c, OL);
    if (atk) shape(x, [r * 0.15, r * 0.18, r * 0.6, r * 0.3, r * 0.15, r * 0.32], "#5a1010", OL);
    ball(x, r * 0.72, r * 0.03, r * 0.07, "#222222", "#000000");
    eye(x, r * 0.2, -r * 0.08, r * 0.07, "#ffd030");
    x.restore();
    arm(r * 0.4, atk ? -1.9 : 0.25 + sn * 0.15, c);
  } else if (d.s === 2) {
    const sk = d.v === 2, orc = d.v === 1;
    if (atk) x.translate(ATKPH ? r * 0.12 : -r * 0.06, 0);
    const skin = sk ? c : orc ? "#7d9a52" : c, skinD = sk ? dk : orc ? "#4a6028" : dk;
    const legH = r * 0.75, s2 = atk ? 0 : sn;
    const legF = (lx: number, a: number, col: string): void => {
      limb(x, [lx, -legH, lx + Math.sin(a) * r * 0.25, -legH * 0.45, lx + Math.sin(a) * r * 0.32, -r * 0.05], sk ? r * 0.12 : r * 0.24, col);
      box(x, lx + Math.sin(a) * r * 0.32 - r * 0.15, -r * 0.16, r * 0.38, r * 0.16, 2, sk ? c : "#3a2a1a", OL);
    };
    legF(-r * 0.15, -s2 * 0.6, sk ? dk : skinD);
    if (sk) { ball(x, -r * 0.45, -r * 1.15, r * 0.45, "#b08a60", "#4a3020", OL); ball(x, -r * 0.45, -r * 1.15, r * 0.13, "#d8c8a8", "#706040"); }
    else limb(x, [-r * 0.4, -r * 1.35, -r * 0.5 - s2 * r * 0.1, -r * 0.85], r * 0.18, skinD);
    if (sk) {
      seg(x, 0, -legH, 0, -r * 1.5, OL, 3.5); seg(x, 0, -legH, 0, -r * 1.5, c, 2);
      for (let i = 0; i < 4; i++) { const yy = -r * 1.42 + i * r * 0.14; x.beginPath(); x.ellipse(0, yy, r * (0.42 - i * 0.04), r * 0.07, 0, 0, Math.PI); x.strokeStyle = OL; x.lineWidth = 3; x.stroke(); x.strokeStyle = c; x.lineWidth = 1.6; x.stroke(); }
      ball(x, 0, -legH, r * 0.2, c, dk, OL);
    } else {
      const tw = orc ? 0.62 : 0.5;
      shape(x, [-r * 0.45, -legH, r * 0.45, -legH, r * tw, -r * 1.5, -r * tw, -r * 1.5], lg(x, -r * 0.5, 0, r * 0.5, 0, mix(orc ? "#7d9a52" : c, "#ffffff", 0.25), skinD), OL);
      if (orc) {
        shape(x, [-r * 0.5, -r * 0.85, r * 0.5, -r * 0.85, r * 0.55, -r * 1.35, -r * 0.55, -r * 1.35], lg(x, 0, -r * 1.35, 0, -r * 0.85, mix(c, "#ffffff", 0.2), dk), OL);
        ball(x, -r * 0.5, -r * 1.42, r * 0.25, "#b8c0c8", "#505860", OL);
        ball(x, 0, -r * 1.2, 1.4, "#e0e0e0", "#808080"); ball(x, 0, -r * 1.0, 1.4, "#e0e0e0", "#808080");
      }
      shape(x, [-r * 0.47, -legH - 1, r * 0.47, -legH - 1, r * 0.3, -r * 0.35, -r * 0.3, -r * 0.35], "#6a4a2a", OL);
    }
    legF(r * 0.15, s2 * 0.6, sk ? c : skin);
    const hy = -r * 1.85;
    if (sk) {
      ball(x, 0, hy, r * 0.42, "#ffffff", "#a8a498", OL);
      box(x, -r * 0.1, hy + r * 0.2, r * 0.42, r * 0.2, 2, "#d8d4c8", OL);
      ball(x, r * 0.15, hy - r * 0.02, r * 0.12, "#000000", "#000000"); ball(x, -r * 0.12, hy - r * 0.02, r * 0.11, "#000000", "#000000");
      eye(x, r * 0.15, hy - r * 0.02, r * 0.05, "#40c0ff");
    } else {
      shape(x, [-r * 0.25, hy - r * 0.05, -r * (orc ? 0.55 : 0.85), hy - r * (orc ? 0.2 : 0.45), -r * 0.2, hy + r * 0.15], skin, OL);
      ball(x, 0, hy, r * (orc ? 0.45 : 0.4), mix(skin, "#ffffff", 0.3), skinD, OL);
      if (!orc) shape(x, [r * 0.25, hy - r * 0.05, r * 0.55, hy + r * 0.05, r * 0.25, hy + r * 0.15], skin, OL);
      eye(x, r * 0.2, hy - r * 0.08, r * 0.07, orc ? "#ff3020" : "#ffe040");
      if (orc) { tri(x, r * 0.2, hy + r * 0.25, r * 0.26, hy + r * 0.05, r * 0.32, hy + r * 0.25, "#f8f0d8"); box(x, -r * 0.4, hy - r * 0.45, r * 0.8, r * 0.2, 3, "#5a5a60", OL); }
      x.fillStyle = "#1a1010"; x.fillRect(r * 0.05, hy + r * 0.2, r * 0.25, 1.5);
    }
    if (atk && ATKPH) { x.globalAlpha = 0.45; x.strokeStyle = '#ffffff'; x.lineWidth = 2.2; x.beginPath(); x.arc(r * 0.35, -r * 1.35, r * 1.7, -2.0, 0.7); x.stroke(); x.globalAlpha = 1; }
    x.save(); x.translate(r * 0.35, -r * 1.35); x.rotate(atk ? (ATKPH ? -1.25 : 2.72) : 0.35 + sn * 0.12);
    limb(x, [0, 0, 0, r * 0.55], sk ? r * 0.12 : r * 0.2, sk ? c : skin);
    x.translate(0, r * 0.6); x.rotate(atk ? (ATKPH ? 3.54 : -3.24) : -1.2);
    if (sk) { shape(x, [-1.5, 0, -1.5, -r * 1.3, 0, -r * 1.45, 1.5, -r * 1.3, 1.5, 0], lg(x, -2, 0, 2, 0, "#c8b8a0", "#6a5a48"), OL, 1); box(x, -4, -1, 8, 2.5, 1, "#7a6040", OL); }
    else if (orc) { box(x, -1.5, -r * 1.2, 3, r * 1.35, 1, "#5a3a22", OL); shape(x, [1, -r * 1.15, r * 0.6, -r * 1.35, r * 0.7, -r * 0.8, 1, -r * 0.85], lg(x, 0, -r * 1.3, 0, -r * 0.8, "#e8eef4", "#7a8696"), OL); }
    else { shape(x, [-2, 0, -3.5, -r * 1.0, 0, -r * 1.25, 3.5, -r * 1.0, 2, 0], lg(x, -3, 0, 3, 0, "#a87a4a", "#5a3a1a"), OL); ball(x, 1, -r * 0.7, 1.3, "#4a2a12", "#2a1a0a"); }
    x.restore();
  } else if (d.s === 3) {
    const sw = atk ? -0.9 : sn * 0.15;
    for (const [rx, a] of [[-r * 0.35, sn], [0, -sn], [r * 0.35, sn]] as [number, number][]) limb(x, [rx, -r * 0.5, rx + a * r * 0.12 + rx * 0.4, -r * 0.05], r * 0.18, "#4a3018");
    limb(x, [-r * 0.35, -r * 1.25, -r * 0.9, -r * 1.5 + sw * r * 0.6, -r * 1.15, -r * 1.95 + sw * r], r * 0.16, "#5a3a20");
    shape(x, [-r * 0.45, -r * 0.35, r * 0.45, -r * 0.35, r * 0.32, -r * 1.6, -r * 0.32, -r * 1.6], lg(x, -r * 0.45, 0, r * 0.45, 0, "#8a6038", "#3a2412"), OL);
    x.strokeStyle = "rgba(30,15,5,0.6)"; x.lineWidth = 1;
    for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(i * r * 0.18, -r * 0.4); x.quadraticCurveTo(i * r * 0.25, -r * 0.9, i * r * 0.14, -r * 1.5); x.stroke(); }
    ball(x, -r * 0.12, -r * 1.15, r * 0.11, "#1a0a00", "#000000"); ball(x, r * 0.18, -r * 1.15, r * 0.11, "#1a0a00", "#000000");
    eye(x, -r * 0.12, -r * 1.15, r * 0.05, "#ffe040"); eye(x, r * 0.18, -r * 1.15, r * 0.05, "#ffe040");
    x.fillStyle = "#1a0a00"; x.beginPath(); x.ellipse(r * 0.03, -r * 0.82, r * 0.15, atk ? r * 0.12 : r * 0.05, 0, 0, TAU); x.fill();
    const crown: [number, number, number][] = [[0, -1.95, 0.75], [-0.6, -1.7, 0.5], [0.6, -1.72, 0.5], [-0.3, -2.4, 0.45], [0.35, -2.35, 0.45]];
    for (const [bx, by, br] of crown) ball(x, bx * r, by * r, br * r + 1.3, OL, OL);
    for (const [bx, by, br] of crown) ball(x, bx * r, by * r + sn * 0.6, br * r, hi, dk);
    ball(x, -r * 0.25, -r * 2.2, r * 0.2, "rgba(255,255,255,0.25)", "rgba(255,255,255,0)");
    ball(x, r * 0.3, -r * 1.9, r * 0.08, "#ff8a6a", "#c03020");
    limb(x, [r * 0.35, -r * 1.25, r * 0.9, -r * 1.45 - sw * r * 0.6, r * 1.2, -r * 1.9 - sw * r], r * 0.16, "#6a4428");
    seg(x, r * 1.0, -r * 1.6 - sw * r * 0.7, r * 1.3, -r * 1.55 - sw * r * 0.7, "#6a4428", 2);
  } else if (d.s === 4) {
    const legS = (i: number, far: boolean): void => {
      const bx = r * (0.45 - i * 0.22), w2 = Math.sin(ph + i * 1.3 + (far ? Math.PI : 0)) * r * 0.15;
      const lift = atk && i === 0 && !far ? r * 0.9 : 0, dirx = i < 2 ? 1 : -1;
      limb(x, [bx, -r * 0.65, bx + dirx * r * 0.55, -r * 1.25 + w2 - lift * 0.5, bx + dirx * r * (far ? 0.95 : 1.1), -lift + Math.max(0, w2)], r * 0.09, far ? sh : dk);
    };
    for (let i = 0; i < 4; i++) legS(i, true);
    body(-r * 0.5, -r * 0.8, r * 0.72, r * 0.6, -0.15);
    shape(x, [-r * 0.55, -r * 1.2, -r * 0.4, -r * 0.85, -r * 0.55, -r * 0.5, -r * 0.7, -r * 0.85], "#ff3030", OL, 0.8);
    body(r * 0.35, -r * 0.62, r * 0.4, r * 0.34, 0);
    for (const [ex, ey] of [[0.55, -0.75], [0.66, -0.68], [0.48, -0.82]] as [number, number][]) eye(x, ex * r, ey * r, r * 0.05, "#ff2020");
    tri(x, r * 0.62, -r * 0.45, r * 0.7, -r * 0.2, r * 0.56, -r * 0.4, "#e8e0d0");
    for (let i = 0; i < 4; i++) legS(i, false);
  } else {
    const boss = d.s === 6, fl = sn * (boss ? 0.25 : 0.4);
    const wing = (ox: number, col: string, s2: number): void => {
      const by = -r * 1.5, tipY = -r * (2.4 + fl) * s2;
      const pts = [ox - r * 0.1, by, ox - r * 0.9 * s2, tipY, ox - r * 1.7 * s2, -r * (1.9 + fl * 0.5) * s2, ox - r * 1.55 * s2, -r * 1.35, ox - r * 1.15 * s2, -r * 1.55, ox - r * 0.85 * s2, -r * 1.1, ox - r * 0.3, -r * 1.15];
      shape(x, pts, lg(x, 0, tipY, 0, -r, mix(col, "#ffffff", 0.15), col), OL, 1.4);
      x.strokeStyle = OL; x.lineWidth = 1.1;
      for (const [tx2, ty2] of [[-1.55, -1.35], [-1.15, -1.55], [-0.85, -1.1]] as [number, number][]) { x.beginPath(); x.moveTo(ox - r * 0.9 * s2, tipY); x.lineTo(ox + tx2 * r * s2, ty2 * r); x.stroke(); }
    };
    wing(r * 0.35, sh, 0.85);
    wing(0, dk, 1);
    x.lineCap = "round";
    for (const [lw, cc] of [[r * 0.2, OL], [r * 0.12, dk]] as [number, string][]) { x.strokeStyle = cc; x.lineWidth = lw; x.beginPath(); x.moveTo(-r * 0.4, -r * 0.6); x.quadraticCurveTo(-r * 1.3, -r * 0.2 + sn * r * 0.1, -r * 1.5, -r * 0.7); x.stroke(); }
    tri(x, -r * 1.5, -r * 0.95, -r * 1.75, -r * 0.6, -r * 1.35, -r * 0.6, dk);
    limb(x, [-r * 0.2, -r * 0.8, -r * 0.45, -r * 0.4, -r * 0.2, 0], r * 0.2, sh);
    body(0, -r * 1.15, r * 0.55, r * 0.6, 0.15);
    if (boss) {
      box(x, -r * 0.42, -r * 1.55, r * 0.84, r * 0.35, 3, lg(x, 0, -r * 1.55, 0, -r * 1.2, "#5a5a66", "#22222a"), OL);
      x.strokeStyle = "#e8b040"; x.lineWidth = 1.2; x.strokeRect(-r * 0.38, -r * 1.52, r * 0.76, r * 0.29);
      x.strokeStyle = "#ffb040"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-r * 0.2, -r * 1.1); x.lineTo(0, -r * 0.9); x.lineTo(r * 0.15, -r * 1.05); x.moveTo(-r * 0.1, -r * 0.8); x.lineTo(r * 0.05, -r * 0.7); x.stroke();
    } else { for (const [sx, sy] of [[-0.2, -1.3], [0.15, -1.0], [-0.05, -0.85], [0.25, -1.35]] as [number, number][]) ball(x, sx * r, sy * r, 1.4, "#5a6068", "#30343a"); }
    limb(x, [r * 0.25, -r * 0.8, r * 0.5, -r * 0.45, r * 0.3, 0], r * 0.2, c);
    const hx = r * 0.3, hy = -r * 1.85;
    const horn = boss ? "#f0e0c0" : "#4a4a52";
    limb(x, [hx - r * 0.15, hy - r * 0.25, hx - r * 0.45, hy - r * 0.65, hx - r * 0.2, hy - r * 0.9], r * (boss ? 0.12 : 0.09), horn);
    ball(x, hx, hy, r * 0.38, hi, c, OL);
    limb(x, [hx + r * 0.05, hy - r * 0.3, hx + r * 0.1, hy - r * 0.75, hx + r * 0.4, hy - r * 0.85], r * (boss ? 0.12 : 0.09), horn);
    shape(x, [hx + r * 0.2, hy + r * 0.05, hx + r * 0.55, hy + r * 0.1, hx + r * 0.45, hy + r * (atk ? 0.4 : 0.25), hx + r * 0.15, hy + r * 0.3], atk ? "#3a0808" : c, OL);
    if (atk) { tri(x, hx + r * 0.3, hy + r * 0.12, hx + r * 0.34, hy + r * 0.24, hx + r * 0.38, hy + r * 0.12, "#ffffff"); }
    eye(x, hx + r * 0.2, hy - r * 0.08, r * 0.07, boss ? "#ffe040" : "#ff3030");
    x.save(); x.translate(r * 0.35, -r * 1.5); x.rotate(atk ? -2.0 : 0.4 + sn * 0.1);
    limb(x, [0, 0, 0, r * 0.55], r * 0.17, c);
    for (let i = -1; i <= 1; i++) seg(x, i * 2, r * 0.6, i * 3, r * 0.78, "#f0ead8", 1.2);
    if (boss) {
      x.translate(0, r * 0.6); x.rotate(-1.3);
      shape(x, [-2.5, 0, -3, -r * 1.6, 0, -r * 1.8, 3, -r * 1.6, 2.5, 0], lg(x, -3, 0, 3, 0, "#ffb070", "#5a1810"), OL, 1.2);
      x.strokeStyle = "rgba(255,160,60,0.8)"; x.lineWidth = 1; x.beginPath(); x.moveTo(0, -2); x.lineTo(0, -r * 1.6); x.stroke();
      box(x, -7, -1, 14, 3.5, 1.5, "#c89a30", OL);
    }
    x.restore();
  }
}
const RIMC = ['#fff0c8', '#ffe8b0', '#e0ffd0', '#c8ffe0', '#ffd8a0', '#d8f0ff', '#ffa060', '#e0b0ff', '#ffb070', '#c8a8ff', '#ff7040', '#e0b8ff', '#ff9050', '#c0ecff', '#d090ff'];
const SHC = ['rgba(30,20,60,0.42)', 'rgba(40,24,40,0.42)', 'rgba(10,30,20,0.5)', 'rgba(20,30,40,0.48)', 'rgba(60,20,10,0.45)', 'rgba(20,40,90,0.42)', 'rgba(90,10,0,0.5)', 'rgba(30,0,50,0.55)', 'rgba(40,10,0,0.55)', 'rgba(20,0,50,0.55)', 'rgba(70,0,0,0.55)', 'rgba(40,10,60,0.55)', 'rgba(80,10,0,0.55)', 'rgba(10,30,80,0.5)', 'rgba(30,0,60,0.6)'];
function finishMon(cv: HTMLCanvasElement, d: MDef): void {
  const x = cv.getContext('2d'), W = cv.width, H = cv.height, a = mk(W, H), b = mk(W, H);
  if (!x || !a || !b) return;
  const [ac, ax] = a, [bc, bx] = b;
  ax.drawImage(cv, 0, 0); ax.globalCompositeOperation = 'source-in'; ax.fillStyle = RIMC[d.z] ?? '#fff0c8'; ax.fillRect(0, 0, W, H);
  ax.globalCompositeOperation = 'destination-out'; ax.drawImage(cv, 3, 4);
  bx.drawImage(cv, 0, 0); bx.globalCompositeOperation = 'source-in'; bx.fillStyle = 'rgba(8,4,12,0.9)'; bx.fillRect(0, 0, W, H);
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
  matPass(x, bc, W, H, d.b ? 0.32 : 0.26, 0.3);
  x.globalCompositeOperation = 'source-atop';
  const gr = x.createLinearGradient(W * 0.2, H * 0.2, W * 0.6, H * 0.85);
  gr.addColorStop(0, 'rgba(255,244,220,0.16)'); gr.addColorStop(0.45, 'rgba(0,0,0,0)'); gr.addColorStop(1, SHC[d.z] ?? 'rgba(20,10,40,0.45)');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  const sg = x.createRadialGradient(W * 0.42, H * 0.45, 2, W * 0.5, H * 0.6, W * 0.55);
  sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.22)');
  x.fillStyle = sg; x.fillRect(0, 0, W, H);
  if (d.b) { const ug = x.createRadialGradient(W / 2, H * 0.85, 4, W / 2, H * 0.85, H * 0.6); const uw = (MALIAS[d.n] ?? d.n).indexOf('法利昂') >= 0; ug.addColorStop(0, uw ? 'rgba(60,170,255,0.35)' : 'rgba(255,90,20,0.5)'); ug.addColorStop(1, uw ? 'rgba(40,140,255,0)' : 'rgba(255,60,0,0)'); x.fillStyle = ug; x.fillRect(0, 0, W, H); }
  x.globalCompositeOperation = 'lighter'; x.globalAlpha = d.z >= 8 ? 0.75 : 0.6; x.drawImage(ac, 0, 0);
  x.globalCompositeOperation = 'destination-over'; x.globalAlpha = 1;
  for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2]] as [number, number][]) x.drawImage(bc, ox, oy);
  x.restore();
}
const MSPR: Record<number, HTMLCanvasElement[] | null> = {};
function monFrames(i: number): HTMLCanvasElement[] | null {
  if (i in MSPR) return MSPR[i] ?? null;
  const d = mdef(i);
  if (!d) return null;
  const out = MPART[i] ?? [];
  while (out.length < 8) { const c = monFrame1(i, d, out.length); if (!c) { MSPR[i] = null; return null; } out.push(c); }
  MSPR[i] = out; delete MPART[i];
  return out;
}
const MPART: Record<number, HTMLCanvasElement[]> = {};
let ATKPH = 1;
function monFrame1(i: number, d: MDef, f: number): HTMLCanvasElement | null {
  const K = mvk(i), S = Math.ceil(d.r * 5 * K), r = mk(S * 2, S * 2);
  if (!r) return null;
  r[1].setTransform(2 * K, 0, 0, 2 * K, S, S * 1.68);
  ATKPH = f === 6 ? 0 : 1;
  try { paintMon(r[1], d, f % 6, f >= 6); finishMon(r[0], d); } catch { /* keep partial */ }
  ATKPH = 1;
  return r[0];
}
let WZ = -999, WQ: number[] = [], WN = 0, WT = 0;
function warmStep(g: G): void {
  WT++; if (WT % 2) return;
  if (WZ !== g.zone) { WZ = g.zone; const q: number[] = [], pd = curPet(g.p); if (pd) q.push(100 + (pd[0] ?? 0)); const pf = POLY[g.p.poly ?? -1]; if (pf) q.push(pf.m); for (const m of g.mons) q.push(m.d); MD.forEach((d0: MDef, i: number) => { if (d0.z === g.zone) q.push(i); }); MD.forEach((_d: MDef, i: number) => { q.push(i); }); PSP.forEach((_s: PSp, i: number) => { q.push(100 + i); }); WQ = q; }
  const NT = NPO.length * 12, npc = (): void => { const li = Math.floor(WN / 12), k = WN % 12; WN++; npcFrame(li, k < 4 ? 0 : 1, k < 4 ? k : k - 4); };
  if (g.zone === -1 && WN < NT) { npc(); return; }
  while (WQ.length) { const i = WQ[0] ?? 0; if (i in MSPR) { WQ.shift(); continue; } const d = mdef(i); if (!d) { WQ.shift(); continue; } const out = MPART[i] ?? (MPART[i] = []); const c = monFrame1(i, d, out.length); if (!c) { MSPR[i] = null; return; } out.push(c); if (out.length >= 8) { MSPR[i] = out; delete MPART[i]; } return; }
  if (WN < NT) npc();
}
function drawMon2(ctx: CanvasRenderingContext2D, m: Mon, sel: boolean, font: string, time: number): void {
  const fr = monFrames(m.d);
  if (!fr) { drawMon(ctx, m, sel, font, time); return; }
  const d = md(m), r = d.r, S = Math.ceil(r * 5 * mvk(m.d)), dying = m.dead > 0, k = dying ? clamp(m.dieT / 0.7, 0, 1) : 1, face = m.face < 0 ? -1 : 1;
  const lunge = m.atkT > 0.17 ? -(1 - (m.atkT - 0.17) / 0.11) * 3 : m.atkT > 0 ? Math.sin((1 - m.atkT / 0.17) * Math.PI) * 8 : 0;
  shadow(ctx, m.x, m.y + 1, r * 1.2 * (dying ? 0.5 + k * 0.5 : 1));
  if (!dying) ell(ctx, m.x, m.y + 1, r * 0.75, r * 0.22, 'rgba(0,0,0,0.32)');
  if (d.b && !dying) {
    ball(ctx, m.x, m.y - r, r * (2 + Math.sin(time * 3) * 0.15), "rgba(255,90,30,0.35)", "rgba(0,0,0,0)");
    for (let i = 0; i < 6; i++) { const t = (time * 0.45 + i / 6) % 1; circ(ctx, m.x + Math.sin(i * 2.1 + time * 1.3) * r * 1.1, m.y - t * r * 3.2, 2.4 * (1 - t) + 0.4, `rgba(255,${120 + i * 15},40,${(1 - t) * 0.9})`); }
  }
  if (sel && !dying) { ctx.strokeStyle = `rgba(255,80,80,${0.7 + Math.sin(time * 6) * 0.3})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(m.x, m.y + 1, r * 1.4, r * 0.55, 0, 0, TAU); ctx.stroke(); }
  const fi = m.atkT > 0 ? (m.atkT > 0.17 ? 6 : 7) : Math.floor(Math.max(0, m.anim) * (3 + d.sp / 25)) % 6;
  const img = fr[fi] ?? fr[0];
  ctx.save(); ctx.translate(m.x + lunge * face, m.y);
  if (dying) { ctx.globalAlpha = k; ctx.rotate((1 - k) * 0.5 * face); ctx.scale(1 + (1 - k) * 0.3, 0.3 + k * 0.7); }
  const br = dying ? 0 : Math.sin(time * 2.6 + m.hx * 0.013) * 0.028;
  if (m.hit > 0 && !dying) { ctx.translate(-face * 3, 0); ctx.rotate(-0.07 * face); }
  if (m.el && !dying) { ctx.scale(1.35, 1.35); ctx.globalCompositeOperation = 'lighter'; ball(ctx, 0, -r, r * 1.6, 'rgba(190,90,255,0.35)', 'rgba(0,0,0,0)'); ctx.globalCompositeOperation = 'source-over'; }
  ctx.scale(face * (1 - br * 0.6), 1 + br);
  if (img) {
    ctx.drawImage(img, -S / 2, -S * 0.84, S, S);
    if (m.hit > 0) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.6; ctx.drawImage(img, -S / 2, -S * 0.84, S, S); ctx.globalCompositeOperation = "source-over"; }
  }
  ctx.restore(); ctx.globalAlpha = 1;
  if (!dying) monLabel(ctx, m, sel, font);
  if (!dying && m.stun > 0) for (let i = 0; i < 3; i++) { const a = time * 5 + (i * TAU) / 3; circ(ctx, m.x + Math.cos(a) * 11, m.y - r * 2.3 + Math.sin(a) * 3, 2.4, '#ffe060'); }
  if (!dying && m.slow > 0) { ctx.strokeStyle = 'rgba(140,220,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(m.x, m.y, r * 1.2, r * 0.45, 0, 0, TAU); ctx.stroke(); }
}
function drawSpirit(ctx: CanvasRenderingContext2D, pt: Pet, time: number, font: string): void {
  const x = pt.x, y = pt.y - 24 + Math.sin(time * 3) * 4;
  shadow(ctx, pt.x, pt.y + 1, 10);
  ball(ctx, x, y, 28, 'rgba(120,220,255,0.3)', 'rgba(0,0,0,0)');
  for (let i = 5; i >= 0; i--) { const t = i / 6; circ(ctx, x - pt.face * (6 + i * 4) + Math.sin(time * 6 + i) * 2, y + 6 + i * 3, 8 * (1 - t), `rgba(${150 + i * 15},230,255,${0.75 - t * 0.6})`); }
  ball(ctx, x, y, 11, '#ffffff', '#3aa8f0', OL);
  ball(ctx, x - 3, y - 4, 4, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)');
  circ(ctx, x + pt.face * 3, y - 1, 1.6, '#003050'); circ(ctx, x + pt.face * 7, y - 1, 1.6, '#003050');
  const ec = ['#ff7040', '#60c0ff', '#80ff90', '#ffe060'];
  for (let i = 0; i < 4; i++) { const a = time * 2.5 + (i * TAU) / 4; ball(ctx, x + Math.cos(a) * 19, y + Math.sin(a) * 7, 3.2, '#ffffff', ec[i] ?? '#ffffff'); }
  label(ctx, `屬性精靈 ${Math.ceil(pt.life)}`, pt.x, pt.y - 58, '#a0e8ff', 10, font, 'center');
}
function drawFx(ctx: CanvasRenderingContext2D, g: G): void {
  for (const f of g.fx) {
    const a = clamp(f.l / f.m, 0, 1), t = 1 - a, x = f.x, y = f.y;
    ctx.save(); ctx.globalAlpha = a;
    if (f.k === 0) { for (let i = 0; i < 7; i++) { const w = 10 + i * 7, ph = g.time * 9 + i; ctx.strokeStyle = i % 2 ? 'rgba(200,255,230,0.85)' : 'rgba(255,255,255,0.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x + Math.sin(ph) * 4, y - i * 12, w, w * 0.28, 0, ph % TAU, (ph % TAU) + 4.5); ctx.stroke(); } }
    else if (f.k === 1) { ctx.fillStyle = 'rgba(255,230,140,0.18)'; ctx.beginPath(); ctx.ellipse(x, y, 46, 70, 0, Math.PI, TAU); ctx.fill(); ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 2; ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(255,240,180,0.35)'; ctx.fillRect(x + (i - 1.5) * 24 - 3, y - 130 * a, 6, 130 * a); } }
    else if (f.k === 2) { const rr = 24 + t * 24; ctx.strokeStyle = '#ffb040'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 6; i++) { const an = (i / 6) * TAU + g.time * 2, px = x + Math.cos(an) * rr, py = y - 14 + Math.sin(an) * rr * 0.6; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke(); for (let i = 0; i < 6; i++) { const an = (i / 6) * TAU; seg(ctx, x + Math.cos(an) * rr, y - 14 + Math.sin(an) * rr * 0.6, x + Math.cos(an) * (rr + 16), y - 14 + Math.sin(an) * (rr + 16) * 0.6, '#fff0c0', 2); } }
    else if (f.k === 3) { ball(ctx, x, y - 18, 30 + t * 12, 'rgba(200,160,255,0.05)', 'rgba(160,100,255,0.5)'); ctx.strokeStyle = '#e0c8ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y - 18, 30 + t * 12, 0, TAU); ctx.stroke(); }
    else if (f.k === 4) { for (let i = 0; i < 3; i++) { ctx.strokeStyle = '#a0ffd0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - i * 14, 18 + i * 6 + t * 12, 6 + i * 2, 0, g.time * 6 + i, g.time * 6 + i + 4); ctx.stroke(); } }
    else if (f.k === 5) { for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU, rr = 10 + t * 30; ball(ctx, x + Math.cos(an) * rr, y - 20 + Math.sin(an) * rr * 0.6 - t * 20, 6 * a + 1, '#ffe080', '#ff4010'); } }
    else if (f.k === 6) { const rr = 32 - t * 14; ctx.strokeStyle = '#ff3040'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - 16, rr, 0, TAU); ctx.stroke(); for (let i = 0; i < 4; i++) { const an = (i / 4) * TAU; seg(ctx, x + Math.cos(an) * (rr - 8), y - 16 + Math.sin(an) * (rr - 8), x + Math.cos(an) * (rr + 8), y - 16 + Math.sin(an) * (rr + 8), '#ff3040', 2); } }
    else if (f.k === 7) { for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU, rr = 12 + t * 34; shape(ctx, [x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.6, x + Math.cos(an + 0.18) * (rr - 11), y + Math.sin(an + 0.18) * (rr - 11) * 0.6, x + Math.cos(an - 0.18) * (rr - 11), y + Math.sin(an - 0.18) * (rr - 11) * 0.6], '#d8f6ff', OL, 0.8); } }
    else if (f.k === 8) { ball(ctx, x, y, 60 * (0.5 + t), 'rgba(255,200,80,0.7)', 'rgba(255,60,0,0)'); ctx.fillStyle = 'rgba(30,10,0,0.55)'; ctx.beginPath(); ctx.ellipse(x, y, 34, 12, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
}
function drawAura(ctx: CanvasRenderingContext2D, g: G): void {
  const p = g.p, bf = p.bf, tm = g.time, on = (k: string): boolean => (bf[k] ?? 0) > 0;
  if (p.dead > 0) return;
  ctx.save();
  if (on('hb')) { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(p.x, p.y, 26, 58, 0, Math.PI, TAU); ctx.stroke(); ctx.globalAlpha = 0.08; ctx.fillStyle = '#ffe08a'; ctx.fill(); }
  if (on('mb')) { ctx.globalAlpha = 0.35 + Math.sin(tm * 3) * 0.1; ball(ctx, p.x, p.y - 20, 30, 'rgba(200,160,255,0)', 'rgba(170,110,255,0.45)'); }
  if (on('cb')) { ctx.globalAlpha = 0.75; ctx.strokeStyle = '#ffb040'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 6; i++) { const an = (i / 6) * TAU + tm, px = p.x + Math.cos(an) * 22, py = p.y + Math.sin(an) * 8; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke(); }
  if (on('ws')) { ctx.globalAlpha = 0.85; for (let i = 0; i < 3; i++) { const an = tm * 5 + (i * TAU) / 3; circ(ctx, p.x + Math.cos(an) * 18, p.y - 4 + Math.sin(an) * 6 - i * 4, 2.2, '#a0ffd0'); } }
  if (on('fw')) { const dir = Math.cos(p.face) < -0.01 ? -1 : 1; ctx.globalAlpha = 0.9; for (let i = 0; i < 3; i++) circ(ctx, p.x + dir * (11 + Math.sin(tm * 9 + i) * 3), p.y - 22 - ((tm * 2 + i / 3) % 1) * 14, 2.6, i % 2 ? '#ffb040' : '#ff5010'); }
  if (on('pc') && p.tgt && p.tgt.dead <= 0) { const m = p.tgt, r = md(m).r; ctx.globalAlpha = 0.85; ctx.strokeStyle = '#ff4050'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(m.x, m.y - r, r + 6, 0, TAU); ctx.stroke(); seg(ctx, m.x - r - 14, m.y - r, m.x - r - 2, m.y - r, '#ff4050', 1.5); seg(ctx, m.x + r + 2, m.y - r, m.x + r + 14, m.y - r, '#ff4050', 1.5); }
  ctx.restore();
}
function drawPet(ctx: CanvasRenderingContext2D, g: G, font: string): void {
  const pt = g.pet, d = MD[3], fr = monFrames(3);
  if (pt && pt.sp) { drawSpirit(ctx, pt, g.time, font); return; }
  if (!pt || !d || !fr) return;
  const S = Math.ceil(d.r * 5 * mvk(3)), img = fr[Math.floor(pt.walk * 8) % 6] ?? fr[0];
  shadow(ctx, pt.x, pt.y + 1, d.r * 1.2);
  ball(ctx, pt.x, pt.y - d.r, d.r * 1.8, 'rgba(170,130,255,0.3)', 'rgba(0,0,0,0)');
  ctx.save(); ctx.translate(pt.x, pt.y); ctx.scale(pt.face, 1);
  if (img) { ctx.drawImage(img, -S / 2, -S * 0.84, S, S); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25; ctx.drawImage(img, -S / 2, -S * 0.84, S, S); }
  ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  label(ctx, `召喚戰狼 ${Math.ceil(pt.life)}`, pt.x, pt.y - d.r * 2.3, '#c8b0ff', 10, font, 'center');
}
function monLabel(ctx: CanvasRenderingContext2D, m: Mon, sel: boolean, font: string): void {
  const d = md(m), r = d.r * (m.el ? 1.35 : 1);
  const top = m.y - (MHT[m.d] ?? d.r * 2) * mvk(m.d) * (m.el ? 1.35 : 1) - 8;
  if (m.hp < m.mhp || sel) {
    const w = Math.max(30, r * 2);
    box(ctx, m.x - w / 2 - 1.5, top - 1.5, w + 3, 7, 3, "rgba(0,0,0,0.65)");
    box(ctx, m.x - w / 2, top, Math.max(2, w * clamp(m.hp / m.mhp, 0, 1)), 4, 2, lg(ctx, 0, top, 0, top + 4, "#ff6a5a", "#b01818"));
  }
  label(ctx, m.wb ? `【世界首領】${d.n} Lv.${Math.max(1, Math.round(d.lv * (m.sc ?? 1)))}` : m.el ? `【精英】${d.n}` : d.n, m.x, top - 9, d.b ? "#ff5050" : m.el ? '#e0a0ff' : d.ag ? "#ffc080" : "#ffffff", d.b || m.el ? 13 : 11, font, "center");
}
function drawDrop(ctx: CanvasRenderingContext2D, dr: Drop, font: string, time: number): void {
  const x = dr.x, y = dr.y - 6 - Math.abs(Math.sin(time * 3 + dr.x)) * 3;
  shadow(ctx, dr.x, dr.y, 9);
  const rare = dr.it ? idf(dr.it).t >= 3 || idf(dr.it).r === 1 || dr.it.en > 0 : dr.k === 2 || dr.k === 3 || dr.k >= 7;
  if (dr.it && (dr.it.q ?? 0) >= 2) ball(ctx, x, y, 24 + Math.sin(time * 4) * 3, (QC[dr.it.q ?? 0] ?? '#ffffff') + '99', 'rgba(0,0,0,0)');
  if (dr.it && idf(dr.it).r) { const bg = ctx.createLinearGradient(0, dr.y - 80, 0, dr.y); bg.addColorStop(0, 'rgba(255,170,80,0)'); bg.addColorStop(1, `rgba(255,170,80,${0.35 + Math.sin(time * 4) * 0.15})`); ctx.fillStyle = bg; ctx.fillRect(dr.x - 7, dr.y - 80, 14, 80); }
  ball(ctx, x, y, 14, rare ? "rgba(255,210,90,0.45)" : "rgba(255,255,255,0.25)", "rgba(0,0,0,0)");
  const ic = icon(dr.it ? `G${dr.it.b}` : DK[dr.k] ?? "pr");
  if (ic) ctx.drawImage(ic, x - 12, y - 12, 24, 24);
  if (dr.it || dr.k !== 0) label(ctx, dropName(dr), x, y - 17, dr.it ? (itemCol(dr.it) === "#eef2f8" ? "#80d0ff" : itemCol(dr.it)) : "#f0f0f0", 10, font, "center");
}
const CH = 16, CHUNKS = new Map<number, HTMLCanvasElement>();
const BC = ['106,134,56', '170,158,130', '106,134,56', '40,110,170', '110,104,96', '72,88,42', '70,62,78', '120,118,124', '150,126,86', '214,184,124', '236,242,248', '84,84,58', '72,58,54', '240,96,30', '168,160,88', '170,160,138', '196,186,160', '40,36,46', '140,100,60', '92,76,60', '30,24,20', '200,196,212', '40,44,56', '44,32,38', '74,66,72', '74,66,72'];
const PRI = [4, 9, 4, 0, 9, 4, 2, 4, 1, 2, 5, 1, 3, 0, 3, 9, 9, 9, 1, 2, 9, 2, 9, 2, 9, 9];
const NB: [number, number, number][] = [[0, -1, 0], [0, 1, 1], [-1, 0, 2], [1, 0, 3]];
function gnd(i: number): number { const t = MAP[i] ?? 0; return t === 2 || t === 7 ? ZG[ZMAP[i] ?? 0] ?? 0 : t === 15 ? 1 : t; }
const CSC = 1.5;
let BTMP: [HTMLCanvasElement, CanvasRenderingContext2D] | null | undefined;
function blurPass(cv: HTMLCanvasElement, x: CanvasRenderingContext2D): void {
  if (BTMP === undefined) BTMP = mk(cv.width, cv.height);
  if (!BTMP || !('filter' in x)) return;
  const [tc, tx] = BTMP; tx.setTransform(1, 0, 0, 1, 0, 0); tx.clearRect(0, 0, tc.width, tc.height); tx.drawImage(cv, 0, 0);
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'blur(2.2px)'; x.globalAlpha = 0.7; x.drawImage(tc, 0, 0); x.restore();
}
let PTEX: HTMLCanvasElement | null | undefined;
function paintTex(): HTMLCanvasElement | null {
  if (PTEX !== undefined) return PTEX;
  const S = 256, r = mk(S, S); if (!r) { PTEX = null; return null; }
  const [cv, x] = r, R = mulberry(4242), Wd = CH * TS, k = S / Wd;
  x.fillStyle = '#808080'; x.fillRect(0, 0, S, S);
  const dab = (cx: number, cy: number, rx: number, ry: number, a: number, light: boolean, al: number): void => {
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      const px = cx + ox, py = cy + oy; if (px + rx < 0 || px - rx > S || py + rx < 0 || py - rx > S) continue;
      x.save(); x.translate(px, py); x.rotate(a); x.scale(1, ry / rx);
      const g0 = x.createRadialGradient(0, 0, 0, 0, 0, rx); const c = light ? '255,255,240' : '20,16,10'; g0.addColorStop(0, `rgba(${c},${al})`); g0.addColorStop(1, `rgba(${c},0)`);
      x.fillStyle = g0; x.beginPath(); x.arc(0, 0, rx, 0, TAU); x.fill(); x.restore();
    }
  };
  for (let i = 0; i < 70; i++) dab(R() * S, R() * S, (40 + R() * 90) * k * 2, (30 + R() * 60) * k * 2, R() * TAU, R() < 0.5, 0.16 + R() * 0.12);
  for (let i = 0; i < 420; i++) { const a = 0.5 + (R() - 0.5) * 0.6; dab(R() * S, R() * S, (6 + R() * 14) * k * 2, (1.5 + R() * 2.5) * k * 2, a, R() < 0.5, 0.12 + R() * 0.12); }
  PTEX = cv; return cv;
}
function chunk(cx: number, cy: number): HTMLCanvasElement | null {
  if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) return null;
  const key = WID * 1e6 + cy * 1000 + cx, ex = CHUNKS.get(key);
  if (ex) { if (CHUNKS.size > 30) { CHUNKS.delete(key); CHUNKS.set(key, ex); } return ex; }
  const r = mk(CH * TS * CSC, CH * TS * CSC);
  if (!r) return null;
  const cv = r[0], x = r[1], T = tiles();
  x.scale(CSC, CSC); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  for (let pass = 0; pass < 2; pass++) {
  if (pass === 1) blurPass(cv, x);
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const gx = cx * CH + tx, gy = cy * CH + ty;
    if (gx >= MW || gy >= MH) continue;
    const i = gy * MW + gx, t = MAP[i] ?? 0, gt = gnd(i), dc = DEC[i] ?? 0, px = tx * TS, py = ty * TS, pr = PRI[gt] ?? 0;
    if (pass === 0) {
    const im = T[gt]?.[dc % 4];
    const im0 = T[gt]?.[0]; if (im0 && im0 !== im) { x.drawImage(im0, px, py, TS + 0.35, TS + 0.35); x.globalAlpha = 0.5; }
    if (im) x.drawImage(im, px, py, TS + 0.35, TS + 0.35);
    x.globalAlpha = 1;
    if (pr < 9) for (const [dx, dy, sd] of NB) {
      const nx = gx + dx, ny = gy + dy;
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
      const ng = gnd(ny * MW + nx), np = PRI[ng] ?? 0;
      if (ng === gt || np <= pr || np >= 9) continue;
      const gr = sd === 0 ? x.createLinearGradient(0, py, 0, py + 17) : sd === 1 ? x.createLinearGradient(0, py + TS, 0, py + TS - 17) : sd === 2 ? x.createLinearGradient(px, 0, px + 17, 0) : x.createLinearGradient(px + TS, 0, px + TS - 17, 0);
      const c = BC[ng] ?? '0,0,0';
      gr.addColorStop(0, `rgba(${c},0.85)`); gr.addColorStop(0.45, `rgba(${c},0.38)`); gr.addColorStop(1, `rgba(${c},0)`);
      x.fillStyle = gr; x.fillRect(px, py, TS, TS);
    }
    continue; }
    if (t === 3 || t === 13) {
      const up = MAP[i - MW] ?? t, dn = MAP[i + MW] ?? t;
      if (up !== 3 && up !== 13 && up !== 18) { x.fillStyle = t === 3 ? 'rgba(230,245,255,0.55)' : 'rgba(255,220,120,0.6)'; x.fillRect(px, py, TS, 2.5); x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(px, py + 2.5, TS, 4); }
      if (dn !== 3 && dn !== 13 && dn !== 18) { x.fillStyle = 'rgba(90,70,40,0.6)'; x.fillRect(px, py + TS - 3, TS, 3); }
    }
    if (t === 7 && WID === 0) paintRock(x, px, py, ZMAP[i] ?? 0, gx * 31 + gy * 17);
    else if (t === 7) {
      const zz = ZMAP[i] ?? 0;
      shadowBlob(x, px + 16, py + 27, 13);
      { const c0 = zz === 6 ? '#7a6a64' : zz === 4 ? '#c8a070' : '#aaa596', c1 = zz === 6 ? '#2a2020' : zz === 4 ? '#7a5a30' : '#58544c';
        shape(x, [px + 4, py + 27, px + 3, py + 17, px + 9, py + 7, px + 18, py + 4, px + 27, py + 9, px + 29, py + 20, px + 26, py + 28], lg(x, px + 4, py + 4, px + 26, py + 28, c0, c1), OL, 1.5);
        shape(x, [px + 9, py + 7, px + 18, py + 4, px + 27, py + 9, px + 19, py + 13, px + 10, py + 12], 'rgba(255,250,235,0.24)');
        shape(x, [px + 19, py + 13, px + 27, py + 9, px + 29, py + 20, px + 26, py + 28, px + 19, py + 27], 'rgba(0,0,0,0.2)');
        seg(x, px + 12, py + 15, px + 15, py + 22, 'rgba(0,0,0,0.35)', 1); seg(x, px + 15, py + 22, px + 13, py + 26, 'rgba(0,0,0,0.3)', 1);
        if (zz <= 2 || zz === 3) { ell(x, px + 15, py + 7, 6, 2.2, 'rgba(104,136,56,0.75)'); ell(x, px + 22, py + 8.5, 3.5, 1.6, 'rgba(124,156,66,0.7)'); } }
      if (zz === 5) { x.fillStyle = '#f4f8ff'; x.beginPath(); x.ellipse(px + 15, py + 10, 9, 4, 0, Math.PI, TAU); x.fill(); }
    }
    if (t === 4) { x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(px, py, TS, 3); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(px, py + TS - 4, TS, 4); }
    if (WID !== 0) dunOverlay(x, gx, gy, i, px, py);
  }
  }
  const pt = paintTex();
  if (pt) { x.save(); const fv = (cx * 3 + cy * 5) % 4; x.translate(fv & 1 ? CH * TS : 0, fv & 2 ? CH * TS : 0); x.scale(fv & 1 ? -1 : 1, fv & 2 ? -1 : 1); x.globalCompositeOperation = 'soft-light'; x.globalAlpha = WID === 0 ? 0.75 : 0.6; x.drawImage(pt, 0, 0, CH * TS, CH * TS); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.18; x.drawImage(pt, 0, 0, CH * TS, CH * TS); x.restore(); }
  CHUNKS.set(key, cv);
  if (CHUNKS.size > 40) { const k0 = CHUNKS.keys().next().value; if (k0 !== undefined) CHUNKS.delete(k0); }
  return cv;
}
const TK: [number, number][] = [[0, 1], [0, 5], [2, 3], [5, 5], [6, 6], [4, 4], [7, 7], [5, 3]];
function treeKind(z: number, dc: number): number { const a = TK[z] ?? [0, 1]; return a[dc % 2] ?? 0; }
const BIMG: Record<string, HTMLCanvasElement> = {};
function paintBld2(x: CanvasRenderingContext2D, b: Bld, W: number, H: number, top: number): void {
  const k = b.k, st = b.st, R = mulberry(77 + k * 13 + st * 101), gy = H - 6, tem = k === 4, wallH = tem ? 84 : 62, wl = 12, wr = W - 12, wt = gy - wallH, rt = top + (tem ? 6 : 18), cx = W / 2;
  shadowBlob(x, cx, gy, W / 2 - 2);
  // walls
  if (st === 0 && !tem) {
    box(x, wl, wt, wr - wl, wallH, 1, lg(x, 0, wt, 0, gy, '#f6ead0', '#cdb68e'), OL);
    for (let i = 0; i < 40; i++) { x.fillStyle = R() < 0.5 ? 'rgba(160,130,90,0.18)' : 'rgba(255,255,240,0.25)'; x.fillRect(wl + R() * (wr - wl - 4), wt + R() * (wallH - 4), 2 + R() * 4, 1 + R() * 2); }
    const tb = (x1: number, y1: number, x2: number, y2: number, w: number): void => { seg(x, x1, y1, x2, y2, OL, w + 2); seg(x, x1, y1, x2, y2, '#6a4224', w); seg(x, x1, y1 - 0.5, x2, y2 - 0.5, 'rgba(255,220,170,0.25)', 1); };
    const posts = [wl + 3, wl + (wr - wl) * 0.33, wl + (wr - wl) * 0.67, wr - 3];
    for (const px of posts) tb(px, wt, px, gy - 12, 5);
    tb(wl, wt + 3, wr, wt + 3, 5); tb(wl, wt + wallH * 0.5, wr, wt + wallH * 0.5, 4);
    for (let q = 0; q < 3; q++) { const a = posts[q] ?? 0, c = posts[q + 1] ?? 0; if (q === 1) continue; tb(a, wt + wallH * 0.5, c, gy - 12, 3); tb(c, wt + wallH * 0.5, a, gy - 12, 3); }
  } else {
    const c0 = tem ? '#f4f0e6' : '#c8c4bc', c1 = tem ? '#b8b0a0' : '#8a8680';
    box(x, wl, wt, wr - wl, wallH, 1, lg(x, 0, wt, 0, gy, c0, c1), OL);
    for (let yy = wt, row = 0; yy < gy - 12; yy += 9, row++) for (let xx = wl + 1 - (row % 2) * 8; xx < wr - 1; xx += 16) { const x0 = Math.max(wl + 1, xx), x1 = Math.min(wr - 1, xx + 15); if (x1 - x0 < 2) continue; const sh2 = R(); box(x, x0 + 0.5, yy + 0.5, x1 - x0 - 1, 8, 1.5, lg(x, 0, yy, 0, yy + 9, mix(c0, sh2 < 0.3 ? '#d8c8a8' : '#ffffff', 0.2), mix(c1, sh2 < 0.3 ? '#8a7a60' : c1, 0.3))); x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(x0 + 1, yy + 1, x1 - x0 - 2, 1); }
    for (const qx of [wl, wr - 8]) for (let yy = wt, k2 = 0; yy < gy - 12; yy += 9, k2++) box(x, qx + (k2 % 2 ? 0 : 1), yy + 0.5, k2 % 2 ? 9 : 7, 8, 1, lg(x, 0, yy, 0, yy + 8, tem ? '#ffffff' : '#e0dcd4', tem ? '#c8c0b0' : '#9a968e'), OL);
    if (!tem) for (let q = 0; q < 2; q++) { const ivy = q ? wr - 18 : wl + 8; for (let k2 = 0; k2 < 14; k2++) ball(x, ivy + Math.sin(k2 * 1.7) * 5, gy - 14 - k2 * 3, 2.4, '#6aa84a', '#2a5a22'); }
  }
  x.fillStyle = lg(x, 0, gy - 26, 0, gy, 'rgba(40,30,20,0)', 'rgba(40,30,20,0.35)'); x.fillRect(wl, gy - 26, wr - wl, 26);
  // foundation
  for (let sx = wl - 3, k2 = 0; sx < wr + 3; k2++) { const w = Math.min(8 + ((k2 * 5) % 6), wr + 3 - sx); box(x, sx, gy - 12, w, 12, 2.5, lg(x, 0, gy - 12, 0, gy, k2 % 3 ? '#a8a092' : '#968e80', '#5e584e'), OL); x.fillStyle = 'rgba(255,255,255,0.2)'; x.fillRect(sx + 1.5, gy - 11, w - 3, 1.5); sx += w; }
  // temple columns
  if (tem) for (const ccx of [wl + 12, wl + 34, wr - 34, wr - 12]) { box(x, ccx - 6, wt + 2, 12, wallH - 14, 1, lg(x, ccx - 6, 0, ccx + 6, 0, '#ffffff', '#a8a090'), OL); for (const k2 of [-3, 0, 3]) seg(x, ccx + k2, wt + 6, ccx + k2, gy - 16, 'rgba(120,110,90,0.35)', 0.8); box(x, ccx - 8, wt, 16, 5, 1, '#e8e0d0', OL); box(x, ccx - 8, gy - 17, 16, 5, 1, '#d8d0c0', OL); }
  // windows
  const dx = cx, dw = k === 3 ? 34 : tem ? 26 : 20, dh = k === 3 ? 40 : tem ? 46 : 34;
  const win = (wx: number, wy: number, w: number, h: number, arch: boolean): void => {
    x.beginPath(); if (arch) { x.moveTo(wx - w / 2 - 3, wy + h + 2); x.lineTo(wx - w / 2 - 3, wy + w / 2); x.arc(wx, wy + w / 2, w / 2 + 3, Math.PI, TAU); x.lineTo(wx + w / 2 + 3, wy + h + 2); } else x.rect(wx - w / 2 - 3, wy - 3, w + 6, h + 5);
    x.closePath(); x.fillStyle = st === 0 && !tem ? '#5a3a1e' : '#6a665e'; x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke();
    x.beginPath(); if (arch) { x.moveTo(wx - w / 2, wy + h); x.lineTo(wx - w / 2, wy + w / 2); x.arc(wx, wy + w / 2, w / 2, Math.PI, TAU); x.lineTo(wx + w / 2, wy + h); } else x.rect(wx - w / 2, wy, w, h);
    x.closePath(); const gl = x.createLinearGradient(wx - w / 2, wy, wx + w / 2, wy + h); gl.addColorStop(0, k === 2 ? '#e8c8ff' : '#fff6c8'); gl.addColorStop(0.5, k === 2 ? '#a060f0' : '#ffc060'); gl.addColorStop(1, k === 2 ? '#5a2aa0' : '#d07a20'); x.fillStyle = gl; x.fill(); x.stroke();
    seg(x, wx, wy + (arch ? 2 : 0), wx, wy + h, '#3a2a1a', 1.4); seg(x, wx - w / 2, wy + h * 0.5, wx + w / 2, wy + h * 0.5, '#3a2a1a', 1.4);
    seg(x, wx - w / 2 + 2, wy + h * 0.5 - 2, wx - 2, wy + 3, 'rgba(255,255,255,0.5)', 1.2);
    box(x, wx - w / 2 - 5, wy + h + 1, w + 10, 4, 1.5, st === 0 && !tem ? '#7a4a24' : '#9a968e', OL);
    if (!arch && st === 0) for (const s2 of [-1, 1]) { box(x, wx + s2 * (w / 2 + 6) - 4, wy - 2, 8, h + 3, 1, lg(x, 0, wy, 0, wy + h, k === 0 ? '#4a8a4a' : '#3a6aa0', k === 0 ? '#2a5a2a' : '#1a3a60'), OL); seg(x, wx + s2 * (w / 2 + 6) - 2, wy + h * 0.3, wx + s2 * (w / 2 + 6) + 2, wy + h * 0.3, 'rgba(0,0,0,0.4)', 1); }
    if (!arch && st === 0) { box(x, wx - w / 2 - 4, wy + h + 4, w + 8, 5, 1.5, '#6a4224', OL); for (let q = 0; q < 5; q++) ball(x, wx - w / 2 + q * (w / 4), wy + h + 3, 2.2, ['#ff6a8a', '#ffd84a', '#ffffff', '#b070ff', '#ff8a40'][q] ?? '#fff', '#a03050'); }
  };
  if (tem) { win(wl + 23, wt + 16, 12, 30, true); win(wr - 23, wt + 16, 12, 30, true); }
  else for (const wx of [wl + 24, wr - 24]) win(wx, wt + 16, 16, 18, st === 1);
  // door
  x.beginPath(); x.moveTo(dx - dw / 2 - 4, gy - 10); x.lineTo(dx - dw / 2 - 4, gy - dh); x.quadraticCurveTo(dx, gy - dh - 16, dx + dw / 2 + 4, gy - dh); x.lineTo(dx + dw / 2 + 4, gy - 10); x.closePath(); x.fillStyle = st === 0 && !tem ? '#5a3a1e' : lg(x, 0, gy - dh, 0, gy, '#d8d4cc', '#8a867e'); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.5; x.stroke();
  x.beginPath(); x.moveTo(dx - dw / 2, gy - 10); x.lineTo(dx - dw / 2, gy - dh + 2); x.quadraticCurveTo(dx, gy - dh - 11, dx + dw / 2, gy - dh + 2); x.lineTo(dx + dw / 2, gy - 10); x.closePath(); x.fillStyle = lg(x, dx - dw / 2, 0, dx + dw / 2, 0, '#9a6030', '#4a2810'); x.fill(); x.stroke();
  for (let q = 1; q < (k === 3 ? 6 : 4); q++) seg(x, dx - dw / 2 + q * dw / (k === 3 ? 6 : 4), gy - dh - 2, dx - dw / 2 + q * dw / (k === 3 ? 6 : 4), gy - 10, 'rgba(30,15,5,0.45)', 1);
  for (const yy of [gy - dh + 6, gy - 20]) box(x, dx - dw / 2, yy, dw, 3, 0.5, '#3a3a40', OL);
  if (k === 3) { seg(x, dx - dw / 2, gy - dh + 6, dx + dw / 2, gy - 12, '#5a3418', 3); seg(x, dx + dw / 2, gy - dh + 6, dx - dw / 2, gy - 12, '#5a3418', 3); seg(x, dx, gy - dh - 4, dx, gy - 10, OL, 1.5); }
  ball(x, dx + (k === 3 ? 4 : dw / 2 - 4), gy - 24, 1.8, '#f8d870', '#8a6420', OL);
  if (tem) { shape(x, [dx - dw / 2 - 8, gy - dh - 6, dx + dw / 2 + 8, gy - dh - 6, dx, gy - dh - 24], lg(x, 0, gy - dh - 24, 0, gy - dh, '#ffffff', '#c8c0b0'), OL, 1.2); ball(x, dx, gy - dh - 13, 4, '#ffe8a0', '#c09030', OL); }
  // steps
  box(x, dx - dw / 2 - 8, gy - 10, dw + 16, 5, 1, '#b8b0a2', OL); box(x, dx - dw / 2 - 12, gy - 5, dw + 24, 5, 1, '#a09888', OL);
  // lanterns
  for (const s2 of [-1, 1]) { const lx = dx + s2 * (dw / 2 + 10), ly = gy - dh + 2; seg(x, lx, ly - 6, lx, ly - 2, '#2a2a30', 1.4); box(x, lx - 3.5, ly - 2, 7, 9, 1.5, 'rgba(255,214,120,0.95)', OL); ball(x, lx, ly + 2, 10, 'rgba(255,200,100,0.35)', 'rgba(255,200,100,0)'); shape(x, [lx - 5, ly - 2, lx + 5, ly - 2, lx, ly - 6], '#2a2a30', OL, 0.8); }
  // roof
  const rc: [string, string] = k === 2 ? ['#a070e8', '#3a1a70'] : tem ? (st === 0 ? ['#6ac0a0', '#1e5046'] : ['#7a9ad8', '#22345e']) : k === 1 ? ['#707080', '#2a2a34'] : st === 0 ? ['#c86a44', '#5a2214'] : ['#5a86b0', '#1a3450'];
  const ey = wt + 10, ex0 = 0, ex1 = W, rx0 = wl + 18, rx1 = wr - 18;
  shape(x, [ex0, ey, ex1, ey, rx1, rt, rx0, rt], lg(x, 0, rt, 0, ey, rc[0], rc[1]), OL, 2);
  const rows = Math.floor((ey - rt) / 7);
  for (let r2 = 0; r2 < rows; r2++) { const y0 = rt + r2 * 7 + 1, f = (y0 - rt) / (ey - rt), lx = rx0 - f * (rx0 - ex0), rx = rx1 + f * (ex1 - rx1), sw = st === 0 && k !== 2 ? 10 : 7;
    for (let xx = lx + (r2 % 2) * sw / 2; xx < rx - 2; xx += sw) { const xr = Math.min(xx + sw - 1, rx - 1); const tc = R(); x.fillStyle = st === 0 && k !== 2 ? `rgba(${tc < 0.3 ? '255,200,170' : '0,0,0'},${tc < 0.3 ? 0.18 : 0.12})` : `rgba(${tc < 0.3 ? '220,235,255' : '0,0,0'},${tc < 0.3 ? 0.16 : 0.14})`; x.beginPath(); x.moveTo(xx, y0); x.lineTo(xr, y0); x.lineTo(xr, y0 + 5); x.quadraticCurveTo((xx + xr) / 2, y0 + 7.5, xx, y0 + 5); x.closePath(); x.fill(); }
    seg(x, lx + 1, y0 + 6.5, rx - 1, y0 + 6.5, 'rgba(0,0,0,0.28)', 1); }
  shape(x, [ex0, ey, ex1, ey, rx1, rt, rx0, rt], lg(x, ex0, 0, ex1, 0, 'rgba(255,240,210,0.12)', 'rgba(0,0,0,0.2)'));
  box(x, rx0 - 4, rt - 4, rx1 - rx0 + 8, 6, 2, lg(x, 0, rt - 4, 0, rt + 2, mix(rc[0], '#ffffff', 0.3), rc[1]), OL);
  box(x, -1, ey - 2, W + 2, 6, 2, mix(rc[1], '#000000', 0.2), OL);
  if (st === 0 && !tem) for (let q = 0; q < 9; q++) box(x, 4 + q * (W - 12) / 8, ey + 3, 4, 5, 1, '#5a3418', OL);
  x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(wl, ey + 4, wr - wl, 6);
  // dormer / gable
  if (!tem) { const gx = k === 1 ? wl + 40 : cx, gw = 26, gy0 = rt + 6, gh = ey - rt - 12;
    if (st === 1 && k !== 1) { shape(x, [gx - gw, ey - 2, gx + gw, ey - 2, gx, rt - 14], lg(x, 0, rt - 14, 0, ey, mix(rc[0], '#ffffff', 0.15), rc[1]), OL, 1.6); shape(x, [gx - gw + 8, ey - 6, gx + gw - 8, ey - 6, gx, rt - 2], '#c8c4bc', OL, 1); x.beginPath(); x.arc(gx, ey - 14, 7, 0, TAU); x.fillStyle = k === 2 ? '#c890ff' : '#ffe080'; x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke(); seg(x, gx - 7, ey - 14, gx + 7, ey - 14, '#3a2a1a', 1); seg(x, gx, ey - 21, gx, ey - 7, '#3a2a1a', 1); seg(x, gx, rt - 14, gx, rt - 24, '#d8b040', 2); ball(x, gx, rt - 25, 2.4, '#ffe080', '#a07020', OL); }
    else if (gh > 14) { box(x, gx - 12, gy0 + 4, 24, gh - 2, 1, st === 0 ? '#f0e2c4' : '#c8c4bc', OL); box(x, gx - 7, gy0 + 8, 14, gh - 10, 1, lg(x, 0, gy0, 0, gy0 + gh, '#fff0b0', '#e09040'), OL); seg(x, gx, gy0 + 8, gx, gy0 + gh - 2, '#3a2a1a', 1); shape(x, [gx - 17, gy0 + 6, gx + 17, gy0 + 6, gx, gy0 - 8], lg(x, 0, gy0 - 8, 0, gy0 + 6, rc[0], rc[1]), OL, 1.4); } }
  // per-building features
  if (k === 1) { const chx = wr - 30; box(x, chx - 8, rt - 26, 16, 40, 1, lg(x, chx - 8, 0, chx + 8, 0, '#9a8878', '#4a3e34'), OL); for (let yy = rt - 22; yy < rt + 12; yy += 6) seg(x, chx - 8, yy, chx + 8, yy, 'rgba(0,0,0,0.3)', 1); box(x, chx - 10, rt - 30, 20, 6, 1, '#5a4e44', OL); ball(x, chx, rt - 30, 9, 'rgba(255,140,40,0.55)', 'rgba(255,90,0,0)'); ball(x, wl + 24, wt + 25, 18, 'rgba(255,150,60,0.35)', 'rgba(255,120,0,0)'); }
  if (k === 2) { shape(x, [cx, rt - 26, cx + 4, rt - 13, cx + 15, rt - 12, cx + 6, rt - 5, cx + 9, rt + 6, cx, rt - 1, cx - 9, rt + 6, cx - 6, rt - 5, cx - 15, rt - 12, cx - 4, rt - 13], '#ffe060', OL); ball(x, cx, rt - 10, 16, 'rgba(255,240,140,0.45)', 'rgba(255,240,140,0)'); for (let q = 0; q < 6; q++) circ(x, wl + 10 + R() * (wr - wl - 20), wt + 4 + R() * 40, 1.2, 'rgba(220,180,255,0.9)'); }
  if (k === 0) { const ay = wt + 12; for (let q = 0; q < 8; q++) { const x0 = wl + 4 + q * (wr - wl - 8) / 8, x1 = x0 + (wr - wl - 8) / 8; shape(x, [x0, ay, x1, ay, x1 + 1, ay + 12, x0 - 1, ay + 12], q % 2 ? '#f4ead8' : (st === 0 ? '#d04a3a' : '#3a7ad0'), OL, 1); x.beginPath(); x.arc((x0 + x1) / 2, ay + 12, (x1 - x0) / 2 + 1, 0, Math.PI); x.fillStyle = q % 2 ? '#f4ead8' : (st === 0 ? '#d04a3a' : '#3a7ad0'); x.fill(); x.strokeStyle = OL; x.lineWidth = 0.8; x.stroke(); } }
  if (k === 3) { box(x, cx - 12, rt + 2, 24, 16, 1, '#7a4a24', OL); seg(x, cx - 12, rt + 2, cx + 12, rt + 18, '#4a2810', 2); seg(x, cx + 12, rt + 2, cx - 12, rt + 18, '#4a2810', 2); for (let q = 0; q < 6; q++) seg(x, cx - 10 + q * 4, rt + 18, cx - 11 + q * 4, rt + 23 + (q % 2) * 2, '#e8c860', 1.2); }
  if (tem) { box(x, cx - 14, rt - 44, 28, 52, 1, lg(x, 0, rt - 44, 0, rt + 8, '#ffffff', '#b8b0a0'), OL); x.beginPath(); x.arc(cx, rt - 26, 8, Math.PI, TAU); x.lineTo(cx + 8, rt - 10); x.lineTo(cx - 8, rt - 10); x.closePath(); x.fillStyle = '#2a2a3a'; x.fill(); x.stroke(); ball(x, cx, rt - 20, 5, '#f8d860', '#a07818', OL); shape(x, [cx - 18, rt - 44, cx + 18, rt - 44, cx, rt - 64], lg(x, 0, rt - 64, 0, rt - 44, '#8aaae0', '#22345e'), OL, 1.4); seg(x, cx, rt - 76, cx, rt - 62, '#e8c050', 3); seg(x, cx - 6, rt - 70, cx + 6, rt - 70, '#e8c050', 3);
    x.beginPath(); x.arc(cx, rt + 26, 11, 0, TAU); x.fillStyle = '#4a3a6a'; x.fill(); x.strokeStyle = OL; x.lineWidth = 1.5; x.stroke(); for (let q = 0; q < 8; q++) { const a = q / 8 * TAU; x.beginPath(); x.moveTo(cx, rt + 26); x.arc(cx, rt + 26, 9, a, a + TAU / 8); x.closePath(); x.fillStyle = ['#ff6a6a', '#ffd84a', '#6ac0ff', '#7ae08a'][q % 4] ?? '#fff'; x.fill(); } seg(x, cx - 9, rt + 26, cx + 9, rt + 26, OL, 0.8); circ(x, cx, rt + 26, 2.5, '#fff8d0'); }
  // banner for 風木城
  if (st === 1 && !tem) for (const bx of [wl + 6, wr - 6]) { shape(x, [bx - 5, wt + 12, bx + 5, wt + 12, bx + 5, wt + 34, bx, wt + 30, bx - 5, wt + 34], '#3a5ac0', OL, 1); ball(x, bx, wt + 20, 2.2, '#ffe080', '#a08020'); seg(x, bx - 7, wt + 12, bx + 7, wt + 12, '#c8a040', 2); }
  // hanging sign
  if (!tem) { const sx = dx + dw / 2 + 20, sy = gy - dh - 2;
    seg(x, sx - 14, sy - 10, sx + 10, sy - 10, OL, 4); seg(x, sx - 14, sy - 10, sx + 10, sy - 10, '#2a2a30', 2.2); ball(x, sx + 10, sy - 10, 2, '#3a3a40', '#1a1a20');
    seg(x, sx - 7, sy - 10, sx - 7, sy - 4, '#6a6a70', 1); seg(x, sx + 5, sy - 10, sx + 5, sy - 4, '#6a6a70', 1);
    box(x, sx - 11, sy - 4, 21, 18, 2.5, lg(x, 0, sy - 4, 0, sy + 14, '#e8c890', '#a07840'), OL); box(x, sx - 9, sy - 2, 17, 14, 1.5, 'rgba(0,0,0,0)', 'rgba(90,60,20,0.6)');
    if (k === 3) { box(x, sx - 6, sy, 11, 10, 1, '#b07a44', OL); seg(x, sx - 6, sy, sx + 5, sy + 10, '#6a4220', 1); seg(x, sx + 5, sy, sx - 6, sy + 10, '#6a4220', 1); }
    else { const ic = icon(k === 0 ? 'pr' : k === 1 ? `G${byName('長劍')}` : 'sx'); if (ic) x.drawImage(ic, sx - 8, sy - 2, 15, 15); } }
}
function clump(x: CanvasRenderingContext2D, cx: number, cy: number, rr: number, c0: string, c1: string, hiC: string, R: () => number, n: number): void {
  const pts: [number, number, number][] = [];
  for (let k = 0; k < n; k++) { const a = (k / n) * TAU + R() * 0.4, d = rr * (0.45 + R() * 0.25); pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.75, rr * (0.42 + R() * 0.2)]); }
  pts.push([cx, cy, rr * 0.7]);
  for (const [px, py, pr] of pts) ball(x, px, py, pr + 1.3, OL, OL);
  for (const [px, py, pr] of pts) ball(x, px, py, pr, c0, c1);
  for (const [px, py, pr] of pts) for (let k = 0; k < 5; k++) { const a = -2.2 + R() * 1.6, d = pr * (0.3 + R() * 0.5); ball(x, px + Math.cos(a) * d, py + Math.sin(a) * d, 1.6 + R() * 2.2, hiC, al(hiC, 0)); }
  for (const [px, py, pr] of pts) for (let k = 0; k < 4; k++) { const a = R() * TAU, d = pr * 0.8; x.fillStyle = al(c1, 0.6); x.beginPath(); x.ellipse(px + Math.cos(a) * d * 0.7, py + Math.sin(a) * d * 0.5 + pr * 0.3, 2.5, 1.4, a, 0, TAU); x.fill(); }
}
function trunk(x: CanvasRenderingContext2D, bx: number, by: number, h: number, w: number, c0: string, c1: string, R: () => number): void {
  shape(x, [bx - w * 0.9, by, bx - w * 0.5, by - h * 0.3, bx - w * 0.45, by - h, bx + w * 0.45, by - h, bx + w * 0.5, by - h * 0.3, bx + w * 0.9, by], lg(x, bx - w, 0, bx + w, 0, c0, c1), OL, 1.3);
  for (const s2 of [-1, 1]) shape(x, [bx + s2 * w * 0.6, by, bx + s2 * w * 1.5, by + 2, bx + s2 * w * 0.5, by - 6], c1, OL, 1);
  for (let k = 0; k < 5; k++) { const xx = bx - w * 0.3 + R() * w * 0.6; seg(x, xx, by - 2 - R() * 4, xx + (R() - 0.5) * 2, by - h * (0.3 + R() * 0.6), 'rgba(30,15,5,0.4)', 1); }
  seg(x, bx - w * 0.3, by - 3, bx - w * 0.3, by - h + 3, 'rgba(255,230,190,0.25)', 1.2);
}
function paintTree3(x: CanvasRenderingContext2D, i: number): void {
  const R = mulberry(500 + i * 17), bx = 48, by = 120;
  shadowBlob(x, bx, by, i === 3 || i === 4 ? 22 : 30);
  if (i === 0 || i === 1 || i === 2) { // broadleaf: oak / apple / dark forest oak
    const forest = i === 2, c0 = forest ? '#4e8a3e' : i === 1 ? '#78b84a' : '#86c85a', c1 = forest ? '#163a1a' : '#2a6a26', hc = forest ? '#8ac070' : '#c8ec90';
    trunk(x, bx, by, 52, forest ? 9 : 7, '#8a6440', '#3e2814', R);
    limb(x, [bx, by - 40, bx - 18, by - 58, bx - 26, by - 66], 3.5, '#5a3a20'); limb(x, [bx, by - 46, bx + 16, by - 62, bx + 24, by - 70], 3.2, '#5a3a20');
    clump(x, bx - 22, by - 60, 18, mix(c0, '#000000', 0.18), c1, al(hc, 0.4), R, 5); clump(x, bx + 22, by - 62, 18, mix(c0, '#000000', 0.18), c1, al(hc, 0.4), R, 5);
    clump(x, bx, by - 70, 24, c0, c1, al(hc, 0.6), R, 7);
    clump(x, bx - 8, by - 92, 18, mix(c0, '#ffffff', 0.08), c1, al(hc, 0.7), R, 6); clump(x, bx + 12, by - 88, 15, mix(c0, '#ffffff', 0.1), c1, al(hc, 0.7), R, 5);
    if (i === 1) for (let k = 0; k < 9; k++) { const fx = bx - 30 + R() * 60, fy = by - 100 + R() * 50; ball(x, fx, fy, 3, '#ff7a6a', '#b0201a', OL); circ(x, fx - 1, fy - 1, 0.9, '#ffffff'); }
    if (forest) for (let k = 0; k < 4; k++) { const vx = bx - 30 + R() * 60; for (let q = 0; q < 4; q++) ball(x, vx + Math.sin(q) * 2, by - 58 + q * 5, 1.6, '#4a7a3a', '#1a3a12'); }
    if (i === 0) for (let k = 0; k < 6; k++) ball(x, bx - 26 + R() * 52, by - 96 + R() * 46, 1.8, '#ffffff', '#ffd0e0');
  } else if (i === 3 || i === 4) { // spruce
    const snow = i === 4; trunk(x, bx, by, 22, 5, '#7a5034', '#3a2214', R);
    const tiers = 5; for (let k = 0; k < tiers; k++) { const t = k / tiers, w = 34 - t * 24, y0 = by - 14 - t * 82, h = 30 - t * 6;
      const pts = [bx, y0 - h]; const n = 7; for (let q = 0; q <= n; q++) { const xx = bx + w - (2 * w * q) / n; pts.push(xx, y0 + (q % 2 ? 4 : -1)); } pts.splice(2, 0, bx + w * 0.55, y0 - h * 0.4);
      shape(x, pts, lg(x, bx - w, y0 - h, bx + w, y0, snow ? '#4a7a6a' : '#3a8a4a', snow ? '#15302a' : '#123a20'), OL, 1.2);
      shape(x, [bx, y0 - h, bx + w * 0.9, y0, bx + w * 0.3, y0 + 1], 'rgba(0,0,0,0.22)');
      for (let q = 0; q < 6; q++) { const sx = bx + (R() - 0.5) * w * 1.4, sy = y0 - R() * h * 0.6; seg(x, sx, sy, sx + (sx < bx ? -3 : 3), sy + 3, sx < bx ? 'rgba(190,240,170,0.45)' : 'rgba(0,30,10,0.45)', 1); }
      if (snow) shape(x, [bx, y0 - h, bx - w * 0.7, y0 - h * 0.25, bx - w * 0.3, y0 - h * 0.35, bx, y0 - h * 0.2, bx + w * 0.35, y0 - h * 0.4, bx + w * 0.55, y0 - h * 0.35], '#f6faff', OL, 0.8); }
    if (snow) { ell(x, bx, by - 2, 26, 5, 'rgba(246,250,255,0.9)'); } else for (let k = 0; k < 4; k++) ball(x, bx - 20 + R() * 40, by - 30 - R() * 60, 2, '#a86a3a', '#5a3018');
  } else if (i === 5) { // swamp willow
    trunk(x, bx, by, 46, 8, '#6a5a44', '#2a2218', R);
    limb(x, [bx, by - 40, bx - 22, by - 64, bx - 34, by - 70], 3.5, '#4a3a2a'); limb(x, [bx, by - 44, bx + 22, by - 66, bx + 34, by - 70], 3.5, '#4a3a2a');
    clump(x, bx, by - 76, 26, '#6a8a4a', '#2a3a1e', 'rgba(200,220,140,0.5)', R, 7);
    for (let k = 0; k < 16; k++) { const sx = bx - 40 + k * 5.3, sy = by - 80 + Math.abs(k - 7.5) * 2.5, len = 30 + R() * 26; x.strokeStyle = OL; x.lineWidth = 3.6; x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + 3, sy + len * 0.5, sx + (R() - 0.5) * 6, sy + len); x.stroke(); x.strokeStyle = k % 2 ? '#7a9a52' : '#5a7a3a'; x.lineWidth = 2.2; x.stroke(); }
    for (let k = 0; k < 5; k++) ball(x, bx - 30 + R() * 60, by - 50 + R() * 20, 1.6, 'rgba(200,255,120,0.9)', 'rgba(200,255,120,0)');
  } else if (i === 6) { // desert: palm + cactus
    x.lineCap = 'round'; const sx = bx - 4; for (let k = 0; k < 10; k++) { const t0 = k / 10, t1 = (k + 1) / 10; const x0 = sx + Math.sin(t0 * 1.6) * 14, y0 = by - t0 * 88, x1 = sx + Math.sin(t1 * 1.6) * 14, y1 = by - t1 * 88; seg(x, x0, y0, x1, y1, OL, 11 - k * 0.4); seg(x, x0, y0, x1, y1, k % 2 ? '#a07a4a' : '#8a6438', 8.5 - k * 0.4); }
    const tx = sx + Math.sin(1.6) * 14, ty = by - 88;
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.55, len = 34 + (k % 2) * 6; const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.5 + len * 0.45; x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.6 - 6, ex, ey); x.quadraticCurveTo(tx + Math.cos(a) * len * 0.5, ty + Math.sin(a) * len * 0.4, tx, ty + 3); x.closePath(); x.fillStyle = lg(x, tx, ty - 20, ex, ey, '#8ac050', '#2a6a2a'); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke(); }
    for (const [cx2, cy2] of [[tx - 4, ty + 4], [tx + 4, ty + 5], [tx, ty + 8]] as [number, number][]) ball(x, cx2, cy2, 3.5, '#8a5a2a', '#3a2010', OL);
    box(x, bx + 22, by - 30, 9, 30, 4.5, lg(x, bx + 22, 0, bx + 31, 0, '#7ac060', '#2a6a2a'), OL); box(x, bx + 30, by - 24, 8, 5, 2.5, '#4a8a3a', OL); box(x, bx + 34, by - 34, 6, 13, 3, lg(x, bx + 34, 0, bx + 40, 0, '#7ac060', '#2a6a2a'), OL); ball(x, bx + 26.5, by - 31, 2.5, '#ff8ab0', '#c03060');
  } else { // charred dead tree
    trunk(x, bx, by, 50, 7, '#3a3230', '#120e0c', R);
    const br = (x0: number, y0: number, a: number, len: number, w: number, d: number): void => { if (d > 3) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; seg(x, x0, y0, x1, y1, OL, w + 2); seg(x, x0, y0, x1, y1, '#2a2220', w); if (d >= 2) ball(x, x1, y1, 2.2, '#ffd080', '#ff4010'); br(x1, y1, a - 0.5, len * 0.7, w * 0.65, d + 1); br(x1, y1, a + 0.45, len * 0.65, w * 0.65, d + 1); };
    br(bx, by - 48, -Math.PI / 2 - 0.5, 22, 4.5, 0); br(bx, by - 48, -Math.PI / 2 + 0.55, 22, 4.5, 0);
    for (let k = 0; k < 5; k++) seg(x, bx - 3 + k * 1.5, by - 6 - k * 9, bx - 1 + k * 1.5, by - 12 - k * 9, 'rgba(255,120,30,0.85)', 1.2);
    ball(x, bx, by - 4, 12, 'rgba(255,120,40,0.35)', 'rgba(255,90,0,0)');
  }
}
function dunTheme(): number { return WID === 0 ? -1 : DUNS[Math.floor((WID - 1) / 10)]?.th ?? 0; }
function paintDunFloor(x: CanvasRenderingContext2D, t: number, v: number, R: () => number): boolean {
  const base = (c0: string, c1: string): void => { x.fillStyle = lg(x, 0, 0, TS, TS, c0, c1); x.fillRect(0, 0, TS, TS); };
  if (t === 19) { base(v % 2 ? '#5e4c3a' : '#584634', '#3a2c20');
    for (let k = 0; k < 4; k++) { const cx = R() * TS, cy = R() * TS, rr = 5 + R() * 7; x.fillStyle = R() < 0.5 ? 'rgba(120,96,70,0.35)' : 'rgba(30,20,12,0.3)'; x.beginPath(); x.ellipse(cx, cy, rr, rr * 0.6, R() * 3, 0, TAU); x.fill(); }
    speck(x, R, 70, ['#6e5a46', '#2a1e14', '#4a3a2c', '#7a6650'], TS, TS);
    for (let k = 0; k < 3; k++) { const px = R() * 28 + 2, py = R() * 28 + 2; ball(x, px, py, 1.4 + R() * 1.6, '#8a7660', '#3a2c20'); }
    if (v === 3) { seg(x, 3, 20, 14, 17, 'rgba(20,10,5,0.5)', 1); seg(x, 14, 17, 22, 24, 'rgba(20,10,5,0.5)', 1); }
    return true; }
  if (t === 21) { base('#d8d2c2', '#b0a890');
    const a1 = v % 2 ? '#ece6d6' : '#c8c0aa', a2 = v % 2 ? '#c0b8a2' : '#e4dece';
    for (const [qx, qy, c] of [[0, 0, a1], [16, 16, a1], [16, 0, a2], [0, 16, a2]] as [number, number, string][]) { box(x, qx + 0.5, qy + 0.5, 15, 15, 1, lg(x, qx, qy, qx + 16, qy + 16, mix(c, '#ffffff', 0.25), c)); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(qx + 1.5, qy + 1.5, 13, 1); for (let k = 0; k < 2; k++) seg(x, qx + R() * 14, qy + R() * 14, qx + R() * 14, qy + R() * 14, 'rgba(150,140,120,0.25)', 0.6); }
    x.strokeStyle = 'rgba(200,160,70,0.55)'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, TS - 1, TS - 1);
    if (v === 3) { x.strokeStyle = 'rgba(120,150,255,0.5)'; x.beginPath(); x.arc(16, 16, 9, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(16, 7); x.lineTo(24, 21); x.lineTo(8, 21); x.closePath(); x.stroke(); }
    return true; }
  if (t === 23) { base(v % 2 ? '#2e2228' : '#2a1e24', '#140a0e');
    for (let r2 = 0; r2 < 2; r2++) for (let c2 = 0; c2 < 2; c2++) { const ox = c2 * 16 + (r2 % 2) * 4, oy = r2 * 16; shape(x, [ox + 1, oy + 2, ox + 14, oy + 1, ox + 15, oy + 14, ox + 2, oy + 15], lg(x, ox, oy, ox, oy + 16, R() < 0.5 ? '#3e2e32' : '#36282c', '#1a1014'), 'rgba(0,0,0,0.6)', 1); }
    speck(x, R, 30, ['#4a3a3e', '#0e0608'], TS, TS);
    const lv = v >= 2; x.strokeStyle = lv ? 'rgba(255,120,30,0.9)' : 'rgba(255,90,30,0.45)'; x.lineWidth = lv ? 1.6 : 1; x.beginPath(); x.moveTo(R() * 8, R() * 32); x.lineTo(10 + R() * 12, R() * 32); x.lineTo(24 + R() * 8, R() * 32); x.stroke();
    if (lv) { x.strokeStyle = 'rgba(255,220,120,0.8)'; x.lineWidth = 0.6; x.stroke(); }
    return true; }
  return false;
}
function dunOverlay(x: CanvasRenderingContext2D, gx: number, gy: number, i: number, px: number, py: number): void {
  const di = dunTheme(); if (di < 0) return;
  const D = DUNS[di]; if (!D) return;
  const t = MAP[i] ?? 0, isW = (j: number): boolean => (MAP[j] ?? D.tw) === D.tw, h = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;
  const R = mulberry(h);
  if (t === D.tw) {
    const below = gy + 1 < MH && !isW(i + MW), fh = below ? TS * 0.62 : 0, topH = TS - fh;
    const cap = di === 0 ? ['#4a3c30', '#241a12'] : di === 1 ? ['#6a6a86', '#383850'] : ['#2a2026', '#0c0608'];
    x.fillStyle = lg(x, px, py, px, py + topH, cap[0] ?? '#444', cap[1] ?? '#222'); x.fillRect(px, py, TS, topH);
    if (di === 0) for (let k = 0; k < 3; k++) ball(x, px + R() * TS, py + R() * topH, 4 + R() * 5, 'rgba(110,90,70,0.5)', 'rgba(30,20,12,0)');
    else if (di === 1) { x.fillStyle = 'rgba(200,190,255,0.15)'; x.fillRect(px, py, TS, 2); }
    else { if (R() < 0.3) seg(x, px + R() * TS, py + R() * topH, px + R() * TS, py + R() * topH, 'rgba(255,90,30,0.6)', 1); }
    if (!isW(i - MW) && gy > 0) { x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(px, py, TS, 2); }
    if (below) { const fy = py + topH;
      if (di === 0) { x.fillStyle = lg(x, 0, fy, 0, py + TS, '#6a5644', '#2a1e14'); x.fillRect(px, fy, TS, fh); for (let k = 0; k < 4; k++) { const sx = px + R() * TS, sy = fy + R() * fh; shape(x, [sx - 5, sy, sx + 4, sy - 3, sx + 7, sy + 4, sx - 2, sy + 6], R() < 0.5 ? 'rgba(130,108,86,0.6)' : 'rgba(40,28,18,0.5)'); } seg(x, px + R() * TS, fy + 2, px + R() * TS, py + TS - 2, 'rgba(10,5,0,0.5)', 1); for (let k = 0; k < 2; k++) { const sx = px + 5 + R() * 22; tri(x, sx - 3, fy, sx + 3, fy, sx, fy + 6 + R() * 5, '#3a2c20'); } }
      else if (di === 1) { x.fillStyle = lg(x, 0, fy, 0, py + TS, '#e8e2f0', '#9a94b0'); x.fillRect(px, fy, TS, fh); for (let r2 = 0; r2 < 3; r2++) for (let c2 = -1; c2 < 3; c2++) { const ox = px + c2 * 14 + (r2 % 2) * 7, oy = fy + r2 * (fh / 3); x.strokeStyle = 'rgba(90,80,120,0.45)'; x.lineWidth = 1; x.strokeRect(ox, oy, 14, fh / 3); } x.fillStyle = '#c8a040'; x.fillRect(px, fy, TS, 2); x.fillStyle = 'rgba(255,255,255,0.4)'; x.fillRect(px, fy + 2, TS, 1); }
      else { x.fillStyle = lg(x, 0, fy, 0, py + TS, '#3a2a30', '#120808'); x.fillRect(px, fy, TS, fh); for (let c2 = 0; c2 < 2; c2++) box(x, px + c2 * 16 + 1, fy + 1, 14, fh - 2, 1.5, lg(x, 0, fy, 0, py + TS, '#4a3a40', '#1a1014'), 'rgba(0,0,0,0.6)'); if (h % 3 === 0) { x.strokeStyle = 'rgba(255,110,30,0.9)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(px + 16, fy + 2); x.lineTo(px + 13, fy + fh * 0.5); x.lineTo(px + 17, py + TS - 1); x.stroke(); } }
      x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(px, py + TS - 3, TS, 3); }
    return;
  }
  // floor: contact shadow under walls
  if (gy > 0 && isW(i - MW)) { const gr = x.createLinearGradient(0, py, 0, py + 12); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(px, py, TS, 12); }
  if (gx > 0 && isW(i - 1)) { const gr = x.createLinearGradient(px, 0, px + 8, 0); gr.addColorStop(0, 'rgba(0,0,0,0.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(px, py, 8, TS); }
  if (gx + 1 < MW && isW(i + 1)) { const gr = x.createLinearGradient(px + TS, 0, px + TS - 8, 0); gr.addColorStop(0, 'rgba(0,0,0,0.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(px + TS - 8, py, 8, TS); }
  if (t !== D.tf || h % 100 >= 7) return;
  const k = (h >> 8) % 4, cx = px + 8 + R() * 16, cy = py + 12 + R() * 14;
  if (di === 0) {
    if (k === 0) { shadowBlob(x, cx, cy + 2, 7); shape(x, [cx - 6, cy + 2, cx - 2, cy - 14, cx + 1, cy - 18, cx + 3, cy - 10, cx + 6, cy + 2], lg(x, cx - 6, 0, cx + 6, 0, '#9a8470', '#3a2c20'), OL, 1); seg(x, cx - 2, cy - 10, cx - 3, cy, 'rgba(255,240,210,0.3)', 1); }
    else if (k === 1) { shadowBlob(x, cx, cy + 2, 8); for (const [ox, a, hh] of [[-4, -0.3, 12], [1, 0.05, 16], [5, 0.4, 10]] as [number, number, number][]) { x.save(); x.translate(cx + ox, cy + 2); x.rotate(a); shape(x, [-2.5, 0, 0, -hh, 2.5, 0], lg(x, -3, -hh, 3, 0, '#d0f8ff', '#3a8ab8'), OL, 0.8); x.restore(); } ball(x, cx, cy - 4, 12, 'rgba(120,220,255,0.35)', 'rgba(120,220,255,0)'); }
    else if (k === 2) { for (const [ox, s] of [[-4, 1], [3, 0.7], [0, 0.5]] as [number, number][]) { box(x, cx + ox - 1, cy - 6 * s, 2, 6 * s, 0.5, '#e8dcc0'); x.beginPath(); x.ellipse(cx + ox, cy - 6 * s, 5 * s, 3 * s, 0, Math.PI, TAU); x.fillStyle = '#c86ad0'; x.fill(); x.strokeStyle = OL; x.lineWidth = 0.8; x.stroke(); circ(x, cx + ox - 1.5 * s, cy - 7 * s, 0.8, '#ffffff'); } ball(x, cx, cy - 4, 10, 'rgba(220,120,255,0.3)', 'rgba(220,120,255,0)'); }
    else { ell(x, cx, cy, 6, 2.5, '#e8e0cc'); ball(x, cx + 6, cy - 2, 3, '#f0e8d8', '#a89a80', OL); seg(x, cx - 7, cy + 1, cx + 3, cy - 3, '#d8d0bc', 2); }
  } else if (di === 1) {
    if (k === 0) { shadowBlob(x, cx, cy + 2, 6); box(x, cx - 1.5, cy - 14, 3, 15, 1, '#c8a040', OL); box(x, cx - 6, cy - 15, 12, 2, 1, '#c8a040', OL); for (const ox of [-5, 0, 5]) { box(x, cx + ox - 1, cy - 20, 2, 5, 0.5, '#f8f0e0'); ball(x, cx + ox, cy - 22, 1.6, '#fff8c0', '#ff9a20'); } ball(x, cx, cy - 20, 12, 'rgba(255,220,140,0.3)', 'rgba(255,220,140,0)'); }
    else if (k === 1) { for (let q = 0; q < 3; q++) box(x, cx - 7 + q * 1.5, cy - q * 3, 12, 3, 0.5, ['#a03a3a', '#3a5aa0', '#4a8a4a'][q] ?? '#888', OL); }
    else if (k === 2) { x.strokeStyle = 'rgba(140,170,255,0.7)'; x.lineWidth = 1; x.beginPath(); x.ellipse(cx, cy, 10, 5, 0, 0, TAU); x.stroke(); x.beginPath(); x.ellipse(cx, cy, 6, 3, 0, 0, TAU); x.stroke(); ball(x, cx, cy, 10, 'rgba(120,150,255,0.25)', 'rgba(120,150,255,0)'); }
    else { box(x, cx - 6, cy - 10, 12, 10, 1, lg(x, 0, cy - 10, 0, cy, '#8a6a40', '#4a3018'), OL); x.fillStyle = '#f0e8d0'; x.beginPath(); x.ellipse(cx, cy - 11, 6, 2, 0, 0, TAU); x.fill(); x.stroke(); }
  } else {
    if (k === 0) { ell(x, cx, cy, 9, 4, '#120808'); ball(x, cx, cy, 8, 'rgba(255,170,40,0.9)', 'rgba(255,60,0,0.2)'); ball(x, cx - 2, cy - 1, 3, '#fff0a0', 'rgba(255,200,60,0)'); }
    else if (k === 1) { ball(x, cx, cy - 3, 4.5, '#e8e0d0', '#8a8070', OL); ell(x, cx - 1.6, cy - 3, 1.2, 1.5, '#120808'); ell(x, cx + 1.6, cy - 3, 1.2, 1.5, '#120808'); seg(x, cx - 8, cy + 3, cx + 8, cy + 1, '#d8d0bc', 2); }
    else if (k === 2) { for (let q = 0; q < 5; q++) { x.strokeStyle = OL; x.lineWidth = 2.4; x.beginPath(); x.ellipse(cx - 8 + q * 4, cy - q * 0.5, 2.4, 1.6, 0.3 * (q % 2 ? 1 : -1), 0, TAU); x.stroke(); x.strokeStyle = '#7a7a84'; x.lineWidth = 1.2; x.stroke(); } }
    else { shadowBlob(x, cx, cy + 2, 8); for (let q = 0; q < 4; q++) { x.strokeStyle = OL; x.lineWidth = 3.4; x.beginPath(); x.arc(cx + 2, cy + 4 - q * 4, 8 - q, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); x.strokeStyle = '#e0d8c4'; x.lineWidth = 2; x.stroke(); } }
  }
}
let DLIT: [number, number, number][] = [];
function dunLights(ctx: CanvasRenderingContext2D, g: G, z: number, time: number): void {
  const di = dunTheme(); if (di < 0) return;
  const D = DUNS[di]; if (!D) return;
  DLIT = [];
  const tx0 = Math.max(0, Math.floor(g.camX / TS) - 2), ty0 = Math.max(0, Math.floor(g.camY / TS) - 2), tx1 = Math.min(MW - 2, Math.floor((g.camX + g.vw) / TS) + 2), ty1 = Math.min(MH - 2, Math.floor((g.camY + g.vh) / TS) + 2);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const i = ty * MW + tx; if ((MAP[i] ?? 0) !== D.tw || (MAP[i + MW] ?? D.tw) === D.tw) continue; const h = ((tx * 2654435761) ^ (ty * 40503)) >>> 0; if (h % 5 !== 0) continue;
    const lx = tx * TS + 16, ly = ty * TS + 16, fl = Math.sin(time * 11 + h) * 0.15 + Math.sin(time * 23 + h * 0.3) * 0.08;
    if (di === 1) { box(ctx, lx - 3, ly - 2, 6, 8, 1.5, '#c8a040', OL); ball(ctx, lx, ly - 5, 4 + fl * 4, '#ffffff', '#6a8aff'); }
    else { box(ctx, lx - 2, ly - 2, 4, 10, 1, '#5a3a20', OL); box(ctx, lx - 3.5, ly - 4, 7, 3, 1, '#3a3a40', OL); shape(ctx, [lx - 3, ly - 4, lx + 3, ly - 4, lx + fl * 6, ly - 13 - fl * 4], di === 2 ? '#ff5020' : '#ffb040'); shape(ctx, [lx - 1.5, ly - 4, lx + 1.5, ly - 4, lx + fl * 3, ly - 9], '#fff0a0'); }
    DLIT.push([(lx - g.camX) * z, (ly - 6 - g.camY) * z, fl]); }

}
function dunGlow(ctx: CanvasRenderingContext2D, z: number): void {
  const di = dunTheme(); if (di < 0 || !DLIT.length) return;
  const col = di === 1 ? '130,160,255' : di === 2 ? '255,90,30' : '255,170,70';
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [sx, sy, fl] of DLIT) { const rr = (90 + fl * 30) * z, gr = ctx.createRadialGradient(sx, sy, 2, sx, sy, rr); gr.addColorStop(0, `rgba(${col},0.5)`); gr.addColorStop(0.4, `rgba(${col},0.16)`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(sx - rr, sy - rr, rr * 2, rr * 2); }
  ctx.restore();
}
function bldImg(b: Bld): [HTMLCanvasElement, number] | null {
  const top = b.k === 4 ? 60 : 0, W = b.w * TS + 24, H = b.h * TS + 64 + top, key = `${b.k}_${b.st}`;
  const ex = BIMG[key];
  if (ex) return [ex, H];
  const r = mk(W, H);
  if (!r) return null;
  if (b.k < 99) paintBld2(r[1], b, W, H, top); else paintBld(r[1], b, W, H, top); BIMG[key] = r[0];
  return [r[0], H];
}
function paintBld(x: CanvasRenderingContext2D, b: Bld, W: number, H: number, top: number): void {
  const k = b.k, st = b.st, gy = H - 6, wallH = k === 4 ? 84 : 62, wl = 12, wr = W - 12, wt = gy - wallH, rt = top + (k === 4 ? 6 : 22);
  shadowBlob(x, W / 2, gy, W / 2 - 4);
  const wc = k === 4 ? ['#eeeae2', '#aaa298'] : st === 0 ? ['#f0e4c8', '#c8b48c'] : ['#dcd6ca', '#a29a8c'];
  box(x, wl, wt, wr - wl, wallH, 2, lg(x, 0, wt, 0, gy, wc[0] ?? '#eee', wc[1] ?? '#aaa'), OL);
  if (st === 0 && k !== 4) {
    x.fillStyle = '#6a4224';
    for (const bx of [wl, wl + (wr - wl) / 3 - 2, wl + ((wr - wl) * 2) / 3 - 2, wr - 5]) x.fillRect(bx, wt, 5, wallH);
    x.fillRect(wl, wt, wr - wl, 5); x.fillRect(wl, wt + wallH * 0.48, wr - wl, 4);
  } else {
    x.strokeStyle = 'rgba(90,60,30,0.28)'; x.lineWidth = 1;
    for (let yy = wt + 10, row = 0; yy < gy; yy += 10, row++) { x.beginPath(); x.moveTo(wl, yy); x.lineTo(wr, yy); x.stroke(); for (let xx = wl + (row % 2) * 9; xx < wr; xx += 18) { x.beginPath(); x.moveTo(xx, yy - 10); x.lineTo(xx, yy); x.stroke(); } }
  }
  x.fillStyle = lg(x, 0, gy - 28, 0, gy, 'rgba(60,40,20,0)', 'rgba(60,40,20,0.35)'); x.fillRect(wl, gy - 28, wr - wl, 28);
  box(x, wl - 3, gy - 12, wr - wl + 6, 12, 2, '#4a443c', OL);
  for (let sx = wl - 2, k2 = 0; sx < wr + 2; k2++) { const w = Math.min(9 + ((k2 * 7) % 5), wr + 2 - sx); box(x, sx, gy - 11, w, 10, 2, lg(x, 0, gy - 11, 0, gy - 1, k2 % 3 ? '#aaa294' : '#989082', '#6a645a')); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(sx + 1.5, gy - 10.5, Math.max(0, w - 3), 1); sx += w + 1; }
  if (k === 4) for (const cx of [wl + 10, wr - 10]) box(x, cx - 5, wt + 4, 10, wallH - 10, 2, lg(x, cx - 5, 0, cx + 5, 0, '#ffffff', '#b8b0a4'), OL);
  const dx = W / 2, dw = k === 3 ? 30 : 18, dh = k === 3 ? 38 : 32;
  x.beginPath(); x.moveTo(dx - dw / 2, gy - 6); x.lineTo(dx - dw / 2, gy - dh); x.quadraticCurveTo(dx, gy - dh - 12, dx + dw / 2, gy - dh); x.lineTo(dx + dw / 2, gy - 6); x.closePath();
  x.fillStyle = lg(x, dx - dw / 2, 0, dx + dw / 2, 0, '#8a5428', '#3a2010'); x.fill(); x.strokeStyle = OL; x.lineWidth = 2; x.stroke();
  seg(x, dx, gy - dh - 4, dx, gy - 6, 'rgba(0,0,0,0.4)', 1); ball(x, dx + 4, gy - 18, 1.6, '#f0cc60', '#8a6420');
  for (const wx of [wl + 24, wr - 24]) {
    if (Math.abs(wx - dx) < dw) continue;
    box(x, wx - 9, wt + 16, 18, 17, 2, '#3a2a1a', OL);
    box(x, wx - 7, wt + 18, 14, 13, 1, lg(x, 0, wt + 18, 0, wt + 31, '#fff0b0', '#f0a040'));
    seg(x, wx, wt + 18, wx, wt + 31, '#3a2a1a', 1.5); seg(x, wx - 7, wt + 24.5, wx + 7, wt + 24.5, '#3a2a1a', 1.5);
    box(x, wx - 11, wt + 33, 22, 4, 1.5, '#7a4a24', OL);
  }
  const rc = k === 2 ? ['#9a6ae0', '#3a1a70'] : k === 4 ? ['#6a8ac0', '#2a3a60'] : k === 1 ? ['#6a6a76', '#2a2a32'] : st === 0 ? ['#b8664a', '#5a2418'] : ['#5a86a8', '#1e3a52'];
  const c0 = rc[0] ?? '#c44', c1 = rc[1] ?? '#622';
  shape(x, [2, wt + 10, W - 2, wt + 10, wr - 16, rt, wl + 16, rt], lg(x, 0, rt, 0, wt + 10, c0, c1), OL, 2);
  x.strokeStyle = 'rgba(0,0,0,0.22)'; x.lineWidth = 1;
  for (let yy = rt + 6, row = 0; yy < wt + 9; yy += 6, row++) { const f = (yy - rt) / (wt + 10 - rt), lx = wl + 16 - f * (wl + 14), rx2 = wr - 16 + f * (W - 2 - wr + 16); x.strokeStyle = 'rgba(0,0,0,0.3)'; x.lineWidth = 1; x.beginPath(); for (let xx = lx + (row % 2) * 4; xx < rx2 - 6; xx += 8) { x.moveTo(xx, yy - 2); x.quadraticCurveTo(xx + 4, yy + 3, xx + 8, yy - 2); } x.stroke(); x.fillStyle = 'rgba(255,255,255,0.09)'; x.fillRect(lx + 2, yy - 5, rx2 - lx - 4, 1); }
  x.fillStyle = lg(x, wl, 0, wr, 0, 'rgba(255,240,210,0.08)', 'rgba(0,0,0,0.16)'); x.beginPath(); x.moveTo(2, wt + 10); x.lineTo(W - 2, wt + 10); x.lineTo(wr - 16, rt); x.lineTo(wl + 16, rt); x.closePath(); x.fill();
  x.fillStyle = 'rgba(255,255,255,0.28)'; x.fillRect(wl + 16, rt, wr - wl - 32, 3);
  box(x, 0, wt + 8, W, 5, 2, c1, OL);
  x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(wl, wt + 13, wr - wl, 6);
  if (k === 1) { box(x, wr - 34, rt - 18, 13, 30, 1, lg(x, 0, rt - 18, 0, rt + 12, '#8a827a', '#4a443e'), OL); box(x, wr - 36, rt - 21, 17, 5, 1, '#5a544e', OL); }
  if (k === 2) shape(x, [W / 2, rt - 20, W / 2 + 4, rt - 7, W / 2 + 14, rt - 6, W / 2 + 6, rt + 1, W / 2 + 9, rt + 12, W / 2, rt + 5, W / 2 - 9, rt + 12, W / 2 - 6, rt + 1, W / 2 - 14, rt - 6, W / 2 - 4, rt - 7], '#ffe060', OL);
  if (k === 4) {
    box(x, W / 2 - 12, rt - 34, 24, 40, 2, lg(x, 0, rt - 34, 0, rt + 6, '#f4f0e8', '#b0a898'), OL);
    shape(x, [W / 2 - 15, rt - 34, W / 2 + 15, rt - 34, W / 2, rt - 54], lg(x, 0, rt - 54, 0, rt - 34, '#7a9ad0', '#2a3a60'), OL);
    ball(x, W / 2, rt - 20, 5, '#ffe080', '#b08020', OL);
    seg(x, W / 2, rt - 64, W / 2, rt - 52, '#e8c050', 2.5); seg(x, W / 2 - 5, rt - 59, W / 2 + 5, rt - 59, '#e8c050', 2.5);
  } else {
    const sx = dx + dw / 2 + 18, sy = gy - dh - 4;
    seg(x, sx - 12, sy - 8, sx + 8, sy - 8, '#3a2a1a', 2.5); seg(x, sx - 6, sy - 8, sx - 6, sy - 2, '#3a2a1a', 1); seg(x, sx + 4, sy - 8, sx + 4, sy - 2, '#3a2a1a', 1);
    box(x, sx - 10, sy - 3, 19, 17, 2, '#e0c088', OL);
    if (k === 3) { box(x, sx - 6, sy, 11, 10, 1, '#b07a44', OL); seg(x, sx - 6, sy, sx + 5, sy + 10, '#6a4220', 1); seg(x, sx + 5, sy, sx - 6, sy + 10, '#6a4220', 1); }
    else { const ic = icon(k === 0 ? 'pr' : k === 1 ? `G${byName('長劍')}` : 'sx'); if (ic) x.drawImage(ic, sx - 8, sy - 2, 15, 15); }
  }
}
function drawBld(ctx: CanvasRenderingContext2D, i: number, font: string, time: number): void {
  const b = BLDS[i];
  if (!b) return;
  const bi = bldImg(b);
  if (!bi) return;
  const im = bi[0], H = bi[1], by = (b.y + b.h) * TS, bx = b.x * TS - 12, top = by - H + 6;
  ctx.drawImage(im, bx, top);
  if (b.k === 1) for (let k = 0; k < 4; k++) { const t = (time * 0.4 + k / 4) % 1; circ(ctx, bx + im.width - 40 + Math.sin(t * 6 + k) * 4, top + 2 - t * 34, 3 + t * 7, `rgba(150,150,160,${0.45 * (1 - t)})`); }
  label(ctx, BKN[b.k] ?? '', bx + im.width / 2, top + (b.k === 4 ? 4 : 14), '#fff4c0', 12, font, 'center');
}
function propImg2(x: CanvasRenderingContext2D, k: number, c: number): boolean {
  if (k === 1) { // barrel
    x.beginPath(); x.moveTo(-10, -2); x.quadraticCurveTo(-13, -13, -10, -25); x.lineTo(10, -25); x.quadraticCurveTo(13, -13, 10, -2); x.quadraticCurveTo(0, 1, -10, -2); x.closePath(); x.fillStyle = lg(x, -12, 0, 12, 0, '#c08850', '#5a3418'); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.4; x.stroke();
    for (const sx of [-6, -2, 2, 6]) seg(x, sx, -24, sx * 1.1, -2, 'rgba(60,30,10,0.45)', 0.8);
    for (const yy of [-21, -6]) { x.beginPath(); x.moveTo(-11.5, yy); x.quadraticCurveTo(0, yy + 2, 11.5, yy); x.strokeStyle = OL; x.lineWidth = 3.4; x.stroke(); x.strokeStyle = '#6a6a74'; x.lineWidth = 2; x.stroke(); }
    x.fillStyle = lg(x, 0, -28, 0, -23, '#a8703c', '#6a4020'); x.beginPath(); x.ellipse(0, -25, 10, 3.2, 0, 0, TAU); x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke(); x.beginPath(); x.ellipse(0, -25, 7, 2, 0, 0, TAU); x.strokeStyle = 'rgba(60,30,10,0.5)'; x.lineWidth = 0.8; x.stroke();
    if (c % 2) { for (let q = 0; q < 4; q++) ball(x, -5 + q * 3.4, -27 - (q % 2) * 2, 2.6, ['#ff5a40', '#ffd040', '#80d050', '#ff8a30'][q] ?? '#f00', '#7a2010', OL); }
    seg(x, -7, -22, -8, -6, 'rgba(255,230,190,0.3)', 1.2); return true; }
  if (k === 2) { // crate
    box(x, -11, -20, 22, 20, 1.5, lg(x, -11, -20, 11, 0, '#d8a868', '#7a4e24'), OL);
    shape(x, [-11, -20, -6, -25, 16, -25, 11, -20], lg(x, 0, -25, 0, -20, '#e8c080', '#b08048'), OL, 1.2); shape(x, [11, -20, 16, -25, 16, -5, 11, 0], lg(x, 11, 0, 16, 0, '#9a6a34', '#5a3818'), OL, 1.2);
    for (const yy of [-17, -3]) box(x, -11, yy, 22, 3, 0.5, '#8a5a2a', OL); seg(x, -9, -14, 9, -6, '#7a4a20', 2.4); seg(x, -9, -14, 9, -6, '#b08048', 1);
    for (const [nx, ny] of [[-9, -16], [9, -16], [-9, -2], [9, -2]] as [number, number][]) circ(x, nx, ny, 0.8, '#3a3a40');
    if (c % 3 === 0) { box(x, -6, -33, 14, 9, 1, lg(x, 0, -33, 0, -24, '#d8a868', '#8a5a2a'), OL); seg(x, -6, -29, 8, -29, '#7a4a20', 1); } return true; }
  if (k === 6) { // market stall
    const ac = ['#d03a3a', '#3a7ad0', '#3aa05a'][c % 3] ?? '#d03a3a';
    for (const sx of [-24, 24]) { box(x, sx - 2, -46, 4, 46, 1, lg(x, sx - 2, 0, sx + 2, 0, '#9a6a3a', '#5a3a1a'), OL); }
    box(x, -27, -20, 54, 6, 1.5, lg(x, 0, -20, 0, -14, '#c89058', '#7a4e24'), OL); box(x, -25, -14, 50, 12, 1, lg(x, 0, -14, 0, -2, '#a87040', '#5a3418'), OL);
    for (let q = 0; q < 5; q++) seg(x, -25 + q * 12.5, -14, -25 + q * 12.5, -2, 'rgba(40,20,5,0.5)', 1);
    const gc = ['#ff5040', '#ffd040', '#80e060', '#ff9a40', '#c060ff', '#60c0ff'];
    for (let q = 0; q < 7; q++) { const fx = -21 + q * 7; ball(x, fx, -23, 3.2, '#ffffff', gc[(q + c) % 6] ?? '#f00', OL); if (q % 2) ball(x, fx + 3, -25.5, 2.6, '#ffffff', gc[(q + c + 2) % 6] ?? '#f00', OL); }
    box(x, -18, -31, 9, 7, 1, '#c8a060', OL); for (let q = 0; q < 3; q++) ball(x, -16 + q * 2.6, -32, 1.8, '#fff0a0', '#c09020');
    x.beginPath(); x.moveTo(-30, -44); x.lineTo(30, -44); x.lineTo(26, -54); x.lineTo(-26, -54); x.closePath(); x.fillStyle = ac; x.fill(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke();
    for (let q = 0; q < 6; q++) { const x0 = -30 + q * 10; shape(x, [x0, -44, x0 + 10, -44, x0 + 10, -40, x0 + 5, -37, x0, -40], q % 2 ? '#f4ead8' : ac, OL, 1); shape(x, [x0 + (q % 2 ? 0 : 0.5) + 0.7 * (q - 3), -54, x0 + 10 + 0.7 * (q - 3), -54, x0 + 10, -44, x0, -44], q % 2 ? '#f4ead8' : ac); }
    x.beginPath(); x.moveTo(-30, -44); x.lineTo(30, -44); x.lineTo(26, -54); x.lineTo(-26, -54); x.closePath(); x.strokeStyle = OL; x.lineWidth = 1.2; x.stroke();
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(-24, -37, 48, 3); return true; }
  if (k === 20) { // fence
    for (const fx of [-26, -9, 9, 26]) { box(x, fx - 3, -27, 6, 27, 1.5, lg(x, fx - 3, 0, fx + 3, 0, '#c09060', '#6a4424'), OL); shape(x, [fx - 3, -27, fx, -31, fx + 3, -27], '#a87848', OL, 1); seg(x, fx - 1.5, -25, fx - 1.5, -3, 'rgba(255,230,190,0.3)', 0.8); }
    for (const yy of [-22, -11]) { box(x, -30, yy, 60, 4.5, 1.5, lg(x, 0, yy, 0, yy + 4.5, '#c89a68', '#7a5430'), OL); for (let q = 0; q < 3; q++) seg(x, -28 + q * 20, yy + 2, -20 + q * 20, yy + 2.4, 'rgba(60,30,10,0.4)', 0.7); }
    for (const fx of [-26, -9, 9, 26]) for (const yy of [-20, -9]) circ(x, fx, yy, 0.8, '#3a3a40');
    if (c % 2) { for (let q = 0; q < 6; q++) ball(x, -24 + q * 9, -1 - (q % 2) * 2, 2.6, '#5a9a3a', '#2a5a1a'); ball(x, -20, -4, 1.6, '#ffe060', '#c09020'); ball(x, 12, -4, 1.6, '#ff8ab0', '#c03060'); }
    return true; }
  return false;
}
function drawFountain2(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  shadow(ctx, x, y + 4, 48);
  for (let q = 0; q < 16; q++) { const a0 = (q / 16) * TAU, a1 = ((q + 1) / 16) * TAU; ctx.beginPath(); ctx.ellipse(x, y - 4, 46, 27, 0, a0, a1); ctx.ellipse(x, y - 10, 46, 27, 0, a1, a0, true); ctx.closePath(); ctx.fillStyle = Math.sin(a0) > 0 ? (q % 2 ? '#c8c0b0' : '#b8b0a0') : '#9a9284'; ctx.fill(); ctx.strokeStyle = 'rgba(40,30,20,0.6)'; ctx.lineWidth = 0.8; ctx.stroke(); }
  ctx.fillStyle = lg(ctx, 0, y - 36, 0, y - 10, '#f0ece2', '#b0a898'); ctx.beginPath(); ctx.ellipse(x, y - 10, 46, 27, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = lg(ctx, 0, y - 32, 0, y, '#8ad4f8', '#1e5a98'); ctx.beginPath(); ctx.ellipse(x, y - 11, 39, 21, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let i = 0; i < 4; i++) { const ox = Math.sin(time * 1.3 + i * 2) * 20, oy = Math.cos(time * 1.1 + i) * 8; ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(x + ox, y - 11 + oy, 6, 1.6, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(230,248,255,0.55)'; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const rr = 8 + ((time * 14 + i * 10) % 30); ctx.beginPath(); ctx.ellipse(x, y - 11, rr, rr * 0.55, 0, 0, TAU); ctx.stroke(); }
  box(ctx, x - 8, y - 40, 16, 30, 3, lg(ctx, x - 8, 0, x + 8, 0, '#f4f0e8', '#a09888'), OL); for (const k of [-4, 0, 4]) seg(ctx, x + k, y - 37, x + k, y - 13, 'rgba(120,110,90,0.35)', 0.8);
  ctx.fillStyle = lg(ctx, 0, y - 50, 0, y - 38, '#f4f0e8', '#a8a090'); ctx.beginPath(); ctx.ellipse(x, y - 42, 20, 8, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#5aa8e0'; ctx.beginPath(); ctx.ellipse(x, y - 43.5, 16, 5.5, 0, 0, TAU); ctx.fill();
  box(ctx, x - 4, y - 66, 8, 24, 2, lg(ctx, x - 4, 0, x + 4, 0, '#ffffff', '#b0a898'), OL); ball(ctx, x, y - 70, 6, '#ffffff', '#b8b0a0', OL); ball(ctx, x, y - 70, 14, 'rgba(255,250,220,0.25)', 'rgba(255,250,220,0)');
  for (let i = 0; i < 10; i++) { const t = (time * 1.1 + i / 10) % 1, a = (i / 10) * TAU, r0 = 8 + t * 26; circ(ctx, x + Math.cos(a) * r0, y - 72 - Math.sin(t * Math.PI) * 14 + t * 30 + Math.sin(a) * 8 * t, 2.2 - t, 'rgba(220,245,255,0.9)'); }
  for (let i = 0; i < 6; i++) { const t = (time * 1.6 + i / 6) % 1, a = (i / 6) * TAU; circ(ctx, x + Math.cos(a) * (16 + t * 6), y - 42 + t * 30 + Math.sin(a) * 5, 1.6, 'rgba(220,245,255,0.75)'); }
}
function paintRock(x: CanvasRenderingContext2D, px: number, py: number, zz: number, sd: number): void {
  const R = mulberry(sd + 991), c0 = zz === 6 ? '#7a6a64' : zz === 4 ? '#d0a878' : zz === 5 ? '#c8d0dc' : '#b0aa9c', c1 = zz === 6 ? '#221818' : zz === 4 ? '#6a4a28' : zz === 5 ? '#5a6474' : '#4a463e';
  shadowBlob(x, px + 16, py + 28, 15);
  const big = (cx: number, cy: number, w: number, h: number): void => { const pts: number[] = []; for (let q = 0; q < 8; q++) { const a = Math.PI + (q / 7) * Math.PI, rr = 0.82 + R() * 0.25; pts.push(cx + Math.cos(a) * w * rr, cy + Math.sin(a) * h * rr); } pts.push(cx + w * 0.95, cy + 2, cx - w * 0.95, cy + 2);
    shape(x, pts, lg(x, cx - w, cy - h, cx + w, cy, c0, c1), OL, 1.4);
    shape(x, [cx - w * 0.6, cy - h * 0.7, cx - w * 0.1, cy - h * 0.95, cx + w * 0.3, cy - h * 0.8, cx - w * 0.1, cy - h * 0.45], 'rgba(255,250,235,0.28)');
    shape(x, [cx + w * 0.2, cy - h * 0.5, cx + w * 0.9, cy - h * 0.2, cx + w * 0.9, cy + 1, cx + w * 0.1, cy + 1], 'rgba(0,0,0,0.22)');
    seg(x, cx - w * 0.2, cy - h * 0.6, cx, cy - h * 0.25, 'rgba(0,0,0,0.4)', 1); seg(x, cx, cy - h * 0.25, cx - w * 0.15, cy, 'rgba(0,0,0,0.35)', 1); };
  big(px + 17, py + 27, 13, 21); big(px + 7, py + 29, 6, 8);
  if (zz <= 3) { ell(x, px + 14, py + 9, 6, 2.4, 'rgba(104,140,56,0.85)'); ell(x, px + 20, py + 10, 4, 1.8, 'rgba(130,166,70,0.8)'); for (let q = 0; q < 3; q++) seg(x, px + 3 + q * 2, py + 30, px + 2 + q * 2.5, py + 24 - q, '#5a8a3a', 1); }
  if (zz === 5) { x.fillStyle = '#f6faff'; x.beginPath(); x.ellipse(px + 16, py + 9, 10, 4, 0, Math.PI, TAU); x.fill(); }
  if (zz === 6) for (let q = 0; q < 2; q++) seg(x, px + 10 + q * 8, py + 12 + q * 4, px + 14 + q * 6, py + 24, 'rgba(255,110,30,0.85)', 1.2);
}
const PIMG: Record<string, HTMLCanvasElement> = {};
function propImg(k: number, c: number): HTMLCanvasElement | null {
  const key = `${k}_${c}`, ex = PIMG[key];
  if (ex) return ex;
  const r = mk(64, 72);
  if (!r) return null;
  const x = r[1];
  x.translate(32, 68);
  shadowBlob(x, 0, 0, k === 6 ? 26 : k === 0 || k === 7 || k === 9 ? 6 : 12);
  if (propImg2(x, k, c)) { PIMG[key] = r[0]; return r[0]; }
  if (k === 0) { seg(x, 0, 0, 0, -44, OL, 5); seg(x, 0, 0, 0, -44, '#3a3a44', 3); box(x, -6, -56, 12, 13, 2, 'rgba(255,220,140,0.95)', OL); shape(x, [-8, -56, 8, -56, 0, -63], '#3a3a44', OL); box(x, -4, -4, 8, 4, 1, '#3a3a44', OL); }
  else if (k === 1) { box(x, -9, -22, 18, 22, 5, lg(x, -9, 0, 9, 0, '#a8703c', '#5a3418'), OL); box(x, -9.5, -18, 19, 2.5, 1, '#5a5a62'); box(x, -9.5, -6, 19, 2.5, 1, '#5a5a62'); x.fillStyle = '#7a4a24'; x.beginPath(); x.ellipse(0, -21, 8, 2.5, 0, 0, TAU); x.fill(); }
  else if (k === 2) { box(x, -10, -18, 20, 18, 1.5, lg(x, 0, -18, 0, 0, '#c89858', '#8a5a2a'), OL); seg(x, -9, -17, 9, -1, '#6a4220', 2); seg(x, 9, -17, -9, -1, '#6a4220', 2); }
  else if (k === 3) { box(x, -14, -10, 28, 10, 2, '#8a5a32', OL); const cols = ['#ff6a8a', '#ffd84a', '#ffffff', '#b070ff', '#ff8a40']; for (let i = 0; i < 7; i++) { const fx = -11 + i * 3.7; seg(x, fx, -10, fx + 0.5, -15, '#3a7a2a', 1.2); ball(x, fx + 0.5, -16, 2.4, '#ffffff', cols[(i + c) % 5] ?? '#ff6a8a'); } }
  else if (k === 4) { box(x, -16, -12, 32, 4, 1.5, '#9a6a3c', OL); box(x, -16, -20, 32, 4, 1.5, '#8a5a32', OL); box(x, -14, -8, 3, 8, 1, '#5a3a20'); box(x, 11, -8, 3, 8, 1, '#5a3a20'); }
  else if (k === 6) {
    box(x, -24, -16, 48, 14, 2, lg(x, 0, -16, 0, -2, '#b07a44', '#6a4224'), OL);
    seg(x, -22, -2, -22, -42, '#5a3a20', 2.5); seg(x, 22, -2, 22, -42, '#5a3a20', 2.5);
    const ac = ['#d03a3a', '#3a7ad0', '#3aa05a'][c % 3] ?? '#d03a3a';
    for (let i = 0; i < 6; i++) shape(x, [-27 + i * 9, -44, -18 + i * 9, -44, -17 + i * 9, -35, -28 + i * 9, -35], i % 2 ? '#f4ead8' : ac, OL, 1);
    const gc = ['#ff5040', '#ffd040', '#80e060', '#ff9a40', '#c060ff', '#60c0ff'];
    for (let i = 0; i < 6; i++) ball(x, -16 + i * 6.4, -19, 3, '#ffffff', gc[(i + c) % 6] ?? '#ff5040');
  }
  else if (k === 7) { seg(x, 0, 0, 0, -58, OL, 4); seg(x, 0, 0, 0, -58, '#8a6a3a', 2.4); shape(x, [1, -56, 17, -56, 17, -28, 9, -33, 1, -28], c === 0 ? '#3a5ac0' : '#c03a3a', OL, 1); ball(x, 9, -46, 3.5, '#ffe080', '#b08020'); ball(x, 0, -59, 2.4, '#f0cc60', '#8a6420'); }
  else if (k === 20) { box(x, -29, -21, 58, 4, 1.5, lg(x, 0, -21, 0, -17, '#b08858', '#6a4a2a'), OL); box(x, -29, -11, 58, 4, 1.5, lg(x, 0, -11, 0, -7, '#b08858', '#6a4a2a'), OL); for (const fx of [-26, -9, 9, 26]) { box(x, fx - 2.5, -26, 5, 26, 1.5, lg(x, fx - 2.5, 0, fx + 2.5, 0, '#a07a4a', '#5a3e22'), OL); shape(x, [fx - 2.5, -26, fx, -30, fx + 2.5, -26], '#8a6a3c', OL, 1); } }
  else if (k === 21) { box(x, -2, -52, 4, 32, 1, lg(x, -2, 0, 2, 0, '#b08858', '#6a4a2a'), OL); box(x, -3, -30, 6, 30, 1.5, lg(x, -3, 0, 3, 0, '#a07a4a', '#5a3e22'), OL); shape(x, [-3, -30, 0, -34, 3, -30], '#8a6a3c', OL, 1); }
  else if (k === 9) { seg(x, 0, 0, 0, -36, OL, 4); seg(x, 0, 0, 0, -36, '#8a6a3a', 2.4); shape(x, [-14, -34, 12, -34, 17, -29, 12, -24, -14, -24], '#c8a068', OL); }
  PIMG[key] = r[0];
  return r[0];
}
function drawFountain(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  if (x > -1e9) { drawFountain2(ctx, x, y, time); return; }
  shadow(ctx, x, y + 4, 44);
  ctx.fillStyle = lg(ctx, 0, y - 32, 0, y + 6, '#d8d0c0', '#8a8478'); ctx.beginPath(); ctx.ellipse(x, y - 8, 44, 26, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = lg(ctx, 0, y - 30, 0, y, '#7ac4f0', '#2a6aa8'); ctx.beginPath(); ctx.ellipse(x, y - 11, 37, 20, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(230,248,255,0.5)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) { const rr = (time * 14 + i * 12) % 36; ctx.beginPath(); ctx.ellipse(x, y - 11, rr, rr * 0.55, 0, 0, TAU); ctx.stroke(); }
  box(ctx, x - 6, y - 46, 12, 36, 3, lg(ctx, x - 6, 0, x + 6, 0, '#f0ece4', '#a09888'), OL);
  ball(ctx, x, y - 50, 8, '#f4f0e8', '#a09888', OL);
  for (let i = 0; i < 8; i++) { const t = (time * 1.2 + i / 8) % 1, a = (i / 8) * TAU; circ(ctx, x + Math.cos(a) * 24 * t, y - 52 - Math.sin(t * Math.PI) * 14 + t * 40 + Math.sin(a) * 6 * t, 2.2, 'rgba(210,240,255,0.85)'); }
}
const CAVC: (HTMLCanvasElement | null)[] = [];
function caveArt(i: number, font: string): HTMLCanvasElement | null {
  const ex = CAVC[i]; if (ex !== undefined) return ex;
  const r0 = mk(300, 170); if (!r0) { CAVC[i] = null; return null; }
  const [cv, x] = r0, R = mulberry(9001 + i * 77), D = DUNS[i];
  const pal = [['#8a7458', '#5a4630', '#2e2216', '#6a8a3a'], ['#b8b0a0', '#7a7464', '#3a3630', '#8aa070'], ['#6a4a44', '#3a2420', '#1a0c0a', '#a03a1a'], ['#a8a0c4', '#6a6490', '#2a2644', '#9a7ad0'], ['#7a3a2a', '#4a1a10', '#1a0604', '#ff6a1a'], ['#d0e6f4', '#7a9ab8', '#2a3a5a', '#a8e8ff'], ['#4e3e60', '#2a1a3a', '#0a0614', '#a050ff']][i] ?? ['#8a7458', '#5a4630', '#2e2216', '#6a8a3a'], th = D?.th ?? 0, hot = i === 2 || i === 4;
  const cx = 150, by = 150;
  x.fillStyle = 'rgba(0,0,0,0.28)'; x.beginPath(); x.ellipse(cx, by - 4, 104, 16, 0, 0, TAU); x.fill();
  const rocks: [number, number, number, number][] = [];
  for (let k = 0; k < 26; k++) { const a = Math.PI + (k / 25) * Math.PI, rr = 0.6 + R() * 0.4; rocks.push([cx + Math.cos(a) * 84 * rr + (R() - 0.5) * 18, by - 8 + Math.sin(a) * 112 * rr * (0.7 + R() * 0.3), 16 + R() * 18, 12 + R() * 14]); }
  rocks.sort((a: [number, number, number, number], b: [number, number, number, number]) => a[1] - b[1]);
  for (const [rx, ry, w, h] of rocks) {
    const gr = x.createRadialGradient(rx - w * 0.35, ry - h * 0.45, 2, rx, ry, Math.max(w, h) * 1.15);
    gr.addColorStop(0, mix(pal[0] ?? '#888', '#ffffff', 0.25)); gr.addColorStop(0.55, pal[0] ?? '#888'); gr.addColorStop(1, pal[1] ?? '#444');
    x.fillStyle = gr; x.beginPath(); x.ellipse(rx, ry, w, h, (R() - 0.5) * 0.6, 0, TAU); x.fill(); x.strokeStyle = 'rgba(20,12,6,0.55)'; x.lineWidth = 1.2; x.stroke();
    if (R() < 0.5) { x.strokeStyle = 'rgba(20,12,6,0.35)'; x.beginPath(); x.moveTo(rx - w * 0.3, ry - h * 0.2); x.lineTo(rx + w * 0.1, ry + h * 0.1); x.lineTo(rx + w * 0.3, ry - h * 0.05); x.stroke(); }
    if (ry < by - 70 && R() < 0.6) { x.fillStyle = hot ? 'rgba(255,110,40,0.35)' : `${pal[3] ?? '#6a8a3a'}aa`; x.beginPath(); x.ellipse(rx, ry - h * 0.6, w * 0.7, h * 0.3, 0, 0, TAU); x.fill(); }
  }
  // cave mouth
  const mw = 34, mt = by - 74;
  const mouth = (): void => { x.beginPath(); x.moveTo(cx - mw, by - 4); x.bezierCurveTo(cx - mw - 4, mt + 10, cx - 16, mt - 6, cx, mt - 6); x.bezierCurveTo(cx + 16, mt - 6, cx + mw + 4, mt + 10, cx + mw, by - 4); x.closePath(); };
  mouth(); const mg = x.createRadialGradient(cx, by - 18, 4, cx, by - 30, 64); mg.addColorStop(0, hot ? '#3a0a04' : i === 5 ? '#0a1a30' : i === 6 || i === 3 ? '#1a0630' : '#060404'); mg.addColorStop(0.6, '#0a0806'); mg.addColorStop(1, pal[2] ?? '#222'); x.fillStyle = mg; x.fill();
  // frame stones
  for (let k = 0; k <= 10; k++) { const t = k / 10, a = Math.PI + t * Math.PI, sx = cx + Math.cos(a) * (mw + 5), sy = by - 4 + Math.sin(a) * (by - mt + 4) * (k === 0 || k === 10 ? 0.2 : 1); const gr = x.createLinearGradient(sx, sy - 8, sx, sy + 8); gr.addColorStop(0, mix(pal[0] ?? '#888', '#ffffff', 0.15)); gr.addColorStop(1, pal[1] ?? '#444'); x.fillStyle = gr; x.beginPath(); x.ellipse(sx, sy, 9, 7, a, 0, TAU); x.fill(); x.strokeStyle = 'rgba(15,10,5,0.6)'; x.stroke(); }
  // inner depth lines & steps
  x.strokeStyle = 'rgba(255,255,255,0.05)'; for (let k = 1; k < 4; k++) { x.beginPath(); x.ellipse(cx, by - 4, mw - k * 7, (by - mt) * (1 - k * 0.2), 0, Math.PI, TAU); x.stroke(); }
  for (let k = 0; k < 3; k++) { x.fillStyle = mix(pal[1] ?? '#444', '#000000', 0.2 + k * 0.2); x.fillRect(cx - 22 + k * 4, by - 10 - k * 6, 44 - k * 8, 6); }
  if (th === 1) for (const sx of [cx - mw - 14, cx + mw + 14]) { const gr = x.createLinearGradient(sx - 6, 0, sx + 6, 0); gr.addColorStop(0, '#e8e0d0'); gr.addColorStop(1, '#8a8476'); x.fillStyle = gr; x.fillRect(sx - 6, by - 70, 12, 66); x.fillStyle = '#d0c8b8'; x.fillRect(sx - 9, by - 76, 18, 7); }
  if (hot || i === 6) { x.fillStyle = '#e8e0d0'; for (const [sx, sy] of [[cx - 12, mt + 2], [cx + 12, mt + 2], [cx, mt - 2]] as [number, number][]) { x.beginPath(); x.moveTo(sx - 4, sy); x.lineTo(sx + 4, sy); x.lineTo(sx, sy + 12); x.closePath(); x.fill(); } }
  if (i >= 3) { const gc = ['', '', '', '200,140,255', '255,120,30', '140,220,255', '170,80,255'][i] ?? '255,255,255'; const gg = x.createRadialGradient(cx, by - 34, 4, cx, by - 34, 58); gg.addColorStop(0, `rgba(${gc},0.55)`); gg.addColorStop(1, `rgba(${gc},0)`); x.fillStyle = gg; x.fillRect(cx - 60, by - 96, 120, 96); for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI; x.fillStyle = `rgba(${gc},0.9)`; x.beginPath(); x.arc(cx + Math.cos(a) * (mw + 13), by - 4 + Math.sin(a) * (by - mt + 12), 2.2, 0, TAU); x.fill(); } }
  // sign
  const sx0 = cx + 98, sy0 = by - 30;
  x.fillStyle = '#5a3a1a'; x.fillRect(sx0 - 3, sy0, 6, 30); x.strokeStyle = '#2a1a08'; x.strokeRect(sx0 - 3, sy0, 6, 30);
  const sw = Math.max(70, (D?.n.length ?? 4) * 15 + 16), gb = x.createLinearGradient(0, sy0 - 22, 0, sy0 + 4); gb.addColorStop(0, '#a87a44'); gb.addColorStop(1, '#6a4420');
  x.fillStyle = gb; x.beginPath(); x.roundRect(sx0 - sw / 2, sy0 - 22, sw, 24, 4); x.fill(); x.strokeStyle = '#2a1a08'; x.lineWidth = 2; x.stroke();
  x.fillStyle = '#c89a5a'; for (const nx of [sx0 - sw / 2 + 5, sx0 + sw / 2 - 5]) { x.beginPath(); x.arc(nx, sy0 - 10, 1.6, 0, TAU); x.fill(); }
  label(x, D?.n ?? '', sx0, sy0 - 6, '#ffe8b0', 13, font, 'center');
  CAVC[i] = cv; return cv;
}
function drawCave(ctx: CanvasRenderingContext2D, i: number, e: Pt, time: number, font: string): void {
  const im = caveArt(i, font), ox = e.x - 150, oy = e.y + 14 - 150;
  if (im) ctx.drawImage(im, ox, oy);
  for (const tx of [-48, 48]) {
    const fx = e.x + tx, fy = e.y - 34, fl = Math.sin(time * 11 + tx) * 1.5 + Math.sin(time * 17 + tx * 2);
    const gl = ctx.createRadialGradient(fx, fy - 6, 2, fx, fy - 6, 46 + fl * 2); gl.addColorStop(0, 'rgba(255,190,90,0.38)'); gl.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = gl; ctx.fillRect(fx - 50, fy - 56, 100, 100);
    ctx.fillStyle = '#4a2e14'; ctx.fillRect(fx - 2.5, fy, 5, 26); ctx.fillStyle = '#2a1a0a'; ctx.fillRect(fx - 5, fy - 2, 10, 5);
    ctx.fillStyle = '#ff7a1a'; ctx.beginPath(); ctx.moveTo(fx - 5, fy - 1); ctx.quadraticCurveTo(fx - 6, fy - 10, fx + fl * 0.6, fy - 17 - fl); ctx.quadraticCurveTo(fx + 6, fy - 10, fx + 5, fy - 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe070'; ctx.beginPath(); ctx.moveTo(fx - 2.5, fy - 1); ctx.quadraticCurveTo(fx - 3, fy - 6, fx + fl * 0.3, fy - 11 - fl * 0.6); ctx.quadraticCurveTo(fx + 3, fy - 6, fx + 2.5, fy - 1); ctx.closePath(); ctx.fill();
  }
}
function drawTele(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.5);
  ctx.strokeStyle = `rgba(120,190,255,${0.55 + Math.sin(time * 3) * 0.2})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 23, 0, TAU); ctx.stroke();
  ctx.rotate(time * 0.6); ctx.beginPath();
  for (let i = 0; i < 6; i++) { const t = (i / 6) * TAU, t2 = ((i + 2) / 6) * TAU; ctx.moveTo(Math.cos(t) * 23, Math.sin(t) * 23); ctx.lineTo(Math.cos(t2) * 23, Math.sin(t2) * 23); }
  ctx.stroke(); ctx.restore();
  for (let i = 0; i < 4; i++) { const t = (time * 0.7 + i / 4) % 1; circ(ctx, x + Math.sin(i * 2.3 + time) * 18, y - t * 40, 1.8, `rgba(160,210,255,${1 - t})`); }
}
function drawProp(ctx: CanvasRenderingContext2D, i: number, time: number): void {
  const pp = PROPS[i];
  if (!pp) return;
  if (pp.k === 5) { drawFountain(ctx, pp.x, pp.y, time); return; }
  if (pp.k >= 10 && pp.k < 20) { drawGate(ctx, pp.x, pp.y, pp.k - 10, time, 'sans-serif'); return; }
  const im = propImg(pp.k, pp.c);
  if (im) ctx.drawImage(im, pp.x - 32, pp.y - 68);
  if (pp.k === 0) ball(ctx, pp.x, pp.y - 50, 15 + Math.sin(time * 4 + pp.x) * 1.5, 'rgba(255,210,120,0.32)', 'rgba(255,210,120,0)');
}
const PLK: [string, string, string, number, number][] = [['#c07a3a', '#6a3a1a', '#5a3a22', 1, 1], ['#5a5a66', '#2a2a30', '#2a1a10', 0, 2], ['#6a3ab8', '#2a1260', '#e8e0d0', 3, 3], ['#8a7a4a', '#4a3a1a', '#7a5a3a', 1, 5], ['#f0ece0', '#b0a890', '#e8c050', 2, 6], ['#3a6ac0', '#1a2a70', '#c0d0ff', 2, 3], ['#8a2a2a', '#4a1010', '#d8d8d8', 5, 2], ['#d05a8a', '#7a2a4a', '#3a2010', 0, 0], ['#6a9a5a', '#3a5a2a', '#8a5a2a', 0, 0], ['#4a7ac0', '#2a3a70', '#e8c870', 0, 0], ['#9aa4b2', '#4a5260', '#3a2a1a', 4, 4], ['#7a5a3a', '#3a2a1a', '#2a2a2a', 2, 0], ['#a03a6a', '#5a1a3a', '#c0702a', 1, 0], ['#8a7a3a', '#4a3a1a', '#6a4a2a', 1, 5]];
interface NO { c0: string; c1: string; pa: string; hr: string; hat: number; bd: number; rb: number; pr: number; ap: string; lh: number; hc: string }
const NPO: NO[] = [
  { c0: '#c88a4a', c1: '#6a3a1a', pa: '#5a4a3a', hr: '#6a3a1e', hat: 1, bd: 0, rb: 0, pr: 1, ap: '#5a9a4a', lh: 0, hc: '#4a7a3a' },
  { c0: '#6a6a72', c1: '#2a2a30', pa: '#3a3028', hr: '#1e1612', hat: 10, bd: 1, rb: 0, pr: 2, ap: '#5a3a22', lh: 0, hc: '' },
  { c0: '#7a48c8', c1: '#2a1260', pa: '#2a1a40', hr: '#e8e0d0', hat: 3, bd: 2, rb: 1, pr: 3, ap: '', lh: 0, hc: '#4a2a9a' },
  { c0: '#9a8a5a', c1: '#4a3a1a', pa: '#4a3a2a', hr: '#7a5a3a', hat: 1, bd: 1, rb: 0, pr: 8, ap: '', lh: 0, hc: '#5a4a2a' },
  { c0: '#f4f0e4', c1: '#a8a088', pa: '#d8d0c0', hr: '#e8c050', hat: 5, bd: 0, rb: 1, pr: 12, ap: '', lh: 1, hc: '#e8c050' },
  { c0: '#4a7ad0', c1: '#1a2a70', pa: '#1a2a50', hr: '#c0d0ff', hat: 2, bd: 0, rb: 1, pr: 3, ap: '', lh: 1, hc: '#2a4aa0' },
  { c0: '#9a3030', c1: '#4a1010', pa: '#3a2a22', hr: '#e8e8e8', hat: 0, bd: 2, rb: 1, pr: 4, ap: '', lh: 0, hc: '' },
  { c0: '#e06a98', c1: '#7a2a4a', pa: '#5a2a3a', hr: '#4a2a14', hat: 5, bd: 0, rb: 1, pr: 10, ap: '', lh: 1, hc: '#ffd860' },
  { c0: '#6aa05a', c1: '#2e5a24', pa: '#4a3a2a', hr: '#8a5a2a', hat: 6, bd: 0, rb: 0, pr: 2, ap: '#8a6a3a', lh: 0, hc: '#c04030' },
  { c0: '#4a7ac0', c1: '#2a3a70', pa: '#2a2a3a', hr: '#e8c870', hat: 0, bd: 0, rb: 0, pr: 0, ap: '', lh: 0, hc: '' },
  { c0: '#a8b2c0', c1: '#4a5260', pa: '#3a3e48', hr: '#3a2a1a', hat: 4, bd: 0, rb: 0, pr: 5, ap: '', lh: 0, hc: '#c03030' },
  { c0: '#7a6a4a', c1: '#3a2a1a', pa: '#3a3028', hr: '#2a2a2a', hat: 2, bd: 1, rb: 0, pr: 4, ap: '', lh: 0, hc: '#5a4a3a' },
  { c0: '#a83a6a', c1: '#5a1a3a', pa: '#3a2a4a', hr: '#c0702a', hat: 7, bd: 0, rb: 0, pr: 6, ap: '', lh: 0, hc: '#6a2a8a' },
  { c0: '#8a7a3a', c1: '#4a3a1a', pa: '#4a4038', hr: '#6a4a2a', hat: 8, bd: 1, rb: 0, pr: 7, ap: '', lh: 0, hc: '#e0c060' },
  { c0: '#6a3a9a', c1: '#2a1050', pa: '#3a2a4a', hr: '#2a1a10', hat: 11, bd: 1, rb: 1, pr: 13, ap: '#c8a040', lh: 0, hc: '#f0e0b0' },
];
function paintNpc(c: CanvasRenderingContext2D, li: number, pose: number, fr: number): void {
  const o = NPO[li] ?? (NPO[8] as NO), walk = pose === 1, ph = (fr / 8) * TAU, s = walk ? Math.sin(ph) : 0, br = pose === 0 ? Math.sin((fr / 4) * TAU) : 0;
  const by = walk ? -(1 - Math.abs(s)) * 1.3 : 0, S0 = '#f8dcc0', S1 = '#c48a66', trim = '#e8c050';
  const fx = 0.55, wf = 0.86, tx = walk ? 0.6 : 0, hipY = -23 + by, shY = -40 + by - br * 0.35, hy = -49.5 + by - br * 0.25, hx = tx * 1.15 + fx * 1.4;
  const tw = 8.4 * wf, ww = 6.2 * wf, armd = o.hat === 4;
  const leg = (sg: number, p2: number, far: boolean): void => {
    const sw = walk ? Math.sin(p2) : 0, lift = walk ? Math.max(0, Math.cos(p2)) * 3.2 : 0, hx2 = tx * 0.4 + sg * 3.1 * wf;
    const fxp = hx2 + sw * 7 * fx + (walk ? 0 : sg * 0.5), fy = -1 - lift * 0.8, kx = (hx2 + fxp) / 2 + 1 + lift * 0.6, ky = (hipY + fy) / 2 - lift * 0.5, d = far ? 0.28 : 0;
    hl(c, hx2, hipY + 1, kx, ky, 5.3, mix(o.pa, '#ffffff', 0.16 - d * 0.3), mix(o.pa, '#000000', d));
    hl(c, kx, ky, fxp, fy - 2.5, 4.7, mix(o.pa, '#ffffff', 0.08 - d * 0.3), mix(o.pa, '#000000', d + 0.1));
    if (armd) { hl(c, kx, ky + 1, fxp, fy - 3, 5.4, mix(o.c0, '#000000', d), mix(o.c1, '#000000', d)); ball(c, kx, ky, 2.4, mix(o.c0, '#ffffff', 0.3), o.c1, OL); }
    else hl(c, kx + (fxp - kx) * 0.45, ky + (fy - ky) * 0.45, fxp, fy - 2.8, 5, mix('#6a4224', '#000000', d), mix('#2e1a0c', '#000000', d));
    shape(c, [fxp - 2.6, fy - 2.4, fxp + 4.4, fy - 1.8, fxp + 4.8, fy + 0.6, fxp - 2.8, fy + 0.6], lg(c, 0, fy - 3, 0, fy + 1, far ? '#3a2a1a' : '#6a4224', '#1e1208'), OL, 1);
  };
  const shx = (sg: number): number => tx + sg * tw * 0.86;
  const armA = (sg: number): [number, number] => {
    if (o.pr === 6 && sg > 0) return [0.5, 1.9];
    if (sg > 0 && o.pr > 0) return [0.35 + (walk ? -s * 0.2 : br * 0.05), 1.35];
    return [(walk ? s * 0.55 * sg : 0.08 + br * 0.04) * 1, 0.3 + (walk ? s * 0.3 * sg : 0)];
  };
  const joint = (sg: number): [Pt, Pt, Pt] => {
    const [u, f] = armA(sg), s0 = { x: shx(sg), y: shY + 2 }, mo = sg * 1.2, mf = 0.7;
    const el = { x: s0.x + Math.sin(u) * 9 * mf + mo, y: s0.y + Math.cos(u) * 9 };
    return [s0, el, { x: el.x + Math.sin(u + f) * 8.5 * mf + mo * 0.5, y: el.y + Math.cos(u + f) * 8.5 }];
  };
  const arm = (j: [Pt, Pt, Pt], far: boolean): void => {
    const d = far ? 0.28 : 0, a0 = mix(o.c0, '#000000', d), a1 = mix(o.c1, '#000000', d);
    if (o.pr === 2 && o.hat === 10) { hl(c, j[0].x, j[0].y, j[1].x, j[1].y, 4.8, mix(S0, '#000000', d), mix(S1, '#000000', d)); hl(c, j[1].x, j[1].y, j[2].x, j[2].y, 4.6, mix(S0, '#000000', d), mix(S1, '#000000', d)); seg(c, j[1].x - 2, j[1].y + 3, j[1].x + 2.2, j[1].y + 4, '#3a2a1a', 1.6); }
    else { hl(c, j[0].x, j[0].y, j[1].x, j[1].y, o.rb ? 5.4 : 4.6, a0, a1); hl(c, j[1].x, j[1].y, j[2].x, j[2].y - (o.rb ? 1 : 0), o.rb ? 6.4 : 4.2, a0, a1); if (o.rb) seg(c, j[2].x - 3, j[2].y - 1.8, j[2].x + 3, j[2].y - 0.8, o.hc || trim, 1.3); }
    if (armd) ball(c, j[0].x, j[0].y, 4.6, mix(o.c0, '#ffffff', 0.35), mix(o.c1, '#000000', 0.2), OL);
    ball(c, j[2].x, j[2].y + 0.5, 2.2, mix(S0, '#000000', d), S1, OL);
  };
  const torso = (): void => {
    const L0 = tx - tw, R0 = tx + tw, cx = tx + fx * 2.4;
    if (o.rb) {
      const hw = 11.5 * wf, sw = s * 1.6;
      shape(c, [L0 + 0.5, shY, R0 - 0.5, shY, tx + hw + sw + fx * 2, -2.5, tx - hw + sw - fx * 1.5, -3], lg(c, L0, shY, R0, -3, mix(o.c0, '#ffffff', 0.2), mix(o.c1, '#000000', 0.2)), OL, 1.2);
      c.strokeStyle = mix(o.c1, '#000000', 0.45); c.lineWidth = 1;
      for (let i = -2; i <= 2; i++) { if (!i) continue; c.beginPath(); c.moveTo(tx + i * 1.8 * wf, hipY); c.quadraticCurveTo(tx + i * 3.2 * wf + sw, -12, tx + i * 4.8 * wf + sw * 1.4, -3); c.stroke(); }
      seg(c, tx - hw + sw - fx * 1.5 + 0.6, -4, tx + hw + sw + fx * 2 - 0.6, -3.6, o.hc || trim, 1.6);
      seg(c, cx, shY + 2, cx + sw * 0.8, -4, OL, 3.4); seg(c, cx, shY + 2, cx + sw * 0.8, -4, o.hc || trim, 1.8);
      shape(c, [cx - 3.6, shY - 0.5, cx + 3.6, shY - 0.5, cx, shY + 5.5], mix(o.c1, '#000000', 0.2), OL, 0.8);
      box(c, tx - ww - 0.5, hipY - 3.2, (ww + 0.5) * 2, 3, 1.2, lg(c, 0, hipY - 3, 0, hipY, mix(o.hc || trim, '#ffffff', 0.2), mix(o.hc || trim, '#000000', 0.4)), OL);
      if (o.pr === 12) { seg(c, cx, shY + 7, cx, shY + 15, '#ffe080', 1.8); seg(c, cx - 3, shY + 10, cx + 3, shY + 10, '#ffe080', 1.8); }
      return;
    }
    shape(c, [L0 + 0.5, shY, R0 - 0.5, shY, tx + ww + 0.8 + fx * 1.5, hipY - 1, tx - ww - 0.8 + fx * 0.4, hipY - 1], lg(c, L0, shY, R0, hipY, mix(o.c0, '#ffffff', 0.22), mix(o.c1, '#000000', 0.2)), OL, 1.2);
    if (armd) {
      c.strokeStyle = mix(o.c1, '#000000', 0.4); c.lineWidth = 0.9; c.beginPath(); c.moveTo(cx, shY + 1); c.lineTo(cx, hipY - 2); c.moveTo(L0 + 2, shY + 8); c.quadraticCurveTo(cx, shY + 12.5, R0 - 2, shY + 8); c.stroke();
      shape(c, [cx - 3.5, shY + 1, cx + 3.5, shY + 1, cx + 3, shY + 10, cx, shY + 13, cx - 3, shY + 10], o.hc, OL, 0.8);
      seg(c, cx - 2.6, shY + 5, cx + 2.6, shY + 5, '#ffe080', 1);
    } else {
      shape(c, [cx - 2.6, shY, cx + 2.6, shY, cx, shY + 5.5], S1, OL, 0.6);
      c.strokeStyle = mix(o.c1, '#000000', 0.3); c.lineWidth = 0.8; c.beginPath(); c.moveTo(cx, shY + 5.5); c.lineTo(cx + 0.4, hipY - 2); c.stroke();
      for (let i = 0; i < 3; i++) ball(c, cx + 0.6, shY + 8 + i * 3.6, 0.8, '#e8d8a0', '#7a6030');
    }
    shape(c, [tx - ww - 0.8, hipY - 1, tx + ww + 0.8, hipY - 1, tx + ww + 2.4 + s, hipY + 7, tx - ww - 2.4 + s, hipY + 7], lg(c, tx - ww, hipY, tx + ww, hipY + 7, mix(o.c0, '#000000', 0.05), mix(o.c1, '#000000', 0.3)), OL, 1);
    if (o.ap) { shape(c, [cx - 5, shY + 6, cx + 5.5, shY + 6, cx + 6.5 + s * 0.6, hipY + 9, cx - 5.5 + s * 0.6, hipY + 9], lg(c, cx - 5, 0, cx + 6, 0, mix(o.ap, '#ffffff', 0.2), mix(o.ap, '#000000', 0.3)), OL, 1); seg(c, cx - 4.4, shY + 6.4, shx(-1) + 1, shY + 1, o.ap, 1.2); box(c, cx - 2.5, hipY + 1, 5, 4, 1, mix(o.ap, '#000000', 0.25), OL); }
    box(c, tx - ww - 0.8, hipY - 3.2, (ww + 0.8) * 2, 3, 1, lg(c, 0, hipY - 3.2, 0, hipY, '#7a4e28', '#3a2210'), OL);
    box(c, cx - 1.6, hipY - 3.6, 3.2, 3.8, 0.8, lg(c, cx - 2, 0, cx + 2, 0, '#fff0a0', '#b08020'), OL);
    if (o.pr === 8) { ball(c, tx - ww - 0.5, hipY, 2.4, '#d8c060', '#6a5010', OL); for (const k of [-1, 1]) seg(c, tx - ww - 0.5, hipY + 2, tx - ww - 0.5 + k * 1.6, hipY + 6, '#c8b060', 1.1); }
  };
  const hair = (): void => {
    const hc = o.hr;
    if (o.hat === 10) return;
    c.beginPath(); c.moveTo(hx - 6, hy + (o.lh ? 9 : 1.5)); c.quadraticCurveTo(hx - 7.2, hy - 8.5, hx + fx, hy - 7.6); c.quadraticCurveTo(hx + 6.4, hy - 7, hx + 5.6 - fx * 0.5, hy - 1); c.lineTo(hx + 3 + fx, hy - 3.4); c.lineTo(hx - 2, hy - 2.6); c.lineTo(hx - 3.6, hy + (o.lh ? 10 : 2)); c.closePath();
    c.fillStyle = lg(c, 0, hy - 8, 0, hy + 6, mix(hc, '#ffffff', 0.3), mix(hc, '#000000', 0.35)); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
    if (o.lh) { c.beginPath(); c.moveTo(hx - 6, hy - 2); c.quadraticCurveTo(hx - 9.5, hy + 6 + s, hx - 6.5, hy + 13); c.lineTo(hx - 2.5, hy + 9); c.closePath(); c.fillStyle = mix(hc, '#000000', 0.15); c.fill(); c.stroke(); }
  };
  const hat = (): void => {
    const t = o.hat, hc = o.hc;
    if (t === 1) { c.beginPath(); c.ellipse(hx, hy - 4.2, 6.4, 4, 0, Math.PI, TAU); c.closePath(); c.fillStyle = lg(c, 0, hy - 8, 0, hy - 4, mix(hc, '#ffffff', 0.25), mix(hc, '#000000', 0.3)); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); shape(c, [hx + 2, hy - 4.6, hx + 9.5, hy - 3.6, hx + 2, hy - 2.8], mix(hc, '#000000', 0.25), OL, 0.8); }
    else if (t === 2) { c.beginPath(); c.moveTo(hx - 7.5, hy + 6 + s * 0.5); c.quadraticCurveTo(hx - 8.5, hy - 10, hx + fx, hy - 9); c.quadraticCurveTo(hx + 7.6, hy - 8, hx + 6.5 - fx, hy + 0.5); c.quadraticCurveTo(hx + 3, hy - 6, hx - 2, hy - 5); c.quadraticCurveTo(hx - 4.5, hy + 1, hx - 4.5, hy + 7); c.closePath(); c.fillStyle = lg(c, hx - 7, hy - 9, hx + 7, hy + 6, mix(hc, '#ffffff', 0.25), mix(hc, '#000000', 0.45)); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); }
    else if (t === 3) { shape(c, [hx - 10, hy - 3.5, hx + 10, hy - 3.5, hx + 5, hy - 7, hx + 2 - s, hy - 15, hx - 4 - s * 1.5, hy - 22, hx - 3, hy - 13, hx - 5.5, hy - 7], lg(c, hx - 10, hy - 20, hx + 10, hy, mix(o.c0, '#ffffff', 0.15), o.c1), OL, 1.1); seg(c, hx - 5.5, hy - 6.6, hx + 5.3, hy - 6.6, trim, 1.6); circ(c, hx - 1, hy - 11, 1.1, '#ffe080'); circ(c, hx + 2, hy - 8.8, 0.8, '#ffe080'); }
    else if (t === 4) { c.beginPath(); c.ellipse(hx, hy - 1.6, 6.4, 6.6, 0, Math.PI * 1.02, TAU * 0.99); c.closePath(); c.fillStyle = lg(c, hx - 6, hy - 8, hx + 6, hy, '#f2f6fa', '#5a6474'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke(); box(c, hx - 7, hy - 2.4, 14, 1.8, 0.8, '#8a96a6', OL); shape(c, [hx - 1, hy - 8, hx + 1, hy - 8, hx + 0.4 - s, hy - 13, hx - 4 - s * 2, hy - 12], hc, OL, 0.8); }
    else if (t === 5) { seg(c, hx - 5.6, hy - 4.6, hx + 5.6, hy - 4.8, OL, 2.6); seg(c, hx - 5.6, hy - 4.6, hx + 5.6, hy - 4.8, hc, 1.4); ball(c, hx + fx * 1.4, hy - 5, 1.3, '#ffffff', '#40a0ff', OL); }
    else if (t === 6) { c.beginPath(); c.ellipse(hx, hy - 3.4, 6.2, 4.4, 0, Math.PI, TAU); c.closePath(); c.fillStyle = lg(c, 0, hy - 8, 0, hy - 3, mix(hc, '#ffffff', 0.25), mix(hc, '#000000', 0.25)); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); shape(c, [hx - 6, hy - 3.6, hx - 10 - s, hy - 1 + s, hx - 9 - s, hy + 1.5], hc, OL, 0.8); for (let i = 0; i < 3; i++) circ(c, hx - 3 + i * 3, hy - 5.2, 0.7, '#ffffff'); }
    else if (t === 7) { c.beginPath(); c.ellipse(hx, hy - 4.6, 8.6, 2.4, -0.08, 0, TAU); c.fillStyle = mix(hc, '#000000', 0.2); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); c.beginPath(); c.ellipse(hx, hy - 6, 5.2, 3.6, 0, Math.PI, TAU); c.closePath(); c.fillStyle = hc; c.fill(); c.stroke(); c.beginPath(); c.moveTo(hx - 3, hy - 7); c.quadraticCurveTo(hx - 12, hy - 16 - s, hx - 14 - s, hy - 9); c.quadraticCurveTo(hx - 8, hy - 10, hx - 2, hy - 6); c.fillStyle = '#ffffff'; c.fill(); c.stroke(); }
    else if (t === 11) { c.beginPath(); c.ellipse(hx, hy - 4.2, 7.4, 5.6, 0, Math.PI * 0.92, TAU * 1.03); c.closePath(); c.fillStyle = lg(c, hx - 7, hy - 9, hx + 7, hy - 3, mix(hc, '#ffffff', 0.3), mix(hc, '#000000', 0.3)); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); for (const k of [0, 1, 2]) { c.beginPath(); c.ellipse(hx, hy - 4.8 + k * 1.6, 7, 2.2, -0.15, Math.PI * 1.05, TAU * 0.98); c.strokeStyle = mix(hc, '#000000', 0.35); c.lineWidth = 0.7; c.stroke(); } shape(c, [hx + fx * 1.5 + 2, hy - 8, hx + fx * 1.5 + 1, hy - 15 - s, hx + fx * 1.5 + 4, hy - 9], '#ffffff', OL, 0.7); ball(c, hx + fx * 1.5 + 2.4, hy - 7, 1.7, '#ffffff', '#e0304a', OL); }
    else if (t === 8) { c.beginPath(); c.ellipse(hx, hy - 4.4, 10.5, 2.8, -0.05, 0, TAU); c.fillStyle = lg(c, hx - 10, 0, hx + 10, 0, '#f0d880', '#a88a30'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); c.beginPath(); c.ellipse(hx, hy - 5.6, 5.6, 4.2, 0, Math.PI, TAU); c.closePath(); c.fillStyle = '#e0c060'; c.fill(); c.stroke(); seg(c, hx - 5.4, hy - 5.4, hx + 5.4, hy - 5.4, '#a03020', 1.2); }
  };
  const beard = (): void => {
    if (!o.bd) return;
    const L = o.bd === 2 ? 11 : 4.5, bc2 = o.bd === 2 ? '#f0f0f0' : mix(o.hr, '#000000', 0.1);
    const b0 = o.bd === 2 ? 1 : 2.6;
    c.beginPath(); c.moveTo(hx - 4.4, hy + b0); c.quadraticCurveTo(hx - 4, hy + L * 0.7, hx + fx * 2.2 + s * 0.3, hy + 4 + L); c.quadraticCurveTo(hx + 5, hy + L * 0.6, hx + 5, hy + b0); c.quadraticCurveTo(hx + 1, hy + b0 + 2.4, hx - 4.4, hy + b0); c.closePath();
    c.fillStyle = lg(c, 0, hy, 0, hy + 4 + L, mix(bc2, '#ffffff', 0.2), mix(bc2, '#000000', 0.3)); c.fill(); c.strokeStyle = OL; c.lineWidth = 0.9; c.stroke();
    if (o.bd === 2) seg(c, hx - 1.5 + fx * 2.4, hy + 3.2, hx + 2.6 + fx * 2.4, hy + 3.2, mix(bc2, '#000000', 0.4), 0.8);
  };
  const head = (): void => {
    if (o.hat === 2) { c.beginPath(); c.ellipse(hx - 1, hy + 1, 7.6, 8.2, 0, 0, TAU); c.fillStyle = mix(o.hc, '#000000', 0.4); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); }
    hl(c, tx * 0.8 + fx * 0.6, shY + 0.5, hx, hy + 4.5, 3.2, S0, S1);
    c.beginPath(); c.ellipse(hx, hy, 5.2, 6, 0, 0, TAU); c.fillStyle = lg(c, hx - 5, hy - 6, hx + 5, hy + 6, S0, S1); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke();
    ball(c, hx - 4.6, hy + 0.6, 1.5, S0, S1, OL);
    for (const ex of [hx - 1.9 + fx * 2.2, hx + 1.9 + fx * 1.5]) { c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(ex, hy + 0.4, 1.05, 0.85, 0, 0, TAU); c.fill(); c.fillStyle = '#2a2a3a'; c.beginPath(); c.ellipse(ex + 0.3, hy + 0.5, 0.6, 0.7, 0, 0, TAU); c.fill(); seg(c, ex - 1.1, hy - 1.3, ex + 1.1, hy - 1.5, mix(o.hr, '#000000', 0.3), 0.8); }
    seg(c, hx + fx * 2.4, hy + 1.6, hx + fx * 2.6 + 0.5, hy + 2.7, S1, 0.8);
    seg(c, hx - 1 + fx * 2.4, hy + 3.9, hx + 1.1 + fx * 2.6, hy + 3.8, '#a8605a', 0.8);
    if (o.lh || o.pr === 10) { ball(c, hx - 2.8 + fx * 2, hy + 2.4, 1, 'rgba(255,140,140,0.5)', 'rgba(255,140,140,0)'); }
    hair(); beard(); hat();
  };
  const prop = (hd: Pt): void => {
    const p = o.pr;
    if (p === 1) { c.beginPath(); c.ellipse(hd.x + 1, hd.y + 6, 6.5, 2.4, 0, 0, TAU); c.fillStyle = '#5a3a1a'; c.fill(); box(c, hd.x - 5, hd.y + 2, 12, 8, 2.5, lg(c, 0, hd.y + 2, 0, hd.y + 10, '#d8a860', '#7a5020'), OL); for (let i = 0; i < 3; i++) seg(c, hd.x - 4, hd.y + 4.5 + i * 2, hd.x + 6, hd.y + 4.5 + i * 2, '#8a6020', 0.7); ball(c, hd.x - 1.5, hd.y + 1.5, 2.2, '#ff5040', '#a01010', OL); ball(c, hd.x + 2.5, hd.y + 1.2, 2, '#ffd040', '#c08010', OL); c.strokeStyle = OL; c.lineWidth = 2.2; c.beginPath(); c.arc(hd.x + 1, hd.y + 2, 5.5, Math.PI, TAU); c.stroke(); c.strokeStyle = '#a87a3a'; c.lineWidth = 1.1; c.stroke(); }
    else if (p === 2) { const a = walk ? 0.2 : -0.1 + br * 0.15; c.save(); c.translate(hd.x, hd.y); c.rotate(a); seg(c, 0, 4, 0, -14, OL, 3.6); seg(c, 0, 4, 0, -14, '#7a5030', 2.2); box(c, -6, -19, 12, 6, 1.5, lg(c, 0, -19, 0, -13, '#e4e8ee', '#5a626e'), OL); seg(c, -5, -18, 5, -18, 'rgba(255,255,255,0.6)', 0.8); c.restore(); }
    else if (p === 3 || p === 12 || p === 4 || p === 5 || p === 7 || p === 11) {
      const top = p === 4 ? -12 : -26, bot = p === 4 ? 24 : 16, col = p === 5 || p === 7 ? '#8a6a3a' : p === 4 ? '#6a4224' : '#6a4224';
      seg(c, hd.x, hd.y + bot, hd.x, hd.y + top, OL, 4); seg(c, hd.x, hd.y + bot, hd.x, hd.y + top, col, 2.4); seg(c, hd.x - 0.6, hd.y + bot, hd.x - 0.6, hd.y + top, mix(col, '#ffffff', 0.35), 0.8);
      if (p === 3 || p === 12) { const oc = p === 12 ? '#fff4b0' : o.c0, pl = 1 + br * 0.12; for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(hd.x, hd.y + top); c.quadraticCurveTo(hd.x + sg * 6, hd.y + top - 2, hd.x + sg * 3, hd.y + top - 8); c.strokeStyle = OL; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = trim; c.lineWidth = 1.3; c.stroke(); } ball(c, hd.x, hd.y + top - 5, 8 * pl, oc + '66', 'rgba(0,0,0,0)'); ball(c, hd.x, hd.y + top - 5, 3.8, '#ffffff', oc, OL); }
      else if (p === 4) { c.strokeStyle = OL; c.lineWidth = 4; c.beginPath(); c.arc(hd.x - 3, hd.y + top, 3, -Math.PI, 0); c.stroke(); c.strokeStyle = col; c.lineWidth = 2.2; c.stroke(); }
      else if (p === 5) { shape(c, [hd.x, hd.y + top - 9, hd.x - 2.6, hd.y + top, hd.x + 2.6, hd.y + top], lg(c, hd.x - 3, 0, hd.x + 3, 0, '#f2f6fa', '#6a7480'), OL, 1); shape(c, [hd.x - 2.2, hd.y + top + 1, hd.x + 2.2, hd.y + top + 1, hd.x + 1 - s, hd.y + top + 6, hd.x - 3 - s, hd.y + top + 4], '#c03030', OL, 0.6); }
      else if (p === 7) { for (const k of [-3, 0, 3]) { seg(c, hd.x + k, hd.y + top + 2, hd.x + k, hd.y + top - 6, OL, 2.2); seg(c, hd.x + k, hd.y + top + 2, hd.x + k, hd.y + top - 6, '#c8ccd2', 1.1); } seg(c, hd.x - 3.5, hd.y + top + 2, hd.x + 3.5, hd.y + top + 2, '#9aa0a8', 1.6); }
    }
    else if (p === 6) { c.save(); c.translate(hd.x - 3, hd.y - 2); c.rotate(-0.7); c.beginPath(); c.ellipse(0, 4, 5, 6.4, 0, 0, TAU); c.fillStyle = lg(c, -5, 0, 5, 0, '#d89a50', '#7a4a1a'); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); circ(c, 0, 3, 1.6, '#2a1608'); box(c, -1.2, -13, 2.4, 12, 0.8, '#5a3418', OL); for (const k of [-0.5, 0.5]) seg(c, k, -12, k, 9, 'rgba(255,255,240,0.8)', 0.4); c.restore(); }
    else if (p === 8) { box(c, hd.x - 4, hd.y - 2, 8, 10, 1, lg(c, hd.x - 4, 0, hd.x + 4, 0, '#8a3a2a', '#4a1a10'), OL); box(c, hd.x - 3, hd.y - 1, 6.4, 8, 0.6, '#f4ecd8'); seg(c, hd.x - 2, hd.y + 1.5, hd.x + 2.4, hd.y + 1.5, '#8a8070', 0.6); seg(c, hd.x - 2, hd.y + 3.5, hd.x + 2.4, hd.y + 3.5, '#8a8070', 0.6); }
    else if (p === 13) { ball(c, hd.x + 1, hd.y - 5, 8, 'rgba(140,220,255,0.6)', 'rgba(140,220,255,0)'); shape(c, [hd.x - 4, hd.y - 5, hd.x - 2, hd.y - 8.5, hd.x + 4, hd.y - 8.5, hd.x + 6, hd.y - 5, hd.x + 1, hd.y + 1.5], lg(c, hd.x - 4, hd.y - 8, hd.x + 6, hd.y, '#ffffff', '#3aa8ff'), OL, 0.9); seg(c, hd.x - 4, hd.y - 5, hd.x + 6, hd.y - 5, '#2a80c0', 0.6); seg(c, hd.x + 1, hd.y - 8.5, hd.x + 1, hd.y + 1, 'rgba(255,255,255,0.6)', 0.6); circ(c, hd.x - 1.4, hd.y - 7, 0.9, '#ffffff'); ball(c, tx + ww * 0.6, hipY + 3, 2.8, '#c89a40', '#6a4a10', OL); }
    else if (p === 10) { box(c, hd.x - 5, hd.y - 1, 10, 6.5, 1.5, lg(c, 0, hd.y - 1, 0, hd.y + 6, '#c03060', '#5a1030'), OL); seg(c, hd.x - 5, hd.y + 1.4, hd.x + 5, hd.y + 1.4, trim, 1); ball(c, hd.x - 2, hd.y - 1.5, 1.4, '#ffffff', '#40c0ff', OL); ball(c, hd.x + 1.6, hd.y - 1.6, 1.4, '#ffffff', '#ff60a0', OL); }
  };
  const nj = joint(1), fj = joint(-1);
  arm(fj, true);
  leg(-1, ph, true); leg(1, ph + Math.PI, false);
  torso(); head();
  if (o.pr === 6) { arm(nj, false); prop(nj[2]); ball(c, nj[2].x, nj[2].y + 0.5, 2.2, S0, S1, OL); }
  else { if (o.pr === 3 || o.pr === 12 || o.pr === 5 || o.pr === 7 || o.pr === 4) prop(nj[2]); arm(nj, false); if (!(o.pr === 3 || o.pr === 12 || o.pr === 5 || o.pr === 7 || o.pr === 4)) prop(nj[2]); else ball(c, nj[2].x, nj[2].y + 0.5, 2.2, S0, S1, OL); }
}
const NSPR = new Map<string, HTMLCanvasElement>();
function npcFrame(li: number, pose: number, fr: number): HTMLCanvasElement | null {
  const key = `${li}|${pose}|${fr}`, got = NSPR.get(key);
  if (got) return got;
  const m0 = mk(Math.ceil(HW * HS), Math.ceil(HH * HS));
  if (!m0) return null;
  m0[1].setTransform(HS, 0, 0, HS, HOX * HS, HOY * HS);
  try { paintNpc(m0[1], li, pose, fr); heroFinish(m0[0]); } catch { return null; }
  NSPR.set(key, m0[0]);
  return m0[0];
}
function drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, li: number, face: number, walk: number, moving: boolean, time: number): void {
  const pose = moving ? 1 : 0, fr = moving ? ((Math.floor(((walk * 12) / TAU) * 8) % 8) + 8) % 8 : Math.floor(time * 2.2 + x * 0.013) % 4;
  const cv = npcFrame(li, pose, fr);
  if (!cv) { drawPersonOld(ctx, x, y, li, face, walk, moving, time); return; }
  const sc = li === 9 ? 0.82 : 1, dir = Math.cos(face) < 0 ? -1 : 1;
  shadow(ctx, x, y, 14 * sc);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * sc, sc); ctx.drawImage(cv, -HOX, -HOY, HW, HH); ctx.restore();
}
function drawPersonOld(ctx: CanvasRenderingContext2D, x: number, y: number, li: number, face: number, walk: number, moving: boolean, time: number): void {
  const L = PLK[li] ?? PLK[8];
  if (!L) return;
  const [c0, c1, hair, hat, ex] = L, sc = li === 9 ? 0.78 : 1, dir = Math.cos(face) < 0 ? -1 : 1;
  const ph = walk * 10, st = moving ? Math.sin(ph) : 0, bob = moving ? -Math.abs(Math.cos(ph)) * 1.4 : Math.sin(time * 2 + x) * 0.5;
  shadow(ctx, x, y, 11 * sc);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * sc, sc);
  const robe = ex === 6 || ex === 3;
  if (!robe) { box(ctx, -4.5 - st * 2, -10, 4.2, 10, 2, c1, OL); box(ctx, 0.5 + st * 2, -10, 4.2, 10, 2, c1, OL); }
  if (robe) shape(ctx, [-6, -22 + bob, 6, -22 + bob, 9 + st, 0, -9 + st, 0], lg(ctx, -8, 0, 9, 0, c0, c1), OL);
  else box(ctx, -6.5, -22 + bob, 13, 13, 4, lg(ctx, -6, 0, 7, 0, c0, c1), OL);
  if (ex === 1) shape(ctx, [-5, -16 + bob, 5, -16 + bob, 5.5, -4, -5.5, -4], li === 1 ? '#3a3028' : '#f0e8d8', OL, 1);
  box(ctx, -6.5, -12 + bob, 13, 2.2, 1, '#3a2a1a');
  const sw = moving ? st * 0.5 : Math.sin(time * 1.5 + x) * 0.1;
  ctx.save(); ctx.translate(-5, -20 + bob); ctx.rotate(sw); box(ctx, -2, -1, 4, 10, 2, c1, OL); ball(ctx, 0, 10, 2.2, '#f8d8b6', '#d49c74', OL); ctx.restore();
  const hy = -28 + bob;
  ball(ctx, 0, hy, 6.4, '#f8d8b6', '#d49c74', OL);
  ctx.beginPath(); ctx.arc(0, hy - 0.5, 6.8, Math.PI * 0.9, Math.PI * 2.1); ctx.closePath(); ctx.fillStyle = hair; ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#1a1410'; ctx.fillRect(2.5, hy - 0.5, 1.6, 2);
  if (ex === 2) shape(ctx, [-3, hy + 2, 6, hy + 2, 3, hy + 10, -1, hy + 8], li === 1 ? '#5a4a3a' : '#e8e8e8', OL, 1);
  if (hat === 1) { box(ctx, -7, hy - 7, 14, 4, 2, c1, OL); box(ctx, -1, hy - 6, 9, 2, 1, c1); }
  else if (hat === 2) { ctx.beginPath(); ctx.arc(0, hy, 8, Math.PI * 0.8, Math.PI * 2.2); ctx.closePath(); ctx.fillStyle = c0; ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.2; ctx.stroke(); ball(ctx, 0.5, hy + 0.5, 5.2, '#f8d8b6', '#d49c74'); ctx.fillStyle = '#1a1410'; ctx.fillRect(2.5, hy - 0.5, 1.6, 2); }
  else if (hat === 3) { shape(ctx, [-10, hy - 3, 10, hy - 3, 4, hy - 7, 1, hy - 21, -3, hy - 18, -5, hy - 7], lg(ctx, -10, 0, 10, 0, c0, c1), OL); ctx.fillStyle = '#e8c050'; ctx.fillRect(-5, hy - 7.5, 10, 2); }
  else if (hat === 4) { ctx.beginPath(); ctx.arc(0, hy - 0.5, 7.4, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = lg(ctx, -7, 0, 7, 0, '#eef2f6', '#7a8696'); ctx.fill(); ctx.strokeStyle = OL; ctx.stroke(); }
  else if (hat === 5) { ctx.fillStyle = '#e8c050'; ctx.fillRect(-6, hy - 6, 12, 2); ball(ctx, 0, hy - 6, 1.6, '#ff6060', '#a01010'); }
  ctx.save(); ctx.translate(5, -20 + bob); ctx.rotate(-sw);
  box(ctx, -2, -1, 4, 10, 2, c0, OL); ball(ctx, 0, 10, 2.2, '#f8d8b6', '#d49c74', OL);
  if (ex === 3) { seg(ctx, 0, 18, 0, -16, OL, 3.5); seg(ctx, 0, 18, 0, -16, '#8a5c34', 2); ball(ctx, 0, -18, 3.5, '#ffffff', li === 5 ? '#60a0ff' : '#c080ff', OL); }
  if (ex === 4) { seg(ctx, 0, 16, 0, -24, OL, 3); seg(ctx, 0, 16, 0, -24, '#8a6a3a', 1.6); shape(ctx, [0, -32, -3, -23, 3, -23], '#e0e6ee', OL, 1); }
  if (ex === 5) { box(ctx, -5, 8, 10, 7, 2, '#c8a060', OL); ball(ctx, -2, 8, 2, '#ff5040', '#a01010'); ball(ctx, 2, 8, 2, '#ffd040', '#c08010'); }
  ctx.restore();
  ctx.restore();
}
function bubble(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, font: string): void {
  ctx.font = `600 11px ${font}`;
  const w = Math.min(230, ctx.measureText(s).width + 16);
  box(ctx, x - w / 2, y - 11, w, 21, 8, 'rgba(255,255,255,0.93)', OL);
  shape(ctx, [x - 4, y + 9, x + 4, y + 9, x, y + 15], 'rgba(255,255,255,0.93)');
  ctx.fillStyle = '#1a1a22'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y - 0.5, w - 10);
}
let STATC: HTMLCanvasElement | null = null;
function drawStatue(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  if (!STATC) {
    const r = mk(200, 260); if (!r) return; const [cv, c] = r, cx = 100, by = 236;
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(cx, by + 4, 70, 14, 0, 0, TAU); c.fill();
    for (const [w, h, y0, c0, c1] of [[132, 16, by - 16, '#b8b4aa', '#6e6a62'], [112, 40, by - 56, '#d4d0c6', '#8a867c'], [124, 12, by - 66, '#c8c4ba', '#7a766e']] as [number, number, number, string, string][]) box(c, cx - w / 2, y0, w, h, 3, lg(c, cx - w / 2, 0, cx + w / 2, 0, c0, c1), OL);
    c.strokeStyle = '#c8a040'; c.lineWidth = 2; c.strokeRect(cx - 52, by - 52, 104, 32);
    c.fillStyle = '#3a2a10'; c.font = 'bold 15px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('英 雄 榜', cx, by - 36);
    { const st0 = '#ece8dc', st1 = '#a8a498', st2 = '#5e5a52', fy = by - 66, S = (pts: number[], a: string, b: string): void => { let mnx = 1e9, mxx = -1e9; for (let q = 0; q < pts.length; q += 2) { mnx = Math.min(mnx, pts[q] ?? 0); mxx = Math.max(mxx, pts[q] ?? 0); } shape(c, pts, lg(c, mnx, 0, mxx, 0, a, b), OL, 1.6); };
      S([cx - 30, fy, cx - 26, fy - 70, cx - 14, fy - 92, cx + 16, fy - 92, cx + 30, fy - 60, cx + 34, fy], st1, st2);
      S([cx - 16, fy, cx - 14, fy - 34, cx - 3, fy - 34, cx - 2, fy], st0, st1); S([cx + 2, fy, cx + 3, fy - 34, cx + 14, fy - 34, cx + 17, fy], st1, st2);
      box(c, cx - 19, fy - 8, 17, 8, 2, st1, OL); box(c, cx + 1, fy - 8, 18, 8, 2, st2, OL);
      S([cx - 18, fy - 32, cx - 20, fy - 74, cx - 8, fy - 82, cx + 9, fy - 82, cx + 20, fy - 74, cx + 18, fy - 32], st0, st2);
      box(c, cx - 20, fy - 40, 40, 7, 2, st1, OL); ball(c, cx, fy - 37, 3.2, '#ffffff', st1, OL);
      for (const sx of [-1, 1]) ball(c, cx + sx * 20, fy - 76, 9, st0, st2, OL);
      S([cx - 22, fy - 72, cx - 30, fy - 50, cx - 26, fy - 44, cx - 16, fy - 66], st0, st1);
      S([cx + 20, fy - 74, cx + 34, fy - 98, cx + 40, fy - 94, cx + 26, fy - 68], st0, st2);
      c.save(); c.translate(cx + 38, fy - 100); c.rotate(-0.35); shape(c, [-3.5, 4, -3.5, -62, 0, -72, 3.5, -62, 3.5, 4], lg(c, -4, 0, 4, 0, '#ffffff', st1), OL, 1.4); box(c, -12, 2, 24, 6, 2, st1, OL); box(c, -2.5, 8, 5, 12, 1, st2, OL); ball(c, 0, 22, 3.6, st0, st2, OL); c.restore();
      c.save(); c.translate(cx - 30, fy - 52); shape(c, [-14, -18, 14, -18, 14, 4, 0, 20, -14, 4], lg(c, -14, -18, 14, 20, st0, st2), OL, 1.6); shape(c, [-2, -14, 2, -14, 2, -2, 10, -2, 10, 2, 2, 2, 2, 14, -2, 14, -2, 2, -10, 2, -10, -2, -2, -2], 'rgba(200,160,60,0.85)'); c.restore();
      ball(c, cx, fy - 94, 13, st0, st2, OL); shape(c, [cx - 13, fy - 96, cx - 12, fy - 108, cx, fy - 114, cx + 12, fy - 108, cx + 13, fy - 96], lg(c, cx - 13, 0, cx + 13, 0, st0, st1), OL, 1.4);
      box(c, cx - 10, fy - 96, 20, 3, 1, st2); shape(c, [cx, fy - 114, cx + 4, fy - 128, cx + 14, fy - 132, cx + 6, fy - 116], lg(c, cx, fy - 132, cx, fy - 114, '#ffffff', st1), OL, 1.2);
      c.globalCompositeOperation = 'source-atop'; const hl = c.createLinearGradient(cx - 40, fy - 130, cx + 40, fy); hl.addColorStop(0, 'rgba(255,250,230,0.25)'); hl.addColorStop(1, 'rgba(40,30,20,0.25)'); c.fillStyle = hl; c.fillRect(cx - 60, fy - 140, 120, 140); c.globalCompositeOperation = 'source-over'; }
    for (const [px, ccol] of [[-46, '#ffd860'], [46, '#a8ecff']] as [number, string][]) { box(c, cx + px - 9, by - 96, 18, 30, 2, lg(c, 0, by - 96, 0, by - 66, '#8a6a3a', '#4a3418'), OL); ball(c, cx + px, by - 102, 6, '#ffffff', ccol, OL); }
    STATC = cv;
  }
  ctx.drawImage(STATC, x - 100, y - 236 + 10);
  const gl = ctx.createRadialGradient(x, y - 120, 4, x, y - 120, 60); gl.addColorStop(0, `rgba(255,230,140,${0.18 + Math.sin(time * 2) * 0.06})`); gl.addColorStop(1, 'rgba(255,230,140,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 60, y - 180, 120, 120);
  for (let i = 0; i < 3; i++) { const t = (time * 0.4 + i / 3) % 1; circ(ctx, x + Math.sin(i * 2.1 + time) * 30, y - 60 - t * 90, 1.6, `rgba(255,230,140,${1 - t})`); }
}
function drawNpcI(ctx: CanvasRenderingContext2D, i: number, font: string, time: number): void {
  const n = NPCS[i];
  if (!n) return;
  if (n.k === 13) { drawStatue(ctx, n.x, n.y, time); label(ctx, n.n, n.x, n.y - 206, '#ffe08a', 12, font, 'center'); label(ctx, '▼', n.x, n.y - 220 + Math.sin(time * 3) * 2, '#ffe060', 9, font, 'center'); return; }
  drawPerson(ctx, n.x, n.y, n.lk, 0.4, 0, false, time);
  label(ctx, n.n, n.x, n.y - 66, '#a0ffa0', 11, font, 'center');
  if (n.k === 6 && QRT.indexOf(n.t) >= 0) {
    const by = n.y - 90 + Math.sin(time * 4) * 3;
    ball(ctx, n.x, by, 15, 'rgba(255,230,90,0.55)', 'rgba(255,200,40,0)');
    label(ctx, '？', n.x, by, '#ffe040', 20, font, 'center');
    label(ctx, '回報任務', n.x, n.y - 110 + Math.sin(time * 4) * 3, '#80ffa0', 10, font, 'center');
  } else label(ctx, '▼', n.x, n.y - 78 + Math.sin(time * 3 + i) * 2, '#ffe060', 9, font, 'center');
}
function drawFolkI(ctx: CanvasRenderingContext2D, g: G, i: number, font: string): void {
  const f = g.folk[i];
  if (!f) return;
  drawPerson(ctx, f.x, f.y, f.lk, f.face, f.walk, f.mv, g.time);
  label(ctx, f.n, f.x, f.y - 64, '#dfe6f0', 10, font, 'center');
  if (f.sayT > 0) bubble(ctx, f.say, f.x, f.y - 82, font);
}
function mkFolk(): Folk[] {
  const out: Folk[] = [];
  TOWNS.forEach((t: Town, ti: number) => (FOLKN[ti] ?? []).forEach((n: string, i: number) => {
    let hx = (t.x + 16.3) * TS, hy = (t.y + 25.8) * TS;
    if (i !== 2) for (let k = 0; k < 30; k++) { const x = (t.x + 6 + Math.random() * 24) * TS, y = (t.y + 6 + Math.random() * 16) * TS; if (free(x, y, 8, false)) { hx = x; hy = y; break; } }
    out.push({ n, x: hx, y: hy, hx, hy, wx: hx, wy: hy, wt: rnd(0, 4), face: 0, walk: 0, mv: false, lk: 8 + i, say: '', sayT: 0 });
  }));
  return out;
}
function stepFolk(g: G, dt: number): void {
  for (const f of g.folk) {
    f.sayT = Math.max(0, f.sayT - dt); f.wt -= dt; f.mv = false;
    if (Math.abs(f.x - g.p.x) > 1200 || Math.abs(f.y - g.p.y) > 1000) continue;
    if (f.wt <= 0) {
      f.wt = rnd(2, 6);
      const nx = f.hx + rnd(-110, 110), ny = f.hy + rnd(-70, 70);
      if (f.lk !== 10 && free(nx, ny, 8, false)) { f.wx = nx; f.wy = ny; }
      if (Math.random() < 0.15 && f.sayT <= 0) { f.say = FOLKS[Math.floor(Math.random() * FOLKS.length)] ?? ''; f.sayT = 4; }
    }
    const dx = f.wx - f.x, dy = f.wy - f.y, d = Math.hypot(dx, dy);
    if (d > 3) { const sp = 45 * dt; moveBy(f, (dx / d) * sp, (dy / d) * sp, 8, false); f.face = Math.atan2(dy, dx); f.walk += dt; f.mv = true; }
  }
}
function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, f: number, c0: string, c1: string, t: string, font: string): void {
  box(ctx, x - 1, y - 1, w + 2, h + 2, (h + 2) / 2, "rgba(0,0,0,0.6)");
  if (f > 0) box(ctx, x, y, Math.max(h, w * clamp(f, 0, 1)), h, h / 2, lg(ctx, 0, y, 0, y + h, c0, c1));
  ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(x + h / 2, y + 1, Math.max(0, w * clamp(f, 0, 1) - h), h * 0.3);
  ctx.font = `700 ${h - 3}px ${font}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.strokeText(t, x + w / 2, y + h / 2 + 0.5);
  ctx.fillStyle = "#fff"; ctx.fillText(t, x + w / 2, y + h / 2 + 0.5);
}

function render(ctx: CanvasRenderingContext2D, g: G, cw: number, ch: number, dpr: number, font: string, play: boolean): void {
  const z = g.zoom, p = g.p, T = tiles(), TR = trees();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#101418"; ctx.fillRect(0, 0, cw, ch);
  const shx = g.shake > 0 ? rnd(-10, 10) * g.shake : 0, shy = g.shake > 0 ? rnd(-10, 10) * g.shake : 0;
  ctx.setTransform(dpr * z, 0, 0, dpr * z, Math.round((-g.camX * z + shx) * dpr), Math.round((-g.camY * z + shy) * dpr));
  ctx.imageSmoothingEnabled = true;
  const tx0 = Math.max(0, Math.floor(g.camX / TS) - 1), ty0 = Math.max(0, Math.floor(g.camY / TS) - 1);
  const tx1 = Math.min(MW - 1, Math.floor((g.camX + g.vw) / TS) + 1), ty1 = Math.min(MH - 1, Math.floor((g.camY + g.vh) / TS) + 2);
  const vis: { y: number; m: Mon | null; t: number; x: number }[] = [];
  const CP = CH * TS;
  for (let cy = Math.floor(g.camY / CP); cy <= Math.floor((g.camY + g.vh) / CP); cy++) for (let cx = Math.floor(g.camX / CP); cx <= Math.floor((g.camX + g.vw) / CP); cx++) { const im = chunk(cx, cy); if (im) ctx.drawImage(im, cx * CP, cy * CP, CP + 0.5, CP + 0.5); }
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const i = ty * MW + tx, t = MAP[i] ?? 0, dc = DEC[i] ?? 0;
    if (t === 13) { ctx.fillStyle = `rgba(255,${170 + Math.round(Math.sin(g.time * 2.5 + dc) * 50)},60,0.22)`; ctx.fillRect(tx * TS, ty * TS, TS, TS); }
    if (t === 3) {
      const o = Math.sin(g.time * 2 + dc) * 3;
      ctx.strokeStyle = "rgba(210,236,255,0.4)"; ctx.lineWidth = 1.4; ctx.beginPath();
      ctx.moveTo(tx * TS + 4 + o, ty * TS + 11); ctx.lineTo(tx * TS + 14 + o, ty * TS + 11); ctx.moveTo(tx * TS + 16 - o, ty * TS + 23); ctx.lineTo(tx * TS + 27 - o, ty * TS + 23); ctx.stroke();
    }
    if (t === 2) vis.push({ y: ty * TS + TS - 2, m: null, t: treeKind(ZMAP[i] ?? 0, dc), x: tx * TS + TS / 2 });
    if (WID !== 0 && (t === 24 || t === 25)) { ball(ctx, tx * TS + 16, ty * TS + 16, 26 + Math.sin(g.time * 3) * 3, t === 24 ? 'rgba(255,170,80,0.35)' : 'rgba(120,220,255,0.35)', 'rgba(0,0,0,0)'); label(ctx, t === 24 ? '▼ 下一層' : (WID - 1) % 10 === 0 ? '▲ 出口' : '▲ 上一層', tx * TS + 16, ty * TS - 8, t === 24 ? '#ffb060' : '#80e0ff', 12, font, 'center'); }
  }
  const inV = (x: number, y: number, mg: number): boolean => x > g.camX - mg && x < g.camX + g.vw + mg && y > g.camY - mg && y < g.camY + g.vh + mg * 2.5;
  if (WID === 0) {
  BLDS.forEach((b: Bld, i: number) => { if (inV((b.x + b.w / 2) * TS, (b.y + b.h) * TS, 260)) vis.push({ y: (b.y + b.h) * TS, m: null, t: -3, x: i }); });
  PROPS.forEach((pp: Prop, i: number) => { if (!inV(pp.x, pp.y, 80)) return; if (pp.k === 8) drawTele(ctx, pp.x, pp.y, g.time); else vis.push({ y: pp.y, m: null, t: -4, x: i }); });
  NPCS.forEach((n: Npc, i: number) => { if (inV(n.x, n.y, 60)) vis.push({ y: n.y, m: null, t: -5, x: i }); });
  g.folk.forEach((f: Folk, i: number) => { if (inV(f.x, f.y, 60)) vis.push({ y: f.y, m: null, t: -6, x: i }); });
  g.bots.forEach((b: Bot, i: number) => { if (b.st !== 3 && inV(b.x, b.y, 60)) vis.push({ y: b.y, m: null, t: -8, x: i }); });
  DENT.forEach((e: Pt, i: number) => { if (inV(e.x, e.y, 200)) vis.push({ y: e.y - 6, m: null, t: -10, x: i }); });
  }
  if (curPet(p) && inV(BPT.x, BPT.y, 60)) vis.push({ y: BPT.y, m: null, t: -9, x: 0 });
  if (g.pet && inV(g.pet.x, g.pet.y, 60)) vis.push({ y: g.pet.y, m: null, t: -7, x: 0 });
  if (g.mark) { ctx.strokeStyle = `rgba(255,240,150,${g.mark.l * 2})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(g.mark.x, g.mark.y, 14 * (1 - g.mark.l), 6 * (1 - g.mark.l), 0, 0, TAU); ctx.stroke(); }
  for (const dr of g.drops) drawDrop(ctx, dr, font, g.time);
  for (const m of g.mons) if ((m.dead <= 0 || m.dieT > 0) && m.x > g.camX - 80 && m.x < g.camX + g.vw + 80 && m.y > g.camY - 40 && m.y < g.camY + g.vh + 120) vis.push({ y: m.y, m, t: -1, x: 0 });
  if (play) vis.push({ y: p.y, m: null, t: -2, x: 0 });
  vis.sort((a: { y: number }, b: { y: number }) => a.y - b.y);
  const w0 = p.eq[0], a0 = p.eq[2];
  const look: Look = { cls: p.cls, wt: w0 ? VT[idf(w0).t] ?? 0 : -1, at: a0 ? VT[idf(a0).t] ?? 0 : -1, en: w0 ? w0.en : 0, ck: p.eq[3] ? mat(idf(p.eq[3] as Item))[1] : undefined, sh: p.eq[6] ? mat(idf(p.eq[6] as Item))[0] : undefined };
  if (WID !== 0) dunLights(ctx, g, z, g.time);
  const BH: [number, number][] = [[p.x, p.y]]; if (curPet(p)) BH.push([BPT.x, BPT.y]); if (g.pet) BH.push([g.pet.x, g.pet.y]); for (const m of g.mons) if (m.dead <= 0 && inV(m.x, m.y, 60)) BH.push([m.x, m.y]);
  const hid = (x0: number, x1: number, y0: number, y1: number): boolean => BH.some((e: [number, number]) => e[0] > x0 && e[0] < x1 && e[1] > y0 && e[1] < y1);
  for (const v of vis) {
    if (v.m) drawMon2(ctx, v.m, v.m === p.tgt, font, g.time);
    else if (v.t === -2) {
      const pf = POLY[p.poly ?? -1];
      if ((p.polyT ?? 0) > 0 && pf && p.dead <= 0) { const pr = MD[pf.m]?.r ?? 14; shadow(ctx, p.x, p.y + 1, pr * 1.2); if (p.hurt > 0) ctx.globalAlpha = 0.7; drawSpr(ctx, pf.m, p.x + (p.swing > 0 ? Math.cos(p.face) * 6 : 0), p.y, 1, Math.cos(p.face) < 0 ? -1 : 1, p.swing > 0 ? 6 : p.moving ? Math.floor(p.walk * 8) % 6 : 0); ctx.globalAlpha = 1; }
      else drawHero(ctx, look, p.x, p.y, p.face, p.walk, p.moving, p.swing, p.hurt, g.time, p.hasteT > 0 && p.dead <= 0, p.dead > 0 ? 1 : 0);
      const dl = DOLL[p.doll ?? -1]; if (dl && p.dead <= 0) { const bob = Math.sin(g.time * 2.4) * 4, dx0 = p.x - 28, dy0 = p.y - 34 + bob; ball(ctx, dx0, dy0 - 8, 16, 'rgba(200,180,255,0.25)', 'rgba(0,0,0,0)'); drawSpr(ctx, dl.m, dx0, dy0, 0.42, 1, Math.floor(g.time * 4) % 6); } const rk = rankOf(p.kc ?? 0); if (rk > 0 && p.dead <= 0) label(ctx, `【${RKN[rk] ?? ''}】`, p.x, p.y - 76, '#ffd860', 11, font, 'center'); }
    else if (v.t === -3) { const b = BLDS[v.x], fd = b ? hid(b.x * TS - 10, (b.x + b.w) * TS + 10, b.y * TS - 64 - (b.k === 4 ? 60 : 0) + 24, (b.y + b.h) * TS - 2) : false; if (fd) ctx.globalAlpha = 0.45; drawBld(ctx, v.x, font, g.time); ctx.globalAlpha = 1; }
    else if (v.t === -4) drawProp(ctx, v.x, g.time);
    else if (v.t === -10) { const e = DENT[v.x]; if (e) drawCave(ctx, v.x, e, g.time, font); }
    else if (v.t === -5) drawNpcI(ctx, v.x, font, g.time);
    else if (v.t === -6) drawFolkI(ctx, g, v.x, font);
    else if (v.t === -7) drawPet(ctx, g, font);
    else if (v.t === -9) drawBPet(ctx, g, font);
    else if (v.t === -8) drawBot(ctx, g, v.x, font);
    else { const im = TR[v.t]; if (im) { const fd = hid(v.x - 36, v.x + 36, v.y - 104, v.y - 3); if (fd) ctx.globalAlpha = 0.45; ctx.drawImage(im, v.x - 48, v.y - 120); ctx.globalAlpha = 1; } }
  }
  for (const pr of g.proj) {
    if ((pr.dl ?? 0) > 0) continue;
    ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(pr.a);
    if (pr.k < 0) { ctx.restore(); continue; }
    if (pr.k === 5) { ball(ctx, 0, 0, 16, '#a0e8ff88', 'rgba(0,0,0,0)'); shape(ctx, [22, 0, 4, -4.5, -18, -2, -24, 0, -18, 2, 4, 4.5], lg(ctx, -20, 0, 22, 0, '#3a9ad8', '#ffffff'), OL, 1); ctx.restore(); continue; }
    if (pr.k === 6) { ball(ctx, -12, 0, 26, '#ff602088', 'rgba(0,0,0,0)'); ball(ctx, 0, 0, 12, '#ffd080', '#6a1a04', OL); for (const [cx, cy] of [[-4, -3], [3, 3], [2, -5]] as [number, number][]) circ(ctx, cx, cy, 2, '#2a0a02'); ctx.restore(); continue; }
    if (pr.k === 0) { seg(ctx, -14, 0, 6, 0, OL, 3); seg(ctx, -14, 0, 6, 0, "#e0c898", 1.6); tri(ctx, 10, 0, 4, -3, 4, 3, "#f0f0f0"); tri(ctx, -14, 0, -18, -3.5, -17, 0, "#ffffff"); tri(ctx, -14, 0, -18, 3.5, -17, 0, "#ffffff"); }
    else { const pc = PJC[pr.k] ?? '#b07cff'; ball(ctx, 0, 0, pr.k === 2 ? 15 : 11, pc + '99', 'rgba(0,0,0,0)'); if (pr.k === 3) shape(ctx, [11, 0, -6, -4, -11, 0, -6, 4], '#e8fbff', OL, 1); else ball(ctx, 0, 0, pr.k === 2 ? 7 : 5, '#ffffff', pc); }
    ctx.restore();
  }
  for (const q of g.bp) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(Math.atan2(q.m.y - md(q.m).r - q.y, q.m.x - q.x)); if (q.k === 0) { seg(ctx, -12, 0, 5, 0, OL, 2.6); seg(ctx, -12, 0, 5, 0, '#e0c898', 1.4); tri(ctx, 9, 0, 4, -2.5, 4, 2.5, '#f0f0f0'); } else { ball(ctx, 0, 0, 9, '#b07cff88', 'rgba(0,0,0,0)'); ball(ctx, 0, 0, 4, '#ffffff', '#b07cff'); } ctx.restore(); }
  if (play) drawAura(ctx, g);
  drawFx(ctx, g);
  ctx.globalCompositeOperation = "lighter";
  for (const q of g.parts) { ctx.globalAlpha = clamp(q.l / q.m, 0, 1); ctx.fillStyle = q.c; ctx.fillRect(q.x - q.s / 2, q.y - q.s / 2, q.s, q.s); }
  for (const r of g.rings) { ctx.globalAlpha = clamp(r.l / r.m, 0, 1); ctx.strokeStyle = r.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.6, 0, 0, TAU); ctx.stroke(); }
  for (const b of g.bolts) {
    ctx.globalAlpha = clamp(b.l / 0.3, 0, 1); ctx.strokeStyle = '#fff6a0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x1, b.y1);
    for (let i = 1; i < 7; i++) { const t = i / 7; ctx.lineTo(b.x1 + (b.x2 - b.x1) * t + rnd(-10, 10), b.y1 + (b.y2 - b.y1) * t + rnd(-6, 6)); }
    ctx.lineTo(b.x2, b.y2); ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  for (const t of g.texts) { ctx.globalAlpha = clamp(t.l * 2, 0, 1); const pop = t.sz >= 28 ? (t.l > 0.82 ? 0.6 + (1 - t.l) * 4 : t.l > 0.7 ? 1.32 - (0.82 - t.l) * 2.6 : 1) : 1; label(ctx, t.t, t.x, t.y, t.c, Math.round(t.sz * pop), font, "center"); }
  ctx.globalAlpha = 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const dz = zoneAt(p.x, p.y) === 7 || WID !== 0;
  if (WID === 0) {
    const nf = clamp((Math.sin((g.time / 480) * TAU) - 0.35) * 1.6, 0, 1);
    if (nf > 0) {
      const lt = (p.bf['lt'] ?? 0) > 0, px = (p.x - g.camX) * z, py = (p.y - 20 - g.camY) * z;
      const ng = ctx.createRadialGradient(px, py, 40, px, py, lt ? 520 : 300);
      ng.addColorStop(0, `rgba(30,40,90,${0.12 * nf})`); ng.addColorStop(1, `rgba(8,12,40,${0.6 * nf})`);
      ctx.fillStyle = ng; ctx.fillRect(0, 0, cw, ch);
    }
  }
  if (WID !== 0) {
    const lt = (p.bf['lt'] ?? 0) > 0, px = (p.x - g.camX) * z, py = (p.y - 20 - g.camY) * z, fl = Math.sin(g.time * 9) * 6 + Math.sin(g.time * 23) * 3;
    const tg = ctx.createRadialGradient(px, py, 30, px, py, (lt ? 480 : 290) + fl);
    const amb = DUNS[Math.floor((WID - 1) / 10)]?.am ?? '8,4,2';
    tg.addColorStop(0, 'rgba(255,190,110,0.06)'); tg.addColorStop(0.55, `rgba(${amb},0.35)`); tg.addColorStop(1, `rgba(${amb},0.9)`);
    ctx.fillStyle = tg; ctx.fillRect(0, 0, cw, ch);
    dunGlow(ctx, z);
  }
  const vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.3, cw / 2, ch / 2, Math.max(cw, ch) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, dz ? "rgba(10,0,20,0.7)" : "rgba(0,0,0,0.3)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
  if (play) hud(ctx, g, cw, ch, font);
  warmStep(g);
}

const HBT: Record<string, string> = { pot: '紅色藥水\n立即回復生命', green: '綠色加速藥水\n移動與攻擊速度 +25%，持續 2 分鐘', blue: '藍色藥水\n回復魔力', recall: '回城卷軸\n傳送回最後造訪的城鎮', map: '大地圖\n開啟／關閉大地圖（可縮放）', auto: '自動掛機\n自動尋找並攻擊附近的怪物', atk: '攻擊\n攻擊最近的目標', skills: '技能視窗\n設定快捷欄與自動施放', bag: '背包', char: '角色資訊', set: '設定', shop: '商店' };
const ITIP: Record<string, string> = { pr: '紅色藥水\n立即回復生命', pg: '綠色加速藥水\n移動與攻擊速度 +25%，持續 2 分鐘', pb: '藍色藥水\n回復魔力', sr: '回城卷軸（藍）\n傳送回最後造訪的城鎮', sw: '武器強化卷軸（紅）\n武器 +1；安定值 +6，超過可能爆掉', sa: '防具強化卷軸（綠）\n防具 +1；安定值 +4，超過可能爆掉；飾品沒有安定值', sx: '祝福的武器強化卷軸（金）\n武器一次 +1～3；失敗時一半機率保住裝備', sy: '祝福的防具強化卷軸（金）\n防具／飾品一次 +1～3；失敗時一半機率保住裝備' };
const HBC: Record<string, (p: Pl) => number> = { pot: (p: Pl) => p.pots, green: (p: Pl) => p.green, blue: (p: Pl) => p.blue, recall: (p: Pl) => p.scrolls };
function fmtT(t0: number): string { const t = Math.ceil(t0), m = Math.floor(t / 60), x = t % 60; return m > 0 ? `${m} 分 ${x} 秒` : `${Math.ceil(t)} 秒`; }
function atkInt(p: Pl, buff: boolean): number { const c = cl(p.cls); return c.cd * ASPD * (buff && p.hasteT > 0 ? 0.75 : 1) * (buff && (p.bf['ws'] ?? 0) > 0 ? 0.75 - 0.0125 * (bfL(p, 'ws') - 1) : 1) * (buff && (p.polyT ?? 0) > 0 ? 1 - 0.04 * ((p.poly ?? 0) + 1) : 1) * (buff && (p.bf['cp'] ?? 0) > 0 && p.cls !== 2 ? (p.cls === 0 ? 0.8 : 0.85) : 1); }
function noBuff(p: Pl): St { return stats({ ...p, bf: {}, hasteT: 0, polyT: 0, blessT: 0 }); }
function bp(d: number, suf?: string): string { const r = Math.abs(d) < 0.005 ? 0 : d; return r === 0 ? '' : `（${r > 0 ? '+' : ''}${Number.isInteger(r) ? r : r.toFixed(2)}${suf ?? ''}）`; }
function hud(ctx: CanvasRenderingContext2D, g: G, cw: number, ch: number, font: string): void {
  const p = g.p, s = stats(p), c = cl(p.cls), sm = cw < 480, pw = sm ? 118 : 170;
  QRT = []; QD.forEach((q: QDef, i: number) => { const v = p.q[i] ?? 0; if (v > 0 && v - 1 >= q.c && QRT.indexOf(q.t) < 0) QRT.push(q.t); });
  box(ctx, 8, 8, pw + 62, 104, 12, "rgba(30,22,14,0.85)", "#a8843a");
  label(ctx, `攻擊 ${Math.round(s.atk)}`, 62, 98, "#ffc890", 11, font, "left"); label(ctx, `AC ${Math.round(10 - s.ac)}`, 62 + pw / 2 + 6, 98, "#a8d8ff", 11, font, "left");
  { const ne = needExp(p.lv), fr = clamp(p.exp / ne, 0, 1); bar(ctx, 62, 74, pw, 12, fr, "#ffe070", "#b07a10", `EXP ${(fr * 100).toFixed(1)}%`, font); }
  BUFR = []; const BY = 118;
  ball(ctx, 34, 38, 20, c.c, "#20242e", "rgba(255,255,255,0.4)");
  label(ctx, `${p.lv}`, 34, 36, "#ffffff", 18, font, "center");
  label(ctx, "Lv", 34, 52, "#ffe8a0", 9, font, "center");
  label(ctx, `${rankOf(p.kc ?? 0) > 0 ? `${RKN[rankOf(p.kc ?? 0)] ?? ''} ` : ''}${c.n}`, 62, 20, "#ffffff", 12, font, "left");
  label(ctx, `${p.gold}`, pw + 60, 20, "#ffd860", 12, font, "right");
  { const gw = ctx.measureText(`${p.gold}`).width; ball(ctx, pw + 60 - gw - 9, 20, 4.5, "#fff0a0", "#c89020"); const dx = pw + 60 - gw - 18, ds = `${p.dia ?? 0}`; label(ctx, ds, dx, 20, "#a8ecff", 12, font, "right"); const dw = ctx.measureText(ds).width, cx0 = dx - dw - 7; shape(ctx, [cx0, 15, cx0 + 4.5, 19.5, cx0, 25, cx0 - 4.5, 19.5], lg(ctx, cx0 - 4, 15, cx0 + 4, 25, '#e8fcff', '#3ab0e8'), '#0a3a5a', 0.8); }
  bar(ctx, 62, 32, pw, 14, p.hp / s.mhp, "#ff6a5a", "#a81818", `${Math.ceil(p.hp)} / ${s.mhp}`, font);
  bar(ctx, 62, 54, pw, 14, p.mp / s.mmp, "#6a9aff", "#1a3aa8", `${Math.floor(p.mp)} / ${s.mmp}`, font);
  let bx = 10;
  if (p.hasteT > 0) {
    const ic = icon("pg");
    box(ctx, bx, BY, 30, 30, 6, "rgba(12,14,22,0.8)", "#60ff90");
    if (ic) ctx.drawImage(ic, bx + 3, BY + 3, 24, 24);
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.moveTo(bx + 15, BY + 15); ctx.arc(bx + 15, BY + 15, 14, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - p.hasteT / HASTE)); ctx.closePath(); ctx.fill();
    label(ctx, `${Math.ceil(p.hasteT)}`, bx + 15, BY + 36, "#a0ffb0", 10, font, "center");
    BUFR.push({ x: bx, y: BY, t: `綠色加速藥水\n移動速度與攻擊速度提升 25%\n剩餘 ${Math.ceil(p.hasteT)} 秒` });
    bx += 36;
  }
  if (p.blessT > 0) {
    box(ctx, bx, BY, 30, 30, 6, 'rgba(12,14,22,0.8)', '#ffe08a');
    const ib = icon('sy');
    if (ib) ctx.drawImage(ib, bx + 3, BY + 3, 24, 24);
    label(ctx, `${Math.ceil(p.blessT / 60)}分`, bx + 15, BY + 36, '#ffe08a', 10, font, 'center');
    BUFR.push({ x: bx, y: BY, t: `神聖祝福\nAC -3\n剩餘 ${fmtT(p.blessT)}` });
    bx += 36;
  }
  if (p.xb && (p.xb[1] ?? 0) > 0) {
    const t = p.xb[1] ?? 0, li = Math.max(0, XSP.indexOf(p.xb[0] ?? 15)), ie = icon(`se${li + 1}`);
    box(ctx, bx, BY, 30, 30, 6, 'rgba(12,14,22,0.8)', '#ffe08a'); if (ie) ctx.drawImage(ie, bx + 3, BY + 3, 24, 24);
    label(ctx, t >= 60 ? `${Math.ceil(t / 60)}分` : `${Math.ceil(t)}`, bx + 15, BY + 36, '#ffe08a', 10, font, 'center');
    BUFR.push({ x: bx, y: BY, t: `經驗卷軸\n獲得經驗 +${p.xb[0] ?? 0}%\n剩餘 ${fmtT(t)}` }); bx += 36;
  }
  if ((p.bf['cp'] ?? 0) > 0) {
    const t = p.bf['cp'] ?? 0, ic2 = icon(`pk${p.cls}`);
    box(ctx, bx, BY, 30, 30, 6, 'rgba(12,14,22,0.8)', '#ffd080'); if (ic2) ctx.drawImage(ic2, bx + 3, BY + 3, 24, 24);
    label(ctx, t >= 60 ? `${Math.ceil(t / 60)}分` : `${Math.ceil(t)}`, bx + 15, BY + 36, '#ffd080', 10, font, 'center');
    BUFR.push({ x: bx, y: BY, t: `${CPN[p.cls] ?? ''}\n${(CPD[p.cls] ?? '').replace(/，持續.*$/, '')}\n剩餘 ${fmtT(t)}` }); bx += 36;
  }
  for (const [bk, si] of [['ac', p.cls === 1 ? 9 : 1], ['at', 2], ['dg', 5], ['sp', 7], ['sh', 16], ['lt', 15], ['cb', 23], ['hb', p.cls === 0 ? 24 : 32], ['ws', 25], ['fw', 26], ['pc', 27], ['mb', 29], ['tw', 34], ['he', 36], ['ma', 38]] as [string, number][]) {
    const t = p.bf[bk] ?? 0;
    if (t <= 0) continue;
    box(ctx, bx, BY, 30, 30, 6, 'rgba(12,14,22,0.8)', '#c8a8ff');
    const ik = icon(`k${si}`);
    if (ik) ctx.drawImage(ik, bx + 3, BY + 3, 24, 24);
    label(ctx, t > 99999 ? '開' : t >= 60 ? `${Math.ceil(t / 60)}分` : `${Math.ceil(t)}`, bx + 15, BY + 36, '#d8c8ff', 10, font, 'center');
    const bs = SK.find((q: SDef) => q.b === bk && q.c === p.cls) ?? SK[si];
    BUFR.push({ x: bx, y: BY, t: `${bs?.n ?? ''}\n${(bs?.d ?? '').replace(/，?持續.*$/, '')}\n${t > 99999 ? '切換中（持續消耗 MP）' : `剩餘 ${fmtT(t)}`}` });
    bx += 36;
  }
  if ((p.polyT ?? 0) > 0) label(ctx, `變身：${POLY[p.poly ?? 0]?.n ?? ''} 剩 ${Math.ceil((p.polyT ?? 0) / 60)} 分`, bx + 2, BY + 30, '#d8b0ff', 11, font, 'left');
  if (g.auto) label(ctx, g.retreat ? "掛機：回村補給中" : g.autoPause > 0 ? "掛機：暫停中" : `掛機中 · ${ZN[g.huntZ + 1] ?? ""}`, bx + 2, BY + 14, `rgba(120,255,150,${0.75 + Math.sin(g.time * 4) * 0.25})`, 12, font, "left");
  const zi = zoneAt(p.x, p.y);
  label(ctx, zi === -1 ? townName(p.x, p.y) : WID !== 0 ? dunName() : ZN[zi + 1] ?? "", cw - 12, 18, ZC[zi + 1] ?? "#fff", sm ? 13 : 15, font, "right");
  label(ctx, WID !== 0 ? "地城 · 危險" : zi === -1 ? "安全區域" : "危險區域", cw - 12, 36, zi === -1 ? "#8fe08f" : "#ff9a80", 11, font, "right");
  const m = p.tgt;
  if (m && m.dead <= 0) {
    const d = md(m), w = sm ? 110 : 150;
    label(ctx, `${d.n} Lv.${m.sc ? Math.max(1, Math.round(d.lv * m.sc)) : d.lv}`, cw - 12, 56, "#ffc0a0", 12, font, "right");
    bar(ctx, cw - 12 - w, 66, w, 11, m.hp / m.mhp, "#ff6a5a", "#a81818", `${Math.max(0, Math.ceil(m.hp))}/${m.mhp}`, font);
  }
  const mm = MBIG ? miniMap() : null;
  if (!mm) MMR = { x: -99, y: -99, w: 0, h: 0 };
  if (mm) {
    const MWv = WID ? 74 : MW, MHv = WID ? 62 : MH, w = MBIG ? Math.min(cw - 24, sm ? 320 : 460, ((ch - 190) * MWv) / MHv) : sm ? 96 : 150, h = (w * MHv) / MWv, x0 = MBIG ? 12 : cw - 12 - w, y0 = MBIG ? 60 : 86;
    const sw = MWv / MZ, sh = MHv / MZ, sx = clamp(p.x / TS - sw / 2, 0, MWv - sw), sy = clamp(p.y / TS - sh / 2, 0, MHv - sh), k = w / (sw * TS), ox = x0 - sx * TS * k, oy = y0 - sy * TS * k;
    MMR = { x: x0, y: y0, w, h };
    box(ctx, x0 - 3, y0 - 3, w + 6, h + 6, 6, "rgba(0,0,0,0.65)", "rgba(255,255,255,0.25)");
    ctx.globalAlpha = 0.92; ctx.imageSmoothingEnabled = false; ctx.drawImage(mm, sx, sy, sw, sh, x0, y0, w, h); ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 1;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1; ctx.strokeRect(ox + g.camX * k, oy + g.camY * k, g.vw * k, g.vh * k);
    for (const mo of g.mons) if (mo.dead <= 0 && md(mo).b) circ(ctx, ox + mo.x * k, oy + mo.y * k, mo.wb ? 4 + Math.sin(g.time * 6) : 2.5, "#ff3030");
    if (WID === 0) for (const b of g.bots) if (b.st !== 3) circ(ctx, ox + b.x * k, oy + b.y * k, 1.8, '#80c8ff');
    if (WID === 0) for (const n of NPCS) if (n.k === 6 && QRT.indexOf(n.t) >= 0) { ball(ctx, ox + n.x * k, oy + n.y * k, 5 + Math.sin(g.time * 5) * 1.5, 'rgba(255,240,120,0.9)', 'rgba(255,200,40,0.2)'); label(ctx, '?', ox + n.x * k, oy + n.y * k - 8, '#ffe040', 10, font, 'center'); }
    if (WID === 0) for (const t of TOWNS) { ctx.strokeStyle = '#fff0a0'; ctx.lineWidth = 1; ctx.strokeRect(ox + t.x * TS * k, oy + t.y * TS * k, TW * TS * k, TH * TS * k); if (MZ >= 2 || MBIG) label(ctx, t.n, ox + (t.x + TW / 2) * TS * k, oy + t.y * TS * k - 3, '#fff0a0', 10, font, 'center'); }
    circ(ctx, ox + p.x * k, oy + p.y * k, 2.8, "#ffe060");
    ctx.restore();
    label(ctx, `×${MZ}${MBIG || !sm ? '（點兩下縮放）' : ''}`, x0 + 4, y0 + h - 5, '#ffffff', 10, font, 'left');
  }
  if (BTIP) { const bt = BTIP, hit = BUFR.find((b: { x: number; y: number }) => bt.x >= b.x && bt.x <= b.x + 30 && bt.y >= b.y && bt.y <= b.y + 30); if (hit) { const ls = hit.t.split('\n'); ctx.font = `12px ${font}`; const w = Math.max(...ls.map((l: string) => ctx.measureText(l).width)) + 18, tx = Math.min(bt.x + 14, cw - w - 4), ty = bt.y + 16; box(ctx, tx, ty, w, ls.length * 17 + 10, 6, 'rgba(14,12,20,0.95)', '#c8a8ff'); ls.forEach((l: string, i: number) => label(ctx, l, tx + 9, ty + 15 + i * 17, i === 0 ? '#ffe08a' : '#e8e0f0', 12, font, 'left')); } }
  const need = needExp(p.lv);
  bar(ctx, 4, ch - 13, cw - 8, 10, p.exp / need, "#ffe070", "#b07a10", `EXP ${((p.exp / need) * 100).toFixed(1)}%`, font);
  LOGOFF = clamp(LOGOFF, 0, Math.max(0, g.log.length - 5));
  const lines = g.log.slice(Math.max(0, g.log.length - 5 - LOGOFF), g.log.length - LOGOFF);
  if (LOGOFF > 0) label(ctx, `▲ 歷史記錄（往回 ${LOGOFF} 行，停止捲動 3 秒後有新訊息會回到最新）`, 10, ch - 24 - lines.length * 16, '#ffe08a', 10, font, 'left');
  lines.forEach((l: Line, i: number) => {
    ctx.globalAlpha = l.age < 8 || LOGOFF > 0 ? 1 : 0.45;
    label(ctx, l.t, 10, ch - 24 - (lines.length - 1 - i) * 16, l.c, sm ? 11 : 12, font, "left");
  });
  ctx.globalAlpha = 1;
  if (g.flash) { ctx.fillStyle = `rgba(${g.flash.c},${clamp(g.flash.l * 0.6, 0, 0.5)})`; ctx.fillRect(0, 0, cw, ch); }
  if (g.banner) {
    const b = g.banner, k = b.l > 1.9 ? 1 + (b.l - 1.9) * 1.6 : 1, bx2 = g.panel && cw >= 600 ? (cw - 380) / 2 : cw / 2;
    ctx.save(); ctx.globalAlpha = clamp(b.l, 0, 1); ctx.translate(bx2, ch * 0.22); ctx.scale(k, k);
    label(ctx, b.t, 0, 0, b.c, sm ? 20 : 28, font, "center"); ctx.restore(); ctx.globalAlpha = 1;
  }
  if (p.dead > 0) {
    ctx.fillStyle = "rgba(20,0,0,0.55)"; ctx.fillRect(0, 0, cw, ch);
    label(ctx, "你已陣亡", cw / 2, ch * 0.42, "#ff6060", sm ? 30 : 40, font, "center");
    label(ctx, `${Math.ceil(p.dead)} 秒後在${TOWNS[p.home]?.n ?? '城鎮'}復活`, cw / 2, ch * 0.42 + 36, "#ffffff", 14, font, "center");
  }
}
const MC: [number, number, number][] = [[79, 138, 60], [170, 160, 138], [26, 70, 30], [44, 106, 160], [90, 86, 80], [47, 90, 44], [62, 56, 70], [120, 118, 124], [190, 165, 115], [214, 184, 124], [236, 242, 248], [84, 84, 58], [72, 58, 54], [240, 96, 30], [168, 160, 88], [150, 110, 80], [196, 186, 160], [40, 36, 46], [140, 100, 60], [90, 74, 58], [30, 24, 20], [200, 196, 212], [50, 56, 70], [44, 30, 36], [255, 200, 80], [120, 220, 255]];
let MMT = 0;
let MINI: HTMLCanvasElement | null = null, MZ = 1, MBIG = false, MMR = { x: 0, y: 0, w: 0, h: 0 };
function mmZoom(d: number): void { const L = [1, 2, 4, 8], i = L.indexOf(MZ); MZ = L[clamp(i + d, 0, L.length - 1)] ?? 1; }
function miniMap(): HTMLCanvasElement | null {
  if (MINI) return MINI;
  const r = mk(MW, MH);
  if (!r) return null;
  const img = r[1].createImageData(MW, MH);
  for (let i = 0; i < MW * MH; i++) {
    const col = MC[MAP[i] ?? 0] ?? [0, 0, 0];
    img.data[i * 4] = col[0]; img.data[i * 4 + 1] = col[1]; img.data[i * 4 + 2] = col[2]; img.data[i * 4 + 3] = 255;
  }
  r[1].putImageData(img, 0, 0);
  MINI = r[0];
  return MINI;
}
function updateCam(g: G): void {
  const p = g.p;
  g.camX = clamp(p.x - g.vw / 2, 0, Math.max(0, MW * TS - g.vw));
  g.camY = clamp(p.y - g.vh / 2, 0, Math.max(0, MH * TS - g.vh));
}

/* ---------- component ---------- */
export default function App() {
  const theme = useGrokTheme();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const codeRef = useRef<HTMLTextAreaElement | null>(null);
  const gRef = useRef<G | null>(null);
  const inRef = useRef<Inp>({ keys: {}, down: false, id: -1, sx: 0, sy: 0, rt: 0 });
  const scrRef = useRef<Scr>("select");
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 });
  const fontRef = useRef<string>(theme.font.family);
  fontRef.current = theme.font.family;
  const [scr, setScr] = useState<Scr>("select");
  const [, setTick] = useState<number>(0);
  const [narrow, setNarrow] = useState<boolean>(false);
  const [touch, setTouch] = useState<boolean>(false);
  const [panel, setPanel] = useState<Panel>("none");
  const panelRef = useRef<Panel>("none");
  const [conf, setConf] = useState<{ it: Item; b: boolean } | null>(null);
  const [selSlot, setSelSlot] = useState<number>(-1);
  const [bagSel, setBagSel] = useState<number>(-1);
  const [bagTab, setBagTab] = useState<number>(0);
  const [dsN, setDsN] = useState<number>(1);
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [stored, setStored] = useState<SaveData | null>(null);
  const [logOpen, setLogOpen] = useState<boolean>(false);
  const [tip, setTip] = useState<{ it: Item | null; t: string; x: number; y: number } | null>(null);
  useEffect(() => { setTip(null); }, [panel, scr]);
  const th = (it: Item | null, t?: string) => ({
    onPointerEnter: (e: { clientX: number; clientY: number; pointerType: string }) => { if (e.pointerType === 'mouse') setTip({ it, t: t ?? '', x: e.clientX, y: e.clientY }); },
    onPointerMove: (e: { clientX: number; clientY: number; pointerType: string }) => { if (e.pointerType !== 'mouse') return; if (TIPEL && TIPIT === it) { placeTip(TIPEL, e.clientX, e.clientY); return; } setTip({ it, t: t ?? '', x: e.clientX, y: e.clientY }); },
    onPointerLeave: () => setTip(null),
  });
  const [bak, setBak] = useState<SaveData | null>(null);
  const [pick, setPick] = useState<number>(-1);
  const [mode, setMode] = useState<string>("none");
  const [code, setCode] = useState<string>("");
  const [imp, setImp] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [showImp, setShowImp] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [bkRem, setBkRem] = useState<boolean>(false);
  const [pause, setPause] = useState<boolean>(false);
  const [askTitle, setAskTitle] = useState<boolean>(false);
  const [qOpen, setQOpen] = useState<boolean>(true);
  const pauseRef = useRef<boolean>(false);
  const bump = (): void => setTick((t: number) => t + 1);
  const persist = (g: G): void => { try { const m = storeSave(encodeSave(toSave(g))); setMode(m); } catch { /* never let a save error stop the game loop */ } };
  const persistRef = useRef<(g: G) => void>(persist);
  persistRef.current = persist;
  const setPanelS = (v: Panel): void => { panelRef.current = v; setPanel(v); setConf(null); setMsg(null); setNote(""); setCode(""); };
  const handleReq = (r: string): void => {
    const g = gRef.current;
    if (!g) return;
    if (r === "close") { if (panelRef.current !== "none") setPanelS("none"); return; }
    if (r === "back") {
      if (askTitle) { setAskTitle(false); return; }
      if (conf) { setConf(null); return; }
      if (pauseRef.current) { pauseRef.current = false; setPause(false); return; }
      if (panelRef.current !== "none") { setPanelS("none"); return; }
      pauseRef.current = true; setPause(true); persist(g); return;
    }
    if (r === "bag" || r === "set" || r === "char" || r === "skills" || r === "dia") { setPanelS(panelRef.current === r ? "none" : r); return; }
    if (r === "npc" && g.npc && g.npc.k === 6) { const tw = g.npc.t; let n = 0; QD.forEach((q: QDef, i: number) => { const v = g.p.q[i] ?? 0; if (q.t === tw && v > 0 && v - 1 >= q.c) { questAct(g, i); n++; } }); if (n) persist(g); }
    if (r === "npc") { const k = g.npc ? g.npc.k : 0; setPanelS(k === 3 ? 'ware' : k === 4 ? 'temple' : k === 5 ? 'tele' : k === 6 ? 'quest' : k === 8 ? 'craft' : k === 9 ? 'xchg' : k === 10 ? 'pets' : k === 11 ? 'rank' : k === 13 ? 'board' : k === 12 ? 'dun' : 'shop'); return; }
    if (r === "auto") { toggleAuto(g); bump(); return; }
    if (r === "shop") {
      if (panelRef.current === "shop") setPanelS("none");
      else if (inTown(g)) { const ti = townIdx(g.p.x, g.p.y); g.npc = NPCS.find((n: Npc) => n.k === 0 && n.t === ti) ?? null; setPanelS("shop"); }
      else addLog(g, "商店在城鎮裡，用回城卷軸或走回去吧。", "#c0c8d0");
    }
  };
  const reqRef = useRef<(r: string) => void>(handleReq);
  reqRef.current = handleReq;
  const doEnchant = (it: Item, b: boolean): void => {
    const g = gRef.current;
    if (!g) return;
    const safe = safeOf(idf(it));
    if ((safe <= 0 || it.en >= safe) && (!conf || conf.it !== it || conf.b !== b)) { setConf({ it, b }); setMsg(null); return; }
    setConf(null); setMsg(enchant(g, it, b)); persist(g); bump();
  };

  const focusGame = useCallback(() => { const w = wrapRef.current; if (!w) return; try { w.focus({ preventScroll: true }); } catch { w.focus(); } }, []);
  const start = useCallback((cls: number, sv?: SaveData | null, force?: boolean) => {
    if (!sv && !force) { const old0 = newestOf(loadStored(), IDB_SAVE); if (old0 && (old0.lv > 1 || old0.exp > 0)) { setStored(old0); setPick(cls); return; } }
    try { const old = newestOf(loadStored(), IDB_SAVE); if (old && (old.lv > 1 || old.exp > 0) && (!sv || saveTime(old) !== saveTime(sv))) bakPut(old); } catch { /* no backup */ }
    BKT = 0;
    const ng = newGame(cls);
    if (sv) { try { applySave(ng, sv); } catch { /* keep what loaded */ } }
    try { warmHero(lookOf(ng.p)); } catch { /* lazy fallback */ }
    gRef.current = ng;
    persistRef.current(ng);
    pauseRef.current = false; setPause(false); setAskTitle(false);
    panelRef.current = "none"; setPanel("none"); setConf(null); setMsg(null); setShowImp(false); setNote("");
    const i = inRef.current; i.keys = {}; i.down = false;
    scrRef.current = "play"; setScr("play"); focusGame();
  }, [focusGame]);
  const act = useCallback((k: string) => {
    const g = gRef.current;
    if (!g || scrRef.current !== "play") return;
    audioInit(); if (k !== 'pot' && k !== 'blue' && k !== 'green') sfx('click');
    if (k === "pot") drinkPot(g, false); else if (k === "blue") drinkBlue(g, false); else if (k === "green") drinkGreen(g, false);
    else if (k === "skill") useSlot(g, 0); else if (k === "recall") recall(g); else if (k === "atk") attackNearest(g);
    else if (k.charAt(0) === 'h' && k.length === 2) { const n = Number(k.slice(1)); if ((g.p.hb[n] ?? -1) < 0) reqRef.current('skills'); else useSlot(g, n); }
    else if (k === 'map') { MBIG = !MBIG; }
    else reqRef.current(k);
    setTick((t: number) => t + 1);
  }, []);
  const toSelect = useCallback(() => {
    const g = gRef.current;
    if (g && scrRef.current === "play") persistRef.current(g);
    setStored(loadStored()); setBak(bakGet()); setPick(-1);
    panelRef.current = "none"; setPanel("none");
    scrRef.current = "select"; setScr("select");
  }, []);
  const copyText = (c: string): void => {
    const fallback = (): void => {
      const el = codeRef.current;
      if (!el) { setNote("請手動複製存檔碼。"); return; }
      el.focus(); el.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      setNote(ok ? "已複製存檔碼！請貼到備忘錄或訊息裡保存。" : "無法自動複製，請長按下方文字全選後複製。");
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(c).then(() => setNote("已複製存檔碼！請貼到備忘錄或訊息裡保存。"), () => { window.setTimeout(fallback, 60); });
        return;
      }
    } catch { /* clipboard blocked */ }
    window.setTimeout(fallback, 60);
  };
  const exportCode = (): void => {
    const g = gRef.current;
    if (!g) return;
    const c = encodeSave(toSave(g));
    setMode(storeSave(c)); setCode(c); copyText(c); BKT = 0; setBkRem(false);
  };
  const importCode = (): void => {
    const s = decodeSave(imp);
    if (!s) { setNote("存檔碼無效，請確認完整複製（以 SM3- 或 SM2- 開頭）。"); return; }
    setImp(""); start(s.cls, s);
  };

  useEffect(() => {
    try { setTouch(window.matchMedia("(pointer: coarse)").matches); } catch { /* no matchMedia */ }
    setMode(probeStorage());
    setStored(loadStored()); setBak(bakGet());
    bakAll().then((b: SaveData | null) => { if (b) setBak(b); }, () => { /* no idb */ });
    const rt = window.setTimeout(() => setReady(true), 1500);
    loadAll().then((r: { sv: SaveData | null; idb: boolean }) => { if (r.sv) setStored(r.sv); if (r.idb) setMode('local'); window.clearTimeout(rt); setReady(true); }, () => { window.clearTimeout(rt); setReady(true); });
    const onPaste = (e: ClipboardEvent): void => {
      const tx = e.clipboardData ? e.clipboardData.getData('text') : '';
      const m0 = /SM[23]-[A-Za-z0-9+/=]+-[0-9a-z]+/.exec(tx.replace(/\s+/g, ''));
      if (!m0) return;
      const sv = decodeSave(m0[0]);
      if (!sv) return;
      e.preventDefault();
      if (scrRef.current === 'select') start(sv.cls, sv); else setStored(sv);
    };
    window.addEventListener('paste', onPaste);
    const unlock = (): void => audioInit();
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    const wrap = wrapRef.current, cv = canvasRef.current;
    if (!wrap || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    if (!gRef.current) gRef.current = newGame(0);
    const inp = inRef.current;
    const resize = (): void => {
      const w = Math.max(280, Math.floor(wrap.clientWidth)), nar = w < 600;
      const h = Math.round(nar ? Math.min(w * 1.45, 660) : Math.min(w * 0.62, 660));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const sz = sizeRef.current;
      if (sz.w === w && sz.h === h && sz.dpr === dpr) return;
      cv.style.height = `${h}px`; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      sizeRef.current = { w, h, dpr }; setNarrow(nar);
    };
    resize();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(() => resize()); ro.observe(wrap); }
    window.addEventListener("resize", resize);
    const local = (cx: number, cy: number): Pt => {
      const r = cv.getBoundingClientRect(), k = r.width > 0 ? sizeRef.current.w / r.width : 1;
      return { x: (cx - r.left) * k, y: (cy - r.top) * k };
    };
    const onDown = (e: PointerEvent): void => {
      focusGame();
      const g = gRef.current;
      if (scrRef.current !== "play" || !g || g.p.dead > 0 || pauseRef.current) return;
      if (e.pointerType !== "mouse") e.preventDefault();
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const l = local(e.clientX, e.clientY), wx = g.camX + l.x / g.zoom, wy = g.camY + l.y / g.zoom;
      if (l.x >= MMR.x - 3 && l.x <= MMR.x + MMR.w + 3 && l.y >= MMR.y - 3 && l.y <= MMR.y + MMR.h + 3) { const now = performance.now(); if (now - MMT < 380) { MMT = 0; if (MZ >= 8) MZ = 1; else mmZoom(1); } else MMT = now; return; }
      const np = WID !== 0 ? undefined : NPCS.find((n: Npc) => Math.abs(wx - n.x) < 16 && wy < n.y + 6 && wy > n.y - 50);
      if (np) { g.p.tgt = null; goTo(g, np.x, np.y + 22); g.wantNpc = np; if (g.auto) g.autoPause = 5; return; }
      const fk = WID !== 0 ? undefined : g.folk.find((f: Folk) => Math.abs(wx - f.x) < 14 && wy < f.y + 6 && wy > f.y - 44);
      if (fk) { fk.say = FOLKS[Math.floor(Math.random() * FOLKS.length)] ?? ''; fk.sayT = 4; }
      const m = pickMon(g, wx, wy, e.pointerType === "mouse" ? 8 : 18);
      const pb = m ? -1 : pickBot(g, wx, wy), pbb = g.bots[pb];
      if (pb >= 0 && pbb) {
        if (zoneAt(g.p.x, g.p.y) === -1 || zoneAt(pbb.x, pbb.y) === -1 || pbb.st !== 2) { addLog(g, '城鎮內禁止 PvP。', '#ff9090'); return; }
        const now = performance.now();
        if (PVP === pb) return;
        if (PVPC === pb && now - PVPCT < 3000) { PVP = pb; PVPC = -1; g.p.tgt = null; g.p.path = []; g.p.dest = null; g.p.repath = 0; inp.down = false; if (g.auto) g.autoPause = 30; addLog(g, `【PvP】你向 ${pbb.n} 發起攻擊！`, '#ff8080'); return; }
        PVPC = pb; PVPCT = now; addLog(g, `再點一次 ${pbb.n} 即可發起 PvP 攻擊（3 秒內）。`, '#ffb080'); return;
      }
      PVP = -1;
      if (m) { g.p.tgt = m; g.p.path = []; g.p.dest = null; g.p.repath = 0; inp.down = false; }
      else {
        g.p.tgt = null; g.wantNpc = null; g.qg = -1; goTo(g, wx, wy); g.mark = { x: wx, y: wy, l: 0.5 };
        if (g.auto) g.autoPause = 3;
        inp.down = true; inp.id = e.pointerId; inp.sx = l.x; inp.sy = l.y; inp.rt = 0.25;
        try { cv.setPointerCapture(e.pointerId); } catch { /* no capture */ }
      }
    };
    const onMove = (e: PointerEvent): void => { if (e.pointerType === 'mouse') { const l = local(e.clientX, e.clientY); BTIP = BUFR.some((b: { x: number; y: number }) => l.x >= b.x && l.x <= b.x + 30 && l.y >= b.y && l.y <= b.y + 30) ? { x: l.x, y: l.y } : null; } if (inp.down && e.pointerId === inp.id) { const l = local(e.clientX, e.clientY); inp.sx = l.x; inp.sy = l.y; } };
    const onUp = (e: PointerEvent): void => { if (e.pointerId === inp.id) inp.down = false; };
    const onCtx = (e: Event): void => { e.preventDefault(); };
    const onWheel = (e: WheelEvent): void => { const l = local(e.clientX, e.clientY); const hh = sizeRef.current.h; if (l.x < 420 && l.y > hh - 120 && l.y < hh - 12) { e.preventDefault(); LOGT = Date.now(); LOGOFF = Math.max(0, LOGOFF + (e.deltaY < 0 ? 1 : -1)); return; } if (l.x >= MMR.x && l.x <= MMR.x + MMR.w && l.y >= MMR.y && l.y <= MMR.y + MMR.h) { e.preventDefault(); mmZoom(e.deltaY < 0 ? 1 : -1); } };
    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.addEventListener("pointerdown", onDown, { passive: false });
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("contextmenu", onCtx);
    const block = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
    const onKey = (e: KeyboardEvent): void => {
      const g = gRef.current;
      if (scrRef.current !== "play" || !g || pauseRef.current) return;
      const tg = e.target as HTMLElement | null;
      if (tg && (tg.tagName === "TEXTAREA" || tg.tagName === "INPUT")) return;
      if (block.indexOf(e.code) >= 0) e.preventDefault();
      if (!e.repeat) {
        const map: Record<string, string> = { Digit1: "pot", Digit2: "skill", Digit3: "recall", Digit4: "green", Digit5: "blue", Space: "atk", KeyF: "auto", KeyI: "bag", KeyB: "shop", KeyP: "dia", KeyO: "set", KeyM: "map", KeyC: "char", KeyK: "skills", KeyQ: "h0", KeyE: "h1", KeyR: "h2", KeyT: "h3", KeyG: "h4", KeyZ: "h5", KeyX: "h6", KeyV: "h7" };
        const a = map[e.code];
        if (a) {
          if (a === "pot") drinkPot(g, false); else if (a === "skill") useSlot(g, 0); else if (a.charAt(0) === 'h' && a.length === 2) useSlot(g, Number(a.slice(1))); else if (a === "recall") recall(g); else if (a === "green") drinkGreen(g, false); else if (a === "blue") drinkBlue(g, false); else if (a === "atk") attackNearest(g);
          else g.req = a;
          return;
        }
      }
      inp.keys[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent): void => { inp.keys[e.code] = false; };
    const onBlur = (): void => { inp.keys = {}; inp.down = false; };
    const onHide = (): void => { const g = gRef.current; if (g && scrRef.current === "play") persistRef.current(g); };
    const onVis = (): void => { if (document.visibilityState === "hidden") onHide(); };
    const onEsc = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape' && e.code !== 'Escape') return;
      if (scrRef.current !== 'play') return;
      e.preventDefault(); e.stopPropagation();
      if (!e.repeat) reqRef.current('back');
    };
    window.addEventListener('keydown', onEsc, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
    document.addEventListener("freeze", onHide);
    document.addEventListener("visibilitychange", onVis);
    let raf = 0, last = performance.now(), uiT = 0, saveT = 0, dirtT = 0, lastSig = '';
    const frame = (t: number): void => {
      raf = requestAnimationFrame(frame);
      const rdt = Math.min(0.15, Math.max(0, (t - last) / 1000)), dt = Math.min(0.05, rdt);
      last = t;
      const g = gRef.current;
      if (!g) return;
      const sz = sizeRef.current;
      g.zoom = sz.w < 600 ? 0.9 : 1.05; g.vw = sz.w / g.zoom; g.vh = sz.h / g.zoom;
      const play = scrRef.current === "play";
      if (play && pauseRef.current) { /* paused */ } else if (play) { for (let st = rdt; st > 1e-4; st -= 0.05) update(g, inp, Math.min(0.05, st)); bgmTick(WID !== 0 ? 2 : zoneAt(g.p.x, g.p.y) === -1 ? 0 : 1); } else { g.time += dt; stepFx(g, dt); }
      updateCam(g);
      g.panel = panelRef.current !== "none";
      render(ctx, g, sz.w, sz.h, sz.dpr, fontRef.current, play);
      if (play) { const CP0 = CH * TS, pcx = Math.floor(g.p.x / CP0), pcy = Math.floor(g.p.y / CP0); let done0 = false; for (let oy = -1; oy <= 1 && !done0; oy++) for (let ox = -1; ox <= 1 && !done0; ox++) { const k0 = WID * 1e6 + (pcy + oy) * 1000 + pcx + ox; if (!CHUNKS.has(k0) && pcx + ox >= 0 && pcy + oy >= 0 && (pcx + ox) * CH < MW && (pcy + oy) * CH < MH) { chunk(pcx + ox, pcy + oy); done0 = true; } } }
      if (g.req) { const r = g.req; g.req = ""; reqRef.current(r); }
      if (play && ['shop', 'ware', 'temple', 'tele', 'quest', 'craft', 'xchg', 'pets', 'rank', 'dun'].indexOf(panelRef.current) >= 0 && !inTown(g)) reqRef.current("close");
      uiT += dt; saveT += dt;
      if (play) { dirtT += dt; if (dirtT > 0.5) { dirtT = 0; const p0 = g.p; const sg = `${p0.lv}|${p0.gold}|${p0.inv.length}|${p0.eq.filter((x: Item | null) => x !== null).length}|${p0.dia ?? 0}|${p0.bank.length}|${p0.scrolls}|${p0.pots}`; if (sg !== lastSig && saveT > 2) { lastSig = sg; saveT = 0; persistRef.current(g); } } }
      if (play && saveT > 5) { saveT = 0; persistRef.current(g); }
      if (play) { BKT += dt; if (BKT > 600) { BKT = 0; setBkRem(true); } }
      if (play && uiT > (panelRef.current !== 'none' ? 0.6 : 0.3)) { uiT = 0; setTick((n: number) => n + 1); }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      onHide();
      if (ro) ro.disconnect();
      window.removeEventListener("resize", resize);
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      cv.removeEventListener("contextmenu", onCtx);
      cv.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener('keydown', onEsc, true);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
      document.removeEventListener("freeze", onHide);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener('paste', onPaste);
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };
  }, [focusGame, start]);

  const drawPrev = (el: HTMLCanvasElement | null, i: number): void => {
    if (!el) return;
    const c = el.getContext("2d");
    if (!c) return;
    el.width = 160; el.height = 160;
    c.setTransform(1.55, 0, 0, 1.55, 0, 0); c.clearRect(0, 0, 104, 104);
    drawHero(c, { cls: i, wt: 1, at: i === 2 ? -1 : 1, en: 0 }, 50, 94, 0.35, 0, false, 0, 0, 0, false);
  };
  const g = gRef.current;
  const modeText = mode === "local" ? "自動存檔：使用瀏覽器本機儲存（每 6 秒自動存）。部分 App 內建瀏覽器會在關閉後清除資料，重要進度請再複製存檔碼備份。" : mode === "session" ? "自動存檔只在這次開啟期間有效，關閉頁面後會消失。請用「複製存檔碼」保存進度。" : "這個頁面環境不允許瀏覽器存檔，關閉後進度會消失。請用「複製存檔碼」保存，下次在開頭畫面貼上即可繼續。";
  const chromeBtn: CSSProperties = { background: theme.bg.elevated, color: theme.text.primary, border: `1px solid ${theme.border.default}`, borderRadius: 999, padding: "6px 14px", fontFamily: theme.font.family, fontSize: 13, cursor: "pointer" };
  const hb: CSSProperties = { width: narrow ? 54 : 60, minHeight: 44, background: "linear-gradient(180deg, rgba(70,54,34,0.94), rgba(22,16,10,0.94))", color: "#fff", border: "1px solid rgba(255,255,255,0.26)", borderRadius: 10, fontFamily: theme.font.family, fontSize: 11, fontWeight: 700, lineHeight: 1.2, cursor: "pointer", padding: "3px 2px", touchAction: "manipulation", position: "relative" };
  const hk: CSSProperties = { display: "block", fontSize: 9, opacity: 0.6, fontWeight: 500 };
  const sb: CSSProperties = { background: "rgba(255,255,255,0.08)", color: "#eef2f8", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: theme.font.family, touchAction: "manipulation" };
  const rowS: CSSProperties = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" };
  const subS: CSSProperties = { fontSize: 11, color: "rgba(238,242,248,0.6)" };
  const sec: CSSProperties = { fontSize: 12, fontWeight: 800, color: "#e8c870", margin: "10px 0 2px", letterSpacing: "0.1em" };
  const taS: CSSProperties = { width: "100%", boxSizing: "border-box", minHeight: 64, background: "rgba(0,0,0,0.4)", color: "#eef2f8", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: 6, fontSize: 11, fontFamily: theme.font.mono, wordBreak: "break-all" };
  const ico = (key: string, size: number, en?: number, q?: number) => (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size, flex: "0 0 auto", borderRadius: 5, boxShadow: q ? `0 0 0 1.5px ${QC[q] ?? '#fff'}, 0 0 ${q >= 3 ? 7 : 4}px ${QC[q] ?? '#fff'}` : undefined }}>
      <img src={iconURL(key)} alt="" style={{ width: size, height: size, display: "block" }} />
      {en !== undefined && en > 0 && <span style={{ position: "absolute", right: -2, bottom: -2, fontSize: 9, fontWeight: 800, color: en >= 7 ? "#ffd860" : "#9fdcff", background: "rgba(0,0,0,0.75)", borderRadius: 4, padding: "0 2px" }}>+{en}</span>}
    </span>
  );
  const hbtn = (k: string, lab: string, key: string, ic?: string, active?: boolean, color?: string) => (
    <button key={k} {...th(null, HBT[k] ? `${HBT[k]}${g && HBC[k] ? `\n持有數量：${HBC[k]?.(g.p) ?? 0}` : ''}\n快捷鍵 ${key}` : `${lab}（${key}）`)} style={{ ...hb, color: color ?? "#fff", borderColor: active ? "#60ff90" : "rgba(255,255,255,0.26)", boxShadow: active ? "0 0 10px rgba(96,255,144,0.6)" : "none" }} onClick={() => act(k)}>
      {ic && <img src={iconURL(ic)} alt="" style={{ width: 20, height: 20, display: "block", margin: "0 auto" }} />}
      {lab}<span style={hk}>{key}</span>
    </button>
  );
  const eqv = panel === 'bag' || panel === 'char';
  const fast = (f: () => void) => ({ onPointerDown: (e: { button: number; preventDefault: () => void }) => { if (e.button !== 0) return; e.preventDefault(); FASTT = Date.now(); f(); }, onClick: () => { if (Date.now() - FASTT > 600) f(); } });
  const eqSc = (it: Item): number => { if (!g) return 0; const s0 = idf(it).s; if (s0 === 9 || s0 === 10) { const a = g.p.eq[9], b = g.p.eq[10]; return !a || !b ? 0 : Math.min(itemScore(a), itemScore(b)); } const e = g.p.eq[s0]; return e ? itemScore(e) : 0; };
  const scView = (it: Item) => { if (!g) return null; const sc = itemScore(it), eq = g.p.eq.indexOf(it) >= 0, cur = eqSc(it), ok = clsOk(idf(it), g.p.cls); return <span style={{ fontSize: 11 }}><b style={{ color: '#a8ecff' }}>評分 {sc}</b>{!eq && ok && <span style={{ color: sc > cur ? '#70f090' : sc < cur ? '#ff8a8a' : 'rgba(238,242,248,0.6)', marginLeft: 6 }}>{cur > 0 ? `（目前穿著 ${cur}）` : '（該部位未裝備）'}</span>}</span>; };
  const dropEq = (e: { preventDefault: () => void; dataTransfer: DataTransfer }, slot: number): void => { e.preventDefault(); const gg = gRef.current; if (!gg) return; const id = Number(e.dataTransfer.getData('text')); const it = gg.p.inv.find((x: Item) => x.id === id); if (it) { equip(gg, it, slot); setSelSlot(slot); bump(); } };
  const slotS: CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '5px 2px', color: '#eef2f8', cursor: 'pointer', fontFamily: theme.font.family, touchAction: 'manipulation', textAlign: 'center' };
  const itemRow = (it: Item, btns: "bag" | "shop") => {
    const d = idf(it), ok = !!g && clsOk(d, g.p.cls), hb2 = !!g && canEnch(d) && (d.s === 0 ? g.p.bw : g.p.ba) > 0;
    return (
      <div key={it.id} {...th(it)} style={rowS}>
        <span draggable={btns === 'bag' && ok} style={{ cursor: btns === 'bag' && ok ? 'grab' : 'default', display: 'inline-flex' }} onDragStart={(e: { dataTransfer: DataTransfer }) => { e.dataTransfer.setData('text', String(it.id)); }}>{ico(iconKey(it), 34, it.en, it.q)}</span>
        <div style={{ flex: '1 1 130px' }}>
          <div style={{ color: itemCol(it) }}>{it.q ? `【${QN[it.q] ?? ''}】` : ''}{itemName(it)}{d.r ? ' ★' : ''}</div>
          {it.af && it.af.length > 0 && <div style={{ ...subS, color: QC[it.q ?? 0] ?? '#eef2f8' }}>附加：{afText(it)}</div>}
          <div style={{ ...subS, color: ok ? 'rgba(238,242,248,0.6)' : '#ff9a9a' }}>{itemDesc(it)}</div>
          {d.sp && <div style={{ ...subS, color: '#ffc080' }}>{SPN[d.sp] ?? ''}</div>}
          {setOf(it) && <div style={{ ...subS, color: '#ffc080' }}>{setText(it, g ? g.p.eq : [])}</div>}
          <div>{scView(it)}</div>
        </div>
        {btns === 'shop' ? <button style={sb} {...fast(() => { if (g) { sell(g, it); bump(); } })}>出售 {sellPrice(it)}</button> : (
          <>
            {ok && <button style={sb} onClick={() => { if (g) { equip(g, it); bump(); } }}>裝備</button>}
            {canEnch(d) && <button style={sb} onClick={() => doEnchant(it, false)}>強化</button>}
            {hb2 && <button style={{ ...sb, color: '#ffe08a' }} onClick={() => doEnchant(it, true)}>祝福</button>}
          </>
        )}
      </div>
    );
  };

  const slotBtn = (i: number) => {
    if (!g) return null;
    const it = g.p.eq[i] ?? null;
    return (
      <button key={i} {...th(it, it ? '' : `${SLOTN[i] ?? ''}（空）`)} style={{ ...slotS, width: 54, padding: '3px 1px', borderColor: selSlot === i ? '#e8c870' : it && idf(it).r ? 'rgba(255,150,80,0.7)' : 'rgba(255,255,255,0.2)', background: selSlot === i ? 'rgba(232,200,112,0.15)' : 'rgba(255,255,255,0.05)' }} onClick={() => setSelSlot(selSlot === i ? -1 : i)} onDragOver={(e: { preventDefault: () => void }) => e.preventDefault()} onDrop={(e: { preventDefault: () => void; dataTransfer: DataTransfer }) => dropEq(e, i)}>
        {it ? ico(iconKey(it), 32, it.en, it.q) : <span style={{ width: 32, height: 32, display: 'inline-block', opacity: 0.3, border: '1px dashed #ffffff', borderRadius: 6 }} />}
        <span style={{ display: 'block', fontSize: 9, opacity: 0.75 }}>{SLOTN[i]}</span>
      </button>
    );
  };
  const cellS: CSSProperties = { width: 40, height: 40, boxSizing: 'border-box', borderRadius: 5, border: '1px solid rgba(255,255,255,0.12)', background: 'radial-gradient(circle at 50% 40%, rgba(60,52,40,0.9), rgba(16,12,8,0.95))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' };
  const synView = () => {
    if (!g) return null;
    const gs = synGroups(g.p);
    return (
      <div>
        <div style={{ ...subS, margin: '4px 0 6px' }}>把 3 件「同顏色、同類型」的裝備合成為 1 件更高一階顏色的裝備，種類與屬性隨機。顏色順序：白 → 綠 → 藍 → 紅 → 紫 → 金。身上穿著的裝備不會被拿去合成，會優先消耗評分最低的 3 件。</div>
        {gs.length === 0 && <div style={subS}>背包裡沒有可合成的裝備。</div>}
        {gs.map((x: SynG) => { const can = x.its.length >= 3; return (
          <div key={`${x.k}|${x.q}`} style={{ ...rowS, opacity: can ? 1 : 0.5 }}>
            <div style={{ display: 'flex', gap: 2 }}>{x.its.slice(0, 3).map((it: Item) => <span key={it.id} {...th(it)} style={{ display: 'inline-flex' }}>{ico(iconKey(it), 28, it.en, it.q)}</span>)}</div>
            <div style={{ flex: '1 1 120px' }}><span style={{ color: QC[x.q] ?? '#fff' }}>{QN[x.q] ?? ''}{synName(x.k)}</span> ×{x.its.length}<div style={subS}>→ <span style={{ color: QC[x.q + 1] ?? '#fff' }}>{QN[x.q + 1] ?? ''}{synName(x.k)}</span> · {synCost(x.q)} 金幣{can ? '' : `（還差 ${3 - x.its.length} 件）`}</div></div>
            <button style={{ ...sb, color: can ? '#ffe08a' : '#8890a0' }} onClick={() => { if (!can) return; setMsg(synth(g, x.k, x.q)); setBagSel(-1); persist(g); bump(); }}>合成</button>
          </div>); })}
      </div>
    );
  };
  const bagView = () => {
    if (!g) return null;
    const cap = invCap(g.p), sel = g.p.inv.find((x: Item) => x.id === bagSel) ?? null, xs = xsArr(g.p);
    const tabB = (k: number, t: string) => <button style={{ ...sb, background: bagTab === k ? '#5a4420' : 'rgba(255,255,255,0.08)', borderColor: bagTab === k ? '#e8c060' : 'rgba(255,255,255,0.28)', color: bagTab === k ? '#ffe08a' : '#eef2f8' }} onClick={() => setBagTab(k)}>{t}</button>;
    return (
      <div>
        <div style={sec}>道具</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '6px 0', alignItems: 'center' }}>
          {([['pr', g.p.pots], ['pg', g.p.green], ['pb', g.p.blue], ['sr', g.p.scrolls], ['sw', g.p.ew], ['sa', g.p.ea], ['sx', g.p.bw], ['sy', g.p.ba]] as [string, number][]).map(([k, n]: [string, number]) => (
            <span key={k} {...th(null, `${ITIP[k] ?? ''}\n持有數量：${n}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' }}>{ico(k, 28)}<b>{n}</b></span>
          ))}
          {(g.p.ab ?? 0) > 0 && <span {...th(null, `防爆卷軸\n強化失敗會爆裝時自動消耗 1 張，裝備保留、強化值不變。\n持有數量：${g.p.ab ?? 0}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' }}>{ico('sp', 28)}<b>{g.p.ab ?? 0}</b></span>}
          {(g.p.rs ?? 0) > 0 && <span {...th(null, `洗鍊石\n紫色／金色武器與項鍊重新隨機詞綴（鍛造屋）\n持有數量：${g.p.rs ?? 0}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' }}>{ico('rk', 28)}<b>{g.p.rs ?? 0}</b></span>}
          {(g.p.cpn ?? 0) > 0 && <span {...th(null, `${CPN[g.p.cls] ?? ''}\n${CPD[g.p.cls] ?? ''}\n持有數量：${g.p.cpn ?? 0}\n點一下使用`)} onClick={() => { drinkCp(g, false); bump(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>{ico(`pk${g.p.cls}`, 28)}<b>{g.p.cpn ?? 0}</b></span>}
          {xs.map((n: number, i: number) => n > 0 ? <span key={`x${i}`} {...th(null, `${xsName(i)}\n持有數量：${n}\n點一下使用`)} onClick={() => { setMsg({ t: useXs(g, i), ok: true }); bump(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>{ico(`se${Math.floor(i / 3) + 1}`, 28)}<b>{n}</b><span style={{ fontSize: 9, opacity: 0.7 }}>{XSM[i % 3]}分</span></span> : null)}
        </div>
        <div style={rowS}><button style={sb} onClick={() => { recall(g); bump(); }}>使用回城卷軸</button><button style={sb} onClick={() => { drinkGreen(g, false); bump(); }}>喝綠水</button><button style={sb} onClick={() => { g.p.inv.sort((a: Item, b: Item) => idf(a).s - idf(b).s || itemScore(b) - itemScore(a)); bump(); }}>整理</button><button style={{ ...sb, color: '#a0ffa0' }} onClick={() => { const n = equipBest(g); addLog(g, n > 0 ? `一鍵穿最好：換上了 ${n} 件評分更高的裝備。` : '身上已經是評分最高的裝備了。', n > 0 ? '#a0ffa0' : '#c0c8d0'); bump(); }}>一鍵穿最好</button></div>
        <div style={{ ...rowS, flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>一鍵販賣：</span>
          {QN.map((n: string, q: number) => <label key={n} style={{ fontSize: 12, color: QC[q] ?? '#fff', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}><input type="checkbox" checked={SELLQ[q] ?? false} onChange={() => { SELLQ[q] = !SELLQ[q]; bump(); }} />{n.slice(0, 1)}</label>)}
          <button style={{ ...sb, color: '#ffd860' }} {...fast(() => { const r = sellByQ(g); setBagSel(-1); addLog(g, r[0] > 0 ? `一鍵販賣 ${r[0]} 件，獲得 ${r[1]} 金幣。` : '沒有符合勾選品質的物品（已裝備的不會賣）。', '#ffd860'); bump(); })}>賣出（{sellList(g).length} 件）</button>
        </div>
        <div style={{ display: 'flex', gap: 6, margin: '8px 0 4px' }}>{tabB(0, `背包 ${g.p.inv.length}/${cap}`)}{tabB(1, '合成')}</div>
        {bagTab === 1 ? synView() : (
          <div>
            <div style={{ ...subS, marginBottom: 4 }}>{touch ? '點物品查看並裝備，再點一次取消選取。' : '點物品查看、點兩下直接裝備，也可以拖到左邊的裝備欄。'}邊框顏色代表品質，比較請看「評分」。</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 40px)', gap: 3, maxHeight: 264, overflowY: 'auto', padding: 4, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(232,200,112,0.35)', borderRadius: 6, justifyContent: 'center' }}>
              {Array.from({ length: Math.max(cap, g.p.inv.length) }, (_u: unknown, i: number) => { const it = g.p.inv[i]; if (!it) return <div key={`e${i}`} style={cellS} />; const ok = clsOk(idf(it), g.p.cls), on = bagSel === it.id; return (
                <div key={it.id} {...th(it)} draggable={ok} onDragStart={(e: { dataTransfer: DataTransfer }) => { e.dataTransfer.setData('text', String(it.id)); }} onClick={() => setBagSel(on ? -1 : it.id)} onDoubleClick={() => { if (ok) { equip(g, it); setBagSel(-1); bump(); } }} style={{ ...cellS, cursor: 'pointer', borderColor: on ? '#ffe08a' : (it.q ?? 0) > 0 ? hexA(QC[it.q ?? 0] ?? '#ffffff', 0.85) : 'rgba(255,255,255,0.22)', boxShadow: on ? '0 0 8px #ffe08a' : (it.q ?? 0) >= 4 ? `0 0 6px ${QC[it.q ?? 0] ?? '#fff'}` : 'none', opacity: ok ? 1 : 0.6 }}>{ico(iconKey(it), 34, it.en, it.q)}{idf(it).r ? <span style={{ position: 'absolute', right: 1, top: -2, fontSize: 9, color: '#ffb060' }}>★</span> : null}</div>); })}
            </div>
            {sel && (() => { const d = idf(sel), ok = clsOk(d, g.p.cls), hb2 = canEnch(d) && (d.s === 0 ? g.p.bw : g.p.ba) > 0; return (
              <div style={{ ...rowS, marginTop: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 6 }}>
                {ico(iconKey(sel), 34, sel.en, sel.q)}
                <div style={{ flex: '1 1 150px' }}>
                  <div style={{ color: itemCol(sel) }}>{sel.q ? `【${QN[sel.q] ?? ''}】` : ''}{itemName(sel)}{d.r ? ' ★' : ''} <span style={subS}>{SLOTN[d.s] ?? ''}</span></div>
                  <div style={{ ...subS, color: ok ? 'rgba(238,242,248,0.6)' : '#ff9a9a' }}>{itemDesc(sel)}{ok ? '' : `（${CLN[g.p.cls] ?? ''}無法裝備）`}</div>
                  {sel.af && sel.af.length > 0 && <div style={{ ...subS, color: QC[sel.q ?? 0] ?? '#eef2f8' }}>附加：{afText(sel)}</div>}
                  <div>{scView(sel)}</div>
                </div>
                {ok && <button style={{ ...sb, background: '#2a6a4a' }} onClick={() => { equip(g, sel); setBagSel(-1); bump(); }}>裝備</button>}
                {canEnch(d) && <button style={sb} onClick={() => doEnchant(sel, false)}>強化</button>}
                {hb2 && <button style={{ ...sb, color: '#ffe08a' }} onClick={() => doEnchant(sel, true)}>祝福</button>}
              </div>); })()}
          </div>
        )}
        <div style={{ ...subS, marginTop: 8 }}>強化規則：每件裝備有自己的安定值（多數武器 +6、防具 +4，精靈裝備 +6，稀有武器與 T 恤等特殊裝備 +0），安定值以內必定成功；祝福卷軸一次 +1～3。超過安全值後越來越難，失敗時裝備消失（背包裡有防爆卷軸時會自動消耗 1 張保住裝備）。戒指、項鍊、耳環無法強化。</div>
      </div>
    );
  };
  const dsOwn = (x: DS, i: number): string => { if (!g) return ''; const p0 = g.p; if (x.ic === 'sp') return `持有 ${p0.ab ?? 0} 張`; if (x.ic.slice(0, 2) === 'se') return `持有 ${xsArr(p0)[i - 1] ?? 0} 張`; if (x.ic === 'rk') return `持有 ${p0.rs ?? 0} 個`; if (x.ic === 'xb') return `目前 ${invCap(p0)} 格`; if (x.ic === 'xw') return `目前 ${bankCap(p0)} 格`; return ''; };
  return (
    <div style={{ background: theme.bg.base, color: theme.text.primary, fontFamily: theme.font.family, padding: 12, boxSizing: "border-box" }}>
      {TITLE_STUB && <Page title="銀月傳說" lang="zh-Hant" />}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ ...theme.font.heading3, fontWeight: theme.weight.semibold, color: theme.text.primary }}>銀月傳說</div>
          <div style={{ ...theme.font.body2, color: theme.text.secondary }}>單機動作 RPG：打怪練功、掛機、衝裝備</div>
        </div>
        {scr === "play" && <button style={chromeBtn} onClick={() => { const gg = gRef.current; if (gg) persist(gg); setAskTitle(true); }}>回到標題畫面</button>}
      </div>
      <div ref={wrapRef} tabIndex={0} style={{ position: "relative", width: "100%", borderRadius: 12, overflow: "hidden", border: `1px solid ${theme.border.default}`, outline: "none", background: "#101418", userSelect: "none", WebkitUserSelect: "none", WebkitTapHighlightColor: "transparent" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: 400, touchAction: "none" }} />
        {scr === "play" && g && !((narrow || eqv) && panel !== "none") && (
          <div style={{ position: "absolute", right: panel !== "none" ? 386 : 8, bottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {hbtn("auto", g.auto ? "掛機中" : "掛機", "F", undefined, g.auto, g.auto ? "#80ffa0" : "#fff")}
            {hbtn("atk", "攻擊", touch ? "最近" : "空白鍵")}
            {hbtn("skills", "技能", "K", undefined, false, "#c8d8ff")}
            {hbtn("pot", `紅水 ${g.p.pots}`, "1", "pr")}
            {hbtn("green", `綠水 ${g.p.green}`, "4", "pg", g.p.hasteT > 0)}
            {hbtn("blue", `藍水 ${g.p.blue}`, "5", "pb")}
            {hbtn("recall", `回城 ${g.p.scrolls}`, "3", "sr")}
            {hbtn("bag", "背包", "I")}
            {hbtn("char", "角色", "C", undefined, false, ptsLeft(g.p) > 0 ? '#80ffa0' : '#fff')}
            {hbtn("set", "設定", "O")}
            {hbtn("dia", "商城", "P", undefined, false, "#80e8ff")}
            {hbtn("map", MBIG ? "關地圖" : "地圖", "M", undefined, MBIG, "#ffe8a0")}
            {inTown(g) ? hbtn("shop", "商店", "B", undefined, false, "#a0ffa0") : <span />}
          </div>
        )}
        {scr === "play" && g && !((narrow || eqv) && panel !== "none") && (g.p.pa ?? -1) >= 0 && (g.p.pets ?? []).length > 0 && (
          <div style={{ position: 'absolute', left: 8, bottom: narrow ? 102 + 2 * 46 + 4 : 102 + 46 + 4, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', fontFamily: theme.font.family }}>
            <span style={{ fontSize: 11, color: '#ffe08a', background: 'rgba(10,8,6,0.6)', borderRadius: 6, padding: '2px 6px' }}>寵物 {PSP[g.p.pets?.[g.p.pa ?? 0]?.[0] ?? 0]?.n ?? ''}</span>
            {PMN.map((n: string, k: number) => <button key={n} style={{ ...sb, padding: '2px 8px', fontSize: 11, opacity: PHIDE ? 0.45 : 1, background: !PHIDE && PMODE === k ? '#5a4420' : 'rgba(40,34,26,0.92)', borderColor: !PHIDE && PMODE === k ? '#e8c060' : undefined }} onClick={() => { PMODE = k; if (PHIDE) { PHIDE = false; BPT.x = g.p.x; BPT.y = g.p.y; } addLog(g, `寵物：${n}`, '#ffe08a'); bump(); }}>{n}</button>)}
            <button style={{ ...sb, padding: '2px 8px', fontSize: 11 }} onClick={() => { PHIDE = !PHIDE; BPT.tg = null; if (!PHIDE) { BPT.x = g.p.x; BPT.y = g.p.y; } addLog(g, PHIDE ? '收回了寵物。' : '召喚了寵物！', '#ffe08a'); bump(); }}>{PHIDE ? '召喚' : '收回'}</button>
          </div>
        )}
        {scr === "play" && g && !((narrow || eqv) && panel !== "none") && (
          <div style={{ position: 'absolute', left: 8, bottom: 102, display: 'grid', gridTemplateColumns: `repeat(${narrow ? 4 : 8}, 42px)`, gap: 4 }}>
            <style>{'@keyframes acdash{to{stroke-dashoffset:-36}}'}</style>
            {g.p.hb.map((id: number, i: number) => {
              const s = SK[id], base = BSK.indexOf(id) >= 0, cdl = s ? (base ? Math.max(0, g.p.skCd) : Math.max(0, (g.p.scd[id] ?? 0) - g.time)) : 0;
              return (
                <button key={i} onPointerEnter={th(null, s ? `${s.n}\n${s.d}\n${s.k === 12 ? '被動技能' : `消耗 ${s.k === 11 ? `${s.v} MP/秒` : `${s.mp} MP`} · 冷卻 ${s.cd} 秒`}${cdl > 0 ? `（剩 ${Math.ceil(cdl)} 秒）` : ''}\n${skNext(g.p, id)}\n${skLvText(g.p, id)}\n${AUTO.has(i) ? '自動施放：開啟' : '自動施放：關閉'}（往下拖開啟、往上拖關閉、右鍵切換）` : '空的快捷欄\n到技能視窗（K）把技能放進來').onPointerEnter} onPointerLeave={() => setTip(null)} style={{ ...hb, width: 42, minHeight: 42, padding: 2, touchAction: 'none', opacity: s && g.p.mp < s.mp ? 0.55 : 1 }}
                  onDragStart={(e) => e.preventDefault()}
                  onPointerDown={(e) => { if (e.button === 2) return; HBD.i = i; HBD.y = e.clientY; HBD.x = e.clientX; HBD.moved = false; HBD.done = false; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ } }}
                  onPointerMove={(e) => { if (HBD.i !== i || HBD.done || !s || s.k === 12) return; const dy = e.clientY - HBD.y, dx = e.clientX - HBD.x; if (Math.abs(dy) > 7 || Math.abs(dx) > 7) HBD.moved = true; if (Math.abs(dy) < 16 || Math.abs(dy) < Math.abs(dx)) return; HBD.done = true; const on = dy > 0 ? !AUTO.has(i) : false; if (on) AUTO.add(i); else AUTO.delete(i); addLog(g, `${s.n}：自動施放 ${on ? '開啟' : '關閉'}`, on ? '#ffe060' : '#c0c8d0'); saveAuto(); bump(); }}
                  onPointerUp={(e) => { if (HBD.i === i) HBD.i = -1; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ } }}
                  onPointerCancel={() => { HBD.i = -1; }}
                  onContextMenu={(e) => { e.preventDefault(); if (!s || s.k === 12) return; if (AUTO.has(i)) AUTO.delete(i); else AUTO.add(i); addLog(g, `${s.n}：自動施放 ${AUTO.has(i) ? '開啟' : '關閉'}`, AUTO.has(i) ? '#ffe060' : '#c0c8d0'); saveAuto(); bump(); }}
                  onClick={() => { if (HBD.moved) { HBD.moved = false; return; } act(`h${i}`); }}>
                  {s ? <img src={iconURL(`k${id}`)} alt="" draggable={false} style={{ width: 30, height: 30, display: 'block', margin: '0 auto', position: 'relative', zIndex: 1, pointerEvents: 'none' }} /> : <span style={{ opacity: 0.35, fontSize: 18 }}>＋</span>}
                  {s && AUTO.has(i) && <svg viewBox="0 0 42 42" style={{ position: 'absolute', left: -1, top: -1, width: 'calc(100% + 2px)', height: 'calc(100% + 2px)', pointerEvents: 'none', zIndex: 2, overflow: 'visible', filter: 'drop-shadow(0 0 3px #ffc830)' }}><rect x="1.5" y="1.5" width="39" height="39" rx="9" fill="none" stroke="#ffd040" strokeWidth="2.5" strokeDasharray="12 6" style={{ animation: 'acdash 1.2s linear infinite' }} /></svg>}
                  <span style={{ position: 'absolute', left: 3, top: 1, fontSize: 9, opacity: 0.8 }}>{touch ? i + 1 : HK[i]}</span>
                  {s && <span style={{ position: 'absolute', right: 2, bottom: 0, fontSize: 9, fontWeight: 800, color: skLv(g.p, id) >= 5 ? '#ffc830' : '#ffe8b0', zIndex: 3, textShadow: '0 0 2px #000, 0 0 2px #000' }}>Lv{skLv(g.p, id)}</span>}
                  {cdl > 0 && <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{Math.ceil(cdl)}</span>}
                </button>
              );
            })}
          </div>
        )}
        {scr === "play" && g && !pause && !askTitle && (() => {
          const atk = pkShow(g);
          if (!atk) return null;
          return (
            <button type="button" onPointerDown={(e: { stopPropagation: () => void; preventDefault: () => void }) => { e.stopPropagation(); e.preventDefault(); }} onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); pkRetaliate(g); bump(); }}
              style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%, -50%)', zIndex: 9, pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 14, border: '2px solid #ff6060', background: 'rgba(70,10,12,0.94)', color: '#ffe8e0', cursor: 'pointer', fontFamily: theme.font.family, boxShadow: '0 0 22px rgba(255,50,40,0.55)', animation: 'pkpulse 1.1s ease-in-out infinite' }}>
              <style>{'@keyframes pkpulse{0%,100%{box-shadow:0 0 14px rgba(255,50,40,0.4)}50%{box-shadow:0 0 26px rgba(255,80,50,0.85)}}'}</style>
              <span style={{ fontSize: 28, lineHeight: 1, filter: 'drop-shadow(0 0 4px #ff4040)' }}>⚔</span>
              <span style={{ textAlign: 'left' }}><b style={{ display: 'block', fontSize: 16 }}>正在被 {atk.n} 攻擊</b><span style={{ fontSize: 11, opacity: 0.8 }}>點我反擊（掛機中也可）</span></span>
            </button>
          );
        })()}
        {scr === "play" && g && !pause && !askTitle && !(narrow && panel !== "none") && (() => {
          const aq = QD.map((q: QDef, i: number) => ({ q, i, v: g.p.q[i] ?? 0 })).filter((o: { q: QDef; i: number; v: number }) => o.v > 0);
          const wbm = WBS.m && WBS.m.dead <= 0 && WID === 0 ? WBS.m : null;
          const xq = trackX(g.p);
          if ((!aq.length && !xq.length && !wbm) || MBIG) return null;
          return (
            <div style={{ position: 'absolute', left: 8, top: 166, maxWidth: narrow ? 180 : 240, pointerEvents: 'none', fontFamily: theme.font.family, zIndex: 2 }}>
              {wbm && <button style={{ ...sb, pointerEvents: 'auto', display: 'block', marginBottom: 6, padding: '4px 10px', fontSize: 12, background: 'rgba(120,24,10,0.92)', borderColor: '#ff8060', color: '#ffe0c0' }} onClick={() => { g.p.tgt = null; g.qg = -1; if (g.auto) g.autoPause = 20; let spot: Pt | null = null; for (let rr = 46; rr <= 140 && !spot; rr += 14) for (let k = 0; k < 16; k++) { const a = Math.PI / 2 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (TAU / 16), sx = wbm.x + Math.cos(a) * rr, sy = wbm.y + Math.sin(a) * rr; if (free(sx, sy, PR, false) && (REACH[Math.floor(sy / TS) * MW + Math.floor(sx / TS)] ?? 0) === 1) { spot = { x: sx, y: sy }; break; } } if (spot) { tpTo(g, spot.x, spot.y); g.p.face = Math.atan2(wbm.y - spot.y, wbm.x - spot.x); g.p.tgt = wbm; g.p.repath = 0; } else goTo(g, wbm.x, wbm.y + 30); addLog(g, `${spot ? '傳送到' : '前往'}世界首領 ${MD[wbm.d]?.n ?? ''} 身邊！`, '#ff9a70'); bump(); }}>⚔ 世界首領：立即前往</button>}
              {wbm && (() => { const tot = Math.max(1, WBS.P + WBS.B), L = Object.entries(WBS.D).map(([n, v]: [string, number]) => ({ n, v, me: false })).concat([{ n: CLN[g.p.cls] ?? '你', v: WBS.P, me: true }]).sort((a, b) => b.v - a.v).slice(0, 3); return (
                <div style={{ marginBottom: 6, background: 'rgba(40,8,4,0.78)', border: '1px solid rgba(255,128,96,0.7)', borderRadius: 8, padding: '5px 8px', fontSize: 12, color: '#ffe0c0' }}>
                  <div style={{ fontWeight: 800, color: '#ff9070', marginBottom: 2 }}>世界首領傷害排行</div>
                  {L.map((r, i: number) => <div key={r.n} style={{ display: 'flex', gap: 6, color: r.me ? '#80ffa0' : '#ffe0c0' }}><span style={{ color: ['#ffd860', '#d8dce4', '#e0a070'][i] }}>{i + 1}.</span><span style={{ flex: 1 }}>{r.n}{r.me ? '（你）' : ''}</span><b>{Math.round((r.v / tot) * 100)}%</b></div>)}
                </div>); })()}
              {aq.length + xq.length > 0 && <button style={{ ...sb, pointerEvents: 'auto', padding: '3px 9px', fontSize: 11, background: 'rgba(30,22,14,0.85)', borderColor: '#a8843a', color: '#ffe08a' }} onClick={() => setQOpen(!qOpen)}>任務 {aq.length + xq.length} {qOpen ? '▲' : '▼'}</button>}
              {qOpen && aq.length + xq.length > 0 && (
                <div style={{ marginTop: 4, background: 'rgba(10,8,6,0.6)', border: '1px solid rgba(168,132,58,0.6)', borderRadius: 8, padding: '5px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {aq.map((o: { q: QDef; i: number; v: number }) => {
                    const q = o.q, ready = o.v - 1 >= q.c;
                    return (
                      <div key={o.i} style={{ fontSize: 11, lineHeight: 1.35, pointerEvents: 'auto', cursor: 'pointer' }} onClick={() => { if (ready) guideQuest(g, q); else huntTarget(g, q); bump(); }}>
                        <div style={{ color: ready ? '#80ffa0' : '#ffe08a', fontWeight: 700 }}>{q.n}</div>
                        {ready ? <div style={{ color: '#80ffa0' }}>完成！請回報：{qNpcName(q)} @ {TOWNS[q.t]?.n ?? '城鎮'}<span style={{ opacity: 0.7 }}>（點我前往）</span></div> : <div style={{ color: '#dfe6f0' }}>{MD[q.m]?.n ?? '目標'} {Math.min(q.c, o.v - 1)}/{q.c} <span style={{ opacity: 0.7 }}>· {(MD[q.m]?.z ?? 0) >= 8 ? DUNS[(MD[q.m]?.z ?? 8) - 8]?.n ?? '' : ZN[(MD[q.m]?.z ?? 0) + 1] ?? ''}（點我導引）</span></div>}
                      </div>
                    );
                  })}
                  {xq.map((o: TX) => (
                    <div key={o.k} style={{ fontSize: 11, lineHeight: 1.35, pointerEvents: 'auto', cursor: 'pointer' }} onClick={() => { if (o.ready) guideQuest(g, { ...fakeQ(o.m), n: o.n }); else if (o.m >= 0) huntTarget(g, fakeQ(o.m)); bump(); }}>
                      <div style={{ color: o.ready ? '#80ffa0' : o.k === 'mq' ? '#ffd0a0' : '#ffb070', fontWeight: 700 }}>{o.n}</div>
                      <div style={{ color: o.ready ? '#80ffa0' : '#dfe6f0' }}>{o.t}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
        {scr === "play" && g && bkRem && !pause && !askTitle && (
          <div style={{ position: 'absolute', left: '50%', top: 54, transform: 'translateX(-50%)', zIndex: 7, display: 'flex', gap: 6, alignItems: 'center', padding: '6px 10px', borderRadius: 10, background: 'rgba(20,40,80,0.92)', border: '1px solid #8ab4ff', fontFamily: theme.font.family, color: '#eef2f8', fontSize: 12 }}>
            <span>備份提醒：瀏覽器存檔可能被清除，建議複製存檔碼保存。</span>
            <button style={{ ...sb, background: '#2a5aa8', borderColor: 'transparent', padding: '3px 10px' }} onClick={() => { exportCode(); addLog(g, '已複製存檔碼，請貼到備忘錄或訊息保存。', '#9fdcff'); }}>複製存檔碼</button>
            <button style={{ ...sb, padding: '3px 8px' }} onClick={() => { BKT = 0; setBkRem(false); }}>稍後</button>
          </div>
        )}
        {scr === "play" && g && MBIG && !pause && !askTitle && !(narrow && panel !== "none") && (
          <div style={{ position: 'absolute', ...(MBIG ? { left: 12 } : { right: 12 }), top: (MBIG ? 60 : 86) + MMR.h + 8, display: 'flex', gap: 4, zIndex: 2, fontFamily: theme.font.family }}>
            <button style={{ ...sb, padding: '2px 8px', fontSize: 12 }} onClick={() => { mmZoom(1); bump(); }}>＋</button>
            <button style={{ ...sb, padding: '2px 8px', fontSize: 12 }} onClick={() => { mmZoom(-1); bump(); }}>－</button>
            <button style={{ ...sb, padding: '2px 8px', fontSize: 12 }} onClick={() => { MBIG = !MBIG; bump(); }}>關閉地圖</button>
          </div>
        )}
        {scr === "play" && g && (pause || askTitle) && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6 }}>
            <div style={{ background: 'linear-gradient(180deg, rgba(44,34,24,0.98), rgba(18,14,10,0.98))', border: '2px solid #8a6a2a', boxShadow: 'inset 0 0 0 1px #e8c870', borderRadius: 12, padding: 16, width: 250, maxWidth: '86%', color: '#eef2f8', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center', fontFamily: theme.font.family }}>
              {askTitle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <b style={{ fontSize: 16 }}>回到標題畫面？</b>
                  <div style={subS}>進度已經自動存檔，回到標題後按「繼續遊戲」就能接著玩。</div>
                  <button style={{ ...sb, background: '#c84040', borderColor: '#c84040' }} onClick={() => { setAskTitle(false); pauseRef.current = false; setPause(false); toSelect(); }}>確定回到標題</button>
                  <button style={sb} onClick={() => setAskTitle(false)}>← 返回</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <b style={{ fontSize: 18, color: '#ffe08a' }}>遊戲暫停</b>
                  <button style={sb} onClick={() => { pauseRef.current = false; setPause(false); focusGame(); }}>繼續遊戲</button>
                  <button style={sb} onClick={() => { pauseRef.current = false; setPause(false); setPanelS('set'); }}>設定與存檔</button>
                  <button style={sb} onClick={() => setAskTitle(true)}>回到標題畫面</button>
                  <div style={subS}>按 ESC 或「繼續遊戲」返回遊戲</div>
                </div>
              )}
            </div>
          </div>
        )}
        {scr === "play" && g && panel !== "none" && (
          <div style={{ position: "absolute", zIndex: 6, left: narrow ? 6 : "auto", right: narrow ? 6 : 8, top: narrow ? (eqv ? 6 : "28%") : 8, bottom: 18, width: narrow ? "auto" : eqv ? Math.min(780, Math.max(370, sizeRef.current.w - 16)) : 370, background: "linear-gradient(180deg, rgba(44,34,24,0.97), rgba(18,14,10,0.97))", border: "2px solid #8a6a2a", boxShadow: "inset 0 0 0 1px #e8c870, inset 0 0 26px rgba(0,0,0,0.65), 0 6px 20px rgba(0,0,0,0.5)", borderRadius: 12, color: "#eef2f8", padding: 12, overflowY: "auto", boxSizing: "border-box", fontSize: 13, fontFamily: theme.font.family, userSelect: "text", WebkitUserSelect: "text" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <b style={{ fontSize: 16 }}>{eqv ? '角色・裝備・背包' : panel === 'dia' ? '鑽石商城' : panel === 'skills' ? '技能' : panel === 'set' ? "設定與存檔" : g.npc ? g.npc.n : '商店'}</b>
              <span style={{ color: "#ffd860" }}>金幣 {g.p.gold}{(panel === 'dia' || eqv) && <span style={{ color: '#80e8ff', marginLeft: 8 }}>鑽石 {g.p.dia ?? 0}</span>}</span>
              <button style={{ ...sb, color: '#ffe08a', borderColor: '#a8843a' }} onClick={() => reqRef.current("close")}>← 返回</button>
            </div>
            {msg && <div style={{ padding: "6px 8px", borderRadius: 8, marginBottom: 8, background: msg.ok ? "rgba(80,180,255,0.18)" : "rgba(255,60,80,0.18)", color: msg.ok ? "#9fdcff" : "#ff8a96" }}>{msg.t}</div>}
            {conf && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setConf(null)}><div style={{ padding: 16, maxWidth: 340, borderRadius: 10, background: "linear-gradient(180deg, #3a2a18, #1a120a)", border: "2px solid #ff9a40", boxShadow: '0 0 24px rgba(255,120,40,0.5)' }} onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ffb060', marginBottom: 6 }}>⚠ 超過安定值，可能會爆掉，確定要強化嗎？</div>
                <div style={{ marginBottom: 10, fontSize: 13 }}>{itemName(conf.it)}（安定值 {safeOf(idf(conf.it)) > 0 ? `+${safeOf(idf(conf.it))}` : '無'}）{conf.b ? '使用祝福卷軸，' : ''}失敗時裝備會直接消失。</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button style={{ ...sb, background: "#c84040", borderColor: "#c84040" }} onClick={() => doEnchant(conf.it, conf.b)}>確定強化</button>
                  <button style={sb} onClick={() => setConf(null)}>取消</button>
                </div>
              </div></div>
            )}
            {panel === "shop" && (
              <div>
                <div style={sec}>購買</div>
                {wares(g.p.cls, g.npc ? g.npc.k : 0).map((w: Ware) => (
                  <div key={w.n} style={rowS} {...th(null, `${w.n}\n${w.d}\n價格：${w.p} 金幣`)}>
                    {ico(w.ic, 34)}
                    <div style={{ flex: "1 1 120px" }}><div>{w.n}</div><div style={subS}>{w.d}</div></div>
                    <span style={{ color: "#ffd860" }}>{w.p}</span>
                    <button style={{ ...sb, opacity: g.p.gold < w.p ? 0.45 : 1 }} onClick={() => { buy(g, w); bump(); }}>購買</button>
                  </div>
                ))}
                <div style={sec}>出售背包裝備</div>
                {g.p.inv.length === 0 && <div style={subS}>背包裡沒有可出售的裝備。</div>}
                {g.p.inv.map((it: Item) => itemRow(it, "shop"))}
              </div>
            )}
            {panel === 'skills' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>到魔法商店購買技能書學習新技能，打怪也可能掉落技能書。點數字按鈕把技能放進快捷欄（{touch ? '畫面左下的技能列' : 'Q E R T G Z X V 鍵'}），再點一次可移除。掛機時會自動使用快捷欄技能。</div>
                {SK.map((s: SDef, id: number) => {
                  if (s.c !== g.p.cls) return null;
                  const known = g.p.sk.indexOf(id) >= 0;
                  return (
                    <div key={s.n} style={rowS}>
                      <span style={{ opacity: known ? 1 : 0.45 }}>{ico(`k${id}`, 34)}</span>
                      <div style={{ flex: '1 1 160px' }}>
                        <div style={{ color: known ? '#eef2f8' : '#8890a0' }}>{s.n} <span style={subS}>Lv.{s.lv} · {s.k === 12 ? '被動技能' : s.k === 11 ? `切換 · 開啟 ${s.mp}MP · 每秒 ${s.v}MP` : `${s.mp}MP · 冷卻 ${s.cd} 秒`}</span></div>
                        <div style={subS}>{s.d}</div>
                        {known && <div style={{ ...subS, color: '#ffe08a' }}>{skNext(g.p, id)} · {skLvText(g.p, id)}</div>}
                        {!known && <div style={{ ...subS, color: g.p.lv >= s.lv ? '#ffc080' : '#ff9a9a' }}>{s.p ? `魔法商店技能書 ${s.p} 金幣，也可能從怪物掉落` : id >= 40 ? '鑽石兌換限定技能書（找兌換商）' : '初始技能'}{g.p.lv < s.lv ? `（需要 Lv.${s.lv}）` : ''}</div>}
                      </div>
                      {known && s.k !== 12 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%' }}>
                          {HK.map((h: string, i: number) => (
                            <button key={h} style={{ ...sb, padding: '2px 7px', fontSize: 11, borderColor: g.p.hb[i] === id ? '#e8c870' : 'rgba(255,255,255,0.28)', color: g.p.hb[i] === id ? '#ffe08a' : '#eef2f8' }} onClick={() => { const cur = g.p.hb.indexOf(id); if (cur >= 0) g.p.hb[cur] = -1; if (cur !== i) g.p.hb[i] = id; bump(); }}>{touch ? i + 1 : h}</button>
                          ))}
                          <button style={{ ...sb, padding: '2px 8px', fontSize: 11, color: '#c8d8ff' }} onClick={() => { castSk(g, id); bump(); }}>施放</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {panel === 'ware' && (
              <div>
                <div style={sec}>倉庫 {g.p.bank.length}/{bankCap(g.p)}</div>
                {g.p.bank.length === 0 && <div style={subS}>倉庫是空的。兩座城鎮的倉庫共用。</div>}
                {g.p.bank.map((it: Item) => (
                  <div key={it.id} {...th(it)} style={rowS}>{ico(iconKey(it), 30, it.en, it.q)}<div style={{ flex: '1 1 130px' }}><div style={{ color: itemCol(it) }}>{itemName(it)}</div><div style={subS}>{itemDesc(it)}</div></div><button style={sb} onClick={() => { bankOut(g, it); persist(g); bump(); }}>取出</button></div>
                ))}
                <div style={sec}>背包 {g.p.inv.length}/{invCap(g.p)}</div>
                {g.p.inv.map((it: Item) => (
                  <div key={it.id} {...th(it)} style={rowS}>{ico(iconKey(it), 30, it.en, it.q)}<div style={{ flex: '1 1 130px' }}><div style={{ color: itemCol(it) }}>{itemName(it)}</div><div style={subS}>{itemDesc(it)}</div></div><button style={sb} onClick={() => { bankIn(g, it); persist(g); bump(); }}>存入</button></div>
                ))}
              </div>
            )}
            {panel === 'temple' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「願銀月女神守護你，冒險者。」</div>
                <div style={rowS}><div style={{ flex: '1 1 160px' }}>治療：生命與魔力完全恢復</div><button style={sb} onClick={() => { templeHeal(g); bump(); }}>免費治療</button></div>
                <div style={rowS}><div style={{ flex: '1 1 160px' }}>神聖祝福：AC -3，持續 10 分鐘{g.p.blessT > 0 ? `（剩 ${Math.ceil(g.p.blessT / 60)} 分）` : ''}</div><span style={{ color: '#ffd860' }}>300</span><button style={{ ...sb, opacity: g.p.gold < 300 ? 0.45 : 1 }} onClick={() => { templeBless(g); bump(); }}>祈求祝福</button></div>
                <div style={{ ...subS, marginTop: 8 }}>陣亡後會在最後造訪的城鎮復活：{TOWNS[g.p.home]?.n ?? ''}。</div>
              </div>
            )}
            {panel === 'tele' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「想去哪裡？我可以用魔法送你過去。」</div>
                {teleList(g).map((t: Tele) => (
                  <div key={t.n} style={rowS}><div style={{ flex: '1 1 150px' }}>{t.n}<div style={subS}>{t.d}</div></div><span style={{ color: '#ffd860' }}>{t.p}</span><button style={{ ...sb, opacity: g.p.gold < t.p ? 0.45 : 1 }} onClick={() => { teleport(g, t); reqRef.current('close'); bump(); }}>傳送</button></div>
                ))}
              </div>
            )}
            {panel === 'dia' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>用鑽石購買稀有道具。鑽石來源：打倒首領（野外首領 50～100、副本／挑戰／世界首領 200～500）、一般怪物偶爾掉落、每日任務。一次買 10 個以上打九折。</div>
                <div style={{ ...rowS, gap: 6 }}><span style={{ fontSize: 12 }}>購買數量</span><input type="number" min={1} max={999} value={dsN} onChange={(e: { target: { value: string } }) => setDsN(Math.max(1, Math.min(999, Math.floor(Number(e.target.value) || 1))))} style={{ width: 64, background: 'rgba(0,0,0,0.4)', color: '#eef2f8', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '3px 6px', fontFamily: theme.font.family }} />{[1, 10, 50].map((n: number) => <button key={n} style={{ ...sb, padding: '2px 8px' }} onClick={() => setDsN(n)}>{n}</button>)}</div>
                {DSHOP.map((x: DS, i: number) => (
                  <div key={x.n} style={rowS}>
                    {x.ic ? ico(x.ic, 34) : <span style={{ width: 34, height: 34, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #3a6a8a, #102030)', border: '1px solid #80e8ff', color: '#e8fcff', fontWeight: 800 }}>{x.tag ?? '◆'}</span>}
                    <div style={{ flex: '1 1 150px' }}><div>{x.n}</div><div style={subS}>{x.d}</div>{dsOwn(x, i) && <div style={{ ...subS, color: '#a8ecff' }}>{dsOwn(x, i)}</div>}</div>
                    <span style={{ color: '#80e8ff' }}>{x.c} 鑽</span>
                    <button style={sb} onClick={() => { setMsg(dsBuy(g, i, x.q ? dsN : 1)); persist(g); bump(); }}>{x.q && dsN > 1 ? `買 ${dsN}（${dsCost(x, dsN)}）` : '購買'}</button>
                    {x.q && dsN !== 10 && <button style={sb} onClick={() => { setMsg(dsBuy(g, i, 10)); persist(g); bump(); }}>×10（{dsCost(x, 10)}）</button>}
                  </div>
                ))}
              </div>
            )}
            {panel === 'dun' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「想挑戰哪個副本？我可以直接送你到任何一層。」</div>
                <div style={{ ...sec, color: '#ff9070' }}>BOSS 挑戰（單人挑戰場，擊敗後 {ACD / 60} 分鐘復活）</div>
                {ARENAS.map((a: ADef, i: number) => { const left = arenaLeft(i), ok = left <= 0, sug = Math.max(a.lv, MD[a.mi]?.lv ?? a.lv); return (
                  <div key={a.n} style={{ ...rowS, opacity: ok ? 1 : 0.55 }}><div style={{ flex: '1 1 150px' }}><span style={{ color: '#ffb080' }}>{a.n}</span> <span style={subS}>首領 Lv.{MD[a.mi]?.lv ?? a.lv}</span><div style={subS}>{a.d}</div><div style={{ ...subS, color: g.p.lv >= sug ? 'rgba(238,242,248,0.6)' : '#ffc080' }}>建議等級 Lv.{sug}（建議紫色以上裝備＋大量紅水） · {left > 0 ? `復活倒數 ${fmtT(left)}` : '可以挑戰'} · 掉落 2 件以上裝備（或 1 件首領限定）、經驗卷軸、200～500 鑽石</div></div><button style={{ ...sb, borderColor: '#ff8060' }} onClick={() => { setMsg({ t: enterArena(g, i), ok: true }); reqRef.current('close'); bump(); }}>挑戰</button></div>); })}
                {DUNS.map((D: DDef, di: number) => (
                  <div key={D.n}>
                    <div style={sec}>{D.n}（建議 Lv.{D.lv}+）</div>
                    {Array.from({ length: D.fl }, (_: unknown, f: number) => { const need = Math.max(1, D.lv - 5 + f * 3); return (
                      <div key={f} style={rowS}><div style={{ flex: '1 1 150px' }}>{D.n} {f + 1}F<div style={{ ...subS, color: g.p.lv >= need ? 'rgba(238,242,248,0.6)' : '#ffc080' }}>建議等級 Lv.{need}</div></div><button style={sb} onClick={() => { setMsg({ t: enterDun(g, di, f), ok: true }); bump(); }}>傳送</button></div>); })}
                  </div>
                ))}
              </div>
            )}
            {panel === 'pets' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「寵物會跟著你戰鬥並升級；變身卷軸讓你化身怪物；魔法娃娃提供被動加成。」</div>
                <div style={sec}>我的寵物</div>
                {(g.p.pets ?? []).length === 0 && <div style={subS}>還沒有寵物，從下方購買一隻吧。</div>}
                {(g.p.pets ?? []).map((pd: number[], i: number) => { const s = PSP[pd[0] ?? 0], on = g.p.pa === i; return (
                  <div key={i} style={rowS}><div style={{ flex: '1 1 160px' }}><div style={{ color: on ? '#80ffa0' : '#eef2f8' }}>{s?.n ?? ''} Lv.{pd[1] ?? 1}{on ? '（出戰中）' : ''}</div><div style={subS}>攻擊 {petAtk(pd)} · 技能「{s?.sk ?? ''}」 · 經驗 {Math.floor(pd[2] ?? 0)}/{petNeed(pd[1] ?? 1)}</div></div><button style={sb} onClick={() => { g.p.pa = on ? -1 : i; PHIDE = false; BPT.x = g.p.x + 26; BPT.y = g.p.y + 10; BPT.tg = null; persist(g); bump(); }}>{on ? '休息' : '出戰'}</button></div>); })}
                <div style={sec}>購買寵物</div>
                {PSP.map((s: PSp, i: number) => (
                  <div key={s.n} style={rowS}><div style={{ flex: '1 1 160px' }}>{s.n}<div style={subS}>{s.d}</div></div><span style={{ color: s.dia ? '#80e8ff' : '#ffd860' }}>{s.dia ? `${s.dia} 鑽` : s.c}</span><button style={sb} onClick={() => { setMsg({ t: buyPet(g, i), ok: true }); persist(g); bump(); }}>購買</button></div>
                ))}
                <div style={sec}>變身卷軸（每次 400 金幣，15 分鐘）</div>
                {(g.p.polyT ?? 0) > 0 && <button style={{ ...sb, margin: '4px 0' }} onClick={() => { g.p.polyT = 0; persist(g); bump(); }}>解除變身</button>}
                {POLY.map((f: { lv: number; m: number; n: string }, i: number) => (
                  <div key={f.n} style={{ ...rowS, opacity: g.p.lv >= f.lv ? 1 : 0.5 }}><div style={{ flex: '1 1 160px' }}>{f.n}（Lv.{f.lv} 以上）<div style={subS}>{polyText(i)}</div></div><button style={sb} onClick={() => { setMsg({ t: usePoly(g, i), ok: true }); persist(g); bump(); }}>{g.p.lv >= f.lv ? '變身' : `Lv.${f.lv}`}</button></div>
                ))}
                <div style={sec}>魔法娃娃（同時只能召喚一隻）</div>
                {DOLL.map((d: { n: string; m: number; c: number; d: string }, i: number) => { const own = (g.p.dolls ?? []).indexOf(i) >= 0, on = g.p.doll === i; return (
                  <div key={d.n} style={rowS}><div style={{ flex: '1 1 160px' }}><div style={{ color: on ? '#80ffa0' : '#eef2f8' }}>{d.n}{on ? '（召喚中）' : own ? '（已擁有）' : ''}</div><div style={subS}>{d.d}</div></div><span style={{ color: '#ffd860' }}>{own ? '' : d.c ? d.c : '兌換商'}</span><button style={{ ...sb, opacity: !own && !d.c ? 0.45 : 1 }} onClick={() => { setMsg({ t: buyDoll(g, i), ok: true }); persist(g); bump(); }}>{own ? (on ? '收回' : '召喚') : '購買'}</button></div>); })}
              </div>
            )}
            {panel === 'board' && (() => { const rows = boardRows(g), BN = ['等級', '裝備總評分', '擊殺數', '強化總值'], BC = ['#ffe08a', '#a8ecff', '#ff9a8a', '#d8b0ff']; return (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「銀月村的英雄榜，記錄著大陸上最強的冒險者們。」擊殺數包含怪物與 PvP 擊殺。</div>
                <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: 8 }}>
                  {BN.map((bn: string, k: number) => { const top = rows.slice().sort((a, b) => (b.v[k] ?? 0) - (a.v[k] ?? 0)), mi = top.findIndex((r) => r.me); return (
                    <div key={bn} style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${BC[k] ?? '#fff'}55` }}>
                      <div style={{ ...sec, margin: '0 0 4px', color: BC[k] }}>{bn}</div>
                      {top.slice(0, 10).map((r, i: number) => (
                        <div key={r.n} style={{ display: 'flex', fontSize: 12, padding: '1px 0', color: r.me ? '#80ffa0' : '#eef2f8', fontWeight: r.me ? 800 : 400 }}><span style={{ width: 22, color: i < 3 ? (['#ffd860', '#d8dce4', '#e0a070'][i] ?? '#fff') : '#a0a8b0' }}>{i + 1}.</span><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.n}{r.me ? '（你）' : ''}</span><b>{k === 3 ? `+${r.v[k]}` : k === 0 ? `Lv.${r.v[k]}` : (r.v[k] ?? 0).toLocaleString()}</b></div>))}
                      {mi >= 10 && <div style={{ fontSize: 12, color: '#80ffa0', borderTop: '1px dashed rgba(255,255,255,0.2)', marginTop: 2, paddingTop: 2 }}>{mi + 1}. {CLN[g.p.cls]}（你） <b>{k === 3 ? `+${rows[0]?.v[k] ?? 0}` : (rows[0]?.v[k] ?? 0).toLocaleString()}</b></div>}
                    </div>); })}
                </div>
              </div>); })()}
            {panel === 'rank' && (() => { const kc = g.p.kc ?? 0, r = rankOf(kc), nx = RKT[r + 1], b0 = RKT[r] ?? 0; return (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「累積擊殺怪物就能提升聲望階級，每個階級都有不同的能力加成。」</div>
                <div style={{ fontSize: 15, color: '#ffd860', fontWeight: 800 }}>目前階級：{RKN[r]}</div>
                <div style={subS}>累積擊殺 {kc} 隻{nx !== undefined ? ` · 下一階「${RKN[r + 1] ?? ''}」需要 ${nx} 隻（還差 ${nx - kc}）` : ' · 已達最高階級'}</div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, margin: '6px 0' }}><div style={{ width: `${nx !== undefined ? Math.min(100, ((kc - b0) / Math.max(1, nx - b0)) * 100) : 100}%`, height: '100%', background: '#ffd860', borderRadius: 4 }} /></div>
                <div style={subS}>目前加成：{rkText(r)}</div>
                <div style={sec}>階級表</div>
                {RKN.map((n: string, i: number) => i === 0 ? null : (
                  <div key={n} style={{ ...rowS, padding: '3px 0', color: i === r ? '#ffd860' : i < r ? '#a0c8a0' : '#eef2f8' }}><b style={{ width: 52 }}>{n}</b><span style={{ ...subS, width: 70 }}>{RKT[i]} 隻</span><span style={{ fontSize: 11, flex: '1 1 150px' }}>{rkText(i)}</span></div>
                ))}
              </div>); })()}
            {panel === 'xchg' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「完成每日任務拿鑽石，來我這裡換一般怪物不會掉的好東西！」每日任務在每天換日時重置。</div>
                <div style={sec}>每日任務（{today()}）</div>
                {DQD.map((D: DQ, i: number) => {
                  const q = dq(g.p), v = q[i] ?? 0, got = (q[i + 3] ?? 0) === 1, done = v >= D.c;
                  return (
                    <div key={D.n} style={rowS}>
                      <div style={{ flex: '1 1 170px' }}>
                        <div style={{ color: done ? '#80ffa0' : '#ffe08a' }}>{D.n}</div>
                        <div style={subS}>進度 {Math.min(v, D.c)}/{D.c} · 獎勵 {D.dia} 鑽石、{Math.round(D.gold * (1 + g.p.lv / 10))} 金幣</div>
                      </div>
                      {got ? <span style={subS}>已領取</span> : <button style={{ ...sb, opacity: done ? 1 : 0.45 }} onClick={() => { setMsg(claimDaily(g, i)); persist(g); bump(); }}>領取</button>}
                    </div>
                  );
                })}
                <div style={sec}>鑽石兌換（持有 {g.p.dia ?? 0} 鑽石）</div>
                {XCL.map((x: XC, i: number) => (
                  <div key={x.n} style={rowS} {...th(null, `${x.n}\n${x.d}\n價格：${x.c} 鑽石`)}>
                    <div style={{ flex: '1 1 170px' }}>
                      <div style={{ color: '#80e8ff' }}>{x.n}</div>
                      <div style={subS}>{x.d}</div>
                    </div>
                    <button style={{ ...sb, opacity: (g.p.dia ?? 0) >= x.c ? 1 : 0.45 }} onClick={() => { setMsg(exchange(g, i)); persist(g); bump(); }}>{x.c} 鑽石</button>
                  </div>
                ))}
              </div>
            )}
            {panel === 'craft' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「把打怪得到的材料交給我，我幫你打造好東西！」材料會在打怪時直接放進背包。</div>
                <div style={sec}>我的材料</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '4px 0' }}>{MTN.map((n: string, i: number) => <span key={n}>{n} <b style={{ color: '#ffe08a' }}>{mats(g.p)[i] ?? 0}</b></span>)}</div>
                <div style={sec}>配方</div>
                {RCP.map((r: Rcp, i: number) => {
                  const mm = mats(g.p), ok = r.m.every((c0: number, j: number) => (mm[j] ?? 0) >= c0) && g.p.gold >= r.g;
                  return (
                    <div key={r.n} style={rowS} {...th(null, `${r.n}\n需要：${r.m.map((c0: number, j: number) => (c0 ? `${MTN[j] ?? ''}×${c0}` : '')).filter((t0: string) => t0 !== '').join('、')}${r.g ? `、${r.g} 金幣` : ''}`)}>
                      <div style={{ flex: '1 1 170px' }}>
                        <div style={{ color: '#ffe08a' }}>{r.n}</div>
                        <div style={subS}>需要：{r.m.map((c0: number, j: number) => (c0 ? `${MTN[j] ?? ''}×${c0}` : '')).filter((t: string) => t !== '').join('、')}{r.g ? `、${r.g} 金幣` : ''}</div>
                      </div>
                      <button style={{ ...sb, opacity: ok ? 1 : 0.45 }} onClick={() => { setMsg(craft(g, i)); persist(g); bump(); }}>製作</button>
                    </div>
                  );
                })}
                <div style={sec}>洗鍊（重新隨機詞綴，可重複）</div>
                <div style={{ ...subS, marginBottom: 4 }}>紫色、金色的武器與項鍊可以洗鍊。每次洗鍊，以下三種費用擇一支付：</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: '2px 14px', fontSize: 12, padding: '6px 10px', marginBottom: 6, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <b style={{ opacity: 0.7 }}>付款方式</b><b style={{ opacity: 0.7 }}>每次費用</b><b style={{ opacity: 0.7 }}>目前持有</b>
                  <span style={{ color: '#ffd860' }}>● 金幣</span><span>{rerollGold(g.p).toLocaleString()}</span><span style={{ color: g.p.gold >= rerollGold(g.p) ? '#a0ffa0' : '#ff9090' }}>{g.p.gold.toLocaleString()}</span>
                  <span style={{ color: '#a8ecff' }}>◆ 鑽石</span><span>{RR_DIA}</span><span style={{ color: (g.p.dia ?? 0) >= RR_DIA ? '#a0ffa0' : '#ff9090' }}>{g.p.dia ?? 0}</span>
                  <span style={{ color: '#d0a0ff' }}>◈ 洗鍊石</span><span>1</span><span style={{ color: (g.p.rs ?? 0) >= 1 ? '#a0ffa0' : '#ff9090' }}>{g.p.rs ?? 0}</span>
                </div>
                {(() => {
                  const list = (g.p.eq.filter((it: Item | null): it is Item => it !== null) as Item[]).concat(g.p.inv).filter((it: Item) => canReroll(it));
                  if (!list.length) return <div style={subS}>目前沒有可洗鍊的裝備（紫色／金色武器或項鍊）。</div>;
                  return list.map((it: Item) => (
                    <div key={it.id} style={rowS} {...th(it)}>
                      <div style={{ flex: '1 1 170px' }}>
                        <div style={{ color: QC[it.q ?? 0] ?? '#fff' }}>{itemName(it)}{g.p.eq.indexOf(it) >= 0 ? '（已裝備）' : ''}</div>
                        <div style={subS}>{afText(it) || '無詞綴'}</div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        <button style={{ ...sb, opacity: g.p.gold >= rerollGold(g.p) ? 1 : 0.45 }} onClick={() => { setMsg(reroll(g, it, 0)); persist(g); bump(); }}>金幣 {rerollGold(g.p).toLocaleString()}</button>
                        <button style={{ ...sb, opacity: (g.p.dia ?? 0) >= RR_DIA ? 1 : 0.45 }} onClick={() => { setMsg(reroll(g, it, 1)); persist(g); bump(); }}>鑽石 ×{RR_DIA}</button>
                        <button style={{ ...sb, opacity: (g.p.rs ?? 0) >= 1 ? 1 : 0.45 }} onClick={() => { setMsg(reroll(g, it, 2)); persist(g); bump(); }}>洗鍊石 ×1</button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
            {panel === 'quest' && (
              <div>
                <div style={{ ...subS, marginBottom: 6 }}>「冒險者，這座城鎮需要你的幫忙！」</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {['主線任務', '狩獵任務', '每日懸賞'].map((n: string, k: number) => <button key={n} style={{ ...sb, background: QTAB === k ? '#5a4420' : 'rgba(40,34,26,0.92)', borderColor: QTAB === k ? '#e8c060' : undefined }} onClick={() => { QTAB = k; bump(); }}>{n}</button>)}
                </div>
                {QTAB === 0 && (() => {
                  const s = mqs(g.p), i = s[0] ?? 0, q = MQS[i];
                  if (!q) return <div style={subS}>主線任務已全部完成，你就是銀月的英雄！</div>;
                  const r = mqRw(i), acc = s[2] === 1, rd = mqReady(g.p);
                  return (
                    <div style={rowS}>
                      <div style={{ flex: '1 1 170px' }}>
                        <div style={{ color: '#ffd0a0' }}>第 {i + 1} 章：{q.n} <span style={subS}>（{i + 1}/{MQS.length}）</span></div>
                        <div style={subS}>{q.d}</div>
                        <div style={subS}>目標：{q.m < 0 ? `達到等級 ${q.lv}` : `擊敗 ${MD[q.m]?.n ?? ''} ×${q.c}（Lv.${q.lv}+ 可接）`}</div>
                        <div style={subS}>獎勵：{r.g} 金幣、{r.e} 經驗、{r.dia} 鑽石</div>
                        {acc && <div style={{ fontSize: 12, color: rd ? '#80ffa0' : '#9fdcff' }}>進度 {q.m < 0 ? `Lv.${g.p.lv}/${q.lv}` : `${Math.min(q.c, s[1] ?? 0)}/${q.c}`}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {(!acc || rd) && <button style={{ ...sb, opacity: !acc && q.m >= 0 && g.p.lv < q.lv ? 0.45 : 1, background: rd ? '#2a8a4a' : '#8a6420', color: '#fff', borderColor: rd ? '#60d080' : '#e8c060' }} onClick={() => { setMsg(mqAct(g)); persist(g); bump(); }}>{acc ? '回報' : '接受'}</button>}
                        {acc && !rd && q.m >= 0 && <button style={sb} onClick={() => { huntTarget(g, fakeQ(q.m)); act("close"); }}>導引前往</button>}
                        {acc && !rd && q.m < 0 && <span style={subS}>進行中</span>}
                      </div>
                    </div>
                  );
                })()}
                {QTAB === 2 && (() => {
                  const b = bts(g.p), allDone = b.b.every((r: number[]) => (r[3] ?? 0) === 1);
                  return (
                    <div>
                      <div style={{ ...subS, marginBottom: 4 }}>今日第 {b.n}/{BT_MAX} 組（每組 3 個，全部領取後可刷新，每天最多 {BT_MAX * 3} 個）· 每天換日重置</div>
                      {b.b.map((r: number[], i: number) => {
                        const m = r[0] ?? 0, c = r[1] ?? 0, v = r[2] ?? 0, got = (r[3] ?? 0) === 1, done = v >= c;
                        return (
                          <div key={i} style={rowS}>
                            <div style={{ flex: '1 1 170px' }}>
                              <div style={{ color: got ? '#8890a0' : done ? '#80ffa0' : '#ffb070' }}>懸賞：擊敗 {MD[m]?.n ?? ''} ×{c} <span style={subS}>Lv.{MD[m]?.lv ?? 1}</span></div>
                              <div style={subS}>進度 {Math.min(v, c)}/{c} · 獎勵 {r[4] ?? 1} 鑽石、{r[5] ?? 5} 懸賞幣、{btGold(g.p)} 金幣</div>
                            </div>
                            {got ? <span style={subS}>已領取</span> : done ? <button style={{ ...sb, background: '#2a8a4a' }} onClick={() => { setMsg(btClaim(g, i)); persist(g); bump(); }}>領取</button> : <button style={sb} onClick={() => { huntTarget(g, fakeQ(m)); act("close"); }}>導引前往</button>}
                          </div>
                        );
                      })}
                      <div style={rowS}><button style={{ ...sb, opacity: allDone && b.n < BT_MAX ? 1 : 0.45 }} onClick={() => { setMsg(btRefresh(g)); persist(g); bump(); }}>刷新懸賞（剩 {BT_MAX - b.n} 次）</button></div>
                      <div style={sec}>懸賞幣兌換（持有 {g.p.bc ?? 0} 懸賞幣 · 洗鍊石 {g.p.rs ?? 0}）</div>
                      {BXS.map((x: BX, i: number) => (
                        <div key={x.n} style={rowS}>
                          <div style={{ flex: '1 1 170px' }}><div style={{ color: '#ffb070' }}>{x.n}</div><div style={subS}>{x.d}</div></div>
                          <button style={{ ...sb, opacity: (g.p.bc ?? 0) >= x.c ? 1 : 0.45 }} onClick={() => { setMsg(bxBuy(g, i)); persist(g); bump(); }}>{x.c} 懸賞幣</button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {QTAB === 1 && QD.map((q: QDef, i: number) => {
                  if (q.t !== (g.npc ? g.npc.t : 0)) return null;
                  const v = g.p.q[i] ?? 0, done = v === -1, ready = v > 0 && v - 1 >= q.c;
                  return (
                    <div key={q.n} style={rowS}>
                      <div style={{ flex: '1 1 170px' }}>
                        <div style={{ color: done ? '#8890a0' : '#ffe08a' }}>{q.n} <span style={subS}>Lv.{q.lv}+</span></div>
                        <div style={subS}>{q.d}</div>
                        <div style={subS}>獎勵：{q.g} 金幣、{q.e} 經驗、{q.it}</div>
                        {v > 0 && <div style={{ fontSize: 12, color: ready ? '#80ffa0' : '#9fdcff' }}>進度 {Math.min(q.c, v - 1)}/{q.c}</div>}
                      </div>
                      {done ? <span style={subS}>已完成</span> : v === 0 ? <button style={{ ...sb, opacity: g.p.lv < q.lv ? 0.45 : 1 }} onClick={() => { questAct(g, i); bump(); }}>接受</button> : ready ? <button style={{ ...sb, background: '#2a8a4a', borderColor: 'transparent' }} onClick={() => { questAct(g, i); persist(g); bump(); }}>回報</button> : <span style={subS}>進行中</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {eqv && (() => {
              const st = stats(g.p), pl = ptsLeft(g.p), cur = selSlot >= 0 ? g.p.eq[selSlot] ?? null : null, ss = selSlot === 10 ? 9 : selSlot;
              const cands = selSlot >= 0 ? g.p.inv.filter((it: Item) => idf(it).s === ss) : [];
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <div style={sec}>目前裝備（點欄位換裝{touch ? '' : '，或把背包物品拖進欄位'}）</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 56px', gap: 4, alignItems: 'start' }}>
                    <div style={{ display: 'grid', gap: 4 }}>{[1, 11, 12, 3, 7].map((i: number) => slotBtn(i))}</div>
                    <div style={{ textAlign: 'center' }}>
                      <canvas ref={(el: HTMLCanvasElement | null) => drawLook(el, g.p)} style={{ width: 120, height: 150, display: 'block', margin: '0 auto', background: 'radial-gradient(ellipse at center, rgba(232,200,112,0.18), rgba(0,0,0,0) 70%)' }} />
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>{[0, 2, 6].map((i: number) => slotBtn(i))}</div>
                      <div style={{ fontSize: 12, marginTop: 6 }}>AC <b>{Math.round(10 - st.ac)}</b> · 攻擊 <b>{Math.round(st.atk)}</b></div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>HP {st.mhp} · MP {st.mmp}</div>
                    </div>
                    <div style={{ display: 'grid', gap: 4 }}>{[4, 8, 9, 10, 5].map((i: number) => slotBtn(i))}</div>
                  </div>
                  {selSlot >= 0 && (
                    <div>
                      <div style={{ ...sec, marginTop: 8 }}>{SLOTN[selSlot]}：背包裡可換的 {cands.length} 件</div>
                      {cands.length === 0 && <div style={subS}>背包裡沒有這個部位的裝備。</div>}
                      {cands.map((it: Item) => (
                        <div key={it.id} style={rowS} {...th(it)}>
                          {ico(iconKey(it), 30, it.en, it.q)}
                          <div style={{ flex: '1 1 140px' }}><div style={{ color: itemCol(it) }}>{itemName(it)}</div><div style={{ ...subS, color: clsOk(idf(it), g.p.cls) ? 'rgba(238,242,248,0.6)' : '#ff9a9a' }}>{itemDesc(it)}</div><div>{scView(it)}</div></div>
                          {clsOk(idf(it), g.p.cls) && <button style={{ ...sb, background: '#2a6a4a' }} onClick={() => { equip(g, it, selSlot); bump(); }}>裝備</button>}
                        </div>
                      ))}
                    </div>
                  )}
                  {cur && (
                    <div style={rowS} {...th(cur)}>
                      {ico(iconKey(cur), 34, cur.en, cur.q)}
                      <div style={{ flex: '1 1 140px' }}>
                        <div style={{ color: itemCol(cur) }}>{itemName(cur)}</div>
                        <div style={subS}>{itemDesc(cur)}</div>
                        <div>{scView(cur)}</div>
                        {idf(cur).sp && <div style={{ ...subS, color: '#ffc080' }}>{SPN[idf(cur).sp] ?? ''}</div>}
                      </div>
                      <button style={sb} onClick={() => { unequip(g, selSlot); setSelSlot(-1); bump(); }}>卸下</button>
                      {canEnch(idf(cur)) && <button style={sb} onClick={() => doEnchant(cur, false)}>強化</button>}
                      {canEnch(idf(cur)) && <button style={{ ...sb, color: '#ffe08a' }} onClick={() => doEnchant(cur, true)}>祝福強化</button>}
                    </div>
                  )}

                  <div style={sec}>能力值 {pl > 0 && <span style={{ color: '#80ffa0' }}>（可分配 {pl} 點）</span>} <button style={{ ...sb, padding: '1px 8px', fontSize: 10, marginLeft: 6 }} onClick={() => { setMsg({ t: resetStats(g), ok: true }); persist(g); bump(); }}>免費重置</button></div>
                  <div style={subS}>每升一級獲得 1 點能力點，可自由分配到下方能力值。</div>
                  {STN.map((n: string, i: number) => (
                    <div key={n} style={{ ...rowS, padding: '3px 0' }}>
                      <div style={{ flex: '1 1 auto' }}>{n} <b>{st.a[i] ?? 0}</b> <span style={subS}>{STD[i]}</span></div>
                      {pl > 0 && <button style={{ ...sb, padding: '2px 10px' }} onClick={() => { addStat(g, i); bump(); }}>＋</button>}
                    </div>
                  ))}
                  <div style={{ ...rowS, padding: '4px 0' }}><span style={{ color: '#a8ecff', fontWeight: 800 }}>裝備總評分 {gearTotal(g.p).toLocaleString()}</span><span style={subS}>強化總值 +{enTotal(g.p)} · PvP 擊殺 {g.p.pk ?? 0}</span></div>
                  <div style={sec}>戰鬥數值</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px', fontSize: 12 }}>
                    {(() => { const nb = noBuff(g.p), ai = atkInt(g.p, true), an = atkInt(g.p, false); return <>
                    <span>AC <b>{Math.round(10 - st.ac)}</b><span style={{ color: '#a0ffb0' }}>{bp(Math.round(nb.ac - st.ac))}</span></span><span>攻擊力 <b>{Math.round(st.atk)}</b><span style={{ color: '#a0ffb0' }}>{bp(Math.round(st.atk - nb.atk))}</span></span>
                    <span>攻速 <b>{(1 / ai).toFixed(2)}</b> 次/秒<span style={{ color: '#a0ffb0' }}>{bp(Math.round((1 / ai - 1 / an) * 100) / 100)}</span></span><span>攻擊間隔 <b>{ai.toFixed(2)}</b> 秒</span>
                    <span>暴擊 <b>{Math.round(st.crit * 100)}%</b><span style={{ color: '#a0ffb0' }}>{bp(Math.round((st.crit - nb.crit) * 100), '%')}</span></span><span>閃避 <b>{Math.round(st.dodge * 100)}%</b><span style={{ color: '#a0ffb0' }}>{bp(Math.round((st.dodge - nb.dodge) * 100), '%')}</span></span>
                    <span>命中加成 <b>{Math.round(st.hit * 100)}%</b><span style={{ color: '#a0ffb0' }}>{bp(Math.round((st.hit - nb.hit) * 100), '%')}</span></span><span>移動 <b>{Math.round(st.spd * 100)}%</b><span style={{ color: '#a0ffb0' }}>{bp(Math.round((st.spd - nb.spd) * 100), '%')}</span></span>
                    </>; })()}
                    <span>生命 <b>{st.mhp}</b></span><span>魔力 <b>{st.mmp}</b></span>
                    {st.vamp > 0 && <span>吸血 <b>{Math.round(st.vamp * 100)}%</b></span>}
                    {st.mr > 0 && <span>抗魔 <b>{Math.round(st.mr * 100)}%</b></span>}
                  </div>
                  {st.sets.map((t: string) => <div key={t} style={{ fontSize: 12, color: '#ffc080', marginTop: 4 }}>✦ {t}</div>)}
                  <div style={{ ...subS, marginTop: 8 }}>AC 越低越硬（天堂規則）。每升一級得到 1 點能力點數；套裝：黑暗 3 件、精靈 3 件、秘銀 2 件有額外效果。</div>
                </div>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>{bagView()}</div>
                </div>
              );
            })()}
            {panel === "set" && (
              <div>
                <div style={sec}>自動喝水（0% 表示關閉）</div>
                <div style={rowS}>{ico("pr", 26)}<div style={{ flex: "1 1 130px" }}>生命低於 <b>{g.set.hp}%</b> 喝紅水</div><input type="range" min={0} max={90} step={5} value={g.set.hp} onChange={(e: ChangeEvent<HTMLInputElement>) => { g.set.hp = Number(e.currentTarget.value); bump(); }} style={{ flex: "1 1 120px" }} /></div>
                <div style={rowS}>{ico("pb", 26)}<div style={{ flex: "1 1 130px" }}>魔力低於 <b>{g.set.mp}%</b> 喝藍水</div><input type="range" min={0} max={90} step={5} value={g.set.mp} onChange={(e: ChangeEvent<HTMLInputElement>) => { g.set.mp = Number(e.currentTarget.value); bump(); }} style={{ flex: "1 1 120px" }} /></div>
                <div style={rowS}>{ico("pg", 26)}<div style={{ flex: "1 1 130px" }}>加速結束時自動補喝綠水</div><button style={{ ...sb, borderColor: g.set.haste ? "#60ff90" : "rgba(255,255,255,0.28)", color: g.set.haste ? "#80ffa0" : "#eef2f8" }} onClick={() => { g.set.haste = !g.set.haste; bump(); }}>{g.set.haste ? "開" : "關"}</button></div>
                <div style={sec}>自動掛機</div>
                <div style={rowS}>
                  <div style={{ flex: "1 1 130px" }}>{g.auto ? `掛機中：${ZN[g.huntZ + 1] ?? ""}` : "目前未掛機"}</div>
                  <button style={{ ...sb, background: g.auto ? "#c84040" : "#2a8a4a", borderColor: "transparent" }} onClick={() => { toggleAuto(g); bump(); }}>{g.auto ? "停止掛機" : "開始掛機"}</button>
                </div>
                <label style={{ ...rowS, cursor: 'pointer' }}><input type="checkbox" checked={AIPK} onChange={(e: { target: { checked: boolean } }) => { setAipk(e.target.checked); bump(); }} /> 允許其他玩家偷襲我 <span style={subS}>（野外偶爾會有玩家主動 PK 你；城鎮內永遠安全）</span></label>
                <label style={{ ...rowS, cursor: 'pointer' }}><input type="checkbox" checked={QPRI} onChange={(e: { target: { checked: boolean } }) => { setQpri(e.target.checked); bump(); }} /> 優先打任務怪 <span style={subS}>（優先攻擊進行中任務、主線、懸賞的目標怪物）</span></label>
                <div style={{ ...subS, margin: "6px 0 4px" }}>掛機地點</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[-1, 0, 1, 2, 3, 4, 5, 6, 7].map((z: number) => (
                    <button key={z} style={{ ...sb, borderColor: g.set.zone === z ? "#e8c870" : "rgba(255,255,255,0.28)", color: g.set.zone === z ? "#ffe08a" : "#eef2f8" }} onClick={() => { g.set.zone = z; if (g.auto) g.huntZ = bestZone(g); bump(); }}>{z === -1 ? "自動（目前區域）" : ZN[z + 1]}</button>
                  ))}
                </div>
                <div style={rowS}><div style={{ flex: "1 1 160px" }}>回村時自動補給（紅水補到 30、綠水 3、藍水 15、回城卷軸 2）</div><button style={{ ...sb, borderColor: g.set.restock ? "#60ff90" : "rgba(255,255,255,0.28)", color: g.set.restock ? "#80ffa0" : "#eef2f8" }} onClick={() => { g.set.restock = !g.set.restock; bump(); }}>{g.set.restock ? "開" : "關"}</button></div>
                <div style={{ ...subS, marginTop: 4 }}>紅水用完且生命低於 30% 時會自動用回城卷軸（沒有就走回村），補給後回到掛機地點。手動點地面或用方向鍵會暫停掛機幾秒。</div>
                <div style={sec}>音效與音樂</div>
                <div style={rowS}><div style={{ flex: '1 1 130px' }}>音量 <b>{Math.round(VOL * 100)}%</b></div><input type="range" min={0} max={100} step={5} value={Math.round(VOL * 100)} onChange={(e: ChangeEvent<HTMLInputElement>) => { VOL = Number(e.currentTarget.value) / 100; audioInit(); setVol(); sfx('click'); bump(); }} style={{ flex: '1 1 120px' }} /></div>
                <div style={rowS}>
                  <div style={{ flex: '1 1 130px' }}>全部音效</div>
                  <button style={{ ...sb, borderColor: !MUTE ? '#60ff90' : 'rgba(255,255,255,0.28)', color: !MUTE ? '#80ffa0' : '#ff9a9a' }} onClick={() => { MUTE = !MUTE; audioInit(); setVol(); bump(); }}>{MUTE ? '靜音中' : '開'}</button>
                  <div style={{ flex: '1 1 80px' }}>背景音樂</div>
                  <button style={{ ...sb, borderColor: BGM_ON ? '#60ff90' : 'rgba(255,255,255,0.28)', color: BGM_ON ? '#80ffa0' : '#eef2f8' }} onClick={() => { BGM_ON = !BGM_ON; audioInit(); bump(); }}>{BGM_ON ? '開' : '關'}</button>
                </div>
                <div style={subS}>音效用瀏覽器即時合成。手機若沒聲音，請先關閉靜音模式並點一下畫面。音樂會依城鎮、野外、地城切換。</div>
                <div style={sec}>存檔</div>
                <div style={{ ...subS, color: mode === "local" ? "#a0e0b0" : "#ffb080", margin: "4px 0" }}>{modeText}</div>
                <div style={rowS}><button style={{ ...sb, background: "#2a5aa8", borderColor: "transparent" }} onClick={exportCode}>複製存檔碼</button><button style={sb} onClick={() => { persist(g); setNote("已存檔。"); }}>立即存檔</button></div>
                <div style={rowS}><button style={sb} onClick={() => { const c = encodeSave(toSave(g)); setCode(c); BKT = 0; try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([c], { type: 'text/plain' })); a.download = `銀月傳說存檔-Lv${g.p.lv}.txt`; document.body.appendChild(a); a.click(); a.remove(); setNote('已嘗試下載存檔檔案；若沒有下載，請改用「複製存檔碼」。'); } catch { setNote('此環境不允許下載，請改用「複製存檔碼」。'); } }}>下載存檔檔案</button></div>
                {code && <textarea ref={codeRef} readOnly value={code} style={taS} onFocus={(e: { currentTarget: HTMLTextAreaElement }) => e.currentTarget.select()} />}
                <div style={{ fontSize: 10, opacity: 0.55, marginTop: 4 }}>{diagText()}</div>
                {note && <div style={{ fontSize: 12, color: "#9fdcff", marginTop: 4 }}>{note}</div>}
                <div style={{ ...subS, marginTop: 8 }}>讀取存檔碼（會取代目前角色）</div>
                <textarea value={imp} placeholder="在這裡貼上 SM3- 開頭的存檔碼" onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setImp(e.currentTarget.value)} style={taS} />
                <button style={{ ...sb, marginTop: 6 }} onClick={importCode}>讀取存檔碼</button>
              </div>
            )}
          </div>
        )}
        {scr === "play" && g && !pause && !askTitle && (
          <button style={{ ...sb, position: 'absolute', left: narrow ? 8 : 300, bottom: narrow ? 150 : 20, padding: '2px 8px', fontSize: 11, zIndex: 3 }} onClick={() => setLogOpen(!logOpen)}>{logOpen ? '關閉記錄' : '對話記錄'}</button>
        )}
        {scr === "play" && g && logOpen && (
          <div ref={(el: HTMLDivElement | null) => { if (el && el.dataset['init'] !== '1') { el.dataset['init'] = '1'; el.scrollTop = el.scrollHeight; } }} onWheel={(e: { stopPropagation: () => void }) => e.stopPropagation()} style={{ position: 'absolute', left: 8, bottom: narrow ? 180 : 48, width: narrow ? 'calc(100% - 16px)' : 440, height: 220, overflowY: 'auto', background: 'rgba(8,8,12,0.9)', border: '1px solid rgba(232,200,112,0.5)', borderRadius: 8, padding: '6px 8px', zIndex: 4, fontFamily: theme.font.family, fontSize: 12, lineHeight: 1.5 }}>
            <div style={{ color: '#e8c870', fontWeight: 700, marginBottom: 4 }}>對話與掉落記錄（最近 {g.log.length} 行）</div>
            {g.log.map((l: Line, i: number) => <div key={i} style={{ color: l.c }}>{l.t}</div>)}
          </div>
        )}
        {tip && g && (() => {
          const it = tip.it, d = it ? idf(it) : null, eqd = !!it && g.p.eq.indexOf(it) >= 0;
          const vw = typeof window !== 'undefined' ? window.innerWidth : 800, vh = typeof window !== 'undefined' ? window.innerHeight : 600;
          const left = Math.max(4, Math.min(tip.x + 16, vw - 276)), top = tip.y + 16 > vh - 200 ? Math.max(4, tip.y - 190) : tip.y + 16;
          return (
            <div ref={(el: HTMLDivElement | null) => { TIPEL = el; TIPIT = it; }} style={{ position: 'fixed', left, top, width: 264, zIndex: 9999, pointerEvents: 'none', background: 'rgba(14,12,20,0.97)', border: `1px solid ${it ? QC[it.q ?? 0] ?? '#e8c870' : '#e8c870'}`, borderRadius: 8, padding: '8px 10px', color: '#eef2f8', fontSize: 12, lineHeight: 1.45, boxShadow: '0 6px 20px rgba(0,0,0,0.55)', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {it && d ? (
                <>
                  <div style={{ fontWeight: 800, fontSize: 13, color: itemCol(it) }}>{it.q ? `【${QN[it.q] ?? ''}】` : ''}{itemName(it)}{d.r ? ' ★' : ''}</div>
                  <div style={{ opacity: 0.65 }}>{SLOTN[d.s] ?? ''}{eqd ? '（已裝備）' : ''}{clsOk(d, g.p.cls) ? '' : ` · ${CLN[g.p.cls] ?? ''}無法裝備`}</div>
                  <div style={{ marginTop: 3 }}>{itemDesc(it)}</div>
                  {it.af && it.af.length > 0 && <div style={{ color: QC[it.q ?? 0] ?? '#eef2f8', marginTop: 3 }}>附加：{afText(it)}</div>}
                  {d.sp && <div style={{ color: '#ffc080', marginTop: 3 }}>{SPN[d.sp] ?? ''}</div>}
                  {setOf(it) && <div style={{ color: '#ffc080', marginTop: 3 }}>{setText(it, g.p.eq)}</div>}
                  <div style={{ marginTop: 4, color: '#a8ecff', fontWeight: 800 }}>評分 {itemScore(it)}</div>
                  <div style={{ opacity: 0.55, marginTop: 3 }}>賣價 {sellPrice(it)} 金幣</div>
                </>
              ) : <div>{tip.t}</div>}
            </div>
          );
        })()}
        {scr === "select" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", overflowY: "auto", background: "radial-gradient(ellipse at center, rgba(30,26,50,0.82), rgba(6,8,14,0.94))", color: "#eef2f8", padding: narrow ? 12 : 24, textAlign: "center" }}>
            <div style={{ margin: "auto", width: "100%", maxWidth: 680 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.3em", color: "#e8c870" }}>銀月大陸 · 冒險者登錄</div>
              <div style={{ fontSize: narrow ? 34 : 50, fontWeight: 900, letterSpacing: "0.1em", color: "#fff4d0", textShadow: "0 0 20px rgba(232,200,112,0.6), 0 2px 0 #6a4a10", margin: "4px 0 6px" }}>銀月傳說</div>
              <div style={{ fontSize: narrow ? 13 : 15, color: "rgba(238,242,248,0.8)", marginBottom: 12 }}>選擇你的職業，從銀月村出發</div>
              {stored && (
                <div style={{ marginBottom: 12 }}>
                  <button onClick={() => start(stored.cls, stored)} style={{ background: "linear-gradient(180deg,#ffe08a,#c89a30)", color: "#1a1408", border: "none", borderRadius: 999, padding: "11px 26px", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: theme.font.family }}>繼續冒險：Lv.{stored.lv} {cl(stored.cls).n}</button>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>選擇下方職業會開始新角色，並覆蓋這個存檔</div>
                </div>
              )}
              {!ready && <div style={{ fontSize: 13, color: '#ffe08a', marginBottom: 10 }}>讀取存檔中…</div>}
              {ready && !stored && (
                <div style={{ maxWidth: 460, margin: '0 auto 12px', padding: 12, borderRadius: 10, background: 'rgba(40,60,110,0.55)', border: '1px solid #8ab4ff', textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#cfe0ff', marginBottom: 4 }}>找不到存檔？輸入存檔碼</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>這個頁面的瀏覽器存檔可能在關閉或更新後被清除。如果你之前複製過存檔碼（SM3- 開頭），貼在下面就能繼續；也可以讀取下載過的存檔檔案。</div>
                  <textarea value={imp} placeholder="貼上 SM3- 開頭的存檔碼" onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setImp(e.currentTarget.value)} style={taS} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, alignItems: 'center' }}>
                    <button style={{ ...sb, background: '#2a5aa8', borderColor: 'transparent' }} onClick={importCode}>讀取存檔碼</button>
                    <label style={{ ...sb, display: 'inline-block', cursor: 'pointer' }}>讀取存檔檔案<input type="file" accept=".txt,text/plain" style={{ display: 'none' }} onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.currentTarget.files?.[0]; if (!f) return; f.text().then((t: string) => { const m0 = /SM[23]-[A-Za-z0-9+/=]+-[0-9a-z]+/.exec(t.replace(/\s+/g, '')); const sv = m0 ? decodeSave(m0[0]) : null; if (sv) start(sv.cls, sv); else setNote('檔案裡沒有有效的存檔碼。'); }, () => setNote('無法讀取檔案。')); }} /></label>
                  </div>
                  {note && <div style={{ fontSize: 12, color: "#ff9a9a", marginTop: 4 }}>{note}</div>}
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <button style={{ ...sb, fontSize: 12 }} onClick={() => setShowImp(!showImp)}>{showImp ? "收起" : "用存檔碼繼續"}</button>{' '}
                <button style={{ ...sb, fontSize: 12 }} onClick={() => { try { navigator.clipboard.readText().then((t: string) => { const m0 = /SM[23]-[A-Za-z0-9+/=]+-[0-9a-z]+/.exec(t.replace(/\s+/g, '')); const sv = m0 ? decodeSave(m0[0]) : null; if (sv) start(sv.cls, sv); else { setShowImp(true); setNote('剪貼簿裡沒有存檔碼，請手動貼上。'); } }, () => { setShowImp(true); setNote('無法讀取剪貼簿，請在下方貼上（在畫面任何地方按 Ctrl+V 也可以）。'); }); } catch { setShowImp(true); } }}>從剪貼簿讀取</button>
                {showImp && (
                  <div style={{ maxWidth: 420, margin: "8px auto 0", textAlign: "left" }}>
                    <textarea value={imp} placeholder="貼上 SM3-（或舊版 SM2-）開頭的存檔碼" onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setImp(e.currentTarget.value)} style={taS} />
                    <button style={{ ...sb, marginTop: 6 }} onClick={importCode}>讀取存檔碼</button>
                    {note && <div style={{ fontSize: 12, color: "#ff9a9a", marginTop: 4 }}>{note}</div>}
                  </div>
                )}
                <div style={{ fontSize: 11, color: mode === "local" ? "rgba(160,224,176,0.85)" : "rgba(255,176,128,0.9)", marginTop: 6 }}>{mode === "local" ? "已啟用自動存檔（仍建議定期複製存檔碼備份）" : "此環境無法自動長期存檔，遊戲中請到「設定」複製存檔碼"}</div>
                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>{diagText()}</div>
              </div>
              {bak && (!stored || saveTime(bak) !== saveTime(stored)) && (bak.lv > 1 || bak.exp > 0) && (
                <div style={{ marginBottom: 10 }}><button style={{ ...sb, fontSize: 12 }} onClick={() => start(bak.cls, bak)}>還原備份角色（{CL[bak.cls]?.n ?? ''} Lv.{bak.lv}）</button></div>
              )}
              {pick >= 0 && stored && (
                <div style={{ margin: '0 auto 12px', maxWidth: 440, padding: 12, borderRadius: 10, background: 'rgba(110,28,28,0.7)', border: '1px solid #ff9a9a', color: '#fff' }}>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>確定要建立新的{CL[pick]?.n ?? ''}嗎？目前的 {CL[stored.cls]?.n ?? ''} Lv.{stored.lv} 存檔會移到備份，之後可以在標題畫面還原。</div>
                  <button style={{ ...sb, background: '#b03a3a', color: '#fff' }} onClick={() => { const i = pick; setPick(-1); start(i, null, true); }}>確定建立新角色</button>{' '}
                  <button style={sb} onClick={() => setPick(-1)}>取消</button>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                {CL.map((c: CDef, i: number) => (
                  <button key={c.n} disabled={!ready} onClick={() => { if (!ready) return; if (stored && (stored.lv > 1 || stored.exp > 0)) setPick(i); else start(i); }} style={{ opacity: ready ? 1 : 0.5, flex: "1 1 170px", maxWidth: 210, background: "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))", border: `1px solid ${c.c}`, borderRadius: 12, color: "#eef2f8", padding: "10px 8px", cursor: "pointer", fontFamily: theme.font.family }}>
                    <canvas ref={(el: HTMLCanvasElement | null) => drawPrev(el, i)} style={{ width: 80, height: 80, display: "block", margin: "0 auto" }} />
                    <div style={{ fontSize: 20, fontWeight: 800, color: c.c }}>{c.n}</div>
                    <div style={{ fontSize: 12, opacity: 0.85, margin: "4px 0" }}>{c.d}</div>
                    <div style={{ fontSize: 11, opacity: 0.65 }}>生命 {c.hp} · 魔力 {c.mp} · 攻擊 {c.atk}</div>
                    <div style={{ marginTop: 8, display: "inline-block", padding: "5px 16px", borderRadius: 999, background: c.c, color: "#10131a", fontWeight: 800, fontSize: 13 }}>新角色</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ ...theme.font.caption, color: theme.text.tertiary, marginTop: 8 }}>
        {touch ? "點地面移動，點怪物自動攻擊；左下技能列可施放技能（技能視窗可設定），右下角按鈕：掛機、攻擊、技能視窗、紅水、綠水、藍水、回城、背包、角色、設定；在城鎮點 NPC 可買賣、存倉庫、傳送、接任務、到神殿治療。" : "左鍵點地面移動（可按住拖動），點怪物自動攻擊；WASD/方向鍵移動，空白鍵攻擊最近怪物，1 紅水，2 基本技能，3 回城，4 綠水，5 藍水，Q E R T G Z X V 技能快捷欄，K 技能視窗，F 掛機，I 背包，C 角色，O 設定，B 商店（城鎮內），Esc 關閉面板。城鎮裡點 NPC：鐵匠、魔法商人（技能書）、飾品商人、倉庫、神殿、傳送師、任務。地圖上橘色點是地城入口（妖魔洞窟、象牙塔、龍之地監），走上樓梯即可進出。"}
      </div>
    </div>
  );
}

