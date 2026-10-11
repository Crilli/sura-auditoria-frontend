import {aW as Y$1,T,B as dv,G as tc,bx as qn,af as pm,a1 as jn,ag as hv,a7 as we$1,n as J,l as lv,K as Cd,O as ry,b0 as Rd,Q as oy,p as pa,h as ha,L as Lv,W as Wd,S as Sg,P as Pv,y,by as He$1,ae as I$1,a3 as hf,ah as ee,M as gS,R as bd,aC as Ey,u as s,r,C as Ct$1,al as Wp,bv as Ae$1,Y as Yn$1,as as h,bz as mC,i as Ee$1,bA as Hc,E,bB as Na,a2 as Ye$1,o as g,bC as ho$1,b2 as V,bD as H$1,a5 as fS,c as Fi$1,bE as lp,bF as Ni$1,bG as Pi$1,ao as H$2,aU as cS,bH as fo$1,ap as Fe,bI as $n,bJ as Er$1,bK as Et$1,bL as nn$1,bM as Br$1,bN as he$1,bO as Ot$1,ad as Cn,z as z$1,bg as up,bd as kn,bh as K$1,be as Gn,bk as yS,bP as dp,bQ as Tr$1,b8 as Tr$2,bR as X,at as Ln,aq as $o$1,s as Un,bS as ca,bT as R,H as Ee$2,bU as qr$1,a6 as zr$1,bc as Rr$1,ak as D,aa as og,a$ as ar$1,ac as By,d as Fd,aD as _p,bV as yv,a4 as mS}from'./main-VSBDFCJK.js';var ti=(()=>{class i{_renderer;_elementRef;onChange=t=>{};onTouched=()=>{};constructor(t,n){this._renderer=t,this._elementRef=n;}setProperty(t,n){this._renderer.setProperty(this._elementRef.nativeElement,t,n);}registerOnTouched(t){this.onTouched=t;}registerOnChange(t){this.onChange=t;}setDisabledState(t){this.setProperty("disabled",t);}static \u0275fac=function(n){return new(n||i)(qn(pm),qn(jn))};static \u0275dir=hv({type:i})}return i})(),ei=(()=>{class i extends ti{static \u0275fac=(()=>{let t;return function(r){return (t||(t=Wp(i)))(r||i)}})();static \u0275dir=hv({type:i,features:[Cd]})}return i})(),he=new T("");var br={provide:he,useExisting:ar$1(()=>ni),multi:true};function gr(){let i=H$1()?H$1().getUserAgent():"";return /android (\d+)/.test(i.toLowerCase())}var vr=new T(""),ni=(()=>{class i extends ti{_compositionMode;_composing=false;constructor(t,n,r){super(t,n),this._compositionMode=r,this._compositionMode==null&&(this._compositionMode=!gr());}writeValue(t){let n=t??"";this.setProperty("value",n);}_handleInput(t){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(t);}_compositionStart(){this._composing=true;}_compositionEnd(t){this._composing=false,this._compositionMode&&this.onChange(t);}static \u0275fac=function(n){return new(n||i)(qn(pm),qn(jn),qn(vr,8))};static \u0275dir=hv({type:i,selectors:[["input","formControlName","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControlName","",3,"ngNoCva",""],["input","formControl","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControl","",3,"ngNoCva",""],["input","ngModel","",3,"type","checkbox",3,"ngNoCva",""],["textarea","ngModel","",3,"ngNoCva",""],["","ngDefaultControl",""]],hostBindings:function(n,r){n&1&&Fd("input",function(a){return r._handleInput(a.target.value)})("blur",function(){return r.onTouched()})("compositionstart",function(){return r._compositionStart()})("compositionend",function(a){return r._compositionEnd(a.target.value)});},standalone:false,features:[By([br]),Cd]})}return i})();function Ue(i){return i==null||He(i)===0}function He(i){return i==null?null:Array.isArray(i)||typeof i=="string"?i.length:i instanceof Set?i.size:null}var it=new T(""),fe=new T(""),_r=/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,Re=class{static min(e){return ii(e)}static max(e){return yr(e)}static required(e){return ri(e)}static requiredTrue(e){return Cr(e)}static email(e){return Er(e)}static minLength(e){return Ar(e)}static maxLength(e){return oi(e)}static pattern(e){return wr(e)}static nullValidator(e){return re()}static compose(e){return ui(e)}static composeAsync(e){return mi(e)}};function ii(i){return e=>{if(e.value==null||i==null)return null;let t=parseFloat(e.value);return !isNaN(t)&&t<i?{min:{min:i,actual:e.value}}:null}}function yr(i){return e=>{if(e.value==null||i==null)return null;let t=parseFloat(e.value);return !isNaN(t)&&t>i?{max:{max:i,actual:e.value}}:null}}function ri(i){return Ue(i.value)?{required:true}:null}function Cr(i){return i.value===true?null:{required:true}}function Er(i){return Ue(i.value)||_r.test(i.value)?null:{email:true}}function Ar(i){return e=>{let t=e.value?.length??He(e.value);return t===null||t===0?null:t<i?{minlength:{requiredLength:i,actualLength:t}}:null}}function oi(i){return e=>{let t=e.value?.length??He(e.value);return t!==null&&t>i?{maxlength:{requiredLength:i,actualLength:t}}:null}}function wr(i){if(!i)return re;let e,t;return typeof i=="string"?(t="",i.charAt(0)!=="^"&&(t+="^"),t+=i,i.charAt(i.length-1)!=="$"&&(t+="$"),e=new RegExp(t)):(t=i.toString(),e=i),n=>{if(Ue(n.value))return null;let r=n.value;return e.test(r)?null:{pattern:{requiredPattern:t,actualValue:r}}}}function re(i){return null}function ai(i){return i!=null}function si(i){return ca(i)?R(i):i}function ci(i){let e={};return i.forEach(t=>{e=t!=null?r(r({},e),t):e;}),Object.keys(e).length===0?null:e}function li(i,e){return e.map(t=>t(i))}function Dr(i){return !i.validate}function di(i){return i.map(e=>Dr(e)?e:t=>e.validate(t))}function ui(i){if(!i)return null;let e=i.filter(ai);return e.length==0?null:function(t){return ci(li(t,e))}}function ze(i){return i!=null?ui(di(i)):null}function mi(i){if(!i)return null;let e=i.filter(ai);return e.length==0?null:function(t){let n=li(t,e).map(si);return ho$1(n).pipe(V(ci))}}function Ge(i){return i!=null?mi(di(i)):null}function Kn(i,e){return i===null?[e]:Array.isArray(i)?[...i,e]:[i,e]}function hi(i){return i._rawValidators}function fi(i){return i._rawAsyncValidators}function Pe(i){return i?Array.isArray(i)?i:[i]:[]}function oe(i,e){return Array.isArray(i)?i.includes(e):i===e}function Zn(i,e){let t=Pe(e);return Pe(i).forEach(r=>{oe(t,r)||t.push(r);}),t}function Yn(i,e){return Pe(e).filter(t=>!oe(i,t))}var ae=class{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(e){this._rawValidators=e||[],this._composedValidatorFn=ze(this._rawValidators);}_setAsyncValidators(e){this._rawAsyncValidators=e||[],this._composedAsyncValidatorFn=Ge(this._rawAsyncValidators);}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(e){this._onDestroyCallbacks.push(e);}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(e=>e()),this._onDestroyCallbacks=[];}reset(e=void 0){this.control?.reset(e);}hasError(e,t){return this.control?this.control.hasError(e,t):false}getError(e,t){return this.control?this.control.getError(e,t):null}},q=class extends ae{name;get formDirective(){return null}get path(){return null}};var St="VALID",ne="INVALID",pt="PENDING",Nt="DISABLED",K=class{},se=class extends K{value;source;constructor(e,t){super(),this.value=e,this.source=t;}},Vt=class extends K{pristine;source;constructor(e,t){super(),this.pristine=e,this.source=t;}},Ot=class extends K{touched;source;constructor(e,t){super(),this.touched=e,this.source=t;}},bt=class extends K{status;source;constructor(e,t){super(),this.status=e,this.source=t;}},ce=class extends K{source;constructor(e){super(),this.source=e;}},nt=class extends K{source;constructor(e){super(),this.source=e;}};function We(i){return (pe(i)?i.validators:i)||null}function Ir(i){return Array.isArray(i)?ze(i):i||null}function $e(i,e){return (pe(e)?e.asyncValidators:i)||null}function xr(i){return Array.isArray(i)?Ge(i):i||null}function pe(i){return i!=null&&!Array.isArray(i)&&typeof i=="object"}function pi(i,e,t){let n=i.controls;if(!(e?Object.keys(n):n).length)throw new E(1e3,"");if(!gi(n,t))throw new E(1001,"")}function bi(i,e,t){i._forEachChild((n,r)=>{if(t[r]===void 0)throw new E(-1002,"")});}var gt=class{_pendingDirty=false;_hasOwnPendingAsyncValidator=null;_pendingTouched=false;_onCollectionChange=()=>{};_updateOn;_hasRequired=Ee$1(false);_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(e,t){this._assignValidators(e),this._assignAsyncValidators(t);}get validator(){return this._composedValidatorFn}set validator(e){this._rawValidators=this._composedValidatorFn=e,this._updateHasRequiredValidator();}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(e){this._rawAsyncValidators=this._composedAsyncValidatorFn=e;}get parent(){return this._parent}get status(){return Y$1(this.statusReactive)}set status(e){Y$1(()=>this.statusReactive.set(e));}_status=Ye$1(()=>this.statusReactive());statusReactive=Ee$1(void 0);get valid(){return this.status===St}get invalid(){return this.status===ne}get pending(){return this.status===pt}get disabled(){return this.status===Nt}get enabled(){return this.status!==Nt}errors;get pristine(){return Y$1(this.pristineReactive)}set pristine(e){Y$1(()=>this.pristineReactive.set(e));}_pristine=Ye$1(()=>this.pristineReactive());pristineReactive=Ee$1(true);get dirty(){return !this.pristine}get touched(){return Y$1(this.touchedReactive)}set touched(e){Y$1(()=>this.touchedReactive.set(e));}_touched=Ye$1(()=>this.touchedReactive());touchedReactive=Ee$1(false);get untouched(){return !this.touched}_events=new g;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:"change"}setValidators(e){this._assignValidators(e);}setAsyncValidators(e){this._assignAsyncValidators(e);}addValidators(e){this.setValidators(Zn(e,this._rawValidators));}addAsyncValidators(e){this.setAsyncValidators(Zn(e,this._rawAsyncValidators));}removeValidators(e){this.setValidators(Yn(e,this._rawValidators));}removeAsyncValidators(e){this.setAsyncValidators(Yn(e,this._rawAsyncValidators));}hasValidator(e){return oe(this._rawValidators,e)}hasAsyncValidator(e){return oe(this._rawAsyncValidators,e)}clearValidators(){this.validator=null;}clearAsyncValidators(){this.asyncValidator=null;}markAsTouched(e={}){let t=this.touched===false;this.touched=true;let n=e.sourceControl??this;e.onlySelf||this._parent?.markAsTouched(s(r({},e),{sourceControl:n})),t&&e.emitEvent!==false&&this._events.next(new Ot(true,n));}markAllAsDirty(e={}){this.markAsDirty({onlySelf:true,emitEvent:e.emitEvent,sourceControl:this}),this._forEachChild(t=>t.markAllAsDirty(e));}markAllAsTouched(e={}){this.markAsTouched({onlySelf:true,emitEvent:e.emitEvent,sourceControl:this}),this._forEachChild(t=>t.markAllAsTouched(e));}markAsUntouched(e={}){let t=this.touched===true;this.touched=false,this._pendingTouched=false;let n=e.sourceControl??this;this._forEachChild(r=>{r.markAsUntouched({onlySelf:true,emitEvent:e.emitEvent,sourceControl:n});}),e.onlySelf||this._parent?._updateTouched(e,n),t&&e.emitEvent!==false&&this._events.next(new Ot(false,n));}markAsDirty(e={}){let t=this.pristine===true;this.pristine=false;let n=e.sourceControl??this;e.onlySelf||this._parent?.markAsDirty(s(r({},e),{sourceControl:n})),t&&e.emitEvent!==false&&this._events.next(new Vt(false,n));}markAsPristine(e={}){let t=this.pristine===false;this.pristine=true,this._pendingDirty=false;let n=e.sourceControl??this;this._forEachChild(r=>{r.markAsPristine({onlySelf:true,emitEvent:e.emitEvent});}),e.onlySelf||this._parent?._updatePristine(e,n),t&&e.emitEvent!==false&&this._events.next(new Vt(true,n));}markAsPending(e={}){this.status=pt;let t=e.sourceControl??this;e.emitEvent!==false&&(this._events.next(new bt(this.status,t)),this.statusChanges.emit(this.status)),e.onlySelf||this._parent?.markAsPending(s(r({},e),{sourceControl:t}));}disable(e={}){let t=this._parentMarkedDirty(e.onlySelf);this.status=Nt,this.errors=null,this._forEachChild(r$1=>{r$1.disable(s(r({},e),{onlySelf:true}));}),this._updateValue();let n=e.sourceControl??this;e.emitEvent!==false&&(this._events.next(new se(this.value,n)),this._events.next(new bt(this.status,n)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(s(r({},e),{skipPristineCheck:t}),this),this._onDisabledChange.forEach(r=>r(true));}enable(e={}){let t=this._parentMarkedDirty(e.onlySelf);this.status=St,this._forEachChild(n=>{n.enable(s(r({},e),{onlySelf:true}));}),this.updateValueAndValidity({onlySelf:true,emitEvent:e.emitEvent}),this._updateAncestors(s(r({},e),{skipPristineCheck:t}),this),this._onDisabledChange.forEach(n=>n(false));}_updateAncestors(e,t){e.onlySelf||(this._parent?.updateValueAndValidity(e),e.skipPristineCheck||this._parent?._updatePristine({},t),this._parent?._updateTouched({},t));}setParent(e){this._parent=e;}getRawValue(){return this.value}updateValueAndValidity(e={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let n=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===St||this.status===pt)&&this._runAsyncValidator(n,e.emitEvent);}let t=e.sourceControl??this;e.emitEvent!==false&&(this._events.next(new se(this.value,t)),this._events.next(new bt(this.status,t)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),e.onlySelf||this._parent?.updateValueAndValidity(s(r({},e),{sourceControl:t}));}_updateTreeValidity(e={emitEvent:true}){this._forEachChild(t=>t._updateTreeValidity(e)),this.updateValueAndValidity({onlySelf:true,emitEvent:e.emitEvent});}_setInitialStatus(){this.status=this._allControlsDisabled()?Nt:St;}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(e,t){if(this.asyncValidator){this.status=pt,this._hasOwnPendingAsyncValidator={emitEvent:t!==false,shouldHaveEmitted:e!==false};let n=si(this.asyncValidator(this));this._asyncValidationSubscription=n.subscribe(r=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(r,{emitEvent:t,shouldHaveEmitted:e});});}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let e=(this._hasOwnPendingAsyncValidator?.emitEvent||this._hasOwnPendingAsyncValidator?.shouldHaveEmitted)??false;return this._hasOwnPendingAsyncValidator=null,e}return  false}setErrors(e,t={}){this.errors=e,this._updateControlsErrors(t.emitEvent!==false,this,t.shouldHaveEmitted);}get(e){let t=e;return t==null||(Array.isArray(t)||(t=t.split(".")),t.length===0)?null:t.reduce((n,r)=>n&&n._find(r),this)}getError(e,t){let n=t?this.get(t):this;return n?.errors?n.errors[e]:null}hasError(e,t){return !!this.getError(e,t)}get root(){let e=this;for(;e._parent;)e=e._parent;return e}_updateControlsErrors(e,t,n){this.status=this._calculateStatus(),e&&this.statusChanges.emit(this.status),(e||n)&&this._events.next(new bt(this.status,t)),this._parent&&this._parent._updateControlsErrors(e,t,n);}_initObservables(){this.valueChanges=new we$1,this.statusChanges=new we$1;}_calculateStatus(){return this._allControlsDisabled()?Nt:this.errors?ne:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(pt)?pt:this._anyControlsHaveStatus(ne)?ne:St}_anyControlsHaveStatus(e){return this._anyControls(t=>t.status===e)}_anyControlsDirty(){return this._anyControls(e=>e.dirty)}_anyControlsTouched(){return this._anyControls(e=>e.touched)}_updatePristine(e,t){let n=!this._anyControlsDirty(),r=this.pristine!==n;this.pristine=n,e.onlySelf||this._parent?._updatePristine(e,t),r&&this._events.next(new Vt(this.pristine,t));}_updateTouched(e={},t){this.touched=this._anyControlsTouched(),this._events.next(new Ot(this.touched,t)),e.onlySelf||this._parent?._updateTouched(e,t);}_onDisabledChange=[];_registerOnCollectionChange(e){this._onCollectionChange=e;}_setUpdateStrategy(e){pe(e)&&e.updateOn!=null&&(this._updateOn=e.updateOn);}_parentMarkedDirty(e){return !e&&!!this._parent?.dirty&&!this._parent._anyControlsDirty()}_find(e){return null}_assignValidators(e){this._rawValidators=Array.isArray(e)?e.slice():e,this._composedValidatorFn=Ir(this._rawValidators),this._updateHasRequiredValidator();}_assignAsyncValidators(e){this._rawAsyncValidators=Array.isArray(e)?e.slice():e,this._composedAsyncValidatorFn=xr(this._rawAsyncValidators);}_updateHasRequiredValidator(){Y$1(()=>this._hasRequired.set(this.hasValidator(Re.required)));}};function gi(i,e){return Object.hasOwn(i,e)}function Mr(i){return i.tagName==="INPUT"||i.tagName==="SELECT"||i.tagName==="TEXTAREA"}function Fr(i,e,t,n){switch(t){case "name":i.setAttribute(e,t,n);break;case "disabled":case "readonly":case "required":n?i.setAttribute(e,t,""):i.removeAttribute(e,t);break;case "max":case "min":case "minLength":case "maxLength":n!==void 0?i.setAttribute(e,t,n.toString()):i.removeAttribute(e,t);break}}var Le=class{kind;context;control;message;constructor({kind:e,context:t,control:n}){this.kind=e,this.context=t,this.control=n;}};function Sr(i){return typeof i=="number"?i:parseInt(i,10)}function Nr(i){return typeof i=="number"?i:parseFloat(i)}var qe=(()=>{class i{_validator=re;_onChange;_enabled;ngOnChanges(t){if(this.inputName in t){let n=this.normalizeInput(t[this.inputName].currentValue);this._enabled=this.enabled(n),this._validator=this._enabled?this.createValidator(n):re,this._onChange?.();}}validate(t){return this._validator(t)}registerOnValidatorChange(t){this._onChange=t;}enabled(t){return t!=null}static \u0275fac=function(n){return new(n||i)};static \u0275dir=hv({type:i,features:[_p]})}return i})();var Tr={provide:it,useExisting:ar$1(()=>Vr),multi:true},Vr=(()=>{class i extends qe{min;inputName="min";normalizeInput=t=>Nr(t);createValidator=t=>ii(t);static \u0275fac=(()=>{let t;return function(r){return (t||(t=Wp(i)))(r||i)}})();static \u0275dir=hv({type:i,selectors:[["input","type","number","min","","formControlName",""],["input","type","number","min","","formControl",""],["input","type","number","min","","ngModel",""]],hostVars:1,hostBindings:function(n,r){n&2&&bd("min",r._enabled?r.min:null);},inputs:{min:"min"},standalone:false,features:[By([Tr]),Cd]})}return i})(),Or={provide:it,useExisting:ar$1(()=>vi),multi:true};var vi=(()=>{class i extends qe{required;inputName="required";normalizeInput=gS;createValidator=t=>ri;enabled(t){return t}static \u0275fac=(()=>{let t;return function(r){return (t||(t=Wp(i)))(r||i)}})();static \u0275dir=hv({type:i,selectors:[["","required","","formControlName","",3,"type","checkbox"],["","required","","formControl","",3,"type","checkbox"],["","required","","ngModel","",3,"type","checkbox"]],hostVars:1,hostBindings:function(n,r){n&2&&bd("required",r._enabled?"":null);},inputs:{required:"required"},standalone:false,features:[By([Or]),Cd]})}return i})();var kr={provide:it,useExisting:ar$1(()=>Rr),multi:true},Rr=(()=>{class i extends qe{maxlength;inputName="maxlength";normalizeInput=t=>Sr(t);createValidator=t=>oi(t);static \u0275fac=(()=>{let t;return function(r){return (t||(t=Wp(i)))(r||i)}})();static \u0275dir=hv({type:i,selectors:[["","maxlength","","formControlName",""],["","maxlength","","formControl",""],["","maxlength","","ngModel",""]],hostVars:1,hostBindings:function(n,r){n&2&&bd("maxlength",r._enabled?r.maxlength:null);},inputs:{maxlength:"maxlength"},standalone:false,features:[By([kr]),Cd]})}return i})();var Pr=new T(""),be=new T("",{factory:()=>Ke}),Ke="always";function Lr(i,e){return [...e.path,i]}function _i(i,e,t=Ke){Ze(i,e),e.valueAccessor.writeValue(i.value),(i.disabled||t==="always")&&e.valueAccessor.setDisabledState?.(i.disabled),jr(i,e),Hr(i,e),Ur(i,e),Br(i,e);}function le(i,e,t=true){let n=()=>{};e?.valueAccessor?.registerOnChange(n),e?.valueAccessor?.registerOnTouched(n),ue(i,e),i&&(e._invokeOnDestroyCallbacks(),i._registerOnCollectionChange(()=>{}));}function de(i,e){i.forEach(t=>{t.registerOnValidatorChange&&t.registerOnValidatorChange(e);});}function Br(i,e){if(e.valueAccessor.setDisabledState){let t=n=>{e.valueAccessor.setDisabledState(n);};i.registerOnDisabledChange(t),e._registerOnDestroy(()=>{i._unregisterOnDisabledChange(t);});}}function Ze(i,e){let t=hi(i);e.validator!==null?i.setValidators(Kn(t,e.validator)):typeof t=="function"&&i.setValidators([t]);let n=fi(i);e.asyncValidator!==null?i.setAsyncValidators(Kn(n,e.asyncValidator)):typeof n=="function"&&i.setAsyncValidators([n]);let r=()=>i.updateValueAndValidity();de(e._rawValidators,r),de(e._rawAsyncValidators,r);}function ue(i,e){let t=false;if(i!==null){if(e.validator!==null){let r=hi(i);if(Array.isArray(r)&&r.length>0){let o=r.filter(a=>a!==e.validator);o.length!==r.length&&(t=true,i.setValidators(o));}}if(e.asyncValidator!==null){let r=fi(i);if(Array.isArray(r)&&r.length>0){let o=r.filter(a=>a!==e.asyncValidator);o.length!==r.length&&(t=true,i.setAsyncValidators(o));}}}let n=()=>{};return de(e._rawValidators,n),de(e._rawAsyncValidators,n),t}function jr(i,e){e.valueAccessor.registerOnChange(t=>{i._pendingValue=t,i._pendingChange=true,i._pendingDirty=true,i.updateOn==="change"&&yi(i,e);});}function Ur(i,e){e.valueAccessor.registerOnTouched(()=>{i._pendingTouched=true,i.updateOn==="blur"&&i._pendingChange&&yi(i,e),i.updateOn!=="submit"&&i.markAsTouched();});}function yi(i,e){i._pendingDirty&&i.markAsDirty(),i.setValue(i._pendingValue,{emitModelToViewChange:false}),e.viewToModelUpdate(i._pendingValue),i._pendingChange=false;}function Hr(i,e){let t=(n,r)=>{e.valueAccessor.writeValue(n),r&&e.viewToModelUpdate(n);};i.registerOnChange(t),e._registerOnDestroy(()=>{i._unregisterOnChange(t);});}function Ci(i,e){Ze(i,e);}function zr(i,e){return ue(i,e)}function Ei(i,e){if(!i.hasOwnProperty("model"))return  false;let t=i.model;return t.isFirstChange()?true:!Object.is(e,t.currentValue)}function Gr(i){return Object.getPrototypeOf(i.constructor)===ei}function Ai(i,e){i._syncPendingControls(),e.forEach(t=>{let n=t.control;n.updateOn==="submit"&&n._pendingChange&&(t.viewToModelUpdate(n._pendingValue),n._pendingChange=false);});}function Wr(i,e){if(!e)return null;let t,n,r;return e.forEach(o=>{o.constructor===ni?t=o:Gr(o)?n=o:r=o;}),r||n||t||null}function $r(i,e){let t=i.indexOf(e);t>-1&&i.splice(t,1);}var wi={provide:Pr,useFactory:()=>{let i=y(Z,{self:true});return {setParseErrors:e=>{i.setParseErrorSource(e);},set onReset(e){i.onReset=e;}}}},Z=class extends ae{_parent=null;name=null;valueAccessor=null;isCustomControlBased=false;userOnReset;resetSubscription;set onReset(e){this.userOnReset=e,this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.control&&(this.resetSubscription=this.control.events.subscribe(t=>{t instanceof nt&&this.control&&this.userOnReset?.(this.control.value);}),this.subscription?.add(this.resetSubscription));}isNativeFormElement=false;rawValueAccessors;_selectedValueAccessor=null;get selectedValueAccessor(){return this._selectedValueAccessor??=Wr(this,this.rawValueAccessors)}parseErrorsValidator=null;renderer;injector;requiredValidatorViaDi;subscription;customControlBindings=null;constructor(e,t,n){super(),this.injector=e,this.renderer=t,this.rawValueAccessors=n,this.injector?.get(Ae$1)?.onDestroy(()=>{this.removeParseErrorsValidator(this.control),this.subscription?.unsubscribe();});}setupCustomControl(){this.subscription?.unsubscribe();let e=this.injector?.get(fS);if(!this.control||!e)return;let t=e.markForCheck.bind(e);this.subscription=new I$1,this.subscription.add(this.control.valueChanges.subscribe(t)),this.subscription.add(this.control.statusChanges.subscribe(t)),this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.userOnReset&&(this.resetSubscription=this.control.events.subscribe(n=>{n instanceof nt&&this.control&&this.userOnReset?.(this.control.value);}),this.subscription.add(this.resetSubscription)),this.parseErrorsValidator&&this.control.addValidators(this.parseErrorsValidator);}ngControlCreate(e){!e.nativeElement.hasAttribute?.("ngNoCva")&&(this.rawValueAccessors&&this.rawValueAccessors.length>0||this.valueAccessor!==null)||!e.customControl||(this.isCustomControlBased=true,e.listenToCustomControlModel(r=>{this.control?.setValue(r,{emitModelToViewChange:false}),this.control?.markAsDirty(),this.viewToModelUpdate(r);}),e.listenToCustomControlOutput("touch",()=>{this.control?.markAsTouched();}),this.customControlBindings={},this.isNativeFormElement=Mr(e.nativeElement),this.requiredValidatorViaDi=this._rawValidators.find(r=>r instanceof vi));}ngControlUpdate(e,t){if(!this.isCustomControlBased)return;let n=this.control,r=this.customControlBindings;Object.is(r.value,n.value)||(r.value=n.value,e.setCustomControlModelInput(n.value)),this.bindControlProperty(e,r,"touched",n.touched),this.bindControlProperty(e,r,"dirty",n.dirty),this.bindControlProperty(e,r,"valid",n.valid),this.bindControlProperty(e,r,"invalid",n.invalid),this.bindControlProperty(e,r,"pending",n.pending),this.bindControlProperty(e,r,"disabled",n.disabled),this.shouldBindRequired&&this.bindControlProperty(e,r,"required",this.isRequired);let o=n.errors;if(r.errors!==o){r.errors=o;let a=this._convertErrors(o);e.setInputOnDirectives("errors",a);}}get isRequired(){return (this.requiredValidatorViaDi?._enabled||this.control?._hasRequired())??false}get shouldBindRequired(){return  true}bindControlProperty(e,t,n,r){if(t[n]===r)return;t[n]=r;let o=e.setInputOnDirectives(n,r);this.isNativeFormElement&&!o&&(n==="disabled"||n==="required")&&this.renderer&&Fr(this.renderer,e.nativeElement,n,r);}_convertErrors(e){if(e===null)return [];let t=this.control;return Object.entries(e).map(([n,r])=>new Le({context:r,kind:n,control:t}))}setParseErrorSource(e){if(e===void 0)return;let t=null,n=Ye$1(()=>{let r=e();return r.length===0?null:r.reduce((o,a)=>(o[a.kind]=a,o),{})});this.parseErrorsValidator=(()=>t).bind(this),Fi$1(()=>{t=n(),this.control?.updateValueAndValidity({emitEvent:false});},{injector:this.injector});}removeParseErrorsValidator(e){this.parseErrorsValidator&&(e?.removeValidators(this.parseErrorsValidator),e?.updateValueAndValidity({emitEvent:false}));}},me=class{_cd;constructor(e){this._cd=e;}get isTouched(){return this._cd?.control?._touched?.(),!!this._cd?.control?.touched}get isUntouched(){return !!this._cd?.control?.untouched}get isPristine(){return this._cd?.control?._pristine?.(),!!this._cd?.control?.pristine}get isDirty(){return !!this._cd?.control?.dirty}get isValid(){return this._cd?.control?._status?.(),!!this._cd?.control?.valid}get isInvalid(){return !!this._cd?.control?.invalid}get isPending(){return !!this._cd?.control?.pending}get isSubmitted(){return this._cd?._submitted?.(),!!this._cd?.submitted}};var va=(()=>{class i extends me{constructor(t){super(t);}static \u0275fac=function(n){return new(n||i)(qn(Z,2))};static \u0275dir=hv({type:i,selectors:[["","formControlName",""],["","ngModel",""],["","formControl",""]],hostVars:14,hostBindings:function(n,r){n&2&&Wd("ng-untouched",r.isUntouched)("ng-touched",r.isTouched)("ng-pristine",r.isPristine)("ng-dirty",r.isDirty)("ng-valid",r.isValid)("ng-invalid",r.isInvalid)("ng-pending",r.isPending);},standalone:false,features:[Cd]})}return i})(),_a=(()=>{class i extends me{constructor(t){super(t);}static \u0275fac=function(n){return new(n||i)(qn(q,10))};static \u0275dir=hv({type:i,selectors:[["","formGroupName",""],["","formArrayName",""],["","ngModelGroup",""],["","formGroup",""],["","formArray",""],["form",3,"ngNoForm",""],["","ngForm",""]],hostVars:16,hostBindings:function(n,r){n&2&&Wd("ng-untouched",r.isUntouched)("ng-touched",r.isTouched)("ng-pristine",r.isPristine)("ng-dirty",r.isDirty)("ng-valid",r.isValid)("ng-invalid",r.isInvalid)("ng-pending",r.isPending)("ng-submitted",r.isSubmitted);},standalone:false,features:[Cd]})}return i})(),vt=class extends gt{constructor(e,t,n){super(We(t),$e(n,t)),this.controls=e,this._initObservables(),this._setUpdateStrategy(t),this._setUpControls(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator});}controls;registerControl(e,t){let n=this._find(e);return n||(this.controls[e]=t,t.setParent(this),t._registerOnCollectionChange(this._onCollectionChange),t)}addControl(e,t,n={}){this.registerControl(e,t),this.updateValueAndValidity({emitEvent:n.emitEvent}),this._onCollectionChange();}removeControl(e,t={}){let n=this._find(e);n&&n._registerOnCollectionChange(()=>{}),delete this.controls[e],this.updateValueAndValidity({emitEvent:t.emitEvent}),this._onCollectionChange();}setControl(e,t,n={}){let r=this._find(e);r&&r._registerOnCollectionChange(()=>{}),delete this.controls[e],t&&this.registerControl(e,t),this.updateValueAndValidity({emitEvent:n.emitEvent}),this._onCollectionChange();}contains(e){return this._find(e)?.enabled===true}setValue(e,t={}){Y$1(()=>{bi(this,true,e),Object.keys(e).forEach(n=>{pi(this,true,n),this.controls[n].setValue(e[n],{onlySelf:true,emitEvent:t.emitEvent});}),this.updateValueAndValidity(t);});}patchValue(e,t={}){e!=null&&(Object.keys(e).forEach(n=>{let r=this._find(n);r&&r.patchValue(e[n],{onlySelf:true,emitEvent:t.emitEvent});}),this.updateValueAndValidity(t));}reset(e={},t={}){this._forEachChild((n,r$1)=>{n.reset(e?e[r$1]:null,s(r({},t),{onlySelf:true}));}),this._updatePristine(t,this),this._updateTouched(t,this),this.updateValueAndValidity(t),t?.emitEvent!==false&&this._events.next(new nt(this));}getRawValue(){return this._reduceChildren({},(e,t,n)=>(e[n]=t.getRawValue(),e))}_syncPendingControls(){let e=this._reduceChildren(false,(t,n)=>n._syncPendingControls()?true:t);return e&&this.updateValueAndValidity({onlySelf:true}),e}_forEachChild(e){Object.keys(this.controls).forEach(t=>{let n=this.controls[t];n&&e(n,t);});}_setUpControls(){this._forEachChild(e=>{e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange);});}_updateValue(){this.value=this._reduceValue();}_anyControls(e){for(let[t,n]of Object.entries(this.controls))if(this.contains(t)&&e(n))return  true;return  false}_reduceValue(){let e={};return this._reduceChildren(e,(t,n,r)=>((n.enabled||this.disabled)&&(t[r]=n.value),t))}_reduceChildren(e,t){let n=e;return this._forEachChild((r,o)=>{n=t(n,r,o);}),n}_allControlsDisabled(){for(let e of Object.keys(this.controls))if(this.controls[e].enabled)return  false;return Object.keys(this.controls).length>0||this.disabled}_find(e){return gi(this.controls,e)?this.controls[e]:null}};var Be=class extends vt{};var qr={provide:q,useExisting:ar$1(()=>Kr)},Tt=Promise.resolve(),Kr=(()=>{class i extends q{callSetDisabledState;get submitted(){return Y$1(this.submittedReactive)}_submitted=Ye$1(()=>this.submittedReactive());submittedReactive=Ee$1(false);_directives=new Set;form;ngSubmit=new we$1;options;constructor(t,n,r){super(),this.callSetDisabledState=r,this.form=new vt({},ze(t),Ge(n));}ngAfterViewInit(){this._setUpdateStrategy();}get formDirective(){return this}get control(){return this.form}get path(){return []}get controls(){return this.form.controls}addControl(t){Tt.then(()=>{let n=this._findContainer(t.path);t.control=n.registerControl(t.name,t.control),t._setupWithForm(this.callSetDisabledState),t.control.updateValueAndValidity({emitEvent:false}),this._directives.add(t);});}getControl(t){return this.form.get(t.path)}removeControl(t){Tt.then(()=>{this._findContainer(t.path)?.removeControl(t.name),this._directives.delete(t);});}addFormGroup(t){Tt.then(()=>{let n=this._findContainer(t.path),r=new vt({});Ci(r,t),n.registerControl(t.name,r),r.updateValueAndValidity({emitEvent:false});});}removeFormGroup(t){Tt.then(()=>{this._findContainer(t.path)?.removeControl?.(t.name);});}getFormGroup(t){return this.form.get(t.path)}updateModel(t,n){Tt.then(()=>{this.form.get(t.path).setValue(n);});}setValue(t){this.control.setValue(t);}onSubmit(t){return this.submittedReactive.set(true),Ai(this.form,this._directives),this.ngSubmit.emit(t),this.form._events.next(new ce(this.control)),t?.target?.method==="dialog"}onReset(){this.resetForm();}resetForm(t=void 0){this.form.reset(t),this.submittedReactive.set(false);}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.form._updateOn=this.options.updateOn);}_findContainer(t){return t.pop(),t.length?this.form.get(t):this.form}static \u0275fac=function(n){return new(n||i)(qn(it,10),qn(fe,10),qn(be,8))};static \u0275dir=hv({type:i,selectors:[["form",3,"ngNoForm","",3,"formGroup","",3,"formArray",""],["ng-form"],["","ngForm",""]],hostBindings:function(n,r){n&1&&Fd("submit",function(a){return r.onSubmit(a)})("reset",function(){return r.onReset()});},inputs:{options:[0,"ngFormOptions","options"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:false,features:[By([qr]),Cd]})}return i})();function Xn(i,e){let t=i.indexOf(e);t>-1&&i.splice(t,1);}function Qn(i){return typeof i=="object"&&i!==null&&Object.keys(i).length===2&&"value"in i&&"disabled"in i}var ie=class extends gt{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=false;constructor(e=null,t,n){super(We(t),$e(n,t)),this._applyFormState(e),this._setUpdateStrategy(t),this._initObservables(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator}),pe(t)&&(t.nonNullable||t.initialValueIsDefault)&&(Qn(e)?this.defaultValue=e.value:this.defaultValue=e);}setValue(e,t={}){Y$1(()=>{this.value=this._pendingValue=e,this._onChange.length&&t.emitModelToViewChange!==false&&this._onChange.forEach(n=>n(this.value,t.emitViewToModelChange!==false)),this.updateValueAndValidity(t);});}patchValue(e,t={}){this.setValue(e,t);}reset(e=this.defaultValue,t={}){this._applyFormState(e),this.markAsPristine(t),this.markAsUntouched(t),this.setValue(this.value,t),t.overwriteDefaultValue&&(this.defaultValue=this.value),this._pendingChange=false,t?.emitEvent!==false&&this._events.next(new nt(this));}_updateValue(){}_anyControls(e){return  false}_allControlsDisabled(){return this.disabled}registerOnChange(e){this._onChange.push(e);}_unregisterOnChange(e){Xn(this._onChange,e);}registerOnDisabledChange(e){this._onDisabledChange.push(e);}_unregisterOnDisabledChange(e){Xn(this._onDisabledChange,e);}_forEachChild(e){}_syncPendingControls(){return this.updateOn==="submit"&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:true,emitModelToViewChange:false}),true):false}_applyFormState(e){Qn(e)?(this.value=this._pendingValue=e.value,e.disabled?this.disable({onlySelf:true,emitEvent:false}):this.enable({onlySelf:true,emitEvent:false})):this.value=this._pendingValue=e;}};var Zr=i=>i instanceof ie;var Ca=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275dir=hv({type:i,selectors:[["form",3,"ngNoForm","",3,"ngNativeValidate",""]],hostAttrs:["novalidate",""],standalone:false})}return i})(),Yr={provide:he,useExisting:ar$1(()=>Xr),multi:true},Xr=(()=>{class i extends ei{writeValue(t){let n=t??"";this.setProperty("value",n);}registerOnChange(t){this.onChange=n=>{t(n==""?null:parseFloat(n));};}static \u0275fac=(()=>{let t;return function(r){return (t||(t=Wp(i)))(r||i)}})();static \u0275dir=hv({type:i,selectors:[["input","type","number","formControlName","",3,"ngNoCva",""],["input","type","number","formControl","",3,"ngNoCva",""],["input","type","number","ngModel","",3,"ngNoCva",""]],hostBindings:function(n,r){n&1&&Fd("input",function(a){return r.onChange(a.target.value)})("blur",function(){return r.onTouched()});},standalone:false,features:[By([Yr]),Cd]})}return i})();var je=class extends gt{constructor(e,t,n){super(We(t),$e(n,t)),this.controls=e,this._initObservables(),this._setUpdateStrategy(t),this._setUpControls(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator});}controls;at(e){return this.controls[this._adjustIndex(e)]}push(e,t={}){Array.isArray(e)?e.forEach(n=>{this.controls.push(n),this._registerControl(n);}):(this.controls.push(e),this._registerControl(e)),this.updateValueAndValidity({emitEvent:t.emitEvent}),this._onCollectionChange();}insert(e,t,n={}){this.controls.splice(e,0,t),this._registerControl(t),this.updateValueAndValidity({emitEvent:n.emitEvent});}removeAt(e,t={}){let n=this._adjustIndex(e);n<0&&(n=0),this.controls[n]&&this.controls[n]._registerOnCollectionChange(()=>{}),this.controls.splice(n,1),this.updateValueAndValidity({emitEvent:t.emitEvent});}setControl(e,t,n={}){let r=this._adjustIndex(e);r<0&&(r=0),this.controls[r]&&this.controls[r]._registerOnCollectionChange(()=>{}),this.controls.splice(r,1),t&&(this.controls.splice(r,0,t),this._registerControl(t)),this.updateValueAndValidity({emitEvent:n.emitEvent}),this._onCollectionChange();}get length(){return this.controls.length}setValue(e,t={}){Y$1(()=>{bi(this,false,e),e.forEach((n,r)=>{pi(this,false,r),this.at(r).setValue(n,{onlySelf:true,emitEvent:t.emitEvent});}),this.updateValueAndValidity(t);});}patchValue(e,t={}){e!=null&&(e.forEach((n,r)=>{this.at(r)&&this.at(r).patchValue(n,{onlySelf:true,emitEvent:t.emitEvent});}),this.updateValueAndValidity(t));}reset(e=[],t={}){this._forEachChild((n,r$1)=>{n.reset(e[r$1],s(r({},t),{onlySelf:true}));}),this._updatePristine(t,this),this._updateTouched(t,this),this.updateValueAndValidity(t),t?.emitEvent!==false&&this._events.next(new nt(this));}getRawValue(){return this.controls.map(e=>e.getRawValue())}clear(e={}){this.controls.length<1||(this._forEachChild(t=>t._registerOnCollectionChange(()=>{})),this.controls.splice(0),this.updateValueAndValidity({emitEvent:e.emitEvent}));}_adjustIndex(e){return e<0?e+this.length:e}_syncPendingControls(){let e=this.controls.reduce((t,n)=>n._syncPendingControls()?true:t,false);return e&&this.updateValueAndValidity({onlySelf:true}),e}_forEachChild(e){this.controls.forEach((t,n)=>{e(t,n);});}_updateValue(){this.value=this.controls.filter(e=>e.enabled||this.disabled).map(e=>e.value);}_anyControls(e){return this.controls.some(t=>t.enabled&&e(t))}_setUpControls(){this._forEachChild(e=>this._registerControl(e));}_allControlsDisabled(){for(let e of this.controls)if(e.enabled)return  false;return this.controls.length>0||this.disabled}_registerControl(e){e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange);}_find(e){return this.at(e)??null}};var Qr=(()=>{class i extends q{callSetDisabledState;get submitted(){return Y$1(this._submittedReactive)}set submitted(t){this._submittedReactive.set(t);}_submitted=Ye$1(()=>this._submittedReactive());_submittedReactive=Ee$1(false);_oldForm;_onCollectionChange=()=>this._updateDomValue();directives=[];constructor(t,n,r){super(),this.callSetDisabledState=r,this._setValidators(t),this._setAsyncValidators(n);}ngOnChanges(t){this.onChanges(t);}ngOnDestroy(){this.onDestroy();}onChanges(t){this._checkFormPresent(),t.hasOwnProperty("form")&&(this._updateValidators(),this._updateDomValue(),this._updateRegistrations(),this._oldForm=this.form);}onDestroy(){this.form&&(ue(this.form,this),this.form._onCollectionChange===this._onCollectionChange&&this.form._registerOnCollectionChange(()=>{}));}get formDirective(){return this}get path(){return []}addControl(t){let n=this.form.get(t.path);return t._setupWithForm(n,this.callSetDisabledState),n.updateValueAndValidity({emitEvent:false}),this.directives.push(t),n}getControl(t){return this.form.get(t.path)}removeControl(t){le(t.control||null,t,false),$r(this.directives,t);}addFormGroup(t){this._setUpFormContainer(t);}removeFormGroup(t){this._cleanUpFormContainer(t);}getFormGroup(t){return this.form.get(t.path)}getFormArray(t){return this.form.get(t.path)}addFormArray(t){this._setUpFormContainer(t);}removeFormArray(t){this._cleanUpFormContainer(t);}updateModel(t,n){this.form.get(t.path).setValue(n);}onReset(){this.resetForm();}resetForm(t=void 0,n={}){this.form.reset(t,n),this._submittedReactive.set(false);}onSubmit(t){return this.submitted=true,Ai(this.form,this.directives),this.ngSubmit.emit(t),this.form._events.next(new ce(this.control)),t?.target?.method==="dialog"}_updateDomValue(){this.directives.forEach(t=>{let n=t.control,r=this.form.get(t.path);n!==r&&(le(n||null,t),Zr(r)&&t._setupWithForm(r,this.callSetDisabledState));}),this.form._updateTreeValidity({emitEvent:false});}_setUpFormContainer(t){let n=this.form.get(t.path);Ci(n,t),n.updateValueAndValidity({emitEvent:false});}_cleanUpFormContainer(t){let n=this.form?.get(t.path);n&&zr(n,t)&&n.updateValueAndValidity({emitEvent:false});}_updateRegistrations(){this.form._registerOnCollectionChange(this._onCollectionChange),this._oldForm?._registerOnCollectionChange(()=>{});}_updateValidators(){Ze(this.form,this),this._oldForm&&ue(this._oldForm,this);}_checkFormPresent(){this.form;}static \u0275fac=function(n){return new(n||i)(qn(it,10),qn(fe,10),qn(be,8))};static \u0275dir=hv({type:i,features:[Cd,_p]})}return i})();var Ye=new T(""),Jr={provide:Z,useExisting:ar$1(()=>to)},to=(()=>{class i extends Z{_ngModelWarningConfig;callSetDisabledState;viewModel;form;set isDisabled(t){}model;update=new we$1;static _ngModelWarningSentOnce=false;_ngModelWarningSent=false;constructor(t,n,r,o,a,c,m){super(m,c,r),this._ngModelWarningConfig=o,this.callSetDisabledState=a,this._setValidators(t),this._setAsyncValidators(n);}ngOnChanges(t){if(this._isControlChanged(t)){let n=t.form.previousValue;n&&(le(n,this,false),this.removeParseErrorsValidator(n)),this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,_i(this.form,this,this.callSetDisabledState)),this.form.updateValueAndValidity({emitEvent:false});}Ei(t,this.viewModel)&&(this.form.setValue(this.model),this.viewModel=this.model);}ngOnDestroy(){this.form&&le(this.form,this,false);}get path(){return []}get control(){return this.form}viewToModelUpdate(t){this.viewModel=t,this.update.emit(t);}_isControlChanged(t){return t.hasOwnProperty("form")}\u0275ngControlCreate(t){super.ngControlCreate(t);}\u0275ngControlUpdate(t){super.ngControlUpdate(t,true);}static \u0275fac=function(n){return new(n||i)(qn(it,10),qn(fe,10),qn(he,10),qn(Ye,8),qn(be,8),qn(pm,8),qn(J,8))};static \u0275dir=hv({type:i,selectors:[["","formControl",""]],inputs:{form:[0,"formControl","form"],isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"]},outputs:{update:"ngModelChange"},exportAs:["ngForm"],standalone:false,features:[By([Jr,wi]),Cd,_p,yv(null)]})}return i})();var eo={provide:Z,useExisting:ar$1(()=>no)},no=(()=>{class i extends Z{_ngModelWarningConfig;_added=false;viewModel;control;name=null;set isDisabled(t){}model;update=new we$1;static _ngModelWarningSentOnce=false;_ngModelWarningSent=false;constructor(t,n,r,o,a,c,m){super(m,c,o),this._ngModelWarningConfig=a,this._parent=t,this._setValidators(n),this._setAsyncValidators(r);}_setupWithForm(t,n){this.control=t,this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,_i(t,this,n));}ngOnChanges(t){this._added||this._setUpControl(),Ei(t,this.viewModel)&&(this.viewModel=this.model,this.formDirective.updateModel(this,this.model));}ngOnDestroy(){this.formDirective?.removeControl(this);}viewToModelUpdate(t){this.viewModel=t,this.update.emit(t);}get path(){return Lr(this.name==null?this.name:this.name.toString(),this._parent)}get formDirective(){return this._parent?this._parent.formDirective:null}_setUpControl(){this.control=this.formDirective.addControl(this),this._added=true;}\u0275ngControlCreate(t){super.ngControlCreate(t);}\u0275ngControlUpdate(t){this.isCustomControlBased&&(this._added||this._setUpControl(),super.ngControlUpdate(t,true));}static \u0275fac=function(n){return new(n||i)(qn(q,13),qn(it,10),qn(fe,10),qn(he,10),qn(Ye,8),qn(pm,8),qn(J,8))};static \u0275dir=hv({type:i,selectors:[["","formControlName",""]],inputs:{name:[0,"formControlName","name"],isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"]},outputs:{update:"ngModelChange"},standalone:false,features:[By([eo,wi]),Cd,_p,yv(null)]})}return i})();var io={provide:q,useExisting:ar$1(()=>ro)},ro=(()=>{class i extends Qr{form=null;ngSubmit=new we$1;get control(){return this.form}static \u0275fac=(()=>{let t;return function(r){return (t||(t=Wp(i)))(r||i)}})();static \u0275dir=hv({type:i,selectors:[["","formGroup",""]],hostBindings:function(n,r){n&1&&Fd("submit",function(a){return r.onSubmit(a)})("reset",function(){return r.onReset()});},inputs:{form:[0,"formGroup","form"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:false,features:[By([io]),Cd]})}return i})();var oo=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({})}return i})();function Jn(i){return !!i&&(i.asyncValidators!==void 0||i.validators!==void 0||i.updateOn!==void 0)}var Ea=(()=>{class i{useNonNullable=false;get nonNullable(){let t=new i;return t.useNonNullable=true,t}group(t,n=null){let r=this._reduceControls(t),o={};return Jn(n)?o=n:n!==null&&(o.validators=n.validator,o.asyncValidators=n.asyncValidator),new vt(r,o)}record(t,n=null){let r=this._reduceControls(t);return new Be(r,n)}control(t,n,r$1){let o={};return this.useNonNullable?(Jn(n)?o=n:(o.validators=n,o.asyncValidators=r$1),new ie(t,s(r({},o),{nonNullable:true}))):new ie(t,n,r$1)}array(t,n,r){let o=t.map(a=>this._createControl(a));return new je(o,n,r)}_reduceControls(t){let n={};return Object.keys(t).forEach(r=>{n[r]=this._createControl(t[r]);}),n}_createControl(t){if(t instanceof ie)return t;if(t instanceof gt)return t;if(Array.isArray(t)){let n=t[0],r=t.length>1?t[1]:null,o=t.length>2?t[2]:null;return this.control(n,r,o)}else return this.control(t)}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();var Aa=(()=>{class i{static withConfig(t){return {ngModule:i,providers:[{provide:Ye,useValue:t.warnOnNgModelWithFormControl??"always"},{provide:be,useValue:t.callSetDisabledState??Ke}]}}static \u0275fac=function(n){return new(n||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({imports:[oo]})}return i})();function kt(i){return i.buttons===0||i.detail===0}function Rt(i){let e=i.touches&&i.touches[0]||i.changedTouches&&i.changedTouches[0];return !!e&&e.identifier===-1&&(e.radiusX==null||e.radiusX===1)&&(e.radiusY==null||e.radiusY===1)}var Xe;function Di(){if(Xe==null){let i=typeof document<"u"?document.head:null;Xe=!!(i&&(i.createShadowRoot||i.attachShadow));}return Xe}function Qe(i){if(Di()){let e=i.getRootNode?i.getRootNode():null;if(typeof ShadowRoot<"u"&&ShadowRoot&&e instanceof ShadowRoot)return e}return null}function ao(){let i=typeof document<"u"&&document?document.activeElement:null;for(;i&&i.shadowRoot;){let e=i.shadowRoot.activeElement;if(e===i)break;i=e;}return i}function P(i){if(i.composedPath)try{return i.composedPath()[0]}catch(e){}return i.target}var Je;try{Je=typeof Intl<"u"&&Intl.v8BreakIterator;}catch(i){Je=false;}var I=(()=>{class i{_platformId=y(lp);isBrowser=this._platformId?Ni$1(this._platformId):typeof document=="object"&&!!document;EDGE=this.isBrowser&&/(edge)/i.test(navigator.userAgent);TRIDENT=this.isBrowser&&/(msie|trident)/i.test(navigator.userAgent);BLINK=this.isBrowser&&!!(window.chrome||Je)&&typeof CSS<"u"&&!this.EDGE&&!this.TRIDENT;WEBKIT=this.isBrowser&&/AppleWebKit/i.test(navigator.userAgent)&&!this.BLINK&&!this.EDGE&&!this.TRIDENT;IOS=this.isBrowser&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!("MSStream"in window);FIREFOX=this.isBrowser&&/(firefox|minefield)/i.test(navigator.userAgent);ANDROID=this.isBrowser&&/android/i.test(navigator.userAgent)&&!this.TRIDENT;SAFARI=this.isBrowser&&/safari/i.test(navigator.userAgent)&&this.WEBKIT;static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();var Pt;function Ii(){if(Pt==null&&typeof window<"u")try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:()=>Pt=!0}));}finally{Pt=Pt||false;}return Pt}function _t(i){return Ii()?i:!!i.capture}function tn(i,e=0){return xi(i)?Number(i):arguments.length===2?e:0}function xi(i){return !isNaN(parseFloat(i))&&!isNaN(Number(i))}function j(i){return i instanceof jn?i.nativeElement:i}var Mi=new T("cdk-input-modality-detector-options"),Fi={ignoreKeys:[18,17,224,91,16]},Si=650,en={passive:true,capture:true},Ni=(()=>{class i{_platform=y(I);_listenerCleanups;modalityDetected;modalityChanged;get mostRecentModality(){return this._modality.value}_mostRecentTarget=null;_modality=new Ee$2(null);_options;_lastTouchMs=0;_onKeydown=t=>{this._options?.ignoreKeys?.some(n=>n===t.keyCode)||(this._modality.next("keyboard"),this._mostRecentTarget=P(t));};_onMousedown=t=>{Date.now()-this._lastTouchMs<Si||(this._modality.next(kt(t)?"keyboard":"mouse"),this._mostRecentTarget=P(t));};_onTouchstart=t=>{if(Rt(t)){this._modality.next("keyboard");return}this._lastTouchMs=Date.now(),this._modality.next("touch"),this._mostRecentTarget=P(t);};constructor(){let t=y(H$2),n=y(Cn),r$1=y(Mi,{optional:true});if(this._options=r(r({},Fi),r$1),this.modalityDetected=this._modality.pipe(Ln(1)),this.modalityChanged=this.modalityDetected.pipe(qr$1()),this._platform.isBrowser){let o=y(kn).createRenderer(null,null);this._listenerCleanups=t.runOutsideAngular(()=>[o.listen(n,"keydown",this._onKeydown,en),o.listen(n,"mousedown",this._onMousedown,en),o.listen(n,"touchstart",this._onTouchstart,en)]);}}ngOnDestroy(){this._modality.complete(),this._listenerCleanups?.forEach(t=>t());}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})(),Lt=(function(i){return i[i.IMMEDIATE=0]="IMMEDIATE",i[i.EVENTUAL=1]="EVENTUAL",i})(Lt||{}),Ti=new T("cdk-focus-monitor-default-options"),ge=_t({passive:true,capture:true}),nn=(()=>{class i{_ngZone=y(H$2);_platform=y(I);_inputModalityDetector=y(Ni);_origin=null;_lastFocusOrigin=null;_windowFocused=false;_windowFocusTimeoutId;_originTimeoutId;_originFromTouchInteraction=false;_elementInfo=new Map;_monitoredElementCount=0;_rootNodeFocusListenerCount=new Map;_detectionMode;_windowFocusListener=()=>{this._windowFocused=true,this._windowFocusTimeoutId=setTimeout(()=>this._windowFocused=false);};_document=y(Cn);_stopInputModalityDetector=new g;constructor(){let t=y(Ti,{optional:true});this._detectionMode=t?.detectionMode||Lt.IMMEDIATE;}_rootNodeFocusAndBlurListener=t=>{let n=P(t);for(let r=n;r;r=r.parentElement)t.type==="focus"?this._onFocus(t,r):this._onBlur(t,r);};monitor(t,n=false){let r=j(t);if(!this._platform.isBrowser||r.nodeType!==1)return Fe();let o=Qe(r)||this._document,a=this._elementInfo.get(r);if(a)return n&&(a.checkChildren=true),a.subject;let c={checkChildren:n,subject:new g,rootNode:o};return this._elementInfo.set(r,c),this._registerGlobalListeners(c),c.subject}stopMonitoring(t){let n=j(t),r=this._elementInfo.get(n);r&&(r.subject.complete(),this._setClasses(n),this._elementInfo.delete(n),this._removeGlobalListeners(r));}focusVia(t,n,r){let o=j(t),a=this._document.activeElement;o===a?this._getClosestElementsInfo(o).forEach(([c,m])=>this._originChanged(c,n,m)):(this._setOrigin(n),typeof o.focus=="function"&&o.focus(r));}ngOnDestroy(){this._elementInfo.forEach((t,n)=>this.stopMonitoring(n));}_getWindow(){return this._document.defaultView||window}_getFocusOrigin(t){return this._origin?this._originFromTouchInteraction?this._shouldBeAttributedToTouch(t)?"touch":"program":this._origin:this._windowFocused&&this._lastFocusOrigin?this._lastFocusOrigin:t&&this._isLastInteractionFromInputLabel(t)?"mouse":"program"}_shouldBeAttributedToTouch(t){return this._detectionMode===Lt.EVENTUAL||!!t?.contains(this._inputModalityDetector._mostRecentTarget)}_setClasses(t,n){t.classList.toggle("cdk-focused",!!n),t.classList.toggle("cdk-touch-focused",n==="touch"),t.classList.toggle("cdk-keyboard-focused",n==="keyboard"),t.classList.toggle("cdk-mouse-focused",n==="mouse"),t.classList.toggle("cdk-program-focused",n==="program");}_setOrigin(t,n=false){this._ngZone.runOutsideAngular(()=>{if(this._origin=t,this._originFromTouchInteraction=t==="touch"&&n,this._detectionMode===Lt.IMMEDIATE){clearTimeout(this._originTimeoutId);let r=this._originFromTouchInteraction?Si:1;this._originTimeoutId=setTimeout(()=>this._origin=null,r);}});}_onFocus(t,n){let r=this._elementInfo.get(n),o=P(t);!r||!r.checkChildren&&n!==o||this._originChanged(n,this._getFocusOrigin(o),r);}_onBlur(t,n){let r=this._elementInfo.get(n);!r||r.checkChildren&&t.relatedTarget instanceof Node&&n.contains(t.relatedTarget)||(this._setClasses(n),this._emitOrigin(r,null));}_emitOrigin(t,n){t.subject.observers.length&&this._ngZone.run(()=>t.subject.next(n));}_registerGlobalListeners(t){if(!this._platform.isBrowser)return;let n=t.rootNode,r=this._rootNodeFocusListenerCount.get(n)||0;r||this._ngZone.runOutsideAngular(()=>{n.addEventListener("focus",this._rootNodeFocusAndBlurListener,ge),n.addEventListener("blur",this._rootNodeFocusAndBlurListener,ge);}),this._rootNodeFocusListenerCount.set(n,r+1),++this._monitoredElementCount===1&&(this._ngZone.runOutsideAngular(()=>{this._getWindow().addEventListener("focus",this._windowFocusListener);}),this._inputModalityDetector.modalityDetected.pipe(Yn$1(this._stopInputModalityDetector)).subscribe(o=>{this._setOrigin(o,true);}));}_removeGlobalListeners(t){let n=t.rootNode;if(this._rootNodeFocusListenerCount.has(n)){let r=this._rootNodeFocusListenerCount.get(n);r>1?this._rootNodeFocusListenerCount.set(n,r-1):(n.removeEventListener("focus",this._rootNodeFocusAndBlurListener,ge),n.removeEventListener("blur",this._rootNodeFocusAndBlurListener,ge),this._rootNodeFocusListenerCount.delete(n));}--this._monitoredElementCount||(this._getWindow().removeEventListener("focus",this._windowFocusListener),this._stopInputModalityDetector.next(),clearTimeout(this._windowFocusTimeoutId),clearTimeout(this._originTimeoutId));}_originChanged(t,n,r){this._setClasses(t,n),this._emitOrigin(r,n),this._lastFocusOrigin=n;}_getClosestElementsInfo(t){let n=[];return this._elementInfo.forEach((r,o)=>{(o===t||r.checkChildren&&o.contains(t))&&n.push([o,r]);}),n}_isLastInteractionFromInputLabel(t){let{_mostRecentTarget:n,mostRecentModality:r}=this._inputModalityDetector;if(r!=="mouse"||!n||n===t||t.nodeName!=="INPUT"&&t.nodeName!=="TEXTAREA"||t.disabled)return  false;let o=t.labels;if(o){for(let a=0;a<o.length;a++)if(o[a].contains(n))return  true}return  false}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();var ve=new WeakMap,H=(()=>{class i{_appRef;_injector=y(J);_environmentInjector=y(K$1);load(t){let n=this._appRef=this._appRef||this._injector.get(Gn),r=ve.get(n);r||(r={loaders:new Set,refs:[]},ve.set(n,r),n.onDestroy(()=>{ve.get(n)?.refs.forEach(o=>o.destroy()),ve.delete(n);})),r.loaders.has(t)||(r.loaders.add(t),r.refs.push(yS(t,{environmentInjector:this._environmentInjector})));}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();var ye=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275cmp=lv({type:i,selectors:[["ng-component"]],exportAs:["cdkVisuallyHidden"],decls:0,vars:0,template:function(n,r){},styles:[`.cdk-visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  outline: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  left: 0;
}
[dir=rtl] .cdk-visually-hidden {
  left: auto;
  right: 0;
}
`],encapsulation:2})}return i})(),_e;function so(){if(_e===void 0&&(_e=null,typeof window<"u")){let i=window;if(i.trustedTypes!==void 0)try{_e=i.trustedTypes.createPolicy("angular#components",{createHTML:e=>e});}catch(e){console.error(e);}}return _e}function rt(i){return so()?.createHTML(i)||i}function Vi(i,e,t){let n=t.sanitize(fo$1.HTML,e);i.innerHTML=rt(n||"");}function rn(i){return Array.isArray(i)?i:[i]}var Oi=new Set,ot,Ce=(()=>{class i{_platform=y(I);_nonce=y(dp,{optional:true});_matchMedia;constructor(){this._matchMedia=this._platform.isBrowser&&window.matchMedia?window.matchMedia.bind(window):lo;}matchMedia(t){return (this._platform.WEBKIT||this._platform.BLINK)&&co(t,this._nonce),this._matchMedia(t)}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();function co(i,e){if(!Oi.has(i))try{ot||(ot=document.createElement("style"),e&&ot.setAttribute("nonce",e),ot.setAttribute("type","text/css"),document.head.appendChild(ot)),ot.sheet&&(ot.sheet.insertRule(`@media ${i.replace(/[{}]/g,"")} {body{ }}`,0),Oi.add(i));}catch(t){console.error(t);}}function lo(i){return {matches:i==="all"||i==="",media:i,addListener:()=>{},removeListener:()=>{}}}var on=(()=>{class i{_mediaMatcher=y(Ce);_zone=y(H$2);_queries=new Map;_destroySubject=new g;ngOnDestroy(){this._destroySubject.next(),this._destroySubject.complete();}isMatched(t){return ki(rn(t)).some(r=>this._registerQuery(r).mql.matches)}observe(t){let r=ki(rn(t)).map(a=>this._registerQuery(a).observable),o=Tr$2(r);return o=X(o.pipe(ee(1)),o.pipe(Ln(1),$o$1(0))),o.pipe(V(a=>{let c={matches:false,breakpoints:{}};return a.forEach(({matches:m,query:b})=>{c.matches=c.matches||m,c.breakpoints[b]=m;}),c}))}_registerQuery(t){if(this._queries.has(t))return this._queries.get(t);let n=this._mediaMatcher.matchMedia(t),o={observable:new h(a=>{let c=m=>this._zone.run(()=>a.next(m));return n.addListener(c),()=>{n.removeListener(c);}}).pipe(Un(n),V(({matches:a})=>({query:t,matches:a})),Yn$1(this._destroySubject)),mql:n};return this._queries.set(t,o),o}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();function ki(i){return i.map(e=>e.split(",")).reduce((e,t)=>e.concat(t)).map(e=>e.trim())}function uo(i){if(i.type==="characterData"&&i.target instanceof Comment)return  true;if(i.type==="childList"){for(let e=0;e<i.addedNodes.length;e++)if(!(i.addedNodes[e]instanceof Comment))return  false;for(let e=0;e<i.removedNodes.length;e++)if(!(i.removedNodes[e]instanceof Comment))return  false;return  true}return  false}var Ri=(()=>{class i{create(t){return typeof MutationObserver>"u"?null:new MutationObserver(t)}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})(),Pi=(()=>{class i{_mutationObserverFactory=y(Ri);_observedElements=new Map;_ngZone=y(H$2);ngOnDestroy(){this._observedElements.forEach((t,n)=>this._cleanupObserver(n));}observe(t){let n=j(t);return new h(r=>{let a=this._observeElement(n).pipe(V(c=>c.filter(m=>!uo(m))),D(c=>!!c.length)).subscribe(c=>{this._ngZone.run(()=>{r.next(c);});});return ()=>{a.unsubscribe(),this._unobserveElement(n);}})}_observeElement(t){return this._ngZone.runOutsideAngular(()=>{if(this._observedElements.has(t))this._observedElements.get(t).count++;else {let n=new g,r=this._mutationObserverFactory.create(o=>n.next(o));r&&r.observe(t,{characterData:true,childList:true,subtree:true}),this._observedElements.set(t,{observer:r,stream:n,count:1});}return this._observedElements.get(t).stream})}_unobserveElement(t){this._observedElements.has(t)&&(this._observedElements.get(t).count--,this._observedElements.get(t).count||this._cleanupObserver(t));}_cleanupObserver(t){if(this._observedElements.has(t)){let{observer:n,stream:r}=this._observedElements.get(t);n&&n.disconnect(),r.complete(),this._observedElements.delete(t);}}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})(),ws=(()=>{class i{_contentObserver=y(Pi);_elementRef=y(jn);event=new we$1;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._disabled?this._unsubscribe():this._subscribe();}_disabled=false;get debounce(){return this._debounce}set debounce(t){this._debounce=tn(t),this._subscribe();}_debounce;_currentSubscription=null;ngAfterContentInit(){!this._currentSubscription&&!this.disabled&&this._subscribe();}ngOnDestroy(){this._unsubscribe();}_subscribe(){this._unsubscribe();let t=this._contentObserver.observe(this._elementRef);this._currentSubscription=(this.debounce?t.pipe($o$1(this.debounce)):t).subscribe(this.event);}_unsubscribe(){this._currentSubscription?.unsubscribe();}static \u0275fac=function(n){return new(n||i)};static \u0275dir=hv({type:i,selectors:[["","cdkObserveContent",""]],inputs:{disabled:[2,"cdkObserveContentDisabled","disabled",gS],debounce:"debounce"},outputs:{event:"cdkObserveContent"},exportAs:["cdkObserveContent"]})}return i})(),Li=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({providers:[Ri]})}return i})();var mo=(()=>{class i{_platform=y(I);isDisabled(t){return t.hasAttribute("disabled")}isVisible(t){return fo(t)&&getComputedStyle(t).visibility==="visible"}isTabbable(t){if(!this._platform.isBrowser)return  false;let n=ho(Eo(t));if(n&&(Bi(n)===-1||!this.isVisible(n)))return  false;let r=t.nodeName.toLowerCase(),o=Bi(t);return t.hasAttribute("contenteditable")?o!==-1:r==="iframe"||r==="object"||this._platform.WEBKIT&&this._platform.IOS&&!yo(t)?false:r==="audio"?t.hasAttribute("controls")?o!==-1:false:r==="video"?o===-1?false:o!==null?true:this._platform.FIREFOX||t.hasAttribute("controls"):t.tabIndex>=0}isFocusable(t,n){return Co(t)&&!this.isDisabled(t)&&(n?.ignoreVisibility||this.isVisible(t))}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();function ho(i){try{return i.frameElement}catch(e){return null}}function fo(i){return !!(i.offsetWidth||i.offsetHeight||typeof i.getClientRects=="function"&&i.getClientRects().length)}function po(i){let e=i.nodeName.toLowerCase();return e==="input"||e==="select"||e==="button"||e==="textarea"}function bo(i){return vo(i)&&i.type=="hidden"}function go(i){return _o(i)&&i.hasAttribute("href")}function vo(i){return i.nodeName.toLowerCase()=="input"}function _o(i){return i.nodeName.toLowerCase()=="a"}function Hi(i){if(!i.hasAttribute("tabindex")||i.tabIndex===void 0)return  false;let e=i.getAttribute("tabindex");return !!(e&&!isNaN(parseInt(e,10)))}function Bi(i){if(!Hi(i))return null;let e=parseInt(i.getAttribute("tabindex")||"",10);return isNaN(e)?-1:e}function yo(i){let e=i.nodeName.toLowerCase(),t=e==="input"&&i.type;return t==="text"||t==="password"||e==="select"||e==="textarea"}function Co(i){return bo(i)?false:po(i)||go(i)||i.hasAttribute("contenteditable")||Hi(i)}function Eo(i){return i.ownerDocument&&i.ownerDocument.defaultView||window}var sn=class{_element;_checker;_ngZone;_document;_injector;_startAnchor=null;_endAnchor=null;_hasAttached=false;startAnchorListener=()=>{!this.focusLastTabbableElement()&&this._checker.isFocusable(this._element)&&this._element.focus();};endAnchorListener=()=>{!this.focusFirstTabbableElement()&&this._checker.isFocusable(this._element)&&this._element.focus();};get enabled(){return this._enabled}set enabled(e){this._enabled=e,this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(e,this._startAnchor),this._toggleAnchorTabIndex(e,this._endAnchor));}_enabled=true;constructor(e,t,n,r,o=false,a){this._element=e,this._checker=t,this._ngZone=n,this._document=r,this._injector=a,o||this.attachAnchors();}destroy(){let e=this._startAnchor,t=this._endAnchor;e&&(e.removeEventListener("focus",this.startAnchorListener),e.remove()),t&&(t.removeEventListener("focus",this.endAnchorListener),t.remove()),this._startAnchor=this._endAnchor=null,this._hasAttached=false;}attachAnchors(){return this._hasAttached?true:(this._ngZone.runOutsideAngular(()=>{this._startAnchor||(this._startAnchor=this._createAnchor(),this._startAnchor.addEventListener("focus",this.startAnchorListener)),this._endAnchor||(this._endAnchor=this._createAnchor(),this._endAnchor.addEventListener("focus",this.endAnchorListener));}),this._element.parentNode&&(this._element.parentNode.insertBefore(this._startAnchor,this._element),this._element.parentNode.insertBefore(this._endAnchor,this._element.nextSibling),this._hasAttached=true),this._hasAttached)}focusInitialElementWhenReady(e){return new Promise(t=>{this._executeOnStable(()=>t(this.focusInitialElement(e)));})}focusFirstTabbableElementWhenReady(e){return new Promise(t=>{this._executeOnStable(()=>t(this.focusFirstTabbableElement(e)));})}focusLastTabbableElementWhenReady(e){return new Promise(t=>{this._executeOnStable(()=>t(this.focusLastTabbableElement(e)));})}_getRegionBoundary(e){let t=this._element.querySelectorAll(`[cdk-focus-region-${e}], [cdkFocusRegion${e}], [cdk-focus-${e}]`);return e=="start"?t.length?t[0]:this._getFirstTabbableElement(this._element):t.length?t[t.length-1]:this._getLastTabbableElement(this._element)}focusInitialElement(e){let t=this._element.querySelector("[cdk-focus-initial], [cdkFocusInitial]");if(t){if(!this._checker.isFocusable(t)){let n=this._getFirstTabbableElement(t);return n?.focus(e),!!n}return t.focus(e),true}return this.focusFirstTabbableElement(e)}focusFirstTabbableElement(e){let t=this._getRegionBoundary("start");return t&&t.focus(e),!!t}focusLastTabbableElement(e){let t=this._getRegionBoundary("end");return t&&t.focus(e),!!t}hasAttached(){return this._hasAttached}_getFirstTabbableElement(e){if(this._checker.isFocusable(e)&&this._checker.isTabbable(e))return e;let t=e.children;for(let n=0;n<t.length;n++){let r=t[n].nodeType===this._document.ELEMENT_NODE?this._getFirstTabbableElement(t[n]):null;if(r)return r}return null}_getLastTabbableElement(e){if(this._checker.isFocusable(e)&&this._checker.isTabbable(e))return e;let t=e.children;for(let n=t.length-1;n>=0;n--){let r=t[n].nodeType===this._document.ELEMENT_NODE?this._getLastTabbableElement(t[n]):null;if(r)return r}return null}_createAnchor(){let e=this._document.createElement("div");return this._toggleAnchorTabIndex(this._enabled,e),e.classList.add("cdk-visually-hidden"),e.classList.add("cdk-focus-trap-anchor"),e.setAttribute("aria-hidden","true"),e}_toggleAnchorTabIndex(e,t){e?t.setAttribute("tabindex","0"):t.removeAttribute("tabindex");}toggleAnchors(e){this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(e,this._startAnchor),this._toggleAnchorTabIndex(e,this._endAnchor));}_executeOnStable(e){og(e,{injector:this._injector});}},Ao=(()=>{class i{_checker=y(mo);_ngZone=y(H$2);_document=y(Cn);_injector=y(J);constructor(){y(H).load(ye);}create(t,n=false){return new sn(t,this._checker,this._ngZone,this._document,n,this._injector)}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();var zi=new T("liveAnnouncerElement",{providedIn:"root",factory:()=>null}),Gi=new T("LIVE_ANNOUNCER_DEFAULT_OPTIONS"),wo=0,Do=(()=>{class i{_ngZone=y(H$2);_defaultOptions=y(Gi,{optional:true});_liveElement;_document=y(Cn);_sanitizer=y(Tr$1);_previousTimeout;_currentPromise;_currentResolve;constructor(){let t=y(zi,{optional:true});this._liveElement=t||this._createLiveElement();}announce(t,...n){let r=this._defaultOptions,o,a;return n.length===1&&typeof n[0]=="number"?a=n[0]:[o,a]=n,this.clear(),clearTimeout(this._previousTimeout),o||(o=r&&r.politeness?r.politeness:"polite"),a==null&&r&&(a=r.duration),this._liveElement.setAttribute("aria-live",o),this._liveElement.id&&this._exposeAnnouncerToModals(this._liveElement.id),this._ngZone.runOutsideAngular(()=>(this._currentPromise||(this._currentPromise=new Promise(c=>this._currentResolve=c)),clearTimeout(this._previousTimeout),this._previousTimeout=setTimeout(()=>{!t||typeof t=="string"?this._liveElement.textContent=t:Vi(this._liveElement,t,this._sanitizer),typeof a=="number"&&(this._previousTimeout=setTimeout(()=>this.clear(),a)),this._currentResolve?.(),this._currentPromise=this._currentResolve=void 0;},100),this._currentPromise))}clear(){this._liveElement&&(this._liveElement.textContent="");}ngOnDestroy(){clearTimeout(this._previousTimeout),this._liveElement?.remove(),this._liveElement=null,this._currentResolve?.(),this._currentPromise=this._currentResolve=void 0;}_createLiveElement(){let t="cdk-live-announcer-element",n=this._document.getElementsByClassName(t),r=this._document.createElement("div");for(let o=0;o<n.length;o++)n[o].remove();return r.classList.add(t),r.classList.add("cdk-visually-hidden"),r.setAttribute("aria-atomic","true"),r.setAttribute("aria-live","polite"),r.id=`cdk-live-announcer-${wo++}`,this._document.body.appendChild(r),r}_exposeAnnouncerToModals(t){let n=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let r=0;r<n.length;r++){let o=n[r],a=o.getAttribute("aria-owns");a?a.indexOf(t)===-1&&o.setAttribute("aria-owns",a+" "+t):o.setAttribute("aria-owns",t);}}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();var Y=(function(i){return i[i.NONE=0]="NONE",i[i.BLACK_ON_WHITE=1]="BLACK_ON_WHITE",i[i.WHITE_ON_BLACK=2]="WHITE_ON_BLACK",i})(Y||{}),ji="cdk-high-contrast-black-on-white",Ui="cdk-high-contrast-white-on-black",an="cdk-high-contrast-active",Wi=(()=>{class i{_platform=y(I);_hasCheckedHighContrastMode=false;_document=y(Cn);_breakpointSubscription;constructor(){this._breakpointSubscription=y(on).observe("(forced-colors: active)").subscribe(()=>{this._hasCheckedHighContrastMode&&(this._hasCheckedHighContrastMode=false,this._applyBodyHighContrastModeCssClasses());});}getHighContrastMode(){if(!this._platform.isBrowser)return Y.NONE;let t=this._document.createElement("div");t.style.backgroundColor="rgb(1,2,3)",t.style.position="absolute",this._document.body.appendChild(t);let n=this._document.defaultView||window,r=n&&n.getComputedStyle?n.getComputedStyle(t):null,o=(r&&r.backgroundColor||"").replace(/ /g,"");switch(t.remove(),o){case "rgb(0,0,0)":case "rgb(45,50,54)":case "rgb(32,32,32)":return Y.WHITE_ON_BLACK;case "rgb(255,255,255)":case "rgb(255,250,239)":return Y.BLACK_ON_WHITE}return Y.NONE}ngOnDestroy(){this._breakpointSubscription.unsubscribe();}_applyBodyHighContrastModeCssClasses(){if(!this._hasCheckedHighContrastMode&&this._platform.isBrowser&&this._document.body){let t=this._document.body.classList;t.remove(an,ji,Ui),this._hasCheckedHighContrastMode=true;let n=this.getHighContrastMode();n===Y.BLACK_ON_WHITE?t.add(an,ji):n===Y.WHITE_ON_BLACK&&t.add(an,Ui);}}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})(),Io=(()=>{class i{constructor(){y(Wi)._applyBodyHighContrastModeCssClasses();}static \u0275fac=function(n){return new(n||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({imports:[Li]})}return i})();var xo=200,Ee=class{_letterKeyStream=new g;_items=[];_selectedItemIndex=-1;_pressedLetters=[];_skipPredicateFn;_selectedItem=new g;selectedItem=this._selectedItem;constructor(e,t){let n=typeof t?.debounceInterval=="number"?t.debounceInterval:xo;t?.skipPredicate&&(this._skipPredicateFn=t.skipPredicate),this.setItems(e),this._setupKeyHandler(n);}destroy(){this._pressedLetters=[],this._letterKeyStream.complete(),this._selectedItem.complete();}setCurrentSelectedItemIndex(e){this._selectedItemIndex=e;}setItems(e){this._items=e;}handleKey(e){let t=e.keyCode;e.key&&e.key.length===1?this._letterKeyStream.next(e.key.toLocaleUpperCase()):(t>=65&&t<=90||t>=48&&t<=57)&&this._letterKeyStream.next(String.fromCharCode(t));}isTyping(){return this._pressedLetters.length>0}reset(){this._pressedLetters=[];}_setupKeyHandler(e){this._letterKeyStream.pipe($n(t=>this._pressedLetters.push(t)),$o$1(e),D(()=>this._pressedLetters.length>0),V(()=>this._pressedLetters.join("").toLocaleUpperCase())).subscribe(t=>{for(let n=1;n<this._items.length+1;n++){let r=(this._selectedItemIndex+n)%this._items.length,o=this._items[r];if(!this._skipPredicateFn?.(o)&&o.getLabel?.().toLocaleUpperCase().trim().indexOf(t)===0){this._selectedItem.next(o);break}}this._pressedLetters=[];});}};function $i(i,...e){return e.length?e.some(t=>i[t]):i.altKey||i.shiftKey||i.ctrlKey||i.metaKey}var yt=class{_items;_activeItemIndex=Ee$1(-1);_activeItem=Ee$1(null);_wrap=false;_typeaheadSubscription=I$1.EMPTY;_itemChangesSubscription;_vertical=true;_horizontal=null;_allowedModifierKeys=[];_homeAndEnd=false;_pageUpAndDown={enabled:false,delta:10};_effectRef;_typeahead;_skipPredicateFn=e=>e.disabled;constructor(e,t){this._items=e,e instanceof zr$1?this._itemChangesSubscription=e.changes.subscribe(n=>this._itemsChanged(n.toArray())):Rr$1(e)&&(this._effectRef=Fi$1(()=>this._itemsChanged(e()),{injector:t}));}tabOut=new g;change=new g;skipPredicate(e){return this._skipPredicateFn=e,this}withWrap(e=true){return this._wrap=e,this}withVerticalOrientation(e=true){return this._vertical=e,this}withHorizontalOrientation(e){return this._horizontal=e,this}withAllowedModifierKeys(e){return this._allowedModifierKeys=e,this}withTypeAhead(e=200){this._typeaheadSubscription.unsubscribe();let t=this._getItemsArray();return this._typeahead=new Ee(t,{debounceInterval:typeof e=="number"?e:void 0,skipPredicate:n=>this._skipPredicateFn(n)}),this._typeaheadSubscription=this._typeahead.selectedItem.subscribe(n=>{this.setActiveItem(n);}),this}cancelTypeahead(){return this._typeahead?.reset(),this}withHomeAndEnd(e=true){return this._homeAndEnd=e,this}withPageUpDown(e=true,t=10){return this._pageUpAndDown={enabled:e,delta:t},this}setActiveItem(e){let t=this._activeItem();this.updateActiveItem(e),this._activeItem()!==t&&this.change.next(this._activeItemIndex());}onKeydown(e){let t=e.keyCode,r=["altKey","ctrlKey","metaKey","shiftKey"].every(o=>!e[o]||this._allowedModifierKeys.indexOf(o)>-1);switch(t){case 9:this.tabOut.next();return;case 40:if(this._vertical&&r){this.setNextItemActive();break}else return;case 38:if(this._vertical&&r){this.setPreviousItemActive();break}else return;case 39:if(this._horizontal&&r){this._horizontal==="rtl"?this.setPreviousItemActive():this.setNextItemActive();break}else return;case 37:if(this._horizontal&&r){this._horizontal==="rtl"?this.setNextItemActive():this.setPreviousItemActive();break}else return;case 36:if(this._homeAndEnd&&r){this.setFirstItemActive();break}else return;case 35:if(this._homeAndEnd&&r){this.setLastItemActive();break}else return;case 33:if(this._pageUpAndDown.enabled&&r){let o=this._activeItemIndex()-this._pageUpAndDown.delta;this._setActiveItemByIndex(o>0?o:0,1);break}else return;case 34:if(this._pageUpAndDown.enabled&&r){let o=this._activeItemIndex()+this._pageUpAndDown.delta,a=this._getItemsArray().length;this._setActiveItemByIndex(o<a?o:a-1,-1);break}else return;default:(r||$i(e,"shiftKey"))&&this._typeahead?.handleKey(e);return}this._typeahead?.reset(),e.preventDefault();}get activeItemIndex(){return this._activeItemIndex()}get activeItem(){return this._activeItem()}isTyping(){return !!this._typeahead&&this._typeahead.isTyping()}setFirstItemActive(){this._setActiveItemByIndex(0,1);}setLastItemActive(){this._setActiveItemByIndex(this._getItemsArray().length-1,-1);}setNextItemActive(){this._activeItemIndex()<0?this.setFirstItemActive():this._setActiveItemByDelta(1);}setPreviousItemActive(){this._activeItemIndex()<0&&this._wrap?this.setLastItemActive():this._setActiveItemByDelta(-1);}updateActiveItem(e){let t=this._getItemsArray(),n=typeof e=="number"?e:t.indexOf(e),r=t[n];this._activeItem.set(r??null),this._activeItemIndex.set(n),this._typeahead?.setCurrentSelectedItemIndex(n);}destroy(){this._typeaheadSubscription.unsubscribe(),this._itemChangesSubscription?.unsubscribe(),this._effectRef?.destroy(),this._typeahead?.destroy(),this.tabOut.complete(),this.change.complete();}_setActiveItemByDelta(e){this._wrap?this._setActiveInWrapMode(e):this._setActiveInDefaultMode(e);}_setActiveInWrapMode(e){let t=this._getItemsArray();for(let n=1;n<=t.length;n++){let r=(this._activeItemIndex()+e*n+t.length)%t.length,o=t[r];if(!this._skipPredicateFn(o)){this.setActiveItem(r);return}}}_setActiveInDefaultMode(e){this._setActiveItemByIndex(this._activeItemIndex()+e,e);}_setActiveItemByIndex(e,t){let n=this._getItemsArray();if(n[e]){for(;this._skipPredicateFn(n[e]);)if(e+=t,!n[e])return;this.setActiveItem(e);}}_getItemsArray(){return Rr$1(this._items)?this._items():this._items instanceof zr$1?this._items.toArray():this._items}_itemsChanged(e){this._typeahead?.setItems(e);let t=this._activeItem();if(t){let n=e.indexOf(t);n>-1&&n!==this._activeItemIndex()&&(this._activeItemIndex.set(n),this._typeahead?.setCurrentSelectedItemIndex(n));}}};var cn=class extends yt{setActiveItem(e){this.activeItem&&this.activeItem.setInactiveStyles(),super.setActiveItem(e),this.activeItem&&this.activeItem.setActiveStyles();}};var ln=class extends yt{_origin="program";setFocusOrigin(e){return this._origin=e,this}setActiveItem(e){super.setActiveItem(e),this.activeItem&&this.activeItem.focus(this._origin);}};var qi=new Map,dn=class i{_appId=y(Pi$1);static _infix=`a${Math.floor(Math.random()*1e5).toString()}`;getId(e,t=false){this._appId!=="ng"&&(e+=this._appId);let n=qi.get(e);return n===void 0?n=0:n++,qi.set(e,n),`${e}${t?i._infix+"-":""}${n}`}static \u0275fac=function(t){return new(t||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})};var Zi=" ";function Mo(i,e,t){let n=we(i,e);t=t.trim(),!n.some(r=>r.trim()===t)&&(n.push(t),i.setAttribute(e,n.join(Zi)));}function Fo(i,e,t){let n=we(i,e);t=t.trim();let r=n.filter(o=>o!==t);r.length?i.setAttribute(e,r.join(Zi)):i.removeAttribute(e);}function we(i,e){return i.getAttribute(e)?.match(/\S+/g)??[]}var Yi="cdk-describedby-message",Ae="cdk-describedby-host",mn=0,Ec=(()=>{class i{_platform=y(I);_document=y(Cn);_messageRegistry=new Map;_messagesContainer=null;_id=`${mn++}`;constructor(){y(H).load(ye),this._id=y(Pi$1)+"-"+mn++;}describe(t,n,r){if(!this._canBeDescribed(t,n))return;let o=un(n,r);typeof n!="string"?(Ki(n,this._id),this._messageRegistry.set(o,{messageElement:n,referenceCount:0})):this._messageRegistry.has(o)||this._createMessageElement(n,r),this._isElementDescribedByMessage(t,o)||this._addMessageReference(t,o);}removeDescription(t,n,r){if(!n||!this._isElementNode(t))return;let o=un(n,r);if(this._isElementDescribedByMessage(t,o)&&this._removeMessageReference(t,o),typeof n=="string"){let a=this._messageRegistry.get(o);a&&a.referenceCount===0&&this._deleteMessageElement(o);}this._messagesContainer?.childNodes.length===0&&(this._messagesContainer.remove(),this._messagesContainer=null);}ngOnDestroy(){let t=this._document.querySelectorAll(`[${Ae}="${this._id}"]`);for(let n=0;n<t.length;n++)this._removeCdkDescribedByReferenceIds(t[n]),t[n].removeAttribute(Ae);this._messagesContainer?.remove(),this._messagesContainer=null,this._messageRegistry.clear();}_createMessageElement(t,n){let r=this._document.createElement("div");Ki(r,this._id),r.textContent=t,n&&r.setAttribute("role",n),this._createMessagesContainer(),this._messagesContainer.appendChild(r),this._messageRegistry.set(un(t,n),{messageElement:r,referenceCount:0});}_deleteMessageElement(t){this._messageRegistry.get(t)?.messageElement?.remove(),this._messageRegistry.delete(t);}_createMessagesContainer(){if(this._messagesContainer)return;let t="cdk-describedby-message-container",n=this._document.querySelectorAll(`.${t}[platform="server"]`);for(let o=0;o<n.length;o++)n[o].remove();let r=this._document.createElement("div");r.style.visibility="hidden",r.classList.add(t),r.classList.add("cdk-visually-hidden"),this._platform.isBrowser||r.setAttribute("platform","server"),this._document.body.appendChild(r),this._messagesContainer=r;}_removeCdkDescribedByReferenceIds(t){let n=we(t,"aria-describedby").filter(r=>r.indexOf(Yi)!=0);t.setAttribute("aria-describedby",n.join(" "));}_addMessageReference(t,n){let r=this._messageRegistry.get(n);Mo(t,"aria-describedby",r.messageElement.id),t.setAttribute(Ae,this._id),r.referenceCount++;}_removeMessageReference(t,n){let r=this._messageRegistry.get(n);r.referenceCount--,Fo(t,"aria-describedby",r.messageElement.id),t.removeAttribute(Ae);}_isElementDescribedByMessage(t,n){let r=we(t,"aria-describedby"),o=this._messageRegistry.get(n),a=o&&o.messageElement.id;return !!a&&r.indexOf(a)!=-1}_canBeDescribed(t,n){if(!this._isElementNode(t))return  false;if(n&&typeof n=="object")return  true;let r=n==null?"":`${n}`.trim(),o=t.getAttribute("aria-label");return r?!o||o.trim()!==r:false}_isElementNode(t){return t.nodeType===this._document.ELEMENT_NODE}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();function un(i,e){return typeof i=="string"?`${e||""}/${i}`:i}function Ki(i,e){i.id||(i.id=`${Yi}-${e}-${mn++}`);}var Bt=(function(i){return i[i.NORMAL=0]="NORMAL",i[i.NEGATED=1]="NEGATED",i[i.INVERTED=2]="INVERTED",i})(Bt||{}),De,at;function Sc(){if(at==null){if(typeof document!="object"||!document||typeof Element!="function"||!Element)return at=false,at;if(document.documentElement?.style&&"scrollBehavior"in document.documentElement.style)at=true;else {let i=Element.prototype.scrollTo;i?at=!/\{\s*\[native code\]\s*\}/.test(i.toString()):at=false;}}return at}function Nc(){if(typeof document!="object"||!document)return Bt.NORMAL;if(De==null){let i=document.createElement("div"),e=i.style;i.dir="rtl",e.width="1px",e.overflow="auto",e.visibility="hidden",e.pointerEvents="none",e.position="absolute";let t=document.createElement("div"),n=t.style;n.width="2px",n.height="1px",i.appendChild(t),document.body.appendChild(i),De=Bt.NORMAL,i.scrollLeft===0&&(i.scrollLeft=1,De=i.scrollLeft===0?Bt.NEGATED:Bt.INVERTED),i.remove();}return De}function Vc(){return typeof __karma__<"u"&&!!__karma__||typeof jasmine<"u"&&!!jasmine||typeof jest<"u"&&!!jest||typeof Mocha<"u"&&!!Mocha}var Ct,Xi=["color","button","checkbox","date","datetime-local","email","file","hidden","image","month","number","password","radio","range","reset","search","submit","tel","text","time","url","week"];function kc(){if(Ct)return Ct;if(typeof document!="object"||!document)return Ct=new Set(Xi),Ct;let i=document.createElement("input");return Ct=new Set(Xi.filter(e=>(i.setAttribute("type",e),i.type===e))),Ct}var jc={HandsetPortrait:"(max-width: 599.98px) and (orientation: portrait)"};var So=new T("MATERIAL_ANIMATIONS"),Qi=null;function No(){return y(So,{optional:true})?.animationsDisabled||y(up,{optional:true})==="NoopAnimations"?"di-disabled":(Qi??=y(Ce).matchMedia("(prefers-reduced-motion)").matches,Qi?"reduced-motion":"enabled")}function Et(){return No()!=="enabled"}function $c(i){return i==null?"":typeof i=="string"?i:`${i}px`}function Kc(i){return i!=null&&`${i}`!="false"}var O=(function(i){return i[i.FADING_IN=0]="FADING_IN",i[i.VISIBLE=1]="VISIBLE",i[i.FADING_OUT=2]="FADING_OUT",i[i.HIDDEN=3]="HIDDEN",i})(O||{}),hn=class{_renderer;element;config;_animationForciblyDisabledThroughCss;state=O.HIDDEN;constructor(e,t,n,r=false){this._renderer=e,this.element=t,this.config=n,this._animationForciblyDisabledThroughCss=r;}fadeOut(){this._renderer.fadeOutRipple(this);}},Ji=_t({passive:true,capture:true}),fn=class{_events=new Map;addHandler(e,t,n,r){let o=this._events.get(t);if(o){let a=o.get(n);a?a.add(r):o.set(n,new Set([r]));}else this._events.set(t,new Map([[n,new Set([r])]])),e.runOutsideAngular(()=>{document.addEventListener(t,this._delegateEventHandler,Ji);});}removeHandler(e,t,n){let r=this._events.get(e);if(!r)return;let o=r.get(t);o&&(o.delete(n),o.size===0&&r.delete(t),r.size===0&&(this._events.delete(e),document.removeEventListener(e,this._delegateEventHandler,Ji)));}_delegateEventHandler=e=>{let t=P(e);t&&this._events.get(e.type)?.forEach((n,r)=>{(r===t||r.contains(t))&&n.forEach(o=>o.handleEvent(e));});}},jt={enterDuration:225,exitDuration:150},To=800,tr=_t({passive:true,capture:true}),er=["mousedown","touchstart"],nr=["mouseup","mouseleave","touchend","touchcancel"],Vo=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275cmp=lv({type:i,selectors:[["ng-component"]],hostAttrs:["mat-ripple-style-loader",""],decls:0,vars:0,template:function(n,r){},styles:[`.mat-ripple {
  overflow: hidden;
  position: relative;
}
.mat-ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-ripple.mat-ripple-unbounded {
  overflow: visible;
}

.mat-ripple-element {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity, transform 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: scale3d(0, 0, 0);
  background-color: var(--mat-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface) 10%, transparent));
}
@media (forced-colors: active) {
  .mat-ripple-element {
    display: none;
  }
}
.cdk-drag-preview .mat-ripple-element, .cdk-drag-placeholder .mat-ripple-element {
  display: none;
}
`],encapsulation:2})}return i})(),Ut=class i{_target;_ngZone;_platform;_containerElement;_triggerElement=null;_isPointerDown=false;_activeRipples=new Map;_mostRecentTransientRipple=null;_lastTouchStartEvent;_pointerUpEventsRegistered=false;_containerRect=null;static _eventManager=new fn;constructor(e,t,n,r,o){this._target=e,this._ngZone=t,this._platform=r,r.isBrowser&&(this._containerElement=j(n)),o&&o.get(H).load(Vo);}fadeInRipple(e,t,n={}){let r$1=this._containerRect=this._containerRect||this._containerElement.getBoundingClientRect(),o=r(r({},jt),n.animation);n.centered&&(e=r$1.left+r$1.width/2,t=r$1.top+r$1.height/2);let a=n.radius||Oo(e,t,r$1),c=e-r$1.left,m=t-r$1.top,b=o.enterDuration,p=document.createElement("div");p.classList.add("mat-ripple-element"),p.style.left=`${c-a}px`,p.style.top=`${m-a}px`,p.style.height=`${a*2}px`,p.style.width=`${a*2}px`,n.color!=null&&(p.style.backgroundColor=n.color),p.style.transitionDuration=`${b}ms`,this._containerElement.appendChild(p);let wt=window.getComputedStyle(p),X=wt.transitionProperty,_n=wt.transitionDuration,Me=X==="none"||_n==="0s"||_n==="0s, 0s"||r$1.width===0&&r$1.height===0,Q=new hn(this,p,n,Me);p.style.transform="scale3d(1, 1, 1)",Q.state=O.FADING_IN,n.persistent||(this._mostRecentTransientRipple=Q);let Ht=null;return !Me&&(b||o.exitDuration)&&this._ngZone.runOutsideAngular(()=>{let yn=()=>{Ht&&(Ht.fallbackTimer=null),clearTimeout(Cn),this._finishRippleTransition(Q);},Fe=()=>this._destroyRipple(Q),Cn=setTimeout(Fe,b+100);p.addEventListener("transitionend",yn),p.addEventListener("transitioncancel",Fe),Ht={onTransitionEnd:yn,onTransitionCancel:Fe,fallbackTimer:Cn};}),this._activeRipples.set(Q,Ht),(Me||!b)&&this._finishRippleTransition(Q),Q}fadeOutRipple(e){if(e.state===O.FADING_OUT||e.state===O.HIDDEN)return;let t=e.element,n=r(r({},jt),e.config.animation);t.style.transitionDuration=`${n.exitDuration}ms`,t.style.opacity="0",e.state=O.FADING_OUT,(e._animationForciblyDisabledThroughCss||!n.exitDuration)&&this._finishRippleTransition(e);}fadeOutAll(){this._getActiveRipples().forEach(e=>e.fadeOut());}fadeOutAllNonPersistent(){this._getActiveRipples().forEach(e=>{e.config.persistent||e.fadeOut();});}setupTriggerEvents(e){let t=j(e);!this._platform.isBrowser||!t||t===this._triggerElement||(this._removeTriggerEvents(),this._triggerElement=t,er.forEach(n=>{i._eventManager.addHandler(this._ngZone,n,t,this);}));}handleEvent(e){e.type==="mousedown"?this._onMousedown(e):e.type==="touchstart"?this._onTouchStart(e):this._onPointerUp(),this._pointerUpEventsRegistered||(this._ngZone.runOutsideAngular(()=>{nr.forEach(t=>{this._triggerElement.addEventListener(t,this,tr);});}),this._pointerUpEventsRegistered=true);}_finishRippleTransition(e){e.state===O.FADING_IN?this._startFadeOutTransition(e):e.state===O.FADING_OUT&&this._destroyRipple(e);}_startFadeOutTransition(e){let t=e===this._mostRecentTransientRipple,{persistent:n}=e.config;e.state=O.VISIBLE,!n&&(!t||!this._isPointerDown)&&e.fadeOut();}_destroyRipple(e){let t=this._activeRipples.get(e)??null;this._activeRipples.delete(e),this._activeRipples.size||(this._containerRect=null),e===this._mostRecentTransientRipple&&(this._mostRecentTransientRipple=null),e.state=O.HIDDEN,t!==null&&(e.element.removeEventListener("transitionend",t.onTransitionEnd),e.element.removeEventListener("transitioncancel",t.onTransitionCancel),t.fallbackTimer!==null&&clearTimeout(t.fallbackTimer)),e.element.remove();}_onMousedown(e){let t=kt(e),n=this._lastTouchStartEvent&&Date.now()<this._lastTouchStartEvent+To;!this._target.rippleDisabled&&!t&&!n&&(this._isPointerDown=true,this.fadeInRipple(e.clientX,e.clientY,this._target.rippleConfig));}_onTouchStart(e){if(!this._target.rippleDisabled&&!Rt(e)){this._lastTouchStartEvent=Date.now(),this._isPointerDown=true;let t=e.changedTouches;if(t)for(let n=0;n<t.length;n++)this.fadeInRipple(t[n].clientX,t[n].clientY,this._target.rippleConfig);}}_onPointerUp(){this._isPointerDown&&(this._isPointerDown=false,this._getActiveRipples().forEach(e=>{let t=e.state===O.VISIBLE||e.config.terminateOnPointerUp&&e.state===O.FADING_IN;!e.config.persistent&&t&&e.fadeOut();}));}_getActiveRipples(){return Array.from(this._activeRipples.keys())}_removeTriggerEvents(){let e=this._triggerElement;e&&(er.forEach(t=>i._eventManager.removeHandler(t,e,this)),this._pointerUpEventsRegistered&&(nr.forEach(t=>e.removeEventListener(t,this,tr)),this._pointerUpEventsRegistered=false));}};function Oo(i,e,t){let n=Math.max(Math.abs(i-t.left),Math.abs(i-t.right)),r=Math.max(Math.abs(e-t.top),Math.abs(e-t.bottom));return Math.sqrt(n*n+r*r)}var pn=new T("mat-ripple-global-options"),sl=(()=>{class i{_elementRef=y(jn);_animationsDisabled=Et();color;unbounded=false;centered=false;radius=0;animation;get disabled(){return this._disabled}set disabled(t){t&&this.fadeOutAllNonPersistent(),this._disabled=t,this._setupTriggerEventsIfEnabled();}_disabled=false;get trigger(){return this._trigger||this._elementRef.nativeElement}set trigger(t){this._trigger=t,this._setupTriggerEventsIfEnabled();}_trigger;_rippleRenderer;_globalOptions;_isInitialized=false;constructor(){let t=y(H$2),n=y(I),r=y(pn,{optional:true}),o=y(J);this._globalOptions=r||{},this._rippleRenderer=new Ut(this,t,this._elementRef,n,o);}ngOnInit(){this._isInitialized=true,this._setupTriggerEventsIfEnabled();}ngOnDestroy(){this._rippleRenderer._removeTriggerEvents();}fadeOutAll(){this._rippleRenderer.fadeOutAll();}fadeOutAllNonPersistent(){this._rippleRenderer.fadeOutAllNonPersistent();}get rippleConfig(){return {centered:this.centered,radius:this.radius,color:this.color,animation:r(r(r({},this._globalOptions.animation),this._animationsDisabled?{enterDuration:0,exitDuration:0}:{}),this.animation),terminateOnPointerUp:this._globalOptions.terminateOnPointerUp}}get rippleDisabled(){return this.disabled||!!this._globalOptions.disabled}_setupTriggerEventsIfEnabled(){!this.disabled&&this._isInitialized&&this._rippleRenderer.setupTriggerEvents(this.trigger);}launch(t,n=0,r$1){return typeof t=="number"?this._rippleRenderer.fadeInRipple(t,n,r(r({},this.rippleConfig),r$1)):this._rippleRenderer.fadeInRipple(0,0,r(r({},this.rippleConfig),t))}static \u0275fac=function(n){return new(n||i)};static \u0275dir=hv({type:i,selectors:[["","mat-ripple",""],["","matRipple",""]],hostAttrs:[1,"mat-ripple"],hostVars:2,hostBindings:function(n,r){n&2&&Wd("mat-ripple-unbounded",r.unbounded);},inputs:{color:[0,"matRippleColor","color"],unbounded:[0,"matRippleUnbounded","unbounded"],centered:[0,"matRippleCentered","centered"],radius:[0,"matRippleRadius","radius"],animation:[0,"matRippleAnimation","animation"],disabled:[0,"matRippleDisabled","disabled"],trigger:[0,"matRippleTrigger","trigger"]},exportAs:["matRipple"]})}return i})();var ko={capture:true},Ro=["focus","mousedown","mouseenter","touchstart"],bn="mat-ripple-loader-uninitialized",gn="mat-ripple-loader-class-name",ir="mat-ripple-loader-centered",Ie="mat-ripple-loader-disabled",rr=(()=>{class i{_document=y(Cn);_animationsDisabled=Et();_globalRippleOptions=y(pn,{optional:true});_platform=y(I);_ngZone=y(H$2);_injector=y(J);_eventCleanups;_hosts=new Map;constructor(){let t=y(kn).createRenderer(null,null);this._eventCleanups=this._ngZone.runOutsideAngular(()=>Ro.map(n=>t.listen(this._document,n,this._onInteraction,ko)));}ngOnDestroy(){let t=this._hosts.keys();for(let n of t)this.destroyRipple(n);this._eventCleanups.forEach(n=>n());}configureRipple(t,n){t.setAttribute(bn,this._globalRippleOptions?.namespace??""),(n.className||!t.hasAttribute(gn))&&t.setAttribute(gn,n.className||""),n.centered&&t.setAttribute(ir,""),n.disabled&&t.setAttribute(Ie,"");}setDisabled(t,n){let r=this._hosts.get(t);r?(r.target.rippleDisabled=n,!n&&!r.hasSetUpEvents&&(r.hasSetUpEvents=true,r.renderer.setupTriggerEvents(t))):n?t.setAttribute(Ie,""):t.removeAttribute(Ie);}_onInteraction=t=>{let n=P(t);if(n instanceof HTMLElement){let r=n.closest(`[${bn}="${this._globalRippleOptions?.namespace??""}"]`);r&&this._createRipple(r);}};_createRipple(t){if(!this._document||this._hosts.has(t))return;t.querySelector(".mat-ripple")?.remove();let n=this._document.createElement("span");n.classList.add("mat-ripple",t.getAttribute(gn)),t.append(n);let r=this._globalRippleOptions,o=this._animationsDisabled?0:r?.animation?.enterDuration??jt.enterDuration,a=this._animationsDisabled?0:r?.animation?.exitDuration??jt.exitDuration,c={rippleDisabled:this._animationsDisabled||r?.disabled||t.hasAttribute(Ie),rippleConfig:{centered:t.hasAttribute(ir),terminateOnPointerUp:r?.terminateOnPointerUp,animation:{enterDuration:o,exitDuration:a}}},m=new Ut(c,this._ngZone,n,this._platform,this._injector),b=!c.rippleDisabled;b&&m.setupTriggerEvents(t),this._hosts.set(t,{target:c,renderer:m,hasSetUpEvents:b}),t.removeAttribute(bn);}destroyRipple(t){let n=this._hosts.get(t);n&&(n.renderer._removeTriggerEvents(),this._hosts.delete(t));}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();var or=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275cmp=lv({type:i,selectors:[["structural-styles"]],decls:0,vars:0,template:function(n,r){},styles:[`.mat-focus-indicator {
  position: relative;
}
.mat-focus-indicator::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  box-sizing: border-box;
  pointer-events: none;
  display: var(--mat-focus-indicator-display, none);
  border-width: var(--mat-focus-indicator-border-width, 3px);
  border-style: var(--mat-focus-indicator-border-style, solid);
  border-color: var(--mat-focus-indicator-border-color, transparent);
  border-radius: var(--mat-focus-indicator-border-radius, 4px);
}
.mat-focus-indicator:focus-visible::before {
  content: "";
}

@media (forced-colors: active) {
  html {
    --mat-focus-indicator-display: block;
    --mat-focus-indicator-fallback-border-style: none;
  }
}
`],encapsulation:2})}return i})();var Po=["*",[["","progressIndicator",""]]],Lo=["*","[progressIndicator]"];function Bo(i,e){i&1&&(pa(0,"div",1),oy(1,1),ha());}var jo=new T("MAT_BUTTON_CONFIG");function ar(i){return i==null?void 0:mS(i)}var vn=(()=>{class i{_elementRef=y(jn);_ngZone=y(H$2);_animationsDisabled=Et();_config=y(jo,{optional:true});_focusMonitor=y(nn);_cleanupClick;_renderer=y(pm);_rippleLoader=y(rr);_isAnchor;_isFab=false;color;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=t,this._updateRippleDisabled();}_disableRipple=false;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._updateRippleDisabled();}_disabled=false;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(t){this.tabIndex=t;}showProgress=cS(false,{transform:gS});constructor(){y(H).load(or);let t=this._elementRef.nativeElement;this._isAnchor=t.tagName==="A",this.disabledInteractive=this._config?.disabledInteractive??false,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(t,{className:"mat-mdc-button-ripple"});}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,true),this._isAnchor&&this._setupAsAnchor();}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement);}focus(t="program",n){t?this._focusMonitor.focusVia(this._elementRef.nativeElement,t,n):this._elementRef.nativeElement.focus(n);}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?true:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:true}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled);}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,"click",t=>{this.disabled&&(t.preventDefault(),t.stopImmediatePropagation());}));}static \u0275fac=function(n){return new(n||i)};static \u0275dir=hv({type:i,hostAttrs:[1,"mat-mdc-button-base"],hostVars:15,hostBindings:function(n,r){n&2&&(bd("disabled",r._getDisabledAttribute())("aria-disabled",r._getAriaDisabled())("tabindex",r._getTabIndex()),Ey(r.color?"mat-"+r.color:""),Wd("mat-mdc-button-progress-indicator-shown",r.showProgress())("mat-mdc-button-disabled",r.disabled)("mat-mdc-button-disabled-interactive",r.disabledInteractive)("mat-unthemed",!r.color)("_mat-animation-noopable",r._animationsDisabled));},inputs:{color:"color",disableRipple:[2,"disableRipple","disableRipple",gS],disabled:[2,"disabled","disabled",gS],ariaDisabled:[2,"aria-disabled","ariaDisabled",gS],disabledInteractive:[2,"disabledInteractive","disabledInteractive",gS],tabIndex:[2,"tabIndex","tabIndex",ar],_tabindex:[2,"tabindex","_tabindex",ar],showProgress:[1,"showProgress"]}})}return i})(),Uo=(()=>{class i extends vn{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:true});}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=lv({type:i,selectors:[["button","mat-icon-button",""],["a","mat-icon-button",""],["button","matIconButton",""],["a","matIconButton",""]],hostAttrs:[1,"mdc-icon-button","mat-mdc-icon-button"],exportAs:["matButton","matAnchor"],features:[Cd],ngContentSelectors:Lo,decls:5,vars:1,consts:[[1,"mat-mdc-button-persistent-ripple","mdc-icon-button__ripple"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(n,r){n&1&&(ry(Po),Rd(0,"span",0),oy(1),Lv(2,Bo,2,0,"div",1),Rd(3,"span",2)(4,"span",3)),n&2&&(Sg(2),Pv(r.showProgress()?2:-1));},styles:[`.mat-mdc-icon-button {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  border: none;
  outline: none;
  background-color: transparent;
  fill: currentColor;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  overflow: visible;
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
  flex-shrink: 0;
  text-align: center;
  width: var(--mat-icon-button-state-layer-size, 40px);
  height: var(--mat-icon-button-state-layer-size, 40px);
  padding: calc(calc(var(--mat-icon-button-state-layer-size, 40px) - var(--mat-icon-button-icon-size, 24px)) / 2);
  font-size: var(--mat-icon-button-icon-size, 24px);
  color: var(--mat-icon-button-icon-color, var(--mat-sys-on-surface-variant));
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-icon-button .mat-mdc-button-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-icon-button .mdc-button__label,
.mat-mdc-icon-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-icon-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-icon-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-ripple-element {
  background-color: var(--mat-icon-button-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface-variant) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-icon-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-icon-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-icon-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-icon-button-touch-target-size, 48px);
  display: var(--mat-icon-button-touch-target-display, block);
  left: 50%;
  width: var(--mat-icon-button-touch-target-size, 48px);
  transform: translate(-50%, -50%);
}
.mat-mdc-icon-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-icon-button[disabled], .mat-mdc-icon-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-icon-button-disabled-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-icon-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-icon-button img,
.mat-mdc-icon-button svg {
  width: var(--mat-icon-button-icon-size, 24px);
  height: var(--mat-icon-button-icon-size, 24px);
  vertical-align: baseline;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__determinate-circle-graphic {
  width: inherit;
  height: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__indeterminate-circle-graphic {
  height: 100%;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
}
.mat-mdc-icon-button[hidden] {
  display: none;
}
.mat-mdc-icon-button.mat-unthemed:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-primary:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-accent:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-warn:not(.mdc-ripple-upgraded):focus::before {
  background: transparent;
  opacity: 1;
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return i})();var Ho=new T("cdk-dir-doc",{providedIn:"root",factory:()=>y(Cn)}),zo=/^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Adlm|Arab|Hebr|Nkoo|Rohg|Thaa))(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)/i;function sr(i){let e=i?.toLowerCase()||"";return e==="auto"&&typeof navigator<"u"&&navigator?.language?zo.test(navigator.language)?"rtl":"ltr":e==="rtl"?"rtl":"ltr"}var Go=(()=>{class i{get value(){return this.valueSignal()}valueSignal=Ee$1("ltr");change=new we$1;constructor(){let t=y(Ho,{optional:true});if(t){let n=t.body?t.body.dir:null,r=t.documentElement?t.documentElement.dir:null;this.valueSignal.set(sr(n||r||"ltr"));}}ngOnDestroy(){this.change.complete();}static \u0275fac=function(n){return new(n||i)};static \u0275prov=Ct$1({token:i,factory:i.\u0275fac})}return i})();var At=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({})}return i})();var cr=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({imports:[At]})}return i})();var Wo=[[["",8,"material-icons",3,"iconPositionEnd",""],["mat-icon",3,"iconPositionEnd",""],["","matButtonIcon","",3,"iconPositionEnd",""]],"*",[["","iconPositionEnd","",8,"material-icons"],["mat-icon","iconPositionEnd",""],["","matButtonIcon","","iconPositionEnd",""]],[["","progressIndicator",""]]],$o=[".material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd])","*",".material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd]","[progressIndicator]"];function qo(i,e){i&1&&(pa(0,"div",2),oy(1,3),ha());}var lr=new Map([["text",["mat-mdc-button"]],["filled",["mdc-button--unelevated","mat-mdc-unelevated-button"]],["elevated",["mdc-button--raised","mat-mdc-raised-button"]],["outlined",["mdc-button--outlined","mat-mdc-outlined-button"]],["tonal",["mat-tonal-button"]]]),Ll=(()=>{class i extends vn{get appearance(){return this._appearance}set appearance(t){this.setAppearance(t||this._config?.defaultAppearance||"text");}_appearance=null;constructor(){super();let t=Ko(this._elementRef.nativeElement);t&&this.setAppearance(t);}setAppearance(t){if(t===this._appearance)return;let n=this._elementRef.nativeElement.classList,r=this._appearance?lr.get(this._appearance):null,o=lr.get(t);r&&n.remove(...r),n.add(...o),this._appearance=t;}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=lv({type:i,selectors:[["button","matButton",""],["a","matButton",""],["button","mat-button",""],["button","mat-raised-button",""],["button","mat-flat-button",""],["button","mat-stroked-button",""],["a","mat-button",""],["a","mat-raised-button",""],["a","mat-flat-button",""],["a","mat-stroked-button",""]],hostAttrs:[1,"mdc-button"],inputs:{appearance:[0,"matButton","appearance"]},exportAs:["matButton","matAnchor"],features:[Cd],ngContentSelectors:$o,decls:8,vars:5,consts:[[1,"mat-mdc-button-persistent-ripple"],[1,"mdc-button__label"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(n,r){n&1&&(ry(Wo),Rd(0,"span",0),oy(1),pa(2,"span",1),oy(3,1),ha(),oy(4,2),Lv(5,qo,2,0,"div",2),Rd(6,"span",3)(7,"span",4)),n&2&&(Wd("mdc-button__ripple",!r._isFab)("mdc-fab__ripple",r._isFab),Sg(5),Pv(r.showProgress()?5:-1));},styles:[`.mat-mdc-button-base {
  text-decoration: none;
}
.mat-mdc-button-base .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
@media (hover: none) {
  .mat-mdc-button-base:hover > span.mat-mdc-button-persistent-ripple::before {
    opacity: 0;
  }
}

.mdc-button {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  border: none;
  outline: none;
  line-height: inherit;
  -webkit-appearance: none;
  overflow: visible;
  vertical-align: middle;
  background: transparent;
  padding: 0 8px;
}
.mdc-button::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.mdc-button:active {
  outline: none;
}
.mdc-button:hover {
  cursor: pointer;
}
.mdc-button:disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-button[hidden] {
  display: none;
}
.mdc-button .mdc-button__label {
  position: relative;
}

.mat-mdc-button {
  padding: 0 var(--mat-button-text-horizontal-padding, 12px);
  height: var(--mat-button-text-container-height, 40px);
  font-family: var(--mat-button-text-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-text-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-text-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-text-label-text-transform);
  font-weight: var(--mat-button-text-label-text-weight, var(--mat-sys-label-large-weight));
}
.mat-mdc-button, .mat-mdc-button .mdc-button__ripple {
  border-radius: var(--mat-button-text-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-button:not(:disabled) {
  color: var(--mat-button-text-label-text-color, var(--mat-sys-primary));
}
.mat-mdc-button[disabled], .mat-mdc-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-text-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-button:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding: 0 var(--mat-button-text-with-icon-horizontal-padding, 16px);
}
.mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
[dir=rtl] .mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
.mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
.mat-mdc-button .mat-ripple-element {
  background-color: var(--mat-button-text-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-text-touch-target-size, 48px);
  display: var(--mat-button-text-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-unelevated-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-filled-container-height, 40px);
  font-family: var(--mat-button-filled-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-filled-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-filled-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-filled-label-text-transform);
  font-weight: var(--mat-button-filled-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-filled-horizontal-padding, 24px);
}
.mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
.mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
.mat-mdc-unelevated-button .mat-ripple-element {
  background-color: var(--mat-button-filled-ripple-color, color-mix(in srgb, var(--mat-sys-on-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-state-layer-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-unelevated-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-unelevated-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-unelevated-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-unelevated-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-filled-touch-target-size, 48px);
  display: var(--mat-button-filled-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-unelevated-button:not(:disabled) {
  color: var(--mat-button-filled-label-text-color, var(--mat-sys-on-primary));
  background-color: var(--mat-button-filled-container-color, var(--mat-sys-primary));
}
.mat-mdc-unelevated-button, .mat-mdc-unelevated-button .mdc-button__ripple {
  border-radius: var(--mat-button-filled-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-unelevated-button .mat-mdc-button-progress-indicator-container {
  --mat-progress-spinner-active-indicator-color: var(--mat-button-filled-progress-active-indicator-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button[disabled], .mat-mdc-unelevated-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-filled-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-filled-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-raised-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--mat-button-protected-container-elevation-shadow, var(--mat-sys-level1));
  height: var(--mat-button-protected-container-height, 40px);
  font-family: var(--mat-button-protected-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-protected-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-protected-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-protected-label-text-transform);
  font-weight: var(--mat-button-protected-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-protected-horizontal-padding, 24px);
}
.mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
.mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
.mat-mdc-raised-button .mat-ripple-element {
  background-color: var(--mat-button-protected-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-raised-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-raised-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-raised-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-raised-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-raised-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-protected-touch-target-size, 48px);
  display: var(--mat-button-protected-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-raised-button:not(:disabled) {
  color: var(--mat-button-protected-label-text-color, var(--mat-sys-primary));
  background-color: var(--mat-button-protected-container-color, var(--mat-sys-surface));
}
.mat-mdc-raised-button, .mat-mdc-raised-button .mdc-button__ripple {
  border-radius: var(--mat-button-protected-container-shape, var(--mat-sys-corner-full));
}
@media (hover: hover) {
  .mat-mdc-raised-button:hover {
    box-shadow: var(--mat-button-protected-hover-container-elevation-shadow, var(--mat-sys-level2));
  }
}
.mat-mdc-raised-button:focus {
  box-shadow: var(--mat-button-protected-focus-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button:active, .mat-mdc-raised-button:focus:active {
  box-shadow: var(--mat-button-protected-pressed-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button[disabled], .mat-mdc-raised-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-protected-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-protected-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-raised-button[disabled].mat-mdc-button-disabled, .mat-mdc-raised-button.mat-mdc-button-disabled.mat-mdc-button-disabled {
  box-shadow: var(--mat-button-protected-disabled-container-elevation-shadow, var(--mat-sys-level0));
}
.mat-mdc-raised-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-outlined-button {
  border-style: solid;
  transition: border 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-outlined-container-height, 40px);
  font-family: var(--mat-button-outlined-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-outlined-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-outlined-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-outlined-label-text-transform);
  font-weight: var(--mat-button-outlined-label-text-weight, var(--mat-sys-label-large-weight));
  border-radius: var(--mat-button-outlined-container-shape, var(--mat-sys-corner-full));
  border-width: var(--mat-button-outlined-outline-width, 1px);
  padding: 0 var(--mat-button-outlined-horizontal-padding, 24px);
}
.mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
.mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
.mat-mdc-outlined-button .mat-ripple-element {
  background-color: var(--mat-button-outlined-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-outlined-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-outlined-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-outlined-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-outlined-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-outlined-touch-target-size, 48px);
  display: var(--mat-button-outlined-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-outlined-button:not(:disabled) {
  color: var(--mat-button-outlined-label-text-color, var(--mat-sys-primary));
  border-color: var(--mat-button-outlined-outline-color, var(--mat-sys-outline));
}
.mat-mdc-outlined-button[disabled], .mat-mdc-outlined-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-outlined-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: var(--mat-button-outlined-disabled-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-tonal-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-tonal-container-height, 40px);
  font-family: var(--mat-button-tonal-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-tonal-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-tonal-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-tonal-label-text-transform);
  font-weight: var(--mat-button-tonal-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-tonal-horizontal-padding, 24px);
}
.mat-tonal-button:not(:disabled) {
  color: var(--mat-button-tonal-label-text-color, var(--mat-sys-on-secondary-container));
  background-color: var(--mat-button-tonal-container-color, var(--mat-sys-secondary-container));
}
.mat-tonal-button, .mat-tonal-button .mdc-button__ripple {
  border-radius: var(--mat-button-tonal-container-shape, var(--mat-sys-corner-full));
}
.mat-tonal-button[disabled], .mat-tonal-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-tonal-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-tonal-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-tonal-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
[dir=rtl] .mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
.mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
[dir=rtl] .mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
.mat-tonal-button .mat-ripple-element {
  background-color: var(--mat-button-tonal-ripple-color, color-mix(in srgb, var(--mat-sys-on-secondary-container) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-state-layer-color, var(--mat-sys-on-secondary-container));
}
.mat-tonal-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-tonal-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-tonal-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-tonal-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-tonal-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-tonal-touch-target-size, 48px);
  display: var(--mat-button-tonal-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-button,
.mat-mdc-unelevated-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button,
.mat-tonal-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-button .mdc-button__label,
.mat-mdc-button .mat-icon,
.mat-mdc-unelevated-button .mdc-button__label,
.mat-mdc-unelevated-button .mat-icon,
.mat-mdc-raised-button .mdc-button__label,
.mat-mdc-raised-button .mat-icon,
.mat-mdc-outlined-button .mdc-button__label,
.mat-mdc-outlined-button .mat-icon,
.mat-tonal-button .mdc-button__label,
.mat-tonal-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-button .mat-focus-indicator,
.mat-mdc-unelevated-button .mat-focus-indicator,
.mat-mdc-raised-button .mat-focus-indicator,
.mat-mdc-outlined-button .mat-focus-indicator,
.mat-tonal-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-unelevated-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-raised-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-outlined-button:focus-visible > .mat-focus-indicator::before,
.mat-tonal-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-button._mat-animation-noopable,
.mat-mdc-unelevated-button._mat-animation-noopable,
.mat-mdc-raised-button._mat-animation-noopable,
.mat-mdc-outlined-button._mat-animation-noopable,
.mat-tonal-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-button > .mat-icon,
.mat-mdc-unelevated-button > .mat-icon,
.mat-mdc-raised-button > .mat-icon,
.mat-mdc-outlined-button > .mat-icon,
.mat-tonal-button > .mat-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 1.125rem;
  height: 1.125rem;
  width: 1.125rem;
}

.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mdc-button__ripple {
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
}

.mat-mdc-unelevated-button .mat-focus-indicator::before,
.mat-tonal-button .mat-focus-indicator::before,
.mat-mdc-raised-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-outlined-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon,
.mat-mdc-button-progress-indicator-shown [matButtonIcon],
.mat-mdc-button-progress-indicator-shown .mdc-button__label {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return i})();function Ko(i){return i.hasAttribute("mat-raised-button")?"elevated":i.hasAttribute("mat-stroked-button")?"outlined":i.hasAttribute("mat-flat-button")?"filled":i.hasAttribute("mat-button")?"text":null}var Bl=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({imports:[cr,At]})}return i})();function dr(i){return Error(`Unable to find icon with the name "${i}"`)}function Zo(){return Error("Could not find HttpClient for use with Angular Material icons. Please add provideHttpClient() to your providers.")}function ur(i){return Error(`The URL provided to MatIconRegistry was not trusted as a resource URL via Angular's DomSanitizer. Attempted URL was "${i}".`)}function mr(i){return Error(`The literal provided to MatIconRegistry was not trusted as safe HTML by Angular's DomSanitizer. Attempted literal was "${i}".`)}var z=class{url;svgText;options;svgElement=null;constructor(e,t,n){this.url=e,this.svgText=t,this.options=n;}},fr=(()=>{class i{_httpClient;_sanitizer;_errorHandler;_document;_svgIconConfigs=new Map;_iconSetConfigs=new Map;_cachedIconsByUrl=new Map;_inProgressUrlFetches=new Map;_fontCssClassesByAlias=new Map;_resolvers=[];_defaultFontSetClass=["material-icons","mat-ligature-font"];constructor(t,n,r,o){this._httpClient=t,this._sanitizer=n,this._errorHandler=o,this._document=r;}addSvgIcon(t,n,r){return this.addSvgIconInNamespace("",t,n,r)}addSvgIconLiteral(t,n,r){return this.addSvgIconLiteralInNamespace("",t,n,r)}addSvgIconInNamespace(t,n,r,o){return this._addSvgIconConfig(t,n,new z(r,null,o))}addSvgIconResolver(t){return this._resolvers.push(t),this}addSvgIconLiteralInNamespace(t,n,r,o){let a=this._sanitizer.sanitize(fo$1.HTML,r);if(!a)throw mr(r);let c=rt(a);return this._addSvgIconConfig(t,n,new z("",c,o))}addSvgIconSet(t,n){return this.addSvgIconSetInNamespace("",t,n)}addSvgIconSetLiteral(t,n){return this.addSvgIconSetLiteralInNamespace("",t,n)}addSvgIconSetInNamespace(t,n,r){return this._addSvgIconSetConfig(t,new z(n,null,r))}addSvgIconSetLiteralInNamespace(t,n,r){let o=this._sanitizer.sanitize(fo$1.HTML,n);if(!o)throw mr(n);let a=rt(o);return this._addSvgIconSetConfig(t,new z("",a,r))}registerFontClassAlias(t,n=t){return this._fontCssClassesByAlias.set(t,n),this}classNameForFontAlias(t){return this._fontCssClassesByAlias.get(t)||t}setDefaultFontSetClass(...t){return this._defaultFontSetClass=t,this}getDefaultFontSetClass(){return this._defaultFontSetClass}getSvgIconFromUrl(t){let n=this._sanitizer.sanitize(fo$1.RESOURCE_URL,t);if(!n)throw ur(t);let r=this._cachedIconsByUrl.get(n);return r?Fe(xe(r)):this._loadSvgIconFromConfig(new z(t,null)).pipe($n(o=>this._cachedIconsByUrl.set(n,o)),V(o=>xe(o)))}getNamedSvgIcon(t,n=""){let r=hr(n,t),o=this._svgIconConfigs.get(r);if(o)return this._getSvgFromConfig(o);if(o=this._getIconConfigFromResolvers(n,t),o)return this._svgIconConfigs.set(r,o),this._getSvgFromConfig(o);let a=this._iconSetConfigs.get(n);return a?this._getSvgFromIconSetConfigs(t,a):Er$1(dr(r))}ngOnDestroy(){this._resolvers=[],this._svgIconConfigs.clear(),this._iconSetConfigs.clear(),this._cachedIconsByUrl.clear();}_getSvgFromConfig(t){return t.svgText?Fe(xe(this._svgElementFromConfig(t))):this._loadSvgIconFromConfig(t).pipe(V(n=>xe(n)))}_getSvgFromIconSetConfigs(t,n){let r=this._extractIconWithNameFromAnySet(t,n);if(r)return Fe(r);let o=n.filter(a=>!a.svgText).map(a=>this._loadSvgIconSetFromConfig(a).pipe(Et$1(c=>{let b=`Loading icon set URL: ${this._sanitizer.sanitize(fo$1.RESOURCE_URL,a.url)} failed: ${c.message}`;return this._errorHandler.handleError(new Error(b)),Fe(null)})));return ho$1(o).pipe(V(()=>{let a=this._extractIconWithNameFromAnySet(t,n);if(!a)throw dr(t);return a}))}_extractIconWithNameFromAnySet(t,n){for(let r=n.length-1;r>=0;r--){let o=n[r];if(o.svgText&&o.svgText.toString().indexOf(t)>-1){let a=this._svgElementFromConfig(o),c=this._extractSvgIconFromSet(a,t,o.options);if(c)return c}}return null}_loadSvgIconFromConfig(t){return this._fetchIcon(t).pipe($n(n=>t.svgText=n),V(()=>this._svgElementFromConfig(t)))}_loadSvgIconSetFromConfig(t){return t.svgText?Fe(null):this._fetchIcon(t).pipe($n(n=>t.svgText=n))}_extractSvgIconFromSet(t,n,r){let o=t.querySelector(`[id="${n}"]`);if(!o)return null;let a=o.cloneNode(true);if(a.removeAttribute("id"),a.nodeName.toLowerCase()==="svg")return this._setSvgAttributes(a,r);if(a.nodeName.toLowerCase()==="symbol")return this._setSvgAttributes(this._toSvgElement(a),r);let c=this._svgElementFromString(rt("<svg></svg>"));return c.appendChild(a),this._setSvgAttributes(c,r)}_svgElementFromString(t){let n=this._document.createElement("DIV");n.innerHTML=t;let r=n.querySelector("svg");if(!r)throw Error("<svg> tag not found");return r}_toSvgElement(t){let n=this._svgElementFromString(rt("<svg></svg>")),r=t.attributes;for(let o=0;o<r.length;o++){let{name:a,value:c}=r[o];a!=="id"&&n.setAttribute(a,c);}for(let o=0;o<t.childNodes.length;o++)t.childNodes[o].nodeType===this._document.ELEMENT_NODE&&n.appendChild(t.childNodes[o].cloneNode(true));return n}_setSvgAttributes(t,n){return t.setAttribute("fit",""),t.setAttribute("height","100%"),t.setAttribute("width","100%"),t.setAttribute("preserveAspectRatio","xMidYMid meet"),t.setAttribute("focusable","false"),n&&n.viewBox&&t.setAttribute("viewBox",n.viewBox),t}_fetchIcon(t){let{url:n,options:r}=t,o=r?.withCredentials??false;if(!this._httpClient)throw Zo();if(n==null)throw Error(`Cannot fetch icon from URL "${n}".`);let a=this._sanitizer.sanitize(fo$1.RESOURCE_URL,n);if(!a)throw ur(n);let c=this._inProgressUrlFetches.get(a);if(c)return c;let m=this._httpClient.get(a,{responseType:"text",withCredentials:o}).pipe(V(b=>rt(b)),nn$1(()=>this._inProgressUrlFetches.delete(a)),Br$1());return this._inProgressUrlFetches.set(a,m),m}_addSvgIconConfig(t,n,r){return this._svgIconConfigs.set(hr(t,n),r),this}_addSvgIconSetConfig(t,n){let r=this._iconSetConfigs.get(t);return r?r.push(n):this._iconSetConfigs.set(t,[n]),this}_svgElementFromConfig(t){if(!t.svgElement){let n=this._svgElementFromString(t.svgText);this._setSvgAttributes(n,t.options),t.svgElement=n;}return t.svgElement}_getIconConfigFromResolvers(t,n){for(let r=0;r<this._resolvers.length;r++){let o=this._resolvers[r](n,t);if(o)return Yo(o)?new z(o.url,null,o.options):new z(o,null)}}static \u0275fac=function(n){return new(n||i)(he$1(Ot$1,8),he$1(Tr$1),he$1(Cn,8),he$1(He$1))};static \u0275prov=z$1({token:i,factory:i.\u0275fac,providedIn:"root"})}return i})();function xe(i){return i.cloneNode(true)}function hr(i,e){return i+":"+e}function Yo(i){return !!(i.url&&i.options)}var Xo=["*"],Qo=new T("MAT_ICON_DEFAULT_OPTIONS"),Jo=new T("mat-icon-location",{providedIn:"root",factory:()=>{let i=y(Cn),e=i?i.location:null;return {getPathname:()=>e?e.pathname+e.search:""}}}),pr=["clip-path","color-profile","src","cursor","fill","filter","marker","marker-start","marker-mid","marker-end","mask","stroke"],ta=pr.map(i=>`[${i}]`).join(", "),ea=/^url\(['"]?#(.*?)['"]?\)$/,ad=(()=>{class i{_elementRef=y(jn);_iconRegistry=y(fr);_location=y(Jo);_errorHandler=y(He$1);_defaultColor;get color(){return this._color||this._defaultColor}set color(t){this._color=t;}_color;inline=false;get svgIcon(){return this._svgIcon}set svgIcon(t){t!==this._svgIcon&&(t?this._updateSvgIcon(t):this._svgIcon&&this._clearSvgElement(),this._svgIcon=t);}_svgIcon;get fontSet(){return this._fontSet}set fontSet(t){let n=this._cleanupFontValue(t);n!==this._fontSet&&(this._fontSet=n,this._updateFontIconClasses());}_fontSet;get fontIcon(){return this._fontIcon}set fontIcon(t){let n=this._cleanupFontValue(t);n!==this._fontIcon&&(this._fontIcon=n,this._updateFontIconClasses());}_fontIcon;_previousFontSetClass=[];_previousFontIconClass;_svgName=null;_svgNamespace=null;_previousPath;_elementsWithExternalReferences;_currentIconFetch=I$1.EMPTY;constructor(){let t=y(new hf("aria-hidden"),{optional:true}),n=y(Qo,{optional:true});n&&(n.color&&(this.color=this._defaultColor=n.color),n.fontSet&&(this.fontSet=n.fontSet)),t||this._elementRef.nativeElement.setAttribute("aria-hidden","true");}_splitIconName(t){if(!t)return ["",""];let n=t.split(":");switch(n.length){case 1:return ["",n[0]];case 2:return n;default:throw Error(`Invalid icon name: "${t}"`)}}ngOnInit(){this._updateFontIconClasses();}ngAfterViewChecked(){let t=this._elementsWithExternalReferences;if(t&&t.size){let n=this._location.getPathname();n!==this._previousPath&&(this._previousPath=n,this._prependPathToReferences(n));}}ngOnDestroy(){this._currentIconFetch.unsubscribe(),this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();}_usingFontIcon(){return !this.svgIcon}_setSvgElement(t){this._clearSvgElement();let n=this._location.getPathname();this._previousPath=n,this._cacheChildrenWithExternalReferences(t),this._prependPathToReferences(n),this._elementRef.nativeElement.appendChild(t);}_clearSvgElement(){let t=this._elementRef.nativeElement,n=t.childNodes.length;for(this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();n--;){let r=t.childNodes[n];(r.nodeType!==1||r.nodeName.toLowerCase()==="svg")&&r.remove();}}_updateFontIconClasses(){if(!this._usingFontIcon())return;let t=this._elementRef.nativeElement,n=(this.fontSet?this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/):this._iconRegistry.getDefaultFontSetClass()).filter(r=>r.length>0);this._previousFontSetClass.forEach(r=>t.classList.remove(r)),n.forEach(r=>t.classList.add(r)),this._previousFontSetClass=n,this.fontIcon!==this._previousFontIconClass&&!n.includes("mat-ligature-font")&&(this._previousFontIconClass&&t.classList.remove(this._previousFontIconClass),this.fontIcon&&t.classList.add(this.fontIcon),this._previousFontIconClass=this.fontIcon);}_cleanupFontValue(t){return typeof t=="string"?t.trim().split(" ")[0]:t}_prependPathToReferences(t){let n=this._elementsWithExternalReferences;n&&n.forEach((r,o)=>{r.forEach(a=>{o.setAttribute(a.name,`url('${t}#${a.value}')`);});});}_cacheChildrenWithExternalReferences(t){let n=t.querySelectorAll(ta),r=this._elementsWithExternalReferences=this._elementsWithExternalReferences||new Map;for(let o=0;o<n.length;o++)pr.forEach(a=>{let c=n[o],m=c.getAttribute(a),b=m?m.match(ea):null;if(b){let p=r.get(c);p||(p=[],r.set(c,p)),p.push({name:a,value:b[1]});}});}_updateSvgIcon(t){if(this._svgNamespace=null,this._svgName=null,this._currentIconFetch.unsubscribe(),t){let[n,r]=this._splitIconName(t);n&&(this._svgNamespace=n),r&&(this._svgName=r),this._currentIconFetch=this._iconRegistry.getNamedSvgIcon(r,n).pipe(ee(1)).subscribe(o=>this._setSvgElement(o),o=>{let a=`Error retrieving icon ${n}:${r}! ${o.message}`;this._errorHandler.handleError(new Error(a));});}}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=lv({type:i,selectors:[["mat-icon"]],hostAttrs:["role","img",1,"mat-icon","notranslate"],hostVars:10,hostBindings:function(n,r){n&2&&(bd("data-mat-icon-type",r._usingFontIcon()?"font":"svg")("data-mat-icon-name",r._svgName||r.fontIcon)("data-mat-icon-namespace",r._svgNamespace||r.fontSet)("fontIcon",r._usingFontIcon()?r.fontIcon:null),Ey(r.color?"mat-"+r.color:""),Wd("mat-icon-inline",r.inline)("mat-icon-no-color",r.color!=="primary"&&r.color!=="accent"&&r.color!=="warn"));},inputs:{color:"color",inline:[2,"inline","inline",gS],svgIcon:"svgIcon",fontSet:"fontSet",fontIcon:"fontIcon"},exportAs:["matIcon"],ngContentSelectors:Xo,decls:1,vars:0,template:function(n,r){n&1&&(ry(),oy(0));},styles:[`mat-icon, mat-icon.mat-primary, mat-icon.mat-accent, mat-icon.mat-warn {
  color: var(--mat-icon-color, inherit);
}

.mat-icon {
  -webkit-user-select: none;
  user-select: none;
  background-repeat: no-repeat;
  display: inline-block;
  fill: currentColor;
  height: 24px;
  width: 24px;
  overflow: hidden;
}
.mat-icon.mat-icon-inline {
  font-size: inherit;
  height: inherit;
  line-height: inherit;
  width: inherit;
}
.mat-icon.mat-ligature-font[fontIcon]::before {
  content: attr(fontIcon);
}

[dir=rtl] .mat-icon-rtl-mirror {
  transform: scale(-1, 1);
}

.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon {
  display: block;
}
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon {
  margin: auto;
}
`],encapsulation:2})}return i})(),sd=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({imports:[At]})}return i})();function vd(i){i||(i=y(Ae$1));let e=new h(t=>{if(i.destroyed){t.next();return}return i.onDestroy(t.next.bind(t))});return t=>t.pipe(Yn$1(e))}function _d(i){return mC(s(r({},i),{loader:void 0,stream:e=>{let t,n=false,r=Ee$1({value:void 0}),{resolve:o,promise:a}=Hc(),c=false;function m(){c||(c=true,o(r));}let b=()=>{n=true,t?.unsubscribe(),e.abortSignal.removeEventListener("abort",b),m();};e.abortSignal.addEventListener("abort",b);function p(X){r.set(X),m();}let wt=i.stream;if(wt===void 0)throw new E(990,false);return t=wt(e).subscribe({next:X=>p({value:X}),error:X=>{p({error:Na(X)}),e.abortSignal.removeEventListener("abort",b);},complete:()=>{c||p({error:new E(991,false)}),e.abortSignal.removeEventListener("abort",b);}}),n&&t.unsubscribe(),c?r:a}}))}export{$i as $,Aa as A,Bl as B,Ca as C,Rr as D,Et as E,he as F,Go as G,H,I,it as J,Do as K,Ll as L,on as M,jc as N,Ec as O,Ce as P,Kc as Q,Re as R,rr as S,ye as T,Uo as U,Vr as V,Kr as W,Xr as X,cn as Y,Z,_a as _,ad as a,P as a0,Li as a1,kc as a2,j as a3,$c as a4,rn as a5,Vc as a6,Sc as a7,Nc as a8,Bt as a9,No as aa,vd as ab,Ut as ac,Ea as b,no as c,dn as d,At as e,sl as f,nn as g,cr as h,ie as i,Rt as j,kt as k,ln as l,Io as m,ni as n,or as o,pn as p,Ao as q,ro as r,sd as s,to as t,mo as u,va as v,ws as w,ao as x,tn as y,_d as z};