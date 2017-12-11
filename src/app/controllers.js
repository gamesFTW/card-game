// import * as Koa from 'koa';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var Router = require('koa-router');
var router = new Router();
router.get('/a', function (ctx, next) __awaiter(this, void 0, void 0, function* () {
    ctx.body = 'a';
}));
exports.__esModule = true;
exports["default"] = router;
//# sourceMappingURL=controllers.js.map