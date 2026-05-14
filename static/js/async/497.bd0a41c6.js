"use strict";(self.webpackChunkcrm_web=self.webpackChunkcrm_web||[]).push([["497"],{4981(e,t,r){r.d(t,{A:()=>n});var o=r(290);let i={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 512 512"},n=(0,o.pM)({name:"AddOutline",render:function(e,t){return(0,o.uX)(),(0,o.CE)("svg",i,t[0]||(t[0]=[(0,o.Lk)("path",{fill:"none",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"32",d:"M256 112v288"},null,-1),(0,o.Lk)("path",{fill:"none",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"32",d:"M400 256H112"},null,-1)]))}})},5418(e,t,r){r.d(t,{A:()=>n});var o=r(290);let i={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 512 512"},n=(0,o.pM)({name:"CallOutline",render:function(e,t){return(0,o.uX)(),(0,o.CE)("svg",i,t[0]||(t[0]=[(0,o.Lk)("path",{d:"M451 374c-15.88-16-54.34-39.35-73-48.76c-24.3-12.24-26.3-13.24-45.4.95c-12.74 9.47-21.21 17.93-36.12 14.75s-47.31-21.11-75.68-49.39s-47.34-61.62-50.53-76.48s5.41-23.23 14.79-36c13.22-18 12.22-21 .92-45.3c-8.81-18.9-32.84-57-48.9-72.8C119.9 44 119.9 47 108.83 51.6A160.15 160.15 0 0 0 83 65.37C67 76 58.12 84.83 51.91 98.1s-9 44.38 23.07 102.64s54.57 88.05 101.14 134.49S258.5 406.64 310.85 436c64.76 36.27 89.6 29.2 102.91 23s22.18-15 32.83-31a159.09 159.09 0 0 0 13.8-25.8C465 391.17 468 391.17 451 374z",fill:"none",stroke:"currentColor","stroke-miterlimit":"10","stroke-width":"32"},null,-1)]))}})},6466(e,t,r){r.d(t,{A:()=>n});var o=r(290);let i={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 512 512"},n=(0,o.pM)({name:"SearchOutline",render:function(e,t){return(0,o.uX)(),(0,o.CE)("svg",i,t[0]||(t[0]=[(0,o.Lk)("path",{d:"M221.09 64a157.09 157.09 0 1 0 157.09 157.09A157.1 157.1 0 0 0 221.09 64z",fill:"none",stroke:"currentColor","stroke-miterlimit":"10","stroke-width":"32"},null,-1),(0,o.Lk)("path",{fill:"none",stroke:"currentColor","stroke-linecap":"round","stroke-miterlimit":"10","stroke-width":"32",d:"M338.29 338.29L448 448"},null,-1)]))}})},8271(e,t,r){r.d(t,{_:()=>a});var o=r(5454);let{cubicBezierEaseInOut:i,cubicBezierEaseOut:n,cubicBezierEaseIn:l}=r(6480).A;function a({overflow:e="hidden",duration:t=".3s",originalTransition:r="",leavingDelay:s="0s",foldPadding:c=!1,enterToProps:d,leaveToProps:h,reverse:p=!1}={}){let u=p?"leave":"enter",b=p?"enter":"leave";return[(0,o.c)(`&.fade-in-height-expand-transition-${b}-from,
 &.fade-in-height-expand-transition-${u}-to`,Object.assign(Object.assign({},d),{opacity:1})),(0,o.c)(`&.fade-in-height-expand-transition-${b}-to,
 &.fade-in-height-expand-transition-${u}-from`,Object.assign(Object.assign({},h),{opacity:0,marginTop:"0 !important",marginBottom:"0 !important",paddingTop:c?"0 !important":void 0,paddingBottom:c?"0 !important":void 0})),(0,o.c)(`&.fade-in-height-expand-transition-${b}-active`,`
 overflow: ${e};
 transition:
 max-height ${t} ${i} ${s},
 opacity ${t} ${n} ${s},
 margin-top ${t} ${i} ${s},
 margin-bottom ${t} ${i} ${s},
 padding-top ${t} ${i} ${s},
 padding-bottom ${t} ${i} ${s}
 ${r?`,${r}`:""}
 `),(0,o.c)(`&.fade-in-height-expand-transition-${u}-active`,`
 overflow: ${e};
 transition:
 max-height ${t} ${i},
 opacity ${t} ${l},
 margin-top ${t} ${i},
 margin-bottom ${t} ${i},
 padding-top ${t} ${i},
 padding-bottom ${t} ${i}
 ${r?`,${r}`:""}
 `)]}},9904(e,t,r){r.d(t,{A:()=>B});var o=r(4041),i=r(290),n=r(4254),l=r(9170),a=r(8250),s=r(4693),c=r(8588),d=r(3995),h=r(9278),p=r(9359),u=r(922),b=r(4019),g=r(9623),v=r(5454),m=r(9521),f=r(8850),x=r(8880);let w={iconMargin:"11px 8px 0 12px",iconMarginRtl:"11px 12px 0 8px",iconSize:"24px",closeIconSize:"16px",closeSize:"20px",closeMargin:"13px 14px 0 0",closeMarginRtl:"13px 0 0 14px",padding:"13px"},y={name:"Alert",common:x.A,self:function(e){let{lineHeight:t,borderRadius:r,fontWeightStrong:o,baseColor:i,dividerColor:n,actionColor:l,textColor1:a,textColor2:s,closeColorHover:c,closeColorPressed:d,closeIconColor:h,closeIconColorHover:p,closeIconColorPressed:u,infoColor:b,successColor:g,warningColor:v,errorColor:m,fontSize:x}=e;return Object.assign(Object.assign({},w),{fontSize:x,lineHeight:t,titleFontWeight:o,borderRadius:r,border:`1px solid ${n}`,color:l,titleTextColor:a,iconColor:s,contentTextColor:s,closeBorderRadius:r,closeColorHover:c,closeColorPressed:d,closeIconColor:h,closeIconColorHover:p,closeIconColorPressed:u,borderInfo:`1px solid ${(0,f.sN)(i,(0,f.QX)(b,{alpha:.25}))}`,colorInfo:(0,f.sN)(i,(0,f.QX)(b,{alpha:.08})),titleTextColorInfo:a,iconColorInfo:b,contentTextColorInfo:s,closeColorHoverInfo:c,closeColorPressedInfo:d,closeIconColorInfo:h,closeIconColorHoverInfo:p,closeIconColorPressedInfo:u,borderSuccess:`1px solid ${(0,f.sN)(i,(0,f.QX)(g,{alpha:.25}))}`,colorSuccess:(0,f.sN)(i,(0,f.QX)(g,{alpha:.08})),titleTextColorSuccess:a,iconColorSuccess:g,contentTextColorSuccess:s,closeColorHoverSuccess:c,closeColorPressedSuccess:d,closeIconColorSuccess:h,closeIconColorHoverSuccess:p,closeIconColorPressedSuccess:u,borderWarning:`1px solid ${(0,f.sN)(i,(0,f.QX)(v,{alpha:.33}))}`,colorWarning:(0,f.sN)(i,(0,f.QX)(v,{alpha:.08})),titleTextColorWarning:a,iconColorWarning:v,contentTextColorWarning:s,closeColorHoverWarning:c,closeColorPressedWarning:d,closeIconColorWarning:h,closeIconColorHoverWarning:p,closeIconColorPressedWarning:u,borderError:`1px solid ${(0,f.sN)(i,(0,f.QX)(m,{alpha:.25}))}`,colorError:(0,f.sN)(i,(0,f.QX)(m,{alpha:.08})),titleTextColorError:a,iconColorError:m,contentTextColorError:s,closeColorHoverError:c,closeColorPressedError:d,closeIconColorError:h,closeIconColorHoverError:p,closeIconColorPressedError:u})}};var C=r(8271);let $=(0,v.cB)("alert",`
 line-height: var(--n-line-height);
 border-radius: var(--n-border-radius);
 position: relative;
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-color);
 text-align: start;
 word-break: break-word;
`,[(0,v.cE)("border",`
 border-radius: inherit;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 transition: border-color .3s var(--n-bezier);
 border: var(--n-border);
 pointer-events: none;
 `),(0,v.cM)("closable",[(0,v.cB)("alert-body",[(0,v.cE)("title",`
 padding-right: 24px;
 `)])]),(0,v.cE)("icon",{color:"var(--n-icon-color)"}),(0,v.cB)("alert-body",{padding:"var(--n-padding)"},[(0,v.cE)("title",{color:"var(--n-title-text-color)"}),(0,v.cE)("content",{color:"var(--n-content-text-color)"})]),(0,C._)({originalTransition:"transform .3s var(--n-bezier)",enterToProps:{transform:"scale(1)"},leaveToProps:{transform:"scale(0.9)"}}),(0,v.cE)("icon",`
 position: absolute;
 left: 0;
 top: 0;
 align-items: center;
 justify-content: center;
 display: flex;
 width: var(--n-icon-size);
 height: var(--n-icon-size);
 font-size: var(--n-icon-size);
 margin: var(--n-icon-margin);
 `),(0,v.cE)("close",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 right: 0;
 top: 0;
 margin: var(--n-close-margin);
 `),(0,v.cM)("show-icon",[(0,v.cB)("alert-body",{paddingLeft:"calc(var(--n-icon-margin-left) + var(--n-icon-size) + var(--n-icon-margin-right))"})]),(0,v.cM)("right-adjust",[(0,v.cB)("alert-body",{paddingRight:"calc(var(--n-close-size) + var(--n-padding) + 2px)"})]),(0,v.cB)("alert-body",`
 border-radius: var(--n-border-radius);
 transition: border-color .3s var(--n-bezier);
 `,[(0,v.cE)("title",`
 transition: color .3s var(--n-bezier);
 font-size: 16px;
 line-height: 19px;
 font-weight: var(--n-title-font-weight);
 `,[(0,v.c)("& +",[(0,v.cE)("content",{marginTop:"9px"})])]),(0,v.cE)("content",{transition:"color .3s var(--n-bezier)",fontSize:"var(--n-font-size)"})]),(0,v.cE)("icon",{transition:"color .3s var(--n-bezier)"})]),k=Object.assign(Object.assign({},p.A.props),{title:String,showIcon:{type:Boolean,default:!0},type:{type:String,default:"default"},bordered:{type:Boolean,default:!0},closable:Boolean,onClose:Function,onAfterLeave:Function,onAfterHide:Function}),B=(0,i.pM)({name:"Alert",inheritAttrs:!1,props:k,slots:Object,setup(e){let{mergedClsPrefixRef:t,mergedBorderedRef:r,inlineThemeDisabled:n,mergedRtlRef:l}=(0,u.Ay)(e),a=(0,p.A)("Alert","-alert",$,y,e,t),s=(0,g.I)("Alert",l,t),c=(0,i.EW)(()=>{let{common:{cubicBezierEaseInOut:t},self:r}=a.value,{fontSize:i,borderRadius:n,titleFontWeight:l,lineHeight:s,iconSize:c,iconMargin:d,iconMarginRtl:h,closeIconSize:p,closeBorderRadius:u,closeSize:b,closeMargin:g,closeMarginRtl:m,padding:f}=r,{type:x}=e,{left:w,right:y}=(0,o.Tj)(d);return{"--n-bezier":t,"--n-color":r[(0,v.cF)("color",x)],"--n-close-icon-size":p,"--n-close-border-radius":u,"--n-close-color-hover":r[(0,v.cF)("closeColorHover",x)],"--n-close-color-pressed":r[(0,v.cF)("closeColorPressed",x)],"--n-close-icon-color":r[(0,v.cF)("closeIconColor",x)],"--n-close-icon-color-hover":r[(0,v.cF)("closeIconColorHover",x)],"--n-close-icon-color-pressed":r[(0,v.cF)("closeIconColorPressed",x)],"--n-icon-color":r[(0,v.cF)("iconColor",x)],"--n-border":r[(0,v.cF)("border",x)],"--n-title-text-color":r[(0,v.cF)("titleTextColor",x)],"--n-content-text-color":r[(0,v.cF)("contentTextColor",x)],"--n-line-height":s,"--n-border-radius":n,"--n-font-size":i,"--n-title-font-weight":l,"--n-icon-size":c,"--n-icon-margin":d,"--n-icon-margin-rtl":h,"--n-close-size":b,"--n-close-margin":g,"--n-close-margin-rtl":m,"--n-padding":f,"--n-icon-margin-left":w,"--n-icon-margin-right":y}}),d=n?(0,b.R)("alert",(0,i.EW)(()=>e.type[0]),c,e):void 0,h=(0,i.KR)(!0);return{rtlEnabled:s,mergedClsPrefix:t,mergedBordered:r,visible:h,handleCloseClick:()=>{var t;Promise.resolve(null==(t=e.onClose)?void 0:t.call(e)).then(e=>{!1!==e&&(h.value=!1)})},handleAfterLeave:()=>{(()=>{let{onAfterLeave:t,onAfterHide:r}=e;t&&t(),r&&r()})()},mergedTheme:a,cssVars:n?void 0:c,themeClass:null==d?void 0:d.themeClass,onRender:null==d?void 0:d.onRender}},render(){var e;return null==(e=this.onRender)||e.call(this),(0,i.h)(n.A,{onAfterLeave:this.handleAfterLeave},{default:()=>{let{mergedClsPrefix:e,$slots:t}=this,r={class:[`${e}-alert`,this.themeClass,this.closable&&`${e}-alert--closable`,this.showIcon&&`${e}-alert--show-icon`,!this.title&&this.closable&&`${e}-alert--right-adjust`,this.rtlEnabled&&`${e}-alert--rtl`],style:this.cssVars,role:"alert"};return this.visible?(0,i.h)("div",Object.assign({},(0,i.v6)(this.$attrs,r)),this.closable&&(0,i.h)(l.A,{clsPrefix:e,class:`${e}-alert__close`,onClick:this.handleCloseClick}),this.bordered&&(0,i.h)("div",{class:`${e}-alert__border`}),this.showIcon&&(0,i.h)("div",{class:`${e}-alert__icon`,"aria-hidden":"true"},(0,m.Nj)(t.icon,()=>[(0,i.h)(a.A,{clsPrefix:e},{default:()=>{switch(this.type){case"success":return(0,i.h)(s.A,null);case"info":return(0,i.h)(c.A,null);case"warning":return(0,i.h)(d.A,null);case"error":return(0,i.h)(h.A,null);default:return null}}})])),(0,i.h)("div",{class:[`${e}-alert-body`,this.mergedBordered&&`${e}-alert-body--bordered`]},(0,m.iQ)(t.header,t=>{let r=t||this.title;return r?(0,i.h)("div",{class:`${e}-alert-body__title`},r):null}),t.default&&(0,i.h)("div",{class:`${e}-alert-body__content`},t))):null}})}})},543(e,t,r){r.d(t,{B:()=>l});var o=r(290),i=r(8880),n=r(9157);function l(){let e=(0,o.WQ)(n.C,null);return(0,o.EW)(()=>{if(null===e)return i.A;let{mergedThemeRef:{value:t},mergedThemeOverridesRef:{value:r}}=e,o=(null==t?void 0:t.common)||i.A;return(null==r?void 0:r.common)?Object.assign({},o,r.common):o})}},7129(e,t,r){r.d(t,{A:()=>w});var o=r(9726),i=r(8872),n=r(290),l=r(9359),a=r(922),s=r(4019),c=r(5454),d=r(9598);function h(e,t="default",r=[]){let{children:o}=e;if(null!==o&&"object"==typeof o&&!Array.isArray(o)){let e=o[t];if("function"==typeof e)return e()}return r}var p=r(4957),u=r(8850),b=r(8880);let g={thPaddingBorderedSmall:"8px 12px",thPaddingBorderedMedium:"12px 16px",thPaddingBorderedLarge:"16px 24px",thPaddingSmall:"0",thPaddingMedium:"0",thPaddingLarge:"0",tdPaddingBorderedSmall:"8px 12px",tdPaddingBorderedMedium:"12px 16px",tdPaddingBorderedLarge:"16px 24px",tdPaddingSmall:"0 0 8px 0",tdPaddingMedium:"0 0 12px 0",tdPaddingLarge:"0 0 16px 0"},v={name:"Descriptions",common:b.A,self:function(e){let{tableHeaderColor:t,textColor2:r,textColor1:o,cardColor:i,modalColor:n,popoverColor:l,dividerColor:a,borderRadius:s,fontWeightStrong:c,lineHeight:d,fontSizeSmall:h,fontSizeMedium:p,fontSizeLarge:b}=e;return Object.assign(Object.assign({},g),{lineHeight:d,fontSizeSmall:h,fontSizeMedium:p,fontSizeLarge:b,titleTextColor:o,thColor:(0,u.sN)(i,t),thColorModal:(0,u.sN)(n,t),thColorPopover:(0,u.sN)(l,t),thTextColor:o,thFontWeight:c,tdTextColor:r,tdColor:i,tdColorModal:n,tdColorPopover:l,borderColor:(0,u.sN)(i,a),borderColorModal:(0,u.sN)(n,a),borderColorPopover:(0,u.sN)(l,a),borderRadius:s})}},m=(0,c.c)([(0,c.cB)("descriptions",{fontSize:"var(--n-font-size)"},[(0,c.cB)("descriptions-separator",`
 display: inline-block;
 margin: 0 8px 0 2px;
 `),(0,c.cB)("descriptions-table-wrapper",[(0,c.cB)("descriptions-table",[(0,c.cB)("descriptions-table-row",[(0,c.cB)("descriptions-table-header",{padding:"var(--n-th-padding)"}),(0,c.cB)("descriptions-table-content",{padding:"var(--n-td-padding)"})])])]),(0,c.C5)("bordered",[(0,c.cB)("descriptions-table-wrapper",[(0,c.cB)("descriptions-table",[(0,c.cB)("descriptions-table-row",[(0,c.c)("&:last-child",[(0,c.cB)("descriptions-table-content",{paddingBottom:0})])])])])]),(0,c.cM)("left-label-placement",[(0,c.cB)("descriptions-table-content",[(0,c.c)("> *",{verticalAlign:"top"})])]),(0,c.cM)("left-label-align",[(0,c.c)("th",{textAlign:"left"})]),(0,c.cM)("center-label-align",[(0,c.c)("th",{textAlign:"center"})]),(0,c.cM)("right-label-align",[(0,c.c)("th",{textAlign:"right"})]),(0,c.cM)("bordered",[(0,c.cB)("descriptions-table-wrapper",`
 border-radius: var(--n-border-radius);
 overflow: hidden;
 background: var(--n-merged-td-color);
 border: 1px solid var(--n-merged-border-color);
 `,[(0,c.cB)("descriptions-table",[(0,c.cB)("descriptions-table-row",[(0,c.c)("&:not(:last-child)",[(0,c.cB)("descriptions-table-content",{borderBottom:"1px solid var(--n-merged-border-color)"}),(0,c.cB)("descriptions-table-header",{borderBottom:"1px solid var(--n-merged-border-color)"})]),(0,c.cB)("descriptions-table-header",`
 font-weight: 400;
 background-clip: padding-box;
 background-color: var(--n-merged-th-color);
 `,[(0,c.c)("&:not(:last-child)",{borderRight:"1px solid var(--n-merged-border-color)"})]),(0,c.cB)("descriptions-table-content",[(0,c.c)("&:not(:last-child)",{borderRight:"1px solid var(--n-merged-border-color)"})])])])])]),(0,c.cB)("descriptions-header",`
 font-weight: var(--n-th-font-weight);
 font-size: 18px;
 transition: color .3s var(--n-bezier);
 line-height: var(--n-line-height);
 margin-bottom: 16px;
 color: var(--n-title-text-color);
 `),(0,c.cB)("descriptions-table-wrapper",`
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[(0,c.cB)("descriptions-table",`
 width: 100%;
 border-collapse: separate;
 border-spacing: 0;
 box-sizing: border-box;
 `,[(0,c.cB)("descriptions-table-row",`
 box-sizing: border-box;
 transition: border-color .3s var(--n-bezier);
 `,[(0,c.cB)("descriptions-table-header",`
 font-weight: var(--n-th-font-weight);
 line-height: var(--n-line-height);
 display: table-cell;
 box-sizing: border-box;
 color: var(--n-th-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `),(0,c.cB)("descriptions-table-content",`
 vertical-align: top;
 line-height: var(--n-line-height);
 display: table-cell;
 box-sizing: border-box;
 color: var(--n-td-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[(0,c.cE)("content",`
 transition: color .3s var(--n-bezier);
 display: inline-block;
 color: var(--n-td-text-color);
 `)]),(0,c.cE)("label",`
 font-weight: var(--n-th-font-weight);
 transition: color .3s var(--n-bezier);
 display: inline-block;
 margin-right: 14px;
 color: var(--n-th-text-color);
 `)])])])]),(0,c.cB)("descriptions-table-wrapper",`
 --n-merged-th-color: var(--n-th-color);
 --n-merged-td-color: var(--n-td-color);
 --n-merged-border-color: var(--n-border-color);
 `),(0,c.EM)((0,c.cB)("descriptions-table-wrapper",`
 --n-merged-th-color: var(--n-th-color-modal);
 --n-merged-td-color: var(--n-td-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `)),(0,c.ES)((0,c.cB)("descriptions-table-wrapper",`
 --n-merged-th-color: var(--n-th-color-popover);
 --n-merged-td-color: var(--n-td-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `))]);var f=r(9538);let x=Object.assign(Object.assign({},l.A.props),{title:String,column:{type:Number,default:3},columns:Number,labelPlacement:{type:String,default:"top"},labelAlign:{type:String,default:"left"},separator:{type:String,default:":"},size:String,bordered:Boolean,labelClass:String,labelStyle:[Object,String],contentClass:String,contentStyle:[Object,String]}),w=(0,n.pM)({name:"Descriptions",props:x,slots:Object,setup(e){let{mergedClsPrefixRef:t,inlineThemeDisabled:r,mergedComponentPropsRef:o}=(0,a.Ay)(e),d=(0,n.EW)(()=>{var t,r;return e.size||(null==(r=null==(t=null==o?void 0:o.value)?void 0:t.Descriptions)?void 0:r.size)||"medium"}),h=(0,l.A)("Descriptions","-descriptions",m,v,e,t),p=(0,n.EW)(()=>{let{bordered:t}=e,r=d.value,{common:{cubicBezierEaseInOut:o},self:{titleTextColor:i,thColor:n,thColorModal:l,thColorPopover:a,thTextColor:s,thFontWeight:p,tdTextColor:u,tdColor:b,tdColorModal:g,tdColorPopover:v,borderColor:m,borderColorModal:f,borderColorPopover:x,borderRadius:w,lineHeight:y,[(0,c.cF)("fontSize",r)]:C,[(0,c.cF)(t?"thPaddingBordered":"thPadding",r)]:$,[(0,c.cF)(t?"tdPaddingBordered":"tdPadding",r)]:k}}=h.value;return{"--n-title-text-color":i,"--n-th-padding":$,"--n-td-padding":k,"--n-font-size":C,"--n-bezier":o,"--n-th-font-weight":p,"--n-line-height":y,"--n-th-text-color":s,"--n-td-text-color":u,"--n-th-color":n,"--n-th-color-modal":l,"--n-th-color-popover":a,"--n-td-color":b,"--n-td-color-modal":g,"--n-td-color-popover":v,"--n-border-radius":w,"--n-border-color":m,"--n-border-color-modal":f,"--n-border-color-popover":x}}),u=r?(0,s.R)("descriptions",(0,n.EW)(()=>{let t="",{bordered:r}=e;return r&&(t+="a"),t+=d.value[0]}),p,e):void 0;return{mergedClsPrefix:t,cssVars:r?void 0:p,themeClass:null==u?void 0:u.themeClass,onRender:null==u?void 0:u.onRender,compitableColumn:(0,i.A)(e,["columns","column"]),inlineThemeDisabled:r,mergedSize:d}},render(){let e=this.$slots.default,t=e?(0,d.B)(e()):[];t.length;let{contentClass:r,labelClass:i,compitableColumn:l,labelPlacement:a,labelAlign:s,mergedSize:c,bordered:u,title:b,cssVars:g,mergedClsPrefix:v,separator:m,onRender:x}=this;null==x||x();let w=t.filter(e=>(0,f.R)(e)),y=w.reduce((e,t,o)=>{let s=t.props||{},c=w.length-1===o,d=["label"in s?s.label:h(t,"label")],p=[h(t)],b=s.span||1,g=e.span;e.span+=b;let f=s.labelStyle||s["label-style"]||this.labelStyle,x=s.contentStyle||s["content-style"]||this.contentStyle;if("left"===a)u?e.row.push((0,n.h)("th",{class:[`${v}-descriptions-table-header`,i],colspan:1,style:f},d),(0,n.h)("td",{class:[`${v}-descriptions-table-content`,r],colspan:c?(l-g)*2+1:2*b-1,style:x},p)):e.row.push((0,n.h)("td",{class:`${v}-descriptions-table-content`,colspan:c?(l-g)*2:2*b},(0,n.h)("span",{class:[`${v}-descriptions-table-content__label`,i],style:f},[...d,m&&(0,n.h)("span",{class:`${v}-descriptions-separator`},m)]),(0,n.h)("span",{class:[`${v}-descriptions-table-content__content`,r],style:x},p)));else{let t=c?(l-g)*2:2*b;e.row.push((0,n.h)("th",{class:[`${v}-descriptions-table-header`,i],colspan:t,style:f},d)),e.secondRow.push((0,n.h)("td",{class:[`${v}-descriptions-table-content`,r],colspan:t,style:x},p))}return(e.span>=l||c)&&(e.span=0,e.row.length&&(e.rows.push(e.row),e.row=[]),"left"!==a&&e.secondRow.length&&(e.rows.push(e.secondRow),e.secondRow=[])),e},{span:0,row:[],secondRow:[],rows:[]}).rows.map(e=>(0,n.h)("tr",{class:`${v}-descriptions-table-row`},e));return(0,n.h)("div",{style:g,class:[`${v}-descriptions`,this.themeClass,`${v}-descriptions--${a}-label-placement`,`${v}-descriptions--${s}-label-align`,`${v}-descriptions--${c}-size`,u&&`${v}-descriptions--bordered`]},b||this.$slots.header?(0,n.h)("div",{class:`${v}-descriptions-header`},b||(0,p.$)(this,"header")):null,(0,n.h)("div",{class:`${v}-descriptions-table-wrapper`},(0,n.h)("table",{class:`${v}-descriptions-table`},(0,n.h)("tbody",null,"top"===a&&(0,n.h)("tr",{class:`${v}-descriptions-table-row`,style:{visibility:"collapse"}},(0,o.ux)(2*l,(0,n.h)("td",null))),y))))}})},4967(e,t,r){r.d(t,{A:()=>n});var o=r(290),i=r(9538);let n=(0,o.pM)({name:"DescriptionsItem",[i.M]:!0,props:{label:String,span:{type:Number,default:1},labelClass:String,labelStyle:[Object,String],contentClass:String,contentStyle:[Object,String]},slots:Object,render:()=>null})},9538(e,t,r){r.d(t,{M:()=>o,R:()=>i});let o="DESCRIPTION_ITEM_FLAG";function i(e){return!("object"!=typeof e||!e||Array.isArray(e))&&e.type&&e.type[o]}},7278(e,t,r){r.d(t,{A:()=>h});var o=r(290),i=r(9359),n=r(922),l=r(4019);let a={name:"Divider",common:r(8880).A,self:function(e){let{textColor1:t,dividerColor:r,fontWeightStrong:o}=e;return{textColor:t,color:r,fontWeight:o}}};var s=r(5454);let c=(0,s.cB)("divider",`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[(0,s.C5)("vertical",`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[(0,s.C5)("no-title",`
 display: flex;
 align-items: center;
 `)]),(0,s.cE)("title",`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),(0,s.cM)("title-position-left",[(0,s.cE)("line",[(0,s.cM)("left",{width:"28px"})])]),(0,s.cM)("title-position-right",[(0,s.cE)("line",[(0,s.cM)("right",{width:"28px"})])]),(0,s.cM)("dashed",[(0,s.cE)("line",`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),(0,s.cM)("vertical",`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),(0,s.cE)("line",`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),(0,s.C5)("dashed",[(0,s.cE)("line",{backgroundColor:"var(--n-color)"})]),(0,s.cM)("dashed",[(0,s.cE)("line",{borderColor:"var(--n-color)"})]),(0,s.cM)("vertical",{backgroundColor:"var(--n-color)"})]),d=Object.assign(Object.assign({},i.A.props),{titlePlacement:{type:String,default:"center"},dashed:Boolean,vertical:Boolean}),h=(0,o.pM)({name:"Divider",props:d,setup(e){let{mergedClsPrefixRef:t,inlineThemeDisabled:r}=(0,n.Ay)(e),s=(0,i.A)("Divider","-divider",c,a,e,t),d=(0,o.EW)(()=>{let{common:{cubicBezierEaseInOut:e},self:{color:t,textColor:r,fontWeight:o}}=s.value;return{"--n-bezier":e,"--n-color":t,"--n-text-color":r,"--n-font-weight":o}}),h=r?(0,l.R)("divider",void 0,d,e):void 0;return{mergedClsPrefix:t,cssVars:r?void 0:d,themeClass:null==h?void 0:h.themeClass,onRender:null==h?void 0:h.onRender}},render(){var e;let{$slots:t,titlePlacement:r,vertical:i,dashed:n,cssVars:l,mergedClsPrefix:a}=this;return null==(e=this.onRender)||e.call(this),(0,o.h)("div",{role:"separator",class:[`${a}-divider`,this.themeClass,{[`${a}-divider--vertical`]:i,[`${a}-divider--no-title`]:!t.default,[`${a}-divider--dashed`]:n,[`${a}-divider--title-position-${r}`]:t.default&&r}],style:l},i?null:(0,o.h)("div",{class:`${a}-divider__line ${a}-divider__line--left`}),!i&&t.default?(0,o.h)(o.FK,null,(0,o.h)("div",{class:`${a}-divider__title`},this.$slots),(0,o.h)("div",{class:`${a}-divider__line ${a}-divider__line--right`})):null)}})},8275(e,t,r){r.d(t,{A:()=>s});var o=r(290),i=r(922),n=r(2011),l=r(5454);let a=(0,l.cB)("input-group",`
 display: inline-flex;
 width: 100%;
 flex-wrap: nowrap;
 vertical-align: bottom;
`,[(0,l.c)(">",[(0,l.cB)("input",[(0,l.c)("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),(0,l.c)("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 margin-left: -1px!important;
 `)]),(0,l.cB)("button",[(0,l.c)("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[(0,l.cE)("state-border, border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)]),(0,l.c)("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[(0,l.cE)("state-border, border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])]),(0,l.c)("*",[(0,l.c)("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[(0,l.c)(">",[(0,l.cB)("input",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),(0,l.cB)("base-selection",[(0,l.cB)("base-selection-label",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),(0,l.cB)("base-selection-tags",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),(0,l.cE)("box-shadow, border, state-border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)])])]),(0,l.c)("&:not(:first-child)",`
 margin-left: -1px!important;
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[(0,l.c)(">",[(0,l.cB)("input",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),(0,l.cB)("base-selection",[(0,l.cB)("base-selection-label",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),(0,l.cB)("base-selection-tags",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),(0,l.cE)("box-shadow, border, state-border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])])])])])]),s=(0,o.pM)({name:"InputGroup",props:{},setup(e){let{mergedClsPrefixRef:t}=(0,i.Ay)(e);return(0,n.A)("-input-group",a,t),{mergedClsPrefix:t}},render(){let{mergedClsPrefix:e}=this;return(0,o.h)("div",{class:`${e}-input-group`},this.$slots)}})},1797(e,t,r){r.d(t,{A:()=>v});var o=r(4041),i=r(8872),n=r(290),l=r(3445),a=r(9359),s=r(922),c=r(4019),d=r(5454);let h={name:"Spin",common:r(8880).A,self:function(e){let{opacityDisabled:t,heightTiny:r,heightSmall:o,heightMedium:i,heightLarge:n,heightHuge:l,primaryColor:a,fontSize:s}=e;return{fontSize:s,textColor:a,sizeTiny:r,sizeSmall:o,sizeMedium:i,sizeLarge:n,sizeHuge:l,color:a,opacitySpinning:t}}};var p=r(5268);let u=(0,d.c)([(0,d.c)("@keyframes spin-rotate",`
 from {
 transform: rotate(0);
 }
 to {
 transform: rotate(360deg);
 }
 `),(0,d.cB)("spin-container",`
 position: relative;
 `,[(0,d.cB)("spin-body",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 `,[(0,p.v)()])]),(0,d.cB)("spin-body",`
 display: inline-flex;
 align-items: center;
 justify-content: center;
 flex-direction: column;
 `),(0,d.cB)("spin",`
 display: inline-flex;
 height: var(--n-size);
 width: var(--n-size);
 font-size: var(--n-size);
 color: var(--n-color);
 `,[(0,d.cM)("rotate",`
 animation: spin-rotate 2s linear infinite;
 `)]),(0,d.cB)("spin-description",`
 display: inline-block;
 font-size: var(--n-font-size);
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 margin-top: 8px;
 `),(0,d.cB)("spin-content",`
 opacity: 1;
 transition: opacity .3s var(--n-bezier);
 pointer-events: all;
 `,[(0,d.cM)("spinning",`
 user-select: none;
 -webkit-user-select: none;
 pointer-events: none;
 opacity: var(--n-opacity-spinning);
 `)])]),b={small:20,medium:18,large:16},g=Object.assign(Object.assign(Object.assign({},a.A.props),{contentClass:String,contentStyle:[Object,String],description:String,size:{type:[String,Number],default:"medium"},show:{type:Boolean,default:!0},rotate:{type:Boolean,default:!0},spinning:{type:Boolean,validator:()=>!0,default:void 0},delay:Number}),l.j),v=(0,n.pM)({name:"Spin",props:g,slots:Object,setup(e){let{mergedClsPrefixRef:t,inlineThemeDisabled:r}=(0,s.Ay)(e),l=(0,a.A)("Spin","-spin",u,h,e,t),p=(0,n.EW)(()=>{let{size:t}=e,{common:{cubicBezierEaseInOut:r},self:i}=l.value,{opacitySpinning:n,color:a,textColor:s}=i;return{"--n-bezier":r,"--n-opacity-spinning":n,"--n-size":"number"==typeof t?(0,o.Cw)(t):i[(0,d.cF)("size",t)],"--n-color":a,"--n-text-color":s}}),g=r?(0,c.R)("spin",(0,n.EW)(()=>{let{size:t}=e;return"number"==typeof t?String(t):t[0]}),p,e):void 0,v=(0,i.A)(e,["spinning","show"]),m=(0,n.KR)(!1);return(0,n.nT)(t=>{let r;if(v.value){let{delay:o}=e;if(o){r=window.setTimeout(()=>{m.value=!0},o),t(()=>{clearTimeout(r)});return}}m.value=v.value}),{mergedClsPrefix:t,active:m,mergedStrokeWidth:(0,n.EW)(()=>{let{strokeWidth:t}=e;if(void 0!==t)return t;let{size:r}=e;return b["number"==typeof r?"medium":r]}),cssVars:r?void 0:p,themeClass:null==g?void 0:g.themeClass,onRender:null==g?void 0:g.onRender}},render(){var e,t;let{$slots:r,mergedClsPrefix:o,description:i}=this,a=r.icon&&this.rotate,s=(i||r.description)&&(0,n.h)("div",{class:`${o}-spin-description`},i||(null==(e=r.description)?void 0:e.call(r))),c=r.icon?(0,n.h)("div",{class:[`${o}-spin-body`,this.themeClass]},(0,n.h)("div",{class:[`${o}-spin`,a&&`${o}-spin--rotate`],style:r.default?"":this.cssVars},r.icon()),s):(0,n.h)("div",{class:[`${o}-spin-body`,this.themeClass]},(0,n.h)(l.A,{clsPrefix:o,style:r.default?"":this.cssVars,stroke:this.stroke,"stroke-width":this.mergedStrokeWidth,radius:this.radius,scale:this.scale,class:`${o}-spin`}),s);return null==(t=this.onRender)||t.call(this),r.default?(0,n.h)("div",{class:[`${o}-spin-container`,this.themeClass],style:this.cssVars},(0,n.h)("div",{class:[`${o}-spin-content`,this.active&&`${o}-spin-content--spinning`,this.contentClass],style:this.contentStyle},r),(0,n.h)(n.eB,{name:"fade-in-transition"},{default:()=>this.active?c:null})):c}})},2760(e,t,r){let o;r.d(t,{A:()=>$});var i=r(4041),n=r(5562),l=r(290),a=r(9819),s=r(3445),c=r(9359),d=r(922),h=r(3370),p=r(4019),u=r(6680),b=r(5454),g=r(9521),v=r(8850),m=r(8880);let f={buttonHeightSmall:"14px",buttonHeightMedium:"18px",buttonHeightLarge:"22px",buttonWidthSmall:"14px",buttonWidthMedium:"18px",buttonWidthLarge:"22px",buttonWidthPressedSmall:"20px",buttonWidthPressedMedium:"24px",buttonWidthPressedLarge:"28px",railHeightSmall:"18px",railHeightMedium:"22px",railHeightLarge:"26px",railWidthSmall:"32px",railWidthMedium:"40px",railWidthLarge:"48px"},x={name:"Switch",common:m.A,self:function(e){let{primaryColor:t,opacityDisabled:r,borderRadius:o,textColor3:i}=e;return Object.assign(Object.assign({},f),{iconColor:i,textColor:"white",loadingColor:t,opacityDisabled:r,railColor:"rgba(0, 0, 0, .14)",railColorActive:t,buttonBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",buttonColor:"#FFF",railBorderRadiusSmall:o,railBorderRadiusMedium:o,railBorderRadiusLarge:o,buttonBorderRadiusSmall:o,buttonBorderRadiusMedium:o,buttonBorderRadiusLarge:o,boxShadowFocus:`0 0 0 2px ${(0,v.QX)(t,{alpha:.2})}`})}};var w=r(8454);let y=(0,b.cB)("switch",`
 height: var(--n-height);
 min-width: var(--n-width);
 vertical-align: middle;
 user-select: none;
 -webkit-user-select: none;
 display: inline-flex;
 outline: none;
 justify-content: center;
 align-items: center;
`,[(0,b.cE)("children-placeholder",`
 height: var(--n-rail-height);
 display: flex;
 flex-direction: column;
 overflow: hidden;
 pointer-events: none;
 visibility: hidden;
 `),(0,b.cE)("rail-placeholder",`
 display: flex;
 flex-wrap: none;
 `),(0,b.cE)("button-placeholder",`
 width: calc(1.75 * var(--n-rail-height));
 height: var(--n-rail-height);
 `),(0,b.cB)("base-loading",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 font-size: calc(var(--n-button-width) - 4px);
 color: var(--n-loading-color);
 transition: color .3s var(--n-bezier);
 `,[(0,w.N)({left:"50%",top:"50%",originalTransform:"translateX(-50%) translateY(-50%)"})]),(0,b.cE)("checked, unchecked",`
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 box-sizing: border-box;
 position: absolute;
 white-space: nowrap;
 top: 0;
 bottom: 0;
 display: flex;
 align-items: center;
 line-height: 1;
 `),(0,b.cE)("checked",`
 right: 0;
 padding-right: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),(0,b.cE)("unchecked",`
 left: 0;
 justify-content: flex-end;
 padding-left: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),(0,b.c)("&:focus",[(0,b.cE)("rail",`
 box-shadow: var(--n-box-shadow-focus);
 `)]),(0,b.cM)("round",[(0,b.cE)("rail","border-radius: calc(var(--n-rail-height) / 2);",[(0,b.cE)("button","border-radius: calc(var(--n-button-height) / 2);")])]),(0,b.C5)("disabled",[(0,b.C5)("icon",[(0,b.cM)("rubber-band",[(0,b.cM)("pressed",[(0,b.cE)("rail",[(0,b.cE)("button","max-width: var(--n-button-width-pressed);")])]),(0,b.cE)("rail",[(0,b.c)("&:active",[(0,b.cE)("button","max-width: var(--n-button-width-pressed);")])]),(0,b.cM)("active",[(0,b.cM)("pressed",[(0,b.cE)("rail",[(0,b.cE)("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])]),(0,b.cE)("rail",[(0,b.c)("&:active",[(0,b.cE)("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])])])])])]),(0,b.cM)("active",[(0,b.cE)("rail",[(0,b.cE)("button","left: calc(100% - var(--n-button-width) - var(--n-offset))")])]),(0,b.cE)("rail",`
 overflow: hidden;
 height: var(--n-rail-height);
 min-width: var(--n-rail-width);
 border-radius: var(--n-rail-border-radius);
 cursor: pointer;
 position: relative;
 transition:
 opacity .3s var(--n-bezier),
 background .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 background-color: var(--n-rail-color);
 `,[(0,b.cE)("button-icon",`
 color: var(--n-icon-color);
 transition: color .3s var(--n-bezier);
 font-size: calc(var(--n-button-height) - 4px);
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 display: flex;
 justify-content: center;
 align-items: center;
 line-height: 1;
 `,[(0,w.N)()]),(0,b.cE)("button",`
 align-items: center; 
 top: var(--n-offset);
 left: var(--n-offset);
 height: var(--n-button-height);
 width: var(--n-button-width-pressed);
 max-width: var(--n-button-width);
 border-radius: var(--n-button-border-radius);
 background-color: var(--n-button-color);
 box-shadow: var(--n-button-box-shadow);
 box-sizing: border-box;
 cursor: inherit;
 content: "";
 position: absolute;
 transition:
 background-color .3s var(--n-bezier),
 left .3s var(--n-bezier),
 opacity .3s var(--n-bezier),
 max-width .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 `)]),(0,b.cM)("active",[(0,b.cE)("rail","background-color: var(--n-rail-color-active);")]),(0,b.cM)("loading",[(0,b.cE)("rail",`
 cursor: wait;
 `)]),(0,b.cM)("disabled",[(0,b.cE)("rail",`
 cursor: not-allowed;
 opacity: .5;
 `)])]),C=Object.assign(Object.assign({},c.A.props),{size:String,value:{type:[String,Number,Boolean],default:void 0},loading:Boolean,defaultValue:{type:[String,Number,Boolean],default:!1},disabled:{type:Boolean,default:void 0},round:{type:Boolean,default:!0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],checkedValue:{type:[String,Number,Boolean],default:!0},uncheckedValue:{type:[String,Number,Boolean],default:!1},railStyle:Function,rubberBand:{type:Boolean,default:!0},spinProps:Object,onChange:[Function,Array]}),$=(0,l.pM)({name:"Switch",props:C,slots:Object,setup(e){void 0===o&&(o=!("u">typeof CSS)||void 0!==CSS.supports&&CSS.supports("width","max(1px)"));let{mergedClsPrefixRef:t,inlineThemeDisabled:r,mergedComponentPropsRef:a}=(0,d.Ay)(e),s=(0,c.A)("Switch","-switch",y,x,e,t),g=(0,h.A)(e,{mergedSize(t){var r,o;if(void 0!==e.size)return e.size;if(t)return t.mergedSize.value;let i=null==(o=null==(r=null==a?void 0:a.value)?void 0:r.Switch)?void 0:o.size;return i||"medium"}}),{mergedSizeRef:v,mergedDisabledRef:m}=g,f=(0,l.KR)(e.defaultValue),w=(0,l.lW)(e,"value"),C=(0,n.A)(w,f),$=(0,l.EW)(()=>C.value===e.checkedValue),k=(0,l.KR)(!1),B=(0,l.KR)(!1),z=(0,l.EW)(()=>{let{railStyle:t}=e;if(t)return t({focused:B.value,checked:$.value})});function S(t){let{"onUpdate:value":r,onChange:o,onUpdateValue:i}=e,{nTriggerFormInput:n,nTriggerFormChange:l}=g;r&&(0,u.T)(r,t),i&&(0,u.T)(i,t),o&&(0,u.T)(o,t),f.value=t,n(),l()}let E=(0,l.EW)(()=>{let e,t,r,{value:n}=v,{self:{opacityDisabled:l,railColor:a,railColorActive:c,buttonBoxShadow:d,buttonColor:h,boxShadowFocus:p,loadingColor:u,textColor:g,iconColor:m,[(0,b.cF)("buttonHeight",n)]:f,[(0,b.cF)("buttonWidth",n)]:x,[(0,b.cF)("buttonWidthPressed",n)]:w,[(0,b.cF)("railHeight",n)]:y,[(0,b.cF)("railWidth",n)]:C,[(0,b.cF)("railBorderRadius",n)]:$,[(0,b.cF)("buttonBorderRadius",n)]:k},common:{cubicBezierEaseInOut:B}}=s.value;return o?(e=`calc((${y} - ${f}) / 2)`,t=`max(${y}, ${f})`,r=`max(${C}, calc(${C} + ${f} - ${y}))`):(e=(0,i.Cw)(((0,i.eV)(y)-(0,i.eV)(f))/2),t=(0,i.Cw)(Math.max((0,i.eV)(y),(0,i.eV)(f))),r=(0,i.eV)(y)>(0,i.eV)(f)?C:(0,i.Cw)((0,i.eV)(C)+(0,i.eV)(f)-(0,i.eV)(y))),{"--n-bezier":B,"--n-button-border-radius":k,"--n-button-box-shadow":d,"--n-button-color":h,"--n-button-width":x,"--n-button-width-pressed":w,"--n-button-height":f,"--n-height":t,"--n-offset":e,"--n-opacity-disabled":l,"--n-rail-border-radius":$,"--n-rail-color":a,"--n-rail-color-active":c,"--n-rail-height":y,"--n-rail-width":C,"--n-width":r,"--n-box-shadow-focus":p,"--n-loading-color":u,"--n-text-color":g,"--n-icon-color":m}}),A=r?(0,p.R)("switch",(0,l.EW)(()=>v.value[0]),E,e):void 0;return{handleClick:function(){e.loading||m.value||(C.value!==e.checkedValue?S(e.checkedValue):S(e.uncheckedValue))},handleBlur:function(){B.value=!1,function(){let{nTriggerFormBlur:e}=g;e()}(),k.value=!1},handleFocus:function(){B.value=!0,function(){let{nTriggerFormFocus:e}=g;e()}()},handleKeyup:function(t){e.loading||m.value||" "===t.key&&(C.value!==e.checkedValue?S(e.checkedValue):S(e.uncheckedValue),k.value=!1)},handleKeydown:function(t){e.loading||m.value||" "===t.key&&(t.preventDefault(),k.value=!0)},mergedRailStyle:z,pressed:k,mergedClsPrefix:t,mergedValue:C,checked:$,mergedDisabled:m,cssVars:r?void 0:E,themeClass:null==A?void 0:A.themeClass,onRender:null==A?void 0:A.onRender}},render(){let{mergedClsPrefix:e,mergedDisabled:t,checked:r,mergedRailStyle:o,onRender:i,$slots:n}=this;null==i||i();let{checked:c,unchecked:d,icon:h,"checked-icon":p,"unchecked-icon":u}=n,b=!((0,g.yr)(h)&&(0,g.yr)(p)&&(0,g.yr)(u));return(0,l.h)("div",{role:"switch","aria-checked":r,class:[`${e}-switch`,this.themeClass,b&&`${e}-switch--icon`,r&&`${e}-switch--active`,t&&`${e}-switch--disabled`,this.round&&`${e}-switch--round`,this.loading&&`${e}-switch--loading`,this.pressed&&`${e}-switch--pressed`,this.rubberBand&&`${e}-switch--rubber-band`],tabindex:this.mergedDisabled?void 0:0,style:this.cssVars,onClick:this.handleClick,onFocus:this.handleFocus,onBlur:this.handleBlur,onKeyup:this.handleKeyup,onKeydown:this.handleKeydown},(0,l.h)("div",{class:`${e}-switch__rail`,"aria-hidden":"true",style:o},(0,g.iQ)(c,t=>(0,g.iQ)(d,r=>t||r?(0,l.h)("div",{"aria-hidden":!0,class:`${e}-switch__children-placeholder`},(0,l.h)("div",{class:`${e}-switch__rail-placeholder`},(0,l.h)("div",{class:`${e}-switch__button-placeholder`}),t),(0,l.h)("div",{class:`${e}-switch__rail-placeholder`},(0,l.h)("div",{class:`${e}-switch__button-placeholder`}),r)):null)),(0,l.h)("div",{class:`${e}-switch__button`},(0,g.iQ)(h,t=>(0,g.iQ)(p,r=>(0,g.iQ)(u,o=>(0,l.h)(a.A,null,{default:()=>this.loading?(0,l.h)(s.A,Object.assign({key:"loading",clsPrefix:e,strokeWidth:20},this.spinProps)):this.checked&&(r||t)?(0,l.h)("div",{class:`${e}-switch__button-icon`,key:r?"checked-icon":"icon"},r||t):!this.checked&&(o||t)?(0,l.h)("div",{class:`${e}-switch__button-icon`,key:o?"unchecked-icon":"icon"},o||t):null})))),(0,g.iQ)(c,t=>t&&(0,l.h)("div",{key:"checked",class:`${e}-switch__checked`},t)),(0,g.iQ)(d,t=>t&&(0,l.h)("div",{key:"unchecked",class:`${e}-switch__unchecked`},t)))))}})}}]);