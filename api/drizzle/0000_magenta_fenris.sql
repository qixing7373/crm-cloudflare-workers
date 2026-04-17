CREATE TABLE `contact` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text,
	`data` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'undeveloped' NOT NULL,
	`user_id` integer,
	`claimed_at` integer,
	`import_count` integer DEFAULT 0,
	`first_imported_at` integer,
	`latest_imported_at` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `contact_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`imported_at` integer NOT NULL,
	`import_id` integer NOT NULL,
	`change_type` text NOT NULL,
	`changes` text
);
--> statement-breakpoint
CREATE TABLE `contact_tag` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`tag` text NOT NULL,
	`user_id` integer NOT NULL,
	`tagged_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `import_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`file_name` text,
	`total_count` integer NOT NULL,
	`frozen_count` integer NOT NULL,
	`same_user_count` integer NOT NULL,
	`new_count` integer DEFAULT 0 NOT NULL,
	`update_count` integer DEFAULT 0 NOT NULL,
	`reimport_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `sys_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sys_field` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`label_en` text,
	`type` text DEFAULT 'text' NOT NULL,
	`options` text,
	`required` integer DEFAULT false,
	`editable` integer DEFAULT true,
	`indexed` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	`enabled` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sys_field_key_unique` ON `sys_field` (`key`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`group_id` integer,
	`can_import` integer DEFAULT false,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_by` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `user_group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_group_name_unique` ON `user_group` (`name`);--> statement-breakpoint
CREATE TABLE `user_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`action` text NOT NULL,
	`details` text,
	`created_at` integer DEFAULT (unixepoch())
);
