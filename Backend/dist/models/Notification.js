"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const BaseModels_1 = require("./BaseModels");
const insert = BaseModels_1.BaseModel.db.prepare(`
  INSERT INTO notifications (notification_id, user_id, message, date, is_read)
  VALUES (?, ?, ?, ?, ?)
`);
const selectById = BaseModels_1.BaseModel.db.prepare(`
  SELECT * FROM notifications WHERE notification_id = ?
`);
const selectByUser = BaseModels_1.BaseModel.db.prepare(`
  SELECT * FROM notifications WHERE user_id = ?
`);
class NotificationModel extends BaseModels_1.BaseModel {
    static create(data) {
        insert.run(data.notification_id, data.user_id, data.message, data.date, data.is_read);
        return this.findById(data.notification_id);
    }
    static findById(id) {
        return selectById.get(id);
    }
    static findByUser(user_id) {
        return selectByUser.all(user_id);
    }
}
exports.NotificationModel = NotificationModel;
