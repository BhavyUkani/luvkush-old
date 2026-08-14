import './polyfills.server.mjs';
import{a as i}from"./chunk-JJD4UD25.mjs";import{l as n}from"./chunk-XGAVOD6H.mjs";import{R as r}from"./chunk-QTLPBTTA.mjs";var f=(u,o)=>{let e=r(i),t=r(n);return e.isAdmin()?!0:e.isLoggedIn()?t.createUrlTree(["/403"]):t.createUrlTree(["/login"],{queryParams:{returnUrl:o.url}})};export{f as a};
