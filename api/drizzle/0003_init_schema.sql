PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_import_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`file` text,
	`total` integer NOT NULL,
	`frozen` integer NOT NULL,
	`skipped` integer DEFAULT 0 NOT NULL,
	`added` integer DEFAULT 0 NOT NULL,
	`updated` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_import_log`("id", "user_id", "file", "total", "frozen", "skipped", "added", "updated", "created_at") SELECT "id", "user_id", "file", "total", "frozen", "skipped", "added", "updated", "created_at" FROM `import_log`;--> statement-breakpoint
DROP TABLE `import_log`;--> statement-breakpoint
ALTER TABLE `__new_import_log` RENAME TO `import_log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;