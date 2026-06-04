import{i as e}from"./preload-helper-xPQekRTU.js";import{g as t}from"./iframe-Bbza3pWg.js";import{a as n,i as r,n as i,o as a,r as o,s,t as c}from"./basic-C-h4Rr0e.js";function l({component:e,label:t,value:n,readOnly:r}){return(0,u.jsxs)(`div`,{className:`w-full max-w-md space-y-1`,children:[(0,u.jsx)(`label`,{className:`text-xs font-medium text-text-muted`,children:t}),(0,u.jsx)(e,{field:f(t,`char`),value:n,onChange:()=>{},readOnly:r})]})}var u,d,f,p,m,h,g,_,v,y,b,x,S,C;e((()=>{s(),u=t(),d={title:`Widgets/Basic Fields`,tags:[`autodocs`]},f=(e,t)=>({attributes:{name:e,type:t}}),p={render:()=>(0,u.jsx)(l,{component:o,label:`Name`,value:`John Doe`})},m={render:()=>(0,u.jsx)(l,{component:o,label:`Name`,value:`John Doe`,readOnly:!0})},h={render:()=>(0,u.jsx)(l,{component:o,label:`Name`,value:``})},g={render:()=>(0,u.jsx)(l,{component:a,label:`Notes`,value:`This is a long text field.\\nMultiple lines supported.`})},_={render:()=>(0,u.jsx)(l,{component:n,label:`Quantity`,value:42})},v={render:()=>(0,u.jsx)(l,{component:r,label:`Price`,value:19.99})},y={render:()=>(0,u.jsx)(l,{component:i,label:`Active`,value:!0})},b={render:()=>(0,u.jsx)(l,{component:i,label:`Active`,value:!1})},x={render:()=>(0,u.jsx)(l,{component:c,label:`Enabled`,value:!0})},S={render:()=>(0,u.jsx)(l,{component:c,label:`Enabled`,value:!1})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={CharWidget} label="Name" value="John Doe" />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={CharWidget} label="Name" value="John Doe" readOnly />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={CharWidget} label="Name" value="" />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={TextWidget} label="Notes" value="This is a long text field.\\nMultiple lines supported." />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={IntegerWidget} label="Quantity" value={42} />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={FloatWidget} label="Price" value={19.99} />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={BooleanWidget} label="Active" value={true} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={BooleanWidget} label="Active" value={false} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={BooleanToggleWidget} label="Enabled" value={true} />
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <FieldWrapper component={BooleanToggleWidget} label="Enabled" value={false} />
}`,...S.parameters?.docs?.source}}},C=[`CharEdit`,`CharReadOnly`,`CharEmpty`,`TextEdit`,`IntegerEdit`,`FloatEdit`,`BooleanEdit`,`BooleanUnchecked`,`BooleanToggleOn`,`BooleanToggleOff`]}))();export{y as BooleanEdit,S as BooleanToggleOff,x as BooleanToggleOn,b as BooleanUnchecked,p as CharEdit,h as CharEmpty,m as CharReadOnly,v as FloatEdit,_ as IntegerEdit,g as TextEdit,C as __namedExportsOrder,d as default};