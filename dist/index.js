"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoute = void 0;
const factory_1 = require("hono/factory");
const factory = (0, factory_1.createFactory)();
exports.createRoute = factory.createHandlers;
