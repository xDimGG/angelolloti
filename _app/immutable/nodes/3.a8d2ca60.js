import{s as P,n as D}from"../chunks/scheduler.e108d1fd.js";import{S as V,i as j,g as v,s as L,F as q,h as x,f as m,c as y,j as w,y as z,k as u,x as i,a as A,B as F,m as b,n as E,o as C}from"../chunks/index.48054bed.js";import{e as I}from"../chunks/each.e59479a4.js";function B(_,t,r){const s=_.slice();return s[1]=t[r].id,s[2]=t[r].title,s[3]=t[r].date,s}function N(_){let t,r,s=_[2]+"",o,c,k,h,p,d=new Date(_[3]).toLocaleDateString()+"",l,a,f;return{c(){t=v("li"),r=v("a"),o=b(s),k=L(),h=v("span"),p=b("("),l=b(d),a=b(")"),f=L(),this.h()},l(e){t=x(e,"LI",{class:!0});var n=w(t);r=x(n,"A",{href:!0});var S=w(r);o=E(S,s),S.forEach(m),k=y(n),h=x(n,"SPAN",{class:!0});var g=w(h);p=E(g,"("),l=E(g,d),a=E(g,")"),g.forEach(m),f=y(n),n.forEach(m),this.h()},h(){u(r,"href",c="/blog/"+_[1]),u(h,"class","text-slate-400 dark:text-opacity-40 dark:text-white text-xs align-middle"),u(t,"class","text-lg hover:underline")},m(e,n){A(e,t,n),i(t,r),i(r,o),i(t,k),i(t,h),i(h,p),i(h,l),i(h,a),i(t,f)},p(e,n){n&1&&s!==(s=e[2]+"")&&C(o,s),n&1&&c!==(c="/blog/"+e[1])&&u(r,"href",c),n&1&&d!==(d=new Date(e[3]).toLocaleDateString()+"")&&C(l,d)},d(e){e&&m(t)}}}function K(_){let t,r,s,o,c,k="Angelo's Blog",h,p,d=I(_[0].posts),l=[];for(let a=0;a<d.length;a+=1)l[a]=N(B(_,d,a));return{c(){t=v("link"),r=L(),s=v("div"),o=v("div"),c=v("span"),c.textContent=k,h=L(),p=v("ul");for(let a=0;a<l.length;a+=1)l[a].c();this.h()},l(a){const f=q("svelte-1030n7a",document.head);t=x(f,"LINK",{rel:!0,type:!0,title:!0,href:!0}),f.forEach(m),r=y(a),s=x(a,"DIV",{class:!0});var e=w(s);o=x(e,"DIV",{class:!0});var n=w(o);c=x(n,"SPAN",{class:!0,"data-svelte-h":!0}),z(c)!=="svelte-1508wwz"&&(c.textContent=k),h=y(n),p=x(n,"UL",{class:!0});var S=w(p);for(let g=0;g<l.length;g+=1)l[g].l(S);S.forEach(m),n.forEach(m),e.forEach(m),this.h()},h(){u(t,"rel","alternate"),u(t,"type","application/rss+xml"),u(t,"title","RSS feed for Angelo Lloti's blog"),u(t,"href","/rss.xml"),document.title="Angelo Lloti's Blog",u(c,"class","block text-4xl py-5"),u(p,"class","list-disc list-inside"),u(o,"class","container lg:max-w-[1000px] mx-auto dark:text-white"),u(s,"class","h-screen w-screen px-3 dark:bg-slate-900")},m(a,f){i(document.head,t),A(a,r,f),A(a,s,f),i(s,o),i(o,c),i(o,h),i(o,p);for(let e=0;e<l.length;e+=1)l[e]&&l[e].m(p,null)},p(a,[f]){if(f&1){d=I(a[0].posts);let e;for(e=0;e<d.length;e+=1){const n=B(a,d,e);l[e]?l[e].p(n,f):(l[e]=N(n),l[e].c(),l[e].m(p,null))}for(;e<l.length;e+=1)l[e].d(1);l.length=d.length}},i:D,o:D,d(a){a&&(m(r),m(s)),m(t),F(l,a)}}}function R(_,t,r){let{data:s}=t;return _.$$set=o=>{"data"in o&&r(0,s=o.data)},[s]}class J extends V{constructor(t){super(),j(this,t,R,K,P,{data:0})}}export{J as component};
