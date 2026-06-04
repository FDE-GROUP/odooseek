import{i as e}from"./preload-helper-xPQekRTU.js";import{g as t}from"./iframe-Bbza3pWg.js";import{c as n,d as r,f as i,l as a,m as o,p as s,u as c}from"./basic-C-h4Rr0e.js";function l({component:e,label:t,value:n,readOnly:r,meta:i}){return(0,u.jsxs)(`div`,{className:`w-full max-w-md space-y-1`,children:[(0,u.jsx)(`label`,{className:`text-xs font-medium text-text-muted`,children:t}),(0,u.jsx)(e,{field:f(t),value:n,onChange:()=>{},readOnly:r,meta:i})]})}var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{o(),u=t(),d={title:`Widgets/Utility Fields`,tags:[`autodocs`]},f=e=>({attributes:{name:e,type:`char`}}),p={render:()=>(0,u.jsx)(l,{component:c,label:`Email`,value:`user@example.com`})},m={render:()=>(0,u.jsx)(l,{component:c,label:`Email`,value:`user@example.com`,readOnly:!0})},h={render:()=>(0,u.jsx)(l,{component:r,label:`Phone`,value:`+1-555-0123`})},g={render:()=>(0,u.jsx)(l,{component:r,label:`Phone`,value:`+1-555-0123`,readOnly:!0})},_={render:()=>(0,u.jsx)(l,{component:s,label:`Website`,value:`https://example.com`})},v={render:()=>(0,u.jsx)(l,{component:s,label:`Website`,value:`https://example.com`,readOnly:!0})},y={render:()=>(0,u.jsx)(l,{component:i,label:`Progress`,value:100})},b={render:()=>(0,u.jsx)(l,{component:i,label:`Progress`,value:50})},x={render:()=>(0,u.jsx)(l,{component:i,label:`Progress`,value:0})},S={render:()=>(0,u.jsx)(l,{component:a,label:`API Key`,value:`sk-abc123def456`,readOnly:!0})},C={render:()=>(0,u.jsx)(l,{component:n,label:`Color`,value:3})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={EmailWidget} label="Email" value="user@example.com" />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={EmailWidget} label="Email" value="user@example.com" readOnly />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={PhoneWidget} label="Phone" value="+1-555-0123" />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={PhoneWidget} label="Phone" value="+1-555-0123" readOnly />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={UrlWidget} label="Website" value="https://example.com" />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={UrlWidget} label="Website" value="https://example.com" readOnly />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={ProgressbarWidget} label="Progress" value={100} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={ProgressbarWidget} label="Progress" value={50} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={ProgressbarWidget} label="Progress" value={0} />
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={CopyClipboardWidget} label="API Key" value="sk-abc123def456" readOnly />
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={ColorPickerWidget} label="Color" value={3} />
}`,...C.parameters?.docs?.source}}},w=[`EmailEdit`,`EmailReadOnly`,`PhoneEdit`,`PhoneReadOnly`,`UrlEdit`,`UrlReadOnly`,`ProgressComplete`,`ProgressHalf`,`ProgressEmpty`,`CopyClipboard`,`ColorPicker`]}))();export{C as ColorPicker,S as CopyClipboard,p as EmailEdit,m as EmailReadOnly,h as PhoneEdit,g as PhoneReadOnly,y as ProgressComplete,x as ProgressEmpty,b as ProgressHalf,_ as UrlEdit,v as UrlReadOnly,w as __namedExportsOrder,d as default};