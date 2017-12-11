"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var Koa = require('koa');
var Router = require('koa-router');
var controllers_1 = require('./app/controllers');
var app = new Koa();
var router = new Router();
app.use(function (ctx, next) __awaiter(this, void 0, void 0, function* () {
    var start = Date.now();
    yield next();
    var ms = Date.now() - start;
    console.log(ctx.method + " " + ctx.url + " - " + ms + "ms");
}));
app.use(function (ctx, next) __awaiter(this, void 0, void 0, function* () {
    ctx.body = 'hello';
    yield next();
}));
app.use(router.routes());
app.use(controllers_1["default"].routes());
app.use(router.allowedMethods());
app.listen(3000);
//# sourceMappingURL=index.js.map