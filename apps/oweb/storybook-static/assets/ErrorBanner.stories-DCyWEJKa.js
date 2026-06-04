import{i as e}from"./preload-helper-xPQekRTU.js";import{g as t}from"./iframe-Bbza3pWg.js";function n({message:e}){return(0,r.jsx)(`div`,{className:`rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger`,children:e})}var r,i=e((()=>{r=t(),n.__docgenInfo={description:``,methods:[],displayName:`ErrorBanner`,props:{message:{required:!0,tsType:{name:`string`},description:``}}}})),a,o,s,c,l;e((()=>{i(),a={title:`Components/ErrorBanner`,component:n,tags:[`autodocs`],argTypes:{message:{control:`text`}}},o={args:{message:`Something went wrong. Please try again.`}},s={args:{message:`Unable to connect to Odoo server. The server may be down or unreachable. Please check your network connection and try again.`}},c={args:{message:`Invalid credentials`}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Something went wrong. Please try again.'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Unable to connect to Odoo server. The server may be down or unreachable. Please check your network connection and try again.'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Invalid credentials'
  }
}`,...c.parameters?.docs?.source}}},l=[`Default`,`LongMessage`,`ShortMessage`]}))();export{o as Default,s as LongMessage,c as ShortMessage,l as __namedExportsOrder,a as default};