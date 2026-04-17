-- 初始化联系人动态字段配置
INSERT INTO contact_field (key, label, label_en, type, options, required, editable, sort) VALUES 
('phone', '手机', 'Phone', 'phone', NULL, 1, 0, 0),
('name', '姓名', 'Name', 'text', NULL, 1, 1, 1),
('gender', '性别', 'Gender', 'select', '[{"val":"mr","zh":"先生","en":"Mr"},{"val":"ms","zh":"女士","en":"Ms"},{"val":"unknown","zh":"未知","en":"Unknown"}]', 0, 1, 2),
('age', '年龄', 'Age', 'number', NULL, 0, 1, 3),
('country', '国家', 'Country', 'text', NULL, 0, 1, 4),
('province', '省份', 'Province', 'text', NULL, 0, 1, 5),
('city', '城市', 'City', 'text', NULL, 0, 1, 6),
('job', '工作', 'Job', 'text', NULL, 0, 1, 7),
('wechat', '微信', 'WeChat', 'text', NULL, 0, 1, 8),
('level', '意向级别', 'Level', 'select', '[{"val":"a","zh":"A级(核心)","en":"A-Level(Core)"},{"val":"b","zh":"B级(高意向)","en":"B-Level(High)"},{"val":"c","zh":"C级(普通)","en":"C-Level(Normal)"},{"val":"d","zh":"D级(无效)","en":"D-Level(Invalid)"}]', 0, 1, 9),
('source', '客户来源', 'Source', 'select', '[{"val":"douyin","zh":"抖音引流","en":"Douyin"},{"val":"kuaishou","zh":"快手引流","en":"Kuaishou"},{"val":"xiaohongshu","zh":"小红书引流","en":"Xiaohongshu"},{"val":"offline","zh":"线下裂变","en":"Offline Viral"},{"val":"added","zh":"主动添加","en":"Proactive Add"}]', 0, 1, 10),
('stage', '跟进状态', 'Status', 'select', '[{"val":"initial","zh":"初步接洽","en":"Initial Contact"},{"val":"deep","zh":"深入沟通","en":"Deep Comm"},{"val":"quoted","zh":"发送报价","en":"Quoted"},{"val":"closing","zh":"即将成单","en":"Closing"},{"val":"lost","zh":"已流失","en":"Lost"}]', 0, 1, 11),
('remark', '备注信息', 'Remark', 'text', NULL, 0, 1, 12);

-- 初始化最高权限的系统管理部与 admin 账号
-- 注意：此时用的 password 是通过 bcryptjs 加密过的 "Admin@123!"
INSERT OR IGNORE INTO user_group (id, name) VALUES 
(1, '系统管理部');

INSERT OR IGNORE INTO user (id, username, password, role, group_id, status) VALUES 
(1, 'admin', '$2a$10$C82aZ9m/pLz/8q/q4J/EHeNKVrA1v2X9t0rM6C7Y4h9P5nB3s3T.a', 'superadmin', 1, 'active');
