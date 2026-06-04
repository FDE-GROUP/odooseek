import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{I as n,g as r}from"./iframe-Bbza3pWg.js";function i({offset:e,total:t,limit:n,onPageChange:r,onLimitChange:i}){let[c,l]=(0,a.useState)(!1),[u,d]=(0,a.useState)(``),f=(0,a.useRef)(null),p=t===0?0:e+1,m=Math.min(e+n,t),h=Math.max(0,t-n),g=(0,a.useCallback)(()=>{t!==0&&(d(String(p)),l(!0))},[p,t]);(0,a.useEffect)(()=>{c&&f.current&&(f.current.focus(),f.current.select())},[c]);let _=(0,a.useCallback)(()=>{let e=Number.parseInt(u,10);if(!Number.isNaN(e)){let t=Math.floor((e-1)/n)*n;r(Math.max(0,Math.min(t,h)))}l(!1)},[u,h,n,r]),v=(0,a.useCallback)(e=>{e.key===`Enter`?(e.preventDefault(),_()):e.key===`Escape`&&(e.preventDefault(),l(!1))},[_]);return t===0?(0,o.jsxs)(`div`,{className:`flex items-center justify-between px-1`,children:[(0,o.jsx)(`select`,{value:n,onChange:e=>i(Number(e.target.value)),className:`rounded border border-border-default bg-surface px-2 py-1 text-xs text-text-secondary`,children:s.map(e=>(0,o.jsx)(`option`,{value:e,children:e},e))}),(0,o.jsx)(`span`,{className:`text-xs text-text-muted`,children:`0 records`})]}):(0,o.jsxs)(`div`,{className:`flex items-center justify-between px-1`,children:[(0,o.jsx)(`select`,{value:n,onChange:e=>i(Number(e.target.value)),className:`rounded border border-border-default bg-surface px-2 py-1 text-xs text-text-secondary`,children:s.map(e=>(0,o.jsx)(`option`,{value:e,children:e},e))}),(0,o.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,o.jsx)(`button`,{type:`button`,onClick:()=>r(0),disabled:e===0,className:`rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40`,children:`«`}),(0,o.jsx)(`button`,{type:`button`,onClick:()=>r(Math.max(0,e-n)),disabled:e===0,className:`rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40`,children:`‹`}),c?(0,o.jsx)(`input`,{ref:f,type:`number`,value:u,onChange:e=>d(e.target.value),onKeyDown:v,onBlur:_,min:1,max:t,className:`w-16 rounded border border-accent bg-surface px-1.5 py-0.5 text-center text-xs text-text-primary outline-none`}):(0,o.jsxs)(`button`,{type:`button`,onClick:g,className:`cursor-pointer rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover`,children:[p,`-`,m]}),(0,o.jsx)(`span`,{className:`text-xs text-text-muted`,children:`/`}),(0,o.jsx)(`span`,{className:`text-xs text-text-muted`,children:t}),(0,o.jsx)(`button`,{type:`button`,onClick:()=>r(Math.min(h,e+n)),disabled:e>=h,className:`rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40`,children:`›`}),(0,o.jsx)(`button`,{type:`button`,onClick:()=>r(h),disabled:e>=h,className:`rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40`,children:`»`})]})]})}var a,o,s,c=e((()=>{a=t(n(),1),o=r(),s=[40,80,200,500],i.__docgenInfo={description:``,methods:[],displayName:`Pagination`,props:{offset:{required:!0,tsType:{name:`number`},description:``},total:{required:!0,tsType:{name:`number`},description:``},limit:{required:!0,tsType:{name:`number`},description:``},onPageChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(offset: number) => void`,signature:{arguments:[{type:{name:`number`},name:`offset`}],return:{name:`void`}}},description:``},onLimitChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(limit: number) => void`,signature:{arguments:[{type:{name:`number`},name:`limit`}],return:{name:`void`}}},description:``}}}})),l,u,d,f,p,m,h;e((()=>{c(),l={title:`Components/Pagination`,component:i,tags:[`autodocs`],argTypes:{offset:{control:`number`},total:{control:`number`},limit:{control:`number`},onPageChange:{action:`pageChange`},onLimitChange:{action:`limitChange`}}},u={args:{offset:0,total:256,limit:40,onPageChange:()=>{},onLimitChange:()=>{}}},d={args:{offset:80,total:256,limit:40,onPageChange:()=>{},onLimitChange:()=>{}}},f={args:{offset:240,total:256,limit:40,onPageChange:()=>{},onLimitChange:()=>{}}},p={args:{offset:0,total:0,limit:40,onPageChange:()=>{},onLimitChange:()=>{}}},m={args:{offset:0,total:25,limit:40,onPageChange:()=>{},onLimitChange:()=>{}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    offset: 0,
    total: 256,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {}
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    offset: 80,
    total: 256,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {}
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    offset: 240,
    total: 256,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {}
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    offset: 0,
    total: 0,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {}
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    offset: 0,
    total: 25,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {}
  }
}`,...m.parameters?.docs?.source}}},h=[`FirstPage`,`MiddlePage`,`LastPage`,`Empty`,`SinglePage`]}))();export{p as Empty,u as FirstPage,f as LastPage,d as MiddlePage,m as SinglePage,h as __namedExportsOrder,l as default};