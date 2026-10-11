import {y as y$1}from'./chunk-DAVHGyGz.js';import {D as Dn,a as Dt,d as dt,r as rt$1,_ as _n$1,x as xn,s as st,o as ot$1}from'./chunk-BuKF1IET.js';import {Y as Yt,m as mt}from'./chunk-CWb4dNle.js';import {y,F,i as Ee,c as Fi,l as lv,U as Ut,a as aa$1,j as br,$ as $t,k as ta$1,m as kt,N as Nt,b as ao,d as Fd,A as Ay,f as fa$1,L as Lv,S as Sg,P as Pv,n as J,o as g,q as ae,s as Un,T,r,u as s,C as Ct,v as u,I as Im,e as Ad,w as va$2,x as xd,D as Dm,B as dv,G as tc,H as Ee$1,Y as Yn,K as Cd,M as gS,O as ry,Q as oy,W as Wd,R as bd,V as Gd,X as Hd,Z as sy,_ as ay,a0 as Vd,a1 as jn,a2 as Ye,a3 as hf,a4 as mS,a5 as fS,a6 as zr,a7 as we,a8 as re$1,a9 as Eo,aa as og,ab as Md,ac as By,ad as Cn,ae as I$1,af as pm,ag as hv,g as ty,J as Jd,ah as ee$1,ai as Rn,aj as se$1,ak as D,al as Wp,am as wd,an as Ld,ao as H$1,ap as Fe,aq as $o,ar as T$2,as as h,at as Ln,au as W$1,av as Fc,aw as Do,ax as _m,ay as Wv,p as pa$1,az as jd,aA as Mc,aB as Nc,h as ha$1,aC as Ey,aD as _p,aE as Iv,aF as Wy,aG as ly,aH as Zy,aI as ef,aJ as Qy,aK as Xd,aL as Vv,aM as jv,aN as Hv}from'./main-VSBDFCJK.js';import {C as Ci$1,v as vi$1,j}from'./chunk-ky3N0EV-.js';import'./chunk-DyD8Tc-X.js';import {I,W as We,$ as $e}from'./chunk-Lp4ERQAL.js';import {o as oe,g as ge$1,w as wt$1,Y as Yt$1,K as Kt,n as ne,P as Pt$1,X,s as st$1,v as vt,W,C as Ce,T as T$1,x as xt,J as J$1,k as kt$2,h as he}from'./chunk-5rtBovmt.js';import'./chunk-BgxUG1w0.js';import {b as bn,_ as _n,a as an,L as Le,r as rn,D as De}from'./chunk-_f2wotTk.js';import {B as Bl,L as Ll,U as Uo,s as sd,a as ad,d as dn,E as Et$1,b as Ea,R as Re,A as Aa,C as Ca$1,n as ni,v as va$1,_ as _a$1,r as ro,c as no,e as At$1,f as sl,w as ws,g as nn,H,o as or,p as pn,h as cr,l as ln,$ as $i,j as Rt$1,k as kt$1,G as Go,I as I$2,m as Io,q as Ao,u as mo,x as ao$1,y as tn}from'./chunk-BXpYJh_O.js';var wt=["*"];var ki=["tabListContainer"],Ti=["tabList"],Ii=["tabListInner"],wi=["nextPaginator"],Ei=["previousPaginator"];var Tt="mdc-tab-indicator--active",ii="mdc-tab-indicator--no-transition",It=class{_items;_currentItem;constructor(s){this._items=s;}hide(){this._items.forEach(s=>s.deactivateInkBar()),this._currentItem=void 0;}alignToElement(s){let e=this._items.find(n=>n.elementRef.nativeElement===s),t=this._currentItem;if(e!==t&&(t?.deactivateInkBar(),e)){let n=t?.elementRef.nativeElement.getBoundingClientRect?.();e.activateInkBar(n),this._currentItem=e;}}},Pi=(()=>{class i{_elementRef=y(jn);_inkBarElement=null;_inkBarContentElement=null;_fitToContent=false;get fitInkBarToContent(){return this._fitToContent}set fitInkBarToContent(e){this._fitToContent!==e&&(this._fitToContent=e,this._inkBarElement&&this._appendInkBarElement());}activateInkBar(e){let t=this._elementRef.nativeElement;if(!e||!t.getBoundingClientRect||!this._inkBarContentElement){t.classList.add(Tt);return}let n=t.getBoundingClientRect(),o=e.width/n.width,c=e.left-n.left;t.classList.add(ii),this._inkBarContentElement.style.setProperty("transform",`translateX(${c}px) scaleX(${o})`),t.getBoundingClientRect(),t.classList.remove(ii),t.classList.add(Tt),this._inkBarContentElement.style.setProperty("transform","");}deactivateInkBar(){this._elementRef.nativeElement.classList.remove(Tt);}ngOnInit(){this._createInkBarElement();}ngOnDestroy(){this._inkBarElement?.remove(),this._inkBarElement=this._inkBarContentElement=null;}_createInkBarElement(){let e=this._elementRef.nativeElement.ownerDocument||document,t=this._inkBarElement=e.createElement("span"),n=this._inkBarContentElement=e.createElement("span");t.className="mdc-tab-indicator",n.className="mdc-tab-indicator__content mdc-tab-indicator__content--underline",t.appendChild(this._inkBarContentElement),this._appendInkBarElement();}_appendInkBarElement(){this._inkBarElement;let e=this._fitToContent?this._elementRef.nativeElement.querySelector(".mdc-tab__content"):this._elementRef.nativeElement;e.appendChild(this._inkBarElement);}static \u0275fac=function(t){return new(t||i)};static \u0275dir=hv({type:i,inputs:{fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",gS]}})}return i})();var ai={passive:true},Si=650,Ai=100;function Ri(i){let s=i+"";return /^[0-9]+(?:\.[0-9]+)?$/.test(s)?`${i}ms`:/^[0-9]+(?:\.[0-9]+)?(?:ms|s)$/.test(s)?s:""}var Oi=(()=>{class i{_elementRef=y(jn);_changeDetectorRef=y(fS);_viewportRuler=y(T$1);_dir=y(Go,{optional:true});_ngZone=y(H$1);_platform=y(I$2);_sharedResizeObserver=y(De);_injector=y(J);_renderer=y(pm);_animationsDisabled=Et$1();_eventCleanups;_scrollDistance=0;_selectedIndexChanged=false;_destroyed=new g;_showPaginationControls=false;_disableScrollAfter=true;_disableScrollBefore=true;_tabLabelCount;_scrollDistanceChanged=false;_keyManager;_currentTextContent;_stopScrolling=new g;disablePagination=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){let t=isNaN(e)?0:e;this._selectedIndex!=t&&(this._selectedIndexChanged=true,this._selectedIndex=t,this._keyManager&&this._keyManager.updateActiveItem(t));}_selectedIndex=0;selectFocusedIndex=new we;indexFocused=new we;constructor(){this._eventCleanups=this._ngZone.runOutsideAngular(()=>[this._renderer.listen(this._elementRef.nativeElement,"mouseleave",()=>this._stopInterval())]);}ngAfterViewInit(){this._eventCleanups.push(this._renderer.listen(this._previousPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("before"),ai),this._renderer.listen(this._nextPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("after"),ai));}ngAfterContentInit(){let e=this._dir?this._dir.change:Fe("ltr"),t=this._sharedResizeObserver.observe(this._elementRef.nativeElement).pipe($o(32),Yn(this._destroyed)),n=this._viewportRuler.change(150).pipe(Yn(this._destroyed)),o=()=>{this.updatePagination(),this._alignInkBarToSelectedTab();};this._keyManager=new ln(this._items).withHorizontalOrientation(this._getLayoutDirection()).withHomeAndEnd().withWrap().skipPredicate(()=>false),this._keyManager.updateActiveItem(Math.max(this._selectedIndex,0)),og(o,{injector:this._injector}),Eo(e,n,t,this._items.changes,this._itemsResized()).pipe(Yn(this._destroyed)).subscribe(()=>{this._ngZone.run(()=>{Promise.resolve().then(()=>{this._scrollDistance=Math.max(0,Math.min(this._getMaxScrollDistance(),this._scrollDistance)),o();});}),this._keyManager?.withHorizontalOrientation(this._getLayoutDirection());}),this._keyManager.change.subscribe(c=>{this.indexFocused.emit(c),this._setTabFocus(c);});}_itemsResized(){return typeof ResizeObserver!="function"?T$2:this._items.changes.pipe(Un(this._items),re$1(e=>new h(t=>this._ngZone.runOutsideAngular(()=>{let n=new ResizeObserver(o=>t.next(o));return e.forEach(o=>n.observe(o.elementRef.nativeElement)),()=>{n.disconnect();}}))),Ln(1),D(e=>e.some(t=>t.contentRect.width>0&&t.contentRect.height>0)))}ngAfterContentChecked(){this._tabLabelCount!=this._items.length&&(this.updatePagination(),this._tabLabelCount=this._items.length,this._changeDetectorRef.markForCheck()),this._selectedIndexChanged&&(this._scrollToLabel(this._selectedIndex),this._checkScrollingControls(),this._alignInkBarToSelectedTab(),this._selectedIndexChanged=false,this._changeDetectorRef.markForCheck()),this._scrollDistanceChanged&&(this._updateTabScrollPosition(),this._scrollDistanceChanged=false,this._changeDetectorRef.markForCheck());}ngOnDestroy(){this._eventCleanups.forEach(e=>e()),this._keyManager?.destroy(),this._destroyed.next(),this._destroyed.complete(),this._stopScrolling.complete();}_handleKeydown(e){if(!$i(e))switch(e.keyCode){case 13:case 32:if(this.focusIndex!==this.selectedIndex){let t=this._items.get(this.focusIndex);t&&!t.disabled&&(this.selectFocusedIndex.emit(this.focusIndex),this._itemSelected(e));}break;default:this._keyManager?.onKeydown(e);}}_onContentChanges(){let e=this._elementRef.nativeElement.textContent;e!==this._currentTextContent&&(this._currentTextContent=e||"",this._ngZone.run(()=>{this.updatePagination(),this._alignInkBarToSelectedTab(),this._changeDetectorRef.markForCheck();}));}updatePagination(){this._checkPaginationEnabled(),this._checkScrollingControls(),this._updateTabScrollPosition();}get focusIndex(){return this._keyManager?this._keyManager.activeItemIndex:0}set focusIndex(e){!this._isValidIndex(e)||this.focusIndex===e||!this._keyManager||this._keyManager.setActiveItem(e);}_isValidIndex(e){return this._items?!!this._items.toArray()[e]:true}_setTabFocus(e){if(this._showPaginationControls&&this._scrollToLabel(e),this._items&&this._items.length){this._items.toArray()[e].focus();let t=this._tabListContainer.nativeElement;this._getLayoutDirection()=="ltr"?t.scrollLeft=0:t.scrollLeft=t.scrollWidth-t.offsetWidth;}}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_updateTabScrollPosition(){if(this.disablePagination)return;let e=this.scrollDistance,t=this._getLayoutDirection()==="ltr"?-e:e;this._tabList.nativeElement.style.transform=`translateX(${Math.round(t)}px)`,(this._platform.TRIDENT||this._platform.EDGE)&&(this._tabListContainer.nativeElement.scrollLeft=0);}get scrollDistance(){return this._scrollDistance}set scrollDistance(e){this._scrollTo(e);}_scrollHeader(e){let t=this._tabListContainer.nativeElement.offsetWidth,n=(e=="before"?-1:1)*t/3;return this._scrollTo(this._scrollDistance+n)}_handlePaginatorClick(e){this._stopInterval(),this._scrollHeader(e);}_scrollToLabel(e){if(this.disablePagination)return;let t=this._items?this._items.toArray()[e]:null;if(!t)return;let n=this._tabListContainer.nativeElement.offsetWidth,{offsetLeft:o,offsetWidth:c}=t.elementRef.nativeElement,u,b;this._getLayoutDirection()=="ltr"?(u=o,b=u+c):(b=this._tabListInner.nativeElement.offsetWidth-o,u=b-c);let _=this.scrollDistance,le=this.scrollDistance+n;u<_?this.scrollDistance-=_-u:b>le&&(this.scrollDistance+=Math.min(b-le,u-_));}_checkPaginationEnabled(){if(this.disablePagination)this._showPaginationControls=false;else {let e=this._tabListInner.nativeElement.scrollWidth,t=this._elementRef.nativeElement.offsetWidth,n=e-t>=5;n||(this.scrollDistance=0),n!==this._showPaginationControls&&(this._showPaginationControls=n,this._changeDetectorRef.markForCheck());}}_checkScrollingControls(){this.disablePagination?this._disableScrollAfter=this._disableScrollBefore=true:(this._disableScrollBefore=this.scrollDistance==0,this._disableScrollAfter=this.scrollDistance==this._getMaxScrollDistance(),this._changeDetectorRef.markForCheck());}_getMaxScrollDistance(){let e=this._tabListInner.nativeElement.scrollWidth,t=this._tabListContainer.nativeElement.offsetWidth;return e-t||0}_alignInkBarToSelectedTab(){let e=this._items&&this._items.length?this._items.toArray()[this.selectedIndex]:null,t=e?e.elementRef.nativeElement:null;t?this._inkBar.alignToElement(t):this._inkBar.hide();}_stopInterval(){this._stopScrolling.next();}_handlePaginatorPress(e,t){t&&t.button!=null&&t.button!==0||(this._stopInterval(),W$1(Si,Ai).pipe(Yn(Eo(this._stopScrolling,this._destroyed))).subscribe(()=>{let{maxScrollDistance:n,distance:o}=this._scrollHeader(e);(o===0||o>=n)&&this._stopInterval();}));}_scrollTo(e){if(this.disablePagination)return {maxScrollDistance:0,distance:0};let t=this._getMaxScrollDistance();return this._scrollDistance=Math.max(0,Math.min(t,e)),this._scrollDistanceChanged=true,this._checkScrollingControls(),{maxScrollDistance:t,distance:this._scrollDistance}}static \u0275fac=function(t){return new(t||i)};static \u0275dir=hv({type:i,inputs:{disablePagination:[2,"disablePagination","disablePagination",gS],selectedIndex:[2,"selectedIndex","selectedIndex",mS]},outputs:{selectFocusedIndex:"selectFocusedIndex",indexFocused:"indexFocused"}})}return i})();var Bi=new T("MAT_TABS_CONFIG");var Et=(()=>{class i extends Oi{_focusedItem=Ee(null);get fitInkBarToContent(){return this._fitInkBarToContent.value}set fitInkBarToContent(e){this._fitInkBarToContent.next(e),this._changeDetectorRef.markForCheck();}_fitInkBarToContent=new Ee$1(false);stretchTabs=true;animationDuration="";_items;get backgroundColor(){return this._backgroundColor}set backgroundColor(e){let t=this._elementRef.nativeElement.classList;t.remove("mat-tabs-with-background",`mat-background-${this.backgroundColor}`),e&&t.add("mat-tabs-with-background",`mat-background-${e}`),this._backgroundColor=e;}_backgroundColor;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e);}_disableRipple=Ee(false);color="primary";tabPanel;_tabListContainer;_tabList;_tabListInner;_nextPaginator;_previousPaginator;_inkBar;constructor(){let e=y(Bi,{optional:true});super(),this.disablePagination=e&&e.disablePagination!=null?e.disablePagination:false,this.fitInkBarToContent=e&&e.fitInkBarToContent!=null?e.fitInkBarToContent:false,this.stretchTabs=e&&e.stretchTabs!=null?e.stretchTabs:true;}_itemSelected(){}ngAfterContentInit(){this._inkBar=new It(this._items),this._items.changes.pipe(Un(null),Yn(this._destroyed)).subscribe(()=>this.updateActiveLink()),super.ngAfterContentInit(),this._keyManager.change.pipe(Un(null),Yn(this._destroyed)).subscribe(()=>this._focusedItem.set(this._keyManager?.activeItem||null));}ngAfterViewInit(){this.tabPanel,super.ngAfterViewInit();}updateActiveLink(){if(!this._items)return;let e=this._items.toArray();for(let t=0;t<e.length;t++)if(e[t].active){this.selectedIndex=t,this.tabPanel&&(this.tabPanel._activeTabId=e[t].id),this._focusedItem.set(e[t]),this._changeDetectorRef.markForCheck();return}this.selectedIndex=-1;}_getRole(){return this.tabPanel?"tablist":this._elementRef.nativeElement.getAttribute("role")}_hasFocus(e){return this._keyManager?.activeItem===e}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=lv({type:i,selectors:[["","mat-tab-nav-bar",""]],contentQueries:function(t,n,o){if(t&1&&Vd(o,Pt,5),t&2){let c;sy(c=ay())&&(n._items=c);}},viewQuery:function(t,n){if(t&1&&Hd(ki,7)(Ti,7)(Ii,7)(wi,5)(Ei,5),t&2){let o;sy(o=ay())&&(n._tabListContainer=o.first),sy(o=ay())&&(n._tabList=o.first),sy(o=ay())&&(n._tabListInner=o.first),sy(o=ay())&&(n._nextPaginator=o.first),sy(o=ay())&&(n._previousPaginator=o.first);}},hostAttrs:[1,"mat-mdc-tab-nav-bar","mat-mdc-tab-header"],hostVars:17,hostBindings:function(t,n){t&2&&(bd("role",n._getRole()),Gd("--mat-tab-header-animation-duration",n.animationDuration),Wd("mat-mdc-tab-header-pagination-controls-enabled",n._showPaginationControls)("mat-mdc-tab-header-rtl",n._getLayoutDirection()=="rtl")("mat-mdc-tab-nav-bar-stretch-tabs",n.stretchTabs)("mat-primary",n.color!=="warn"&&n.color!=="accent")("mat-accent",n.color==="accent")("mat-warn",n.color==="warn")("_mat-animation-noopable",n._animationsDisabled));},inputs:{fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",gS],stretchTabs:[2,"mat-stretch-tabs","stretchTabs",gS],animationDuration:[2,"animationDuration","animationDuration",Ri],backgroundColor:"backgroundColor",disableRipple:[2,"disableRipple","disableRipple",gS],color:"color",tabPanel:"tabPanel"},exportAs:["matTabNavBar","matTabNav"],features:[Cd],ngContentSelectors:wt,decls:13,vars:6,consts:[["previousPaginator",""],["tabListContainer",""],["tabList",""],["tabListInner",""],["nextPaginator",""],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-before",3,"click","mousedown","touchend","matRippleDisabled"],[1,"mat-mdc-tab-header-pagination-chevron"],[1,"mat-mdc-tab-link-container",3,"keydown"],[1,"mat-mdc-tab-list",3,"cdkObserveContent"],[1,"mat-mdc-tab-links"],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-after",3,"mousedown","click","touchend","matRippleDisabled"]],template:function(t,n){t&1&&(ry(),ao(0,"div",5,0),Fd("click",function(){return n._handlePaginatorClick("before")})("mousedown",function(c){return n._handlePaginatorPress("before",c)})("touchend",function(){return n._stopInterval()}),Ad(2,"div",6),fa$1(),ao(3,"div",7,1),Fd("keydown",function(c){return n._handleKeydown(c)}),ao(5,"div",8,2),Fd("cdkObserveContent",function(){return n._onContentChanges()}),ao(7,"div",9,3),oy(9),fa$1()()(),ao(10,"div",10,4),Fd("mousedown",function(c){return n._handlePaginatorPress("after",c)})("click",function(){return n._handlePaginatorClick("after")})("touchend",function(){return n._stopInterval()}),Ad(12,"div",6),fa$1()),t&2&&(Wd("mat-mdc-tab-header-pagination-disabled",n._disableScrollBefore),xd("matRippleDisabled",n._disableScrollBefore||n.disableRipple),Sg(10),Wd("mat-mdc-tab-header-pagination-disabled",n._disableScrollAfter),xd("matRippleDisabled",n._disableScrollAfter||n.disableRipple));},dependencies:[sl,ws],styles:[`.mdc-tab {
  min-width: 90px;
  padding: 0 24px;
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  box-sizing: border-box;
  border: none;
  outline: none;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  z-index: 1;
  touch-action: manipulation;
}

.mdc-tab__content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: inherit;
  pointer-events: none;
}

.mdc-tab__text-label {
  transition: 150ms color linear;
  display: inline-block;
  line-height: 1;
  z-index: 2;
}

.mdc-tab--active .mdc-tab__text-label {
  transition-delay: 100ms;
}

._mat-animation-noopable .mdc-tab__text-label {
  transition: none;
}

.mdc-tab-indicator {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.mdc-tab-indicator__content {
  transition: var(--mat-tab-header-animation-duration, 250ms) transform cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left;
  opacity: 0;
}

.mdc-tab-indicator__content--underline {
  align-self: flex-end;
  box-sizing: border-box;
  width: 100%;
  border-top-style: solid;
}

.mdc-tab-indicator--active .mdc-tab-indicator__content {
  opacity: 1;
}

._mat-animation-noopable .mdc-tab-indicator__content, .mdc-tab-indicator--no-transition .mdc-tab-indicator__content {
  transition: none;
}

.mat-mdc-tab-ripple.mat-mdc-tab-ripple {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
}

.mat-mdc-tab-header {
  display: flex;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.mdc-tab-indicator .mdc-tab-indicator__content {
  transition-duration: var(--mat-tab-header-animation-duration, 250ms);
}

.mat-mdc-tab-header-pagination {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: none;
  justify-content: center;
  align-items: center;
  min-width: 32px;
  cursor: pointer;
  z-index: 2;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  box-sizing: content-box;
  outline: 0;
}
.mat-mdc-tab-header-pagination::-moz-focus-inner {
  border: 0;
}
.mat-mdc-tab-header-pagination .mat-ripple-element {
  opacity: 0.12;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-header-pagination-controls-enabled .mat-mdc-tab-header-pagination {
  display: flex;
}

.mat-mdc-tab-header-pagination-before,
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after {
  padding-left: 4px;
}
.mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {
  transform: rotate(-135deg);
}

.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before,
.mat-mdc-tab-header-pagination-after {
  padding-right: 4px;
}
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {
  transform: rotate(45deg);
}

.mat-mdc-tab-header-pagination-chevron {
  border-style: solid;
  border-width: 2px 2px 0 0;
  height: 8px;
  width: 8px;
  border-color: var(--mat-tab-pagination-icon-color, var(--mat-sys-on-surface));
}

.mat-mdc-tab-header-pagination-disabled {
  box-shadow: none;
  cursor: default;
  pointer-events: none;
}
.mat-mdc-tab-header-pagination-disabled .mat-mdc-tab-header-pagination-chevron {
  opacity: 0.4;
}

.mat-mdc-tab-list {
  flex-grow: 1;
  position: relative;
  transition: transform 500ms cubic-bezier(0.35, 0, 0.25, 1);
}
._mat-animation-noopable .mat-mdc-tab-list {
  transition: none;
}

.mat-mdc-tab-links {
  display: flex;
  flex: 1 0 auto;
}
[mat-align-tabs=center] > .mat-mdc-tab-link-container .mat-mdc-tab-links {
  justify-content: center;
}
[mat-align-tabs=end] > .mat-mdc-tab-link-container .mat-mdc-tab-links {
  justify-content: flex-end;
}
.cdk-drop-list .mat-mdc-tab-links, .mat-mdc-tab-links.cdk-drop-list {
  min-height: var(--mat-tab-container-height, 48px);
}

.mat-mdc-tab-link-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  z-index: 1;
  border-bottom-style: solid;
  border-bottom-width: var(--mat-tab-divider-height, 1px);
  border-bottom-color: var(--mat-tab-divider-color, var(--mat-sys-surface-variant));
}

.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination {
  background-color: var(--mat-tab-background-color);
}
.mat-mdc-tab-nav-bar.mat-tabs-with-background.mat-primary > .mat-mdc-tab-link-container .mat-mdc-tab-link .mdc-tab__text-label {
  color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-nav-bar.mat-tabs-with-background.mat-primary > .mat-mdc-tab-link-container .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-nav-bar.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-link-container .mat-mdc-tab-link:not(.mdc-tab--active) .mdc-tab__text-label {
  color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-nav-bar.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-link-container .mat-mdc-tab-link:not(.mdc-tab--active) .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-focus-indicator::before, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-focus-indicator::before {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-ripple-element, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mdc-tab__ripple::before, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-ripple-element, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mdc-tab__ripple::before {
  background-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-mdc-tab-header-pagination-chevron, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron {
  color: var(--mat-tab-foreground-color);
}
`],encapsulation:2,changeDetection:1})}return i})(),Pt=(()=>{class i extends Pi{_tabNavBar=y(Et);elementRef=y(jn);_focusMonitor=y(nn);_destroyed=new g;_isActive=false;_tabIndex=Ye(()=>this._tabNavBar._focusedItem()===this?this.tabIndex:-1);get active(){return this._isActive}set active(e){e!==this._isActive&&(this._isActive=e,this._tabNavBar.updateActiveLink());}disabled=false;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e);}_disableRipple=Ee(false);tabIndex=0;rippleConfig;get rippleDisabled(){return this.disabled||this.disableRipple||this._tabNavBar.disableRipple||!!this.rippleConfig.disabled}id=y(dn).getId("mat-tab-link-");constructor(){super(),y(H).load(or);let e=y(pn,{optional:true}),t=y(new hf("tabindex"),{optional:true});this.rippleConfig=e||{},this.tabIndex=t==null?0:parseInt(t)||0,Et$1()&&(this.rippleConfig.animation={enterDuration:0,exitDuration:0}),this._tabNavBar._fitInkBarToContent.pipe(Yn(this._destroyed)).subscribe(n=>{this.fitInkBarToContent=n;});}focus(){this.elementRef.nativeElement.focus();}ngAfterViewInit(){this._focusMonitor.monitor(this.elementRef);}ngOnDestroy(){this._destroyed.next(),this._destroyed.complete(),super.ngOnDestroy(),this._focusMonitor.stopMonitoring(this.elementRef);}_handleFocus(){this._tabNavBar.focusIndex=this._tabNavBar._items.toArray().indexOf(this);}_handleKeydown(e){(e.keyCode===32||e.keyCode===13)&&(this.disabled?e.preventDefault():this._tabNavBar.tabPanel&&(e.keyCode===32&&e.preventDefault(),this.elementRef.nativeElement.click()));}_getAriaControls(){return this._tabNavBar.tabPanel?this._tabNavBar.tabPanel?.id:this.elementRef.nativeElement.getAttribute("aria-controls")}_getAriaSelected(){return this._tabNavBar.tabPanel?this.active?"true":"false":this.elementRef.nativeElement.getAttribute("aria-selected")}_getAriaCurrent(){return this.active&&!this._tabNavBar.tabPanel?"page":null}_getRole(){return this._tabNavBar.tabPanel?"tab":this.elementRef.nativeElement.getAttribute("role")}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=lv({type:i,selectors:[["","mat-tab-link",""],["","matTabLink",""]],hostAttrs:[1,"mdc-tab","mat-mdc-tab-link","mat-focus-indicator"],hostVars:11,hostBindings:function(t,n){t&1&&Fd("focus",function(){return n._handleFocus()})("keydown",function(c){return n._handleKeydown(c)}),t&2&&(bd("aria-controls",n._getAriaControls())("aria-current",n._getAriaCurrent())("aria-disabled",n.disabled)("aria-selected",n._getAriaSelected())("id",n.id)("tabIndex",n._tabIndex())("role",n._getRole()),Wd("mat-mdc-tab-disabled",n.disabled)("mdc-tab--active",n.active));},inputs:{active:[2,"active","active",gS],disabled:[2,"disabled","disabled",gS],disableRipple:[2,"disableRipple","disableRipple",gS],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:mS(e)],id:"id"},exportAs:["matTabLink"],features:[Cd],ngContentSelectors:wt,decls:5,vars:2,consts:[[1,"mdc-tab__ripple"],["mat-ripple","",1,"mat-mdc-tab-ripple",3,"matRippleTrigger","matRippleDisabled"],[1,"mdc-tab__content"],[1,"mdc-tab__text-label"]],template:function(t,n){t&1&&(ry(),Ad(0,"span",0)(1,"div",1),ao(2,"span",2)(3,"span",3),oy(4),fa$1()()),t&2&&(Sg(),xd("matRippleTrigger",n.elementRef.nativeElement)("matRippleDisabled",n.rippleDisabled));},dependencies:[sl],styles:[`.mat-mdc-tab-link {
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-decoration: none;
  background: none;
  height: var(--mat-tab-container-height, 48px);
  font-family: var(--mat-tab-label-text-font, var(--mat-sys-title-small-font));
  font-size: var(--mat-tab-label-text-size, var(--mat-sys-title-small-size));
  letter-spacing: var(--mat-tab-label-text-tracking, var(--mat-sys-title-small-tracking));
  line-height: var(--mat-tab-label-text-line-height, var(--mat-sys-title-small-line-height));
  font-weight: var(--mat-tab-label-text-weight, var(--mat-sys-title-small-weight));
}
.mat-mdc-tab-link.mdc-tab {
  flex-grow: 0;
}
.mat-mdc-tab-link .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-indicator-color, var(--mat-sys-primary));
  border-top-width: var(--mat-tab-active-indicator-height, 2px);
  border-radius: var(--mat-tab-active-indicator-shape, 0);
}
.mat-mdc-tab-link:hover .mdc-tab__text-label {
  color: var(--mat-tab-inactive-hover-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-link:focus .mdc-tab__text-label {
  color: var(--mat-tab-inactive-focus-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-link.mdc-tab--active .mdc-tab__text-label {
  color: var(--mat-tab-active-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-link.mdc-tab--active .mdc-tab__ripple::before,
.mat-mdc-tab-link.mdc-tab--active .mat-ripple-element {
  background-color: var(--mat-tab-active-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-link.mdc-tab--active:hover .mdc-tab__text-label {
  color: var(--mat-tab-active-hover-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-link.mdc-tab--active:hover .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-hover-indicator-color, var(--mat-sys-primary));
}
.mat-mdc-tab-link.mdc-tab--active:focus .mdc-tab__text-label {
  color: var(--mat-tab-active-focus-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-link.mdc-tab--active:focus .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-focus-indicator-color, var(--mat-sys-primary));
}
.mat-mdc-tab-link.mat-mdc-tab-disabled {
  opacity: 0.4;
  pointer-events: none;
}
.mat-mdc-tab-link.mat-mdc-tab-disabled .mdc-tab__content {
  pointer-events: none;
}
.mat-mdc-tab-link.mat-mdc-tab-disabled .mdc-tab__ripple::before,
.mat-mdc-tab-link.mat-mdc-tab-disabled .mat-ripple-element {
  background-color: var(--mat-tab-disabled-ripple-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-tab-link .mdc-tab__ripple::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  pointer-events: none;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-link .mdc-tab__text-label {
  color: var(--mat-tab-inactive-label-text-color, var(--mat-sys-on-surface));
  display: inline-flex;
  align-items: center;
}
.mat-mdc-tab-link .mdc-tab__content {
  position: relative;
  pointer-events: auto;
}
.mat-mdc-tab-link:hover .mdc-tab__ripple::before {
  opacity: 0.04;
}
.mat-mdc-tab-link.cdk-program-focused .mdc-tab__ripple::before, .mat-mdc-tab-link.cdk-keyboard-focused .mdc-tab__ripple::before {
  opacity: 0.12;
}
.mat-mdc-tab-link .mat-ripple-element {
  opacity: 0.12;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-header.mat-mdc-tab-nav-bar-stretch-tabs .mat-mdc-tab-link {
  flex-grow: 1;
}
.mat-mdc-tab-link::before {
  margin: 5px;
}

@media (max-width: 599px) {
  .mat-mdc-tab-link {
    min-width: 72px;
  }
}
`],encapsulation:2})}return i})(),oi=(()=>{class i{id=y(dn).getId("mat-tab-nav-panel-");_activeTabId;static \u0275fac=function(t){return new(t||i)};static \u0275cmp=lv({type:i,selectors:[["mat-tab-nav-panel"]],hostAttrs:["role","tabpanel",1,"mat-mdc-tab-nav-panel"],hostVars:2,hostBindings:function(t,n){t&2&&bd("aria-labelledby",n._activeTabId)("id",n.id);},inputs:{id:"id"},exportAs:["matTabNavPanel"],ngContentSelectors:wt,decls:1,vars:0,template:function(t,n){t&1&&(ry(),oy(0));},encapsulation:2})}return i})(),ri=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({imports:[At$1]})}return i})();var Hi=[[["mat-icon"],["","matMenuItemIcon",""]],"*"],Vi=["mat-icon, [matMenuItemIcon]","*"];function ji(i,s){i&1&&(Fc(),ao(0,"svg",2),Ad(1,"polygon",3),fa$1());}var zi=["*"];function Qi(i,s){if(i&1){let e=Wv();pa$1(0,"div",0),jd("click",function(){Mc(e);let n=ty();return Nc(n.closed.emit("click"))})("animationstart",function(n){Mc(e);let o=ty();return Nc(o._onAnimationStart(n.animationName))})("animationend",function(n){Mc(e);let o=ty();return Nc(o._onAnimationDone(n.animationName))})("animationcancel",function(n){Mc(e);let o=ty();return Nc(o._onAnimationDone(n.animationName))}),pa$1(1,"div",1),oy(2),ha$1()();}if(i&2){let e=ty();Ey(e._classList),Wd("mat-menu-panel-animations-disabled",e._animationsDisabled)("mat-menu-panel-exit-animation",e._panelAnimationState==="void")("mat-menu-panel-animating",e._isAnimating()),Ld("id",e.panelId),bd("aria-label",e.ariaLabel||null)("aria-labelledby",e.ariaLabelledby||null)("aria-describedby",e.ariaDescribedby||null);}}var At=new T("MAT_MENU_PANEL"),Se=(()=>{class i{_elementRef=y(jn);_document=y(Cn);_focusMonitor=y(nn);_parentMenu=y(At,{optional:true});_changeDetectorRef=y(fS);role="menuitem";disabled=false;disableRipple=false;_hovered=new g;_focused=new g;_highlighted=false;_triggersSubmenu=false;constructor(){y(H).load(or),this._parentMenu?.addItem?.(this);}focus(e,t){this._focusMonitor&&e?this._focusMonitor.focusVia(this._getHostElement(),e,t):this._getHostElement().focus(t),this._focused.next(this);}ngAfterViewInit(){this._focusMonitor&&this._focusMonitor.monitor(this._elementRef,false);}ngOnDestroy(){this._focusMonitor&&this._focusMonitor.stopMonitoring(this._elementRef),this._parentMenu&&this._parentMenu.removeItem&&this._parentMenu.removeItem(this),this._hovered.complete(),this._focused.complete();}_getTabIndex(){return this.disabled?"-1":"0"}_getHostElement(){return this._elementRef.nativeElement}_checkDisabled(e){this.disabled&&(e.preventDefault(),e.stopPropagation());}_handleMouseEnter(){this._hovered.next(this);}getLabel(){let e=this._elementRef.nativeElement.cloneNode(true),t=e.querySelectorAll("mat-icon, .material-icons");for(let n=0;n<t.length;n++)t[n].remove();return e.textContent?.trim()||""}_setHighlighted(e){this._highlighted=e,this._changeDetectorRef.markForCheck();}_setTriggersSubmenu(e){this._triggersSubmenu=e,this._changeDetectorRef.markForCheck();}_hasFocus(){return this._document&&this._document.activeElement===this._getHostElement()}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=lv({type:i,selectors:[["","mat-menu-item",""]],hostAttrs:[1,"mat-mdc-menu-item","mat-focus-indicator"],hostVars:8,hostBindings:function(t,n){t&1&&Fd("click",function(c){return n._checkDisabled(c)})("mouseenter",function(){return n._handleMouseEnter()}),t&2&&(bd("role",n.role)("tabindex",n._getTabIndex())("aria-disabled",n.disabled)("disabled",n.disabled||null),Wd("mat-mdc-menu-item-highlighted",n._highlighted)("mat-mdc-menu-item-submenu-trigger",n._triggersSubmenu));},inputs:{role:"role",disabled:[2,"disabled","disabled",gS],disableRipple:[2,"disableRipple","disableRipple",gS]},exportAs:["matMenuItem"],ngContentSelectors:Vi,decls:5,vars:3,consts:[[1,"mat-mdc-menu-item-text"],["matRipple","",1,"mat-mdc-menu-ripple",3,"matRippleDisabled","matRippleTrigger"],["viewBox","0 0 5 10","focusable","false","aria-hidden","true",1,"mat-mdc-menu-submenu-icon"],["points","0,0 5,5 0,10"]],template:function(t,n){t&1&&(ry(Hi),oy(0),ao(1,"span",0),oy(2,1),fa$1(),Ad(3,"div",1),Lv(4,ji,2,0,":svg:svg",2)),t&2&&(Sg(3),xd("matRippleDisabled",n.disableRipple||n.disabled)("matRippleTrigger",n._getHostElement()),Sg(),Pv(n._triggersSubmenu?4:-1));},dependencies:[sl],encapsulation:2})}return i})();var Gi=new T("MatMenuContent");var Wi=new T("mat-menu-default-options",{providedIn:"root",factory:()=>({overlapTrigger:false,xPosition:"after",yPosition:"below",backdropClass:"cdk-overlay-transparent-backdrop"})}),St="_mat-menu-enter",tt="_mat-menu-exit",ge=(()=>{class i{_elementRef=y(jn);_changeDetectorRef=y(fS);_injector=y(J);_keyManager;_xPosition;_yPosition;_firstItemFocusRef;_exitFallbackTimeout;_animationsDisabled=Et$1();_allItems;_directDescendantItems=new zr;_classList={};_panelAnimationState="void";_animationDone=new g;_isAnimating=Ee(false);parentMenu;direction;overlayPanelClass;backdropClass;ariaLabel;ariaLabelledby;ariaDescribedby;get xPosition(){return this._xPosition}set xPosition(e){this._xPosition=e,this.setPositionClasses();}get yPosition(){return this._yPosition}set yPosition(e){this._yPosition=e,this.setPositionClasses();}templateRef;items;lazyContent;overlapTrigger=false;hasBackdrop;get panelClass(){return this._previousPanelClass}set panelClass(e){let t=this._previousPanelClass,n=r({},this._classList);t&&t.length&&t.split(" ").forEach(o=>{n[o]=false;}),this._previousPanelClass=e,e&&e.length&&(e.split(" ").forEach(o=>{n[o]=true;}),this._elementRef.nativeElement.className=""),this._classList=n;}_previousPanelClass="";get classList(){return this.panelClass}set classList(e){this.panelClass=e;}closed=new we;close=this.closed;panelId=y(dn).getId("mat-menu-panel-");constructor(){let e=y(Wi);this.overlayPanelClass=e.overlayPanelClass||"",this._xPosition=e.xPosition,this._yPosition=e.yPosition,this.backdropClass=e.backdropClass,this.overlapTrigger=e.overlapTrigger,this.hasBackdrop=e.hasBackdrop;}ngOnInit(){this.setPositionClasses();}ngAfterContentInit(){this._updateDirectDescendants(),this._keyManager=new ln(this._directDescendantItems).withWrap().withTypeAhead().withHomeAndEnd(),this._keyManager.tabOut.subscribe(()=>this.closed.emit("tab")),this._directDescendantItems.changes.pipe(Un(this._directDescendantItems),re$1(e=>Eo(...e.map(t=>t._focused)))).subscribe(e=>this._keyManager.updateActiveItem(e)),this._directDescendantItems.changes.subscribe(e=>{let t=this._keyManager;if(this._panelAnimationState==="enter"&&t.activeItem?._hasFocus()){let n=e.toArray(),o=Math.max(0,Math.min(n.length-1,t.activeItemIndex||0));n[o]&&!n[o].disabled?t.setActiveItem(o):t.setNextItemActive();}});}ngOnDestroy(){this._keyManager?.destroy(),this._directDescendantItems.destroy(),this.closed.complete(),this._firstItemFocusRef?.destroy(),clearTimeout(this._exitFallbackTimeout);}_hovered(){return this._directDescendantItems.changes.pipe(Un(this._directDescendantItems),re$1(t=>Eo(...t.map(n=>n._hovered))))}addItem(e){}removeItem(e){}_handleKeydown(e){let t=e.keyCode,n=this._keyManager;switch(t){case 27:$i(e)||(e.preventDefault(),this.closed.emit("keydown"));break;case 37:this.parentMenu&&this.direction==="ltr"&&this.closed.emit("keydown");break;case 39:this.parentMenu&&this.direction==="rtl"&&this.closed.emit("keydown");break;default:(t===38||t===40)&&n.setFocusOrigin("keyboard"),n.onKeydown(e);return}}focusFirstItem(e="program"){this._firstItemFocusRef?.destroy(),this._firstItemFocusRef=og(()=>{let t=this._resolvePanel();if(!t||!t.contains(document.activeElement)){let n=this._keyManager;n.setFocusOrigin(e).setFirstItemActive(),!n.activeItem&&t&&t.focus();}},{injector:this._injector});}resetActiveItem(){this._keyManager.setActiveItem(-1);}setElevation(e){}setPositionClasses(e=this.xPosition,t=this.yPosition){this._classList=s(r({},this._classList),{"mat-menu-before":e==="before","mat-menu-after":e==="after","mat-menu-above":t==="above","mat-menu-below":t==="below"}),this._changeDetectorRef.markForCheck();}_onAnimationDone(e){let t=e===tt;(t||e===St)&&(t&&(clearTimeout(this._exitFallbackTimeout),this._exitFallbackTimeout=void 0),this._animationDone.next(t?"void":"enter"),this._isAnimating.set(false));}_onAnimationStart(e){(e===St||e===tt)&&this._isAnimating.set(true);}_setIsOpen(e){if(this._panelAnimationState=e?"enter":"void",e){if(this._keyManager.activeItemIndex===0){let t=this._resolvePanel();t&&(t.scrollTop=0);}}else this._animationsDisabled||(this._exitFallbackTimeout=setTimeout(()=>this._onAnimationDone(tt),200));this._animationsDisabled&&setTimeout(()=>{this._onAnimationDone(e?St:tt);}),this._changeDetectorRef.markForCheck();}_updateDirectDescendants(){this._allItems.changes.pipe(Un(this._allItems)).subscribe(e=>{this._directDescendantItems.reset(e.filter(t=>t._parentMenu===this)),this._directDescendantItems.notifyOnChanges();});}_resolvePanel(){let e=null;return this._directDescendantItems.length&&(e=this._directDescendantItems.first._getHostElement().closest('[role="menu"]')),e}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=lv({type:i,selectors:[["mat-menu"]],contentQueries:function(t,n,o){if(t&1&&Vd(o,Gi,5)(o,Se,5)(o,Se,4),t&2){let c;sy(c=ay())&&(n.lazyContent=c.first),sy(c=ay())&&(n._allItems=c),sy(c=ay())&&(n.items=c);}},viewQuery:function(t,n){if(t&1&&Hd(Rn,5),t&2){let o;sy(o=ay())&&(n.templateRef=o.first);}},hostVars:3,hostBindings:function(t,n){t&2&&bd("aria-label",null)("aria-labelledby",null)("aria-describedby",null);},inputs:{backdropClass:"backdropClass",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],xPosition:"xPosition",yPosition:"yPosition",overlapTrigger:[2,"overlapTrigger","overlapTrigger",gS],hasBackdrop:[2,"hasBackdrop","hasBackdrop",e=>e==null?null:gS(e)],panelClass:[0,"class","panelClass"],classList:"classList"},outputs:{closed:"closed",close:"close"},exportAs:["matMenu"],features:[By([{provide:At,useExisting:i}])],ngContentSelectors:zi,decls:1,vars:0,consts:[["tabindex","-1","role","menu",1,"mat-mdc-menu-panel",3,"click","animationstart","animationend","animationcancel","id"],[1,"mat-mdc-menu-content"]],template:function(t,n){t&1&&(ry(),Md(0,Qi,3,12,"ng-template"));},styles:[`mat-menu {
  display: none;
}

.mat-mdc-menu-content {
  margin: 0;
  padding: 8px 0;
  outline: 0;
}
.mat-mdc-menu-content,
.mat-mdc-menu-content .mat-mdc-menu-item .mat-mdc-menu-item-text {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  flex: 1;
  white-space: normal;
  font-family: var(--mat-menu-item-label-text-font, var(--mat-sys-label-large-font));
  line-height: var(--mat-menu-item-label-text-line-height, var(--mat-sys-label-large-line-height));
  font-size: var(--mat-menu-item-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-menu-item-label-text-tracking, var(--mat-sys-label-large-tracking));
  font-weight: var(--mat-menu-item-label-text-weight, var(--mat-sys-label-large-weight));
}

@keyframes _mat-menu-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-menu-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-mdc-menu-panel {
  min-width: 112px;
  max-width: 280px;
  overflow: auto;
  box-sizing: border-box;
  outline: 0;
  animation: _mat-menu-enter 120ms cubic-bezier(0, 0, 0.2, 1);
  border-radius: var(--mat-menu-container-shape, var(--mat-sys-corner-extra-small));
  background-color: var(--mat-menu-container-color, var(--mat-sys-surface-container));
  box-shadow: var(--mat-menu-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
  will-change: transform, opacity;
}
.mat-mdc-menu-panel.mat-menu-panel-exit-animation {
  animation: _mat-menu-exit 100ms 25ms linear forwards;
}
.mat-mdc-menu-panel.mat-menu-panel-animations-disabled {
  animation: none;
}
.mat-mdc-menu-panel.mat-menu-panel-animating {
  pointer-events: none;
}
.mat-mdc-menu-panel.mat-menu-panel-animating:has(.mat-mdc-menu-content:empty) {
  display: none;
}
@media (forced-colors: active) {
  .mat-mdc-menu-panel {
    outline: solid 1px;
  }
}
.mat-mdc-menu-panel .mat-divider {
  border-top-color: var(--mat-menu-divider-color, var(--mat-sys-surface-variant));
  margin-bottom: var(--mat-menu-divider-bottom-spacing, 8px);
  margin-top: var(--mat-menu-divider-top-spacing, 8px);
}

.mat-mdc-menu-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  color: inherit;
  font-size: inherit;
  background: none;
  text-decoration: none;
  margin: 0;
  min-height: 48px;
  padding-left: var(--mat-menu-item-leading-spacing, 12px);
  padding-right: var(--mat-menu-item-trailing-spacing, 12px);
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  outline: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-menu-item::-moz-focus-inner {
  border: 0;
}
[dir=rtl] .mat-mdc-menu-item {
  padding-left: var(--mat-menu-item-trailing-spacing, 12px);
  padding-right: var(--mat-menu-item-leading-spacing, 12px);
}
.mat-mdc-menu-item:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding-left: var(--mat-menu-item-with-icon-leading-spacing, 12px);
  padding-right: var(--mat-menu-item-with-icon-trailing-spacing, 12px);
}
[dir=rtl] .mat-mdc-menu-item:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding-left: var(--mat-menu-item-with-icon-trailing-spacing, 12px);
  padding-right: var(--mat-menu-item-with-icon-leading-spacing, 12px);
}
.mat-mdc-menu-item, .mat-mdc-menu-item:visited, .mat-mdc-menu-item:link {
  color: var(--mat-menu-item-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-menu-item .mat-icon-no-color,
.mat-mdc-menu-item .mat-mdc-menu-submenu-icon {
  color: var(--mat-menu-item-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-menu-item[disabled] {
  cursor: default;
  opacity: 0.38;
}
.mat-mdc-menu-item[disabled]::after {
  display: block;
  position: absolute;
  content: "";
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.mat-mdc-menu-item:focus {
  outline: 0;
}
.mat-mdc-menu-item .mat-icon {
  flex-shrink: 0;
  margin-right: var(--mat-menu-item-spacing, 12px);
  height: var(--mat-menu-item-icon-size, 24px);
  width: var(--mat-menu-item-icon-size, 24px);
}
[dir=rtl] .mat-mdc-menu-item {
  text-align: right;
}
[dir=rtl] .mat-mdc-menu-item .mat-icon {
  margin-right: 0;
  margin-left: var(--mat-menu-item-spacing, 12px);
}
.mat-mdc-menu-item:not([disabled]):hover {
  background-color: var(--mat-menu-item-hover-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-menu-item:not([disabled]).cdk-program-focused, .mat-mdc-menu-item:not([disabled]).cdk-keyboard-focused, .mat-mdc-menu-item:not([disabled]).mat-mdc-menu-item-highlighted {
  background-color: var(--mat-menu-item-focus-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
}
@media (forced-colors: active) {
  .mat-mdc-menu-item {
    margin-top: 1px;
  }
}

.mat-mdc-menu-submenu-icon {
  width: var(--mat-menu-item-icon-size, 24px);
  height: 10px;
  fill: currentColor;
  padding-left: var(--mat-menu-item-spacing, 12px);
}
[dir=rtl] .mat-mdc-menu-submenu-icon {
  padding-right: var(--mat-menu-item-spacing, 12px);
  padding-left: 0;
}
[dir=rtl] .mat-mdc-menu-submenu-icon polygon {
  transform: scaleX(-1);
  transform-origin: center;
}
@media (forced-colors: active) {
  .mat-mdc-menu-submenu-icon {
    fill: CanvasText;
  }
}

.mat-mdc-menu-item .mat-mdc-menu-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
`],encapsulation:2})}return i})(),qi=new T("mat-menu-scroll-strategy",{providedIn:"root",factory:()=>{let i=y(J);return ()=>kt$2(i)}});var _e=new WeakMap,Yi=(()=>{class i{_canHaveBackdrop;_element=y(jn);_viewContainerRef=y(Do);_menuItemInstance=y(Se,{optional:true,self:true});_dir=y(Go,{optional:true});_focusMonitor=y(nn);_ngZone=y(H$1);_injector=y(J);_scrollStrategy=y(qi);_changeDetectorRef=y(fS);_animationsDisabled=Et$1();_portal;_overlayRef=null;_menuOpen=false;_closingActionsSubscription=I$1.EMPTY;_menuCloseSubscription=I$1.EMPTY;_pendingRemoval;_parentMaterialMenu;_parentInnerPadding;_openedBy=void 0;get _menu(){return this._menuInternal}set _menu(e){e!==this._menuInternal&&(this._menuInternal=e,this._menuCloseSubscription.unsubscribe(),e?(this._parentMaterialMenu,this._menuCloseSubscription=e.close.subscribe(t=>{this._destroyMenu(t),(t==="click"||t==="tab")&&this._parentMaterialMenu&&this._parentMaterialMenu.closed.emit(t);})):this._destroyMenu(),this._menuItemInstance?._setTriggersSubmenu(this._triggersSubmenu()));}_menuInternal=null;constructor(e){this._canHaveBackdrop=e;let t=y(At,{optional:true});this._parentMaterialMenu=t instanceof ge?t:void 0;}ngOnDestroy(){this._menu&&this._ownsMenu(this._menu)&&_e.delete(this._menu),this._pendingRemoval?.unsubscribe(),this._menuCloseSubscription.unsubscribe(),this._closingActionsSubscription.unsubscribe(),this._overlayRef&&(this._overlayRef.dispose(),this._overlayRef=null);}get menuOpen(){return this._menuOpen}get dir(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_triggersSubmenu(){return !!(this._menuItemInstance&&this._parentMaterialMenu&&this._menu)}_closeMenu(){this._menu?.close.emit();}_openMenu(e){if(this._triggerIsAriaDisabled())return;let t=this._menu;if(this._menuOpen||!t)return;this._pendingRemoval?.unsubscribe();let n=_e.get(t);_e.set(t,this),n&&n!==this&&n._closeMenu();let o=this._createOverlay(t),c=o.getConfig(),u=c.positionStrategy;this._setPosition(t,u),this._canHaveBackdrop?c.hasBackdrop=t.hasBackdrop==null?!this._triggersSubmenu():t.hasBackdrop:c.hasBackdrop=t.hasBackdrop??false,o.hasAttached()||(o.attach(this._getPortal(t)),t.lazyContent?.attach(this.menuData)),this._closingActionsSubscription=this._menuClosingActions().subscribe(()=>this._closeMenu()),t.parentMenu=this._triggersSubmenu()?this._parentMaterialMenu:void 0,t.direction=this.dir,e&&t.focusFirstItem(this._openedBy||"program"),this._setIsMenuOpen(true),t instanceof ge&&(t._setIsOpen(true),t._directDescendantItems.changes.pipe(Yn(t.close)).subscribe(()=>{u.withLockedPosition(false).reapplyLastPosition(),u.withLockedPosition(true);}));}focus(e,t){this._focusMonitor&&e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t);}_destroyMenu(e){let t=this._overlayRef,n=this._menu;!t||!this.menuOpen||(this._closingActionsSubscription.unsubscribe(),this._pendingRemoval?.unsubscribe(),n instanceof ge&&this._ownsMenu(n)?(this._pendingRemoval=n._animationDone.pipe(ee$1(1)).subscribe(()=>{t.detach(),_e.has(n)||n.lazyContent?.detach();}),n._setIsOpen(false)):(t.detach(),n?.lazyContent?.detach()),n&&this._ownsMenu(n)&&_e.delete(n),this.restoreFocus&&(e==="keydown"||!this._openedBy||!this._triggersSubmenu())&&this.focus(this._openedBy),this._openedBy=void 0,this._setIsMenuOpen(false));}_setIsMenuOpen(e){e!==this._menuOpen&&(this._menuOpen=e,this._menuOpen?this.menuOpened.emit():this.menuClosed.emit(),this._triggersSubmenu()&&this._menuItemInstance._setHighlighted(e),this._changeDetectorRef.markForCheck());}_createOverlay(e){if(!this._overlayRef){let t=this._getOverlayConfig(e);this._subscribeToPositions(e,t.positionStrategy),this._overlayRef=Pt$1(this._injector,t),this._overlayRef.keydownEvents().subscribe(n=>{this._menu instanceof ge&&this._menu._handleKeydown(n);});}return this._overlayRef}_getOverlayConfig(e){return new X({positionStrategy:xt(this._injector,this._getOverlayOrigin()).withLockedPosition().withGrowAfterOpen().withTransformOriginOn(".mat-menu-panel, .mat-mdc-menu-panel"),backdropClass:e.backdropClass||"cdk-overlay-transparent-backdrop",panelClass:e.overlayPanelClass,scrollStrategy:this._scrollStrategy(),direction:this._dir||"ltr",disableAnimations:this._animationsDisabled})}_subscribeToPositions(e,t){e.setPositionClasses&&t.positionChanges.subscribe(n=>{this._ngZone.run(()=>{let o=n.connectionPair.overlayX==="start"?"after":"before",c=n.connectionPair.overlayY==="top"?"below":"above";e.setPositionClasses(o,c);});});}_setPosition(e,t){let[n,o]=e.xPosition==="before"?["end","start"]:["start","end"],[c,u]=e.yPosition==="above"?["bottom","top"]:["top","bottom"],[b,_]=[c,u],[le,st]=[n,o],fe=0;if(this._triggersSubmenu()){if(st=n=e.xPosition==="before"?"start":"end",o=le=n==="end"?"start":"end",this._parentMaterialMenu){if(this._parentInnerPadding==null){let Nt=this._parentMaterialMenu.items.first;this._parentInnerPadding=Nt?Nt._getHostElement().offsetTop:0;}fe=c==="bottom"?this._parentInnerPadding:-this._parentInnerPadding;}}else e.overlapTrigger||(b=c==="top"?"bottom":"top",_=u==="top"?"bottom":"top");t.withPositions([{originX:n,originY:b,overlayX:le,overlayY:c,offsetY:fe},{originX:o,originY:b,overlayX:st,overlayY:c,offsetY:fe},{originX:n,originY:_,overlayX:le,overlayY:u,offsetY:-fe},{originX:o,originY:_,overlayX:st,overlayY:u,offsetY:-fe}]);}_menuClosingActions(){let e=this._getOutsideClickStream(this._overlayRef),t=this._overlayRef.detachments(),n=this._parentMaterialMenu?this._parentMaterialMenu.closed:Fe(),o=this._parentMaterialMenu?this._parentMaterialMenu._hovered().pipe(D(c=>this._menuOpen&&c!==this._menuItemInstance)):Fe();return Eo(e,n,o,t)}_getPortal(e){return (!this._portal||this._portal.templateRef!==e.templateRef)&&(this._portal=new W(e.templateRef,this._viewContainerRef)),this._portal}_ownsMenu(e){return _e.get(e)===this}_triggerIsAriaDisabled(){return gS(this._element.nativeElement.getAttribute("aria-disabled"))}static \u0275fac=function(t){_m();};static \u0275dir=hv({type:i})}return i})(),di=(()=>{class i extends Yi{_cleanupTouchstart;_hoverSubscription=I$1.EMPTY;get _deprecatedMatMenuTriggerFor(){return this.menu}set _deprecatedMatMenuTriggerFor(e){this.menu=e;}get menu(){return this._menu}set menu(e){this._menu=e;}menuData;restoreFocus=true;menuOpened=new we;onMenuOpen=this.menuOpened;menuClosed=new we;onMenuClose=this.menuClosed;constructor(){super(true);let e=y(pm);this._cleanupTouchstart=e.listen(this._element.nativeElement,"touchstart",t=>{Rt$1(t)||(this._openedBy="touch");},{passive:true});}triggersSubmenu(){return super._triggersSubmenu()}toggleMenu(){return this.menuOpen?this.closeMenu():this.openMenu()}openMenu(){this._openMenu(true);}closeMenu(){this._closeMenu();}updatePosition(){this._overlayRef?.updatePosition();}ngAfterContentInit(){this._handleHover();}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTouchstart(),this._hoverSubscription.unsubscribe();}_getOverlayOrigin(){return this._element}_getOutsideClickStream(e){return e.backdropClick()}_handleMousedown(e){kt$1(e)||(this._openedBy=e.button===0?"mouse":void 0,this.triggersSubmenu()&&e.preventDefault());}_handleKeydown(e){let t=e.keyCode;(t===13||t===32)&&(this._openedBy="keyboard"),this.triggersSubmenu()&&(t===39&&this.dir==="ltr"||t===37&&this.dir==="rtl")&&(this._openedBy="keyboard",this.openMenu());}_handleClick(e){this.triggersSubmenu()?(e.stopPropagation(),this.openMenu()):this.toggleMenu();}_handleHover(){this.triggersSubmenu()&&this._parentMaterialMenu&&(this._hoverSubscription=this._parentMaterialMenu._hovered().subscribe(e=>{e===this._menuItemInstance&&!e.disabled&&this._parentMaterialMenu?._panelAnimationState!=="void"&&(this._openedBy="mouse",this._openMenu(false));}));}static \u0275fac=function(t){return new(t||i)};static \u0275dir=hv({type:i,selectors:[["","mat-menu-trigger-for",""],["","matMenuTriggerFor",""]],hostAttrs:[1,"mat-mdc-menu-trigger"],hostVars:3,hostBindings:function(t,n){t&1&&Fd("click",function(c){return n._handleClick(c)})("mousedown",function(c){return n._handleMousedown(c)})("keydown",function(c){return n._handleKeydown(c)}),t&2&&bd("aria-haspopup",n.menu?"menu":null)("aria-expanded",n.menuOpen)("aria-controls",n.menuOpen?n.menu?.panelId:null);},inputs:{_deprecatedMatMenuTriggerFor:[0,"mat-menu-trigger-for","_deprecatedMatMenuTriggerFor"],menu:[0,"matMenuTriggerFor","menu"],menuData:[0,"matMenuTriggerData","menuData"],restoreFocus:[0,"matMenuTriggerRestoreFocus","restoreFocus"]},outputs:{menuOpened:"menuOpened",onMenuOpen:"onMenuOpen",menuClosed:"menuClosed",onMenuClose:"onMenuClose"},exportAs:["matMenuTrigger"],features:[Cd]})}return i})();var ci=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({imports:[cr,ge$1,At$1,wt$1]})}return i})();function Xi(i,s){}var ee=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;positionStrategy;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;scrollStrategy;closeOnNavigation=true;closeOnDestroy=true;closeOnOverlayDetachments=true;disableAnimations=false;providers;container;templateContext;bindings};var Ot=(()=>{class i extends J$1{_elementRef=y(jn);_focusTrapFactory=y(Ao);_config;_interactivityChecker=y(mo);_ngZone=y(H$1);_focusMonitor=y(nn);_renderer=y(pm);_changeDetectorRef=y(fS);_injector=y(J);_platform=y(I$2);_document=y(Cn);_portalOutlet;_focusTrapped=new g;_focusTrap=null;_elementFocusedBeforeDialogWasOpened=null;_closeInteractionType=null;_ariaLabelledByQueue=[];_isDestroyed=false;constructor(){super(),this._config=y(ee,{optional:true})||new ee,this._config.ariaLabelledBy&&this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);}_addAriaLabelledBy(e){this._ariaLabelledByQueue.push(e),this._changeDetectorRef.markForCheck();}_removeAriaLabelledBy(e){let t=this._ariaLabelledByQueue.indexOf(e);t>-1&&(this._ariaLabelledByQueue.splice(t,1),this._changeDetectorRef.markForCheck());}_contentAttached(){this._initializeFocusTrap(),this._captureInitialFocus();}_captureInitialFocus(){this._trapFocus();}ngOnDestroy(){this._focusTrapped.complete(),this._isDestroyed=true,this._restoreFocus();}attachComponentPortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._contentAttached(),t}attachTemplatePortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._contentAttached(),t}attachDomPortal=e=>{this._portalOutlet.hasAttached();let t=this._portalOutlet.attachDomPortal(e);return this._contentAttached(),t};_recaptureFocus(){this._containsFocus()||this._trapFocus();}_forceFocus(e,t){this._interactivityChecker.isFocusable(e)||(e.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let n=()=>{o(),c(),e.removeAttribute("tabindex");},o=this._renderer.listen(e,"blur",n),c=this._renderer.listen(e,"mousedown",n);})),e.focus(t);}_focusByCssSelector(e,t){let n=this._elementRef.nativeElement.querySelector(e);n&&this._forceFocus(n,t);}_trapFocus(e){this._isDestroyed||og(()=>{let t=this._elementRef.nativeElement;switch(this._config.autoFocus){case  false:case "dialog":this._containsFocus()||t.focus(e);break;case  true:case "first-tabbable":this._focusTrap?.focusInitialElement(e)||this._focusDialogContainer(e);break;case "first-heading":this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]',e);break;default:this._focusByCssSelector(this._config.autoFocus,e);break}this._focusTrapped.next();},{injector:this._injector});}_restoreFocus(){let e=this._config.restoreFocus,t=null;if(typeof e=="string"?t=this._document.querySelector(e):typeof e=="boolean"?t=e?this._elementFocusedBeforeDialogWasOpened:null:e&&(t=e),this._config.restoreFocus&&t&&typeof t.focus=="function"){let n=ao$1(),o=this._elementRef.nativeElement;(!n||n===this._document.body||n===o||o.contains(n))&&(this._focusMonitor?(this._focusMonitor.focusVia(t,this._closeInteractionType),this._closeInteractionType=null):t.focus());}this._focusTrap&&this._focusTrap.destroy();}_focusDialogContainer(e){this._elementRef.nativeElement.focus?.(e);}_containsFocus(){let e=this._elementRef.nativeElement,t=ao$1();return e===t||e.contains(t)}_initializeFocusTrap(){this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._document&&(this._elementFocusedBeforeDialogWasOpened=ao$1()));}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=lv({type:i,selectors:[["cdk-dialog-container"]],viewQuery:function(t,n){if(t&1&&Hd(Ce,7),t&2){let o;sy(o=ay())&&(n._portalOutlet=o.first);}},hostAttrs:["tabindex","-1",1,"cdk-dialog-container"],hostVars:6,hostBindings:function(t,n){t&2&&bd("id",n._config.id||null)("role",n._config.role)("aria-modal",n._config.ariaModal)("aria-labelledby",n._config.ariaLabel?null:n._ariaLabelledByQueue[0])("aria-label",n._config.ariaLabel)("aria-describedby",n._config.ariaDescribedBy||null);},features:[Cd],decls:1,vars:0,consts:[["cdkPortalOutlet",""]],template:function(t,n){t&1&&wd(0,Xi,0,0,"ng-template",0);},dependencies:[Ce],styles:[`.cdk-dialog-container {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  max-height: inherit;
}
`],encapsulation:2,changeDetection:1})}return i})(),re=class{overlayRef;config;componentInstance=null;componentRef=null;containerInstance;disableClose;closed=new g;backdropClick;keydownEvents;outsidePointerEvents;id;_detachSubscription;constructor(s,e){this.overlayRef=s,this.config=e,this.disableClose=e.disableClose,this.backdropClick=s.backdropClick(),this.keydownEvents=s.keydownEvents(),this.outsidePointerEvents=s.outsidePointerEvents(),this.id=e.id,this.keydownEvents.subscribe(t=>{t.keyCode===27&&!this.disableClose&&!$i(t)&&(t.preventDefault(),this.close(void 0,{focusOrigin:"keyboard"}));}),this.backdropClick.subscribe(()=>{!this.disableClose&&this._canClose()?this.close(void 0,{focusOrigin:"mouse"}):this.containerInstance._recaptureFocus?.();}),this._detachSubscription=s.detachments().subscribe(()=>{e.closeOnOverlayDetachments!==false&&this.close();});}close(s,e){if(this._canClose(s)){let t=this.closed;this.containerInstance._closeInteractionType=e?.focusOrigin||"program",this._detachSubscription.unsubscribe(),this.overlayRef.dispose(),t.next(s),t.complete(),this.componentInstance=this.containerInstance=null;}}updatePosition(){return this.overlayRef.updatePosition(),this}updateSize(s="",e=""){return this.overlayRef.updateSize({width:s,height:e}),this}addPanelClass(s){return this.overlayRef.addPanelClass(s),this}removePanelClass(s){return this.overlayRef.removePanelClass(s),this}_canClose(s){let e=this.config;return !!this.containerInstance&&(!e.closePredicate||e.closePredicate(s,e,this.componentInstance))}},Ui=new T("DialogScrollStrategy",{providedIn:"root",factory:()=>{let i=y(J);return ()=>Kt(i)}}),Zi=new T("DialogData"),Ki=new T("DefaultDialogConfig");function Ji(i){let s=Ee(i),e=new we;return {valueSignal:s,get value(){return s()},change:e,ngOnDestroy(){e.complete();}}}var Bt=(()=>{class i{_injector=y(J);_defaultOptions=y(Ki,{optional:true});_parentDialog=y(i,{optional:true,skipSelf:true});_overlayContainer=y(ne);_idGenerator=y(dn);_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new g;_afterOpenedAtThisLevel=new g;_ariaHiddenElements=new Map;_scrollStrategy=y(Ui);get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}afterAllClosed=ae(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(Un(void 0)));open(e,t){let n=this._defaultOptions||new ee;t=r(r({},n),t),t.id=t.id||this._idGenerator.getId("cdk-dialog-"),t.id&&this.getDialogById(t.id);let o=this._getOverlayConfig(t),c=Pt$1(this._injector,o),u=new re(c,t),b=this._attachContainer(c,u,t);if(u.containerInstance=b,!this.openDialogs.length){let _=this._overlayContainer.getContainerElement();b._focusTrapped?b._focusTrapped.pipe(ee$1(1)).subscribe(()=>{this._hideNonDialogContentFromAssistiveTechnology(_);}):this._hideNonDialogContentFromAssistiveTechnology(_);}return this._attachDialogContent(e,u,b,t),this.openDialogs.push(u),u.closed.subscribe(()=>this._removeOpenDialog(u,true)),this.afterOpened.next(u),u}closeAll(){Rt(this.openDialogs,e=>e.close());}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){Rt(this._openDialogsAtThisLevel,e=>{e.config.closeOnDestroy===false&&this._removeOpenDialog(e,false);}),Rt(this._openDialogsAtThisLevel,e=>e.close()),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete(),this._openDialogsAtThisLevel=[];}_getOverlayConfig(e){let t=new X({positionStrategy:e.positionStrategy||oe().centerHorizontally().centerVertically(),scrollStrategy:e.scrollStrategy||this._scrollStrategy(),panelClass:e.panelClass,hasBackdrop:e.hasBackdrop,direction:e.direction,minWidth:e.minWidth,minHeight:e.minHeight,maxWidth:e.maxWidth,maxHeight:e.maxHeight,width:e.width,height:e.height,disposeOnNavigation:e.closeOnNavigation,disableAnimations:e.disableAnimations});return e.backdropClass&&(t.backdropClass=e.backdropClass),t}_attachContainer(e,t,n){let o=n.injector||n.viewContainerRef?.injector,c=[{provide:ee,useValue:n},{provide:re,useValue:t},{provide:st$1,useValue:e}],u;n.container?typeof n.container=="function"?u=n.container:(u=n.container.type,c.push(...n.container.providers(n))):u=Ot;let b=new vt(u,n.viewContainerRef,J.create({parent:o||this._injector,providers:c}));return e.attach(b).instance}_attachDialogContent(e,t,n,o){if(e instanceof Rn){let c=this._createInjector(o,t,n,void 0),u={$implicit:o.data,dialogRef:t};o.templateContext&&(u=r(r({},u),typeof o.templateContext=="function"?o.templateContext():o.templateContext)),n.attachTemplatePortal(new W(e,null,u,c));}else {let c=this._createInjector(o,t,n,this._injector),u=n.attachComponentPortal(new vt(e,o.viewContainerRef,c,null,o.bindings));t.componentRef=u,t.componentInstance=u.instance;}}_createInjector(e,t,n,o){let c=e.injector||e.viewContainerRef?.injector,u=[{provide:Zi,useValue:e.data},{provide:re,useValue:t}];return e.providers&&(typeof e.providers=="function"?u.push(...e.providers(t,e,n)):u.push(...e.providers)),e.direction&&(!c||!c.get(Go,null,{optional:true}))&&u.push({provide:Go,useValue:Ji(e.direction)}),J.create({parent:c||o,providers:u})}_removeOpenDialog(e,t){let n=this.openDialogs.indexOf(e);n>-1&&(this.openDialogs.splice(n,1),this.openDialogs.length||(this._ariaHiddenElements.forEach((o,c)=>{o?c.setAttribute("aria-hidden",o):c.removeAttribute("aria-hidden");}),this._ariaHiddenElements.clear(),t&&this._getAfterAllClosed().next()));}_hideNonDialogContentFromAssistiveTechnology(e){if(e.parentElement){let t=e.parentElement.children;for(let n=t.length-1;n>-1;n--){let o=t[n];o!==e&&o.nodeName!=="SCRIPT"&&o.nodeName!=="STYLE"&&!o.hasAttribute("aria-live")&&!o.hasAttribute("popover")&&(this._ariaHiddenElements.set(o,o.getAttribute("aria-hidden")),o.setAttribute("aria-hidden","true"));}}}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}static \u0275fac=function(t){return new(t||i)};static \u0275prov=Ct({token:i,factory:i.\u0275fac})}return i})();function Rt(i,s){let e=i.length;for(;e--;)s(i[e]);}var mi=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({providers:[Bt],imports:[ge$1,Yt$1,Io,Yt$1]})}return i})();function ea(i,s){}var at=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;position;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;delayFocusTrap=true;scrollStrategy;closeOnNavigation=true;enterAnimationDuration;exitAnimationDuration;bindings},Lt="mdc-dialog--open",ui="mdc-dialog--opening",pi="mdc-dialog--closing",ta=150,na=75,ia=(()=>{class i extends Ot{_animationStateChanged=new we;_animationsEnabled=!Et$1();_actionSectionCount=0;_hostElement=this._elementRef.nativeElement;_enterAnimationDuration=this._animationsEnabled?bi(this._config.enterAnimationDuration)??ta:0;_exitAnimationDuration=this._animationsEnabled?bi(this._config.exitAnimationDuration)??na:0;_animationTimer=null;_contentAttached(){super._contentAttached(),this._startOpenAnimation();}_startOpenAnimation(){this._animationStateChanged.emit({state:"opening",totalTime:this._enterAnimationDuration}),this._animationsEnabled?(this._hostElement.style.setProperty(hi,`${this._enterAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(ui,Lt)),this._waitForAnimationToComplete(this._enterAnimationDuration,this._finishDialogOpen)):(this._hostElement.classList.add(Lt),Promise.resolve().then(()=>this._finishDialogOpen()));}_startExitAnimation(){this._animationStateChanged.emit({state:"closing",totalTime:this._exitAnimationDuration}),this._hostElement.classList.remove(Lt),this._animationsEnabled?(this._hostElement.style.setProperty(hi,`${this._exitAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(pi)),this._waitForAnimationToComplete(this._exitAnimationDuration,this._finishDialogClose)):Promise.resolve().then(()=>this._finishDialogClose());}_updateActionSectionCount(e){this._actionSectionCount+=e,this._changeDetectorRef.markForCheck();}_finishDialogOpen=()=>{this._clearAnimationClasses(),this._openAnimationDone(this._enterAnimationDuration);};_finishDialogClose=()=>{this._clearAnimationClasses(),this._animationStateChanged.emit({state:"closed",totalTime:this._exitAnimationDuration});};_clearAnimationClasses(){this._hostElement.classList.remove(ui,pi);}_waitForAnimationToComplete(e,t){this._animationTimer!==null&&clearTimeout(this._animationTimer),this._animationTimer=setTimeout(t,e);}_requestAnimationFrame(e){this._ngZone.runOutsideAngular(()=>{typeof requestAnimationFrame=="function"?requestAnimationFrame(e):e();});}_captureInitialFocus(){this._config.delayFocusTrap||this._trapFocus();}_openAnimationDone(e){this._config.delayFocusTrap&&this._trapFocus(),this._animationStateChanged.next({state:"opened",totalTime:e});}ngOnDestroy(){super.ngOnDestroy(),this._animationTimer!==null&&clearTimeout(this._animationTimer);}attachComponentPortal(e){let t=super.attachComponentPortal(e);return t.location.nativeElement.classList.add("mat-mdc-dialog-component-host"),t}static \u0275fac=(()=>{let e;return function(n){return (e||(e=Wp(i)))(n||i)}})();static \u0275cmp=lv({type:i,selectors:[["mat-dialog-container"]],hostAttrs:["tabindex","-1",1,"mat-mdc-dialog-container","mdc-dialog"],hostVars:10,hostBindings:function(t,n){t&2&&(Ld("id",n._config.id),bd("aria-modal",n._config.ariaModal)("role",n._config.role)("aria-labelledby",n._config.ariaLabel?null:n._ariaLabelledByQueue[0])("aria-label",n._config.ariaLabel)("aria-describedby",n._config.ariaDescribedBy||null),Wd("_mat-animation-noopable",!n._animationsEnabled)("mat-mdc-dialog-container-with-actions",n._actionSectionCount>0));},features:[Cd],decls:3,vars:0,consts:[[1,"mat-mdc-dialog-inner-container","mdc-dialog__container"],[1,"mat-mdc-dialog-surface","mdc-dialog__surface"],["cdkPortalOutlet",""]],template:function(t,n){t&1&&(ao(0,"div",0)(1,"div",1),wd(2,ea,0,0,"ng-template",2),fa$1()());},dependencies:[Ce],styles:[`.mat-mdc-dialog-container {
  width: 100%;
  height: 100%;
  display: block;
  box-sizing: border-box;
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
  outline: 0;
}

.cdk-overlay-pane.mat-mdc-dialog-panel {
  max-width: var(--mat-dialog-container-max-width, 560px);
  min-width: var(--mat-dialog-container-min-width, 280px);
}
@media (max-width: 599px) {
  .cdk-overlay-pane.mat-mdc-dialog-panel {
    max-width: var(--mat-dialog-container-small-max-width, calc(100vw - 32px));
  }
}

.mat-mdc-dialog-inner-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  height: 100%;
  opacity: 0;
  transition: opacity linear var(--mat-dialog-transition-duration, 0ms);
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
}
.mdc-dialog--closing .mat-mdc-dialog-inner-container {
  transition: opacity 75ms linear;
  transform: none;
}
.mdc-dialog--open .mat-mdc-dialog-inner-container {
  opacity: 1;
}
._mat-animation-noopable .mat-mdc-dialog-inner-container {
  transition: none;
}

.mat-mdc-dialog-surface {
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  outline: 0;
  transform: scale(0.8);
  transition: transform var(--mat-dialog-transition-duration, 0ms) cubic-bezier(0, 0, 0.2, 1);
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
  box-shadow: var(--mat-dialog-container-elevation-shadow, none);
  border-radius: var(--mat-dialog-container-shape, var(--mat-sys-corner-extra-large, 4px));
  background-color: var(--mat-dialog-container-color, var(--mat-sys-surface, white));
}
[dir=rtl] .mat-mdc-dialog-surface {
  text-align: right;
}
.mdc-dialog--open .mat-mdc-dialog-surface, .mdc-dialog--closing .mat-mdc-dialog-surface {
  transform: none;
}
._mat-animation-noopable .mat-mdc-dialog-surface {
  transition: none;
}
.mat-mdc-dialog-surface::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 2px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}

.mat-mdc-dialog-title {
  display: block;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  margin: 0 0 1px;
  padding: var(--mat-dialog-headline-padding, 6px 24px 13px);
}
.mat-mdc-dialog-title::before {
  display: inline-block;
  width: 0;
  height: 40px;
  content: "";
  vertical-align: 0;
}
[dir=rtl] .mat-mdc-dialog-title {
  text-align: right;
}
.mat-mdc-dialog-container .mat-mdc-dialog-title {
  color: var(--mat-dialog-subhead-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--mat-dialog-subhead-font, var(--mat-sys-headline-small-font, inherit));
  line-height: var(--mat-dialog-subhead-line-height, var(--mat-sys-headline-small-line-height, 1.5rem));
  font-size: var(--mat-dialog-subhead-size, var(--mat-sys-headline-small-size, 1rem));
  font-weight: var(--mat-dialog-subhead-weight, var(--mat-sys-headline-small-weight, 400));
  letter-spacing: var(--mat-dialog-subhead-tracking, var(--mat-sys-headline-small-tracking, 0.03125em));
}

.mat-mdc-dialog-content {
  display: block;
  flex-grow: 1;
  box-sizing: border-box;
  margin: 0;
  overflow: auto;
  max-height: 65vh;
}
.mat-mdc-dialog-content > :first-child {
  margin-top: 0;
}
.mat-mdc-dialog-content > :last-child {
  margin-bottom: 0;
}
.mat-mdc-dialog-container .mat-mdc-dialog-content {
  color: var(--mat-dialog-supporting-text-color, var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6)));
  font-family: var(--mat-dialog-supporting-text-font, var(--mat-sys-body-medium-font, inherit));
  line-height: var(--mat-dialog-supporting-text-line-height, var(--mat-sys-body-medium-line-height, 1.5rem));
  font-size: var(--mat-dialog-supporting-text-size, var(--mat-sys-body-medium-size, 1rem));
  font-weight: var(--mat-dialog-supporting-text-weight, var(--mat-sys-body-medium-weight, 400));
  letter-spacing: var(--mat-dialog-supporting-text-tracking, var(--mat-sys-body-medium-tracking, 0.03125em));
}
.mat-mdc-dialog-container .mat-mdc-dialog-content {
  padding: var(--mat-dialog-content-padding, 20px 24px);
}
.mat-mdc-dialog-container-with-actions .mat-mdc-dialog-content {
  padding: var(--mat-dialog-with-actions-content-padding, 20px 24px 0);
}
.mat-mdc-dialog-container .mat-mdc-dialog-title + .mat-mdc-dialog-content {
  padding-top: 0;
}

