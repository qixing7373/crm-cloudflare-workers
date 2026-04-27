CREATE TABLE `invitation_code` (
	`code` text PRIMARY KEY NOT NULL,
	`group_id` integer NOT NULL,
	`created_by` integer NOT NULL,
	`max_uses` integer DEFAULT 5 NOT NULL,
	`used_count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
DROP TABLE `contact_tag`;--> statement-breakpoint
DROP TABLE `sys_config`;