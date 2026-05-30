/**
 * Publisher 初始化 —— 注册所有可用的平台发布器。
 * 在服务器端首次导入时执行。新增平台只需在这里 import 并 register。
 */
import { registerPublisher } from "./registry";
import { wechatPublisher } from "./wechat";

registerPublisher(wechatPublisher);
