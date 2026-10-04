import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const festivalDefinitions = sqliteTable('festival_definitions', {
  id: text('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleNp: text('title_np').notNull(),
  descriptionEn: text('description_en'),
  descriptionNp: text('description_np'),
  type: text('type').notNull(),
  importance: integer('importance').notNull().default(3),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const festivalOccurrences = sqliteTable('festival_occurrences', {
  id: text('id').primaryKey(),
  definitionId: text('definition_id'),
  bsYear: integer('bs_year').notNull(),
  bsMonth: integer('bs_month').notNull(),
  bsDay: integer('bs_day').notNull(),
  adYear: integer('ad_year').notNull(),
  adMonth: integer('ad_month').notNull(),
  adDay: integer('ad_day').notNull(),
  titleEn: text('title_en'),
  titleNp: text('title_np'),
  type: text('type').notNull(),
  importance: integer('importance').notNull().default(3),
  allDay: integer('all_day').notNull().default(1),
  source: text('source').notNull(),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  notes: text('notes'),
  type: text('type').notNull(),
  calendarBasis: text('calendar_basis').notNull().default('bs'),
  bsYear: integer('bs_year'),
  bsMonth: integer('bs_month').notNull(),
  bsDay: integer('bs_day').notNull(),
  adYear: integer('ad_year').notNull(),
  adMonth: integer('ad_month').notNull(),
  adDay: integer('ad_day').notNull(),
  importance: integer('importance').notNull().default(3),
  recurrenceJson: text('recurrence_json'),
  metadataJson: text('metadata_json'),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  ownerId: text('owner_id'),
})

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const widgetState = sqliteTable('widget_state', {
  id: text('id').primaryKey(),
  visibleBsYear: integer('visible_bs_year').notNull(),
  visibleBsMonth: integer('visible_bs_month').notNull(),
  selectedBsYear: integer('selected_bs_year'),
  selectedBsMonth: integer('selected_bs_month'),
  selectedBsDay: integer('selected_bs_day'),
  updatedAt: text('updated_at').notNull(),
})