.mat-mdc-dialog-actions {
  display: flex;
  position: relative;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  min-height: 52px;
  margin: 0;
  border-top: 1px solid transparent;
  padding: var(--mat-dialog-actions-padding, 16px 24px);
  justify-content: var(--mat-dialog-actions-alignment, flex-end);
}
@media (forced-colors: active) {
  .mat-mdc-dialog-actions {
    border-top-color: CanvasText;
  }
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-start, .mat-mdc-dialog-actions[align=start] {
  justify-content: start;
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-center, .mat-mdc-dialog-actions[align=center] {
  justify-content: center;
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-end, .mat-mdc-dialog-actions[align=end] {
  justify-content: flex-end;
}
.mat-mdc-dialog-actions .mat-button-base + .mat-button-base,
.mat-mdc-dialog-actions .mat-mdc-button-base + .mat-mdc-button-base {
  margin-left: 8px;
}
[dir=rtl] .mat-mdc-dialog-actions .mat-button-base + .mat-button-base,
[dir=rtl] .mat-mdc-dialog-actions .mat-mdc-button-base + .mat-mdc-button-base {
  margin-left: 0;
  margin-right: 8px;
}

.mat-mdc-dialog-component-host {
  display: contents;
}
`],encapsulation:2,changeDetection:1})}return i})(),hi="--mat-dialog-transition-duration";function bi(i){return i==null?null:typeof i=="number"?i:i.endsWith("ms")?tn(i.substring(0,i.length-2)):i.endsWith("s")?tn(i.substring(0,i.length-1))*1e3:i==="0"?0:null}var it=(function(i){return i[i.OPEN=0]="OPEN",i[i.CLOSING=1]="CLOSING",i[i.CLOSED=2]="CLOSED",i})(it||{}),se=class{_ref;_config;_containerInstance;componentInstance;componentRef=null;disableClose;id;_afterOpened=new se$1(1);_beforeClosed=new se$1(1);_result;_closeFallbackTimeout;_state=it.OPEN;_closeInteractionType;constructor(s,e,t){this._ref=s,this._config=e,this._containerInstance=t,this.disableClose=e.disableClose,this.id=s.id,s.addPanelClass("mat-mdc-dialog-panel"),t._animationStateChanged.pipe(D(n=>n.state==="opened"),ee$1(1)).subscribe(()=>{this._afterOpened.next(),this._afterOpened.complete();}),t._animationStateChanged.pipe(D(n=>n.state==="closed"),ee$1(1)).subscribe(()=>{clearTimeout(this._closeFallbackTimeout),this._finishDialogClose();}),s.overlayRef.detachments().subscribe(()=>{this._beforeClosed.next(this._result),this._beforeClosed.complete(),this._finishDialogClose();}),Eo(this.backdropClick(),this.keydownEvents().pipe(D(n=>n.keyCode===27&&!this.disableClose&&!$i(n)))).subscribe(n=>{this.disableClose||(n.preventDefault(),_i(this,n.type==="keydown"?"keyboard":"mouse"));});}close(s){let e=this._config.closePredicate;e&&!e(s,this._config,this.componentInstance)||(this._result=s,this._containerInstance._animationStateChanged.pipe(D(t=>t.state==="closing"),ee$1(1)).subscribe(t=>{this._beforeClosed.next(s),this._beforeClosed.complete(),this._ref.overlayRef.detachBackdrop(),this._closeFallbackTimeout=setTimeout(()=>this._finishDialogClose(),t.totalTime+100);}),this._state=it.CLOSING,this._containerInstance._startExitAnimation());}afterOpened(){return this._afterOpened}afterClosed(){return this._ref.closed}beforeClosed(){return this._beforeClosed}backdropClick(){return this._ref.backdropClick}keydownEvents(){return this._ref.keydownEvents}updatePosition(s){let e=this._ref.config.positionStrategy;return s&&(s.left||s.right)?s.left?e.left(s.left):e.right(s.right):e.centerHorizontally(),s&&(s.top||s.bottom)?s.top?e.top(s.top):e.bottom(s.bottom):e.centerVertically(),this._ref.updatePosition(),this}updateSize(s="",e=""){return this._ref.updateSize(s,e),this}addPanelClass(s){return this._ref.addPanelClass(s),this}removePanelClass(s){return this._ref.removePanelClass(s),this}getState(){return this._state}_finishDialogClose(){this._state=it.CLOSED,this._ref.close(this._result,{focusOrigin:this._closeInteractionType}),this.componentInstance=null;}};function _i(i,s,e){return i._closeInteractionType=s,i.close(e)}var Ft=new T("MatMdcDialogData"),aa=new T("mat-mdc-dialog-default-options"),oa=new T("mat-mdc-dialog-scroll-strategy",{providedIn:"root",factory:()=>{let i=y(J);return ()=>Kt(i)}}),Ae=(()=>{class i{_defaultOptions=y(aa,{optional:true});_scrollStrategy=y(oa);_parentDialog=y(i,{optional:true,skipSelf:true});_idGenerator=y(dn);_injector=y(J);_dialog=y(Bt);_animationsDisabled=Et$1();_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new g;_afterOpenedAtThisLevel=new g;dialogConfigClass=at;_dialogRefConstructor;_dialogContainerType;_dialogDataToken;get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}afterAllClosed=ae(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(Un(void 0)));constructor(){this._dialogRefConstructor=se,this._dialogContainerType=ia,this._dialogDataToken=Ft;}open(e,t){let n;t=r(r({},this._defaultOptions||new at),t),t.id=t.id||this._idGenerator.getId("mat-mdc-dialog-"),t.scrollStrategy=t.scrollStrategy||this._scrollStrategy();let o=this._dialog.open(e,s(r({},t),{positionStrategy:oe(this._injector).centerHorizontally().centerVertically(),disableClose:true,closePredicate:void 0,closeOnDestroy:false,closeOnOverlayDetachments:false,disableAnimations:this._animationsDisabled||t.enterAnimationDuration?.toLocaleString()==="0"||t.exitAnimationDuration?.toString()==="0",container:{type:this._dialogContainerType,providers:()=>[{provide:this.dialogConfigClass,useValue:t},{provide:ee,useValue:t}]},templateContext:()=>({dialogRef:n}),providers:(c,u,b)=>(n=new this._dialogRefConstructor(c,t,b),n.updatePosition(t?.position),[{provide:this._dialogContainerType,useValue:b},{provide:this._dialogDataToken,useValue:u.data},{provide:this._dialogRefConstructor,useValue:n},{provide:re,useValue:null}])}));return n.componentRef=o.componentRef,n.componentInstance=o.componentInstance,this.openDialogs.push(n),this.afterOpened.next(n),n.afterClosed().subscribe(()=>{let c=this.openDialogs.indexOf(n);c>-1&&(this.openDialogs.splice(c,1),this.openDialogs.length||this._getAfterAllClosed().next());}),n}closeAll(){this._closeDialogs(this.openDialogs);}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){this._closeDialogs(this._openDialogsAtThisLevel),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete();}_closeDialogs(e){let t=e.length;for(;t--;)e[t].close();}static \u0275fac=function(t){return new(t||i)};static \u0275prov=Ct({token:i,factory:i.\u0275fac})}return i})(),gi=(()=>{class i{dialogRef=y(se,{optional:true});_elementRef=y(jn);_dialog=y(Ae);ariaLabel;type="button";dialogResult;_matDialogClose;ngOnInit(){this.dialogRef||(this.dialogRef=xi(this._elementRef,this._dialog.openDialogs));}ngOnChanges(e){let t=e._matDialogClose;t&&(this.dialogResult=t.currentValue);}_onButtonClick(e){this._elementRef.nativeElement.getAttribute("aria-disabled")!=="true"&&_i(this.dialogRef,e.screenX===0&&e.screenY===0?"keyboard":"mouse",this.dialogResult);}static \u0275fac=function(t){return new(t||i)};static \u0275dir=hv({type:i,selectors:[["","mat-dialog-close",""],["","matDialogClose",""]],hostVars:2,hostBindings:function(t,n){t&1&&Fd("click",function(c){return n._onButtonClick(c)}),t&2&&bd("aria-label",n.ariaLabel||null)("type",n.type);},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],type:"type",dialogResult:[0,"mat-dialog-close","dialogResult"],_matDialogClose:[0,"matDialogClose","_matDialogClose"]},exportAs:["matDialogClose"],features:[_p]})}return i})(),fi=(()=>{class i{_dialogRef=y(se,{optional:true});_elementRef=y(jn);_dialog=y(Ae);ngOnInit(){this._dialogRef||(this._dialogRef=xi(this._elementRef,this._dialog.openDialogs)),this._dialogRef&&Promise.resolve().then(()=>{this._onAdd();});}ngOnDestroy(){this._dialogRef?._containerInstance&&Promise.resolve().then(()=>{this._onRemove();});}static \u0275fac=function(t){return new(t||i)};static \u0275dir=hv({type:i})}return i})(),vi=(()=>{class i extends fi{id=y(dn).getId("mat-mdc-dialog-title-");_onAdd(){this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);}_onRemove(){this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);}static \u0275fac=(()=>{let e;return function(n){return (e||(e=Wp(i)))(n||i)}})();static \u0275dir=hv({type:i,selectors:[["","mat-dialog-title",""],["","matDialogTitle",""]],hostAttrs:[1,"mat-mdc-dialog-title","mdc-dialog__title"],hostVars:1,hostBindings:function(t,n){t&2&&Ld("id",n.id);},inputs:{id:"id"},exportAs:["matDialogTitle"],features:[Cd]})}return i})(),yi=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275dir=hv({type:i,selectors:[["","mat-dialog-content",""],["mat-dialog-content"],["","matDialogContent",""]],hostAttrs:[1,"mat-mdc-dialog-content","mdc-dialog__content"],features:[Iv([he])]})}return i})(),Ci=(()=>{class i extends fi{align;_onAdd(){this._dialogRef._containerInstance?._updateActionSectionCount?.(1);}_onRemove(){this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);}static \u0275fac=(()=>{let e;return function(n){return (e||(e=Wp(i)))(n||i)}})();static \u0275dir=hv({type:i,selectors:[["","mat-dialog-actions",""],["mat-dialog-actions"],["","matDialogActions",""]],hostAttrs:[1,"mat-mdc-dialog-actions","mdc-dialog__actions"],hostVars:6,hostBindings:function(t,n){t&2&&Wd("mat-mdc-dialog-actions-align-start",n.align==="start")("mat-mdc-dialog-actions-align-center",n.align==="center")("mat-mdc-dialog-actions-align-end",n.align==="end");},inputs:{align:"align"},features:[Cd]})}return i})();function xi(i,s){let e=i.nativeElement.parentElement;for(;e&&!e.classList.contains("mat-mdc-dialog-container");)e=e.parentElement;return e?s.find(t=>t.id===e.id):null}var ot=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=dv({type:i});static \u0275inj=tc({providers:[Ae],imports:[mi,ge$1,Yt$1,At$1]})}return i})();function ca(i,s){if(i&1&&(ao(0,"div",1),Ay(1),fa$1()),i&2){let e=ty();Sg(),va$2(" ",e.facade.errorComando()," ");}}function ma(i,s){i&1&&(ao(0,"mat-error"),Ay(1,"La decisi\xF3n es obligatoria"),fa$1());}function ua(i,s){i&1&&Ad(0,"mat-spinner",12);}function pa(i,s){i&1&&Ay(0," Enviar ");}var rt=class i{dialogRef=y(se);data=y(Ft);facade=y(y$1);fb=y(Ea);auditor="auditor@sura.com.co";enviando=Ee(false);form=this.fb.group({decision:["",[Re.required]],codigoNovedad:[""]});enviar(){return u(this,null,function*(){if(this.form.invalid){this.form.markAllAsTouched();return}this.enviando.set(true);let{decision:s,codigoNovedad:e}=this.form.value,t={decision:s,codigoNovedad:e||void 0},n=yield this.facade.enviar(this.data.codigoCuenta,t,this.auditor);this.enviando.set(false),n&&this.dialogRef.close(true);})}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=lv({type:i,selectors:[["sura-enviar-cuenta-dialog"]],decls:26,vars:7,consts:[["mat-dialog-title",""],[1,"error-banner"],[3,"formGroup"],["appearance","outline",1,"full-width","mt-3"],["formControlName","decision"],["value","ACEPTAR"],["value","DENEGAR"],["appearance","outline",1,"full-width"],["matInput","","formControlName","codigoNovedad","placeholder","Ej. NOV-001"],["align","end"],["mat-button","","mat-dialog-close","",3,"disabled"],["mat-raised-button","","color","primary",3,"click","disabled"],["diameter","20"]],template:function(e,t){e&1&&(ao(0,"h2",0),Ay(1),fa$1(),ao(2,"mat-dialog-content")(3,"p"),Ay(4,"Seleccione la decisi\xF3n para enviar la cuenta al sistema principal."),fa$1(),Lv(5,ca,2,1,"div",1),ao(6,"form",2)(7,"mat-form-field",3)(8,"mat-label"),Ay(9,"Decisi\xF3n"),fa$1(),ao(10,"mat-select",4)(11,"mat-option",5),Ay(12,"Aceptar (Aprobar)"),fa$1(),ao(13,"mat-option",6),Ay(14,"Denegar (Rechazar)"),fa$1()(),Im(),Lv(15,ma,2,0,"mat-error"),fa$1(),ao(16,"mat-form-field",7)(17,"mat-label"),Ay(18,"C\xF3digo de Novedad (Opcional)"),fa$1(),Ad(19,"input",8),Im(),fa$1()()(),ao(20,"mat-dialog-actions",9)(21,"button",10),Ay(22,"Cancelar"),fa$1(),ao(23,"button",11),Fd("click",function(){return t.enviar()}),Lv(24,ua,1,0,"mat-spinner",12)(25,pa,1,0),fa$1()()),e&2&&(Sg(),va$2("Enviar Cuenta ",t.data.codigoCuenta),Sg(4),Pv(t.facade.errorComando()?5:-1),Sg(),xd("formGroup",t.form),Sg(4),Dm(),Sg(5),Pv(t.form.get("decision")?.hasError("required")?15:-1),Sg(4),Dm(),Sg(2),xd("disabled",t.enviando()),Sg(2),xd("disabled",t.form.invalid||t.enviando()),Sg(),Pv(t.enviando()?24:25));},dependencies:[Ut,Aa,Ca$1,ni,va$1,_a$1,ro,no,ot,gi,vi,Ci,yi,Bl,Ll,I,an,Le,rn,We,$e,Ci$1,vi$1,j,bn,_n],styles:[".full-width[_ngcontent-%COMP%]{width:100%}.mt-3[_ngcontent-%COMP%]{margin-top:1rem}.error-banner[_ngcontent-%COMP%]{background-color:#ffebee;color:#c62828;padding:.75rem;border-radius:4px;margin-bottom:1rem}"]})};function ha(i,s){i&1&&(ao(0,"div",8),Ad(1,"mat-spinner"),ao(2,"p"),Ay(3,"Cargando informaci\xF3n de la cuenta..."),fa$1()());}function ba(i,s){if(i&1&&(ao(0,"div",9)(1,"mat-icon"),Ay(2,"error"),fa$1(),ao(3,"span"),Ay(4),fa$1()()),i&2){let e=ty();Sg(4),Jd(e.facade.cuentaError()?.message);}}function _a(i,s){if(i&1&&(ao(0,"span",14),Ay(1),fa$1()),i&2){let e=ty();Sg(),va$2(" ",e.pendientesSinResolver," pendiente(s) de cabecera ");}}function ga(i,s){i&1&&(ao(0,"div",23),Ay(1," Consultando qu\xE9 acciones est\xE1n habilitadas\u2026 "),fa$1());}function fa(i,s){i&1&&(ao(0,"div",23),Ay(1," Resuelva todos los pendientes para enviar. "),fa$1());}function va(i,s){i&1&&(ao(0,"span",32),Ay(1,"Consultando\u2026"),fa$1());}function ya(i,s){if(i&1&&(ao(0,"li",40),Ay(1),fa$1()),i&2){let e=s.$implicit,t=ty(3);Sg(),Jd(t.etiquetaAccion(e));}}function Ca(i,s){if(i&1&&(ao(0,"ul",33),Vv(1,ya,2,1,"li",40,jv),fa$1()),i&2){let e=ty(2);Sg(),Hv(e.facade.acciones());}}function xa(i,s){i&1&&(ao(0,"span",32),Ay(1,"Ninguna en el estado actual."),fa$1());}function Ma(i,s){if(i&1&&(ao(0,"div")(1,"dt"),Ay(2,"Observaciones internas"),fa$1(),ao(3,"dd"),Ay(4),fa$1()()),i&2){let e=ty(2);Sg(4),Jd(e.observacionesInternas);}}function Da(i,s){if(i&1&&(ao(0,"div")(1,"dt"),Ay(2,"Observaciones externas "),ao(3,"span",32),Ay(4,"(notas para la glosa o devoluci\xF3n)"),fa$1()(),ao(5,"dd"),Ay(6),fa$1()()),i&2){let e=ty(2);Sg(6),Jd(e.observacionesExternas);}}function ka(i,s){if(i&1&&(ao(0,"section",45)(1,"h3",44),Ay(2,"Observaciones"),fa$1(),ao(3,"dl",46),Lv(4,Ma,5,1,"div"),Lv(5,Da,7,1,"div"),fa$1()()),i&2){let e=ty();Sg(4),Pv(e.observacionesInternas?4:-1),Sg(),Pv(e.observacionesExternas?5:-1);}}function Ta(i,s){if(i&1){let e=Wv();ao(0,"mat-expansion-panel",25),Fd("opened",function(){Mc(e);let n=ty(2);return Nc(n.panelPrestadorAbierto.set(true))})("closed",function(){Mc(e);let n=ty(2);return Nc(n.panelPrestadorAbierto.set(false))}),ao(1,"mat-expansion-panel-header",41)(2,"mat-panel-title")(3,"mat-icon",27),Ay(4,"local_hospital"),fa$1(),Ay(5," Prestador de facturaci\xF3n "),fa$1(),ao(6,"mat-panel-description"),Ay(7),fa$1()(),ao(8,"div",28)(9,"div",42)(10,"section",43)(11,"h3",44),Ay(12,"Identificaci\xF3n y tr\xE1mite"),fa$1(),ao(13,"dl",29)(14,"div")(15,"dt"),Ay(16,"Prestador (NIT)"),fa$1(),ao(17,"dd"),Ay(18),fa$1()(),ao(19,"div")(20,"dt"),Ay(21,"N\xB0 Factura"),fa$1(),ao(22,"dd"),Ay(23),fa$1()(),ao(24,"div")(25,"dt"),Ay(26,"N\xB0 Radicado"),fa$1(),ao(27,"dd"),Ay(28),fa$1()(),ao(29,"div")(30,"dt"),Ay(31,"Tipo de servicio"),fa$1(),ao(32,"dd"),Ay(33),fa$1()(),ao(34,"div")(35,"dt"),Ay(36,"Pagar a prestador (NIT)"),fa$1(),ao(37,"dd"),Ay(38),fa$1()()()(),ao(39,"section",43)(40,"h3",44),Ay(41,"Fechas"),fa$1(),ao(42,"dl",29)(43,"div")(44,"dt"),Ay(45,"Radicaci\xF3n"),fa$1(),ao(46,"dd"),Ay(47),Wy(48,"date"),fa$1()(),ao(49,"div")(50,"dt"),Ay(51,"Emisi\xF3n"),fa$1(),ao(52,"dd"),Ay(53),Wy(54,"date"),fa$1()(),ao(55,"div")(56,"dt"),Ay(57,"Vencimiento"),fa$1(),ao(58,"dd"),Ay(59),Wy(60,"date"),fa$1()(),ao(61,"div")(62,"dt"),Ay(63,"Ingreso"),fa$1(),ao(64,"dd"),Ay(65),Wy(66,"date"),fa$1()(),ao(67,"div")(68,"dt"),Ay(69,"Egreso"),fa$1(),ao(70,"dd"),Ay(71),Wy(72,"date"),fa$1()()()(),ao(73,"section",43)(74,"h3",44),Ay(75,"Valores"),fa$1(),ao(76,"dl",29)(77,"div")(78,"dt"),Ay(79,"Valor factura"),fa$1(),ao(80,"dd"),Ay(81),Wy(82,"currency"),fa$1()(),ao(83,"div")(84,"dt"),Ay(85,"Valor total factura"),fa$1(),ao(86,"dd"),Ay(87),Wy(88,"currency"),fa$1()(),ao(89,"div")(90,"dt"),Ay(91,"Total cargado"),fa$1(),ao(92,"dd"),Ay(93),Wy(94,"currency"),fa$1()(),ao(95,"div")(96,"dt"),Ay(97,"Total convenido"),fa$1(),ao(98,"dd"),Ay(99),Wy(100,"currency"),fa$1()(),ao(101,"div")(102,"dt"),Ay(103,"Total valor glosado"),fa$1(),ao(104,"dd"),Ay(105),Wy(106,"currency"),fa$1()(),ao(107,"div")(108,"dt"),Ay(109,"Valor NC cr\xE9dito"),fa$1(),ao(110,"dd"),Ay(111),Wy(112,"currency"),fa$1()()()(),ao(113,"section",43)(114,"h3",44),Ay(115,"Marcas y acuse"),fa$1(),ao(116,"dl",29)(117,"div")(118,"dt"),Ay(119,"Acuse de recibido"),fa$1(),ao(120,"dd"),Ay(121),fa$1()(),ao(122,"div")(123,"dt"),Ay(124,"Marca radicado ATEP"),fa$1(),ao(125,"dd"),Ay(126),fa$1()(),ao(127,"div")(128,"dt"),Ay(129,"Marca multicore"),fa$1(),ao(130,"dd"),Ay(131),fa$1()(),ao(132,"div")(133,"dt"),Ay(134,"Marca pendiente manual"),fa$1(),ao(135,"dd"),Ay(136),fa$1()()()(),Lv(137,ka,6,2,"section",45),fa$1()()();}if(i&2){let e=s,t=ty(2);xd("expanded",t.panelPrestadorAbierto()),Sg(7),Jd(t.resumenPrestador(e)),Sg(11),Jd(e.prestadorFacturacionNit??"\u2014"),Sg(5),Jd(e.numeroFactura??"\u2014"),Sg(5),Jd(e.numeroRadicado??"\u2014"),Sg(5),Jd(e.tipoServicio??"\u2014"),Sg(5),Jd(e.pagarAPrestadorNit??"\u2014"),Sg(9),Jd(Qy(48,23,e.fechaRadicacion,"dd/MM/yyyy")??"\u2014"),Sg(6),Jd(Qy(54,26,e.fechaEmision,"dd/MM/yyyy")??"\u2014"),Sg(6),Jd(Qy(60,29,e.fechaVencimiento,"dd/MM/yyyy")??"\u2014"),Sg(6),Jd(Qy(66,32,e.fechaIngreso,"dd/MM/yyyy")??"\u2014"),Sg(6),Jd(Qy(72,35,e.fechaEgreso,"dd/MM/yyyy")??"\u2014"),Sg(10),Jd(e.valorFactura===null?"\u2014":Zy(82,38,e.valorFactura,"COP","symbol","1.0-0")),Sg(6),Jd(e.valorTotalFactura===null?"\u2014":Zy(88,43,e.valorTotalFactura,"COP","symbol","1.0-0")),Sg(6),Jd(e.totalCargado===null?"\u2014":Zy(94,48,e.totalCargado,"COP","symbol","1.0-0")),Sg(6),Jd(e.totalConvenido===null?"\u2014":Zy(100,53,e.totalConvenido,"COP","symbol","1.0-0")),Sg(6),Jd(e.totalValorGlosado===null?"\u2014":Zy(106,58,e.totalValorGlosado,"COP","symbol","1.0-0")),Sg(6),Jd(e.valorNotaCredito===null?"\u2014":Zy(112,63,e.valorNotaCredito,"COP","symbol","1.0-0")),Sg(10),Jd(e.acuseRecibido??"\u2014"),Sg(5),Jd(e.marcaRadicadoAtep??"\u2014"),Sg(5),Jd(e.marcaMulticore??"\u2014"),Sg(5),Jd(e.marcaPendienteManual??"\u2014"),Sg(),Pv(e.observacionesInternas||e.observacionesExternas?137:-1);}}function Ia(i,s){if(i&1&&(ao(0,"span",38),Ay(1),fa$1()),i&2){let e=ty();Sg(),Jd(e.pendientesSinResolver);}}function wa(i,s){if(i&1){let e=Wv();ao(0,"div",10)(1,"div",11)(2,"div",12)(3,"h1"),Ay(4),fa$1(),ao(5,"span",13),Ay(6),fa$1(),Lv(7,_a,2,1,"span",14),fa$1(),ao(8,"div",15)(9,"div",16)(10,"label"),Ay(11,"Total Autorizado"),fa$1(),ao(12,"span",17),Ay(13),Wy(14,"currency"),fa$1()(),ao(15,"div",16)(16,"label"),Ay(17,"Total Cubierto"),fa$1(),ao(18,"span",17),Ay(19),Wy(20,"currency"),fa$1()(),ao(21,"div",16)(22,"label"),Ay(23,"No reconocido"),fa$1(),ao(24,"span",18),Ay(25),Wy(26,"currency"),fa$1()()(),ao(27,"div",19)(28,"button",20)(29,"mat-icon"),Ay(30,"more_vert"),fa$1()(),ao(31,"mat-menu",null,0)(33,"button",21),Fd("click",function(){let n=Mc(e),o=ty();return Nc(o.abrirDialogoEnviar(n))}),ao(34,"mat-icon",22),Ay(35,"send"),fa$1(),ao(36,"span"),Ay(37,"Enviar Cuenta"),fa$1()(),Lv(38,ga,2,0,"div",23)(39,fa,2,0,"div",23),fa$1()()(),ao(40,"mat-accordion",24)(41,"mat-expansion-panel",25),Fd("opened",function(){Mc(e);let n=ty();return Nc(n.panelCuentaAbierto.set(true))})("closed",function(){Mc(e);let n=ty();return Nc(n.panelCuentaAbierto.set(false))}),ao(42,"mat-expansion-panel-header",26)(43,"mat-panel-title")(44,"mat-icon",27),Ay(45,"description"),fa$1(),Ay(46," Datos de la cuenta "),fa$1(),ao(47,"mat-panel-description"),Ay(48),Wy(49,"date"),Wy(50,"date"),fa$1()(),ao(51,"div",28)(52,"dl",29)(53,"div")(54,"dt"),Ay(55,"Periodo de la cuenta"),fa$1(),ao(56,"dd"),Ay(57),Wy(58,"date"),Wy(59,"date"),fa$1()(),ao(60,"div")(61,"dt"),Ay(62,"Estado"),fa$1(),ao(63,"dd"),Ay(64),fa$1()(),ao(65,"div")(66,"dt"),Ay(67,"Versi\xF3n"),fa$1(),ao(68,"dd"),Ay(69),fa$1()(),ao(70,"div")(71,"dt"),Ay(72,"Pendientes sin resolver"),fa$1(),ao(73,"dd"),Ay(74),fa$1()()(),ao(75,"div",30)(76,"span",31),Ay(77," Acciones habilitadas por el sistema de registro "),fa$1(),Lv(78,va,2,0,"span",32)(79,Ca,3,0,"ul",33)(80,xa,2,0,"span",32),fa$1()()(),Lv(81,Ta,138,68,"mat-expansion-panel",34),fa$1()(),ao(82,"nav",35)(83,"a",36,1),Ay(85," L\xEDneas "),fa$1(),ao(86,"a",37,2),Ay(88," Pendientes "),Lv(89,Ia,2,1,"span",38),fa$1(),ao(90,"a",39,3),Ay(92," Seguimiento "),fa$1()(),ao(93,"mat-tab-nav-panel",null,4),Ad(95,"router-outlet"),fa$1();}if(i&2){let e,t=s,n=ly(32),o=ly(84),c=ly(87),u=ly(91),b=ly(94),_=ty();Sg(4),va$2("Cuenta ",t.codigo),Sg(2),Jd(t.estado),Sg(),Pv(t.pendientesSinResolver>0?7:-1),Sg(6),Jd(Zy(14,25,t.totalAutorizado,"COP","symbol","1.0-0")),Sg(6),Jd(Zy(20,30,t.totalCubierto,"COP","symbol","1.0-0")),Sg(6),va$2(" ",Zy(26,35,_.diferencia(t),"COP","symbol","1.0-0")," "),Sg(3),xd("matMenuTriggerFor",n),Sg(5),xd("disabled",_.facade.accionesCargando()||!_.puedeEnviar(t)),Sg(5),Pv(_.facade.accionesCargando()?38:!_.puedeEnviar(t)&&t.pendientesSinResolver>0?39:-1),Sg(3),xd("expanded",_.panelCuentaAbierto()),Sg(7),ef(" ",Qy(49,40,t.fechaInicio,"dd/MM/yyyy")," \u2014 ",Qy(50,43,t.fechaFin,"dd/MM/yyyy")," \xB7 v",t.version," "),Sg(9),Xd("",Qy(58,46,t.fechaInicio,"dd/MM/yyyy")," \u2014 ",Qy(59,49,t.fechaFin,"dd/MM/yyyy")),Sg(7),Jd(t.estado),Sg(5),Jd(t.version),Sg(5),Jd(t.pendientesSinResolver),Sg(4),Pv(_.facade.accionesCargando()?78:_.facade.acciones().length>0?79:80),Sg(3),Pv((e=t.informacionFacturacion)?81:-1,e),Sg(),xd("tabPanel",b),Sg(),xd("active",o.isActive),Sg(3),xd("active",c.isActive),Sg(3),Pv(t.pendientesSinResolver>0?89:-1),Sg(),xd("active",u.isActive);}}var Mi="auditoria.cuenta-detalle.paneles",Di=class i{codigo;facade=y(y$1);router=y(F);dialog=y(Ae);snackBar=y(Dn);panelCuentaAbierto=Ee(this.preferencia("cuenta",false));panelPrestadorAbierto=Ee(this.preferencia("prestador",true));constructor(){Fi(()=>this.guardarPreferencias({cuenta:this.panelCuentaAbierto(),prestador:this.panelPrestadorAbierto()}));}ngOnInit(){this.facade.buscar(this.codigo);}irAlInicio(){this.router.navigate(["/auditoria"]);}puedeEnviar(s){return this.facade.permite("ENVIAR")&&s.pendientesSinResolver===0}etiquetaAccion(s){return {ENVIAR:"Enviar",SEGUIR_PROCESO:"Seguir proceso",RESOLVER_PENDIENTE:"Resolver pendientes",RESOLVER_PENDIENTE_LINEA:"Resolver pendientes de l\xEDnea",DEVOLVER_A_MODIFICACION:"Devolver a modificaci\xF3n",DEVOLVER_A_BENEFICIOS_MANUALES:"Devolver a beneficios manuales",DEVOLVER_A_TARIFACION_MANUAL:"Devolver a tarifaci\xF3n manual",REVERTIR_FINALIZACION:"Revertir finalizaci\xF3n",DESBLOQUEAR_LINEAS:"Desbloquear l\xEDneas",DESHACER_REEMPLAZOS:"Deshacer reemplazos",ANULAR:"Anular"}[s]??s}resumenPrestador(s){let e=[s.prestadorFacturacionNit?`NIT ${s.prestadorFacturacionNit}`:null,s.numeroFactura?`Factura ${s.numeroFactura}`:null,s.numeroRadicado?`Radicado ${s.numeroRadicado}`:null].filter(Boolean);return e.length>0?e.join(" \xB7 "):"Sin datos de facturaci\xF3n"}diferencia(s){return s.totalAutorizado-s.totalCubierto}abrirDialogoEnviar(s){this.dialog.open(rt,{width:"400px",data:{codigoCuenta:s.codigo}}).afterClosed().subscribe(t=>{t&&this.snackBar.open("Cuenta enviada correctamente","Cerrar",{duration:3e3});});}preferencia(s,e){try{let t=localStorage.getItem(Mi);if(!t)return e;let n=JSON.parse(t);return typeof n[s]=="boolean"?n[s]:e}catch(t){return e}}guardarPreferencias(s){try{localStorage.setItem(Mi,JSON.stringify(s));}catch(e){}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=lv({type:i,selectors:[["sura-cuenta-detalle"]],inputs:{codigo:"codigo"},decls:9,vars:3,consts:[["accionesMenu","matMenu"],["rlaLineas","routerLinkActive"],["rlaPendientes","routerLinkActive"],["rlaProceso","routerLinkActive"],["tabPanel",""],[1,"detalle-container"],[1,"barra-superior"],["mat-button","","type","button","id","btn-inicio","matTooltip","Volver a la b\xFAsqueda de cuentas","aria-label","Volver al inicio",1,"inicio",3,"click"],[1,"loading-overlay"],[1,"error-banner"],[1,"header-section"],[1,"header-resumen"],[1,"titulo"],[1,"estado-badge"],[1,"estado-badge","estado-badge--alerta"],[1,"resumen-financiero"],[1,"dato"],[1,"valor"],[1,"valor","valor--diferencia"],[1,"header-acciones"],["mat-icon-button","","aria-label","Acciones de la cuenta",3,"matMenuTriggerFor"],["mat-menu-item","",3,"click","disabled"],["color","primary"],[1,"menu-helper-text"],["multi","",1,"header-detalle"],[3,"opened","closed","expanded"],["collapsedHeight","44px","expandedHeight","44px","aria-label","Datos de la cuenta"],["aria-hidden","true"],[1,"panel-cuerpo"],[1,"detalle-cabecera"],[1,"acciones-disponibles"],[1,"acciones-disponibles__titulo"],[1,"sura-texto-suave"],[1,"acciones-disponibles__lista"],[3,"expanded"],["mat-tab-nav-bar","",3,"tabPanel"],["mat-tab-link","","routerLink","lineas","routerLinkActive","",3,"active"],["mat-tab-link","","routerLink","pendientes","routerLinkActive","",3,"active"],[1,"badge"],["mat-tab-link","","routerLink","proceso","routerLinkActive","",3,"active"],[1,"sura-distintivo","sura-distintivo--info"],["collapsedHeight","44px","expandedHeight","44px","aria-label","Prestador de facturaci\xF3n"],[1,"grupos"],[1,"grupo"],[1,"grupo__titulo"],[1,"grupo","grupo--ancho"],[1,"detalle-cabecera","detalle-cabecera--observaciones"]],template:function(e,t){if(e&1&&(ao(0,"div",5)(1,"div",6)(2,"button",7),Fd("click",function(){return t.irAlInicio()}),ao(3,"mat-icon"),Ay(4,"home"),fa$1(),Ay(5," Inicio "),fa$1()(),Lv(6,ha,4,0,"div",8),Lv(7,ba,5,1,"div",9),Lv(8,wa,96,52),fa$1()),e&2){let n;Sg(6),Pv(t.facade.loading()?6:-1),Sg(),Pv(t.facade.cuentaError()?7:-1),Sg(),Pv((n=t.facade.cuenta())?8:-1,n);}},dependencies:[Ut,aa$1,br,$t,ta$1,ri,Et,oi,Pt,Bl,Ll,Uo,sd,ad,bn,_n,ci,ge,Se,di,ot,Dt,Yt,mt,dt,rt$1,_n$1,xn,st,ot$1,kt,Nt],styles:[".acciones-disponibles__titulo[_ngcontent-%COMP%], .detalle-cabecera[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%], .grupo__titulo[_ngcontent-%COMP%], .dato[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-size:var(--sura-texto-sm);text-transform:uppercase;letter-spacing:.04em;color:var(--sura-texto-suave);font-weight:var(--sura-peso-semibold)}.barra-superior[_ngcontent-%COMP%]{margin-bottom:var(--sura-espacio-3)}.barra-superior[_ngcontent-%COMP%]   .inicio[_ngcontent-%COMP%]{font-weight:var(--sura-peso-semibold);color:var(--sura-azul-primario)}.detalle-container[_ngcontent-%COMP%]{padding:var(--sura-espacio-4);max-width:var(--sura-ancho-xl);margin-inline:auto}.header-section[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--sura-espacio-3);margin-bottom:var(--sura-espacio-4);padding:var(--sura-espacio-4);background:var(--sura-blanco);border-radius:var(--sura-radio-16);box-shadow:var(--sura-sombra-sm);border-top:4px solid var(--sura-azul-institucional)}.header-resumen[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:center;gap:var(--sura-espacio-3) var(--sura-espacio-5)}.titulo[_ngcontent-%COMP%]{display:flex;align-items:center;flex-wrap:wrap;gap:var(--sura-espacio-3)}.titulo[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{margin:0;color:var(--sura-azul-institucional);font-weight:var(--sura-peso-bold)}.estado-badge[_ngcontent-%COMP%]{background-color:var(--sura-info-fondo);color:var(--sura-info);padding:.25rem .75rem;border-radius:var(--sura-radio-pill);font-weight:var(--sura-peso-semibold);font-size:var(--sura-texto-sm);white-space:nowrap}.estado-badge--alerta[_ngcontent-%COMP%]{background-color:var(--sura-alerta-fondo);color:var(--sura-alerta)}.resumen-financiero[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:var(--sura-espacio-4)}.dato[_ngcontent-%COMP%]{display:flex;flex-direction:column}.dato[_ngcontent-%COMP%]   .valor[_ngcontent-%COMP%]{font-size:var(--sura-h2);font-weight:var(--sura-peso-bold);color:var(--sura-texto);line-height:1.2}.valor--diferencia[_ngcontent-%COMP%]{color:var(--sura-alerta)}.header-acciones[_ngcontent-%COMP%]{margin-left:auto}.menu-helper-text[_ngcontent-%COMP%]{padding:var(--sura-espacio-2) var(--sura-espacio-3);font-size:var(--sura-texto-sm);color:var(--sura-alerta);max-width:220px;white-space:normal;line-height:1.3}.header-detalle[_ngcontent-%COMP%]   .mat-expansion-panel[_ngcontent-%COMP%] + .mat-expansion-panel[_ngcontent-%COMP%]{margin-top:var(--sura-espacio-2)}.panel-cuerpo[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--sura-espacio-3)}.grupos[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr));gap:var(--sura-espacio-2) var(--sura-espacio-3);align-items:start}.grupo[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--sura-espacio-2)}.grupo--ancho[_ngcontent-%COMP%]{grid-column:1/-1}.grupo__titulo[_ngcontent-%COMP%]{margin:0}.detalle-cabecera[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(140px,100%),1fr));gap:var(--sura-espacio-2) var(--sura-espacio-3);margin:0;padding:var(--sura-espacio-2) var(--sura-espacio-3);background:var(--sura-gris-100);border-radius:var(--sura-radio-12)}.detalle-cabecera[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%]{line-height:1.3}.detalle-cabecera[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%]{margin:var(--sura-espacio-1) 0 0;font-weight:var(--sura-peso-bold);color:var(--sura-texto);line-height:1.3;overflow-wrap:anywhere}.detalle-cabecera--observaciones[_ngcontent-%COMP%]{grid-template-columns:1fr}.detalle-cabecera--observaciones[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%]{font-weight:var(--sura-peso-normal);white-space:pre-line}.acciones-disponibles[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--sura-espacio-2)}.acciones-disponibles__lista[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:var(--sura-espacio-2);list-style:none;margin:0;padding:0}.loading-overlay[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:var(--sura-espacio-3);padding:var(--sura-espacio-5);color:var(--sura-texto-suave)}.error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:var(--sura-espacio-2);padding:var(--sura-espacio-3);background-color:var(--sura-error-fondo);color:var(--sura-error);border-left:4px solid var(--sura-error);border-radius:var(--sura-radio-12);margin-bottom:var(--sura-espacio-3)}.badge[_ngcontent-%COMP%]{background-color:var(--sura-error);color:var(--sura-blanco);border-radius:var(--sura-radio-pill);padding:.1rem .45rem;font-size:var(--sura-texto-sm);font-weight:var(--sura-peso-semibold);margin-left:var(--sura-espacio-2)}@media(max-width:640px){.dato[_ngcontent-%COMP%]   .valor[_ngcontent-%COMP%]{font-size:var(--sura-texto-lg)}}"]})};export{Di as CuentaDetalleComponent};