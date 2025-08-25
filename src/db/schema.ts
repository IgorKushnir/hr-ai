import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm'


export const cv = pgTable('cv', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  fileName: text('file_name').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export type CV = InferSelectModel<typeof cv>
export type NewCV = InferInsertModel<typeof cv>
export type CVWithReport = (CV & { reportId: number | null; reportCreatedAt: Date | null })

export const report = pgTable('report', {
  id: serial('id').primaryKey(),
  cvId: integer('cv_id').notNull().references(() => cv.id),
  userId: text('user_id').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export type Report = InferSelectModel<typeof report>
export type NewReport = InferInsertModel<typeof report>
