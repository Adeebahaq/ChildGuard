import { BaseModel } from "./BaseModels";

export interface Notification {
  notification_id: string;
  user_id: string;
  message: string;
  date: string;
  is_read: number; // 0 or 1
}

const insert = BaseModel.db.prepare(`
  INSERT INTO notifications (notification_id, user_id, message, date, is_read)
  VALUES (?, ?, ?, ?, ?)
`);

const selectById = BaseModel.db.prepare(`
  SELECT * FROM notifications WHERE notification_id = ?
`);

const selectByUser = BaseModel.db.prepare(`
  SELECT * FROM notifications WHERE user_id = ?
`);

export class NotificationModel extends BaseModel {
  static create(data: Notification): Notification {
    insert.run(
      data.notification_id,
      data.user_id,
      data.message,
      data.date,
      data.is_read
    );
    return this.findById(data.notification_id)!;
  }

  static findById(id: string): Notification | null {
  return selectById.get(id) as Notification | null;
}

  static findByUser(user_id: string): Notification[] {
    return selectByUser.all(user_id) as Notification[];
  }
}
