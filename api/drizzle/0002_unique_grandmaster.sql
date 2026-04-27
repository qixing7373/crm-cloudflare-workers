CREATE TABLE `contact_field` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`label_en` text,
	`type` text DEFAULT 'text' NOT NULL,
	`options` text,
	`required` integer DEFAULT false,
	`editable` integer DEFAULT true,
	`indexed` integer DEFAULT false,
	`sort` integer DEFAULT 0,
	`enabled` integer DEFAULT true,
	`created_by` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_by` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contact_field_key_unique` ON `contact_field` (`key`);--> statement-breakpoint
DROP TABLE `invitation_code`;--> statement-breakpoint
DROP TABLE `sys_field`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contact_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`import_id` integer,
	`type` text NOT NULL,
	`changes` text,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_contact_log`("id", "contact_id", "user_id", "import_id", "type", "changes", "created_at") SELECT "id", "contact_id", "user_id", "import_id", "type", "changes", "created_at" FROM `contact_log`;--> statement-breakpoint
DROP TABLE `contact_log`;--> statement-breakpoint
ALTER TABLE `__new_contact_log` RENAME TO `contact_log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`group_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_by` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_by` integer,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "username", "password", "role", "group_id", "status", "created_by", "created_at", "updated_by", "updated_at") SELECT "id", "username", "password", "role", "group_id", "status", "created_by", "created_at", "updated_by", "updated_at" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
ALTER TABLE `contact` ADD `owner_id` integer;--> statement-breakpoint
ALTER TABLE `contact` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `contact` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `contact` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `contact` ADD `deleted_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `contact_phone_unique` ON `contact` (`phone`);--> statement-breakpoint
ALTER TABLE `contact` DROP COLUMN `user_id`;--> statement-breakpoint
ALTER TABLE `import_log` ADD `file` text;--> statement-breakpoint
ALTER TABLE `import_log` ADD `total` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `import_log` ADD `frozen` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `import_log` ADD `skipped` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `import_log` ADD `added` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `import_log` ADD `updated` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `import_log` ADD `reimported` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `import_log` DROP COLUMN `file_name`;--> statement-breakpoint
ALTER TABLE `import_log` DROP COLUMN `total_count`;--> statement-breakpoint
ALTER TABLE `import_log` DROP COLUMN `frozen_count`;--> statement-breakpoint
ALTER TABLE `import_log` DROP COLUMN `same_user_count`;--> statement-breakpoint
ALTER TABLE `import_log` DROP COLUMN `new_count`;--> statement-breakpoint
ALTER TABLE `import_log` DROP COLUMN `update_count`;--> statement-breakpoint
ALTER TABLE `import_log` DROP COLUMN `reimport_count`;--> statement-breakpoint
ALTER TABLE `user_group` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `user_group` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `user_group` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `user_group` ADD `deleted_at` integer;