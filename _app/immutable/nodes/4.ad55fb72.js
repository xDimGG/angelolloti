import{s as K,n as R}from"../chunks/scheduler.e108d1fd.js";import{S as L,i as M,s as D,g as d,m as T,H as O,F as Q,f as n,c as E,h,j as p,n as z,y as U,E as W,k as m,a as G,x as t,o as J}from"../chunks/index.48054bed.js";function X(f){let i,v,s,a,o,u,x=f[0].title+"",k,H,l,g,w=new Date(f[0].date).toDateString().split(" ").slice(1).join(" ")+"",y,I,V,A,r,q="other stuff",P,b,S=f[0].content+"";return document.title=i=f[0].title,{c(){v=D(),s=d("div"),a=d("div"),o=d("div"),u=d("h1"),k=T(x),H=D(),l=d("div"),g=d("span"),y=T(w),I=D(),V=d("br"),A=D(),r=d("a"),r.textContent=q,P=D(),b=new O(!1),this.h()},l(e){Q("svelte-w0iak9",document.head).forEach(n),v=E(e),s=h(e,"DIV",{class:!0});var B=p(s);a=h(B,"DIV",{class:!0});var j=p(a);o=h(j,"DIV",{class:!0});var C=p(o);u=h(C,"H1",{class:!0});var F=p(u);k=z(F,x),F.forEach(n),H=E(C),l=h(C,"DIV",{class:!0});var _=p(l);g=h(_,"SPAN",{});var N=p(g);y=z(N,w),N.forEach(n),I=E(_),V=h(_,"BR",{}),A=E(_),r=h(_,"A",{href:!0,class:!0,"data-svelte-h":!0}),U(r)!=="svelte-n8o8wn"&&(r.textContent=q),_.forEach(n),C.forEach(n),P=E(j),b=W(j,!1),j.forEach(n),B.forEach(n),this.h()},h(){m(u,"class","mb-0"),m(r,"href","/blog/"),m(r,"class","text-white text-opacity-50 pt-2 block"),m(l,"class","text-white block text-xs text-right text-opacity-50 shrink-0 ml-2"),m(o,"class","flex justify-between"),b.a=null,m(a,"class","prose prose-img:max-h-[80vh] prose-gray dark:prose-invert lg:max-w-[1000px] mx-auto"),m(s,"class","min-h-screen w-full dark:bg-slate-900 px-3 py-8")},m(e,c){G(e,v,c),G(e,s,c),t(s,a),t(a,o),t(o,u),t(u,k),t(o,H),t(o,l),t(l,g),t(g,y),t(l,I),t(l,V),t(l,A),t(l,r),t(a,P),b.m(S,a)},p(e,[c]){c&1&&i!==(i=e[0].title)&&(document.title=i),c&1&&x!==(x=e[0].title+"")&&J(k,x),c&1&&w!==(w=new Date(e[0].date).toDateString().split(" ").slice(1).join(" ")+"")&&J(y,w),c&1&&S!==(S=e[0].content+"")&&b.p(S)},i:R,o:R,d(e){e&&(n(v),n(s))}}}function Y(f,i,v){let{data:s}=i;return f.$$set=a=>{"data"in a&&v(0,s=a.data)},[s]}class tt extends L{constructor(i){super(),M(this,i,Y,X,K,{data:0})}}export{tt as component};
