"use strict";(self.webpackChunkcrm_web=self.webpackChunkcrm_web||[]).push([["330"],{7313(e,t,a){a.r(t),a.d(t,{default:()=>F});var l=a(3141),i=a(5401),o=a(6465),n=a(290),r=a(7430),d=a(4382),s=a(4384),u=a(9912),c=a(4952),h=a(9809),p=a(1576),v=a(7532),b=a(2408),f=a(801),y=a(5449),g=a(5403),m=a(5887),w=a(4368),k=a(349),x=a(2770),_=a(2760),A=a(9777),R=a(2877),S=a(4491),z=a(7226),E=a(5765);let W=e=>{if(!e)return[];try{return JSON.parse(e).map(e=>"object"==typeof e?{label:e.label||e.zh||e.name||e.value||e.val||e.id,value:String(e.value||e.val||e.id)}:{label:String(e),value:String(e)})}catch{return String(e).split(",").filter(Boolean).map(e=>({label:e.trim(),value:e.trim()}))}},C=(0,n.pM)({__name:"EditDrawer",props:{show:{type:Boolean},saving:{type:Boolean},form:{},fields:{}},emits:["update:show","save"],setup(e,t){let{emit:a}=t;return(t,l)=>((0,n.uX)(),(0,n.Wv)((0,n.R1)(c.A),{show:e.show,"onUpdate:show":l[4]||(l[4]=e=>a("update:show",e)),width:400},{default:(0,n.k6)(()=>[(0,n.bF)((0,n.R1)(h.A),{title:(0,n.R1)(r.t)("编辑客户信息"),closable:""},{footer:(0,n.k6)(()=>[(0,n.bF)((0,n.R1)(p.A),{justify:"end",class:"w-full"},{default:(0,n.k6)(()=>[(0,n.bF)((0,n.R1)(v.Ay),{onClick:l[2]||(l[2]=e=>a("update:show",!1))},{default:(0,n.k6)(()=>[(0,n.eW)((0,n.v_)((0,n.R1)(r.t)("取消")),1)]),_:1}),(0,n.bF)((0,n.R1)(v.Ay),{type:"primary",loading:e.saving,onClick:l[3]||(l[3]=e=>a("save"))},{default:(0,n.k6)(()=>[(0,n.eW)((0,n.v_)((0,n.R1)(r.t)("保存")),1)]),_:1},8,["loading"])]),_:1})]),default:(0,n.k6)(()=>[(0,n.bF)((0,n.R1)(b.A),{model:e.form,"label-placement":"top"},{default:(0,n.k6)(()=>[(0,n.bF)((0,n.R1)(f.Ay),{label:(0,n.R1)(r.t)("手机号")},{default:(0,n.k6)(()=>[(0,n.bF)((0,n.R1)(y.A),{value:e.form.phone,"onUpdate:value":l[0]||(l[0]=t=>e.form.phone=t)},null,8,["value"])]),_:1},8,["label"]),(0,n.bF)((0,n.R1)(f.Ay),{label:(0,n.R1)(r.t)("状态")},{default:(0,n.k6)(()=>[(0,n.bF)((0,n.R1)(g.A),{value:e.form.status,"onUpdate:value":l[1]||(l[1]=t=>e.form.status=t),options:[{label:(0,n.R1)(r.t)("已开发"),value:"developed"},{label:(0,n.R1)(r.t)("未开发"),value:"undeveloped"}]},null,8,["value","options"])]),_:1},8,["label"]),((0,n.uX)(!0),(0,n.CE)(n.FK,null,(0,n.pI)(e.fields.filter(e=>e.enabled&&e.editable),t=>((0,n.uX)(),(0,n.Wv)((0,n.R1)(f.Ay),{key:t.id,label:t.label},{default:(0,n.k6)(()=>["select"===t.type&&"gender"===t.key?((0,n.uX)(),(0,n.Wv)((0,n.R1)(m.A),{key:0,value:e.form.data[t.key],"onUpdate:value":a=>e.form.data[t.key]=a},{default:(0,n.k6)(()=>[(0,n.bF)((0,n.R1)(w.A),null,{default:(0,n.k6)(()=>[((0,n.uX)(!0),(0,n.CE)(n.FK,null,(0,n.pI)((0,n.R1)(W)(t.options),e=>((0,n.uX)(),(0,n.Wv)((0,n.R1)(k.A),{key:e.value,value:e.value},{default:(0,n.k6)(()=>[(0,n.eW)((0,n.v_)(e.label),1)]),_:2},1032,["value"]))),128))]),_:2},1024)]),_:2},1032,["value","onUpdate:value"])):"select"===t.type?((0,n.uX)(),(0,n.Wv)((0,n.R1)(g.A),{key:1,value:e.form.data[t.key],"onUpdate:value":a=>e.form.data[t.key]=a,options:(0,n.R1)(W)(t.options),clearable:""},null,8,["value","onUpdate:value","options"])):"number"===t.type?((0,n.uX)(),(0,n.Wv)((0,n.R1)(x.A),{key:2,value:e.form.data[t.key],"onUpdate:value":a=>e.form.data[t.key]=a,class:"w-full",clearable:""},null,8,["value","onUpdate:value"])):"boolean"===t.type?((0,n.uX)(),(0,n.Wv)((0,n.R1)(_.A),{key:3,value:e.form.data[t.key],"onUpdate:value":a=>e.form.data[t.key]=a},null,8,["value","onUpdate:value"])):"date"===t.type?((0,n.uX)(),(0,n.Wv)((0,n.R1)(A.A),{key:4,"formatted-value":e.form.data[t.key],"onUpdate:formattedValue":a=>e.form.data[t.key]=a,"value-format":"yyyy-MM-dd",type:"date",clearable:"",class:"w-full"},null,8,["formatted-value","onUpdate:formattedValue"])):["remark","remarks","note","notes"].includes(t.key)?((0,n.uX)(),(0,n.Wv)((0,n.R1)(y.A),{key:5,value:e.form.data[t.key],"onUpdate:value":a=>e.form.data[t.key]=a,type:"textarea",autosize:{minRows:2,maxRows:6},clearable:""},null,8,["value","onUpdate:value"])):((0,n.uX)(),(0,n.Wv)((0,n.R1)(y.A),{key:6,value:e.form.data[t.key],"onUpdate:value":a=>e.form.data[t.key]=a,clearable:""},null,8,["value","onUpdate:value"]))]),_:2},1032,["label"]))),128))]),_:1},8,["model"])]),_:1},8,["title"])]),_:1},8,["show"]))}}),F=(0,n.pM)({__name:"index",setup(e){let t=(0,d.J)(),a=(0,n.Kh)({loading:!1,saving:!1,keyword:"",keywordTail:!1,list:[],fields:[],page:1,size:20,total:0,editOpen:!1,editId:null,form:{phone:"",status:"undeveloped",data:{}}}),c=()=>{a.page=1,g()},h=e=>{a.page=Number(e),g()},b=e=>{a.size=Number(e),a.page=1,g()},f=async()=>{if(a.editId){a.saving=!0;try{let e=await (0,s.CI)(a.editId,a.form);1===e.code||200===e.code?(t.success((0,r.t)("成功")),a.editOpen=!1,g()):t.error((null==e?void 0:e.msg)||(0,r.t)("失败"))}catch(e){t.error(null==e?void 0:e.message)}finally{a.saving=!1}}},y=async e=>{try{let a=await (0,s.MO)(e);1===a.code||200===a.code?(t.success((0,r.t)("成功")),g()):t.error((null==a?void 0:a.msg)||(0,r.t)("失败"))}catch(e){t.error(null==e?void 0:e.message)}},g=async()=>{a.loading=!0;try{let e={page:a.page,size:a.size,...a.keyword?{q:a.keyword,tail_only:a.keywordTail}:{}},l=await (0,s.oe)(e);1===l.code||200===l.code?(a.list=l.data.list,a.total=l.data.total_count||l.data.total||0):t.error((null==l?void 0:l.msg)||(0,r.t)("异常"))}finally{a.loading=!1}},m=function(e){let{t,fields:a,onEdit:l,onDelete:i}=e;return(0,n.EW)(()=>[{title:"ID",key:"id",width:70,align:"center",ellipsis:{tooltip:!0}},{title:()=>t("状态"),key:"status",align:"center",ellipsis:{tooltip:!0},render:e=>(0,n.h)(R.Ay,{type:"developed"===e.status?"success":"warning",size:"small",bordered:!1},{default:()=>t("developed"===e.status?"已开发":"未开发")})},...a.value.filter(e=>e.enabled).map(e=>({title:e.label||"",key:e.key,ellipsis:{tooltip:!0},align:"center",render:t=>{let a=((e,t)=>{if(t in e&&"data"!==t)return e[t];try{return("string"==typeof e.data?JSON.parse(e.data):e.data||{})[t]??""}catch{return""}})(t,e.key);if(!a)return(0,n.h)(S.A,{depth:3},{default:()=>"-"});if("select"===e.type){let t=W(e.options).find(e=>String(e.value)===String(a));return t?t.label:a}return a}})),{title:()=>t("更新时间"),key:"latest_imported_at",align:"center",render:e=>e.latest_imported_at?(0,n.h)(z.A,{time:new Date(e.latest_imported_at),format:"yyyy-MM-dd HH:mm"}):(0,n.h)(S.A,{depth:3},{default:()=>"-"})},{title:()=>t("操作"),key:"actions",width:140,ellipsis:!1,align:"center",fixed:"right",render:e=>(0,n.h)(p.A,{justify:"center",size:"small",wrap:!1},{default:()=>[(0,n.h)(v.Ay,{size:"small",type:"info",quaternary:!0,onClick:()=>l(e)},{default:()=>t("编辑")}),(0,n.h)(E.A,{onNegativeClick:()=>i(e.id),positiveText:t("取消"),negativeText:t("确认"),negativeButtonProps:{type:"error"}},{trigger:()=>(0,n.h)(v.Ay,{size:"small",type:"error",quaternary:!0},{default:()=>t("删除")}),default:()=>t("确定删除？")})]})}])}({t:r.t,fields:(0,n.EW)(()=>a.fields),onEdit:e=>{a.editId=e.id,a.form={phone:e.phone||"",status:e.status||"undeveloped",data:(e=>{if(!e)return{};if("string"!=typeof e)return{...e};try{return JSON.parse(e||"{}")}catch{return{}}})(e.data)},a.editOpen=!0},onDelete:y}),w=(0,n.EW)(()=>({page:a.page,pageSize:a.size,itemCount:a.total,showSizePicker:!0,pageSizes:[20,50,100,500]}));return(0,n.sV)(async()=>{try{let e=await u.d.list();1===e.code&&(a.fields=e.data||[])}catch{}g()}),(e,t)=>{let r=o.A,d=i.A,s=l.Ay;return(0,n.uX)(),(0,n.Wv)(s,{bordered:!1,class:"!shadow !rounded-xl",hoverable:""},{default:(0,n.k6)(()=>[(0,n.bF)(r,{keyword:a.keyword,"onUpdate:keyword":t[0]||(t[0]=e=>a.keyword=e),tailOnly:a.keywordTail,"onUpdate:tailOnly":t[1]||(t[1]=e=>a.keywordTail=e),onSearch:c,class:"!mb-4"},null,8,["keyword","tailOnly"]),(0,n.bF)(d,{columns:(0,n.R1)(m),data:a.list,loading:a.loading,pagination:w.value,"onUpdate:page":h,"onUpdate:pageSize":b},null,8,["columns","data","loading","pagination"]),(0,n.bF)(C,{show:a.editOpen,"onUpdate:show":t[2]||(t[2]=e=>a.editOpen=e),saving:a.saving,form:a.form,fields:a.fields,onSave:f},null,8,["show","saving","form","fields"])]),_:1})}}})},4384(e,t,a){a.d(t,{CI:()=>d,Df:()=>n,MO:()=>r,oe:()=>i,wz:()=>o});var l=a(8746);function i(e){let{tail_only:t,...a}=e;return l.A.get("/api/contact",{params:{...a,tail_only:!0===t?"1":t||void 0}})}function o(e,t){return l.A.get("/api/contact/search",{params:{q:e,tail_only:!0===t?"1":t}})}function n(e,t){return l.A.post("/api/contact/claim",{phone:e,data:t})}function r(e){return l.A.delete(`/api/contact/${e}`)}function d(e,t){return l.A.put(`/api/contact/${e}`,t)}},2760(e,t,a){let l;a.d(t,{A:()=>_});var i=a(4041),o=a(5562),n=a(290),r=a(9819),d=a(3445),s=a(9359),u=a(922),c=a(3370),h=a(4019),p=a(6680),v=a(5454),b=a(9521),f=a(8850),y=a(8880);let g={buttonHeightSmall:"14px",buttonHeightMedium:"18px",buttonHeightLarge:"22px",buttonWidthSmall:"14px",buttonWidthMedium:"18px",buttonWidthLarge:"22px",buttonWidthPressedSmall:"20px",buttonWidthPressedMedium:"24px",buttonWidthPressedLarge:"28px",railHeightSmall:"18px",railHeightMedium:"22px",railHeightLarge:"26px",railWidthSmall:"32px",railWidthMedium:"40px",railWidthLarge:"48px"},m={name:"Switch",common:y.A,self:function(e){let{primaryColor:t,opacityDisabled:a,borderRadius:l,textColor3:i}=e;return Object.assign(Object.assign({},g),{iconColor:i,textColor:"white",loadingColor:t,opacityDisabled:a,railColor:"rgba(0, 0, 0, .14)",railColorActive:t,buttonBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",buttonColor:"#FFF",railBorderRadiusSmall:l,railBorderRadiusMedium:l,railBorderRadiusLarge:l,buttonBorderRadiusSmall:l,buttonBorderRadiusMedium:l,buttonBorderRadiusLarge:l,boxShadowFocus:`0 0 0 2px ${(0,f.QX)(t,{alpha:.2})}`})}};var w=a(8454);let k=(0,v.cB)("switch",`
 height: var(--n-height);
 min-width: var(--n-width);
 vertical-align: middle;
 user-select: none;
 -webkit-user-select: none;
 display: inline-flex;
 outline: none;
 justify-content: center;
 align-items: center;
`,[(0,v.cE)("children-placeholder",`
 height: var(--n-rail-height);
 display: flex;
 flex-direction: column;
 overflow: hidden;
 pointer-events: none;
 visibility: hidden;
 `),(0,v.cE)("rail-placeholder",`
 display: flex;
 flex-wrap: none;
 `),(0,v.cE)("button-placeholder",`
 width: calc(1.75 * var(--n-rail-height));
 height: var(--n-rail-height);
 `),(0,v.cB)("base-loading",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 font-size: calc(var(--n-button-width) - 4px);
 color: var(--n-loading-color);
 transition: color .3s var(--n-bezier);
 `,[(0,w.N)({left:"50%",top:"50%",originalTransform:"translateX(-50%) translateY(-50%)"})]),(0,v.cE)("checked, unchecked",`
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
 `),(0,v.cE)("checked",`
 right: 0;
 padding-right: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),(0,v.cE)("unchecked",`
 left: 0;
 justify-content: flex-end;
 padding-left: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),(0,v.c)("&:focus",[(0,v.cE)("rail",`
 box-shadow: var(--n-box-shadow-focus);
 `)]),(0,v.cM)("round",[(0,v.cE)("rail","border-radius: calc(var(--n-rail-height) / 2);",[(0,v.cE)("button","border-radius: calc(var(--n-button-height) / 2);")])]),(0,v.C5)("disabled",[(0,v.C5)("icon",[(0,v.cM)("rubber-band",[(0,v.cM)("pressed",[(0,v.cE)("rail",[(0,v.cE)("button","max-width: var(--n-button-width-pressed);")])]),(0,v.cE)("rail",[(0,v.c)("&:active",[(0,v.cE)("button","max-width: var(--n-button-width-pressed);")])]),(0,v.cM)("active",[(0,v.cM)("pressed",[(0,v.cE)("rail",[(0,v.cE)("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])]),(0,v.cE)("rail",[(0,v.c)("&:active",[(0,v.cE)("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])])])])])]),(0,v.cM)("active",[(0,v.cE)("rail",[(0,v.cE)("button","left: calc(100% - var(--n-button-width) - var(--n-offset))")])]),(0,v.cE)("rail",`
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
 `,[(0,v.cE)("button-icon",`
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
 `,[(0,w.N)()]),(0,v.cE)("button",`
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
 `)]),(0,v.cM)("active",[(0,v.cE)("rail","background-color: var(--n-rail-color-active);")]),(0,v.cM)("loading",[(0,v.cE)("rail",`
 cursor: wait;
 `)]),(0,v.cM)("disabled",[(0,v.cE)("rail",`
 cursor: not-allowed;
 opacity: .5;
 `)])]),x=Object.assign(Object.assign({},s.A.props),{size:String,value:{type:[String,Number,Boolean],default:void 0},loading:Boolean,defaultValue:{type:[String,Number,Boolean],default:!1},disabled:{type:Boolean,default:void 0},round:{type:Boolean,default:!0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],checkedValue:{type:[String,Number,Boolean],default:!0},uncheckedValue:{type:[String,Number,Boolean],default:!1},railStyle:Function,rubberBand:{type:Boolean,default:!0},spinProps:Object,onChange:[Function,Array]}),_=(0,n.pM)({name:"Switch",props:x,slots:Object,setup(e){void 0===l&&(l=!("u">typeof CSS)||void 0!==CSS.supports&&CSS.supports("width","max(1px)"));let{mergedClsPrefixRef:t,inlineThemeDisabled:a,mergedComponentPropsRef:r}=(0,u.Ay)(e),d=(0,s.A)("Switch","-switch",k,m,e,t),b=(0,c.A)(e,{mergedSize(t){var a,l;if(void 0!==e.size)return e.size;if(t)return t.mergedSize.value;let i=null==(l=null==(a=null==r?void 0:r.value)?void 0:a.Switch)?void 0:l.size;return i||"medium"}}),{mergedSizeRef:f,mergedDisabledRef:y}=b,g=(0,n.KR)(e.defaultValue),w=(0,n.lW)(e,"value"),x=(0,o.A)(w,g),_=(0,n.EW)(()=>x.value===e.checkedValue),A=(0,n.KR)(!1),R=(0,n.KR)(!1),S=(0,n.EW)(()=>{let{railStyle:t}=e;if(t)return t({focused:R.value,checked:_.value})});function z(t){let{"onUpdate:value":a,onChange:l,onUpdateValue:i}=e,{nTriggerFormInput:o,nTriggerFormChange:n}=b;a&&(0,p.T)(a,t),i&&(0,p.T)(i,t),l&&(0,p.T)(l,t),g.value=t,o(),n()}let E=(0,n.EW)(()=>{let e,t,a,{value:o}=f,{self:{opacityDisabled:n,railColor:r,railColorActive:s,buttonBoxShadow:u,buttonColor:c,boxShadowFocus:h,loadingColor:p,textColor:b,iconColor:y,[(0,v.cF)("buttonHeight",o)]:g,[(0,v.cF)("buttonWidth",o)]:m,[(0,v.cF)("buttonWidthPressed",o)]:w,[(0,v.cF)("railHeight",o)]:k,[(0,v.cF)("railWidth",o)]:x,[(0,v.cF)("railBorderRadius",o)]:_,[(0,v.cF)("buttonBorderRadius",o)]:A},common:{cubicBezierEaseInOut:R}}=d.value;return l?(e=`calc((${k} - ${g}) / 2)`,t=`max(${k}, ${g})`,a=`max(${x}, calc(${x} + ${g} - ${k}))`):(e=(0,i.Cw)(((0,i.eV)(k)-(0,i.eV)(g))/2),t=(0,i.Cw)(Math.max((0,i.eV)(k),(0,i.eV)(g))),a=(0,i.eV)(k)>(0,i.eV)(g)?x:(0,i.Cw)((0,i.eV)(x)+(0,i.eV)(g)-(0,i.eV)(k))),{"--n-bezier":R,"--n-button-border-radius":A,"--n-button-box-shadow":u,"--n-button-color":c,"--n-button-width":m,"--n-button-width-pressed":w,"--n-button-height":g,"--n-height":t,"--n-offset":e,"--n-opacity-disabled":n,"--n-rail-border-radius":_,"--n-rail-color":r,"--n-rail-color-active":s,"--n-rail-height":k,"--n-rail-width":x,"--n-width":a,"--n-box-shadow-focus":h,"--n-loading-color":p,"--n-text-color":b,"--n-icon-color":y}}),W=a?(0,h.R)("switch",(0,n.EW)(()=>f.value[0]),E,e):void 0;return{handleClick:function(){e.loading||y.value||(x.value!==e.checkedValue?z(e.checkedValue):z(e.uncheckedValue))},handleBlur:function(){R.value=!1,function(){let{nTriggerFormBlur:e}=b;e()}(),A.value=!1},handleFocus:function(){R.value=!0,function(){let{nTriggerFormFocus:e}=b;e()}()},handleKeyup:function(t){e.loading||y.value||" "===t.key&&(x.value!==e.checkedValue?z(e.checkedValue):z(e.uncheckedValue),A.value=!1)},handleKeydown:function(t){e.loading||y.value||" "===t.key&&(t.preventDefault(),A.value=!0)},mergedRailStyle:S,pressed:A,mergedClsPrefix:t,mergedValue:x,checked:_,mergedDisabled:y,cssVars:a?void 0:E,themeClass:null==W?void 0:W.themeClass,onRender:null==W?void 0:W.onRender}},render(){let{mergedClsPrefix:e,mergedDisabled:t,checked:a,mergedRailStyle:l,onRender:i,$slots:o}=this;null==i||i();let{checked:s,unchecked:u,icon:c,"checked-icon":h,"unchecked-icon":p}=o,v=!((0,b.yr)(c)&&(0,b.yr)(h)&&(0,b.yr)(p));return(0,n.h)("div",{role:"switch","aria-checked":a,class:[`${e}-switch`,this.themeClass,v&&`${e}-switch--icon`,a&&`${e}-switch--active`,t&&`${e}-switch--disabled`,this.round&&`${e}-switch--round`,this.loading&&`${e}-switch--loading`,this.pressed&&`${e}-switch--pressed`,this.rubberBand&&`${e}-switch--rubber-band`],tabindex:this.mergedDisabled?void 0:0,style:this.cssVars,onClick:this.handleClick,onFocus:this.handleFocus,onBlur:this.handleBlur,onKeyup:this.handleKeyup,onKeydown:this.handleKeydown},(0,n.h)("div",{class:`${e}-switch__rail`,"aria-hidden":"true",style:l},(0,b.iQ)(s,t=>(0,b.iQ)(u,a=>t||a?(0,n.h)("div",{"aria-hidden":!0,class:`${e}-switch__children-placeholder`},(0,n.h)("div",{class:`${e}-switch__rail-placeholder`},(0,n.h)("div",{class:`${e}-switch__button-placeholder`}),t),(0,n.h)("div",{class:`${e}-switch__rail-placeholder`},(0,n.h)("div",{class:`${e}-switch__button-placeholder`}),a)):null)),(0,n.h)("div",{class:`${e}-switch__button`},(0,b.iQ)(c,t=>(0,b.iQ)(h,a=>(0,b.iQ)(p,l=>(0,n.h)(r.A,null,{default:()=>this.loading?(0,n.h)(d.A,Object.assign({key:"loading",clsPrefix:e,strokeWidth:20},this.spinProps)):this.checked&&(a||t)?(0,n.h)("div",{class:`${e}-switch__button-icon`,key:a?"checked-icon":"icon"},a||t):!this.checked&&(l||t)?(0,n.h)("div",{class:`${e}-switch__button-icon`,key:l?"unchecked-icon":"icon"},l||t):null})))),(0,b.iQ)(s,t=>t&&(0,n.h)("div",{key:"checked",class:`${e}-switch__checked`},t)),(0,b.iQ)(u,t=>t&&(0,n.h)("div",{key:"unchecked",class:`${e}-switch__unchecked`},t)))))}})}}]);