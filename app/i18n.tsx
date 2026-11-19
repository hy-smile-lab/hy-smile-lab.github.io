'use client';
/* KOR | ENG 전환: 영어 모드에서는 화면에 그려진 한글을 사전(public/i18n/*.json)으로 바꿔 보여줌.
   새 데이터가 들어오면 사전에 없는 한글은 원문 그대로 표시되니 public/i18n/en.json에 추가하면 됨. */
import {useEffect, useState} from 'react';
import dict from '../public/i18n/en.json';
import names from '../public/i18n/names.json';
import {makeTranslator} from './i18n-core';

export type Lang = 'ko' | 'en';
const KEY = 'hy-smile-lang';
const HANGUL = /[가-힣]/;
const ATTRS = ['alt', 'aria-label', 'placeholder', 'title'];
const t = makeTranslator(dict as Record<string, string>, names as Record<string, string>);

function readLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'ko') return q;
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'ko';
  } catch { return 'ko'; }
}
function saveLang(l: Lang) { try { localStorage.setItem(KEY, l); } catch { /* 저장 불가 환경 */ } }

function translateText(n: Text) {
  const p = n.parentElement;
  if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName)) return;
  const v = n.nodeValue || '';
  if (!HANGUL.test(v)) return;
  const r = t(v);
  if (r !== v) n.nodeValue = r;
}
function translateAttrs(el: Element) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v && HANGUL.test(v)) { const r = t(v); if (r !== v) el.setAttribute(a, r); }
  }
}
function translateTree(root: Node) {
  if (root.nodeType === 3) { translateText(root as Text); return; }
  if (root.nodeType !== 1) return;
  translateAttrs(root as Element);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null;
  while ((n = w.nextNode())) { if (n.nodeType === 3) translateText(n as Text); else translateAttrs(n as Element); }
}


/* 영어가 길어 그림 속 라벨 상자를 넘으면 상자를 글자에 맞춰 넓힘 (글자 크기 유지) */
function fitSvgLabels() {
  for (const svg of document.querySelectorAll('svg')) {
    const vb = (svg as SVGSVGElement).viewBox?.baseVal;
    if (!vb || !vb.width) continue;
    for (const g of svg.querySelectorAll('g')) {
      const rects = [...g.children].filter(c => c.tagName === 'rect') as SVGRectElement[];
      const texts = [...g.children].filter(c => c.tagName === 'text' && /[A-Za-z]/.test(c.textContent || '')) as SVGTextElement[];
      if (!rects.length || !texts.length) continue;
      for (const r of rects) {
        const rb = r.getBBox();
        if (rb.width > vb.width * 0.6 || rb.height > vb.height * 0.6) continue;
        let left = rb.x, right = rb.x + rb.width, pad = 6;
        let hit = false;
        for (const t of texts) {
          const tb = t.getBBox();
          const cy = tb.y + tb.height / 2;
          if (cy < rb.y || cy > rb.y + rb.height || tb.x > rb.x + rb.width || tb.x + tb.width < rb.x) continue;
          hit = true;
          pad = Math.max(4, Math.min(12, tb.x - rb.x));
          left = Math.min(left, tb.x - pad);
          right = Math.max(right, tb.x + tb.width + pad);
        }
        if (!hit || (left >= rb.x - 0.5 && right <= rb.x + rb.width + 0.5)) continue;
        r.setAttribute('x', String(left));
        r.setAttribute('width', String(right - left));
      }
    }
  }
}
let fitQueued = false;
function queueFit() { if (fitQueued) return; fitQueued = true; requestAnimationFrame(() => { fitQueued = false; try { fitSvgLabels(); } catch { /* 그림 없음 */ } }); }

function startTranslating() {
  document.documentElement.lang = 'en';
  document.title = 'HY-SMILE | Smart Mobility Safety Laboratory, Hanyang University ERICA';
  translateTree(document.body);
  queueFit();
  const ob = new MutationObserver(list => {
    for (const m of list) {
      if (m.type === 'characterData') translateText(m.target as Text);
      else if (m.type === 'attributes') translateAttrs(m.target as Element);
      else m.addedNodes.forEach(translateTree);
    }
    queueFit();
  });
  ob.observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS});
  return () => ob.disconnect();
}

export function useLang() {
  const [lang, setLang] = useState<Lang>('ko');
  useEffect(() => { setLang(readLang()); }, []);
  useEffect(() => { if (lang === 'en') return startTranslating(); }, [lang]);
  function change(l: Lang) {
    if (l === lang) return;
    saveLang(l);
    if (l === 'ko') {
      /* 원래 한글 화면은 새로 그려서 복원 */
      const u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.toString());
      return;
    }
    setLang(l);
  }
  return [lang, change] as const;
}

export function LangToggle({lang, onChange}: {lang: Lang; onChange: (l: Lang) => void}) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button aria-pressed={lang === 'ko'} onClick={() => onChange('ko')}>KOR</button>
      <span aria-hidden="true">|</span>
      <button aria-pressed={lang === 'en'} onClick={() => onChange('en')}>ENG</button>
    </div>
  );
}
